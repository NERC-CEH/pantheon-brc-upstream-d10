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

// packages/block-library/src/playlist/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blocks = require("@wordpress/blocks");
var import_url = require("@wordpress/url");
var transforms = {
  from: [
    {
      type: "block",
      isMultiBlock: true,
      blocks: ["core/audio"],
      transform: (attributes) => (0, import_blocks.createBlock)(
        "core/playlist",
        { ...attributes[0] },
        attributes.map(
          ({ blob, id, src }) => (0, import_blocks.createBlock)("core/playlist-track", {
            blob,
            id,
            src,
            title: (0, import_url.getFilename)(src)
          })
        )
      )
    }
  ],
  to: [
    {
      type: "block",
      blocks: ["core/audio"],
      isMatch: ({}, block) => block.innerBlocks.length === 1 && block.innerBlocks[0].name === "core/playlist-track",
      transform: ({ style, ...attributes }, [track]) => (0, import_blocks.createBlock)("core/audio", {
        ...attributes,
        ...style?.spacing && {
          style: { spacing: style.spacing }
        },
        blob: track.attributes.blob,
        id: track.attributes.id,
        src: track.attributes.src
      })
    }
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
