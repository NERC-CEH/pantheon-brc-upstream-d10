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

// packages/block-library/src/form-input/deprecated.js
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_remove_accents = __toESM(require("remove-accents"));
var import_block_editor = require("@wordpress/block-editor");
var import_dom = require("@wordpress/dom");
var import_jsx_runtime = require("react/jsx-runtime");
var getNameFromLabelV1 = (content) => {
  return (0, import_remove_accents.default)((0, import_dom.__unstableStripHTML)(content)).replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase().replace(/(^-+)|(-+$)/g, "");
};
var v2 = {
  attributes: {
    type: {
      type: "string",
      default: "text"
    },
    name: {
      type: "string"
    },
    label: {
      type: "string",
      default: "Label",
      selector: ".wp-block-form-input__label-content",
      source: "html",
      role: "content"
    },
    inlineLabel: {
      type: "boolean",
      default: false
    },
    required: {
      type: "boolean",
      default: false,
      selector: ".wp-block-form-input__input",
      source: "attribute",
      attribute: "required"
    },
    placeholder: {
      type: "string",
      selector: ".wp-block-form-input__input",
      source: "attribute",
      attribute: "placeholder",
      role: "content"
    },
    value: {
      type: "string",
      default: "",
      selector: "input",
      source: "attribute",
      attribute: "value"
    },
    visibilityPermissions: {
      type: "string",
      default: "all"
    }
  },
  supports: {
    anchor: true,
    reusable: false,
    spacing: {
      margin: ["top", "bottom"]
    },
    __experimentalBorder: {
      radius: true,
      __experimentalSkipSerialization: true,
      __experimentalDefaultControls: {
        radius: true
      }
    }
  },
  save({ attributes }) {
    const { type, name, label, inlineLabel, required, placeholder, value } = attributes;
    const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
    const colorProps = (0, import_block_editor.__experimentalGetColorClassesAndStyles)(attributes);
    const inputStyle = {
      ...borderProps.style,
      ...colorProps.style
    };
    const inputClasses = (0, import_clsx.default)(
      "wp-block-form-input__input",
      colorProps.className,
      borderProps.className
    );
    const TagName = type === "textarea" ? "textarea" : "input";
    const blockProps = import_block_editor.useBlockProps.save();
    if ("hidden" === type) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type, name, value });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "label",
      {
        className: (0, import_clsx.default)("wp-block-form-input__label", {
          "is-label-inline": inlineLabel
        }),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wp-block-form-input__label-content", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: label }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            TagName,
            {
              className: inputClasses,
              type: "textarea" === type ? void 0 : type,
              name: name || getNameFromLabelV1(label),
              required,
              "aria-required": required,
              placeholder: placeholder || void 0,
              style: inputStyle
            }
          )
        ]
      }
    ) });
  }
};
var v1 = {
  attributes: {
    type: {
      type: "string",
      default: "text"
    },
    name: {
      type: "string"
    },
    label: {
      type: "string",
      default: "Label",
      selector: ".wp-block-form-input__label-content",
      source: "html",
      role: "content"
    },
    inlineLabel: {
      type: "boolean",
      default: false
    },
    required: {
      type: "boolean",
      default: false,
      selector: ".wp-block-form-input__input",
      source: "attribute",
      attribute: "required"
    },
    placeholder: {
      type: "string",
      selector: ".wp-block-form-input__input",
      source: "attribute",
      attribute: "placeholder",
      role: "content"
    },
    value: {
      type: "string",
      default: "",
      selector: "input",
      source: "attribute",
      attribute: "value"
    },
    visibilityPermissions: {
      type: "string",
      default: "all"
    }
  },
  supports: {
    className: false,
    anchor: true,
    reusable: false,
    spacing: {
      margin: ["top", "bottom"]
    },
    __experimentalBorder: {
      radius: true,
      __experimentalSkipSerialization: true,
      __experimentalDefaultControls: {
        radius: true
      }
    }
  },
  save({ attributes }) {
    const { type, name, label, inlineLabel, required, placeholder, value } = attributes;
    const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
    const colorProps = (0, import_block_editor.__experimentalGetColorClassesAndStyles)(attributes);
    const inputStyle = {
      ...borderProps.style,
      ...colorProps.style
    };
    const inputClasses = (0, import_clsx.default)(
      "wp-block-form-input__input",
      colorProps.className,
      borderProps.className
    );
    const TagName = type === "textarea" ? "textarea" : "input";
    if ("hidden" === type) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type, name, value });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "label",
      {
        className: (0, import_clsx.default)("wp-block-form-input__label", {
          "is-label-inline": inlineLabel
        }),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wp-block-form-input__label-content", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: label }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            TagName,
            {
              className: inputClasses,
              type: "textarea" === type ? void 0 : type,
              name: name || getNameFromLabelV1(label),
              required,
              "aria-required": required,
              placeholder: placeholder || void 0,
              style: inputStyle
            }
          )
        ]
      }
    );
  }
};
var deprecated = [v2, v1];
var deprecated_default = deprecated;
//# sourceMappingURL=deprecated.cjs.map
