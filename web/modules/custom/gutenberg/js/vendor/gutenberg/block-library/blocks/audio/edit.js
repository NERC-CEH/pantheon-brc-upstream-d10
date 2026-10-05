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

// packages/block-library/src/audio/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_blob = require("@wordpress/blob");
var import_components = require("@wordpress/components");
var import_ui = require("@wordpress/ui");
var import_block_editor = require("@wordpress/block-editor");
var import_i18n = require("@wordpress/i18n");
var import_data = require("@wordpress/data");
var import_icons = require("@wordpress/icons");
var import_notices = require("@wordpress/notices");
var import_element = require("@wordpress/element");
var import_util = require("../embed/util.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_caption = require("../utils/caption.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var ALLOWED_MEDIA_TYPES = ["audio"];
function AudioEdit({
  attributes,
  className,
  setAttributes,
  onReplace,
  isSelected: isSingleSelected,
  insertBlocksAfter
}) {
  const { id, autoplay, loop, preload, src } = attributes;
  const [temporaryURL, setTemporaryURL] = (0, import_element.useState)(attributes.blob);
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  const hasNonContentControls = blockEditingMode === "default";
  (0, import_hooks.useUploadMediaFromBlobURL)({
    url: temporaryURL,
    allowedTypes: ALLOWED_MEDIA_TYPES,
    onChange: onSelectAudio,
    onError: onUploadError
  });
  function toggleAttribute(attribute) {
    return (newValue) => {
      setAttributes({ [attribute]: newValue });
    };
  }
  function onSelectURL(newSrc) {
    if (newSrc !== src) {
      const embedBlock = (0, import_util.createUpgradedEmbedBlock)({
        attributes: { url: newSrc }
      });
      if (void 0 !== embedBlock && onReplace) {
        onReplace(embedBlock);
        return;
      }
      setAttributes({ src: newSrc, id: void 0, blob: void 0 });
      setTemporaryURL();
    }
  }
  const { createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
  function onUploadError(message) {
    createErrorNotice(message, { type: "snackbar" });
  }
  function onSelectAudio(media) {
    if (!media || !media.url) {
      setAttributes({
        src: void 0,
        id: void 0,
        caption: void 0,
        blob: void 0
      });
      setTemporaryURL();
      return;
    }
    if ((0, import_blob.isBlobURL)(media.url)) {
      setTemporaryURL(media.url);
      return;
    }
    setAttributes({
      blob: void 0,
      src: media.url,
      id: media.id,
      caption: media.caption
    });
    setTemporaryURL();
  }
  const classes = (0, import_clsx.default)(className, {
    "is-transient": !!temporaryURL
  });
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: classes
  });
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  if (!src && !temporaryURL) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.MediaPlaceholder,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, { icon: import_icons.audio }),
        onSelect: onSelectAudio,
        onSelectURL,
        accept: "audio/*",
        allowedTypes: ALLOWED_MEDIA_TYPES,
        value: attributes,
        onError: onUploadError
      }
    ) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    isSingleSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.MediaReplaceFlow,
      {
        mediaId: id,
        mediaURL: src,
        allowedTypes: ALLOWED_MEDIA_TYPES,
        accept: "audio/*",
        onSelect: onSelectAudio,
        onSelectURL,
        onError: onUploadError,
        onReset: () => onSelectAudio(void 0),
        variant: "toolbar"
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            autoplay: false,
            loop: false,
            preload: void 0
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, { className: "wp-block-audio__autoplay-help-text", children: (0, import_i18n.__)(
            "Most browsers block audio until a visitor interacts with the page, so autoplay often won’t work, especially on mobile. Unexpected sound can also be disruptive for screen reader users."
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Autoplay"),
              isShownByDefault: true,
              hasValue: () => !!autoplay,
              onDeselect: () => setAttributes({
                autoplay: false
              }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Autoplay"),
                  onChange: toggleAttribute("autoplay"),
                  checked: !!autoplay
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Loop"),
              isShownByDefault: true,
              hasValue: () => !!loop,
              onDeselect: () => setAttributes({
                loop: false
              }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Loop"),
                  onChange: toggleAttribute("loop"),
                  checked: !!loop
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Preload"),
              isShownByDefault: true,
              hasValue: () => !!preload,
              onDeselect: () => setAttributes({
                preload: void 0
              }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.SelectControl,
                {
                  label: (0, import_i18n._x)(
                    "Preload",
                    "noun; Audio block parameter"
                  ),
                  value: preload || "",
                  onChange: (value) => setAttributes({
                    preload: value || void 0
                  }),
                  options: [
                    { value: "", label: (0, import_i18n.__)("Browser default") },
                    { value: "auto", label: (0, import_i18n.__)("Auto") },
                    { value: "metadata", label: (0, import_i18n.__)("Metadata") },
                    {
                      value: "none",
                      label: (0, import_i18n._x)("None", "Preload value")
                    }
                  ]
                }
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...blockProps, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "audio",
        {
          controls: "controls",
          inert: !isSingleSelected ? "true" : void 0,
          src: src ?? temporaryURL
        }
      ),
      !!temporaryURL && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {}),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_caption.Caption,
        {
          attributes,
          setAttributes,
          isSelected: isSingleSelected,
          insertBlocksAfter,
          label: (0, import_i18n.__)("Audio caption text"),
          showToolbarButton: isSingleSelected && hasNonContentControls
        }
      )
    ] })
  ] });
}
var edit_default = AudioEdit;
//# sourceMappingURL=edit.cjs.map
