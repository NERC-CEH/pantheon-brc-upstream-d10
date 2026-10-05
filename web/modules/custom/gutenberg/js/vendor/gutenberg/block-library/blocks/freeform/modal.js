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

// packages/block-library/src/freeform/modal.jsx
var modal_exports = {};
__export(modal_exports, {
  default: () => ModalEdit
});
module.exports = __toCommonJS(modal_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_element = require("@wordpress/element");
var import_i18n = require("@wordpress/i18n");
var import_data = require("@wordpress/data");
var import_icons = require("@wordpress/icons");
var import_compose = require("@wordpress/compose");
var import_jsx_runtime = require("react/jsx-runtime");
function ModalAuxiliaryActions({ onClick, isModalFullScreen }) {
  const isMobileViewport = (0, import_compose.useViewportMatch)("small", "<");
  if (isMobileViewport) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.Button,
    {
      size: "compact",
      onClick,
      icon: import_icons.fullscreen,
      isPressed: isModalFullScreen,
      label: isModalFullScreen ? (0, import_i18n.__)("Exit fullscreen") : (0, import_i18n.__)("Enter fullscreen")
    }
  );
}
function ClassicEdit(props) {
  const styles = (0, import_data.useSelect)(
    (select) => select(import_block_editor.store).getSettings().styles
  );
  (0, import_element.useEffect)(() => {
    const { baseURL, suffix, settings } = window.wpEditorL10n.tinymce;
    window.tinymce.EditorManager.overrideDefaults({
      base_url: baseURL,
      suffix
    });
    window.wp.oldEditor.initialize(props.id, {
      tinymce: {
        ...settings,
        setup(editor) {
          editor.on("init", () => {
            const doc = editor.getDoc();
            styles.forEach(({ css }) => {
              const styleEl = doc.createElement("style");
              styleEl.innerHTML = css;
              doc.head.appendChild(styleEl);
            });
          });
        }
      }
    });
    return () => {
      window.wp.oldEditor.remove(props.id);
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { ...props });
}
function ModalEdit({ clientId, content, onClose, onChange }) {
  const [isModalFullScreen, setIsModalFullScreen] = (0, import_element.useState)(false);
  const id = `editor-${clientId}`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_components.Modal,
    {
      title: (0, import_i18n.__)("Classic Editor"),
      onRequestClose: onClose,
      shouldCloseOnClickOutside: false,
      overlayClassName: "block-editor-freeform-modal",
      isFullScreen: isModalFullScreen,
      className: "block-editor-freeform-modal__content",
      headerActions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ModalAuxiliaryActions,
        {
          onClick: () => setIsModalFullScreen(!isModalFullScreen),
          isModalFullScreen
        }
      ),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassicEdit, { id, defaultValue: content }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          import_components.Flex,
          {
            className: "block-editor-freeform-modal__actions",
            justify: "flex-end",
            expanded: false,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.FlexItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.Button,
                {
                  __next40pxDefaultSize: true,
                  variant: "tertiary",
                  onClick: onClose,
                  children: (0, import_i18n.__)("Cancel")
                }
              ) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.FlexItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.Button,
                {
                  __next40pxDefaultSize: true,
                  variant: "primary",
                  onClick: () => {
                    onChange(window.wp.oldEditor.getContent(id));
                    onClose();
                  },
                  children: (0, import_i18n.__)("Save")
                }
              ) })
            ]
          }
        )
      ]
    }
  );
}
//# sourceMappingURL=modal.cjs.map
