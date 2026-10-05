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

// packages/block-library/src/image/save.jsx
var save_exports = {};
__export(save_exports, {
  default: () => save
});
module.exports = __toCommonJS(save_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_utils = require("./utils.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function save({ attributes }) {
  const {
    url,
    alt,
    caption,
    align,
    href,
    rel,
    linkClass,
    width,
    height,
    aspectRatio,
    scale,
    focalPoint,
    id,
    linkTarget,
    sizeSlug,
    title,
    isDecorative,
    metadata: { bindings = {} } = {}
  } = attributes;
  const newRel = !rel ? void 0 : rel;
  const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
  const shadowProps = (0, import_block_editor.__experimentalGetShadowClassesAndStyles)(attributes);
  const classes = (0, import_clsx.default)({
    // All other align classes are handled by block supports.
    // `{ align: 'none' }` is unique to transforms for the image block.
    alignnone: "none" === align,
    [`size-${sizeSlug}`]: sizeSlug,
    "is-resized": width || height,
    "has-custom-border": !!borderProps.className || borderProps.style && Object.keys(borderProps.style).length > 0
  });
  const imageClasses = (0, import_clsx.default)(borderProps.className, {
    [`wp-image-${id}`]: !!id
  });
  const image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "img",
    {
      src: url,
      alt,
      className: imageClasses || void 0,
      style: (() => {
        const style = {
          ...borderProps.style,
          ...shadowProps.style,
          aspectRatio,
          objectFit: scale,
          objectPosition: focalPoint && scale ? (0, import_utils.mediaPosition)(focalPoint) : void 0
        };
        if (width !== void 0 || height !== void 0) {
          if (width === "auto") {
            style.width = "auto";
          } else if (width !== void 0 && width !== null) {
            style.width = typeof width === "number" ? `${width}px` : width;
          }
          if (height === "auto" || height === void 0 || height === null) {
            style.height = "auto";
          } else {
            style.height = typeof height === "number" ? `${height}px` : height;
          }
        }
        return style;
      })(),
      title,
      role: isDecorative ? "none" : void 0
    }
  );
  const displayCaption = !import_block_editor.RichText.isEmpty(caption) || bindings.caption || bindings?.__default?.source === "core/pattern-overrides";
  const figure = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "a",
      {
        className: linkClass,
        href,
        target: linkTarget,
        rel: newRel,
        children: image
      }
    ) : image,
    displayCaption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText.Content,
      {
        className: (0, import_block_editor.__experimentalGetElementClassName)("caption"),
        tagName: "figcaption",
        value: caption
      }
    )
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", { ...import_block_editor.useBlockProps.save({ className: classes }), children: figure });
}
//# sourceMappingURL=save.cjs.map
