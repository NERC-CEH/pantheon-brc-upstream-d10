<?php

namespace Drupal\locations_shp_importer\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Location SHP importer settings form.
 */
class SettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'locations_shp_importer_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'locations_shp_importer.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('locations_shp_importer.settings');
    $form = [];
    $form['location_type_terms'] = [
      '#title' => $this->t('Allowed location types'),
      '#type' => 'textarea',
      '#description' => $this->t('If you want to limit the available location types that locations can be imported into, specify the terms here, one per line.'),
      '#default_value' => $config->get('location_type_terms'),
    ];
    $form['existing_options'] = [
      '#title' => $this->t('Available options for duplicate handling'),
      '#type' => 'checkboxes',
      '#options' => [
        'ignore_new' => $this->t('Ignore the new location.'),
        'update_boundary' => $this->t('Update the existing location with the imported location boundary.'),
        'always_new' => $this->t('Always treat the imported location as new, giving it a unique name.'),
      ],
      '#default_value' => $config->get('existing_options'),
      '#required' => TRUE,
    ];
    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Submit'),
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('locations_shp_importer.settings');
    $values = $form_state->getValues();
    $config->set('location_type_terms', $values['location_type_terms']);
    $config->set('existing_options', $values['existing_options']);
    $config->save();
    $this->messenger()->addMessage($this->t('The settings have been saved.'));
  }

}
