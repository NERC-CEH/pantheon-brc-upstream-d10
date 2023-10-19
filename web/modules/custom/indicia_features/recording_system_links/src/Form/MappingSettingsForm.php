<?php

namespace Drupal\recording_system_links\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\recording_system_links\Utility\SqlLiteLookups;
use Drupal\Core\Url;

/**
 * A settings form for a lookup value mappings table.
 */
class MappingSettingsForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'recording_system_links_mapping_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $table = \Drupal::request()->query->get('table');
    $existing = !is_null($table);
    if ($existing) {
      $form['table_name'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Table name'),
        '#description' => $this->t('This table already exists so the name cannot be changed.'),
        '#default_value' => $table,
        '#disabled' => TRUE,
      ];
      $lookups = new SqlLiteLookups();
      $lookups->getDatabase();
      $form['count'] = [
        '#markup' => '<p class="alert alert-info">' . $this->t('This table has @count existing mappings.', ['@count' => $lookups->countMappings($table)]) . '</p>',
      ];
    }
    else {
      $form['table_name'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Table name'),
        '#description' => $this->t('Set the name of the mappings table to create.'),
        '#required' => TRUE,
      ];
    }
    $form['mappings_to_import'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Mappings to import'),
      '#description' => $this->t('Mappings from a value in the remote recording system to a value required by the warehouse (e.g. a mapping from remote species IDs to taxa_taxon_list IDs for the warehouse).'),
      '#required' => TRUE,
    ];
    $form['clear_mappings'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Clear existing mappings?'),
      '#description' => $this->t('Tick this box to replace the existing mappings, otherwise they will be appended.'),
    ];
    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save'),
    ];
    $form['cancel'] = [
      '#type' => 'link',
      '#title' => $this->t('Cancel'),
      '#href' => Url::fromRoute('recording_system_links.manage_mappings'),
      '#attributes' => [
        'class' => ['button'],
      ],
    ];
    // @todo Delete button
    return $form;
  }

  /**
   * Submit handler to save a mappings settings form.
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $formValues = $form_state->getValues();
    $lookups = new SqlLiteLookups();
    $lookups->getDatabase();
    $lookups->addLookupTable($formValues['table_name']);
    if ($formValues['clear_mappings']) {
      $lookups->clearMappings($formValues['table_name']);
    }
    $lookups->importMappings($formValues['table_name'], $formValues['mappings_to_import']);
    // Inform user and return to dashboard.
    // @todo Dependency injection for messenger.
    \Drupal::messenger()->addMessage($this->t('Mappings for %table have been saved', ['%table' => $formValues['table_name']]));
    $url = Url::fromRoute('recording_system_links.manage_mappings');
    $form_state->setRedirectUrl($url);
  }

}
