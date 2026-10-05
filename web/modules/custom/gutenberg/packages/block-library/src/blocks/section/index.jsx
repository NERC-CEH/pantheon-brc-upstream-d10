/* global Drupal */

import { registerBlockType } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

const style = {
  minHeight: '40px',
  margin: '0 -40px',
  padding: '0 40px',
};

const template = [['core/paragraph', {}]];

function SectionEdit({ clientId }) {
  // eslint-disable-next-line no-unused-vars
  const hasInnerBlocks = useSelect(
    (select) => {
      const { getBlock } = select('core/block-editor');
      const block = getBlock(clientId);
      return !!(block && block.innerBlocks.length);
    },
    [clientId],
  );

  const blockProps = useBlockProps({ style });

  return (
    <main {...blockProps}>
      <InnerBlocks templateLock={false} template={template} />
    </main>
  );
}

const settings = {
  apiVersion: 3,
  title: Drupal.t('Section'),
  description: Drupal.t('Section block for template use.'),
  icon: 'media-document',
  attributes: {},
  supports: {
    inserter: false,
    align: true,
    html: false,
  },

  edit: SectionEdit,

  save() {
    return (
      <main {...useBlockProps.save()}>
        <InnerBlocks.Content />
      </main>
    );
  },

  deprecated: [
    {
      attributes: {},
      supports: {
        inserter: false,
        align: true,
        html: false,
      },
      save({ className }) {
        return (
          <main className={className}>
            <InnerBlocks.Content />
          </main>
        );
      },
    },
  ],
};

registerBlockType(`drupal/section`, { category: 'common', ...settings });
