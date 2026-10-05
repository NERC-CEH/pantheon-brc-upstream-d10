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

// packages/block-library/src/categories/variations.js
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var variations = [
  {
    name: "terms",
    title: (0, import_i18n.__)("Terms List"),
    icon: import_icons.category,
    attributes: {
      // We need to set an attribute here that will be set when inserting the block.
      // We cannot leave this empty, as that would be interpreted as the default value,
      // which is `category` -- for which we're defining a distinct variation below,
      // for backwards compatibility reasons.
      // The logical fallback is thus the only other built-in and public taxonomy: Tags.
      taxonomy: "post_tag"
    },
    isActive: (blockAttributes) => (
      // This variation is used for any taxonomy other than `category`.
      blockAttributes.taxonomy !== "category"
    )
  },
  {
    name: "categories",
    title: (0, import_i18n.__)("Categories List"),
    description: (0, import_i18n.__)("Display a list of all categories."),
    icon: import_icons.category,
    attributes: {
      taxonomy: "category"
    },
    isActive: ["taxonomy"],
    // The following is needed to prevent "Terms List" from showing up twice in the inserter
    // (once for the block, once for the variation). Fortunately, it does not collide with
    // `categories` being the default value of the `taxonomy` attribute.
    isDefault: true
  }
];
var variations_default = variations;
//# sourceMappingURL=variations.cjs.map
