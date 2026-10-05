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

// packages/block-library/src/embed/embed-placeholder.jsx
var embed_placeholder_exports = {};
__export(embed_placeholder_exports, {
  default: () => EmbedPlaceholder
});
module.exports = __toCommonJS(embed_placeholder_exports);
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_ui = require("@wordpress/ui");
var import_jsx_runtime = require("react/jsx-runtime");
function EmbedPlaceholder({
  icon,
  label,
  value,
  onSubmit,
  onChange,
  cannotEmbed,
  fallback,
  tryAgain
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_components.Placeholder,
    {
      icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, { icon, showColors: true }),
      label,
      className: "wp-block-embed",
      instructions: (0, import_i18n.__)(
        "Paste a link to the content you want to display on your site."
      ),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", { onSubmit, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalInputControl,
            {
              type: "url",
              value: value || "",
              className: "wp-block-embed__placeholder-input",
              label,
              hideLabelFromVision: true,
              placeholder: (0, import_i18n.__)("Enter URL to embed here…"),
              onChange
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, { __next40pxDefaultSize: true, variant: "primary", type: "submit", children: (0, import_i18n._x)("Embed", "button label") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-embed__learn-more", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_ui.Link,
          {
            openInNewTab: true,
            href: (0, import_i18n.__)(
              "https://wordpress.org/documentation/article/embeds/"
            ),
            children: (0, import_i18n.__)("Learn more about embeds")
          }
        ) }),
        cannotEmbed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          import_ui.Stack,
          {
            direction: "column",
            gap: "md",
            className: "components-placeholder__error",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "components-placeholder__instructions", children: (0, import_i18n.__)("Sorry, this content could not be embedded.") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Stack, { direction: "row", gap: "md", justify: "flex-start", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.Button,
                  {
                    __next40pxDefaultSize: true,
                    variant: "secondary",
                    onClick: tryAgain,
                    children: (0, import_i18n._x)("Try again", "button label")
                  }
                ),
                fallback && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.Button,
                  {
                    __next40pxDefaultSize: true,
                    variant: "secondary",
                    onClick: fallback,
                    children: (0, import_i18n._x)("Convert to link", "button label")
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
}
//# sourceMappingURL=embed-placeholder.cjs.map
