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

// packages/block-library/src/file/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  MAX_PREVIEW_HEIGHT: () => MAX_PREVIEW_HEIGHT,
  MIN_PREVIEW_HEIGHT: () => MIN_PREVIEW_HEIGHT,
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_blob = require("@wordpress/blob");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_block_editor = require("@wordpress/block-editor");
var import_element = require("@wordpress/element");
var import_compose = require("@wordpress/compose");
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var import_core_data = require("@wordpress/core-data");
var import_notices = require("@wordpress/notices");
var import_url = require("@wordpress/url");
var import_inspector = __toESM(require("./inspector.cjs"));
var import_utils = require("./utils/index.cjs");
var import_remove_anchor_tag = __toESM(require("../utils/remove-anchor-tag.cjs"));
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var MIN_PREVIEW_HEIGHT = 200;
var MAX_PREVIEW_HEIGHT = 2e3;
function ClipboardToolbarButton({ text, disabled }) {
  const { createNotice } = (0, import_data.useDispatch)(import_notices.store);
  const ref = (0, import_compose.useCopyToClipboard)(text, () => {
    createNotice("info", (0, import_i18n.__)("Copied URL to clipboard."), {
      isDismissible: true,
      type: "snackbar"
    });
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.ToolbarButton,
    {
      className: "components-clipboard-toolbar-button",
      ref,
      disabled,
      children: (0, import_i18n.__)("Copy URL")
    }
  );
}
function FileEdit({ attributes, isSelected, setAttributes, clientId }) {
  const {
    id,
    fileName,
    href,
    textLinkHref,
    textLinkTarget,
    showDownloadButton,
    downloadButtonText,
    displayPreview,
    previewHeight
  } = attributes;
  const [temporaryURL, setTemporaryURL] = (0, import_element.useState)(attributes.blob);
  const { media } = (0, import_data.useSelect)(
    (select) => ({
      media: !!id ? select(import_core_data.store).getEntityRecord(
        "postType",
        "attachment",
        id,
        { context: "view" }
      ) : void 0
    }),
    [id]
  );
  const { createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
  const { toggleSelection } = (0, import_data.useDispatch)(import_block_editor.store);
  (0, import_hooks.useUploadMediaFromBlobURL)({
    url: temporaryURL,
    onChange: onSelectFile,
    onError: onUploadError
  });
  function onSelectFile(newMedia) {
    if (!newMedia || !newMedia.url) {
      setAttributes({
        href: void 0,
        fileName: void 0,
        textLinkHref: void 0,
        id: void 0,
        fileId: void 0,
        displayPreview: void 0,
        previewHeight: void 0
      });
      setTemporaryURL();
      return;
    }
    if ((0, import_blob.isBlobURL)(newMedia.url)) {
      setTemporaryURL(newMedia.url);
      return;
    }
    const isPdf = (
      // Media Library and REST API use different properties for mime type.
      (newMedia.mime || newMedia.mime_type) === "application/pdf" || (0, import_url.getFilename)(newMedia.url).toLowerCase().endsWith(".pdf")
    );
    const pdfAttributes = {
      displayPreview: isPdf ? attributes.displayPreview ?? true : void 0,
      previewHeight: isPdf ? attributes.previewHeight ?? 600 : void 0
    };
    setAttributes({
      href: newMedia.url,
      fileName: newMedia.title,
      textLinkHref: newMedia.url,
      id: newMedia.id,
      fileId: `wp-block-file--media-${clientId}`,
      blob: void 0,
      ...pdfAttributes
    });
    setTemporaryURL();
  }
  function onUploadError(message) {
    setAttributes({ href: void 0 });
    createErrorNotice(message, { type: "snackbar" });
  }
  function changeLinkDestinationOption(newHref) {
    setAttributes({ textLinkHref: newHref });
  }
  function changeOpenInNewWindow(newValue) {
    setAttributes({
      textLinkTarget: newValue ? "_blank" : false
    });
  }
  function changeShowDownloadButton(newValue) {
    setAttributes({ showDownloadButton: newValue });
  }
  function changeDisplayPreview(newValue) {
    setAttributes({ displayPreview: newValue });
  }
  function handleOnResizeStop(event, direction, elt, delta) {
    toggleSelection(true);
    const newHeight = parseInt(previewHeight + delta.height, 10);
    setAttributes({ previewHeight: newHeight });
  }
  function changePreviewHeight(newValue) {
    const newHeight = Math.max(
      parseInt(newValue, 10),
      MIN_PREVIEW_HEIGHT
    );
    setAttributes({ previewHeight: newHeight });
  }
  const attachmentPage = media && media.link;
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: (0, import_clsx.default)(
      !!temporaryURL && (0, import_components.__unstableGetAnimateClassName)({ type: "loading" }),
      {
        "is-transient": !!temporaryURL
      }
    )
  });
  const displayPreviewInEditor = (0, import_utils.browserSupportsPdfs)() && displayPreview;
  if (!href && !temporaryURL) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.MediaPlaceholder,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, { icon: import_icons.file }),
        labels: {
          title: (0, import_i18n.__)("File"),
          instructions: (0, import_i18n.__)(
            "Drag and drop a file, upload, or choose from your library."
          )
        },
        onSelect: onSelectFile,
        onError: onUploadError,
        accept: "*"
      }
    ) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_inspector.default,
      {
        hrefs: {
          href: href || temporaryURL,
          textLinkHref,
          attachmentPage
        },
        ...{
          openInNewWindow: !!textLinkTarget,
          showDownloadButton,
          changeLinkDestinationOption,
          changeOpenInNewWindow,
          changeShowDownloadButton,
          displayPreview,
          changeDisplayPreview,
          previewHeight,
          changePreviewHeight
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_block_editor.BlockControls, { group: "other", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.MediaReplaceFlow,
        {
          mediaId: id,
          mediaURL: href,
          accept: "*",
          onSelect: onSelectFile,
          onError: onUploadError,
          onReset: () => onSelectFile(void 0)
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ClipboardToolbarButton,
        {
          text: href,
          disabled: (0, import_blob.isBlobURL)(href)
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
      displayPreviewInEditor && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        import_components.ResizableBox,
        {
          size: { height: previewHeight, width: "100%" },
          minHeight: MIN_PREVIEW_HEIGHT,
          maxHeight: MAX_PREVIEW_HEIGHT,
          grid: [1, 10],
          enable: {
            top: false,
            right: false,
            bottom: true,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false
          },
          onResizeStart: () => toggleSelection(false),
          onResizeStop: handleOnResizeStop,
          showHandle: isSelected,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "object",
              {
                className: "wp-block-file__preview",
                data: href,
                type: "application/pdf",
                "aria-label": (0, import_i18n.__)(
                  "Embed of the selected PDF file."
                )
              }
            ),
            !isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-file__preview-overlay" })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wp-block-file__content-wrapper", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_block_editor.RichText,
          {
            identifier: "fileName",
            tagName: "a",
            value: fileName,
            placeholder: (0, import_i18n.__)("Write file name…"),
            withoutInteractiveFormatting: true,
            onChange: (text) => setAttributes({
              fileName: (0, import_remove_anchor_tag.default)(text)
            }),
            href: textLinkHref
          }
        ),
        showDownloadButton && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-file__button-richtext-wrapper", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_block_editor.RichText,
          {
            identifier: "downloadButtonText",
            tagName: "div",
            "aria-label": (0, import_i18n.__)("Download button text"),
            className: (0, import_clsx.default)(
              "wp-block-file__button",
              (0, import_block_editor.__experimentalGetElementClassName)(
                "button"
              )
            ),
            value: downloadButtonText,
            withoutInteractiveFormatting: true,
            placeholder: (0, import_i18n.__)("Add text…"),
            onChange: (text) => setAttributes({
              downloadButtonText: (0, import_remove_anchor_tag.default)(text)
            })
          }
        ) })
      ] })
    ] })
  ] });
}
var edit_default = FileEdit;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MAX_PREVIEW_HEIGHT,
  MIN_PREVIEW_HEIGHT
});
//# sourceMappingURL=edit.cjs.map
