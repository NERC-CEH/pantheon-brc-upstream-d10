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
    $location = hostsite_get_user_field('location');
    $groups = hostsite_get_user_field('taxon_groups', FALSE, TRUE);
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
    $options = [
      'id' => 'src-IndiciaEsRecentRecordsBlock-' . self::$blockCount,
      'size' => $config['limit'] ?? 10,
      'proxyCacheTimeout' => $config['cache_timeout'] ?? 300,
      'filterPath' => $filterPath,
      'initialMapBounds' => TRUE,
      'sort' => ['id' => 'desc'],
      'filterBoolClauses' => ['must' => $this->getFilterBoolClauses($config)],
    ];
    // Apply user profile preferences.
    if ($location || !empty($groups)) {
      if ($location) {
        $options['filterBoolClauses']['must'][] = [
          'query_type' => 'term',
          'nested' => 'location.higher_geography',
          'field' => 'location.higher_geography.id',
          'value' => $location,
        ];
      }
      if ($groups) {
        $options['filterBoolClauses']['must'][] = [
          'query_type' => 'terms',
          'field' => 'taxon.group_id',
          'value' => json_encode($groups),
        ];
      }
    }
    $r = \ElasticsearchReportHelper::source($options);
    // Totally exclude sensitive records.
    $r .= <<<HTML
<input type="hidden" class="es-filter-param" data-es-query-type="term" data-es-field="metadata.sensitive" data-es-bool-clause="must" value="false" />
HTML;
    $r .= \ElasticsearchReportHelper::customScript([
      'source' => 'src-IndiciaEsRecentRecordsBlock-' . self::$blockCount,
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
