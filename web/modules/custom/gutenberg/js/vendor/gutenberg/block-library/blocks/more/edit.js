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

// packages/block-library/src/more/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => MoreEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_blocks = require("@wordpress/blocks");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var DEFAULT_TEXT = (0, import_i18n.__)("Read more");
function MoreEdit({
  attributes: { customText, noTeaser },
  insertBlocksAfter,
  setAttributes
}) {
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            noTeaser: false
          });
        },
        dropdownMenuProps,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Hide excerpt"),
            isShownByDefault: true,
            hasValue: () => noTeaser,
            onDeselect: () => setAttributes({ noTeaser: false }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)(
                  "Hide the excerpt on the full content page"
                ),
                checked: !!noTeaser,
                onChange: () => setAttributes({ noTeaser: !noTeaser }),
                help: (checked) => checked ? (0, import_i18n.__)("The excerpt is hidden.") : (0, import_i18n.__)("The excerpt is visible.")
              }
            )
          }
        )
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...(0, import_block_editor.useBlockProps)(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.PlainText,
      {
        __experimentalVersion: 2,
        tagName: "span",
        "aria-label": (0, import_i18n.__)('"Read more" text'),
        value: customText,
        placeholder: DEFAULT_TEXT,
        onChange: (value) => setAttributes({ customText: value }),
        disableLineBreaks: true,
        __unstableOnSplitAtEnd: insertBlocksAfter ? () => insertBlocksAfter(
          (0, import_blocks.createBlock)((0, import_blocks.getDefaultBlockName)())
        ) : void 0
      }
    ) })
  ] });
}
//# sourceMappingURL=edit.cjs.map
