import { useRef, useEffect, useState, useCallback } from '@wordpress/element';
import { dispatch, select, useSelect } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel, store as editorStore } from '@wordpress/editor';

const PLUGIN_NAME = 'drupal-node-settings';

/**
 * Known sidebar panel sections with multiple selector strategies
 * for finding each <details> element inside #edit-advanced.
 */
const KNOWN_PANELS = [
  {
    name: 'menu-settings',
    title: 'Menu settings',
    selectors: ['[data-gutenberg-panel="menu"]', '#edit-menu'],
  },
  {
    name: 'url-alias',
    title: 'URL alias',
    selectors: [
      '[data-gutenberg-panel="url-alias"]',
      '#edit-path-0',
      '[data-drupal-selector="edit-path-0"]',
    ],
  },
  {
    name: 'authoring-info',
    title: 'Authoring information',
    selectors: ['[data-gutenberg-panel="author"]', '#edit-author'],
  },
  {
    name: 'promotion-options',
    title: 'Promotion options',
    selectors: ['[data-gutenberg-panel="options"]', '#edit-options'],
  },
];

/**
 * Finds a DOM element using the first matching selector from a list.
 */
const findElement = (root, selectors) => {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
};

/**
 * Returns top-level <details> elements within a container,
 * skipping any nested inside another <details>.
 */
const getTopLevelDetails = (container) =>
  [...container.querySelectorAll('details')].filter((el) => {
    let node = el.parentElement;
    while (node && node !== container) {
      if (node.tagName === 'DETAILS') return false;
      node = node.parentElement;
    }
    return true;
  });

/**
 * Component that adopts DOM elements into a PluginDocumentSettingPanel.
 *
 * Uses a callback ref instead of useRef + useEffect so that adoption
 * happens exactly when the inner <div> mounts in the DOM. This is
 * necessary because PluginDocumentSettingPanel renders children through
 * a Fill/Slot portal — a plain useEffect fires before the slot is ready.
 */
const DrupalAdoptedPanel = ({ name, title, elements }) => {
  const restoreRef = useRef([]);
  const initializedRef = useRef(false);

  const adoptRef = useCallback(
    (node) => {
      if (!elements || elements.length === 0) return;

      // Panel div unmounted (tab switch / panel collapse) —
      // restore elements to the form so they are included on submit.
      if (!node) {
        restoreRef.current.forEach(({ element, parent, next }) => {
          if (!parent) return;
          if (next && next.parentNode === parent) {
            parent.insertBefore(element, next);
          } else {
            parent.appendChild(element);
          }
        });
        return;
      }

      // Save original DOM positions only on the very first adoption
      // so we can restore them when the component fully unmounts.
      if (!initializedRef.current) {
        initializedRef.current = true;
        restoreRef.current = elements.map((el) => ({
          element: el,
          parent: el.parentNode,
          next: el.nextSibling,
        }));
      }

      // (Re-)adopt elements into the panel div. This runs on every
      // open because PanelBody unmounts children on collapse, which
      // detaches the old div. A new div is created on each reopen.
      elements.forEach((el) => {
        if (el.tagName === 'DETAILS') {
          el.setAttribute('open', '');
        }
        node.appendChild(el);
      });
    },
    [elements],
  );

  // Cleanup: restore elements to their original positions on unmount.
  useEffect(
    () => () => {
      restoreRef.current.forEach(({ element, parent, next }) => {
        if (!parent) return;
        if (next && next.parentNode === parent) {
          parent.insertBefore(element, next);
        } else {
          parent.appendChild(element);
        }
      });
    },
    [],
  );

  return (
    <PluginDocumentSettingPanel
      name={name}
      title={title}
      className="drupal-sidebar-panel"
    >
      <div className="drupal-panel__content" ref={adoptRef} />
    </PluginDocumentSettingPanel>
  );
};

/**
 * Discovers Drupal form sections inside #edit-advanced and renders
 * each as an individual Gutenberg sidebar panel.
 */
const DESIGN_POST_TYPES = [
  'wp_template',
  'wp_template_part',
  'wp_block',
  'wp_navigation',
];

const NodeDocumentSettings = () => {
  const currentPostType = useSelect(
    (s) => s(editorStore).getCurrentPostType(),
    [],
  );

  // Force the Status & visibility panel open after mount, when the
  // editor store is guaranteed to be ready. Module-level dispatches
  // can fire before the store has registered the panel ids.
  useEffect(() => {
    const panelId = `${PLUGIN_NAME}/status-visibility`;
    if (!select('core/editor').isEditorPanelOpened(panelId)) {
      dispatch('core/editor').toggleEditorPanelOpened(panelId);
    }
  }, []);

  // Discover panels synchronously — Drupal form elements are already
  // in the DOM when React mounts.
  const [panels] = useState(() => {
    const advanced = document.getElementById('edit-advanced');
    if (!advanced) return { status: [], details: [] };

    const claimed = new Set();
    const statusElements = [];
    const detailPanels = [];

    // 1. Status & visibility: adopt the meta header and revision info.
    const meta =
      advanced.querySelector('.entity-meta__header') ||
      advanced.querySelector('#edit-meta');
    if (meta) {
      statusElements.push(meta);
      claimed.add(meta);
    }

    const revision =
      advanced.querySelector(
        '[data-gutenberg-panel="revision_information"]',
      ) || document.getElementById('edit-revision-information');
    if (revision) {
      statusElements.push(revision);
      claimed.add(revision);
    }

    // 2. Known detail sections.
    KNOWN_PANELS.forEach(({ name, title, selectors }) => {
      const el = findElement(advanced, selectors);
      if (el && !claimed.has(el)) {
        detailPanels.push({ name, title, elements: [el] });
        claimed.add(el);
      }
    });

    // 3. Remaining top-level <details> — fallback for contributed modules.
    getTopLevelDetails(advanced).forEach((el) => {
      if (claimed.has(el)) return;
      const summary = el.querySelector(':scope > summary');
      const title = summary ? summary.textContent.trim() : 'Settings';
      const name = el.id
        ? el.id.replace(/^edit-/, '')
        : `additional-${claimed.size}`;
      detailPanels.push({ name, title, elements: [el] });
      claimed.add(el);
    });

    return { status: statusElements, details: detailPanels };
  });

  // Hide node form sections when editing a non-node entity (e.g. a
  // synced pattern via "Edit original").
  if (DESIGN_POST_TYPES.includes(currentPostType)) {
    return null;
  }

  if (panels.status.length === 0 && panels.details.length === 0) {
    return null;
  }

  return (
    <>
      {panels.status.length > 0 && (
        <DrupalAdoptedPanel
          name="status-visibility"
          title="Status & visibility"
          elements={panels.status}
        />
      )}
      {panels.details.map((panel) => (
        <DrupalAdoptedPanel
          key={panel.name}
          name={panel.name}
          title={panel.title}
          elements={panel.elements}
        />
      ))}
    </>
  );
};

registerPlugin(PLUGIN_NAME, {
  render: NodeDocumentSettings,
  icon: null,
});

// Note: Status & visibility panel is forced open via useEffect inside
// NodeDocumentSettings. Other panels use Gutenberg's default behavior
// (open until the user explicitly closes them).
// See https://github.com/WordPress/gutenberg/issues/22049
