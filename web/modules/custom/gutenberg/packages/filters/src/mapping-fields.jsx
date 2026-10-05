/* global Drupal, drupalSettings */

import { useState, useEffect } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { getBlockType } from '@wordpress/blocks';
import { Card, CardBody, CardHeader, PanelBody } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Cast a value to match the block attribute's declared type.
 */
function castToAttributeType(value, attrName, blockName) {
  if (value == null) {
    return value;
  }
  const blockType = getBlockType(blockName);
  const attrDef = blockType?.attributes?.[attrName];
  if (!attrDef?.type) {
    return value;
  }
  switch (attrDef.type) {
    case 'number':
    case 'integer': {
      const n = Number(value);
      return Number.isNaN(n) ? value : n;
    }
    case 'boolean':
      return Boolean(value);
    case 'string':
      return String(value);
    default:
      return value;
  }
}

function hasMappingFields(attributes) {
  return (
    attributes &&
    attributes.mappingFields &&
    Array.isArray(attributes.mappingFields)
  );
}

function setClassName(value, className) {
  if (!className) {
    return value;
  }

  return value ? `${className} ${value}` : className;
}

const withInspectorControl = createHigherOrderComponent(
  (BlockEdit) => (props) => {
    const { attributes, setAttributes, className } = props;
    const hasMapping = hasMappingFields(attributes);
    const { mappingFields } = attributes;
    const { mappingFields: drupalMappingFields } = drupalSettings.gutenberg;
    const [isRequired, setIsRequired] = useState(false);
    const [isTranslatable, setIsTranslatable] = useState(false);
    const [isFieldEmpty, setIsFieldEmpty] = useState(true);

    useEffect(() => {
      // Check if any attribute is mapped to a required field in the mapping fields.
      if (hasMapping && isRequired) {
        setIsFieldEmpty(true);
        mappingFields.forEach((field) => {
          const possibleAttributes = [
            field.attribute || 'content',
            'value',
            'text',
          ];
          possibleAttributes.forEach((attribute) => {
            const value = attributes[attribute] || '';
            if (value) {
              setIsFieldEmpty(false);
            }
          });
        });
      }
    }, [attributes]);

    useEffect(() => {
      if (hasMapping) {
        mappingFields.forEach((mappingField) => {
          const drupalField = drupalMappingFields[mappingField.field];
          if (!drupalField) {
            return;
          }

          const property = mappingField.property || 'value';
          const attribute = mappingField.attribute || 'content';

          let fieldValue;
          if (drupalField.value[0]) {
            fieldValue = drupalField.value[0][property];
          }

          let value = {};
          // Exception for media blocks.
          if (attribute == 'mediaEntityIds') {
            value = {
              [`${attribute}`]: [fieldValue + ''],
            };
          } else {
            value = {
              [`${attribute}`]: castToAttributeType(
                fieldValue,
                attribute,
                props.name,
              ),
            };
          }

          if (fieldValue) {
            setAttributes(value);
          }

          if (drupalField.required) {
            setIsRequired(true);
          }

          if (drupalField.translatable) {
            setIsTranslatable(true);
          }
        });
      }
    }, []);

    return (
      <>
        <BlockEdit
          {...props}
          className={
            isFieldEmpty ? setClassName('is-required', className) : className
          }
        />
        {hasMapping && (
          <InspectorControls>
            {!attributes.lockViewMode && (
              <PanelBody title={__('Field mapping')} initialOpen>
                {attributes.mappingFields.map((field) => {
                  let content;
                  const property = field.property || 'value';
                  if (field.attribute) {
                    content = __(
                      'The block attribute <strong>@attribute</strong> is mapped to the <strong>@field (@property)</strong> field.',
                      {
                        '@attribute': field.attribute,
                        '@field': drupalMappingFields[field.field].label,
                        '@property': property,
                      },
                    );
                  } else {
                    content = __(
                      'The block content is mapped to the <strong>@field (@property)</strong> field.',
                      {
                        '@field': drupalMappingFields[field.field].label,
                        '@property': property,
                      },
                    );
                  }

                  if (isRequired) {
                    content = `${content}<br/><em>${__(
                      'The field is required.',
                    )}</em>`;
                  }

                  if (!isTranslatable) {
                    content = `${content}<br/><em>${__(
                      'Changing the value of this field will change it for all translations.',
                    )}</em>`;
                  }

                  return (
                    <Card>
                      {field.label && (
                        <CardHeader>
                          <strong>{field.label}</strong>
                        </CardHeader>
                      )}
                      <CardBody>
                        <div
                          className="mapping-fields-summary"
                          // eslint-disable-next-line react/no-danger
                          dangerouslySetInnerHTML={{ __html: content }}
                        />
                      </CardBody>
                    </Card>
                  );
                })}
              </PanelBody>
            )}
          </InspectorControls>
        )}
      </>
    );
  },
  'withInspectorControl',
);

addFilter(
  'blocks.registerBlockType',
  'drupalgutenberg/mapping-fields-attributes',
  (settings) => {
    settings.attributes = Object.assign(settings.attributes, {
      mappingFields: {
        type: 'array',
      },
    });

    return settings;
  },
);

addFilter(
  'editor.BlockEdit',
  'core/editor/mapping-fields-attributes/with-inspector-control',
  withInspectorControl,
);
