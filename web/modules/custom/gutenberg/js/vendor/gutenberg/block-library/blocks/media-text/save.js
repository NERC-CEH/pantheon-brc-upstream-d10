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

// packages/block-library/src/media-text/save.jsx
var save_exports = {};
__export(save_exports, {
  default: () => save
});
module.exports = __toCommonJS(save_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_image_fill = require("./image-fill.cjs");
var import_constants = require("./constants.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var DEFAULT_MEDIA_WIDTH = 50;
var noop = () => {
};
function save({ attributes }) {
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
  const positionStyles = imageFill ? (0, import_image_fill.imageFillStyles)(mediaUrl, focalPoint) : {};
  let image = mediaUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "img",
    {
      src: mediaUrl,
      alt: mediaAlt,
      className: imageClasses || null,
      style: positionStyles
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
    "is-image-fill-element": imageFill
  });
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
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", { className: "wp-block-media-text__media", children: (mediaTypeRenders[mediaType] || noop)() })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save({ className, style }), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", { className: "wp-block-media-text__media", children: (mediaTypeRenders[mediaType] || noop)() }),
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
//# sourceMappingURL=save.cjs.map
