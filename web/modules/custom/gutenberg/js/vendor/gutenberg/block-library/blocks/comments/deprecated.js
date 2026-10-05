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

// packages/block-library/src/comments/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
var v1 = {
  attributes: {
    tagName: {
      type: "string",
      default: "div"
    }
  },
  apiVersion: 3,
  supports: {
    align: ["wide", "full"],
    html: false,
    color: {
      gradients: true,
      link: true,
      __experimentalDefaultControls: {
        background: true,
        text: true,
        link: true
      }
    }
  },
  save({ attributes: { tagName: Tag } }) {
    const blockProps = import_block_editor.useBlockProps.save();
    const { className } = blockProps;
    const classes = className?.split(" ") || [];
    const newClasses = classes?.filter(
      (cls) => cls !== "wp-block-comments"
    );
    const newBlockProps = {
      ...blockProps,
      className: newClasses.join(" ")
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { ...newBlockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) });
  }
};
var deprecated_default = [v1];
//# sourceMappingURL=deprecated.cjs.map
