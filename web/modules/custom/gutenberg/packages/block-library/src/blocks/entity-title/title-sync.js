/* global drupalSettings */

/**
 * @file
 * Keeps the editor title and Drupal's title field in sync.
 *
 * The title is edited in the editor when the content type shows it in the
 * canvas, or when the content places the entity title block, which then
 * takes the place of the canvas title.
 */

import { dispatch, select, subscribe } from '@wordpress/data';

export const BLOCK_NAME = 'drupal/entity-title';

/**
 * Get Drupal's node title field.
 *
 * @return {HTMLInputElement|null} The title input.
 */
const getTitleField = () => document.getElementById('edit-title-0-value');

/**
 * Get the entity title blocks placed in the content.
 *
 * @return {string[]} The client IDs of the blocks.
 */
export function getEntityTitleBlocks() {
  return select('core/block-editor').getBlocksByName(BLOCK_NAME);
}

/**
 * Whether the title is edited in the editor rather than in the title field.
 *
 * @return {boolean} Whether the editor holds the title.
 */
export function isTitleInEditor() {
  return (
    !!drupalSettings.gutenberg?.titleInEditor ||
    getEntityTitleBlocks().length > 0
  );
}

/**
 * Hide the canvas title while the content places an entity title block.
 *
 * The canvas title shows when the post type supports the title, so this
 * updates the support on the mocked post type. The code editor always renders
 * a title, which the no-title class hides.
 */
function toggleCanvasTitle() {
  let previous;
  subscribe(() => {
    if (!select('core/editor').getCurrentPostId()) {
      return;
    }
    const postType = select('core').getPostType('page');
    if (!postType) {
      return;
    }

    const showTitle =
      !!drupalSettings.gutenberg?.titleInEditor &&
      getEntityTitleBlocks().length === 0;
    if (showTitle === previous) {
      return;
    }
    previous = showTitle;

    if (!!postType.supports?.title !== showTitle) {
      dispatch('core').receiveEntityRecords('root', 'postType', {
        ...postType,
        supports: { ...postType.supports, title: showTitle },
      });
    }
    document
      .querySelectorAll('.gutenberg__editor')
      .forEach((editor) =>
        editor.classList.toggle('gutenberg__editor--no-title', !showTitle),
      );
  });
}

/**
 * Keep the editor title and Drupal's title field in sync.
 *
 * The title field follows the title edited in the editor, and the editor
 * follows the title field, which is in the sidebar unless the content type
 * shows the title in the canvas.
 */
function syncTitle() {
  let previous;
  // Not limited to core/editor: the post edits are kept in the core store.
  subscribe(() => {
    // Until the editor is set up with the node, its title is empty, and
    // syncing it would clear the title field the node title is read from.
    if (!select('core/editor').getCurrentPostId()) {
      return;
    }

    const title = select('core/editor').getEditedPostAttribute('title') ?? '';
    if (title === previous) {
      return;
    }
    previous = title;

    const field = getTitleField();
    if (field && field.value !== title && isTitleInEditor()) {
      field.value = title;
    }
  });

  document.addEventListener(
    'input',
    (event) => {
      if (event.target === getTitleField()) {
        dispatch('core/editor').editPost({ title: event.target.value });
      }
    },
    true,
  );
}

/**
 * Start syncing the title with the editor.
 */
export function initTitleSync() {
  toggleCanvasTitle();
  syncTitle();
}
