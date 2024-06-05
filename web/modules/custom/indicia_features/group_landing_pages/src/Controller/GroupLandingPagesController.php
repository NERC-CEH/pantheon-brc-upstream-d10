<?php

namespace Drupal\group_landing_pages\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\Markup;

class GroupLandingPagesController extends ControllerBase {

  /**
   * Controller which renders a group landing page.
   *
   * @todo Group blog
   */
  public function groupHome($title) {
    $groups = $this->getGroupFromTitle($title);
    if (count($groups) !== 1) {
      $this->messenger()->addWarning($this->t('The link you have followed does not refer to a unique group name.'));
      hostsite_goto_page('<front>');
      return [];
    }
    $group = $groups[0];
    \iform_load_helpers(['data_entry_helper', 'ElasticsearchReportHelper']);
    $conn = iform_get_connection_details();
    $readAuth = \helper_base::get_read_auth($conn['website_id'], $conn['password']);
    \ElasticsearchReportHelper::groupIntegration([
      'group_id' => $group['id'],
      'implicit' => $group['implicit_record_inclusion'],
      'readAuth' => $readAuth,
    ], FALSE);
    $member = group_authorise_group_id($group['id'], $readAuth, FALSE);
    // Build array points to the twig template via a theme hook, plus supplies
    // some variables.
    $build = [
      '#group_id' => $group['id'],
      '#title' => $group['title'],
      '#theme' => 'group_landing_page',
      '#description' => $group['description'],
      '#group_type' => $group['group_type_term'],
      '#implicit_record_inclusion' => $group['implicit_record_inclusion'],
      '#member' => $member,
    ];
    return $build;
  }

  /**
   * Find the groups that match the title in the URL.
   *
   * @param string $title
   *   Title in URL format.
   *
   * @return array
   *   List of groups that match, hopefully just 1.
   */
  private function getGroupFromTitle($title) {
    iform_load_helpers(['report_helper']);
    $config = \Drupal::config('iform.settings');
    $auth = \report_helper::get_read_write_auth($config->get('website_id'), $config->get('password'));
    // Convert title to group ID.
    $params = [
      'title' => $title,
      // At this point, we aren't checking membership.
      'currentUser' => 0,
    ];
    // Look up the group.
    return \report_helper::get_report_data([
      'dataSource' => 'library/groups/find_group_by_url',
      'readAuth' => $auth['read'],
      'extraParams' => $params,
      'caching' => TRUE,
      'cachePerUser' => FALSE,
    ]);
  }

}
