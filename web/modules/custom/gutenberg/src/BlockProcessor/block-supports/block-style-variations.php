<?php
/**
 * Auto-generated from WordPress/gutenberg lib/block-supports/block-style-variations.php
 * Commit: 485f42ae8a1c58ceea18371a507fd4acfa86fbd8
 * DO NOT EDIT — managed by scripts/sync-block-supports.js
 */

/**
 * Determines the block style variation names within a CSS class string.
 *
 * @since 6.6.0
 *
 * @param string $class_string CSS class string to look for a variation in.
 *
 * @return array|null The block style variation name if found.
 */
function gutenberg_get_block_style_variation_name_from_class( $class_string ) {
	if ( ! is_string( $class_string ) ) {
		return null;
	}

	preg_match_all( '/\bis-style-(?!default)(\S+)\b/', $class_string, $matches );
	return $matches[1] ?? null;
}

/**
 * Recursively resolves any `ref` values within a block style variation's data.
 *
 * @since 6.6.0
 *
 * @param array $variation_data Reference to the variation data being processed.
 * @param array $theme_json     Theme.json data to retrieve referenced values from.
 */
function gutenberg_resolve_block_style_variation_ref_values( &$variation_data, $theme_json ) {
	foreach ( $variation_data as $key => &$value ) {
		// Only need to potentially process arrays.
		if ( is_array( $value ) ) {
			// If ref value is set, attempt to find its matching value and update it.
			if ( array_key_exists( 'ref', $value ) ) {
				// Clean up any invalid ref value.
				if ( empty( $value['ref'] ) || ! is_string( $value['ref'] ) ) {
					unset( $variation_data[ $key ] );
				}

				$value_path = explode( '.', $value['ref'] ?? '' );
				$ref_value  = _wp_array_get( $theme_json, $value_path );

				// Only update the current value if the referenced path matched a value.
				if ( null === $ref_value ) {
					unset( $variation_data[ $key ] );
				} else {
					$value = $ref_value;
				}
			} else {
				// Recursively look for ref instances.
				gutenberg_resolve_block_style_variation_ref_values( $value, $theme_json );
			}
		}
	}
}

/**
 * Ensure the variation block support class name generated and added to
 * block attributes in the `render_block_data` filter gets applied to the
 * block's markup.
 *
 * @since 6.6.0
 *
 * @see gutenberg_render_block_style_variation_support_styles
 *
 * @param string $block_content Rendered block content.
 * @param array  $block         Block object.
 *
 * @return string Filtered block content.
 */
function gutenberg_render_block_style_variation_class_name( $block_content, $block ) {
	if ( ! $block_content || empty( $block['attrs']['className'] ) ) {
		return $block_content;
	}

	$block_class_name = $block['attrs']['className'];
	if ( ! is_string( $block_class_name ) ) {
		return $block_content;
	}

	/*
	 * Matches a class prefixed by `is-style`, followed by the
	 * variation slug, then `--`, and finally an instance number.
	 */
	preg_match( '/\bis-style-(\S+?--\d+)\b/', $block_class_name, $matches );

	if ( empty( $matches ) ) {
		return $block_content;
	}

	$tags = new WP_HTML_Tag_Processor( $block_content );

	if ( $tags->next_tag() ) {
		/*
		 * Ensure the variation instance class name set in the
		 * `render_block_data` filter is applied in markup.
		 * See `gutenberg_render_block_style_variation_support_styles`.
		 */
		$tags->add_class( $matches[0] );
	}

	return $tags->get_updated_html();
}
