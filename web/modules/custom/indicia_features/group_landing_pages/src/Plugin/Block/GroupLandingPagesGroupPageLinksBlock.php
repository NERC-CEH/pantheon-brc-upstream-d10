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
    iform_load_helpers(['ElasticsearchReportHelper']);
    $config = $this->getConfiguration();
    if (empty($config['group_id'])) {
      \Drupal::messenger()->addWarning(t('The Group Landing Pages Group Page Links block should only be used by the Group Landing Pages module.'));
      return [];
    }
    $conn = iform_get_connection_details();
    iform_load_helpers(['helper_base']);
    return [
      // @todo Set group member param properly.
      '#markup' => Markup::create(\ElasticsearchReportHelper::getGroupPageLinks([
        'id' => $config['group_id'],
        'implicit_record_inclusion' => $config['implicit_record_inclusion'],
      ], [
        'readAuth' => \helper_base::get_read_auth($conn['website_id'], $conn['password']),
      ], $config['member'])),
    ];
  }

  /**
   * {@inheritdoc}
   *
   * Prevent caching.
   */
  public function getCacheMaxAge() {
    return 0;
  }

}
