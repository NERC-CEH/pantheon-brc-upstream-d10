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

// packages/block-library/src/query-title/variations.js
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var variations = [
  {
    isDefault: true,
    name: "archive-title",
    title: (0, import_i18n.__)("Archive Title"),
    description: (0, import_i18n.__)(
      "Display the archive title based on the queried object."
    ),
    icon: import_icons.title,
    attributes: {
      type: "archive"
    },
    scope: ["inserter"]
  },
  {
    isDefault: false,
    name: "search-title",
    title: (0, import_i18n.__)("Search Results Title"),
    description: (0, import_i18n.__)(
      "Display the search results title based on the queried object."
    ),
    icon: import_icons.title,
    attributes: {
      type: "search"
    },
    scope: ["inserter"]
  },
  {
    isDefault: false,
    name: "post-type-label",
    title: (0, import_i18n.__)("Post Type Label"),
    description: (0, import_i18n.__)(
      "Display the post type label based on the queried object."
    ),
    icon: import_icons.title,
    attributes: {
      type: "post-type"
    },
    scope: ["inserter"]
  }
];
variations.forEach((variation) => {
  if (variation.isActive) {
    return;
  }
  variation.isActive = (blockAttributes, variationAttributes) => blockAttributes.type === variationAttributes.type;
});
var variations_default = variations;
//# sourceMappingURL=variations.cjs.map
