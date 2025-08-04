<?php

namespace Drupal\forum_access\ForumAccess;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\taxonomy\TermInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Access checks for forum.
 */
class Access implements ContainerInjectionInterface {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    protected ModuleHandlerInterface $moduleHandler,
  ) {
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('module_handler'),
    );
  }

  /**
   * Access check for forum index page.
   */
  public function forumIndex(AccountInterface $account) {
    $this->moduleHandler->loadInclude('forum_access', 'inc', 'includes/forum_access.common');
    $view_access = forum_access_forum_check_view($account);
    if (!empty($view_access)) {
      return AccessResult::allowed();
    }
    return AccessResult::forbidden();
  }

  /**
   * Access check for specific forum page.
   */
  public function forumPage(AccountInterface $account, TermInterface $taxonomy_term) {
    $this->moduleHandler->loadInclude('forum_access', 'inc', 'includes/forum_access.common');
    $view_access = forum_access_forum_check_view($account, $taxonomy_term->id());
    if (!empty($view_access)) {
      return AccessResult::allowed();
    }
    return AccessResult::forbidden();
  }

  /**
   * Access for comment reply according to the taxonomy term of forum.
   */
  public function commentReply(EntityInterface $entity, $field_name, $pid = NULL) {
    $this->moduleHandler->loadInclude('forum_access', 'inc', 'includes/forum_access.common');
    if ($entity->bundle() != 'forum') {
      return AccessResult::allowed();
    }
    // Forbid if user has no access to reply.
    if (!forum_access_entity_access_by_tid('create', $entity)) {
      return AccessResult::forbidden();
    }
    return AccessResult::allowed();
  }

}
