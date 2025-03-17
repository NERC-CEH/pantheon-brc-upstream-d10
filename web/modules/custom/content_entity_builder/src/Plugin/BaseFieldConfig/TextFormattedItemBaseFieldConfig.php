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
 *   id = "text_formatted_base_field_config",
 *   label = @Translation("Text (formatted, long)"),
 *   description = @Translation("A field containing a formatted text value."),
 *   field_type = "text_long",
 *   category = @Translation("Text")
 * )
 */
class TextFormattedItemBaseFieldConfig extends ConfigurableBaseFieldConfigBase {

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
        'type' => 'text_default',
        'weight' => $weight,
      ])
      ->setDisplayOptions('form', [
        'type' => 'text_textarea',
        'weight' => $weight,
	    //'#format' => $default_value['format'] ?? "basic_html",
        //'#default_value' => $default_value['value'] ?? "",		
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    return $base_field_definition;
  }

  /**
   * {@inheritdoc}
   */
  public function buildDefaultValueForm(array $form, FormStateInterface $form_state) {
	$default_value = $this->getDefaultValue();
    $form['value'] = [
      '#type' => 'text_format',
      '#title' => $this->getLabel(),
	  '#format' => $default_value['format'] ?? "basic_html",
      '#default_value' => $default_value['value'] ?? "",
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

    \$fields['@field_name'] = BaseFieldDefinition::create('text_long')
      ->setLabel(t('@label'))
      ->setDescription(t('@description'))
      ->setRevisionable(@revisionable)
      ->setTranslatable(@translatable)
      ->setRequired(@required)
      ->setDefaultValue([
	    'format' => '@default_format',
		'value' => '@default_value',
	  ])
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'text_fomatted',
        'weight' => @weight,
      ])
      ->setDisplayOptions('form', [
        'type' => 'text_format',
        'weight' => @weight,
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

Eof;

    $default_value = $this->getDefaultValue();
    $ret = strtr($template, array(
      "@field_name" => $this->getFieldName(),
      "@label" => $this->getLabel(),
      "@description" => $this->getDescription(),
      "@default_format" => $default_value['format'] ?? "basic_html",
      "@default_value" => $default_value['value'] ?? "",
      "@required" => !empty($this->isRequired()) ? "TRUE" : "FALSE",
      "@weight" => $this->getWeight(),
      "@translatable" => $translatable,
      "@revisionable" => $revisionable,
    ));

    return $ret;
  }

}
