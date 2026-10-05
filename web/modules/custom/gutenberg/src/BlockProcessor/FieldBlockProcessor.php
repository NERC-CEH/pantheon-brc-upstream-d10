<?php

namespace Drupal\gutenberg\BlockProcessor;

use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\Core\Render\BubbleableMetadata;
use Drupal\Core\Render\RenderContext;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\Template\Attribute;
use Drupal\gutenberg\FieldBlockRenderer;
use Drupal\gutenberg\Render\EntityRenderContext;
use Drupal\gutenberg\StyleEngine;

/**
 * Renders the entity fields placed with the drupal/field block.
 */
class FieldBlockProcessor implements GutenbergBlockProcessorInterface {

  /**
   * The field block renderer.
   *
   * @var \Drupal\gutenberg\FieldBlockRenderer
   */
  protected $fieldBlockRenderer;

  /**
   * The entity render context.
   *
   * @var \Drupal\gutenberg\Render\EntityRenderContext
   */
  protected $entityRenderContext;

  /**
   * The renderer.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * FieldBlockProcessor constructor.
   *
   * @param \Drupal\gutenberg\FieldBlockRenderer $field_block_renderer
   *   The field block renderer.
   * @param \Drupal\gutenberg\Render\EntityRenderContext $entity_render_context
   *   The entity render context.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer.
   */
  public function __construct(
    FieldBlockRenderer $field_block_renderer,
    EntityRenderContext $entity_render_context,
    RendererInterface $renderer,
  ) {
    $this->fieldBlockRenderer = $field_block_renderer;
    $this->entityRenderContext = $entity_render_context;
    $this->renderer = $renderer;
  }

  /**
   * {@inheritdoc}
   */
  public function processBlock(array &$block, &$block_content, RefinableCacheableDependencyInterface $bubbleable_metadata) {
    $attributes = $block['attrs'];
    $block_content = '';

    $entity = $this->entityRenderContext->getEntity();
    if (!$entity) {
      // The content is rendered outside its entity's display, e.g. by a text
      // formatter used on its own. Fall back to the entity of the page.
      $entity = $this->entityRenderContext->getRouteEntity();
      $bubbleable_metadata->addCacheContexts(['route']);
    }
    // Field blocks render nothing once disabled for the content type, and the
    // fields show in the entity's display again.
    $bubbleable_metadata->addCacheTags(['config:gutenberg.settings']);
    if (!$entity || !$this->fieldBlockRenderer->isEnabled($entity)) {
      return FALSE;
    }

    $build = $this->fieldBlockRenderer->build(
      $entity,
      $attributes['field'],
      $attributes['labelDisplay'] ?? 'hidden',
      (int) ($attributes['offset'] ?? 0),
      (int) ($attributes['limit'] ?? 0)
    );

    $context = new RenderContext();
    $html = (string) $this->renderer->executeInRenderContext($context, function () use (&$build) {
      return $this->renderer->render($build);
    });
    if (!$context->isEmpty()) {
      $metadata = $context->pop();
      $bubbleable_metadata->addCacheableDependency($metadata);
      if ($bubbleable_metadata instanceof BubbleableMetadata) {
        $bubbleable_metadata->addAttachments($metadata->getAttachments());
      }
    }

    if (trim($html) === '') {
      return FALSE;
    }

    $wrapper = new Attribute(['class' => ['wp-block-drupal-field']]);
    if (!empty($attributes['align'])) {
      $wrapper->addClass('align' . $attributes['align']);
    }
    if (!empty($attributes['className'])) {
      $wrapper->addClass(preg_split('/\s+/', trim($attributes['className'])));
    }
    if (!empty($attributes['style'])) {
      $styles = StyleEngine::gutenberg_style_engine_get_styles($attributes['style']);
      if (!empty($styles['css'])) {
        $wrapper->setAttribute('style', $styles['css']);
      }
    }

    $block_content = '<div' . $wrapper . '>' . $html . '</div>';

    // The field markup is complete, and the block supports are applied above.
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function isSupported(array $block, $block_content = '') {
    return ($block['blockName'] ?? '') === FieldBlockRenderer::BLOCK_NAME
      && !empty($block['attrs']['field'])
      && is_string($block['attrs']['field']);
  }

}
