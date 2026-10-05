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

// packages/block-library/src/post-navigation-link/variations.js
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var variations = [
  {
    name: "post-previous",
    title: (0, import_i18n.__)("Previous Post"),
    description: (0, import_i18n.__)(
      "Displays the post link that precedes the current post."
    ),
    icon: import_icons.previous,
    attributes: { type: "previous" },
    scope: ["inserter", "transform"],
    example: {
      attributes: {
        label: (0, import_i18n.__)("Previous post"),
        arrow: "arrow"
      }
    }
  },
  {
    isDefault: true,
    name: "post-next",
    title: (0, import_i18n.__)("Next Post"),
    description: (0, import_i18n.__)(
      "Displays the post link that follows the current post."
    ),
    icon: import_icons.next,
    attributes: { type: "next" },
    scope: ["inserter", "transform"],
    example: {
      attributes: {
        label: (0, import_i18n.__)("Next post"),
        arrow: "arrow"
      }
    }
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
