<?php

namespace Drupal\content_entity_builder\Plugin\BaseFieldConfig;

use Drupal\Component\Render\FormattableMarkup;
use Drupal\content_entity_builder\Annotation\BaseFieldConfig;
use Drupal\content_entity_builder\ConfigurableBaseFieldConfigBase;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Form\FormStateInterface;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeFieldItemList;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItem;

/**
 * DateTimeItemBaseFieldConfig
 *
 * @BaseFieldConfig(
 *   id = "datetime_base_field_config",
 *   label = @Translation("Date"),
 *   description = @Translation("Create and store date values."),
 *   field_type = "datetime",
 * )
 */
class DateTimeItemBaseFieldConfig extends ConfigurableBaseFieldConfigBase {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return ['datetime_type' => DateTimeItem::DATETIME_TYPE_DATETIME];
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $has_data = $form_state->getValue('has_data');
    $form['datetime_type'] = [
      '#type' => 'select',
      '#title' => t('Date type'),
      '#description' => t('Choose the type of date to create.'),
      '#default_value' => $this->configuration['datetime_type'],
      '#options' => [
        DateTimeItem::DATETIME_TYPE_DATETIME => t('Date and time'),
        DateTimeItem::DATETIME_TYPE_DATE => t('Date only'),
      ],
      '#disabled' => $has_data,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    parent::submitConfigurationForm($form, $form_state);
    $this->configuration['datetime_type'] = $form_state->getValue('datetime_type');
  }

  /**
   * {@inheritdoc}
   */
  public function buildDefaultValueForm(array $form, FormStateInterface $form_state) {
    $default_value = $this->getDefaultValue();
    $form['value'] = [
      '#type' => 'container',
      '#tree' => TRUE,
    ];
    $form['value']['default_date_type'] = [
      '#type' => 'select',
      '#title' => t('Default date'),
      '#description' => t('Set a default value for this date.'),
      '#default_value' => isset($default_value[0]['default_date_type']) ? $default_value[0]['default_date_type'] : '',
      '#options' => [
        DateTimeFieldItemList::DEFAULT_VALUE_NOW => t('Current date'),
        DateTimeFieldItemList::DEFAULT_VALUE_CUSTOM => t('Relative date'),
      ],
      '#empty_value' => '',
    ];
    $form['value']['default_date'] = [
      '#type' => 'textfield',
      '#title' => t('Relative default value'),
      '#description' => t("Describe a time by reference to the current day, like '+90 days' (90 days from the day the field is created) or '+1 Saturday' (the next Saturday). See <a href=\"http://php.net/manual/function.strtotime.php\">strtotime</a> for more details."),
      '#default_value' => (isset($default_value[0]['default_date_type']) && $default_value[0]['default_date_type'] == DateTimeFieldItemList::DEFAULT_VALUE_CUSTOM) ? $default_value[0]['default_date'] : '',
      '#states' => [
        'visible' => [
          ':input[id="edit-default-value-value-default-date-type"]' => ['value' => DateTimeFieldItemList::DEFAULT_VALUE_CUSTOM],
        ],
      ],
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateDefaultValueForm(array &$form, FormStateInterface $form_state) {
    if ($form_state->getValue(['value', 'default_date_type']) == DateTimeFieldItemList::DEFAULT_VALUE_CUSTOM) {
      $is_strtotime = @strtotime($form_state->getValue(['value', 'default_date']));
      if (!$is_strtotime) {
        $form_state->setErrorByName('value][default_date', t('The relative date value entered is invalid.'));
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitDefaultValueForm(array &$form, FormStateInterface $form_state) {
    $default_value = [];
    if ($form_state->getValue(['value', 'default_date_type'])) {
      if ($form_state->getValue(['value', 'default_date_type']) == DateTimeFieldItemList::DEFAULT_VALUE_NOW) {
        $form_state->setValueForElement($form['value']['default_date'], DateTimeFieldItemList::DEFAULT_VALUE_NOW);
      }
      $default_value = [$form_state->getValue('value')];
    }
    $this->setDefaultValue($default_value);
  }

  /**
   * {@inheritdoc}
   */
  public function buildBaseFieldDefinition() {
    $label = $this->getLabel();
    $weight = $this->getWeight();
    $default_value = $this->getDefaultValue() ?? [];
    $default_date = $default_value[0]['default_date'] ?? '';
    $required = $this->isRequired();
    $description = $this->getDescription();

    $base_field_definition = BaseFieldDefinition::create('datetime')
      ->setLabel($label)
      ->setDescription($description)
      ->setRequired($required)
      ->setDefaultValue($default_date)
      ->setSetting('datetime_type', $this->configuration['datetime_type'])
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'datetime_default',
        'weight' => $weight,
      ])
      ->setDisplayOptions('form', [
        'type' => 'datetime_default',
        'weight' => $weight,
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    return $base_field_definition;
  }

  /**
   * {@inheritdoc}
   */
  public function exportCode($translatable="FALSE", $revisionable="FALSE") {
$template = <<<Eof

    \$fields['@field_name'] = BaseFieldDefinition::create('datetime')
      ->setLabel(t('@label'))
      ->setDescription(t('@description'))
      ->setRevisionable(@revisionable)
      ->setTranslatable(@translatable)
      ->setRequired(@required)
      ->setDefaultValue(@default_value)
      ->setSetting('datetime_type', '@datetime_type')
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'datetime_default',
        'weight' => @weight,
      ])
      ->setDisplayOptions('form', [
        'type' => 'datetime_default',
        'weight' => @weight,
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

Eof;

    $default_value = $this->getDefaultValue() ?? [];
    $default_date = $default_value[0]['default_date'] ?? '';
    $ret = new FormattableMarkup($template, array(
      "@field_name" => $this->getFieldName(),
      "@label" => $this->getLabel(),
      "@description" => $this->getDescription(),
      "@default_value" => $default_date,
      "@required" => !empty($this->isRequired()) ? "TRUE" : "FALSE",
      "@weight" => $this->getWeight(),
      "@datetime_type" => $this->configuration['datetime_type'],
      "@translatable" => $translatable,
      "@revisionable" => $revisionable,
    ));

    return $ret;
  }

}
