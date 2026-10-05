const path = require('path');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const CORE_PACKAGES = [
  'components',
  'block-library',
  'sdc-blocks',
  'filters',
  'plugins',
  'overrides',
  'editor',
  'edit-entity',
];

const STANDALONE_ENTRIES = [
  'admin',
  'sidebar',
  'content-block-utils',
  'block-settings',
  'special-media-selection',
  'media-attributes',
  'claro',
  'gin',
  'default-admin',
];

/**
 * Convert a kebab-case package name to camelCase.
 * @param {string} str
 */
function camelCase(str) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

module.exports = {
  ...defaultConfig,

  entry: Object.fromEntries(
    [...CORE_PACKAGES, ...STANDALONE_ENTRIES].map((name) => {
      const config = { import: `./packages/${name}/src/index.js` };
      if (CORE_PACKAGES.includes(name)) {
        config.library = {
          name: ['DrupalGutenberg', camelCase(name)],
          type: 'window',
        };
      }
      return [name, config];
    }),
  ),

  output: {
    ...defaultConfig.output,
    path: path.resolve(__dirname, 'build'),
    filename: '[name]/index.js',
  },

  resolve: {
    ...defaultConfig.resolve,
    alias: {
      ...(defaultConfig.resolve && defaultConfig.resolve.alias),
      // Map @drupal-gutenberg/* to local source for build-time resolution
      ...Object.fromEntries(
        CORE_PACKAGES.map((name) => [
          `@drupal-gutenberg/${name}`,
          path.resolve(__dirname, `packages/${name}/src`),
        ]),
      ),
    },
  },

  module: {
    ...defaultConfig.module,
    rules: (defaultConfig.module.rules || []).map((rule) => {
      // Add sassOptions.includePaths for SCSS rules
      if (rule.test && rule.test.toString().includes('scss')) {
        return {
          ...rule,
          use: (rule.use || []).map((use) => {
            const loader = typeof use === 'string' ? use : use && use.loader;
            if (loader && loader.includes('sass-loader')) {
              const useObj = typeof use === 'string' ? { loader: use } : use;
              return {
                ...useObj,
                options: {
                  ...(useObj.options || {}),
                  sassOptions: {
                    ...(useObj.options && useObj.options.sassOptions),
                    includePaths: [path.resolve(__dirname, 'css')],
                  },
                },
              };
            }
            return use;
          }),
        };
      }
      return rule;
    }),
  },

  externals: {
    jquery: 'jQuery',
  },

  plugins: [
    // Keep all default plugins except DependencyExtractionWebpackPlugin and MiniCssExtractPlugin
    ...(defaultConfig.plugins || []).filter(
      (p) =>
        p.constructor.name !== 'DependencyExtractionWebpackPlugin' &&
        p.constructor.name !== 'MiniCssExtractPlugin',
    ),
    new MiniCssExtractPlugin({
      filename: '[name]/style-index.css',
    }),
    new DependencyExtractionWebpackPlugin({
      requestToExternal(request) {
        if (request.startsWith('@drupal-gutenberg/')) {
          return [
            'DrupalGutenberg',
            camelCase(request.replace('@drupal-gutenberg/', '')),
          ];
        }
      },
      requestToHandle(request) {
        if (request.startsWith('@drupal-gutenberg/')) {
          return (
            'drupal-gutenberg-' + request.replace('@drupal-gutenberg/', '')
          );
        }
      },
    }),
  ],
};
