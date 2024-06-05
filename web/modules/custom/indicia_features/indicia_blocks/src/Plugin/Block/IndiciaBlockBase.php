<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\user\UserInterface;

/**
 * Base class for providing Indicia blocks with permissions.
 */
abstract class IndiciaBlockBase extends BlockBase {

  /**
   * Count blocks added, so unique IDs can be generated.
   *
   * @var int
   */
  protected static $blockCount = 0;

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);

    // Retrieve existing configuration for this block.
    $config = $this->getConfiguration();

    // Add a form field to the existing block configuration form.
    $form['view_permission'] = [
      '#type' => 'textfield',
      '#title' => $this->t('View permission'),
      '#description' => $this->t('Set to the name of an existing permission that is required to view the block content, or leave blank to make the block content publicly accessible.'),
      '#default_value' => isset($config['view_permission']) ? $config['view_permission'] : '',
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    // Save our custom settings when the form is submitted.
    $this->setConfigurationValue('view_permission', trim($form_state->getValue('view_permission')));
  }

  /**
   * {@inheritdoc}
   */
  public function blockAccess(AccountInterface $account) {
    $config = $this->getConfiguration();
    if (!empty($config['view_permission'])) {
      return AccessResult::allowedIfHasPermission($account, $config['view_permission']);
    }
    else {
      return AccessResult::allowed();
    }
  }

  /**
   * Returns the warehouse user ID to filter a block's data to.
   *
   * The returned ID is either the current user's, or if on a profile view
   * page then the ID of the viewed user is returned.
   *
   * @return int
   *   Warehouse user ID.
   */
  protected function getWarehouseUserId() {
    $profileUser = \Drupal::routeMatch()->getParameter('user');
    if ($profileUser instanceof UserInterface) {
      // On a profile view page, so use the profile being viewed.
      return $profileUser->field_indicia_user_id->value;
    }
    else {
      // For other pages, use the current user.
      return hostsite_get_user_field('indicia_user_id');
    }
  }

  protected function addDefaultEsFilterFormCtrls(&$form) {
    // Retrieve existing configuration for this block.
    $config = $this->getConfiguration();

    // Option to exclude sensitive records.
    $form['sensitive_records'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Include sensitive records'),
      '#description' => $this->t('Unless this box is ticked, sensitive records are completely excluded.'),
      '#default_value' => $config['sensitive_records'] ?? 0,
    ];

    // Option to exclude unverified records.
    $form['unverified_records'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Include unverified records'),
      '#description' => $this->t('Unless this box is ticked, unverified (pending) records are completely excluded.'),
      '#default_value' => $config['unverified_records'] ?? 0,
    ];

    // Option to limit to current user.
    $form['limit_to_user'] = [
      '#type' => 'checkbox',
      '#title' => $this->t("Limit to current user's records"),
      '#description' => $this->t('If ticked, only records for the current user are shown.'),
      '#default_value' => $config['limit_to_user'] ?? 0,
    ];

    // Option to limit to current website (exclude shared records).
    $form['limit_to_website'] = [
      '#type' => 'checkbox',
      '#title' => $this->t("Limit to current website's records"),
      '#description' => $this->t('If ticked, only records for the current website are shown and records shared from other websites are hidden.'),
      '#default_value' => $config['limit_to_website'] ?? 0,
    ];

    $form['cache_timeout'] = [
      '#type' => 'number',
      '#title' => $this->t('Cache timeout'),
      '#description' => $this->t('Minimum number of seconds that the data request will be cached for, resulting in faster loads times.'),
      '#default_value' => $config['cache_timeout'] ?? 300,
    ];
  }

  protected function saveDefaultEsFilterFormCtrls($form_state) {
    // Save our custom settings when the form is submitted.
    $this->setConfigurationValue('sensitive_records', $form_state->getValue('sensitive_records'));
    $this->setConfigurationValue('unverified_records', $form_state->getValue('unverified_records'));
    $this->setConfigurationValue('limit_to_user', $form_state->getValue('limit_to_user'));
    $this->setConfigurationValue('limit_to_website', $form_state->getValue('limit_to_website'));
    $this->setConfigurationValue('cache_timeout', $form_state->getValue('cache_timeout'));
  }

  protected function getFilterBoolClauses($config) {
    $clauses = [];
    // Other record filters.
    if (empty($config['sensitive_records'])) {
      $clauses[] = [
        'query_type' => 'term',
        'field' => 'metadata.sensitive',
        'value' => 'false',
      ];
    }
    if (empty($config['unverified_records'])) {
      $clauses[] = [
        'query_type' => 'term',
        'field' => 'identification.verification_status',
        'value' => 'V',
      ];
    }
    if (!empty($config['limit_to_user'])) {
      $warehouseUserId = $this->getWarehouseUserId();
      if (empty($warehouseUserId)) {
        // Not linked to the warehouse so force report to be blank.
        $warehouseUserId = -9999;
      }
      $clauses[] = [
        'query_type' => 'term',
        'field' => 'metadata.created_by_id',
        'value' => $warehouseUserId,
      ];
    }
    if (!empty($config['limit_to_website'])) {
      $connection = iform_get_connection_details();
      $clauses[] = [
        'query_type' => 'term',
        'field' => 'metadata.website.id',
        'value' => $connection['website_id'],
      ];
    }
    return $clauses;
  }

}
