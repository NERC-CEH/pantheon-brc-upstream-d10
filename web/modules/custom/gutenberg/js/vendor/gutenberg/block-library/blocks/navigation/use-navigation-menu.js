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

// packages/block-library/src/navigation/use-navigation-menu.js
var use_navigation_menu_exports = {};
__export(use_navigation_menu_exports, {
  default: () => useNavigationMenu
});
module.exports = __toCommonJS(use_navigation_menu_exports);
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
var import_constants = require("./constants.cjs");
function useNavigationMenu(ref) {
  const permissions = (0, import_core_data.useResourcePermissions)({
    kind: "postType",
    name: "wp_navigation",
    id: ref
  });
  const {
    navigationMenu,
    isNavigationMenuResolved,
    isNavigationMenuMissing
  } = (0, import_data.useSelect)(
    (select) => {
      return selectExistingMenu(select, ref);
    },
    [ref]
  );
  const {
    // Can the user create navigation menus?
    canCreate: canCreateNavigationMenus,
    // Can the user update the specific navigation menu with the given post ID?
    canUpdate: canUpdateNavigationMenu,
    // Can the user delete the specific navigation menu with the given post ID?
    canDelete: canDeleteNavigationMenu,
    isResolving: isResolvingPermissions,
    hasResolved: hasResolvedPermissions
  } = permissions;
  const {
    records: navigationMenus,
    isResolving: isResolvingNavigationMenus,
    hasResolved: hasResolvedNavigationMenus
  } = (0, import_core_data.useEntityRecords)(
    "postType",
    `wp_navigation`,
    import_constants.PRELOADED_NAVIGATION_MENUS_QUERY
  );
  const canSwitchNavigationMenu = ref ? navigationMenus?.length > 1 : navigationMenus?.length > 0;
  return {
    navigationMenu,
    isNavigationMenuResolved,
    isNavigationMenuMissing,
    navigationMenus,
    isResolvingNavigationMenus,
    hasResolvedNavigationMenus,
    canSwitchNavigationMenu,
    canUserCreateNavigationMenus: canCreateNavigationMenus,
    isResolvingCanUserCreateNavigationMenus: isResolvingPermissions,
    hasResolvedCanUserCreateNavigationMenus: hasResolvedPermissions,
    canUserUpdateNavigationMenu: canUpdateNavigationMenu,
    hasResolvedCanUserUpdateNavigationMenu: ref ? hasResolvedPermissions : void 0,
    canUserDeleteNavigationMenu: canDeleteNavigationMenu,
    hasResolvedCanUserDeleteNavigationMenu: ref ? hasResolvedPermissions : void 0
  };
}
function selectExistingMenu(select, ref) {
  if (!ref) {
    return {
      isNavigationMenuResolved: false,
      isNavigationMenuMissing: true
    };
  }
  const { getEntityRecord, getEditedEntityRecord, hasFinishedResolution } = select(import_core_data.store);
  const args = ["postType", "wp_navigation", ref];
  const navigationMenu = getEntityRecord(...args);
  const editedNavigationMenu = getEditedEntityRecord(...args);
  const hasResolvedNavigationMenu = hasFinishedResolution(
    "getEditedEntityRecord",
    args
  );
  const isNavigationMenuPublishedOrDraft = editedNavigationMenu.status === "publish" || editedNavigationMenu.status === "draft";
  return {
    isNavigationMenuResolved: hasResolvedNavigationMenu,
    isNavigationMenuMissing: hasResolvedNavigationMenu && (!navigationMenu || !isNavigationMenuPublishedOrDraft),
    // getEditedEntityRecord will return the post regardless of status.
    // Therefore if the found post is not published then we should ignore it.
    navigationMenu: isNavigationMenuPublishedOrDraft ? editedNavigationMenu : null
  };
}
//# sourceMappingURL=use-navigation-menu.cjs.map
