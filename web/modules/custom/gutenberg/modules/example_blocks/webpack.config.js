const config = require('@wordpress/scripts/config/webpack.config');

module.exports = {
  ...config,
  entry: {
    ...config.entry,
    blocks: './blocks/index.js',
  },
  externals: {
    ...config.externals,
    drupal: 'Drupal',
  },
  output: {
    ...config.output,
    path: `${__dirname}/dist`,
    filename: '[name].js',
  },
};
