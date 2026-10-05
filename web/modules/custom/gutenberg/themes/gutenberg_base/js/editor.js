/**
 * @file
 * Applies the color scheme, the weight set and the button shape of the theme
 * to the editor.
 *
 * On the frontend, they are data-scheme, data-weight and data-buttons
 * attributes on <html> (see gutenberg_base_preprocess_html()).
 * The editor canvas is a document of its own, so this sets the same
 * attributes on its root, from the values that
 * gutenberg_base_gutenberg_definition_alter() adds to the theme support.
 */

/* global Drupal, drupalSettings, once */
(function (Drupal, drupalSettings, once) {
  'use strict';

  Drupal.behaviors.gutenbergBaseEditorCanvas = {
    attach(context) {
      if (!once('gutenberg-base-editor', 'body', context).length) {
        return;
      }
      const themeSupport =
        (drupalSettings.gutenberg &&
          drupalSettings.gutenberg['theme-support']) ||
        {};
      const settings = themeSupport.gutenbergBase || {};

      const apply = (root) => {
        if (!root) {
          return;
        }
        if (settings.scheme && settings.scheme !== 'mono') {
          root.setAttribute('data-scheme', settings.scheme);
        } else {
          root.removeAttribute('data-scheme');
        }
        if (settings.lightWeight) {
          root.setAttribute('data-weight', 'light');
        } else {
          root.removeAttribute('data-weight');
        }
        if (settings.roundButtons) {
          root.setAttribute('data-buttons', 'round');
        } else {
          root.removeAttribute('data-buttons');
        }
      };

      const applyAll = () => {
        document
          .querySelectorAll('iframe[name="editor-canvas"]')
          .forEach((iframe) => {
            if (iframe.contentDocument) {
              apply(iframe.contentDocument.documentElement);
            }
            if (!iframe.gutenbergBaseListening) {
              iframe.gutenbergBaseListening = true;
              iframe.addEventListener('load', () => {
                apply(
                  iframe.contentDocument &&
                    iframe.contentDocument.documentElement,
                );
              });
            }
          });
        // The canvas without an iframe.
        document.querySelectorAll('.editor-styles-wrapper').forEach(apply);
      };

      let scheduled = false;
      const observer = new MutationObserver(() => {
        if (!scheduled) {
          scheduled = true;
          window.requestAnimationFrame(() => {
            scheduled = false;
            applyAll();
          });
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      applyAll();
    },
  };
})(Drupal, drupalSettings, once);
