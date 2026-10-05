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

// packages/block-library/src/details/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blocks = require("@wordpress/blocks");
var transforms_default = {
  from: [
    {
      type: "block",
      isMultiBlock: true,
      blocks: ["*"],
      isMatch({}, blocks) {
        return !(blocks.length === 1 && blocks[0].name === "core/details");
      },
      __experimentalConvert(blocks) {
        return (0, import_blocks.createBlock)(
          "core/details",
          {},
          blocks.map((block) => (0, import_blocks.cloneSanitizedBlock)(block))
        );
      }
    }
  ]
};
//# sourceMappingURL=transforms.cjs.map
