/**
 * @file
 * Webpack config for building block-library view scripts.
 *
 * View scripts run on the frontend (not the editor) and provide interactivity
 * for blocks like accordion, tabs, etc. They depend on @wordpress/interactivity
 * which is loaded separately and exposed as window.wp.interactivity.
 */

const fs = require('fs');
const path = require('path');

const BLOCK_LIBRARY_PKG = path.dirname(
  require.resolve('@wordpress/block-library/package.json'),
);
const BUILD_MODULE_DIR = path.join(BLOCK_LIBRARY_PKG, 'build-module');
const OUTPUT_DIR = path.resolve(
  __dirname,
  'js/vendor/gutenberg/block-library/blocks',
);

// Auto-discover blocks with view scripts from the ESM build directory.
const entry = {};
if (fs.existsSync(BUILD_MODULE_DIR)) {
  const blockDirs = fs
    .readdirSync(BUILD_MODULE_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  for (const dir of blockDirs) {
    const viewPath = path.join(BUILD_MODULE_DIR, dir.name, 'view.mjs');
    if (fs.existsSync(viewPath)) {
      entry[dir.name] = viewPath;
    }
  }
}

console.log(
  `Building view scripts for ${Object.keys(entry).length} blocks: ${Object.keys(entry).join(', ')}`,
);

module.exports = {
  mode: 'production',

  entry,

  output: {
    path: OUTPUT_DIR,
    // Output as <blockName>/view.js inside the blocks directory.
    filename: '[name]/view.js',
    clean: false,
  },

  externals: {
    // Map @wordpress/interactivity to the global window.wp.interactivity.
    '@wordpress/interactivity': ['wp', 'interactivity'],
  },

  // Disable code splitting — each view script must be self-contained.
  optimization: {
    splitChunks: false,
  },

  module: {
    // Inline dynamic import() calls so they don't create async chunks.
    parser: {
      javascript: { dynamicImportMode: 'eager' },
    },
    rules: [
      {
        test: /\.m?js$/,
        resolve: { fullySpecified: false },
      },
    ],
  },

  performance: {
    hints: false,
  },
};
