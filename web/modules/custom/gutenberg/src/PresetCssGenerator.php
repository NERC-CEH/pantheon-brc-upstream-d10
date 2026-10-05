<?php

namespace Drupal\gutenberg;

/**
 * Data-driven preset CSS generator inspired by WP_Theme_JSON::PRESETS_METADATA.
 *
 * Generates CSS custom properties and utility classes for all preset types
 * from a single configuration array, replacing the individual per-type
 * generator methods.
 */
class PresetCssGenerator {

  /**
   * Preset metadata definitions, mirroring WP_Theme_JSON::PRESETS_METADATA.
   *
   * Each entry defines:
   * - path: The key path under __experimentalFeatures to find preset values.
   * - value_key: The key within each preset item that holds the CSS value.
   * - css_vars: The CSS custom property template ($slug is replaced).
   * - classes: Map of selector template => CSS property for utility classes.
   */
  const PRESETS_METADATA = [
    [
      'path' => ['color', 'palette'],
      'value_key' => 'color',
      'css_vars' => '--wp--preset--color--$slug',
      'classes' => [
        '.has-$slug-color' => 'color',
        '.has-$slug-background-color' => 'background-color',
        '.has-$slug-border-color' => 'border-color',
      ],
    ],
    [
      'path' => ['color', 'gradients'],
      'value_key' => 'gradient',
      'css_vars' => '--wp--preset--gradient--$slug',
      'classes' => [
        '.has-$slug-gradient-background' => 'background',
      ],
    ],
    [
      'path' => ['typography', 'fontSizes'],
      'value_key' => 'size',
      'css_vars' => '--wp--preset--font-size--$slug',
      'classes' => [
        '.has-$slug-font-size' => 'font-size',
      ],
    ],
    [
      'path' => ['typography', 'fontFamilies'],
      'value_key' => 'fontFamily',
      'css_vars' => '--wp--preset--font-family--$slug',
      'classes' => [
        '.has-$slug-font-family' => 'font-family',
      ],
    ],
    [
      'path' => ['spacing', 'spacingSizes'],
      'value_key' => 'size',
      'css_vars' => '--wp--preset--spacing--$slug',
      'classes' => [],
    ],
    [
      'path' => ['shadow', 'presets'],
      'value_key' => 'shadow',
      'css_vars' => '--wp--preset--shadow--$slug',
      'classes' => [],
    ],
  ];

  /**
   * Origins to check, in merge order.
   *
   * Later origins override earlier ones for the same slug.
   */
  const ORIGINS = ['default', 'theme', 'custom'];

  /**
   * Generate the complete preset stylesheet.
   *
   * @param array $settings
   *   The __experimentalFeatures settings array from the merged definition.
   *
   * @return string
   *   The full CSS string, or empty string if no presets found.
   */
  public function getStylesheet(array $settings): string {
    $vars = $this->computePresetVars($settings);
    $classes = $this->computePresetClasses($settings);

    $css = '';
    if ($vars !== '') {
      $css .= "body {\n$vars}\n";
    }
    if ($classes !== '') {
      $css .= $classes;
    }

    return $css;
  }

  /**
   * Generate CSS custom properties for all preset types.
   *
   * @param array $settings
   *   The __experimentalFeatures settings array.
   *
   * @return string
   *   CSS variable declarations (without the :root wrapper).
   */
  protected function computePresetVars(array $settings): string {
    $declarations = '';

    foreach (self::PRESETS_METADATA as $metadata) {
      $values_by_slug = $this->getValuesBySlug($settings, $metadata);
      foreach ($values_by_slug as $slug => $value) {
        $var_name = str_replace('$slug', $slug, $metadata['css_vars']);
        $declarations .= "  $var_name: $value;\n";
      }
    }

    return $declarations;
  }

  /**
   * Generate utility classes for all preset types.
   *
   * Utility classes reference CSS variables, matching WordPress
   * upstream behavior:
   * .has-primary-color {
   *   color: var(--wp--preset--color--primary) !important;
   * }
   *
   * @param array $settings
   *   The __experimentalFeatures settings array.
   *
   * @return string
   *   CSS class rules.
   */
  protected function computePresetClasses(array $settings): string {
    $css = '';

    foreach (self::PRESETS_METADATA as $metadata) {
      if (empty($metadata['classes'])) {
        continue;
      }

      $values_by_slug = $this->getValuesBySlug($settings, $metadata);
      foreach ($values_by_slug as $slug => $value) {
        $var_ref = 'var(' . str_replace('$slug', $slug, $metadata['css_vars']) . ')';
        foreach ($metadata['classes'] as $selector_template => $css_property) {
          $selector = str_replace('$slug', $slug, $selector_template);
          $css .= "$selector {\n  $css_property: $var_ref !important;\n}\n";
        }
      }
    }

    return $css;
  }

  /**
   * Extract preset values by slug from the settings for a given metadata entry.
   *
   * Walks the settings path and merges values across origins in order,
   * so later origins override earlier ones for the same slug.
   *
   * @param array $settings
   *   The __experimentalFeatures settings array.
   * @param array $metadata
   *   A single PRESETS_METADATA entry.
   *
   * @return array
   *   Associative array of slug => value.
   */
  protected function getValuesBySlug(array $settings, array $metadata): array {
    // Navigate to the preset node (e.g., settings['color']['palette']).
    $node = $settings;
    foreach ($metadata['path'] as $key) {
      if (!isset($node[$key])) {
        return [];
      }
      $node = $node[$key];
    }

    $values_by_slug = [];
    $value_key = $metadata['value_key'];

    foreach (self::ORIGINS as $origin) {
      if (!isset($node[$origin]) || !is_array($node[$origin])) {
        continue;
      }
      foreach ($node[$origin] as $preset) {
        if (isset($preset['slug'], $preset[$value_key])) {
          $values_by_slug[$preset['slug']] = $preset[$value_key];
        }
      }
    }

    return $values_by_slug;
  }

}
