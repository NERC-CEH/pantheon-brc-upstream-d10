<?php

namespace Drupal\group_landing_pages\Controller;

use Drupal\Core\Controller\ControllerBase;

class GroupLandingPagesController extends ControllerBase {

  /**
   * Controller which renders a group landing page.
   *
   * @todo Group blog
   */
  public function groupHome($title) {
    $config = \Drupal::config('group_landing_pages.settings');
    $indiciaConfig = \Drupal::config('iform.settings');
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
    $membershipInfo = $this->getMembershipInfo($group, $readAuth);
    // Make logo available to JS so it can add to header.
    \helper_base::$indiciaData['group'] = $group;
    \helper_base::$indiciaData['logoPath'] = $group['logo_path'];
    \helper_base::$indiciaData['logoSelector'] = $config->get('logo_selector') ?? '[rel="home"][class*=logo]';
    // Build array points to the twig template via a theme hook, plus supplies
    // some variables.
    $defaultVariables = [
      '#group_id' => $group['id'],
      '#group_title' => $group['title'],
      '#description' => $group['description'],
      '#group_type' => $group['group_type_term'],
      '#joining_method' => $group['joining_method_raw'],
      '#implicit_record_inclusion' => $group['implicit_record_inclusion'],
      '#admin' => $membershipInfo['isAdmin'],
      '#member' => $membershipInfo['isMember'],
      '#pending' => $membershipInfo['isPending'],
      '#container' => $group['container'] === 't' ? TRUE : FALSE,
      '#contained_by_group_id' => $group['contained_by_group_id'],
      '#contained_by_group_title' => $group['contained_by_group_title'],
      '#contained_by_group_description' => $group['contained_by_group_description'],
      '#contained_by_group_logo_path' => $group['contained_by_group_logo_path'],
      '#contained_by_group_implicit_record_inclusion' => $group['contained_by_group_implicit_record_inclusion'],
      '#contained_by_group_admin' => $membershipInfo['isContainerGroupAdmin'],
      '#contained_by_group_member' => $membershipInfo['isContainerGroupMember'],
      '#can_view_blog' => !empty($group['post_blog_permission']),
      '#can_post_blog' => ($group['post_blog_permission'] === 'A' && $membershipInfo['isAdmin']) || ($group['post_blog_permission'] === 'M' && $membershipInfo['isMember']),
      '#edit_alias' => $config->get('group_edit_alias'),
      '#group_label' => $config->get('group_label'),
      '#container_group_label' => $config->get('container_group_label'),
      '#contained_group_label' => $config->get('contained_group_label'),
      '#species_details_alias' => $config->get('species_details_alias'),
      '#species_details_within_group_alias' => $config->get('species_details_within_group_alias'),
      '#warehouse_url' => $indiciaConfig->get('base_url'),
    ];
    return array_merge($defaultVariables, [
      '#title' => $group['title'],
      '#theme' => 'group_landing_page_tabs',
      '#overview_tab_content' => array_merge([
        '#theme' => 'group_landing_page_overview',
      ], $defaultVariables),
      '#progress_tab_content' => array_merge([
        '#theme' => 'group_landing_page_progress',
      ], $defaultVariables),
      '#taxa_tab_content' => array_merge([
        '#theme' => 'group_landing_page_taxa',
      ], $defaultVariables),
      '#attached' => [
        'library' => [
          'core/drupal.dialog.ajax',
          'group_landing_pages/core',
          'group_landing_pages/blog_entries_view',
        ],
      ],
    ]);
  }

  /**
   * Controller for the blog overview page.
   *
   * Returns the group blog entries view, filtered to the correct group.
   *
   * @param string $title
   *   Blog title from the URL.
   *
   * @return array
   *   View build array.
   */
  public function groupBlog($title) {
    $groups = $this->getGroupFromTitle($title);
    return [
      'view' => [
        '#type' => 'view',
        '#name' => 'group_blog_entries',
        '#display_id' => 'page_1',
        '#arguments' => [
          $groups[0]['id'],
        ],
      ],
    ];
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
      'caching' => FALSE,
    ]);
  }

  /**
   * Capture a summary of membership and admin status for the group.
   *
   * Also capture information about membership of the parent container group if
   * relevant.
   *
   * @param array $group
   *   Group data loaded from the database.
   * @param array $readAuth
   *   Read authorisation tokens.
   *
   * @return bool[]
   *   Array with key/value pairs describing membership and admin status for
   *   the user.
   */
  private function getMembershipInfo(array $group, array $readAuth) {
    $indiciaUserId = hostsite_get_user_field('indicia_user_id');
    if (!$indiciaUserId) {
      // Not linked to warehouse so can't be a member.
      return [];
    }
    $membership = \helper_base::get_population_data([
      'table' => 'groups_user',
      'extraParams' => $readAuth + [
        'query' => json_encode([
          'in' => [
            'group_id' => [$group['id'], $group['contained_by_group_id']],
          ],
        ]),
        'user_id' => $indiciaUserId,
      ],
      'nocache' => TRUE,
    ]);
    $r = [
      'isMember' => FALSE,
      'isAdmin' => FALSE,
      'isPending' => FALSE,
      'isContainerGroupMember' => FALSE,
      'isContainerGroupAdmin' => FALSE,
    ];
    foreach ($membership as $m) {
      if ($m['pending'] === 't') {
        // Capture pending membership if for the main page group.
        $r['isPending'] = $r['isPending'] || ($m['group_id'] == $group['id']);
      }
      elseif ($m['administrator'] === 't') {
        $r['isAdmin'] = $r['isAdmin'] || ($m['group_id'] == $group['id']);
        $r['isContainerGroupAdmin'] = $r['isContainerGroupAdmin'] || ($m['group_id'] == $group['contained_by_group_id']);
      }
      $r['isMember'] = $r['isMember'] || ($m['group_id'] == $group['id']);
      $r['isContainerGroupMember'] = $r['isContainerGroupMember'] || ($m['group_id'] == $group['contained_by_group_id']);
    }
    return $r;
  }

}
