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

// packages/block-library/src/comments-pagination-numbers/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => CommentsPaginationNumbersEdit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
var PaginationItem = ({ content, tag: Tag = "a", extraClass = "" }) => Tag === "a" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
  Tag,
  {
    className: `page-numbers ${extraClass}`,
    href: "#comments-pagination-numbers-pseudo-link",
    onClick: (event) => event.preventDefault(),
    children: content
  }
) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: `page-numbers ${extraClass}`, children: content });
function CommentsPaginationNumbersEdit() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...(0, import_block_editor.useBlockProps)(), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { content: "1" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { content: "2" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { content: "3", tag: "span", extraClass: "current" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { content: "4" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { content: "5" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { content: "...", tag: "span", extraClass: "dots" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { content: "8" })
  ] });
}
//# sourceMappingURL=edit.cjs.map
