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

// packages/block-library/src/form-submission-notification/edit.js
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_clsx = __toESM(require("clsx"));
var import_jsx_runtime = require("react/jsx-runtime");
var TEMPLATE = [
  [
    "core/paragraph",
    {
      content: (0, import_i18n.__)(
        "Enter the message you wish displayed for form submission error/success, and select the type of the message (success/error) from the block's options."
      )
    }
  ]
];
var Edit = ({ attributes, clientId }) => {
  const { type } = attributes;
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: (0, import_clsx.default)("wp-block-form-submission-notification", {
      [`form-notification-type-${type}`]: type
    })
  });
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      ...innerBlocksProps,
      "data-message-success": (0, import_i18n.__)("Submission success notification"),
      "data-message-error": (0, import_i18n.__)("Submission error notification")
    }
  );
};
var edit_default = Edit;
//# sourceMappingURL=edit.cjs.map
