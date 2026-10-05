/* global Drupal */
import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';

// Slightly longer than the #toolbar-bar margin-top transition (0.2s).
const TOOLBAR_TRANSITION_MS = 250;

/**
 * Keeps the Drupal.displace() offsets right for the editor.
 *
 * The non-fullscreen editor is positioned with the --drupal-displace-offset-*
 * properties, so they have to match the admin chrome around it:
 * - Some admin themes (e.g. Default Admin) only mark the Navigation top bar
 *   as a displacing element when it has local tasks, and hardcode a 64px
 *   offset instead. The bar wraps to more lines on narrow screens, so mark
 *   it to have Drupal.displace() measure it (it also re-measures on resize).
 * - The Navigation control bar (the burger on narrow screens) isn't marked at
 *   all. Mark it only while it is shown: Drupal.displace() measures elements
 *   hidden with display: none as well.
 * - Fullscreen mode slides the classic toolbar out of view, and nothing
 *   triggers Drupal.displace() once it slides back in.
 */
function DrupalDisplace() {
  const isFullscreenMode = useSelect(
    (select) => select('core/edit-post').isFeatureActive('fullscreenMode'),
    [],
  );

  useEffect(() => {
    if (typeof Drupal === 'undefined' || !Drupal.displace) {
      return undefined;
    }

    const topBar = document.querySelector('.top-bar');
    if (topBar && !topBar.hasAttribute('data-offset-top')) {
      topBar.setAttribute('data-offset-top', '');
      Drupal.displace(true);
    }

    // Drupal.displace() only writes an offset property when the value changes,
    // so a value set in CSS stays when nothing displaces that edge. Default
    // Admin hardcodes a 64px top offset for its top bar, which the editor
    // page doesn't render.
    Object.entries(Drupal.displace(false)).forEach(([edge, value]) => {
      document.documentElement.style.setProperty(
        `--drupal-displace-offset-${edge}`,
        `${value}px`,
      );
    });

    const controlBar = document.querySelector('.admin-toolbar-control-bar');
    if (
      !controlBar ||
      controlBar.hasAttribute('data-offset-top') ||
      typeof ResizeObserver === 'undefined'
    ) {
      return undefined;
    }

    // Fires on observe and whenever the bar is shown, hidden or resized.
    const observer = new ResizeObserver(() => {
      controlBar.toggleAttribute('data-offset-top', controlBar.offsetHeight > 0);
      Drupal.displace(true);
    });
    observer.observe(controlBar);

    return () => {
      observer.disconnect();
      controlBar.removeAttribute('data-offset-top');
    };
  }, []);

  useEffect(() => {
    if (typeof Drupal === 'undefined' || !Drupal.displace) {
      return undefined;
    }

    const timeout = setTimeout(
      () => Drupal.displace(true),
      TOOLBAR_TRANSITION_MS,
    );

    return () => clearTimeout(timeout);
  }, [isFullscreenMode]);

  return null;
}

registerPlugin('drupal-displace', {
  render: DrupalDisplace,
  icon: null,
});
