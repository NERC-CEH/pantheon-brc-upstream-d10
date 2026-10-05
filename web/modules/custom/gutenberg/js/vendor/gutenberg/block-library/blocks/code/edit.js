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

// packages/block-library/src/code/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => CodeEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_blocks = require("@wordpress/blocks");
var import_jsx_runtime = require("react/jsx-runtime");
function CodeEdit({
  attributes,
  setAttributes,
  onRemove,
  insertBlocksAfter,
  mergeBlocks
}) {
  const blockProps = (0, import_block_editor.useBlockProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.RichText,
    {
      tagName: "code",
      identifier: "content",
      value: attributes.content,
      onChange: (content) => setAttributes({ content }),
      onRemove,
      onMerge: mergeBlocks,
      placeholder: (0, import_i18n.__)("Write code…"),
      "aria-label": (0, import_i18n.__)("Code"),
      preserveWhiteSpace: true,
      __unstablePastePlainText: true,
      __unstableOnSplitAtDoubleLineEnd: insertBlocksAfter ? () => insertBlocksAfter(
        (0, import_blocks.createBlock)((0, import_blocks.getDefaultBlockName)())
      ) : void 0,
      style: { whiteSpace: "break-spaces" }
    }
  ) });
}
//# sourceMappingURL=edit.cjs.map
