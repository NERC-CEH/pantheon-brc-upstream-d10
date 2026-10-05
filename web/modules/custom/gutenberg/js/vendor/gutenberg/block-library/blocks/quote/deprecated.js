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

// packages/block-library/src/quote/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default,
  migrateToQuoteV2: () => migrateToQuoteV2
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_blocks = require("@wordpress/blocks");
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
var migrateToQuoteV2 = (attributes) => {
  const { value, ...restAttributes } = attributes;
  return [
    {
      ...restAttributes
    },
    value ? (0, import_blocks.parseWithAttributeSchema)(value, {
      type: "array",
      source: "query",
      selector: "p",
      query: {
        content: {
          type: "string",
          source: "html"
        }
      }
    }).map(
      ({ content }) => (0, import_blocks.createBlock)("core/paragraph", { content })
    ) : (0, import_blocks.createBlock)("core/paragraph")
  ];
};
var TEXT_ALIGN_OPTIONS = ["left", "right", "center"];
var migrateTextAlign = (attributes, innerBlocks) => {
  const { align, ...rest } = attributes;
  const migratedAttributes = TEXT_ALIGN_OPTIONS.includes(align) ? { ...rest, textAlign: align } : attributes;
  return [migratedAttributes, innerBlocks];
};
var migrateLargeStyle = (attributes, innerBlocks) => {
  return [
    {
      ...attributes,
      className: attributes.className ? attributes.className + " is-style-large" : "is-style-large"
    },
    innerBlocks
  ];
};
var v4 = {
  attributes: {
    value: {
      type: "string",
      source: "html",
      selector: "blockquote",
      multiline: "p",
      default: "",
      role: "content"
    },
    citation: {
      type: "string",
      source: "html",
      selector: "cite",
      default: "",
      role: "content"
    },
    align: {
      type: "string"
    }
  },
  supports: {
    anchor: true,
    html: false,
    __experimentalOnEnter: true,
    __experimentalOnMerge: true,
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
        fontSize: true,
        fontAppearance: true
      }
    },
    color: {
      gradients: true,
      heading: true,
      link: true,
      __experimentalDefaultControls: {
        background: true,
        text: true
      }
    }
  },
  isEligible: ({ align }) => TEXT_ALIGN_OPTIONS.includes(align),
  save({ attributes }) {
    const { align, citation } = attributes;
    const className = (0, import_clsx.default)({
      [`has-text-align-${align}`]: align
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", { ...import_block_editor.useBlockProps.save({ className }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}),
      !import_block_editor.RichText.isEmpty(citation) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "cite", value: citation })
    ] });
  },
  migrate: migrateTextAlign
};
var v3 = {
  attributes: {
    value: {
      type: "string",
      source: "html",
      selector: "blockquote",
      multiline: "p",
      default: "",
      role: "content"
    },
    citation: {
      type: "string",
      source: "html",
      selector: "cite",
      default: "",
      role: "content"
    },
    align: {
      type: "string"
    }
  },
  supports: {
    anchor: true,
    __experimentalSlashInserter: true,
    typography: {
      fontSize: true,
      lineHeight: true,
      __experimentalFontStyle: true,
      __experimentalFontWeight: true,
      __experimentalLetterSpacing: true,
      __experimentalTextTransform: true,
      __experimentalDefaultControls: {
        fontSize: true,
        fontAppearance: true
      }
    }
  },
  save({ attributes }) {
    const { align, value, citation } = attributes;
    const className = (0, import_clsx.default)({
      [`has-text-align-${align}`]: align
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", { ...import_block_editor.useBlockProps.save({ className }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { multiline: true, value }),
      !import_block_editor.RichText.isEmpty(citation) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "cite", value: citation })
    ] });
  },
  migrate(attributes) {
    return migrateTextAlign(...migrateToQuoteV2(attributes));
  }
};
var v2 = {
  attributes: {
    value: {
      type: "string",
      source: "html",
      selector: "blockquote",
      multiline: "p",
      default: ""
    },
    citation: {
      type: "string",
      source: "html",
      selector: "cite",
      default: ""
    },
    align: {
      type: "string"
    }
  },
  migrate(attributes) {
    return migrateTextAlign(...migrateToQuoteV2(attributes));
  },
  save({ attributes }) {
    const { align, value, citation } = attributes;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", { style: { textAlign: align ? align : null }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { multiline: true, value }),
      !import_block_editor.RichText.isEmpty(citation) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "cite", value: citation })
    ] });
  }
};
var v1 = {
  attributes: {
    value: {
      type: "string",
      source: "html",
      selector: "blockquote",
      multiline: "p",
      default: ""
    },
    citation: {
      type: "string",
      source: "html",
      selector: "cite",
      default: ""
    },
    align: {
      type: "string"
    },
    style: {
      type: "number",
      default: 1
    }
  },
  migrate(attributes) {
    if (attributes.style === 2) {
      const { style, ...restAttributes } = attributes;
      return migrateTextAlign(
        ...migrateLargeStyle(...migrateToQuoteV2(restAttributes))
      );
    }
    return migrateTextAlign(...migrateToQuoteV2(attributes));
  },
  save({ attributes }) {
    const { align, value, citation, style } = attributes;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "blockquote",
      {
        className: style === 2 ? "is-large" : "",
        style: { textAlign: align ? align : null },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { multiline: true, value }),
          !import_block_editor.RichText.isEmpty(citation) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "cite", value: citation })
        ]
      }
    );
  }
};
var v0 = {
  attributes: {
    value: {
      type: "string",
      source: "html",
      selector: "blockquote",
      multiline: "p",
      default: ""
    },
    citation: {
      type: "string",
      source: "html",
      selector: "footer",
      default: ""
    },
    align: {
      type: "string"
    },
    style: {
      type: "number",
      default: 1
    }
  },
  migrate(attributes) {
    if (!isNaN(parseInt(attributes.style))) {
      const { style, ...restAttributes } = attributes;
      return migrateTextAlign(...migrateToQuoteV2(restAttributes));
    }
    return migrateTextAlign(...migrateToQuoteV2(attributes));
  },
  save({ attributes }) {
    const { align, value, citation, style } = attributes;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "blockquote",
      {
        className: `blocks-quote-style-${style}`,
        style: { textAlign: align ? align : null },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { multiline: true, value }),
          !import_block_editor.RichText.isEmpty(citation) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "footer", value: citation })
        ]
      }
    );
  }
};
var deprecated_default = [v4, v3, v2, v1, v0];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  migrateToQuoteV2
});
//# sourceMappingURL=deprecated.cjs.map
