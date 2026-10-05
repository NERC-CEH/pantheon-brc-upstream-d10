/* global Drupal */

import { registerBlockType } from '@wordpress/blocks';
import { RichText, useBlockProps } from '@wordpress/block-editor';

const __ = Drupal.t;

const settings = {
  apiVersion: 3,
  title: __('Simple text'),
  description: __('Simple text block.'),
  icon: 'editor-textcolor',
  supports: {
    inserter: false,
  },
  attributes: {
    tag: {
      type: 'string',
      default: 'p',
    },
    text: {
      type: 'string',
    },
    placeholder: {
      type: 'string',
      default: __('Insert text'),
    },
  },

  edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();
    const { text, tag, placeholder } = attributes;
    return (
      <div {...blockProps}>
        <RichText
          tagName={tag}
          value={text}
          placeholder={placeholder}
          allowedFormats={[]}
          onChange={(newValue) => setAttributes({ text: newValue })}
        />
      </div>
    );
  },

  save({ attributes }) {
    const { text } = attributes;
    return <span {...useBlockProps.save()}>{text}</span>;
  },
};

settings.deprecated = [
  {
    attributes: settings.attributes,
    supports: settings.supports,
    save({ attributes }) {
      const { text } = attributes;
      return <span>{text}</span>;
    },
  },
  {
    attributes: settings.attributes,
    supports: settings.supports,
    save({ attributes }) {
      const { text } = attributes;
      return text;
    },
  },
];

registerBlockType(`drupal/simple-text`, { category: 'common', ...settings });
