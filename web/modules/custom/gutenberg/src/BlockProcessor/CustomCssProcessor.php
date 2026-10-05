<?php

namespace Drupal\gutenberg\BlockProcessor;

use Drupal\Component\Render\MarkupInterface;
use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\gutenberg\StyleEngine;

/**
 * Processes per-block custom CSS (style.css attribute).
 *
 * Mirrors the WP core customCSS block support
 * (wp-includes/block-supports/custom-css.php).
 * When a block has additional CSS set via the block
 * inspector's "Additional CSS"
 * panel, this processor:
 *   1. Validates the CSS (rejects any HTML markup).
 *   2. Generates a unique, deterministic class name for this block instance.
 *   3. Scopes the CSS to that class and prepends a <style> tag to the output.
 *   4. Adds the scoping class to the block's wrapper element.
 *
 * Note: custom-css support is in WP core (not the Gutenberg plugin), so
 * there is no upstream file to sync — this processor is implemented directly.
 * CSS processing uses a simplified scope algorithm (analogous to
 * WP_Theme_JSON::process_blocks_custom_css) that handles both top-level
 * declarations and nested `& selector { }` rules.
 */
class CustomCssProcessor implements GutenbergBlockProcessorInterface {

  /**
   * {@inheritdoc}
   */
  public function processBlock(array &$block, &$block_content, RefinableCacheableDependencyInterface $bubbleable_metadata) {
    class_exists(StyleEngine::class);

    if ($block_content instanceof MarkupInterface) {
      $block_content = $block_content->__toString();
    }

    $custom_css = trim($block['attrs']['style']['css'] ?? '');
    if ($custom_css === '') {
      return $block_content;
    }

    // Reject CSS containing HTML markup tags (same guard
    // as WP global styles REST API).
    if (preg_match('#</?\w+#', $custom_css)) {
      return $block_content;
    }

    // Generate a unique, deterministic class name for this block instance.
    $class_name = 'wp-custom-css-' . md5(serialize($block['attrs']));
    $selector = '.' . $class_name;

    // Scope the CSS to the generated selector.
    $processed_css = $this->processCustomCss($custom_css, $selector);

    if ($processed_css === '') {
      return $block_content;
    }

    // Add the scoping class to the block wrapper.
    $processor = new \WP_HTML_Tag_Processor($block_content);
    if ($processor->next_tag()) {
      $processor->add_class($class_name);
    }
    $block_content = $processor->get_updated_html();

    // Prepend an inline <style> tag. This matches the Duotone processor
    // pattern and avoids needing to thread through Drupal's html_head system.
    $block_content = '<style>' . $processed_css . '</style>' . $block_content;

    return $block_content;
  }

  /**
   * {@inheritdoc}
   */
  public function isSupported(array $block, $block_content = '') {
    $css = $block['attrs']['style']['css'] ?? '';
    return is_string($css) && trim($css) !== '';
  }

  /**
   * Scope raw CSS to a selector.
   *
   * Mirrors WP_Theme_JSON::process_blocks_custom_css().
   *
   * Handles two cases:
   *   - Top-level declarations (no braces): wrapped in `selector { … }`.
   *   - Nested rules using `&` as placeholder: `& a { }` → `selector a { }`.
   *
   * @param string $css
   *   Raw CSS from the block attribute.
   * @param string $selector
   *   CSS selector to scope to (e.g. `.wp-custom-css-abc`).
   *
   * @return string
   *   Processed CSS string.
   */
  protected function processCustomCss(string $css, string $selector): string {
    if (!str_contains($css, '{')) {
      // Pure declarations — wrap the whole thing in the selector.
      return "$selector { $css }";
    }

    $processed = '';
    $remaining = $css;

    // Walk through selector-block pairs: `prefix { declarations }`.
    while (preg_match('/([^{}]*)\{([^{}]*)\}(.*)/s', $remaining, $matches)) {
      $prefix       = trim($matches[1]);
      $declarations = trim($matches[2]);
      $remaining    = trim($matches[3]);

      if ($prefix === '' || $prefix === '&') {
        // Bare declarations block or `& { }` — scope to selector itself.
        if ($declarations !== '') {
          $processed .= "$selector { $declarations }\n";
        }
      }
      else {
        // Sub-selector: replace `&` placeholder (or prepend selector).
        if (str_contains($prefix, '&')) {
          $sub = str_replace('&', $selector, $prefix);
        }
        else {
          $sub = "$selector $prefix";
        }
        if ($declarations !== '') {
          $processed .= "$sub { $declarations }\n";
        }
      }
    }

    // Any trailing content without braces is top-level declarations.
    $remaining = trim($remaining);
    if ($remaining !== '') {
      $processed .= "$selector { $remaining }\n";
    }

    return $processed;
  }

}
