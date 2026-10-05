"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/block-library/src/media-text/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_compose = require("@wordpress/compose");
var import_constants = require("./constants.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var v1ToV5ImageFillStyles = (url, focalPoint) => {
  return url ? {
    backgroundImage: `url(${url})`,
    backgroundPosition: focalPoint ? `${focalPoint.x * 100}% ${focalPoint.y * 100}%` : `50% 50%`
  } : {};
};
var v6ToV7ImageFillStyles = (url, focalPoint) => {
  return url ? {
    backgroundImage: `url(${url})`,
    backgroundPosition: focalPoint ? `${Math.round(focalPoint.x * 100)}% ${Math.round(
      focalPoint.y * 100
    )}%` : `50% 50%`
  } : {};
};
var DEFAULT_MEDIA_WIDTH = 50;
var noop = () => {
};
var migrateCustomColors = (attributes) => {
  if (!attributes.customBackgroundColor) {
    return attributes;
  }
  const style = {
    color: {
      background: attributes.customBackgroundColor
    }
  };
  const { customBackgroundColor, ...restAttributes } = attributes;
  return {
    ...restAttributes,
    style
  };
};
var migrateDefaultAlign = (attributes) => {
  if (attributes.align) {
    return attributes;
  }
  return {
    ...attributes,
    align: "wide"
  };
};
var v0Attributes = {
  align: {
    type: "string",
    default: "wide"
  },
  mediaAlt: {
    type: "string",
    source: "attribute",
    selector: "figure img",
    attribute: "alt",
    default: ""
  },
  mediaPosition: {
    type: "string",
    default: "left"
  },
  mediaId: {
    type: "number"
  },
  mediaType: {
    type: "string"
  },
  mediaWidth: {
    type: "number",
    default: 50
  },
  isStackedOnMobile: {
    type: "boolean",
    default: false
  }
};
var v4ToV5BlockAttributes = {
  ...v0Attributes,
  isStackedOnMobile: {
    type: "boolean",
    default: true
  },
  mediaUrl: {
    type: "string",
    source: "attribute",
    selector: "figure video,figure img",
    attribute: "src"
  },
  mediaLink: {
    type: "string"
  },
  linkDestination: {
    type: "string"
  },
  linkTarget: {
    type: "string",
    source: "attribute",
    selector: "figure a",
    attribute: "target"
  },
  href: {
    type: "string",
    source: "attribute",
    selector: "figure a",
    attribute: "href"
  },
  rel: {
    type: "string",
    source: "attribute",
    selector: "figure a",
    attribute: "rel"
  },
  linkClass: {
    type: "string",
    source: "attribute",
    selector: "figure a",
    attribute: "class"
  },
  mediaSizeSlug: {
    type: "string"
  },
  verticalAlignment: {
    type: "string"
  },
  imageFill: {
    type: "boolean"
  },
  focalPoint: {
    type: "object"
  }
};
var v6Attributes = {
  ...v4ToV5BlockAttributes,
  mediaAlt: {
    type: "string",
    source: "attribute",
    selector: "figure img",
    attribute: "alt",
    default: "",
    role: "content"
  },
  mediaId: {
    type: "number",
    role: "content"
  },
  mediaUrl: {
    type: "string",
    source: "attribute",
    selector: "figure video,figure img",
    attribute: "src",
    role: "content"
  },
  href: {
    type: "string",
    source: "attribute",
    selector: "figure a",
    attribute: "href",
    role: "content"
  },
  mediaType: {
    type: "string",
    role: "content"
  }
};
var v7Attributes = {
  ...v6Attributes,
  align: {
    type: "string",
    // v7 changed the default for the `align` attribute.
    default: "none"
  },
  // New attribute.
  useFeaturedImage: {
    type: "boolean",
    default: false
  }
};
var v4ToV5Supports = {
  anchor: true,
  align: ["wide", "full"],
  html: false,
  color: {
    gradients: true,
    link: true
  }
};
var v6Supports = {
  ...v4ToV5Supports,
  color: {
    gradients: true,
    link: true,
    __experimentalDefaultControls: {
      background: true,
      text: true
    }
  },
  spacing: {
    margin: true,
    padding: true
  },
  typography: {
    fontSize: true,
    lineHeight: true,
    __experimentalFontFamily: true,
    __experimentalFontWeight: true,
    __experimentalFontStyle: true,
    __experimentalTextTransform: true,
    __experimentalTextDecoration: true,
    __experimentalLetterSpacing: true,
    __experimentalDefaultControls: {
      fontSize: true
    }
  }
};
var v7Supports = {
  ...v6Supports,
  __experimentalBorder: {
    color: true,
    radius: true,
    style: true,
    width: true,
    __experimentalDefaultControls: {
      color: true,
      radius: true,
      style: true,
      width: true
    }
  },
  color: {
    gradients: true,
    heading: true,
    link: true,
    __experimentalDefaultControls: {
      background: true,
      text: true
    }
  },
  interactivity: {
    clientNavigation: true
  }
};
var v7 = {
  attributes: v7Attributes,
  supports: v7Supports,
  usesContext: ["postId", "postType"],
  save({ attributes }) {
    const {
      isStackedOnMobile,
      mediaAlt,
      mediaPosition,
      mediaType,
      mediaUrl,
      mediaWidth,
      mediaId,
      verticalAlignment,
      imageFill,
      focalPoint,
      linkClass,
      href,
      linkTarget,
      rel
    } = attributes;
    const mediaSizeSlug = attributes.mediaSizeSlug || import_constants.DEFAULT_MEDIA_SIZE_SLUG;
    const newRel = !rel ? void 0 : rel;
    const imageClasses = (0, import_clsx.default)({
      [`wp-image-${mediaId}`]: mediaId && mediaType === "image",
      [`size-${mediaSizeSlug}`]: mediaId && mediaType === "image"
    });
    let image = mediaUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: mediaUrl,
        alt: mediaAlt,
        className: imageClasses || null
      }
    ) : null;
    if (href) {
      image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          className: linkClass,
          href,
          target: linkTarget,
          rel: newRel,
          children: image
        }
      );
    }
    const mediaTypeRenders = {
      image: () => image,
      video: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", { controls: true, src: mediaUrl })
    };
    const className = (0, import_clsx.default)({
      "has-media-on-the-right": "right" === mediaPosition,
      "is-stacked-on-mobile": isStackedOnMobile,
      [`is-vertically-aligned-${verticalAlignment}`]: verticalAlignment,
      "is-image-fill": imageFill
    });
    const backgroundStyles = imageFill ? v6ToV7ImageFillStyles(mediaUrl, focalPoint) : {};
    let gridTemplateColumns;
    if (mediaWidth !== DEFAULT_MEDIA_WIDTH) {
      gridTemplateColumns = "right" === mediaPosition ? `auto ${mediaWidth}%` : `${mediaWidth}% auto`;
    }
    const style = {
      gridTemplateColumns
    };
    if ("right" === mediaPosition) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save({ className, style }), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "div",
          {
            ...import_block_editor.useInnerBlocksProps.save({
              className: "wp-block-media-text__content"
            })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "figure",
          {
            className: "wp-block-media-text__media",
            style: backgroundStyles,
            children: (mediaTypeRenders[mediaType] || noop)()
          }
        )
      ] });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save({ className, style }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "figure",
        {
          className: "wp-block-media-text__media",
          style: backgroundStyles,
          children: (mediaTypeRenders[mediaType] || noop)()
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          ...import_block_editor.useInnerBlocksProps.save({
            className: "wp-block-media-text__content"
          })
        }
      )
    ] });
  }
};
var v6 = {
  attributes: v6Attributes,
  supports: v6Supports,
  save({ attributes }) {
    const {
      isStackedOnMobile,
      mediaAlt,
      mediaPosition,
      mediaType,
      mediaUrl,
      mediaWidth,
      mediaId,
      verticalAlignment,
      imageFill,
      focalPoint,
      linkClass,
      href,
      linkTarget,
      rel
    } = attributes;
    const mediaSizeSlug = attributes.mediaSizeSlug || import_constants.DEFAULT_MEDIA_SIZE_SLUG;
    const newRel = !rel ? void 0 : rel;
    const imageClasses = (0, import_clsx.default)({
      [`wp-image-${mediaId}`]: mediaId && mediaType === "image",
      [`size-${mediaSizeSlug}`]: mediaId && mediaType === "image"
    });
    let image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: mediaUrl,
        alt: mediaAlt,
        className: imageClasses || null
      }
    );
    if (href) {
      image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          className: linkClass,
          href,
          target: linkTarget,
          rel: newRel,
          children: image
        }
      );
    }
    const mediaTypeRenders = {
      image: () => image,
      video: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", { controls: true, src: mediaUrl })
    };
    const className = (0, import_clsx.default)({
      "has-media-on-the-right": "right" === mediaPosition,
      "is-stacked-on-mobile": isStackedOnMobile,
      [`is-vertically-aligned-${verticalAlignment}`]: verticalAlignment,
      "is-image-fill": imageFill
    });
    const backgroundStyles = imageFill ? v6ToV7ImageFillStyles(mediaUrl, focalPoint) : {};
    let gridTemplateColumns;
    if (mediaWidth !== DEFAULT_MEDIA_WIDTH) {
      gridTemplateColumns = "right" === mediaPosition ? `auto ${mediaWidth}%` : `${mediaWidth}% auto`;
    }
    const style = {
      gridTemplateColumns
    };
    if ("right" === mediaPosition) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save({ className, style }), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "div",
          {
            ...import_block_editor.useInnerBlocksProps.save({
              className: "wp-block-media-text__content"
            })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "figure",
          {
            className: "wp-block-media-text__media",
            style: backgroundStyles,
            children: (mediaTypeRenders[mediaType] || noop)()
          }
        )
      ] });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save({ className, style }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "figure",
        {
          className: "wp-block-media-text__media",
          style: backgroundStyles,
          children: (mediaTypeRenders[mediaType] || noop)()
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          ...import_block_editor.useInnerBlocksProps.save({
            className: "wp-block-media-text__content"
          })
        }
      )
    ] });
  },
  migrate: migrateDefaultAlign,
  isEligible(attributes, innerBlocks, { block }) {
    const { attributes: finalizedAttributes } = block;
    return attributes.align === void 0 && !!finalizedAttributes.className?.includes("alignwide");
  }
};
var v5 = {
  attributes: v4ToV5BlockAttributes,
  supports: v4ToV5Supports,
  save({ attributes }) {
    const {
      isStackedOnMobile,
      mediaAlt,
      mediaPosition,
      mediaType,
      mediaUrl,
      mediaWidth,
      mediaId,
      verticalAlignment,
      imageFill,
      focalPoint,
      linkClass,
      href,
      linkTarget,
      rel
    } = attributes;
    const mediaSizeSlug = attributes.mediaSizeSlug || import_constants.DEFAULT_MEDIA_SIZE_SLUG;
    const newRel = !rel ? void 0 : rel;
    const imageClasses = (0, import_clsx.default)({
      [`wp-image-${mediaId}`]: mediaId && mediaType === "image",
      [`size-${mediaSizeSlug}`]: mediaId && mediaType === "image"
    });
    let image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: mediaUrl,
        alt: mediaAlt,
        className: imageClasses || null
      }
    );
    if (href) {
      image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          className: linkClass,
          href,
          target: linkTarget,
          rel: newRel,
          children: image
        }
      );
    }
    const mediaTypeRenders = {
      image: () => image,
      video: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", { controls: true, src: mediaUrl })
    };
    const className = (0, import_clsx.default)({
      "has-media-on-the-right": "right" === mediaPosition,
      "is-stacked-on-mobile": isStackedOnMobile,
      [`is-vertically-aligned-${verticalAlignment}`]: verticalAlignment,
      "is-image-fill": imageFill
    });
    const backgroundStyles = imageFill ? v1ToV5ImageFillStyles(mediaUrl, focalPoint) : {};
    let gridTemplateColumns;
    if (mediaWidth !== DEFAULT_MEDIA_WIDTH) {
      gridTemplateColumns = "right" === mediaPosition ? `auto ${mediaWidth}%` : `${mediaWidth}% auto`;
    }
    const style = {
      gridTemplateColumns
    };
    if ("right" === mediaPosition) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save({ className, style }), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "div",
          {
            ...import_block_editor.useInnerBlocksProps.save({
              className: "wp-block-media-text__content"
            })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "figure",
          {
            className: "wp-block-media-text__media",
            style: backgroundStyles,
            children: (mediaTypeRenders[mediaType] || noop)()
          }
        )
      ] });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save({ className, style }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "figure",
        {
          className: "wp-block-media-text__media",
          style: backgroundStyles,
          children: (mediaTypeRenders[mediaType] || noop)()
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          ...import_block_editor.useInnerBlocksProps.save({
            className: "wp-block-media-text__content"
          })
        }
      )
    ] });
  },
  migrate: migrateDefaultAlign
};
var v4 = {
  attributes: v4ToV5BlockAttributes,
  supports: v4ToV5Supports,
  save({ attributes }) {
    const {
      isStackedOnMobile,
      mediaAlt,
      mediaPosition,
      mediaType,
      mediaUrl,
      mediaWidth,
      mediaId,
      verticalAlignment,
      imageFill,
      focalPoint,
      linkClass,
      href,
      linkTarget,
      rel
    } = attributes;
    const mediaSizeSlug = attributes.mediaSizeSlug || import_constants.DEFAULT_MEDIA_SIZE_SLUG;
    const newRel = !rel ? void 0 : rel;
    const imageClasses = (0, import_clsx.default)({
      [`wp-image-${mediaId}`]: mediaId && mediaType === "image",
      [`size-${mediaSizeSlug}`]: mediaId && mediaType === "image"
    });
    let image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: mediaUrl,
        alt: mediaAlt,
        className: imageClasses || null
      }
    );
    if (href) {
      image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          className: linkClass,
          href,
          target: linkTarget,
          rel: newRel,
          children: image
        }
      );
    }
    const mediaTypeRenders = {
      image: () => image,
      video: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", { controls: true, src: mediaUrl })
    };
    const className = (0, import_clsx.default)({
      "has-media-on-the-right": "right" === mediaPosition,
      "is-stacked-on-mobile": isStackedOnMobile,
      [`is-vertically-aligned-${verticalAlignment}`]: verticalAlignment,
      "is-image-fill": imageFill
    });
    const backgroundStyles = imageFill ? v1ToV5ImageFillStyles(mediaUrl, focalPoint) : {};
    let gridTemplateColumns;
    if (mediaWidth !== DEFAULT_MEDIA_WIDTH) {
      gridTemplateColumns = "right" === mediaPosition ? `auto ${mediaWidth}%` : `${mediaWidth}% auto`;
    }
    const style = {
      gridTemplateColumns
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save({ className, style }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "figure",
        {
          className: "wp-block-media-text__media",
          style: backgroundStyles,
          children: (mediaTypeRenders[mediaType] || noop)()
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          ...import_block_editor.useInnerBlocksProps.save({
            className: "wp-block-media-text__content"
          })
        }
      )
    ] });
  },
  migrate: migrateDefaultAlign
};
var v3 = {
  attributes: {
    ...v0Attributes,
    isStackedOnMobile: {
      type: "boolean",
      default: true
    },
    backgroundColor: {
      type: "string"
    },
    customBackgroundColor: {
      type: "string"
    },
    mediaLink: {
      type: "string"
    },
    linkDestination: {
      type: "string"
    },
    linkTarget: {
      type: "string",
      source: "attribute",
      selector: "figure a",
      attribute: "target"
    },
    href: {
      type: "string",
      source: "attribute",
      selector: "figure a",
      attribute: "href"
    },
    rel: {
      type: "string",
      source: "attribute",
      selector: "figure a",
      attribute: "rel"
    },
    linkClass: {
      type: "string",
      source: "attribute",
      selector: "figure a",
      attribute: "class"
    },
    verticalAlignment: {
      type: "string"
    },
    imageFill: {
      type: "boolean"
    },
    focalPoint: {
      type: "object"
    }
  },
  migrate: (0, import_compose.compose)(migrateCustomColors, migrateDefaultAlign),
  save({ attributes }) {
    const {
      backgroundColor,
      customBackgroundColor,
      isStackedOnMobile,
      mediaAlt,
      mediaPosition,
      mediaType,
      mediaUrl,
      mediaWidth,
      mediaId,
      verticalAlignment,
      imageFill,
      focalPoint,
      linkClass,
      href,
      linkTarget,
      rel
    } = attributes;
    const newRel = !rel ? void 0 : rel;
    let image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: mediaUrl,
        alt: mediaAlt,
        className: mediaId && mediaType === "image" ? `wp-image-${mediaId}` : null
      }
    );
    if (href) {
      image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          className: linkClass,
          href,
          target: linkTarget,
          rel: newRel,
          children: image
        }
      );
    }
    const mediaTypeRenders = {
      image: () => image,
      video: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", { controls: true, src: mediaUrl })
    };
    const backgroundClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      backgroundColor
    );
    const className = (0, import_clsx.default)({
      "has-media-on-the-right": "right" === mediaPosition,
      "has-background": backgroundClass || customBackgroundColor,
      [backgroundClass]: backgroundClass,
      "is-stacked-on-mobile": isStackedOnMobile,
      [`is-vertically-aligned-${verticalAlignment}`]: verticalAlignment,
      "is-image-fill": imageFill
    });
    const backgroundStyles = imageFill ? v1ToV5ImageFillStyles(mediaUrl, focalPoint) : {};
    let gridTemplateColumns;
    if (mediaWidth !== DEFAULT_MEDIA_WIDTH) {
      gridTemplateColumns = "right" === mediaPosition ? `auto ${mediaWidth}%` : `${mediaWidth}% auto`;
    }
    const style = {
      backgroundColor: backgroundClass ? void 0 : customBackgroundColor,
      gridTemplateColumns
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className, style, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "figure",
        {
          className: "wp-block-media-text__media",
          style: backgroundStyles,
          children: (mediaTypeRenders[mediaType] || noop)()
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-media-text__content", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) })
    ] });
  }
};
var v2 = {
  attributes: {
    ...v0Attributes,
    backgroundColor: {
      type: "string"
    },
    customBackgroundColor: {
      type: "string"
    },
    mediaUrl: {
      type: "string",
      source: "attribute",
      selector: "figure video,figure img",
      attribute: "src"
    },
    verticalAlignment: {
      type: "string"
    },
    imageFill: {
      type: "boolean"
    },
    focalPoint: {
      type: "object"
    }
  },
  migrate: (0, import_compose.compose)(migrateCustomColors, migrateDefaultAlign),
  save({ attributes }) {
    const {
      backgroundColor,
      customBackgroundColor,
      isStackedOnMobile,
      mediaAlt,
      mediaPosition,
      mediaType,
      mediaUrl,
      mediaWidth,
      mediaId,
      verticalAlignment,
      imageFill,
      focalPoint
    } = attributes;
    const mediaTypeRenders = {
      image: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          src: mediaUrl,
          alt: mediaAlt,
          className: mediaId && mediaType === "image" ? `wp-image-${mediaId}` : null
        }
      ),
      video: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", { controls: true, src: mediaUrl })
    };
    const backgroundClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      backgroundColor
    );
    const className = (0, import_clsx.default)({
      "has-media-on-the-right": "right" === mediaPosition,
      [backgroundClass]: backgroundClass,
      "is-stacked-on-mobile": isStackedOnMobile,
      [`is-vertically-aligned-${verticalAlignment}`]: verticalAlignment,
      "is-image-fill": imageFill
    });
    const backgroundStyles = imageFill ? v1ToV5ImageFillStyles(mediaUrl, focalPoint) : {};
    let gridTemplateColumns;
    if (mediaWidth !== DEFAULT_MEDIA_WIDTH) {
      gridTemplateColumns = "right" === mediaPosition ? `auto ${mediaWidth}%` : `${mediaWidth}% auto`;
    }
    const style = {
      backgroundColor: backgroundClass ? void 0 : customBackgroundColor,
      gridTemplateColumns
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className, style, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "figure",
        {
          className: "wp-block-media-text__media",
          style: backgroundStyles,
          children: (mediaTypeRenders[mediaType] || noop)()
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-media-text__content", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) })
    ] });
  }
};
var v1 = {
  attributes: {
    ...v0Attributes,
    backgroundColor: {
      type: "string"
    },
    customBackgroundColor: {
      type: "string"
    },
    mediaUrl: {
      type: "string",
      source: "attribute",
      selector: "figure video,figure img",
      attribute: "src"
    }
  },
  migrate: migrateDefaultAlign,
  save({ attributes }) {
    const {
      backgroundColor,
      customBackgroundColor,
      isStackedOnMobile,
      mediaAlt,
      mediaPosition,
      mediaType,
      mediaUrl,
      mediaWidth
    } = attributes;
    const mediaTypeRenders = {
      image: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: mediaUrl, alt: mediaAlt }),
      video: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", { controls: true, src: mediaUrl })
    };
    const backgroundClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      backgroundColor
    );
    const className = (0, import_clsx.default)({
      "has-media-on-the-right": "right" === mediaPosition,
      [backgroundClass]: backgroundClass,
      "is-stacked-on-mobile": isStackedOnMobile
    });
    let gridTemplateColumns;
    if (mediaWidth !== DEFAULT_MEDIA_WIDTH) {
      gridTemplateColumns = "right" === mediaPosition ? `auto ${mediaWidth}%` : `${mediaWidth}% auto`;
    }
    const style = {
      backgroundColor: backgroundClass ? void 0 : customBackgroundColor,
      gridTemplateColumns
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className, style, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", { className: "wp-block-media-text__media", children: (mediaTypeRenders[mediaType] || noop)() }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-media-text__content", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) })
    ] });
  }
};
var deprecated_default = [v7, v6, v5, v4, v3, v2, v1];
//# sourceMappingURL=deprecated.cjs.map
