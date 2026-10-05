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

// packages/block-library/src/heading/variations.js
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var LEVEL_ICONS = [
  import_icons.headingLevel1,
  import_icons.headingLevel2,
  import_icons.headingLevel3,
  import_icons.headingLevel4,
  import_icons.headingLevel5,
  import_icons.headingLevel6
];
var variations = [
  ...[1, 2, 3, 4, 5, 6].map((level) => ({
    name: `h${level}`,
    title: (0, import_i18n.sprintf)(
      /* translators: %d: heading level e.g: "1", "2", "3" */
      (0, import_i18n.__)("Heading %d"),
      level
    ),
    description: (0, import_i18n.__)(
      "Introduce new sections and organize content to help visitors (and search engines) understand the structure of your content."
    ),
    icon: LEVEL_ICONS[level - 1],
    attributes: { level },
    scope: ["block", "transform"],
    keywords: [`h${level}`],
    isActive: (blockAttributes) => blockAttributes.level === level,
    shortcut: {
      name: `core/block-editor/transform-to-heading-${level}`,
      description: (0, import_i18n.sprintf)(
        /* translators: %d: heading level e.g: "1", "2", "3" */
        (0, import_i18n.__)("Transform the selected block into a heading %d."),
        level
      ),
      keyCombination: {
        modifier: "access",
        character: `${level}`
      }
    }
  }))
];
var variations_default = variations;
//# sourceMappingURL=variations.cjs.map
