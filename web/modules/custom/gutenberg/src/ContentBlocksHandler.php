<?php

namespace Drupal\gutenberg;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\gutenberg\Controller\UtilsController;
use Drupal\gutenberg\Parser\BlockParser;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Handles the mappingFields configuration manipulation.
 *
 * This class contains functions primarily for processing mappingFields
 * configurations.
 */
class ContentBlocksHandler implements ContainerInjectionInterface {

  use StringTranslationTrait;

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The Gutenberg logger.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;


  /**
   * The EntityTypeManager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;


  /**
   * The GutenbergContentBlocksManager service.
   *
   * @var \Drupal\gutenberg\GutenbergContentBlocksManager
   */
  protected $contentBlocksManager;

  /**
   * EntityTypePresave constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Psr\Log\LoggerInterface $logger
   *   The Gutenberg logger.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The EntityTypeManager.
   * @param \Drupal\gutenberg\GutenbergContentBlocksManager $content_blocks_manager
   *   The GutenbergContentBlocksManager service.
   */
  public function __construct(ConfigFactoryInterface $config_factory, LoggerInterface $logger, EntityTypeManagerInterface $entity_type_manager, GutenbergContentBlocksManager $content_blocks_manager) {
    $this->logger = $logger;
    $this->configFactory = $config_factory;
    $this->entityTypeManager = $entity_type_manager;
    $this->contentBlocksManager = $content_blocks_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('logger.channel.gutenberg'),
      $container->get('entity_type.manager'),
      $container->get('gutenberg.content_blocks_manager')
    );
  }

  /**
   * Process content blocks.
   *
   * Track block usage in our custom table.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity being processed.
   */
  public function processBlocks(EntityInterface $entity) {

    // This sets all blocks associated with this node to inactive
    // we set the active ones we find later below.
    $this->contentBlocksManager->deactivateUsageForEntity($entity);

    // Get the blocks used in this entity.
    $text_fields = UtilsController::getEntityTextFields($entity);
    if (count($text_fields) === 0) {
      return;
    }

    $field_content = $entity->get($text_fields[0])->getString();

    $block_parser = new BlockParser();
    $blocks = $this->getContentBlocks($block_parser->parse($field_content));
    $blocks_ids = array_filter(array_map(function ($block) {
      return $block['attrs']['contentBlockId'] ?? FALSE;
    }, $blocks));

    // Save a usage record for each block used in this entity.
    foreach ($blocks_ids as $block_id) {
      $this->contentBlocksManager->setBlockUsage($block_id, [
        'entity_type' => $entity->getEntityTypeId(),
        'entity_id' => $entity->id(),
        'entity_bundle' => $entity->bundle(),
        'active' => 1,
      ]);
    }

  }

  /**
   * Get all content blocks, inner blocks included from content.
   */
  public function getContentBlocks($blocks) {
    $content_blocks = [];
    foreach ($blocks as $block) {
      if (count($block['innerBlocks']) > 0) {
        $content_blocks = array_merge($content_blocks, $this->getContentBlocks($block['innerBlocks']));
      }
      else {
        if ($block['blockName'] && str_contains($block['blockName'], 'content-block/')) {
          $content_blocks[] = $block;
        }
      }
    }
    return $content_blocks;
  }

}
