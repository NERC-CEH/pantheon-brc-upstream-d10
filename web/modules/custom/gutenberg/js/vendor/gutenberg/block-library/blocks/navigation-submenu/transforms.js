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

// packages/block-library/src/navigation-submenu/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blocks = require("@wordpress/blocks");
var transforms = {
  to: [
    {
      type: "block",
      blocks: ["core/navigation-link"],
      isMatch: (attributes, block) => block?.innerBlocks?.length === 0,
      transform: (attributes) => (0, import_blocks.createBlock)("core/navigation-link", attributes)
    },
    {
      type: "block",
      blocks: ["core/spacer"],
      isMatch: (attributes, block) => block?.innerBlocks?.length === 0,
      transform: () => {
        return (0, import_blocks.createBlock)("core/spacer");
      }
    },
    {
      type: "block",
      blocks: ["core/site-logo"],
      isMatch: (attributes, block) => block?.innerBlocks?.length === 0,
      transform: () => {
        return (0, import_blocks.createBlock)("core/site-logo");
      }
    },
    {
      type: "block",
      blocks: ["core/home-link"],
      isMatch: (attributes, block) => block?.innerBlocks?.length === 0,
      transform: () => {
        return (0, import_blocks.createBlock)("core/home-link");
      }
    },
    {
      type: "block",
      blocks: ["core/social-links"],
      isMatch: (attributes, block) => block?.innerBlocks?.length === 0,
      transform: () => {
        return (0, import_blocks.createBlock)("core/social-links");
      }
    },
    {
      type: "block",
      blocks: ["core/search"],
      isMatch: (attributes, block) => block?.innerBlocks?.length === 0,
      transform: () => {
        return (0, import_blocks.createBlock)("core/search");
      }
    }
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
