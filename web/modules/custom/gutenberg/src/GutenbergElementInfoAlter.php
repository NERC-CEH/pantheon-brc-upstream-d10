<?php

namespace Drupal\gutenberg;

use Drupal\Core\Render\Element\RenderCallbackInterface;
use Drupal\filter\Entity\FilterFormat;
use Drupal\node\NodeInterface;
use Drupal\node\NodeTypeInterface;

/**
 * Provides a trusted callback to alter the element type defaults.
 *
 * @see gutenberg_element_info_alter()
 */
class GutenbergElementInfoAlter implements RenderCallbackInterface {

  /**
   * Pre-render callback for text_formats with Gutenberg format enabled.
   */
  public static function preRender(array $element) {
    if (isset($element['#format']) && $element['#format'] == 'gutenberg') {
      $format = FilterFormat::load('gutenberg');

      // When html filtering is enabled, the value gets passed
      // through xss_filter twice, turning '&#13;' into
      // '&amp;#13;' and breaking the editor.
      if ($format->filters("filter_html")->getConfiguration()['status']) {
        $element['value']['#value'] = str_replace('&#13;', '', $element['value']['#value'], $count);
      }
    }
    return $element;
  }

  /**
   * Pre-render callback for the Navigation module's top bar.
   *
   * On Gutenberg node forms the top bar mostly repeats the editor header. The
   * header shows its page actions and entity status instead, so remove it,
   * unless other modules add items the header doesn't show.
   *
   * @see _gutenberg_attach_page_context()
   */
  public static function preRenderTopBar(array $element) {
    $element['#cache']['contexts'][] = 'route';
    $element['#cache']['tags'][] = 'config:gutenberg.settings';

    if (!static::isGutenbergFormRoute()) {
      return $element;
    }

    $items = array_keys(\Drupal::service('plugin.manager.top_bar_item')->getDefinitions());
    if (array_diff($items, ['page_actions', 'page_context'])) {
      return $element;
    }

    return [
      '#cache' => $element['#cache'],
      '#attached' => $element['#attached'] ?? [],
    ];
  }

  /**
   * Checks whether the current route is a Gutenberg-enabled node form.
   */
  protected static function isGutenbergFormRoute(): bool {
    $route_match = \Drupal::routeMatch();
    switch ($route_match->getRouteName()) {
      case 'entity.node.edit_form':
        $node = $route_match->getParameter('node');
        return $node instanceof NodeInterface && _gutenberg_is_gutenberg_enabled($node);

      case 'node.add':
        $node_type = $route_match->getParameter('node_type');
        return $node_type instanceof NodeTypeInterface
          && (bool) \Drupal::config('gutenberg.settings')->get($node_type->id() . '_enable_full');
    }
    return FALSE;
  }

}
