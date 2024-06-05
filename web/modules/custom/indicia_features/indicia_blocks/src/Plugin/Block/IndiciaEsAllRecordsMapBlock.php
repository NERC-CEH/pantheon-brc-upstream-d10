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
    $form['base_layer'] = [
      '#type' => 'select',
      '#title' => t('Base layer'),
      '#description' => t('Select the base layer to use.'),
      '#options' => $baseMapOptions,
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
      'filterBoolClauses' => ['must' => $this->getFilterBoolClauses($config)],
    ]);
    $r .= \ElasticsearchReportHelper::leafletMap([
      'id' => 'allRecordsMap-' . self::$blockCount,
      'baseLayerConfig' => [
        $config['base_layer'] => $this->getBaseLayerConfig($config['base_layer']),
      ],
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
    ]);

    // @todo Apply location ID or search area boundary if group limited.

    // @todo zoomable or fixed.


    return [
      '#markup' => Markup::create($r),
      '#attached' => [
        'library' => [
          'indicia_blocks/es-blocks',
        ],
      ],
      '#cache' => [
        // No cache please.
        'max-age' => 0,
      ],
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
