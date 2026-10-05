<?php

namespace Drupal\gutenberg\Render;

use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Security\TrustedCallbackInterface;

/**
 * Keeps track of the entity whose Gutenberg content is being rendered.
 *
 * Gutenberg content is rendered by a text filter, which has no reference to
 * the entity that holds the text. The Gutenberg text field's render element
 * pushes its entity before its items render and pops it afterwards, so block
 * processors can read the fields of the entity they are rendered for.
 *
 * @see gutenberg_entity_display_build_alter()
 */
class EntityRenderContext implements TrustedCallbackInterface {

  /**
   * The entities being rendered, innermost last.
   *
   * @var \Drupal\Core\Entity\FieldableEntityInterface[]
   */
  protected $stack = [];

  /**
   * The current route match.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatch;

  /**
   * EntityRenderContext constructor.
   *
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_match
   *   The current route match.
   */
  public function __construct(RouteMatchInterface $route_match) {
    $this->routeMatch = $route_match;
  }

  /**
   * Starts rendering an entity.
   *
   * @param \Drupal\Core\Entity\FieldableEntityInterface $entity
   *   The entity.
   */
  public function push(FieldableEntityInterface $entity): void {
    $this->stack[] = $entity;
  }

  /**
   * Finishes rendering an entity.
   *
   * @param \Drupal\Core\Entity\FieldableEntityInterface $entity
   *   The entity.
   */
  public function pop(FieldableEntityInterface $entity): void {
    // Remove the innermost occurrence, so an entity left behind by an
    // exception doesn't shift the stack for the others.
    for ($i = count($this->stack) - 1; $i >= 0; $i--) {
      if ($this->stack[$i] === $entity) {
        array_splice($this->stack, $i, 1);
        return;
      }
    }
  }

  /**
   * Gets the entity being rendered.
   *
   * @return \Drupal\Core\Entity\FieldableEntityInterface|null
   *   The innermost entity being rendered, if any.
   */
  public function getEntity(): ?FieldableEntityInterface {
    return end($this->stack) ?: NULL;
  }

  /**
   * Gets the entity of the current route.
   *
   * For content rendered outside its entity's display, e.g. by a text
   * formatter used on its own. Its output then varies by the route.
   *
   * @return \Drupal\Core\Entity\FieldableEntityInterface|null
   *   The entity, if the route has one.
   */
  public function getRouteEntity(): ?FieldableEntityInterface {
    foreach (['node', 'node_preview', 'node_revision'] as $name) {
      $entity = $this->routeMatch->getParameter($name);
      if ($entity instanceof FieldableEntityInterface) {
        return $entity;
      }
    }
    return NULL;
  }

  /**
   * Pre-render callback: pushes the field element's entity.
   *
   * @param array $element
   *   The field render element.
   *
   * @return array
   *   The field render element.
   */
  public static function preRenderField(array $element): array {
    if (($element['#object'] ?? NULL) instanceof FieldableEntityInterface) {
      \Drupal::service('gutenberg.entity_render_context')->push($element['#object']);
    }
    return $element;
  }

  /**
   * Post-render callback: pops the field element's entity.
   *
   * @param string|\Drupal\Component\Render\MarkupInterface $markup
   *   The rendered field.
   * @param array $element
   *   The field render element.
   *
   * @return string|\Drupal\Component\Render\MarkupInterface
   *   The rendered field.
   */
  public static function postRenderField($markup, array $element) {
    if (($element['#object'] ?? NULL) instanceof FieldableEntityInterface) {
      \Drupal::service('gutenberg.entity_render_context')->pop($element['#object']);
    }
    return $markup;
  }

  /**
   * {@inheritdoc}
   */
  public static function trustedCallbacks() {
    return ['preRenderField', 'postRenderField'];
  }

}
