/**
 * @file
 * Copies block-library per-block assets (block.json, view JS, per-block CSS)
 * from the @wordpress/block-library npm package to the vendor output directory.
 */

const fs = require('fs');
const path = require('path');

const BLOCK_LIBRARY_PKG = path.dirname(
  require.resolve('@wordpress/block-library/package.json'),
);
const OUTPUT_DIR = path.resolve(
  __dirname,
  '../js/vendor/gutenberg/block-library/blocks',
);

// Source directories within the npm package.
const SRC_DIR = path.join(BLOCK_LIBRARY_PKG, 'src');
const BUILD_DIR = path.join(BLOCK_LIBRARY_PKG, 'build');
const BUILD_STYLE_DIR = path.join(BLOCK_LIBRARY_PKG, 'build-style');

/**
 * Recursively copy a directory.
 */
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Copy a file if it exists.
 */
function copyIfExists(src, dest) {
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    return true;
  }
  return false;
}

// Ensure output directory exists.
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Discover blocks from the src directory (each subdirectory with a block.json is a block).
if (!fs.existsSync(SRC_DIR)) {
  console.warn('Warning: block-library src directory not found, skipping block assets copy.');
  process.exit(0);
}

const blockDirs = fs
  .readdirSync(SRC_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory());

let copiedCount = 0;

for (const blockDir of blockDirs) {
  const blockName = blockDir.name;
  const blockSrcDir = path.join(SRC_DIR, blockName);
  const blockJsonPath = path.join(blockSrcDir, 'block.json');

  if (!fs.existsSync(blockJsonPath)) {
    continue;
  }

  const outputBlockDir = path.join(OUTPUT_DIR, blockName);
  fs.mkdirSync(outputBlockDir, { recursive: true });

  // Copy block.json.
  fs.copyFileSync(blockJsonPath, path.join(outputBlockDir, 'block.json'));

  // Copy built JS files (view scripts, etc.) from build/<blockName>/.
  // Note: view scripts (.cjs) that depend on @wordpress/interactivity are NOT
  // copied here — they are built separately via webpack.view-scripts.config.js
  // which resolves the require() calls to browser globals.
  const blockBuildDir = path.join(BUILD_DIR, blockName);
  if (fs.existsSync(blockBuildDir)) {
    const jsFiles = fs.readdirSync(blockBuildDir).filter(
      (f) => (f.endsWith('.js') || f.endsWith('.cjs')) && !f.endsWith('.map'),
    );
    for (const jsFile of jsFiles) {
      // Skip view scripts — they are handled by webpack.view-scripts.config.js.
      if (jsFile.startsWith('view.')) {
        continue;
      }
      // Rename .cjs to .js for browser compatibility.
      const outputName = jsFile.replace(/\.cjs$/, '.js');
      fs.copyFileSync(
        path.join(blockBuildDir, jsFile),
        path.join(outputBlockDir, outputName),
      );
    }
  }

  // Copy per-block CSS from build-style/<blockName>/.
  const blockStyleDir = path.join(BUILD_STYLE_DIR, blockName);
  if (fs.existsSync(blockStyleDir)) {
    const cssFiles = fs.readdirSync(blockStyleDir).filter((f) => f.endsWith('.css'));
    for (const cssFile of cssFiles) {
      fs.copyFileSync(
        path.join(blockStyleDir, cssFile),
        path.join(outputBlockDir, cssFile),
      );
    }
  }

  copiedCount++;
}

console.log(`Copied assets for ${copiedCount} blocks to ${OUTPUT_DIR}`);
