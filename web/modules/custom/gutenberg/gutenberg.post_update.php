<?php

/**
 * @file
 * Post update functions for Gutenberg.
 */

use Drupal\Component\Utility\Crypt;
use Drupal\Core\Config\Entity\ConfigDependencyManager;
use Drupal\Core\Config\FileStorage;
use Drupal\Core\Config\InstallStorage;
use Drupal\Core\Config\StorageInterface;
use Drupal\views\Entity\View;

/**
 * Add access restriction to reusable blocks view.
 */
function gutenberg_post_update_reusable_block_view_access() {
  if (\Drupal::moduleHandler()->moduleExists('views')) {
    if ($view = View::load('reusable_blocks')) {
      $display = &$view->getDisplay('default');
      if (!isset($display['display_options']['access']['type']) || $display['display_options']['access']['type'] === 'none') {
        $display['display_options']['access'] = [
          'type' => 'perm',
          'options' => ['perm' => 'use gutenberg'],
        ];
        $view->save();
      }
    }
  }
}

/**
 * Fix youtube and instagram oEmbed processor.
 */
function gutenberg_post_update_fix_youtube_instagram_oembed_processor(&$sandbox) {
  $filterFormatStorage = \Drupal::entityTypeManager()->getStorage('filter_format');
  /** @var \Drupal\filter\Entity\FilterFormat $format */
  foreach ($filterFormatStorage->loadMultiple() as $format) {
    /** @var \Drupal\filter\Plugin\FilterInterface $filter */
    foreach ($format->filters()->getIterator() as $instanceId => $filter) {
      if ($filter->getPluginId() === 'gutenberg') {
        $configuration = $filter->getConfiguration();
        if (isset($configuration['settings']['processor_settings']['oembed']['providers'])) {
          $providers = $configuration['settings']['processor_settings']['oembed']['providers'];

          // Change the Youtube oEmbed endpoint to use HTTPS.
          $providers = str_replace('http://www.youtube.com/oembed', 'https://www.youtube.com/oembed', $providers);

          // Remove the deprecated instagram endpoint, since it requires proper
          // authentication now and cannot straightforwardly used anymore.
          $providers = str_replace("#https?://(www\.)?instagram.com/p/.*#i | https://api.instagram.com/oembed | true\r\n", '', $providers);

          // Store the changed providers.
          $configuration['settings']['processor_settings']['oembed']['providers'] = $providers;
          $format->setFilterConfig($instanceId, $configuration);
        }

        $format->save();
      }
    }
  }
}

/**
 * Normalize array values within the "gutenberg.settings" config.
 */
function gutenberg_post_update_normalize_gutenberg_settings(&$sandbox) {
  // Pick up the new config schema.
  \Drupal::service('config.typed')->clearCachedDefinitions();
  $gutenberg_settings = Drupal::configFactory()->getEditable('gutenberg.settings');
  $raw_data = $gutenberg_settings->getRawData();
  foreach ($raw_data as $key => $raw_datum) {
    if (
      str_ends_with($key, '_allowed_blocks') ||
      str_ends_with($key, '_allowed_drupal_blocks') ||
      str_ends_with($key, '_allowed_content_block_types') ||
      str_ends_with($key, '_allowed_image_styles')
    ) {
      $data = (array) $raw_datum;
      // Convert into a normalized, sorted array list. Removing empty values.
      $data = array_unique(array_filter($data));
      sort($data, SORT_FLAG_CASE);
      $raw_data[$key] = $data;
    }
  }
  ksort($raw_data, SORT_ASC);
  // Save the normalized config.
  $gutenberg_settings
    ->setData($raw_data)
    ->save();

  // Delete redundant mediaedit config.
  \Drupal::configFactory()->getEditable('gutenberg.mediaedit')->delete();
}

/**
 * Add "Patterns and synced patterns" configuration dependencies.
 */
function gutenberg_post_update_install_missing_configurations(&$sandbox) {
  $output = [];
  // Known configs.
  $configs = [
    'taxonomy.vocabulary.pattern_categories',
    'field.storage.block_content.field_pattern_category',
    'field.storage.block_content.field_pattern_sync_status',
    'field.field.block_content.reusable_block.field_pattern_category',
    'field.field.block_content.reusable_block.field_pattern_sync_status',
    'core.entity_form_display.taxonomy_term.pattern_categories.default',
    'core.entity_view_display.block_content.reusable_block.default',
    'views.view.reusable_blocks',
  ];

  // Simple config updates.
  $updated_configs = [
    'block_content.type.reusable_block' => [
      'label' => 'Pattern',
      'description' => 'Build your pattern on Gutenberg editor and re-use it everywhere.',
    ],
    'system.action.reusable_block_delete_action' => [
      'label' => 'Delete pattern',
    ],
    'core.entity_form_display.block_content.reusable_block.default' => [
      'content.field_pattern_category' => [
        'type' => 'entity_reference_autocomplete_tags',
        'weight' => 1,
        'region' => 'content',
        'settings' => [
          'match_operator' => 'CONTAINS',
          'match_limit' => 10,
          'size' => 60,
          'placeholder' => '',
        ],
        'third_party_settings' => [],
      ],
      'content.field_pattern_sync_status' => [
        'type' => 'options_select',
        'weight' => 3,
        'region' => 'content',
        'settings' => [],
        'third_party_settings' => [],
      ],
    ],
    'core.entity_view_display.block_content.reusable_block.reusable_block' => [
      'status' => FALSE,
    ],
    'field.field.block_content.reusable_block.body' => [
      'settings.required_summary' => FALSE,
      'settings.allowed_formats' => [
        'plain_text',
      ],
    ],
  ];
  $updated_configs = _gutenberg_update_configs($updated_configs);
  $output[] = sprintf('Updated configs: %s', implode(', ', $updated_configs['updated_configs']));

  $installed_configs = _gutenberg_install_configurations($configs);
  $output[] = sprintf('Installed configs: %s', implode(', ', $installed_configs['created_configs']));

  $output = array_merge($output, _gutenberg_update_default_config([
    'views.view.reusable_blocks',
  ]));

  return implode("\n", $output);
}

/**
 * Update default sync status field on reusable_blocks block entities.
 */
function gutenberg_post_update_update_default_reusable_block_fields(&$sandbox) {
  // Update sync status field for all existing reusable blocks.
  $query = \Drupal::entityQuery('block_content')
    ->condition('type', 'reusable_block')
    ->accessCheck(FALSE);
  $ids = $query->execute();
  $storage = \Drupal::entityTypeManager()->getStorage('block_content');
  // @todo should ideally use the sandbox to paginate this.
  $blocks = $storage->loadMultiple($ids);
  foreach ($blocks as $block) {
    $block->set('field_pattern_sync_status', 'synced');
    $block->save();
  }
}

/**
 * Add the core/missing block.
 */
function gutenberg_post_update_add_core_missing_block(&$sandbox) {
  // Pick up the new config schema.
  \Drupal::service('config.typed')->clearCachedDefinitions();
  $gutenberg_settings = Drupal::configFactory()->getEditable('gutenberg.settings');
  $raw_data = $gutenberg_settings->getRawData();
  foreach ($raw_data as $key => $raw_datum) {
    if (str_ends_with($key, '_allowed_blocks')) {
      if (!$raw_datum) {
        continue;
      }
      $data = (array) $raw_datum;
      // Add the missing core/missing block.
      $data[] = 'core/missing';
      // Convert into a normalized, sorted array list. Removing empty values.
      $data = array_unique(array_filter($data));
      sort($data, SORT_FLAG_CASE);
      $raw_data[$key] = $data;
    }
  }
  ksort($raw_data, SORT_ASC);
  // Save the normalized config.
  $gutenberg_settings
    ->setData($raw_data)
    ->save();
}

/**
 * Remove the grid style options from the responsive grid of reusable blocks.
 */
function gutenberg_post_update_reusable_blocks_view_grid_options() {
  $view = \Drupal::configFactory()->getEditable('views.view.reusable_blocks');
  if ($view->isNew()) {
    return;
  }
  // Options of the grid style, not in the schema of the responsive grid.
  $grid_options = [
    'automatic_width',
    'row_class_custom',
    'row_class_default',
    'col_class_custom',
    'col_class_default',
  ];
  $changed = FALSE;
  foreach (array_keys($view->get('display') ?? []) as $display_id) {
    $style = "display.$display_id.display_options.style";
    if ($view->get("$style.type") !== 'grid_responsive') {
      continue;
    }
    foreach ($grid_options as $option) {
      if ($view->get("$style.options.$option") !== NULL) {
        $view->clear("$style.options.$option");
        $changed = TRUE;
      }
    }
  }
  if ($changed) {
    $view->save();
  }
}

/**
 * Install new Gutenberg configs.
 *
 * @param array $configs
 *   A list of configurations to install. If this is empty, then all missing
 *   configurations will be installed. However, this is not recommended as
 *   update hooks should be idempotent and not change if new configs are added
 *   in the future.
 * @param bool $check_existing
 *   Whether to check if the configuration exists before attempting to write to
 *   it.
 *
 * @return array
 *   The list of newly installed configurations.
 */
function _gutenberg_install_configurations(array $configs, $check_existing = TRUE) {
  $default_install_path = \Drupal::service('extension.list.module')->getPath('gutenberg') . '/' . InstallStorage::CONFIG_INSTALL_DIRECTORY;
  $storage = new FileStorage($default_install_path, StorageInterface::DEFAULT_COLLECTION);
  if (empty($configs)) {
    $configs = $storage->listAll();
  }
  $config_to_create = $storage->readMultiple($configs);

  /** @var \Drupal\Core\Config\StorageInterface $config_storage */
  $config_storage = \Drupal::service('config.storage');

  /** @var \Drupal\Core\Config\StorageInterface $sync_storage */
  $sync_storage = \Drupal::service('config.storage.sync');

  /** @var \Drupal\Core\Config\ConfigManagerInterface $config_manager */
  $config_manager = \Drupal::service('config.manager');

  $dependency_manager = new ConfigDependencyManager();
  $config_names = $dependency_manager
    ->setData($config_to_create)
    ->sortAll();

  $created_configs = [];

  foreach ($config_names as $config_name) {
    if (($check_existing && ($config_storage->exists($config_name) && !_gutenberg_config_is_default($config_name)))) {
      continue;
    }

    unset($config_to_create[$config_name]['_core'], $config_to_create[$config_name]['uuid']);
    $config_to_create[$config_name] = [
      '_core' => [
        'default_config_hash' => Crypt::hashBase64(serialize($config_to_create[$config_name])),
      ],
    ] + $config_to_create[$config_name];

    // Attempt to persist the UUID if it's already been exported to the config
    // sync directory.
    $sync_data = $sync_storage->read($config_name);
    if (isset($sync_data['uuid'])) {
      $config_to_create[$config_name]['uuid'] = $sync_data['uuid'];
    }

    // Create the config.
    if ($entity_type_id = $config_manager->getEntityTypeIdByName($config_name)) {
      // Use the entity API to create config entities.
      /** @var \Drupal\Core\Config\Entity\ConfigEntityStorageInterface $entity_storage */
      $entity_storage = \Drupal::entityTypeManager()
        ->getStorage($entity_type_id);
      $entity_id = $entity_storage::getIDFromConfigName($config_name, $entity_storage->getEntityType()->getConfigPrefix());
      $entity = $entity_storage->load($entity_id);
      if ($entity) {
        $entity = $entity_storage->updateFromStorageRecord($entity, $config_to_create[$config_name]);
      }
      else {
        $entity = $entity_storage
          ->createFromStorageRecord($config_to_create[$config_name]);
      }
      if ($entity->isInstallable()) {
        $entity->trustData()->save();
        $created_configs[] = $config_name;
      }
    }
    else {
      if ($config_storage->write($config_name, $config_to_create[$config_name])) {
        $created_configs[] = $config_name;
      }
    }
  }

  return [
    'created_configs' => $created_configs,
    'ignored_configs' => array_values(array_diff($configs, $created_configs)),
  ];
}

/**
 * Update the existing config data.
 *
 * @param array $configs
 *   An array mapping of config names to updated config data.
 *
 * @return array
 *   A list of updated configs.
 */
function _gutenberg_update_configs($configs) {
  $updated = [];
  foreach ($configs as $config_name => $data) {
    $config = \Drupal::configFactory()->getEditable($config_name);
    if ($config->isNew()) {
      continue;
    }
    foreach ($data as $key => $value) {
      $config->set($key, $value);
    }
    $config->save();
    $updated[] = $config_name;
  }

  return [
    'updated_configs' => $updated,
    'ignored_configs' => array_values(array_diff(array_keys($configs), $updated)),
  ];
}

/**
 * Attempt an automated update of a default configuration.
 */
function _gutenberg_update_default_config(array $config_names) {
  $output = [];
  foreach ($config_names as $config_name) {
    if (_gutenberg_config_is_default($config_name)) {
      $output[] = "MANUAL IMPORT REQUIRED FOR: $config_name. Manually reimport from gutenberg/config/install/$config_name.yml";
      continue;
    }
    $installed = _gutenberg_install_configurations([$config_name], FALSE);
    if (empty($installed['created_configs'])) {
      $output[] = "Could not import: $config_name. Manually reimport from gutenberg/config/install/$config_name.yml";
    }
  }

  return $output;
}

/**
 * Checks whether a configuration has been overridden.
 */
function _gutenberg_config_is_default($config_name) {
  // Get an editable config object here so that properties can be cleared before
  // serialization. Just be sure to not save()!
  $config = \Drupal::configFactory()->getEditable($config_name);
  $default_config_hash = $config->get('_core.default_config_hash');
  // If the default config hash doesn't exist, then the config was overridden.
  if ($default_config_hash === NULL) {
    return FALSE;
  }

  // Clear properties that are not part of the original file.
  $config->clear('uuid')
    ->clear('_core');
  $config_string = serialize($config->getRawData());
  return Crypt::hashBase64($config_string) === $default_config_hash;
}
