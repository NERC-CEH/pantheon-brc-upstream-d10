<?php

namespace Drupal\gutenberg\BlockProcessor;

use Drupal\Component\Render\MarkupInterface;
use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\gutenberg\StyleEngine;

/**
 * Processes Gutenberg blocks with block visibility support.
 *
 * Thin Drupal adapter that delegates to synced upstream functions from
 * WordPress/gutenberg lib/block-supports/block-visibility.php.
 */
class BlockVisibilityProcessor implements GutenbergBlockProcessorInterface {

  /**
   * {@inheritdoc}
   */
  public function processBlock(array &$block, &$block_content, RefinableCacheableDependencyInterface $bubbleable_metadata) {
    class_exists(StyleEngine::class);

    if ($block_content instanceof MarkupInterface) {
      $block_content = $block_content->__toString();
    }

    $block_content = \gutenberg_render_block_visibility_support($block_content, $block);
    return $block_content;
  }

  /**
   * {@inheritdoc}
   */
  public function isSupported(array $block, $block_content = '') {
    return isset($block['attrs']['metadata']['blockVisibility']);
  }

}
