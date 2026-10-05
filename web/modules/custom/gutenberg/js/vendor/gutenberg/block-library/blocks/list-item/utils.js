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

// packages/block-library/src/list-item/utils.js
var utils_exports = {};
__export(utils_exports, {
  getIndentTarget: () => getIndentTarget,
  getOutdentTarget: () => getOutdentTarget,
  indentListItems: () => indentListItems,
  moveBlocksToNestedList: () => moveBlocksToNestedList,
  outdentListItems: () => outdentListItems
});
module.exports = __toCommonJS(utils_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_blocks = require("@wordpress/blocks");
function getIndentTarget(select, clientId) {
  return select.getPreviousBlockClientId(clientId);
}
function getOutdentTarget(select, clientId) {
  const listId = select.getBlockRootClientId(clientId);
  const parentListItemId = select.getBlockRootClientId(listId);
  if (!parentListItemId || select.getBlockName(parentListItemId) !== "core/list-item") {
    return void 0;
  }
  return parentListItemId;
}
function moveBlocksToNestedList(registry, clientIds, sourceListId, listItemId) {
  const { getBlockOrder, getBlock } = registry.select(import_block_editor.store);
  const { moveBlocksToPosition, removeBlocks, insertBlock } = registry.dispatch(import_block_editor.store);
  const nestedLists = getBlockOrder(listItemId);
  const nestedListId = nestedLists[nestedLists.length - 1];
  if (nestedListId) {
    moveBlocksToPosition(clientIds, sourceListId, nestedListId);
    return;
  }
  const nestedList = (0, import_blocks.cloneBlock)(
    getBlock(sourceListId),
    {},
    clientIds.map((id) => getBlock(id))
  );
  registry.batch(() => {
    removeBlocks(clientIds, false);
    insertBlock(nestedList, 0, listItemId, false);
  });
}
function indentListItems(registry, clientId) {
  const select = registry.select(import_block_editor.store);
  const {
    getBlockRootClientId,
    getSelectedBlockClientIds,
    getSelectionStart,
    getSelectionEnd,
    hasMultiSelection,
    getMultiSelectedBlockClientIds
  } = select;
  const { selectionChange, multiSelect } = registry.dispatch(import_block_editor.store);
  const _hasMultiSelection = hasMultiSelection();
  const clientIds = _hasMultiSelection ? getMultiSelectedBlockClientIds() : getSelectedBlockClientIds();
  if (clientId === void 0) {
    clientId = clientIds[0];
  }
  const previousSiblingId = getIndentTarget(select, clientId);
  if (!previousSiblingId) {
    return false;
  }
  const rootClientId = getBlockRootClientId(clientId);
  const selectionStart = getSelectionStart();
  const selectionEnd = getSelectionEnd();
  registry.batch(() => {
    moveBlocksToNestedList(
      registry,
      clientIds,
      rootClientId,
      previousSiblingId
    );
    if (!_hasMultiSelection) {
      selectionChange(
        clientIds[0],
        selectionEnd.attributeKey,
        selectionEnd.clientId === selectionStart.clientId ? selectionStart.offset : selectionEnd.offset,
        selectionEnd.offset
      );
    } else {
      multiSelect(clientIds[0], clientIds[clientIds.length - 1]);
    }
  });
  return true;
}
function outdentListItems(registry, clientIds) {
  const select = registry.select(import_block_editor.store);
  const {
    getBlockRootClientId,
    getBlockName,
    getBlockOrder,
    getBlockIndex,
    getSelectedBlockClientIds
  } = select;
  const { moveBlocksToPosition, removeBlock, multiSelect } = registry.dispatch(import_block_editor.store);
  if (clientIds === void 0) {
    clientIds = getSelectedBlockClientIds();
  }
  if (!Array.isArray(clientIds)) {
    clientIds = [clientIds];
  }
  if (!clientIds.length) {
    return false;
  }
  const firstClientId = clientIds[0];
  if (getBlockName(firstClientId) !== "core/list-item") {
    return false;
  }
  const parentListItemId = getOutdentTarget(select, firstClientId);
  if (!parentListItemId) {
    return false;
  }
  const parentListId = getBlockRootClientId(firstClientId);
  const lastClientId = clientIds[clientIds.length - 1];
  const order = getBlockOrder(parentListId);
  const followingListItems = order.slice(getBlockIndex(lastClientId) + 1);
  registry.batch(() => {
    if (followingListItems.length) {
      moveBlocksToNestedList(
        registry,
        followingListItems,
        parentListId,
        firstClientId
      );
    }
    moveBlocksToPosition(
      clientIds,
      parentListId,
      getBlockRootClientId(parentListItemId),
      getBlockIndex(parentListItemId) + 1
    );
    if (!getBlockOrder(parentListId).length) {
      const shouldSelectParent = false;
      removeBlock(parentListId, shouldSelectParent);
    }
    if (clientIds.length > 1) {
      multiSelect(firstClientId, lastClientId);
    }
  });
  return true;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getIndentTarget,
  getOutdentTarget,
  indentListItems,
  moveBlocksToNestedList,
  outdentListItems
});
//# sourceMappingURL=utils.cjs.map
