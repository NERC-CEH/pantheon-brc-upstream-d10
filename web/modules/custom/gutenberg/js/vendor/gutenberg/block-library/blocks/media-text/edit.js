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

// packages/block-library/src/media-text/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_i18n = require("@wordpress/i18n");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_blob = require("@wordpress/blob");
var import_icons = require("@wordpress/icons");
var import_core_data = require("@wordpress/core-data");
var import_media_container = __toESM(require("./media-container.cjs"));
var import_constants = require("./constants.cjs");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var { ResolutionTool } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
var applyWidthConstraints = (width) => Math.max(
  import_constants.WIDTH_CONSTRAINT_PERCENTAGE,
  Math.min(width, 100 - import_constants.WIDTH_CONSTRAINT_PERCENTAGE)
);
function getImageSourceUrlBySizeSlug(image, slug) {
  return image?.media_details?.sizes?.[slug]?.source_url;
}
function attributesFromMedia({
  attributes: { linkDestination, href },
  setAttributes
}) {
  return (media) => {
    if (!media || !media.url) {
      setAttributes({
        mediaAlt: void 0,
        mediaId: void 0,
        mediaType: void 0,
        mediaUrl: void 0,
        mediaLink: void 0,
        href: void 0,
        focalPoint: void 0,
        useFeaturedImage: false
      });
      return;
    }
    if ((0, import_blob.isBlobURL)(media.url)) {
      media.type = (0, import_blob.getBlobTypeByURL)(media.url);
    }
    let mediaType;
    let src;
    if (media.media_type) {
      if (media.media_type === "image") {
        mediaType = "image";
      } else {
        mediaType = "video";
      }
    } else {
      mediaType = media.type;
    }
    if (mediaType === "image") {
      src = media.sizes?.large?.url || media.media_details?.sizes?.large?.source_url;
    }
    let newLinkDestination = linkDestination;
    let newHref = href;
    if (mediaType === "image") {
      if (!newLinkDestination) {
        switch (window?.wp?.media?.view?.settings?.defaultProps?.link || import_constants.LINK_DESTINATION_NONE) {
          case "file":
          case import_constants.LINK_DESTINATION_MEDIA:
            newLinkDestination = import_constants.LINK_DESTINATION_MEDIA;
            break;
          case "post":
          case import_constants.LINK_DESTINATION_ATTACHMENT:
            newLinkDestination = import_constants.LINK_DESTINATION_ATTACHMENT;
            break;
          case import_constants.LINK_DESTINATION_NONE:
          default:
            newLinkDestination = import_constants.LINK_DESTINATION_NONE;
            break;
        }
      }
      switch (newLinkDestination) {
        case import_constants.LINK_DESTINATION_MEDIA:
          newHref = media.url;
          break;
        case import_constants.LINK_DESTINATION_ATTACHMENT:
          newHref = media.link;
          break;
      }
    }
    setAttributes({
      mediaAlt: media.alt,
      mediaId: media.id,
      mediaType,
      mediaUrl: src || media.url,
      mediaLink: media.link || void 0,
      href: newHref,
      linkDestination: newLinkDestination,
      focalPoint: void 0,
      useFeaturedImage: false
    });
  };
}
function MediaTextResolutionTool({ image, value, onChange }) {
  const { imageSizes } = (0, import_data.useSelect)((select) => {
    const { getSettings } = select(import_block_editor.store);
    return {
      imageSizes: getSettings().imageSizes
    };
  }, []);
  if (!imageSizes?.length) {
    return null;
  }
  const imageSizeOptions = imageSizes.filter(({ slug }) => getImageSourceUrlBySizeSlug(image, slug)).map(({ name, slug }) => ({ value: slug, label: name }));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ResolutionTool,
    {
      value,
      defaultValue: import_constants.DEFAULT_MEDIA_SIZE_SLUG,
      options: imageSizeOptions,
      onChange
    }
  );
}
function MediaTextEdit({
  attributes,
  isSelected,
  setAttributes,
  context: { postId, postType }
}) {
  const {
    focalPoint,
    href,
    imageFill,
    isStackedOnMobile,
    linkClass,
    linkDestination,
    linkTarget,
    mediaAlt,
    mediaId,
    mediaPosition,
    mediaType,
    mediaUrl,
    mediaWidth,
    mediaSizeSlug,
    rel,
    verticalAlignment,
    allowedBlocks,
    useFeaturedImage
  } = attributes;
  const [featuredImage] = (0, import_core_data.useEntityProp)(
    "postType",
    postType,
    "featured_media",
    postId
  );
  const { featuredImageMedia } = (0, import_data.useSelect)(
    (select) => {
      return {
        featuredImageMedia: featuredImage && useFeaturedImage ? select(import_core_data.store).getEntityRecord(
          "postType",
          "attachment",
          featuredImage,
          {
            context: "view"
          }
        ) : void 0
      };
    },
    [featuredImage, useFeaturedImage]
  );
  const { image } = (0, import_data.useSelect)(
    (select) => {
      return {
        image: mediaId && isSelected ? select(import_core_data.store).getEntityRecord(
          "postType",
          "attachment",
          mediaId,
          {
            context: "view"
          }
        ) : null
      };
    },
    [isSelected, mediaId]
  );
  const featuredImageURL = useFeaturedImage ? featuredImageMedia?.source_url : "";
  const featuredImageAlt = useFeaturedImage ? featuredImageMedia?.alt_text : "";
  const toggleUseFeaturedImage = () => {
    setAttributes({
      imageFill: false,
      mediaType: "image",
      mediaId: void 0,
      mediaUrl: void 0,
      mediaAlt: void 0,
      mediaLink: void 0,
      linkDestination: void 0,
      linkTarget: void 0,
      linkClass: void 0,
      rel: void 0,
      href: void 0,
      useFeaturedImage: !useFeaturedImage
    });
  };
  const refMedia = (0, import_element.useRef)();
  const imperativeFocalPointPreview = (value) => {
    const { style: style2 } = refMedia.current;
    const { x, y } = value;
    style2.objectPosition = `${x * 100}% ${y * 100}%`;
  };
  const [temporaryMediaWidth, setTemporaryMediaWidth] = (0, import_element.useState)(null);
  const onSelectMedia = attributesFromMedia({ attributes, setAttributes });
  const onSetHref = (props) => {
    setAttributes(props);
  };
  const onWidthChange = (width) => {
    setTemporaryMediaWidth(applyWidthConstraints(width));
  };
  const commitWidthChange = (width) => {
    setAttributes({
      mediaWidth: applyWidthConstraints(width)
    });
    setTemporaryMediaWidth(null);
  };
  const classNames = (0, import_clsx.default)({
    "has-media-on-the-right": "right" === mediaPosition,
    "is-selected": isSelected,
    "is-stacked-on-mobile": isStackedOnMobile,
    [`is-vertically-aligned-${verticalAlignment}`]: verticalAlignment,
    "is-image-fill-element": imageFill
  });
  const widthString = `${temporaryMediaWidth || mediaWidth}%`;
  const gridTemplateColumns = "right" === mediaPosition ? `1fr ${widthString}` : `${widthString} 1fr`;
  const style = {
    gridTemplateColumns,
    msGridColumns: gridTemplateColumns
  };
  const onMediaAltChange = (newMediaAlt) => {
    setAttributes({ mediaAlt: newMediaAlt });
  };
  const onVerticalAlignmentChange = (alignment) => {
    setAttributes({ verticalAlignment: alignment });
  };
  const updateImage = (newMediaSizeSlug) => {
    const newUrl = getImageSourceUrlBySizeSlug(image, newMediaSizeSlug);
    if (!newUrl) {
      return null;
    }
    setAttributes({
      mediaUrl: newUrl,
      mediaSizeSlug: newMediaSizeSlug
    });
  };
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const mediaTextGeneralSettings = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_components.__experimentalToolsPanel,
    {
      label: (0, import_i18n.__)("Settings"),
      resetAll: () => {
        setAttributes({
          isStackedOnMobile: true,
          imageFill: false,
          mediaAlt: "",
          focalPoint: void 0,
          mediaWidth: 50
        });
        updateImage(import_constants.DEFAULT_MEDIA_SIZE_SLUG);
      },
      dropdownMenuProps,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Media width"),
            isShownByDefault: true,
            hasValue: () => mediaWidth !== 50,
            onDeselect: () => setAttributes({ mediaWidth: 50 }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.RangeControl,
              {
                label: (0, import_i18n.__)("Media width"),
                value: temporaryMediaWidth || mediaWidth,
                onChange: commitWidthChange,
                min: import_constants.WIDTH_CONSTRAINT_PERCENTAGE,
                max: 100 - import_constants.WIDTH_CONSTRAINT_PERCENTAGE
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Stack on mobile"),
            isShownByDefault: true,
            hasValue: () => !isStackedOnMobile,
            onDeselect: () => setAttributes({ isStackedOnMobile: true }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Stack on mobile"),
                checked: isStackedOnMobile,
                onChange: () => setAttributes({
                  isStackedOnMobile: !isStackedOnMobile
                })
              }
            )
          }
        ),
        mediaType === "image" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Crop image to fill"),
            isShownByDefault: true,
            hasValue: () => !!imageFill,
            onDeselect: () => setAttributes({ imageFill: false }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Crop image to fill"),
                checked: !!imageFill,
                onChange: () => setAttributes({
                  imageFill: !imageFill
                })
              }
            )
          }
        ),
        imageFill && (mediaUrl || featuredImageURL) && mediaType === "image" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Focal point"),
            isShownByDefault: true,
            hasValue: () => !!focalPoint,
            onDeselect: () => setAttributes({ focalPoint: void 0 }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.FocalPointPicker,
              {
                label: (0, import_i18n.__)("Focal point"),
                url: useFeaturedImage && featuredImageURL ? featuredImageURL : mediaUrl,
                value: focalPoint,
                onChange: (value) => setAttributes({ focalPoint: value }),
                onDragStart: imperativeFocalPointPreview,
                onDrag: imperativeFocalPointPreview
              }
            )
          }
        ),
        mediaType === "image" && mediaUrl && !useFeaturedImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Alternative text"),
            isShownByDefault: true,
            hasValue: () => !!mediaAlt,
            onDeselect: () => setAttributes({ mediaAlt: "" }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.TextareaControl,
              {
                label: (0, import_i18n.__)("Alternative text"),
                value: mediaAlt,
                onChange: onMediaAltChange,
                help: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
            )
          }
        ),
        mediaType === "image" && !useFeaturedImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          MediaTextResolutionTool,
          {
            image,
            value: mediaSizeSlug,
            onChange: updateImage
          }
        )
      ]
    }
  );
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: classNames,
    style
  });
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(
    { className: "wp-block-media-text__content" },
    { allowedBlocks }
  );
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: mediaTextGeneralSettings }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_block_editor.BlockControls, { group: "block", children: [
      blockEditingMode === "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_block_editor.BlockVerticalAlignmentControl,
          {
            onChange: onVerticalAlignmentChange,
            value: verticalAlignment,
            label: (0, import_i18n.__)("Align media and text vertically")
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.ToolbarButton,
          {
            icon: import_icons.pullLeft,
            title: (0, import_i18n.__)("Show media on left"),
            isActive: mediaPosition === "left",
            onClick: () => setAttributes({ mediaPosition: "left" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.ToolbarButton,
          {
            icon: import_icons.pullRight,
            title: (0, import_i18n.__)("Show media on right"),
            isActive: mediaPosition === "right",
            onClick: () => setAttributes({ mediaPosition: "right" })
          }
        )
      ] }),
      mediaType === "image" && !useFeaturedImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.__experimentalImageURLInputUI,
        {
          url: href || "",
          onChangeUrl: onSetHref,
          linkDestination,
          mediaType,
          mediaUrl: image && image.source_url,
          mediaLink: image && image.link,
          linkTarget,
          linkClass,
          rel
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
      mediaPosition === "right" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...innerBlocksProps }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_media_container.default,
        {
          className: "wp-block-media-text__media",
          onSelectMedia,
          onWidthChange,
          commitWidthChange,
          refMedia,
          enableResize: blockEditingMode === "default",
          toggleUseFeaturedImage,
          ...{
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
            useFeaturedImage,
            featuredImageURL,
            featuredImageAlt
          }
        }
      ),
      mediaPosition !== "right" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...innerBlocksProps })
    ] })
  ] });
}
var edit_default = MediaTextEdit;
//# sourceMappingURL=edit.cjs.map
