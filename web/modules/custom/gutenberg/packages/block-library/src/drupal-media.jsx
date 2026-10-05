/* global Drupal, drupalSettings */

import { registerBlockType } from '@wordpress/blocks';
import { RichText, useBlockProps } from '@wordpress/block-editor';
import { dispatch } from '@wordpress/data';
import { DrupalMediaEntity } from '@drupal-gutenberg/components';

const gutenberg = drupalSettings.gutenberg || {};
const isMediaLibraryEnabled = gutenberg['media-library-enabled'] || false;
const isMediaEnabled = gutenberg['media-enabled'] || false;
const __ = Drupal.t;
const editorSettings = drupalSettings.editor;
let gutenbergSettings = null;
if (editorSettings && editorSettings.formats) {
  Object.keys(editorSettings.formats).forEach(function (key) {
    const editorSetting = editorSettings.formats[key];
    if (editorSetting.editor !== 'gutenberg') {
      return;
    }
    gutenbergSettings = editorSetting.editorSettings;
  });
}

const registerBlock = () => {
  const blockId = 'drupalmedia/drupal-media-entity';
  if (!gutenbergSettings || !gutenbergSettings.allowedDrupalBlocks) {
    // Totally not enabled, that's for sure.
    return;
  }
  if (!gutenbergSettings.allowedDrupalBlocks.includes(blockId)) {
    return;
  }

  registerBlockType(blockId, {
    apiVersion: 3,
    title: Drupal.t('Media'),
    icon: 'admin-media',
    category: 'common',
    supports: {
      align: true,
      html: false,
      reusable: false,
    },
    attributes: {
      mediaEntityIds: {
        type: 'array',
      },
      viewMode: {
        type: 'string',
        default: 'default',
      },
      caption: {
        type: 'string',
        default: '',
      },
      lockViewMode: {
        type: 'boolean',
        default: false,
      },
      allowedTypes: {
        type: 'array',
        default: ['image', 'video', 'audio', 'remote_video', 'application'],
      },
    },
    edit({ attributes, setAttributes, isSelected, clientId }) {
      const blockProps = useBlockProps();
      const { mediaEntityIds, caption } = attributes;

      return (
        <figure {...blockProps}>
          <DrupalMediaEntity
            attributes={attributes}
            setAttributes={setAttributes}
            isSelected={isSelected}
            isMediaLibraryEnabled={isMediaLibraryEnabled}
            clientId={clientId}
            onError={(error) => {
              error = typeof error === 'string' ? error : error[2];
              dispatch('core/notices').createWarningNotice(error);
            }}
          />
          {mediaEntityIds &&
            mediaEntityIds.length > 0 &&
            (!RichText.isEmpty(caption) || isSelected) && (
              <RichText
                tagName="figcaption"
                placeholder={__('Write caption…')}
                value={caption}
                onChange={(value) => setAttributes({ caption: value })}
              />
            )}
        </figure>
      );
    },
    save() {
      return null;
    },
  });
};

export const registerDrupalMedia = () =>
  new Promise((resolve) => {
    if (isMediaEnabled) {
      registerBlock();
    }

    resolve();
  });
