#!/usr/bin/env node

/**
 * @file
 * Updates all @wordpress/* packages in package.json to versions matching either
 * a WordPress core release (via the `wp-X.Y` npm dist-tag) or a Gutenberg plugin
 * release (resolved from the matching git tag in WordPress/gutenberg).
 *
 * Usage:
 *   node scripts/update-wp-packages.js 6.9               # WP core dist-tag
 *   node scripts/update-wp-packages.js v23.0.1           # Gutenberg plugin tag
 *   node scripts/update-wp-packages.js 23.0.1            # Same (auto-detected)
 *   node scripts/update-wp-packages.js v23.0.1 --dry-run
 */

const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PKG_PATH = path.join(ROOT, 'package.json');
const PATCHES_DIR = path.join(ROOT, 'patches');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const version = args.find((a) => !a.startsWith('--'));

if (!version) {
  console.error(
    'Usage: node scripts/update-wp-packages.js <version> [--dry-run]',
  );
  console.error('  WP core dist-tag:     6.9');
  console.error('  Gutenberg plugin tag: v23.0.1  (or 23.0.1)');
  process.exit(1);
}

// Mode detection: anything that looks like X.Y.Z (or vX.Y.Z) is a plugin tag.
const isPluginTag = /^v?\d+\.\d+\.\d+/.test(version);
const pluginTag = isPluginTag
  ? version.startsWith('v')
    ? version
    : `v${version}`
  : null;
const distTag = isPluginTag ? null : `wp-${version}`;

console.log(
  isPluginTag
    ? `Resolving @wordpress/* package versions from Gutenberg plugin tag: ${pluginTag}`
    : `Resolving @wordpress/* package versions for dist-tag: ${distTag}`,
);
console.log(dryRun ? '(dry run — no files will be modified)\n' : '');

const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));

const wpDeps = Object.keys(pkg.dependencies).filter((k) =>
  k.startsWith('@wordpress/'),
);
const wpDevDeps = Object.keys(pkg.devDependencies).filter((k) =>
  k.startsWith('@wordpress/'),
);
const allWpPackages = [...wpDeps, ...wpDevDeps];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'update-wp-packages' } }, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return resolve(null);
        }
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(null);
          }
        });
      })
      .on('error', reject);
  });
}

async function resolveVersion(name) {
  if (isPluginTag) {
    const short = name.replace(/^@wordpress\//, '');
    const url = `https://raw.githubusercontent.com/WordPress/gutenberg/${pluginTag}/packages/${short}/package.json`;
    const json = await fetchJson(url);
    return json && json.version ? json.version : null;
  }
  try {
    return execSync(`npm info "${name}@${distTag}" version 2>/dev/null`, {
      encoding: 'utf8',
    }).trim() || null;
  } catch {
    return null;
  }
}

function prefixOf(spec) {
  if (spec.startsWith('^')) return '^';
  if (spec.startsWith('~')) return '~';
  return '';
}

(async () => {
  const updated = [];
  const failed = [];
  const unchanged = [];

  for (const name of allWpPackages) {
    const currentVersion =
      pkg.dependencies[name] || pkg.devDependencies[name];

    const newVersion = await resolveVersion(name);

    if (!newVersion) {
      failed.push({
        name,
        currentVersion,
        reason: isPluginTag
          ? `not found at ${pluginTag}`
          : `no ${distTag} dist-tag`,
      });
      continue;
    }

    const prefix = prefixOf(currentVersion);
    const newSpec = prefix + newVersion;

    if (newSpec === currentVersion) {
      unchanged.push({ name, version: currentVersion });
      continue;
    }

    updated.push({ name, from: currentVersion, to: newSpec, bareNew: newVersion });

    if (!dryRun) {
      if (pkg.dependencies[name]) {
        pkg.dependencies[name] = newSpec;
      } else {
        pkg.devDependencies[name] = newSpec;
      }
    }
  }

  // Print results.
  if (updated.length > 0) {
    console.log(`Updated (${updated.length}):`);
    for (const { name, from, to } of updated) {
      console.log(`  ${name}: ${from} -> ${to}`);
    }
    console.log('');
  }

  if (unchanged.length > 0) {
    console.log(`Unchanged (${unchanged.length}):`);
    for (const { name, version } of unchanged) {
      console.log(`  ${name}: ${version}`);
    }
    console.log('');
  }

  if (failed.length > 0) {
    console.log(`Failed (${failed.length}):`);
    for (const { name, currentVersion, reason } of failed) {
      console.log(`  ${name}: ${currentVersion} (${reason})`);
    }
    console.log('');
  }

  // Rename patch files for any updated package that has a corresponding patch.
  const renamed = [];
  for (const { name, from, bareNew } of updated) {
    const fromBare = from.replace(/^[\^~]/, '');
    const flatName = name.replace('/', '+');
    const oldPatch = path.join(
      PATCHES_DIR,
      `${flatName}+${fromBare}.patch`,
    );
    const newPatch = path.join(
      PATCHES_DIR,
      `${flatName}+${bareNew}.patch`,
    );
    if (fs.existsSync(oldPatch)) {
      if (!dryRun) fs.renameSync(oldPatch, newPatch);
      renamed.push({ from: path.basename(oldPatch), to: path.basename(newPatch) });
    }
  }

  if (renamed.length > 0) {
    console.log(`Patch files renamed (${renamed.length}):`);
    for (const { from, to } of renamed) {
      console.log(`  ${from} -> ${to}`);
    }
    console.log(
      '  NOTE: After npm install, verify each patch still applies cleanly.\n',
    );
  }

  if (!dryRun && updated.length > 0) {
    fs.writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');
    console.log('package.json updated.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. npm install');
    console.log('  2. npm run build:vendor');
    console.log('  3. Review gutenberg.libraries.yml diff');
    console.log('  4. Test in browser');
  } else if (dryRun && updated.length > 0) {
    console.log('Run without --dry-run to apply changes.');
  } else {
    console.log('Nothing to update.');
  }
})();
