<?php

declare(strict_types=1);

namespace Drupal\gutenberg\Attribute;

use Drupal\Component\Plugin\Attribute\Plugin;
use Drupal\Core\StringTranslation\TranslatableMarkup;

/**
 * Defines a GutenbergPlugin attribute for plugin discovery.
 *
 * Plugin Namespace: Plugin\GutenbergPlugin.
 *
 * @see \Drupal\gutenberg\GutenbergPluginManager
 * @see hook_gutenberg_plugin_info_alter()
 * @see plugin_api
 */
#[\Attribute(\Attribute::TARGET_CLASS)]
class GutenbergPlugin extends Plugin {

  /**
   * Constructs a GutenbergPlugin attribute.
   *
   * @param string $id
   *   The plugin ID.
   * @param \Drupal\Core\StringTranslation\TranslatableMarkup|null $label
   *   (optional) The human-readable name of the Gutenberg plugin.
   */
  public function __construct(
    public readonly string $id,
    public readonly ?TranslatableMarkup $label = NULL,
  ) {}

}
