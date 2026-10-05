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

// packages/block-library/src/details/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_element = require("@wordpress/element");
var import_data = require("@wordpress/data");
var import_keycodes = require("@wordpress/keycodes");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function DetailsEdit({ attributes, setAttributes, clientId }) {
  const { name, showContent, summary, allowedBlocks, placeholder } = attributes;
  const blockProps = (0, import_block_editor.useBlockProps)();
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    __experimentalCaptureToolbars: true,
    allowedBlocks
  });
  const [isOpen, setIsOpen] = (0, import_element.useState)(showContent);
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const hasSelectedInnerBlock = (0, import_data.useSelect)(
    (select) => select(import_block_editor.store).hasSelectedInnerBlock(clientId, true),
    [clientId]
  );
  const handleSummaryKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      setIsOpen((prevIsOpen) => !prevIsOpen);
      event.preventDefault();
    }
  };
  const handleSummaryKeyUp = (event) => {
    if (event.key === " ") {
      event.preventDefault();
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            showContent: false
          });
        },
        dropdownMenuProps,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            isShownByDefault: true,
            label: (0, import_i18n.__)("Open by default"),
            hasValue: () => showContent,
            onDeselect: () => {
              setAttributes({
                showContent: false
              });
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Open by default"),
                checked: showContent,
                onChange: () => setAttributes({
                  showContent: !showContent
                })
              }
            )
          }
        )
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "advanced", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.TextControl,
      {
        label: (0, import_i18n.__)("Name attribute"),
        value: name || "",
        onChange: (newName) => setAttributes({ name: newName }),
        help: (0, import_i18n.__)(
          "Enables multiple Details blocks with the same name attribute to be connected, with only one open at a time."
        )
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "details",
      {
        ...innerBlocksProps,
        open: isOpen || hasSelectedInnerBlock,
        onToggle: (event) => setIsOpen(event.target.open),
        name: name || "",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "summary",
            {
              onKeyDown: (0, import_keycodes.withIgnoreIMEEvents)(handleSummaryKeyDown),
              onKeyUp: handleSummaryKeyUp,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_block_editor.RichText,
                {
                  identifier: "summary",
                  "aria-label": (0, import_i18n.__)(
                    "Write summary. Press Enter to expand or collapse the details."
                  ),
                  placeholder: placeholder || (0, import_i18n.__)("Write summary…"),
                  withoutInteractiveFormatting: true,
                  value: summary,
                  onChange: (newSummary) => setAttributes({ summary: newSummary })
                }
              )
            }
          ),
          innerBlocksProps.children
        ]
      }
    )
  ] });
}
var edit_default = DetailsEdit;
//# sourceMappingURL=edit.cjs.map
