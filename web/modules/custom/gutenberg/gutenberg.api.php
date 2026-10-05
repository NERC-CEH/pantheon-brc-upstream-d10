<?php

/**
 * @file
 * Documentation for Gutenberg module APIs.
 */

use Drupal\Core\Entity\Query\Sql\Query;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Gutenberg\Html\TagProcessor;

/**
 * @addtogroup hooks
 * @{
 */

/**
 * Perform alterations to a gutenberg's media (file entity) search query.
 *
 * @param \Symfony\Component\HttpFoundation\Request $request
 *   The request.
 * @param string $type
 *   MIME type search string.
 * @param string $search
 *   Filename search string.
 * @param \Drupal\Core\Entity\Query\Sql\Query $query
 *   Entity query object.
 */
function hook_gutenberg_media_search_query_alter(Request $request, string $type, string $search, Query $query) {
  if ($type === 'image') {
    $query->condition('uri', 'public://avatars/%', 'NOT LIKE');
  }

  // Load at most 100 media entities at a time.
  $query->range(0, 100);
}

/**
 * DEPRECATED.
 *
 * You can use Drupal libraries. Check gutenberg.libraries.yml for an example.
 * Modify the list of CSS and JS files for blocks.
 *
 * @param array $js_files_edit
 *   An array of all js files to be included on the editor.
 * @param array $css_files_edit
 *   An array of all css files to be included on the editor.
 * @param array $css_files_view
 *   An array of all css files to be included on the node view.
 */
function hook_gutenberg_blocks_alter(array &$js_files_edit, array &$css_files_edit, array &$css_files_view) {
  $js_files_edit[] = '/path/to/js/files';
  $css_files_edit[] = '/path/to/css/files';
  $css_files_view[] = '/path/to/css/files';
}

/**
 * Alter render array of Gutenberg Media Library dialog.
 *
 * @param array $build_ui
 *   Build array of media library dialog.
 *
 * @see \Drupal\gutenberg\GutenbergMediaLibraryUiBuilder
 */
function hook_gutenberg_media_library_view_alter(array &$build_ui) {
  // @todo provide some example.
}

/**
 * Perform alterations on gutenberg definitions.
 *
 * @param array $info
 *   Array of information on gutenberg definitions exposed by gutenberg
 *   module/themes.
 *
 * @see \Drupal\gutenberg\GutenbergLibraryManager
 *
 * @ingroup gutenberg_api
 */
function hook_gutenberg_info_alter(array &$info) {
  if (isset($info['example_block'])) {
    // Remove a specific example_block's front-end library definition.
    if (($key = array_search('example_block/block-view', $info['example_block']['libraries-view'], TRUE)) !== FALSE) {
      unset($info['example_block']['libraries-view'][$key]);
    }
  }
}

/**
 * Alter a gutenberg block's rendered content.
 *
 * This hook is called after the block has been fully rendered and may be used
 * for altering the final HTML output of the block.
 *
 * Note that this alter hook can be implemented in themes as well as modules.
 *
 * @param string &$block_content
 *   The block's inner HTML.
 * @param array &$block
 *   The block's structured content array with the following keys:
 *     - blockName: The block's name.
 *     - attrs: An array of block attributes.
 *     - innerBlocks: An array of inner blocks.
 *     - innerContent: An array of inner content.
 *     - innerHtml: The inner content as a string.
 *
 * @see hook_gutenberg_render_block_BASE_BLOCK_ID_alter()
 * @see \Drupal\gutenberg\Plugin\Filter\GutenbergFilter::renderBlock()
 *
 * @ingroup gutenberg_api
 */
function hook_gutenberg_render_block_alter(&$block_content, &$block) {
  if ($block['blockName'] == 'core/columns') {
    // Use the TagProcessor to add the class. Really we could just str_replace
    // too but this is a good example of the TagProcessor in action.
    $processor = new TagProcessor($block_content);
    if ($processor->next_tag()) {
      if ($processor->has_class('wp-block-columns')) {
        $processor->add_class('wp-block-columns--custom-modifier');
      }
    }
    $block_content = $processor->get_updated_html();
  }
}

/**
 * Provide a block plugin specific gutenberg_render_block alteration.
 *
 * In this hook name, BASE_BLOCK_ID refers to the Gutenberg block's name/ID.
 * For example, 'core/columns' will have a BASE_BLOCK_ID of
 * 'core_columns'.
 *
 * @param string &$block_content
 *   The block's inner HTML.
 * @param array &$block
 *   The block's structured content array with the following keys:
 *     - blockName: The block's name.
 *     - attrs: An array of block attributes.
 *     - innerBlocks: An array of inner blocks.
 *     - innerContent: An array of inner content.
 *     - innerHtml: The inner content as a string.
 *
 * @see hook_gutenberg_render_block_alter()
 *
 * @ingroup gutenberg_api
 */
function hook_gutenberg_render_block_BASE_BLOCK_ID_alter(&$block_content, &$block) {
  if ($block['blockName'] == 'core/columns') {
    // Use the TagProcessor to add the class. Really we could just str_replace
    // too but this is a good example of the TagProcessor in action.
    $processor = new TagProcessor($block_content);
    if ($processor->next_tag()) {
      if ($processor->has_class('wp-block-columns')) {
        $processor->add_class('wp-block-columns--custom-modifier');
      }
    }
    $block_content = $processor->get_updated_html();
  }
}

/**
 * Perform alterations on the available image styles/sizes in the editor.
 *
 * @param \Drupal\image\ImageStyleInterface[] $styles
 *   A list of image styles.
 */
function hook_gutenberg_image_styles_alter(array &$styles) {
  // Never allow access to the thumbnail style.
  unset($styles['thumbnail']);
  $user = \Drupal::currentUser();

  foreach ($styles as $style) {
    $style_id = $style->id();
    if (str_starts_with($style_id, 'gutenberg_image_')) {
      if (!$style->access('view in gutenberg')->isAllowed()) {
        // Don't show this image style.
        unset($styles[$style_id]);
      }
    }
    else {
      // Check if the user has custom permission for this
      // particular style.
      if (!$user->hasPermission('access image style for ' . $style_id)) {
        unset($styles[$style_id]);
      }
    }
  }
}

/**
 * Alter the result of \Drupal\gutenberg\BlockProcessor\DynamicRenderProcessor.
 *
 * This hook is called after the block has been assembled in a structured
 * array and may be used for doing processing which requires that the complete
 * block content structure has been built.
 *
 * If the module wishes to act on the rendered HTML of the block rather than
 * the structured content array, it may use this hook to add a #post_render
 * callback. Alternatively, it could also implement hook_preprocess_HOOK() for
 * gutenberg-block.html.twig. See drupal_render() documentation or the
 * @link themeable Default theme implementations topic @endlink for details.
 *
 * @param array &$build
 *   A renderable array of the block.
 * @param string $block_content
 *   The block's inner HTML.
 *
 * @see hook_gutenberg_block_view_BASE_BLOCK_ID_alter()
 * @see \Drupal\gutenberg\BlockProcessor\DynamicRenderProcessor::processBlock()
 *
 * @ingroup gutenberg_api
 */
function hook_gutenberg_block_view_alter(array &$build, &$block_content) {
  // Add generic pre_render hook for all dynamic blocks.
  $build['#pre_render'][] = 'hook_gutenberg_pre_render';
}

/**
 * Provide a block plugin specific gutenberg_block_view alteration.
 *
 * In this hook name, BASE_BLOCK_ID refers to the Gutenberg block's name/ID.
 * For example, 'my-plugin/block-name' will have a BASE_BLOCK_ID of
 * 'my_plugin_block_name'.
 *
 * @param array $build
 *   A renderable array of the block.
 * @param string $block_content
 *   The block's inner HTML.
 *
 * @see hook_gutenberg_block_view_alter()
 *
 * @ingroup gutenberg_api
 */
function hook_gutenberg_block_view_BASE_BLOCK_ID_alter(array &$build, &$block_content) {
  // Add block specific pre_render hook.
  $build['#pre_render'][] = 'hook_gutenberg_BASE_BLOCK_ID_pre_render';
}

/**
 * Provide the appropriate Gutenberg content type for a given route.
 *
 * Gutenberg fetches the node type through route match. If for custom routes,
 * it's necessary to resolve the content type.
 * Below is an example to handle Group Node module (part of Group module).
 *
 * @param \Drupal\Core\Routing\RouteMatchInterface $route_match
 *   The current route instance.
 *
 * @return string|null
 *   The content type.
 */
function hook_gutenberg_node_type_route(RouteMatchInterface $route_match) {
  $route_name = $route_match->getRouteName();

  if ($route_name == 'entity.group_relationship.create_form' || $route_name == 'entity.group_relationship.edit_form') {
    /** @var string @parameter */
    $parameter = $route_match->getParameter('plugin_id');
    return explode(':', $parameter)[1];
  }

  return NULL;
}

/**
 * Override the user image field used to resolve avatar URLs.
 *
 * Lets sites point Gutenberg at a custom field on the user entity instead
 * of the default 'user_picture'. Set $field_name to NULL or to an empty
 * string to skip the field lookup entirely (the resolver will fall back
 * to Gravatar).
 *
 * @param string|null $field_name
 *   The user entity field name to read the avatar image from. Defaults
 *   to 'user_picture'.
 * @param \Drupal\user\UserInterface $user
 *   The user whose avatar is being resolved.
 *
 * @see \Drupal\gutenberg\UserAvatarResolver::getAvatarUrl()
 */
function hook_gutenberg_user_avatar_field_alter(?string &$field_name, \Drupal\user\UserInterface $user) {
  if ($user->hasField('field_profile_image')) {
    $field_name = 'field_profile_image';
  }
}

/**
 * Override the resolved avatar URL for a user.
 *
 * Runs after the field lookup and Gravatar fallback. Use this to redirect
 * to a CDN, a generated identicon service, or any custom URL.
 *
 * @param string $url
 *   The resolved avatar URL. Always non-empty when the alter runs.
 * @param \Drupal\user\UserInterface $user
 *   The user whose avatar is being resolved.
 * @param int $size
 *   The desired pixel size.
 *
 * @see \Drupal\gutenberg\UserAvatarResolver::getAvatarUrl()
 */
function hook_gutenberg_user_avatar_url_alter(string &$url, \Drupal\user\UserInterface $user, int $size) {
  $url = "https://my-cdn.example.com/avatars/{$user->id()}/{$size}.png";
}

/**
 * @} End of "addtogroup hooks".
 */
