<?php

namespace Drupal\gutenberg\BlockProcessor;

use Drupal\Component\Render\MarkupInterface;
use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\gutenberg\StyleEngine;

/**
 * Processes Gutenberg blocks with layout support.
 *
 * Thin Drupal adapter that delegates to synced upstream functions from
 * WordPress/gutenberg lib/block-supports/layout.php. The synced functions
 * are loaded via StyleEngine.php's require chain (block-supports/*.php).
 *
 * WP API shims in block-supports-shims.php bridge the gap between upstream
 * code expectations (WP_Block_Type_Registry, block_has_support, etc.) and
 * Drupal's service layer.
 */
class LayoutProcessor implements GutenbergBlockProcessorInterface {

  /**
   * {@inheritdoc}
   */
  public function processBlock(array &$block, &$block_content, RefinableCacheableDependencyInterface $bubbleable_metadata) {
    // Ensure StyleEngine (and synced block-supports functions) are loaded.
    // StyleEngine.php's top-level requires load utils.php, style-engine,
    // shims, and block-supports/*.php files that provide the global functions.
    class_exists(StyleEngine::class);

    // Convert Drupal MarkupInterface to string for upstream processing.
    if ($block_content instanceof MarkupInterface) {
      $block_content = $block_content->__toString();
    }

    $block_content = \gutenberg_render_layout_support_flag($block_content, $block);
    $block_content = \gutenberg_restore_group_inner_container($block_content, $block);

    return $block_content;
  }

  /**
   * {@inheritdoc}
   */
  public function isSupported(array $block, $block_content = '') {
    // Run for all named blocks. gutenberg_render_layout_support_flag() has its
    // own early-return for blocks that don't declare layout support, so there
    // is no need to pre-filter here. Gating on explicit 'layout'/'style' attrs
    // caused default-layout blocks (e.g. columns without a custom blockGap) to
    // be skipped, leaving them without the required is-layout-* classes on the
    // frontend.
    return !empty($block['blockName']);
  }

}
