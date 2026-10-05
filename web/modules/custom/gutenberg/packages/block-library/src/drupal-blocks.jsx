/* global Drupal, jQuery */

import { select, dispatch } from '@wordpress/data';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { DrupalIcon, DrupalBlock } from '@drupal-gutenberg/components';

const providerIcons = {
  system: DrupalIcon, // 'admin-home',
  user: 'admin-users',
  views: 'media-document',
  core: DrupalIcon,
};

function registerBlock(id, definition) {
  const blockId = `drupalblock/${id}`.replace(/_/g, '-').replace(/:/g, '-');

  registerBlockType(blockId, {
    apiVersion: 3,
    title: `${definition.admin_label} [${definition.category}]`,
    icon: providerIcons[definition.provider] || DrupalIcon,
    category: 'drupal',
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
      blockId: {
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
      const { settings } = attributes;
      if (attributes.blockId !== id) {
        setAttributes({ blockId: id });
      }

      return (
        <div {...blockProps}>
          <DrupalBlock
            id={id}
            name={definition.admin_label}
            settings={settings}
          />
        </div>
      );
    },
    save() {
      return <div {...useBlockProps.save()}></div>;
    },
    deprecated: [
      {
        attributes: {
          blockId: {
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

export function registerDrupalBlocks(contentType) {
  return new Promise((resolve) => {
    jQuery
      .ajax(Drupal.url(`editor/blocks/load_by_type/${contentType}`))
      .done((definitions) => {
        const category = {
          slug: 'drupal',
          title: Drupal.t('Drupal Blocks'),
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
