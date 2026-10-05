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

// packages/block-library/src/form/variations.js
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var import_utils = require("./utils.cjs");
var variations = [
  {
    name: "comment-form",
    title: (0, import_i18n.__)("Experimental Comment form"),
    description: (0, import_i18n.__)("A comment form for posts and pages."),
    attributes: {
      submissionMethod: "custom",
      action: "{SITE_URL}/wp-comments-post.php",
      method: "post",
      anchor: "comment-form"
    },
    isDefault: false,
    innerBlocks: [
      [
        "core/form-input",
        {
          type: "text",
          name: "author",
          label: (0, import_i18n.__)("Name"),
          required: true,
          visibilityPermissions: "logged-out"
        }
      ],
      [
        "core/form-input",
        {
          type: "email",
          name: "email",
          label: (0, import_i18n.__)("Email"),
          required: true,
          visibilityPermissions: "logged-out"
        }
      ],
      [
        "core/form-input",
        {
          type: "textarea",
          name: "comment",
          label: (0, import_i18n.__)("Comment"),
          required: true,
          visibilityPermissions: "all"
        }
      ],
      ["core/form-submit-button", {}]
    ],
    scope: ["inserter", "transform"],
    isActive: (blockAttributes) => !blockAttributes?.type || blockAttributes?.type === "text"
  },
  {
    name: "wp-privacy-form",
    title: (0, import_i18n.__)("Experimental Privacy Request Form"),
    keywords: ["GDPR"],
    description: (0, import_i18n.__)("A form to request data exports and/or deletion."),
    attributes: {
      submissionMethod: "custom",
      action: "",
      method: "post",
      anchor: "gdpr-form"
    },
    isDefault: false,
    innerBlocks: [
      import_utils.formSubmissionNotificationSuccess,
      import_utils.formSubmissionNotificationError,
      [
        "core/paragraph",
        {
          content: (0, import_i18n.__)(
            "To request an export or deletion of your personal data on this site, please fill-in the form below. You can define the type of request you wish to perform, and your email address. Once the form is submitted, you will receive a confirmation email with instructions on the next steps."
          )
        }
      ],
      [
        "core/form-input",
        {
          type: "email",
          name: "email",
          label: (0, import_i18n.__)("Enter your email address."),
          required: true,
          visibilityPermissions: "all"
        }
      ],
      [
        "core/form-input",
        {
          type: "checkbox",
          name: "export_personal_data",
          label: (0, import_i18n.__)("Request data export"),
          required: false,
          visibilityPermissions: "all"
        }
      ],
      [
        "core/form-input",
        {
          type: "checkbox",
          name: "remove_personal_data",
          label: (0, import_i18n.__)("Request data deletion"),
          required: false,
          visibilityPermissions: "all"
        }
      ],
      ["core/form-submit-button", {}],
      [
        "core/form-input",
        {
          type: "hidden",
          name: "wp-action",
          value: "wp_privacy_send_request"
        }
      ],
      [
        "core/form-input",
        {
          type: "hidden",
          name: "wp-privacy-request",
          value: "1"
        }
      ]
    ],
    scope: ["inserter", "transform"],
    isActive: (blockAttributes) => !blockAttributes?.type || blockAttributes?.type === "text"
  }
];
var variations_default = variations;
//# sourceMappingURL=variations.cjs.map
