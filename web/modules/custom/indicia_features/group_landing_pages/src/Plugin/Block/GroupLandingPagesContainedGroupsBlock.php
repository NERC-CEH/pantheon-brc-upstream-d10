<?php

namespace Drupal\group_landing_pages\Plugin\Block;

use Drupal\Core\Url;
use Drupal\indicia_blocks\Plugin\Block\IndiciaBlockBase;

/**
 * Provides cards linking to a container group's visible children.
 *
 * @Block(
 *   id = "group_landing_pages_contained_groups",
 *   admin_label = @Translation("Group Landing Pages Contained Groups"),
 * )
 */
class GroupLandingPagesContainedGroupsBlock extends IndiciaBlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    global $indicia_templates;
    $build = ['#cache' => ['max-age' => 0]];
    $config = $this->getConfiguration();
    if (empty($config['group_id'])) {
      $this->messenger()->addWarning($this->t('The Group Landing Pages Contained Groups block requires a container group ID.'));
      return $build;
    }
    iform_load_helpers(['report_helper']);
    $connection = iform_get_connection_details();
    $readAuth = $this->getReadAuthSafely($connection);
    if ($readAuth === NULL) {
      return $build;
    }
    $children = $this->runWarehouseCall(function () use ($config, $readAuth) {
      return \helper_base::get_population_data([
        'table' => 'group',
        'columns' => 'id',
        'extraParams' => $readAuth + [
          'contained_by_group_id' => $config['group_id'],
        ],
        'caching' => FALSE,
      ]);
    });
    if (isset($children['error'])) {
      throw new \RuntimeException('Unable to load contained groups: ' . $children['error']);
    }
    if (empty($children)) {
      return $build;
    }
    // The groups list report applies the discovery page's visibility and date
    // rules, but does not support filtering by contained_by_group_id.
    $groups = $this->getReportDataSafely([
      'dataSource' => 'library/groups/groups_list',
      'readAuth' => $readAuth,
      'extraParams' => [
        'currentUser' => hostsite_get_user_field('indicia_user_id') ?: 0,
        'userFilterMode' => 'allvisible',
      ],
      'caching' => FALSE,
    ]);
    if (isset($groups['error'])) {
      throw new \RuntimeException('Unable to load visible groups: ' . $groups['error']);
    }
    $childIds = array_fill_keys(array_column($children, 'id'), TRUE);
    $cards = [];
    foreach ($groups as $group) {
      if (!isset($childIds[$group['id']])) {
        continue;
      }
      $title = trim(preg_replace('/[^a-z0-9-]/', '', str_replace(' ', '-', strtolower($group['title']))), '-');
      $cards[] = [
        'title' => $group['title'],
        'description' => $group['description'],
        'logo_path' => $group['logo_path'],
        'url' => Url::fromRoute('group_landing_pages.group_home', ['title' => $title]),
      ];
    }
    if (!$cards) {
      return $build;
    }
    \helper_base::add_resource('font_awesome');
    $build['content'] = [
      '#theme' => 'group_landing_page_contained_groups',
      '#heading' => $this->t('@label links', ['@label' => ucfirst($config['contained_group_label'])]),
      '#groups' => $cards,
      '#warehouse_url' => \Drupal::config('iform.settings')->get('base_url'),
      '#card_classes' => [
        'container' => $indicia_templates['cardClass'],
        'heading' => $indicia_templates['cardHeadingClass'],
        'body' => $indicia_templates['cardBodyClass'],
      ],
    ];
    $build['#attached']['library'][] = 'group_landing_pages/contained-groups';
    return $build;
  }

}
