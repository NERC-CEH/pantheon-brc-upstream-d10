/**
 * @file
 * Gutenberg Notes initialization.
 *
 * This file is intentionally minimal. The main Notes functionality is handled
 * by the existing @wordpress/editor collab-sidebar component, which is enabled
 * by the 'editor.notes' post type support flag set via drupalSettings.
 *
 * The api-fetch.js route handlers in the main gutenberg module intercept
 * /wp/v2/comments requests and proxy them to the Drupal Notes controller.
 */
(function (drupalSettings) {
  'use strict';

  // Notes module is active — drupalSettings.gutenberg.notesEnabled is set
  // by the form alter in gutenberg_notes.module.
})(drupalSettings);
