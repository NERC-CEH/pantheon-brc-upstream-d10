/* global CSS, MutationObserver, Node */

/**
 * @file
 * Reads and writes entity field values through their widgets in the form.
 *
 * The widget in the Drupal form holds the field value: inline edits in the
 * editor canvas write to its inputs, and every block showing the field reads
 * from them, so they stay in sync with each other and with the widget.
 */

import { useSyncExternalStore, useCallback } from '@wordpress/element';

const WIDGET_ATTRIBUTE = 'data-gutenberg-field-widget';
const NO_ROWS = [];

const listeners = new Set();
const snapshots = new Map();
let version = 0;
let scheduled = false;
let listening = false;

/**
 * Tell the subscribers that field values changed.
 */
function notify() {
  version++;
  listeners.forEach((listener) => listener());
}

/**
 * Tell the subscribers that field values may have changed, once per frame.
 *
 * A widget AJAX update or a tabledrag reorder triggers many mutations at once.
 */
function scheduleNotify() {
  if (scheduled) {
    return;
  }
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    notify();
  });
}

/**
 * Whether a node is inside a field widget.
 *
 * @param {Node} node The node.
 * @return {boolean} Whether the node is in a field widget.
 */
function isInWidget(node) {
  const element =
    node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  return !!element?.closest(`[${WIDGET_ATTRIBUTE}]`);
}

/**
 * Start listening to changes of the field widgets.
 */
function listen() {
  if (listening) {
    return;
  }
  listening = true;

  // Notify right away on input, so a RichText's value never lags behind
  // what was typed in it.
  const onInput = (event) => {
    if (isInWidget(event.target)) {
      notify();
    }
  };
  document.addEventListener('input', onInput, true);
  document.addEventListener('change', onInput, true);

  // Rows added or reordered in multi-value widgets, AJAX updates.
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => isInWidget(mutation.target))) {
      scheduleNotify();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Get the widget of a field.
 *
 * @param {string} field The field name.
 * @return {HTMLElement|null} The widget wrapper.
 */
export function getFieldWidget(field) {
  return document.querySelector(`[${WIDGET_ATTRIBUTE}="${CSS.escape(field)}"]`);
}

/**
 * Get the widget rows of a field in display order.
 *
 * @param {string} field The field name.
 * @return {Array<{delta: number, value: string}>} The rows. The delta is the
 *   row index in the widget, the order follows the row weights.
 */
function readFieldRows(field) {
  const pattern = new RegExp(
    `^${field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\[(\\d+)\\]\\[(value|_weight)\\]$`,
  );
  const rows = {};
  document
    .querySelectorAll(`[name^="${CSS.escape(field)}["]`)
    .forEach((input) => {
      const match = input.name.match(pattern);
      if (!match) {
        return;
      }
      const delta = parseInt(match[1], 10);
      rows[delta] = rows[delta] || { delta, value: null, weight: delta };
      if (match[2] === 'value') {
        rows[delta].value = input.value;
      } else {
        rows[delta].weight = parseInt(input.value, 10) || 0;
      }
    });

  return Object.values(rows)
    .filter((row) => row.value !== null)
    .sort((a, b) => a.weight - b.weight || a.delta - b.delta)
    .map(({ delta, value }) => ({ delta, value }));
}

/**
 * Get the widget rows of a field, reusing the last result when unchanged.
 *
 * @param {string} field The field name.
 * @return {Array<{delta: number, value: string}>} The rows.
 */
export function getFieldRows(field) {
  const snapshot = snapshots.get(field);
  if (snapshot && snapshot.version === version) {
    return snapshot.rows;
  }

  let rows = readFieldRows(field);
  if (snapshot && JSON.stringify(snapshot.rows) === JSON.stringify(rows)) {
    rows = snapshot.rows;
  }
  snapshots.set(field, { version, rows });
  return rows;
}

/**
 * Set a field value in its widget.
 *
 * @param {string} field The field name.
 * @param {number} delta The widget row.
 * @param {string} value The value.
 */
export function setFieldValue(field, delta, value) {
  const input = document.querySelector(
    `[name="${CSS.escape(`${field}[${delta}][value]`)}"]`,
  );
  if (!input || input.value === value) {
    return;
  }
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Subscribe to changes of the field widgets.
 *
 * @param {Function} listener Called when field values may have changed.
 * @return {Function} Unsubscribes the listener.
 */
export function subscribeToFieldValues(listener) {
  listen();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Get the widget rows of a field, and re-render when they change.
 *
 * @param {string} field The field name.
 * @return {Array<{delta: number, value: string}>} The rows in display order.
 */
export function useFieldRows(field) {
  const getSnapshot = useCallback(
    () => (field ? getFieldRows(field) : NO_ROWS),
    [field],
  );
  return useSyncExternalStore(subscribeToFieldValues, getSnapshot);
}
