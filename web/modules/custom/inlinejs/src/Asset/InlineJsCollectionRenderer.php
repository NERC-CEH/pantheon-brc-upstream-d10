<?php

/**
 * @file
 * Contains Drupal\inlinejs\Asset\InlineJsCollectionRenderer.
 */

namespace Drupal\inlinejs\Asset;


use Drupal\Component\Serialization\Json;
use Drupal\Core\Asset\JsCollectionRenderer;

class InlineJsCollectionRenderer extends JsCollectionRenderer {

  /**
   * {@inheritdoc}
   */
  public function render(array $js_assets) {
    $elements = array();
    $is_header = FALSE;
    // A dummy query-string is added to filenames, to gain control over
    // browser-caching. The string changes on every update or full cache
    // flush, forcing browsers to load a new copy of the files, as the
    // URL changed. Files that should not be cached (see _drupal_add_js())
    // get REQUEST_TIME as query-string instead, to enforce reload on every
    // page request.
    $default_query_string = $this->state->get('system.css_js_query_string') ?: '0';

    // For inline JavaScript to validate as XHTML, all JavaScript containing
    // XHTML needs to be wrapped in CDATA. To make that backwards compatible
    // with HTML 4, we need to comment out the CDATA-tag.
    $embed_prefix = "\n<!--//--><![CDATA[//><!--\n";
    $embed_suffix = "\n//--><!]]>\n";

    // Defaults for each SCRIPT element.
    $element_defaults = array(
      '#type' => 'html_tag',
      '#tag' => 'script',
      '#value' => '',
    );
    $i = 1;

    $js_assets = array_merge($js_assets);
    // Loop through all JS assets.
    foreach ($js_assets as $js_asset) {
      // Element properties that do not depend on JS asset type.
      $element = $element_defaults;
      $element['#browsers'] = $js_asset['browsers'];

      // Element properties that depend on item type.
      switch ($js_asset['type']) {
        case 'setting':
          $is_header = TRUE;
          $element['#value_prefix'] = $embed_prefix;
          $element['#value'] = 'var drupalSettings = ' . Json::encode($js_asset['data']) . ";";
          $element['#value_suffix'] = $embed_suffix;
          break;

        case 'file':
          $query_string = $js_asset['version'] == -1 ? $default_query_string : 'v=' . $js_asset['version'];
          $query_string_separator = (strpos($js_asset['data'], '?') !== FALSE) ? '&' : '?';
          $element['#attributes']['src'] = file_create_url($js_asset['data']);
          // Only add the cache-busting query string if this isn't an aggregate
          // file.
          if (!isset($js_asset['preprocessed'])) {
            $element['#attributes']['src'] .= $query_string_separator . ($js_asset['cache'] ? $query_string : \Drupal::time()->getRequestTime());
          }
          break;

        case 'external':
          $element['#attributes']['src'] = $js_asset['data'];
          break;
        default:
          throw new \Exception('Invalid JS asset type.');
      }

      // Attributes may only be set if this script is output independently.
      if (!empty($element['#attributes']['src']) && !empty($js_asset['attributes'])) {
        $element['#attributes'] += $js_asset['attributes'];
      }

      $element['#weight'] = isset($element['#weight']) ? $element['#weight'] : JS_LIBRARY + ($i / 10000);
      $elements[] = $element;
      $i++;
    }

    if ($is_header) {
      $this->renderInlineJs('header', $elements);
    }
    else {
      $this->renderInlineJs('footer', $elements);
    }

    uasort($elements, array('Drupal\Component\Utility\SortArray', 'sortByWeightElement'));
    return $elements;
  }


  /**
   * @param string $scope
   * @param $elements
   *
   * @return array
   */
  protected function renderInlineJs($scope = 'header', &$elements) {
    $i = 1;
    // Defaults for each SCRIPT element.
    $element_defaults = array(
      '#type' => 'html_tag',
      '#tag' => 'script',
      '#value' => '',
    );
    $inlinejs_assets = \Drupal::moduleHandler()->invokeAll('inlinejs_alter');
    $js_assets = $inlinejs_assets[$scope];

    // Loop through all JS assets.
    foreach ($js_assets as $js_asset) {
      // Element properties that do not depend on JS asset type.
      $element = $element_defaults;
      $element['#browsers'] = $js_asset['browsers'];
      $element['#value'] = $js_asset['data'];
      $element['#weight'] = isset($js_asset['group']) ? $js_asset['group'] : JS_LIBRARY + 10 + ($i / 10000);
      $elements[] = $element;
      $i++;
    }
  }

}
