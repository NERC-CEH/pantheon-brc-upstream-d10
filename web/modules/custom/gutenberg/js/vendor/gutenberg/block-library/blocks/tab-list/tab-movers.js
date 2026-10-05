"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/block-library/src/tab-list/tab-movers.jsx
var tab_movers_exports = {};
__export(tab_movers_exports, {
  default: () => TabMovers
});
module.exports = __toCommonJS(tab_movers_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_icons = require("@wordpress/icons");
var import_data = require("@wordpress/data");
var import_use_tab_actions = __toESM(require("../tabs/use-tab-actions.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function TabMovers({ tabsClientId }) {
  const { moveTab } = (0, import_use_tab_actions.default)(tabsClientId);
  const { tabCount, activeIndex } = (0, import_data.useSelect)(
    (select) => {
      if (!tabsClientId) {
        return { tabCount: 0, activeIndex: 0 };
      }
      const { getBlocks, getBlockAttributes } = select(import_block_editor.store);
      const tabsAttributes = getBlockAttributes(tabsClientId);
      const tabPanels = getBlocks(tabsClientId).find(
        (block) => block.name === "core/tab-panels"
      );
      return {
        tabCount: tabPanels?.innerBlocks.length ?? 0,
        activeIndex: tabsAttributes?.editorActiveTabIndex ?? tabsAttributes?.activeTabIndex ?? 0
      };
    },
    [tabsClientId]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_block_editor.BlockControls, { group: "parent", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarButton,
      {
        className: "wp-block-tab-list__mover-button",
        icon: (0, import_i18n.isRTL)() ? import_icons.chevronRight : import_icons.chevronLeft,
        label: (0, import_i18n.__)("Move tab before"),
        onClick: () => moveTab(-1),
        disabled: activeIndex <= 0,
        accessibleWhenDisabled: true
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarButton,
      {
        className: "wp-block-tab-list__mover-button",
        icon: (0, import_i18n.isRTL)() ? import_icons.chevronLeft : import_icons.chevronRight,
        label: (0, import_i18n.__)("Move tab after"),
        onClick: () => moveTab(1),
        disabled: activeIndex >= tabCount - 1,
        accessibleWhenDisabled: true
      }
    )
  ] });
}
//# sourceMappingURL=tab-movers.cjs.map
