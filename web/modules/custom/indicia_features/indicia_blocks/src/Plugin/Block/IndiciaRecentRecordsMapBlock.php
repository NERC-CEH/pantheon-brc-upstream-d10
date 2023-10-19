<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Component\Render\FormattableMarkup;

/**
 * Provides a 'Recent Records Map' block.
 *
 * @Block(
 *   id = "recent_records_map_block",
 *   admin_label = @Translation("Recent records map block"),
 * )
 */
class IndiciaRecentRecordsMapBlock extends IndiciaBlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    iform_load_helpers(['report_helper', 'map_helper']);
    $r = '<div id="recent-records-map-container">';
    $config = \Drupal::config('iform.settings');
    global $indicia_templates;
    $indicia_templates['jsWrap'] = '{content}';
    $r .= \map_helper::map_panel([
      'presetLayers' => ['google_streets', 'google_hybrid'],
      'editLayer' => FALSE,
      'initial_lat' => $config->get('map_centroid_lat'),
      'initial_long' => $config->get('map_centroid_long'),
      'initial_zoom' => $config->get('map_zoom'),
      'width' => '100%',
      'height' => 550,
      'standardControls' => ['layerSwitcher', 'panZoomBar'],
    ], [
      'theme' => \map_helper::$js_path . 'theme/default/style.css',
    ]);
    $r .= '</div>';
    return [
      '#markup' => new FormattableMarkup($r, []),
      '#attached' => [
        'library' => [
          'iform/base',
          'iform/jquery',
          'iform/googlemaps',
          'iform/openlayers',
          'iform/jquery_ui',
          'iform/jquery_cookie',
          'iform/indiciaMapPanel',
        ],
      ],
      '#cache' => [
        // No cache please.
        'max-age' => 0,
      ],
    ];
  }

  /**
   * {@inheritdoc}
   *
   * Prevent caching.
   */
  public function getCacheMaxAge() {
    return 0;
  }

}
