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

// packages/block-library/src/file/inspector.jsx
var inspector_exports = {};
__export(inspector_exports, {
  default: () => FileBlockInspector
});
module.exports = __toCommonJS(inspector_exports);
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_edit = require("./edit.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function FileBlockInspector({
  hrefs,
  openInNewWindow,
  showDownloadButton,
  changeLinkDestinationOption,
  changeOpenInNewWindow,
  changeShowDownloadButton,
  displayPreview,
  changeDisplayPreview,
  previewHeight,
  changePreviewHeight
}) {
  const { href, textLinkHref, attachmentPage } = hrefs;
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  let linkDestinationOptions = [{ value: href, label: (0, import_i18n.__)("URL") }];
  if (attachmentPage) {
    linkDestinationOptions = [
      { value: href, label: (0, import_i18n.__)("Media file") },
      { value: attachmentPage, label: (0, import_i18n.__)("Attachment page") }
    ];
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_block_editor.InspectorControls, { children: [
    href.endsWith(".pdf") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("PDF settings"),
        resetAll: () => {
          changeDisplayPreview(true);
          changePreviewHeight(600);
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Show inline embed"),
              isShownByDefault: true,
              hasValue: () => !displayPreview,
              onDeselect: () => changeDisplayPreview(true),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show inline embed"),
                  help: displayPreview ? (0, import_i18n.__)(
                    "Note: Most phone and tablet browsers won't display embedded PDFs."
                  ) : null,
                  checked: !!displayPreview,
                  onChange: changeDisplayPreview
                }
              )
            }
          ),
          displayPreview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Height in pixels"),
              isShownByDefault: true,
              hasValue: () => previewHeight !== 600,
              onDeselect: () => changePreviewHeight(600),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.RangeControl,
                {
                  label: (0, import_i18n.__)("Height in pixels"),
                  min: import_edit.MIN_PREVIEW_HEIGHT,
                  max: Math.max(
                    import_edit.MAX_PREVIEW_HEIGHT,
                    previewHeight
                  ),
                  value: previewHeight,
                  onChange: changePreviewHeight
                }
              )
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          changeLinkDestinationOption(href);
          changeOpenInNewWindow(false);
          changeShowDownloadButton(true);
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Link to"),
              isShownByDefault: true,
              hasValue: () => textLinkHref !== href,
              onDeselect: () => changeLinkDestinationOption(href),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.SelectControl,
                {
                  label: (0, import_i18n.__)("Link to"),
                  value: textLinkHref,
                  options: linkDestinationOptions,
                  onChange: changeLinkDestinationOption
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Open in new tab"),
              isShownByDefault: true,
              hasValue: () => !!openInNewWindow,
              onDeselect: () => changeOpenInNewWindow(false),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Open in new tab"),
                  checked: openInNewWindow,
                  onChange: changeOpenInNewWindow
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Show download button"),
              isShownByDefault: true,
              hasValue: () => !showDownloadButton,
              onDeselect: () => changeShowDownloadButton(true),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show download button"),
                  checked: showDownloadButton,
                  onChange: changeShowDownloadButton
                }
              )
            }
          )
        ]
      }
    )
  ] }) });
}
//# sourceMappingURL=inspector.cjs.map
