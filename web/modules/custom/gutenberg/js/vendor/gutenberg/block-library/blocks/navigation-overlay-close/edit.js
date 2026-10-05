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

// packages/block-library/src/navigation-overlay-close/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => NavigationOverlayCloseEdit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function NavigationOverlayCloseEdit({
  attributes,
  setAttributes
}) {
  const { displayMode, text } = attributes;
  const showIcon = displayMode === "icon" || displayMode === "both";
  const showText = displayMode === "text" || displayMode === "both";
  const displayText = text || (0, import_i18n.__)("Close");
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: "wp-block-navigation-overlay-close"
  });
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => setAttributes({ displayMode: "icon" }),
        dropdownMenuProps,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Display Mode"),
            isShownByDefault: true,
            hasValue: () => displayMode !== "icon",
            onDeselect: () => setAttributes({ displayMode: "icon" }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              import_components.__experimentalToggleGroupControl,
              {
                label: (0, import_i18n.__)("Display Mode"),
                value: displayMode,
                onChange: (value) => setAttributes({ displayMode: value }),
                isBlock: true,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    import_components.__experimentalToggleGroupControlOption,
                    {
                      value: "icon",
                      label: (0, import_i18n.__)("Icon")
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    import_components.__experimentalToggleGroupControlOption,
                    {
                      value: "text",
                      label: (0, import_i18n.__)("Text")
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    import_components.__experimentalToggleGroupControlOption,
                    {
                      value: "both",
                      label: (0, import_i18n.__)("Both")
                    }
                  )
                ]
              }
            )
          }
        )
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        ...blockProps,
        type: "button",
        "aria-label": !showText ? (0, import_i18n.__)("Close") : void 0,
        children: [
          showIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_icons.Icon, { icon: import_icons.close }),
          showText && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.RichText,
            {
              identifier: "text",
              value: displayText,
              onChange: (value) => setAttributes({ text: value }),
              tagName: "span",
              className: "wp-block-navigation-overlay-close__text",
              allowedFormats: ["core/bold", "core/italic"]
            }
          )
        ]
      }
    )
  ] });
}
//# sourceMappingURL=edit.cjs.map
