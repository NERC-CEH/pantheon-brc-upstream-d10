/* global Drupal */

import { useDispatch, useSelect } from '@wordpress/data';
import {
  BlockControls,
  HeadingLevelDropdown,
  PlainText,
  useBlockProps,
} from '@wordpress/block-editor';
import { createBlock, getDefaultBlockName } from '@wordpress/blocks';

const __ = Drupal.t;

/**
 * Edit component of the entity title block.
 *
 * Edits the title of the entity in the editor, like the canvas title it
 * replaces. It's copied to Drupal's title field, see title-sync.js.
 *
 * @param {Object}   props                   The block props.
 * @param {Object}   props.attributes        The block attributes.
 * @param {Function} props.setAttributes     Updates the block attributes.
 * @param {Function} props.insertBlocksAfter Inserts blocks after this one.
 * @return {Element} The block edit element.
 */
export default function EntityTitleEdit({
  attributes: { level },
  setAttributes,
  insertBlocksAfter,
}) {
  const title = useSelect(
    (select) => select('core/editor').getEditedPostAttribute('title') ?? '',
    [],
  );
  const { editPost } = useDispatch('core/editor');
  const blockProps = useBlockProps({ className: 'wp-block-post-title' });

  return (
    <>
      <BlockControls group="block">
        <HeadingLevelDropdown
          value={level}
          onChange={(newLevel) => setAttributes({ level: newLevel })}
        />
      </BlockControls>
      <PlainText
        tagName={`h${level}`}
        placeholder={__('Title')}
        aria-label={__('Title')}
        value={title}
        onChange={(value) => editPost({ title: value })}
        __experimentalVersion={2}
        __unstableOnSplitAtEnd={() =>
          insertBlocksAfter(createBlock(getDefaultBlockName()))
        }
        {...blockProps}
      />
    </>
  );
}
