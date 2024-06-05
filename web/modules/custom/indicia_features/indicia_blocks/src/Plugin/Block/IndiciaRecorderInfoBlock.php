<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Form\FormStateInterface;
use Drupal\user\Entity\User;
use Drupal\user\UserInterface;

/**
 * Provides a 'Recorder Info' block.
 *
 * Displays info about the recorder including username, full name, membership
 * etc, suitable for showing on their profile.
 *
 * @Block(
 *   id = "recorder_info_block",
 *   admin_label = @Translation("Recorder info block"),
 * )
 */
class IndiciaRecorderInfoBlock extends IndiciaBlockBase {

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);
    // Retrieve existing configuration for this block.
    $config = $this->getConfiguration();

    // Option to include username.
    $form['include_username'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Include username in the output'),
      '#description' => $this->t('Include the username in the output.'),
      '#default_value' => $config['include_username'] ?? 0,
    ];
    // Option to include full name.
    $form['include_full_name'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Include full name in the output'),
      '#description' => $this->t('Include the recorder full name in the output.'),
      '#default_value' => $config['include_full_name'] ?? 0,
    ];
    // Option to include member for.
    $form['include_member_since'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Include member since in the output'),
      '#description' => $this->t('Include the time the user has been a member since in the output.'),
      '#default_value' => $config['include_member_since'] ?? 0,
    ];
    // Option to include training.
    $form['include_training'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Include training flag in the output'),
      '#description' => $this->t('If the user is in training mode, show this in the output.'),
      '#default_value' => $config['include_training'] ?? 0,
    ];
    // Option to include verifier role info.
    $form['include_verifier_role_info'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Include verifier role info in the output'),
      '#description' => $this->t('For verifiers, include verifier role information in the output'),
      '#default_value' => $config['include_verifier_role_info'] ?? 0,
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
    $this->setConfigurationValue('include_username', $form_state->getValue('include_username'));
    $this->setConfigurationValue('include_full_name', $form_state->getValue('include_full_name'));
    $this->setConfigurationValue('include_member_since', $form_state->getValue('include_member_since'));
    $this->setConfigurationValue('include_training', $form_state->getValue('include_training'));
    $this->setConfigurationValue('include_verifier_role_info', $form_state->getValue('include_verifier_role_info'));
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    iform_load_helpers(['helper_base']);
    $data = [];
    $config = $this->getConfiguration();
    // Use the account if viewing a profile, else the current user.
    $account = \Drupal::routeMatch()->getParameter('user');
    if (!$account instanceof UserInterface) {
      $account = \Drupal::currentUser();
    }
    // Need fully loaded user account to access fields.
    $user = User::load($account->id());
    if ($config['include_username']) {
      $data['Username for log-in'] = $user->getDisplayName();
    }
    if ($config['include_full_name'] && !empty($user->field_last_name->value)) {
      $data['Name'] = empty($user->field_first_name->value) ? $user->field_last_name->value : $user->field_first_name->value . ' ' . $user->field_last_name->value;
    }
    if ($config['include_member_since']) {
      $data['Member since'] = date('d/m/Y', $user->getCreatedTime());
    }
    if ($config['include_training'] && isset($user->field_training) && $user->field_training->value === '1') {
      \helper_base::add_resource('fontawesome');
      $data['Training mode'] = '<i class="fas fa-check"></i>';
    }
    if ($config['include_verifier_role_info'] && ($user->hasRole('verifier') || $user->hasRole('verification'))) {
      $verificationFilters = $this->getVerificationFilters($user->field_indicia_user_id->value);
      if (count($verificationFilters) > 0) {
        $filterHtml = '<p>' . $this->t('This user verifies records in the following sets of data:') . '</p>';
        $filterHtml .= '<u><li>' . implode('</li><li>', $verificationFilters) . '</li></ul>';
        $data['Verification'] = $filterHtml;
      }
    }
    if (\Drupal::currentUser()->hasRole('administrator')) {
      $data['Indicia user ID'] = $user->field_indicia_user_id->value;
    }
    $build = [
      '#title' => 'Recorder info',
      '#theme' => 'recorder_info_block',
      '#data' => $data,
    ];
    return $build;

  }

  /**
   * Retrieve information on the user's verification context filters.
   *
   * @param [type] $userId
   *   User's warehouse ID.
   *
   * @return array
   *   List of filter names.
   */
  private function getVerificationFilters($userId) {
    iform_load_helpers(['report_helper']);
    $r = [];
    $connection = iform_get_connection_details();
    $readAuth = \report_helper::get_read_auth($connection['website_id'], $connection['password']);
    $filters = \report_helper::get_report_data([
      'dataSource' => 'library/filters/filters_list_minimal',
      'readAuth' => $readAuth,
      'caching' => TRUE,
      'extraParams' => [
        'filter_sharing_mode' => 'V',
        'defines_permissions' => 't',
        'filter_user_id' => $userId,
      ],
    ]);
    foreach ($filters as $filter) {
      $r[] = $filter['title'];
    }
    return $r;
  }

}
