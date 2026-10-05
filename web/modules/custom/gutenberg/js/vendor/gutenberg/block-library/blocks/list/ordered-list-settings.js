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

// packages/block-library/src/list/ordered-list-settings.jsx
var ordered_list_settings_exports = {};
__export(ordered_list_settings_exports, {
  default: () => ordered_list_settings_default
});
module.exports = __toCommonJS(ordered_list_settings_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var LIST_STYLE_OPTIONS = [
  {
    label: (0, import_i18n.__)("Numbers"),
    value: "decimal"
  },
  {
    label: (0, import_i18n.__)("Uppercase letters"),
    value: "upper-alpha"
  },
  {
    label: (0, import_i18n.__)("Lowercase letters"),
    value: "lower-alpha"
  },
  {
    label: (0, import_i18n.__)("Uppercase Roman numerals"),
    value: "upper-roman"
  },
  {
    label: (0, import_i18n.__)("Lowercase Roman numerals"),
    value: "lower-roman"
  }
];
var OrderedListSettings = ({ setAttributes, reversed, start, type }) => {
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_components.__experimentalToolsPanel,
    {
      label: (0, import_i18n.__)("Settings"),
      resetAll: () => {
        setAttributes({
          type: void 0,
          start: void 0,
          reversed: void 0
        });
      },
      dropdownMenuProps,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("List style"),
            isShownByDefault: true,
            hasValue: () => !!type,
            onDeselect: () => setAttributes({
              type: void 0
            }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.SelectControl,
              {
                label: (0, import_i18n.__)("List style"),
                options: LIST_STYLE_OPTIONS,
                value: type || "decimal",
                onChange: (newValue) => setAttributes({ type: newValue })
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Start value"),
            isShownByDefault: true,
            hasValue: () => !!start,
            onDeselect: () => setAttributes({
              start: void 0
            }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.TextControl,
              {
                label: (0, import_i18n.__)("Start value"),
                type: "number",
                onChange: (value) => {
                  const int = parseInt(value, 10);
                  setAttributes({
                    // It should be possible to unset the value,
                    // e.g. with an empty string.
                    start: isNaN(int) ? void 0 : int
                  });
                },
                value: Number.isInteger(start) ? start.toString(10) : "",
                step: "1"
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Reverse order"),
            isShownByDefault: true,
            hasValue: () => !!reversed,
            onDeselect: () => setAttributes({
              reversed: void 0
            }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Reverse order"),
                checked: reversed || false,
                onChange: (value) => {
                  setAttributes({
                    // Unset the attribute if not reversed.
                    reversed: value || void 0
                  });
                }
              }
            )
          }
        )
      ]
    }
  ) });
};
var ordered_list_settings_default = OrderedListSettings;
//# sourceMappingURL=ordered-list-settings.cjs.map
