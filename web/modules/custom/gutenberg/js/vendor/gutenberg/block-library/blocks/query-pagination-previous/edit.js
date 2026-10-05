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

// packages/block-library/src/query-pagination-previous/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => QueryPaginationPreviousEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
var arrowMap = {
  none: "",
  arrow: "←",
  chevron: "«"
};
function QueryPaginationPreviousEdit({
  attributes: { label },
  setAttributes,
  context: { paginationArrow, showLabel }
}) {
  const displayArrow = arrowMap[paginationArrow];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "a",
    {
      href: "#pagination-previous-pseudo-link",
      onClick: (event) => event.preventDefault(),
      ...(0, import_block_editor.useBlockProps)(),
      children: [
        displayArrow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "span",
          {
            className: `wp-block-query-pagination-previous-arrow is-arrow-${paginationArrow}`,
            "aria-hidden": true,
            children: displayArrow
          }
        ),
        showLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_block_editor.PlainText,
          {
            __experimentalVersion: 2,
            tagName: "span",
            "aria-label": (0, import_i18n.__)("Previous page link"),
            placeholder: (0, import_i18n.__)("Previous Page"),
            value: label,
            onChange: (newLabel) => setAttributes({ label: newLabel })
          }
        )
      ]
    }
  );
}
//# sourceMappingURL=edit.cjs.map
