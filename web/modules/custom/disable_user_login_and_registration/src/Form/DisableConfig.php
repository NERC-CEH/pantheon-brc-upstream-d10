<?php

namespace Drupal\disable_user_login_and_registration\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\State\StateInterface;

/**
 * Configuration to disable/enable user login and registration.
 */
class DisableConfig extends Formbase {

  /**
   * The state store.
   *
   * @var \Drupal\Core\State\StateInterface
   */
  protected $state;

  /**
   * {@inheritdoc}
   */
  public function __construct(StateInterface $state) {
    $this->state = $state;
  }

   /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('state')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'disable_config_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['disable_user_register'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Disable user registraton'),
      '#default_value' => $this->state->get('disable_user_register', FALSE),
    ];
    $form['disable_user_login'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Disable user login'),
      '#default_value' => $this->state->get('disable_user_login', FALSE),
    ];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Submit'),
    ];
  
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->state->set('disable_user_register', $form_state->getValue('disable_user_register'));
    $this->state->set('disable_user_login', $form_state->getValue('disable_user_login'));
    drupal_flush_all_caches();
  }
}