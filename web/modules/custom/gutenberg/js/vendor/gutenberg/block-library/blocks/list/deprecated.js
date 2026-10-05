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

// packages/block-library/src/list/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_migrate_font_family = __toESM(require("../utils/migrate-font-family.cjs"));
var import_utils = require("./utils.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var v0 = {
  attributes: {
    ordered: {
      type: "boolean",
      default: false,
      role: "content"
    },
    values: {
      type: "string",
      source: "html",
      selector: "ol,ul",
      multiline: "li",
      __unstableMultilineWrapperTags: ["ol", "ul"],
      default: "",
      role: "content"
    },
    type: {
      type: "string"
    },
    start: {
      type: "number"
    },
    reversed: {
      type: "boolean"
    },
    placeholder: {
      type: "string"
    }
  },
  supports: {
    anchor: true,
    className: false,
    typography: {
      fontSize: true,
      __experimentalFontFamily: true
    },
    color: {
      gradients: true,
      link: true
    },
    __unstablePasteTextInline: true,
    __experimentalSelector: "ol,ul",
    __experimentalSlashInserter: true
  },
  save({ attributes }) {
    const { ordered, values, type, reversed, start } = attributes;
    const TagName = ordered ? "ol" : "ul";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...import_block_editor.useBlockProps.save({ type, reversed, start }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: values, multiline: "li" }) });
  },
  migrate: import_migrate_font_family.default,
  isEligible({ style }) {
    return style?.typography?.fontFamily;
  }
};
var v1 = {
  attributes: {
    ordered: {
      type: "boolean",
      default: false,
      role: "content"
    },
    values: {
      type: "string",
      source: "html",
      selector: "ol,ul",
      multiline: "li",
      __unstableMultilineWrapperTags: ["ol", "ul"],
      default: "",
      role: "content"
    },
    type: {
      type: "string"
    },
    start: {
      type: "number"
    },
    reversed: {
      type: "boolean"
    },
    placeholder: {
      type: "string"
    }
  },
  supports: {
    anchor: true,
    className: false,
    typography: {
      fontSize: true,
      __experimentalFontFamily: true,
      lineHeight: true,
      __experimentalFontStyle: true,
      __experimentalFontWeight: true,
      __experimentalLetterSpacing: true,
      __experimentalTextTransform: true,
      __experimentalDefaultControls: {
        fontSize: true
      }
    },
    color: {
      gradients: true,
      link: true,
      __experimentalDefaultControls: {
        background: true,
        text: true
      }
    },
    __unstablePasteTextInline: true,
    __experimentalSelector: "ol,ul",
    __experimentalSlashInserter: true
  },
  save({ attributes }) {
    const { ordered, values, type, reversed, start } = attributes;
    const TagName = ordered ? "ol" : "ul";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...import_block_editor.useBlockProps.save({ type, reversed, start }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: values, multiline: "li" }) });
  },
  migrate: import_utils.migrateToListV2
};
var v2 = {
  attributes: {
    ordered: {
      type: "boolean",
      default: false,
      role: "content"
    },
    values: {
      type: "string",
      source: "html",
      selector: "ol,ul",
      multiline: "li",
      __unstableMultilineWrapperTags: ["ol", "ul"],
      default: "",
      role: "content"
    },
    type: {
      type: "string"
    },
    start: {
      type: "number"
    },
    reversed: {
      type: "boolean"
    },
    placeholder: {
      type: "string"
    }
  },
  supports: {
    anchor: true,
    className: false,
    typography: {
      fontSize: true,
      lineHeight: true,
      __experimentalFontFamily: true,
      __experimentalFontWeight: true,
      __experimentalFontStyle: true,
      __experimentalTextTransform: true,
      __experimentalTextDecoration: true,
      __experimentalLetterSpacing: true,
      __experimentalDefaultControls: {
        fontSize: true
      }
    },
    color: {
      gradients: true,
      link: true,
      __experimentalDefaultControls: {
        background: true,
        text: true
      }
    },
    spacing: {
      margin: true,
      padding: true,
      __experimentalDefaultControls: {
        margin: false,
        padding: false
      }
    },
    __unstablePasteTextInline: true,
    __experimentalSelector: "ol,ul",
    __experimentalSlashInserter: true
  },
  isEligible({ type }) {
    return !!type;
  },
  save({ attributes }) {
    const { ordered, type, reversed, start } = attributes;
    const TagName = ordered ? "ol" : "ul";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...import_block_editor.useBlockProps.save({ type, reversed, start }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) });
  },
  migrate: import_utils.migrateTypeToInlineStyle
};
var v3 = {
  attributes: {
    ordered: {
      type: "boolean",
      default: false,
      role: "content"
    },
    values: {
      type: "string",
      source: "html",
      selector: "ol,ul",
      multiline: "li",
      __unstableMultilineWrapperTags: ["ol", "ul"],
      default: "",
      role: "content"
    },
    type: {
      type: "string"
    },
    start: {
      type: "number"
    },
    reversed: {
      type: "boolean"
    },
    placeholder: {
      type: "string"
    }
  },
  supports: {
    anchor: true,
    className: false,
    typography: {
      fontSize: true,
      lineHeight: true,
      __experimentalFontFamily: true,
      __experimentalFontWeight: true,
      __experimentalFontStyle: true,
      __experimentalTextTransform: true,
      __experimentalTextDecoration: true,
      __experimentalLetterSpacing: true,
      __experimentalDefaultControls: {
        fontSize: true
      }
    },
    color: {
      gradients: true,
      link: true,
      __experimentalDefaultControls: {
        background: true,
        text: true
      }
    },
    spacing: {
      margin: true,
      padding: true,
      __experimentalDefaultControls: {
        margin: false,
        padding: false
      }
    },
    __unstablePasteTextInline: true,
    __experimentalSelector: "ol,ul",
    __experimentalOnMerge: "true",
    __experimentalSlashInserter: true
  },
  save({ attributes }) {
    const { ordered, type, reversed, start } = attributes;
    const TagName = ordered ? "ol" : "ul";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      TagName,
      {
        ...import_block_editor.useBlockProps.save({
          reversed,
          start,
          style: {
            listStyleType: ordered && type !== "decimal" ? type : void 0
          }
        }),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {})
      }
    );
  }
};
var deprecated_default = [v3, v2, v1, v0];
//# sourceMappingURL=deprecated.cjs.map
