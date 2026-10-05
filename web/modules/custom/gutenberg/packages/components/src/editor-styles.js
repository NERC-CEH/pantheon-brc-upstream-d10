import { select, dispatch } from '@wordpress/data';

/**
 * Add CSS to the editor canvas, or update CSS added before under the same ID.
 *
 * The styles go to the core/editor settings, which the editor injects in its
 * iframe. They are marked with __unstableType so they're always included,
 * regardless of the "Use theme styles" preference.
 *
 * @param {string} css The CSS.
 * @param {string} id  An ID for the styles, used to avoid duplicates.
 */
export function loadEditorStyles(css, id) {
  if (!css || !id) {
    return;
  }

  const styles = select('core/editor').getEditorSettings().styles || [];
  const existing = styles.find((style) => style.__drupalStyleId === id);
  if (existing && existing.css === css) {
    return;
  }

  dispatch('core/editor').updateEditorSettings({
    styles: [
      ...styles.filter((style) => style !== existing),
      { css, __unstableType: 'drupal', __drupalStyleId: id },
    ],
  });
}
