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

// packages/block-library/src/navigation-link/hooks.js
var hooks_exports = {};
__export(hooks_exports, {
  enhanceNavigationLinkVariations: () => enhanceNavigationLinkVariations
});
module.exports = __toCommonJS(hooks_exports);
var import_icons = require("@wordpress/icons");
function getIcon(variationName) {
  switch (variationName) {
    case "post":
      return import_icons.postList;
    case "page":
      return import_icons.page;
    case "tag":
      return import_icons.tag;
    case "category":
      return import_icons.category;
    default:
      return import_icons.customPostType;
  }
}
function enhanceNavigationLinkVariations(settings, name) {
  if (name !== "core/navigation-link") {
    return settings;
  }
  if (settings.variations) {
    const isActive = (blockAttributes, variationAttributes) => {
      return blockAttributes.type === variationAttributes.type;
    };
    const variations = settings.variations.map((variation) => {
      return {
        ...variation,
        ...!variation.icon && {
          icon: getIcon(variation.name)
        },
        ...!variation.isActive && {
          isActive
        }
      };
    });
    return {
      ...settings,
      variations
    };
  }
  return settings;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  enhanceNavigationLinkVariations
});
//# sourceMappingURL=hooks.cjs.map
