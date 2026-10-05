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

// packages/block-library/src/gallery/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => GalleryEdit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_element = require("@wordpress/element");
var import_i18n = require("@wordpress/i18n");
var import_data = require("@wordpress/data");
var import_blocks = require("@wordpress/blocks");
var import_blob = require("@wordpress/blob");
var import_notices = require("@wordpress/notices");
var import_icons = require("@wordpress/icons");
var import_shared_icon = require("./shared-icon.cjs");
var import_shared = require("./shared.cjs");
var import_utils = require("./utils.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_utils2 = require("../image/utils.cjs");
var import_gallery = __toESM(require("./gallery.cjs"));
var import_constants = require("./constants.cjs");
var import_use_image_sizes = __toESM(require("./use-image-sizes.cjs"));
var import_use_get_new_images = __toESM(require("./use-get-new-images.cjs"));
var import_use_get_media = __toESM(require("./use-get-media.cjs"));
var import_flex_styles = __toESM(require("./flex-styles.cjs"));
var import_use_dynamic_gallery = __toESM(require("./use-dynamic-gallery.cjs"));
var import_dynamic_gallery = require("./dynamic-gallery.cjs");
var import_dynamic_source = require("./dynamic-source.cjs");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_responsive_styles = require("./responsive-styles.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var LINK_OPTIONS = [
  {
    icon: import_icons.customLink,
    label: (0, import_i18n.__)("Link images to attachment pages"),
    value: import_constants.LINK_DESTINATION_ATTACHMENT,
    noticeText: (0, import_i18n.__)("Attachment Pages")
  },
  {
    icon: import_icons.image,
    label: (0, import_i18n.__)("Link images to media files"),
    value: import_constants.LINK_DESTINATION_MEDIA,
    noticeText: (0, import_i18n.__)("Media Files")
  },
  {
    icon: import_icons.fullscreen,
    label: (0, import_i18n.__)("Enlarge on click"),
    value: import_constants.LINK_DESTINATION_LIGHTBOX,
    noticeText: (0, import_i18n.__)("Lightbox effect"),
    infoText: (0, import_i18n.__)("Scale images with a lightbox effect")
  },
  {
    icon: import_icons.linkOff,
    label: (0, import_i18n._x)("None", "Media item link option"),
    value: import_constants.LINK_DESTINATION_NONE,
    noticeText: (0, import_i18n.__)("None")
  }
];
var NAVIGATION_BUTTON_TYPE_OPTIONS = [
  {
    label: (0, import_i18n.__)("Icon"),
    value: "icon"
  },
  {
    label: (0, import_i18n.__)("Text"),
    value: "text"
  },
  {
    label: (0, import_i18n.__)("Both"),
    value: "both"
  }
];
var ALLOWED_MEDIA_TYPES = ["image"];
var PLACEHOLDER_TEXT = (0, import_i18n.__)(
  "Drag and drop images, upload, or choose from your library."
);
var DEFAULT_BLOCK = { name: "core/image" };
var EMPTY_ARRAY = [];
function GalleryEdit(props) {
  const {
    setAttributes,
    attributes,
    className,
    clientId,
    isSelected,
    insertBlocksAfter,
    isContentLocked,
    context,
    __unstableLayoutClassNames: layoutClassNames
  } = props;
  const postId = context?.postId;
  const postType = context?.postType;
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  const [lightboxSetting, defaultRatios, themeRatios, showDefaultRatios] = (0, import_block_editor.useSettings)(
    "blocks.core/image.lightbox",
    "dimensions.aspectRatios.default",
    "dimensions.aspectRatios.theme",
    "dimensions.defaultAspectRatios"
  );
  const linkOptions = !lightboxSetting?.allowEditing ? LINK_OPTIONS.filter(
    (option) => option.value !== import_constants.LINK_DESTINATION_LIGHTBOX
  ) : LINK_OPTIONS;
  const {
    align,
    navigationButtonType,
    columns,
    imageCrop,
    randomOrder,
    linkTarget,
    linkTo,
    sizeSlug,
    aspectRatio,
    layout
  } = attributes;
  const isFlexLayout = (0, import_shared.isGalleryFlexLayout)(layout);
  const previousLayoutRef = (0, import_element.useRef)(layout);
  const {
    __unstableMarkNextChangeAsNotPersistent,
    replaceInnerBlocks,
    updateBlockAttributes,
    selectBlock
  } = (0, import_data.useDispatch)(import_block_editor.store);
  const { createSuccessNotice, createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
  (0, import_element.useEffect)(() => {
    const previousLayout = previousLayoutRef.current;
    previousLayoutRef.current = layout;
    if (!(0, import_shared.isObject)(previousLayout) || !(0, import_shared.isObject)(layout) || previousLayout.type === layout.type) {
      return;
    }
    const nextLayout = { ...layout };
    let hasPreservedGridSetting = false;
    if (!Object.hasOwn(layout, "columnCount") && Number.isInteger(previousLayout.columnCount) && previousLayout.columnCount > 0) {
      nextLayout.columnCount = previousLayout.columnCount;
      hasPreservedGridSetting = true;
    }
    if (!Object.hasOwn(layout, "minimumColumnWidth") && typeof previousLayout.minimumColumnWidth === "string") {
      nextLayout.minimumColumnWidth = previousLayout.minimumColumnWidth;
      hasPreservedGridSetting = true;
    }
    if (hasPreservedGridSetting) {
      previousLayoutRef.current = nextLayout;
      __unstableMarkNextChangeAsNotPersistent();
      setAttributes({ layout: nextLayout });
    }
  }, [layout, setAttributes, __unstableMarkNextChangeAsNotPersistent]);
  const {
    getBlock,
    getSettings,
    innerBlockImages,
    multiGallerySelection,
    selectedStyleState
  } = (0, import_data.useSelect)(
    (select) => {
      const {
        getBlockName,
        getMultiSelectedBlockClientIds,
        getSettings: _getSettings,
        getBlock: _getBlock,
        getSelectedBlockStyleState
      } = (0, import_lock_unlock.unlock)(select(import_block_editor.store));
      const multiSelectedClientIds = getMultiSelectedBlockClientIds();
      return {
        getBlock: _getBlock,
        getSettings: _getSettings,
        innerBlockImages: _getBlock(clientId)?.innerBlocks ?? EMPTY_ARRAY,
        multiGallerySelection: multiSelectedClientIds.length && multiSelectedClientIds.every(
          (_clientId) => getBlockName(_clientId) === "core/gallery"
        ),
        selectedStyleState: getSelectedBlockStyleState(clientId)
      };
    },
    [clientId]
  );
  const isViewportStyleState = selectedStyleState?.viewport && selectedStyleState.viewport !== "default";
  const viewportStyle = isViewportStyleState ? (0, import_responsive_styles.getViewportGalleryStyle)(
    attributes.style,
    selectedStyleState.viewport
  ) : {};
  const baseColumns = (0, import_responsive_styles.isValidGalleryColumns)(columns) ? columns : void 0;
  const baseImageCrop = typeof imageCrop === "boolean" ? imageCrop : true;
  const hasViewportColumns = isViewportStyleState && Object.hasOwn(viewportStyle, "columns") && (0, import_responsive_styles.isValidGalleryColumns)(viewportStyle.columns);
  const hasViewportImageCrop = isViewportStyleState && Object.hasOwn(viewportStyle, "imageCrop") && typeof viewportStyle.imageCrop === "boolean";
  const activeColumns = hasViewportColumns ? viewportStyle.columns : baseColumns;
  const activeImageCrop = hasViewportImageCrop ? viewportStyle.imageCrop : baseImageCrop;
  const images = (0, import_element.useMemo)(
    () => innerBlockImages?.map((block) => ({
      clientId: block.clientId,
      id: block.attributes.id,
      url: block.attributes.url,
      attributes: block.attributes,
      fromSavedContent: Boolean(block.originalContent)
    })),
    [innerBlockImages]
  );
  const imageData = (0, import_use_get_media.default)(innerBlockImages);
  const newImages = (0, import_use_get_new_images.default)(images, imageData);
  const hasImages = !!images.length;
  const isDynamic = !!attributes.dynamicContent;
  const dynamic = (0, import_use_dynamic_gallery.default)({
    attributes,
    setAttributes,
    clientId,
    postId,
    postType
  });
  const displayedImageCount = isDynamic ? dynamic.dynamicMedia.length : images.length;
  let hasLightboxImages;
  if (isDynamic) {
    hasLightboxImages = linkTo === import_constants.LINK_DESTINATION_LIGHTBOX;
  } else if (lightboxSetting?.enabled) {
    hasLightboxImages = images.filter(
      (image) => image.attributes?.lightbox?.enabled === void 0 || image.attributes?.lightbox?.enabled === true
    ).length > 0;
  } else {
    hasLightboxImages = images.filter((image) => image.attributes.lightbox?.enabled).length > 0;
  }
  const themeOptions = themeRatios?.map(({ name, ratio }) => ({
    label: name,
    value: ratio
  }));
  const defaultOptions = defaultRatios?.map(({ name, ratio }) => ({
    label: name,
    value: ratio
  }));
  const aspectRatioOptions = [
    {
      label: (0, import_i18n._x)(
        "Original",
        "Aspect ratio option for dimensions control"
      ),
      value: "auto"
    },
    ...showDefaultRatios ? defaultOptions || [] : [],
    ...themeOptions || []
  ];
  (0, import_element.useEffect)(() => {
    newImages?.forEach((newImage) => {
      __unstableMarkNextChangeAsNotPersistent();
      updateBlockAttributes(newImage.clientId, {
        ...buildImageAttributes(newImage.attributes),
        id: newImage.id,
        align: void 0
      });
    });
  }, [newImages]);
  const imageSizeOptions = (0, import_use_image_sizes.default)(
    isDynamic ? dynamic.dynamicMedia : imageData,
    isSelected,
    getSettings
  );
  function buildImageAttributes(imageAttributes) {
    const image = imageAttributes.id ? imageData.find(({ id }) => id === imageAttributes.id) : null;
    let newClassName;
    if (imageAttributes.className && imageAttributes.className !== "") {
      newClassName = imageAttributes.className;
    }
    let newLinkTarget;
    if (imageAttributes.linkTarget || imageAttributes.rel) {
      newLinkTarget = {
        linkTarget: imageAttributes.linkTarget,
        rel: imageAttributes.rel
      };
    } else {
      newLinkTarget = (0, import_utils2.getUpdatedLinkTargetSettings)(
        linkTarget,
        attributes
      );
    }
    return {
      ...(0, import_shared.pickRelevantMediaFiles)(image, sizeSlug),
      ...(0, import_utils.getHrefAndDestination)(
        image,
        linkTo,
        imageAttributes?.linkDestination
      ),
      ...newLinkTarget,
      className: newClassName,
      sizeSlug,
      caption: imageAttributes.caption.length > 0 ? imageAttributes.caption : image.caption?.raw,
      alt: imageAttributes.alt || image.alt_text,
      aspectRatio: aspectRatio === "auto" ? void 0 : aspectRatio
    };
  }
  function isValidFileType(file) {
    const mediaTypeSelector = file.type;
    return ALLOWED_MEDIA_TYPES.some(
      (mediaType) => mediaTypeSelector?.indexOf(mediaType) === 0
    ) || file.blob;
  }
  function updateImages(selectedImages) {
    const newFileUploads = Object.prototype.toString.call(selectedImages) === "[object FileList]";
    const imageArray = newFileUploads ? Array.from(selectedImages).map((file) => {
      if (!file.url) {
        return {
          blob: (0, import_blob.createBlobURL)(file)
        };
      }
      return file;
    }) : selectedImages;
    if (!imageArray.every(isValidFileType)) {
      createErrorNotice(
        (0, import_i18n.__)(
          "If uploading to a gallery all files need to be image formats"
        ),
        { id: "gallery-upload-invalid-file", type: "snackbar" }
      );
    }
    const processedImages = imageArray.filter((file) => file.url || isValidFileType(file)).map((file) => {
      if (!file.url) {
        return {
          blob: file.blob || (0, import_blob.createBlobURL)(file)
        };
      }
      return file;
    });
    const newOrderMap = processedImages.reduce(
      (result, image, index) => (result[image.id] = index, result),
      {}
    );
    const existingImageBlocks = !newFileUploads ? innerBlockImages.filter(
      (block) => processedImages.find(
        (img) => img.id === block.attributes.id
      )
    ) : innerBlockImages;
    const newImageList = processedImages.filter(
      (img) => !existingImageBlocks.find(
        (existingImg) => img.id === existingImg.attributes.id
      )
    );
    const newBlocks = newImageList.map((image) => {
      return (0, import_blocks.createBlock)("core/image", {
        id: image.id,
        blob: image.blob,
        url: image.url,
        caption: image.caption,
        alt: image.alt
      });
    });
    replaceInnerBlocks(
      clientId,
      existingImageBlocks.concat(newBlocks).sort(
        (a, b) => newOrderMap[a.attributes.id] - newOrderMap[b.attributes.id]
      )
    );
    if (newBlocks?.length > 0) {
      selectBlock(newBlocks[0].clientId);
    }
  }
  function onUploadError(message) {
    createErrorNotice(message, { type: "snackbar" });
  }
  function setLinkTo(value) {
    setAttributes({ linkTo: value });
    const changedAttributes = {};
    const blocks = [];
    getBlock(clientId).innerBlocks.forEach((block) => {
      blocks.push(block.clientId);
      const image = block.attributes.id ? imageData.find(({ id }) => id === block.attributes.id) : null;
      changedAttributes[block.clientId] = (0, import_utils.getHrefAndDestination)(
        image,
        value,
        false,
        block.attributes,
        lightboxSetting
      );
    });
    updateBlockAttributes(blocks, changedAttributes, {
      uniqueByBlock: true
    });
    const linkToText = [...linkOptions].find(
      (linkType) => linkType.value === value
    );
    createSuccessNotice(
      (0, import_i18n.sprintf)(
        /* translators: %s: image size settings */
        (0, import_i18n.__)("All gallery image links updated to: %s"),
        linkToText.noticeText
      ),
      {
        id: "gallery-attributes-linkTo",
        type: "snackbar"
      }
    );
  }
  function setGalleryFlexSettings(settings) {
    if (!isViewportStyleState) {
      setAttributes(settings);
      return;
    }
    setAttributes({
      style: (0, import_responsive_styles.getUpdatedGalleryStyle)({
        style: attributes.style,
        viewport: selectedStyleState.viewport,
        baseSettings: {
          columns: baseColumns,
          imageCrop: baseImageCrop
        },
        settings
      })
    });
  }
  function setColumnsNumber(value) {
    setGalleryFlexSettings({ columns: value });
  }
  function toggleImageCrop() {
    setGalleryFlexSettings({ imageCrop: !activeImageCrop });
  }
  function toggleRandomOrder() {
    setAttributes({ randomOrder: !randomOrder });
  }
  function toggleOpenInNewTab(openInNewTab) {
    const newLinkTarget = openInNewTab ? "_blank" : void 0;
    setAttributes({ linkTarget: newLinkTarget });
    const changedAttributes = {};
    const blocks = [];
    getBlock(clientId).innerBlocks.forEach((block) => {
      blocks.push(block.clientId);
      changedAttributes[block.clientId] = (0, import_utils2.getUpdatedLinkTargetSettings)(
        newLinkTarget,
        block.attributes
      );
    });
    updateBlockAttributes(blocks, changedAttributes, {
      uniqueByBlock: true
    });
    const noticeText = openInNewTab ? (0, import_i18n.__)("All gallery images updated to open in new tab") : (0, import_i18n.__)("All gallery images updated to not open in new tab");
    createSuccessNotice(noticeText, {
      id: "gallery-attributes-openInNewTab",
      type: "snackbar"
    });
  }
  function updateImagesSize(newSizeSlug) {
    setAttributes({ sizeSlug: newSizeSlug });
    const changedAttributes = {};
    const blocks = [];
    getBlock(clientId).innerBlocks.forEach((block) => {
      blocks.push(block.clientId);
      const image = block.attributes.id ? imageData.find(({ id }) => id === block.attributes.id) : null;
      changedAttributes[block.clientId] = (0, import_utils2.getImageSizeAttributes)(
        image,
        newSizeSlug
      );
    });
    updateBlockAttributes(blocks, changedAttributes, {
      uniqueByBlock: true
    });
    const imageSize = imageSizeOptions.find(
      (size) => size.value === newSizeSlug
    );
    createSuccessNotice(
      (0, import_i18n.sprintf)(
        /* translators: %s: image size settings */
        (0, import_i18n.__)("All gallery image sizes updated to: %s"),
        imageSize?.label ?? newSizeSlug
      ),
      {
        id: "gallery-attributes-sizeSlug",
        type: "snackbar"
      }
    );
  }
  function setAspectRatio(value) {
    setAttributes({ aspectRatio: value });
    const changedAttributes = {};
    const blocks = [];
    getBlock(clientId).innerBlocks.forEach((block) => {
      blocks.push(block.clientId);
      changedAttributes[block.clientId] = {
        aspectRatio: value === "auto" ? void 0 : value
      };
    });
    updateBlockAttributes(blocks, changedAttributes, true);
    const aspectRatioText = aspectRatioOptions.find(
      (option) => option.value === value
    );
    createSuccessNotice(
      (0, import_i18n.sprintf)(
        /* translators: %s: aspect ratio setting */
        (0, import_i18n.__)("All gallery images updated to aspect ratio: %s"),
        aspectRatioText?.label || value
      ),
      {
        id: "gallery-attributes-aspectRatio",
        type: "snackbar"
      }
    );
  }
  (0, import_element.useEffect)(() => {
    if (!linkTo) {
      __unstableMarkNextChangeAsNotPersistent();
      setAttributes({
        linkTo: window?.wp?.media?.view?.settings?.defaultProps?.link || import_constants.LINK_DESTINATION_NONE
      });
    }
  }, [linkTo]);
  const hasImageIds = hasImages && images.some((image) => !!image.id);
  const imagesUploading = images.some(
    (img) => !img.id && img.url?.indexOf("blob:") === 0
  );
  const mediaPlaceholderProps = {
    addToGallery: false,
    disableMediaButtons: imagesUploading,
    value: {}
  };
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: (0, import_clsx.default)(
      className,
      "has-nested-images",
      `wp-block-gallery-${clientId}`,
      // In dynamic mode there are no inner blocks and the gallery isn't
      // rendered through the `Gallery` component, so the classes that
      // component normally composes onto the `<figure>` (see `gallery.jsx`)
      // must be added here to keep the preview's flex/crop layout matching
      // the static gallery and the frontend.
      isDynamic && [
        layoutClassNames,
        "blocks-gallery-grid",
        {
          [`align${align}`]: align,
          [`columns-${columns}`]: isFlexLayout && columns !== void 0,
          "columns-default": isFlexLayout && columns === void 0,
          "is-cropped": isFlexLayout && imageCrop
        }
      ]
    )
  });
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    defaultBlock: DEFAULT_BLOCK,
    directInsert: true,
    orientation: "horizontal",
    renderAppender: false,
    // In dynamic mode nothing may be inserted: the images are resolved from
    // the source, not authored as inner blocks. `allowedBlocks: []` enforces
    // this in every context — unlike `templateLock: 'all'`, it isn't relaxed
    // to `contentOnly` by a content-locked ancestor — so it blocks insertion
    // and drag-and-drop (via `canInsertBlockType`). It's also what opts the
    // gallery out of the List View: a block that can't be inserted into and
    // has no inner blocks has nothing to navigate or add (see
    // `shouldRenderBlockListView`). This reaches the block's list settings
    // only while the inner blocks are mounted, which is why the dynamic view
    // still renders the (empty) inner blocks.
    allowedBlocks: isDynamic ? EMPTY_ARRAY : void 0
  });
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  if (!hasImages && !isDynamic) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...innerBlocksProps, children: [
      innerBlocksProps.children,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.MediaPlaceholder,
        {
          handleUpload: false,
          icon: import_shared_icon.sharedIcon,
          labels: {
            title: (0, import_i18n.__)("Gallery"),
            instructions: PLACEHOLDER_TEXT
          },
          onSelect: updateImages,
          allowedTypes: ALLOWED_MEDIA_TYPES,
          multiple: true,
          onError: onUploadError,
          ...mediaPlaceholderProps,
          children: blockEditingMode === "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.Button,
            {
              __next40pxDefaultSize: true,
              variant: "secondary",
              onClick: dynamic.enableDynamicMode,
              children: (0, import_dynamic_source.getDynamicSource)(import_dynamic_source.ATTACHED_MEDIA).title
            }
          )
        }
      )
    ] });
  }
  const hasLinkTo = linkTo && linkTo !== "none";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_block_editor.InspectorControls,
      {
        group: isViewportStyleState && isFlexLayout ? "viewport" : "default",
        children: [
          !isViewportStyleState && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_dynamic_gallery.GallerySourcePanel,
            {
              dynamic,
              dropdownMenuProps,
              hasImages
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            import_components.__experimentalToolsPanel,
            {
              label: (0, import_i18n.__)("Settings"),
              resetAll: () => {
                if (isViewportStyleState) {
                  setGalleryFlexSettings({
                    columns: void 0,
                    imageCrop: void 0
                  });
                  return;
                }
                setAttributes({
                  navigationButtonType: "icon",
                  randomOrder: false,
                  ...isFlexLayout && {
                    columns: void 0,
                    imageCrop: true
                  }
                });
                setAspectRatio("auto");
                if (sizeSlug !== import_constants.DEFAULT_MEDIA_SIZE_SLUG) {
                  updateImagesSize(import_constants.DEFAULT_MEDIA_SIZE_SLUG);
                }
                if (linkTarget) {
                  toggleOpenInNewTab(false);
                }
              },
              dropdownMenuProps,
              children: [
                isFlexLayout && displayedImageCount > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.__experimentalToolsPanelItem,
                  {
                    isShownByDefault: true,
                    label: (0, import_i18n.__)("Columns"),
                    hasValue: () => isViewportStyleState ? hasViewportColumns : !!activeColumns && activeColumns !== displayedImageCount,
                    onDeselect: () => setColumnsNumber(void 0),
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_components.RangeControl,
                      {
                        label: (0, import_i18n.__)("Columns"),
                        value: activeColumns ? activeColumns : (0, import_shared.defaultColumnsNumber)(
                          displayedImageCount
                        ),
                        onChange: setColumnsNumber,
                        min: 1,
                        max: Math.min(
                          import_constants.MAX_COLUMNS,
                          displayedImageCount
                        ),
                        required: true
                      }
                    )
                  }
                ),
                !isViewportStyleState && imageSizeOptions?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.__experimentalToolsPanelItem,
                  {
                    isShownByDefault: true,
                    label: (0, import_i18n.__)("Resolution"),
                    hasValue: () => sizeSlug !== import_constants.DEFAULT_MEDIA_SIZE_SLUG,
                    onDeselect: () => updateImagesSize(import_constants.DEFAULT_MEDIA_SIZE_SLUG),
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_components.SelectControl,
                      {
                        label: (0, import_i18n.__)("Resolution"),
                        help: (0, import_i18n.__)(
                          "Select the size of the source images."
                        ),
                        value: sizeSlug,
                        options: imageSizeOptions,
                        onChange: updateImagesSize,
                        hideCancelButton: true
                      }
                    )
                  }
                ),
                isFlexLayout && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.__experimentalToolsPanelItem,
                  {
                    isShownByDefault: true,
                    label: (0, import_i18n.__)("Crop images to fit"),
                    hasValue: () => isViewportStyleState ? hasViewportImageCrop : !activeImageCrop,
                    onDeselect: () => setGalleryFlexSettings({
                      imageCrop: isViewportStyleState ? void 0 : true
                    }),
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_components.ToggleControl,
                      {
                        label: (0, import_i18n.__)("Crop images to fit"),
                        checked: activeImageCrop,
                        onChange: toggleImageCrop
                      }
                    )
                  }
                ),
                !isViewportStyleState && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.__experimentalToolsPanelItem,
                  {
                    isShownByDefault: true,
                    label: (0, import_i18n.__)("Randomize order"),
                    hasValue: () => !!randomOrder,
                    onDeselect: () => setAttributes({ randomOrder: false }),
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_components.ToggleControl,
                      {
                        label: (0, import_i18n.__)("Randomize order"),
                        checked: !!randomOrder,
                        onChange: toggleRandomOrder
                      }
                    )
                  }
                ),
                !isViewportStyleState && hasLinkTo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.__experimentalToolsPanelItem,
                  {
                    isShownByDefault: true,
                    label: (0, import_i18n.__)("Open images in new tab"),
                    hasValue: () => !!linkTarget,
                    onDeselect: () => toggleOpenInNewTab(false),
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_components.ToggleControl,
                      {
                        label: (0, import_i18n.__)("Open images in new tab"),
                        checked: linkTarget === "_blank",
                        onChange: toggleOpenInNewTab
                      }
                    )
                  }
                ),
                !isViewportStyleState && aspectRatioOptions.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.__experimentalToolsPanelItem,
                  {
                    hasValue: () => !!aspectRatio && aspectRatio !== "auto",
                    label: (0, import_i18n.__)("Aspect ratio"),
                    onDeselect: () => setAspectRatio("auto"),
                    isShownByDefault: true,
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_components.SelectControl,
                      {
                        label: (0, import_i18n.__)("Aspect ratio"),
                        help: (0, import_i18n.__)(
                          "Set a consistent aspect ratio for all images in the gallery."
                        ),
                        value: aspectRatio,
                        options: aspectRatioOptions,
                        onChange: setAspectRatio
                      }
                    )
                  }
                ),
                !isViewportStyleState && lightboxSetting?.allowEditing && hasLightboxImages && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.__experimentalToolsPanelItem,
                  {
                    label: (0, import_i18n.__)("Navigation button type"),
                    isShownByDefault: true,
                    hasValue: () => navigationButtonType !== "icon",
                    onDeselect: () => setAttributes({
                      navigationButtonType: "icon"
                    }),
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_components.__experimentalToggleGroupControl,
                      {
                        label: (0, import_i18n.__)("Navigation button type"),
                        value: navigationButtonType,
                        onChange: (value) => setAttributes({
                          navigationButtonType: value
                        }),
                        isBlock: true,
                        help: (0, import_i18n.__)(
                          "Adjust the appearance of buttons in the lightbox."
                        ),
                        children: NAVIGATION_BUTTON_TYPE_OPTIONS.map(
                          (option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                            import_components.__experimentalToggleGroupControlOption,
                            {
                              value: option.value,
                              label: option.label
                            },
                            option.value
                          )
                        )
                      }
                    )
                  }
                )
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarDropdownMenu, { icon: import_icons.link, label: (0, import_i18n.__)("Link"), children: ({ onClose }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.MenuGroup, { children: linkOptions.map((linkItem) => {
      const isOptionSelected = linkTo === linkItem.value;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.MenuItem,
        {
          isSelected: isOptionSelected,
          className: (0, import_clsx.default)(
            "components-dropdown-menu__menu-item",
            {
              "is-active": isOptionSelected
            }
          ),
          iconPosition: "left",
          icon: linkItem.icon,
          onClick: () => {
            setLinkTo(linkItem.value);
            onClose();
          },
          role: "menuitemradio",
          info: linkItem.infoText,
          children: linkItem.label
        },
        linkItem.value
      );
    }) }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      !multiGallerySelection && !isDynamic && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.MediaReplaceFlow,
        {
          allowedTypes: ALLOWED_MEDIA_TYPES,
          handleUpload: false,
          onSelect: updateImages,
          name: (0, import_i18n.__)("Add"),
          multiple: true,
          mediaIds: images.filter((image) => image.id).map((image) => image.id),
          addToGallery: hasImageIds,
          variant: "toolbar"
        }
      ) }),
      isFlexLayout && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_flex_styles.default,
        {
          style: attributes.style,
          clientId
        }
      )
    ] }),
    isDynamic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_dynamic_gallery.GalleryDynamicView,
      {
        ...props,
        dynamic,
        blockProps,
        innerBlocksProps,
        multiGallerySelection
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_gallery.default,
      {
        ...props,
        isContentLocked,
        images,
        blockProps: innerBlocksProps,
        insertBlocksAfter,
        multiGallerySelection
      }
    )
  ] });
}
//# sourceMappingURL=edit.cjs.map
