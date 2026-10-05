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

// packages/block-library/src/gallery/variations.js
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var import_dynamic_source = require("./dynamic-source.cjs");
var import_shared = require("./shared.cjs");
var variations = [
  {
    name: "dynamic-gallery",
    title: (0, import_i18n.__)("Dynamic Gallery"),
    description: (0, import_i18n.__)(
      "Display images from a source, such as those attached to the current post."
    ),
    attributes: {
      dynamicContent: { source: import_dynamic_source.ATTACHED_MEDIA }
    },
    // Match any gallery that has a dynamic source configured, regardless of
    // the specific source or options, so the variation's title and
    // description describe the block whenever it runs in dynamic mode.
    isActive: (blockAttributes) => !!blockAttributes.dynamicContent,
    // No scopes for now. While dynamic mode only supports the "attached to the
    // current post" source, `'inserter'` is intentionally omitted: a dedicated
    // inserter entry would surface in post-less contexts (templates, template
    // parts, synced patterns) where there's no post to resolve images from. The
    // entry point is instead the inspector toggle on a regular Gallery.
    // `isActive` still relabels the block card to "Dynamic Gallery" regardless
    // of scope. Revisit adding `'inserter'` in a follow-up as the feature grows
    // beyond the post-attached source.
    scope: []
  },
  {
    name: "gallery-flex",
    title: (0, import_i18n.__)("Gallery"),
    description: (0, import_i18n.__)("Arrange images in flexible rows."),
    icon: import_icons.gallery,
    attributes: {
      layout: {
        type: "flex"
      }
    },
    isActive: (blockAttributes) => (0, import_shared.isGalleryFlexLayout)(blockAttributes.layout),
    scope: ["transform"]
  },
  {
    name: "gallery-grid",
    title: (0, import_i18n.__)("Gallery Grid"),
    description: (0, import_i18n.__)("Arrange images in a grid."),
    icon: import_icons.grid,
    attributes: {
      layout: {
        type: "grid"
      }
    },
    isActive: (blockAttributes) => blockAttributes.layout?.type === "grid",
    scope: ["transform"]
  }
];
var variations_default = variations;
//# sourceMappingURL=variations.cjs.map
