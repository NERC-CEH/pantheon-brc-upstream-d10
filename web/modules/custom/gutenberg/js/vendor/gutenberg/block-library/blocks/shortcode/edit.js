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

// packages/block-library/src/shortcode/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => ShortcodeEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_compose = require("@wordpress/compose");
var import_components = require("@wordpress/components");
var import_icons = require("@wordpress/icons");
var import_jsx_runtime = require("react/jsx-runtime");
function ShortcodeEdit({ attributes, setAttributes }) {
  const instanceId = (0, import_compose.useInstanceId)(ShortcodeEdit);
  const inputId = `blocks-shortcode-input-${instanceId}`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...(0, import_block_editor.useBlockProps)(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Placeholder, { icon: import_icons.shortcode, label: (0, import_i18n.__)("Shortcode"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.PlainText,
    {
      className: "blocks-shortcode__textarea",
      id: inputId,
      value: attributes.text,
      "aria-label": (0, import_i18n.__)("Shortcode text"),
      placeholder: (0, import_i18n.__)("Write shortcode here…"),
      onChange: (text) => setAttributes({ text })
    }
  ) }) });
}
//# sourceMappingURL=edit.cjs.map
