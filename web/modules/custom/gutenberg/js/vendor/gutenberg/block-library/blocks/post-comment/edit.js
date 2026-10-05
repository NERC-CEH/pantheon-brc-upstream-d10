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

// packages/block-library/src/post-comment/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => Edit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_element = require("@wordpress/element");
var import_icons = require("@wordpress/icons");
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
function Edit({ attributes: { commentId }, setAttributes }) {
  const [commentIdInput, setCommentIdInput] = (0, import_element.useState)(commentId);
  const blockProps = (0, import_block_editor.useBlockProps)();
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps);
  if (!commentId) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.Placeholder,
      {
        icon: import_icons.blockDefault,
        label: (0, import_i18n._x)("Post Comment", "block title"),
        instructions: (0, import_i18n.__)(
          "To show a comment, input the comment ID."
        ),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.TextControl,
            {
              value: commentId,
              onChange: (val) => setCommentIdInput(parseInt(val))
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.Button,
            {
              __next40pxDefaultSize: true,
              variant: "primary",
              onClick: () => {
                setAttributes({ commentId: commentIdInput });
              },
              children: (0, import_i18n.__)("Save")
            }
          )
        ]
      }
    ) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...innerBlocksProps });
}
//# sourceMappingURL=edit.cjs.map
