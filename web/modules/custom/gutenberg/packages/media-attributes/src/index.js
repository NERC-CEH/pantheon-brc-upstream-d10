/**
 * Media attributes — injects data-entity-uuid / data-entity-type attributes
 * into core media blocks so Drupal can resolve referenced media entities.
 *
 * Side-effect only: registers a `blocks.registerBlockType` filter on import.
 */

import { addFilter } from '@wordpress/hooks';
import { Component } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * Blocks whose media ID lives in a single attribute.
 * Map: blockName → attribute that holds the media ID.
 */
const SINGLE_MEDIA_BLOCKS = {
  'core/image': 'id',
  'core/video': 'id',
  'core/audio': 'id',
  'core/file': 'id',
  'core/media-text': 'mediaId',
  'core/cover': 'id',
};

/**
 * Fetch media metadata from the WP-compatible REST endpoint and return an
 * object of `data-*` attributes (e.g. `{ "data-entity-uuid": "…" }`).
 *
 * @param {number|string} mediaId The media ID.
 */
async function fetchMediaAttrs(mediaId) {
  if (!mediaId) {
    return {};
  }

  const media = await apiFetch({ path: `/wp/v2/media/${mediaId}` });

  if (!media || !media.data) {
    return {};
  }

  return Object.keys(media.data).reduce((attrs, key) => {
    attrs[`data-${key.toLowerCase().replace(/[^a-z0-9]/g, '-')}`] =
      media.data[key];
    return attrs;
  }, {});
}

/**
 * Higher-order component that wraps a block's Edit component.
 * When the media ID attribute changes it fetches the metadata and stores
 * it in `mediaAttrs`.
 *
 * @param {Function} EditComponent The Edit component of the block.
 * @param {string}   idAttribute   The attribute with the media ID.
 */
function withMediaAttrs(EditComponent, idAttribute = 'id') {
  return class extends Component {
    componentDidMount() {
      this.mediaId =
        this.props.attributes && this.props.attributes[idAttribute];
    }

    async componentDidUpdate() {
      const currentId =
        this.props.attributes && this.props.attributes[idAttribute];

      if (currentId !== this.mediaId) {
        this.mediaId = currentId;
        const attrs = await fetchMediaAttrs(this.mediaId);
        this.props.setAttributes({ mediaAttrs: attrs });
      }
    }

    render() {
      return <EditComponent {...this.props} />;
    }
  };
}

/**
 * Recursively walk a save-element tree and merge `attrs` into every <img>,
 * <video>, <audio>, or background-image element.
 *
 * @param {Object} element The save element.
 * @param {Object} attrs   The attributes to add.
 */
function applyAttrsToTree(element, attrs) {
  if (!element || !element.props) {
    return;
  }

  const { type, props } = element;

  if (
    type === 'img' ||
    type === 'video' ||
    type === 'audio' ||
    (props.style && props.style.backgroundImage)
  ) {
    element.props = { ...props, ...attrs };
  }

  const { children } = props;

  if (children && children.length) {
    for (const child of children) {
      applyAttrsToTree(child, attrs);
    }
  } else {
    applyAttrsToTree(children, attrs);
  }
}

/**
 * Wrap a block's save function to inject media attributes into the output.
 *
 * @param {Function} originalSave The save function of the block.
 * @param {Function} walkFn       Applies the attributes to the save element.
 */
function withSaveAttrs(originalSave, walkFn = applyAttrsToTree) {
  return function saveWithAttrs(blockProps) {
    const mediaAttrs =
      (blockProps &&
        blockProps.attributes &&
        blockProps.attributes.mediaAttrs) ||
      {};
    const tree = originalSave(blockProps);
    walkFn(tree, mediaAttrs);
    return tree;
  };
}

// -- Gallery-specific handling ------------------------------------------------

/**
 * Higher-order component for gallery blocks.
 * Tracks `ids` (array) and fetches per-image metadata.
 *
 * @param {Function} EditComponent The Edit component of the block.
 */
function withGalleryMediaAttrs(EditComponent) {
  return class extends Component {
    componentDidMount() {
      const { attributes } = this.props;
      this.ids = attributes && attributes.ids && attributes.ids.toString();
    }

    async componentDidUpdate() {
      const { attributes } = this.props;
      const currentIds =
        attributes && attributes.ids && attributes.ids.toString();

      if (currentIds !== this.ids) {
        this.ids = currentIds;
        const { ids, mediaAttrs } = attributes;
        const newAttrs = {};

        for (const id of ids) {
          if (id) {
            newAttrs[id] = mediaAttrs[id] || (await fetchMediaAttrs(id));
          }
        }

        this.props.setAttributes({ mediaAttrs: newAttrs });
      }
    }

    render() {
      return <EditComponent {...this.props} />;
    }
  };
}

/**
 * Recursively walk gallery save output and apply per-image attributes
 * keyed by `data-id`.
 *
 * @param {Object} element  The save element.
 * @param {Object} attrsMap The attributes of each image, keyed by media ID.
 */
function applyGalleryAttrsToTree(element, attrsMap) {
  if (!element || !element.props) {
    return;
  }

  const { type, props } = element;

  if ((type === 'img' || type === 'video') && props['data-id']) {
    const extra = attrsMap[props['data-id']] || {};
    element.props = { ...props, ...extra };
  }

  const { children } = props;

  if (children && children.length) {
    for (const child of children) {
      applyGalleryAttrsToTree(child, attrsMap);
    }
  } else {
    applyGalleryAttrsToTree(children, attrsMap);
  }
}

// -- Filter registration ------------------------------------------------------

addFilter(
  'blocks.registerBlockType',
  'drupal-gutenberg.media-attributes',
  (settings, name) => {
    // Single-media blocks
    if (SINGLE_MEDIA_BLOCKS[name]) {
      settings.attributes.mediaAttrs = { type: 'object', default: {} };

      const idAttr = SINGLE_MEDIA_BLOCKS[name];
      settings.edit = withMediaAttrs(settings.edit, idAttr);
      settings.save = withSaveAttrs(settings.save);
    }

    // Gallery block
    if (name === 'core/gallery') {
      settings.attributes.mediaAttrs = { type: 'object', default: {} };
      settings.edit = withGalleryMediaAttrs(settings.edit);
      settings.save = withSaveAttrs(settings.save, applyGalleryAttrsToTree);
    }

    return settings;
  },
);
