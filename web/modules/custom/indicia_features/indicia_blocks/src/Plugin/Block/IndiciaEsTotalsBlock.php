<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;

/**
 * Provides a 'Elasticsearch Totals' block.
 *
 * @Block(
 *   id = "es_totals_block",
 *   admin_label = @Translation("Elasticsearch totals block"),
 * )
 */
class IndiciaEsTotalsBlock extends IndiciaBlockBase {

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
    \helper_base::add_resource('fontawesome');
    \helper_base::addLanguageStringsToJs('esTotalsBlock', [
      'speciesSingle' => '{1} species',
      'speciesMulti' => '{1} species',
      'occurrencesSingle' => '{1} record',
      'occurrencesMulti' => '{1} records',
      'photosSingle' => '{1} photo',
      'photosMulti' => '{1} photos',
      'recordersSingle' => '{1} recorder',
      'recordersMulti' => '{1} recorders',
    ]);
    $options = [
      'id' => 'src-IndiciaEsTotalsBlock-' . self::$blockCount,
      'size' => 0,
      'proxyCacheTimeout' => $config['cache_timeout'] ?? 300,
      'aggregation' => [
        'species_count' => [
          'cardinality' => [
            'field' => 'taxon.species_taxon_id',
          ],
        ],
        'photo_count' => [
          'nested' => ['path' => 'occurrence.media'],
        ],
        'recorder_count' => [
          'cardinality' => [
            'field' => 'event.recorded_by.keyword',
          ],
        ],
      ],
      'filterBoolClauses' => $this->getFilterBoolClauses($config),
    ];
    if (!empty($config['limit_to_user'])) {
      $recordersDiv = '';
    }
    else {
      $recordersDiv = '<div><div class="count recorders"><i class="fas fa-user-friends"></i></div></div>';
    }
    $r = \ElasticsearchReportHelper::source($options);
    $template = <<<HTML
<div id="indicia-es-totals-block-container">
  <div><div class="count occurrences"><i class="fas fa-map-marker-alt"></i></div></div>
  <div><div class="count species"><i class="fas fa-sitemap"></i></div></div>
  <div><div class="count photos"><i class="fas fa-camera"></i></div></div>
  $recordersDiv
</div>

HTML;
    $r .= \ElasticsearchReportHelper::customScript([
      'id' => 'indicia-es-totals-block-' . self::$blockCount,
      'source' => 'src-IndiciaEsTotalsBlock-' . self::$blockCount,
      'functionName' => 'handleEsTotalsResponse',
      'template' => $template,
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
    ];
  }

}
