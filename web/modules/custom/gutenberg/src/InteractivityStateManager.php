<?php

namespace Drupal\gutenberg;

/**
 * Static accumulator for Interactivity API server-side state.
 *
 * Blocks that use wp_interactivity_state() in WordPress store their
 * server-side state here. After all blocks are processed, this state
 * is serialized into a <script type="application/json"> tag that the
 * Interactivity API runtime reads during initialization.
 *
 * @see \Drupal\gutenberg\Plugin\Filter\GutenbergFilter::process()
 */
class InteractivityStateManager {

  /**
   * Accumulated interactivity state data keyed by namespace.
   *
   * @var array
   */
  protected static array $state = [];

  /**
   * Add state data for an interactivity namespace.
   *
   * @param string $namespace
   *   The interactivity namespace (e.g. 'core/tabs/private').
   * @param array $data
   *   Key-value pairs to merge into the namespace state.
   */
  public static function addState(string $namespace, array $data): void {
    if (!isset(static::$state[$namespace])) {
      static::$state[$namespace] = [];
    }
    static::$state[$namespace] = array_merge_recursive(
      static::$state[$namespace],
      $data
    );
  }

  /**
   * Get accumulated state and reset the accumulator.
   *
   * @return array
   *   The accumulated state keyed by namespace, or empty array.
   */
  public static function getAndResetState(): array {
    $state = static::$state;
    static::$state = [];
    return $state;
  }

}
