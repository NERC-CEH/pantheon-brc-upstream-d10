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

// packages/block-library/src/tabs-menu-item/edit.js
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_controls = __toESM(require("./controls.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var EMPTY_ARRAY = [];
function Edit({
  context,
  clientId,
  __unstableLayoutClassNames: layoutClassNames
}) {
  const tabsList = context["core/tabs-list"] || EMPTY_ARRAY;
  const activeTabIndex = context["core/tabs-activeTabIndex"] ?? 0;
  const editorActiveTabIndex = context["core/tabs-editorActiveTabIndex"];
  const effectiveActiveIndex = (0, import_element.useMemo)(() => {
    return editorActiveTabIndex ?? activeTabIndex;
  }, [editorActiveTabIndex, activeTabIndex]);
  const { menuItemIndex, tabsClientId, selectedTabClientId } = (0, import_data.useSelect)(
    (select) => {
      const {
        getBlockOrder,
        getBlockRootClientId,
        getSelectedBlockClientIds,
        hasSelectedInnerBlock
      } = select(import_block_editor.store);
      const _tabsMenuClientId = getBlockRootClientId(clientId);
      const _tabsClientId = _tabsMenuClientId ? getBlockRootClientId(_tabsMenuClientId) : null;
      const siblings = getBlockOrder(_tabsMenuClientId);
      const _menuItemIndex = siblings.indexOf(clientId);
      const selectedIds = getSelectedBlockClientIds();
      let _selectedTabClientId = null;
      for (const tab2 of tabsList) {
        if (selectedIds.includes(tab2.clientId) || hasSelectedInnerBlock(tab2.clientId, true)) {
          _selectedTabClientId = tab2.clientId;
          break;
        }
      }
      return {
        menuItemIndex: _menuItemIndex,
        tabsClientId: _tabsClientId,
        selectedTabClientId: _selectedTabClientId
      };
    },
    [clientId, tabsList]
  );
  const tab = tabsList[menuItemIndex] || {};
  const tabListIndex = tab.index ?? menuItemIndex;
  const tabId = tab.id || `tab-${menuItemIndex}`;
  const tabClientId = tab.clientId || "";
  const label = tab.label || "";
  const isActive = tabListIndex === effectiveActiveIndex;
  const isSelected = tabClientId === selectedTabClientId;
  const { __unstableMarkNextChangeAsNotPersistent, updateBlockAttributes } = (0, import_data.useDispatch)(import_block_editor.store);
  const handleTabClick = (0, import_element.useCallback)(
    (event) => {
      event.preventDefault();
      if (tabsClientId && tabListIndex !== effectiveActiveIndex) {
        __unstableMarkNextChangeAsNotPersistent();
        updateBlockAttributes(tabsClientId, {
          editorActiveTabIndex: tabListIndex
        });
      }
    },
    [
      tabsClientId,
      tabListIndex,
      effectiveActiveIndex,
      updateBlockAttributes,
      __unstableMarkNextChangeAsNotPersistent
    ]
  );
  const handleLabelChange = (0, import_element.useCallback)(
    (newLabel) => {
      if (tabClientId) {
        updateBlockAttributes(tabClientId, { label: newLabel });
      }
    },
    [tabClientId, updateBlockAttributes]
  );
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: (0, import_clsx.default)(layoutClassNames, {
      "is-active": isActive,
      "is-selected": isSelected
    }),
    "aria-controls": tabId,
    "aria-selected": isActive,
    id: `${tabId}--tab`,
    role: "tab",
    tabIndex: -1,
    onClick: handleTabClick
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_controls.default, { tabsClientId }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { ...blockProps, type: "button", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText,
      {
        tagName: "span",
        withoutInteractiveFormatting: true,
        placeholder: (0, import_i18n.__)("Tab title"),
        value: label,
        onChange: handleLabelChange
      }
    ) })
  ] });
}
var edit_default = Edit;
//# sourceMappingURL=edit.cjs.map
