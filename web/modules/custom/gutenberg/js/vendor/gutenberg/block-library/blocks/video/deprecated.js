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

// packages/block-library/src/video/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_block = __toESM(require("./block.json"));
var import_tracks = __toESM(require("./tracks.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var { attributes: blockAttributes } = import_block.default;
var v1 = {
  attributes: blockAttributes,
  save({ attributes }) {
    const {
      autoplay,
      caption,
      controls,
      loop,
      muted,
      poster,
      preload,
      src,
      playsInline,
      tracks
    } = attributes;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...import_block_editor.useBlockProps.save(), children: [
      src && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "video",
        {
          autoPlay: autoplay,
          controls,
          loop,
          muted,
          poster,
          preload: preload !== "metadata" ? preload : void 0,
          src,
          playsInline,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_tracks.default, { tracks })
        }
      ),
      !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "figcaption", value: caption })
    ] });
  }
};
var deprecated = [v1];
var deprecated_default = deprecated;
//# sourceMappingURL=deprecated.cjs.map
