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

// packages/block-library/src/form-input/edit.js
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_element = require("@wordpress/element");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function InputFieldBlock({ attributes, setAttributes, className }) {
  const { type, name, label, inlineLabel, required, placeholder, value } = attributes;
  const blockProps = (0, import_block_editor.useBlockProps)();
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const ref = (0, import_element.useRef)();
  const TagName = type === "textarea" ? "textarea" : "input";
  const borderProps = (0, import_block_editor.__experimentalUseBorderProps)(attributes);
  const colorProps = (0, import_block_editor.__experimentalUseColorProps)(attributes);
  if (ref.current) {
    ref.current.focus();
  }
  const isCheckboxOrRadio = type === "checkbox" || type === "radio";
  const controls = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    "hidden" !== type && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            inlineLabel: false,
            required: false
          });
        },
        dropdownMenuProps,
        children: [
          "checkbox" !== type && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Inline label"),
              hasValue: () => !!inlineLabel,
              onDeselect: () => setAttributes({ inlineLabel: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.CheckboxControl,
                {
                  label: (0, import_i18n.__)("Inline label"),
                  checked: inlineLabel,
                  onChange: (newVal) => {
                    setAttributes({
                      inlineLabel: newVal
                    });
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Required"),
              hasValue: () => !!required,
              onDeselect: () => setAttributes({ required: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.CheckboxControl,
                {
                  label: (0, import_i18n.__)("Required"),
                  checked: required,
                  onChange: (newVal) => {
                    setAttributes({
                      required: newVal
                    });
                  }
                }
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_block_editor.InspectorControls, { group: "advanced", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.TextControl,
        {
          __next40pxDefaultSize: true,
          autoComplete: "off",
          label: (0, import_i18n.__)("Name"),
          value: name,
          onChange: (newVal) => {
            setAttributes({
              name: newVal
            });
          },
          help: (0, import_i18n.__)(
            'Affects the "name" attribute of the input element, and is used as a name for the form submission results.'
          )
        }
      ),
      "hidden" === type && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.TextControl,
        {
          __next40pxDefaultSize: true,
          autoComplete: "off",
          label: (0, import_i18n.__)("Value"),
          value,
          onChange: (newVal) => setAttributes({ value: newVal }),
          help: (0, import_i18n.__)(
            "Sets the stored value for this hidden field."
          )
        }
      )
    ] })
  ] });
  const content = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.RichText,
    {
      tagName: "span",
      className: "wp-block-form-input__label-content",
      value: label,
      onChange: (newLabel) => setAttributes({ label: newLabel }),
      "aria-label": label ? (0, import_i18n.__)("Label") : (0, import_i18n.__)("Empty label"),
      "data-empty": !label,
      placeholder: (0, import_i18n.__)("Type the label for this input")
    }
  );
  if ("hidden" === type) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
      controls,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          className: "wp-block-form-input__label is-input-hidden",
          "data-message": (0, import_i18n.__)("Hidden field")
        }
      )
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
    controls,
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "span",
      {
        className: (0, import_clsx.default)("wp-block-form-input__label", {
          "is-label-inline": inlineLabel || "checkbox" === type
        }),
        children: [
          !isCheckboxOrRadio && content,
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            TagName,
            {
              type: "textarea" === type ? void 0 : type,
              className: (0, import_clsx.default)(
                className,
                "wp-block-form-input__input",
                colorProps.className,
                borderProps.className
              ),
              "aria-label": (0, import_i18n.__)("Optional placeholder text"),
              placeholder: placeholder ? void 0 : (0, import_i18n.__)("Optional placeholder\u2026"),
              value: placeholder,
              onChange: (event) => setAttributes({ placeholder: event.target.value }),
              "aria-required": required,
              style: {
                ...borderProps.style,
                ...colorProps.style
              }
            }
          ),
          isCheckboxOrRadio && content
        ]
      }
    )
  ] });
}
var edit_default = InputFieldBlock;
//# sourceMappingURL=edit.cjs.map
