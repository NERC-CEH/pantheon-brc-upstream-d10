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

// packages/block-library/src/paragraph/use-enter.js
var use_enter_exports = {};
__export(use_enter_exports, {
  useOnEnter: () => useOnEnter
});
module.exports = __toCommonJS(use_enter_exports);
var import_element = require("@wordpress/element");
var import_compose = require("@wordpress/compose");
var import_rich_text = require("@wordpress/rich-text");
var import_data = require("@wordpress/data");
var import_block_editor = require("@wordpress/block-editor");
var import_blocks = require("@wordpress/blocks");
var import_lock_unlock = require("../lock-unlock.cjs");
var { subscribeOwnedListener } = (0, import_lock_unlock.unlock)(import_rich_text.privateApis);
function useOnEnter(props) {
  const { batch } = (0, import_data.useRegistry)();
  const { moveBlocksToPosition, replaceBlocks, selectionChange } = (0, import_data.useDispatch)(import_block_editor.store);
  const {
    getBlockRootClientId,
    getBlockIndex,
    getBlockOrder,
    getBlockName,
    getBlock,
    canInsertBlockType
  } = (0, import_data.useSelect)(import_block_editor.store);
  const propsRef = (0, import_element.useRef)(props);
  propsRef.current = props;
  return (0, import_compose.useRefEffect)((element) => {
    function onBeforeInput(event) {
      if (event.defaultPrevented) {
        return;
      }
      if (event.inputType !== "insertParagraph") {
        return;
      }
      const { content, clientId } = propsRef.current;
      if (content.length) {
        return;
      }
      const wrapperClientId = getBlockRootClientId(clientId);
      if (!(0, import_blocks.hasBlockSupport)(
        getBlockName(wrapperClientId),
        "__experimentalOnEnter",
        false
      )) {
        return;
      }
      const order = getBlockOrder(wrapperClientId);
      const position = order.indexOf(clientId);
      if (position === order.length - 1) {
        let newWrapperClientId = wrapperClientId;
        while (!canInsertBlockType(
          getBlockName(clientId),
          getBlockRootClientId(newWrapperClientId)
        )) {
          newWrapperClientId = getBlockRootClientId(newWrapperClientId);
        }
        if (typeof newWrapperClientId === "string") {
          event.preventDefault();
          moveBlocksToPosition(
            [clientId],
            wrapperClientId,
            getBlockRootClientId(newWrapperClientId),
            getBlockIndex(newWrapperClientId) + 1
          );
        }
        return;
      }
      const defaultBlockName = (0, import_blocks.getDefaultBlockName)();
      const wrapperBlockName = getBlockName(wrapperClientId);
      const grandparentClientId = getBlockRootClientId(wrapperClientId);
      if (!canInsertBlockType(defaultBlockName, grandparentClientId) || !canInsertBlockType(wrapperBlockName, grandparentClientId)) {
        return;
      }
      event.preventDefault();
      const wrapperBlock = getBlock(wrapperClientId);
      const head = (0, import_blocks.cloneBlock)({
        ...wrapperBlock,
        innerBlocks: wrapperBlock.innerBlocks.slice(0, position)
      });
      const middle = (0, import_blocks.createBlock)(defaultBlockName);
      const tail = (0, import_blocks.cloneBlock)({
        ...wrapperBlock,
        innerBlocks: wrapperBlock.innerBlocks.slice(position + 1)
      });
      batch(() => {
        replaceBlocks(wrapperClientId, [head, middle, tail]);
        selectionChange(middle.clientId);
      });
    }
    return subscribeOwnedListener(
      element,
      "beforeinput",
      onBeforeInput,
      true
    );
  }, []);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useOnEnter
});
//# sourceMappingURL=use-enter.cjs.map
