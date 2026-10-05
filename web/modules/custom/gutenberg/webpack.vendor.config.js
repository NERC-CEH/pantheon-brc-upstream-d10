const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const cssnano = require('cssnano');
const postcss = require('postcss');

const VENDOR_DIR = path.resolve(__dirname, 'js/vendor/gutenberg');
const VENDOR_ROOT = path.resolve(__dirname, 'js/vendor');

// @wordpress/* packages declared in package.json that should NOT be built
// into vendor. Edit-post is forked locally as packages/edit-entity; the
// interactivity bundle is pre-built and committed under js/vendor/gutenberg/interactivity/.
const EXCLUDED_PACKAGES = new Set(['edit-post', 'interactivity']);

// Packages that export a default export rather than a namespace.
const DEFAULT_EXPORT_PACKAGES = new Set([
  'api-fetch',
  'deprecated',
  'dom-ready',
  'redux-routine',
  'token-list',
  'server-side-render',
  'shortcode',
  'warning',
]);

/**
 * Convert a kebab-case package name to camelCase.
 */
function camelCase(str) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Resolve the ESM entry point (build-module/index.js) for a @wordpress package.
 * Falls back to the CJS entry if no ESM build exists.
 *
 * Using ESM is critical: the CJS build uses dynamic Object.keys().forEach()
 * re-exports that webpack's tree-shaking strips out, causing missing exports
 * at runtime (e.g. createHigherOrderComponent disappearing from compose).
 */
function getPackageEntry(pkg) {
  const pkgJsonPath = require.resolve(`@wordpress/${pkg}/package.json`);
  const pkgJson = require(pkgJsonPath);
  const pkgDir = path.dirname(pkgJsonPath);
  const entry = pkgJson.module || pkgJson.main || 'index.js';
  return path.resolve(pkgDir, entry);
}

// Source of truth: @wordpress/* runtime dependencies declared in package.json.
const rootPkg = require(path.resolve(__dirname, 'package.json'));
const packageDirs = Object.keys(rootPkg.dependencies || {})
  .filter((name) => name.startsWith('@wordpress/'))
  .map((name) => name.replace(/^@wordpress\//, ''))
  .filter((short) => !EXCLUDED_PACKAGES.has(short))
  .sort();

// Build webpack entry points using ESM builds.
const entry = {};
packageDirs.forEach((pkg) => {
  try {
    entry[pkg] = getPackageEntry(pkg);
  } catch (e) {
    console.warn(`Warning: Could not resolve @wordpress/${pkg}, skipping.`);
  }
});

// react/jsx-runtime: new in WP 6.9, exposed as window.ReactJSXRuntime.
entry['react-jsx-runtime'] = require.resolve('react/jsx-runtime');

// Build CopyWebpackPlugin patterns for CSS files.
const cssPatterns = packageDirs
  .map((pkg) => {
    const cssDir = path.dirname(
      require.resolve(`@wordpress/${pkg}/package.json`),
    );
    const buildStyleDir = path.join(cssDir, 'build-style');

    if (fs.existsSync(buildStyleDir)) {
      return {
        from: '*.css',
        to: path.join(VENDOR_DIR, pkg, '[name][ext]'),
        context: buildStyleDir,
        noErrorOnMissing: true,
        transform: {
          transformer(content) {
            return postcss([cssnano]).process(content, { from: undefined }).then((result) => result.css);
          },
        },
      };
    }
    return null;
  })
  .filter(Boolean);

/**
 * Resolve a path relative to an npm package directory.
 * Uses the package.json location to find the package root, avoiding "exports"
 * restrictions that block subpath require.resolve() calls (e.g. React 18).
 */
function pkgFile(pkg, filePath) {
  const pkgDir = path.dirname(require.resolve(`${pkg}/package.json`));
  return path.join(pkgDir, filePath);
}

// Third-party vendor libraries: copy pre-built UMD/production files to js/vendor/.
const thirdPartyPatterns = [
  {
    from: pkgFile('react', 'umd/react.production.min.js'),
    to: path.join(VENDOR_ROOT, 'react.min.js'),
  },
  {
    from: pkgFile('react-dom', 'umd/react-dom.production.min.js'),
    to: path.join(VENDOR_ROOT, 'react-dom.min.js'),
  },
  {
    from: pkgFile('lodash', 'lodash.min.js'),
    to: path.join(VENDOR_ROOT, 'lodash.min.js'),
  },
  {
    from: pkgFile('moment', 'min/moment.min.js'),
    to: path.join(VENDOR_ROOT, 'moment.min.js'),
  },
  {
    from: pkgFile('sprintf-js', 'dist/sprintf.min.js'),
    to: path.join(VENDOR_ROOT, 'sprintf.min.js'),
    // Strip sourcemap reference.
    transform: {
      transformer(content) {
        return content
          .toString()
          .replace(/\/\/# sourceMappingURL=.*/g, '');
      },
    },
  },
  {
    from: pkgFile('regenerator-runtime', 'runtime.js'),
    to: path.join(VENDOR_ROOT, 'regenerator-runtime.js'),
  },
];

const allCopyPatterns = [...cssPatterns, ...thirdPartyPatterns];

module.exports = {
  mode: 'production',

  entry,

  output: {
    path: VENDOR_DIR,
    filename: '[name]/index.js',
    clean: false,
  },

  module: {
    rules: [
      // Allow extension-less imports from .mjs files in node_modules
      // (some upstream packages, e.g. @wordpress/editor → diff, omit the .js).
      {
        test: /\.m?js$/,
        resolve: { fullySpecified: false },
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({ NODE_ENV: 'production' }),
    }),
    new DependencyExtractionWebpackPlugin({
      injectPolyfill: true,
    }),
    ...(allCopyPatterns.length > 0
      ? [new CopyWebpackPlugin({ patterns: allCopyPatterns })]
      : []),
  ],

  module: {
    rules: [
      {
        // Strip the top-level `await import("preact/debug")` from the
        // @wordpress/interactivity ESM entry. The await makes webpack treat
        // the module as async, which breaks the synchronous library output
        // assignment to window.wp.interactivity. The import only runs when
        // globalThis.SCRIPT_DEBUG is true, which is never the case in production.
        test: /interactivity[\\/]build-module[\\/]index\.mjs$/,
        enforce: 'pre',
        use: [
          path.resolve(__dirname, 'scripts/strip-toplevel-await-loader.js'),
        ],
      },
      {
        // Enable experimental blocks (tabs, playlist, form, icon, etc.) by
        // removing the window flag conditionals and the __experimental metadata
        // filter. The Drupal admin settings form is the actual gatekeeper.
        test: /block-library[\\/]build-module[\\/]index\.mjs$/,
        enforce: 'pre',
        use: [
          path.resolve(__dirname, 'scripts/enable-experimental-blocks-loader.js'),
        ],
      },
      {
        // Some ESM packages (e.g. diff) use extensionless imports.
        // Webpack 5 requires fully specified imports for .mjs files by default.
        test: /\.m?js$/,
        resolve: { fullySpecified: false },
      },
    ],
  },

  resolve: {
    alias: {
      // The CJS index.js uses exports.__esModule + exports.default, which
      // loses default-export interop when webpack scope-hoists it inside
      // @wordpress/editor. This ESM shim re-exports the component properly.
      'react-autosize-textarea$': path.resolve(
        __dirname,
        'scripts/shims/react-autosize-textarea.mjs',
      ),
    },
  },

  performance: {
    hints: false,
  },

  // Generate per-entry library config so each package is exposed on window.wp.<camelName>.
  // Webpack 5 supports a function for output.library, but we use entry-level config via
  // the entry descriptor syntax instead.
};

// Convert entry to entry descriptors with per-entry library config.
const entryDescriptors = {};
Object.keys(entry).forEach((pkg) => {
  const libraryConfig = {
    name: ['wp', camelCase(pkg)],
    type: 'window',
  };
  if (DEFAULT_EXPORT_PACKAGES.has(pkg)) {
    libraryConfig.export = 'default';
  }
  entryDescriptors[pkg] = {
    import: entry[pkg],
    library: libraryConfig,
  };
});

// react-jsx-runtime: exposed as window.ReactJSXRuntime (not wp.*).
entryDescriptors['react-jsx-runtime'] = {
  import: entry['react-jsx-runtime'],
  library: {
    name: 'ReactJSXRuntime',
    type: 'window',
  },
};

module.exports.entry = entryDescriptors;
