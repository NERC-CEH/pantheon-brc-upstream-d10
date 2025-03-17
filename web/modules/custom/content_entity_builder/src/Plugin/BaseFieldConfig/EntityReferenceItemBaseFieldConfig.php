<?php

namespace Drupal\content_entity_builder\Plugin\BaseFieldConfig;

use Drupal\Core\Form\FormStateInterface;
use Drupal\content_entity_builder\ConfigurableBaseFieldConfigBase;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\ContentEntityTypeInterface;
use Drupal\Component\Render\FormattableMarkup;

/**
 * EntityReferenceItemBaseFieldConfig.
 *
 * @BaseFieldConfig(
 *   id = "entity_reference_base_field_config",
 *   label = @Translation("Entity reference"),
 *   description = @Translation("An entity field containing an entity reference."),
 *   field_type = "entity_reference",
 *   category = @Translation("Reference")
 * )
 */
class EntityReferenceItemBaseFieldConfig extends ConfigurableBaseFieldConfigBase {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'target_type' => '',
	  'target_bundles' => [],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $has_data = $form_state->getValue('has_data');
    $applied = $this->isApplied();
	
    $user_input = $form_state->getUserInput();
    $default_target_type = $user_input['settings']['target_type'] ?? $this->configuration['target_type'];
	//\Drupal::logger('content_entity_builder')->notice(var_export($this->configuration, true));
	
    $entity_types = \Drupal::entityTypeManager()->getDefinitions();
    $entity_type_options = [];
    foreach ($entity_types as $key => $entitytype) {
      if ($entitytype instanceof ContentEntityTypeInterface) {
        $entity_type_options[$key] = $entitytype->getLabel();
      }
    }
    $form['target_type'] = [
      '#type' => 'select',
      '#title' => $this->t('Entity Type'),
      '#options' => $entity_type_options,
      '#default_value' => $default_target_type,
      '#required' => TRUE,
      '#disabled' => $applied,
      '#ajax' => [
        'callback' => [$this, 'updateTargetBundles'],
        'wrapper' => 'edit-bundle-wrapper',
		'event' => 'change',
      ], 
    ];	
   // if(!empty($default_target_type)){
      $bundle_options = [];	
      $bundles = \Drupal::service('entity_type.bundle.info')->getBundleInfo($default_target_type);

	  foreach($bundles as $key=>$bundle){
	    //drupal_set_message(var_export($bundle, true));
	    $bundle_options[$key] = isset($bundle['label']) ? $bundle['label'] : $key;
	  }	
	  $form['target_bundles'] = [
	    '#type' => 'checkboxes',
	    '#title' => $this->t('Bundles'),
	    '#options' => $bundle_options,
	    '#default_value' => $this->configuration['target_bundles'] ?? [],
        '#prefix' => '<div id="edit-bundle-wrapper">',
        '#suffix' => '</div>',
        '#validated' => TRUE,		
	  ];
	//}	
    //}

    return $form;
  }
  
  /**
   * Handles switching the configuration type selector.
   */
  public function updateTargetBundles($form, FormStateInterface $form_state) {
    return $form['settings']['target_bundles'];
  }  

  /**
   * {@inheritdoc}
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    parent::submitConfigurationForm($form, $form_state);
    $this->configuration['target_type'] = $form_state->getValue('target_type');
	$target_bundles = $form_state->getValue('target_bundles');
	if(!empty($target_bundles)){
      $this->configuration['target_bundles'] = array_filter($target_bundles);
	}
	//$this->configuration['target_bundles'] = array_filter($form_state->getValue('target_bundles'));

	//\Drupal::logger('content_entity_builder')->notice(var_export($this->configuration, true));
  }

  /**
   * {@inheritdoc}
   */
  public function buildBaseFieldDefinition() {
    $field_type = $this->getFieldType();
    $label = $this->getLabel();
    $weight = $this->getWeight();
    $required = $this->isRequired();
    $description = $this->getDescription();

    $base_field_definition = BaseFieldDefinition::create($field_type)
      ->setLabel($label)
      ->setDescription($description)
      ->setRequired($required)
      ->setSetting('target_type', $this->configuration['target_type']??"node")
      ->setSetting('handler', 'default')
      ->setSetting('handler_settings', ['target_bundles' => $this->configuration['target_bundles']])
      ->setDisplayOptions('view', [
        'label' => 'hidden',
        'type' => 'entity_reference_label',
        'weight' => $weight,
      ])
      ->setDisplayOptions('form', [
        'type' => 'entity_reference_autocomplete',
        'weight' => $weight,
        'settings' => [
          'match_operator' => 'CONTAINS',
          'size' => '60',
          'autocomplete_type' => 'tags',
          'placeholder' => '',
        ],
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    return $base_field_definition;
  }

  /**
   * {@inheritdoc}
   */
  public function buildDefaultValueForm(array $form, FormStateInterface $form_state) {
    return NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function exportCode($translatable="FALSE", $revisionable="FALSE") {
  $template = <<<Eof

    \$fields['@field_name'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('@label'))
      ->setDescription(t('@description'))
      ->setRevisionable(@revisionable)
      ->setTranslatable(@translatable)
      ->setRequired(@required)
      ->setSetting('target_type', '@target_type')
      ->setSetting('handler', 'default')
      ->setSetting('handler_settings', ['target_bundles' => [@target_bundles]])
      ->setDisplayOptions('view', [
        'label' => 'hidden',
        'type' => 'entity_reference_label',
        'weight' => @weight,
      ])
      ->setDisplayOptions('form', [
        'type' => 'entity_reference_autocomplete',
        'weight' => @weight,
        'settings' => [
          'match_operator' => 'CONTAINS',
          'size' => '60',
          'autocomplete_type' => 'tags',
          'placeholder' => '',
        ],
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

Eof;

    $target_bundles = $this->configuration['target_bundles'];
	$target_bundles_str = "";
    foreach ($target_bundles as $target_bundle) {
        $target_bundles_str .= "'$target_bundle', ";
    }
	
    $ret = strtr($template, array(
      "@field_name" => $this->getFieldName(),
      "@label" => $this->getLabel(),
      "@description" => $this->getDescription(),
      "@required" => !empty($this->isRequired()) ? "TRUE" : "FALSE",
      "@target_type" => $this->configuration['target_type'],
      "@target_bundles" => $target_bundles_str,	  
      "@weight" => $this->getWeight(),
      "@translatable" => $translatable,
      "@revisionable" => $revisionable,	  
    ));
	
    return $ret;
  }

}
