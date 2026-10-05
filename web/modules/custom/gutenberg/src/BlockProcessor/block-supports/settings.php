<?php
/**
 * Auto-generated from WordPress/gutenberg lib/block-supports/settings.php
 * Commit: 485f42ae8a1c58ceea18371a507fd4acfa86fbd8
 * DO NOT EDIT — managed by scripts/sync-block-supports.js
 */

/**
 * Update the block content with block level presets class name.
 *
 * @access private
 *
 * @param string $block_content Rendered block content.
 * @param array  $block         Block object.
 * @return string Filtered block content.
 */
function _gutenberg_add_block_level_presets_class( $block_content, $block ) {
	if ( ! $block_content ) {
		return $block_content;
	}

	// return early if the block doesn't have support for settings.
	$block_type = WP_Block_Type_Registry::get_instance()->get_registered( $block['blockName'] );
	if ( ! block_has_support( $block_type, array( '__experimentalSettings' ), false ) ) {
		return $block_content;
	}

	// return early if no settings are found on the block attributes.
	$block_settings = $block['attrs']['settings'] ?? null;
	if ( empty( $block_settings ) ) {
		return $block_content;
	}

	// Like the layout hook this assumes the hook only applies to blocks with a single wrapper.
	// Add the class name to the first element, presuming it's the wrapper, if it exists.
	$tags = new WP_HTML_Tag_Processor( $block_content );
	if ( $tags->next_tag() ) {
		$tags->add_class( _wp_get_presets_class_name( $block ) );
	}

	return $tags->get_updated_html();
}
