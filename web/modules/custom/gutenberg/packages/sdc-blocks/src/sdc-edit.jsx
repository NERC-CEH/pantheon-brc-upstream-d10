/* global Drupal, drupalSettings */

import { useState, useEffect, useRef, useMemo, useCallback } from '@wordpress/element';
import { Placeholder, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { htmlToReact } from '@drupal-gutenberg/components';
import { loadComponentCss } from './sdc-blocks';
import { ToolbarControls, SidebarControls } from './toolbar-controls';
import { SlotPortalTarget } from './slot-portal-target';
import { RichText, BlockControls, InspectorControls } from '@wordpress/block-editor';

/**
 * Internal SDC marker attributes, left out of the editor markup.
 */
const SDC_MARKER_ATTRIBUTES = ['data-sdc-prop', 'data-sdc-slot', 'data-sdc-slot-label'];

/**
 * Get the replacement for an element marked as an SDC prop or slot.
 *
 * @param {Element} node         The DOM element.
 * @param {number}  key          React key for lists.
 * @param {Object}  replacements Map of prop name (or `slot:name`) → render
 *                               function receiving (domNode, key).
 * @return {*} The replacement element, or undefined.
 */
function getSdcReplacement(node, key, replacements) {
  const sdcProp = node.getAttribute('data-sdc-prop');
  if (sdcProp && replacements[sdcProp]) {
    return replacements[sdcProp](node, key);
  }

  const sdcSlot = node.getAttribute('data-sdc-slot');
  if (sdcSlot && replacements[`slot:${sdcSlot}`]) {
    return replacements[`slot:${sdcSlot}`](node, key);
  }

  return undefined;
}

/**
 * Determine which props are inline-editable (rendered as RichText).
 *
 * @param {Object|null} schema The JSON Schema for component props.
 * @return {string[]} Array of prop names that are inline-editable.
 */
function getInlineEditableProps(schema) {
  if (!schema || !schema.properties) {
    return [];
  }

  return Object.entries(schema.properties)
    .filter(([, propSchema]) => {
      const types = Array.isArray(propSchema.type)
        ? propSchema.type
        : [propSchema.type];
      const hasString = types.includes('string');
      if (!hasString) return false;

      // Exclude enums — they use select controls.
      if (propSchema.enum) return false;

      // Exclude URI/email — they are attribute values.
      const format = propSchema.format || '';
      if (['uri', 'uri-reference', 'email'].includes(format)) return false;

      // Exclude special content types.
      if (propSchema.contentMediaType) return false;

      // Exclude Drupal class types.
      if (types.some((t) => t && typeof t === 'string' && t.startsWith('Drupal\\'))) {
        return false;
      }

      return true;
    })
    .map(([name]) => name);
}

/**
 * Compute a stable key from non-inline prop values for re-render triggering.
 *
 * @param {Object}   props       The current prop values.
 * @param {string[]} inlineProps The names of inline-editable props.
 * @return {string} A JSON string of non-inline prop values.
 */
function getNonInlineKey(props, inlineProps) {
  const nonInline = {};
  for (const [key, value] of Object.entries(props)) {
    if (!inlineProps.includes(key)) {
      nonInline[key] = value;
    }
  }
  return JSON.stringify(nonInline);
}

/**
 * Fetch server-rendered HTML for an SDC component.
 *
 * @param {string} componentId The SDC component ID.
 * @param {Object} props       The prop values.
 * @param {string} variant     The variant name.
 * @return {Promise<{access: boolean, html: string}>}
 */
async function fetchRender(componentId, props, variant) {
  const response = await fetch(Drupal.url('editor/sdc/render'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': drupalSettings.gutenberg.csrfToken,
    },
    body: JSON.stringify({
      componentId,
      props,
      variant: variant || null,
      editMode: true,
    }),
  });
  return response.json();
}

/**
 * The main edit component for SDC blocks.
 *
 * Renders the component's server-side HTML with inline-editable text props
 * replaced by RichText components, and non-text props in toolbar/sidebar.
 */
export function SdcEdit({
  attributes,
  setAttributes,
  definition,
}) {
  const { componentId, props, variant } = attributes;
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  // Identify inline-editable props from schema.
  const inlineProps = useMemo(
    () => getInlineEditableProps(definition.schema),
    [definition.schema],
  );

  // Key that changes when non-inline props change (triggers re-render).
  const nonInlineKey = useMemo(
    () => getNonInlineKey(props, inlineProps),
    [props, inlineProps],
  );

  // Load component CSS into the editor (injected via editor settings.styles).
  useEffect(() => {
    if (definition.css) {
      loadComponentCss(definition.css, componentId);
    }
  }, [definition.css, componentId]);

  // Fetch server-rendered HTML on mount and when non-inline props change.
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true);

      // Fill in example values for empty inline props so Twig {% if %}
      // blocks render the HTML structure (needed for data-sdc-prop replacements).
      const renderProps = { ...props };
      inlineProps.forEach((propName) => {
        if (!renderProps[propName]) {
          const propSchema = definition.schema?.properties?.[propName];
          if (propSchema?.examples?.length > 0) {
            renderProps[propName] = propSchema.examples[0];
          } else {
            renderProps[propName] = propSchema?.title || propName;
          }
        }
      });

      fetchRender(componentId, renderProps, variant)
        .then((result) => {
          if (result.access) {
            setHtml(result.html);
            setError(null);
            // Inject any additional CSS from render response.
            loadComponentCss(result.css, componentId);
          } else {
            setError(result.html);
          }
          setLoading(false);
        })
        .catch((e) => {
          setError(String(e));
          setLoading(false);
        });
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [componentId, variant, nonInlineKey]);

  // Handle inline prop changes.
  const handlePropChange = useCallback(
    (propName, value) => {
      setAttributes({
        props: { ...props, [propName]: value },
      });
    },
    [props, setAttributes],
  );

  // Handle non-inline prop changes.
  const handlePropsChange = useCallback(
    (newProps) => {
      setAttributes({
        props: { ...props, ...newProps },
      });
    },
    [props, setAttributes],
  );

  // Handle variant change.
  const handleVariantChange = useCallback(
    (newVariant) => {
      setAttributes({ variant: newVariant });
    },
    [setAttributes],
  );

  // Build replacements map for htmlToReact: replace [data-sdc-prop]
  // elements with RichText components, and [data-sdc-slot] with
  // slot placeholder zones.
  const replacements = useMemo(() => {
    const map = {};

    // Inline prop replacements.
    inlineProps.forEach((propName) => {
      map[propName] = (domNode, key) => {
        return (
          <RichText
            key={`sdc-prop-${propName}`}
            tagName={'span'}
            value={props[propName] || ''}
            onChange={(value) => handlePropChange(propName, value)}
            placeholder={
              definition.schema?.properties?.[propName]?.title || propName
            }
          />
        );
      };
    });

    // Slot replacements — render portal targets where sdc/slot blocks
    // will portal their InnerBlocks content.
    if (definition.slots) {
      Object.entries(definition.slots).forEach(([slotName]) => {
        map[`slot:${slotName}`] = () => {
          return (
            <SlotPortalTarget
              key={`sdc-slot-${slotName}`}
              slotName={slotName}
            />
          );
        };
      });
    }

    return map;
  }, [inlineProps, props, handlePropChange, definition.schema, definition.slots]);

  // Convert HTML to React elements with replacements.
  const reactContent = useMemo(() => {
    if (!html) return null;
    return htmlToReact(html, (node, key) => getSdcReplacement(node, key, replacements), {
      stripAttributes: SDC_MARKER_ATTRIBUTES,
    });
  }, [html, replacements]);

  // Show loading state.
  if (loading && !html) {
    return (
      <>
        <Placeholder
          label={definition.name}
          instructions={__('Loading component…')}
        >
          <Spinner />
        </Placeholder>
      </>
    );
  }

  // Show error state.
  if (error && !html) {
    return (
      <Placeholder
        label={definition.name}
        instructions={error}
      />
    );
  }

  return (
    <>
      <BlockControls>
        <ToolbarControls
          schema={definition.schema}
          props={props}
          onChange={handlePropsChange}
          variants={definition.variants}
          variant={variant}
          onVariantChange={handleVariantChange}
          inlineProps={inlineProps}
        />
      </BlockControls>

      <InspectorControls>
        <SidebarControls
          schema={definition.schema}
          props={props}
          onChange={handlePropsChange}
          inlineProps={inlineProps}
          variants={definition.variants}
          variant={variant}
          onVariantChange={handleVariantChange}
        />
      </InspectorControls>

      <div className="sdc-block-content" style={{ position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            zIndex: 10,
          }}>
            <Spinner />
          </div>
        )}
        {reactContent}
      </div>
    </>
  );
}
