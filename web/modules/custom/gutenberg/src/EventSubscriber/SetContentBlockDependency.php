<?php

namespace Drupal\gutenberg\EventSubscriber;

use Drupal\block_content\BlockContentEvents;
use Drupal\block_content\BlockContentInterface;
use Drupal\block_content\Event\BlockContentGetDependencyEvent;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\gutenberg\GutenbergContentBlocksManager;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Returns an access dependency for Gutenberg content blocks.
 *
 * This is to get around the "Non-reusable blocks must set an access dependency
 * for access control" error when editing a content block with media library
 * fields.
 *
 * This is mostly borrowed from layout_builder.
 *
 * @see \Drupal\layout_builder\SetInlineBlockDependency
 *
 * @see https://www.drupal.org/project/gutenberg/issues/3461124
 *
 * @internal
 *   Tagged services are internal.
 */
class SetContentBlockDependency implements EventSubscriberInterface {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The content block manager.
   *
   * @var \Drupal\gutenberg\GutenbergContentBlocksManager
   */
  protected $contentBlocksManager;

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs SetInlineBlockDependency object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\gutenberg\GutenbergContentBlocksManager $content_blocks_manager
   *   The section storage manager.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   The current user.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, GutenbergContentBlocksManager $content_blocks_manager, AccountProxyInterface $current_user) {
    $this->entityTypeManager = $entity_type_manager;
    $this->contentBlocksManager = $content_blocks_manager;
    $this->currentUser = $current_user;
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    return [
      BlockContentEvents::BLOCK_CONTENT_GET_DEPENDENCY => 'onGetDependency',
    ];
  }

  /**
   * Handles the BlockContentEvents::INLINE_BLOCK_GET_DEPENDENCY event.
   *
   * @param \Drupal\block_content\Event\BlockContentGetDependencyEvent $event
   *   The event.
   */
  public function onGetDependency(BlockContentGetDependencyEvent $event) {
    if ($dependency = $this->getContentBlockDependency($event->getBlockContentEntity())) {
      $event->setAccessDependency($dependency);
    }
  }

  /**
   * Get the access dependency of a gutenberg content block.
   *
   * If the block is used in a gutenberg entity that entity will be returned as
   * the dependency.
   *
   * @param \Drupal\block_content\BlockContentInterface $block_content
   *   The block content entity.
   *
   * @return \Drupal\Core\Entity\EntityInterface|null
   *   Returns the gutenberg entity dependency.
   *
   * @see \Drupal\block_content\BlockContentAccessControlHandler::checkAccess()
   */
  protected function getContentBlockDependency(BlockContentInterface $block_content) {
    $block_usage = $this->contentBlocksManager->getBlockUsage($block_content->id());
    if (empty($block_usage)) {
      // If the block does not have usage information then we cannot set a
      // dependency. It may be used by another module besides gutenberg.
      return NULL;
    }
    $entity_storage = $this->entityTypeManager->getStorage($block_usage['entity_type']);

    if ($block_usage['entity_id']) {
      // We have an id, load the entity and return it.
      return $entity_storage->load($block_usage['entity_id']);
    }
    elseif ($block_usage['entity_bundle']) {
      $entityType = $this->entityTypeManager->getDefinition($block_usage['entity_type']);
      $bundleKey = $entityType->getKey('bundle');
      $ownerKey = $entityType->getKey('owner');

      // We don't have an id, but we have a bundle name.
      // Create a dummy entity and return it.
      return $entity_storage->create([
        $ownerKey => $this->currentUser->id(),
        $bundleKey => $block_usage['entity_bundle'],
      ]
      );
    }
    return NULL;
  }

}
