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

// packages/block-library/src/gallery/save.jsx
var save_exports = {};
__export(save_exports, {
  default: () => saveWithInnerBlocks
});
module.exports = __toCommonJS(save_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_shared = require("./shared.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function saveWithInnerBlocks({ attributes }) {
  const { caption, columns, imageCrop, dynamicContent, layout } = attributes;
  const isFlexLayout = (0, import_shared.isGalleryFlexLayout)(layout);
  const captionElement = !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.RichText.Content,
    {
      tagName: "figcaption",
      className: (0, import_clsx.default)(
        "blocks-gallery-caption",
        (0, import_block_editor.__experimentalGetElementClassName)("caption")
      ),
      value: caption
    }
  );
  if (dynamicContent) {
    return captionElement || null;
  }
  const className = (0, import_clsx.default)("has-nested-images", {
    [`columns-${columns}`]: isFlexLayout && columns !== void 0,
    [`columns-default`]: isFlexLayout && columns === void 0,
    "is-cropped": isFlexLayout && imageCrop
  });
  const blockProps = import_block_editor.useBlockProps.save({ className });
  const innerBlocksProps = import_block_editor.useInnerBlocksProps.save(blockProps);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...innerBlocksProps, children: [
    innerBlocksProps.children,
    captionElement
  ] });
}
//# sourceMappingURL=save.cjs.map
