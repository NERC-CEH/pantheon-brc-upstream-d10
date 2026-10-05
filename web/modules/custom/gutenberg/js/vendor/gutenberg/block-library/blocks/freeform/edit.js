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

// packages/block-library/src/freeform/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => FreeformEdit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_components = require("@wordpress/components");
var import_element = require("@wordpress/element");
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var import_convert_to_blocks_button = __toESM(require("./convert-to-blocks-button.cjs"));
var import_modal = __toESM(require("./modal.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function FreeformEdit({
  attributes,
  setAttributes,
  clientId
}) {
  const { content } = attributes;
  const [isOpen, setOpen] = (0, import_element.useState)(false);
  const editButtonRef = (0, import_element.useRef)(null);
  const canRemove = (0, import_data.useSelect)(
    (select) => select(import_block_editor.store).canRemoveBlock(clientId),
    [clientId]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    canRemove && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_convert_to_blocks_button.default, { clientId }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarButton,
      {
        ref: editButtonRef,
        onClick: () => setOpen(true),
        children: (0, import_i18n.__)("Edit")
      }
    ) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...(0, import_block_editor.useBlockProps)(), children: [
      content ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_element.RawHTML, { children: content }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.Placeholder,
        {
          icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, { icon: import_icons.classic }),
          label: (0, import_i18n.__)("Classic"),
          instructions: (0, import_i18n.__)(
            "Use the classic editor to add content."
          ),
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.Button,
            {
              __next40pxDefaultSize: true,
              variant: "primary",
              onClick: () => setOpen(true),
              children: (0, import_i18n.__)("Edit contents")
            }
          )
        }
      ),
      isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_modal.default,
        {
          clientId,
          content,
          onClose: () => {
            setOpen(false);
            if (editButtonRef.current) {
              editButtonRef.current.focus();
            }
          },
          onChange: (newContent) => setAttributes({ content: newContent })
        }
      )
    ] })
  ] });
}
//# sourceMappingURL=edit.cjs.map
