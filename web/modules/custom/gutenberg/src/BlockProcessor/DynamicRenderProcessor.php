<?php

namespace Drupal\gutenberg\BlockProcessor;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Render\Markup;
use Drupal\Core\Render\RendererInterface;
use Drupal\gutenberg\GutenbergLibraryManagerInterface;

/**
 * Processes blocks which can be rendered dynamically server-side.
 */
class DynamicRenderProcessor implements GutenbergBlockProcessorInterface {

  /**
   * The Gutenberg library manager.
   *
   * @var \Drupal\gutenberg\GutenbergLibraryManagerInterface
   */
  protected $libraryManager;

  /**
   * The renderer.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * Array of dynamic block names.
   *
   * @var array
   */
  protected $dynamicBlocks;

  /**
   * The module handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * DynamicRenderProcessor constructor.
   *
   * @param \Drupal\gutenberg\GutenbergLibraryManagerInterface $library_manager
   *   The Gutenberg library manager.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler.
   */
  public function __construct(
    GutenbergLibraryManagerInterface $library_manager,
    RendererInterface $renderer,
    ModuleHandlerInterface $module_handler,
  ) {
    $this->libraryManager = $library_manager;
    $this->renderer = $renderer;
    $this->moduleHandler = $module_handler;
  }

  /**
   * {@inheritdoc}
   */
  public function processBlock(array &$block, &$block_content, RefinableCacheableDependencyInterface $bubbleable_metadata) {
    // The block content built from innerContent includes the block's own outer
    // wrapper HTML (e.g. '<div class="wp-block-column">'). Templates that
    // provide their own outer wrapper should use {{ inner_content }} to avoid
    // double-wrapping. {{ block_content }} retains the full serialized HTML.
    $inner_content = $block['innerContent'] ?? [];
    $inner_html = $this->extractInnerHtml($block_content, $inner_content);
    $is_container = in_array(NULL, $inner_content, TRUE);

    $wrapper_tag = 'div';
    $trimmed = trim($block_content);
    if (preg_match('/^<(\w+)/', $trimmed, $matches)) {
      $wrapper_tag = $matches[1];
    }

    $build = [
      '#theme' => 'gutenberg_block',
      '#block_name' => $block['blockName'],
      '#block_attributes' => $block['attrs'],
      '#block_content' => [
        // @todo @codebymikey: Review whether this might be susceptible to XSS.
        // I don't think it should.
        '#markup' => Markup::create($block_content),
      ],
      '#inner_content' => [
        '#markup' => Markup::create($inner_html),
      ],
      '#wrapper_tag' => $wrapper_tag,
      '#is_container' => $is_container,
      '#block' => $block,
      '#pre_render' => [],
    ];

    // If an alter hook wants to modify the block contents, it can append
    // several #pre_render hooks, or appropriate #cache tags.
    $block_name = str_replace('-', '_', $block['blockName']);
    $block_parts = explode('/', $block_name);
    $hooks = [
      'gutenberg_block_view',
    ];

    $base_hook = 'gutenberg_block_view__';
    $hooks[] = $base_hook . $block_parts[0];
    if (count($block_parts) === 2) {
      // namespace/blockname format.
      $hooks[] = $base_hook . $block_parts[0] . '__' . $block_parts[1];
    }

    $this->moduleHandler->alter($hooks, $build, $block_content);

    $block_content = $this->renderer->render($build);

    $bubbleable_metadata->addCacheableDependency(
      CacheableMetadata::createFromRenderArray($build)
    );
  }

  /**
   * {@inheritdoc}
   */
  public function isSupported(array $block, $block_content = '') {
    return isset($this->getDynamicBlockNames()[$block['blockName']]);
  }

  /**
   * Extracts inner HTML by stripping the block's own outer wrapper.
   *
   * The block content built from innerContent includes the block's own outer
   * wrapper. Templates that provide their own wrapper via {{ attributes }}
   * should use {{ inner_content }} which is the result of this method.
   *
   * Two cases are handled:
   *   - Blocks WITH inner blocks: innerContent has null placeholders. The
   *     first and last non-empty string chunks are the exact opening/closing
   *     wrapper fragments; they are stripped from $block_content precisely.
   *   - Leaf blocks (no inner blocks): the entire content is a single wrapped
   *     element (e.g. '<p>text</p>'). The outermost element is stripped using
   *     the position of the first '>' and the last '</'.
   *
   * @param string $block_content
   *   The rendered block content (including the block's own outer wrapper).
   * @param array $inner_content
   *   The block's innerContent array from the parser.
   *
   * @return string
   *   The inner HTML, without the block's own outer wrapper.
   */
  protected function extractInnerHtml(string $block_content, array $inner_content): string {
    if (in_array(NULL, $inner_content, TRUE)) {
      // Block has inner blocks. The first and last non-empty string chunks
      // from innerContent are the exact wrapper fragments concatenated into
      // $block_content — strip them precisely.
      $first_string = NULL;
      $last_string = NULL;
      foreach ($inner_content as $chunk) {
        if (is_string($chunk) && $chunk !== '') {
          if ($first_string === NULL) {
            $first_string = $chunk;
          }
          $last_string = $chunk;
        }
      }

      // No distinct opening/closing wrapper to strip.
      if ($first_string === NULL || $first_string === $last_string) {
        return $block_content;
      }

      $result = $block_content;

      if (str_starts_with($result, $first_string)) {
        $result = substr($result, strlen($first_string));
      }

      if (str_ends_with($result, $last_string)) {
        $result = substr($result, 0, strlen($result) - strlen($last_string));
      }

      return $result;
    }

    // Leaf block (no inner blocks). Strip the outermost HTML element so
    // templates can wrap the text/markup in their own element via attributes.
    $trimmed = trim($block_content);
    $first_close = strpos($trimmed, '>');
    $last_open = strrpos($trimmed, '</');
    if ($first_close !== FALSE && $last_open !== FALSE && $last_open > $first_close) {
      return substr($trimmed, $first_close + 1, $last_open - $first_close - 1);
    }

    return $block_content;
  }

  /**
   * List of dynamic Gutenberg blocks.
   *
   * @return array
   *   List of of dynamic block names.
   */
  protected function getDynamicBlockNames() {
    if ($this->dynamicBlocks === NULL) {
      $this->dynamicBlocks = [];
      foreach ($this->libraryManager->getDefinitions() as $definition) {
        foreach ($definition['dynamic-blocks'] as $block_name => $block_theme_definition) {
          $this->dynamicBlocks[$block_name] = $block_name;
        }
      }
    }

    return $this->dynamicBlocks;
  }

}
