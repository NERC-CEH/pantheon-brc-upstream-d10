<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;

/**
 * Provides a 'All Elasticsearch records map' block.
 *
 * A block which shows a map of all records, which can be in the context of a
 * website, user or group.
 *
 * @Block(
 *   id = "es_all_records_map_block",
 *   admin_label = @Translation("All Elasticsearch records map block"),
 * )
 */
class IndiciaEsAllRecordsMapBlock extends IndiciaBlockBase {

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);
    $baseMapOptions = [
      'OpenStreetMap' => $this->t('Open Street Map'),
      'OpenTopoMap' => $this->t('Open Topo Map'),
    ];
    if (\Drupal::config('iform.settings')->get('google_api_key')) {
      $baseMapOptions['GoogleSatellite'] = $this->t('Google Satellite');
      $baseMapOptions['GoogleRoadMap'] = $this->t('Google Streets');
      $baseMapOptions['GoogleTerrain'] = $this->t('Google Terrain');
      $baseMapOptions['GoogleHybrid'] = $this->t('Google Hybrid');
    }
    $config = $this->getConfiguration();
    $form['base_layer'] = [
      '#type' => 'select',
      '#title' => $this->t('Base layer'),
      '#description' => $this->t('Select the base layer to use.'),
      '#options' => $baseMapOptions,
      '#default_value' => $config['base_layer'] ?? 'OpenStreetMap',
    ];
    $form['map_layer_type'] = [
      '#type' => 'select',
      '#title' => $this->t('Map layer type'),
      '#description' => $this->t('Select the visual appearance of the records layer.'),
      '#options' => [
        'circle' => $this->t('Circle aligned to grid squares'),
        'square' => $this->t('Grid squares'),
        'heat' => $this->t('Heat map'),
        'geo_hash' => $this->t('Geo hash (dynamic rectangles which work worldwide)'),
      ],
      '#default_value' => $config['map_layer_type'] ?? 'circle',
    ];
    $form['default_zoom_level'] = [
      '#type' => 'number',
      '#title' => $this->t('Default zoom level'),
      '#description' => $this->t('Specify the default zoom level for the map (0 = whole world, 18 = street level). Leave blank to use the system default.'),
      '#default_value' => $config['default_zoom_level'] ?? NULL,
    ];
    $form['map_height'] = [
      '#type' => 'number',
      '#title' => $this->t('Map height (pixels)'),
      '#description' => $this->t('Specify the height of the map in pixels. Leave blank to use the system default.'),
      '#default_value' => $config['map_height'] ?? NULL,
    ];
    $form['boundary_location_id'] = [
      '#type' => 'number',
      '#title' => $this->t('Boundary Location ID'),
      '#description' => $this->t('Specify an Indicia location ID to draw a fixed location boundary onto the map.'),
      '#default_value' => $config['boundary_location_id'],
    ];
    $this->addDefaultEsFilterFormCtrls($form);
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
    $this->setConfigurationValue('base_layer', $form_state->getValue('base_layer'));
    $this->setConfigurationValue('map_layer_type', $form_state->getValue('map_layer_type'));
    $this->setConfigurationValue('default_zoom_level', $form_state->getValue('default_zoom_level'));
    $this->setConfigurationValue('map_height', $form_state->getValue('map_height'));
    $this->setConfigurationValue('boundary_location_id', $form_state->getValue('boundary_location_id'));
    $this->saveDefaultEsFilterFormCtrls($form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    self::$blockCount++;
    iform_load_helpers(['ElasticsearchReportHelper']);
    $enabled = \ElasticsearchReportHelper::enableElasticsearchProxy();
    if (!$enabled) {
      global $indicia_templates;
      return [
        '#markup' => str_replace('{message}', $this->t('Service unavailable.'), $indicia_templates['warningBox']),
      ];
    }
    // Get config with defaults.
    $config = array_merge([
      'map_layer_type' => 'circle',
      'base_layer' => 'OpenStreetMap',
    ], $this->getConfiguration());
    // Source mode depends on map type.
    $mode = [
      'circle' => 'mapGridSquare',
      'square' => 'mapGridSquare',
      'heat' => 'mapGeoHash',
      'geo_hash' => 'mapGeoHash',
    ][$config['map_layer_type']];
    $markerType = [
      'circle' => 'circle',
      'square' => 'square',
      'heat' => 'heat',
      'geo_hash' => 'square',
    ][$config['map_layer_type']];
    $r = \ElasticsearchReportHelper::source([
      'id' => 'allRecordsMapBlockSource-' . self::$blockCount,
      'mode' => $mode,
      'switchToGeomsAt' => 13,
      'filterBoolClauses' => $this->getFilterBoolClauses($config),
    ]);
    $r .= \ElasticsearchReportHelper::leafletMap([
      'id' => 'allRecordsMap-' . self::$blockCount,
      'baseLayerConfig' => [
        $config['base_layer'] => $this->getBaseLayerConfig($config['base_layer']),
      ],
      'initialZoom' => $config['default_zoom_level'] ?? hostsite_get_config_value('iform', 'map_zoom', 5),
      'height' => $config['map_height'] ?? 500,
      'layerConfig' => [
        'recordsMap' => [
          'title' => 'All records in current filter (grid map)',
          'source' => 'allRecordsMapBlockSource-' . self::$blockCount,
          'enabled' => TRUE,
          'forceEnabled' => TRUE,
          'type' => $markerType,
          'style' => [
            'color' => '#3333FF',
            'weight' => 2,
            'fillOpacity' => 'metric',
            'size' => 'autoGridSquareSize',
          ],
        ],
      ],
      'boundaryLocationId' => $config['boundary_location_id'] ?? NULL,
    ]);
    return [
      '#markup' => Markup::create($r),
      '#attached' => [
        'library' => [
          'indicia_blocks/es-blocks',
        ],
      ],
      // Rely on Indicia caching, otherwise our JS not injected onto page.
      '#cache' => ['max-age' => 0],
      // Disable BigPipe so that the element exists before the datasource loads.
      '#create_placeholder' => FALSE,
    ];
  }

  private function getBaseLayerConfig($layerName) {
    switch ($layerName) {
      case 'OpenStreetMap':
        return [
          'title' => $this->t('Open Street Map'),
          'type' => 'OpenStreetMap',
        ];

      case 'OpenTopoMap':
        return [
          'title' => $this->t('Open Street Map'),
          'type' => 'OpenTopoMap',
        ];

      case 'GoogleSatellite':
        return [
          'title' => $this->t('Google Satellite'),
          'type' => 'Google',
          'subType' => 'satellite',
        ];

      case 'GoogleRoadMap':
        return [
          'title' => $this->t('Google Streets'),
          'type' => 'Google',
          'subType' => 'roadmap',
        ];

      case 'GoogleTerrain':
        return [
          'title' => $this->t('Google Terrain'),
          'type' => 'Google',
          'subType' => 'terrain',
        ];

      case 'GoogleHybrid':
        return [
          'title' => $this->t('Google Hybrid'),
          'type' => 'Google',
          'subType' => 'hybrid',
        ];
    }
  }

}
