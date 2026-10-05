/**
 * @file
 * Site header behaviors: the menu panel, and hiding the header on scroll.
 */

/* global Drupal, once */
(function (Drupal, once) {
  'use strict';

  /**
   * Opens and closes the menu panel under the header.
   *
   * The Menu button toggles the panel; the Search button opens it and focuses
   * its search field. Escape, the scrim and a click outside close it. On
   * smaller screens, the panel also holds the quick links and the dark mode
   * toggle.
   */
  Drupal.behaviors.gutenbergBaseMenuPanel = {
    attach(context) {
      once('menu-panel', '.site-header', context).forEach((header) => {
        const panel = header.querySelector('.menu-panel');
        const toggle = header.querySelector('.menu-toggle');
        if (!panel || !toggle) {
          return;
        }
        const label = toggle.querySelector('.menu-toggle__label');
        const icon = toggle.querySelector('.icon');
        const searchButton = header.querySelector(
          '.header-search:not(.dark-mode-toggle)',
        );
        const scrim = panel.querySelector('.menu-panel__scrim');

        const setOpen = (open, focusSearch) => {
          panel.hidden = !open;
          toggle.setAttribute('aria-expanded', String(open));
          header.classList.toggle('is-open', open);
          if (label) {
            label.textContent = open ? Drupal.t('Close') : Drupal.t('Menu');
          }
          if (icon) {
            icon.classList.toggle('icon-x', open);
            icon.classList.toggle('icon-menu', !open);
          }
          if (open) {
            header.classList.remove('is-hidden');
            const target = focusSearch
              ? panel.querySelector('input[type="search"], input[type="text"]')
              : panel.querySelector('input, a, button');
            if (target) {
              target.focus();
            }
          }
        };

        // On smaller screens, the header has no room for the quick links and
        // the dark mode toggle: they move to the bottom of the panel, and back
        // to their place (a comment marks it) on larger screens.
        const extras = panel.querySelector('.menu-panel__extras');
        const movable = extras
          ? [
              header.querySelector(
                '.site-header__actions > .region--secondary-menu',
              ),
              header.querySelector('.site-header__actions > .dark-mode-toggle'),
            ]
              .filter(Boolean)
              .map((element) => {
                const marker = document.createComment('');
                element.before(marker);
                return { element, marker };
              })
          : [];
        const narrow = window.matchMedia('(max-width: 1023px)');
        const placeExtras = () => {
          movable.forEach(({ element, marker }) => {
            if (narrow.matches) {
              extras.append(element);
            } else {
              marker.after(element);
            }
          });
        };
        if (movable.length) {
          placeExtras();
          narrow.addEventListener('change', placeExtras);
        }

        toggle.addEventListener('click', () => setOpen(panel.hidden, false));
        if (searchButton) {
          searchButton.addEventListener('click', () => setOpen(true, true));
        }
        if (scrim) {
          scrim.addEventListener('click', () => setOpen(false, false));
        }
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && !panel.hidden) {
            setOpen(false, false);
            toggle.focus();
          }
        });
        document.addEventListener('click', (event) => {
          if (!panel.hidden && !header.contains(event.target)) {
            setOpen(false, false);
          }
        });
      });
    },
  };

  /**
   * Follows the scroll position: is-scrolled once the page is scrolled, and
   * is-hidden while scrolling down, so the header slides away and comes back
   * when scrolling up.
   *
   * is-scrolled makes the translucent header of a hero cover opaque again
   * (see css/header-overlay.css).
   */
  Drupal.behaviors.gutenbergBaseHeaderScroll = {
    attach(context) {
      once('header-scroll', '.site-header', context).forEach((header) => {
        let last = window.scrollY;
        const update = () => {
          const y = window.scrollY;
          header.classList.toggle('is-scrolled', y > 0);
          if (header.classList.contains('is-open')) {
            return;
          }
          header.classList.toggle('is-hidden', y > last && y > 10);
          last = y;
        };
        // The browser may restore a scroll position on load.
        update();
        window.addEventListener('scroll', update, { passive: true });
      });
    },
  };
})(Drupal, once);
