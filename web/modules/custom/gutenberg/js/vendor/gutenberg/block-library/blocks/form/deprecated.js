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

// packages/block-library/src/form/deprecated.js
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
var v1 = {
  // The block supports here are deliberately empty despite this
  // deprecated version of the block having adopted block supports.
  // The attributes added by these supports have been manually
  // added to this deprecated version's attributes definition so
  // that the data isn't lost on migration. All this is so that the
  // automatic application of block support classes doesn't occur
  // as this version of the block had a bug that overrode those
  // classes. If those block support classes are applied during the
  // deprecation process, this deprecation doesn't match and won't
  // run.
  // @see https://github.com/WordPress/gutenberg/pull/55755
  supports: {},
  attributes: {
    submissionMethod: {
      type: "string",
      default: "email"
    },
    method: {
      type: "string",
      default: "post"
    },
    action: {
      type: "string"
    },
    email: {
      type: "string"
    },
    // The following attributes have been added to match the block
    // supports at the time of the deprecation. See above for details.
    anchor: {
      type: "string",
      source: "attribute",
      attribute: "id",
      selector: "*"
    },
    backgroundColor: {
      type: "string"
    },
    textColor: {
      type: "string"
    },
    gradient: {
      type: "string"
    },
    style: {
      type: "object"
    },
    fontFamily: {
      type: "string"
    },
    fontSize: {
      type: "string"
    }
  },
  save({ attributes }) {
    const { submissionMethod } = attributes;
    const colorProps = (0, import_block_editor.__experimentalGetColorClassesAndStyles)(attributes);
    const typographyProps = (0, import_block_editor.getTypographyClassesAndStyles)(attributes);
    const spacingProps = (0, import_block_editor.__experimentalGetSpacingClassesAndStyles)(attributes);
    const blockProps = import_block_editor.useBlockProps.save({
      // In this deprecated version, the block support is deliberately empty.
      // As a result, the useBlockProps.save() does not output style or id attributes,
      // so we apply them explicitly here.
      style: {
        ...colorProps.style,
        ...typographyProps.style,
        ...spacingProps.style
      },
      id: attributes.anchor
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "form",
      {
        ...blockProps,
        className: "wp-block-form",
        encType: submissionMethod === "email" ? "text/plain" : null,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {})
      }
    );
  }
};
var deprecated_default = [v1];
//# sourceMappingURL=deprecated.cjs.map
