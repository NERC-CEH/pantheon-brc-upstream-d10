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

// packages/block-library/src/image/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  ImageEdit: () => ImageEdit,
  default: () => edit_default,
  isExternalImage: () => isExternalImage,
  pickRelevantMediaFiles: () => pickRelevantMediaFiles
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_blob = require("@wordpress/blob");
var import_blocks = require("@wordpress/blocks");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_block_editor = require("@wordpress/block-editor");
var import_element = require("@wordpress/element");
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var import_notices = require("@wordpress/notices");
var import_compose = require("@wordpress/compose");
var import_url = require("@wordpress/url");
var import_upload_media = require("@wordpress/upload-media");
var import_hooks = require("../utils/hooks.cjs");
var import_image = __toESM(require("./image.cjs"));
var import_utils = require("./utils.cjs");
var import_use_max_width_observer = require("./use-max-width-observer.cjs");
var import_constants = require("./constants.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var pickRelevantMediaFiles = (image, size) => {
  const imageProps = Object.fromEntries(
    Object.entries(image ?? {}).filter(
      ([key]) => ["alt", "id", "link", "caption"].includes(key)
    )
  );
  imageProps.url = image?.sizes?.[size]?.url || image?.media_details?.sizes?.[size]?.source_url || image.url;
  return imageProps;
};
var isExternalImage = (id, url) => url && !id && !(0, import_blob.isBlobURL)(url);
function hasSize(image, size) {
  return "url" in (image?.sizes?.[size] ?? {}) || "source_url" in (image?.media_details?.sizes?.[size] ?? {});
}
function ImageEdit({
  attributes,
  setAttributes,
  isSelected: isSingleSelected,
  className,
  insertBlocksAfter,
  onReplace,
  context,
  clientId,
  __unstableParentLayout: parentLayout
}) {
  const {
    url = "",
    caption,
    id,
    width,
    height,
    sizeSlug,
    aspectRatio,
    scale,
    align,
    metadata
  } = attributes;
  const [temporaryURL, setTemporaryURL] = (0, import_element.useState)(attributes.blob);
  const containerRef = (0, import_element.useRef)();
  const layoutType = parentLayout?.type || parentLayout?.default?.type;
  const isMaxWidthContainerWidth = !layoutType || layoutType !== "flex" && layoutType !== "grid";
  const [maxWidthObserver, maxContentWidth] = (0, import_use_max_width_observer.useMaxWidthObserver)();
  const [placeholderResizeListener, { width: placeholderWidth }] = (0, import_compose.useResizeObserver)();
  const isSmallContainer = placeholderWidth && placeholderWidth < 160;
  const captionRef = (0, import_element.useRef)();
  (0, import_element.useEffect)(() => {
    captionRef.current = caption;
  }, [caption]);
  const { __unstableMarkNextChangeAsNotPersistent, replaceBlock } = (0, import_data.useDispatch)(import_block_editor.store);
  (0, import_element.useEffect)(() => {
    if (["wide", "full"].includes(align)) {
      __unstableMarkNextChangeAsNotPersistent();
      setAttributes({
        width: void 0,
        height: void 0
      });
    }
  }, [__unstableMarkNextChangeAsNotPersistent, align, setAttributes]);
  const {
    getSettings,
    getBlockRootClientId,
    getBlockName,
    canInsertBlockType
  } = (0, import_data.useSelect)(import_block_editor.store);
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  const { createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
  function onUploadError(message) {
    createErrorNotice(message, {
      type: "snackbar",
      explicitDismiss: true
    });
    setTemporaryURL();
    setAttributes({
      src: void 0,
      id: void 0,
      url: void 0,
      blob: void 0
    });
  }
  function onFilesPreUpload(files) {
    if (files.length === 1) {
      setTemporaryURL((0, import_blob.createBlobURL)(files[0]));
    }
  }
  function onSelectImagesList(images) {
    const win = containerRef.current?.ownerDocument.defaultView;
    if (images.every((file) => file instanceof win.File)) {
      const files = images;
      const rootClientId = getBlockRootClientId(clientId);
      if (files.some((file) => !(0, import_utils.isValidFileType)(file))) {
        createErrorNotice(
          (0, import_i18n.__)(
            "If uploading to a gallery all files need to be image formats"
          ),
          { id: "gallery-upload-invalid-file", type: "snackbar" }
        );
      }
      const imageBlocks = files.filter((file) => (0, import_utils.isValidFileType)(file)).map(
        (file) => (0, import_blocks.createBlock)("core/image", {
          blob: (0, import_blob.createBlobURL)(file)
        })
      );
      if (getBlockName(rootClientId) === "core/gallery") {
        replaceBlock(clientId, imageBlocks);
      } else if (canInsertBlockType("core/gallery", rootClientId)) {
        const galleryBlock = (0, import_blocks.createBlock)(
          "core/gallery",
          {},
          imageBlocks
        );
        replaceBlock(clientId, galleryBlock);
      }
    }
  }
  function onSelectImage(media) {
    if (Array.isArray(media)) {
      onSelectImagesList(media);
      return;
    }
    if (!media || !media.url) {
      setAttributes({
        url: void 0,
        alt: void 0,
        id: void 0,
        title: void 0,
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
    const { imageDefaultSize } = getSettings();
    let newSize = import_constants.DEFAULT_MEDIA_SIZE_SLUG;
    if (sizeSlug && hasSize(media, sizeSlug)) {
      newSize = sizeSlug;
    } else if (hasSize(media, imageDefaultSize)) {
      newSize = imageDefaultSize;
    }
    let mediaAttributes = pickRelevantMediaFiles(media, newSize);
    if (typeof mediaAttributes.caption === "string" && mediaAttributes.caption.includes("\n")) {
      mediaAttributes.caption = mediaAttributes.caption.replace(
        /\n/g,
        "<br>"
      );
    }
    if (captionRef.current && !mediaAttributes.caption) {
      const { caption: omittedCaption, ...restMediaAttributes } = mediaAttributes;
      mediaAttributes = restMediaAttributes;
    }
    let additionalAttributes;
    if (!media.id || media.id !== id) {
      additionalAttributes = {
        sizeSlug: newSize
      };
    }
    let linkDestination = attributes.linkDestination;
    if (!linkDestination) {
      switch (window?.wp?.media?.view?.settings?.defaultProps?.link || import_constants.LINK_DESTINATION_NONE) {
        case "file":
        case import_constants.LINK_DESTINATION_MEDIA:
          linkDestination = import_constants.LINK_DESTINATION_MEDIA;
          break;
        case "post":
        case import_constants.LINK_DESTINATION_ATTACHMENT:
          linkDestination = import_constants.LINK_DESTINATION_ATTACHMENT;
          break;
        case import_constants.LINK_DESTINATION_CUSTOM:
          linkDestination = import_constants.LINK_DESTINATION_CUSTOM;
          break;
        case import_constants.LINK_DESTINATION_NONE:
          linkDestination = import_constants.LINK_DESTINATION_NONE;
          break;
      }
    }
    let href;
    switch (linkDestination) {
      case import_constants.LINK_DESTINATION_MEDIA:
        href = media.url;
        break;
      case import_constants.LINK_DESTINATION_ATTACHMENT:
        href = media.link;
        break;
    }
    mediaAttributes.href = href;
    setAttributes({
      blob: void 0,
      ...mediaAttributes,
      ...additionalAttributes,
      linkDestination
    });
    setTemporaryURL();
  }
  function onSelectURL(newURL) {
    const normalizedNewURL = (0, import_url.getProtocol)(newURL) ? newURL : (0, import_url.prependHTTPS)(newURL);
    if (normalizedNewURL !== url) {
      setAttributes({
        blob: void 0,
        url: normalizedNewURL,
        id: void 0,
        sizeSlug: getSettings().imageDefaultSize
      });
      setTemporaryURL();
    }
  }
  (0, import_hooks.useUploadMediaFromBlobURL)({
    url: temporaryURL,
    allowedTypes: import_constants.ALLOWED_MEDIA_TYPES,
    onChange: onSelectImage,
    onError: onUploadError
  });
  const isExternal = isExternalImage(id, url);
  const src = isExternal ? url : void 0;
  const isSideloading = (0, import_data.useSelect)(
    (select) => {
      if (!window.__clientSideMediaProcessing || !id) {
        return false;
      }
      return select(import_upload_media.store).isUploadingById(id);
    },
    [id]
  );
  const mediaPreview = !!url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "img",
    {
      alt: (0, import_i18n.__)("Edit image"),
      title: (0, import_i18n.__)("Edit image"),
      className: "edit-image-preview",
      src: url
    }
  );
  const borderProps = (0, import_block_editor.__experimentalUseBorderProps)(attributes);
  const shadowProps = (0, import_block_editor.__experimentalGetShadowClassesAndStyles)(attributes);
  const classes = (0, import_clsx.default)(className, {
    "is-transient": !!temporaryURL || isSideloading,
    "is-resized": !!width || !!height,
    [`size-${sizeSlug}`]: sizeSlug,
    "has-custom-border": !!borderProps.className || borderProps.style && Object.keys(borderProps.style).length > 0
  });
  const blockProps = (0, import_block_editor.useBlockProps)({
    ref: containerRef,
    className: classes
  });
  const { lockUrlControls = false, lockUrlControlsMessage } = (0, import_data.useSelect)(
    (select) => {
      if (!isSingleSelected) {
        return {};
      }
      const blockBindingsSource = (0, import_blocks.getBlockBindingsSource)(
        metadata?.bindings?.url?.source
      );
      return {
        lockUrlControls: !!metadata?.bindings?.url && !blockBindingsSource?.canUserEditValue?.({
          select,
          context,
          args: metadata?.bindings?.url?.args
        }),
        lockUrlControlsMessage: blockBindingsSource?.label ? (0, import_i18n.sprintf)(
          /* translators: %s: Label of the bindings source. */
          (0, import_i18n.__)("Connected to %s"),
          blockBindingsSource.label
        ) : (0, import_i18n.__)("Connected to dynamic data")
      };
    },
    [context, isSingleSelected, metadata?.bindings?.url]
  );
  const pinnedHeight = height === "auto" ? void 0 : height;
  const placeholder = (content) => {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.Placeholder,
      {
        className: (0, import_clsx.default)("block-editor-media-placeholder", {
          [borderProps.className]: !!borderProps.className && !isSingleSelected
        }),
        icon: !isSmallContainer && (lockUrlControls ? import_icons.plugins : import_icons.image),
        withIllustration: !isSingleSelected || isSmallContainer,
        label: !isSmallContainer && (0, import_i18n.__)("Image"),
        instructions: !lockUrlControls && !isSmallContainer && (0, import_i18n.__)(
          "Drag and drop an image, upload, or choose from your library."
        ),
        style: {
          aspectRatio: !(width && pinnedHeight) && aspectRatio ? aspectRatio : void 0,
          width: pinnedHeight && aspectRatio ? "100%" : width,
          height: width && aspectRatio ? "100%" : pinnedHeight,
          objectFit: scale,
          ...borderProps.style,
          ...shadowProps.style
        },
        children: [
          lockUrlControls && !isSmallContainer && lockUrlControlsMessage,
          !lockUrlControls && !isSmallContainer && content,
          placeholderResizeListener
        ]
      }
    );
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...blockProps, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_image.default,
        {
          temporaryURL,
          isSideloading,
          attributes,
          setAttributes,
          isSingleSelected,
          insertBlocksAfter,
          onReplace,
          onSelectImage,
          onSelectURL,
          onUploadError,
          context,
          clientId,
          blockEditingMode,
          parentLayoutType: layoutType,
          maxContentWidth
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.MediaPlaceholder,
        {
          icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, { icon: import_icons.image }),
          onSelect: onSelectImage,
          onSelectURL,
          onFilesPreUpload,
          onError: onUploadError,
          placeholder,
          allowedTypes: import_constants.ALLOWED_MEDIA_TYPES,
          handleUpload: (files) => files.length === 1,
          value: { id, src },
          mediaPreview,
          disableMediaButtons: temporaryURL || url
        }
      )
    ] }),
    // The listener cannot be placed as the first element as it will break the in-between inserter.
    // See https://github.com/WordPress/gutenberg/blob/71134165868298fc15e22896d0c28b41b3755ff7/packages/block-editor/src/components/block-list/use-in-between-inserter.js#L120
    isSingleSelected && isMaxWidthContainerWidth && maxWidthObserver
  ] });
}
var edit_default = ImageEdit;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ImageEdit,
  isExternalImage,
  pickRelevantMediaFiles
});
//# sourceMappingURL=edit.cjs.map
