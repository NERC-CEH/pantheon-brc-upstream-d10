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

// packages/block-library/src/term-description/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => TermDescriptionEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_use_term_description = require("./use-term-description.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function TermDescriptionEdit({
  context: { termId, taxonomy }
}) {
  const { termDescription } = (0, import_use_term_description.useTermDescription)(termId, taxonomy);
  const blockProps = (0, import_block_editor.useBlockProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: termDescription ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      dangerouslySetInnerHTML: { __html: termDescription }
    }
  ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-term-description__placeholder", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: (0, import_i18n.__)("Term Description") }) }) }) });
}
//# sourceMappingURL=edit.cjs.map
