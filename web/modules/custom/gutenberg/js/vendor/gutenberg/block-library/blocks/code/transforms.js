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

// packages/block-library/src/code/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blocks = require("@wordpress/blocks");
var import_rich_text = require("@wordpress/rich-text");
var import_get_transformed_attributes = require("../utils/get-transformed-attributes.cjs");
var transforms = {
  from: [
    {
      type: "input",
      regExp: /^```$/,
      transform: () => (0, import_blocks.createBlock)("core/code")
    },
    {
      type: "block",
      blocks: ["core/paragraph"],
      transform: (attributes) => {
        const { content } = attributes;
        return (0, import_blocks.createBlock)("core/code", {
          ...attributes,
          ...(0, import_get_transformed_attributes.getTransformedAttributes)(attributes, "core/code"),
          content
        });
      }
    },
    {
      type: "block",
      blocks: ["core/html"],
      __experimentalConvert(block) {
        const { attributes } = block;
        return (0, import_blocks.createBlock)("core/code", {
          ...attributes,
          ...(0, import_get_transformed_attributes.getTransformedAttributes)(attributes, "core/code"),
          // The HTML is plain text (with plain line breaks), so
          // convert it to rich text.
          content: (0, import_rich_text.toHTMLString)({
            value: (0, import_rich_text.create)({ text: (0, import_blocks.getBlockContent)(block) })
          })
        });
      }
    },
    {
      type: "raw",
      isMatch: (node) => node.nodeName === "PRE" && node.children.length === 1 && node.firstChild.nodeName === "CODE",
      schema: {
        pre: {
          children: {
            code: {
              children: {
                "#text": {}
              }
            }
          }
        }
      }
    }
  ],
  to: [
    {
      type: "block",
      blocks: ["core/paragraph"],
      transform: (attributes) => {
        const { content } = attributes;
        return (0, import_blocks.createBlock)("core/paragraph", {
          ...(0, import_get_transformed_attributes.getTransformedAttributes)(attributes, "core/paragraph"),
          content
        });
      }
    }
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
