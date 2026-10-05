<?php

namespace Drupal\gutenberg\Controller;

use Drupal\Component\Utility\Html;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\gutenberg\FieldBlockRenderer;
use Drupal\gutenberg\Render\FrontendRenderer;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Renders the editor preview of the drupal/field block.
 */
class FieldBlockController extends ControllerBase {

  /**
   * The field block renderer.
   *
   * @var \Drupal\gutenberg\FieldBlockRenderer
   */
  protected $fieldBlockRenderer;

  /**
   * The frontend renderer.
   *
   * @var \Drupal\gutenberg\Render\FrontendRenderer
   */
  protected $frontendRenderer;

  /**
   * FieldBlockController constructor.
   *
   * @param \Drupal\gutenberg\FieldBlockRenderer $field_block_renderer
   *   The field block renderer.
   * @param \Drupal\gutenberg\Render\FrontendRenderer $frontend_renderer
   *   The frontend renderer.
   */
  public function __construct(FieldBlockRenderer $field_block_renderer, FrontendRenderer $frontend_renderer) {
    $this->fieldBlockRenderer = $field_block_renderer;
    $this->frontendRenderer = $frontend_renderer;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('gutenberg.field_block_renderer'),
      $container->get('gutenberg.frontend_renderer'),
    );
  }

  /**
   * Renders a field of an entity for the editor.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request. Body: { entityType, bundle, entityId, field, labelDisplay,
   *   offset, limit, values }. The values are the rows of an inline editable
   *   field's widget in display order, as { delta, value } objects. When set,
   *   they are rendered with a marker for each visible row instead of the
   *   saved values.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response with 'access', 'html', 'css' and 'inline' keys.
   *   'inline' tells whether the HTML has markers for the editable values.
   */
  public function render(Request $request): JsonResponse {
    $data = json_decode($request->getContent(), TRUE) ?: [];
    $field_name = (string) ($data['field'] ?? '');
    $label_display = (string) ($data['labelDisplay'] ?? 'hidden');
    $offset = max(0, (int) ($data['offset'] ?? 0));
    $limit = max(0, (int) ($data['limit'] ?? 0));

    $entity = $this->getEntity($data);
    if (!$entity || !$field_name || !$this->fieldBlockRenderer->isEnabled($entity) || !$this->fieldBlockRenderer->isPlaceable($entity, $field_name)) {
      return $this->error($this->t('The field is not available.'));
    }
    if (!$entity->get($field_name)->access('view')) {
      return $this->error($this->t('You are not allowed to view this field.'));
    }

    $values = $data['values'] ?? NULL;
    if (!is_array($values)) {
      $build = $this->fieldBlockRenderer->build($entity, $field_name, $label_display, $offset, $limit);
      return $this->respond($build, FALSE);
    }

    // Render a marker token in place of each visible row, and swap the tokens
    // for the elements the editor makes editable.
    $rows = $this->getVisibleRows($values, $offset, $limit);
    if (!$rows) {
      return $this->respond([], FALSE);
    }

    $tokens = [];
    $items = [];
    foreach ($rows as $row) {
      $token = 'gutenbergfieldvalue' . bin2hex(random_bytes(8));
      $tokens[$token] = $row;
      $items[] = ['value' => $token];
    }

    $preview = clone $entity;
    $preview->get($field_name)->setValue($items);
    $rendered = $this->frontendRenderer->render(
      $this->fieldBlockRenderer->build($preview, $field_name, $label_display)
    );

    $html = $this->replaceTokens($rendered['html'], $tokens);
    if ($html === NULL) {
      // A formatter changed the token, e.g. by trimming it. Show the values
      // without editing them in place.
      $preview->get($field_name)->setValue(array_map(fn ($row) => ['value' => $row['value']], array_filter($rows, fn ($row) => $row['value'] !== '')));
      $build = $this->fieldBlockRenderer->build($preview, $field_name, $label_display);
      return $this->respond($build, FALSE);
    }

    return new JsonResponse([
      'access' => TRUE,
      'html' => $html,
      'css' => $rendered['css'],
      'inline' => TRUE,
    ]);
  }

  /**
   * Loads the entity, or creates a new one for the bundle.
   *
   * @param array $data
   *   The request data.
   *
   * @return \Drupal\Core\Entity\FieldableEntityInterface|null
   *   The entity, if the user may edit it.
   */
  protected function getEntity(array $data): ?FieldableEntityInterface {
    $entity_type_id = (string) ($data['entityType'] ?? 'node');
    if (!$this->entityTypeManager()->hasDefinition($entity_type_id)) {
      return NULL;
    }
    $storage = $this->entityTypeManager()->getStorage($entity_type_id);

    if (!empty($data['entityId'])) {
      $entity = $storage->load($data['entityId']);
      return $entity instanceof FieldableEntityInterface && $entity->access('update') ? $entity : NULL;
    }

    $bundle = (string) ($data['bundle'] ?? '');
    $bundle_key = $this->entityTypeManager()->getDefinition($entity_type_id)->getKey('bundle');
    if (!$bundle || !$bundle_key) {
      return NULL;
    }
    if (!$this->entityTypeManager()->getAccessControlHandler($entity_type_id)->createAccess($bundle)) {
      return NULL;
    }
    $entity = $storage->create([$bundle_key => $bundle]);
    return $entity instanceof FieldableEntityInterface ? $entity : NULL;
  }

  /**
   * Gets the rows the block shows.
   *
   * The block shows the filled rows in its offset and limit range. Empty rows
   * are added after them while the range isn't full, so new values can be
   * typed in place. When nothing else shows, the first empty row does.
   *
   * @param array $values
   *   The widget rows in display order, as { delta, value } arrays.
   * @param int $offset
   *   The number of items to skip.
   * @param int $limit
   *   The number of items to show, or 0 to show all.
   *
   * @return array
   *   The visible rows, as arrays with 'delta', 'value' and 'empty' keys.
   */
  protected function getVisibleRows(array $values, int $offset, int $limit): array {
    $filled = [];
    $empty = [];
    foreach ($values as $row) {
      if (!is_array($row) || !isset($row['delta']) || !is_numeric($row['delta'])) {
        continue;
      }
      $value = is_string($row['value'] ?? NULL) ? $row['value'] : '';
      $row = ['delta' => (int) $row['delta'], 'value' => $value, 'empty' => trim($value) === ''];
      if ($row['empty']) {
        $empty[] = $row;
      }
      else {
        $filled[] = $row;
      }
    }

    $rows = array_slice($filled, $offset, $limit ?: NULL);
    // Empty rows only follow the last filled item.
    if ($offset <= count($filled) && (!$limit || count($rows) < $limit)) {
      $rows = array_merge($rows, $limit ? array_slice($empty, 0, $limit - count($rows)) : $empty);
    }

    return $rows;
  }

  /**
   * Swaps the marker tokens for the editable elements.
   *
   * @param string $html
   *   The rendered HTML.
   * @param array $tokens
   *   The rows, keyed by their token.
   *
   * @return string|null
   *   The HTML, or NULL if a token is missing from the text.
   */
  protected function replaceTokens(string $html, array $tokens): ?string {
    // Tokens inside tags, e.g. in a title attribute, get the value itself.
    $html = preg_replace_callback('/<[^>]*>/', function ($matches) use ($tokens) {
      return str_replace(
        array_keys($tokens),
        array_map(fn ($row) => Html::escape($row['value']), array_values($tokens)),
        $matches[0]
      );
    }, $html);

    foreach ($tokens as $token => $row) {
      if (!str_contains($html, $token)) {
        return NULL;
      }
      $marker = '<span data-gutenberg-field-value="' . $row['delta'] . '"' . ($row['empty'] ? ' data-empty' : '') . '></span>';
      $html = str_replace($token, $marker, $html);
    }

    return $html;
  }

  /**
   * Renders a build and returns the JSON response.
   *
   * @param array $build
   *   The render array.
   * @param bool $inline
   *   Whether the HTML has markers for the editable values.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   */
  protected function respond(array $build, bool $inline): JsonResponse {
    $rendered = $this->frontendRenderer->render($build);
    return new JsonResponse([
      'access' => TRUE,
      'html' => $rendered['html'],
      'css' => $rendered['css'],
      'inline' => $inline,
    ]);
  }

  /**
   * Returns an error response.
   *
   * @param string|\Drupal\Core\StringTranslation\TranslatableMarkup $message
   *   The message.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   */
  protected function error($message): JsonResponse {
    return new JsonResponse([
      'access' => FALSE,
      'html' => (string) $message,
    ]);
  }

}
