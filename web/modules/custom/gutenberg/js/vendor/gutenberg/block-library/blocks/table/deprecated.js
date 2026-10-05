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

// packages/block-library/src/table/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
var oldColors = {
  "subtle-light-gray": "#f3f4f5",
  "subtle-pale-green": "#e9fbe5",
  "subtle-pale-blue": "#e7f5fe",
  "subtle-pale-pink": "#fcf0ef"
};
var v4Query = {
  content: {
    type: "rich-text",
    source: "rich-text"
  },
  tag: {
    type: "string",
    default: "td",
    source: "tag"
  },
  scope: {
    type: "string",
    source: "attribute",
    attribute: "scope"
  },
  align: {
    type: "string",
    source: "attribute",
    attribute: "data-align"
  },
  colspan: {
    type: "string",
    source: "attribute",
    attribute: "colspan"
  },
  rowspan: {
    type: "string",
    source: "attribute",
    attribute: "rowspan"
  }
};
var v4 = {
  attributes: {
    hasFixedLayout: {
      type: "boolean",
      default: false
    },
    caption: {
      type: "rich-text",
      source: "rich-text",
      selector: "figcaption"
    },
    head: {
      type: "array",
      default: [],
      source: "query",
      selector: "thead tr",
      query: {
        cells: {
          type: "array",
          default: [],
          source: "query",
          selector: "td,th",
          query: v4Query
        }
      }
    },
    body: {
      type: "array",
      default: [],
      source: "query",
      selector: "tbody tr",
      query: {
        cells: {
          type: "array",
          default: [],
          source: "query",
          selector: "td,th",
          query: v4Query
        }
      }
    },
    foot: {
      type: "array",
      default: [],
      source: "query",
      selector: "tfoot tr",
      query: {
        cells: {
          type: "array",
          default: [],
          source: "query",
          selector: "td,th",
          query: v4Query
        }
      }
    }
  },
  supports: {
    anchor: true,
    align: true,
    color: {
      __experimentalSkipSerialization: true,
      gradients: true,
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
    typography: {
      fontSize: true,
      lineHeight: true,
      __experimentalFontFamily: true,
      __experimentalFontStyle: true,
      __experimentalFontWeight: true,
      __experimentalLetterSpacing: true,
      __experimentalTextTransform: true,
      __experimentalTextDecoration: true,
      __experimentalDefaultControls: {
        fontSize: true
      }
    },
    __experimentalBorder: {
      __experimentalSkipSerialization: true,
      color: true,
      style: true,
      width: true,
      __experimentalDefaultControls: {
        color: true,
        style: true,
        width: true
      }
    },
    __experimentalSelector: ".wp-block-table > table",
    interactivity: {
      clientNavigation: true
    }
  },
  save({ attributes }) {
    const { hasFixedLayout, head, body, foot, caption } = attributes;
    const isEmpty = !head.length && !body.length && !foot.length;
    if (isEmpty) {
      return null;
    }
    const colorProps = (0, import_block_editor.__experimentalGetColorClassesAndStyles)(attributes);
    const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
    const classes = (0, import_clsx.default)(colorProps.className, borderProps.className, {
      "has-fixed-layout": hasFixedLayout
    });
    const hasCaption = !import_block_editor.RichText.isEmpty(caption);
    const Section = ({ type, rows }) => {
      if (!rows.length) {
        return null;
      }
      const Tag = `t${type}`;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { children: rows.map(({ cells }, rowIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: cells.map(
        ({
          content,
          tag,
          scope,
          align,
          colspan,
          rowspan
        }, cellIndex) => {
          const cellClasses = (0, import_clsx.default)({
            [`has-text-align-${align}`]: align
          });
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.RichText.Content,
            {
              className: cellClasses ? cellClasses : void 0,
              "data-align": align,
              tagName: tag,
              value: content,
              scope: tag === "th" ? scope : void 0,
              colSpan: colspan,
              rowSpan: rowspan
            },
            cellIndex
          );
        }
      ) }, rowIndex)) });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...import_block_editor.useBlockProps.save(), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "table",
        {
          className: classes === "" ? void 0 : classes,
          style: { ...colorProps.style, ...borderProps.style },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { type: "head", rows: head }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { type: "body", rows: body }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { type: "foot", rows: foot })
          ]
        }
      ),
      hasCaption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          tagName: "figcaption",
          value: caption,
          className: (0, import_block_editor.__experimentalGetElementClassName)(
            "caption"
          )
        }
      )
    ] });
  }
};
var v3Query = {
  content: {
    type: "string",
    source: "html"
  },
  tag: {
    type: "string",
    default: "td",
    source: "tag"
  },
  scope: {
    type: "string",
    source: "attribute",
    attribute: "scope"
  },
  align: {
    type: "string",
    source: "attribute",
    attribute: "data-align"
  }
};
var v3 = {
  attributes: {
    hasFixedLayout: {
      type: "boolean",
      default: false
    },
    caption: {
      type: "string",
      source: "html",
      selector: "figcaption",
      default: ""
    },
    head: {
      type: "array",
      default: [],
      source: "query",
      selector: "thead tr",
      query: {
        cells: {
          type: "array",
          default: [],
          source: "query",
          selector: "td,th",
          query: v3Query
        }
      }
    },
    body: {
      type: "array",
      default: [],
      source: "query",
      selector: "tbody tr",
      query: {
        cells: {
          type: "array",
          default: [],
          source: "query",
          selector: "td,th",
          query: v3Query
        }
      }
    },
    foot: {
      type: "array",
      default: [],
      source: "query",
      selector: "tfoot tr",
      query: {
        cells: {
          type: "array",
          default: [],
          source: "query",
          selector: "td,th",
          query: v3Query
        }
      }
    }
  },
  supports: {
    anchor: true,
    align: true,
    color: {
      __experimentalSkipSerialization: true,
      gradients: true,
      __experimentalDefaultControls: {
        background: true,
        text: true
      }
    },
    spacing: {
      margin: true,
      padding: true
    },
    typography: {
      fontSize: true,
      lineHeight: true,
      __experimentalFontFamily: true,
      __experimentalFontStyle: true,
      __experimentalFontWeight: true,
      __experimentalLetterSpacing: true,
      __experimentalTextTransform: true,
      __experimentalTextDecoration: true,
      __experimentalDefaultControls: {
        fontSize: true
      }
    },
    __experimentalBorder: {
      __experimentalSkipSerialization: true,
      color: true,
      style: true,
      width: true,
      __experimentalDefaultControls: {
        color: true,
        style: true,
        width: true
      }
    },
    __experimentalSelector: ".wp-block-table > table"
  },
  save({ attributes }) {
    const { hasFixedLayout, head, body, foot, caption } = attributes;
    const isEmpty = !head.length && !body.length && !foot.length;
    if (isEmpty) {
      return null;
    }
    const colorProps = (0, import_block_editor.__experimentalGetColorClassesAndStyles)(attributes);
    const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
    const classes = (0, import_clsx.default)(colorProps.className, borderProps.className, {
      "has-fixed-layout": hasFixedLayout
    });
    const hasCaption = !import_block_editor.RichText.isEmpty(caption);
    const Section = ({ type, rows }) => {
      if (!rows.length) {
        return null;
      }
      const Tag = `t${type}`;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { children: rows.map(({ cells }, rowIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: cells.map(
        ({ content, tag, scope, align }, cellIndex) => {
          const cellClasses = (0, import_clsx.default)({
            [`has-text-align-${align}`]: align
          });
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.RichText.Content,
            {
              className: cellClasses ? cellClasses : void 0,
              "data-align": align,
              tagName: tag,
              value: content,
              scope: tag === "th" ? scope : void 0
            },
            cellIndex
          );
        }
      ) }, rowIndex)) });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...import_block_editor.useBlockProps.save(), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "table",
        {
          className: classes === "" ? void 0 : classes,
          style: { ...colorProps.style, ...borderProps.style },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { type: "head", rows: head }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { type: "body", rows: body }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { type: "foot", rows: foot })
          ]
        }
      ),
      hasCaption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "figcaption", value: caption })
    ] });
  }
};
var v2Query = {
  content: {
    type: "string",
    source: "html"
  },
  tag: {
    type: "string",
    default: "td",
    source: "tag"
  },
  scope: {
    type: "string",
    source: "attribute",
    attribute: "scope"
  },
  align: {
    type: "string",
    source: "attribute",
    attribute: "data-align"
  }
};
var v2 = {
  attributes: {
    hasFixedLayout: {
      type: "boolean",
      default: false
    },
    backgroundColor: {
      type: "string"
    },
    caption: {
      type: "string",
      source: "html",
      selector: "figcaption",
      default: ""
    },
    head: {
      type: "array",
      default: [],
      source: "query",
      selector: "thead tr",
      query: {
        cells: {
          type: "array",
          default: [],
          source: "query",
          selector: "td,th",
          query: v2Query
        }
      }
    },
    body: {
      type: "array",
      default: [],
      source: "query",
      selector: "tbody tr",
      query: {
        cells: {
          type: "array",
          default: [],
          source: "query",
          selector: "td,th",
          query: v2Query
        }
      }
    },
    foot: {
      type: "array",
      default: [],
      source: "query",
      selector: "tfoot tr",
      query: {
        cells: {
          type: "array",
          default: [],
          source: "query",
          selector: "td,th",
          query: v2Query
        }
      }
    }
  },
  supports: {
    anchor: true,
    align: true,
    __experimentalSelector: ".wp-block-table > table"
  },
  save: ({ attributes }) => {
    const { hasFixedLayout, head, body, foot, backgroundColor, caption } = attributes;
    const isEmpty = !head.length && !body.length && !foot.length;
    if (isEmpty) {
      return null;
    }
    const backgroundClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      backgroundColor
    );
    const classes = (0, import_clsx.default)(backgroundClass, {
      "has-fixed-layout": hasFixedLayout,
      "has-background": !!backgroundClass
    });
    const hasCaption = !import_block_editor.RichText.isEmpty(caption);
    const Section = ({ type, rows }) => {
      if (!rows.length) {
        return null;
      }
      const Tag = `t${type}`;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { children: rows.map(({ cells }, rowIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: cells.map(
        ({ content, tag, scope, align }, cellIndex) => {
          const cellClasses = (0, import_clsx.default)({
            [`has-text-align-${align}`]: align
          });
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.RichText.Content,
            {
              className: cellClasses ? cellClasses : void 0,
              "data-align": align,
              tagName: tag,
              value: content,
              scope: tag === "th" ? scope : void 0
            },
            cellIndex
          );
        }
      ) }, rowIndex)) });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...import_block_editor.useBlockProps.save(), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: classes === "" ? void 0 : classes, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { type: "head", rows: head }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { type: "body", rows: body }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { type: "foot", rows: foot })
      ] }),
      hasCaption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "figcaption", value: caption })
    ] });
  },
  isEligible: (attributes) => {
    return attributes.backgroundColor && attributes.backgroundColor in oldColors && !attributes.style;
  },
  // This version is the first to introduce the style attribute to the
  // table block. As a result, we'll explicitly override that.
  migrate: (attributes) => {
    return {
      ...attributes,
      backgroundColor: void 0,
      style: {
        color: {
          background: oldColors[attributes.backgroundColor]
        }
      }
    };
  }
};
var v1Query = {
  content: {
    type: "string",
    source: "html"
  },
  tag: {
    type: "string",
    default: "td",
    source: "tag"
  },
  scope: {
    type: "string",
    source: "attribute",
    attribute: "scope"
  }
};
var v1 = {
  attributes: {
    hasFixedLayout: {
      type: "boolean",
      default: false
    },
    backgroundColor: {
      type: "string"
    },
    head: {
      type: "array",
      default: [],
      source: "query",
      selector: "thead tr",
      query: {
        cells: {
          type: "array",
          default: [],
          source: "query",
          selector: "td,th",
          query: v1Query
        }
      }
    },
    body: {
      type: "array",
      default: [],
      source: "query",
      selector: "tbody tr",
      query: {
        cells: {
          type: "array",
          default: [],
          source: "query",
          selector: "td,th",
          query: v1Query
        }
      }
    },
    foot: {
      type: "array",
      default: [],
      source: "query",
      selector: "tfoot tr",
      query: {
        cells: {
          type: "array",
          default: [],
          source: "query",
          selector: "td,th",
          query: v1Query
        }
      }
    }
  },
  supports: {
    align: true
  },
  save({ attributes }) {
    const { hasFixedLayout, head, body, foot, backgroundColor } = attributes;
    const isEmpty = !head.length && !body.length && !foot.length;
    if (isEmpty) {
      return null;
    }
    const backgroundClass = (0, import_block_editor.getColorClassName)(
      "background-color",
      backgroundColor
    );
    const classes = (0, import_clsx.default)(backgroundClass, {
      "has-fixed-layout": hasFixedLayout,
      "has-background": !!backgroundClass
    });
    const Section = ({ type, rows }) => {
      if (!rows.length) {
        return null;
      }
      const Tag = `t${type}`;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { children: rows.map(({ cells }, rowIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: cells.map(
        ({ content, tag, scope }, cellIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_block_editor.RichText.Content,
          {
            tagName: tag,
            value: content,
            scope: tag === "th" ? scope : void 0
          },
          cellIndex
        )
      ) }, rowIndex)) });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: classes, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { type: "head", rows: head }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { type: "body", rows: body }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { type: "foot", rows: foot })
    ] });
  }
};
var deprecated_default = [v4, v3, v2, v1];
//# sourceMappingURL=deprecated.cjs.map
