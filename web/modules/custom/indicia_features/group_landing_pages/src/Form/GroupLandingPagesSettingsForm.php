<?php

namespace Drupal\group_landing_pages\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure settings for this module.
 */
class GroupLandingPagesSettingsForm extends ConfigFormBase {

  /**
   * Config settings.
   *
   * @var string
   */
  const SETTINGS = 'group_landing_pages.settings';

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'group_landing_pages_admin_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      static::SETTINGS,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config(static::SETTINGS);

    $form['group_label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Group label'),
      '#description' => $this->t('Label used for a standard group, e.g. project, activity, recording group.'),
      '#default_value' => $config->get('group_label') ?? 'group',
      '#required' => TRUE,
    ];

    $form['container_group_label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Container group label'),
      '#description' => $this->t('Label used for a container group that contains other sub-groups, e.g. project.'),
      '#default_value' => $config->get('container_group_label') ?? 'project',
      '#required' => TRUE,
    ];

    $form['contained_group_label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Contained group label'),
      '#description' => $this->t('Label used for a contained group that inherits from another parent group, e.g. project group.'),
      '#default_value' => $config->get('contained_group_label') ?? 'project group',
      '#required' => TRUE,
    ];

    $form['group_edit_alias'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Group edit alias'),
      '#description' => $this->t('Alias of the group edit page.'),
      '#default_value' => $config->get('group_edit_alias') ?? '/groups/edit',
      '#required' => TRUE,
    ];

    $form['species_details_alias'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Species details page alias'),
      '#description' => $this->t('Alias of the species details page.'),
      '#default_value' => $config->get('species_details_alias'),
      '#required' => TRUE,
    ];

    $form['species_details_within_group_alias'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Species details within group page alias'),
      '#description' => $this->t('Alias of the version of the species details page to be used when showing species data for a single group only.'),
      '#default_value' => $config->get('species_details_within_group_alias'),
      '#required' => TRUE,
    ];

    $form['logo_selector'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Logo selector'),
      '#description' => $this->t('CSS selector used to select the logo element in order to correctly place the group logo after it. The default provided should work with most themes, set to a blank string to disable addition of the group logo to the page.'),
      '#default_value' => $config->get('logo_selector') ?? '[rel="home"][class*=logo]',
      '#required' => FALSE,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // Retrieve the configuration.
    $this->config(static::SETTINGS)
      // Set the submitted configuration settings.
      ->set('group_label', $form_state->getValue('group_label'))
      ->set('container_group_label', $form_state->getValue('container_group_label'))
      ->set('contained_group_label', $form_state->getValue('contained_group_label'))
      ->set('group_edit_alias', $form_state->getValue('group_edit_alias'))
      ->set('species_details_alias', $form_state->getValue('species_details_alias'))
      ->set('species_details_within_group_alias', $form_state->getValue('species_details_within_group_alias'))
      ->set('logo_selector', $form_state->getValue('logo_selector'))
      ->save();

    parent::submitForm($form, $form_state);
  }

}
