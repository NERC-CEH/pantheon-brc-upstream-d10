/**
 * @file
 * Registers a card block with block API version 2.
 *
 * Plain JS, so the test needs no build step. The settings mirror
 * blocks/card-v2/block.json, which the server side discovers.
 */

/**
 * @param {Object} wp The WordPress packages.
 */
((wp) => {
  const { registerBlockType } = wp.blocks;
  const { createElement: el } = wp.element;
  const { useBlockProps, useInnerBlocksProps, RichText } = wp.blockEditor;

  const CLASS_NAME = 'wp-block-gutenberg-test-card-v2';

  registerBlockType('gutenberg-test/card-v2', {
    apiVersion: 2,
    title: 'Card (API v2)',
    category: 'design',
    icon: 'id-alt',
    attributes: {
      title: {
        type: 'string',
        source: 'html',
        selector: `.${CLASS_NAME}__title`,
      },
      subhead: {
        type: 'string',
        source: 'html',
        selector: `.${CLASS_NAME}__subhead`,
      },
    },
    supports: {
      align: ['wide', 'full'],
      anchor: true,
      color: {
        background: true,
        text: true,
      },
      spacing: {
        padding: true,
        margin: true,
      },
      typography: {
        fontSize: true,
      },
    },
    styles: [
      { name: 'default', label: 'Default', isDefault: true },
      { name: 'outlined', label: 'Outlined' },
    ],
    edit: function Edit({ attributes, setAttributes }) {
      const blockProps = useBlockProps();
      const innerBlocksProps = useInnerBlocksProps(
        { className: `${CLASS_NAME}__body` },
        { template: [['core/paragraph']] },
      );

      return el(
        'div',
        blockProps,
        el(RichText, {
          tagName: 'h3',
          className: `${CLASS_NAME}__title`,
          placeholder: 'Title',
          value: attributes.title,
          onChange: (title) => setAttributes({ title }),
        }),
        el(RichText, {
          tagName: 'p',
          className: `${CLASS_NAME}__subhead`,
          placeholder: 'Subhead',
          value: attributes.subhead,
          onChange: (subhead) => setAttributes({ subhead }),
        }),
        el('div', innerBlocksProps),
      );
    },
    save: function Save({ attributes }) {
      return el(
        'div',
        useBlockProps.save(),
        el(RichText.Content, {
          tagName: 'h3',
          className: `${CLASS_NAME}__title`,
          value: attributes.title,
        }),
        el(RichText.Content, {
          tagName: 'p',
          className: `${CLASS_NAME}__subhead`,
          value: attributes.subhead,
        }),
        el(
          'div',
          useInnerBlocksProps.save({ className: `${CLASS_NAME}__body` }),
        ),
      );
    },
  });
})(window.wp);
