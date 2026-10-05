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

// packages/block-library/src/post-terms/hooks.js
var hooks_exports = {};
__export(hooks_exports, {
  default: () => enhanceVariations
});
module.exports = __toCommonJS(hooks_exports);
var import_icons = require("@wordpress/icons");
var variationIconMap = {
  category: import_icons.postCategories,
  post_tag: import_icons.postTerms
};
function enhanceVariations(settings, name) {
  if (name !== "core/post-terms") {
    return settings;
  }
  const variations = settings.variations.map((variation) => ({
    ...variation,
    ...{
      icon: variationIconMap[variation.name] ?? import_icons.postCategories
    }
  }));
  return {
    ...settings,
    variations
  };
}
//# sourceMappingURL=hooks.cjs.map
