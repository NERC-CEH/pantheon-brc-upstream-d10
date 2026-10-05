/**
 * @file
 * Webpack loader that enables experimental blocks in @wordpress/block-library.
 *
 * The block-library package gates experimental blocks behind two mechanisms:
 *
 * 1. Window flags: getAllBlocks() only includes tabs/playlist blocks when
 *    window.__experimentalEnableBlockExperiments is truthy, and form blocks
 *    when window.__experimentalEnableFormBlocks is truthy.
 *
 * 2. Metadata filter: __experimentalGetCoreBlocks() filters out any block
 *    whose block.json has "__experimental": true at the top level.
 *
 * This loader removes both gates so all blocks are always available.
 * The Drupal Gutenberg settings form (gutenberg.blocks.yml + allowedBlocks)
 * is the actual gatekeeper for which blocks admins can enable.
 */
module.exports = function (source) {
  // 1. Remove the isBlockMetadataExperimental filter from __experimentalGetCoreBlocks.
  //    Before: var __experimentalGetCoreBlocks = () => getAllBlocks().filter(
  //              ({ metadata }) => !isBlockMetadataExperimental(metadata)
  //            );
  //    After:  var __experimentalGetCoreBlocks = () => getAllBlocks();
  source = source.replace(
    /var __experimentalGetCoreBlocks = \(\) => getAllBlocks\(\)\.filter\(\s*\(\{\s*metadata\s*\}\) => !isBlockMetadataExperimental\(metadata\)\s*\)/,
    'var __experimentalGetCoreBlocks = () => getAllBlocks()'
  );

  // 2. Remove window.__experimentalEnableFormBlocks conditional.
  source = source.replace(
    /if\s*\(window\?\.__experimentalEnableFormBlocks\)\s*\{([^}]+)\}/,
    '$1'
  );

  // 3. Remove window.__experimentalEnableBlockExperiments conditional.
  source = source.replace(
    /if\s*\(window\?\.__experimentalEnableBlockExperiments\)\s*\{([^}]+)\}/,
    '$1'
  );

  return source;
};
