<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;

/**
 * Provides a 'Elasticsearch top recorders table' block.
 *
 * @Block(
 *   id = "es_top_recorders_table_block",
 *   admin_label = @Translation("Elasticsearch top recorders table block"),
 * )
 */
class IndiciaEsTopRecordersTableBlock extends IndiciaBlockBase {

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);
    $this->addDefaultEsFilterFormCtrls($form);
    // No point showing option to only show user's records.
    $form['limit_to_user']['#access'] = FALSE;
    $config = $this->getConfiguration();
    // Option for number to include.
    $form['limit'] = [
      '#type' => 'number',
      '#title' => $this->t('Number of recorders to include in the list'),
      '#description' => $this->t('Select how many rows to include in the output data table, each row providing info for one of the top recorders.'),
      '#default_value' => $config['level_2'] ?? 5,
    ];
    $form['include_records'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Include number of records'),
      '#description' => $this->t('Should a column for the number of records per recorder be included?'),
      '#default_value' => $config['include_records'] ?? 1,
    ];
    $form['include_species'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Include number of species'),
      '#description' => $this->t('Should a column for the number of specied per recorder be included?'),
      '#default_value' => $config['include_species'] ?? 1,
    ];
    $form['order_by'] = [
      '#type' => 'select',
      '#title' => $this->t('Order by'),
      '#options' => [
        'records' => $this->t('Records'),
        'species' => $this->t('Species'),
      ],
      '#description' => $this->t('Select the sort order (largest first).'),
      '#default_value' => $config['order_by'] ?? 'records',
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
    $this->saveDefaultEsFilterFormCtrls($form_state);
    // Always include unverified records.
    $this->setConfigurationValue('limit_to_user', 0);
    $this->setConfigurationValue('limit', $form_state->getValue('limit'));
    $this->setConfigurationValue('include_records', $form_state->getValue('include_records'));
    $this->setConfigurationValue('include_species', $form_state->getValue('include_species'));
    $this->setConfigurationValue('sort', $form_state->getValue('sort'));
  }

  /**
   * {@inheritdoc}
   *
   * @todo This year's counts
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
    \helper_base::addLanguageStringsToJs('topRecordersByRecords', [
      'noOfRecords' => 'No. of records',
      'noOfSpecies' => 'No. of species',
      'recorderName' => 'Recorder name',
    ]);
    // Get config with defaults.
    $config = array_merge([
      'limit' => 6,
      'include_records' => 1,
      'include_species' => 1,
      'sort' => 'records',
    ], $config = $this->getConfiguration());
    $agg = [
      'records_by_user' => [
        'terms' => [
          'field' => 'event.recorded_by.keyword',
          'size' => $config['limit'],
        ],
      ],
    ];
    // Add aggregation to count species if required.
    if ($config['include_species']) {
      $agg['records_by_user']['aggs'] = [
        'species_count' => [
          'cardinality' => [
            'field' => 'taxon.species_taxon_id',
          ],
        ],
      ];
    }
    if ($config['sort'] === 'species') {
      $agg['records_by_user']['terms']['order'] = [
        'species_count' => 'desc',
      ];
    }
    \helper_base::$indiciaData['topRecordersTableOptions'] = [
      'includeRecords' => $config['include_records'] === 1,
      'includeSpecies' => $config['include_species'] === 1,
    ];
    $r = \ElasticsearchReportHelper::source([
      'id' => 'topRecordersTableSource-' . self::$blockCount,
      'size' => 0,
      'proxyCacheTimeout' => $config['cache_timeout'] ?? 300,
      'aggregation' => $agg,
      'filterBoolClauses' => $this->getFilterBoolClauses($config),
    ]);
    $r .= \ElasticsearchReportHelper::customScript([
      'source' => 'topRecordersTableSource-' . self::$blockCount,
      'functionName' => 'handleTopRecordersTableResponse',
    ]);

    return [
      '#markup' => Markup::create($r),
      '#attached' => [
        'library' => [
          'indicia_blocks/es-blocks',
          'iform/brc_charts',
        ],
      ],
      // Rely on Indicia caching, otherwise our JS not injected onto page.
      '#cache' => ['max-age' => 0],
      // Disable BigPipe so that the element exists before the datasource loads.
      '#create_placeholder' => FALSE,
    ];
  }

}
