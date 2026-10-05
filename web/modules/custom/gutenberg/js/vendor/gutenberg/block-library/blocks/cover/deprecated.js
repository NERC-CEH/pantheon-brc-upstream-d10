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

// packages/block-library/src/cover/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_blocks = require("@wordpress/blocks");
var import_block_editor = require("@wordpress/block-editor");
var import_i18n = require("@wordpress/i18n");
var import_compose = require("@wordpress/compose");
var import_shared = require("./shared.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function backgroundImageStyles(url) {
  return url ? { backgroundImage: `url(${url})` } : {};
}
function dimRatioToClassV1(ratio) {
  return ratio === 0 || ratio === 50 || !ratio ? null : "has-background-dim-" + 10 * Math.round(ratio / 10);
}
function migrateDimRatio(attributes) {
  return {
    ...attributes,
    dimRatio: !attributes.url ? 100 : attributes.dimRatio
  };
}
function migrateTag(attributes) {
  if (!attributes.tagName) {
    attributes = {
      ...attributes,
      tagName: "div"
    };
  }
  return {
    ...attributes
  };
}
var blockAttributes = {
  url: {
    type: "string"
  },
  id: {
    type: "number"
  },
  hasParallax: {
    type: "boolean",
    default: false
  },
  dimRatio: {
    type: "number",
    default: 50
  },
  overlayColor: {
    type: "string"
  },
  customOverlayColor: {
    type: "string"
  },
  backgroundType: {
    type: "string",
    default: "image"
  },
  focalPoint: {
    type: "object"
  }
};
var v8ToV11BlockAttributes = {
  url: {
    type: "string"
  },
  id: {
    type: "number"
  },
  alt: {
    type: "string",
    source: "attribute",
    selector: "img",
    attribute: "alt",
    default: ""
  },
  hasParallax: {
    type: "boolean",
    default: false
  },
  isRepeated: {
    type: "boolean",
    default: false
  },
  dimRatio: {
    type: "number",
    default: 100
  },
  overlayColor: {
    type: "string"
  },
  customOverlayColor: {
    type: "string"
  },
  backgroundType: {
    type: "string",
    default: "image"
  },
  focalPoint: {
    type: "object"
  },
  minHeight: {
    type: "number"
  },
  minHeightUnit: {
    type: "string"
  },
  gradient: {
    type: "string"
  },
  customGradient: {
    type: "string"
  },
  contentPosition: {
    type: "string"
  },
  isDark: {
    type: "boolean",
    default: true
  },
  allowedBlocks: {
    type: "array"
  },
  templateLock: {
    type: ["string", "boolean"],
    enum: ["all", "insert", false]
  }
};
var v12toV13BlockAttributes = {
  ...v8ToV11BlockAttributes,
  useFeaturedImage: {
    type: "boolean",
    default: false
  },
  tagName: {
    type: "string",
    default: "div"
  }
};
var v14BlockAttributes = {
  ...v12toV13BlockAttributes,
  isUserOverlayColor: {
    type: "boolean"
  },
  sizeSlug: {
    type: "string"
  },
  alt: {
    type: "string",
    default: ""
  }
};
var v7toV11BlockSupports = {
  anchor: true,
  align: true,
  html: false,
  spacing: {
    padding: true,
    __experimentalDefaultControls: {
      padding: true
    }
  },
  color: {
    __experimentalDuotone: "> .wp-block-cover__image-background, > .wp-block-cover__video-background",
    text: false,
    background: false
  }
};
var v12BlockSupports = {
  ...v7toV11BlockSupports,
  spacing: {
    padding: true,
    margin: ["top", "bottom"],
    blockGap: true,
    __experimentalDefaultControls: {
      padding: true,
      blockGap: true
    }
  },
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
    __experimentalDuotone: "> .wp-block-cover__image-background, > .wp-block-cover__video-background",
    heading: true,
    text: true,
    background: false,
    __experimentalSkipSerialization: ["gradients"],
    enableContrastChecker: false
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
  },
  layout: {
    allowJustification: false
  }
};
var v14BlockSupports = {
  ...v12BlockSupports,
  shadow: true,
  dimensions: {
    aspectRatio: true
  },
  interactivity: {
    clientNavigation: true
  }
};
var v14 = {
  attributes: v14BlockAttributes,
  supports: v14BlockSupports,
  save({ attributes }) {
    const {
      backgroundType,
      gradient,
      contentPosition,
      customGradient,
      customOverlayColor,
      dimRatio,
      focalPoint,
      useFeaturedImage,
      hasParallax,
      isDark,
      isRepeated,
      overlayColor,
      url,
      alt,
      id,
      minHeight: minHeightProp,
      minHeightUnit,
      tagName: Tag,
      sizeSlug
    } = attributes;
    const overlayColorClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      overlayColor
    );
    const gradientClass = (0, import_block_editor.__experimentalGetGradientClass)(gradient);
    const minHeight = minHeightProp && minHeightUnit ? `${minHeightProp}${minHeightUnit}` : minHeightProp;
    const isImageBackground = import_shared.IMAGE_BACKGROUND_TYPE === backgroundType;
    const isVideoBackground = import_shared.VIDEO_BACKGROUND_TYPE === backgroundType;
    const isImgElement = !(hasParallax || isRepeated);
    const style = {
      minHeight: minHeight || void 0
    };
    const bgStyle = {
      backgroundColor: !overlayColorClass ? customOverlayColor : void 0,
      background: customGradient ? customGradient : void 0
    };
    const objectPosition = (
      // prettier-ignore
      focalPoint && isImgElement ? (0, import_shared.mediaPosition)(focalPoint) : void 0
    );
    const backgroundImage = url ? `url(${url})` : void 0;
    const backgroundPosition = (0, import_shared.mediaPosition)(focalPoint);
    const classes = (0, import_clsx.default)(
      {
        "is-light": !isDark,
        "has-parallax": hasParallax,
        "is-repeated": isRepeated,
        "has-custom-content-position": !(0, import_shared.isContentPositionCenter)(contentPosition)
      },
      (0, import_shared.getPositionClassName)(contentPosition)
    );
    const imgClasses = (0, import_clsx.default)(
      "wp-block-cover__image-background",
      id ? `wp-image-${id}` : null,
      {
        [`size-${sizeSlug}`]: sizeSlug,
        "has-parallax": hasParallax,
        "is-repeated": isRepeated
      }
    );
    const gradientValue = gradient || customGradient;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tag, { ...import_block_editor.useBlockProps.save({ className: classes, style }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          "aria-hidden": "true",
          className: (0, import_clsx.default)(
            "wp-block-cover__background",
            overlayColorClass,
            (0, import_shared.dimRatioToClass)(dimRatio),
            {
              "has-background-dim": dimRatio !== void 0,
              // For backwards compatibility. Former versions of the Cover Block applied
              // `.wp-block-cover__gradient-background` in the presence of
              // media, a gradient and a dim.
              "wp-block-cover__gradient-background": url && gradientValue && dimRatio !== 0,
              "has-background-gradient": gradientValue,
              [gradientClass]: gradientClass
            }
          ),
          style: bgStyle
        }
      ),
      !useFeaturedImage && isImageBackground && url && (isImgElement ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          className: imgClasses,
          alt,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          role: alt ? "img" : void 0,
          "aria-label": alt ? alt : void 0,
          className: imgClasses,
          style: { backgroundPosition, backgroundImage }
        }
      )),
      isVideoBackground && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "video",
        {
          className: (0, import_clsx.default)(
            "wp-block-cover__video-background",
            "intrinsic-ignore"
          ),
          autoPlay: true,
          muted: true,
          loop: true,
          playsInline: true,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          ...import_block_editor.useInnerBlocksProps.save({
            className: "wp-block-cover__inner-container"
          })
        }
      )
    ] });
  }
};
var v13 = {
  attributes: v12toV13BlockAttributes,
  supports: v12BlockSupports,
  save({ attributes }) {
    const {
      backgroundType,
      gradient,
      contentPosition,
      customGradient,
      customOverlayColor,
      dimRatio,
      focalPoint,
      useFeaturedImage,
      hasParallax,
      isDark,
      isRepeated,
      overlayColor,
      url,
      alt,
      id,
      minHeight: minHeightProp,
      minHeightUnit,
      tagName: Tag
    } = attributes;
    const overlayColorClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      overlayColor
    );
    const gradientClass = (0, import_block_editor.__experimentalGetGradientClass)(gradient);
    const minHeight = minHeightProp && minHeightUnit ? `${minHeightProp}${minHeightUnit}` : minHeightProp;
    const isImageBackground = import_shared.IMAGE_BACKGROUND_TYPE === backgroundType;
    const isVideoBackground = import_shared.VIDEO_BACKGROUND_TYPE === backgroundType;
    const isImgElement = !(hasParallax || isRepeated);
    const style = {
      minHeight: minHeight || void 0
    };
    const bgStyle = {
      backgroundColor: !overlayColorClass ? customOverlayColor : void 0,
      background: customGradient ? customGradient : void 0
    };
    const objectPosition = (
      // prettier-ignore
      focalPoint && isImgElement ? (0, import_shared.mediaPosition)(focalPoint) : void 0
    );
    const backgroundImage = url ? `url(${url})` : void 0;
    const backgroundPosition = (0, import_shared.mediaPosition)(focalPoint);
    const classes = (0, import_clsx.default)(
      {
        "is-light": !isDark,
        "has-parallax": hasParallax,
        "is-repeated": isRepeated,
        "has-custom-content-position": !(0, import_shared.isContentPositionCenter)(contentPosition)
      },
      (0, import_shared.getPositionClassName)(contentPosition)
    );
    const imgClasses = (0, import_clsx.default)(
      "wp-block-cover__image-background",
      id ? `wp-image-${id}` : null,
      {
        "has-parallax": hasParallax,
        "is-repeated": isRepeated
      }
    );
    const gradientValue = gradient || customGradient;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tag, { ...import_block_editor.useBlockProps.save({ className: classes, style }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          "aria-hidden": "true",
          className: (0, import_clsx.default)(
            "wp-block-cover__background",
            overlayColorClass,
            (0, import_shared.dimRatioToClass)(dimRatio),
            {
              "has-background-dim": dimRatio !== void 0,
              // For backwards compatibility. Former versions of the Cover Block applied
              // `.wp-block-cover__gradient-background` in the presence of
              // media, a gradient and a dim.
              "wp-block-cover__gradient-background": url && gradientValue && dimRatio !== 0,
              "has-background-gradient": gradientValue,
              [gradientClass]: gradientClass
            }
          ),
          style: bgStyle
        }
      ),
      !useFeaturedImage && isImageBackground && url && (isImgElement ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          className: imgClasses,
          alt,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          role: "img",
          className: imgClasses,
          style: { backgroundPosition, backgroundImage }
        }
      )),
      isVideoBackground && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "video",
        {
          className: (0, import_clsx.default)(
            "wp-block-cover__video-background",
            "intrinsic-ignore"
          ),
          autoPlay: true,
          muted: true,
          loop: true,
          playsInline: true,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          ...import_block_editor.useInnerBlocksProps.save({
            className: "wp-block-cover__inner-container"
          })
        }
      )
    ] });
  }
};
var v12 = {
  attributes: v12toV13BlockAttributes,
  supports: v12BlockSupports,
  isEligible(attributes) {
    return (attributes.customOverlayColor !== void 0 || attributes.overlayColor !== void 0) && attributes.isUserOverlayColor === void 0;
  },
  migrate(attributes) {
    return {
      ...attributes,
      isUserOverlayColor: true
    };
  },
  save({ attributes }) {
    const {
      backgroundType,
      gradient,
      contentPosition,
      customGradient,
      customOverlayColor,
      dimRatio,
      focalPoint,
      useFeaturedImage,
      hasParallax,
      isDark,
      isRepeated,
      overlayColor,
      url,
      alt,
      id,
      minHeight: minHeightProp,
      minHeightUnit,
      tagName: Tag
    } = attributes;
    const overlayColorClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      overlayColor
    );
    const gradientClass = (0, import_block_editor.__experimentalGetGradientClass)(gradient);
    const minHeight = minHeightProp && minHeightUnit ? `${minHeightProp}${minHeightUnit}` : minHeightProp;
    const isImageBackground = import_shared.IMAGE_BACKGROUND_TYPE === backgroundType;
    const isVideoBackground = import_shared.VIDEO_BACKGROUND_TYPE === backgroundType;
    const isImgElement = !(hasParallax || isRepeated);
    const style = {
      minHeight: minHeight || void 0
    };
    const bgStyle = {
      backgroundColor: !overlayColorClass ? customOverlayColor : void 0,
      background: customGradient ? customGradient : void 0
    };
    const objectPosition = (
      // prettier-ignore
      focalPoint && isImgElement ? (0, import_shared.mediaPosition)(focalPoint) : void 0
    );
    const backgroundImage = url ? `url(${url})` : void 0;
    const backgroundPosition = (0, import_shared.mediaPosition)(focalPoint);
    const classes = (0, import_clsx.default)(
      {
        "is-light": !isDark,
        "has-parallax": hasParallax,
        "is-repeated": isRepeated,
        "has-custom-content-position": !(0, import_shared.isContentPositionCenter)(contentPosition)
      },
      (0, import_shared.getPositionClassName)(contentPosition)
    );
    const imgClasses = (0, import_clsx.default)(
      "wp-block-cover__image-background",
      id ? `wp-image-${id}` : null,
      {
        "has-parallax": hasParallax,
        "is-repeated": isRepeated
      }
    );
    const gradientValue = gradient || customGradient;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tag, { ...import_block_editor.useBlockProps.save({ className: classes, style }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          "aria-hidden": "true",
          className: (0, import_clsx.default)(
            "wp-block-cover__background",
            overlayColorClass,
            (0, import_shared.dimRatioToClass)(dimRatio),
            {
              "has-background-dim": dimRatio !== void 0,
              // For backwards compatibility. Former versions of the Cover Block applied
              // `.wp-block-cover__gradient-background` in the presence of
              // media, a gradient and a dim.
              "wp-block-cover__gradient-background": url && gradientValue && dimRatio !== 0,
              "has-background-gradient": gradientValue,
              [gradientClass]: gradientClass
            }
          ),
          style: bgStyle
        }
      ),
      !useFeaturedImage && isImageBackground && url && (isImgElement ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          className: imgClasses,
          alt,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          role: "img",
          className: imgClasses,
          style: { backgroundPosition, backgroundImage }
        }
      )),
      isVideoBackground && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "video",
        {
          className: (0, import_clsx.default)(
            "wp-block-cover__video-background",
            "intrinsic-ignore"
          ),
          autoPlay: true,
          muted: true,
          loop: true,
          playsInline: true,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          ...import_block_editor.useInnerBlocksProps.save({
            className: "wp-block-cover__inner-container"
          })
        }
      )
    ] });
  }
};
var v11 = {
  attributes: v8ToV11BlockAttributes,
  supports: v7toV11BlockSupports,
  save({ attributes }) {
    const {
      backgroundType,
      gradient,
      contentPosition,
      customGradient,
      customOverlayColor,
      dimRatio,
      focalPoint,
      useFeaturedImage,
      hasParallax,
      isDark,
      isRepeated,
      overlayColor,
      url,
      alt,
      id,
      minHeight: minHeightProp,
      minHeightUnit
    } = attributes;
    const overlayColorClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      overlayColor
    );
    const gradientClass = (0, import_block_editor.__experimentalGetGradientClass)(gradient);
    const minHeight = minHeightProp && minHeightUnit ? `${minHeightProp}${minHeightUnit}` : minHeightProp;
    const isImageBackground = import_shared.IMAGE_BACKGROUND_TYPE === backgroundType;
    const isVideoBackground = import_shared.VIDEO_BACKGROUND_TYPE === backgroundType;
    const isImgElement = !(hasParallax || isRepeated);
    const style = {
      minHeight: minHeight || void 0
    };
    const bgStyle = {
      backgroundColor: !overlayColorClass ? customOverlayColor : void 0,
      background: customGradient ? customGradient : void 0
    };
    const objectPosition = (
      // prettier-ignore
      focalPoint && isImgElement ? (0, import_shared.mediaPosition)(focalPoint) : void 0
    );
    const backgroundImage = url ? `url(${url})` : void 0;
    const backgroundPosition = (0, import_shared.mediaPosition)(focalPoint);
    const classes = (0, import_clsx.default)(
      {
        "is-light": !isDark,
        "has-parallax": hasParallax,
        "is-repeated": isRepeated,
        "has-custom-content-position": !(0, import_shared.isContentPositionCenter)(contentPosition)
      },
      (0, import_shared.getPositionClassName)(contentPosition)
    );
    const imgClasses = (0, import_clsx.default)(
      "wp-block-cover__image-background",
      id ? `wp-image-${id}` : null,
      {
        "has-parallax": hasParallax,
        "is-repeated": isRepeated
      }
    );
    const gradientValue = gradient || customGradient;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save({ className: classes, style }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          "aria-hidden": "true",
          className: (0, import_clsx.default)(
            "wp-block-cover__background",
            overlayColorClass,
            (0, import_shared.dimRatioToClass)(dimRatio),
            {
              "has-background-dim": dimRatio !== void 0,
              // For backwards compatibility. Former versions of the Cover Block applied
              // `.wp-block-cover__gradient-background` in the presence of
              // media, a gradient and a dim.
              "wp-block-cover__gradient-background": url && gradientValue && dimRatio !== 0,
              "has-background-gradient": gradientValue,
              [gradientClass]: gradientClass
            }
          ),
          style: bgStyle
        }
      ),
      !useFeaturedImage && isImageBackground && url && (isImgElement ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          className: imgClasses,
          alt,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          role: "img",
          className: imgClasses,
          style: { backgroundPosition, backgroundImage }
        }
      )),
      isVideoBackground && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "video",
        {
          className: (0, import_clsx.default)(
            "wp-block-cover__video-background",
            "intrinsic-ignore"
          ),
          autoPlay: true,
          muted: true,
          loop: true,
          playsInline: true,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          ...import_block_editor.useInnerBlocksProps.save({
            className: "wp-block-cover__inner-container"
          })
        }
      )
    ] });
  },
  migrate: migrateTag
};
var v10 = {
  attributes: v8ToV11BlockAttributes,
  supports: v7toV11BlockSupports,
  save({ attributes }) {
    const {
      backgroundType,
      gradient,
      contentPosition,
      customGradient,
      customOverlayColor,
      dimRatio,
      focalPoint,
      useFeaturedImage,
      hasParallax,
      isDark,
      isRepeated,
      overlayColor,
      url,
      alt,
      id,
      minHeight: minHeightProp,
      minHeightUnit
    } = attributes;
    const overlayColorClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      overlayColor
    );
    const gradientClass = (0, import_block_editor.__experimentalGetGradientClass)(gradient);
    const minHeight = minHeightProp && minHeightUnit ? `${minHeightProp}${minHeightUnit}` : minHeightProp;
    const isImageBackground = import_shared.IMAGE_BACKGROUND_TYPE === backgroundType;
    const isVideoBackground = import_shared.VIDEO_BACKGROUND_TYPE === backgroundType;
    const isImgElement = !(hasParallax || isRepeated);
    const style = {
      ...isImageBackground && !isImgElement && !useFeaturedImage ? backgroundImageStyles(url) : {},
      minHeight: minHeight || void 0
    };
    const bgStyle = {
      backgroundColor: !overlayColorClass ? customOverlayColor : void 0,
      background: customGradient ? customGradient : void 0
    };
    const objectPosition = (
      // prettier-ignore
      focalPoint && isImgElement ? `${Math.round(focalPoint.x * 100)}% ${Math.round(focalPoint.y * 100)}%` : void 0
    );
    const classes = (0, import_clsx.default)(
      {
        "is-light": !isDark,
        "has-parallax": hasParallax,
        "is-repeated": isRepeated,
        "has-custom-content-position": !(0, import_shared.isContentPositionCenter)(contentPosition)
      },
      (0, import_shared.getPositionClassName)(contentPosition)
    );
    const gradientValue = gradient || customGradient;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save({ className: classes, style }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          "aria-hidden": "true",
          className: (0, import_clsx.default)(
            "wp-block-cover__background",
            overlayColorClass,
            (0, import_shared.dimRatioToClass)(dimRatio),
            {
              "has-background-dim": dimRatio !== void 0,
              // For backwards compatibility. Former versions of the Cover Block applied
              // `.wp-block-cover__gradient-background` in the presence of
              // media, a gradient and a dim.
              "wp-block-cover__gradient-background": url && gradientValue && dimRatio !== 0,
              "has-background-gradient": gradientValue,
              [gradientClass]: gradientClass
            }
          ),
          style: bgStyle
        }
      ),
      !useFeaturedImage && isImageBackground && isImgElement && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          className: (0, import_clsx.default)(
            "wp-block-cover__image-background",
            id ? `wp-image-${id}` : null
          ),
          alt,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ),
      isVideoBackground && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "video",
        {
          className: (0, import_clsx.default)(
            "wp-block-cover__video-background",
            "intrinsic-ignore"
          ),
          autoPlay: true,
          muted: true,
          loop: true,
          playsInline: true,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          ...import_block_editor.useInnerBlocksProps.save({
            className: "wp-block-cover__inner-container"
          })
        }
      )
    ] });
  },
  migrate: migrateTag
};
var v9 = {
  attributes: v8ToV11BlockAttributes,
  supports: v7toV11BlockSupports,
  save({ attributes }) {
    const {
      backgroundType,
      gradient,
      contentPosition,
      customGradient,
      customOverlayColor,
      dimRatio,
      focalPoint,
      hasParallax,
      isDark,
      isRepeated,
      overlayColor,
      url,
      alt,
      id,
      minHeight: minHeightProp,
      minHeightUnit
    } = attributes;
    const overlayColorClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      overlayColor
    );
    const gradientClass = (0, import_block_editor.__experimentalGetGradientClass)(gradient);
    const minHeight = minHeightUnit ? `${minHeightProp}${minHeightUnit}` : minHeightProp;
    const isImageBackground = import_shared.IMAGE_BACKGROUND_TYPE === backgroundType;
    const isVideoBackground = import_shared.VIDEO_BACKGROUND_TYPE === backgroundType;
    const isImgElement = !(hasParallax || isRepeated);
    const style = {
      ...isImageBackground && !isImgElement ? backgroundImageStyles(url) : {},
      minHeight: minHeight || void 0
    };
    const bgStyle = {
      backgroundColor: !overlayColorClass ? customOverlayColor : void 0,
      background: customGradient ? customGradient : void 0
    };
    const objectPosition = (
      // prettier-ignore
      focalPoint && isImgElement ? `${Math.round(focalPoint.x * 100)}% ${Math.round(focalPoint.y * 100)}%` : void 0
    );
    const classes = (0, import_clsx.default)(
      {
        "is-light": !isDark,
        "has-parallax": hasParallax,
        "is-repeated": isRepeated,
        "has-custom-content-position": !(0, import_shared.isContentPositionCenter)(contentPosition)
      },
      (0, import_shared.getPositionClassName)(contentPosition)
    );
    const gradientValue = gradient || customGradient;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save({ className: classes, style }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          "aria-hidden": "true",
          className: (0, import_clsx.default)(
            "wp-block-cover__background",
            overlayColorClass,
            (0, import_shared.dimRatioToClass)(dimRatio),
            {
              "has-background-dim": dimRatio !== void 0,
              // For backwards compatibility. Former versions of the Cover Block applied
              // `.wp-block-cover__gradient-background` in the presence of
              // media, a gradient and a dim.
              "wp-block-cover__gradient-background": url && gradientValue && dimRatio !== 0,
              "has-background-gradient": gradientValue,
              [gradientClass]: gradientClass
            }
          ),
          style: bgStyle
        }
      ),
      isImageBackground && isImgElement && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          className: (0, import_clsx.default)(
            "wp-block-cover__image-background",
            id ? `wp-image-${id}` : null
          ),
          alt,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ),
      isVideoBackground && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "video",
        {
          className: (0, import_clsx.default)(
            "wp-block-cover__video-background",
            "intrinsic-ignore"
          ),
          autoPlay: true,
          muted: true,
          loop: true,
          playsInline: true,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          ...import_block_editor.useInnerBlocksProps.save({
            className: "wp-block-cover__inner-container"
          })
        }
      )
    ] });
  },
  migrate: migrateTag
};
var v8 = {
  attributes: v8ToV11BlockAttributes,
  supports: v7toV11BlockSupports,
  save({ attributes }) {
    const {
      backgroundType,
      gradient,
      contentPosition,
      customGradient,
      customOverlayColor,
      dimRatio,
      focalPoint,
      hasParallax,
      isDark,
      isRepeated,
      overlayColor,
      url,
      alt,
      id,
      minHeight: minHeightProp,
      minHeightUnit
    } = attributes;
    const overlayColorClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      overlayColor
    );
    const gradientClass = (0, import_block_editor.__experimentalGetGradientClass)(gradient);
    const minHeight = minHeightUnit ? `${minHeightProp}${minHeightUnit}` : minHeightProp;
    const isImageBackground = import_shared.IMAGE_BACKGROUND_TYPE === backgroundType;
    const isVideoBackground = import_shared.VIDEO_BACKGROUND_TYPE === backgroundType;
    const isImgElement = !(hasParallax || isRepeated);
    const style = {
      ...isImageBackground && !isImgElement ? backgroundImageStyles(url) : {},
      minHeight: minHeight || void 0
    };
    const bgStyle = {
      backgroundColor: !overlayColorClass ? customOverlayColor : void 0,
      background: customGradient ? customGradient : void 0
    };
    const objectPosition = (
      // prettier-ignore
      focalPoint && isImgElement ? `${Math.round(focalPoint.x * 100)}% ${Math.round(focalPoint.y * 100)}%` : void 0
    );
    const classes = (0, import_clsx.default)(
      {
        "is-light": !isDark,
        "has-parallax": hasParallax,
        "is-repeated": isRepeated,
        "has-custom-content-position": !(0, import_shared.isContentPositionCenter)(contentPosition)
      },
      (0, import_shared.getPositionClassName)(contentPosition)
    );
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save({ className: classes, style }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          "aria-hidden": "true",
          className: (0, import_clsx.default)(
            overlayColorClass,
            (0, import_shared.dimRatioToClass)(dimRatio),
            "wp-block-cover__gradient-background",
            gradientClass,
            {
              "has-background-dim": dimRatio !== void 0,
              "has-background-gradient": gradient || customGradient,
              [gradientClass]: !url && gradientClass
            }
          ),
          style: bgStyle
        }
      ),
      isImageBackground && isImgElement && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          className: (0, import_clsx.default)(
            "wp-block-cover__image-background",
            id ? `wp-image-${id}` : null
          ),
          alt,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ),
      isVideoBackground && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "video",
        {
          className: (0, import_clsx.default)(
            "wp-block-cover__video-background",
            "intrinsic-ignore"
          ),
          autoPlay: true,
          muted: true,
          loop: true,
          playsInline: true,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          ...import_block_editor.useInnerBlocksProps.save({
            className: "wp-block-cover__inner-container"
          })
        }
      )
    ] });
  },
  migrate: migrateTag
};
var v7 = {
  attributes: {
    ...blockAttributes,
    isRepeated: {
      type: "boolean",
      default: false
    },
    minHeight: {
      type: "number"
    },
    minHeightUnit: {
      type: "string"
    },
    gradient: {
      type: "string"
    },
    customGradient: {
      type: "string"
    },
    contentPosition: {
      type: "string"
    },
    alt: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "alt",
      default: ""
    }
  },
  supports: v7toV11BlockSupports,
  save({ attributes }) {
    const {
      backgroundType,
      gradient,
      contentPosition,
      customGradient,
      customOverlayColor,
      dimRatio,
      focalPoint,
      hasParallax,
      isRepeated,
      overlayColor,
      url,
      alt,
      id,
      minHeight: minHeightProp,
      minHeightUnit
    } = attributes;
    const overlayColorClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      overlayColor
    );
    const gradientClass = (0, import_block_editor.__experimentalGetGradientClass)(gradient);
    const minHeight = minHeightUnit ? `${minHeightProp}${minHeightUnit}` : minHeightProp;
    const isImageBackground = import_shared.IMAGE_BACKGROUND_TYPE === backgroundType;
    const isVideoBackground = import_shared.VIDEO_BACKGROUND_TYPE === backgroundType;
    const isImgElement = !(hasParallax || isRepeated);
    const style = {
      ...isImageBackground && !isImgElement ? backgroundImageStyles(url) : {},
      backgroundColor: !overlayColorClass ? customOverlayColor : void 0,
      background: customGradient && !url ? customGradient : void 0,
      minHeight: minHeight || void 0
    };
    const objectPosition = (
      // prettier-ignore
      focalPoint && isImgElement ? `${Math.round(focalPoint.x * 100)}% ${Math.round(focalPoint.y * 100)}%` : void 0
    );
    const classes = (0, import_clsx.default)(
      dimRatioToClassV1(dimRatio),
      overlayColorClass,
      {
        "has-background-dim": dimRatio !== 0,
        "has-parallax": hasParallax,
        "is-repeated": isRepeated,
        "has-background-gradient": gradient || customGradient,
        [gradientClass]: !url && gradientClass,
        "has-custom-content-position": !(0, import_shared.isContentPositionCenter)(contentPosition)
      },
      (0, import_shared.getPositionClassName)(contentPosition)
    );
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save({ className: classes, style }), children: [
      url && (gradient || customGradient) && dimRatio !== 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          "aria-hidden": "true",
          className: (0, import_clsx.default)(
            "wp-block-cover__gradient-background",
            gradientClass
          ),
          style: customGradient ? { background: customGradient } : void 0
        }
      ),
      isImageBackground && isImgElement && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          className: (0, import_clsx.default)(
            "wp-block-cover__image-background",
            id ? `wp-image-${id}` : null
          ),
          alt,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ),
      isVideoBackground && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "video",
        {
          className: (0, import_clsx.default)(
            "wp-block-cover__video-background",
            "intrinsic-ignore"
          ),
          autoPlay: true,
          muted: true,
          loop: true,
          playsInline: true,
          src: url,
          style: { objectPosition },
          "data-object-fit": "cover",
          "data-object-position": objectPosition
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-cover__inner-container", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) })
    ] });
  },
  migrate: (0, import_compose.compose)(migrateDimRatio, migrateTag)
};
var v6 = {
  attributes: {
    ...blockAttributes,
    isRepeated: {
      type: "boolean",
      default: false
    },
    minHeight: {
      type: "number"
    },
    minHeightUnit: {
      type: "string"
    },
    gradient: {
      type: "string"
    },
    customGradient: {
      type: "string"
    },
    contentPosition: {
      type: "string"
    }
  },
  supports: {
    align: true
  },
  save({ attributes }) {
    const {
      backgroundType,
      gradient,
      contentPosition,
      customGradient,
      customOverlayColor,
      dimRatio,
      focalPoint,
      hasParallax,
      isRepeated,
      overlayColor,
      url,
      minHeight: minHeightProp,
      minHeightUnit
    } = attributes;
    const overlayColorClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      overlayColor
    );
    const gradientClass = (0, import_block_editor.__experimentalGetGradientClass)(gradient);
    const minHeight = minHeightUnit ? `${minHeightProp}${minHeightUnit}` : minHeightProp;
    const isImageBackground = import_shared.IMAGE_BACKGROUND_TYPE === backgroundType;
    const isVideoBackground = import_shared.VIDEO_BACKGROUND_TYPE === backgroundType;
    const style = isImageBackground ? backgroundImageStyles(url) : {};
    const videoStyle = {};
    if (!overlayColorClass) {
      style.backgroundColor = customOverlayColor;
    }
    if (customGradient && !url) {
      style.background = customGradient;
    }
    style.minHeight = minHeight || void 0;
    let positionValue;
    if (focalPoint) {
      positionValue = `${Math.round(
        focalPoint.x * 100
      )}% ${Math.round(focalPoint.y * 100)}%`;
      if (isImageBackground && !hasParallax) {
        style.backgroundPosition = positionValue;
      }
      if (isVideoBackground) {
        videoStyle.objectPosition = positionValue;
      }
    }
    const classes = (0, import_clsx.default)(
      dimRatioToClassV1(dimRatio),
      overlayColorClass,
      {
        "has-background-dim": dimRatio !== 0,
        "has-parallax": hasParallax,
        "is-repeated": isRepeated,
        "has-background-gradient": gradient || customGradient,
        [gradientClass]: !url && gradientClass,
        "has-custom-content-position": !(0, import_shared.isContentPositionCenter)(contentPosition)
      },
      (0, import_shared.getPositionClassName)(contentPosition)
    );
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save({ className: classes, style }), children: [
      url && (gradient || customGradient) && dimRatio !== 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          "aria-hidden": "true",
          className: (0, import_clsx.default)(
            "wp-block-cover__gradient-background",
            gradientClass
          ),
          style: customGradient ? { background: customGradient } : void 0
        }
      ),
      isVideoBackground && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "video",
        {
          className: "wp-block-cover__video-background",
          autoPlay: true,
          muted: true,
          loop: true,
          playsInline: true,
          src: url,
          style: videoStyle
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-cover__inner-container", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) })
    ] });
  },
  migrate: (0, import_compose.compose)(migrateDimRatio, migrateTag)
};
var v5 = {
  attributes: {
    ...blockAttributes,
    minHeight: {
      type: "number"
    },
    gradient: {
      type: "string"
    },
    customGradient: {
      type: "string"
    }
  },
  supports: {
    align: true
  },
  save({ attributes }) {
    const {
      backgroundType,
      gradient,
      customGradient,
      customOverlayColor,
      dimRatio,
      focalPoint,
      hasParallax,
      overlayColor,
      url,
      minHeight
    } = attributes;
    const overlayColorClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      overlayColor
    );
    const gradientClass = (0, import_block_editor.__experimentalGetGradientClass)(gradient);
    const style = backgroundType === import_shared.IMAGE_BACKGROUND_TYPE ? backgroundImageStyles(url) : {};
    if (!overlayColorClass) {
      style.backgroundColor = customOverlayColor;
    }
    if (focalPoint && !hasParallax) {
      style.backgroundPosition = `${Math.round(
        focalPoint.x * 100
      )}% ${Math.round(focalPoint.y * 100)}%`;
    }
    if (customGradient && !url) {
      style.background = customGradient;
    }
    style.minHeight = minHeight || void 0;
    const classes = (0, import_clsx.default)(
      dimRatioToClassV1(dimRatio),
      overlayColorClass,
      {
        "has-background-dim": dimRatio !== 0,
        "has-parallax": hasParallax,
        "has-background-gradient": customGradient,
        [gradientClass]: !url && gradientClass
      }
    );
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: classes, style, children: [
      url && (gradient || customGradient) && dimRatio !== 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          "aria-hidden": "true",
          className: (0, import_clsx.default)(
            "wp-block-cover__gradient-background",
            gradientClass
          ),
          style: customGradient ? { background: customGradient } : void 0
        }
      ),
      import_shared.VIDEO_BACKGROUND_TYPE === backgroundType && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "video",
        {
          className: "wp-block-cover__video-background",
          autoPlay: true,
          muted: true,
          loop: true,
          src: url
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-cover__inner-container", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) })
    ] });
  },
  migrate: (0, import_compose.compose)(migrateDimRatio, migrateTag)
};
var v4 = {
  attributes: {
    ...blockAttributes,
    minHeight: {
      type: "number"
    },
    gradient: {
      type: "string"
    },
    customGradient: {
      type: "string"
    }
  },
  supports: {
    align: true
  },
  save({ attributes }) {
    const {
      backgroundType,
      gradient,
      customGradient,
      customOverlayColor,
      dimRatio,
      focalPoint,
      hasParallax,
      overlayColor,
      url,
      minHeight
    } = attributes;
    const overlayColorClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      overlayColor
    );
    const gradientClass = (0, import_block_editor.__experimentalGetGradientClass)(gradient);
    const style = backgroundType === import_shared.IMAGE_BACKGROUND_TYPE ? backgroundImageStyles(url) : {};
    if (!overlayColorClass) {
      style.backgroundColor = customOverlayColor;
    }
    if (focalPoint && !hasParallax) {
      style.backgroundPosition = `${focalPoint.x * 100}% ${focalPoint.y * 100}%`;
    }
    if (customGradient && !url) {
      style.background = customGradient;
    }
    style.minHeight = minHeight || void 0;
    const classes = (0, import_clsx.default)(
      dimRatioToClassV1(dimRatio),
      overlayColorClass,
      {
        "has-background-dim": dimRatio !== 0,
        "has-parallax": hasParallax,
        "has-background-gradient": customGradient,
        [gradientClass]: !url && gradientClass
      }
    );
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: classes, style, children: [
      url && (gradient || customGradient) && dimRatio !== 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          "aria-hidden": "true",
          className: (0, import_clsx.default)(
            "wp-block-cover__gradient-background",
            gradientClass
          ),
          style: customGradient ? { background: customGradient } : void 0
        }
      ),
      import_shared.VIDEO_BACKGROUND_TYPE === backgroundType && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "video",
        {
          className: "wp-block-cover__video-background",
          autoPlay: true,
          muted: true,
          loop: true,
          src: url
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-cover__inner-container", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) })
    ] });
  },
  migrate: (0, import_compose.compose)(migrateDimRatio, migrateTag)
};
var v3 = {
  attributes: {
    ...blockAttributes,
    title: {
      type: "string",
      source: "html",
      selector: "p"
    },
    contentAlign: {
      type: "string",
      default: "center"
    }
  },
  supports: {
    align: true
  },
  save({ attributes }) {
    const {
      backgroundType,
      contentAlign,
      customOverlayColor,
      dimRatio,
      focalPoint,
      hasParallax,
      overlayColor,
      title,
      url
    } = attributes;
    const overlayColorClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      overlayColor
    );
    const style = backgroundType === import_shared.IMAGE_BACKGROUND_TYPE ? backgroundImageStyles(url) : {};
    if (!overlayColorClass) {
      style.backgroundColor = customOverlayColor;
    }
    if (focalPoint && !hasParallax) {
      style.backgroundPosition = `${focalPoint.x * 100}% ${focalPoint.y * 100}%`;
    }
    const classes = (0, import_clsx.default)(
      dimRatioToClassV1(dimRatio),
      overlayColorClass,
      {
        "has-background-dim": dimRatio !== 0,
        "has-parallax": hasParallax,
        [`has-${contentAlign}-content`]: contentAlign !== "center"
      }
    );
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: classes, style, children: [
      import_shared.VIDEO_BACKGROUND_TYPE === backgroundType && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "video",
        {
          className: "wp-block-cover__video-background",
          autoPlay: true,
          muted: true,
          loop: true,
          src: url
        }
      ),
      !import_block_editor.RichText.isEmpty(title) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          tagName: "p",
          className: "wp-block-cover-text",
          value: title
        }
      )
    ] });
  },
  migrate(attributes) {
    const newAttribs = {
      ...attributes,
      dimRatio: !attributes.url ? 100 : attributes.dimRatio,
      tagName: !attributes.tagName ? "div" : attributes.tagName
    };
    const { title, contentAlign, ...restAttributes } = newAttribs;
    return [
      restAttributes,
      [
        (0, import_blocks.createBlock)("core/paragraph", {
          content: attributes.title,
          style: {
            typography: {
              textAlign: attributes.contentAlign
            }
          },
          fontSize: "large",
          placeholder: (0, import_i18n.__)("Write title…")
        })
      ]
    ];
  }
};
var v2 = {
  attributes: {
    ...blockAttributes,
    title: {
      type: "string",
      source: "html",
      selector: "p"
    },
    contentAlign: {
      type: "string",
      default: "center"
    },
    align: {
      type: "string"
    }
  },
  supports: {
    className: false
  },
  save({ attributes }) {
    const {
      url,
      title,
      hasParallax,
      dimRatio,
      align,
      contentAlign,
      overlayColor,
      customOverlayColor
    } = attributes;
    const overlayColorClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      overlayColor
    );
    const style = backgroundImageStyles(url);
    if (!overlayColorClass) {
      style.backgroundColor = customOverlayColor;
    }
    const classes = (0, import_clsx.default)(
      "wp-block-cover-image",
      dimRatioToClassV1(dimRatio),
      overlayColorClass,
      {
        "has-background-dim": dimRatio !== 0,
        "has-parallax": hasParallax,
        [`has-${contentAlign}-content`]: contentAlign !== "center"
      },
      align ? `align${align}` : null
    );
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: classes, style, children: !import_block_editor.RichText.isEmpty(title) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText.Content,
      {
        tagName: "p",
        className: "wp-block-cover-image-text",
        value: title
      }
    ) });
  },
  migrate(attributes) {
    const newAttribs = {
      ...attributes,
      dimRatio: !attributes.url ? 100 : attributes.dimRatio,
      tagName: !attributes.tagName ? "div" : attributes.tagName
    };
    const { title, contentAlign, align, ...restAttributes } = newAttribs;
    return [
      restAttributes,
      [
        (0, import_blocks.createBlock)("core/paragraph", {
          content: attributes.title,
          style: {
            typography: {
              textAlign: attributes.contentAlign
            }
          },
          fontSize: "large",
          placeholder: (0, import_i18n.__)("Write title…")
        })
      ]
    ];
  }
};
var v1 = {
  attributes: {
    ...blockAttributes,
    title: {
      type: "string",
      source: "html",
      selector: "h2"
    },
    align: {
      type: "string"
    },
    contentAlign: {
      type: "string",
      default: "center"
    }
  },
  supports: {
    className: false
  },
  save({ attributes }) {
    const { url, title, hasParallax, dimRatio, align } = attributes;
    const style = backgroundImageStyles(url);
    const classes = (0, import_clsx.default)(
      "wp-block-cover-image",
      dimRatioToClassV1(dimRatio),
      {
        "has-background-dim": dimRatio !== 0,
        "has-parallax": hasParallax
      },
      align ? `align${align}` : null
    );
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { className: classes, style, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "h2", value: title }) });
  },
  migrate(attributes) {
    const newAttribs = {
      ...attributes,
      dimRatio: !attributes.url ? 100 : attributes.dimRatio,
      tagName: !attributes.tagName ? "div" : attributes.tagName
    };
    const { title, contentAlign, align, ...restAttributes } = newAttribs;
    return [
      restAttributes,
      [
        (0, import_blocks.createBlock)("core/paragraph", {
          content: attributes.title,
          style: {
            typography: {
              textAlign: attributes.contentAlign
            }
          },
          fontSize: "large",
          placeholder: (0, import_i18n.__)("Write title…")
        })
      ]
    ];
  }
};
var deprecated_default = [v14, v13, v12, v11, v10, v9, v8, v7, v6, v5, v4, v3, v2, v1];
//# sourceMappingURL=deprecated.cjs.map
