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

// packages/block-library/src/verse/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_migrate_font_family = __toESM(require("../utils/migrate-font-family.cjs"));
var import_migrate_text_align = __toESM(require("../utils/migrate-text-align.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var v1 = {
  attributes: {
    content: {
      type: "string",
      source: "html",
      selector: "pre",
      default: ""
    },
    textAlign: {
      type: "string"
    }
  },
  save({ attributes }) {
    const { textAlign, content } = attributes;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText.Content,
      {
        tagName: "pre",
        style: { textAlign },
        value: content
      }
    );
  },
  migrate: import_migrate_text_align.default
};
var v2 = {
  attributes: {
    content: {
      type: "string",
      source: "html",
      selector: "pre",
      default: "",
      __unstablePreserveWhiteSpace: true,
      role: "content"
    },
    textAlign: {
      type: "string"
    }
  },
  supports: {
    anchor: true,
    color: {
      gradients: true,
      link: true
    },
    typography: {
      fontSize: true,
      __experimentalFontFamily: true
    },
    spacing: {
      padding: true
    }
  },
  save({ attributes }) {
    const { textAlign, content } = attributes;
    const className = (0, import_clsx.default)({
      [`has-text-align-${textAlign}`]: textAlign
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { ...import_block_editor.useBlockProps.save({ className }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: content }) });
  },
  migrate(attributes) {
    return (0, import_migrate_text_align.default)((0, import_migrate_font_family.default)(attributes));
  },
  isEligible({ style, textAlign }) {
    return style?.typography?.fontFamily || !!textAlign;
  }
};
var v3 = {
  attributes: {
    content: {
      type: "rich-text",
      source: "rich-text",
      selector: "pre",
      __unstablePreserveWhiteSpace: true,
      role: "content"
    },
    textAlign: {
      type: "string"
    }
  },
  supports: {
    anchor: true,
    background: {
      backgroundImage: true,
      backgroundSize: true
    },
    color: {
      gradients: true,
      link: true
    },
    dimensions: {
      minHeight: true
    },
    typography: {
      fontSize: true,
      __experimentalFontFamily: true,
      lineHeight: true,
      __experimentalFontStyle: true,
      __experimentalFontWeight: true,
      __experimentalLetterSpacing: true,
      __experimentalTextTransform: true,
      __experimentalTextDecoration: true,
      __experimentalWritingMode: true
    },
    spacing: {
      margin: true,
      padding: true
    },
    __experimentalBorder: {
      radius: true,
      width: true,
      color: true,
      style: true
    },
    interactivity: {
      clientNavigation: true
    }
  },
  save({ attributes }) {
    const { textAlign, content } = attributes;
    const className = (0, import_clsx.default)({
      [`has-text-align-${textAlign}`]: textAlign
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { ...import_block_editor.useBlockProps.save({ className }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: content }) });
  },
  migrate: import_migrate_text_align.default,
  isEligible(attributes) {
    return !!attributes.textAlign || !!attributes.className?.match(
      /\bhas-text-align-(left|center|right)\b/
    );
  }
};
var deprecated_default = [v3, v2, v1];
//# sourceMappingURL=deprecated.cjs.map
