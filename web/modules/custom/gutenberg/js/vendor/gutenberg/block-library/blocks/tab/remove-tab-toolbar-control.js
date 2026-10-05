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

// packages/block-library/src/tab/remove-tab-toolbar-control.js
var remove_tab_toolbar_control_exports = {};
__export(remove_tab_toolbar_control_exports, {
  default: () => RemoveTabToolbarControl
});
module.exports = __toCommonJS(remove_tab_toolbar_control_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_data = require("@wordpress/data");
var import_jsx_runtime = require("react/jsx-runtime");
function RemoveTabToolbarControl({ tabsClientId }) {
  const {
    removeBlock,
    updateBlockAttributes,
    selectBlock,
    __unstableMarkNextChangeAsNotPersistent
  } = (0, import_data.useDispatch)(import_block_editor.store);
  const {
    activeTabClientId,
    activeMenuItemClientId,
    tabCount,
    editorActiveTabIndex
  } = (0, import_data.useSelect)(
    (select) => {
      if (!tabsClientId) {
        return {
          activeTabClientId: null,
          activeMenuItemClientId: null,
          tabCount: 0,
          editorActiveTabIndex: 0
        };
      }
      const { getBlocks, getBlockAttributes } = select(import_block_editor.store);
      const tabsAttributes = getBlockAttributes(tabsClientId);
      const activeIndex = tabsAttributes?.editorActiveTabIndex ?? tabsAttributes?.activeTabIndex ?? 0;
      const innerBlocks = getBlocks(tabsClientId);
      const tabPanel = innerBlocks.find(
        (block) => block.name === "core/tab-panel"
      );
      const tabsMenu = innerBlocks.find(
        (block) => block.name === "core/tabs-menu"
      );
      const tabs = tabPanel?.innerBlocks || [];
      const menuItems = tabsMenu?.innerBlocks || [];
      const activeTab = tabs[activeIndex];
      const activeMenuItem = menuItems[activeIndex];
      return {
        activeTabClientId: activeTab?.clientId || null,
        activeMenuItemClientId: activeMenuItem?.clientId || null,
        tabCount: tabs.length,
        editorActiveTabIndex: activeIndex
      };
    },
    [tabsClientId]
  );
  const removeTab = () => {
    if (!activeTabClientId || tabCount <= 1) {
      return;
    }
    const newActiveIndex = editorActiveTabIndex >= tabCount - 1 ? tabCount - 2 : editorActiveTabIndex;
    __unstableMarkNextChangeAsNotPersistent();
    updateBlockAttributes(tabsClientId, {
      editorActiveTabIndex: newActiveIndex
    });
    removeBlock(activeTabClientId, false);
    if (activeMenuItemClientId) {
      removeBlock(activeMenuItemClientId, false);
    }
    if (tabsClientId) {
      selectBlock(tabsClientId);
    }
  };
  const isDisabled = tabCount <= 1 || !activeTabClientId;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.ToolbarButton,
    {
      className: "components-toolbar__control",
      onClick: removeTab,
      text: (0, import_i18n.__)("Remove tab"),
      disabled: isDisabled
    }
  ) }) });
}
//# sourceMappingURL=remove-tab-toolbar-control.cjs.map
