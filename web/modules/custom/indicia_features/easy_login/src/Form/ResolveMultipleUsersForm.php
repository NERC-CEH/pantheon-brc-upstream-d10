<?php

/**
 * @file
 * Contains \Drupal\iform\Form\SettingsForm.
 */

namespace Drupal\easy_login\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

class ResolveMultipleUsersForm extends FormBase {

  /**
   * {@inheritdoc}.
   */
  public function getFormId() {
    return 'easy_login_resolve_multiple_users_form';
  }

  /**
   * {@inheritdoc}.
   */
  public function buildForm(array $form, \Drupal\Core\Form\FormStateInterface $form_state) {
    $form = [];
    $userList = $_SESSION['multiple_users_to_resolve'];
    \Drupal::messenger()->addMessage($this->t('There appear to be several existing users on the central records database which may or may not be yours. They are users of the ' .
      'following websites. Please tick the ones which you agree you have been a user of then press Save.'));
    $websites = [];
    $config = \Drupal::config('indicia.settings');
    foreach ($userList as $user) {
      if ($user->website_id !== $config->get('website_id')) {
        $websites[$user->website_id] = $user->title;
      }
    }
    $form['website_list'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('List of websites you might be a user of:'),
    ];
    $form['website_list']['websites'] = [
      '#type' => 'checkboxes',
      '#options' => $websites,
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save'),
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $values = $form_state->getValues();
    $config = \Drupal::config('indicia.settings');
    $userList = $_SESSION['multiple_users_to_resolve'];
    $listToMerge = [];
    $tickedWebsites = [];
    foreach ($values['websites'] as $website_id => $ticked) {
      if ($ticked !== 0) {
        $tickedWebsites[] = $website_id;
      }
    }
    foreach ($userList as $user) {
      if ($user->website_id === $config->get('website_id', 0) || in_array($user->website_id, $tickedWebsites)) {
        $listToMerge[] = $user->user_id;
      }
    }
    $account = \Drupal\user\Entity\User::load($_SESSION['uid_to_resolve']);
    $response = easy_login_call_get_user_id($account, 'merge', $listToMerge);
    easy_login_handle_get_user_id_response($account, $response, TRUE);
    hostsite_goto_page('user/' . $account->id().'/edit');
  }

}