/* global Drupal, jQuery */

import { select, dispatch } from '@wordpress/data';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { DrupalIcon, ContentBlock } from '@drupal-gutenberg/components';

function registerBlock(id, definition) {
  const blockId = `content-block/${id}`.replace(/_/g, '-').replace(/:/g, '-');

  registerBlockType(blockId, {
    apiVersion: 3,
    title: `${definition.label}`,
    description: `${definition.description}`,
    icon: DrupalIcon,
    category: 'content-blocks',
    supports: {
      align: true,
      html: false,
      reusable: false,
      color: true,
      spacing: {
        padding: true,
        margin: true,
      },
    },
    attributes: {
      type: {
        type: 'string',
      },
      contentBlockId: {
        type: 'string',
      },
      viewMode: {
        type: 'string',
      },
      settings: {
        type: 'object',
      },
      align: {
        type: 'string',
      },
    },
    edit({ attributes, setAttributes }) {
      const blockProps = useBlockProps();
      const { settings, contentBlockId, viewMode } = attributes;
      setAttributes({ type: id });

      return (
        <div {...blockProps}>
          <ContentBlock
            type={id}
            contentBlockId={contentBlockId}
            viewMode={viewMode}
            name={definition.label}
            settings={settings}
            onViewModeChange={(newViewMode) =>
              setAttributes({ viewMode: newViewMode })
            }
          />
        </div>
      );
    },
    save() {
      return <div {...useBlockProps.save()}></div>;
    },
    deprecated: [
      {
        apiVersion: 2,
        attributes: {
          type: {
            type: 'string',
          },
          contentBlockId: {
            type: 'string',
          },
          viewMode: {
            type: 'string',
          },
          settings: {
            type: 'object',
          },
          align: {
            type: 'string',
          },
        },
        save() {
          return null;
        },
      },
    ],
  });
}

export function registerContentBlocks(contentType) {
  return new Promise((resolve) => {
    jQuery
      .ajax(Drupal.url(`editor/content_block_types/load/${contentType}`))
      .done((definitions) => {
        const category = {
          slug: 'content-blocks',
          title: Drupal.t('Content Blocks'),
        };

        const categories = [...select('core/blocks').getCategories(), category];

        dispatch('core/blocks').setCategories(categories);

        /* eslint no-restricted-syntax: ["error", "never"] */
        for (const id in definitions) {
          if ({}.hasOwnProperty.call(definitions, id)) {
            const definition = definitions[id];
            if (definition) {
              registerBlock(id, definition);
            }
          }
        }
        resolve();
      });
  });
}
