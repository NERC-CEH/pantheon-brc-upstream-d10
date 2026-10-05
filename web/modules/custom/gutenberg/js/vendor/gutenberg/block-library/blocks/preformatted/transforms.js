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

// packages/block-library/src/preformatted/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blocks = require("@wordpress/blocks");
var transforms = {
  from: [
    {
      type: "block",
      blocks: ["core/code", "core/paragraph", "core/verse"],
      transform: ({ content, anchor }) => (0, import_blocks.createBlock)("core/preformatted", {
        content,
        anchor
      })
    },
    {
      type: "raw",
      isMatch: (node) => node.nodeName === "PRE" && !(node.children.length === 1 && node.firstChild.nodeName === "CODE"),
      schema: ({ phrasingContentSchema }) => ({
        pre: {
          children: phrasingContentSchema
        }
      })
    }
  ],
  to: [
    {
      type: "block",
      blocks: ["core/paragraph"],
      transform: (attributes) => (0, import_blocks.createBlock)("core/paragraph", attributes)
    },
    {
      type: "block",
      blocks: ["core/code"],
      transform: (attributes) => (0, import_blocks.createBlock)("core/code", attributes)
    },
    {
      type: "block",
      blocks: ["core/verse"],
      transform: (attributes) => (0, import_blocks.createBlock)("core/verse", attributes)
    }
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
