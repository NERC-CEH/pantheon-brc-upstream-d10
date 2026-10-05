<?php

namespace Drupal\gutenberg\Controller;

use Drupal\Component\Utility\Html;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\Markup;
use Drupal\Core\Theme\ComponentPluginManager;
use Drupal\gutenberg\Render\FrontendRenderer;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Returns responses for SDC (Single Directory Components) routes.
 */
class SdcController extends ControllerBase {

  /**
   * The component plugin manager.
   *
   * @var \Drupal\Core\Theme\ComponentPluginManager
   */
  protected $componentPluginManager;

  /**
   * The frontend renderer.
   *
   * @var \Drupal\gutenberg\Render\FrontendRenderer
   */
  protected $frontendRenderer;

  /**
   * SdcController constructor.
   *
   * @param \Drupal\Core\Theme\ComponentPluginManager $component_plugin_manager
   *   The component plugin manager.
   * @param \Drupal\gutenberg\Render\FrontendRenderer $frontend_renderer
   *   The frontend renderer.
   */
  public function __construct(
    ComponentPluginManager $component_plugin_manager,
    FrontendRenderer $frontend_renderer,
  ) {
    $this->componentPluginManager = $component_plugin_manager;
    $this->frontendRenderer = $frontend_renderer;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('plugin.manager.sdc'),
      $container->get('gutenberg.frontend_renderer'),
    );
  }

  /**
   * Returns JSON with all available SDC definitions.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   */
  public function definitions(): JsonResponse {
    $definitions = [];

    foreach ($this->componentPluginManager->getDefinitions() as $id => $plugin_definition) {
      try {
        $component = $this->componentPluginManager->find($id);
      }
      catch (\Exception $e) {
        continue;
      }

      $metadata = $component->metadata;

      // Skip internal components. The id, noUi and variants metadata
      // properties were added in Drupal 11, so they are read from the plugin
      // definition, which they are copied from.
      if (!empty($plugin_definition['noUi'])) {
        continue;
      }

      // Skip deprecated/obsolete components.
      if (!in_array($metadata->status, ['stable', 'experimental'])) {
        continue;
      }

      // Read CSS content from the component's CSS files.
      $css_content = $this->frontendRenderer->resolveLibraryCssContent([$component->getLibraryName()]);

      // Read thumbnail SVG content if available.
      $svg_path = $metadata->path . '/thumbnail.svg';
      $thumbnail_svg = file_exists($svg_path) ? file_get_contents($svg_path) : '';

      $definitions[$id] = [
        'id' => $id,
        'machineName' => $metadata->machineName,
        'name' => (string) $metadata->name,
        'description' => (string) $metadata->description,
        'group' => (string) $metadata->group,
        'status' => $metadata->status,
        'schema' => $metadata->schema,
        'slots' => $metadata->slots,
        'variants' => $plugin_definition['variants'] ?? [],
        'thumbnailSvg' => $thumbnail_svg,
        'css' => $css_content,
      ];
    }

    return new JsonResponse($definitions);
  }

  /**
   * Renders an SDC with given props and returns HTML.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request. Body: { componentId, props, variant, slots, editMode }.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response with access and html keys.
   */
  public function render(Request $request): JsonResponse {
    $data = json_decode($request->getContent(), TRUE);
    $component_id = $data['componentId'] ?? '';
    $props = $data['props'] ?? [];
    $variant = $data['variant'] ?? NULL;
    $slots_content = $data['slots'] ?? [];
    $edit_mode = $data['editMode'] ?? FALSE;

    if (empty($component_id)) {
      return new JsonResponse([
        'access' => FALSE,
        'html' => 'Missing componentId.',
      ]);
    }

    try {
      $component = $this->componentPluginManager->find($component_id);
    }
    catch (\Exception $e) {
      return new JsonResponse([
        'access' => FALSE,
        'html' => 'Component not found: ' . $component_id,
      ]);
    }

    // In edit mode, wrap inline-editable string props in marker spans.
    if ($edit_mode) {
      $schema = $component->metadata->schema;
      $props = $this->wrapInlineEditableProps($props, $schema);
    }

    // In edit mode, inject slot markers as prop values so they render at the
    // {{ slot_name }} variable position within the template, preserving any
    // wrapper HTML inside {% block %} tags.
    if ($edit_mode && !empty($component->metadata->slots)) {
      foreach ($component->metadata->slots as $slot_name => $slot_def) {
        $label = $slot_def['title'] ?? $slot_name;
        $props[$slot_name] = Markup::create(
          '<div data-sdc-slot="' . Html::escape($slot_name) . '" data-sdc-slot-label="' . Html::escape($label) . '"></div>'
        );
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

    // Convert slot content (HTML strings) into render arrays.
    foreach ($slots_content as $slot_name => $slot_html) {
      $build['#slots'][$slot_name] = [
        '#markup' => Markup::create($slot_html),
      ];
    }

    try {
      // Render using the default (frontend) theme for accurate preview.
      $rendered = $this->frontendRenderer->render($build);

      return new JsonResponse([
        'access' => TRUE,
        'html' => $rendered['html'],
        'css' => $rendered['css'],
      ]);
    }
    catch (\Exception $e) {
      return new JsonResponse([
        'access' => FALSE,
        'html' => 'Error rendering component: ' . $e->getMessage(),
      ]);
    }
  }

  /**
   * Wraps inline-editable string prop values in marker spans.
   *
   * Only plain string props (no format: uri, no enum, no contentMediaType)
   * are wrapped. The Markup object ensures Twig outputs raw HTML.
   *
   * @param array $props
   *   The prop values.
   * @param array|null $schema
   *   The component's JSON Schema for props.
   *
   * @return array
   *   The props with inline-editable values wrapped.
   */
  protected function wrapInlineEditableProps(array $props, ?array $schema): array {
    if (empty($schema['properties'])) {
      return $props;
    }

    foreach ($props as $name => $value) {
      if (!is_string($value) || $value === '') {
        continue;
      }

      $prop_schema = $schema['properties'][$name] ?? NULL;
      if (!$prop_schema) {
        continue;
      }

      if (!$this->isInlineEditable($prop_schema)) {
        continue;
      }

      $props[$name] = Markup::create(
        '<span data-sdc-prop="' . Html::escape($name) . '">' . Html::escape($value) . '</span>'
      );
    }

    return $props;
  }

  /**
   * Determines whether a prop should be inline-editable (RichText).
   *
   * @param array $prop_schema
   *   The JSON Schema definition for the prop.
   *
   * @return bool
   *   TRUE if the prop should be inline-editable.
   */
  protected function isInlineEditable(array $prop_schema): bool {
    $types = (array) ($prop_schema['type'] ?? []);

    // Must include 'string' type.
    if (!in_array('string', $types)) {
      return FALSE;
    }

    // Enums use a select control, not inline editing.
    if (!empty($prop_schema['enum'])) {
      return FALSE;
    }

    // URI/email props are attribute values, not text content.
    $format = $prop_schema['format'] ?? '';
    if (in_array($format, ['uri', 'uri-reference', 'email'])) {
      return FALSE;
    }

    // Props with contentMediaType need special handling.
    if (!empty($prop_schema['contentMediaType'])) {
      return FALSE;
    }

    return TRUE;
  }

}
