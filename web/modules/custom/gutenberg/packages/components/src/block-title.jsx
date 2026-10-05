import { withSelect } from '@wordpress/data';
import { getBlockType } from '@wordpress/blocks';

/**
 * Renders the block's configured title as a string, or empty if the title
 * cannot be determined.
 *
 * @example
 *
 * ```jsx
 * @param _ref
 * @param _ref
 * @param _ref
 * @param _ref
 * @param _ref
 * @param _ref
 * @param _ref
 * @param _ref
 * @param _ref
 * @param _ref
 * <BlockTitle clientId="afd1cb17-2c08-4e7a-91be-007ba7ddc3a1" />
 * ```
 *
 * @param {Object}  props
 * @param {?string} props.name Block name.
 *
 * @return {?string} Block title.
 */
function BlockTitle(_ref) {
  const { name } = _ref;

  if (!name) {
    return null;
  }

  const blockType = getBlockType(name);

  if (!blockType) {
    return null;
  }

  return blockType.title;
}

const BlockTitleWithSelect = withSelect((select, ownProps) => {
  const _select = select('core/block-editor');
  const { getBlockName } = _select;

  const { clientId } = ownProps;
  return {
    name: `${getBlockName(clientId)} - from Drupal!!!`,
  };
})(BlockTitle);

// Patch wp.blockEditor.BlockTitle with our version.
// This must run as a side effect when this module is imported.
if (typeof wp !== 'undefined' && wp.blockEditor) {
  try {
    Object.defineProperty(wp.blockEditor, 'BlockTitle', {
      get: () => BlockTitleWithSelect,
      configurable: true,
    });
  } catch (e) {
    // Webpack 5 module exports have non-configurable properties.
    // Replace the namespace with a proxy that intercepts BlockTitle access.
    const originalBlockEditor = wp.blockEditor;
    window.wp.blockEditor = new Proxy(originalBlockEditor, {
      get(target, prop) {
        if (prop === 'BlockTitle') {
          return BlockTitleWithSelect;
        }
        return Reflect.get(target, prop);
      },
    });
  }
}

export default BlockTitleWithSelect;
