import { useState, useEffect, createPortal } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';
import { BackButton } from '@drupal-gutenberg/components';

function DrupalBackButton() {
  const isFullscreenMode = useSelect(
    (select) => select('core/edit-post').isFeatureActive('fullscreenMode'),
    [],
  );

  const [slotEl, setSlotEl] = useState(null);

  useEffect(() => {
    if (!isFullscreenMode) {
      setSlotEl(null);
      return;
    }

    // Wait for the header slot to appear in the DOM.
    const el = document.querySelector('.editor-header__back-button');
    if (el) {
      // Clear the WP default back button content.
      el.innerHTML = '';
      setSlotEl(el);
      return;
    }

    // If not yet rendered, observe for it.
    const observer = new MutationObserver(() => {
      const target = document.querySelector('.editor-header__back-button');
      if (target) {
        target.innerHTML = '';
        setSlotEl(target);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [isFullscreenMode]);

  if (!slotEl) {
    return null;
  }

  return createPortal(<BackButton />, slotEl);
}

registerPlugin('drupal-back-button', {
  render: DrupalBackButton,
  icon: null,
});
