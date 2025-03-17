<?php

namespace Drupal\content_entity_builder\Entity;

use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\Core\Entity\EntityPublishedInterface;
use Drupal\user\EntityOwnerInterface;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityPublishedTrait;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\user\EntityOwnerTrait;
use Drupal\content_entity_builder\ContentInterface;

/**
 * Defines the advanced Content entity.
 *
 * @ingroup content_entity_builder
 */
class AdvancedContent extends ContentEntityBase implements EntityChangedInterface, EntityOwnerInterface, EntityPublishedInterface, ContentInterface {

  use EntityChangedTrait;
  use EntityPublishedTrait;
  use EntityOwnerTrait;

  /**
   * {@inheritdoc}
   */
  public function preSave(EntityStorageInterface $storage) {
    parent::preSave($storage);

    foreach (array_keys($this->getTranslationLanguages()) as $langcode) {
      $translation = $this->getTranslation($langcode);

      // If no owner has been set explicitly, make the anonymous user the owner.
      if (!$translation->getOwner()) {
        $translation->setOwnerId(0);
      }
    }

  }
  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {
    $fields = parent::baseFieldDefinitions($entity_type);
	if(empty($entity_type)){
		return $fields;
	}	
    // Add the published field.
    $fields += static::publishedBaseFieldDefinitions($entity_type);
    $fields += static::ownerBaseFieldDefinitions($entity_type);
	
	$owner_key = $entity_type->getKey('owner');
    $fields[$owner_key]
      ->setLabel(t('Authored by'))
      ->setDescription(t('The username of the content author.'))
      ->setDisplayOptions('view', [
        'label' => 'hidden',
        'type' => 'author',
        'weight' => 0,
      ])
      ->setDisplayOptions('form', [
        'type' => 'entity_reference_autocomplete',
        'weight' => 5,
        'settings' => [
          'match_operator' => 'CONTAINS',
          'size' => '60',
          'placeholder' => '',
        ],
      ])
      ->setDisplayConfigurable('form', TRUE);

	$published_key = $entity_type->getKey('published');
    $fields[$published_key]
      ->setDisplayOptions('form', [
        'type' => 'boolean_checkbox',
        'settings' => [
          'display_label' => TRUE,
        ],
        'weight' => 120,
      ])
      ->setDisplayConfigurable('form', TRUE);

    $fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('Changed'))
      ->setDescription(t('The time that the content was last edited.'))
      ->setTranslatable(TRUE);
	
    $content_type = \Drupal::entityTypeManager()->getStorage('content_type')->load($entity_type->id());
    if(empty($content_type)) {
      return $fields;
    }

    foreach ($content_type->getBaseFields() as $base_field) {
      $field_name = $base_field->getFieldName();
      $fields[$field_name] = $base_field->buildBaseFieldDefinition();
      $fields[$field_name]
        ->setTranslatable(TRUE);	  
    }

    return $fields;
  }

}
