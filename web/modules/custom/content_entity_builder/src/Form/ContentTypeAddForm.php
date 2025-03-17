<?php

namespace Drupal\content_entity_builder\Form;

use Drupal\Core\Form\FormStateInterface;

/**
 * Controller for content entity type addition forms.
 */
class ContentTypeAddForm extends ContentTypeFormBase {

  /**
   * {@inheritdoc}
   */
  public function form(array $form, FormStateInterface $form_state) {
    $form = parent::form($form, $form_state);
	$mode_options = [
      'basic' => $this->t('Basic'),
      'basic_plus' => $this->t('Basic plus'),
      'advanced' => $this->t('Advanced'),
      'full' => $this->t('Full'),
	];
    $form['mode'] = [
      '#type' => 'select',
      '#title' => t('Mode'),
      '#default_value' => 'basic',
      '#options' => $mode_options,
	  '#description' => t('Basic: one entity type one db table, without bundles; Basic plus: basic plus bundles; Advanced: full enity type without revision; Full: full enity type like node.'),
      '#empty_option' => $this->t('Select a mode'),
      '#required' => TRUE,
    ];
    return $form;
  }
  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);
    $id = trim($form_state->getValue('id'));
    $entity_types = \Drupal::entityTypeManager()->getDefinitions();
    $schema = \Drupal::database()->schema();
    if (array_key_exists($id, $entity_types) || $schema->tableExists($id)) {
      $form_state->setErrorByName('id', $this->t("Invalid machine-readable name. Enter a name other than %invalid.", ['%invalid' => $id]));
    }

  }

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
    // Set default entity keys.
    $keys = [
      'id' => 'id',
      'uuid' => 'uuid',
    ];
    $this->entity->setEntityKeys($keys);
	$this->entity->setMode($form_state->getValue('mode'));
    parent::save($form, $form_state);
    \Drupal::messenger()->addMessage($this->t('Type %name was created.', ['%name' => $this->entity->label()]));

  }

  /**
   * {@inheritdoc}
   */
  public function actions(array $form, FormStateInterface $form_state) {
    $actions = parent::actions($form, $form_state);
    $actions['submit']['#value'] = $this->t('Create new types');

    return $actions;
  }

}
