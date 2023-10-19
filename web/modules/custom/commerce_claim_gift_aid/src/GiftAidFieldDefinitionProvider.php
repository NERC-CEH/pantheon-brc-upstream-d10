<?php

namespace Drupal\commerce_claim_gift_aid;

use Drupal\Core\Field\BaseFieldDefinition;

class GiftAidFieldDefinitionProvider {

  public static function getGiftAidField() {
    return BaseFieldDefinition::create('boolean')
      ->setName('gift_aid')
      ->setTargetEntityTypeId('commerce_order')
      ->setLabel(t('Order has gift aid'))
      ->setRevisionable(TRUE)
      ->setTranslatable(TRUE)
      ->setDisplayOptions('form', [
        'type' => 'boolean_checkbox',
        'settings' => [
          'display_label' => TRUE,
        ],
        'weight' => 5,
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDefaultValue(FALSE);
  }

}
