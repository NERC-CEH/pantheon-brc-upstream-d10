"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/block-library/src/audio/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
var deprecated_default = [
  {
    attributes: {
      src: {
        type: "string",
        source: "attribute",
        selector: "audio",
        attribute: "src"
      },
      caption: {
        type: "string",
        source: "html",
        selector: "figcaption"
      },
      id: {
        type: "number"
      },
      autoplay: {
        type: "boolean",
        source: "attribute",
        selector: "audio",
        attribute: "autoplay"
      },
      loop: {
        type: "boolean",
        source: "attribute",
        selector: "audio",
        attribute: "loop"
      },
      preload: {
        type: "string",
        source: "attribute",
        selector: "audio",
        attribute: "preload"
      }
    },
    supports: {
      align: true
    },
    save({ attributes }) {
      const { autoplay, caption, loop, preload, src } = attributes;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "audio",
          {
            controls: "controls",
            src,
            autoPlay: autoplay,
            loop,
            preload
          }
        ),
        !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_block_editor.RichText.Content,
          {
            tagName: "figcaption",
            value: caption
          }
        )
      ] });
    }
  }
];
//# sourceMappingURL=deprecated.cjs.map
