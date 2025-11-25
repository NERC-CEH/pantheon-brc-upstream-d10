<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;

/**
 * Provides an 'Elasticsearch species table' block.
 *
 * @Block(
 *   id = "es_species_table_block",
 *   admin_label = @Translation("Elasticsearch species table block"),
 * )
 */
class IndiciaEsSpeciesTableBlock extends IndiciaBlockBase {

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);
    $this->addDefaultEsFilterFormCtrls($form);
    // Retrieve existing configuration for this block.
    $config = $this->getConfiguration();
    // Add a species details page path control.
    $form['species_details_path'] = [
      '#type' => 'text',
      '#title' => $this->t('Species details page path'),
      '#description' => $this->t('Path to the species details page, allowing link icons to be added to each row in the table.'),
      '#default_value' => $config['species_details_path'] ?? '',
    ];
    $form['species_details_within_group_path'] = [
      '#type' => 'text',
      '#title' => $this->t('Species details within group page path'),
      '#description' => $this->t('Path of the version of the species details page to be used when showing species data for a single group only.'),
      '#default_value' => $config['species_details_within_group_path'] ?? '',
    ];
    // Add a limit control.
    $form['limit'] = [
      '#type' => 'number',
      '#title' => $this->t('Number of species'),
      '#description' => $this->t('Limit the report to this number of species.'),
      '#default_value' => $config['limit'] ?? 30,
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
    $this->saveDefaultEsFilterFormCtrls($form_state);
    $this->setConfigurationValue('species_details_path', $form_state->getValue('species_details_path'));
    $this->setConfigurationValue('species_details_within_group_path', $form_state->getValue('species_details_within_group_path'));
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
      'limit' => 30,
    ], $this->getConfiguration());

    $r = \ElasticsearchReportHelper::source([
      'id' => 'speciesTableSource-' . self::$blockCount,
      'mode' => 'termAggregation',
      'size' => $config['limit'],
      'shardSize' => $config['limit'] * 10,
      'sort' => ['doc_count' => 'desc'],
      'uniqueField' => 'taxon.accepted_taxon_id',
      'fields' => [
        'taxon.kingdom',
        'taxon.order',
        'taxon.family',
        'taxon.group',
        'taxon.accepted_name',
        'taxon.vernacular_name',
        'taxon.taxon_meaning_id',
      ],
      'proxyCacheTimeout' => $config['cache_timeout'] ?? 300,
      'aggregation' => [
        'first_date' => [
          'min' => [
            'field' => 'event.date_start',
            'format' => 'dd/MM/yyyy',
          ],
        ],
        'last_date' => [
          'max' => [
            'field' => 'event.date_start',
            'format' => 'dd/MM/yyyy',
          ],
        ],
      ],
      'filterBoolClauses' => $this->getFilterBoolClauses($config),
    ]);
    $gridOptions = [
      'id' => 'speciesTable-' . self::$blockCount,
      'source' => 'speciesTableSource-' . self::$blockCount,
      'columns' => [
        ['caption' => 'Accepted name', 'field' => 'taxon.accepted_name'],
        ['caption' => 'Common name', 'field' => 'taxon.vernacular_name'],
        ['caption' => 'Group', 'field' => 'taxon.group'],
        ['caption' => 'Kingdom', 'field' => 'taxon.kingdom'],
        ['caption' => 'Order', 'field' => 'taxon.order'],
        ['caption' => 'Family', 'field' => 'taxon.family'],
        ['caption' => 'No. of records', 'field' => 'doc_count'],
        ['caption' => 'First record', 'field' => 'first_date'],
        ['caption' => 'Last record', 'field' => 'last_date'],
      ],
      'actions' => [],
    ];
    // If in the context of a group landing page can link to a species details
    // page limited to the group's data.
    if (!empty(\helper_base::$indiciaData['group']) && !empty($config['species_details_within_group_alias'])) {
      $gridOptions['actions'][] = [
        'iconClass' => 'far fa-file-invoice',
        'path' => '{rootFolder}' . ltrim($config['species_details_within_group_alias'], '/'),
        'title' => $this->t('View species details based on group data only (right click for option to open in new tab).'),
        'urlParams' => [
          'taxon_meaning_id' => '[taxon.taxon_meaning_id]',
          'group_id' => \helper_base::$indiciaData['group']['id'],
          'implicit' => (string) \helper_base::$indiciaData['group']['implicit_record_inclusion'],
        ],
      ];
    }
    if (!empty($config['species_details_alias'])) {
      $gridOptions['actions'][] = [
        'iconClass' => 'far fa-file-alt',
        'path' => '{rootFolder}' . ltrim($config['species_details_alias'], '/'),
        'title' => $this->t('View species details (right click for option to open in new tab).'),
        'urlParams' => [
          'taxon_meaning_id' => '[taxon.taxon_meaning_id]',
        ],
      ];
    }
    $r .= \ElasticsearchReportHelper::dataGrid($gridOptions);
    if (\Drupal::currentUser()->isAuthenticated()) {
      $r .= \ElasticsearchReportHelper::download([
        'linkToDataControl' => 'speciesTable-' . self::$blockCount,
        'caption' => 'Download species data',
        'sort' => [
          'taxon.kingdom' => 'asc',
          'taxon.order' => 'asc',
          'taxon.family' => 'asc',
          'taxon.accepted_name' => 'asc',
        ],
      ]);
    }
    return [
      '#markup' => Markup::create($r),
      '#attached' => [
        'library' => [
          'indicia_blocks/es-blocks',
        ],
      ],
      // Rely on Indicia caching, otherwise our JS not injected onto page.
      '#cache' => ['max-age' => 0],
      // Disable BigPipe so that the element exists before the datasource loads.
      '#create_placeholder' => FALSE,
    ];
  }

}
