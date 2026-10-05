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

// packages/block-library/src/tab/add-tab-toolbar-control.js
var add_tab_toolbar_control_exports = {};
__export(add_tab_toolbar_control_exports, {
  default: () => AddTabToolbarControl
});
module.exports = __toCommonJS(add_tab_toolbar_control_exports);
var import_i18n = require("@wordpress/i18n");
var import_blocks = require("@wordpress/blocks");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_jsx_runtime = require("react/jsx-runtime");
function AddTabToolbarControl({ tabsClientId }) {
  const { insertBlock } = (0, import_data.useDispatch)(import_block_editor.store);
  const { tabPanelClientId, tabsMenuClientId } = (0, import_data.useSelect)(
    (select) => {
      if (!tabsClientId) {
        return {
          tabPanelClientId: null,
          tabsMenuClientId: null
        };
      }
      const { getBlocks } = select(import_block_editor.store);
      const innerBlocks = getBlocks(tabsClientId);
      const tabPanel = innerBlocks.find(
        (block) => block.name === "core/tab-panel"
      );
      const tabsMenu = innerBlocks.find(
        (block) => block.name === "core/tabs-menu"
      );
      return {
        tabPanelClientId: tabPanel?.clientId || null,
        tabsMenuClientId: tabsMenu?.clientId || null
      };
    },
    [tabsClientId]
  );
  const addTab = () => {
    if (!tabPanelClientId) {
      return;
    }
    const newTabBlock = (0, import_blocks.createBlock)("core/tab", {
      label: (0, import_i18n.__)("Tab")
    });
    insertBlock(newTabBlock, void 0, tabPanelClientId);
    if (tabsMenuClientId) {
      const newMenuItemBlock = (0, import_blocks.createBlock)("core/tabs-menu-item", {});
      insertBlock(newMenuItemBlock, void 0, tabsMenuClientId);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.ToolbarButton,
    {
      className: "components-toolbar__control",
      onClick: addTab,
      text: (0, import_i18n.__)("Add tab")
    }
  ) }) });
}
//# sourceMappingURL=add-tab-toolbar-control.cjs.map
