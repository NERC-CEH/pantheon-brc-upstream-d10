<?php

namespace Drupal\content_entity_builder\Plugin\BaseFieldConfig;

use Drupal\Component\Render\FormattableMarkup;
use Drupal\Core\Form\FormStateInterface;
use Drupal\content_entity_builder\ConfigurableBaseFieldConfigBase;
use Drupal\Core\Field\BaseFieldDefinition;

/**
 * StringLongItemBaseFieldConfig.
 *
 * @BaseFieldConfig(
 *   id = "string_long_base_field_config",
 *   label = @Translation("Text (plain, long)"),
 *   description = @Translation("A field containing a long string value."),
 *   field_type = "string_long",
 *   category = @Translation("Text")
 * )
 */
class StringLongItemBaseFieldConfig extends ConfigurableBaseFieldConfigBase {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function buildBaseFieldDefinition() {
    $field_type = $this->getFieldType();
    $label = $this->getLabel();
    $weight = $this->getWeight();
    $default_value = $this->getDefaultValue();
    $required = $this->isRequired();
    $description = $this->getDescription();

    $base_field_definition = BaseFieldDefinition::create($field_type)
      ->setLabel($label)
      ->setDescription($description)
      ->setRequired($required)
      ->setDefaultValue($default_value)
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'basic_string',
        'weight' => $weight,
      ])
      ->setDisplayOptions('form', [
        'type' => 'string_textarea',
        'weight' => $weight,
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    return $base_field_definition;
  }

  /**
   * {@inheritdoc}
   */
  public function buildDefaultValueForm(array $form, FormStateInterface $form_state) {
    $form['value'] = [
      '#type' => 'textarea',
      '#title' => $this->getFieldName(),
      '#default_value' => $this->getDefaultValue(),
    ];


    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitDefaultValueForm(array &$form, FormStateInterface $form_state) {
    $this->setDefaultValue($form_state->getValue('value'));
  }

  /**
   * {@inheritdoc}
   */
  public function exportCode($translatable="FALSE", $revisionable="FALSE") {
  $template = <<<Eof

    \$fields['@field_name'] = BaseFieldDefinition::create('string_long')
      ->setLabel(t('@label'))
      ->setDescription(t('@description'))
      ->setRevisionable(@revisionable)
      ->setTranslatable(@translatable)
      ->setRequired(@required)
      ->setDefaultValue('@default_value')
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'basic_string',
        'weight' => @weight,
      ])
      ->setDisplayOptions('form', [
        'type' => 'string_textarea',
        'weight' => @weight,
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

Eof;

    $ret = strtr($template, array(
      "@field_name" => $this->getFieldName(),
      "@label" => $this->getLabel(),
      "@description" => $this->getDescription(),
	  "@default_value" => $this->getDefaultValue(),
      "@required" => !empty($this->isRequired()) ? "TRUE" : "FALSE",
      "@weight" => $this->getWeight(),
      "@translatable" => $translatable,
      "@revisionable" => $revisionable,
    ));
	
    return $ret;
  }

}
