<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;

/**
 * Provides a 'Recent Elasticsearch photos' block.
 *
 * @Block(
 *   id = "es_recent_photos_block",
 *   admin_label = @Translation("Recent Elasticsearch photos block"),
 * )
 */
class IndiciaEsRecentPhotosBlock extends IndiciaBlockBase {

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
      '#default_value' => $config['limit'] ?? 6,
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
      'limit' => 6,
    ], $this->getConfiguration());
    $filterBoolClauses = $this->getFilterBoolClauses($config);
    $filterBoolClauses['must'][] = [
      'nested' => 'occurrence.media',
      'query_type' => 'exists',
      'field' => 'occurrence.media',
    ];
    $r = \ElasticsearchReportHelper::source([
      'id' => 'es-photos-' . self::$blockCount,
      'proxyCacheTimeout' => 1800,
      'filterBoolClauses' => $filterBoolClauses,
      'size' => $config['limit'] ?? 6,
      'sort' => ['metadata.created_on' => 'desc'],
    ]);
    $r .= \ElasticsearchReportHelper::cardGallery([
      'id' => 'recentPhotos-' . self::$blockCount,
      'class' => 'horizontal',
      'source' => 'es-photos-' . self::$blockCount,
      'columns' => [
        [
          'field' => '#taxon_label#',
        ],
      ],
      'includeFullScreenTool' => FALSE,
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
