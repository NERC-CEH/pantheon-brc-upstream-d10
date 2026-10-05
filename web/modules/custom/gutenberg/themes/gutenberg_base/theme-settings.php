<?php

/**
 * @file
 * Theme settings form for the Gutenberg Base theme.
 */

use Drupal\Component\Utility\DeprecationHelper;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Extension\ThemeSettingsProvider;
use Drupal\Core\Form\FormStateInterface;

/**
 * Returns the color schemes of the theme, keyed by their data-scheme value.
 *
 * Each scheme remaps the semantic color tokens in css/tokens/colors.css and
 * has an editor palette in schemes/<scheme>.json. "mono" is the default, with
 * no attribute and the palette of gutenberg_base.gutenberg.yml.
 *
 * @return array
 *   The scheme labels, keyed by scheme.
 */
function gutenberg_base_color_schemes(): array {
  return [
    'mono' => t('Monochrome'),
    'blue' => t('Blue'),
    'green' => t('Green'),
    'red' => t('Red'),
    'yellow' => t('Yellow'),
  ];
}

/**
 * Returns a theme setting.
 *
 * Drupal 11.3 deprecates theme_get_setting() for the ThemeSettingsProvider
 * service, which the older versions supported by the theme don't have.
 *
 * @param string $setting_name
 *   The name of the setting.
 * @param string|null $theme
 *   The machine name of the theme, or NULL for the active theme.
 *
 * @return mixed
 *   The value of the setting, or NULL if it is not set.
 */
function _gutenberg_base_theme_setting(string $setting_name, ?string $theme = NULL): mixed {
  return DeprecationHelper::backwardsCompatibleCall(
    currentVersion: \Drupal::VERSION,
    deprecatedVersion: '11.3',
    currentCallable: fn() => \Drupal::service(ThemeSettingsProvider::class)->getSetting($setting_name, $theme),
    deprecatedCallable: fn() => theme_get_setting($setting_name, $theme),
  );
}

/**
 * Implements hook_form_system_theme_settings_alter().
 */
function gutenberg_base_form_system_theme_settings_alter(array &$form, FormStateInterface $form_state, $form_id = NULL) {
  // Work-around for a core bug affecting admin themes. See issue #943212.
  if (isset($form_id)) {
    return;
  }

  $form['gutenberg_base'] = [
    '#type' => 'details',
    '#title' => t('Gutenberg Base'),
    '#open' => TRUE,
  ];
  $form['gutenberg_base']['color_scheme'] = [
    '#type' => 'select',
    '#title' => t('Color scheme'),
    '#options' => gutenberg_base_color_schemes(),
    '#default_value' => _gutenberg_base_theme_setting('color_scheme') ?: 'mono',
    '#description' => t('Remaps the tint, primary and secondary colors of the site and of the editor palette. A sub-theme adds a scheme with a <code>[data-scheme]</code> rule in its CSS and a palette in its <code>schemes</code> folder.'),
  ];
  $form['gutenberg_base']['light_weight'] = [
    '#type' => 'checkbox',
    '#title' => t('Light type weights'),
    '#default_value' => (bool) _gutenberg_base_theme_setting('light_weight'),
    '#description' => t('Body text at weight 300, headings at 400 and buttons at 500, matching the thin strokes of the logo.'),
  ];
  $form['gutenberg_base']['button_shape'] = [
    '#type' => 'select',
    '#title' => t('Button shape'),
    '#options' => [
      'square' => t('Square'),
      'round' => t('Round'),
    ],
    '#default_value' => _gutenberg_base_theme_setting('button_shape') ?: 'square',
    '#description' => t('Round makes the buttons pills. Fields and tags stay square.'),
  ];
  $form['#submit'][] = 'gutenberg_base_form_system_theme_settings_submit';
}

/**
 * Submit handler for the theme settings form.
 *
 * The editor palette follows the color scheme, and is cached with the
 * Gutenberg theme definitions.
 */
function gutenberg_base_form_system_theme_settings_submit(array &$form, FormStateInterface $form_state) {
  Cache::invalidateTags(['gutenberg']);
}
