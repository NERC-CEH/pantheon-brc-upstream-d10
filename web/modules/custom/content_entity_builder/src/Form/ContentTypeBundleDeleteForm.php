<?php

namespace Drupal\content_entity_builder\Form;

use Drupal\Core\Entity\EntityDeleteForm;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a confirmation form for deleting a custom bundle entity.
 *
 * @internal
 */
class ContentTypeBundleDeleteForm extends EntityDeleteForm {

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $content_type = $this->entity->getEntityType()->getBundleOf();
    $content_count = $this->entityTypeManager->getStorage($content_type)->getQuery()
      ->accessCheck(FALSE)
      ->condition('type', $this->entity->id())
      ->count()
      ->execute();
    if ($content_count) {
      $caption = '<p>' . $this->formatPlural($content_count, '%label is used by 1 custom content on your site. You can not remove this bundle until you have removed all of the %label contents.', '%label is used by @count custom contents on your site. You may not remove %label until you have removed all of the %label custom contents.', ['%label' => $this->entity->label()]) . '</p>';
      $form['description'] = ['#markup' => $caption];
      return $form;
    }
    else {
      return parent::buildForm($form, $form_state);
    }
  }

}
