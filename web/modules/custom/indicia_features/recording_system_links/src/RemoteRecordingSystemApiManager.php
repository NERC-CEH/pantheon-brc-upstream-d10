<?php

namespace Drupal\recording_system_links;

use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Plugin\DefaultPluginManager;

/**
 * Provides a remote recording system API plugin manager.
 *
 * @see \Drupal\recording_system_links\Annotation\RemoteRecordingSystemApi
 * @see \Drupal\Core\recording_system_links\RemoteRecordingSystemApiInterfance
 * @see plugin_api
 */
class RemoteRecordingSystemApiManager extends DefaultPluginManager {

  /**
   * Constructs a RemoteRecordingSystemManager object.
   *
   * @param \Traversable $namespaces
   *   An object that implements \Traversable which contains the root paths
   *   keyed by the corresponding namespace to look for plugin implementations.
   * @param \Drupal\Core\Cache\CacheBackendInterface $cache_backend
   *   Cache backend instance to use.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler to invoke the alter hook with.
   */
  public function __construct(\Traversable $namespaces, CacheBackendInterface $cache_backend, ModuleHandlerInterface $module_handler) {
    parent::__construct(
      'Plugin/RemoteRecordingSystemApi',
      $namespaces,
      $module_handler,
      'Drupal\recording_system_links\RemoteRecordingSystemApiInterface',
      'Drupal\recording_system_links\Annotation\RemoteRecordingSystemApi'
    );
    $this->alterInfo('remote_recording_system_api_info');
    $this->setCacheBackend($cache_backend, 'remote_recording_system_api_info_plugins');
  }

}