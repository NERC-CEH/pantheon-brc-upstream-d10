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

// packages/block-library/src/archives/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => ArchivesEdit
});
module.exports = __toCommonJS(edit_exports);
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_server_side_render = require("@wordpress/server-side-render");
var import_compose = require("@wordpress/compose");
var import_hooks = require("../utils/hooks.cjs");
var import_html_renderer = __toESM(require("../utils/html-renderer.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function ArchivesEdit({ attributes, setAttributes, name }) {
  const { showLabel, showPostCounts, displayAsDropdown, type } = attributes;
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const { content, status, error } = (0, import_server_side_render.useServerSideRender)({
    attributes,
    skipBlockSupportAttributes: true,
    block: name
  });
  const disabledRef = (0, import_compose.useDisabled)();
  const blockProps = (0, import_block_editor.useBlockProps)({ ref: disabledRef });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            displayAsDropdown: false,
            showLabel: true,
            showPostCounts: false,
            type: "monthly"
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Display as dropdown"),
              isShownByDefault: true,
              hasValue: () => displayAsDropdown,
              onDeselect: () => setAttributes({ displayAsDropdown: false }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Display as dropdown"),
                  checked: displayAsDropdown,
                  onChange: () => setAttributes({
                    displayAsDropdown: !displayAsDropdown
                  })
                }
              )
            }
          ),
          displayAsDropdown && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Show label"),
              isShownByDefault: true,
              hasValue: () => !showLabel,
              onDeselect: () => setAttributes({ showLabel: true }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show label"),
                  checked: showLabel,
                  onChange: () => setAttributes({
                    showLabel: !showLabel
                  })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Show post counts"),
              isShownByDefault: true,
              hasValue: () => showPostCounts,
              onDeselect: () => setAttributes({ showPostCounts: false }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show post counts"),
                  checked: showPostCounts,
                  onChange: () => setAttributes({
                    showPostCounts: !showPostCounts
                  })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Group by"),
              isShownByDefault: true,
              hasValue: () => type !== "monthly",
              onDeselect: () => setAttributes({ type: "monthly" }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.SelectControl,
                {
                  label: (0, import_i18n.__)("Group by"),
                  options: [
                    { label: (0, import_i18n.__)("Year"), value: "yearly" },
                    { label: (0, import_i18n.__)("Month"), value: "monthly" },
                    { label: (0, import_i18n.__)("Week"), value: "weekly" },
                    { label: (0, import_i18n.__)("Day"), value: "daily" }
                  ],
                  value: type,
                  onChange: (value) => setAttributes({ type: value })
                }
              )
            }
          )
        ]
      }
    ) }),
    status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {}) }),
    status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: (0, import_i18n.sprintf)(
      /* translators: %s: error message returned when rendering the block. */
      (0, import_i18n.__)("Error: %s"),
      error
    ) }) }),
    status === "success" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_html_renderer.default, { wrapperProps: blockProps, html: content })
  ] });
}
//# sourceMappingURL=edit.cjs.map
