/* global CSS, Drupal, drupalSettings */

import { useLayoutEffect, useRef } from '@wordpress/element';
import { dispatch, select, subscribe } from '@wordpress/data';
import { getFieldWidget } from './field-values';

const PLACED_CLASS = 'gutenberg-field-widget--placed';
const IN_SIDEBAR_CLASS = 'gutenberg-field-widget--in-sidebar';

/**
 * Detach the Drupal editors (e.g. CKEditor) of a widget before it moves.
 *
 * @param {HTMLElement} widget The widget wrapper.
 */
function detachEditors(widget) {
  Drupal.behaviors.editor?.detach(widget, drupalSettings);
}

/**
 * Re-attach the Drupal editors of a widget after it moved.
 *
 * @param {HTMLElement} widget The widget wrapper.
 */
function attachEditors(widget) {
  Drupal.behaviors.editor?.attach(widget, drupalSettings);
}

/**
 * Shows a field's Drupal widget in the block settings sidebar.
 *
 * The widget moves here from the form while the block is selected, and moves
 * back when it's deselected. The editor is rendered inside the node form, so
 * the widget stays part of the form, and submits, in both places.
 *
 * @param {Object} props       The component props.
 * @param {string} props.field The field name.
 * @return {JSX.Element} The widget container.
 */
export default function FieldWidget({ field }) {
  const ref = useRef();

  // A layout effect, so the widget moves back before React removes the
  // sidebar from the document.
  useLayoutEffect(() => {
    const container = ref.current;
    const widget = getFieldWidget(field);
    if (!container || !widget) {
      return undefined;
    }

    // Keep the widget's place in the form to move it back to.
    const marker = document.createElement('span');
    marker.hidden = true;
    widget.before(marker);

    detachEditors(widget);
    widget.classList.add(IN_SIDEBAR_CLASS);
    container.appendChild(widget);
    attachEditors(widget);

    return () => {
      // AJAX (e.g. an image upload) may have replaced the widget in place.
      const current =
        container.querySelector(`[data-gutenberg-field-widget="${CSS.escape(field)}"]`) ||
        widget;
      detachEditors(current);
      current.classList.remove(IN_SIDEBAR_CLASS);
      if (marker.isConnected) {
        marker.replaceWith(current);
      } else {
        (document.getElementById('edit-metabox-fields') || container.closest('form'))?.appendChild(current);
        marker.remove();
      }
      attachEditors(current);
    };
  }, [field]);

  return <div ref={ref} className="drupal-field-block__widget" />;
}

/**
 * Get the fields placed with the field block.
 *
 * @return {Set<string>} The field names.
 */
function getPlacedFields() {
  const { getBlocksByName, getBlockAttributes } = select('core/block-editor');
  return new Set(
    getBlocksByName('drupal/field')
      .map((clientId) => getBlockAttributes(clientId)?.field)
      .filter(Boolean),
  );
}

/**
 * Hide the widgets of placed fields from "More settings".
 *
 * Their widgets show in the block settings sidebar instead. Widgets with
 * validation errors stay visible.
 */
export function trackPlacedFields() {
  let previous = '';
  subscribe(() => {
    const placed = getPlacedFields();
    const key = [...placed].sort().join(',');
    if (key === previous) {
      return;
    }
    previous = key;

    document.querySelectorAll('[data-gutenberg-field-widget]').forEach((widget) => {
      const hasError = !!widget.querySelector('.error, [aria-invalid="true"]');
      widget.classList.toggle(
        PLACED_CLASS,
        placed.has(widget.dataset.gutenbergFieldWidget) && !hasError,
      );
    });
  }, 'core/block-editor');
}

/**
 * Report an invalid value in the widget of a placed field.
 *
 * The widgets of placed fields are hidden outside the block settings sidebar,
 * so the browser can't report their validity itself. Select the field's block
 * to show its widget in the sidebar, and report it there.
 *
 * @return {boolean} Whether an invalid widget got reported.
 */
export function reportInvalidFieldWidget() {
  let invalid = null;
  document
    .querySelectorAll(`.${PLACED_CLASS}:not(.${IN_SIDEBAR_CLASS})`)
    .forEach((widget) => {
      const input = [...widget.querySelectorAll('input, select, textarea')].find(
        (element) => !element.checkValidity(),
      );
      if (input && !invalid) {
        invalid = { field: widget.dataset.gutenbergFieldWidget, name: input.name };
      }
    });
  if (!invalid) {
    return false;
  }

  const { getBlocksByName, getBlockAttributes } = select('core/block-editor');
  const clientId = getBlocksByName('drupal/field').find(
    (id) => getBlockAttributes(id)?.field === invalid.field,
  );
  if (!clientId) {
    return false;
  }

  dispatch('core/block-editor').selectBlock(clientId);
  dispatch('core/edit-post').openGeneralSidebar('edit-post/block');

  // Report once the widget moved to the sidebar.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.querySelector(`[name="${CSS.escape(invalid.name)}"]`)?.reportValidity();
    });
  });

  return true;
}
