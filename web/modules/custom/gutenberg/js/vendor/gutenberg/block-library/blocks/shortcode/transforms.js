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

// packages/block-library/src/shortcode/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_autop = require("@wordpress/autop");
var import_blocks = require("@wordpress/blocks");
var import_shortcode = require("@wordpress/shortcode");
var getShortcodeFromTransforms = () => (0, import_blocks.getBlockTransforms)("from").filter(
  (transform) => transform.type === "shortcode" && transform.blockName !== "core/shortcode"
);
var isSingleShortcode = (text, tag) => {
  const trimmed = text.trim();
  const match = (0, import_shortcode.next)(tag, trimmed);
  return !!match && match.index === 0 && match.content.length === trimmed.length;
};
var transforms = {
  from: [
    {
      type: "shortcode",
      // Per "Shortcode names should be all lowercase and use all
      // letters, but numbers and underscores should work fine too.
      // Be wary of using hyphens (dashes), you'll be better off not
      // using them." in https://codex.wordpress.org/Shortcode_API
      // Require that the first character be a letter. This notably
      // prevents footnote markings ([1]) from being caught as
      // shortcodes.
      tag: "[a-z][a-z0-9_-]*",
      attributes: {
        text: {
          type: "string",
          shortcode: (attrs, { content }) => {
            return (0, import_autop.removep)((0, import_autop.autop)(content));
          }
        }
      },
      priority: 20
    }
  ],
  // One `to` transform per registered shortcode-from block. A single transform
  // with a dynamic `blocks` list won't work: `isMatch` runs once per
  // transform, so all targets would surface (or none) regardless of which
  // shortcode tag the block actually contains.
  get to() {
    return getShortcodeFromTransforms().map((fromTransform) => ({
      type: "block",
      blocks: [fromTransform.blockName],
      isMatch: ({ text = "" }) => {
        return [].concat(fromTransform.tag).some((tag) => isSingleShortcode(text, tag));
      },
      transform: ({ text = "" }) => {
        return (0, import_blocks.rawHandler)({ HTML: `<p>${text.trim()}</p>` });
      }
    }));
  }
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
