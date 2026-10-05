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

// packages/block-library/src/site-logo/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => LogoEdit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_blob = require("@wordpress/blob");
var import_element = require("@wordpress/element");
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_compose = require("@wordpress/compose");
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_core_data = require("@wordpress/core-data");
var import_icons = require("@wordpress/icons");
var import_notices = require("@wordpress/notices");
var import_constants = require("../image/constants.cjs");
var import_media_control = require("../utils/media-control.cjs");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var ALLOWED_MEDIA_TYPES = ["image"];
var { mediaEditKey, openMediaEditorModalKey } = (0, import_lock_unlock.unlock)(
  import_block_editor.privateApis
);
var SiteLogo = ({
  alt,
  attributes: { align, width, height, isLink, linkTarget, shouldSyncIcon },
  isSelected,
  setAttributes,
  setLogo,
  logoUrl,
  siteUrl,
  logoId,
  iconId,
  setIcon,
  canUserEdit
}) => {
  const isLargeViewport = (0, import_compose.useViewportMatch)("medium");
  const isWideAligned = ["wide", "full"].includes(align);
  const isResizable = !isWideAligned && isLargeViewport;
  const [{ naturalWidth, naturalHeight }, setNaturalSize] = (0, import_element.useState)({});
  const cropButtonRef = (0, import_element.useRef)();
  const { toggleSelection, __unstableMarkNextChangeAsNotPersistent } = (0, import_data.useDispatch)(import_block_editor.store);
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  const isContentOnlyMode = blockEditingMode === "contentOnly";
  const {
    imageEditing,
    maxWidth,
    title,
    editMediaEntity,
    openMediaEditorModal
  } = (0, import_data.useSelect)((select) => {
    const settings = select(import_block_editor.store).getSettings();
    const siteEntities = select(import_core_data.store).getEntityRecord(
      "root",
      "__unstableBase"
    );
    return {
      title: siteEntities?.name,
      imageEditing: settings.imageEditing,
      maxWidth: settings.maxWidth,
      editMediaEntity: settings?.[mediaEditKey],
      openMediaEditorModal: settings?.[openMediaEditorModalKey]
    };
  }, []);
  (0, import_element.useEffect)(() => {
    if (shouldSyncIcon && logoId !== iconId) {
      __unstableMarkNextChangeAsNotPersistent();
      setAttributes({ shouldSyncIcon: false });
    }
  }, []);
  const handleMediaUpdate = ({ id: newId }) => {
    if (typeof newId === "number") {
      setLogo(newId);
    }
  };
  function onResizeStart() {
    toggleSelection(false);
  }
  function onResizeStop() {
    toggleSelection(true);
  }
  const img = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        className: "custom-logo",
        src: logoUrl,
        alt,
        onLoad: (event) => {
          setNaturalSize({
            naturalWidth: event.target.naturalWidth,
            naturalHeight: event.target.naturalHeight
          });
        }
      }
    ),
    (0, import_blob.isBlobURL)(logoUrl) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {})
  ] });
  let imgWrapper = img;
  if (isLink) {
    imgWrapper = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "a",
      {
        href: siteUrl,
        className: "custom-logo-link",
        rel: "home",
        title,
        onClick: (event) => event.preventDefault(),
        children: img
      }
    );
  }
  if (!isResizable || !naturalWidth || !naturalHeight) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width, height }, children: imgWrapper });
  }
  const defaultWidth = 120;
  const currentWidth = width || defaultWidth;
  const ratio = naturalWidth / naturalHeight;
  const currentHeight = currentWidth / ratio;
  const minWidth = naturalWidth < naturalHeight ? import_constants.MIN_SIZE : Math.ceil(import_constants.MIN_SIZE * ratio);
  const minHeight = naturalHeight < naturalWidth ? import_constants.MIN_SIZE : Math.ceil(import_constants.MIN_SIZE / ratio);
  const maxWidthBuffer = maxWidth * 2.5;
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
  const canEditImage = logoId && naturalWidth && naturalHeight && imageEditing && !!editMediaEntity;
  const shouldShowCropAndDimensions = !isContentOnlyMode;
  const shouldUseNewUrl = !window?.__experimentalUseCustomizerSiteLogoUrl;
  const siteIconSettingsUrl = shouldUseNewUrl ? siteUrl + "/wp-admin/options-general.php" : siteUrl + "/wp-admin/customize.php?autofocus[section]=title_tagline";
  const syncSiteIconHelpText = (0, import_element.createInterpolateElement)(
    (0, import_i18n.__)(
      "Site Icons are what you see in browser tabs, bookmark bars, and within the WordPress mobile apps. To use a custom icon that is different from your site logo, use the <a>Site Icon settings</a>."
    ),
    {
      a: (
        // eslint-disable-next-line jsx-a11y/anchor-has-content, react/jsx-no-target-blank
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "a",
          {
            href: siteIconSettingsUrl,
            target: "_blank",
            rel: "noopener"
          }
        )
      )
    }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              isShownByDefault: true,
              hasValue: () => !!width,
              label: (0, import_i18n.__)("Image width"),
              onDeselect: () => setAttributes({ width: void 0 }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.RangeControl,
                {
                  label: (0, import_i18n.__)("Image width"),
                  onChange: (newWidth) => setAttributes({ width: newWidth }),
                  min: minWidth,
                  max: maxWidthBuffer,
                  initialPosition: Math.min(
                    defaultWidth,
                    maxWidthBuffer
                  ),
                  value: width || "",
                  disabled: !isResizable
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              isShownByDefault: true,
              hasValue: () => !isLink,
              label: (0, import_i18n.__)("Link image to home"),
              onDeselect: () => setAttributes({ isLink: true }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Link image to home"),
                  onChange: () => setAttributes({ isLink: !isLink }),
                  checked: isLink
                }
              )
            }
          ),
          isLink && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              isShownByDefault: true,
              hasValue: () => linkTarget === "_blank",
              label: (0, import_i18n.__)("Open in new tab"),
              onDeselect: () => setAttributes({ linkTarget: "_self" }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Open in new tab"),
                  onChange: (value) => setAttributes({
                    linkTarget: value ? "_blank" : "_self"
                  }),
                  checked: linkTarget === "_blank"
                }
              )
            }
          ),
          canUserEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              isShownByDefault: true,
              hasValue: () => !!shouldSyncIcon,
              label: (0, import_i18n.__)("Use as Site Icon"),
              onDeselect: () => {
                setAttributes({ shouldSyncIcon: false });
                setIcon(void 0);
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Use as Site Icon"),
                  onChange: (value) => {
                    setAttributes({ shouldSyncIcon: value });
                    setIcon(value ? logoId : void 0);
                  },
                  checked: !!shouldSyncIcon,
                  help: syncSiteIconHelpText
                }
              )
            }
          )
        ]
      }
    ) }),
    canEditImage && openMediaEditorModal && shouldShowCropAndDimensions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarButton,
      {
        ref: cropButtonRef,
        onClick: () => openMediaEditorModal({
          id: logoId,
          onUpdate: handleMediaUpdate,
          onClose: () => cropButtonRef.current?.focus()
        }),
        "aria-haspopup": "dialog",
        icon: import_icons.crop,
        label: (0, import_i18n.__)("Edit image")
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ResizableBox,
      {
        size: {
          width: currentWidth,
          height: currentHeight
        },
        showHandle: isSelected && shouldShowCropAndDimensions,
        minWidth,
        maxWidth: maxWidthBuffer,
        minHeight,
        maxHeight: maxWidthBuffer / ratio,
        lockAspectRatio: true,
        enable: {
          top: false,
          right: showRightHandle,
          bottom: true,
          left: showLeftHandle
        },
        onResizeStart,
        onResizeStop: (event, direction, elt, delta) => {
          onResizeStop();
          setAttributes({
            width: parseInt(currentWidth + delta.width, 10),
            height: parseInt(currentHeight + delta.height, 10)
          });
        },
        children: imgWrapper
      }
    )
  ] });
};
function LogoEdit({
  attributes,
  className,
  setAttributes,
  isSelected
}) {
  const { width, shouldSyncIcon } = attributes;
  const {
    siteLogoId,
    canUserEdit,
    url,
    siteIconId,
    mediaItemData,
    isRequestingMediaItem
  } = (0, import_data.useSelect)((select) => {
    const { canUser, getEntityRecord, getEditedEntityRecord } = select(import_core_data.store);
    const _canUserEdit = canUser("update", {
      kind: "root",
      name: "site"
    });
    const siteSettings = _canUserEdit ? getEditedEntityRecord("root", "site") : void 0;
    const siteData = getEntityRecord("root", "__unstableBase");
    const _siteLogoId = _canUserEdit ? siteSettings?.site_logo : siteData?.site_logo;
    const _siteIconId = siteSettings?.site_icon;
    const mediaItem = _siteLogoId && select(import_core_data.store).getEntityRecord(
      "postType",
      "attachment",
      _siteLogoId,
      {
        context: "view"
      }
    );
    const _isRequestingMediaItem = !!_siteLogoId && !select(import_core_data.store).hasFinishedResolution("getEntityRecord", [
      "postType",
      "attachment",
      _siteLogoId,
      { context: "view" }
    ]);
    return {
      siteLogoId: _siteLogoId,
      canUserEdit: _canUserEdit,
      url: siteData?.home,
      mediaItemData: mediaItem,
      isRequestingMediaItem: _isRequestingMediaItem,
      siteIconId: _siteIconId
    };
  }, []);
  const { getSettings } = (0, import_data.useSelect)(import_block_editor.store);
  const [temporaryURL, setTemporaryURL] = (0, import_element.useState)();
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const { editEntityRecord } = (0, import_data.useDispatch)(import_core_data.store);
  const setLogo = (newValue, shouldForceSync = false) => {
    if (shouldSyncIcon || shouldForceSync) {
      setIcon(newValue);
    }
    editEntityRecord("root", "site", void 0, {
      site_logo: newValue
    });
  };
  const setIcon = (newValue) => (
    // The new value needs to be `null` to reset the Site Icon.
    editEntityRecord("root", "site", void 0, {
      site_icon: newValue ?? null
    })
  );
  const { alt_text: alt, source_url: logoUrl } = mediaItemData ?? {};
  const onInitialSelectLogo = (media) => {
    if (shouldSyncIcon === void 0) {
      const shouldForceSync = !siteIconId;
      setAttributes({ shouldSyncIcon: shouldForceSync });
      onSelectLogo(media, shouldForceSync);
      return;
    }
    onSelectLogo(media);
  };
  const onSelectLogo = (media, shouldForceSync = false) => {
    if (!media) {
      return;
    }
    if (!media.id && media.url) {
      setTemporaryURL(media.url);
      setLogo(void 0);
      return;
    }
    setLogo(media.id, shouldForceSync);
  };
  const onRemoveLogo = () => {
    setLogo(null);
    setAttributes({ width: void 0 });
  };
  const { createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
  const onUploadError = (message) => {
    createErrorNotice(message, { type: "snackbar" });
    setTemporaryURL();
  };
  const onFilesDrop = (filesList) => {
    getSettings().mediaUpload({
      allowedTypes: ALLOWED_MEDIA_TYPES,
      filesList,
      onFileChange([image]) {
        if ((0, import_blob.isBlobURL)(image?.url)) {
          setTemporaryURL(image.url);
          return;
        }
        onInitialSelectLogo(image);
      },
      onError: onUploadError,
      multiple: false
    });
  };
  const mediaReplaceFlowProps = {
    mediaURL: logoUrl,
    name: !logoUrl ? (0, import_i18n.__)("Choose logo") : (0, import_i18n.__)("Replace"),
    onSelect: onSelectLogo,
    onError: onUploadError,
    onReset: onRemoveLogo
  };
  const controls = canUserEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.MediaReplaceFlow,
    {
      ...mediaReplaceFlowProps,
      allowedTypes: ALLOWED_MEDIA_TYPES,
      variant: "toolbar"
    }
  ) });
  let logoImage;
  const isLoading = siteLogoId === void 0 || isRequestingMediaItem;
  if (isLoading) {
    logoImage = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {});
  }
  (0, import_element.useEffect)(() => {
    if (logoUrl && temporaryURL) {
      setTemporaryURL();
    }
  }, [logoUrl, temporaryURL]);
  if (!!logoUrl || !!temporaryURL) {
    logoImage = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        SiteLogo,
        {
          alt,
          attributes,
          className,
          isSelected,
          setAttributes,
          logoUrl: temporaryURL || logoUrl,
          setLogo,
          logoId: mediaItemData?.id || siteLogoId,
          siteUrl: url,
          setIcon,
          iconId: siteIconId,
          canUserEdit
        }
      ),
      canUserEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.DropZone, { onFilesDrop })
    ] });
  }
  const placeholder = (content) => {
    const placeholderClassName = (0, import_clsx.default)(
      "block-editor-media-placeholder",
      className
    );
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Placeholder,
      {
        className: placeholderClassName,
        preview: logoImage,
        withIllustration: true,
        style: {
          width
        },
        children: content
      }
    );
  };
  const classes = (0, import_clsx.default)(className, {
    "is-default-size": !width,
    "is-transient": temporaryURL
  });
  const blockProps = (0, import_block_editor.useBlockProps)({ className: classes });
  const mediaInspectorPanel = (canUserEdit || logoUrl) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.__experimentalToolsPanel,
    {
      label: (0, import_i18n.__)("Media"),
      dropdownMenuProps,
      children: !canUserEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          className: "block-library-site-logo__inspector-media-replace-container",
          style: { gridColumn: "1 / -1" },
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_media_control.MediaControlPreview,
            {
              url: mediaItemData?.source_url,
              filename: mediaItemData?.media_details?.sizes?.full?.file || mediaItemData?.slug,
              itemGroupProps: {
                isBordered: true,
                className: "block-library-site-logo__inspector-readonly-logo-preview"
              },
              className: "block-library-site-logo__inspector-media-replace-title"
            }
          )
        }
      ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.__experimentalToolsPanelItem,
        {
          hasValue: () => !!logoUrl,
          label: (0, import_i18n.__)("Logo"),
          isShownByDefault: true,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_media_control.MediaControl,
            {
              mediaId: siteLogoId,
              mediaUrl: logoUrl,
              filename: mediaItemData?.media_details?.sizes?.full?.file || mediaItemData?.slug,
              allowedTypes: ALLOWED_MEDIA_TYPES,
              onSelect: onSelectLogo,
              onError: onUploadError,
              onReset: onRemoveLogo,
              isUploading: !!temporaryURL,
              emptyLabel: (0, import_i18n.__)("Logo")
            }
          )
        }
      )
    }
  ) });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
    controls,
    mediaInspectorPanel,
    (!!logoUrl || !!temporaryURL) && logoImage,
    (isLoading || !temporaryURL && !logoUrl && !canUserEdit) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Placeholder, { className: "site-logo_placeholder", withIllustration: true, children: isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "components-placeholder__preview", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {}) }) }),
    !isLoading && !temporaryURL && !logoUrl && canUserEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.MediaPlaceholder,
      {
        onSelect: onInitialSelectLogo,
        allowedTypes: ALLOWED_MEDIA_TYPES,
        onError: onUploadError,
        placeholder,
        mediaLibraryButton: ({ open }) => {
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.Button,
            {
              __next40pxDefaultSize: true,
              icon: import_icons.upload,
              variant: "primary",
              label: (0, import_i18n.__)("Choose logo"),
              showTooltip: true,
              tooltipPosition: "middle right",
              onClick: () => {
                open();
              }
            }
          );
        }
      }
    )
  ] });
}
//# sourceMappingURL=edit.cjs.map
