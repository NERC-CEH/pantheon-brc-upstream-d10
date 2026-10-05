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

// packages/block-library/src/file/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_i18n = require("@wordpress/i18n");
var import_jsx_runtime = require("react/jsx-runtime");
var v3 = {
  attributes: {
    id: {
      type: "number"
    },
    href: {
      type: "string"
    },
    fileId: {
      type: "string",
      source: "attribute",
      selector: "a:not([download])",
      attribute: "id"
    },
    fileName: {
      type: "string",
      source: "html",
      selector: "a:not([download])"
    },
    textLinkHref: {
      type: "string",
      source: "attribute",
      selector: "a:not([download])",
      attribute: "href"
    },
    textLinkTarget: {
      type: "string",
      source: "attribute",
      selector: "a:not([download])",
      attribute: "target"
    },
    showDownloadButton: {
      type: "boolean",
      default: true
    },
    downloadButtonText: {
      type: "string",
      source: "html",
      selector: "a[download]"
    },
    displayPreview: {
      type: "boolean"
    },
    previewHeight: {
      type: "number",
      default: 600
    }
  },
  supports: {
    anchor: true,
    align: true
  },
  save({ attributes }) {
    const {
      href,
      fileId,
      fileName,
      textLinkHref,
      textLinkTarget,
      showDownloadButton,
      downloadButtonText,
      displayPreview,
      previewHeight
    } = attributes;
    const pdfEmbedLabel = import_block_editor.RichText.isEmpty(fileName) ? (0, import_i18n.__)("PDF embed") : (0, import_i18n.sprintf)(
      /* translators: %s: filename. */
      (0, import_i18n.__)("Embed of %s."),
      fileName
    );
    const hasFilename = !import_block_editor.RichText.isEmpty(fileName);
    const describedById = hasFilename ? fileId : void 0;
    return href && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save(), children: [
      displayPreview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "object",
        {
          className: "wp-block-file__embed",
          data: href,
          type: "application/pdf",
          style: {
            width: "100%",
            height: `${previewHeight}px`
          },
          "aria-label": pdfEmbedLabel
        }
      ) }),
      hasFilename && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          id: describedById,
          href: textLinkHref,
          target: textLinkTarget,
          rel: textLinkTarget ? "noreferrer noopener" : void 0,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: fileName })
        }
      ),
      showDownloadButton && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          href,
          className: (0, import_clsx.default)(
            "wp-block-file__button",
            (0, import_block_editor.__experimentalGetElementClassName)("button")
          ),
          download: true,
          "aria-describedby": describedById,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: downloadButtonText })
        }
      )
    ] });
  }
};
var v2 = {
  attributes: {
    id: {
      type: "number"
    },
    href: {
      type: "string"
    },
    fileId: {
      type: "string",
      source: "attribute",
      selector: "a:not([download])",
      attribute: "id"
    },
    fileName: {
      type: "string",
      source: "html",
      selector: "a:not([download])"
    },
    textLinkHref: {
      type: "string",
      source: "attribute",
      selector: "a:not([download])",
      attribute: "href"
    },
    textLinkTarget: {
      type: "string",
      source: "attribute",
      selector: "a:not([download])",
      attribute: "target"
    },
    showDownloadButton: {
      type: "boolean",
      default: true
    },
    downloadButtonText: {
      type: "string",
      source: "html",
      selector: "a[download]"
    },
    displayPreview: {
      type: "boolean"
    },
    previewHeight: {
      type: "number",
      default: 600
    }
  },
  supports: {
    anchor: true,
    align: true
  },
  save({ attributes }) {
    const {
      href,
      fileId,
      fileName,
      textLinkHref,
      textLinkTarget,
      showDownloadButton,
      downloadButtonText,
      displayPreview,
      previewHeight
    } = attributes;
    const pdfEmbedLabel = import_block_editor.RichText.isEmpty(fileName) ? (0, import_i18n.__)("PDF embed") : (0, import_i18n.sprintf)(
      /* translators: %s: filename. */
      (0, import_i18n.__)("Embed of %s."),
      fileName
    );
    const hasFilename = !import_block_editor.RichText.isEmpty(fileName);
    const describedById = hasFilename ? fileId : void 0;
    return href && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save(), children: [
      displayPreview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "object",
        {
          className: "wp-block-file__embed",
          data: href,
          type: "application/pdf",
          style: {
            width: "100%",
            height: `${previewHeight}px`
          },
          "aria-label": pdfEmbedLabel
        }
      ) }),
      hasFilename && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          id: describedById,
          href: textLinkHref,
          target: textLinkTarget,
          rel: textLinkTarget ? "noreferrer noopener" : void 0,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: fileName })
        }
      ),
      showDownloadButton && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          href,
          className: "wp-block-file__button",
          download: true,
          "aria-describedby": describedById,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: downloadButtonText })
        }
      )
    ] });
  }
};
var v1 = {
  attributes: {
    id: {
      type: "number"
    },
    href: {
      type: "string"
    },
    fileName: {
      type: "string",
      source: "html",
      selector: "a:not([download])"
    },
    textLinkHref: {
      type: "string",
      source: "attribute",
      selector: "a:not([download])",
      attribute: "href"
    },
    textLinkTarget: {
      type: "string",
      source: "attribute",
      selector: "a:not([download])",
      attribute: "target"
    },
    showDownloadButton: {
      type: "boolean",
      default: true
    },
    downloadButtonText: {
      type: "string",
      source: "html",
      selector: "a[download]"
    },
    displayPreview: {
      type: "boolean"
    },
    previewHeight: {
      type: "number",
      default: 600
    }
  },
  supports: {
    anchor: true,
    align: true
  },
  save({ attributes }) {
    const {
      href,
      fileName,
      textLinkHref,
      textLinkTarget,
      showDownloadButton,
      downloadButtonText,
      displayPreview,
      previewHeight
    } = attributes;
    const pdfEmbedLabel = import_block_editor.RichText.isEmpty(fileName) ? (0, import_i18n.__)("PDF embed") : (0, import_i18n.sprintf)(
      /* translators: %s: filename. */
      (0, import_i18n.__)("Embed of %s."),
      fileName
    );
    return href && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...import_block_editor.useBlockProps.save(), children: [
      displayPreview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "object",
        {
          className: "wp-block-file__embed",
          data: href,
          type: "application/pdf",
          style: {
            width: "100%",
            height: `${previewHeight}px`
          },
          "aria-label": pdfEmbedLabel
        }
      ) }),
      !import_block_editor.RichText.isEmpty(fileName) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          href: textLinkHref,
          target: textLinkTarget,
          rel: textLinkTarget ? "noreferrer noopener" : void 0,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: fileName })
        }
      ),
      showDownloadButton && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          href,
          className: "wp-block-file__button",
          download: true,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: downloadButtonText })
        }
      )
    ] });
  }
};
var deprecated = [v3, v2, v1];
var deprecated_default = deprecated;
//# sourceMappingURL=deprecated.cjs.map
