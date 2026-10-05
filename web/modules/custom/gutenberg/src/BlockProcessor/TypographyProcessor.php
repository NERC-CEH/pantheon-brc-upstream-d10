<?php

namespace Drupal\gutenberg\BlockProcessor;

use Drupal\Component\Render\MarkupInterface;
use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\gutenberg\StyleEngine;

/**
 * Processes Gutenberg blocks with typography support.
 *
 * Thin Drupal adapter that delegates to synced upstream functions from
 * WordPress/gutenberg lib/block-supports/typography.php.
 */
class TypographyProcessor implements GutenbergBlockProcessorInterface {

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

    $attributes = \gutenberg_apply_typography_support($block_type, $block['attrs'] ?? []);

    $has_fit_text = !empty($block['attrs']['fitText']);

    if (empty($attributes) && !$has_fit_text) {
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

      // Add has-fit-text class for fitText support.
      if ($has_fit_text) {
        $processor->add_class('has-fit-text');
      }
    }
    $block_content = $processor->get_updated_html();
    return $block_content;
  }

  /**
   * {@inheritdoc}
   */
  public function isSupported(array $block, $block_content = '') {
    return isset($block['attrs']['fontSize'])
      || isset($block['attrs']['fontFamily'])
      || isset($block['attrs']['style']['typography'])
      || !empty($block['attrs']['fitText']);
  }

}
