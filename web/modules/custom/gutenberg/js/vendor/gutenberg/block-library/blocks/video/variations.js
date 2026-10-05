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

// packages/block-library/src/video/variations.js
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default,
  isGifVariation: () => isGifVariation
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var isGifVariation = ({
  controls,
  loop,
  autoplay,
  muted,
  playsInline
} = {}) => !controls && !!loop && !!autoplay && !!muted && !!playsInline;
var variations = [
  {
    name: "video",
    title: (0, import_i18n.__)("Video"),
    description: (0, import_i18n.__)(
      "A video with customizable playback and interaction controls."
    ),
    icon: import_icons.video,
    attributes: { controls: true },
    isActive: (blockAttributes) => !isGifVariation(blockAttributes),
    // Not offered in the inserter; used to label a regular video and to
    // switch a GIF back to a standard video.
    scope: ["block", "transform"]
  },
  {
    name: "gif",
    title: (0, import_i18n.__)("GIF"),
    description: (0, import_i18n.__)(
      "A muted, looping video that plays automatically like an animated GIF."
    ),
    icon: import_icons.video,
    keywords: [(0, import_i18n.__)("animated"), "gif"],
    attributes: {
      controls: false,
      loop: true,
      autoplay: true,
      muted: true,
      playsInline: true
    },
    isActive: (blockAttributes) => isGifVariation(blockAttributes),
    // Created by converting an uploaded GIF, not inserted directly.
    scope: ["block", "transform"]
  }
];
var variations_default = variations;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isGifVariation
});
//# sourceMappingURL=variations.cjs.map
