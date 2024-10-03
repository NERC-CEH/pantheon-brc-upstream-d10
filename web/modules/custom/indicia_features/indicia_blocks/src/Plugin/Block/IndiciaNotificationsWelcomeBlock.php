<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Render\Markup;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'Notifications & Welcome Message' block.
 *
 * @Block(
 *   id = "indicia_notifications_welcome_block",
 *   admin_label = @Translation("Notifications & Welcome Message block"),
 * )
 */
class IndiciaNotificationsWelcomeBlock extends IndiciaBlockBase {

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);

    // Retrieve existing configuration for this block.
    $config = $this->getConfiguration();

    // Add a form field to the existing block configuration form.
    $form['notifications_page_path'] = [
      '#type' => 'textbox',
      '#title' => $this->t('Notifications page path'),
      '#description' => $this->t("Path to the page showing a user's notifications."),
      '#default_value' => isset($config['notifications_page_path']) ? $config['notifications_page_path'] : 'notifications',
    ];
    $form['taxon_meaning_id'] = [
      '#type' => 'number',
      '#title' => $this->t('Limit to taxon meaning ID'),
      '#description' => $this->t('If only notifications for a particular branch of taxa should be counted, insert the taxon_meaning_id of the higher taxon encapsulating the group here.'),
      '#default_value' => isset($config['taxon_meaning_id']) ? $config['taxon_meaning_id'] : NULL,
    ];
    $form['taxon_group_id'] = [
      '#type' => 'number',
      '#title' => $this->t('Limit to taxon group ID'),
      '#description' => $this->t('If only notifications for a particular group of taxa should be counted, insert the taxon_group_id here.'),
      '#default_value' => isset($config['taxon_group_id']) ? $config['taxon_group_id'] : NULL,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
    // Save our custom settings when the form is submitted.
    $this->setConfigurationValue('notifications_page_path', $form_state->getValue('notifications_page_path'));
    $this->setConfigurationValue('taxon_meaning_id', $form_state->getValue('taxon_meaning_id'));
    $this->setConfigurationValue('taxon_group_id', $form_state->getValue('taxon_group_id'));
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $r = '';
    iform_load_helpers(['report_helper']);
    $connection = iform_get_connection_details();
    $userId = hostsite_get_user_field('indicia_user_id');
    if (empty($connection['website_id']) || empty($connection['password'])) {
      $this->messenger()->addWarning('Indicia configuration incomplete.');
    }
    elseif ($userId) {
      $readAuth = \report_helper::get_read_auth($connection['website_id'], $connection['password']);
      $name = $this->getUserDisplayName();
      $notificationsCount = $this->getNotificationsCount($userId, $readAuth, $connection['website_id']);
      $message = $this->getWelcomeMessage($name, $notificationsCount);
      // @todo Theme function for the following.
      // @todo Configurable notifications link.
      $r = <<<HTML
<div class="alert alert-info alert-dismissible fade in" id="indicia-notifications-welcome-block-container" >
  <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
  $message
</div>
HTML;
    }
    return [
      '#markup' => Markup::create($r),
      '#attached' => [
        'library' => [
          'indicia_blocks/es-blocks',
        ],
      ],
      // Rely on Indicia caching, otherwise our JS not injected onto page.
      '#cache' => ['max-age' => 0],
    ];
  }

  /**
   * Make a data services request to find the user's notifications count.
   *
   * @param int $userId
   *   Warehouse user ID.
   * @param array $readAuth
   *   Authorisation tokens.
   * @param int $websiteId
   *   ID of the current website.
   *
   * @return int
   *   Count of unread notifications.
   */
  private function getNotificationsCount($userId, array $readAuth, $websiteId) {
    $config = $this->getConfiguration();
    $params = [
      'user_id' => $userId,
      'source_filter' => 'all',
      'system_name' => '',
      'default_edit_page_path' => '',
      'view_record_page_path' => '',
      'website_id' => $websiteId,
      'training' => hostsite_get_user_field('training') === TRUE ? 'true' : 'false',
      'wantRecords' => 0,
      'wantCount' => 1,
    ];
    // Flag to track if we can get away with the simple version of the report
    // which can't filter on occurrence data.
    $simple = !hostsite_get_user_field('training');
    if (!empty($config['taxon_meaning_id'])) {
      $params['taxon_meaning_id'] = $config['taxon_meaning_id'];
      $simple = FALSE;
    }
    if (!empty($config['taxon_group_id'])) {
      $params['taxon_group_id'] = $config['taxon_group_id'];
      $simple = FALSE;
    }
    $data = \report_helper::get_report_data([
      'dataSource' => 'library/notifications/notifications_list_for_notifications_centre' . ($simple ? '_simple' : ''),
      'readAuth' => $readAuth,
      'extraParams' => $params,
    ]);
    return $data['count'];
  }

  /**
   * Builds a welcome message string including notifications link.
   *
   * @param string $name
   *   User display name.
   * @param int $notificationsCount
   *   Count of unread notifications.
   *
   * @return string
   *   HTML for the message and notifications link if relevant.
   */
  private function getWelcomeMessage($name, $notificationsCount) {
    $message = $this->t('Welcome back @name.', ['@name' => $name]);
    if ($notificationsCount) {
      $config = $this->getConfiguration();
      $link = empty($config['notifications_page_path']) ? 'notifications' : $config['notifications_page_path'];
      $siteRoot = \Drupal::urlGenerator()->generateFromRoute('<front>', [], ['absolute' => TRUE]);
      $notificationsInfo = $notificationsCount === 1 ? $this->t("You have 1 unread notification.") : $this->t("You have @count unread notifications.", ['@count' => $notificationsCount]);
      $message = "<i class=\"fas fa-envelope\"></i> $message <a href=\"$siteRoot$link\" class=\"alert-link\">$notificationsInfo</a>";
    }
    return $message;
  }

  /**
   * Returns a friendly display label for the logged in user.
   *
   * @return string
   *   Either their first name, or their Drupal display name.
   */
  private function getUserDisplayName() {
    hostsite_get_user_field('first_name');
    if (empty($name)) {
      // Fallback on username.
      $name = hostsite_get_user_field('name');
    }
    return $name;
  }

}
