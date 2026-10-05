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

// packages/block-library/src/page-list/convert-to-links-modal.js
var convert_to_links_modal_exports = {};
__export(convert_to_links_modal_exports, {
  ConvertToLinksModal: () => ConvertToLinksModal,
  convertDescription: () => convertDescription
});
module.exports = __toCommonJS(convert_to_links_modal_exports);
var import_components = require("@wordpress/components");
var import_compose = require("@wordpress/compose");
var import_i18n = require("@wordpress/i18n");
var import_jsx_runtime = require("react/jsx-runtime");
var convertDescription = (0, import_i18n.__)(
  "This Navigation Menu displays your website's pages. Editing it will enable you to add, delete, or reorder pages. However, new pages will no longer be added automatically."
);
function ConvertToLinksModal({ onClick, onClose, disabled }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_components.Modal,
    {
      onRequestClose: onClose,
      title: (0, import_i18n.__)("Edit Page List"),
      className: "wp-block-page-list-modal",
      aria: {
        describedby: (0, import_compose.useInstanceId)(
          ConvertToLinksModal,
          "wp-block-page-list-modal__description"
        )
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "p",
          {
            id: (0, import_compose.useInstanceId)(
              ConvertToLinksModal,
              "wp-block-page-list-modal__description"
            ),
            children: convertDescription
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wp-block-page-list-modal-buttons", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.Button,
            {
              __next40pxDefaultSize: true,
              variant: "tertiary",
              onClick: onClose,
              children: (0, import_i18n.__)("Cancel")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.Button,
            {
              __next40pxDefaultSize: true,
              variant: "primary",
              accessibleWhenDisabled: true,
              disabled,
              onClick,
              children: (0, import_i18n.__)("Edit")
            }
          )
        ] })
      ]
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConvertToLinksModal,
  convertDescription
});
//# sourceMappingURL=convert-to-links-modal.cjs.map
