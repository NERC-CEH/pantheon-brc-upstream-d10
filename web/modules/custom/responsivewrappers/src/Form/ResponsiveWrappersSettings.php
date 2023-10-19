<?php

namespace Drupal\responsivewrappers\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure Responsive wrappers settings.
 */
class ResponsiveWrappersSettings extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'responsivewrappers_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['responsivewrappers.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('responsivewrappers.settings');

    $form['version'] = [
      '#type' => 'select',
      '#title' => $this->t('Bootstrap output version'),
      '#options' => [
        3 => $this->t('Bootstrap 3'),
        4 => $this->t('Bootstrap 4'),
        5 => $this->t('Bootstrap 5'),
        0 => $this->t('Custom'),
      ],
      '#default_value' => $config->get('version'),
      '#description' => $this->t('The HTML output for responsive images or tables has changed between Bootstrap 3 and Bootstrap 4/5. You can choose witch output version you want, for example bootstrap 3 uses img-responsive class and bootstrap 4/5 img-fluid.'),
    ];
    $form['add_css'] = [
      '#type' => 'select',
      '#title' => $this->t('Attach responsive wrappers CSS'),
      '#options' => [
        0 => $this->t('No'),
        1 => $this->t('Yes'),
      ],
      '#default_value' => $config->get('add_css'),
      '#description' => $this->t('This only adds the minimal CSS feature, not the full Bootstrap library. If you use a Bootstrap 3/4/5 theme or sub-theme, the responsive classes work without any additional CSS (set this value to "No"), otherwise you can use it to add the CSS styles needed to work.'),
    ];
    // Custom classes.
    $form['custom_classes'] = [
      '#type' => 'details',
      '#title' => $this->t('Custom classes'),
      '#description' => $this->t('Custom responsive classes. Choose "Custom" in bootstrap output version to change this custom classes.'),
    ];
    $form['custom_classes']['image_class'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Custom image class'),
      '#default_value' => $config->get('image_class'),
    ];
    $form['custom_classes']['iframe_wrapper_class'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Custom iframe wrapper class'),
      '#default_value' => $config->get('iframe_wrapper_class'),
    ];
    $form['custom_classes']['iframe_class'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Custom iframe class'),
      '#default_value' => $config->get('iframe_class'),
    ];
    $form['custom_classes']['table_wrapper_class'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Custom table wrapper class'),
      '#default_value' => $config->get('table_wrapper_class'),
    ];
    $form['custom_classes']['table_class'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Custom table class'),
      '#default_value' => $config->get('table_class'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $version = (int) $form_state->getValue('version');
    $add_css = (int) $form_state->getValue('add_css');

    // Bootstrap image classes.
    if (3 === $version) {
      $image_class = 'img-responsive';
    }
    elseif (4 === $version || 5 === $version) {
      $image_class = 'img-fluid';
    }
    else {
      $image_class = trim($form_state->getValue('image_class'));
    }

    // Bootstrap iframe classes.
    if ($version > 0) {
      $iframe_wrapper_class = 'embed-responsive embed-responsive-16by9';
      $iframe_class = 'embed-responsive-item';
    }
    else {
      $iframe_wrapper_class = trim($form_state->getValue('iframe_wrapper_class'));
      $iframe_class = trim($form_state->getValue('iframe_class'));
    }

    // Bootstrap table classes.
    if ($version > 0) {
      $table_wrapper_class = 'table-responsive';
      $table_class = 'table';
    }
    else {
      $table_wrapper_class = trim($form_state->getValue('table_wrapper_class'));
      $table_class = trim($form_state->getValue('table_class'));
    }

    $config = $this->config('responsivewrappers.settings');
    $config
      ->set('add_css', $add_css)
      ->set('version', $version)
      ->set('image_class', $image_class)
      ->set('iframe_wrapper_class', $iframe_wrapper_class)
      ->set('iframe_class', $iframe_class)
      ->set('table_wrapper_class', $table_wrapper_class)
      ->set('table_class', $table_class)
      ->save();

    parent::submitForm($form, $form_state);
  }

}
