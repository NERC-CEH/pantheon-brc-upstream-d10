<?php

namespace Drupal\show_email\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Plugin implementation of the 'show_email_address' formatter.
 *
 * @FieldFormatter(
 *   id = "show_email_address",
 *   label = @Translation("Show email address"),
 *   field_types = {
 *     "email"
 *   }
 * )
 */
class ShowEmailAddress extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'hide_per_role' => [],
      'hide_user_one' => 1,
      'email_mailto' => 0,
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = parent::settingsSummary();

    $user_one = $this->getSetting('hide_user_one');
    if (!empty($user_one)) {
      $summary[] = $this->t('User one is hidden.');
    }
    else {
      $summary[] = $this->t('User one is NOT hidden.');
    }
    $email_mailto = $this->getSetting('email_mailto');
    if (!empty($email_mailto)) {
      $summary[] = $this->t('Mailto is enabled.');
    }
    else {
      $summary[] = $this->t('Mailto is NOT enabled.');
    }

    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $settingsForm = parent::settingsForm($form, $form_state);

    $settingsForm['hide_user_one'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Hide user one'),
      '#default_value' => $this->getSetting('hide_user_one'),
      '#description' => $this->t('If selected user one will be hidden.'),
    ];

    // Load all roles.
    $roles = user_role_names(TRUE);
    $settingsForm['hide_per_role'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Hide per role'),
      '#default_value' => $this->getSetting('hide_per_role'),
      '#options' => $roles,
    ];

    $settingsForm['email_mailto'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable <i>mailto</i> link in the email address'),
      '#default_value' => $this->getSetting('email_mailto'),
    ];

    return $settingsForm;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];
    $user_one = $this->getSetting('hide_user_one');
    $hide_per_role = $this->getSetting('hide_per_role');
    $roles_to_hide = [];
    $i = 0;
    // Refactor the hidden roles array so I can compare with ::getRoles().
    foreach ($hide_per_role as $label) {
      $i++;
      if (!is_numeric($label)) {
        $roles_to_hide[$i] = $label;
      }
    }
    foreach ($items as $delta => $item) {
      // Load the user attached to this entity.
      $current_user = user_load_by_mail($item->value);

      // If this is userone and its selected be hidden then lets hide it.
      if (1 == $current_user->id() && 1 == $user_one) {
        $elements = [];
      }
      // Let's check if current user role is hidden so we take that action.
      elseif (count(array_intersect($roles_to_hide, $current_user->getRoles()))) {
        $elements = [];
      }
      else {
        $elements[$delta] = [
          '#markup' => (1 == $this->getSetting('email_mailto') ? '<a href=mailto:' . $item->value . '>' . $item->value . '</a>' : $item->value),
        ];
      }
    }

    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public static function isApplicable(FieldDefinitionInterface $field_definition) {
    // Check if this entity is user otherwise hide it.
    if ($field_definition->getTargetEntityTypeId() != 'user') {
      return FALSE;
    }
    // By default, formatters are available for all fields.
    return TRUE;
  }

}
