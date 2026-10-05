<?php

namespace Drupal\gutenberg;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Entity\EntityDisplayRepositoryInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\gutenberg\Controller\UtilsController;
use Drupal\gutenberg\Parser\BlockParser;

/**
 * Builds the fields placed in Gutenberg content by the drupal/field block.
 */
class FieldBlockRenderer {

  /**
   * The block name.
   */
  const BLOCK_NAME = 'drupal/field';

  /**
   * Field types editable in the editor canvas, with their supported widgets.
   */
  const INLINE_EDITABLE = [
    'string' => ['string_textfield'],
    'string_long' => ['string_textarea'],
  ];

  /**
   * The allowed label display options.
   */
  const LABEL_DISPLAYS = ['hidden', 'above', 'inline', 'visually_hidden'];

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The entity display repository.
   *
   * @var \Drupal\Core\Entity\EntityDisplayRepositoryInterface
   */
  protected $entityDisplayRepository;

  /**
   * The Gutenberg content type manager.
   *
   * @var \Drupal\gutenberg\GutenbergContentTypeManager
   */
  protected $contentTypeManager;

  /**
   * FieldBlockRenderer constructor.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\Core\Entity\EntityDisplayRepositoryInterface $entity_display_repository
   *   The entity display repository.
   * @param \Drupal\gutenberg\GutenbergContentTypeManager $content_type_manager
   *   The Gutenberg content type manager.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, EntityDisplayRepositoryInterface $entity_display_repository, GutenbergContentTypeManager $content_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
    $this->entityDisplayRepository = $entity_display_repository;
    $this->contentTypeManager = $content_type_manager;
  }

  /**
   * Whether the entity's bundle can place its fields with the field block.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity.
   *
   * @return bool
   *   TRUE if field blocks are enabled for the entity's content type.
   */
  public function isEnabled(EntityInterface $entity): bool {
    return $entity->getEntityTypeId() === 'node'
      && $this->contentTypeManager->isFieldBlocksEnabled($entity->bundle());
  }

  /**
   * Whether a field can be placed with the field block.
   *
   * @param \Drupal\Core\Entity\FieldableEntityInterface $entity
   *   The entity.
   * @param string $field_name
   *   The field name.
   *
   * @return bool
   *   TRUE if the field exists and isn't the Gutenberg text field.
   */
  public function isPlaceable(FieldableEntityInterface $entity, string $field_name): bool {
    if (!$entity->hasField($field_name)) {
      return FALSE;
    }
    // Rendering the Gutenberg text field in itself would never end.
    $text_fields = UtilsController::getEntityTextFields($entity);
    return empty($text_fields) || $text_fields[0] !== $field_name;
  }

  /**
   * Whether a field is edited in the editor canvas.
   *
   * @param string $field_type
   *   The field type.
   * @param string|null $widget_type
   *   The widget type in the form display.
   *
   * @return bool
   *   TRUE if the field is edited inline.
   */
  public function isInlineEditable(string $field_type, ?string $widget_type): bool {
    return $widget_type && in_array($widget_type, self::INLINE_EDITABLE[$field_type] ?? [], TRUE);
  }

  /**
   * Builds a field of an entity.
   *
   * The formatter comes from the entity's full view display, or the default
   * one when the full display isn't customized. Fields hidden in the display
   * use their type's default formatter.
   *
   * @param \Drupal\Core\Entity\FieldableEntityInterface $entity
   *   The entity.
   * @param string $field_name
   *   The field name.
   * @param string $label_display
   *   The label display: 'hidden', 'above', 'inline' or 'visually_hidden'.
   * @param int $offset
   *   The number of items to skip.
   * @param int $limit
   *   The number of items to show, or 0 to show all.
   *
   * @return array
   *   The render array. Empty if the field has no items to show.
   */
  public function build(FieldableEntityInterface $entity, string $field_name, string $label_display = 'hidden', int $offset = 0, int $limit = 0): array {
    $build = [];
    $cacheability = CacheableMetadata::createFromObject($entity);

    if (!$this->isPlaceable($entity, $field_name)) {
      $cacheability->applyTo($build);
      return $build;
    }

    $access = $entity->get($field_name)->access('view', NULL, TRUE);
    $cacheability->addCacheableDependency($access);
    if (!$access->isAllowed()) {
      $cacheability->applyTo($build);
      return $build;
    }

    if ($offset > 0 || $limit > 0) {
      // Build a copy, so the entity itself keeps all its items.
      $entity = clone $entity;
      $values = $entity->get($field_name)->getValue();
      $entity->get($field_name)->setValue(array_slice($values, max(0, $offset), $limit > 0 ? $limit : NULL));
    }

    $options = $this->getDisplayOptions($entity, $field_name);
    $options['label'] = in_array($label_display, self::LABEL_DISPLAYS, TRUE) ? $label_display : 'hidden';

    $build = $entity->get($field_name)->view($options);
    $cacheability->merge(CacheableMetadata::createFromRenderArray($build))->applyTo($build);

    return $build;
  }

  /**
   * Gets the fields placed in Gutenberg content.
   *
   * @param string|null $content
   *   The Gutenberg content.
   *
   * @return string[]
   *   The placed field names.
   */
  public function getPlacedFields(?string $content): array {
    if (!$content || !str_contains($content, 'wp:' . self::BLOCK_NAME . ' ')) {
      return [];
    }

    $fields = [];
    $collect = function (array $blocks) use (&$collect, &$fields) {
      foreach ($blocks as $block) {
        if (($block['blockName'] ?? '') === self::BLOCK_NAME && !empty($block['attrs']['field'])) {
          $fields[$block['attrs']['field']] = $block['attrs']['field'];
        }
        if (!empty($block['innerBlocks'])) {
          $collect($block['innerBlocks']);
        }
      }
    };
    $collect((new BlockParser())->parse($content));

    return array_values($fields);
  }

  /**
   * Gets the display options for a field.
   *
   * @param \Drupal\Core\Entity\FieldableEntityInterface $entity
   *   The entity.
   * @param string $field_name
   *   The field name.
   *
   * @return array
   *   The display options, without 'type' when the field is hidden.
   */
  protected function getDisplayOptions(FieldableEntityInterface $entity, string $field_name): array {
    // Only use the full display when it's customized. The repository would
    // return an empty, enabled display when it isn't configured.
    /** @var \Drupal\Core\Entity\Display\EntityViewDisplayInterface|null $display */
    $display = $this->entityTypeManager->getStorage('entity_view_display')
      ->load($entity->getEntityTypeId() . '.' . $entity->bundle() . '.full');
    if (!$display || !$display->status()) {
      $display = $this->entityDisplayRepository->getViewDisplay($entity->getEntityTypeId(), $entity->bundle());
    }

    $options = $display->getComponent($field_name) ?? [];
    // The weight and region only apply within the display.
    unset($options['weight'], $options['region']);
    return $options;
  }

}
