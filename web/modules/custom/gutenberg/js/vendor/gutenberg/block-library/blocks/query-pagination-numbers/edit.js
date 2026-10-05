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

// packages/block-library/src/query-pagination-numbers/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => QueryPaginationNumbersEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var createPaginationItem = (content, Tag = "a", extraClass = "") => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: `page-numbers ${extraClass}`, children: content }, content);
var previewPaginationNumbers = (midSize) => {
  const paginationItems = [];
  for (let i = 1; i <= midSize; i++) {
    paginationItems.push(createPaginationItem(i));
  }
  paginationItems.push(
    createPaginationItem(midSize + 1, "span", "current")
  );
  for (let i = 1; i <= midSize; i++) {
    paginationItems.push(createPaginationItem(midSize + 1 + i));
  }
  paginationItems.push(createPaginationItem("...", "span", "dots"));
  paginationItems.push(createPaginationItem(midSize * 2 + 3));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: paginationItems });
};
function QueryPaginationNumbersEdit({
  attributes,
  setAttributes
}) {
  const { midSize } = attributes;
  const paginationNumbers = previewPaginationNumbers(
    parseInt(midSize, 10)
  );
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => setAttributes({ midSize: 2 }),
        dropdownMenuProps,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Number of links"),
            hasValue: () => midSize !== 2,
            onDeselect: () => setAttributes({ midSize: 2 }),
            isShownByDefault: true,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.RangeControl,
              {
                label: (0, import_i18n.__)("Number of links"),
                help: (0, import_i18n.__)(
                  "Specify how many links can appear before and after the current page number. Links to the first, current and last page are always visible."
                ),
                value: midSize,
                onChange: (value) => {
                  setAttributes({
                    midSize: parseInt(value, 10)
                  });
                },
                min: 0,
                max: 5,
                withInputField: false
              }
            )
          }
        )
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...(0, import_block_editor.useBlockProps)(), children: paginationNumbers })
  ] });
}
//# sourceMappingURL=edit.cjs.map
