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

// packages/block-library/src/gallery/gallery.jsx
var gallery_exports = {};
__export(gallery_exports, {
  default: () => Gallery
});
module.exports = __toCommonJS(gallery_exports);
var import_clsx = __toESM(require("clsx"));
var import_i18n = require("@wordpress/i18n");
var import_caption = require("../utils/caption.cjs");
var import_shared = require("./shared.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function Gallery(props) {
  const {
    attributes,
    isSelected,
    setAttributes,
    insertBlocksAfter,
    blockProps,
    __unstableLayoutClassNames: layoutClassNames,
    isContentLocked,
    multiGallerySelection
  } = props;
  const { align, columns, imageCrop, layout } = attributes;
  const isFlexLayout = (0, import_shared.isGalleryFlexLayout)(layout);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "figure",
    {
      ...blockProps,
      className: (0, import_clsx.default)(
        blockProps.className,
        layoutClassNames,
        "blocks-gallery-grid",
        {
          [`align${align}`]: align,
          [`columns-${columns}`]: isFlexLayout && columns !== void 0,
          [`columns-default`]: isFlexLayout && columns === void 0,
          "is-cropped": isFlexLayout && imageCrop
        }
      ),
      children: [
        blockProps.children,
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_caption.Caption,
          {
            attributes,
            setAttributes,
            isSelected,
            insertBlocksAfter,
            showToolbarButton: !multiGallerySelection && !isContentLocked,
            className: "blocks-gallery-caption",
            label: (0, import_i18n.__)("Gallery caption text"),
            placeholder: (0, import_i18n.__)("Add gallery caption")
          }
        )
      ]
    }
  );
}
//# sourceMappingURL=gallery.cjs.map
