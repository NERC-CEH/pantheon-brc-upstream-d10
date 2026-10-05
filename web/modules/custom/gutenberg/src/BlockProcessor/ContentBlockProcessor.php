<?php

namespace Drupal\gutenberg\BlockProcessor;

use Drupal\block_content\Entity\BlockContent;
use Drupal\gutenberg\StyleEngine;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Render\RendererInterface;
use Drupal\gutenberg\Html\TagProcessor;
use Psr\Log\LoggerInterface;

/**
 * Processes non-reusable content blocks.
 */
class ContentBlockProcessor implements GutenbergBlockProcessorInterface {

  /**
   * The number of times this formatter allows rendering the same entity.
   *
   * @var int
   */
  const RECURSIVE_RENDER_LIMIT = 20;

  /**
   * An array of counters for the recursive rendering protection.
   *
   * @var array<int>
   */
  protected static $recursiveRenderDepth = [];

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Drupal\Core\Render\RendererInterface instance.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * The Gutenberg logger.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * ReusableBlockProcessor constructor.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer.
   * @param \Psr\Log\LoggerInterface $logger
   *   Gutenberg logger interface.
   */
  public function __construct(
    EntityTypeManagerInterface $entity_type_manager,
    RendererInterface $renderer,
    LoggerInterface $logger,
  ) {
    $this->entityTypeManager = $entity_type_manager;
    $this->renderer = $renderer;
    $this->logger = $logger;
  }

  /**
   * Process block.
   *
   * @param array<mixed> $block
   *   The block.
   * @param string $block_content
   *   The block content.
   * @param \Drupal\Core\Cache\RefinableCacheableDependencyInterface $bubbleable_metadata
   *   The bubbleable metadata.
   *
   * @return bool|null
   *   TRUE if processed, or NULL otherwise.
   */
  public function processBlock(array &$block, &$block_content, RefinableCacheableDependencyInterface $bubbleable_metadata) {
    $block_attributes = $block['attrs'];

    if (is_array($block_attributes) && array_key_exists('contentBlockId', $block_attributes)) {
      $bid = $block_attributes['contentBlockId'];
    }

    if (is_array($block_attributes) && array_key_exists('type', $block_attributes)) {
      $type = $block_attributes['type'];
    }

    if (!isset($bid)) {
      // This should not happen, and typically means there's a bug somewhere.
      $this->logger->error('Missing content block ID.');
      return FALSE;
    }

    if (!isset($type)) {
      // This should not happen, and typically means there's a bug somewhere.
      $this->logger->error('Missing block type.');
      return FALSE;
    }

    $view_mode = 'default';
    if (is_array($block_attributes) && array_key_exists('viewMode', $block_attributes)) {
      $view_mode = $block_attributes['viewMode'];
    }

    $block_entity = BlockContent::load($bid);

    if ($block_entity) {
      $render = $this
        ->entityTypeManager
        ->getViewBuilder('block_content')
        ->view($block_entity, $view_mode);

      $id = $block_entity->id();
      if (isset(static::$recursiveRenderDepth[$id])) {
        static::$recursiveRenderDepth[$id]++;
      }
      else {
        static::$recursiveRenderDepth[$id] = 1;
      }
      if (static::$recursiveRenderDepth[$id] > static::RECURSIVE_RENDER_LIMIT) {
        $this->logger->error('Recursive rendering detected with content block id @id', [
          '@id' => $id,
        ]);
        return FALSE;
      }

      $build = [
        '#theme' => 'block',
        '#attributes' => [],
        '#contextual_links' => [],
        '#configuration' => [
          'provider' => 'gutenberg',
          'view_mode' => $view_mode,
        ],
        '#plugin_id' => 'content_block:' . $type,
        '#base_plugin_id' => 'content_block',
        '#derivative_plugin_id' => $type,
        'content' => $render,
      ];

      // Add the block styles if available.
      if (!empty($block_attributes['style'])) {
        $block_styles = StyleEngine::gutenberg_style_engine_get_styles($block_attributes['style']);
        $build['#attributes']['style'] = $block_styles['css'];
      }

      // Get classes from the block wrapper.
      $tags = new TagProcessor($block_content);
      if ($tags->next_tag('div')) {
        $classes = $tags->get_attribute('class');
        // Add each class to the block build.
        foreach (explode(' ', $classes) as $class) {
          $build['#attributes']['class'][] = $class;
        }
      }

      $block_content = $this->renderer->render($build);

      // Reset the render counter for this block, as we allow it to appear many
      // times of course, just not inside of itself.
      unset(static::$recursiveRenderDepth[$id]);

      $bubbleable_metadata->addCacheableDependency(
        CacheableMetadata::createFromRenderArray($build)
      );

      return TRUE;
    }

    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function isSupported(array $block, $block_content = '') {
    return substr($block['blockName'] ?? '', 0, 14) === 'content-block/';
  }

}
