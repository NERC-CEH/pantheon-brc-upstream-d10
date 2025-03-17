<?php

namespace Drupal\content_entity_builder\Entity;

use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\content_entity_builder\ContentInterface;

/**
 * Defines the Content entity.
 *
 * @ingroup content_entity_builder
 */
class Content extends ContentEntityBase implements ContentInterface {

  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {
    $fields = parent::baseFieldDefinitions($entity_type);
    $content_type = \Drupal::entityTypeManager()->getStorage('content_type')->load($entity_type->id());
    if(empty($content_type)) {
      return $fields;
    }

    foreach ($content_type->getBaseFields() as $base_field) {
      $field_name = $base_field->getFieldName();
      $fields[$field_name] = $base_field->buildBaseFieldDefinition();
    }

    return $fields;
  }

}
