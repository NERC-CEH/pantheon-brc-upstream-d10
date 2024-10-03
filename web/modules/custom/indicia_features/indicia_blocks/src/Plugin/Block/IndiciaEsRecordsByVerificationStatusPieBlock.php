<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;

/**
 * Provides a 'Elasticsearch records by verification status pie' block.
 *
 * @Block(
 *   id = "es_records_by_verification_status_pie_block",
 *   admin_label = @Translation("Elasticsearch records by verification status pie block"),
 * )
 */
class IndiciaEsRecordsByVerificationStatusPieBlock extends IndiciaBlockBase {

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);
    $this->addDefaultEsFilterFormCtrls($form);
    // No point showing option to only show unverified.
    $form['unverified_records']['#access'] = FALSE;
    $config = $this->getConfiguration();
    // Option for verification level to divide at.
    $form['level_2'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Include breakdown of detailed verification levels'),
      '#description' => $this->t('Tick this box to include detailed verification levels such as Accepted - correct.'),
      '#default_value' => $config['level_2'] ?? 0,
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
    $this->setConfigurationValue('unverified_records', 1);
    $this->setConfigurationValue('level_2', $form_state->getValue('level_2'));
  }

  /**
   * Adds language strings for status labels and colours to JS.
   */
  private function addStatusLabelsToJs() {
    iform_load_helpers(['helper_base']);
    \helper_base::addLanguageStringsToJs('statuses', [
      'V' => 'accepted (all)',
      'V0' => 'accepted (unspecified)',
      'V1' => 'accepted - correct',
      'V2' => 'accepted - considered correct',
      'C' => 'not reviewed',
      'C0' => 'pending review',
      'C3' => 'plausible',
      'R' => 'not accepted (all)',
      'R0' => 'not accepted (unspecified)',
      'R4' => 'not accepted - unable to verify',
      'R5' => 'not accepted - incorrect',
    ]);
    \helper_base::$indiciaData['statusColours'] = [
      'V' => '#01665e',
      'V0' => '#cccccc',
      'V1' => '#35978f',
      'V2' => '#80cdc1',
      'C' => '#f6e8c3',
      'C0' => '#cccccc',
      'C3' => '#c7eae5',
      'R' => '#8c510a',
      'R0' => '#cccccc',
      'R4' => '#bf812d',
      'R5' => '#dfc27d',
    ];
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
    $this->addStatusLabelsToJs();
    // Get config with defaults.
    $config = array_merge([
      'level_2' => 0,
    ], $this->getConfiguration());
    $aggs = [
      'terms' => [
        'field' => 'identification.verification_status',
      ],
    ];
    // If showing level 2 status detail, then add extra nested aggregation so
    // a donut chart can be built.
    if ($config['level_2']) {
      $aggs['aggregations'] = [
        'by_substatus' => [
          'terms' => [
            'field' => 'identification.verification_substatus',
          ],
        ],
      ];
    }
    $r = \ElasticsearchReportHelper::source([
      'id' => 'recordsByVerificationStatusPieSource-' . self::$blockCount,
      'size' => 0,
      'proxyCacheTimeout' => $config['cache_timeout'] ?? 300,
      'aggregation' => [
        'by_status' => $aggs,
      ],
      'filterBoolClauses' => $this->getFilterBoolClauses($config),
    ]);
    $r .= \ElasticsearchReportHelper::customScript([
      'id' => 'recordsByVerificationStatusPie-' . self::$blockCount,
      'source' => 'recordsByVerificationStatusPieSource-' . self::$blockCount,
      'functionName' => 'handleRecordsByVerificationStatusPieResponse',
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
