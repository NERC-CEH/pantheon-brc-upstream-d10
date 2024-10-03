<?php

namespace Drupal\group_landing_pages\Plugin\Block;

use Drupal\Core\Render\Markup;
use Drupal\indicia_blocks\Plugin\Block\IndiciaBlockBase;

/**
 * Provides a 'Group Landing Pages Group Page Links' block.
 *
 * @Block(
 *   id = "group_landing_pages_group_page_links",
 *   admin_label = @Translation("Group Landing Pages Group Page Links"),
 * )
 */
class GroupLandingPagesGroupPageLinksBlock extends IndiciaBlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    iform_load_helpers(['helper_base', 'ElasticsearchReportHelper']);
    $config = $this->getConfiguration();
    if (empty($config['group_id'])) {
      \Drupal::messenger()->addWarning(t('The Group Landing Pages Group Page Links block should only be used by the Group Landing Pages module.'));
      return [];
    }
    $conn = iform_get_connection_details();
    global $indicia_templates;
    $membership = $config['admin'] ? \GroupMembership::Admin : ($config['member'] ? \GroupMembership::Member : \GroupMembership::NonMember);
    $readAuth = \helper_base::get_read_auth($conn['website_id'], $conn['password']);
    $groupPageLinks = \ElasticsearchReportHelper::getGroupPageLinksArray([
      'id' => $config['group_id'],
      'title' => $config['group_title'],
      'implicit_record_inclusion' => $config['implicit_record_inclusion'],
      'joining_method' => $config['joining_method'],
      'container' => $config['container'],
    ], [
      'readAuth' => $readAuth,
      'joinLink' => TRUE,
      'editPath' => ltrim($config['edit_alias'], '/'),
      'containedGroupLabel' => $config['contained_group_label'],
    ], $membership, FALSE);
    $linksHtml = [];
    // If showing the links for a parent container group, then include a home
    // page link.
    if ($config['container'] && $config['include_home_link']) {
      $groupUrlPath = trim(preg_replace('/[^a-z0-9-]/', '', str_replace(' ', '-', strtolower($config['group_title']))), '-');
      $containerHomeButtonCaption = $this->t('@title home', ['@title' => $config['group_title']]);
      $linksHtml[] = "<li><a href=\"/groups/$groupUrlPath\" class=\"$indicia_templates[buttonHighlightedClass]\"><i class=\"fas fa-home\"></i> $containerHomeButtonCaption</a></li>";
    }
    foreach ($groupPageLinks as $href => $linkInfo) {
      $icon = empty($linkInfo['icon']) ? '' : "$linkInfo[icon] ";
      $linksHtml[] = "<li><a href=\"$href\" class=\"$indicia_templates[buttonHighlightedClass]\">$icon$linkInfo[label]</a></li>";
    }
    $groupTypeLabel = ucfirst(!$config['container'] && $config['contained_by_group_id'] ? $config['contained_group_label'] : $config['group_label']);
    $content = empty($groupPageLinks) ? '' : '<p>' . \lang::get("$groupTypeLabel links") . ':</p><ul>' . implode("\n", $linksHtml) . '</ul>';
    return [
      '#markup' => Markup::create($content),
      '#attached' => [
        'library' => [
          'group_landing_pages/page-links-block',
        ],
      ],
      '#cache' => [
        'keys' => ['group', $config['group_id'], 'links'],
        'contexts' => ['route'],
        'tags' => ["iform:group:$config[group_id]"],
      ],
    ];
  }

}
