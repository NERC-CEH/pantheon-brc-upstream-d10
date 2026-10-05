<?php

namespace Drupal\gutenberg\BlockProcessor;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Psr\Log\LoggerInterface;
use Drupal\gutenberg\TinyColor;
use Drupal\gutenberg\BlocksLibraryManager;
use Drupal\gutenberg\GutenbergLibraryManager;

/**
 * Processes Gutenberg duotone style.
 */
class DuotoneProcessor implements GutenbergBlockProcessorInterface {

  /**
   * TinyColor.
   *
   * @var \Drupal\gutenberg\TinyColor
   */
  protected $tinyColor;

  /**
   * Gutenberg blocks library.
   *
   * @var \Drupal\gutenberg\BlocksLibraryManager
   */
  protected $blocksLibrary;

  /**
   * Gutenberg library manager.
   *
   * @var \Drupal\gutenberg\GutenbergLibraryManager
   */
  protected $libraryManager;

  /**
   * The Gutenberg logger.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * DuotoneProcessor constructor.
   *
   * @param \Drupal\gutenberg\TinyColor $tiny_color
   *   The renderer.
   * @param \Drupal\gutenberg\BlocksLibraryManager $blocks_library
   *   Blocks library manager.
   * @param \Drupal\gutenberg\GutenbergLibraryManager $library_manager
   *   Gutenberg library manager.
   * @param \Psr\Log\LoggerInterface $logger
   *   Gutenberg logger interface.
   */
  public function __construct(
    TinyColor $tiny_color,
    BlocksLibraryManager $blocks_library,
    GutenbergLibraryManager $library_manager,
    LoggerInterface $logger,
  ) {
    $this->tinyColor = $tiny_color;
    $this->blocksLibrary = $blocks_library;
    $this->libraryManager = $library_manager;
    $this->logger = $logger;
  }

  /**
   * Gets theme definition values for duotone.
   *
   * @todo move to service and check if possible to port from WP.
   *
   * @param string $value
   *   Value.
   * @param array $theme_definition
   *   Theme definition.
   *
   * @return array
   *   Color values.
   */
  protected function getThemeDefinitionValues($value, $theme_definition) {
    // Check if var is array.
    if (is_array($value)) {
      return $value;
    }

    // Check if value contains 'var:'.
    if (strpos($value, 'var:') === FALSE) {
      return [];
    }

    // Get duotone preset settings.
    $duotone_preset_path = explode('|', str_replace('var:', '', $value));
    $duotone_preset = end($duotone_preset_path);

    // Check if duotone preset is set on theme definition.
    $duotone_presets = $theme_definition['theme-support']['__experimentalFeatures']['color']['duotone']['theme'];
    if (!$duotone_presets) {
      $this->logger->warning('Duotone presets not found in theme definition.');
      return [];
    }

    $presets = array_filter($duotone_presets, function ($preset) use ($duotone_preset) {
      return isset($preset['slug']) && $preset['slug'] === $duotone_preset;
    });

    $preset = reset($presets);

    // If $preset is empty, return empty array.
    if (!$preset) {
      $this->logger->warning("Duotone preset '$duotone_preset' not found in theme definition.");
      return [];
    }

    return $preset['colors'];
  }

  /**
   * {@inheritdoc}
   */
  public function processBlock(array &$block, &$block_content, RefinableCacheableDependencyInterface $bubbleable_metadata) {
    $theme_definitions = $this->libraryManager->getActiveThemeDefinitions();
    $active_theme = \Drupal::theme()->getActiveTheme()->getName();

    $filter_preset   = [
      'slug'   => uniqid(),
      'colors' => $this->getThemeDefinitionValues($block['attrs']['style']['color']['duotone'], $theme_definitions[$active_theme]),
    ];
    $filter_id       = 'wp-duotone-' . $filter_preset['slug'];
    $filter_property = "url('#" . $filter_id . "')";

    $block_definition = $this->blocksLibrary->getBlockDefinition($block['blockName']);

    $selector = '';
    $scope = ".$filter_id";

    if (isset($block_definition['supports']['filter']['duotone'])) {
      $selectors = explode(',', $block_definition['selectors']['filter']['duotone']);
      $scoped = [];

      foreach ($selectors as $sel) {
        $scoped[] = $scope . trim($sel);
      }
      $selector = implode(', ', $scoped);
    }

    $style = "$selector { filter: $filter_property}";
    $svg = $this->getFilterSvg($filter_preset);

    $block_content = "$svg<style>$style</style>$block_content";

    $block_content = preg_replace(
      '/' . preg_quote('class="', '/') . '/',
      'class="' . $filter_id . ' ',
      $block_content,
      1
    );

    $render = [
      '#markup' => $block_content,
    ];

    $bubbleable_metadata->addCacheableDependency(
      CacheableMetadata::createFromRenderArray($render)
    );
  }

  /**
   * {@inheritdoc}
   */
  public function isSupported(array $block, $block_content = '') {
    return isset($block['attrs']['style']['color']['duotone']);
  }

  /**
   * Gets a SVG with a filter.
   *
   * @param array $preset
   *   Preset.
   */
  protected function getFilterSvg(array $preset) {
    $duotone_id     = $preset['slug'];
    $duotone_colors = $preset['colors'];
    $filter_id      = 'wp-duotone-' . $duotone_id;

    $duotone_values = [
      'r' => [],
      'g' => [],
      'b' => [],
      'a' => [],
    ];

    foreach ($duotone_colors as $color_str) {
      $color = $this->tinyColor->string_to_rgb($color_str);

      $duotone_values['r'][] = $color['r'] / 255;
      $duotone_values['g'][] = $color['g'] / 255;
      $duotone_values['b'][] = $color['b'] / 255;
      $duotone_values['a'][] = $color['a'];
    }

    ob_start();

    ?>
  
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 0 0"
      width="0"
      height="0"
      focusable="false"
      role="none"
      style="visibility: hidden; position: absolute; left: -9999px; overflow: hidden;"
    >
      <defs>
        <filter id="<?php echo ($filter_id); ?>">
          <feColorMatrix
            color-interpolation-filters="sRGB"
            type="matrix"
            values="
              .299 .587 .114 0 0
              .299 .587 .114 0 0
              .299 .587 .114 0 0
              .299 .587 .114 0 0
            "
          />
          <feComponentTransfer color-interpolation-filters="sRGB" >
            <feFuncR type="table" tableValues="<?php echo (implode(' ', $duotone_values['r'])); ?>" />
            <feFuncG type="table" tableValues="<?php echo (implode(' ', $duotone_values['g'])); ?>" />
            <feFuncB type="table" tableValues="<?php echo (implode(' ', $duotone_values['b'])); ?>" />
            <feFuncA type="table" tableValues="<?php echo (implode(' ', $duotone_values['a'])); ?>" />
          </feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
    </svg>
  
    <?php

    $svg = ob_get_clean();

    return $svg;
  }

}
