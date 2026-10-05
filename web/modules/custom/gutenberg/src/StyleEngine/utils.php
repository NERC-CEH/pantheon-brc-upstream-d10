<?php

// Disable SCRIPT_DEBUG mode
define('SCRIPT_DEBUG', false);

function apply_filters( $hook_name, $value, ...$args ) {
    return $value;
}

if ( ! function_exists( '__' ) ) {
    /**
     * Identity passthrough for WordPress i18n. Drupal has its own i18n system.
     */
    function __( $text, $domain = 'default' ) {
        return $text;
    }
}

if ( ! function_exists( '_doing_it_wrong' ) ) {
    /**
     * Marks something as being incorrectly called. Triggers an E_USER_NOTICE.
     */
    function _doing_it_wrong( $function_name, $message, $version ) {
        trigger_error(
            sprintf( '%1$s was called <strong>incorrectly</strong>. %2$s (since %3$s)', $function_name, $message, $version ),
            E_USER_NOTICE
        );
    }
}

if ( ! function_exists( '_deprecated_argument' ) ) {
    /**
     * Marks a function argument as deprecated. No-op in Drupal context.
     */
    function _deprecated_argument( $function_name, $version, $message = '' ) {
        // No-op: deprecated argument handling is not needed in Drupal context.
    }
}

if ( ! function_exists( 'wp_json_encode' ) ) {
    /**
     * Encodes a variable into JSON with WP's default flags.
     */
    function wp_json_encode( $value, $flags = 0, $depth = 512 ) {
        return json_encode( $value, $flags, $depth );
    }
}

if ( ! function_exists( 'wp_kses_bad_protocol' ) ) {
    /**
     * Sanitizes a URL by checking against an allowed list of protocols.
     */
    function wp_kses_bad_protocol( $content, $allowed_protocols ) {
        // Parse the protocol from the URL.
        if ( preg_match( '/^([a-zA-Z][a-zA-Z0-9+\-.]*):/', $content, $matches ) ) {
            $protocol = strtolower( $matches[1] );
            if ( ! in_array( $protocol, $allowed_protocols, true ) ) {
                return '';
            }
        }
        return $content;
    }
}

/**
 * Merges user defined arguments into defaults array.
 *
 * This function is used throughout WordPress to allow for both string or array
 * to be merged into another array.
 *
 * @since 2.2.0
 * @since 2.3.0 `$args` can now also be an object.
 *
 * @param string|array|object $args     Value to merge with $defaults.
 * @param array               $defaults Optional. Array that serves as the defaults.
 *                                      Default empty array.
 * @return array Merged user defined values with defaults.
 */
function wp_parse_args( $args, $defaults = array() ) {
	if ( is_object( $args ) ) {
		$parsed_args = get_object_vars( $args );
	} elseif ( is_array( $args ) ) {
		$parsed_args =& $args;
	} else {
		wp_parse_str( $args, $parsed_args );
	}

	if ( is_array( $defaults ) && $defaults ) {
		return array_merge( $defaults, $parsed_args );
	}
	return $parsed_args;
}

/**
 * Parses a string into variables to be stored in an array.
 *
 * @since 2.2.1
 *
 * @param string $input_string The string to be parsed.
 * @param array  $result       Variables will be stored in this array.
 */
function wp_parse_str( $input_string, &$result ) {
	parse_str( (string) $input_string, $result );

    return $result;

	/**
	 * Filters the array of variables derived from a parsed string.
	 *
	 * @since 2.2.1
	 *
	 * @param array $result The array populated with variables.
	 */
	// $result = apply_filters( 'wp_parse_str', $result );
}

/**
 * Sanitizes a string key.
 *
 * Keys are used as internal identifiers. Lowercase alphanumeric characters,
 * dashes, and underscores are allowed.
 *
 * @since 3.0.0
 *
 * @param string $key String key.
 * @return string Sanitized key.
 */
function sanitize_key( $key ) {
	$sanitized_key = '';

	if ( is_scalar( $key ) ) {
		$sanitized_key = strtolower( $key );
		$sanitized_key = preg_replace( '/[^a-z0-9_\-]/', '', $sanitized_key );
	}

    return $sanitized_key;

	/**
	 * Filters a sanitized key string.
	 *
	 * @since 3.0.0
	 *
	 * @param string $sanitized_key Sanitized key.
	 * @param string $key           The key prior to sanitization.
	 */
	// return apply_filters( 'sanitize_key', $sanitized_key, $key );
}

/**
 * Properly strips all HTML tags including script and style
 *
 * This differs from strip_tags() because it removes the contents of
 * the `<script>` and `<style>` tags. E.g. `strip_tags( '<script>something</script>' )`
 * will return 'something'. wp_strip_all_tags will return ''
 *
 * @since 2.9.0
 *
 * @param string $text          String containing HTML tags
 * @param bool   $remove_breaks Optional. Whether to remove left over line breaks and white space chars
 * @return string The processed string.
 */
function wp_strip_all_tags( $text, $remove_breaks = false ) {
	if ( is_null( $text ) ) {
		return '';
	}

	if ( ! is_scalar( $text ) ) {
		/*
		 * To maintain consistency with pre-PHP 8 error levels,
		 * trigger_error() is used to trigger an E_USER_WARNING,
		 * rather than _doing_it_wrong(), which triggers an E_USER_NOTICE.
		 */
		trigger_error(
			sprintf(
				/* translators: 1: The function name, 2: The argument number, 3: The argument name, 4: The expected type, 5: The provided type. */
				__( 'Warning: %1$s expects parameter %2$s (%3$s) to be a %4$s, %5$s given.' ),
				__FUNCTION__,
				'#1',
				'$text',
				'string',
				gettype( $text )
			),
			E_USER_WARNING
		);

		return '';
	}

	$text = preg_replace( '@<(script|style)[^>]*?>.*?</\\1>@si', '', $text );
	$text = strip_tags( $text );

	if ( $remove_breaks ) {
		$text = preg_replace( '/[\r\n\t ]+/', ' ', $text );
	}

	return trim( $text );
}

/**
 * Filters an inline style attribute and removes disallowed rules.
 *
 * @since 2.8.1
 * @since 4.4.0 Added support for `min-height`, `max-height`, `min-width`, and `max-width`.
 * @since 4.6.0 Added support for `list-style-type`.
 * @since 5.0.0 Added support for `background-image`.
 * @since 5.1.0 Added support for `text-transform`.
 * @since 5.2.0 Added support for `background-position` and `grid-template-columns`.
 * @since 5.3.0 Added support for `grid`, `flex` and `column` layout properties.
 *              Extended `background-*` support for individual properties.
 * @since 5.3.1 Added support for gradient backgrounds.
 * @since 5.7.1 Added support for `object-position`.
 * @since 5.8.0 Added support for `calc()` and `var()` values.
 * @since 6.1.0 Added support for `min()`, `max()`, `minmax()`, `clamp()`,
 *              nested `var()` values, and assigning values to CSS variables.
 *              Added support for `object-fit`, `gap`, `column-gap`, `row-gap`, and `flex-wrap`.
 *              Extended `margin-*` and `padding-*` support for logical properties.
 * @since 6.2.0 Added support for `aspect-ratio`, `position`, `top`, `right`, `bottom`, `left`,
 *              and `z-index` CSS properties.
 * @since 6.3.0 Extended support for `filter` to accept a URL and added support for repeat().
 *              Added support for `box-shadow`.
 * @since 6.4.0 Added support for `writing-mode`.
 *
 * @param string $css        A string of CSS rules.
 * @param string $deprecated Not used.
 * @return string Filtered string of CSS rules.
 */
function safecss_filter_attr( $css, $deprecated = '' ) {
	if ( ! empty( $deprecated ) ) {
		_deprecated_argument( __FUNCTION__, '2.8.1' ); // Never implemented.
	}

	$css = wp_kses_no_null( $css );
	$css = str_replace( array( "\n", "\r", "\t" ), '', $css );

	$allowed_protocols = wp_allowed_protocols();

	$css_array = explode( ';', trim( $css ) );

	/**
	 * Filters the list of allowed CSS attributes.
	 *
	 * @since 2.8.1
	 *
	 * @param string[] $attr Array of allowed CSS attributes.
	 */
	$allowed_attr = apply_filters(
		'safe_style_css',
		array(
			'background',
			'background-color',
			'background-image',
			'background-position',
			'background-size',
			'background-attachment',
			'background-blend-mode',

			'border',
			'border-radius',
			'border-width',
			'border-color',
			'border-style',
			'border-right',
			'border-right-color',
			'border-right-style',
			'border-right-width',
			'border-bottom',
			'border-bottom-color',
			'border-bottom-left-radius',
			'border-bottom-right-radius',
			'border-bottom-style',
			'border-bottom-width',
			'border-bottom-right-radius',
			'border-bottom-left-radius',
			'border-left',
			'border-left-color',
			'border-left-style',
			'border-left-width',
			'border-top',
			'border-top-color',
			'border-top-left-radius',
			'border-top-right-radius',
			'border-top-style',
			'border-top-width',
			'border-top-left-radius',
			'border-top-right-radius',

			'border-spacing',
			'border-collapse',
			'caption-side',

			'columns',
			'column-count',
			'column-fill',
			'column-gap',
			'column-rule',
			'column-span',
			'column-width',

			'color',
			'filter',
			'font',
			'font-family',
			'font-size',
			'font-style',
			'font-variant',
			'font-weight',
			'letter-spacing',
			'line-height',
			'text-align',
			'text-decoration',
			'text-indent',
			'text-transform',

			'height',
			'min-height',
			'max-height',

			'width',
			'min-width',
			'max-width',

			'margin',
			'margin-right',
			'margin-bottom',
			'margin-left',
			'margin-top',
			'margin-block-start',
			'margin-block-end',
			'margin-inline-start',
			'margin-inline-end',

			'padding',
			'padding-right',
			'padding-bottom',
			'padding-left',
			'padding-top',
			'padding-block-start',
			'padding-block-end',
			'padding-inline-start',
			'padding-inline-end',

			'flex',
			'flex-basis',
			'flex-direction',
			'flex-flow',
			'flex-grow',
			'flex-shrink',
			'flex-wrap',

			'gap',
			'column-gap',
			'row-gap',

			'grid-template-columns',
			'grid-auto-columns',
			'grid-column-start',
			'grid-column-end',
			'grid-column-gap',
			'grid-template-rows',
			'grid-auto-rows',
			'grid-row-start',
			'grid-row-end',
			'grid-row-gap',
			'grid-gap',

			'justify-content',
			'justify-items',
			'justify-self',
			'align-content',
			'align-items',
			'align-self',

			'clear',
			'cursor',
			'direction',
			'float',
			'list-style-type',
			'object-fit',
			'object-position',
			'overflow',
			'vertical-align',
			'writing-mode',

			'position',
			'top',
			'right',
			'bottom',
			'left',
			'z-index',
			'box-shadow',
			'aspect-ratio',

			// Added to match WP core's safe_style_css list (wp-includes/kses.php).
			'alignment-baseline',
			'anchor-name',
			'anchor-scope',
			'background-repeat',
			'baseline-shift',
			'clip-path',
			'clip-rule',
			'color-interpolation',
			'color-interpolation-filters',
			'color-rendering',
			'container-type',
			'cx',
			'cy',
			'd',
			'display',
			'dominant-baseline',
			'fill',
			'fill-opacity',
			'fill-rule',
			'flood-color',
			'flood-opacity',
			'font-size-adjust',
			'font-stretch',
			'glyph-orientation-horizontal',
			'glyph-orientation-vertical',
			'grid-column',
			'grid-row',
			'image-rendering',
			'lighting-color',
			'marker',
			'marker-end',
			'marker-mid',
			'marker-start',
			'mask',
			'mask-type',
			'opacity',
			'paint-order',
			'pointer-events',
			'position-anchor',
			'position-area',
			'position-try',
			'position-try-fallbacks',
			'position-try-order',
			'position-visibility',
			'r',
			'rx',
			'ry',
			'shape-rendering',
			'stop-color',
			'stop-opacity',
			'stroke',
			'stroke-dasharray',
			'stroke-dashoffset',
			'stroke-linecap',
			'stroke-linejoin',
			'stroke-miterlimit',
			'stroke-opacity',
			'stroke-width',
			'text-anchor',
			'text-rendering',
			'transform',
			'transform-origin',
			'unicode-bidi',
			'vector-effect',
			'visibility',
			'white-space',
			'word-spacing',
			'x',
			'y',
			// Custom CSS properties.
			'--*',
		)
	);

	/*
	 * CSS attributes that accept URL data types.
	 *
	 * This is in accordance to the CSS spec and unrelated to
	 * the sub-set of supported attributes above.
	 *
	 * See: https://developer.mozilla.org/en-US/docs/Web/CSS/url
	 */
	$css_url_data_types = array(
		'background',
		'background-image',

		'cursor',
		'filter',

		'list-style',
		'list-style-image',
	);

	/*
	 * CSS attributes that accept gradient data types.
	 *
	 */
	$css_gradient_data_types = array(
		'background',
		'background-image',
	);

	if ( empty( $allowed_attr ) ) {
		return $css;
	}

	$css = '';
	foreach ( $css_array as $css_item ) {
		if ( '' === $css_item ) {
			continue;
		}

		$css_item        = trim( $css_item );
		$css_test_string = $css_item;
		$found           = false;
		$url_attr        = false;
		$gradient_attr   = false;
		$is_custom_var   = false;

		if ( ! str_contains( $css_item, ':' ) ) {
			$found = true;
		} else {
			$parts        = explode( ':', $css_item, 2 );
			$css_selector = trim( $parts[0] );

			// Allow assigning values to CSS variables.
			if ( in_array( '--*', $allowed_attr, true ) && preg_match( '/^--[a-zA-Z0-9-_]+$/', $css_selector ) ) {
				$allowed_attr[] = $css_selector;
				$is_custom_var  = true;
			}

			if ( in_array( $css_selector, $allowed_attr, true ) ) {
				$found         = true;
				$url_attr      = in_array( $css_selector, $css_url_data_types, true );
				$gradient_attr = in_array( $css_selector, $css_gradient_data_types, true );
			}

			if ( $is_custom_var ) {
				$css_value     = trim( $parts[1] );
				$url_attr      = str_starts_with( $css_value, 'url(' );
				$gradient_attr = str_contains( $css_value, '-gradient(' );
			}
		}

		if ( $found && $url_attr ) {
			// Simplified: matches the sequence `url(*)`.
			preg_match_all( '/url\([^)]+\)/', $parts[1], $url_matches );

			foreach ( $url_matches[0] as $url_match ) {
				// Clean up the URL from each of the matches above.
				preg_match( '/^url\(\s*([\'\"]?)(.*)(\g1)\s*\)$/', $url_match, $url_pieces );

				if ( empty( $url_pieces[2] ) ) {
					$found = false;
					break;
				}

				$url = trim( $url_pieces[2] );

				if ( empty( $url ) || wp_kses_bad_protocol( $url, $allowed_protocols ) !== $url ) {
					$found = false;
					break;
				} else {
					// Remove the whole `url(*)` bit that was matched above from the CSS.
					$css_test_string = str_replace( $url_match, '', $css_test_string );
				}
			}
		}

		if ( $found && $gradient_attr ) {
			$css_value = trim( $parts[1] );
			if ( preg_match( '/^(repeating-)?(linear|radial|conic)-gradient\(([^()]|rgb[a]?\([^()]*\))*\)$/', $css_value ) ) {
				// Remove the whole `gradient` bit that was matched above from the CSS.
				$css_test_string = str_replace( $css_value, '', $css_test_string );
			}
		}

		if ( $found ) {
			/*
			 * Allow CSS functions like var(), calc(), etc. by removing them from the test string.
			 * Nested functions and parentheses are also removed, so long as the parentheses are balanced.
			 */
			$css_test_string = preg_replace(
				'/\b(?:var|calc|min|max|minmax|clamp|repeat)(\((?:[^()]|(?1))*\))/',
				'',
				$css_test_string
			);

			/*
			 * Disallow CSS containing \ ( & } = or comments, except for within url(), var(), calc(), etc.
			 * which were removed from the test string above.
			 */
			$allow_css = ! preg_match( '%[\\\(&=}]|/\*%', $css_test_string );

			/**
			 * Filters the check for unsafe CSS in `safecss_filter_attr`.
			 *
			 * Enables developers to determine whether a section of CSS should be allowed or discarded.
			 * By default, the value will be false if the part contains \ ( & } = or comments.
			 * Return true to allow the CSS part to be included in the output.
			 *
			 * @since 5.5.0
			 *
			 * @param bool   $allow_css       Whether the CSS in the test string is considered safe.
			 * @param string $css_test_string The CSS string to test.
			 */
			$allow_css = apply_filters( 'safecss_filter_attr_allow_css', $allow_css, $css_test_string );

			// Only add the CSS part if it passes the regex check.
			if ( $allow_css ) {
				if ( '' !== $css ) {
					$css .= ';';
				}

				$css .= $css_item;
			}
		}
	}

	return $css;
}

/**
 * Removes any invalid control characters in a text string.
 *
 * Also removes any instance of the `\0` string.
 *
 * @since 1.0.0
 *
 * @param string $content Content to filter null characters from.
 * @param array  $options Set 'slash_zero' => 'keep' when '\0' is allowed. Default is 'remove'.
 * @return string Filtered content.
 */
function wp_kses_no_null( $content, $options = null ) {
	if ( ! isset( $options['slash_zero'] ) ) {
		$options = array( 'slash_zero' => 'remove' );
	}

	$content = preg_replace( '/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $content );
	if ( 'remove' === $options['slash_zero'] ) {
		$content = preg_replace( '/\\\\+0+/', '', $content );
	}

	return $content;
}

/**
 * Retrieves a list of protocols to allow in HTML attributes.
 *
 * @since 3.3.0
 * @since 4.3.0 Added 'webcal' to the protocols array.
 * @since 4.7.0 Added 'urn' to the protocols array.
 * @since 5.3.0 Added 'sms' to the protocols array.
 * @since 5.6.0 Added 'irc6' and 'ircs' to the protocols array.
 *
 * @see wp_kses()
 * @see esc_url()
 *
 * @return string[] Array of allowed protocols. Defaults to an array containing 'http', 'https',
 *                  'ftp', 'ftps', 'mailto', 'news', 'irc', 'irc6', 'ircs', 'gopher', 'nntp', 'feed',
 *                  'telnet', 'mms', 'rtsp', 'sms', 'svn', 'tel', 'fax', 'xmpp', 'webcal', and 'urn'.
 *                  This covers all common link protocols, except for 'javascript' which should not
 *                  be allowed for untrusted users.
 */
function wp_allowed_protocols() {
	static $protocols = array();

	if ( empty( $protocols ) ) {
		$protocols = array( 'http', 'https', 'ftp', 'ftps', 'mailto', 'news', 'irc', 'irc6', 'ircs', 'gopher', 'nntp', 'feed', 'telnet', 'mms', 'rtsp', 'sms', 'svn', 'tel', 'fax', 'xmpp', 'webcal', 'urn' );
	}

	if ( ! did_action( 'wp_loaded' ) ) {
		/**
		 * Filters the list of protocols allowed in HTML attributes.
		 *
		 * @since 3.0.0
		 *
		 * @param string[] $protocols Array of allowed protocols e.g. 'http', 'ftp', 'tel', and more.
		 */
		// $protocols = array_unique( (array) apply_filters( 'kses_allowed_protocols', $protocols ) );
	}

	return $protocols;
}

/**
 * Retrieves the number of times an action has been fired during the current request.
 *
 * @since 2.1.0
 *
 * @global int[] $wp_actions Stores the number of times each action was triggered.
 *
 * @param string $hook_name The name of the action hook.
 * @return int The number of times the action hook has been fired.
 */
function did_action( $hook_name ) {
	global $wp_actions;

	if ( ! isset( $wp_actions[ $hook_name ] ) ) {
		return 0;
	}

	return $wp_actions[ $hook_name ];
}

/**
 * Accesses an array in depth based on a path of keys.
 *
 * It is the PHP equivalent of JavaScript's `lodash.get()` and mirroring it may help other components
 * retain some symmetry between client and server implementations.
 *
 * Example usage:
 *
 *     $input_array = array(
 *         'a' => array(
 *             'b' => array(
 *                 'c' => 1,
 *             ),
 *         ),
 *     );
 *     _wp_array_get( $input_array, array( 'a', 'b', 'c' ) );
 *
 * @internal
 *
 * @since 5.6.0
 * @access private
 *
 * @param array $input_array   An array from which we want to retrieve some information.
 * @param array $path          An array of keys describing the path with which to retrieve information.
 * @param mixed $default_value Optional. The return value if the path does not exist within the array,
 *                             or if `$input_array` or `$path` are not arrays. Default null.
 * @return mixed The value from the path specified.
 */
function _wp_array_get( $input_array, $path, $default_value = null ) {
	// Confirm $path is valid.
	if ( ! is_array( $path ) || 0 === count( $path ) ) {
		return $default_value;
	}

	foreach ( $path as $path_element ) {
		if ( ! is_array( $input_array ) ) {
			return $default_value;
		}

		if ( is_string( $path_element )
			|| is_integer( $path_element )
			|| null === $path_element
		) {
			/*
			 * Check if the path element exists in the input array.
			 * We check with `isset()` first, as it is a lot faster
			 * than `array_key_exists()`.
			 */
			if ( isset( $input_array[ $path_element ] ) ) {
				$input_array = $input_array[ $path_element ];
				continue;
			}

			/*
			 * If `isset()` returns false, we check with `array_key_exists()`,
			 * which also checks for `null` values.
			 */
			if ( array_key_exists( $path_element, $input_array ) ) {
				$input_array = $input_array[ $path_element ];
				continue;
			}
		}

		return $default_value;
	}

	return $input_array;
}


/**
 * This function is trying to replicate what
 * lodash's kebabCase (JS library) does in the client.
 *
 * The reason we need this function is that we do some processing
 * in both the client and the server (e.g.: we generate
 * preset classes from preset slugs) that needs to
 * create the same output.
 *
 * We can't remove or update the client's library due to backward compatibility
 * (some of the output of lodash's kebabCase is saved in the post content).
 * We have to make the server behave like the client.
 *
 * Changes to this function should follow updates in the client
 * with the same logic.
 *
 * @link https://github.com/lodash/lodash/blob/4.17/dist/lodash.js#L14369
 * @link https://github.com/lodash/lodash/blob/4.17/dist/lodash.js#L278
 * @link https://github.com/lodash-php/lodash-php/blob/master/src/String/kebabCase.php
 * @link https://github.com/lodash-php/lodash-php/blob/master/src/internal/unicodeWords.php
 *
 * @param string $input_string The string to kebab-case.
 *
 * @return string kebab-cased-string.
 */
function _wp_to_kebab_case( $input_string ) {
	// Ignore the camelCase names for variables so the names are the same as lodash so comparing and porting new changes is easier.
	// phpcs:disable WordPress.NamingConventions.ValidVariableName.VariableNotSnakeCase

	/*
	 * Some notable things we've removed compared to the lodash version are:
	 *
	 * - non-alphanumeric characters: rsAstralRange, rsEmoji, etc
	 * - the groups that processed the apostrophe, as it's removed before passing the string to preg_match: rsApos, rsOptContrLower, and rsOptContrUpper
	 *
	 */

	/** Used to compose unicode character classes. */
	$rsLowerRange       = 'a-z\\xdf-\\xf6\\xf8-\\xff';
	$rsNonCharRange     = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf';
	$rsPunctuationRange = '\\x{2000}-\\x{206f}';
	$rsSpaceRange       = ' \\t\\x0b\\f\\xa0\\x{feff}\\n\\r\\x{2028}\\x{2029}\\x{1680}\\x{180e}\\x{2000}\\x{2001}\\x{2002}\\x{2003}\\x{2004}\\x{2005}\\x{2006}\\x{2007}\\x{2008}\\x{2009}\\x{200a}\\x{202f}\\x{205f}\\x{3000}';
	$rsUpperRange       = 'A-Z\\xc0-\\xd6\\xd8-\\xde';
	$rsBreakRange       = $rsNonCharRange . $rsPunctuationRange . $rsSpaceRange;

	/** Used to compose unicode capture groups. */
	$rsBreak  = '[' . $rsBreakRange . ']';
	$rsDigits = '\\d+'; // The last lodash version in GitHub uses a single digit here and expands it when in use.
	$rsLower  = '[' . $rsLowerRange . ']';
	$rsMisc   = '[^' . $rsBreakRange . $rsDigits . $rsLowerRange . $rsUpperRange . ']';
	$rsUpper  = '[' . $rsUpperRange . ']';

	/** Used to compose unicode regexes. */
	$rsMiscLower = '(?:' . $rsLower . '|' . $rsMisc . ')';
	$rsMiscUpper = '(?:' . $rsUpper . '|' . $rsMisc . ')';
	$rsOrdLower  = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])';
	$rsOrdUpper  = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])';

	$regexp = '/' . implode(
		'|',
		array(
			$rsUpper . '?' . $rsLower . '+' . '(?=' . implode( '|', array( $rsBreak, $rsUpper, '$' ) ) . ')',
			$rsMiscUpper . '+' . '(?=' . implode( '|', array( $rsBreak, $rsUpper . $rsMiscLower, '$' ) ) . ')',
			$rsUpper . '?' . $rsMiscLower . '+',
			$rsUpper . '+',
			$rsOrdUpper,
			$rsOrdLower,
			$rsDigits,
		)
	) . '/u';

	preg_match_all( $regexp, str_replace( "'", '', $input_string ), $matches );
	return strtolower( implode( '-', $matches[0] ) );
	// phpcs:enable WordPress.NamingConventions.ValidVariableName.VariableNotSnakeCase
}