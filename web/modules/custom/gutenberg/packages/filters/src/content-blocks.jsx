/* global Drupal, drupalSettings */

import { useEffect } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Retrieves the Gutenberg CSRF token.
 */
function getCsrfToken() {
  return drupalSettings.gutenberg.csrfToken;
}

async function cloneIfUsed(contentBlockId, isDuplicate) {
  const options = {
    isDuplicate,
    contentBlockId,
    entityId: drupalSettings.gutenberg.entityId || null,
    entityType: 'node',
    entityBundle: drupalSettings.gutenberg.nodeType,
  };

  const csrfToken = getCsrfToken();

  const response = await fetch(
    Drupal.url(`editor/content_block/clone_if_used`),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(options),
    },
  );
  const block = await response.json();
  return block.id;
}

/**
 * @info Checks for duplicate contentBlockIds and clones duplicates.
 */
// Tracks the gutenberg blocks that were checked
const contentBlockClientIds = new Set();

// Stores used contentBlockIds
const contentBlockIds = new Set();

const handleDuplicateContentBlocks = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    const { attributes, setAttributes, clientId, name } = props;

    if (name.startsWith('content-block/')) {
      const { contentBlockId } = attributes;

      useEffect(() => {
        if (contentBlockId && !contentBlockClientIds.has(clientId)) {
          console.log(clientId, 'Checking clientId');

          // Mark this clientID as being checked for duplicates.
          contentBlockClientIds.add(clientId);

          cloneIfUsed(contentBlockId, contentBlockIds.has(contentBlockId)).then(
            (clonedId) => {
              if (clonedId == contentBlockId) {
                // Ids are the same, meaning this wasn't cloned, and it's ok to use what we have.
                console.log(
                  contentBlockId,
                  'is unique and unused elsewhere, we can use it.',
                );
                contentBlockIds.add(contentBlockId);
              } else if (clonedId) {
                // we have an ID, meaning this was cloned, use this new id.
                console.log(clonedId, 'cloned block ' + contentBlockId);
                contentBlockIds.add(clonedId);
                setAttributes({ contentBlockId: clonedId });
              } else {
                console.log('must create a new block');
                // It wasn't cloned, something went wrong. clear the id and force the user to create a new block.
                setAttributes({ contentBlockId: null });
              }
            },
          );
        }
      });
    }
    return (
      <>
        <BlockEdit {...props} />
      </>
    );
  };
}, 'handleDuplicateContentBlocks');

addFilter(
  'editor.BlockEdit',
  'drupalgutenberg/duplicate-content-block-ids',
  handleDuplicateContentBlocks,
);
