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

// packages/block-library/src/read-more/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => ReadMore
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_blocks = require("@wordpress/blocks");
var import_i18n = require("@wordpress/i18n");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function ReadMore({
  attributes: { content, linkTarget },
  setAttributes,
  insertBlocksAfter
}) {
  const blockProps = (0, import_block_editor.useBlockProps)();
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => setAttributes({ linkTarget: "_self" }),
        dropdownMenuProps,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Open in new tab"),
            isShownByDefault: true,
            hasValue: () => linkTarget !== "_self",
            onDeselect: () => setAttributes({ linkTarget: "_self" }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Open in new tab"),
                onChange: (value) => setAttributes({
                  linkTarget: value ? "_blank" : "_self"
                }),
                checked: linkTarget === "_blank"
              }
            )
          }
        )
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText,
      {
        identifier: "content",
        tagName: "a",
        "aria-label": (0, import_i18n.__)("“Read more” link text"),
        placeholder: (0, import_i18n.__)("Read more"),
        value: content,
        onChange: (newValue) => setAttributes({ content: newValue }),
        __unstableOnSplitAtEnd: insertBlocksAfter ? () => insertBlocksAfter(
          (0, import_blocks.createBlock)((0, import_blocks.getDefaultBlockName)())
        ) : void 0,
        withoutInteractiveFormatting: true,
        ...blockProps
      }
    )
  ] });
}
//# sourceMappingURL=edit.cjs.map
