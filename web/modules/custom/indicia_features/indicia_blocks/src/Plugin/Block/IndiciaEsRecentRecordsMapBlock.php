<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Render\Markup;

/**
 * Provides a 'Recent Elasticsearch Records Map' block.
 *
 * Relies on the Recent Elasticsearch Records block for population.
 *
 * @Block(
 *   id = "es_recent_records_map_block",
 *   admin_label = @Translation("Recent Elasticsearch records map block"),
 * )
 */
class IndiciaEsRecentRecordsMapBlock extends IndiciaBlockBase {

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
    $r = \ElasticsearchReportHelper::leafletMap([
      'id' => 'recentRecordsMap-' . self::$blockCount,
      'layerConfig' => [
        'recent-records' => [
          'title' => $this->t('Recent records'),
          'source' => 'src-IndiciaEsRecentRecordsBlock',
          'forceEnabled' => TRUE,
          'labels' => 'hover',
        ],
      ],
    ]);
    return [
      '#markup' => Markup::create($r),
      '#attached' => [
        'library' => [
          'iform/leaflet',
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
