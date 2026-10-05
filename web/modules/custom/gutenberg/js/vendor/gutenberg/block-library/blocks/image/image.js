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

// packages/block-library/src/image/image.jsx
var image_exports = {};
__export(image_exports, {
  default: () => Image
});
module.exports = __toCommonJS(image_exports);
var import_clsx = __toESM(require("clsx"));
var import_components = require("@wordpress/components");
var import_compose = require("@wordpress/compose");
var import_data = require("@wordpress/data");
var import_block_editor = require("@wordpress/block-editor");
var import_element = require("@wordpress/element");
var import_i18n = require("@wordpress/i18n");
var import_url = require("@wordpress/url");
var import_blocks = require("@wordpress/blocks");
var import_icons = require("@wordpress/icons");
var import_notices = require("@wordpress/notices");
var import_core_data = require("@wordpress/core-data");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_util = require("../embed/util.cjs");
var import_edit = require("./edit.cjs");
var import_caption = require("../utils/caption.cjs");
var import_media_control = require("../utils/media-control.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_style_state = require("../utils/style-state.cjs");
var import_use_open_image_media_editor_modal = require("./use-open-image-media-editor-modal.cjs");
var import_constants = require("./constants.cjs");
var import_utils = require("./utils.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var {
  DimensionsTool,
  isDefaultBlockStyleState,
  ResolutionTool,
  mediaEditKey,
  mediaSideloadFromUrlKey
} = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
var scaleOptions = [
  {
    value: "cover",
    label: (0, import_i18n._x)("Cover", "Scale option for dimensions control"),
    help: (0, import_i18n.__)("Image covers the space evenly.")
  },
  {
    value: "contain",
    label: (0, import_i18n._x)("Contain", "Scale option for dimensions control"),
    help: (0, import_i18n.__)("Image is contained without distortion.")
  }
];
var WRITEMODE_POPOVER_PROPS = {
  placement: "bottom-start"
};
var ImageWrapper = ({ href, children }) => {
  if (!href) {
    return children;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "a",
    {
      href,
      onClick: (event) => event.preventDefault(),
      "aria-disabled": true,
      style: {
        // When the Image block is linked,
        // it's wrapped with a disabled <a /> tag.
        // Restore cursor style so it doesn't appear 'clickable'
        // and remove pointer events. Safari needs the display property.
        pointerEvents: "none",
        cursor: "default",
        display: "inline"
      },
      children
    }
  );
};
function ContentOnlyControls({
  attributes,
  setAttributes,
  lockAltControls,
  lockAltControlsMessage,
  lockTitleControls,
  lockTitleControlsMessage
}) {
  const [popoverAnchor, setPopoverAnchor] = (0, import_element.useState)(null);
  const [isAltDialogOpen, setIsAltDialogOpen] = (0, import_element.useState)(false);
  const [isTitleDialogOpen, setIsTitleDialogOpen] = (0, import_element.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarItem, { ref: setPopoverAnchor, children: (toggleProps) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.DropdownMenu,
      {
        icon: import_icons.chevronDown,
        label: (0, import_i18n.__)("More"),
        toggleProps: {
          ...toggleProps,
          description: (0, import_i18n.__)("Displays more controls.")
        },
        popoverProps: WRITEMODE_POPOVER_PROPS,
        children: ({ onClose }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.MenuItem,
            {
              onClick: () => {
                setIsAltDialogOpen(true);
                onClose();
              },
              "aria-haspopup": "dialog",
              children: (0, import_i18n._x)(
                "Alternative text",
                "Alternative text for an image. Block toolbar label, a low character count is preferred."
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.MenuItem,
            {
              onClick: () => {
                setIsTitleDialogOpen(true);
                onClose();
              },
              "aria-haspopup": "dialog",
              children: (0, import_i18n.__)("Title text")
            }
          )
        ] })
      }
    ) }),
    isAltDialogOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Popover,
      {
        placement: "bottom-start",
        anchor: popoverAnchor,
        onClose: () => setIsAltDialogOpen(false),
        offset: 13,
        variant: "toolbar",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-image__toolbar_content_textarea__container", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.TextareaControl,
          {
            className: "wp-block-image__toolbar_content_textarea",
            label: (0, import_i18n.__)("Alternative text"),
            value: attributes.alt || "",
            onChange: (value) => setAttributes({ alt: value }),
            disabled: lockAltControls,
            help: lockAltControls ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: lockAltControlsMessage }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ExternalLink,
                {
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
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
              (0, import_i18n.__)("Leave empty if decorative.")
            ] })
          }
        ) })
      }
    ),
    isTitleDialogOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Popover,
      {
        placement: "bottom-start",
        anchor: popoverAnchor,
        onClose: () => setIsTitleDialogOpen(false),
        offset: 13,
        variant: "toolbar",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-image__toolbar_content_textarea__container", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.TextControl,
          {
            className: "wp-block-image__toolbar_content_textarea",
            label: (0, import_i18n.__)("Title attribute"),
            value: attributes.title || "",
            onChange: (value) => setAttributes({
              title: value
            }),
            disabled: lockTitleControls,
            help: lockTitleControls ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: lockTitleControlsMessage }) : (0, import_element.createInterpolateElement)(
              (0, import_i18n.__)(
                "Describe the role of this image on the page. <a>(Note: many devices and browsers do not display this text.)</a>"
              ),
              {
                a: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ExternalLink, { href: "https://www.w3.org/TR/html52/dom.html#the-title-attribute" })
              }
            )
          }
        ) })
      }
    )
  ] });
}
function Image({
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
  parentLayoutType,
  maxContentWidth
}) {
  const {
    url = "",
    alt,
    align,
    id,
    href,
    rel,
    linkClass,
    linkDestination,
    title,
    width,
    height,
    aspectRatio,
    scale,
    focalPoint,
    linkTarget,
    sizeSlug,
    lightbox,
    metadata,
    isDecorative
  } = attributes;
  const [imageElement, setImageElement] = (0, import_element.useState)();
  const [resizeDelta, setResizeDelta] = (0, import_element.useState)(null);
  const [pixelSize, setPixelSize] = (0, import_element.useState)({});
  const [offsetTop, setOffsetTop] = (0, import_element.useState)(0);
  const setResizeObserved = (0, import_compose.useResizeObserver)(([entry]) => {
    if (!resizeDelta) {
      const [box] = entry.borderBoxSize;
      setPixelSize({ width: box.inlineSize, height: box.blockSize });
    }
    setOffsetTop(entry.target.offsetTop);
  });
  const effectResizeableBoxPlacement = (0, import_element.useCallback)(() => {
    setOffsetTop(imageElement?.offsetTop ?? 0);
  }, [imageElement]);
  const setRefs = (0, import_compose.useMergeRefs)([setImageElement, setResizeObserved]);
  const { allowResize = true, imageCrop = false } = context;
  const isCroppedGalleryImage = imageCrop && parentLayoutType === "flex";
  const { image, attachmentResolutionError } = (0, import_data.useSelect)(
    (select) => {
      const imageRecord = id && isSingleSelected ? select(import_core_data.store).getEntityRecord(
        "postType",
        "attachment",
        id,
        { context: "view" }
      ) : null;
      const resolutionError = id && isSingleSelected ? select(import_core_data.store).getResolutionError(
        "getEntityRecord",
        [
          "postType",
          "attachment",
          id,
          { context: "view" }
        ]
      ) : null;
      return {
        image: imageRecord,
        attachmentResolutionError: resolutionError
      };
    },
    [id, isSingleSelected]
  );
  const {
    canInsertCover,
    imageEditing,
    imageSizes,
    maxWidth,
    editMediaEntity
  } = (0, import_data.useSelect)(
    (select) => {
      const { getBlockRootClientId, canInsertBlockType, getSettings: getSettings2 } = select(import_block_editor.store);
      const rootClientId = getBlockRootClientId(clientId);
      const settings = getSettings2();
      return {
        imageEditing: settings.imageEditing,
        imageSizes: settings.imageSizes,
        maxWidth: settings.maxWidth,
        editMediaEntity: settings?.[mediaEditKey],
        canInsertCover: canInsertBlockType(
          "core/cover",
          rootClientId
        )
      };
    },
    [clientId]
  );
  const { getBlock, getSettings } = (0, import_data.useSelect)(import_block_editor.store);
  const cropButtonRef = (0, import_element.useRef)();
  const [pendingSwapUrl, setPendingSwapUrl] = (0, import_element.useState)();
  const isSwappingMedia = !!pendingSwapUrl;
  const handleMediaEditorModalClose = (0, import_element.useCallback)(
    () => cropButtonRef.current?.focus(),
    []
  );
  const openImageMediaEditorModal = (0, import_use_open_image_media_editor_modal.useOpenImageMediaEditorModal)({
    attributes,
    setAttributes,
    onClose: handleMediaEditorModalClose,
    onUrlChange: setPendingSwapUrl
  });
  const {
    replaceBlocks,
    toggleSelection,
    __unstableMarkNextChangeAsNotPersistent
  } = (0, import_data.useDispatch)(import_block_editor.store);
  const { createErrorNotice, createSuccessNotice } = (0, import_data.useDispatch)(import_notices.store);
  const { editEntityRecord } = (0, import_data.useDispatch)(import_core_data.store);
  const isLargeViewport = (0, import_compose.useViewportMatch)("medium");
  const isWideAligned = ["wide", "full"].includes(align);
  const [
    { loadedNaturalWidth, loadedNaturalHeight },
    setLoadedNaturalSize
  ] = (0, import_element.useState)({});
  const [hasImageErrored, setHasImageErrored] = (0, import_element.useState)(false);
  const hasNonContentControls = blockEditingMode === "default";
  const isContentOnlyMode = blockEditingMode === "contentOnly";
  const showDimensionsControls = allowResize && hasNonContentControls;
  const isResizable = allowResize && hasNonContentControls && !isWideAligned && isLargeViewport;
  const isUploading = !!temporaryURL || isSideloading;
  const imageSizeOptions = imageSizes.filter(
    ({ slug }) => image?.media_details?.sizes?.[slug]?.source_url
  ).map(({ name, slug }) => ({ value: slug, label: name }));
  (0, import_element.useEffect)(() => {
    if (!id || !isSingleSelected) {
      return;
    }
    if (attachmentResolutionError?.status === 404) {
      __unstableMarkNextChangeAsNotPersistent();
      setAttributes({ id: void 0 });
    }
  }, [
    id,
    isSingleSelected,
    attachmentResolutionError,
    setAttributes,
    __unstableMarkNextChangeAsNotPersistent
  ]);
  const canUploadExternalImage = isSingleSelected && (0, import_edit.isExternalImage)(id, url) && !!getSettings()[mediaSideloadFromUrlKey];
  const { naturalWidth, naturalHeight } = (0, import_element.useMemo)(() => {
    return {
      naturalWidth: imageElement?.naturalWidth || loadedNaturalWidth || void 0,
      naturalHeight: imageElement?.naturalHeight || loadedNaturalHeight || void 0
    };
  }, [loadedNaturalWidth, loadedNaturalHeight, imageElement?.complete]);
  (0, import_element.useEffect)(() => {
    if (pendingSwapUrl && pendingSwapUrl === url && imageElement?.complete) {
      setPendingSwapUrl(void 0);
    }
  }, [pendingSwapUrl, url, imageElement]);
  function onImageError() {
    setPendingSwapUrl(void 0);
    setHasImageErrored(true);
    const embedBlock = (0, import_util.createUpgradedEmbedBlock)({ attributes: { url } });
    if (void 0 !== embedBlock && onReplace) {
      onReplace(embedBlock);
    }
  }
  function onImageLoad(event) {
    setPendingSwapUrl(void 0);
    setHasImageErrored(false);
    setLoadedNaturalSize({
      loadedNaturalWidth: event.target?.naturalWidth,
      loadedNaturalHeight: event.target?.naturalHeight
    });
  }
  function onSetHref(props) {
    setAttributes(props);
  }
  function onSetLightbox(enable) {
    if (enable && !lightboxSetting?.enabled) {
      setAttributes({
        lightbox: { enabled: true },
        isDecorative: false
      });
    } else if (!enable && lightboxSetting?.enabled) {
      setAttributes({
        lightbox: { enabled: false }
      });
    } else {
      setAttributes({
        lightbox: void 0
      });
    }
  }
  function resetLightbox() {
    if (lightboxSetting?.enabled && lightboxSetting?.allowEditing) {
      setAttributes({
        lightbox: { enabled: false }
      });
    } else {
      setAttributes({
        lightbox: void 0
      });
    }
  }
  function onSetTitle(value) {
    setAttributes({ title: value });
  }
  function updateAlt(newAlt) {
    setAttributes({ alt: newAlt });
  }
  function updateIsDecorative(value) {
    setAttributes({
      isDecorative: value || void 0,
      ...value && {
        alt: "",
        caption: void 0,
        href: void 0,
        linkDestination: void 0,
        linkTarget: void 0,
        rel: void 0
      }
    });
  }
  const imperativeFocalPointPreview = (value) => {
    if (imageElement) {
      imageElement.style.setProperty(
        "object-position",
        (0, import_utils.mediaPosition)(value)
      );
    }
  };
  function updateImage(newSizeSlug) {
    const newUrl = image?.media_details?.sizes?.[newSizeSlug]?.source_url;
    if (!newUrl) {
      return null;
    }
    setAttributes({
      url: newUrl,
      sizeSlug: newSizeSlug
    });
  }
  function uploadExternal() {
    const mediaSideloadFromUrl = getSettings()[mediaSideloadFromUrlKey];
    if (!mediaSideloadFromUrl) {
      return;
    }
    mediaSideloadFromUrl({
      url,
      onSuccess(img2) {
        onSelectImage(img2);
        createSuccessNotice((0, import_i18n.__)("Image uploaded."), {
          type: "snackbar"
        });
      },
      onError(message) {
        createErrorNotice(message, { type: "snackbar" });
      }
    });
  }
  const canEditImage = id && naturalWidth && naturalHeight && imageEditing && !!editMediaEntity;
  const allowCrop = isSingleSelected && canEditImage && !!openImageMediaEditorModal && !isContentOnlyMode && !isUploading;
  function switchToCover() {
    replaceBlocks(
      clientId,
      (0, import_blocks.switchToBlockType)(getBlock(clientId), "core/cover")
    );
  }
  const dimensionsUnitsOptions = (0, import_components.__experimentalUseCustomUnits)({
    availableUnits: ["px"]
  });
  const [lightboxSetting] = (0, import_block_editor.useSettings)("lightbox");
  const showLightboxSetting = (
    // If a block-level override is set, we should give users the option to
    // remove that override, even if the lightbox UI is disabled in the settings.
    !!lightbox && lightbox?.enabled !== lightboxSetting?.enabled || lightboxSetting?.allowEditing
  );
  const lightboxChecked = !!lightbox?.enabled || !lightbox && !!lightboxSetting?.enabled;
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const selectedStyleState = (0, import_data.useSelect)(
    (select) => {
      if (!isSingleSelected) {
        return void 0;
      }
      const { getSelectedBlockStyleState } = (0, import_lock_unlock.unlock)(
        select(import_block_editor.store)
      );
      return getSelectedBlockStyleState(clientId);
    },
    [clientId, isSingleSelected]
  );
  const hasSelectedStyleState = !isDefaultBlockStyleState(selectedStyleState);
  const selectedStyleStateKey = (0, import_style_state.getStyleStateKey)(selectedStyleState);
  const activeWidth = (0, import_style_state.getActiveDimensionValue)({
    attributes,
    selectedState: selectedStyleState,
    hasSelectedStyleState,
    attributeKey: "width"
  });
  const activeHeight = (0, import_style_state.getActiveDimensionValue)({
    attributes,
    selectedState: selectedStyleState,
    hasSelectedStyleState,
    attributeKey: "height"
  });
  const activeAspectRatio = (0, import_style_state.getActiveDimensionValue)({
    attributes,
    selectedState: selectedStyleState,
    hasSelectedStyleState,
    attributeKey: "aspectRatio"
  });
  const activeScale = (0, import_style_state.getActiveDimensionValue)({
    attributes,
    selectedState: selectedStyleState,
    hasSelectedStyleState,
    attributeKey: "scale",
    styleKey: "objectFit"
  });
  const setDimensionAttributes = (nextDimensions) => {
    setAttributes(
      (0, import_style_state.getDimensionUpdateAttributes)({
        style: attributes.style,
        selectedState: selectedStyleState,
        hasSelectedStyleState,
        nextDimensions,
        dimensionKeyMap: { scale: "objectFit" }
      })
    );
  };
  const dimensionsControl = showDimensionsControls && (import_constants.SIZED_LAYOUTS.includes(parentLayoutType) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    DimensionsTool,
    {
      panelId: clientId,
      value: { aspectRatio: activeAspectRatio, scale: activeScale },
      onChange: ({ aspectRatio: newAspectRatio }) => {
        setDimensionAttributes({
          aspectRatio: newAspectRatio,
          scale: "cover"
        });
      },
      defaultAspectRatio: "auto",
      tools: ["aspectRatio"]
    },
    selectedStyleStateKey
  ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    DimensionsTool,
    {
      panelId: clientId,
      value: {
        width: activeWidth,
        height: activeHeight,
        scale: activeScale,
        aspectRatio: activeAspectRatio
      },
      onChange: ({
        width: newWidth,
        height: newHeight,
        scale: newScale,
        aspectRatio: newAspectRatio
      }) => {
        setDimensionAttributes({
          // CSS includes `height: auto`, but we need
          // `width: auto` to fix the aspect ratio when
          // only height is set due to the width and
          // height attributes set via the server.
          width: !newWidth && newHeight ? "auto" : newWidth,
          height: newHeight,
          aspectRatio: newAspectRatio,
          scale: newScale
        });
      },
      defaultScale: "cover",
      defaultAspectRatio: "auto",
      scaleOptions,
      unitsOptions: dimensionsUnitsOptions,
      tools: isWideAligned ? ["aspectRatio", "scale"] : ["aspectRatio", "widthHeight", "scale"]
    },
    selectedStyleStateKey
  ));
  const resetSettings = () => {
    setAttributes({
      lightbox: void 0
    });
    updateImage(import_constants.DEFAULT_MEDIA_SIZE_SLUG);
  };
  const arePatternOverridesEnabled = metadata?.bindings?.__default?.source === "core/pattern-overrides";
  const {
    lockUrlControls = false,
    lockHrefControls = false,
    lockAltControls = false,
    lockAltControlsMessage,
    lockTitleControls = false,
    lockTitleControlsMessage,
    hideCaptionControls = false
  } = (0, import_data.useSelect)(
    (select) => {
      if (!isSingleSelected) {
        return {};
      }
      const {
        url: urlBinding,
        alt: altBinding,
        title: titleBinding,
        caption: captionBinding
      } = metadata?.bindings || {};
      const hasParentPattern = !!context["pattern/overrides"];
      const urlBindingSource = (0, import_blocks.getBlockBindingsSource)(
        urlBinding?.source
      );
      const altBindingSource = (0, import_blocks.getBlockBindingsSource)(
        altBinding?.source
      );
      const titleBindingSource = (0, import_blocks.getBlockBindingsSource)(
        titleBinding?.source
      );
      return {
        lockUrlControls: !!urlBinding && !urlBindingSource?.canUserEditValue?.({
          select,
          context,
          args: urlBinding?.args
        }),
        lockHrefControls: (
          // Disable editing the link of the URL if the image is inside a pattern instance.
          // This is a temporary solution until we support overriding the link on the frontend.
          hasParentPattern || arePatternOverridesEnabled
        ),
        hideCaptionControls: !!captionBinding,
        lockAltControls: !!altBinding && !altBindingSource?.canUserEditValue?.({
          select,
          context,
          args: altBinding?.args
        }),
        lockAltControlsMessage: altBindingSource?.label ? (0, import_i18n.sprintf)(
          /* translators: %s: Label of the bindings source. */
          (0, import_i18n.__)("Connected to %s"),
          altBindingSource.label
        ) : (0, import_i18n.__)("Connected to dynamic data"),
        lockTitleControls: !!titleBinding && !titleBindingSource?.canUserEditValue?.({
          select,
          context,
          args: titleBinding?.args
        }),
        lockTitleControlsMessage: titleBindingSource?.label ? (0, import_i18n.sprintf)(
          /* translators: %s: Label of the bindings source. */
          (0, import_i18n.__)("Connected to %s"),
          titleBindingSource.label
        ) : (0, import_i18n.__)("Connected to dynamic data")
      };
    },
    [
      arePatternOverridesEnabled,
      context,
      isSingleSelected,
      metadata?.bindings
    ]
  );
  const showUrlInput = isSingleSelected && !lockHrefControls && !lockUrlControls && !isDecorative;
  const showCoverControls = isSingleSelected && canInsertCover && !isContentOnlyMode;
  const showBlockControls = showUrlInput || allowCrop || showCoverControls;
  const mediaControls = isSingleSelected && !lockUrlControls && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: isContentOnlyMode ? "inline" : "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.MediaReplaceFlow,
    {
      mediaId: id,
      mediaURL: url,
      allowedTypes: import_constants.ALLOWED_MEDIA_TYPES,
      onSelect: onSelectImage,
      onSelectURL,
      onError: onUploadError,
      name: !url ? (0, import_i18n.__)("Add image") : (0, import_i18n.__)("Replace"),
      onReset: () => onSelectImage(void 0),
      variant: "toolbar"
    }
  ) }) });
  const controls = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    showBlockControls && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_block_editor.BlockControls, { group: "block", children: [
      showUrlInput && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.__experimentalImageURLInputUI,
        {
          url: href || "",
          onChangeUrl: onSetHref,
          linkDestination,
          mediaUrl: image && image.source_url || url,
          mediaLink: image && image.link,
          linkTarget,
          linkClass,
          rel,
          showLightboxSetting,
          lightboxEnabled: lightboxChecked,
          onSetLightbox,
          resetLightbox
        }
      ),
      allowCrop && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.ToolbarButton,
        {
          ref: cropButtonRef,
          onClick: openImageMediaEditorModal,
          "aria-haspopup": "dialog",
          icon: import_icons.crop,
          label: (0, import_i18n.__)("Edit image"),
          disabled: isSwappingMedia
        }
      ),
      showCoverControls && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.ToolbarButton,
        {
          icon: import_icons.overlayText,
          label: (0, import_i18n.__)("Add text over image"),
          onClick: switchToCover
        }
      )
    ] }),
    canUploadExternalImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarButton,
      {
        onClick: uploadExternal,
        icon: import_icons.upload,
        label: (0, import_i18n.__)("Upload to Media Library")
      }
    ) }) }),
    isContentOnlyMode && // Add some extra controls for content attributes when content only mode is active.
    // With content only mode active, the inspector is hidden, so users need another way
    // to edit these attributes.
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ContentOnlyControls,
      {
        attributes,
        setAttributes,
        lockAltControls,
        lockAltControlsMessage,
        lockTitleControls,
        lockTitleControlsMessage
      }
    ) }),
    isSingleSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "content", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Media"),
        resetAll: () => {
          onSelectImage(void 0);
          setAttributes({ isDecorative: false });
        },
        dropdownMenuProps,
        children: [
          !lockUrlControls && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Image"),
              hasValue: () => !!url,
              onDeselect: () => onSelectImage(void 0),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_media_control.MediaControl,
                {
                  mediaId: id,
                  mediaUrl: url,
                  alt,
                  filename: image?.media_details?.sizes?.full?.file || image?.slug || (0, import_url.getFilename)(url),
                  allowedTypes: import_constants.ALLOWED_MEDIA_TYPES,
                  onSelect: onSelectImage,
                  onSelectURL,
                  onError: onUploadError,
                  onReset: () => onSelectImage(void 0),
                  isUploading,
                  emptyLabel: (0, import_i18n.__)("Add image")
                }
              )
            }
          ),
          !isDecorative && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Alternative text"),
              isShownByDefault: true,
              hasValue: () => !!alt,
              onDeselect: () => setAttributes({ alt: void 0 }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.TextareaControl,
                {
                  label: (0, import_i18n.__)("Alternative text"),
                  value: alt || "",
                  onChange: updateAlt,
                  readOnly: lockAltControls,
                  help: lockAltControls ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: lockAltControlsMessage }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    import_components.ExternalLink,
                    {
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
            }
          ),
          !lockAltControls && !lightboxChecked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Mark as decorative"),
              isShownByDefault: true,
              hasValue: () => !!isDecorative,
              onDeselect: () => setAttributes({ isDecorative: false }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.CheckboxControl,
                {
                  label: (0, import_i18n.__)("Mark as decorative"),
                  checked: !!isDecorative,
                  onChange: updateIsDecorative,
                  help: (0, import_i18n.__)(
                    "Hidden from assistive technologies."
                  )
                }
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_block_editor.InspectorControls,
      {
        group: "dimensions",
        resetAllFilter: (attrs) => {
          return (0, import_style_state.getDimensionResetAttributes)({
            attributes: attrs,
            selectedState: selectedStyleState,
            hasSelectedStyleState,
            keys: ["aspectRatio", "height", "objectFit", "width"],
            defaultAttributes: {
              aspectRatio: void 0,
              width: void 0,
              height: void 0,
              scale: void 0,
              focalPoint: void 0
            }
          });
        },
        children: [
          dimensionsControl,
          !hasSelectedStyleState && url && scale && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Focal point"),
              isShownByDefault: true,
              hasValue: () => !!focalPoint,
              onDeselect: () => setAttributes({
                focalPoint: void 0
              }),
              panelId: clientId,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.FocalPointPicker,
                {
                  label: (0, import_i18n.__)("Focal point"),
                  url,
                  value: focalPoint,
                  onDragStart: imperativeFocalPointPreview,
                  onDrag: imperativeFocalPointPreview,
                  onChange: (newFocalPoint) => setAttributes({
                    focalPoint: newFocalPoint
                  })
                }
              )
            }
          )
        ]
      }
    ),
    !!imageSizeOptions.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: resetSettings,
        dropdownMenuProps,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          ResolutionTool,
          {
            value: sizeSlug,
            defaultValue: import_constants.DEFAULT_MEDIA_SIZE_SLUG,
            onChange: updateImage,
            options: imageSizeOptions
          }
        )
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "advanced", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.TextControl,
      {
        label: (0, import_i18n.__)("Title attribute"),
        value: title || "",
        onChange: onSetTitle,
        readOnly: lockTitleControls,
        help: lockTitleControls ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: lockTitleControlsMessage }) : (0, import_element.createInterpolateElement)(
          (0, import_i18n.__)(
            "Describe the role of this image on the page. <a>(Note: many devices and browsers do not display this text.)</a>"
          ),
          {
            a: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ExternalLink, { href: "https://www.w3.org/TR/html52/dom.html#the-title-attribute" })
          }
        )
      }
    ) })
  ] });
  const filename = (0, import_url.getFilename)(url);
  let defaultedAlt;
  if (isDecorative) {
    defaultedAlt = filename ? (0, import_i18n.sprintf)(
      /* translators: %s: file name */
      (0, import_i18n.__)(
        "This image has been marked as decorative; its file name is %s"
      ),
      filename
    ) : (0, import_i18n.__)("This image has been marked as decorative.");
  } else if (alt) {
    defaultedAlt = alt;
  } else if (filename) {
    defaultedAlt = (0, import_i18n.sprintf)(
      /* translators: %s: file name */
      (0, import_i18n.__)("This image has an empty alt attribute; its file name is %s"),
      filename
    );
  } else {
    defaultedAlt = (0, import_i18n.__)("This image has an empty alt attribute");
  }
  const borderProps = (0, import_block_editor.__experimentalUseBorderProps)(attributes);
  const shadowProps = (0, import_block_editor.__experimentalGetShadowClassesAndStyles)(attributes);
  const { postType, postId, queryId } = context;
  const isDescendentOfQueryLoop = Number.isFinite(queryId);
  const img = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageWrapper, { href, children: temporaryURL && hasImageErrored ? (
    // Show a placeholder during upload when the blob URL can't be loaded. This can
    // happen when the user uploads a HEIC image in a browser that doesn't support them.
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Placeholder,
      {
        className: "wp-block-image__placeholder",
        withIllustration: true,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {})
      }
    )
  ) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: temporaryURL || url,
        alt: defaultedAlt,
        onError: onImageError,
        onLoad: onImageLoad,
        ref: setRefs,
        className: (0, import_clsx.default)(borderProps.className, {
          "is-swapping-media": isSwappingMedia
        }),
        width: naturalWidth,
        height: naturalHeight,
        style: {
          aspectRatio,
          ...resizeDelta ? {
            width: pixelSize.width + resizeDelta.width,
            height: pixelSize.height + resizeDelta.height
          } : (() => {
            const style = {};
            if (width === "auto") {
              style.width = "auto";
            } else if (width !== void 0 && width !== null) {
              style.width = typeof width === "number" ? `${width}px` : width;
            }
            if (height === "auto") {
              style.height = "auto";
            } else if (height !== void 0 && height !== null) {
              style.height = typeof height === "number" ? `${height}px` : height;
            } else if (!isCroppedGalleryImage) {
              style.height = "auto";
            }
            return style;
          })(),
          objectFit: scale,
          objectPosition: focalPoint && scale ? (0, import_utils.mediaPosition)(focalPoint) : void 0,
          ...borderProps.style,
          ...shadowProps.style
        }
      }
    ),
    (isUploading || isSwappingMedia) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {})
  ] }) });
  let resizableBox;
  if (isResizable && isSingleSelected && !isUploading && !import_constants.SIZED_LAYOUTS.includes(parentLayoutType)) {
    const numericRatio = aspectRatio && (0, import_utils.evalAspectRatio)(aspectRatio);
    const customRatio = pixelSize.width / pixelSize.height;
    const naturalRatio = naturalWidth / naturalHeight;
    const ratio = numericRatio || customRatio || naturalRatio || 1;
    const minWidth = naturalWidth < naturalHeight ? import_constants.MIN_SIZE : import_constants.MIN_SIZE * ratio;
    const minHeight = naturalHeight < naturalWidth ? import_constants.MIN_SIZE : import_constants.MIN_SIZE / ratio;
    const maxWidthBuffer = maxWidth * 2.5;
    const maxResizeWidth = maxContentWidth || maxWidthBuffer;
    let showRightHandle = false;
    let showLeftHandle = false;
    if (align === "center") {
      showRightHandle = true;
      showLeftHandle = true;
    } else if ((0, import_i18n.isRTL)()) {
      if (align === "left") {
        showRightHandle = true;
      } else {
        showLeftHandle = true;
      }
    } else {
      if (align === "right") {
        showLeftHandle = true;
      } else {
        showRightHandle = true;
      }
    }
    resizableBox = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ResizableBox,
      {
        ref: effectResizeableBoxPlacement,
        style: {
          position: "absolute",
          // To match the vertical-align: bottom of the img (from style.scss)
          // syncs the top with the img. This matters when the img height is
          // less than the line-height.
          inset: `${offsetTop}px 0 0 0`
        },
        size: pixelSize,
        minWidth,
        maxWidth: maxResizeWidth,
        minHeight,
        maxHeight: maxResizeWidth / ratio,
        lockAspectRatio: ratio,
        enable: {
          top: false,
          right: showRightHandle,
          bottom: true,
          left: showLeftHandle
        },
        onResizeStart: () => {
          toggleSelection(false);
        },
        onResize: (event, direction, elt, delta) => {
          setResizeDelta(delta);
        },
        onResizeStop: (event, direction, elt, delta) => {
          toggleSelection(true);
          setResizeDelta(null);
          setPixelSize((current) => ({
            width: current.width + delta.width,
            height: current.height + delta.height
          }));
          if (maxContentWidth && // Only do this if the image is bigger than the container to prevent it from being squished.
          // TODO: Remove this check if the image support setting 100% width.
          naturalWidth >= maxContentWidth && Math.abs(elt.offsetWidth - maxContentWidth) < 10) {
            setAttributes({
              width: void 0,
              height: void 0
            });
            return;
          }
          setAttributes({
            width: `${elt.offsetWidth}px`,
            height: "auto",
            aspectRatio: ratio === naturalRatio ? void 0 : String(ratio)
          });
        },
        resizeRatio: align === "center" ? 2 : 1
      }
    );
  }
  if (!url && !temporaryURL) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      mediaControls,
      controls
    ] });
  }
  const setPostFeatureImage = () => {
    editEntityRecord("postType", postType, postId, {
      featured_media: id
    });
    createSuccessNotice((0, import_i18n.__)("Post featured image updated."), {
      type: "snackbar"
    });
  };
  const featuredImageControl = !isDescendentOfQueryLoop && postId && id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockSettingsMenuControls, { children: ({ canEdit, selectedClientIds }) => canEdit && selectedClientIds.length === 1 && clientId === selectedClientIds[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.MenuItem, { onClick: setPostFeatureImage, children: (0, import_i18n.__)("Set as featured image") }) }) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    mediaControls,
    controls,
    featuredImageControl,
    img,
    resizableBox,
    !isDecorative && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_caption.Caption,
      {
        attributes,
        setAttributes,
        isSelected: isSingleSelected,
        insertBlocksAfter,
        label: (0, import_i18n.__)("Image caption text"),
        showToolbarButton: isSingleSelected && (hasNonContentControls || isContentOnlyMode) && !hideCaptionControls
      }
    )
  ] });
}
//# sourceMappingURL=image.cjs.map
