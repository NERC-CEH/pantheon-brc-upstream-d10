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

// packages/block-library/src/list-item/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  IndentUI: () => IndentUI,
  default: () => ListItemEdit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_icons = require("@wordpress/icons");
var import_compose = require("@wordpress/compose");
var import_data = require("@wordpress/data");
var import_keycodes = require("@wordpress/keycodes");
var import_hooks = require("./hooks/index.cjs");
var import_utils = require("./utils.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function IndentUI({ clientId }) {
  const registry = (0, import_data.useRegistry)();
  const { canIndent, canOutdent } = (0, import_data.useSelect)(
    (select) => {
      const storeSelect = select(import_block_editor.store);
      return {
        canIndent: !!(0, import_utils.getIndentTarget)(storeSelect, clientId),
        canOutdent: !!(0, import_utils.getOutdentTarget)(storeSelect, clientId)
      };
    },
    [clientId]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarButton,
      {
        icon: (0, import_i18n.isRTL)() ? import_icons.formatOutdentRTL : import_icons.formatOutdent,
        title: (0, import_i18n.__)("Outdent"),
        shortcut: import_keycodes.displayShortcut.shift("Tab"),
        description: (0, import_i18n.__)("Outdent list item"),
        disabled: !canOutdent,
        onClick: () => (0, import_utils.outdentListItems)(registry)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarButton,
      {
        icon: (0, import_i18n.isRTL)() ? import_icons.formatIndentRTL : import_icons.formatIndent,
        title: (0, import_i18n.__)("Indent"),
        shortcut: "Tab",
        description: (0, import_i18n.__)("Indent list item"),
        disabled: !canIndent,
        onClick: () => (0, import_utils.indentListItems)(registry, clientId)
      }
    )
  ] });
}
function ListItemEdit({
  attributes,
  setAttributes,
  clientId,
  mergeBlocks
}) {
  const { placeholder, content } = attributes;
  const blockProps = (0, import_block_editor.useBlockProps)();
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    renderAppender: false,
    __unstableDisableDropZone: true
  });
  const useEnterRef = (0, import_hooks.useEnter)(clientId);
  const useTabRef = (0, import_hooks.useTab)();
  const useMultiSelectTabRef = (0, import_hooks.useMultiSelectTab)(clientId);
  const onMerge = (0, import_hooks.useMerge)(clientId, mergeBlocks);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { ...innerBlocksProps, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText,
        {
          ref: (0, import_compose.useMergeRefs)([
            useEnterRef,
            useTabRef,
            useMultiSelectTabRef
          ]),
          identifier: "content",
          tagName: "div",
          onChange: (nextContent) => setAttributes({ content: nextContent }),
          value: content,
          "aria-label": (0, import_i18n.__)("List text"),
          placeholder: placeholder || (0, import_i18n.__)("List"),
          onMerge
        }
      ),
      innerBlocksProps.children
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndentUI, { clientId }) })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IndentUI
});
//# sourceMappingURL=edit.cjs.map
