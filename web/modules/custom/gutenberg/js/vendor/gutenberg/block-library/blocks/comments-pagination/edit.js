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

// packages/block-library/src/comments-pagination/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => QueryPaginationEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_components = require("@wordpress/components");
var import_comments_pagination_arrow_controls = require("./comments-pagination-arrow-controls.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function QueryPaginationEdit({
  attributes: { paginationArrow },
  setAttributes,
  clientId
}) {
  const hasNextPreviousBlocks = (0, import_data.useSelect)((select) => {
    const { getBlocks } = select(import_block_editor.store);
    const innerBlocks = getBlocks(clientId);
    return innerBlocks?.find((innerBlock) => {
      return [
        "core/comments-pagination-previous",
        "core/comments-pagination-next"
      ].includes(innerBlock.name);
    });
  }, []);
  const blockProps = (0, import_block_editor.useBlockProps)();
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps);
  const pageComments = (0, import_data.useSelect)((select) => {
    const { getSettings } = select(import_block_editor.store);
    const { __experimentalDiscussionSettings } = getSettings();
    return __experimentalDiscussionSettings?.pageComments;
  }, []);
  if (!pageComments) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.Warning, { children: (0, import_i18n.__)(
      "Comments Pagination block: paging comments is disabled in the Discussion Settings"
    ) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    hasNextPreviousBlocks && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        dropdownMenuProps,
        resetAll: () => setAttributes({ paginationArrow: "none" }),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Arrow"),
            hasValue: () => paginationArrow !== "none",
            onDeselect: () => setAttributes({ paginationArrow: "none" }),
            isShownByDefault: true,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_comments_pagination_arrow_controls.CommentsPaginationArrowControls,
              {
                value: paginationArrow,
                onChange: (value) => {
                  setAttributes({ paginationArrow: value });
                }
              }
            )
          }
        )
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...innerBlocksProps })
  ] });
}
//# sourceMappingURL=edit.cjs.map
