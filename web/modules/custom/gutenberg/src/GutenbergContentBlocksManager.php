<?php

namespace Drupal\gutenberg;

use Drupal\block_content\BlockContentInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;

/**
 * Manager for Gutenberg content blocks.
 *
 * @package Drupal\gutenberg
 */
class GutenbergContentBlocksManager {

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;


  /**
   * The GutenbergContentTypeManager Service.
   *
   * @var \Drupal\gutenberg\GutenbergContentTypeManager
   */
  protected $gutenbergContentTypeManager;


  /**
   * The database connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;

  /**
   * Constructs a new ContentBlocksManager.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Drupal\gutenberg\GutenbergContentTypeManager $gutenberg_content_type_manager
   *   The GutenbergContentTypeManager Service.
   * @param \Drupal\Core\Database\Connection $connection
   *   The database connection.
   */
  public function __construct(
    EntityTypeManagerInterface $entity_type_manager,
    ConfigFactoryInterface $config_factory,
    GutenbergContentTypeManager $gutenberg_content_type_manager,
    Connection $connection,
  ) {
    $this->entityTypeManager = $entity_type_manager;
    $this->configFactory = $config_factory;
    $this->gutenbergContentTypeManager = $gutenberg_content_type_manager;
    $this->connection = $connection;
  }

  /**
   * Checks if a block can be used in a content type.
   *
   * @param \Drupal\block_content\BlockContentInterface $block
   *   The block content entity to check.
   *
   * @return bool
   *   TRUE if the block can be cloned, FALSE otherwise.
   */
  private function canBeCloned(BlockContentInterface $block) {

    // Reusable blocks should not be cloned.
    if ($block->isReusable()) {
      return FALSE;
    }
    // @todo check if the block bundle is allowed in the node bundle.
    return TRUE;
  }

  /**
   * Clones a content block by ID.
   *
   * Returns the new block or FALSE if it could not be cloned.
   *
   * @param string $block_id
   *   The content block id.
   * @param string|null $entity_id
   *   The entity ID that uses this block.
   * @param string $entity_type
   *   The entity type.
   * @param string|null $entity_bundle
   *   The entity bundle.
   *
   * @return \Drupal\Core\Entity\EntityInterface|bool
   *   The cloned block entity, or FALSE if cloning failed.
   */
  public function cloneBlock($block_id, $entity_id = NULL, $entity_type = 'node', $entity_bundle = NULL) {
    $content_block = $this->entityTypeManager->getStorage('block_content')->load($block_id);
    if ($content_block && $this->canBeCloned($content_block)) {
      $cloned_content_block = $content_block->createDuplicate();
      $cloned_content_block->save();
      $this->setBlockUsage($cloned_content_block->id(), [
        'entity_id' => $entity_id,
        'entity_type' => $entity_type,
        'entity_bundle' => $entity_bundle,
      // Active 0 because the entity hasn't been saved yet.
        'active' => 0,
      ]);
      return $cloned_content_block;
    }
    return FALSE;
  }

  /**
   * Deletes a usage record in the database for an array of  $block_ids.
   *
   * @param array $block_ids
   *   The block ids to delete records for.
   *
   * @return void
   *   Nothing is returned.
   */
  public function deleteContentBlockUsage($block_ids): void {
    $this->connection->delete('gutenberg_content_block_usage')
      ->condition('content_block_id', $block_ids, 'IN')
      ->execute();
  }

  /**
   * Sets the block usage records to the values in $fields.
   *
   * @param int $block_id
   *   The content block ID.
   * @param array $fields
   *   The fields to set on the usage record.
   *
   * @return void
   *   Nothing is returned.
   */
  public function setBlockUsage($block_id, $fields = []): void {
    $merge_keys = [
      'content_block_id' => $block_id,
    ];
    $fields['created'] = \Drupal::time()->getRequestTime();
    $fields['entity_type'] = $fields['entity_type'] ?? 'node';

    $this->connection->merge('gutenberg_content_block_usage')
      ->keys($merge_keys)
      ->fields($fields)
      ->execute();
  }

  /**
   * Get the block usage record for a block ID.
   *
   * @param int $block_id
   *   The content block ID.
   *
   * @return array|bool
   *   The usage record for the block from the database.
   */
  public function getBlockUsage($block_id): bool|array {
    return $this->connection->select('gutenberg_content_block_usage')
      ->fields('gutenberg_content_block_usage', [])
      ->condition('content_block_id', $block_id)
      ->execute()->fetchAssoc();
  }

  /**
   * Sets all the existing usage records for the node to inactive.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity to deactivate usage records for.
   */
  public function deactivateUsageForEntity(EntityInterface $entity): void {
    $this->connection->update('gutenberg_content_block_usage')
      ->fields([
        'active' => 0,
        'created' => \Drupal::time()->getRequestTime(),
      ])
      ->condition('entity_type', $entity->getEntityTypeId())
      ->condition('entity_id', $entity->id())
      ->execute();
  }

  /**
   * Selects block IDs no longer referenced in content.
   *
   * @param int $timestamp
   *   A unix timestamp, selects records older than this value, or all records
   *   if null.
   * @param int $limit
   *   How many records to return.
   *
   * @return array
   *   An array of block ids.
   */
  public function getOrphanedBlockIds($timestamp = NULL, $limit = 20) {
    $query = $this->connection->select('gutenberg_content_block_usage', 'usage')
      ->fields('usage', ['content_block_id'])
      ->condition('active', 0)
      ->range(0, $limit)
      ->orderBy('created', 'ASC');

    if ($timestamp) {
      $query->condition('created', $timestamp, '<');
    }

    $results = $query->execute()->fetchAllKeyed(0, 0);
    return $results;
  }

}
