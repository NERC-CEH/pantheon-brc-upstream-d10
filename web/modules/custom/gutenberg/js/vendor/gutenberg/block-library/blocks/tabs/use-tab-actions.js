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

// packages/block-library/src/tabs/use-tab-actions.js
var use_tab_actions_exports = {};
__export(use_tab_actions_exports, {
  default: () => useTabActions
});
module.exports = __toCommonJS(use_tab_actions_exports);
var import_blocks = require("@wordpress/blocks");
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
function useTabActions(tabsClientId) {
  const registry = (0, import_data.useRegistry)();
  const {
    insertBlock,
    removeBlock,
    moveBlocksToPosition,
    updateBlockAttributes,
    __unstableMarkNextChangeAsNotPersistent
  } = (0, import_data.useDispatch)(import_block_editor.store);
  const getTabsState = () => {
    const { getBlocks, getBlockAttributes } = registry.select(import_block_editor.store);
    const tabsAttributes = tabsClientId ? getBlockAttributes(tabsClientId) : void 0;
    const tabPanels = tabsClientId ? getBlocks(tabsClientId).find(
      (block) => block.name === "core/tab-panels"
    ) : void 0;
    return {
      tabPanelsClientId: tabPanels?.clientId ?? null,
      tabPanelBlocks: tabPanels?.innerBlocks ?? [],
      activeIndex: tabsAttributes?.editorActiveTabIndex ?? tabsAttributes?.activeTabIndex ?? 0
    };
  };
  const insertTab = (atIndex) => {
    const { tabPanelsClientId, tabPanelBlocks } = getTabsState();
    if (!tabPanelsClientId) {
      return;
    }
    const newIndex = atIndex ?? tabPanelBlocks.length;
    insertBlock(
      (0, import_blocks.createBlock)("core/tab-panel"),
      newIndex,
      tabPanelsClientId,
      false
    );
    __unstableMarkNextChangeAsNotPersistent();
    updateBlockAttributes(tabsClientId, {
      editorActiveTabIndex: newIndex
    });
  };
  const removeTab = (atIndex) => {
    const { tabPanelBlocks, activeIndex } = getTabsState();
    const tabCount = tabPanelBlocks.length;
    if (tabCount <= 1) {
      return;
    }
    const removeIndex = atIndex ?? activeIndex;
    const target = tabPanelBlocks[removeIndex];
    if (!target) {
      return;
    }
    const newActiveIndex = removeIndex >= tabCount - 1 ? tabCount - 2 : removeIndex;
    __unstableMarkNextChangeAsNotPersistent();
    updateBlockAttributes(tabsClientId, {
      editorActiveTabIndex: newActiveIndex
    });
    removeBlock(target.clientId, false);
  };
  const moveTab = (direction) => {
    const { tabPanelsClientId, tabPanelBlocks, activeIndex } = getTabsState();
    if (!tabPanelsClientId) {
      return;
    }
    const toIndex = activeIndex + direction;
    const target = tabPanelBlocks[activeIndex];
    if (!target || toIndex < 0 || toIndex >= tabPanelBlocks.length) {
      return;
    }
    __unstableMarkNextChangeAsNotPersistent();
    updateBlockAttributes(tabsClientId, {
      editorActiveTabIndex: toIndex
    });
    moveBlocksToPosition(
      [target.clientId],
      tabPanelsClientId,
      tabPanelsClientId,
      toIndex
    );
  };
  return { insertTab, removeTab, moveTab };
}
//# sourceMappingURL=use-tab-actions.cjs.map
