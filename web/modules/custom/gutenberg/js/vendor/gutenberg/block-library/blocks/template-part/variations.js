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

// packages/block-library/src/template-part/variations.js
var variations_exports = {};
__export(variations_exports, {
  enhanceTemplatePartVariations: () => enhanceTemplatePartVariations
});
module.exports = __toCommonJS(variations_exports);
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
var import_get_template_part_icon = require("./edit/utils/get-template-part-icon.cjs");
function enhanceTemplatePartVariations(settings, name) {
  if (name !== "core/template-part") {
    return settings;
  }
  if (settings.variations) {
    const isActive = (blockAttributes, variationAttributes) => {
      const { area, theme, slug } = blockAttributes;
      if (area) {
        return area === variationAttributes.area;
      }
      if (!slug) {
        return false;
      }
      const { getCurrentTheme, getEntityRecord } = (0, import_data.select)(import_core_data.store);
      const entity = getEntityRecord(
        "postType",
        "wp_template_part",
        `${theme || getCurrentTheme()?.stylesheet}//${slug}`
      );
      if (entity?.slug) {
        return entity.slug === variationAttributes.slug;
      }
      return entity?.area === variationAttributes.area;
    };
    const variations = settings.variations.map((variation) => {
      return {
        ...variation,
        ...!variation.isActive && { isActive },
        ...typeof variation.icon === "string" && {
          icon: (0, import_get_template_part_icon.getTemplatePartIcon)(variation.icon)
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
  enhanceTemplatePartVariations
});
//# sourceMappingURL=variations.cjs.map
