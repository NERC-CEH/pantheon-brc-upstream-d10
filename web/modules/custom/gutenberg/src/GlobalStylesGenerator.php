<?php

namespace Drupal\gutenberg;

/**
 * Converts structured globalStyles YAML into CSS rules.
 *
 * Processes the theme-support.globalStyles definition from .gutenberg.yml and
 * generates CSS for root/body, element, and block selectors. Delegates to the
 * WP Style Engine (WP_Style_Engine_Gutenberg) for property mapping and
 * var:preset|type|slug reference resolution.
 *
 * The globalStyles structure follows the WordPress theme.json styles schema:
 * - Root-level properties (color, typography, spacing, etc.) → body selector
 * - elements.{name} → mapped CSS selectors (h1, a, .wp-element-button, etc.)
 * - blocks.{core/name} → .wp-block-{name} selectors
 */
class GlobalStylesGenerator {

  /**
   * Element name to CSS selector mapping.
   *
   * Matches WordPress theme.json elements specification.
   *
   * @var array
   */
  const ELEMENT_SELECTORS = [
    'heading' => 'h1, h2, h3, h4, h5, h6',
    'h1' => 'h1',
    'h2' => 'h2',
    'h3' => 'h3',
    'h4' => 'h4',
    'h5' => 'h5',
    'h6' => 'h6',
    'link' => 'a:where(:not(.wp-element-button))',
    'button' => '.wp-element-button, .wp-block-button__link',
    'caption' => '.wp-element-caption, figcaption',
    'cite' => 'cite',
  ];

  /**
   * Generate the complete global styles stylesheet.
   *
   * @param array $globalStyles
   *   The globalStyles array from the theme-support definition.
   * @param array $settings
   *   Optional settings (from __experimentalFeatures) for layout vars.
   *
   * @return string
   *   The full CSS string, or empty string if no styles found.
   */
  public function getStylesheet(array $globalStyles, array $settings = []): string {
    $this->ensureStyleEngineLoaded();

    $css = '';

    // Generate --wp--style-- CSS custom properties on body.
    // These are special layout/spacing vars that the WP Style Engine doesn't
    // generate — WordPress handles them in WP_Theme_JSON::get_stylesheet().
    $css .= $this->generateStyleCustomProperties($globalStyles, $settings);

    // Generate base structural CSS for all layout types (alignment helpers,
    // width constraints for constrained layout, flex/grid display modes).
    // Mirrors WP_Theme_JSON::get_layout_styles() base styles output.
    $css .= $this->generateLayoutBaseStyles();

    // Root-level styles → body selector.
    $rootStyles = array_diff_key($globalStyles, array_flip(['elements', 'blocks']));
    $css .= $this->generateRulesetCss('body', $rootStyles);

    // Element styles.
    if (!empty($globalStyles['elements'])) {
      foreach ($globalStyles['elements'] as $element => $styles) {
        $selector = self::ELEMENT_SELECTORS[$element] ?? NULL;
        if ($selector !== NULL) {
          $css .= $this->generateRulesetCss($selector, $styles);
        }
      }
    }

    // Block styles.
    if (!empty($globalStyles['blocks'])) {
      foreach ($globalStyles['blocks'] as $blockName => $styles) {
        $selector = $this->getBlockSelector($blockName);
        $css .= $this->generateRulesetCss($selector, $styles);
      }
    }

    return $css;
  }

  /**
   * Generate a CSS ruleset for a given selector and style object.
   *
   * Uses WP_Style_Engine_Gutenberg::parse_block_styles() to convert the
   * structured style object into CSS property/value declarations, which
   * handles var:preset resolution, box model expansion, and individual
   * border side properties.
   *
   * @param string $selector
   *   The CSS selector.
   * @param array $styles
   *   The style object (following WordPress theme.json style structure).
   *
   * @return string
   *   CSS ruleset string, or empty string if no declarations.
   */
  protected function generateRulesetCss(string $selector, array $styles): string {
    if (empty($styles)) {
      return '';
    }

    $parsed = \WP_Style_Engine_Gutenberg::parse_block_styles($styles, []);
    $declarations = $parsed['declarations'] ?? [];

    if (empty($declarations)) {
      return '';
    }

    $css = "$selector {\n";
    foreach ($declarations as $property => $value) {
      $css .= "  $property: $value;\n";
    }
    $css .= "}\n";

    return $css;
  }

  /**
   * Convert a block name to its CSS selector.
   *
   * Follows the WordPress convention: core/quote → .wp-block-quote.
   *
   * @param string $blockName
   *   The block name, e.g., 'core/quote' or 'core/button'.
   *
   * @return string
   *   The CSS selector, e.g., '.wp-block-quote'.
   */
  protected function getBlockSelector(string $blockName): string {
    $parts = explode('/', $blockName, 2);
    $name = $parts[1] ?? $parts[0];
    return '.wp-block-' . $name;
  }

  /**
   * Generate --wp--style-- CSS custom properties and layout gap rules.
   *
   * These are special WordPress global vars not handled by the Style Engine:
   * - --wp--style--block-gap from globalStyles.spacing.blockGap
   * - --wp--style--global--content-size from settings.layout.contentSize
   * - --wp--style--global--wide-size from settings.layout.wideSize.
   *
   * Also generates layout gap CSS rules for .is-layout-* classes. In
   * WordPress these are generated by useGlobalStylesOutput() via the
   * Global Styles REST API, which doesn't exist in Drupal.
   *
   * @param array $globalStyles
   *   The globalStyles array.
   * @param array $settings
   *   The settings array (from __experimentalFeatures).
   *
   * @return string
   *   CSS rulesets, or empty string.
   */
  protected function generateStyleCustomProperties(array $globalStyles, array $settings): string {
    $vars = [];

    // Block gap: prefer globalStyles value, fall back to settings.
    // In settings, blockGap can be boolean (true = feature enabled)
    // or a string CSS value ("1.5rem" = enabled with default).
    // Use isset() not empty() because "0" is a valid CSS gap value.
    $gapValue = NULL;
    if (isset($globalStyles['spacing']['blockGap']) && is_string($globalStyles['spacing']['blockGap'])) {
      $gapValue = $globalStyles['spacing']['blockGap'];
    }
    elseif (isset($settings['spacing']['blockGap']) && is_string($settings['spacing']['blockGap'])) {
      $gapValue = $settings['spacing']['blockGap'];
    }

    if ($gapValue !== NULL) {
      $vars['--wp--style--block-gap'] = $gapValue;
    }

    // Layout sizes from settings.
    if (!empty($settings['layout']['contentSize'])) {
      $vars['--wp--style--global--content-size'] = $settings['layout']['contentSize'];
    }
    if (!empty($settings['layout']['wideSize'])) {
      $vars['--wp--style--global--wide-size'] = $settings['layout']['wideSize'];
    }

    $css = '';

    if (!empty($vars)) {
      $css .= "body {\n";
      foreach ($vars as $property => $value) {
        $css .= "  $property: $value;\n";
      }
      $css .= "}\n";
    }

    // Generate layout gap rules. WordPress generates these via
    // useGlobalStylesOutput() from the Global Styles REST API.
    // Since Drupal doesn't have that API, we generate them here.
    if ($gapValue !== NULL) {
      $css .= $this->generateLayoutGapCss($gapValue);
    }

    return $css;
  }

  /**
   * Generate base structural CSS for all layout types.
   *
   * Mirrors the base-styles portion of WP_Theme_JSON::get_layout_styles().
   * These rules define the structural behavior of each layout type:
   * - Float helpers for alignleft/alignright/aligncenter children
   * - Width constraint rules for constrained layout
   * - Display and wrapping rules for flex/grid layouts.
   *
   * The gap/spacing rules are handled separately in generateLayoutGapCss().
   *
   * @return string
   *   CSS rulesets for layout base styles.
   */
  protected function generateLayoutBaseStyles(): string {
    $css = '';

    // Flow and constrained: float/alignment helpers for aligned children.
    // The :root prefix raises specificity to 0-1-0 so these rules match
    // (and beat by cascade order) the bare .wp-block-* selectors in
    // block-library/theme.css which also sit at 0-1-0.
    foreach (['is-layout-flow', 'is-layout-constrained'] as $class) {
      $css .= ":root :where(.$class) > .alignleft {\n";
      $css .= "  float: left;\n";
      $css .= "  margin-inline-start: 0;\n";
      $css .= "  margin-inline-end: 2em;\n";
      $css .= "}\n";
      $css .= ":root :where(.$class) > .alignright {\n";
      $css .= "  float: right;\n";
      $css .= "  margin-inline-start: 2em;\n";
      $css .= "  margin-inline-end: 0;\n";
      $css .= "}\n";
      $css .= ":root :where(.$class) > .aligncenter {\n";
      $css .= "  margin-left: auto !important;\n";
      $css .= "  margin-right: auto !important;\n";
      $css .= "}\n";
    }

    // Constrained layout: width constraint rules — this is the core of the
    // "inner content width" toggle on Group/Cover blocks. Children are
    // constrained to content-size unless they carry an align class.
    $css .= ":root :where(.is-layout-constrained) > :where(:not(.alignleft):not(.alignright):not(.alignfull)) {\n";
    $css .= "  max-width: var(--wp--style--global--content-size);\n";
    $css .= "  margin-left: auto !important;\n";
    $css .= "  margin-right: auto !important;\n";
    $css .= "}\n";
    $css .= ":root :where(.is-layout-constrained) > .alignwide {\n";
    $css .= "  max-width: var(--wp--style--global--wide-size);\n";
    $css .= "}\n";

    // Flex layout: display mode and base wrapping behavior.
    $css .= ":root :where(.is-layout-flex) {\n";
    $css .= "  display: flex;\n";
    $css .= "  flex-wrap: wrap;\n";
    $css .= "  align-items: center;\n";
    $css .= "}\n";
    $css .= ":root :where(.is-layout-flex) > * {\n";
    $css .= "  margin: 0;\n";
    $css .= "}\n";

    // Grid layout: display mode.
    $css .= ":root :where(.is-layout-grid) {\n";
    $css .= "  display: grid;\n";
    $css .= "}\n";
    $css .= ":root :where(.is-layout-grid) > * {\n";
    $css .= "  margin: 0;\n";
    $css .= "}\n";

    return $css;
  }

  /**
   * Generate layout gap CSS rules for all layout types.
   *
   * Mirrors the CSS that WordPress generates in
   * WP_Theme_JSON::get_layout_styles() for the root-level blockGap.
   *
   * @param string $gapValue
   *   The CSS gap value (e.g. "1.5rem").
   *
   * @return string
   *   CSS rulesets for layout gap.
   */
  protected function generateLayoutGapCss(string $gapValue): string {
    $css = '';

    // Flow layout (default): adjacent siblings get margin-block-start.
    // The :root prefix raises specificity to 0-1-0 so these rules tie
    // with (and beat by cascade order) the bare .wp-block-* margin
    // rules in block-library/theme.css.
    $css .= ":root :where(.is-layout-flow) > * {\n";
    $css .= "  margin-block-start: 0;\n";
    $css .= "  margin-block-end: 0;\n";
    $css .= "}\n";
    $css .= ":root :where(.is-layout-flow) > * + * {\n";
    $css .= "  margin-block-start: $gapValue;\n";
    $css .= "  margin-block-end: 0;\n";
    $css .= "}\n";

    // Constrained layout: same gap rules as flow.
    $css .= ":root :where(.is-layout-constrained) > * {\n";
    $css .= "  margin-block-start: 0;\n";
    $css .= "  margin-block-end: 0;\n";
    $css .= "}\n";
    $css .= ":root :where(.is-layout-constrained) > * + * {\n";
    $css .= "  margin-block-start: $gapValue;\n";
    $css .= "  margin-block-end: 0;\n";
    $css .= "}\n";

    // Flex layout: uses CSS gap.
    $css .= ":root :where(.is-layout-flex) {\n";
    $css .= "  gap: $gapValue;\n";
    $css .= "}\n";

    // Grid layout: uses CSS gap.
    $css .= ":root :where(.is-layout-grid) {\n";
    $css .= "  gap: $gapValue;\n";
    $css .= "}\n";

    return $css;
  }

  /**
   * Ensure the WP Style Engine classes are loaded.
   *
   * The style engine files are normally loaded when the StyleEngine class is
   * first referenced. This method ensures they are available even when
   * GlobalStylesGenerator is called before StyleEngine is referenced.
   */
  protected function ensureStyleEngineLoaded(): void {
    if (!class_exists('WP_Style_Engine_Gutenberg', FALSE)) {
      $dir = __DIR__ . '/StyleEngine';
      require_once $dir . '/utils.php';
      require_once $dir . '/style-engine-gutenberg.php';
      require_once $dir . '/class-wp-style-engine-gutenberg.php';
      require_once $dir . '/class-wp-style-engine-css-declarations-gutenberg.php';
      require_once $dir . '/class-wp-style-engine-css-rule-gutenberg.php';
      require_once $dir . '/class-wp-style-engine-css-rules-store-gutenberg.php';
      require_once $dir . '/class-wp-style-engine-processor-gutenberg.php';
    }
  }

}
