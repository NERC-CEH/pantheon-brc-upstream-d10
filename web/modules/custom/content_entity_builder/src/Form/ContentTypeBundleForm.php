<?php

namespace Drupal\content_entity_builder\Form;

use Drupal\Core\Entity\BundleEntityFormBase;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * The content_type_bundle entity form.
 *
 * @internal
 */
class ContentTypeBundleForm extends BundleEntityFormBase {

  /**
   * {@inheritdoc}
   */
  public function form(array $form, FormStateInterface $form_state) {
    $form = parent::form($form, $form_state);

    $entity = $this->entity;

    if ($this->operation == 'add') {
      $form['#title'] = $this->t('Add custom bundle');
    }
    else {
      $form['#title'] = $this->t('Edit %label custom bundle', ['%label' => $entity->label()]);
    }

    $form['label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Label'),
      '#maxlength' => 255,
      '#default_value' => $entity->label(),
      '#description' => $this->t("Provide a label for this bundle to help identify it in the administration pages."),
      '#required' => TRUE,
    ];
    $form['id'] = [
      '#type' => 'machine_name',
      '#default_value' => $entity->id(),
      '#machine_name' => [
        //'exists' => '\Drupal\content_entity_builder\Entity\ContentTypeBundle::load',
		'exists' => [$this,'exists'],
      ],
      '#maxlength' => EntityTypeInterface::BUNDLE_MAX_LENGTH,
    ];

    $form['description'] = [
      '#type' => 'textarea',
      '#default_value' => $entity->getDescription(),
      '#description' => $this->t('Enter a description for this bundle.'),
      '#title' => $this->t('Description'),
    ];
	
    $form['content_type'] = [
      '#type' => 'textfield',
      '#default_value' => $entity->getEntityType()->getBundleOf(),
      '#description' => $this->t('Content entity type that this bundle used.'),
      '#title' => $this->t('Content entity type'),
	  '#disabled' => TRUE,
    ];	

    $form['actions'] = ['#type' => 'actions'];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save'),
    ];

    return $this->protectBundleIdElement($form);
  }
  
  /**
   * {@inheritdoc}
   */
  public function exists($id) {
	$bundle_type = $this->entity->getEntityType()->getBundleOf() . '_type'; 
    $bundle = \Drupal::entityTypeManager()->getStorage($bundle_type)->load($id);
    return 	$bundle;
  }	  

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
    $entity = $this->entity;
    $entity->setContentType($form_state->getValue('content_type'));
    $status = $entity->save();

    $edit_link = $this->entity->toLink($this->t('Edit'), 'edit-form')->toString();
    $logger = $this->logger('content_entity_builder');
    if ($status == SAVED_UPDATED) {
      $this->messenger()->addStatus($this->t('Custom bundle %label has been updated.', ['%label' => $entity->label()]));
      $logger->notice('Custom bundle %label has been updated.', ['%label' => $entity->label(), 'link' => $edit_link]);
    }
    else {
      $this->messenger()->addStatus($this->t('Custom bundle %label has been added.', ['%label' => $entity->label()]));
      $logger->notice('Custom bundle %label has been added.', ['%label' => $entity->label(), 'link' => $edit_link]);
    }

    $form_state->setRedirectUrl($this->entity->toUrl('collection'));
  }

}
