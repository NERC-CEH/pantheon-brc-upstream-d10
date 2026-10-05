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
var use_navigation_entities_exports = {};
__export(use_navigation_entities_exports, {
  default: () => useNavigationEntities
});
module.exports = __toCommonJS(use_navigation_entities_exports);
var import_core_data = require("@wordpress/core-data");
function useNavigationEntities(menuId) {
  const {
    records: menus,
    isResolving: isResolvingMenus,
    hasResolved: hasResolvedMenus
  } = (0, import_core_data.useEntityRecords)("root", "menu", { per_page: -1, context: "view" });
  const {
    records: pages,
    isResolving: isResolvingPages,
    hasResolved: hasResolvedPages
  } = (0, import_core_data.useEntityRecords)("postType", "page", {
    parent: 0,
    order: "asc",
    orderby: "id",
    per_page: -1,
    context: "view"
  });
  const { records: menuItems, hasResolved: hasResolvedMenuItems } = (0, import_core_data.useEntityRecords)(
    "root",
    "menuItem",
    {
      menus: menuId,
      per_page: -1,
      context: "view"
    },
    { enabled: !!menuId }
  );
  return {
    pages,
    isResolvingPages,
    hasResolvedPages,
    hasPages: !!(hasResolvedPages && pages?.length),
    menus,
    isResolvingMenus,
    hasResolvedMenus,
    hasMenus: !!(hasResolvedMenus && menus?.length),
    menuItems,
    hasResolvedMenuItems
  };
}
//# sourceMappingURL=use-navigation-entities.js.map
