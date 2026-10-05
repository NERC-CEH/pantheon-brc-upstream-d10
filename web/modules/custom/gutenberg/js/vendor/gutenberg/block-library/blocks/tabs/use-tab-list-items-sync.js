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

// packages/block-library/src/tabs/use-tab-list-items-sync.js
var use_tab_list_items_sync_exports = {};
__export(use_tab_list_items_sync_exports, {
  default: () => useTabListItemsSync
});
module.exports = __toCommonJS(use_tab_list_items_sync_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var EMPTY_ARRAY = [];
function useTabListItemsSync(tabsClientId) {
  const { tabPanels, tabListClientId } = (0, import_data.useSelect)(
    (select) => {
      const { getBlocks } = select(import_block_editor.store);
      const innerBlocks = getBlocks(tabsClientId);
      const tabPanelsBlock = innerBlocks.find(
        (block) => block.name === "core/tab-panels"
      );
      const tabList = innerBlocks.find(
        (block) => block.name === "core/tab-list"
      );
      return {
        tabPanels: tabPanelsBlock?.innerBlocks ?? EMPTY_ARRAY,
        tabListClientId: tabList?.clientId ?? null
      };
    },
    [tabsClientId]
  );
  const { updateBlockAttributes, __unstableMarkNextChangeAsNotPersistent } = (0, import_data.useDispatch)(import_block_editor.store);
  const { getBlockAttributes } = (0, import_data.useSelect)(import_block_editor.store);
  (0, import_element.useEffect)(() => {
    if (!tabListClientId) {
      return;
    }
    const newTabs = tabPanels.map((tab) => ({
      label: tab.attributes.label || ""
    }));
    const currentTabs = getBlockAttributes(tabListClientId)?.tabs ?? [];
    if (JSON.stringify(newTabs) === JSON.stringify(currentTabs)) {
      return;
    }
    __unstableMarkNextChangeAsNotPersistent();
    updateBlockAttributes(tabListClientId, { tabs: newTabs });
  }, [
    tabPanels,
    tabListClientId,
    getBlockAttributes,
    updateBlockAttributes,
    __unstableMarkNextChangeAsNotPersistent
  ]);
}
//# sourceMappingURL=use-tab-list-items-sync.cjs.map
