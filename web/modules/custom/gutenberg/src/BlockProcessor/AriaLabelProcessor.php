<?php

namespace Drupal\gutenberg\BlockProcessor;

use Drupal\Component\Render\MarkupInterface;
use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\gutenberg\StyleEngine;

/**
 * Processes Gutenberg blocks with aria-label support.
 *
 * Thin Drupal adapter that delegates to synced upstream functions from
 * WordPress/gutenberg lib/block-supports/aria-label.php.
 */
class AriaLabelProcessor implements GutenbergBlockProcessorInterface {

  /**
   * {@inheritdoc}
   */
  public function processBlock(array &$block, &$block_content, RefinableCacheableDependencyInterface $bubbleable_metadata) {
    class_exists(StyleEngine::class);

    if ($block_content instanceof MarkupInterface) {
      $block_content = $block_content->__toString();
    }

    $block_type = \WP_Block_Type_Registry::get_instance()->get_registered($block['blockName']);
    if (!$block_type) {
      return $block_content;
    }

    $attributes = \gutenberg_apply_aria_label_support($block_type, $block['attrs'] ?? []);
    if (empty($attributes)) {
      return $block_content;
    }

    $processor = new \WP_HTML_Tag_Processor($block_content);
    if ($processor->next_tag()) {
      foreach ($attributes as $key => $value) {
        $processor->set_attribute($key, $value);
      }
    }
    $block_content = $processor->get_updated_html();
    return $block_content;
  }

  /**
   * {@inheritdoc}
   */
  public function isSupported(array $block, $block_content = '') {
    return isset($block['attrs']['ariaLabel']);
  }

}
