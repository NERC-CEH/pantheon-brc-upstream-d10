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

// packages/block-library/src/tab/edit.js
var edit_exports = {};
__export(edit_exports, {
  default: () => Edit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_controls = __toESM(require("./controls.cjs"));
var import_slug_from_label = __toESM(require("./slug-from-label.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var TEMPLATE = [
  [
    "core/paragraph",
    {
      placeholder: (0, import_i18n.__)("Type / to choose a block")
    }
  ]
];
var { cancelAnimationFrame } = window;
function Edit({
  attributes,
  clientId,
  context,
  isSelected,
  __unstableLayoutClassNames: layoutClassNames
}) {
  const focusRef = (0, import_element.useRef)();
  const { anchor, label } = attributes;
  const activeTabIndex = context["core/tabs-activeTabIndex"] ?? 0;
  const editorActiveTabIndex = context["core/tabs-editorActiveTabIndex"];
  const effectiveActiveIndex = editorActiveTabIndex ?? activeTabIndex;
  (0, import_element.useEffect)(() => {
    return () => {
      if (focusRef.current) {
        cancelAnimationFrame(focusRef.current);
      }
    };
  }, []);
  const { blockIndex, hasInnerBlocksSelected, tabsClientId } = (0, import_data.useSelect)(
    (select) => {
      const {
        getBlockRootClientId,
        getBlockIndex,
        hasSelectedInnerBlock
      } = select(import_block_editor.store);
      const tabPanelClientId = getBlockRootClientId(clientId);
      const _tabsClientId = getBlockRootClientId(tabPanelClientId);
      const _blockIndex = getBlockIndex(clientId);
      const _hasInnerBlocksSelected = hasSelectedInnerBlock(
        clientId,
        true
      );
      return {
        blockIndex: _blockIndex,
        hasInnerBlocksSelected: _hasInnerBlocksSelected,
        tabsClientId: _tabsClientId
      };
    },
    [clientId]
  );
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
  const isSelectedTab = (0, import_element.useMemo)(() => {
    if (isSelected || hasInnerBlocksSelected) {
      return true;
    }
    if (isActiveTab) {
      return true;
    }
    return false;
  }, [isSelected, hasInnerBlocksSelected, isActiveTab]);
  const tabPanelId = (0, import_element.useMemo)(
    () => anchor || (0, import_slug_from_label.default)(label, blockIndex),
    [anchor, label, blockIndex]
  );
  const tabLabelId = (0, import_element.useMemo)(() => `${tabPanelId}--tab`, [tabPanelId]);
  const blockProps = (0, import_block_editor.useBlockProps)({
    hidden: !isSelectedTab,
    "aria-labelledby": tabLabelId,
    id: tabPanelId,
    role: "tabpanel",
    tabIndex: isSelectedTab ? 0 : -1,
    className: (0, import_clsx.default)("wp-block-tab__editor-content", layoutClassNames)
  });
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    template: TEMPLATE
  });
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
