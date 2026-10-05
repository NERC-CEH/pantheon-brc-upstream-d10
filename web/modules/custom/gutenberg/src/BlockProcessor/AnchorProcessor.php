<?php

namespace Drupal\gutenberg\BlockProcessor;

use Drupal\Component\Render\MarkupInterface;
use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\gutenberg\StyleEngine;

/**
 * Applies the anchor block support (HTML id attribute).
 *
 * Mirrors the WP core anchor block support
 * (wp-includes/block-supports/anchor.php).
 * When a block has an 'anchor' attribute, this processor adds the corresponding
 * id="…" to the block's outermost element so that in-page links work on the
 * frontend.
 *
 * Note: anchor support is handled in WP core (not the Gutenberg plugin), so
 * there is no upstream file to sync — this processor is implemented directly.
 */
class AnchorProcessor implements GutenbergBlockProcessorInterface {

  /**
   * {@inheritdoc}
   */
  public function processBlock(array &$block, &$block_content, RefinableCacheableDependencyInterface $bubbleable_metadata) {
    class_exists(StyleEngine::class);

    if ($block_content instanceof MarkupInterface) {
      $block_content = $block_content->__toString();
    }

    $anchor = $block['attrs']['anchor'] ?? '';
    if (!is_string($anchor) || $anchor === '') {
      return $block_content;
    }

    $processor = new \WP_HTML_Tag_Processor($block_content);
    if ($processor->next_tag()) {
      $processor->set_attribute('id', $anchor);
    }

    $block_content = $processor->get_updated_html();
    return $block_content;
  }

  /**
   * {@inheritdoc}
   */
  public function isSupported(array $block, $block_content = '') {
    return !empty($block['attrs']['anchor']);
  }

}
