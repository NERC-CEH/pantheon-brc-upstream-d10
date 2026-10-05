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

// packages/block-library/src/playlist-track/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_blob = require("@wordpress/blob");
var import_element = require("@wordpress/element");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_ui = require("@wordpress/ui");
var import_data = require("@wordpress/data");
var import_notices = require("@wordpress/notices");
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var import_dom = require("@wordpress/dom");
var import_context = require("../playlist/context.cjs");
var import_utils = require("../playlist/utils.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var ALLOWED_MEDIA_TYPES = ["audio"];
var TRACK_IMAGE_ALLOWED_MEDIA_TYPES = ["image"];
var PlaylistTrackEdit = ({
  attributes,
  setAttributes,
  context,
  clientId,
  isSelected
}) => {
  const { id, src, album, artist, image, imageAlt, length, title } = attributes;
  const [temporaryURL, setTemporaryURL] = (0, import_element.useState)(attributes.blob);
  const showArtists = context?.showArtists;
  const showImages = context?.showImages ?? true;
  const imageButton = (0, import_element.useRef)();
  const blockProps = (0, import_block_editor.useBlockProps)();
  const { currentTrackClientId, setCurrentTrackClientId, removeTrack } = (0, import_element.useContext)(import_context.PlaylistContext);
  const { createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
  function onUploadError(message, { removeTrackOnError = false } = {}) {
    createErrorNotice(message, { type: "snackbar" });
    if (removeTrackOnError) {
      removeTrack(clientId);
      return;
    }
    setTemporaryURL();
  }
  const hasTrackSource = !!src || !!temporaryURL;
  (0, import_element.useEffect)(() => {
    if (isSelected && hasTrackSource && currentTrackClientId !== clientId) {
      setCurrentTrackClientId(clientId);
    }
  }, [
    isSelected,
    hasTrackSource,
    clientId,
    currentTrackClientId,
    setCurrentTrackClientId
  ]);
  (0, import_hooks.useUploadMediaFromBlobURL)({
    url: temporaryURL,
    allowedTypes: ALLOWED_MEDIA_TYPES,
    onChange: onSelectTrack,
    onError: (message) => {
      onUploadError(message, { removeTrackOnError: true });
    }
  });
  function onSelectTrack(media) {
    const mediaUrl = media?.url ?? media?.source_url;
    if (!media || !mediaUrl) {
      setAttributes({
        blob: void 0,
        id: void 0,
        artist: void 0,
        album: void 0,
        image: void 0,
        imageAlt: void 0,
        length: void 0,
        title: void 0,
        url: void 0
      });
      setTemporaryURL();
      return;
    }
    if ((0, import_blob.isBlobURL)(mediaUrl)) {
      setTemporaryURL(mediaUrl);
      return;
    }
    setAttributes({
      blob: void 0,
      ...(0, import_utils.getTrackAttributes)(media)
    });
    setTemporaryURL();
  }
  function onSelectTrackImage(trackImage) {
    setAttributes((0, import_utils.getTrackImageAttributes)(trackImage));
  }
  function onRemoveTrackImage() {
    setAttributes({ image: void 0, imageAlt: void 0 });
    imageButton.current.focus();
  }
  if (!hasTrackSource) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.MediaPlaceholder,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, { icon: import_icons.audio }),
        labels: {
          title: (0, import_i18n.__)("Track"),
          instructions: (0, import_i18n.__)(
            "Upload an audio file or pick one from your media library."
          )
        },
        onSelect: onSelectTrack,
        accept: "audio/*",
        allowedTypes: ALLOWED_MEDIA_TYPES,
        value: attributes,
        onError: onUploadError
      }
    ) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.MediaReplaceFlow,
      {
        name: (0, import_i18n.__)("Replace"),
        onSelect: onSelectTrack,
        accept: "audio/*",
        mediaId: id,
        mediaURL: src,
        allowedTypes: ALLOWED_MEDIA_TYPES,
        onError: onUploadError,
        variant: "toolbar"
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.PanelBody, { title: (0, import_i18n.__)("Settings"), children: [
      isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.TextControl,
        {
          label: (0, import_i18n.__)("Title"),
          value: title ? (0, import_dom.__unstableStripHTML)(title) : "",
          onChange: (titleValue) => {
            setAttributes({ title: titleValue });
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.TextControl,
        {
          label: (0, import_i18n.__)("Artist"),
          value: artist ? (0, import_dom.__unstableStripHTML)(artist) : "",
          onChange: (artistValue) => {
            setAttributes({ artist: artistValue });
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.TextControl,
        {
          label: (0, import_i18n.__)("Album"),
          value: album ? (0, import_dom.__unstableStripHTML)(album) : "",
          onChange: (albumValue) => {
            setAttributes({ album: albumValue });
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.MediaUploadCheck, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.BaseControl, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.BaseControl.VisualLabel, { children: (0, import_i18n.__)("Track image") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "editor-video-poster-control", children: [
          !!image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "img",
            {
              src: image,
              alt: (0, import_i18n.__)(
                "Preview of the track image"
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.MediaUpload,
            {
              title: (0, import_i18n.__)("Select image"),
              onSelect: onSelectTrackImage,
              allowedTypes: TRACK_IMAGE_ALLOWED_MEDIA_TYPES,
              render: ({ open }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.Button,
                {
                  __next40pxDefaultSize: true,
                  variant: "primary",
                  onClick: open,
                  ref: imageButton,
                  children: !image ? (0, import_i18n.__)("Select") : (0, import_i18n.__)("Replace")
                }
              )
            }
          ),
          !!image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.Button,
            {
              __next40pxDefaultSize: true,
              onClick: onRemoveTrackImage,
              variant: "tertiary",
              children: (0, import_i18n.__)("Remove")
            }
          )
        ] })
      ] }) }),
      !!image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.TextareaControl,
        {
          label: (0, import_i18n.__)("Alternative text"),
          value: imageAlt || "",
          onChange: (value) => setAttributes({ imageAlt: value }),
          help: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_ui.Link,
            {
              openInNewTab: true,
              href: (
                // translators: Localized tutorial, if one exists. W3C Web Accessibility Initiative link has list of existing translations.
                (0, import_i18n.__)(
                  "https://www.w3.org/WAI/tutorials/images/decision-tree/"
                )
              ),
              children: (0, import_i18n.__)(
                "Describe the purpose of the image."
              )
            }
          )
        }
      )
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        className: "wp-block-playlist-track__button",
        onClick: () => setCurrentTrackClientId(clientId),
        "aria-current": currentTrackClientId === clientId ? "true" : "false",
        children: [
          showImages && !!image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "img",
            {
              className: "wp-block-playlist-track__image",
              src: image,
              alt: imageAlt || ""
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "wp-block-playlist-track__content", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_block_editor.PlainText,
              {
                tagName: "span",
                className: "wp-block-playlist-track__title",
                value: title,
                "aria-label": (0, import_i18n.__)("Track title"),
                placeholder: (0, import_i18n.__)("Track title"),
                onChange: (value) => {
                  setAttributes({ title: value });
                },
                __experimentalVersion: 2
              }
            ),
            showArtists && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_block_editor.PlainText,
              {
                tagName: "span",
                className: "wp-block-playlist-track__artist",
                value: artist,
                "aria-label": (0, import_i18n.__)("Track artist"),
                placeholder: (0, import_i18n.__)("Track artist"),
                onChange: (value) => setAttributes({ artist: value }),
                __experimentalVersion: 2
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "wp-block-playlist-track__length", children: [
            length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
              className: "screen-reader-text",
              /* translators: Visually hidden label for the track duration (screen reader text). */
              children: (0, import_i18n.__)("Duration:")
            }),
            length,
            !!temporaryURL && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, { className: "wp-block-playlist-track__spinner" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "screen-reader-text", children: (0, import_i18n.__)("Play") })
        ]
      }
    ) })
  ] });
};
var edit_default = PlaylistTrackEdit;
//# sourceMappingURL=edit.cjs.map
