<?php

declare(strict_types=1);

namespace Drupal\languageicons\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Settings form for the Language Icons module.
 */
class LanguageiconsAdminSettings extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'languageicons_settings';
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('languageicons.settings');

    $config->set('show_node', $form_state->getValue('show_node'))
      ->set('show_node', $form_state->getValue('show_block'))
      ->set('placement', $form_state->getValue('placement'))
      ->set('size', $form_state->getValue('size'))
      ->set('path', $form_state->getValue('path'))
      ->save();

    parent::submitForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['languageicons.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['show'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Add language icons'),
      '#description' => $this->t('Link types to add language icons.'),
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
    ];
    $form['show']['show_node'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Node links'),
      '#default_value' => $this->config('languageicons.settings')
        ->get('show_node'),
      '#disabled' => TRUE,
    ];
    $form['show']['show_block'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Language switcher block'),
      '#default_value' => $this->config('languageicons.settings')
        ->get('show_block'),
      '#disabled' => TRUE,
    ];
    $form['show']['disabled'] = [
      '#prefix' => '<div class="messages error">',
      '#markup' => $this->t('These options are currently disabled due to <a href=":issue_url">a bug</a> that cannot currently be resolved. They may be reintroduced at a later stage.', [
        ':issue_url' => 'http://drupal.org/node/1005144',
      ]),
      '#suffix' => '</div>',
    ];
    $form['placement'] = [
      '#type' => 'radios',
      '#title' => $this->t('Icon placement'),
      '#options' => [
        'before' => $this->t('Before link'),
        'after' => $this->t('After link'),
        'replace' => $this->t('Replace link'),
      ],
      '#default_value' => $this->config('languageicons.settings')
        ->get('placement'),
      '#description' => $this->t('Where to display the icon, relative to the link title.'),
    ];
    $form['path'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Icons file path'),
      '#default_value' => $this->config('languageicons.settings')->get('path'),
      '#size' => 70,
      '#maxlength' => 180,
      '#description' => $this->t('Path for language icons, relative to Drupal installation. "*" is a placeholder for language code.'),
    ];
    $form['size'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Image size'),
      '#default_value' => $this->config('languageicons.settings')->get('size'),
      '#size' => 7,
      '#maxlength' => 7,
      '#description' => $this->t('Image size for language icons, in the form "width x height".'),
    ];

    return parent::buildForm($form, $form_state);
  }

}
