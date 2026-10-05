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

// packages/block-library/src/audio/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blob = require("@wordpress/blob");
var import_blocks = require("@wordpress/blocks");
var transforms = {
  from: [
    {
      type: "files",
      isMatch(files) {
        return files.length === 1 && files[0].type.indexOf("audio/") === 0;
      },
      transform(files) {
        const file = files[0];
        const block = (0, import_blocks.createBlock)("core/audio", {
          blob: (0, import_blob.createBlobURL)(file)
        });
        return block;
      }
    },
    {
      type: "shortcode",
      tag: "audio",
      attributes: {
        src: {
          type: "string",
          shortcode: ({
            named: { src, mp3, m4a, ogg, wav, wma }
          }) => {
            return src || mp3 || m4a || ogg || wav || wma;
          }
        },
        loop: {
          type: "string",
          shortcode: ({ named: { loop } }) => {
            return loop;
          }
        },
        autoplay: {
          type: "string",
          shortcode: ({ named: { autoplay } }) => {
            return autoplay;
          }
        },
        preload: {
          type: "string",
          shortcode: ({ named: { preload } }) => {
            return preload;
          }
        }
      }
    }
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
