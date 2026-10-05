<?php

/**
 * @file
 * WP API shims for synced block-supports functions.
 *
 * These shims bridge the gap between WordPress global functions/classes and
 * Drupal's dependency injection, allowing the upstream gutenberg_render_*
 * functions to work unmodified.
 *
 * Loaded before block-supports/*.php via StyleEngine.php require chain.
 */

use Drupal\gutenberg\Html\TagProcessor;

// --- WP_HTML_Tag_Processor class alias ---

if ( ! class_exists( 'WP_HTML_Tag_Processor' ) ) {
  class_alias( TagProcessor::class, 'WP_HTML_Tag_Processor' );
}

// --- WP_Block_Type: minimal value object ---

if ( ! class_exists( 'WP_Block_Type' ) ) {
  /**
   * Minimal WP_Block_Type stand-in.
   *
   * The upstream render functions access $block_type->supports. This wraps
   * the array returned by BlocksLibraryManager::getBlockDefinition() so that
   * property access works.
   */
  class WP_Block_Type {
    /** @var array */
    public $supports = array();

    /** @var string */
    public $name = '';

    /** @var array */
    public $attributes = array();

    /** @var array */
    public $selectors = array();

    public function __construct( $name, $definition = array() ) {
      $this->name       = $name;
      $this->supports   = isset( $definition['supports'] ) ? $definition['supports'] : array();
      $this->attributes = isset( $definition['attributes'] ) ? $definition['attributes'] : array();
      $this->selectors  = isset( $definition['selectors'] ) ? $definition['selectors'] : array();
    }
  }
}

// --- WP_Block_Type_Registry: singleton that delegates to Drupal's BlocksLibraryManager ---

if ( ! class_exists( 'WP_Block_Type_Registry' ) ) {
  class WP_Block_Type_Registry {
    private static $instance;

    public static function get_instance() {
      if ( ! self::$instance ) {
        self::$instance = new self();
      }
      return self::$instance;
    }

    /**
     * Get a registered block type by name.
     *
     * @param string $name Block type name (e.g. 'core/group').
     * @return WP_Block_Type|null Block type object or null.
     */
    public function get_registered( $name ) {
      /** @var \Drupal\gutenberg\BlocksLibraryManager $manager */
      $manager    = \Drupal::service( 'plugin.manager.gutenberg.blocks_library' );
      $definition = $manager->getBlockDefinition( $name );
      if ( ! $definition ) {
        return null;
      }
      return new \WP_Block_Type( $name, $definition );
    }
  }
}

// --- block_has_support(): check if a block type supports a feature ---

if ( ! function_exists( 'block_has_support' ) ) {
  /**
   * Checks whether a block type supports a given feature.
   *
   * @param WP_Block_Type $block_type    Block type object.
   * @param array         $feature       Path to the feature in supports array.
   * @param mixed         $default_value Default value if feature not found.
   * @return bool Whether the feature is supported.
   */
  function block_has_support( $block_type, $feature, $default_value = false ) {
    $block_support = $default_value;
    if ( $block_type && property_exists( $block_type, 'supports' ) ) {
      $block_support = _wp_array_get( $block_type->supports, $feature, $default_value );
    }
    return true === $block_support || is_array( $block_support );
  }
}

// --- sanitize_title(): simplified WP title sanitizer for CSS class usage ---

if ( ! function_exists( 'sanitize_title' ) ) {
  /**
   * Sanitizes a string into a slug-like format suitable for CSS classes.
   *
   * Simplified version of WP's sanitize_title_with_dashes(). Sufficient for
   * the layout support use cases (orientation names, layout classnames, block names).
   *
   * @param string $title The title to sanitize.
   * @return string Sanitized title.
   */
  function sanitize_title( $title ) {
    $title = strip_tags( $title );
    $title = strtolower( $title );
    // Remove HTML entities.
    $title = preg_replace( '/&.+?;/', '', $title );
    // Replace dots with dashes.
    $title = str_replace( '.', '-', $title );
    // Remove anything that's not alphanumeric, space, dash, or underscore.
    $title = preg_replace( '/[^a-z0-9 _-]/', '', $title );
    // Replace whitespace with dashes.
    $title = preg_replace( '/\s+/', '-', $title );
    // Collapse multiple dashes.
    $title = preg_replace( '/-+/', '-', $title );
    // Trim dashes from ends.
    $title = trim( $title, '-' );
    return $title;
  }
}

// --- gutenberg_get_global_settings(): return theme settings in upstream format ---

if ( ! function_exists( 'gutenberg_get_global_settings' ) ) {
  /**
   * Returns the global settings from the active theme.
   *
   * Maps Drupal's theme definition structure to the format expected by upstream
   * block-supports functions.
   *
   * @param array $path    Optional. Path to a specific setting, e.g. ['viewport'].
   * @param array $context Optional. Unused; kept for upstream signature parity.
   * @return mixed Global settings array, or the value at $path.
   */
  function gutenberg_get_global_settings( $path = array(), $context = array() ) {
    /** @var \Drupal\gutenberg\GutenbergLibraryManager $library_manager */
    $library_manager         = \Drupal::service( 'plugin.manager.gutenberg.library' );
    $active_theme_definitions = $library_manager->getActiveThemeDefinitions();
    $theme_definitions       = isset( reset( $active_theme_definitions )['theme-support'] )
      ? reset( $active_theme_definitions )['theme-support']
      : array();

    // Upstream expects settings at the top level (e.g., 'spacing.blockGap'),
    // but Drupal theme definitions may have them under '__experimentalFeatures'.
    $settings = $theme_definitions;
    if ( isset( $theme_definitions['__experimentalFeatures'] ) ) {
      $settings = array_merge( $settings, $theme_definitions['__experimentalFeatures'] );
    }

    // Expose globalStyles.spacing.blockGap as settings.spacing.blockGap when
    // not already set via __experimentalFeatures.spacing.blockGap.
    // gutenberg_render_layout_support_flag() reads $settings['spacing']['blockGap']
    // to determine $has_block_gap_support; without this, flex/grid layout blocks
    // never generate gap CSS for their .wp-container-* class.
    if (
      ! isset( $settings['spacing']['blockGap'] ) &&
      isset( $theme_definitions['globalStyles']['spacing']['blockGap'] )
    ) {
      if ( ! isset( $settings['spacing'] ) ) {
        $settings['spacing'] = array();
      }
      $settings['spacing']['blockGap'] = $theme_definitions['globalStyles']['spacing']['blockGap'];
    }

    if ( ! empty( $path ) ) {
      return _wp_array_get( $settings, $path );
    }

    return $settings;
  }
}

// --- wp_should_skip_block_supports_serialization(): always false in Drupal ---

if ( ! function_exists( 'wp_should_skip_block_supports_serialization' ) ) {
  /**
   * Checks whether serialization of block supports should be skipped.
   *
   * In Drupal context, we never skip serialization.
   *
   * @return bool Always false.
   */
  function wp_should_skip_block_supports_serialization( $block_type, ...$args ) {
    return false;
  }
}

// --- current_theme_supports(): theme feature support check ---

if ( ! function_exists( 'current_theme_supports' ) ) {
  /**
   * Checks whether the current theme supports a given feature.
   *
   * For layout rendering, the relevant check is 'disable-layout-styles'
   * which we never want to be true in Drupal context.
   *
   * @param string $feature The feature to check.
   * @return bool Whether the feature is supported.
   */
  function current_theme_supports( $feature ) {
    // 'disable-layout-styles' should return false so layout styles are generated.
    if ( 'disable-layout-styles' === $feature ) {
      return false;
    }
    return true;
  }
}

// --- wp_theme_has_theme_json(): whether the active theme uses theme.json ---

if ( ! function_exists( 'wp_theme_has_theme_json' ) ) {
  /**
   * Whether the active theme has a theme.json file.
   *
   * In Drupal context, Gutenberg themes always have theme.json-like
   * definitions, so we return true.
   *
   * @return bool Always true.
   */
  function wp_theme_has_theme_json() {
    return true;
  }
}

// --- wp_parse_args(): merge user args with defaults ---

if ( ! function_exists( 'wp_parse_args' ) ) {
  function wp_parse_args( $args, $defaults = array() ) {
    if ( is_string( $args ) ) {
      parse_str( $args, $parsed );
      $args = $parsed;
    }
    return array_merge( $defaults, (array) $args );
  }
}

// --- _doing_it_wrong(): developer debug notice (no-op in Drupal) ---

if ( ! function_exists( '_doing_it_wrong' ) ) {
  function _doing_it_wrong( $function_name, $message, $version ) {
    // No-op: upstream uses this for developer warnings only.
  }
}

// --- WP_Block_Supports: singleton registry for block support features ---

if ( ! class_exists( 'WP_Block_Supports' ) ) {
  /**
   * Minimal WP_Block_Supports stand-in.
   *
   * Upstream files call register() at load time to register support features.
   * In Drupal, block supports are applied via BlockProcessor classes, so this
   * is a no-op sink.
   */
  class WP_Block_Supports {
    private static $instance;

    public static function get_instance() {
      if ( ! self::$instance ) {
        self::$instance = new self();
      }
      return self::$instance;
    }

    public function register( $name, $args = array() ) {
      // No-op: Drupal applies block supports via BlockProcessor classes.
    }
  }
}

// --- add_filter() / remove_filter(): WordPress hook system (no-op in Drupal) ---

if ( ! function_exists( 'add_filter' ) ) {
  function add_filter( $hook_name, $callback, $priority = 10, $accepted_args = 1 ) {
    // No-op: Drupal does not use the WordPress hook system.
    return true;
  }
}

if ( ! function_exists( 'remove_filter' ) ) {
  function remove_filter( $hook_name, $callback, $priority = 10 ) {
    // No-op: Drupal does not use the WordPress hook system.
    return true;
  }
}

// --- esc_attr(): HTML attribute escaping ---

if ( ! function_exists( 'esc_attr' ) ) {
  /**
   * Escapes a string for safe use in an HTML attribute.
   *
   * @param string $text The string to escape.
   * @return string Escaped string.
   */
  function esc_attr( $text ) {
    return htmlspecialchars( (string) $text, ENT_QUOTES, 'UTF-8' );
  }
}

// --- wp_enqueue_script_module(): no-op in Drupal (ES module loading) ---

if ( ! function_exists( 'wp_enqueue_script_module' ) ) {
  /**
   * Enqueues a JavaScript module.
   *
   * No-op in Drupal: upstream uses this (e.g. for fit-text frontend) but
   * Drupal loads view scripts via its own library system.
   */
  function wp_enqueue_script_module( ...$args ) {
    // No-op: Drupal handles script loading via libraries.
  }
}

// --- _deprecated_argument(): deprecated argument notice (no-op in Drupal) ---

if ( ! function_exists( '_deprecated_argument' ) ) {
  function _deprecated_argument( $function_name, $version, $message = '' ) {
    // No-op: upstream uses this for deprecation warnings only.
  }
}

// --- gutenberg_get_global_styles(): return merged styles from theme definition ---

if ( ! function_exists( 'gutenberg_get_global_styles' ) ) {
  /**
   * Returns the global styles from the active theme.
   *
   * Maps Drupal's theme definition 'globalStyles' to the format expected by
   * upstream block-supports functions (e.g. layout.php for blockGap lookups).
   *
   * @param array $path    Optional path to a specific style.
   * @param array $context Optional context (unused in Drupal).
   * @return array Global styles array.
   */
  function gutenberg_get_global_styles( $path = array(), $context = array() ) {
    /** @var \Drupal\gutenberg\GutenbergLibraryManager $library_manager */
    $library_manager         = \Drupal::service( 'plugin.manager.gutenberg.library' );
    $active_theme_definitions = $library_manager->getActiveThemeDefinitions();
    $theme_definitions       = isset( reset( $active_theme_definitions )['theme-support'] )
      ? reset( $active_theme_definitions )['theme-support']
      : array();

    $styles = $theme_definitions['globalStyles'] ?? array();

    if ( ! empty( $path ) ) {
      return _wp_array_get( $styles, $path, $styles );
    }

    return $styles;
  }
}

// --- gutenberg_get_block_style_variation_name_from_registered_style() ---

if ( ! function_exists( 'gutenberg_get_block_style_variation_name_from_registered_style' ) ) {
  /**
   * Get the first style variation name from a className string that matches a registered style.
   *
   * Copied from upstream layout.php — needed by gutenberg_render_layout_support_flag().
   *
   * @param string $class_name        CSS class string for a block.
   * @param array  $registered_styles Currently registered block styles.
   * @return string|null The name of the first registered variation, or null if none found.
   */
  function gutenberg_get_block_style_variation_name_from_registered_style( string $class_name, array $registered_styles = array() ): ?string {
    if ( ! $class_name ) {
      return null;
    }

    $registered_names = array_filter( array_column( $registered_styles, 'name' ) );

    $prefix = 'is-style-';
    $length = strlen( $prefix );

    foreach ( explode( ' ', $class_name ) as $class ) {
      if ( str_starts_with( $class, $prefix ) ) {
        $variation = substr( $class, $length );
        if ( 'default' !== $variation && in_array( $variation, $registered_names, true ) ) {
          return $variation;
        }
      }
    }

    return null;
  }
}

// --- WP_Block_Styles_Registry: minimal stand-in for style variation lookups ---

if ( ! class_exists( 'WP_Block_Styles_Registry' ) ) {
  /**
   * Minimal WP_Block_Styles_Registry stand-in.
   *
   * Used by gutenberg_render_layout_support_flag() to look up registered
   * block styles for variation-based blockGap resolution. Returns empty
   * in Drupal since block style variations are not registered server-side.
   */
  class WP_Block_Styles_Registry {
    private static $instance;

    public static function get_instance() {
      if ( ! self::$instance ) {
        self::$instance = new self();
      }
      return self::$instance;
    }

    public function get_registered_styles_for_block( $block_name ) {
      return array();
    }
  }
}

// --- WP_Theme_JSON_Gutenberg: viewport media queries only ---

if ( ! class_exists( 'WP_Theme_JSON_Gutenberg' ) ) {
  /**
   * Minimal WP_Theme_JSON_Gutenberg stand-in.
   *
   * Used by the layout, block visibility and states block supports for
   * responsive (@mobile/@tablet) media queries, element selectors and valid
   * pseudo-states. Constants and methods are copied verbatim from upstream
   * lib/class-wp-theme-json-gutenberg.php.
   */
  class WP_Theme_JSON_Gutenberg {

    const ELEMENTS = array(
      'link'      => 'a:where(:not(.wp-element-button))',
      'heading'   => 'h1, h2, h3, h4, h5, h6',
      'h1'        => 'h1',
      'h2'        => 'h2',
      'h3'        => 'h3',
      'h4'        => 'h4',
      'h5'        => 'h5',
      'h6'        => 'h6',
      'button'    => '.wp-element-button, .wp-block-button__link',
      'caption'   => '.wp-element-caption, .wp-block-audio figcaption, .wp-block-embed figcaption, .wp-block-gallery figcaption, .wp-block-image figcaption, .wp-block-table figcaption, .wp-block-video figcaption',
      'cite'      => 'cite',
      'label'     => 'label',
      'select'    => 'select',
      'textInput' => 'textarea, input:where([type=email],[type=number],[type=password],[type=search],[type=text],[type=tel],[type=url])',
    );

    const VALID_ELEMENT_PSEUDO_SELECTORS = array(
      'link'   => array( ':link', ':any-link', ':visited', ':hover', ':focus', ':focus-visible', ':active' ),
      'button' => array( ':link', ':any-link', ':visited', ':hover', ':focus', ':focus-visible', ':active' ),
    );

    const VALID_BLOCK_PSEUDO_SELECTORS = array(
      'core/button'          => array( ':hover', ':focus', ':focus-visible', ':active' ),
      'core/navigation-link' => array( ':hover', ':focus', ':focus-visible', ':active' ),
    );

    const DEFAULT_VIEWPORT_BREAKPOINTS = array(
      'mobile' => '480px',
      'tablet' => '782px',
    );

    public static function get_viewport_media_queries( $viewport_settings = null, $options = array() ) {
      $breakpoints = static::sanitize_viewport_settings( $viewport_settings );

      $responsive_media_queries = array();

      if ( isset( $breakpoints['mobile'] ) ) {
        $responsive_media_queries['@mobile'] = "@media (width <= {$breakpoints['mobile']})";
      }

      if ( isset( $breakpoints['tablet'] ) ) {
        $responsive_media_queries['@tablet'] = isset( $breakpoints['mobile'] )
          ? sprintf(
            '@media (%s < width <= %s)',
            $breakpoints['mobile'],
            $breakpoints['tablet']
          )
          : "@media (width <= {$breakpoints['tablet']})";
      }

      if ( ! empty( $options['include_desktop'] ) ) {
        if ( isset( $breakpoints['tablet'] ) ) {
          $desktop_breakpoint = $breakpoints['tablet'];
        } else {
          $desktop_breakpoint = $breakpoints['mobile'];
        }

        $responsive_media_queries['@desktop'] =
          "@media (width > {$desktop_breakpoint})";
      }

      return $responsive_media_queries;
    }

    private static function is_valid_viewport_breakpoint_size( $value ) {
      if ( ! is_string( $value ) ) {
        return false;
      }
      $value = trim( $value );
      if ( '' === $value ) {
        return false;
      }
      return 1 === preg_match( '/^(?:\d+|\d*\.\d+)(?:px|em|rem)$/', $value );
    }

    private static function get_viewport_breakpoint_value_in_pixels( $value ) {
      if ( ! static::is_valid_viewport_breakpoint_size( $value ) ) {
        return null;
      }
      $value = trim( $value );
      $unit  = substr( $value, -3 );
      if ( 'rem' === $unit ) {
        $number = (float) substr( $value, 0, -3 );
      } else {
        $unit   = substr( $value, -2 );
        $number = (float) substr( $value, 0, -2 );
      }
      return 'px' === $unit ? $number : $number * 16;
    }

    private static function sanitize_viewport_settings( $viewport_settings ) {
      if ( ! is_array( $viewport_settings ) ) {
        return static::DEFAULT_VIEWPORT_BREAKPOINTS;
      }
      $breakpoints = array();
      foreach ( array_keys( static::DEFAULT_VIEWPORT_BREAKPOINTS ) as $breakpoint ) {
        $value = $viewport_settings[ $breakpoint ] ?? null;
        $px    = static::get_viewport_breakpoint_value_in_pixels( $value );
        if ( null !== $px ) {
          $breakpoints[ $breakpoint ] = array(
            'value' => trim( $value ),
            'px'    => $px,
          );
        }
      }
      if ( empty( $breakpoints ) ) {
        return static::DEFAULT_VIEWPORT_BREAKPOINTS;
      }
      if ( 1 === count( $breakpoints ) ) {
        $breakpoint = key( $breakpoints );
        return array( $breakpoint => $breakpoints[ $breakpoint ]['value'] );
      }
      $sanitized = array( 'mobile' => $breakpoints['mobile']['value'] );
      if ( isset( $breakpoints['tablet'] ) && $breakpoints['mobile']['px'] < $breakpoints['tablet']['px'] ) {
        $sanitized['tablet'] = $breakpoints['tablet']['value'];
      }
      return $sanitized;
    }

  }
}

// --- wp_get_block_css_selector(): root selector only ---

if ( ! function_exists( 'wp_get_block_css_selector' ) ) {
  /**
   * Returns the CSS selector for a block type (root target only).
   *
   * Ported from WP core's wp_get_block_css_selector(). The synced block
   * supports only request the root selector, so feature and subfeature
   * targets are not supported and return null.
   *
   * @param WP_Block_Type $block_type Block type.
   * @param string|array  $target     Target selector; only 'root' is supported.
   * @param bool          $fallback   Unused.
   * @return string|null CSS selector, or null for unsupported targets.
   */
  function wp_get_block_css_selector( $block_type, $target = 'root', $fallback = false ) {
    if ( 'root' !== $target ) {
      return null;
    }
    if ( ! empty( $block_type->selectors['root'] ) ) {
      return $block_type->selectors['root'];
    }
    if ( isset( $block_type->supports['__experimentalSelector'] ) && is_string( $block_type->supports['__experimentalSelector'] ) ) {
      return $block_type->supports['__experimentalSelector'];
    }
    $block_name = str_replace( '/', '-', str_replace( 'core/', '', $block_type->name ) );
    return ".wp-block-{$block_name}";
  }
}

// --- WP_HTML_Processor: void element check only ---

if ( ! class_exists( 'WP_HTML_Processor' ) ) {
  /**
   * Minimal WP_HTML_Processor stand-in.
   *
   * gutenberg_restore_group_inner_container() only needs the static
   * is_void() check (copied from WP core html-api).
   */
  class WP_HTML_Processor {

    public static function is_void( $tag_name ): bool {
      $tag_name = strtoupper( $tag_name );

      return (
        'AREA' === $tag_name ||
        'BASE' === $tag_name ||
        'BASEFONT' === $tag_name ||
        'BGSOUND' === $tag_name ||
        'BR' === $tag_name ||
        'COL' === $tag_name ||
        'EMBED' === $tag_name ||
        'FRAME' === $tag_name ||
        'HR' === $tag_name ||
        'IMG' === $tag_name ||
        'INPUT' === $tag_name ||
        'KEYGEN' === $tag_name ||
        'LINK' === $tag_name ||
        'META' === $tag_name ||
        'PARAM' === $tag_name ||
        'SOURCE' === $tag_name ||
        'TRACK' === $tag_name ||
        'WBR' === $tag_name
      );
    }

  }
}

// --- _wp_get_presets_class_name(): deterministic class name for block-level presets ---

if ( ! function_exists( '_wp_get_presets_class_name' ) ) {
  /**
   * Get the class name used on block level presets.
   *
   * Mirrors WP core: returns a unique, deterministic class name derived from
   * the full block array, used by SettingsProcessor to scope per-block CSS
   * custom properties.
   *
   * @param array $block Block object.
   * @return string      The unique class name.
   */
  function _wp_get_presets_class_name( $block ) {
    return 'wp-settings-' . md5( serialize( $block ) );
  }
}
