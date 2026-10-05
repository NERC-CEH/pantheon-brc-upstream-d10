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

// packages/block-library/src/media-text/media-container.jsx
var media_container_exports = {};
__export(media_container_exports, {
  default: () => media_container_default
});
module.exports = __toCommonJS(media_container_exports);
var import_clsx = __toESM(require("clsx"));
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_i18n = require("@wordpress/i18n");
var import_compose = require("@wordpress/compose");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_blob = require("@wordpress/blob");
var import_notices = require("@wordpress/notices");
var import_icons = require("@wordpress/icons");
var import_image_fill = require("./image-fill.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var ALLOWED_MEDIA_TYPES = ["image", "video"];
var noop = () => {
};
var ResizableBoxContainer = (0, import_element.forwardRef)(
  ({ isSelected, isStackedOnMobile, ...props }, ref) => {
    const isMobile = (0, import_compose.useViewportMatch)("small", "<");
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ResizableBox,
      {
        ref,
        showHandle: isSelected && (!isMobile || !isStackedOnMobile),
        ...props
      }
    );
  }
);
function ToolbarEditButton({
  mediaId,
  mediaUrl,
  onSelectMedia,
  toggleUseFeaturedImage,
  useFeaturedImage
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.MediaReplaceFlow,
    {
      mediaId,
      mediaURL: mediaUrl,
      allowedTypes: ALLOWED_MEDIA_TYPES,
      onSelect: onSelectMedia,
      onToggleFeaturedImage: toggleUseFeaturedImage,
      useFeaturedImage,
      name: mediaUrl ? (0, import_i18n.__)("Replace") : (0, import_i18n.__)("Add media"),
      onReset: () => onSelectMedia(void 0)
    }
  ) });
}
function PlaceholderContainer({
  className,
  mediaUrl,
  onSelectMedia,
  toggleUseFeaturedImage
}) {
  const { createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
  const onUploadError = (message) => {
    createErrorNotice(message, { type: "snackbar" });
  };
  const onFilesPreUpload = (files) => {
    if (files.length === 1) {
      onSelectMedia({ url: (0, import_blob.createBlobURL)(files[0]) });
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.MediaPlaceholder,
    {
      icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, { icon: import_icons.media }),
      labels: {
        title: (0, import_i18n.__)("Media area")
      },
      className,
      onSelect: onSelectMedia,
      onToggleFeaturedImage: toggleUseFeaturedImage,
      allowedTypes: ALLOWED_MEDIA_TYPES,
      onFilesPreUpload,
      onError: onUploadError,
      disableMediaButtons: mediaUrl
    }
  );
}
function MediaContainer(props, ref) {
  const {
    className,
    commitWidthChange,
    focalPoint,
    imageFill,
    isSelected,
    isStackedOnMobile,
    mediaAlt,
    mediaId,
    mediaPosition,
    mediaType,
    mediaUrl,
    mediaWidth,
    onSelectMedia,
    onWidthChange,
    enableResize,
    toggleUseFeaturedImage,
    useFeaturedImage,
    featuredImageURL,
    featuredImageAlt,
    refMedia
  } = props;
  const isTemporaryMedia = !mediaId && (0, import_blob.isBlobURL)(mediaUrl);
  const { toggleSelection } = (0, import_data.useDispatch)(import_block_editor.store);
  const toolbarEditButton = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ToolbarEditButton,
    {
      onSelectMedia,
      mediaUrl: useFeaturedImage && featuredImageURL ? featuredImageURL : mediaUrl,
      mediaId,
      toggleUseFeaturedImage,
      useFeaturedImage
    }
  );
  if (mediaUrl || featuredImageURL || useFeaturedImage) {
    const onResizeStart = () => {
      toggleSelection(false);
    };
    const onResize = (event, direction, elt) => {
      onWidthChange(parseInt(elt.style.width));
    };
    const onResizeStop = (event, direction, elt) => {
      toggleSelection(true);
      commitWidthChange(parseInt(elt.style.width));
    };
    const enablePositions = {
      right: enableResize && mediaPosition === "left",
      left: enableResize && mediaPosition === "right"
    };
    const positionStyles = mediaType === "image" && imageFill ? (0, import_image_fill.imageFillStyles)(mediaUrl || featuredImageURL, focalPoint) : {};
    const mediaTypeRenderers = {
      image: () => useFeaturedImage && featuredImageURL ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          ref: refMedia,
          src: featuredImageURL,
          alt: featuredImageAlt,
          style: positionStyles
        }
      ) : mediaUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          ref: refMedia,
          src: mediaUrl,
          alt: mediaAlt,
          style: positionStyles
        }
      ),
      video: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", { controls: true, ref: refMedia, src: mediaUrl })
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      ResizableBoxContainer,
      {
        as: "figure",
        className: (0, import_clsx.default)(
          className,
          "editor-media-container__resizer",
          { "is-transient": isTemporaryMedia }
        ),
        size: { width: mediaWidth + "%" },
        minWidth: "10%",
        maxWidth: "100%",
        enable: enablePositions,
        onResizeStart,
        onResize,
        onResizeStop,
        axis: "x",
        isSelected,
        isStackedOnMobile,
        ref,
        children: [
          toolbarEditButton,
          (mediaTypeRenderers[mediaType] || noop)(),
          isTemporaryMedia && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {}),
          !useFeaturedImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceholderContainer, { ...props }),
          !featuredImageURL && useFeaturedImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.Placeholder,
            {
              className: "wp-block-media-text--placeholder-image",
              style: positionStyles,
              withIllustration: true
            }
          )
        ]
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    toolbarEditButton,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceholderContainer, { ...props })
  ] });
}
var media_container_default = (0, import_element.forwardRef)(MediaContainer);
//# sourceMappingURL=media-container.cjs.map
