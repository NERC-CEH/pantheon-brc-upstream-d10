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

// packages/block-library/src/loginout/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => LoginOutEdit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function LoginOutEdit({ attributes, setAttributes }) {
  const { displayLoginAsForm, redirectToCurrent } = attributes;
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            displayLoginAsForm: false,
            redirectToCurrent: true
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Display login as form"),
              isShownByDefault: true,
              hasValue: () => displayLoginAsForm,
              onDeselect: () => setAttributes({ displayLoginAsForm: false }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Display login as form"),
                  checked: displayLoginAsForm,
                  onChange: () => setAttributes({
                    displayLoginAsForm: !displayLoginAsForm
                  })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Redirect to current URL"),
              isShownByDefault: true,
              hasValue: () => !redirectToCurrent,
              onDeselect: () => setAttributes({ redirectToCurrent: true }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Redirect to current URL"),
                  checked: redirectToCurrent,
                  onChange: () => setAttributes({
                    redirectToCurrent: !redirectToCurrent
                  })
                }
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        ...(0, import_block_editor.useBlockProps)({
          className: "logged-in"
        }),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: "#login-pseudo-link", children: (0, import_i18n.__)("Log out") })
      }
    )
  ] });
}
//# sourceMappingURL=edit.cjs.map
