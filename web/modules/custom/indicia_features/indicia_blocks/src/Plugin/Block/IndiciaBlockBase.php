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

}
