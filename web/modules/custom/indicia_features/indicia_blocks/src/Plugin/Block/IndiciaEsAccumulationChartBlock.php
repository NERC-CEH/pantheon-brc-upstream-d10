<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;

/**
 * Provides an 'Elasticsearch accumulation chart' block.
 *
 * @Block(
 *   id = "es_accumulation_chart_block",
 *   admin_label = @Translation("Elasticsearch accumulation chart block"),
 * )
 */
class IndiciaEsAccumulationChartBlock extends IndiciaBlockBase {

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);
    // Retrieve existing configuration for this block.
    $config = $this->getConfiguration();
    $this->addDefaultEsFilterFormCtrls($form);
    $form['show'] = [
      '#type' => 'select',
      '#title' => $this->t('Show'),
      '#description' => $this->t('Show taxa, record counts, or both.'),
      '#options' => [
        'both' => $this->t('Both taxa and record count accumulation'),
        'taxa' => $this->t('Accumulation of taxa'),
        'counts' => $this->t('Accumulation of record counts'),
      ],
      '#default_value' => $config['show'] ?? 'both',
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
    $this->saveDefaultEsFilterFormCtrls($form_state);
    $this->setConfigurationValue('show', $form_state->getValue('show'));
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
    $r = \ElasticsearchReportHelper::source([
      'id' => 'accumulationChartSource-' . self::$blockCount,
      'size' => 0,
      'proxyCacheTimeout' => $config['cache_timeout'] ?? 300,
      // Want it to be by year/week/taxa with count of records in each bucket.
      'aggregation' => [
        'by_week' => [
          'terms' => [
            'field' => 'event.week',
          ],
          'aggs' => [
            'by_taxon' => [
              'terms' => [
                'field' => 'taxon.accepted_taxon_id',
                'size' => 50000,
              ],
              'aggs' => [
                'by_year' => [
                  'terms' => [
                    'field' => 'event.year',
                  ],
                ],
              ],
            ],
          ],
        ],
      ],
      'filterBoolClauses' => $this->getFilterBoolClauses($config),
      'numericFilters' => ['event.year' => (date("Y") - 1) . '-' . date("Y")],
    ]);
    $r .= \ElasticsearchReportHelper::customScript([
      'id' => 'accumulationChart-' . self::$blockCount,
      'source' => 'accumulationChartSource-' . self::$blockCount,
      'functionName' => 'handleAccumulationChartResponse' . ucfirst($config['show'] ?? 'both'),
      'class' => 'indicia-block-visualisation',
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
    ];
  }

}
