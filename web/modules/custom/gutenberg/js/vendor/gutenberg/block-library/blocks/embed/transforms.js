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

// packages/block-library/src/embed/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blocks = require("@wordpress/blocks");
var import_url = require("@wordpress/url");
var import_block = __toESM(require("./block.json"));
var import_util = require("./util.cjs");
var { name: EMBED_BLOCK } = import_block.default;
var transforms = {
  from: [
    {
      type: "raw",
      isMatch: (node) => {
        if (node.nodeName !== "P") {
          return false;
        }
        const trimmed = node.textContent.trim();
        if (!(0, import_url.isURL)(trimmed) || !/^https:\/\//i.test(trimmed) || trimmed.match(/https:\/\//gi)?.length !== 1) {
          return false;
        }
        return !/\.(?!(html?|php)$)[a-z0-9]+$/i.test(
          (0, import_url.getFilename)(trimmed) || ""
        );
      },
      transform: (node) => {
        const url = (0, import_util.rewriteXToTwitter)(node.textContent.trim());
        return (0, import_blocks.createBlock)(EMBED_BLOCK, {
          url,
          ...(0, import_util.findMoreSuitableBlock)(url)?.attributes
        });
      }
    },
    {
      type: "shortcode",
      tag: "embed",
      transform: (_attrs, { shortcode }) => {
        const url = (0, import_util.rewriteXToTwitter)(shortcode.content?.trim());
        return (0, import_blocks.createBlock)(EMBED_BLOCK, {
          url,
          ...(0, import_util.findMoreSuitableBlock)(url)?.attributes
        });
      }
    }
  ],
  to: [
    {
      type: "block",
      blocks: ["core/paragraph"],
      isMatch: ({ url }) => !!url,
      transform: ({ url, caption, className }) => {
        let value = `<a href="${url}">${url}</a>`;
        if (caption?.trim()) {
          value += `<br />${caption}`;
        }
        return (0, import_blocks.createBlock)("core/paragraph", {
          content: value,
          className: (0, import_util.removeAspectRatioClasses)(className)
        });
      }
    }
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
