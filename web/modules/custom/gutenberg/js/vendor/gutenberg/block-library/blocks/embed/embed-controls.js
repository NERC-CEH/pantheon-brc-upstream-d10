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

// packages/block-library/src/embed/embed-controls.jsx
var embed_controls_exports = {};
__export(embed_controls_exports, {
  default: () => embed_controls_default
});
module.exports = __toCommonJS(embed_controls_exports);
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_icons = require("@wordpress/icons");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function getResponsiveHelp(checked) {
  return checked ? (0, import_i18n.__)(
    "This embed will preserve its aspect ratio when the browser is resized."
  ) : (0, import_i18n.__)(
    "This embed may not preserve its aspect ratio when the browser is resized."
  );
}
var EmbedControls = ({
  blockSupportsResponsive,
  showEditButton,
  themeSupportsResponsive,
  allowResponsive,
  toggleResponsive,
  switchBackToURLInput
}) => {
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { children: showEditButton && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarButton,
      {
        className: "components-toolbar__control",
        label: (0, import_i18n.__)("Edit URL"),
        icon: import_icons.pencil,
        onClick: switchBackToURLInput
      }
    ) }) }),
    themeSupportsResponsive && blockSupportsResponsive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Media settings"),
        resetAll: () => {
          toggleResponsive(true);
        },
        dropdownMenuProps,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Media settings"),
            isShownByDefault: true,
            hasValue: () => !allowResponsive,
            onDeselect: () => {
              toggleResponsive(!allowResponsive);
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Resize for smaller devices"),
                checked: allowResponsive,
                help: getResponsiveHelp,
                onChange: toggleResponsive
              }
            )
          }
        )
      }
    ) })
  ] });
};
var embed_controls_default = EmbedControls;
//# sourceMappingURL=embed-controls.cjs.map
