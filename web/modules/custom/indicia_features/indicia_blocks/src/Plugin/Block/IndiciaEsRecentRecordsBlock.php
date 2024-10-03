<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;

/**
 * Provides a 'Recent Elasticsearch Records' block.
 *
 * @Block(
 *   id = "es_recent_records_block",
 *   admin_label = @Translation("Recent Elasticsearch records block"),
 * )
 */
class IndiciaEsRecentRecordsBlock extends IndiciaBlockBase {

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);
    $this->addDefaultEsFilterFormCtrls($form);
    // Retrieve existing configuration for this block.
    $config = $this->getConfiguration();
    // Add a limit control.
    $form['limit'] = [
      '#type' => 'number',
      '#title' => $this->t('Number of records'),
      '#description' => $this->t('Limit the report to this number of records.'),
      '#default_value' => $config['limit'] ?? 10,
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
    $this->saveDefaultEsFilterFormCtrls($form_state);
    $this->setConfigurationValue('limit', $form_state->getValue('limit'));
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
      'limit' => 10,
    ], $this->getConfiguration());
    $fields = [
      'id',
      'taxon.accepted_name',
      'taxon.vernacular_name',
      'taxon.taxon_rank',
      'taxon.taxon_rank_sort_order',
      'event.date_start',
      'event.date_end',
      'event.recorded_by',
      'location.output_sref',
      'occurrence.media',
      'location.point',
    ];
    $filterPath = 'hits.hits._source.' . implode(',hits.hits._source.', $fields);
    // We aren't sure if this comes before or after a recent records map block
    // on the page, so a slight fiddle to get them to use the same source.
    if (isset(\helper_base::$indiciaData['recentRecordsSourceId'])) {
      $sourceId = \helper_base::$indiciaData['recentRecordsSourceId'];
      unset(\helper_base::$indiciaData['recentRecordsSourceId']);
    }
    else {
      $sourceId = 'src-IndiciaEsRecentRecordsBlock-' . self::$blockCount;
      \helper_base::$indiciaData['recentRecordsSourceId'] = $sourceId;
    }
    $options = [
      'id' => $sourceId,
      'size' => $config['limit'] ?? 10,
      'proxyCacheTimeout' => $config['cache_timeout'] ?? 300,
      'filterPath' => $filterPath,
      'initialMapBounds' => TRUE,
      'sort' => ['id' => 'desc'],
      'filterBoolClauses' => $this->getFilterBoolClauses($config),
    ];
    $r = \ElasticsearchReportHelper::source($options);
    $r .= \ElasticsearchReportHelper::customScript([
      'id' => 'recentRecords-' . self::$blockCount,
      'source' => $sourceId,
      'functionName' => 'handleEsRecentRecordsResponse',
    ]);
    return [
      '#markup' => Markup::create($r),
      '#attached' => [
        'library' => [
          'indicia_blocks/es-blocks',
          'iform/fancybox',
        ],
      ],
      // Rely on Indicia caching, otherwise our JS not injected onto page.
      '#cache' => ['max-age' => 0],
    ];
  }

}
