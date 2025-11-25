<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;

/**
 * Provides a 'Elasticsearch records by taxon group pie' block.
 *
 * @Block(
 *   id = "es_records_by_taxon_group_pie_block",
 *   admin_label = @Translation("Elasticsearch records by taxon group pie"),
 * )
 */
class IndiciaEsRecordsByTaxonGroupPieBlock extends IndiciaBlockBase {

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);
    $this->addDefaultEsFilterFormCtrls($form);
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
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
    $config = $this->getConfiguration();
    $r = \ElasticsearchReportHelper::source([
      'id' => 'recordsByTaxonGroupPieSource-' . self::$blockCount,
      'size' => 0,
      'proxyCacheTimeout' => $config['cache_timeout'] ?? 300,
      'aggregation' => [
        'by_group' => [
          'terms' => [
            'field' => 'taxon.group.keyword',
            'size' => 8,
          ],
        ],
      ],
      'filterBoolClauses' => $this->getFilterBoolClauses($config),
    ]);
    $r .= \ElasticsearchReportHelper::customScript([
      'id' => 'recordsByTaxonGroupPie-' . self::$blockCount,
      'source' => 'recordsByTaxonGroupPieSource-' . self::$blockCount,
      'functionName' => 'handleRecordsByTaxonGroupPieResponse',
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
      // Disable BigPipe so that the element exists before the datasource loads.
      '#create_placeholder' => FALSE,
    ];
  }

}
