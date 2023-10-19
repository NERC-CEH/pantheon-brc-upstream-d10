<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Render\Markup;
use Drupal\Core\Form\FormStateInterface;

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

    // Retrieve existing configuration for this block.
    $config = $this->getConfiguration();

    // Option to exclude sensitive records.
    $form['sensitive_records'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Include sensitive records'),
      '#description' => $this->t('Unless this box is ticked, sensitive records are completely excluded.'),
      '#default_value' => isset($config['sensitive_records']) ? $config['sensitive_records'] : 0,
    ];

    // Option to exclude unverified records.
    $form['unverified_records'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Include unverified records'),
      '#description' => $this->t('Unless this box is ticked, unverified (pending) records are completely excluded.'),
      '#default_value' => isset($config['unverified_records']) ? $config['unverified_records'] : 0,
    ];

    // Option to limit to current user.
    $form['limit_to_user'] = [
      '#type' => 'checkbox',
      '#title' => $this->t("Limit to current user's records"),
      '#description' => $this->t('If ticked, only records for the current user are shown.'),
      '#default_value' => isset($config['limit_to_user']) ? $config['limit_to_user'] : 0,
    ];

    $form['cache_timeout'] = [
      '#type' => 'number',
      '#title' => $this->t('Cache timeout'),
      '#description' => $this->t('Minimum number of seconds that the data request will be cached for, resulting in faster loads times.'),
      '#default_value' => isset($config['cache_timeout']) ? $config['cache_timeout'] : 300,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
    // Save our custom settings when the form is submitted.
    $this->setConfigurationValue('sensitive_records', $form_state->getValue('sensitive_records'));
    $this->setConfigurationValue('unverified_records', $form_state->getValue('unverified_records'));
    $this->setConfigurationValue('limit_to_user', $form_state->getValue('limit_to_user'));
    $this->setConfigurationValue('cache_timeout', $form_state->getValue('cache_timeout'));
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    iform_load_helpers(['ElasticsearchReportHelper']);
    $enabled = \ElasticsearchReportHelper::enableElasticsearchProxy();
    if (!$enabled) {
      global $indicia_templates;
      return [
        '#markup' => str_replace('{message}', $this->t('Service unavailable.'), $indicia_templates['warningBox']),
      ];
    }
    $config = $this->getConfiguration();
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
      'id' => 'src-IndiciaEsRecentRecordsBlock',
      'size' => 10,
      'proxyCacheTimeout' => isset($config['cache_timeout']) ? $config['cache_timeout'] : 300,
      'filterPath' => $filterPath,
      'initialMapBounds' => TRUE,
      'sort' => ['id' => 'desc'],
    ];
    $options['filterBoolClauses'] = ['must' => []];
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
    // Other record filters.
    if (empty($config['sensitive_records'])) {
      $options['filterBoolClauses']['must'][] = [
        'query_type' => 'term',
        'field' => 'metadata.sensitive',
        'value' => 'false',
      ];
    }
    if (empty($config['unverified_records'])) {
      $options['filterBoolClauses']['must'][] = [
        'query_type' => 'term',
        'field' => 'identification.verification_status',
        'value' => 'V',
      ];
    }
    if (!empty($config['limit_to_user'])) {
      $warehouseUserId = $this->getWarehouseUserId();
      if (empty($warehouseUserId)) {
        // Not linked to the warehouse so force report to be blank.
        $warehouseUserId = -9999;
      }
      $options['filterBoolClauses']['must'][] = [
        'query_type' => 'term',
        'field' => 'metadata.created_by_id',
        'value' => $warehouseUserId,
      ];
    }

    $r = \ElasticsearchReportHelper::source($options);
    // Totally exclude sensitive records.
    $r .= <<<HTML
<input type="hidden" class="es-filter-param" data-es-query-type="term" data-es-field="metadata.sensitive" data-es-bool-clause="must" value="false" />
HTML;
    $r .= \ElasticsearchReportHelper::customScript([
      'source' => 'src-IndiciaEsRecentRecordsBlock',
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
