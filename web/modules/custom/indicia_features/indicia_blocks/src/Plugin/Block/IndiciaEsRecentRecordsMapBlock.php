<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Form\FormStateInterface;
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
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);
    $config = $this->getConfiguration();
    $form['map_height'] = [
      '#type' => 'number',
      '#title' => $this->t('Map height (pixels)'),
      '#description' => $this->t('Specify the height of the map in pixels. Leave blank to use the system default.'),
      '#default_value' => $config['map_height'] ?? NULL,
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
    $this->setConfigurationValue('map_height', $form_state->getValue('map_height'));
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
    $config = $this->getConfiguration();
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
      'height' => $config['map_height'] ?? 500,
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
      // Disable BigPipe so that the element exists before the datasource loads.
      '#create_placeholder' => FALSE,
    ];
  }

}
