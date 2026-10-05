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

// packages/block-library/src/form-submit-button/edit.js
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
var TEMPLATE = [
  [
    "core/buttons",
    {},
    [
      [
        "core/button",
        {
          text: (0, import_i18n.__)("Submit"),
          tagName: "button",
          type: "submit"
        }
      ]
    ]
  ]
];
var Edit = () => {
  const blockProps = (0, import_block_editor.useBlockProps)();
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    template: TEMPLATE,
    templateLock: "all"
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-form-submit-wrapper", ...innerBlocksProps });
};
var edit_default = Edit;
//# sourceMappingURL=edit.cjs.map
