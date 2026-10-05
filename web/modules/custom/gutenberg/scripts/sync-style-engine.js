#!/usr/bin/env node

/**
 * @file
 * Syncs the PHP Style Engine port from @wordpress/style-engine in node_modules.
 *
 * Reads the 6 PHP source files from node_modules/@wordpress/style-engine/src/,
 * applies the wpCopyFiles transforms (class suffix, function prefix, filename suffix)
 * from the package's own package.json, validates utils.php shim coverage, and writes
 * the transformed files to src/StyleEngine/.
 *
 * Usage:
 *   node scripts/sync-style-engine.js              # sync from node_modules
 *   node scripts/sync-style-engine.js --dry-run    # show diff only
 *   node scripts/sync-style-engine.js --check-deps-only  # just validate shims
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const STYLE_ENGINE_PKG = path.join(
  ROOT,
  'node_modules/@wordpress/style-engine'
);
const UPSTREAM_SRC = path.join(STYLE_ENGINE_PKG, 'src');
const LOCAL_DIR = path.join(ROOT, 'src/StyleEngine');
const UTILS_PATH = path.join(LOCAL_DIR, 'utils.php');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const checkDepsOnly = args.includes('--check-deps-only');

// Source files to transform (order doesn't matter for transforms, but listed for clarity).
const SOURCE_FILES = [
  'class-wp-style-engine.php',
  'class-wp-style-engine-css-declarations.php',
  'class-wp-style-engine-css-rule.php',
  'class-wp-style-engine-css-rules-store.php',
  'class-wp-style-engine-processor.php',
  'style-engine.php',
];

/**
 * Read the transform config from the upstream package.json.
 */
function readTransformConfig() {
  const pkgPath = path.join(STYLE_ENGINE_PKG, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.error(
      'Error: @wordpress/style-engine not found in node_modules.'
    );
    console.error('Run "npm install" first.');
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const version = pkg.version;

  if (!pkg.wpCopyFiles || !pkg.wpCopyFiles.transforms || !pkg.wpCopyFiles.transforms.php) {
    console.error(
      'Error: wpCopyFiles.transforms.php not found in @wordpress/style-engine package.json.'
    );
    console.error(
      'The package format may have changed. Manual review required.'
    );
    process.exit(1);
  }

  return { config: pkg.wpCopyFiles.transforms.php, version };
}

/**
 * Apply class suffix transformations to file content.
 *
 * Replaces each class name in suffixClasses with ClassName + classSuffix.
 * Sorts longest-first to avoid partial matches (e.g., WP_Style_Engine
 * matching inside WP_Style_Engine_CSS_Rule).
 */
function applyClassSuffix(content, suffixClasses, classSuffix) {
  // Sort longest-first to avoid partial replacement issues.
  const sorted = [...suffixClasses].sort((a, b) => b.length - a.length);

  for (const className of sorted) {
    // Word-boundary aware replacement: match the class name only when it's
    // not followed by more word/underscore chars (which would indicate a
    // longer class name that should have already been replaced).
    const regex = new RegExp(
      className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z0-9_])',
      'g'
    );
    content = content.replace(regex, className + classSuffix);
  }

  return content;
}

/**
 * Apply function prefix transformations to file content.
 *
 * For function declarations: rename wp_style_engine_* to gutenberg_style_engine_*.
 * For the class_exists/!class_exists checks: rename the class references.
 */
function applyFunctionPrefix(content, functionPrefix) {
  // Replace function declarations and calls: wp_style_engine_* -> gutenberg_style_engine_*
  // The upstream functions start with wp_ and we replace with the functionPrefix (gutenberg_).
  content = content.replace(
    /\bwp_(style_engine_[a-z_]+)/g,
    functionPrefix + '$1'
  );

  return content;
}

/**
 * Transform the filename by adding the suffix before .php.
 */
function transformFilename(filename, filenameSuffix) {
  return filename.replace(/\.php$/, filenameSuffix + '.php');
}

/**
 * Strip comments and string literals from PHP content to avoid false positives.
 */
function stripCommentsAndStrings(content) {
  // Remove block comments.
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove single-line comments.
  content = content.replace(/\/\/[^\n]*/g, '');
  // Remove single-quoted strings.
  content = content.replace(/'(?:[^'\\]|\\.)*'/g, "''");
  // Remove double-quoted strings.
  content = content.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  return content;
}

/**
 * Extract all function calls from PHP content.
 * Returns a set of function names that are called (not class instantiations or definitions).
 */
function extractFunctionCalls(content) {
  const calls = new Set();
  const stripped = stripCommentsAndStrings(content);

  // Match function calls: word( — but exclude function definitions and class instantiations.
  const callRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
  let match;
  while ((match = callRegex.exec(stripped)) !== null) {
    const name = match[1];
    // Skip class names (start with uppercase and contain uppercase).
    if (/^[A-Z]/.test(name)) continue;
    // Skip 'function' keyword (from definitions).
    if (name === 'function') continue;
    // Skip 'class' keyword.
    if (name === 'class') continue;
    calls.add(name);
  }

  return calls;
}

/**
 * Extract function definitions from PHP content.
 */
function extractFunctionDefinitions(content) {
  const defs = new Set();
  const defRegex = /\bfunction\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
  let match;
  while ((match = defRegex.exec(content)) !== null) {
    defs.add(match[1]);
  }
  return defs;
}

/**
 * PHP built-in functions and language constructs that don't need shims.
 */
const PHP_BUILTINS = new Set([
  // Language constructs and control flow
  'array', 'empty', 'isset', 'unset', 'list', 'echo', 'print',
  'if', 'elseif', 'else', 'foreach', 'while', 'for', 'switch', 'case',
  'return', 'break', 'continue', 'throw', 'try', 'catch', 'finally',
  // Type functions
  'is_array', 'is_string', 'is_object', 'is_scalar', 'is_null', 'is_integer',
  'gettype',
  // String functions
  'trim', 'rtrim', 'ltrim', 'strtolower', 'strtoupper', 'strlen',
  'str_replace', 'str_contains', 'str_starts_with', 'strtr', 'strrpos',
  'substr', 'explode', 'implode', 'sprintf', 'preg_replace', 'preg_match',
  'preg_match_all', 'strip_tags', 'parse_str',
  // Array functions
  'array_merge', 'array_map', 'array_keys', 'array_unique', 'array_filter',
  'array_key_exists', 'count', 'in_array', 'ksort',
  // Object functions
  'get_object_vars',
  // JSON
  'json_encode', 'json_decode',
  // Class/function checks
  'class_exists', 'function_exists', 'is_callable', 'call_user_func',
  'defined', 'define', 'constant',
  // Misc
  'trigger_error', 'str_repeat',
  // OOP keywords that look like function calls
  'self', 'static', 'parent', 'new',
  // Type casting and special
  '__METHOD__', '__FUNCTION__', '__CLASS__',
]);

/**
 * Check dependency coverage: which WP functions are called but not defined in utils.php?
 */
function checkDependencies(transformedContents, utilsContent) {
  // Gather all function calls across transformed files.
  const allCalls = new Set();
  for (const content of transformedContents) {
    for (const call of extractFunctionCalls(content)) {
      allCalls.add(call);
    }
  }

  // Gather all function definitions from transformed files themselves.
  const selfDefined = new Set();
  for (const content of transformedContents) {
    for (const def of extractFunctionDefinitions(content)) {
      selfDefined.add(def);
    }
  }

  // Gather all function definitions from utils.php.
  const utilsDefined = extractFunctionDefinitions(utilsContent);

  // Filter: functions that are called but not defined anywhere (not in PHP builtins,
  // not self-defined, not in utils.php).
  const missing = [];
  for (const fn of allCalls) {
    if (PHP_BUILTINS.has(fn)) continue;
    if (selfDefined.has(fn)) continue;
    if (utilsDefined.has(fn)) continue;
    // Skip class method calls (these are handled via class definitions).
    // Skip PHP internal constructs.
    if (fn.startsWith('__') && fn.endsWith('__')) continue;
    missing.push(fn);
  }

  return { missing, utilsDefined: [...utilsDefined], selfDefined: [...selfDefined] };
}

/**
 * Compute a simple line diff between two strings.
 */
function simpleDiff(oldContent, newContent, filename) {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const output = [];
  let hasChanges = false;

  const maxLines = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine !== newLine) {
      hasChanges = true;
      if (oldLine !== undefined) {
        output.push(`  - ${oldLine}`);
      }
      if (newLine !== undefined) {
        output.push(`  + ${newLine}`);
      }
    }
  }

  return { hasChanges, diff: output.join('\n') };
}

// --- Main ---

function main() {
  const { config, version } = readTransformConfig();
  const { classSuffix, functionPrefix, suffixClasses, filenameSuffix } = config;

  console.log(`@wordpress/style-engine v${version}`);
  console.log(`Transforms: classSuffix="${classSuffix}", functionPrefix="${functionPrefix}", filenameSuffix="${filenameSuffix}"`);
  console.log(`Classes to suffix: ${suffixClasses.join(', ')}`);
  console.log('');

  if (dryRun) {
    console.log('(dry run - no files will be written)\n');
  }

  // Read and transform source files.
  const transformedFiles = [];
  const transformedContents = [];

  for (const sourceFile of SOURCE_FILES) {
    const sourcePath = path.join(UPSTREAM_SRC, sourceFile);
    if (!fs.existsSync(sourcePath)) {
      console.error(`Warning: Source file not found: ${sourceFile}`);
      continue;
    }

    let content = fs.readFileSync(sourcePath, 'utf8');

    // Apply transforms.
    content = applyClassSuffix(content, suffixClasses, classSuffix);
    content = applyFunctionPrefix(content, functionPrefix);

    const outputFilename = transformFilename(sourceFile, filenameSuffix);
    transformedFiles.push({ sourceFile, outputFilename, content });
    transformedContents.push(content);
  }

  // Read utils.php for dependency checking.
  let utilsContent = '';
  if (fs.existsSync(UTILS_PATH)) {
    utilsContent = fs.readFileSync(UTILS_PATH, 'utf8');
  }

  // Check dependencies.
  const { missing, utilsDefined } = checkDependencies(
    transformedContents,
    utilsContent
  );

  console.log('--- Dependency Check ---');
  console.log(`Functions provided by utils.php: ${utilsDefined.length}`);
  for (const fn of utilsDefined.sort()) {
    console.log(`  ${fn}`);
  }
  console.log('');

  if (missing.length > 0) {
    console.log(`Missing shims (${missing.length}):`);
    for (const fn of missing.sort()) {
      console.log(`  ${fn}`);
    }
    console.log(
      '\nThese functions are called by the Style Engine but not defined in utils.php.'
    );
    console.log('Add shims to src/StyleEngine/utils.php before using the synced files.\n');
  } else {
    console.log('All function dependencies are covered.\n');
  }

  if (checkDepsOnly) {
    process.exit(missing.length > 0 ? 1 : 0);
  }

  // Show diffs and write files.
  console.log('--- File Sync ---');
  let filesChanged = 0;
  let filesUnchanged = 0;

  for (const { sourceFile, outputFilename, content } of transformedFiles) {
    const outputPath = path.join(LOCAL_DIR, outputFilename);
    const existingContent = fs.existsSync(outputPath)
      ? fs.readFileSync(outputPath, 'utf8')
      : '';

    if (existingContent === content) {
      filesUnchanged++;
      console.log(`  ${outputFilename}: unchanged`);
      continue;
    }

    filesChanged++;

    if (existingContent) {
      const { diff } = simpleDiff(existingContent, content, outputFilename);
      console.log(`  ${outputFilename}: modified (from ${sourceFile})`);
      if (dryRun) {
        console.log(diff);
        console.log('');
      }
    } else {
      console.log(`  ${outputFilename}: new file (from ${sourceFile})`);
    }

    if (!dryRun) {
      fs.writeFileSync(outputPath, content);
    }
  }

  // Summary.
  console.log('');
  console.log('--- Summary ---');
  console.log(`Version: @wordpress/style-engine v${version}`);
  console.log(`Files changed: ${filesChanged}`);
  console.log(`Files unchanged: ${filesUnchanged}`);
  if (missing.length > 0) {
    console.log(`Missing shims: ${missing.length}`);
  }

  if (dryRun && filesChanged > 0) {
    console.log('\nRun without --dry-run to apply changes.');
  } else if (!dryRun && filesChanged > 0) {
    console.log('\nFiles synced. Review the changes and test in Drupal.');
  } else {
    console.log('\nAll files are up to date.');
  }
}

main();
