<?php

namespace Drupal\recording_system_links\Annotation;

use Drupal\Component\Annotation\Plugin;

/**
 * Defines a Plugin annotation object for help page section plugins.
 *
 * @see \Drupal\recording_system_links\RemoteRecordingSystemApiInterface
 * @see \Drupal\recording_system_links\RemoteRecordingSystemApiManager
 * @see hook_help_section_info_alter()
 * @see plugin_api
 *
 * @Annotation
 */
class RemoteRecordingSystemApi extends Plugin {

  /**
   * The plugin ID.
   *
   * @var string
   */
  public $id;

  /**
   * The text to use as the title of plugin.
   *
   * @var \Drupal\Core\Annotation\Translation
   *
   * @ingroup plugin_translatable
   */
  public $title;

}
