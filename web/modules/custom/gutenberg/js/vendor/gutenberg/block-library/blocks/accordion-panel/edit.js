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

// packages/block-library/src/accordion-panel/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => Edit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_jsx_runtime = require("react/jsx-runtime");
function Edit({ attributes, context, clientId, isSelected }) {
  const { allowedBlocks, templateLock } = attributes;
  const openByDefault = context["core/accordion-open-by-default"];
  const { hasSelection } = (0, import_data.useSelect)(
    (select) => {
      if (isSelected || openByDefault) {
        return { hasSelection: true };
      }
      const {
        getBlockRootClientId,
        isBlockSelected,
        hasSelectedInnerBlock
      } = select(import_block_editor.store);
      const rootClientId = getBlockRootClientId(clientId);
      return {
        hasSelection: isBlockSelected(rootClientId) || hasSelectedInnerBlock(rootClientId, true)
      };
    },
    [clientId, isSelected, openByDefault]
  );
  const blockProps = (0, import_block_editor.useBlockProps)({
    hidden: !hasSelection,
    role: "region"
  });
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    allowedBlocks,
    templateLock
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...innerBlocksProps });
}
//# sourceMappingURL=edit.cjs.map
