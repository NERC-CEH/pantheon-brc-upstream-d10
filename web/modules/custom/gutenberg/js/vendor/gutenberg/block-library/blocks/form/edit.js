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

// packages/block-library/src/form/edit.js
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_hooks = require("../utils/hooks.cjs");
var import_utils = require("./utils.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var TEMPLATE = [
  import_utils.formSubmissionNotificationSuccess,
  import_utils.formSubmissionNotificationError,
  [
    "core/form-input",
    {
      type: "text",
      label: (0, import_i18n.__)("Name"),
      required: true
    }
  ],
  [
    "core/form-input",
    {
      type: "email",
      label: (0, import_i18n.__)("Email"),
      required: true
    }
  ],
  [
    "core/form-input",
    {
      type: "textarea",
      label: (0, import_i18n.__)("Comment"),
      required: true
    }
  ],
  ["core/form-submit-button", {}]
];
var Edit = ({ attributes, setAttributes, clientId }) => {
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const resetAllSettings = () => {
    setAttributes({
      submissionMethod: "email",
      email: void 0,
      action: void 0,
      method: "post"
    });
  };
  const { action, method, email, submissionMethod } = attributes;
  const blockProps = (0, import_block_editor.useBlockProps)();
  const { hasInnerBlocks } = (0, import_data.useSelect)(
    (select) => {
      const { getBlock } = select(import_block_editor.store);
      const block = getBlock(clientId);
      return {
        hasInnerBlocks: !!(block && block.innerBlocks.length)
      };
    },
    [clientId]
  );
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    template: TEMPLATE,
    renderAppender: hasInnerBlocks ? void 0 : import_block_editor.InnerBlocks.ButtonBlockAppender
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        dropdownMenuProps,
        label: (0, import_i18n.__)("Settings"),
        resetAll: resetAllSettings,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => submissionMethod !== "email",
              label: (0, import_i18n.__)("Submissions method"),
              onDeselect: () => setAttributes({
                submissionMethod: "email"
              }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.SelectControl,
                {
                  __next40pxDefaultSize: true,
                  label: (0, import_i18n.__)("Submissions method"),
                  options: [
                    // TODO: Allow plugins to add their own submission methods.
                    {
                      label: (0, import_i18n.__)("Send email"),
                      value: "email"
                    },
                    {
                      label: (0, import_i18n.__)("- Custom -"),
                      value: "custom"
                    }
                  ],
                  value: submissionMethod,
                  onChange: (value) => setAttributes({ submissionMethod: value }),
                  help: submissionMethod === "custom" ? (0, import_i18n.__)(
                    'Select the method to use for form submissions. Additional options for the "custom" mode can be found in the "Advanced" section.'
                  ) : (0, import_i18n.__)(
                    "Select the method to use for form submissions."
                  )
                }
              )
            }
          ),
          submissionMethod === "email" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!email,
              label: (0, import_i18n.__)("Email for form submissions"),
              onDeselect: () => setAttributes({
                email: void 0,
                action: void 0,
                method: "post"
              }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.TextControl,
                {
                  __next40pxDefaultSize: true,
                  autoComplete: "off",
                  label: (0, import_i18n.__)("Email for form submissions"),
                  value: email || "",
                  required: true,
                  onChange: (value) => {
                    setAttributes({ email: value });
                    setAttributes({
                      action: `mailto:${value}`
                    });
                    setAttributes({ method: "post" });
                  },
                  help: (0, import_i18n.__)(
                    "The email address where form submissions will be sent. Separate multiple email addresses with a comma."
                  ),
                  type: "email"
                }
              )
            }
          )
        ]
      }
    ) }),
    submissionMethod !== "email" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_block_editor.InspectorControls, { group: "advanced", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.SelectControl,
        {
          __next40pxDefaultSize: true,
          label: (0, import_i18n.__)("Method"),
          options: [
            { label: "Get", value: "get" },
            { label: "Post", value: "post" }
          ],
          value: method,
          onChange: (value) => setAttributes({ method: value }),
          help: (0, import_i18n.__)(
            "Select the method to use for form submissions."
          )
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.TextControl,
        {
          __next40pxDefaultSize: true,
          autoComplete: "off",
          label: (0, import_i18n.__)("Form action"),
          value: action,
          onChange: (newVal) => {
            setAttributes({
              action: newVal
            });
          },
          help: (0, import_i18n.__)(
            "The URL where the form should be submitted."
          ),
          type: "url"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "form",
      {
        ...innerBlocksProps,
        encType: submissionMethod === "email" ? "text/plain" : null
      }
    )
  ] });
};
var edit_default = Edit;
//# sourceMappingURL=edit.cjs.map
