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

// packages/block-library/src/form-submission-notification/variations.js
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var variations = [
  {
    name: "form-submission-success",
    title: (0, import_i18n.__)("Form Submission Success"),
    description: (0, import_i18n.__)("Success message for form submissions."),
    attributes: {
      type: "success"
    },
    isDefault: true,
    innerBlocks: [
      [
        "core/paragraph",
        {
          content: (0, import_i18n.__)("Your form has been submitted successfully."),
          backgroundColor: "#00D084",
          textColor: "#000000",
          style: {
            elements: { link: { color: { text: "#000000" } } }
          }
        }
      ]
    ],
    scope: ["inserter", "transform"],
    isActive: (blockAttributes) => !blockAttributes?.type || blockAttributes?.type === "success"
  },
  {
    name: "form-submission-error",
    title: (0, import_i18n.__)("Form Submission Error"),
    description: (0, import_i18n.__)("Error/failure message for form submissions."),
    attributes: {
      type: "error"
    },
    isDefault: false,
    innerBlocks: [
      [
        "core/paragraph",
        {
          content: (0, import_i18n.__)("There was an error submitting your form."),
          backgroundColor: "#CF2E2E",
          textColor: "#FFFFFF",
          style: {
            elements: { link: { color: { text: "#FFFFFF" } } }
          }
        }
      ]
    ],
    scope: ["inserter", "transform"],
    isActive: (blockAttributes) => !blockAttributes?.type || blockAttributes?.type === "error"
  }
];
var variations_default = variations;
//# sourceMappingURL=variations.cjs.map
