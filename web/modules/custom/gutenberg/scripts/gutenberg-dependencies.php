#!/usr/bin/env php
<?php

/**
 * @file
 * Gets Gutenberg dependencies.
 */

use Symfony\Component\Yaml\Yaml;
use Drupal\gutenberg\ScanDir;

$_GUTENBERG_HELP = <<<EOL

Generates Gutenberg's info.yml library dependencies.

EOL;
require_once __DIR__ . '/_cli_include.inc.php';
require_once __DIR__ . '/utils.inc.php';

/**
 * Gets the Drupal root directory.
 *
 * @return string
 *   The id.
 */
function get_asset_id($asset) {
  $suffix = '';

  $asset_ids = [
    "components/style$suffix.css" => "wp-components-css",
    "block-editor/content$suffix.css" => "wp-block-editor-content-css",
    "block-editor/style$suffix.css" => "wp-block-editor-css",
    "nux/style$suffix.css" => "wp-nux-css",
    "reusable-blocks/style$suffix.css" => "wp-reusable-blocks-css",
    "patterns/style$suffix.css" => "wp-patterns-css",
    "editor/style$suffix.css" => "wp-editor-css",
    "block-library/editor$suffix.css" => "wp-edit-blocks-css",
    "block-library/reset$suffix.css" => "wp-reset-editor-styles-css",
    "block-library/style$suffix.css" => "wp-block-library-css",
    "format-library/style$suffix.css" => "wp-format-library-css",
    "block-directory/style$suffix.css" => "wp-block-directory-css",
    "edit-post/style$suffix.css" => "wp-edit-post-css",
  ];

  return isset($asset_ids[$asset]) ? $asset_ids[$asset] : null;
}

require_once get_drupal_root_directory() . '/autoload.php';
// Could require bootstrap but maybe it's a "overkill"...?
require_once __DIR__ . '/../src/ScanDir.php';

$gutenberg_vendor_dir = realpath(dirname(__DIR__) . '/js/vendor/gutenberg');
$gutenberg_libraries_file = __DIR__ . '/../gutenberg.libraries.yml';

$preserved_libraries = [
  // Global/3rd party libraries.
  'react', 'react-dom', 'lodash', 'moment', 'sprintf', 'regenerator-runtime', 'polyfill',
  // Drupal Gutenberg libraries (preserved entries that are NOT auto-generated).
  'admin', 'claro', 'gin', 'default-admin', 'olivero', 'blocks-edit', 'blocks-view',
  'drupal-block-settings', 'special-media-selection', 'media-attributes',
  'dashicons', 'drupal.dialog.sidebar', 'drupal-content-block-utils',
  'format-library', 'commands', 'core-commands', 'interactivity',
];
// Manually-managed pre-built bundle (index.min.js only, no index.asset.php).
$ignore_dirs = ['interactivity'];

$original_yaml = Yaml::parse(file_get_contents($gutenberg_libraries_file));
$yaml = [];
// Keep only the preserved libraries, anything else will be generated
// and picked up from the Gutenberg dependency.
// This is required when switching between Gutenberg JS versions.
foreach ($preserved_libraries as $preserved_library) {
  if (isset($original_yaml[$preserved_library])) {
    $yaml[$preserved_library] = $original_yaml[$preserved_library];
  }
}
$directories = scandir($gutenberg_vendor_dir);
$directories = array_diff($directories, $ignore_dirs);

$packages = [];

foreach ($directories as $directory) {
  if ($directory !== NULL && isset($directory[0]) && $directory[0] !== '.') {
    $packages[] = $directory;
  }
}

foreach ($packages as $package) {
  unset($yaml[$package]);

  $package_settings = require $gutenberg_vendor_dir . DIRECTORY_SEPARATOR . $package . DIRECTORY_SEPARATOR . 'index.asset.php';
  $deps = $package_settings['dependencies'];
  $version = $package_settings['version'];

  $asset_prefix = "js/vendor/gutenberg/$package/";
  $js_files = ScanDir::scan($gutenberg_vendor_dir . DIRECTORY_SEPARATOR . $package, 'js');
  $css_files = ScanDir::scan($gutenberg_vendor_dir . DIRECTORY_SEPARATOR . $package, 'css');

  $yaml[$package] = [];
  // $yaml[$package]['version'] = "\'{$version}\'";
  $yaml[$package]['js'] = [];
  foreach ($js_files as $file) {
    if (str_contains($file, '.js') && !str_contains($file, '.min.js') && !str_contains($file, '.asset.')) {
      $yaml[$package]['js'][$asset_prefix . $file] = [];
    }
  }

  // $yaml[$package]['css'] = [$style_level => []];
  // $yaml[$package]['css'] = [];
  foreach ($css_files as $file) {
    $style_level = 'component';

    if (str_contains($file, 'reset')) {
      $style_level = 'base';
    }
  
    if (str_contains($file, 'theme')) {
      $style_level = 'theme';
    }
  
    if (!strpos($file, '-rtl')) {
      $css_id = get_asset_id("$package/$file");
      $yaml[$package]['css'][$style_level][$asset_prefix . $file] = isset($css_id) ? [
        'preprocess' => FALSE,
        'attributes' => [
          'id' => $css_id,
        ],
      ]: [];
    }
  }

  foreach ($deps as $dep) {
    $dep = str_replace('wp-', '', $dep);
    // Skip subpath dependencies (e.g. vips/worker) — Drupal libraries don't support subpaths.
    if (str_contains($dep, '/')) {
      continue;
    }
    $yaml[$package]['dependencies'][] = 'gutenberg/' . $dep;
  }
}

// Customize editor package sources.
if (isset($yaml['editor'])) {
  unset($yaml['editor']['css']['theme']['js/vendor/gutenberg/editor/editor-styles.css']);
}

// Customize i18n package sources.
// js/i18n.js replaces the vendor i18n with Drupal-compatible functions (Drupal.t, etc.).
// js/drupal-gutenberg-translations.js provides translation data.
if (isset($yaml['i18n'])) {
  $yaml['i18n']['js'] = [
    'js/i18n.js' => [],
    'js/drupal-gutenberg-translations.js' => [],
  ];
  $yaml['i18n']['dependencies'][] = 'gutenberg/sprintf';
}

// Customize api-fetch package sources.
// js/api-fetch.js replaces the vendor apiFetch with Drupal-compatible API handlers.
// Must load right after vendor api-fetch so all other packages see the override.
if (isset($yaml['api-fetch'])) {
  $yaml['api-fetch']['js']['js/api-fetch.js'] = [];
  $yaml['api-fetch']['dependencies'][] = 'core/jquery';
  $yaml['api-fetch']['dependencies'][] = 'core/drupal';
}

// Customize url package sources.
// js/url.js overrides addQueryArgs with Drupal-compatible URL handling.
// Must load right after vendor url so all other packages see the override.
if (isset($yaml['url'])) {
  $yaml['url']['js']['js/url.js'] = [];
  $yaml['url']['dependencies'][] = 'core/drupal';
}

// ============================================================
// Scan local packages from build/ directory.
// ============================================================
$build_dir = realpath(dirname(__DIR__) . '/build');

if ($build_dir && is_dir($build_dir)) {
  $local_packages = scandir($build_dir);

  // CSS attributes for specific local packages.
  $local_css_attributes = [
    'editor' => [
      'preprocess' => FALSE,
      'attributes' => [
        'id' => 'edit-node-editor-css',
      ],
    ],
  ];

  // Standalone packages that have manually-defined library entries below.
  // Skip them in auto-scan to avoid creating unused drupal-* duplicates.
  $skip_local_packages = ['admin', 'claro', 'gin', 'default-admin', 'sidebar', 'special-media-selection', 'media-attributes', 'edit-entity'];

  foreach ($local_packages as $local_package) {
    if ($local_package[0] === '.' || !is_dir($build_dir . '/' . $local_package)) {
      continue;
    }

    $asset_file = $build_dir . '/' . $local_package . '/index.asset.php';
    if (!file_exists($asset_file)) {
      continue;
    }

    if (in_array($local_package, $skip_local_packages)) {
      continue;
    }

    $library_name = 'drupal-' . $local_package;
    $asset_settings = require $asset_file;
    $deps = $asset_settings['dependencies'] ?? [];

    $yaml[$library_name] = [];

    // JS
    $js_path = "build/$local_package/index.js";
    if (file_exists(dirname(__DIR__) . '/' . $js_path)) {
      $yaml[$library_name]['js'] = [
        $js_path => ['minified' => TRUE, 'preprocess' => FALSE],
      ];
    }

    // CSS (extracted by webpack as style-index.css)
    $css_path = "build/$local_package/style-index.css";
    if (file_exists(dirname(__DIR__) . '/' . $css_path)) {
      $css_options = isset($local_css_attributes[$local_package])
        ? $local_css_attributes[$local_package]
        : [];
      $yaml[$library_name]['css']['theme'] = [
        $css_path => $css_options,
      ];
    }

    // Dependencies
    foreach ($deps as $dep) {
      if (str_starts_with($dep, 'drupal-gutenberg-')) {
        // Cross-package dependency: drupal-gutenberg-components → gutenberg/drupal-components
        $local_dep = str_replace('drupal-gutenberg-', 'drupal-', $dep);
        $yaml[$library_name]['dependencies'][] = 'gutenberg/' . $local_dep;
      } elseif (str_starts_with($dep, 'wp-')) {
        // WordPress vendor dependency: wp-blocks → gutenberg/blocks
        $wp_dep = str_replace('wp-', '', $dep);
        $yaml[$library_name]['dependencies'][] = 'gutenberg/' . $wp_dep;
      } else {
        // Bare dependencies: react, react-dom, lodash, etc.
        $yaml[$library_name]['dependencies'][] = 'gutenberg/' . $dep;
      }
    }
  }

  // Add extra dependencies for drupal-editor that are accessed via window globals
  // (not detected by webpack dependency extraction).
  if (isset($yaml['drupal-editor'])) {
    $extra_editor_deps = [
      'gutenberg/media-attributes',
      'gutenberg/edit-entity',
      'gutenberg/editor',
      'gutenberg/blocks',
      'gutenberg/element',
      'gutenberg/block-editor',
      'gutenberg/notices',
      // Deprecated global kept for custom blocks, removed in 5.0.0.
      'gutenberg/lodash',
      'core/jquery',
      'core/drupal',
      'core/drupal.ajax',
      'core/drupalSettings',
      'core/once',
    ];
    foreach ($extra_editor_deps as $dep) {
      if (!in_array($dep, $yaml['drupal-editor']['dependencies'] ?? [])) {
        $yaml['drupal-editor']['dependencies'][] = $dep;
      }
    }
  }

  // Update preserved entries to use build/ paths.
  // These standalone packages use specific library names (not drupal-* prefix).

  // Admin library
  if (file_exists(dirname(__DIR__) . '/build/admin/index.js')) {
    $yaml['admin'] = [
      'js' => ['build/admin/index.js' => ['minified' => TRUE, 'preprocess' => FALSE]],
    ];
    if (file_exists(dirname(__DIR__) . '/build/admin/style-index.css')) {
      $yaml['admin']['css']['theme'] = [
        'build/admin/style-index.css' => [],
      ];
    }
  }

  // Claro library
  if (file_exists(dirname(__DIR__) . '/build/claro/index.js')) {
    $yaml['claro'] = [
      'js' => ['build/claro/index.js' => ['minified' => TRUE, 'preprocess' => FALSE]],
    ];
    if (file_exists(dirname(__DIR__) . '/build/claro/style-index.css')) {
      $yaml['claro']['css']['theme'] = [
        'build/claro/style-index.css' => [],
      ];
    }
  }

  // Sidebar library
  if (file_exists(dirname(__DIR__) . '/build/sidebar/index.js')) {
    $yaml['drupal.dialog.sidebar'] = [
      'js' => ['build/sidebar/index.js' => ['minified' => TRUE, 'preprocess' => FALSE]],
      'css' => ['theme' => []],
      'dependencies' => [
        'core/jquery',
        'core/once',
        'core/drupal',
        'core/drupal.ajax',
        'core/drupal.announce',
        'core/drupal.dialog',
        'core/drupal.dialog.ajax',
      ],
    ];
    if (file_exists(dirname(__DIR__) . '/build/sidebar/style-index.css')) {
      $yaml['drupal.dialog.sidebar']['css']['theme'] = [
        'build/sidebar/style-index.css' => [],
      ];
    }
  }

  // Media attributes library (injects data-entity-uuid/type into media blocks)
  $media_attrs_asset = $build_dir . '/media-attributes/index.asset.php';
  if (file_exists($media_attrs_asset)) {
    $asset_settings = require $media_attrs_asset;
    $deps = $asset_settings['dependencies'] ?? [];

    $yaml['media-attributes'] = [
      'js' => ['build/media-attributes/index.js' => ['minified' => TRUE, 'preprocess' => FALSE]],
    ];

    foreach ($deps as $dep) {
      if (str_starts_with($dep, 'wp-')) {
        $wp_dep = str_replace('wp-', '', $dep);
        $yaml['media-attributes']['dependencies'][] = 'gutenberg/' . $wp_dep;
      } else {
        $yaml['media-attributes']['dependencies'][] = 'gutenberg/' . $dep;
      }
    }
  }

  // Special media selection library
  if (file_exists(dirname(__DIR__) . '/build/special-media-selection/index.js')) {
    $yaml['special-media-selection'] = [
      'js' => ['build/special-media-selection/index.js' => ['minified' => TRUE, 'preprocess' => FALSE]],
    ];
  }

  // Edit entity library (forked from @wordpress/edit-post)
  $edit_entity_asset = $build_dir . '/edit-entity/index.asset.php';
  if (file_exists($edit_entity_asset)) {
    $asset_settings = require $edit_entity_asset;
    $deps = $asset_settings['dependencies'] ?? [];

    $yaml['edit-entity'] = [
      'js' => ['build/edit-entity/index.js' => ['minified' => TRUE, 'preprocess' => FALSE]],
    ];

    // CSS with edit-post id attribute for compatibility.
    // The @wordpress/scripts webpack config splits style.scss imports into
    // separate chunks named style-{entryName}/style-index.css.
    $css_path = 'build/style-edit-entity/style-index.css';
    if (!file_exists(dirname(__DIR__) . '/' . $css_path)) {
      // Fallback to same-directory path.
      $css_path = 'build/edit-entity/style-index.css';
    }
    if (file_exists(dirname(__DIR__) . '/' . $css_path)) {
      $yaml['edit-entity']['css']['component'] = [
        $css_path => [
          'preprocess' => FALSE,
          'attributes' => ['id' => 'wp-edit-post-css'],
        ],
      ];
    }

    // Dependencies
    foreach ($deps as $dep) {
      if (str_starts_with($dep, 'drupal-gutenberg-')) {
        $local_dep = str_replace('drupal-gutenberg-', 'drupal-', $dep);
        $yaml['edit-entity']['dependencies'][] = 'gutenberg/' . $local_dep;
      } elseif (str_starts_with($dep, 'wp-')) {
        $wp_dep = str_replace('wp-', '', $dep);
        $yaml['edit-entity']['dependencies'][] = 'gutenberg/' . $wp_dep;
      } else {
        $yaml['edit-entity']['dependencies'][] = 'gutenberg/' . $dep;
      }
    }
  }
}

file_put_contents($gutenberg_libraries_file, Yaml::dump($yaml, 4, 2, Yaml::DUMP_MULTI_LINE_LITERAL_BLOCK));
