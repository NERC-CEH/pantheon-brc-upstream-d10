/* global Drupal, drupalSettings */

import {
  useState,
  useEffect,
  useRef,
  useMemo,
} from '@wordpress/element';
import {
  InspectorControls,
  RichText,
  useBlockProps,
} from '@wordpress/block-editor';
import {
  PanelBody,
  Placeholder,
  SelectControl,
  Spinner,
  TextControl,
} from '@wordpress/components';
import { create } from '@wordpress/rich-text';
import { htmlToReact, loadEditorStyles } from '@drupal-gutenberg/components';
import { setFieldValue, useFieldRows } from './field-values';
import FieldWidget from './field-widget';

const __ = Drupal.t;

const VALUE_ATTRIBUTE = 'data-gutenberg-field-value';

/**
 * Get the fields the block can show.
 *
 * @return {Object} Field info keyed by field name.
 */
export function getEntityFields() {
  return drupalSettings.gutenberg?.entityFields || {};
}

/**
 * Convert a plain text value to RichText HTML.
 *
 * @param {string} text The text.
 * @return {string} The HTML.
 */
function textToHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r?\n/g, '<br>');
}

/**
 * Convert RichText HTML to a plain text value.
 *
 * @param {string} html The HTML.
 * @return {string} The text, with line breaks as newlines.
 */
function htmlToText(html) {
  return create({ html }).text;
}

/**
 * Fetch the rendered field.
 *
 * @param {Object} body The request body.
 * @return {Promise<{access: boolean, html: string, css: string, inline: boolean}>}
 *   The response.
 */
async function fetchRender(body) {
  const response = await fetch(Drupal.url('editor/field/render'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': drupalSettings.gutenberg.csrfToken,
    },
    body: JSON.stringify(body),
  });
  return response.json();
}

/**
 * A field value edited in the canvas.
 *
 * @param {Object}  props             The component props.
 * @param {string}  props.field       The field name.
 * @param {number}  props.delta       The widget row.
 * @param {boolean} props.multiline   Whether the value can have line breaks.
 * @param {string}  props.placeholder The placeholder.
 * @param {boolean} props.hideIdle    Whether to hide the value while the block
 *                                    isn't selected and the value is empty.
 * @return {JSX.Element} The RichText.
 */
function FieldValue({ field, delta, multiline, placeholder, hideIdle }) {
  const rows = useFieldRows(field);
  const text = rows.find((row) => row.delta === delta)?.value || '';

  return (
    <RichText
      tagName="span"
      className={`drupal-field-block__value${
        hideIdle && !text ? ' is-idle-hidden' : ''
      }`}
      value={textToHtml(text)}
      onChange={(html) => setFieldValue(field, delta, htmlToText(html))}
      placeholder={placeholder}
      allowedFormats={[]}
      withoutInteractiveFormatting
      disableLineBreaks={!multiline}
    />
  );
}

/**
 * Edit component of the field block.
 *
 * Shows the field rendered by the server. Values of inline editable fields
 * are marked in the HTML and replaced with RichText, other fields are edited
 * with their widget in the block settings sidebar.
 *
 * @param {Object}   props               The block edit props.
 * @param {Object}   props.attributes    The block attributes.
 * @param {Function} props.setAttributes Sets block attributes.
 * @return {JSX.Element} The block edit element.
 */
export default function FieldEdit({ attributes, setAttributes }) {
  const { field, labelDisplay, offset, limit } = attributes;
  const blockProps = useBlockProps();
  const fields = getEntityFields();
  const info = field ? fields[field] : null;
  const inlineEditable = !!info?.inlineEditable;

  const rows = useFieldRows(inlineEditable ? field : null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  // Render again when rows are added, removed or reordered, or when a row's
  // emptiness changes which rows fall in the offset/limit range. Not on
  // every keystroke: the values are edited in place.
  const hasRange = offset > 0 || limit > 0;
  const rowsKey = rows
    .map((row) => `${row.delta}${hasRange && !row.value.trim() ? '-' : ''}`)
    .join(',');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!info) {
      return undefined;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      setLoading(true);
      const { entityType, entityId, nodeType } = drupalSettings.gutenberg;
      fetchRender({
        entityType,
        entityId,
        bundle: nodeType,
        field,
        labelDisplay,
        offset,
        limit,
        values: inlineEditable ? rowsRef.current : undefined,
      })
        .then((response) => {
          if (cancelled) {
            return;
          }
          setResult(response);
          if (response.access) {
            loadEditorStyles(response.css, `field-${field}`);
          }
        })
        .catch((error) => {
          if (!cancelled) {
            setResult({ access: false, html: String(error) });
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [field, labelDisplay, offset, limit, inlineEditable, rowsKey, !!info]);

  const content = useMemo(() => {
    if (!result?.access || !result.html) {
      return null;
    }

    let index = 0;
    return htmlToReact(
      result.html,
      (node) => {
        if (!result.inline || !node.hasAttribute(VALUE_ATTRIBUTE)) {
          return undefined;
        }
        const delta = parseInt(node.getAttribute(VALUE_ATTRIBUTE), 10);
        // Empty rows after the first one only show while the block is
        // selected, to type new values in.
        const hideIdle = node.hasAttribute('data-empty') && index > 0;
        index++;
        return (
          <FieldValue
            key={`field-value-${delta}`}
            field={field}
            delta={delta}
            multiline={info?.type === 'string_long'}
            placeholder={info?.label}
            hideIdle={hideIdle}
          />
        );
      },
      { stripAttributes: [VALUE_ATTRIBUTE, 'data-empty'] },
    );
  }, [result, field, info]);

  if (!info) {
    const options = Object.entries(fields).map(([name, fieldInfo]) => ({
      value: name,
      label: fieldInfo.label,
    }));
    return (
      <div {...blockProps}>
        <Placeholder
          icon="editor-textcolor"
          label={__('Field')}
          instructions={
            (!drupalSettings.gutenberg?.fieldBlocks &&
              __('Field blocks are disabled for this content type.')) ||
            (field
              ? __('The field @field is not available for this content.', { '@field': field })
              : __('Select the field to show.'))
          }
        >
          {options.length > 0 && (
            <SelectControl
              value=""
              options={[{ value: '', label: __('- Select -') }, ...options]}
              onChange={(value) => value && setAttributes({ field: value })}
            />
          )}
        </Placeholder>
      </div>
    );
  }

  const isMultiple = info.cardinality !== 1;

  const inspector = (
    <InspectorControls>
      {/* The widget's own label heads the panel. */}
      <PanelBody>
        <FieldWidget field={field} />
        {!inlineEditable && (
          <p className="components-base-control__help">
            {__('The preview in the content updates when the content is saved.')}
          </p>
        )}
      </PanelBody>
      <PanelBody title={__('Display')}>
        <SelectControl
          label={__('Label')}
          value={labelDisplay}
          options={[
            { value: 'hidden', label: __('- Hidden -') },
            { value: 'visually_hidden', label: __('- Visually hidden -') },
            { value: 'above', label: __('Above') },
            { value: 'inline', label: __('Inline') },
          ]}
          onChange={(value) => setAttributes({ labelDisplay: value })}
        />
        {isMultiple && (
          <>
            <TextControl
              type="number"
              min={0}
              label={__('Skip items')}
              help={__('The number of items to skip from the start.')}
              value={offset}
              onChange={(value) =>
                setAttributes({ offset: Math.max(0, parseInt(value, 10) || 0) })
              }
            />
            <TextControl
              type="number"
              min={0}
              label={__('Number of items')}
              help={__('The number of items to show. Leave at 0 to show all.')}
              value={limit}
              onChange={(value) =>
                setAttributes({ limit: Math.max(0, parseInt(value, 10) || 0) })
              }
            />
          </>
        )}
      </PanelBody>
    </InspectorControls>
  );

  let preview;
  if (!result) {
    preview = (
      <Placeholder label={info.label}>
        <Spinner />
      </Placeholder>
    );
  } else if (!result.access) {
    preview = <Placeholder label={info.label} instructions={result.html} />;
  } else if (!content || content.length === 0) {
    preview = (
      <Placeholder
        label={info.label}
        instructions={
          isMultiple && offset > 0
            ? __('There are no items to show in this range.')
            : __('The field is empty. Add a value in the block settings.')
        }
      />
    );
  } else {
    preview = content;
  }

  return (
    <div {...blockProps}>
      {inspector}
      <div className="drupal-field-block__content">
        {loading && result && (
          <div className="drupal-field-block__loading">
            <Spinner />
          </div>
        )}
        {preview}
      </div>
    </div>
  );
}
