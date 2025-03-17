<?php

namespace Drupal\content_entity_builder\Form;

use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Form\FormStateInterface;

/**
 * Form controller for content edit forms.
 *
 * @ingroup content_entity_builder
 */
class ContentForm extends ContentEntityForm {

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildForm($form, $form_state);
    $form['actions']['#weight'] = 200;
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  protected function actions(array $form, FormStateInterface $form_state) {
    $element = parent::actions($form, $form_state);
    $entity = $this->entity;

    $account = \Drupal::currentUser();
    $type_id = $entity->getEntityTypeId();
    $element['delete']['#access'] = $account->hasPermission('edit any $type_id content entity');
    $element['delete']['#weight'] = 100;

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function submit(array $form, FormStateInterface $form_state) {
    // Build the entity object from the submitted values.
    parent::submitForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
    $entity = $this->entity;
    $status = $entity->save();

    switch ($status) {
      case SAVED_NEW:
        \Drupal::messenger()->addMessage($this->t('Created the %label content.', [
          '%label' => $entity->label(),
        ]));

        break;

      default:
        \Drupal::messenger()->addMessage($this->t('Saved the %label  content.', [
          '%label' => $entity->label(),
        ]));

    }
    $type = $entity->getEntityTypeId();
    $form_state->setRedirect("entity.$type.canonical", ["$type" => $entity->id()]);
  }

}
