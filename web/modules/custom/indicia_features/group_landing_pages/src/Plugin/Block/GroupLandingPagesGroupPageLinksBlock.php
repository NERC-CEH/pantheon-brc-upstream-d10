<?php

namespace Drupal\group_landing_pages\Plugin\Block;

use Drupal\Component\Utility\Html;
use Drupal\Component\Utility\UrlHelper;
use Drupal\Component\Utility\Xss;
use Drupal\Core\Render\Markup;
use Drupal\Core\Url;
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
      \Drupal::messenger()->addWarning($this->t('The Group Landing Pages Group Page Links block should only be used by the Group Landing Pages module.'));
      return [];
    }
    $conn = iform_get_connection_details();
    $moduleConfig = \Drupal::config('group_landing_pages.settings');
    global $indicia_templates;
    $buttonClass = $indicia_templates['buttonHighlightedClass'];
    $membership = $config['admin'] ? \GroupMembership::Admin : ($config['member'] ? \GroupMembership::Member : \GroupMembership::NonMember);
    $membershipCacheKey = $membership->name;
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
      'excludedGroupPagePaths' => $moduleConfig->get('group_page_paths_excluded_from_links') ?? [],
    ], $membership, FALSE);
    $links = [];
    // If showing the links for a parent container group, then include a home
    // page link.
    if ($config['container'] && $config['include_home_link']) {
      $groupUrlPath = trim(preg_replace('/[^a-z0-9-]/', '', str_replace(' ', '-', strtolower($config['group_title']))), '-');
      $containerHomeButtonCaption = $this->t('@title home', ['@title' => $config['group_title']]);
      $links[] = $this->buildLink(
        "/groups/$groupUrlPath",
        $containerHomeButtonCaption,
        '<i class="fas fa-home"></i>',
        $buttonClass
      );
    }
    foreach ($groupPageLinks as $href => $linkInfo) {
      $links[] = $this->buildLink($href, $linkInfo['label'], $linkInfo['icon'] ?? '', $buttonClass);
    }
    $groupTypeLabel = ucfirst(!$config['container'] && $config['contained_by_group_id'] ? $config['contained_group_label'] : $config['group_label']);
    $content = [];
    if (!empty($links)) {
      $content['heading'] = [
        '#prefix' => '<p>',
        '#plain_text' => \lang::get("$groupTypeLabel links"),
        '#suffix' => '</p>',
      ];
      $content['links'] = [
        '#theme' => 'item_list',
        '#items' => $links,
      ];
    }
    return [
      'content' => $content,
      '#attached' => [
        'library' => [
          'group_landing_pages/page-links-block',
        ],
      ],
      '#cache' => [
        'keys' => ['group', $config['group_id'], 'links', $membershipCacheKey],
        'contexts' => ['route'],
        'tags' => ["iform:group:$config[group_id]", 'config:group_landing_pages.settings'],
      ],
    ];
  }

  /**
   * Builds a safely escaped group page link.
   *
   * @param string $href
   *   The link URL or path.
   * @param string $label
   *   The link label.
   * @param string $icon
   *   Optional icon markup to display before the label.
   * @param string $buttonClass
   *   CSS class to apply to the link.
   *
   * @return array
   *   A Drupal link render array.
   */
  private function buildLink($href, $label, $icon, $buttonClass) {
    $url = UrlHelper::isExternal($href) ? Url::fromUri($href) : Url::fromUserInput($href);
    $icon = $icon ? Xss::filter($icon, ['i']) . ' ' : '';
    return [
      '#type' => 'link',
      '#title' => Markup::create($icon . Html::escape($label)),
      '#url' => $url,
      '#options' => [
        'attributes' => [
          'class' => [$buttonClass],
        ],
      ],
    ];
  }

}
