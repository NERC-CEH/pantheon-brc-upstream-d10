/* global Drupal */

import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import EntityTitleEdit from './edit';
import { initTitleSync } from './title-sync';
import registerFieldsCategory from '../fields-category';

export { getEntityTitleBlocks, isTitleInEditor } from './title-sync';

const __ = Drupal.t;

/**
 * Register the entity title block.
 *
 * Like core/post-title, it places the title of the entity in the content,
 * e.g. in a Cover. The editor then hides its canvas title, and the frontend
 * doesn't render the title above the content.
 */
export function registerEntityTitleBlock() {
  registerFieldsCategory();

  registerBlockType(metadata.name, {
    ...metadata,
    title: __('Title'),
    description: __(
      'Shows the title of the content, and hides the title above it.',
    ),
    keywords: [__('title'), __('heading')],
    icon: 'heading',
    edit: EntityTitleEdit,
    // The title is rendered on the server.
    save: () => null,
  });

  initTitleSync();
}
