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

// packages/block-library/src/tab-panel/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => Edit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_controls = __toESM(require("./controls.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function Edit({ clientId, isSelected }) {
  const {
    activeTabIndex,
    editorActiveTabIndex,
    blockIndex,
    hasInnerBlocksSelected,
    tabsClientId
  } = (0, import_data.useSelect)(
    (select) => {
      const {
        getBlockRootClientId,
        getBlockIndex,
        hasSelectedInnerBlock,
        getBlockAttributes
      } = select(import_block_editor.store);
      const tabPanelsClientId = getBlockRootClientId(clientId);
      const _tabsClientId = getBlockRootClientId(tabPanelsClientId);
      const tabsAttributes = getBlockAttributes(_tabsClientId) ?? {};
      const _blockIndex = getBlockIndex(clientId);
      const _hasInnerBlocksSelected = hasSelectedInnerBlock(
        clientId,
        true
      );
      return {
        activeTabIndex: tabsAttributes.activeTabIndex,
        editorActiveTabIndex: tabsAttributes.editorActiveTabIndex,
        blockIndex: _blockIndex,
        hasInnerBlocksSelected: _hasInnerBlocksSelected,
        tabsClientId: _tabsClientId
      };
    },
    [clientId]
  );
  const effectiveActiveIndex = editorActiveTabIndex ?? activeTabIndex;
  const { updateBlockAttributes, __unstableMarkNextChangeAsNotPersistent } = (0, import_data.useDispatch)(import_block_editor.store);
  (0, import_element.useEffect)(() => {
    const isTabSelected = isSelected || hasInnerBlocksSelected;
    if (isTabSelected && tabsClientId && effectiveActiveIndex !== blockIndex) {
      __unstableMarkNextChangeAsNotPersistent();
      updateBlockAttributes(tabsClientId, {
        editorActiveTabIndex: blockIndex
      });
    }
  }, [
    isSelected,
    hasInnerBlocksSelected,
    tabsClientId,
    effectiveActiveIndex,
    blockIndex,
    updateBlockAttributes,
    __unstableMarkNextChangeAsNotPersistent
  ]);
  const isActiveTab = effectiveActiveIndex === blockIndex;
  const isDefaultTab = activeTabIndex === blockIndex;
  const isSelectedTab = isSelected || hasInnerBlocksSelected || isActiveTab;
  const blockProps = (0, import_block_editor.useBlockProps)({
    hidden: !isSelectedTab,
    tabIndex: isSelectedTab ? 0 : -1
  });
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {});
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { ...innerBlocksProps, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_controls.default,
      {
        tabsClientId,
        blockIndex,
        isDefaultTab
      }
    ),
    isSelectedTab && innerBlocksProps.children
  ] });
}
//# sourceMappingURL=edit.cjs.map
