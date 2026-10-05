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

// packages/block-library/src/video/transforms.js
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
        return files.length === 1 && files[0].type.indexOf("video/") === 0;
      },
      transform(files) {
        const file = files[0];
        const block = (0, import_blocks.createBlock)("core/video", {
          blob: (0, import_blob.createBlobURL)(file)
        });
        return block;
      }
    },
    {
      type: "shortcode",
      tag: "video",
      attributes: {
        src: {
          type: "string",
          shortcode: ({
            named: { src, mp4, m4v, webm, ogv, flv }
          }) => {
            return src || mp4 || m4v || webm || ogv || flv;
          }
        },
        poster: {
          type: "string",
          shortcode: ({ named: { poster } }) => {
            return poster;
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
    },
    {
      type: "raw",
      isMatch: (node) => node.nodeName === "P" && node.children.length === 1 && node.firstChild.nodeName === "VIDEO",
      transform: (node) => {
        const videoElement = node.firstChild;
        const attributes = {
          autoplay: videoElement.hasAttribute("autoplay") ? true : void 0,
          controls: videoElement.hasAttribute("controls") ? void 0 : false,
          loop: videoElement.hasAttribute("loop") ? true : void 0,
          muted: videoElement.hasAttribute("muted") ? true : void 0,
          preload: videoElement.getAttribute("preload") || void 0,
          playsInline: videoElement.hasAttribute("playsinline") ? true : void 0,
          poster: videoElement.getAttribute("poster") || void 0,
          src: videoElement.getAttribute("src") || void 0
        };
        if ((0, import_blob.isBlobURL)(attributes.src)) {
          attributes.blob = attributes.src;
          delete attributes.src;
        }
        return (0, import_blocks.createBlock)("core/video", attributes);
      }
    }
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
