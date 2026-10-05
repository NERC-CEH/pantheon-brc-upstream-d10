<?php

namespace Drupal\gutenberg\BlockProcessor;

use Drupal\Component\Render\MarkupInterface;
use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\gutenberg\StyleEngine;

/**
 * Processes Gutenberg block style variation class names.
 *
 * Thin Drupal adapter that delegates to synced upstream functions from
 * WordPress/gutenberg lib/block-supports/block-style-variations.php.
 *
 * Applies the is-style-{variation}--{instance} class to the block wrapper.
 * This is the post-render step of a two-phase WP hook pair:
 *   1. render_block_data ->
 *      gutenberg_render_block_style_variation_support_styles()
 *      generates per-instance CSS and adds the suffixed class
 *      to attrs.className (diffOnly -- requires
 *      WP_Theme_JSON_Resolver_Gutenberg, not yet ported).
 *   2. render_block ->
 *      gutenberg_render_block_style_variation_class_name()
 *      applies the suffixed class to the wrapper HTML (this processor).
 *
 * Theme-defined block styles (is-style-rounded etc.) are already present in
 * the serialized block HTML and continue to work via block-library/theme.css.
 */
class BlockStyleVariationsProcessor implements GutenbergBlockProcessorInterface {

  /**
   * {@inheritdoc}
   */
  public function processBlock(array &$block, &$block_content, RefinableCacheableDependencyInterface $bubbleable_metadata) {
    class_exists(StyleEngine::class);

    if ($block_content instanceof MarkupInterface) {
      $block_content = $block_content->__toString();
    }

    $block_content = \gutenberg_render_block_style_variation_class_name($block_content, $block);
    return $block_content;
  }

  /**
   * {@inheritdoc}
   */
  public function isSupported(array $block, $block_content = '') {
    if (empty($block['attrs']['className'])) {
      return FALSE;
    }
    // Only active when a variation instance class (is-style-X--N) is present,
    // which requires the render_block_data pre-processing step.
    return (bool) preg_match('/\bis-style-\S+?--\d+\b/', $block['attrs']['className']);
  }

}
