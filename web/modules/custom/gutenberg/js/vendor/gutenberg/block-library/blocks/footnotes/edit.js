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

// packages/block-library/src/footnotes/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => FootnotesEdit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_core_data = require("@wordpress/core-data");
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_icons = require("@wordpress/icons");
var import_jsx_runtime = require("react/jsx-runtime");
function FootnotesEdit({ context: { postType, postId } }) {
  const [meta, updateMeta] = (0, import_core_data.useEntityProp)(
    "postType",
    postType,
    "meta",
    postId
  );
  const footnotesSupported = "string" === typeof meta?.footnotes;
  let parsed;
  try {
    parsed = JSON.parse(meta?.footnotes || "[]");
  } catch {
  }
  const footnotes = Array.isArray(parsed) ? parsed : [];
  const blockProps = (0, import_block_editor.useBlockProps)();
  if (!footnotesSupported) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Placeholder,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, { icon: import_icons.formatListNumbered }),
        label: (0, import_i18n.__)("Footnotes"),
        instructions: (0, import_i18n.__)(
          "Footnotes are not supported here. Add this block to post or page content."
        )
      }
    ) });
  }
  if (!footnotes.length) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Placeholder,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, { icon: import_icons.formatListNumbered }),
        label: (0, import_i18n.__)("Footnotes"),
        instructions: (0, import_i18n.__)(
          "Footnotes found in blocks within this document will be displayed here."
        )
      }
    ) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", { ...blockProps, children: footnotes.map(({ id, content }) => (
    /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "li",
      {
        onMouseDown: (event) => {
          if (event.target === event.currentTarget) {
            event.target.firstElementChild.focus();
            event.preventDefault();
          }
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.RichText,
            {
              id,
              tagName: "span",
              value: content,
              identifier: id,
              onFocus: (event) => {
                if (!event.target.textContent.trim()) {
                  event.target.scrollIntoView();
                }
              },
              onChange: (nextFootnote) => {
                updateMeta({
                  ...meta,
                  footnotes: JSON.stringify(
                    footnotes.map((footnote) => {
                      return footnote.id === id ? {
                        content: nextFootnote,
                        id
                      } : footnote;
                    })
                  )
                });
              }
            }
          ),
          " ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: `#${id}-link`, children: "↩︎" })
        ]
      },
      id
    )
  )) });
}
//# sourceMappingURL=edit.cjs.map
