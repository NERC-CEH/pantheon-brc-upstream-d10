<?php

/**
 * @file
 * Theme related functions and hooks for the Gutenberg module.
 */

use Drupal\Core\Render\Markup;
use Drupal\gutenberg\Html\TagProcessor;
use Drupal\gutenberg\InteractivityStateManager;
use Drupal\gutenberg\Utils\SocialLinkHelper;

/**
 * Prepares variables for Gutenberg text field templates.
 *
 * Default template: field-gutenberg-text.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - element: A render element representing the field.
 *   - attributes: A string containing the attributes for the wrapping div.
 *   - title_attributes: A string containing the attributes for the title.
 */
function template_preprocess_field_gutenberg_text(array &$variables, $hook) {
  // Run through the default field preprocess hook.
  template_preprocess_field($variables, $hook);
}

/**
 * Prepares variables for Gutenberg block templates.
 *
 * Default template: gutenberg-block.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - block_name: The block name.
 *   - block_attributes: Array of block attributes.
 *   - block_content: The block's inner content.
 */
function template_preprocess_gutenberg_block(array &$variables) {
  // Add the default Gutenberg wp-block- class.
  $block_name = str_replace('/', '-', $variables['block_name']);
  if (substr($block_name, 0, 5) === 'core-') {
    // Handle "core/*" blocks specially.
    $block_name = substr($block_name, 5);
  }
  $variables['attributes']['class'][] = 'wp-block-' . $block_name;

  $attrs = $variables['block_attributes'];

  // Extra CSS classes (editor "Additional CSS class(es)" field).
  if (!empty($attrs['className'])) {
    $extra_classes = preg_split('/\s+/', $attrs['className']);
    foreach ($extra_classes as $class) {
      if (!empty($class)) {
        $variables['attributes']['class'][] = $class;
      }
    }
  }

  // Block-level alignment (alignfull, alignwide, alignleft, …).
  // Mirrors the align block support in WordPress.
  if (!empty($attrs['align'])) {
    $variables['attributes']['class'][] = 'align' . $attrs['align'];
  }

  // Text alignment (has-text-align-*).
  // Used by paragraph, heading, quote, verse, and many other blocks.
  if (!empty($attrs['textAlign'])) {
    $variables['attributes']['class'][] = 'has-text-align-' . $attrs['textAlign'];
  }

  // Font-size preset (has-*-font-size).
  // Applied when a preset slug (e.g. "large") is chosen via the
  // typography panel, as opposed to a custom value handled by
  // TypographyProcessor via inline style.
  if (!empty($attrs['fontSize'])) {
    $variables['attributes']['class'][] = 'has-' . $attrs['fontSize'] . '-font-size';
  }
}

/**
 * Prepares variables for the core/accordion Gutenberg block template.
 *
 * Adds Interactivity API directives to the accordion wrapper.
 */
function template_preprocess_gutenberg_block__core__accordion(array &$variables) {
  $attrs = $variables['block_attributes'];
  $autoclose = !empty($attrs['autoclose']) ? 'true' : 'false';
  $variables['attributes']['data-wp-interactive'] = 'core/accordion';
  $variables['attributes']['data-wp-context'] = '{ "autoclose": ' . $autoclose . ', "accordionItems": [] }';
}

/**
 * Static counter for accordion item unique IDs.
 */
function _gutenberg_accordion_item_counter(): int {
  static $counter = 0;
  return ++$counter;
}

/**
 * Prepares variables for the core/accordion-item Gutenberg block template.
 *
 * Adds directives to the wrapper, toggle button, and panel via TagProcessor.
 */
function template_preprocess_gutenberg_block__core__accordion_item(array &$variables) {
  $attrs = $variables['block_attributes'];
  $unique_id = 'accordion-item-' . _gutenberg_accordion_item_counter();
  $open_by_default = !empty($attrs['openByDefault']) ? 'true' : 'false';

  // Wrapper directives.
  $variables['attributes']['data-wp-context'] = '{ "id": "' . $unique_id . '", "openByDefault": ' . $open_by_default . ' }';
  $variables['attributes']['data-wp-class--is-open'] = 'state.isOpen';
  $variables['attributes']['data-wp-init'] = 'callbacks.initAccordionItems';
  $variables['attributes']['data-wp-on-window--hashchange'] = 'callbacks.hashChange';

  // Add directives to the toggle button and panel inside inner_content.
  $inner_markup = (string) ($variables['inner_content']['#markup'] ?? '');
  if (empty($inner_markup)) {
    return;
  }

  $p = new TagProcessor($inner_markup);
  if ($p->next_tag(['class_name' => 'wp-block-accordion-heading__toggle'])) {
    $p->set_attribute('data-wp-on--click', 'actions.toggle');
    $p->set_attribute('data-wp-on--keydown', 'actions.handleKeyDown');
    $p->set_attribute('id', $unique_id);
    $p->set_attribute('aria-controls', $unique_id . '-panel');
    $p->set_attribute('data-wp-bind--aria-expanded', 'state.isOpen');

    if ($p->next_tag(['class_name' => 'wp-block-accordion-panel'])) {
      $p->set_attribute('id', $unique_id . '-panel');
      $p->set_attribute('aria-labelledby', $unique_id);
      $p->set_attribute('data-wp-bind--inert', '!state.isOpen');
    }
  }
  $variables['inner_content']['#markup'] = Markup::create($p->get_updated_html());
}

/**
 * Prepares variables for the core/file Gutenberg block template.
 *
 * Adds Interactivity API directives for PDF preview toggle.
 */
function template_preprocess_gutenberg_block__core__file(array &$variables) {
  $attrs = $variables['block_attributes'];
  if (empty($attrs['displayPreview'])) {
    return;
  }

  $block_markup = (string) ($variables['block_content']['#markup'] ?? '');
  if (empty($block_markup)) {
    return;
  }

  $p = new TagProcessor($block_markup);
  if ($p->next_tag()) {
    $p->set_attribute('data-wp-interactive', 'core/file');
  }
  if ($p->next_tag('object')) {
    $p->set_attribute('data-wp-bind--hidden', '!state.hasPdfPreview');
    $p->set_attribute('hidden', TRUE);
    $filename = $p->get_attribute('aria-label');
    $has_filename = is_string($filename) && !empty($filename) && 'PDF embed' !== $filename;
    $p->set_attribute('aria-label', $has_filename ? 'Embed of ' . $filename . '.' : 'PDF embed');
  }
  $variables['block_content']['#markup'] = Markup::create($p->get_updated_html());
}

/**
 * Static counter for tabs instance unique IDs.
 */
function _gutenberg_tabs_counter(): int {
  static $counter = 0;
  return ++$counter;
}

/**
 * Extracts tab metadata from the innerBlocks of a core/tabs block.
 *
 * @param array $inner_blocks
 *   The inner blocks of the tabs block.
 *
 * @return array
 *   Array of tabs, each with 'id', 'label', and 'index'.
 */
function _gutenberg_generate_tabs_list(array $inner_blocks): array {
  $tabs_list = [];
  foreach ($inner_blocks as $inner_block) {
    if ('core/tab-panel' !== ($inner_block['blockName'] ?? '')) {
      continue;
    }
    $tab_index = 0;
    foreach ($inner_block['innerBlocks'] ?? [] as $tab_block) {
      if ('core/tab' !== ($tab_block['blockName'] ?? '')) {
        continue;
      }
      $tab_attrs = $tab_block['attrs'] ?? [];
      $tab_id = $tab_attrs['anchor'] ?? '';
      if (empty($tab_id) && !empty($tab_block['innerHTML'])) {
        $tag_processor = new TagProcessor($tab_block['innerHTML']);
        if ($tag_processor->next_tag(['class_name' => 'wp-block-tab'])) {
          $tab_id = $tag_processor->get_attribute('id') ?? '';
        }
      }
      if (empty($tab_id)) {
        $tab_id = 'tab-' . $tab_index;
      }
      $tabs_list[] = ['id' => $tab_id, 'label' => $tab_attrs['label'] ?? '', 'index' => $tab_index];
      $tab_index++;
    }
    break;
  }
  return $tabs_list;
}

/**
 * Prepares variables for the core/tabs Gutenberg block template.
 *
 * Handles button cloning, tab panel directives, and interactivity state.
 */
function template_preprocess_gutenberg_block__core__tabs(array &$variables) {
  $attrs = $variables['block_attributes'];
  $tabs_list = _gutenberg_generate_tabs_list($variables['block']['innerBlocks'] ?? []);
  $tabs_id = $attrs['anchor'] ?? 'tabs_' . _gutenberg_tabs_counter();
  $active_tab_index = (int) ($attrs['activeTabIndex'] ?? 0);

  if (empty($tabs_list)) {
    return;
  }

  // Generate tab menu buttons to replace the template button.
  $buttons_html = '';
  foreach ($tabs_list as $index => $tab) {
    $tab_id = htmlspecialchars($tab['id'], ENT_QUOTES, 'UTF-8');
    $label = htmlspecialchars($tab['label'], ENT_QUOTES, 'UTF-8');
    $context = htmlspecialchars(json_encode(['tabIndex' => $index]), ENT_QUOTES, 'UTF-8');
    $buttons_html .= '<button class="wp-block-tabs-menu-item" type="button" role="tab"'
      . ' id="tab__' . $tab_id . '"'
      . ' aria-controls="' . $tab_id . '"'
      . ' data-wp-on--click="actions.handleTabClick"'
      . ' data-wp-on--keydown="actions.handleTabKeyDown"'
      . ' data-wp-bind--aria-selected="state.isActiveTab"'
      . ' data-wp-bind--tabindex="state.tabIndexAttribute"'
      . ' data-wp-context="' . $context . '"'
      . '><span>' . $label . '</span></button>';
  }

  $inner_markup = (string) ($variables['inner_content']['#markup'] ?? '');
  $inner_markup = preg_replace(
    '/<button\b[^>]*\bwp-block-tabs-menu-item__template\b[^>]*>.*?<\/button>/si',
    $buttons_html,
    $inner_markup
  );

  // Add tab panel directives via TagProcessor.
  $p = new TagProcessor($inner_markup);
  $tab_panel_index = 0;
  while ($p->next_tag(['class_name' => 'wp-block-tab'])) {
    $tab_data = $tabs_list[$tab_panel_index] ?? NULL;
    if ($tab_data) {
      $tab_id = $tab_data['id'];
      $existing_id = $p->get_attribute('id');
      if (!empty($existing_id)) {
        $tab_id = (string) $existing_id;
      }
      else {
        $p->set_attribute('id', $tab_id);
      }
      $p->set_attribute('data-wp-interactive', 'core/tabs/private');
      $p->set_attribute('data-wp-context', json_encode(['tab' => ['id' => $tab_id]]));
      $p->set_attribute('role', 'tabpanel');
      $p->set_attribute('aria-labelledby', 'tab__' . $tab_id);
      $p->set_attribute('data-wp-bind--hidden', '!state.isActiveTab');
      $p->set_attribute('tabindex', '0');
    }
    $tab_panel_index++;
  }
  $variables['inner_content']['#markup'] = Markup::create($p->get_updated_html());

  // Check vertical orientation from inner markup.
  $is_vertical = FALSE;
  $p2 = new TagProcessor($inner_markup);
  while ($p2->next_tag(['class_name' => 'wp-block-tabs-menu'])) {
    if ($p2->has_class('is-vertical')) {
      $is_vertical = TRUE;
      break;
    }
  }

  // Wrapper directives.
  $variables['attributes']['data-wp-interactive'] = 'core/tabs/private';
  $variables['attributes']['data-wp-context'] = json_encode([
    'tabsId' => $tabs_id,
    'activeTabIndex' => $active_tab_index,
    'isVertical' => $is_vertical,
  ]);
  $variables['attributes']['data-wp-init'] = 'callbacks.onTabsInit';
  $variables['attributes']['data-wp-on--keydown'] = 'actions.handleTabKeyDown';

  // Store tabs state for the Interactivity API runtime.
  InteractivityStateManager::addState('core/tabs/private', [$tabs_id => $tabs_list]);
}

/**
 * Prepares variables for the core/social-link Gutenberg block template.
 *
 * Generates the full social link since the block has no save.js.
 */
function template_preprocess_gutenberg_block__core__social_link(array &$variables) {
  $attrs = $variables['block_attributes'];
  $url = $attrs['url'] ?? '';

  if (empty($url)) {
    $variables['url'] = '';
    return;
  }

  // Prepend mailto: for bare email addresses.
  if (filter_var($url, FILTER_VALIDATE_EMAIL)) {
    $url = 'mailto:' . $url;
  }
  // Prepend https:// if no scheme and not a relative link or fragment.
  elseif (!parse_url($url, PHP_URL_SCHEME) && !str_starts_with($url, '//') && !str_starts_with($url, '#')) {
    $url = 'https://' . $url;
  }

  $service = $attrs['service'] ?? 'share';
  $label = !empty($attrs['label']) ? trim($attrs['label']) : '';
  $rel = $attrs['rel'] ?? '';

  $service_data = SocialLinkHelper::getService($service);
  if (empty($label)) {
    $label = $service_data['name'];
  }

  // Add service CSS classes (wp-block-social-link added by base preprocess).
  $variables['attributes']['class'][] = 'wp-social-link';
  $variables['attributes']['class'][] = 'wp-social-link-' . $service;

  $variables['url'] = $url;
  $variables['icon'] = $service_data['icon'];
  $variables['label'] = $label;
  $variables['rel'] = $rel;
  // Parent context (openInNewTab, showLabels) unavailable bottom-up.
  $variables['open_in_new_tab'] = FALSE;
  $variables['show_labels'] = FALSE;
}

/**
 * Static counter for playlist unique IDs.
 */
function _gutenberg_playlist_counter(): int {
  static $counter = 0;
  return ++$counter;
}

/**
 * Static counter for playlist-track unique IDs.
 */
function _gutenberg_playlist_track_counter(): int {
  static $counter = 0;
  return ++$counter;
}

/**
 * Prepares variables for the core/playlist-track Gutenberg block template.
 *
 * Generates the track HTML since the block has no save.js.
 */
function template_preprocess_gutenberg_block__core__playlist_track(array &$variables) {
  $attrs = $variables['block_attributes'];

  if (empty($attrs['id'])) {
    $variables['title'] = '';
    return;
  }

  $variables['unique_id'] = $attrs['uniqueId'] ?? ('playlist-track-' . _gutenberg_playlist_track_counter());
  $variables['title'] = isset($attrs['title']) && !empty($attrs['title']) ? $attrs['title'] : 'Unknown title';
  $variables['artist'] = $attrs['artist'] ?? '';
  $variables['length'] = $attrs['length'] ?? '';
}

/**
 * Prepares variables for the core/playlist Gutenberg block template.
 *
 * Injects the audio player and interactivity state.
 */
function template_preprocess_gutenberg_block__core__playlist(array &$variables) {
  $attrs = $variables['block_attributes'];

  if (empty($attrs['currentTrack'])) {
    $variables['player_html'] = '';
    $variables['block_content'] = [];
    return;
  }

  $current_media_id = $attrs['currentTrack'];
  $playlist_id = 'playlist-' . _gutenberg_playlist_counter();
  $playlist_tracks = [];
  $tracks_data = [];
  $current_unique_id = NULL;

  foreach ($variables['block']['innerBlocks'] ?? [] as $inner_block) {
    if ('core/playlist-track' !== ($inner_block['blockName'] ?? '')) {
      continue;
    }
    $track_attrs = $inner_block['attrs'] ?? [];
    if (empty($track_attrs['id'])) {
      continue;
    }
    $unique_id = $track_attrs['uniqueId'] ?? ('playlist-track-' . _gutenberg_playlist_track_counter());
    $playlist_tracks[] = $unique_id;
    $title = isset($track_attrs['title']) && !empty($track_attrs['title']) ? $track_attrs['title'] : 'Unknown title';
    $artist = $track_attrs['artist'] ?? '';
    $album = $track_attrs['album'] ?? '';
    $image = $track_attrs['image'] ?? '';
    $url = $track_attrs['src'] ?? '';
    $aria_label = ($title && $artist && $album)
      ? $title . ' by ' . $artist . ' from the album ' . $album
      : $title;

    $tracks_data[$unique_id] = [
      'url' => $url,
      'title' => htmlspecialchars($title, ENT_QUOTES, 'UTF-8'),
      'artist' => htmlspecialchars($artist, ENT_QUOTES, 'UTF-8'),
      'album' => htmlspecialchars($album, ENT_QUOTES, 'UTF-8'),
      'image' => $image,
      'ariaLabel' => htmlspecialchars($aria_label, ENT_QUOTES, 'UTF-8'),
    ];
    if ($unique_id === $current_media_id) {
      $current_unique_id = $unique_id;
    }
  }

  if (empty($playlist_tracks) || !in_array($current_media_id, $playlist_tracks, TRUE)) {
    $variables['player_html'] = '';
    $variables['block_content'] = [];
    return;
  }

  // Build current-track player HTML.
  $show_images = !empty($attrs['showImages']);
  $player_html = '<div class="wp-block-playlist__current-item">';
  if ($show_images) {
    $player_html .= '<img class="wp-block-playlist__item-image" alt="" width="70px" height="70px"'
      . ' data-wp-bind--src="state.currentTrack.image"'
      . ' data-wp-bind--hidden="!state.currentTrack.image" />';
  }
  $player_html .= '<div>'
    . '<span class="wp-block-playlist__item-title" data-wp-text="state.currentTrack.title"></span>'
    . '<div class="wp-block-playlist__current-item-artist-album">'
    . '<span class="wp-block-playlist__item-artist" data-wp-text="state.currentTrack.artist"></span>'
    . '<span class="wp-block-playlist__item-album" data-wp-text="state.currentTrack.album"></span>'
    . '</div></div></div>'
    . '<audio controls="controls"'
    . ' data-wp-on--ended="actions.nextSong"'
    . ' data-wp-on--play="actions.isPlaying"'
    . ' data-wp-on--pause="actions.isPaused"'
    . ' data-wp-bind--src="state.currentTrack.url"'
    . ' data-wp-bind--aria-label="state.currentTrack.ariaLabel"'
    . ' data-wp-watch="callbacks.autoPlay"'
    . '></audio>';

  $variables['player_html'] = $player_html;

  // Wrapper directives.
  $variables['attributes']['data-wp-interactive'] = 'core/playlist';
  $variables['attributes']['data-wp-context'] = json_encode([
    'playlistId' => $playlist_id,
    'currentId' => $current_unique_id,
    'tracks' => $playlist_tracks,
    'isPlaying' => FALSE,
  ]);

  // Store tracks data for the Interactivity API runtime.
  InteractivityStateManager::addState('core/playlist', [
    'playlists' => [
      $playlist_id => ['tracks' => $tracks_data],
    ],
  ]);
}

/**
 * Extracts a YouTube video ID from a watch or short URL.
 *
 * @param string $url
 *   A YouTube URL (youtube.com/watch?v=... or youtu.be/...).
 *
 * @return string|null
 *   The video ID, or NULL if it could not be extracted.
 */
function _gutenberg_cover_extract_youtube_id(string $url): ?string {
  $parsed = parse_url($url);
  // Handle youtube.com/watch?v=ID format.
  if (!empty($parsed['query'])) {
    parse_str($parsed['query'], $params);
    if (!empty($params['v'])) {
      return $params['v'];
    }
  }
  // Handle youtu.be/ID format.
  if (!empty($parsed['path'])) {
    $id = ltrim($parsed['path'], '/');
    if (!empty($id) && !str_contains($id, '/')) {
      return $id;
    }
  }
  return NULL;
}

/**
 * Extracts a Vimeo video ID from a URL.
 *
 * @param string $url
 *   A Vimeo URL (vimeo.com/123456).
 *
 * @return string|null
 *   The video ID, or NULL if it could not be extracted.
 */
function _gutenberg_cover_extract_vimeo_id(string $url): ?string {
  if (preg_match('/vimeo\.com\/(\d+)/', $url, $m)) {
    return $m[1];
  }
  return NULL;
}

/**
 * Prepares variables for the core/cover Gutenberg block template.
 *
 * Handles embed-video backgrounds by resolving the oEmbed URL and replacing
 * the <figure class="wp-block-embed"> placeholder with a properly configured
 * background iframe (autoplay, muted, looped, no controls).
 *
 * This is a Drupal port of WordPress's render_block_core_cover() SSR.
 *
 * @see https://github.com/WordPress/gutenberg/blob/trunk/packages/block-library/src/cover/index.php
 */
function template_preprocess_gutenberg_block__core__cover(array &$variables) {
  $attrs = $variables['block_attributes'];

  // Only process embed-video backgrounds.
  if (($attrs['backgroundType'] ?? '') !== 'embed-video') {
    return;
  }

  $url = $attrs['url'] ?? '';
  if (empty($url) || !is_string($url)) {
    return;
  }

  // Operate on block_content (full HTML) because the Cover block's internal
  // structure (background span, inner-container div) is part of the first
  // innerContent chunk and gets stripped by extractInnerHtml.
  $block_markup = (string) ($variables['block_content']['#markup'] ?? '');
  if (empty($block_markup)) {
    return;
  }

  // Detect provider from the ORIGINAL URL (block attribute), not from the
  // resolved iframe src, because the oEmbed resolver may return a third-party
  // CDN URL (e.g. iframe.ly) that doesn't contain the provider's domain.
  $lower_url = strtolower($url);
  $new_src = NULL;

  if (str_contains($lower_url, 'youtube.com/watch') || str_contains($lower_url, 'youtu.be/')) {
    // Extract video ID and build embed URL directly.
    $video_id = _gutenberg_cover_extract_youtube_id($url);
    if ($video_id) {
      $new_src = 'https://www.youtube.com/embed/' . urlencode($video_id) . '?' . http_build_query([
        'autoplay' => '1',
        'mute' => '1',
        'loop' => '1',
        'playlist' => $video_id,
        'controls' => '0',
        'modestbranding' => '1',
        'playsinline' => '1',
      ]);
    }
  }
  elseif (str_contains($lower_url, 'vimeo.com/')) {
    // Extract Vimeo video ID and build embed URL directly.
    $video_id = _gutenberg_cover_extract_vimeo_id($url);
    if ($video_id) {
      $new_src = 'https://player.vimeo.com/video/' . urlencode($video_id) . '?' . http_build_query([
        'autoplay' => '1',
        'muted' => '1',
        'loop' => '1',
        'background' => '1',
        'controls' => '0',
        'transparent' => '0',
      ]);
    }
  }

  // For unknown providers, try to use the already-resolved iframe src as-is.
  if (!$new_src) {
    if (preg_match('/<figure\b[^>]*\bwp-block-embed\b.*?<iframe\b[^>]*\bsrc=["\']([^"\']+)["\']/is', $block_markup, $m)) {
      $new_src = html_entity_decode($m[1], ENT_QUOTES, 'UTF-8');
    }
    // Final fallback: resolve oEmbed directly.
    if (!$new_src) {
      /** @var \Drupal\gutenberg\OEmbedResolverInterface $oembed_resolver */
      $oembed_resolver = \Drupal::service('gutenberg.oembed_resolver');
      $oembed_html = $oembed_resolver->resolveOembed($url, 800);
      if ($oembed_html && preg_match('/src=["\']([^"\']+)["\']/', (string) $oembed_html, $m)) {
        $new_src = html_entity_decode($m[1], ENT_QUOTES, 'UTF-8');
      }
    }
  }

  if (!$new_src) {
    return;
  }

  // Build the replacement iframe HTML.
  $iframe_html = sprintf(
    '<div class="wp-block-cover__video-background wp-block-cover__embed-background"><iframe src="%s" title="Background video" frameborder="0" allow="autoplay; fullscreen"></iframe></div>',
    htmlspecialchars($new_src, ENT_QUOTES, 'UTF-8')
  );

  // Replace the <figure class="wp-block-embed"> element with the background
  // iframe div. Guard against preg_replace returning NULL on PCRE limits.
  $figure_pattern = '/<figure\s+[^>]*\bwp-block-embed\b[^>]*>.*?<\/figure>/is';
  $result = preg_replace($figure_pattern, $iframe_html, $block_markup, 1);
  if ($result !== NULL) {
    $variables['block_content']['#markup'] = Markup::create($result);
  }
}

/**
 * Prepares variables for Drupal media Gutenberg block templates.
 *
 * @see template_preprocess_gutenberg_block
 */
function template_preprocess_gutenberg_block__drupalmedia__drupal_media_entity(&$variables) {
  if (!empty($variables['block_attributes']['mediaEntityIds'])) {
    /** @var \Drupal\gutenberg\MediaEntityRendererInterface $media_entity_renderer */
    $media_entity_renderer = \Drupal::service('gutenberg.media_entity.renderer');
    $variables['block_content'] = $media_entity_renderer->renderArray(
      reset($variables['block_attributes']['mediaEntityIds']),
      $variables['block_attributes']['viewMode'] ?? 'default'
    );

    // The caption can include HTML formatting, therefore processing it.
    if (!empty($variables['block_attributes']['caption'])) {
      $variables['block_attributes']['caption'] = [
        '#type' => 'processed_text',
        '#text' => $variables['block_attributes']['caption'],
        '#format' => 'gutenberg',
      ];
    }
  }
}
