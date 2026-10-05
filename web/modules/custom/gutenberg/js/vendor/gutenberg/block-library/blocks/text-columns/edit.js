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

// packages/block-library/src/text-columns/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => TextColumnsEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_deprecated = __toESM(require("@wordpress/deprecated"));
var import_jsx_runtime = require("react/jsx-runtime");
function TextColumnsEdit({ attributes, setAttributes }) {
  const { width, content, columns } = attributes;
  (0, import_deprecated.default)("The Text Columns block", {
    since: "5.3",
    alternative: "the Columns block"
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.BlockAlignmentToolbar,
      {
        value: width,
        onChange: (nextWidth) => setAttributes({ width: nextWidth }),
        controls: ["center", "wide", "full"]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.PanelBody, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.RangeControl,
      {
        label: (0, import_i18n.__)("Columns"),
        value: columns,
        onChange: (value) => setAttributes({ columns: value }),
        min: 2,
        max: 4,
        required: true
      }
    ) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        ...(0, import_block_editor.useBlockProps)({
          className: `align${width} columns-${columns}`
        }),
        children: Array.from({ length: columns }).map((_, index) => {
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "div",
            {
              className: "wp-block-column",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_block_editor.RichText,
                {
                  tagName: "p",
                  value: content?.[index]?.children,
                  onChange: (nextContent) => {
                    setAttributes({
                      content: [
                        ...content.slice(0, index),
                        { children: nextContent },
                        ...content.slice(index + 1)
                      ]
                    });
                  },
                  "aria-label": (0, import_i18n.sprintf)(
                    // translators: %d: column index (starting with 1)
                    (0, import_i18n.__)("Column %d text"),
                    index + 1
                  ),
                  placeholder: (0, import_i18n.__)("New Column")
                }
              )
            },
            `column-${index}`
          );
        })
      }
    )
  ] });
}
//# sourceMappingURL=edit.cjs.map
