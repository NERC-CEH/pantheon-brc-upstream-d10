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

// packages/block-library/src/post-date/variations.js
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var variations = [
  {
    name: "post-date",
    title: (0, import_i18n.__)("Post Date"),
    description: (0, import_i18n.__)("Display a post's publish date."),
    attributes: {
      metadata: {
        bindings: {
          datetime: {
            source: "core/post-data",
            args: { field: "date" }
          }
        }
      }
    },
    scope: ["inserter", "transform"],
    isActive: (blockAttributes) => blockAttributes?.metadata?.bindings?.datetime?.source === "core/post-data" && blockAttributes?.metadata?.bindings?.datetime?.args?.field === "date"
  },
  {
    name: "post-date-modified",
    title: (0, import_i18n.__)("Modified Date"),
    description: (0, import_i18n.__)("Display a post's last updated date."),
    attributes: {
      metadata: {
        bindings: {
          datetime: {
            source: "core/post-data",
            args: { field: "modified" }
          }
        }
      },
      className: "wp-block-post-date__modified-date"
    },
    scope: ["inserter", "transform"],
    isActive: (blockAttributes) => blockAttributes?.metadata?.bindings?.datetime?.source === "core/post-data" && blockAttributes?.metadata?.bindings?.datetime?.args?.field === "modified"
  }
];
var variations_default = variations;
//# sourceMappingURL=variations.cjs.map
