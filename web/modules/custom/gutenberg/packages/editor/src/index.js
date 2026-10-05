// Internal modules (bundled, run in order)
import './init';
import './settings';
import './data';
import './drupal-store';

// External packages (externalized via webpack, loaded as dependencies by Drupal)
import '@drupal-gutenberg/components';
import '@drupal-gutenberg/block-library';
import '@drupal-gutenberg/filters';
import '@drupal-gutenberg/plugins';
import '@drupal-gutenberg/overrides';
import '@drupal-gutenberg/media-attributes';
import '@wordpress/format-library';
import '@wordpress/dashicons';
import '@wordpress/commands';
import '@wordpress/core-commands';
import '@wordpress/special-media-selection';

// CSS
import '../../../css/editor.scss';

// Main editor logic
import './gutenberg';
import './editor-observers';
