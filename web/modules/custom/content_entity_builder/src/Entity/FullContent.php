<?php

namespace Drupal\content_entity_builder\Entity;

use Drupal\Core\Entity\EditorialContentEntityBase;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\user\EntityOwnerInterface;
use Drupal\user\EntityOwnerTrait;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\content_entity_builder\ContentInterface;

/**
 * Defines the advanced Content entity.
 *
 * @ingroup content_entity_builder
 */
class FullContent extends EditorialContentEntityBase implements EntityOwnerInterface, ContentInterface {

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
	
    // If no revision author has been set explicitly, make the node owner the
    // revision author.
    if (!$this->getRevisionUser()) {
      $this->setRevisionUserId($this->getOwnerId());
    }
  }
  
  /**
   * {@inheritdoc}
   */
  public function preSaveRevision(EntityStorageInterface $storage, \stdClass $record) {
    parent::preSaveRevision($storage, $record);

    if (!$this->isNewRevision() && isset($this->original) && (!isset($record->revision_log) || $record->revision_log === '')) {
      // If we are updating an existing block_content without adding a new
      // revision and the user did not supply a revision log, keep the existing
      // one.
      $record->revision_log = $this->original->getRevisionLogMessage();
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
    $fields += static::ownerBaseFieldDefinitions($entity_type);

	$owner_key = $entity_type->getKey('owner');	
    $fields[$owner_key]
      ->setLabel(t('Authored by'))
      ->setDescription(t('The username of the content author.'))
      ->setRevisionable(TRUE)
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
      ->setRevisionable(TRUE)
      ->setTranslatable(TRUE);
	
    $content_type = \Drupal::entityTypeManager()->getStorage('content_type')->load($entity_type->id());
    if(empty($content_type)) {
      return $fields;
    }

    foreach ($content_type->getBaseFields() as $base_field) {
      $field_name = $base_field->getFieldName();
      $fields[$field_name] = $base_field->buildBaseFieldDefinition();
	  
      $fields[$field_name]
	    ->setRevisionable(TRUE)
        ->setTranslatable(TRUE);	  
    }

    return $fields;
  }

}
