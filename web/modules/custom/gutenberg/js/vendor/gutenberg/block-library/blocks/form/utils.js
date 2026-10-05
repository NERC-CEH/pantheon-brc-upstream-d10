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

// packages/block-library/src/form/utils.js
var utils_exports = {};
__export(utils_exports, {
  formSubmissionNotificationError: () => formSubmissionNotificationError,
  formSubmissionNotificationSuccess: () => formSubmissionNotificationSuccess
});
module.exports = __toCommonJS(utils_exports);
var import_i18n = require("@wordpress/i18n");
var formSubmissionNotificationSuccess = [
  "core/form-submission-notification",
  {
    type: "success"
  },
  [
    [
      "core/paragraph",
      {
        content: '<mark style="background-color:rgba(0, 0, 0, 0);color:#345C00" class="has-inline-color">' + (0, import_i18n.__)("Your form has been submitted successfully") + "</mark>"
      }
    ]
  ]
];
var formSubmissionNotificationError = [
  "core/form-submission-notification",
  {
    type: "error"
  },
  [
    [
      "core/paragraph",
      {
        content: '<mark style="background-color:rgba(0, 0, 0, 0);color:#CF2E2E" class="has-inline-color">' + (0, import_i18n.__)("There was an error submitting your form.") + "</mark>"
      }
    ]
  ]
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  formSubmissionNotificationError,
  formSubmissionNotificationSuccess
});
//# sourceMappingURL=utils.cjs.map
