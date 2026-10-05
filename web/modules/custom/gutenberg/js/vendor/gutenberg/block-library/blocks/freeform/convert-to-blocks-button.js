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

// packages/block-library/src/freeform/convert-to-blocks-button.jsx
var convert_to_blocks_button_exports = {};
__export(convert_to_blocks_button_exports, {
  default: () => convert_to_blocks_button_default
});
module.exports = __toCommonJS(convert_to_blocks_button_exports);
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_blocks = require("@wordpress/blocks");
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
var ConvertToBlocksButton = ({ clientId }) => {
  const { replaceBlocks } = (0, import_data.useDispatch)(import_block_editor.store);
  const block = (0, import_data.useSelect)(
    (select) => {
      return select(import_block_editor.store).getBlock(clientId);
    },
    [clientId]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.ToolbarButton,
    {
      onClick: () => replaceBlocks(
        block.clientId,
        (0, import_blocks.rawHandler)({ HTML: (0, import_blocks.serialize)(block) })
      ),
      children: (0, import_i18n.__)("Convert to blocks")
    }
  );
};
var convert_to_blocks_button_default = ConvertToBlocksButton;
//# sourceMappingURL=convert-to-blocks-button.cjs.map
