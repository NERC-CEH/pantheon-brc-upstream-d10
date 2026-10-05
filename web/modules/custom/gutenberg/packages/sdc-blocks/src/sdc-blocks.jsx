/* global Drupal, drupalSettings */

import { select, dispatch } from '@wordpress/data';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { DrupalIcon } from '@drupal-gutenberg/components';
import { SdcEdit } from './sdc-edit';
import { registerSdcSlot } from './sdc-slot';
import { SdcSlotProvider } from './sdc-slot-context';

/**
 * Inject component CSS into the editor via the core/editor store.
 *
 * The useEditorStyles() hook in the Layout component reads from
 * select('core/editor').getEditorSettings().styles and passes them
 * to the Editor component, which injects them into the iframe.
 *
 * We set __unstableType so the styles are always included regardless
 * of the "Use theme styles" user preference.
 *
 * @param {string} cssContent  The CSS content string.
 * @param {string} componentId The SDC component ID (used for deduplication).
 */
export function loadComponentCss(cssContent, componentId) {
  if (!cssContent || !componentId) {
    return;
  }

  const styleId = `sdc-${componentId}`;
  const currentSettings = select('core/editor').getEditorSettings();
  const existingStyles = currentSettings.styles || [];

  // Already injected — skip.
  if (existingStyles.some((s) => s.__sdcId === styleId)) {
    return;
  }

  dispatch('core/editor').updateEditorSettings({
    styles: [
      ...existingStyles,
      { css: cssContent, __unstableType: 'sdc', __sdcId: styleId },
    ],
  });
}

/**
 * Convert an SDC ID (provider:machine-name) to a Gutenberg block name.
 * Colons are not allowed in block names, so we use double-dash.
 *
 * @param {string} sdcId The SDC component ID.
 * @return {string} The Gutenberg block name.
 */
function sdcIdToBlockName(sdcId) {
  return `sdc/${sdcId.replace(/:/g, '--').replace(/_/g, '-')}`;
}

/**
 * Check whether a prop schema describes an inline-editable string.
 *
 * @param {Object} propSchema The JSON Schema for a single prop.
 * @return {boolean} True if the prop should be rendered as RichText.
 */
function isInlineEditable(propSchema) {
  const types = Array.isArray(propSchema.type)
    ? propSchema.type
    : [propSchema.type];
  if (!types.includes('string')) return false;
  if (propSchema.enum) return false;
  const format = propSchema.format || '';
  if (['uri', 'uri-reference', 'email'].includes(format)) return false;
  if (propSchema.contentMediaType) return false;
  if (types.some((t) => t && typeof t === 'string' && t.startsWith('Drupal\\'))) {
    return false;
  }
  return true;
}

/**
 * Build default prop values from schema examples.
 *
 * Inline-editable string props default to '' so that RichText shows
 * its placeholder. Other props use their declared default or first example.
 *
 * @param {Object|null} schema The JSON Schema for component props.
 * @return {Object} Default prop values.
 */
function getDefaultProps(schema) {
  if (!schema || !schema.properties) {
    return {};
  }

  const defaults = {};
  Object.entries(schema.properties).forEach(([name, propSchema]) => {
    if (isInlineEditable(propSchema)) {
      defaults[name] = '';
    } else if (propSchema.default !== undefined) {
      defaults[name] = propSchema.default;
    } else if (propSchema.examples && propSchema.examples.length > 0) {
      defaults[name] = propSchema.examples[0];
    }
  });

  return defaults;
}

/**
 * Register a single SDC as a Gutenberg block.
 *
 * @param {string} id         The SDC component ID (provider:machine-name).
 * @param {Object} definition The SDC definition from the server.
 */
function registerBlock(id, definition) {
  const blockId = sdcIdToBlockName(id);
  const defaultProps = getDefaultProps(definition.schema);

  // Use component thumbnail SVG as the block icon when available.
  const icon = definition.thumbnailSvg
    ? () => <span dangerouslySetInnerHTML={{ __html: definition.thumbnailSvg }} />
    : DrupalIcon;

  registerBlockType(blockId, {
    apiVersion: 3,
    title: definition.name,
    description: definition.description || '',
    icon,
    category: 'sdc',
    supports: {
      html: false,
      reusable: false,
      align: true,
      color: true,
      spacing: {
        padding: true,
        margin: true,
      },
    },
    attributes: {
      componentId: {
        type: 'string',
        default: id,
      },
      props: {
        type: 'object',
        default: defaultProps,
      },
      variant: {
        type: 'string',
        default: definition.variants?.default ? 'default' : '',
      },
    },
    edit({ attributes, setAttributes }) {
      const blockProps = useBlockProps();

      // Ensure componentId is set.
      if (attributes.componentId !== id) {
        setAttributes({ componentId: id });
      }

      // Build template: one sdc/slot per defined slot.
      const slotTemplate = definition.slots
        ? Object.entries(definition.slots).map(([slotName, slotDef]) => [
            'sdc/slot',
            { name: slotName, label: slotDef.title || slotName },
          ])
        : [];

      return (
        <div {...blockProps}>
          <SdcSlotProvider slotDefinitions={definition.slots || {}}>
            <SdcEdit
              attributes={attributes}
              setAttributes={setAttributes}
              definition={definition}
            />
            {slotTemplate.length > 0 && (
              <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0 }}>
                <InnerBlocks
                  template={slotTemplate}
                  templateLock="all"
                />
              </div>
            )}
          </SdcSlotProvider>
        </div>
      );
    },
    save() {
      return <InnerBlocks.Content />;
    },
    deprecated: [
      {
        attributes: {
          componentId: { type: 'string' },
          props: { type: 'object' },
          variant: { type: 'string' },
        },
        save() {
          return null;
        },
      },
    ],
  });
}

/**
 * Fetch SDC definitions and register each as a Gutenberg block.
 *
 * @return {Promise} Resolves when all blocks are registered.
 */
export async function registerSdcBlocks() {
  try {
    // Read allowed SDC blocks from editor settings (null = allow all).
    const allowedSdcBlocks =
      drupalSettings.editor?.formats?.gutenberg?.editorSettings?.allowedSdcBlocks;

    const response = await fetch(Drupal.url('editor/sdc/definitions'), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[SDC Blocks] Failed to load SDC definitions:', response.status, response.statusText);
      return;
    }

    const definitions = await response.json();

    if (!definitions || Object.keys(definitions).length === 0) {
      console.warn('[SDC Blocks] No SDC definitions returned from endpoint.');
      return;
    }

    // Register the SDC category.
    const category = {
      slug: 'sdc',
      title: Drupal.t('Components'),
    };

    const categories = [
      ...select('core/blocks').getCategories(),
      category,
    ];
    dispatch('core/blocks').setCategories(categories);

    // Register the slot companion block once.
    registerSdcSlot();

    // Register each allowed SDC as a block and preload its CSS.
    for (const id in definitions) {
      if ({}.hasOwnProperty.call(definitions, id)) {
        // Skip blocks not in the allowed list (null = all allowed).
        if (allowedSdcBlocks && !allowedSdcBlocks.includes(id)) {
          continue;
        }

        const definition = definitions[id];
        if (definition) {
          loadComponentCss(definition.css, id);
          registerBlock(id, definition);
        }
      }
    }
  } catch (error) {
    console.error('[SDC Blocks] Failed to load SDC definitions:', error);
  }
}
