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

// packages/block-library/src/pullquote/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_blocks = require("@wordpress/blocks");
var import_figure = require("./figure.cjs");
var import_blockquote = require("./blockquote.cjs");
var import_deprecated_text_align_attributes = __toESM(require("../utils/deprecated-text-align-attributes.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function PullQuoteEdit(props) {
  const { attributes, setAttributes, isSelected, insertBlocksAfter } = props;
  (0, import_deprecated_text_align_attributes.default)(props);
  const { citation, value } = attributes;
  const blockProps = (0, import_block_editor.useBlockProps)();
  const shouldShowCitation = !import_block_editor.RichText.isEmpty(citation) || isSelected;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_figure.Figure, { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_blockquote.BlockQuote, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText,
      {
        identifier: "value",
        tagName: "p",
        value,
        onChange: (nextValue) => setAttributes({
          value: nextValue
        }),
        "aria-label": (0, import_i18n.__)("Pullquote text"),
        placeholder: (
          // translators: placeholder text used for the quote
          (0, import_i18n.__)("Add quote")
        )
      }
    ),
    shouldShowCitation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText,
      {
        identifier: "citation",
        tagName: "cite",
        style: { display: "block" },
        value: citation,
        "aria-label": (0, import_i18n.__)("Pullquote citation text"),
        placeholder: (
          // translators: placeholder text used for the citation
          (0, import_i18n.__)("Add citation")
        ),
        onChange: (nextCitation) => setAttributes({
          citation: nextCitation
        }),
        className: "wp-block-pullquote__citation",
        __unstableOnSplitAtEnd: insertBlocksAfter ? () => insertBlocksAfter(
          (0, import_blocks.createBlock)(
            (0, import_blocks.getDefaultBlockName)()
          )
        ) : void 0
      }
    )
  ] }) }) });
}
var edit_default = PullQuoteEdit;
//# sourceMappingURL=edit.cjs.map
