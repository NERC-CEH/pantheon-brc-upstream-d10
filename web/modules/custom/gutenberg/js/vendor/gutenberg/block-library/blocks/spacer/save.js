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

// packages/block-library/src/spacer/save.jsx
var save_exports = {};
__export(save_exports, {
  default: () => save
});
module.exports = __toCommonJS(save_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
function save({ attributes }) {
  const { height, width, style } = attributes;
  const { layout: { selfStretch } = {} } = style || {};
  const finalHeight = selfStretch === "fill" || selfStretch === "fit" ? void 0 : height;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      ...import_block_editor.useBlockProps.save({
        style: {
          height: (0, import_block_editor.getSpacingPresetCssVar)(finalHeight),
          width: (0, import_block_editor.getSpacingPresetCssVar)(width)
        },
        "aria-hidden": true
      })
    }
  );
}
//# sourceMappingURL=save.cjs.map
