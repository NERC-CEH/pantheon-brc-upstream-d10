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

// packages/block-library/src/latest-comments/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => LatestComments
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_server_side_render = require("@wordpress/server-side-render");
var import_compose = require("@wordpress/compose");
var import_hooks = require("../utils/hooks.cjs");
var import_html_renderer = __toESM(require("../utils/html-renderer.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var MIN_COMMENTS = 1;
var MAX_COMMENTS = 100;
function LatestComments({ attributes, setAttributes, name }) {
  const { commentsToShow, displayAvatar, displayDate, displayContent } = attributes;
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const { content, status, error } = (0, import_server_side_render.useServerSideRender)({
    attributes,
    skipBlockSupportAttributes: true,
    block: name,
    urlQueryArgs: {
      // The preview uses the site's locale to make it more true to how
      // the block appears on the frontend. Setting the locale
      // explicitly prevents any middleware from setting it to 'user'.
      _locale: "site"
    }
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
            commentsToShow: 5,
            displayAvatar: true,
            displayDate: true,
            displayContent: "excerpt"
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !displayAvatar,
              label: (0, import_i18n.__)("Display avatar"),
              onDeselect: () => setAttributes({ displayAvatar: true }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Display avatar"),
                  checked: displayAvatar,
                  onChange: () => setAttributes({
                    displayAvatar: !displayAvatar
                  })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !displayDate,
              label: (0, import_i18n.__)("Display date"),
              onDeselect: () => setAttributes({ displayDate: true }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Display date"),
                  checked: displayDate,
                  onChange: () => setAttributes({ displayDate: !displayDate })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => displayContent !== "excerpt",
              label: (0, import_i18n.__)("Display content"),
              onDeselect: () => setAttributes({ displayContent: "excerpt" }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.SelectControl,
                {
                  label: (0, import_i18n.__)("Display content"),
                  value: displayContent,
                  options: [
                    { label: (0, import_i18n.__)("No content"), value: "none" },
                    { label: (0, import_i18n.__)("Excerpt"), value: "excerpt" },
                    { label: (0, import_i18n.__)("Full content"), value: "full" }
                  ],
                  onChange: (value) => setAttributes({
                    displayContent: value
                  })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => commentsToShow !== 5,
              label: (0, import_i18n.__)("Number of comments"),
              onDeselect: () => setAttributes({ commentsToShow: 5 }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.RangeControl,
                {
                  label: (0, import_i18n.__)("Number of comments"),
                  value: commentsToShow,
                  onChange: (value) => setAttributes({ commentsToShow: value }),
                  min: MIN_COMMENTS,
                  max: MAX_COMMENTS,
                  required: true
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
