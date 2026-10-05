/* global Drupal */

import { registerBlockType } from '@wordpress/blocks';
import { RichText, useBlockProps } from '@wordpress/block-editor';
import FieldEdit, { getEntityFields } from './edit';
import { trackPlacedFields } from './field-widget';
import registerFieldsCategory from '../fields-category';

export { reportInvalidFieldWidget } from './field-widget';

const __ = Drupal.t;

/**
 * Block icons by field type.
 */
const FIELD_ICONS = {
  string: 'editor-textcolor',
  string_long: 'editor-paragraph',
  text: 'editor-textcolor',
  text_long: 'editor-paragraph',
  text_with_summary: 'editor-paragraph',
  image: 'format-image',
  file: 'media-default',
  entity_reference: 'admin-links',
  link: 'admin-links',
  datetime: 'calendar-alt',
  daterange: 'calendar-alt',
  timestamp: 'calendar-alt',
  boolean: 'yes-alt',
  email: 'email',
  telephone: 'phone',
  integer: 'editor-ol',
  decimal: 'editor-ol',
  float: 'editor-ol',
  list_string: 'list-view',
  list_integer: 'list-view',
  list_float: 'list-view',
};

/**
 * Edit component of legacy field blocks.
 *
 * Before the block placed entity fields, it was a text block. Blocks saved
 * back then have text and no field, and keep working as they did.
 */
function LegacyEdit({ attributes, setAttributes }) {
  const blockProps = useBlockProps();
  const { text, tag, placeholder } = attributes;
  return (
    <div {...blockProps}>
      <RichText
        tagName={tag}
        value={text}
        placeholder={placeholder}
        onChange={(newValue) => setAttributes({ text: newValue })}
      />
    </div>
  );
}

const legacyAttributes = {
  tag: {
    type: 'string',
    default: 'h1',
  },
  text: {
    type: 'string',
  },
  mappingField: {
    type: 'string',
  },
  mappingAttribute: {
    type: 'string',
  },
};

const settings = {
  apiVersion: 3,
  title: __('Field'),
  description: __('Shows a field of the content.'),
  icon: 'editor-textcolor',
  category: 'fields',
  supports: {
    html: false,
    reusable: false,
    align: true,
    spacing: {
      margin: true,
    },
  },
  attributes: {
    field: {
      type: 'string',
    },
    labelDisplay: {
      type: 'string',
      default: 'hidden',
    },
    offset: {
      type: 'integer',
      default: 0,
    },
    limit: {
      type: 'integer',
      default: 0,
    },
    ...legacyAttributes,
    placeholder: {
      type: 'string',
      default: __('Insert text'),
    },
  },

  edit(props) {
    const { field, text } = props.attributes;
    if (!field && typeof text === 'string') {
      return <LegacyEdit {...props} />;
    }
    return <FieldEdit {...props} />;
  },

  // The field is rendered on the server. Legacy blocks keep their text.
  save({ attributes }) {
    return attributes.field ? null : attributes.text ?? null;
  },

  deprecated: [
    {
      attributes: {
        ...legacyAttributes,
        placeholder: {
          type: 'string',
          default: 'Insert text',
        },
      },
      save({ attributes }) {
        const { text } = attributes;
        return text;
      },
    },
  ],
};

/**
 * Register the field block, with a variation for each field of the entity.
 *
 * The base block is only there to be varied: the first variation is the
 * default, which replaces the base block in the inserter. Hiding the base
 * block with supports.inserter would hide its variations too.
 */
export function registerFieldBlock() {
  const variations = Object.entries(getEntityFields()).map(
    ([name, info], index) => ({
      name,
      title: info.label,
      description: __('Shows the @label field of the content.', {
        '@label': info.label,
      }),
      icon: FIELD_ICONS[info.type] || 'editor-textcolor',
      keywords: [name, __('field')],
      attributes: { field: name },
      isActive: ['field'],
      // Not 'transform': switching a placed block to another field makes no
      // sense, so the block settings don't offer it.
      scope: ['inserter'],
      isDefault: index === 0,
    }),
  );

  registerFieldsCategory();

  registerBlockType('drupal/field', {
    ...settings,
    supports: {
      ...settings.supports,
      inserter: variations.length > 0,
    },
    variations,
  });

  trackPlacedFields();
}
