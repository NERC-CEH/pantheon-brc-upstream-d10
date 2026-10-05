/**
 * @file
 * Cover block: the "Overlay the site header" option.
 *
 * A showcase of how a theme extends a core block, without changes to the
 * module and without touching the saved markup of the block. Three filters
 * of the WordPress hooks API, registered when this file loads (the core
 * blocks register after all scripts ran, so the filters are in place in
 * time):
 *
 * 1. blocks.registerBlockType adds an attribute to the block type. The
 *    filter gets the settings of a block type and its name, and returns the
 *    settings.
 * 2. editor.BlockEdit wraps the edit component of every block. For the
 *    cover, it renders the original component, then a component with the
 *    control in the block settings sidebar (InspectorControls), only while
 *    the cover is the first block of the content, where the option makes
 *    sense.
 * 3. editor.BlockListBlock wraps the component that renders the wrapper of
 *    every block in the canvas. For the cover, it adds an editor-only class,
 *    which css/editor-overrides.css uses to draw a placeholder of the site
 *    header at the top of the cover.
 *
 * The attribute is saved in the block comment of the content, e.g.
 * <!-- wp:cover {"headerOverlay":true} -->, which the theme reads on the
 * frontend: _gutenberg_base_has_header_overlay() in gutenberg_base.theme
 * adds the has-header-overlay class to <body>, and css/header-overlay.css
 * does the rest. The saved HTML of the block is not changed, so the content
 * stays valid when this script is not loaded, e.g. with another default
 * theme: the attribute is then unknown to the editor, and dropped on the
 * next save.
 *
 * To reuse the pattern for another block or option, change the constants
 * below and the condition of useIsFirstRootBlock(), and pick the frontend
 * side: a body class from PHP like here, or a class in the saved markup with
 * the blocks.getSaveContent.extraProps filter when the styling is local to
 * the block (the content then depends on the script being loaded).
 *
 * There is no build step: this file uses the wp.* globals of the editor, so
 * its library depends on the gutenberg/* libraries it needs, and it calls
 * wp.element.createElement instead of writing JSX.
 */

/* global Drupal, wp */
(function (Drupal, wp) {
  'use strict';

  const { addFilter } = wp.hooks;
  const { createElement: el, Fragment } = wp.element;
  const { createHigherOrderComponent } = wp.compose;
  const { useSelect } = wp.data;
  const { InspectorControls } = wp.blockEditor;
  const { PanelBody, ToggleControl } = wp.components;

  /** The block the option is added to. */
  const BLOCK = 'core/cover';
  /** The attribute that stores the option. */
  const ATTRIBUTE = 'headerOverlay';
  /** The editor-only class of a cover with the option on. */
  const CLASS = 'has-header-overlay';
  /** The block that places the node title in the content. */
  const TITLE_BLOCK = 'drupal/entity-title';

  /**
   * Whether a block is the first block of the content.
   *
   * Two selectors of the block editor store: getBlockRootClientId() is empty
   * for a root block, one that is not nested in another block, and
   * getBlockIndex() is its position among its siblings.
   *
   * @param {string} clientId The client ID of the block.
   *
   * @return {boolean} Whether the block is the first root block.
   */
  function useIsFirstRootBlock(clientId) {
    return useSelect(
      (select) => {
        const { getBlockRootClientId, getBlockIndex } =
          select('core/block-editor');
        return !getBlockRootClientId(clientId) && getBlockIndex(clientId) === 0;
      },
      [clientId],
    );
  }

  // 1. The attribute. The filter runs for every block type: the settings of
  // the other blocks are returned as they are.
  addFilter(
    'blocks.registerBlockType',
    'gutenberg_base/cover-header-overlay/attribute',
    (settings, name) => {
      if (name !== BLOCK) {
        return settings;
      }
      return {
        ...settings,
        attributes: {
          ...settings.attributes,
          [ATTRIBUTE]: { type: 'boolean', default: false },
        },
      };
    },
  );

  /**
   * The control in the block settings sidebar of a cover.
   *
   * A component of its own, so that its hooks run for every cover on every
   * render: hooks called conditionally in the wrapper below would break the
   * rules of hooks of React.
   *
   * @param {Object}   props               The props of the block edit component.
   * @param {string}   props.clientId      The client ID of the cover.
   * @param {Object}   props.attributes    The attributes of the cover.
   * @param {Function} props.setAttributes Sets attributes of the cover.
   *
   * @return {Object|null} The control, or null when the cover is not the
   *   first block.
   */
  function HeaderOverlayControl({ clientId, attributes, setAttributes }) {
    const isFirst = useIsFirstRootBlock(clientId);
    // The title has to be in the content for the cover to touch the header:
    // the theme renders a page header band above the content otherwise.
    const hasTitle = useSelect(
      (select) =>
        select('core/block-editor').getBlocksByName(TITLE_BLOCK).length > 0,
      [],
    );
    if (!isFirst) {
      return null;
    }
    return el(
      InspectorControls,
      null,
      el(
        PanelBody,
        { title: Drupal.t('Site header'), initialOpen: true },
        el(ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: Drupal.t('Overlay the site header'),
          checked: !!attributes[ATTRIBUTE],
          onChange: (value) => setAttributes({ [ATTRIBUTE]: value }),
          help: hasTitle
            ? Drupal.t(
                'The cover starts under the site header, which is translucent over it.',
              )
            : Drupal.t(
                'Add the Title block to the cover: otherwise the page header band renders above the content, and the site header is not overlaid.',
              ),
        }),
      ),
    );
  }

  // 2. The control. The filter gets the edit component of a block, and
  // returns a component that renders it, followed by the control for the
  // cover. The second argument names the wrapper in the React dev tools.
  addFilter(
    'editor.BlockEdit',
    'gutenberg_base/cover-header-overlay/control',
    createHigherOrderComponent(
      (BlockEdit) => (props) =>
        props.name === BLOCK
          ? el(
              Fragment,
              null,
              el(BlockEdit, props),
              el(HeaderOverlayControl, props),
            )
          : el(BlockEdit, props),
      'withHeaderOverlayControl',
    ),
  );

  /**
   * The wrapper of a cover in the canvas, with the editor-only class.
   *
   * @param {Object}   props                The props of the block list block
   *                                        component.
   * @param {Function} props.BlockListBlock The component that renders the
   *                                        wrapper, passed by the filter below.
   *
   * @return {Object} The wrapper.
   */
  function CoverListBlock({ BlockListBlock, ...props }) {
    const on =
      useIsFirstRootBlock(props.clientId) && !!props.attributes[ATTRIBUTE];
    const className = on
      ? [props.className, CLASS].filter(Boolean).join(' ')
      : props.className;
    return el(BlockListBlock, { ...props, className });
  }

  // 3. The class in the canvas. The filter gets the component that renders
  // the wrapper of every block in the canvas. The className prop it is given
  // ends up on the wrapper, which is the .wp-block-cover element itself for
  // a block of API version 3 like the cover.
  addFilter(
    'editor.BlockListBlock',
    'gutenberg_base/cover-header-overlay/class',
    createHigherOrderComponent(
      (BlockListBlock) => (props) =>
        props.name === BLOCK
          ? el(CoverListBlock, { ...props, BlockListBlock })
          : el(BlockListBlock, props),
      'withHeaderOverlayClass',
    ),
  );
})(Drupal, wp);
