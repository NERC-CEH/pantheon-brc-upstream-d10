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

// packages/block-library/src/form-input/variations.js
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var variations = [
  {
    name: "text",
    title: (0, import_i18n.__)("Text Input"),
    description: (0, import_i18n.__)("A generic text input."),
    attributes: { type: "text" },
    isDefault: true,
    scope: ["inserter", "transform"],
    isActive: (blockAttributes) => !blockAttributes?.type || blockAttributes?.type === "text"
  },
  {
    name: "textarea",
    title: (0, import_i18n.__)("Textarea Input"),
    description: (0, import_i18n.__)(
      "A textarea input to allow entering multiple lines of text."
    ),
    attributes: { type: "textarea" },
    isDefault: true,
    scope: ["inserter", "transform"],
    isActive: (blockAttributes) => blockAttributes?.type === "textarea"
  },
  {
    name: "checkbox",
    title: (0, import_i18n.__)("Checkbox Input"),
    description: (0, import_i18n.__)("A simple checkbox input."),
    attributes: { type: "checkbox", inlineLabel: true },
    isDefault: true,
    scope: ["inserter", "transform"],
    isActive: (blockAttributes) => blockAttributes?.type === "checkbox"
  },
  {
    name: "email",
    title: (0, import_i18n.__)("Email Input"),
    description: (0, import_i18n.__)("Used for email addresses."),
    attributes: { type: "email" },
    isDefault: true,
    scope: ["inserter", "transform"],
    isActive: (blockAttributes) => blockAttributes?.type === "email"
  },
  {
    name: "url",
    title: (0, import_i18n.__)("URL Input"),
    description: (0, import_i18n.__)("Used for URLs."),
    attributes: { type: "url" },
    isDefault: true,
    scope: ["inserter", "transform"],
    isActive: (blockAttributes) => blockAttributes?.type === "url"
  },
  {
    name: "tel",
    title: (0, import_i18n.__)("Telephone Input"),
    description: (0, import_i18n.__)("Used for phone numbers."),
    attributes: { type: "tel" },
    isDefault: true,
    scope: ["inserter", "transform"],
    isActive: (blockAttributes) => blockAttributes?.type === "tel"
  },
  {
    name: "number",
    title: (0, import_i18n.__)("Number Input"),
    description: (0, import_i18n.__)("A numeric input."),
    attributes: { type: "number" },
    isDefault: true,
    scope: ["inserter", "transform"],
    isActive: (blockAttributes) => blockAttributes?.type === "number"
  },
  {
    name: "hidden",
    title: (0, import_i18n.__)("Hidden Input"),
    icon: "visibility",
    description: (0, import_i18n.__)("A hidden input field."),
    attributes: { type: "hidden" },
    isDefault: true,
    scope: ["inserter", "transform"],
    isActive: (blockAttributes) => blockAttributes?.type === "hidden"
  }
];
var variations_default = variations;
//# sourceMappingURL=variations.cjs.map
