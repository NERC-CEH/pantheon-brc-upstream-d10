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

// packages/block-library/src/video/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_blob = require("@wordpress/blob");
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_element = require("@wordpress/element");
var import_i18n = require("@wordpress/i18n");
var import_data = require("@wordpress/data");
var import_icons = require("@wordpress/icons");
var import_notices = require("@wordpress/notices");
var import_url = require("@wordpress/url");
var import_util = require("../embed/util.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_edit_common_settings = __toESM(require("./edit-common-settings.cjs"));
var import_tracks_editor = __toESM(require("./tracks-editor.cjs"));
var import_tracks = __toESM(require("./tracks.cjs"));
var import_caption = require("../utils/caption.cjs");
var import_poster_image = __toESM(require("../utils/poster-image.cjs"));
var import_variations = require("./variations.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var ALLOWED_MEDIA_TYPES = ["video"];
function VideoEdit({
  isSelected: isSingleSelected,
  attributes,
  className,
  setAttributes,
  insertBlocksAfter,
  onReplace
}) {
  const videoPlayer = (0, import_element.useRef)();
  const { id, controls, poster, src, tracks, width, height } = attributes;
  const isGif = (0, import_variations.isGifVariation)(attributes);
  const aspectRatio = width && height ? `${width} / ${height}` : void 0;
  const [temporaryURL, setTemporaryURL] = (0, import_element.useState)(attributes.blob);
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  const hasNonContentControls = blockEditingMode === "default";
  (0, import_hooks.useUploadMediaFromBlobURL)({
    url: temporaryURL,
    allowedTypes: ALLOWED_MEDIA_TYPES,
    onChange: onSelectVideo,
    onError: onUploadError
  });
  (0, import_element.useEffect)(() => {
    if (videoPlayer.current) {
      videoPlayer.current.load();
    }
  }, [poster]);
  (0, import_element.useEffect)(() => {
    if (isGif) {
      videoPlayer.current?.play().catch(() => {
      });
    }
  }, [isGif, src, poster]);
  function onSelectVideo(media) {
    if (!media || !media.url) {
      setAttributes({
        src: void 0,
        id: void 0,
        poster: void 0,
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
      poster: media.image?.src !== media.icon ? media.image?.src : void 0,
      caption: media.caption
    });
    setTemporaryURL();
  }
  function onSelectURL(newSrc) {
    if (newSrc !== src) {
      const url = (0, import_url.prependHTTPS)(newSrc);
      const embedBlock = (0, import_util.createUpgradedEmbedBlock)({
        attributes: { url }
      });
      if (void 0 !== embedBlock && onReplace) {
        onReplace(embedBlock);
        return;
      }
      setAttributes({
        blob: void 0,
        src: url,
        id: void 0,
        poster: void 0
      });
      setTemporaryURL();
    }
  }
  const { createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
  function onUploadError(message) {
    createErrorNotice(message, { type: "snackbar" });
  }
  const placeholder = (content) => {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Placeholder,
      {
        className: "block-editor-media-placeholder",
        withIllustration: !isSingleSelected,
        icon: import_icons.video,
        label: (0, import_i18n.__)("Video"),
        instructions: (0, import_i18n.__)(
          "Drag and drop a video, upload, or choose from your library."
        ),
        children: content
      }
    );
  };
  const classes = (0, import_clsx.default)(className, {
    "is-transient": !!temporaryURL
  });
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: classes
  });
  if (!src && !temporaryURL) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.MediaPlaceholder,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, { icon: import_icons.video }),
        onSelect: onSelectVideo,
        onSelectURL,
        accept: "video/*",
        allowedTypes: ALLOWED_MEDIA_TYPES,
        value: attributes,
        onError: onUploadError,
        placeholder
      }
    ) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    isSingleSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_tracks_editor.default,
        {
          tracks,
          onChange: (newTracks) => {
            setAttributes({ tracks: newTracks });
          }
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.MediaReplaceFlow,
        {
          mediaId: id,
          mediaURL: src,
          allowedTypes: ALLOWED_MEDIA_TYPES,
          accept: "video/*",
          onSelect: onSelectVideo,
          onSelectURL,
          onError: onUploadError,
          onReset: () => onSelectVideo(void 0),
          variant: "toolbar"
        }
      ) })
    ] }),
    !isGif && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            autoplay: false,
            controls: true,
            loop: false,
            muted: false,
            playsInline: false,
            preload: "metadata",
            poster: void 0
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_edit_common_settings.default,
            {
              setAttributes,
              attributes
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_poster_image.default,
            {
              poster,
              onChange: (posterImage) => setAttributes({
                poster: posterImage?.url
              })
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...blockProps, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "video",
        {
          controls,
          inert: !isSingleSelected ? "true" : void 0,
          poster,
          src: src || temporaryURL,
          ref: videoPlayer,
          autoPlay: isGif,
          loop: isGif,
          muted: isGif,
          playsInline: isGif,
          width,
          height,
          style: aspectRatio ? { aspectRatio } : void 0,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_tracks.default, { tracks })
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
          label: (0, import_i18n.__)("Video caption text"),
          showToolbarButton: isSingleSelected && hasNonContentControls
        }
      )
    ] })
  ] });
}
var edit_default = VideoEdit;
//# sourceMappingURL=edit.cjs.map
