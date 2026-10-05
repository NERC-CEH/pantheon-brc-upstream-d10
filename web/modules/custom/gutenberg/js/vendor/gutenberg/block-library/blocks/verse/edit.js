"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/block-library/src/verse/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => VerseEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_blocks = require("@wordpress/blocks");
var import_deprecated_text_align_attributes = __toESM(require("../utils/deprecated-text-align-attributes.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function VerseEdit(props) {
  const {
    attributes,
    setAttributes,
    mergeBlocks,
    onRemove,
    insertBlocksAfter,
    style
  } = props;
  const { content } = attributes;
  (0, import_deprecated_text_align_attributes.default)(props);
  const blockProps = (0, import_block_editor.useBlockProps)({ style });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.RichText,
    {
      tagName: "pre",
      identifier: "content",
      preserveWhiteSpace: true,
      value: content,
      onChange: (nextContent) => {
        setAttributes({
          content: nextContent
        });
      },
      "aria-label": (0, import_i18n.__)("Poetry text"),
      placeholder: (0, import_i18n.__)("Write poetry…"),
      onRemove,
      onMerge: mergeBlocks,
      ...blockProps,
      __unstablePastePlainText: true,
      __unstableOnSplitAtDoubleLineEnd: insertBlocksAfter ? () => insertBlocksAfter(
        (0, import_blocks.createBlock)((0, import_blocks.getDefaultBlockName)())
      ) : void 0
    }
  );
}
//# sourceMappingURL=edit.cjs.map
