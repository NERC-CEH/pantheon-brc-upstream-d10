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

// packages/block-library/src/html/preview.jsx
var preview_exports = {};
__export(preview_exports, {
  default: () => HTMLEditPreview
});
module.exports = __toCommonJS(preview_exports);
var import_element = require("@wordpress/element");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_i18n = require("@wordpress/i18n");
var import_jsx_runtime = require("react/jsx-runtime");
var DEFAULT_STYLES = `
	html,body,:root {
		margin: 0 !important;
		padding: 0 !important;
		overflow: visible !important;
		min-height: auto !important;
	}
`;
function HTMLEditPreview({ content, isSelected }) {
  const settingStyles = (0, import_data.useSelect)(
    (select) => select(import_block_editor.store).getSettings().styles,
    []
  );
  const styles = (0, import_element.useMemo)(
    () => [
      DEFAULT_STYLES,
      ...(0, import_block_editor.transformStyles)(
        (settingStyles ?? []).filter((style) => style.css)
      )
    ],
    [settingStyles]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.SandBox,
      {
        html: content,
        styles,
        title: (0, import_i18n.__)("Custom HTML Preview"),
        tabIndex: -1
      }
    ),
    !isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "block-library-html__preview-overlay" })
  ] });
}
//# sourceMappingURL=preview.cjs.map
