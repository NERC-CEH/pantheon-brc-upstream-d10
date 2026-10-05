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

// packages/block-library/src/navigation/constants.js
var constants_exports = {};
__export(constants_exports, {
  DEFAULT_BLOCK: () => DEFAULT_BLOCK,
  NAVIGATION_OVERLAY_TEMPLATE_PART_AREA: () => NAVIGATION_OVERLAY_TEMPLATE_PART_AREA,
  PRELOADED_NAVIGATION_MENUS_QUERY: () => PRELOADED_NAVIGATION_MENUS_QUERY,
  PRIORITIZED_INSERTER_BLOCKS: () => PRIORITIZED_INSERTER_BLOCKS,
  SELECT_NAVIGATION_MENUS_ARGS: () => SELECT_NAVIGATION_MENUS_ARGS
});
module.exports = __toCommonJS(constants_exports);
var DEFAULT_BLOCK = {
  name: "core/navigation-link",
  attributes: {
    kind: "post-type",
    type: "page"
  }
};
var PRIORITIZED_INSERTER_BLOCKS = [
  "core/navigation-link/page",
  "core/navigation-link/custom-link"
];
var PRELOADED_NAVIGATION_MENUS_QUERY = {
  per_page: 100,
  status: ["publish", "draft"],
  order: "desc",
  orderby: "date"
};
var SELECT_NAVIGATION_MENUS_ARGS = [
  "postType",
  "wp_navigation",
  PRELOADED_NAVIGATION_MENUS_QUERY
];
var NAVIGATION_OVERLAY_TEMPLATE_PART_AREA = "navigation-overlay";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_BLOCK,
  NAVIGATION_OVERLAY_TEMPLATE_PART_AREA,
  PRELOADED_NAVIGATION_MENUS_QUERY,
  PRIORITIZED_INSERTER_BLOCKS,
  SELECT_NAVIGATION_MENUS_ARGS
});
//# sourceMappingURL=constants.cjs.map
