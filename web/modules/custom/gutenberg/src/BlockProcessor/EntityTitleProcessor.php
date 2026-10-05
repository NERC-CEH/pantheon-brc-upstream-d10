<?php

namespace Drupal\gutenberg\BlockProcessor;

use Drupal\Component\Utility\Html;
use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Template\Attribute;
use Drupal\gutenberg\Controller\UtilsController;
use Drupal\gutenberg\Parser\BlockParser;
use Drupal\gutenberg\Render\EntityRenderContext;

/**
 * Renders the entity title placed with the drupal/entity-title block.
 *
 * The color, typography, spacing and border supports are applied by their
 * processors, which run after this one.
 */
class EntityTitleProcessor implements GutenbergBlockProcessorInterface {

  /**
   * The block name.
   */
  const BLOCK_NAME = 'drupal/entity-title';

  /**
   * The entity render context.
   *
   * @var \Drupal\gutenberg\Render\EntityRenderContext
   */
  protected $entityRenderContext;

  /**
   * EntityTitleProcessor constructor.
   *
   * @param \Drupal\gutenberg\Render\EntityRenderContext $entity_render_context
   *   The entity render context.
   */
  public function __construct(EntityRenderContext $entity_render_context) {
    $this->entityRenderContext = $entity_render_context;
  }

  /**
   * {@inheritdoc}
   */
  public function processBlock(array &$block, &$block_content, RefinableCacheableDependencyInterface $bubbleable_metadata) {
    $attributes = $block['attrs'] ?? [];
    $block_content = '';

    $entity = $this->entityRenderContext->getEntity();
    if (!$entity) {
      // The content is rendered outside its entity's display, e.g. by a text
      // formatter used on its own. Fall back to the entity of the page.
      $entity = $this->entityRenderContext->getRouteEntity();
      $bubbleable_metadata->addCacheContexts(['route']);
    }
    if (!$entity) {
      return FALSE;
    }
    $bubbleable_metadata->addCacheableDependency($entity);

    $level = (int) ($attributes['level'] ?? 1);
    if ($level < 1 || $level > 6) {
      $level = 1;
    }

    $wrapper = new Attribute([
      'class' => ['wp-block-drupal-entity-title', 'wp-block-post-title'],
    ]);
    if (!empty($attributes['align'])) {
      $wrapper->addClass('align' . $attributes['align']);
    }
    if (!empty($attributes['className'])) {
      $wrapper->addClass(preg_split('/\s+/', trim($attributes['className'])));
    }

    $block_content = '<h' . $level . $wrapper . '>' . Html::escape((string) $entity->label()) . '</h' . $level . '>';
  }

  /**
   * {@inheritdoc}
   */
  public function isSupported(array $block, $block_content = '') {
    return ($block['blockName'] ?? '') === self::BLOCK_NAME;
  }

  /**
   * Checks whether the Gutenberg content of an entity places its title.
   *
   * Themes then don't render the title above the content.
   *
   * @param \Drupal\Core\Entity\FieldableEntityInterface $entity
   *   The entity.
   *
   * @return bool
   *   TRUE if the content has a drupal/entity-title block.
   */
  public static function isPlaced(FieldableEntityInterface $entity): bool {
    $text_fields = UtilsController::getEntityTextFields($entity);
    $content = $text_fields ? $entity->get($text_fields[0])->value : NULL;
    if (!$content || !str_contains($content, 'wp:' . self::BLOCK_NAME . ' ')) {
      return FALSE;
    }

    $find = function (array $blocks) use (&$find) {
      foreach ($blocks as $block) {
        if (($block['blockName'] ?? '') === self::BLOCK_NAME
          || (!empty($block['innerBlocks']) && $find($block['innerBlocks']))) {
          return TRUE;
        }
      }
      return FALSE;
    };
    return $find((new BlockParser())->parse($content));
  }

}
