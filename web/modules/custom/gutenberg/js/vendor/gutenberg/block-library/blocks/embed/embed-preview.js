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

// packages/block-library/src/embed/embed-preview.jsx
var embed_preview_exports = {};
__export(embed_preview_exports, {
  default: () => EmbedPreview
});
module.exports = __toCommonJS(embed_preview_exports);
var import_clsx = __toESM(require("clsx"));
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_element = require("@wordpress/element");
var import_url = require("@wordpress/url");
var import_util = require("./util.cjs");
var import_wp_embed_preview = __toESM(require("./wp-embed-preview.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function EmbedPreview({
  preview,
  previewable,
  url,
  type,
  isSelected,
  className,
  icon,
  label
}) {
  const [interactive, setInteractive] = (0, import_element.useState)(false);
  if (!isSelected && interactive) {
    setInteractive(false);
  }
  const hideOverlay = () => {
    setInteractive(true);
  };
  const { scripts } = preview;
  const html = "photo" === type ? (0, import_util.getPhotoHtml)(preview) : preview.html;
  const embedSourceUrl = (0, import_url.getAuthority)(url);
  const iframeTitle = (0, import_i18n.sprintf)(
    // translators: %s: host providing embed content e.g: www.youtube.com
    (0, import_i18n.__)("Embedded content from %s"),
    embedSourceUrl
  );
  const sandboxClassnames = (0, import_clsx.default)(
    type,
    className,
    "wp-block-embed__wrapper"
  );
  const embedWrapper = "wp-embed" === type ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_wp_embed_preview.default, { html }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wp-block-embed__wrapper", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.SandBox,
      {
        allowSameOrigin: true,
        html,
        scripts,
        title: iframeTitle,
        type: sandboxClassnames,
        onFocus: hideOverlay
      }
    ),
    !interactive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        className: "block-library-embed__interactive-overlay",
        onMouseUp: hideOverlay
      }
    )
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: previewable ? embedWrapper : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_components.Placeholder,
    {
      icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, { icon, showColors: true }),
      label,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "components-placeholder__error", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: url, children: url }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "components-placeholder__error", children: (0, import_i18n.sprintf)(
          /* translators: %s: host providing embed content e.g: www.youtube.com */
          (0, import_i18n.__)(
            "Embedded content from %s can't be previewed in the editor."
          ),
          embedSourceUrl
        ) })
      ]
    }
  ) });
}
//# sourceMappingURL=embed-preview.cjs.map
