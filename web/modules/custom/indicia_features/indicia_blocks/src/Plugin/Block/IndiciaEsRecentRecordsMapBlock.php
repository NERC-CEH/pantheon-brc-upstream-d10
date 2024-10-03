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
    // We aren't sure if this comes before or after a recent records block on
    // the page, so a slight fiddle to get them to use the same source.
    if (isset(\helper_base::$indiciaData['recentRecordsSourceId'])) {
      $sourceId = \helper_base::$indiciaData['recentRecordsSourceId'];
      unset(\helper_base::$indiciaData['recentRecordsSourceId']);
    }
    else {
      $sourceId = 'src-IndiciaEsRecentRecordsBlock-' . self::$blockCount;
      \helper_base::$indiciaData['recentRecordsSourceId'] = $sourceId;
    }
    $r = \ElasticsearchReportHelper::leafletMap([
      'id' => 'recentRecordsMap-' . self::$blockCount,
      'layerConfig' => [
        'recent-records' => [
          'title' => $this->t('Recent records'),
          'source' => $sourceId,
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
      // Rely on Indicia caching, otherwise our JS not injected onto page.
      '#cache' => ['max-age' => 0],
    ];
  }

}
