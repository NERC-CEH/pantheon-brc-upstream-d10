<?php

namespace Drupal\gutenberg;

use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Discovery\YamlDiscovery;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Extension\ThemeHandlerInterface;
use Drupal\Core\Plugin\DefaultPluginManager;
use Drupal\Core\Theme\MissingThemeDependencyException;
use Drupal\Core\Theme\ThemeInitializationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Yaml\Yaml;

/**
 * Provides the default .gutenberg.yml library plugin manager.
 */
class GutenbergLibraryManager extends DefaultPluginManager implements GutenbergLibraryManagerInterface {

  /**
   * Provides default values for all gutenberg plugins.
   *
   * @var array
   */
  protected $defaults = [
    'libraries-edit' => [],
    'libraries-view' => [],
    'dynamic-blocks' => [],
    'custom-blocks' => [],
  ];

  /**
   * The theme handler.
   *
   * @var \Drupal\Core\Extension\ThemeHandlerInterface
   */
  protected $themeHandler;

  /**
   * The theme initialization.
   *
   * @var \Drupal\Core\Theme\ThemeInitializationInterface
   */
  protected $themeInitialization;

  /**
   * The Gutenberg logger.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * Static cache of theme Gutenberg plugin definitions.
   *
   * @var array
   */
  protected $activeThemeDefinitions;

  /**
   * Static cache of the merged active theme Gutenberg plugin definition.
   *
   * @var array
   */
  protected $activeThemeMergedDefinition;

  /**
   * Static cache of Gutenberg plugin definitions keyed by the extension type.
   *
   * @var array
   */
  protected $definitionsByExtension;

  /* @noinspection MagicMethodsValidityInspection */
  /* @noinspection PhpMissingParentConstructorInspection */

  /**
   * Constructs a new GutenbergManager object.
   *
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler.
   * @param \Drupal\Core\Extension\ThemeHandlerInterface $theme_handler
   *   The theme handler.
   * @param \Drupal\Core\Theme\ThemeInitializationInterface $theme_initialization
   *   The theme initialization.
   * @param \Drupal\Core\Cache\CacheBackendInterface $cache_backend
   *   Cache backend instance to use.
   * @param \Psr\Log\LoggerInterface $logger
   *   Gutenberg logger interface.
   */
  public function __construct(
    ModuleHandlerInterface $module_handler,
    ThemeHandlerInterface $theme_handler,
    ThemeInitializationInterface $theme_initialization,
    CacheBackendInterface $cache_backend,
    LoggerInterface $logger,
  ) {
    $this->moduleHandler = $module_handler;
    $this->themeHandler = $theme_handler;
    $this->themeInitialization = $theme_initialization;
    $this->logger = $logger;
    $this->alterInfo('gutenberg_info');
    $this->setCacheBackend($cache_backend, 'gutenberg', ['gutenberg']);
  }

  /**
   * {@inheritdoc}
   */
  protected function getDiscovery() {
    if (!isset($this->discovery)) {
      $this->discovery = new YamlDiscovery(
        'gutenberg',
        $this->moduleHandler->getModuleDirectories() + $this->themeHandler->getThemeDirectories()
      );
    }
    return $this->discovery;
  }

  /**
   * {@inheritdoc}
   */
  protected function findDefinitions() {
    $definitions = $this->getDiscovery()->findAll();

    foreach ($definitions as $plugin_id => &$definition) {
      $definitions[$plugin_id] = $definition + [
        'id' => $plugin_id,
        'provider' => $plugin_id,
      ];
      $this->processDefinition($definition, $plugin_id);
    }
    unset($definition);

    $this->alterDefinitions($definitions);

    // If this plugin was provided by a module/theme that does not exist,
    // remove the plugin definition.
    foreach ($definitions as $plugin_id => $definition) {
      $plugin_id = $this->extractProviderFromDefinition($definition);
      if ($plugin_id && !in_array($plugin_id, ['core', 'component']) && !$this->providerExists($plugin_id)) {
        unset($definitions[$plugin_id]);
      }
    }
    return $definitions;
  }

  /**
   * {@inheritdoc}
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   */
  public function processDefinition(&$definition, $plugin_id) {
    parent::processDefinition($definition, $plugin_id);

    if (empty($definition['provider'])) {
      throw new InvalidPluginDefinitionException(
        sprintf('Gutenberg plugin property (%s) definition "provider" is required.', $plugin_id)
      );
    }
  }

  /**
   * {@inheritdoc}
   */
  protected function providerExists($provider) {
    return $this->moduleHandler->moduleExists($provider) || $this->themeHandler->themeExists($provider);
  }

  /**
   * {@inheritdoc}
   */
  public function clearCachedDefinitions() {
    parent::clearCachedDefinitions();
    $this->definitionsByExtension = NULL;
    $this->activeThemeDefinitions = NULL;
    $this->activeThemeMergedDefinition = NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function getModuleDefinitions() {
    return $this->getDefinitionsByExtension()['module'];
  }

  /**
   * {@inheritdoc}
   */
  public function getThemeDefinitions() {
    return $this->getDefinitionsByExtension()['theme'];
  }

  /**
   * {@inheritdoc}
   */
  public function getActiveThemeDefinitions() {
    if (isset($this->activeThemeDefinitions)) {
      return $this->activeThemeDefinitions;
    }

    $cid = $this->cacheKey . ':active_themes';

    if ($cache = $this->cacheBackend->get($cid)) {
      return $this->activeThemeDefinitions = $cache->data;
    }

    $theme_name = $this->themeHandler->getDefault();
    $theme_definitions = [];
    try {
      $active_theme = $this->themeInitialization->getActiveThemeByName($theme_name);
      $definitions = $this->getDefinitionsByExtension();
      $default_theme_definitions = [];

      // Check if Gutenberg module has "default" settings for the active theme.
      // @todo A better way to do this?
      $module_path = $this->moduleHandler->getModule('gutenberg')->getPath();
      $config_file_path = $module_path . '/' . $theme_name . '.gutenberg.yml';

      if (file_exists($config_file_path)) {
        $default_theme_definitions = Yaml::parseFile($config_file_path);
      }

      // Note: Reversing the order so that base themes are first.
      $themes = array_reverse(
        array_merge([$active_theme->getName()], array_keys($active_theme->getBaseThemeExtensions()))
      );

      foreach ($themes as $theme) {
        if (isset($definitions['theme'][$theme])) {
          $theme_definitions[$theme] = array_merge($default_theme_definitions, $definitions['theme'][$theme]);
        }
        elseif (!empty($default_theme_definitions)) {
          $theme_definitions[$theme] = $default_theme_definitions;
        }
      }
    }
    catch (MissingThemeDependencyException $e) {
      $this->logger->error($e->getMessage());
    }

    // Process style section on each theme definition.
    foreach ($theme_definitions as $theme_name => &$theme_definition) {
      if (!empty($theme_definition['theme-support']['styles'])) {
        $this->processThemeSupportStyles($theme_definition, $active_theme);
      }
    }

    $this->cacheBackend->set(
      $cid,
      $theme_definitions,
      Cache::PERMANENT,
      ['gutenberg']
    );
    $this->activeThemeDefinitions = $theme_definitions;

    return $this->activeThemeDefinitions;
  }

  /**
   * {@inheritdoc}
   */
  public function getActiveThemeMergedDefinition() {
    if (isset($this->activeThemeMergedDefinition)) {
      return $this->activeThemeMergedDefinition;
    }

    $cid = $this->cacheKey . ':active_theme';

    if ($cache = $this->cacheBackend->get($cid)) {
      return $this->activeThemeMergedDefinition = $cache->data;
    }

    // Specify the default definition.
    $definition = $this->defaults;

    foreach ($this->getActiveThemeDefinitions() as $array) {
      foreach ($array as $key => $value) {
        if ($key === 'id' || $key === 'provider') {
          // Ignore irrelevant properties.
          continue;
        }

        if (isset($definition[$key]) && is_array($definition[$key]) && is_array($value)) {
          // Merge arrays.
          $definition[$key] = array_merge($definition[$key], $value);
        }
        // Otherwise, use the latter value, overriding any previous value.
        else {
          $definition[$key] = $value;
        }
      }
    }

    // Allow the active theme to dynamically alter the merged definition.
    // This enables themes to modify presets (e.g., colors from theme settings)
    // before CSS generation and caching. The theme implements
    // THEMENAME_gutenberg_definition_alter(array &$definition).
    $theme_name = $this->themeHandler->getDefault();
    // Ensure the theme's .theme file is loaded (may not be in CLI context).
    $theme_path = $this->themeHandler->getTheme($theme_name)->getPath();
    $theme_file = \Drupal::root() . '/' . $theme_path . '/' . $theme_name . '.theme';
    if (file_exists($theme_file)) {
      include_once $theme_file;
    }
    $alter_function = $theme_name . '_gutenberg_definition_alter';
    if (function_exists($alter_function)) {
      $alter_function($definition);
    }

    // Normalize legacy flat preset arrays into __experimentalFeatures format
    // so the PresetCssGenerator only needs to read one canonical location.
    $this->normalizeLegacyPresets($definition);

    // Inject preset CSS (custom properties + utility classes) into the styles
    // pipeline so it reaches the editor iframe. Without this, utility classes
    // like .has-monospace-font-family don't exist in the iframe context.
    $this->processPresetStyles($definition);

    // Process globalStyles: generate CSS and inject into the styles pipeline.
    $this->processGlobalStyles($definition);

    $this->activeThemeMergedDefinition = $definition;
    $this->cacheBackend->set($cid, $definition, Cache::PERMANENT, ['gutenberg']);

    return $this->activeThemeMergedDefinition;
  }

  /**
   * {@inheritdoc}
   */
  public function getDefinitionsByExtension() {
    if (isset($this->definitionsByExtension)) {
      return $this->definitionsByExtension;
    }

    $cid = $this->cacheKey . ':by_extension';

    if ($cache = $this->cacheBackend->get($cid)) {
      return $this->definitionsByExtension = $cache->data;
    }

    $definitions_by_extension = [
      'theme' => [],
      'module' => [],
    ];
    foreach ($this->getDefinitions() as $plugin_id => $plugin_definition) {
      if ($this->themeHandler->themeExists($plugin_id)) {
        $definitions_by_extension['theme'][$plugin_id] = $plugin_definition;
      }
      elseif ($this->moduleHandler->moduleExists($plugin_id)) {
        $definitions_by_extension['module'][$plugin_id] = $plugin_definition;
      }
    }

    $this->cacheBackend->set($cid, $definitions_by_extension, Cache::PERMANENT, ['gutenberg']);
    $this->definitionsByExtension = $definitions_by_extension;

    return $this->definitionsByExtension;
  }

  /**
   * Generate color css classes.
   *
   * @return string|bool
   *   The generated CSS string, or FALSE if no presets found.
   *
   * @deprecated in gutenberg:3.0.0 and is removed from gutenberg:4.0.0. Use generatePresetStylesheet() instead.
   * @see \Drupal\gutenberg\GutenbergLibraryManager::generatePresetStylesheet()
   */
  public function generateThemeColorClasses() {
    return $this->generateLegacyPresetCss();
  }

  /**
   * Generate gradient css classes.
   *
   * @return string|bool
   *   The generated CSS string, or FALSE if no presets found.
   *
   * @deprecated in gutenberg:3.0.0 and is removed from gutenberg:4.0.0. Use generatePresetStylesheet() instead.
   * @see \Drupal\gutenberg\GutenbergLibraryManager::generatePresetStylesheet()
   */
  public function generateThemeGradientClasses() {
    return $this->generateLegacyPresetCss();
  }

  /**
   * Generate font size css classes.
   *
   * @return string|bool
   *   The generated CSS string, or FALSE if no presets found.
   *
   * @deprecated in gutenberg:3.0.0 and is removed from gutenberg:4.0.0. Use generatePresetStylesheet() instead.
   * @see \Drupal\gutenberg\GutenbergLibraryManager::generatePresetStylesheet()
   */
  public function generateThemeFontSizeClasses() {
    return $this->generateLegacyPresetCss();
  }

  /**
   * Generate font family css classes.
   *
   * @return string|bool
   *   The generated CSS string, or FALSE if no presets found.
   *
   * @deprecated in gutenberg:3.0.0 and is removed from gutenberg:4.0.0. Use generatePresetStylesheet() instead.
   * @see \Drupal\gutenberg\GutenbergLibraryManager::generatePresetStylesheet()
   */
  public function generateThemeFontFamilyClasses() {
    return $this->generateLegacyPresetCss();
  }

  /**
   * Process theme support styles.
   *
   * It checks for files in styles sections and loads them.
   *
   * @param array $theme_definition
   *   The theme definition.
   * @param \Drupal\Core\Theme\ActiveTheme $active_theme
   *   The active theme.
   */
  protected function processThemeSupportStyles(&$theme_definition, $active_theme) {
    $path = $active_theme->getPath();
    foreach ($theme_definition['theme-support']['styles'] as &$style) {
      if ($style['css'] && is_array($style['css'])) {
        $resultCss = '';
        $fileUrls = [];
        foreach ($style['css'] as $filename => $file_settings) {
          $style_file_path = \Drupal::root() . '/' . $path . '/' . $filename;
          if (file_exists($style_file_path)) {
            $css = file_get_contents($style_file_path);

            // Get folder path from file path.
            $folder_path = dirname($path . '/' . $filename);

            // Process urls.
            $re = '/url\((?![\'"]?(?:data):)[\'"]?([^\'"\)]*)[\'"]?\)/m';
            $subst = "url(\"/" . $folder_path . "/$1\")";
            $resultCss .= preg_replace($re, $subst, $css) . "\n";

            // Also store the file URL for iframe @import injection.
            $fileUrls[] = $path . '/' . $filename;
          }
        }
        $style['css'] = $resultCss;
        $style['__fileUrls'] = $fileUrls;
      }
    }
  }

  /**
   * Generate spacing sizes CSS variables.
   *
   * @deprecated in gutenberg:3.0.0 and is removed from gutenberg:4.0.0. Use generatePresetStylesheet() instead.
   * @see \Drupal\gutenberg\GutenbergLibraryManager::generatePresetStylesheet()
   */
  public function generateSpacingSizesCssVariables() {
    return $this->generateLegacyPresetCss();
  }

  /**
   * Inject preset CSS into the styles pipeline for the editor iframe.
   *
   * Generates CSS custom properties and utility classes (e.g.
   * .has-monospace-font-family) from __experimentalFeatures presets and
   * injects them into styles[] so they are available inside the editor iframe.
   *
   * @param array &$definition
   *   The merged theme definition, modified in place.
   */
  protected function processPresetStyles(array &$definition) {
    $settings = $definition['theme-support']['__experimentalFeatures'] ?? [];
    if (empty($settings)) {
      return;
    }

    $generator = new PresetCssGenerator();
    $css = $generator->getStylesheet($settings);
    if ($css === '') {
      return;
    }

    // Inject as a styles[] entry for the editor iframe.
    if (!isset($definition['theme-support']['styles'])) {
      $definition['theme-support']['styles'] = [];
    }
    // Prepend so presets come before global styles (which reference them).
    array_unshift($definition['theme-support']['styles'], [
      'css' => $css,
      '__unstableType' => 'presets',
    ]);
  }

  /**
   * Process globalStyles from the theme definition into CSS.
   *
   * Generates CSS from the structured globalStyles definition and injects it
   * into the styles[] pipeline for the editor, and stores it separately for
   * frontend retrieval.
   *
   * @param array &$definition
   *   The merged theme definition, modified in place.
   */
  protected function processGlobalStyles(array &$definition) {
    $globalStyles = $definition['theme-support']['globalStyles'] ?? [];
    if (empty($globalStyles)) {
      return;
    }

    $settings = $definition['theme-support']['__experimentalFeatures'] ?? [];
    $generator = new GlobalStylesGenerator();
    $css = $generator->getStylesheet($globalStyles, $settings);
    if ($css === '') {
      return;
    }

    // Store the generated CSS for frontend retrieval.
    $definition['theme-support']['__globalStylesCss'] = $css;

    // Inject as a styles[] entry for the editor iframe.
    if (!isset($definition['theme-support']['styles'])) {
      $definition['theme-support']['styles'] = [];
    }
    $definition['theme-support']['styles'][] = [
      'css' => $css,
      'isGlobalStyles' => TRUE,
      '__unstableType' => 'theme',
    ];
  }

  /**
   * Generate the global styles CSS from the active theme definition.
   *
   * @return string|false
   *   The CSS string, or FALSE if no global styles found.
   */
  public function generateGlobalStylesheet() {
    $definitions = $this->getActiveThemeMergedDefinition();
    return $definitions['theme-support']['__globalStylesCss'] ?? FALSE;
  }

  /**
   * Generate the complete preset stylesheet using the data-driven generator.
   *
   * @return string|false
   *   The CSS string, or FALSE if no presets found.
   */
  public function generatePresetStylesheet() {
    $definitions = $this->getActiveThemeMergedDefinition();

    $settings = $definitions['theme-support']['__experimentalFeatures'] ?? [];
    if (empty($settings)) {
      return FALSE;
    }

    $generator = new PresetCssGenerator();
    $css = $generator->getStylesheet($settings);

    return $css !== '' ? $css : FALSE;
  }

  /**
   * Normalize legacy flat preset arrays into __experimentalFeatures format.
   *
   * Themes using the pre-3.0 format define presets under theme-support as
   * flat arrays (colors, gradients, fontSizes). This normalizes them into
   * the __experimentalFeatures structure so the PresetCssGenerator only needs
   * to read one canonical location. Legacy values are placed into the 'custom'
   * origin so they layer on top of any default/theme values already in
   * __experimentalFeatures.
   *
   * @param array &$definition
   *   The merged theme definition, modified in place.
   */
  protected function normalizeLegacyPresets(array &$definition) {
    if (empty($definition['theme-support'])) {
      return;
    }

    $ts = &$definition['theme-support'];

    // Ensure the __experimentalFeatures container exists.
    if (!isset($ts['__experimentalFeatures'])) {
      $ts['__experimentalFeatures'] = [];
    }
    $ef = &$ts['__experimentalFeatures'];

    // Legacy colors → __experimentalFeatures.color.palette.custom.
    if (!empty($ts['colors']) && is_array($ts['colors'])) {
      if (!isset($ef['color'])) {
        $ef['color'] = [];
      }
      if (!isset($ef['color']['palette'])) {
        $ef['color']['palette'] = [];
      }
      $ef['color']['palette']['custom'] = $ts['colors'];
    }

    // Legacy gradients → __experimentalFeatures.color.gradients.custom.
    if (!empty($ts['gradients']) && is_array($ts['gradients'])) {
      if (!isset($ef['color'])) {
        $ef['color'] = [];
      }
      if (!isset($ef['color']['gradients'])) {
        $ef['color']['gradients'] = [];
      }
      $ef['color']['gradients']['custom'] = $ts['gradients'];
    }

    // Legacy fontSizes → __experimentalFeatures.typography.fontSizes.custom.
    if (!empty($ts['fontSizes']) && is_array($ts['fontSizes'])) {
      if (!isset($ef['typography'])) {
        $ef['typography'] = [];
      }
      if (!isset($ef['typography']['fontSizes'])) {
        $ef['typography']['fontSizes'] = [];
      }
      $ef['typography']['fontSizes']['custom'] = $ts['fontSizes'];
    }
  }

  /**
   * Generate preset CSS using the legacy individual methods as fallback.
   *
   * Used by the deprecated individual generator methods.
   *
   * @return string|false
   *   The CSS string, or FALSE if no presets found.
   */
  private function generateLegacyPresetCss() {
    return $this->generatePresetStylesheet();
  }

}
