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

// packages/block-library/src/tab-list/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_tab_toolbar_controls = __toESM(require("../tabs/tab-toolbar-controls.cjs"));
var import_tab_movers = __toESM(require("./tab-movers.cjs"));
var import_use_tab_actions = __toESM(require("../tabs/use-tab-actions.cjs"));
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var EMPTY_ARRAY = [];
function Edit({
  attributes,
  clientId,
  setAttributes,
  __unstableLayoutClassNames: layoutClassNames
}) {
  const { ariaLabel } = attributes;
  const colorProps = (0, import_block_editor.__experimentalUseColorProps)(attributes);
  const borderProps = (0, import_block_editor.__experimentalUseBorderProps)(attributes);
  const spacingProps = (0, import_block_editor.__experimentalGetSpacingClassesAndStyles)(attributes);
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const { tabsClientId, tabPanels, editorActiveTabIndex, activeTabIndex } = (0, import_data.useSelect)(
    (select) => {
      const { getBlockRootClientId, getBlockAttributes, getBlocks } = select(import_block_editor.store);
      const rootClientId = getBlockRootClientId(clientId);
      const tabsAttributes = getBlockAttributes(rootClientId);
      const tabPanelsBlock = getBlocks(rootClientId)?.find(
        (block) => block.name === "core/tab-panels"
      );
      return {
        tabsClientId: rootClientId,
        tabPanels: tabPanelsBlock?.innerBlocks ?? EMPTY_ARRAY,
        editorActiveTabIndex: tabsAttributes?.editorActiveTabIndex,
        activeTabIndex: tabsAttributes?.activeTabIndex ?? 0
      };
    },
    [clientId]
  );
  const registry = (0, import_data.useRegistry)();
  const { isBlockSelected, hasSelectedInnerBlock } = (0, import_data.useSelect)(import_block_editor.store);
  const {
    updateBlockAttributes,
    selectBlock,
    __unstableMarkNextChangeAsNotPersistent
  } = (0, import_data.useDispatch)(import_block_editor.store);
  const { insertTab, removeTab } = (0, import_use_tab_actions.default)(tabsClientId);
  const effectiveActiveIndex = editorActiveTabIndex ?? activeTabIndex;
  const tabsList = (0, import_element.useMemo)(
    () => tabPanels.map((tab) => ({
      label: tab.attributes.label || "",
      clientId: tab.clientId
    })),
    [tabPanels]
  );
  function selectTabPanel(tabIndex) {
    if (tabsClientId && tabIndex !== effectiveActiveIndex) {
      registry.batch(() => {
        selectBlock(clientId);
        __unstableMarkNextChangeAsNotPersistent();
        updateBlockAttributes(tabsClientId, {
          editorActiveTabIndex: tabIndex
        });
      });
    }
  }
  function handleLabelChange(tabIndex, newLabel) {
    const tab = tabsList[tabIndex];
    if (tab?.clientId) {
      updateBlockAttributes(tab.clientId, { label: newLabel });
    }
  }
  const menuRef = (0, import_element.useRef)();
  const prevTabCountRef = (0, import_element.useRef)(tabsList.length);
  (0, import_element.useEffect)(() => {
    const prevCount = prevTabCountRef.current;
    prevTabCountRef.current = tabsList.length;
    if (!menuRef.current || tabsList.length === prevCount) {
      return;
    }
    if (!isBlockSelected(tabsClientId) && !hasSelectedInnerBlock(tabsClientId, true)) {
      return;
    }
    const focusButtonAt = (index) => {
      window.requestAnimationFrame(() => {
        const button = menuRef.current?.querySelectorAll("button")?.[index];
        (button?.querySelector("[contenteditable]") ?? button)?.focus();
      });
    };
    focusButtonAt(effectiveActiveIndex);
  }, [
    effectiveActiveIndex,
    hasSelectedInnerBlock,
    isBlockSelected,
    tabsClientId,
    tabsList.length
  ]);
  const blockProps = (0, import_block_editor.useBlockProps)({
    role: "tablist",
    ref: menuRef,
    // Applied manually since this block has no inner blocks for the layout
    // support to add its container classes to.
    className: layoutClassNames
  });
  const buttonClassName = (0, import_clsx.default)(colorProps.className, borderProps.className);
  const buttonStyle = {
    ...colorProps.style,
    ...borderProps.style,
    ...spacingProps.style
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "settings", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => setAttributes({
          ariaLabel: void 0
        }),
        dropdownMenuProps,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Label"),
            isShownByDefault: true,
            hasValue: () => !!ariaLabel,
            onDeselect: () => setAttributes({ ariaLabel: void 0 }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.TextControl,
              {
                label: (0, import_i18n.__)("Label"),
                help: (0, import_i18n.__)(
                  "Briefly describe this tab section for screen reader users. Examples: Event information, Product details, and Account settings."
                ),
                value: ariaLabel || "",
                onChange: (value) => setAttributes({
                  ariaLabel: value || void 0
                })
              }
            )
          }
        )
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_tab_movers.default, { tabsClientId }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_tab_toolbar_controls.default, { tabsClientId }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: tabsList.map((tab, index) => {
      const isActive = index === effectiveActiveIndex;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          role: "tab",
          "aria-selected": isActive,
          className: buttonClassName || void 0,
          style: buttonStyle,
          tabIndex: -1,
          onFocus: () => {
            selectTabPanel(index);
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.RichText,
            {
              tagName: "span",
              withoutInteractiveFormatting: true,
              placeholder: (0, import_i18n.__)("Tab title"),
              value: tab.label,
              onChange: (newLabel) => handleLabelChange(index, newLabel),
              __unstableOnSplitAtEnd: () => insertTab(index + 1),
              onRemove: () => removeTab(index)
            }
          )
        },
        tab.clientId || index
      );
    }) })
  ] });
}
var edit_default = Edit;
//# sourceMappingURL=edit.cjs.map
