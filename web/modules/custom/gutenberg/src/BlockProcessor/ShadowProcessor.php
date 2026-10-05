<?php

namespace Drupal\gutenberg\BlockProcessor;

use Drupal\Component\Render\MarkupInterface;
use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\gutenberg\StyleEngine;

/**
 * Processes Gutenberg blocks with shadow support.
 *
 * Thin Drupal adapter that delegates to synced upstream functions from
 * WordPress/gutenberg lib/block-supports/shadow.php.
 */
class ShadowProcessor implements GutenbergBlockProcessorInterface {

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

    $attributes = \gutenberg_apply_shadow_support($block_type, $block['attrs'] ?? []);
    if (empty($attributes)) {
      return $block_content;
    }

    $processor = new \WP_HTML_Tag_Processor($block_content);
    if ($processor->next_tag()) {
      if (!empty($attributes['class'])) {
        foreach (explode(' ', $attributes['class']) as $class_name) {
          if (trim($class_name)) {
            $processor->add_class(trim($class_name));
          }
        }
      }
      if (!empty($attributes['style'])) {
        $existing = $processor->get_attribute('style');
        $new_style = $existing
          ? rtrim($existing, '; ') . '; ' . $attributes['style']
          : $attributes['style'];
        $processor->set_attribute('style', $new_style);
      }
    }
    $block_content = $processor->get_updated_html();
    return $block_content;
  }

  /**
   * {@inheritdoc}
   */
  public function isSupported(array $block, $block_content = '') {
    return isset($block['attrs']['shadow'])
      || isset($block['attrs']['style']['shadow']);
  }

}
