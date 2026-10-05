/**
 * @file
 * Dark mode toggle behavior for Gutenberg Base theme.
 *
 * Dark mode is the data-theme="dark" attribute on <html>, which remaps the
 * semantic color tokens (see css/tokens/colors.css). The choice is stored in
 * localStorage, and applied before the first paint by html.html.twig.
 */

/* global Drupal, once */
(function (Drupal, once) {
  'use strict';

  const STORAGE_KEY = 'gutenberg_base_dark_mode';
  const root = document.documentElement;
  const isDark = () => root.getAttribute('data-theme') === 'dark';

  const update = (button) => {
    const text = isDark()
      ? Drupal.t('Switch to light mode')
      : Drupal.t('Switch to dark mode');
    button.setAttribute('aria-pressed', String(isDark()));
    button.setAttribute('aria-label', text);
    // The label shows when the toggle is in the menu panel.
    const label = button.querySelector('.dark-mode-toggle__label');
    if (label) {
      label.textContent = text;
    }
  };

  Drupal.behaviors.gutenbergBaseDarkMode = {
    attach(context) {
      once('dark-mode-toggle', '.dark-mode-toggle', context).forEach(
        (button) => {
          update(button);
          button.addEventListener('click', () => {
            const theme = isDark() ? 'light' : 'dark';
            root.classList.add('dark-mode-transition');
            root.setAttribute('data-theme', theme);
            update(button);
            try {
              localStorage.setItem(STORAGE_KEY, theme);
            } catch {
              // localStorage may be unavailable.
            }
            // Only the toggle transitions colors, so hover effects stay snappy.
            window.setTimeout(
              () => root.classList.remove('dark-mode-transition'),
              400,
            );
          });
        },
      );
    },
  };
})(Drupal, once);
