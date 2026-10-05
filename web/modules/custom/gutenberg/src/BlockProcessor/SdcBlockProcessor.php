<?php

namespace Drupal\gutenberg\BlockProcessor;

use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\Core\Render\Markup;
use Drupal\Core\Render\RenderContext;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\Theme\ComponentPluginManager;

/**
 * Processes SDC (Single Directory Component) blocks for frontend rendering.
 *
 * Handles both parent SDC blocks and their sdc/slot children:
 * - sdc/slot blocks: stores rendered content on the processor instance so the
 *   parent can retrieve it (depth-first rendering guarantees children process
 *   before parents).
 * - Parent SDC blocks: consumes accumulated slot content, builds a Drupal
 *   component render array, and renders it.
 */
class SdcBlockProcessor implements GutenbergBlockProcessorInterface {

  /**
   * The component plugin manager.
   *
   * @var \Drupal\Core\Theme\ComponentPluginManager
   */
  protected $componentPluginManager;

  /**
   * The renderer.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * Rendered slot content accumulated from sdc/slot children.
   *
   * Populated depth-first as sdc/slot blocks are processed before
   * their parent SDC block. Consumed and cleared by the parent.
   *
   * @var array
   */
  protected $pendingSlots = [];

  /**
   * SdcBlockProcessor constructor.
   *
   * @param \Drupal\Core\Theme\ComponentPluginManager $component_plugin_manager
   *   The component plugin manager.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer.
   */
  public function __construct(
    ComponentPluginManager $component_plugin_manager,
    RendererInterface $renderer,
  ) {
    $this->componentPluginManager = $component_plugin_manager;
    $this->renderer = $renderer;
  }

  /**
   * {@inheritdoc}
   */
  public function processBlock(array &$block, &$block_content, RefinableCacheableDependencyInterface $bubbleable_metadata) {
    $block_name = $block['blockName'] ?? '';

    // Handle sdc/slot blocks: store their already-rendered content on the
    // processor instance and clear $block_content so it doesn't appear in
    // the parent's assembled block content.
    // GutenbergFilter::renderBlock() renders depth-first, so all sdc/slot
    // children are fully processed before the parent SDC block.
    if ($block_name === 'sdc/slot') {
      $slot_name = $block['attrs']['name'] ?? 'default';
      $this->pendingSlots[$slot_name] = $block_content;
      $block_content = '';
      return FALSE;
    }

    // Handle parent SDC blocks.
    $attrs = $block['attrs'] ?? [];
    $props = $attrs['props'] ?? [];
    $variant = $attrs['variant'] ?? NULL;

    // Derive the component ID from the block name or attributes.
    // Gutenberg omits attributes from serialization when they match
    // their declared default, so componentId may not be in $attrs.
    $component_id = $attrs['componentId'] ?? $this->blockNameToComponentId($block_name);

    if (empty($component_id)) {
      return;
    }

    try {
      $this->componentPluginManager->find($component_id);
    }
    catch (\Exception $e) {
      $block_content = '<!-- SDC not found: ' . $component_id . ' -->';
      return;
    }

    // Grab accumulated slot content from sdc/slot children and clear.
    $slots = $this->pendingSlots;
    $this->pendingSlots = [];

    // Inject slot content as prop values so they render at the
    // {{ slot_name }} position within the template, preserving any
    // wrapper HTML inside {% block %} tags.
    foreach ($slots as $slot_name => $html) {
      $html = trim($html);
      if ($html !== '') {
        $props[$slot_name] = Markup::create($html);
      }
    }

    $build = [
      '#type' => 'component',
      '#component' => $component_id,
      '#props' => $props,
      '#slots' => [],
    ];

    if ($variant) {
      $build['#variant'] = $variant;
    }

    // Render in a dedicated context to properly capture attached libraries
    // (CSS/JS). This matches the pattern used by SdcController::render().
    try {
      $context = new RenderContext();
      $rendered = $this->renderer->executeInRenderContext($context, function () use (&$build) {
        return $this->renderer->render($build);
      });
      $block_content = (string) $rendered;

      // Merge bubbleable metadata (cache + attached libraries) from the
      // render context into the filter's metadata.
      if (!$context->isEmpty()) {
        $bubbleable_metadata->addCacheableDependency($context->pop());
      }
    }
    catch (\Exception $e) {
      $block_content = '<!-- SDC render error: ' . htmlspecialchars($e->getMessage()) . ' -->';
      return FALSE;
    }

    // Halt further processing — the component HTML is complete and other
    // processors (e.g. LayoutProcessor) would corrupt it.
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function isSupported(array $block, $block_content = '') {
    return str_starts_with($block['blockName'] ?? '', 'sdc/');
  }

  /**
   * Converts a Gutenberg block name to an SDC component ID.
   *
   * Block name format: sdc/provider--machine-name.
   * Component ID format: provider:machine_name.
   *
   * This reverses the JS sdcIdToBlockName() conversion.
   *
   * @param string $block_name
   *   The Gutenberg block name (e.g. 'sdc/gutenberg-base--card').
   *
   * @return string
   *   The SDC component ID (e.g. 'gutenberg_base:card').
   */
  protected function blockNameToComponentId(string $block_name): string {
    // Strip the 'sdc/' prefix.
    $name = substr($block_name, 4);

    // Replace '--' with ':' (provider/machine-name separator).
    $name = str_replace('--', ':', $name);

    // Replace '-' with '_' (Drupal machine name convention).
    $name = str_replace('-', '_', $name);

    return $name;
  }

}
