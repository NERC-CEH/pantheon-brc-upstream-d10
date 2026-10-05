<?php

namespace Drupal\gutenberg;

use Drupal\Component\Plugin\PluginManagerInterface;

/**
 * Defines an interface for gutenberg library plugin managers.
 */
interface GutenbergLibraryManagerInterface extends PluginManagerInterface {

  /**
   * Gets a list of modules with .gutenberg.yml definitions.
   *
   * @return array
   *   The modules and their definitions.
   */
  public function getModuleDefinitions();

  /**
   * Gets a list of themes with .gutenberg.yml definitions.
   *
   * @return array
   *   The themes and their definitions.
   */
  public function getThemeDefinitions();

  /**
   * Gets a list of the active theme's .gutenberg.yml definitions.
   *
   * It also pulls in the base theme definitions.
   *
   * @return array
   *   The theme definitions.
   */
  public function getActiveThemeDefinitions();

  /**
   * Get the active theme merged definition.
   *
   * @return array
   *   The merged theme definitions.
   */
  public function getActiveThemeMergedDefinition();

  /**
   * Get the list of gutenberg.yml definitions and group them by their type.
   *
   * @return array
   *   The definitions grouped by theme and module.
   */
  public function getDefinitionsByExtension();

  /**
   * Generate color css classes.
   *
   * @return string|bool
   *   The generated CSS string, or FALSE if no presets found.
   */
  public function generateThemeColorClasses();

  /**
   * Generate gradient css classes.
   *
   * @return string|bool
   *   The generated CSS string, or FALSE if no presets found.
   */
  public function generateThemeGradientClasses();

  /**
   * Generate font size css classes.
   *
   * @return string|bool
   *   The generated CSS string, or FALSE if no presets found.
   */
  public function generateThemeFontSizeClasses();

  /**
   * Generate font family css classes.
   *
   * @return string|bool
   *   The generated CSS string, or FALSE if no presets found.
   *
   * @deprecated in gutenberg:3.0.0 and is removed from gutenberg:4.0.0. Use generatePresetStylesheet() instead.
   * @see \Drupal\gutenberg\GutenbergLibraryManager::generatePresetStylesheet()
   */
  public function generateThemeFontFamilyClasses();

  /**
   * Generate the complete preset stylesheet.
   *
   * Produces CSS custom properties (--wp--preset--*) and utility classes
   * (.has-*) for all preset types defined in PRESETS_METADATA.
   *
   * @return string|false
   *   The CSS string, or FALSE if no presets found.
   */
  public function generatePresetStylesheet();

  /**
   * Generate the global styles CSS from the active theme definition.
   *
   * Produces CSS rules for body, element, and block selectors from the
   * structured globalStyles definition in .gutenberg.yml.
   *
   * @return string|false
   *   The CSS string, or FALSE if no global styles found.
   */
  public function generateGlobalStylesheet();

}
