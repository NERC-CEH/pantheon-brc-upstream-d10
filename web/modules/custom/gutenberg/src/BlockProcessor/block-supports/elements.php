<?php
/**
 * Auto-generated from WordPress/gutenberg lib/block-supports/elements.php
 * Commit: 485f42ae8a1c58ceea18371a507fd4acfa86fbd8
 * DO NOT EDIT — managed by scripts/sync-block-supports.js
 */

/**
 * Determines whether an elements class name should be added to the block.
 *
 * @param array $block   Block object.
 * @param array $options Per element type options e.g. whether to skip serialization.
 *
 * @return boolean Whether the block needs an elements class name.
 */
function gutenberg_should_add_elements_class_name( $block, $options ) {
	if ( ! isset( $block['attrs']['style']['elements'] ) ) {
		return false;
	}

	$element_color_properties = array(
		'button'  => array(
			'skip'  => $options['button']['skip'] ?? false,
			'paths' => array(
				array( 'button', 'color', 'text' ),
				array( 'button', 'color', 'background' ),
				array( 'button', 'color', 'gradient' ),
			),
		),
		'link'    => array(
			'skip'  => $options['link']['skip'] ?? false,
			'paths' => array(
				array( 'link', 'color', 'text' ),
				array( 'link', ':hover', 'color', 'text' ),
			),
		),
		'heading' => array(
			'skip'  => $options['heading']['skip'] ?? false,
			'paths' => array(
				array( 'heading', 'color', 'text' ),
				array( 'heading', 'color', 'background' ),
				array( 'heading', 'color', 'gradient' ),
				array( 'h1', 'color', 'text' ),
				array( 'h1', 'color', 'background' ),
				array( 'h1', 'color', 'gradient' ),
				array( 'h2', 'color', 'text' ),
				array( 'h2', 'color', 'background' ),
				array( 'h2', 'color', 'gradient' ),
				array( 'h3', 'color', 'text' ),
				array( 'h3', 'color', 'background' ),
				array( 'h3', 'color', 'gradient' ),
				array( 'h4', 'color', 'text' ),
				array( 'h4', 'color', 'background' ),
				array( 'h4', 'color', 'gradient' ),
				array( 'h5', 'color', 'text' ),
				array( 'h5', 'color', 'background' ),
				array( 'h5', 'color', 'gradient' ),
				array( 'h6', 'color', 'text' ),
				array( 'h6', 'color', 'background' ),
				array( 'h6', 'color', 'gradient' ),
			),
		),
	);

	$elements_style_attributes = $block['attrs']['style']['elements'];

	foreach ( $element_color_properties as $element_config ) {
		if ( $element_config['skip'] ) {
			continue;
		}

		foreach ( $element_config['paths'] as $path ) {
			if ( null !== _wp_array_get( $elements_style_attributes, $path, null ) ) {
				return true;
			}
		}
	}

	return false;
}

/**
 * Ensure the elements block support class name generated, and added to
 * block attributes, in the `render_block_data` filter gets applied to the
 * block's markup.
 *
 * @see gutenberg_render_elements_support_styles
 *
 * @param string $block_content Rendered block content.
 * @param array  $block         Block object.
 * @return string Filtered block content.
 *
 * @phpstan-param array{
 *     attrs: array{
 *         className?: string,
 *         ...
 *     },
 *     ...
 * } $block
 */
function gutenberg_render_elements_class_name( $block_content, $block ) {
	$class_name_attr   = $block['attrs']['className'] ?? null;
	$class_name_prefix = 'wp-elements-';
	if ( ! is_string( $class_name_attr ) || ! str_contains( $class_name_attr, $class_name_prefix ) ) {
		return $block_content;
	}

	// Parse out the 'wp-elements-*' class name.
	$matched_class_name = null;
	$token_delimiter    = " \t\f\r\n";
	$class_token        = strtok( $class_name_attr, $token_delimiter );
	while ( false !== $class_token ) {
		if ( str_starts_with( $class_token, $class_name_prefix ) ) {
			$matched_class_name = $class_token;
			break;
		}
		$class_token = strtok( $token_delimiter );
	}
	if ( null === $matched_class_name ) {
		return $block_content;
	}

	$tags = new WP_HTML_Tag_Processor( $block_content );
	if ( $tags->next_tag() ) {
		$tags->add_class( $matched_class_name );
	}

	return $tags->get_updated_html();
}
