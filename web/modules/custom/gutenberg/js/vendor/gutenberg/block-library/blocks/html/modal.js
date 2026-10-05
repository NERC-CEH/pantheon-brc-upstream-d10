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

// packages/block-library/src/html/modal.jsx
var modal_exports = {};
__export(modal_exports, {
  default: () => HTMLEditModal
});
module.exports = __toCommonJS(modal_exports);
var import_i18n = require("@wordpress/i18n");
var import_element = require("@wordpress/element");
var import_data = require("@wordpress/data");
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_icons = require("@wordpress/icons");
var import_compose = require("@wordpress/compose");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_preview = __toESM(require("./preview.cjs"));
var import_utils = require("./utils.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var { Tabs } = (0, import_lock_unlock.unlock)(import_components.privateApis);
var { useNativeUndo } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
function HTMLEditModal({ onRequestClose, content, onUpdate }) {
  const { html, css, js } = (0, import_utils.parseContent)(content);
  const [editedHtml, setEditedHtml] = (0, import_element.useState)(html);
  const [editedCss, setEditedCss] = (0, import_element.useState)(css);
  const [editedJs, setEditedJs] = (0, import_element.useState)(js);
  const [isFullscreen, setIsFullscreen] = (0, import_element.useState)(false);
  const nativeUndoRef = useNativeUndo();
  const isMobileViewport = (0, import_compose.useViewportMatch)("small", "<");
  const { canUserUseUnfilteredHTML } = (0, import_data.useSelect)((select) => {
    const settings = select(import_block_editor.store).getSettings();
    return {
      canUserUseUnfilteredHTML: settings.__experimentalCanUserUseUnfilteredHTML
    };
  }, []);
  const hasRestrictedContent = !canUserUseUnfilteredHTML && (css.trim() || js.trim());
  const handleUpdate = () => {
    onUpdate(
      (0, import_utils.serializeContent)({
        html: editedHtml,
        css: canUserUseUnfilteredHTML ? editedCss : "",
        js: canUserUseUnfilteredHTML ? editedJs : ""
      })
    );
  };
  const handleUpdateAndClose = () => {
    handleUpdate();
    onRequestClose();
  };
  const toggleFullscreen = () => {
    setIsFullscreen((prevState) => !prevState);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.Modal,
    {
      title: (0, import_i18n.__)("Edit HTML"),
      onRequestClose,
      className: "block-library-html__modal",
      size: "large",
      isDismissible: false,
      shouldCloseOnClickOutside: false,
      isFullScreen: isFullscreen,
      __experimentalHideHeader: true,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, { orientation: "horizontal", defaultTabId: "html", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, { expanded: true, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          import_components.__experimentalHStack,
          {
            justify: "space-between",
            className: "block-library-html__modal-header",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs.TabList, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs.Tab, { tabId: "html", children: "HTML" }),
                canUserUseUnfilteredHTML && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs.Tab, { tabId: "css", children: "CSS" }),
                canUserUseUnfilteredHTML && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs.Tab, { tabId: "js", children: (0, import_i18n.__)("JavaScript") })
              ] }) }),
              !isMobileViewport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.Button,
                {
                  __next40pxDefaultSize: true,
                  icon: isFullscreen ? import_icons.square : import_icons.fullscreen,
                  label: (0, import_i18n.__)(
                    "Enable/disable fullscreen"
                  ),
                  onClick: toggleFullscreen,
                  variant: "tertiary"
                }
              ) })
            ]
          }
        ),
        hasRestrictedContent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.Notice,
          {
            status: "warning",
            isDismissible: false,
            className: "block-library-html__modal-notice",
            children: (0, import_i18n.__)(
              "This block contains CSS or JavaScript that will be removed when you save because you do not have permission to use unfiltered HTML."
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          import_components.Flex,
          {
            direction: isMobileViewport ? "column" : "row",
            className: "block-library-html__modal-tabs",
            align: "stretch",
            gap: 8,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "div",
                {
                  ref: nativeUndoRef,
                  className: "block-library-html__modal-content",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      Tabs.TabPanel,
                      {
                        tabId: "html",
                        focusable: false,
                        className: "block-library-html__modal-tab",
                        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          import_block_editor.PlainText,
                          {
                            value: editedHtml,
                            onChange: setEditedHtml,
                            placeholder: (0, import_i18n.__)("Write HTML…"),
                            "aria-label": (0, import_i18n.__)("HTML"),
                            className: "block-library-html__modal-editor",
                            async: true
                          }
                        )
                      }
                    ),
                    canUserUseUnfilteredHTML && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      Tabs.TabPanel,
                      {
                        tabId: "css",
                        focusable: false,
                        className: "block-library-html__modal-tab",
                        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          import_block_editor.PlainText,
                          {
                            value: editedCss,
                            onChange: setEditedCss,
                            placeholder: (0, import_i18n.__)("Write CSS…"),
                            "aria-label": (0, import_i18n.__)("CSS"),
                            className: "block-library-html__modal-editor",
                            async: true
                          }
                        )
                      }
                    ),
                    canUserUseUnfilteredHTML && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      Tabs.TabPanel,
                      {
                        tabId: "js",
                        focusable: false,
                        className: "block-library-html__modal-tab",
                        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          import_block_editor.PlainText,
                          {
                            value: editedJs,
                            onChange: setEditedJs,
                            placeholder: (0, import_i18n.__)(
                              "Write JavaScript…"
                            ),
                            "aria-label": (0, import_i18n.__)("JavaScript"),
                            className: "block-library-html__modal-editor",
                            async: true
                          }
                        )
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "block-library-html__preview", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_preview.default,
                {
                  content: (0, import_utils.serializeContent)({
                    html: editedHtml,
                    css: editedCss,
                    js: editedJs
                  })
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          import_components.__experimentalHStack,
          {
            alignment: "center",
            justify: "flex-end",
            spacing: 4,
            className: "block-library-html__modal-footer",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.Button,
                {
                  __next40pxDefaultSize: true,
                  variant: "tertiary",
                  onClick: onRequestClose,
                  children: (0, import_i18n.__)("Cancel")
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.Button,
                {
                  __next40pxDefaultSize: true,
                  variant: "primary",
                  onClick: handleUpdateAndClose,
                  children: (0, import_i18n.__)("Update")
                }
              )
            ]
          }
        )
      ] }) })
    }
  ) });
}
//# sourceMappingURL=modal.cjs.map
