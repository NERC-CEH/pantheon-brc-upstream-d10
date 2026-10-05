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

// packages/block-library/src/post-featured-image/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => PostFeaturedImageEdit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_blob = require("@wordpress/blob");
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_element = require("@wordpress/element");
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var import_notices = require("@wordpress/notices");
var import_dimension_controls = __toESM(require("./dimension-controls.cjs"));
var import_overlay_controls = __toESM(require("./overlay-controls.cjs"));
var import_overlay = __toESM(require("./overlay.cjs"));
var import_hooks = require("../utils/hooks.cjs");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_style_state = require("../utils/style-state.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var ALLOWED_MEDIA_TYPES = ["image"];
var { isDefaultBlockStyleState, ResolutionTool } = (0, import_lock_unlock.unlock)(
  import_block_editor.privateApis
);
var hasDimensionValue = (value) => value !== void 0 && value !== null && value !== "";
var DEFAULT_MEDIA_SIZE_SLUG = "full";
function FeaturedImageResolutionTool({ image, value, onChange }) {
  const { imageSizes } = (0, import_data.useSelect)((select) => {
    const { getSettings } = select(import_block_editor.store);
    return {
      imageSizes: getSettings().imageSizes
    };
  }, []);
  if (!imageSizes?.length) {
    return null;
  }
  const imageSizeOptions = imageSizes.filter(
    ({ slug }) => image?.media_details?.sizes?.[slug]?.source_url
  ).map(({ name, slug }) => ({ value: slug, label: name }));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ResolutionTool,
    {
      value,
      defaultValue: DEFAULT_MEDIA_SIZE_SLUG,
      options: imageSizeOptions,
      onChange
    }
  );
}
function PostFeaturedImageEdit({
  clientId,
  attributes,
  setAttributes,
  context: { postId, postType: postTypeSlug, queryId }
}) {
  const isDescendentOfQueryLoop = Number.isFinite(queryId);
  const {
    isLink,
    aspectRatio,
    height,
    width,
    scale,
    sizeSlug,
    rel,
    linkTarget,
    useFirstImageFromPost
  } = attributes;
  const [temporaryURL, setTemporaryURL] = (0, import_element.useState)();
  const [storedFeaturedImage, setFeaturedImage] = (0, import_core_data.useEntityProp)(
    "postType",
    postTypeSlug,
    "featured_media",
    postId
  );
  const [postContent] = (0, import_core_data.useEntityProp)(
    "postType",
    postTypeSlug,
    "content",
    postId
  );
  const featuredImage = (0, import_element.useMemo)(() => {
    if (storedFeaturedImage) {
      return storedFeaturedImage;
    }
    if (!useFirstImageFromPost) {
      return;
    }
    const imageOpener = /<!--\s+wp:(?:core\/)?image\s+(?<attrs>{(?:(?:[^}]+|}+(?=})|(?!}\s+\/?-->).)*)?}\s+)?-->/.exec(
      postContent
    );
    const imageId = imageOpener?.groups?.attrs && JSON.parse(imageOpener.groups.attrs)?.id;
    return imageId;
  }, [storedFeaturedImage, useFirstImageFromPost, postContent]);
  const { media, postType, postPermalink, selectedStyleState } = (0, import_data.useSelect)(
    (select) => {
      const { getEntityRecord, getPostType, getEditedEntityRecord } = select(import_core_data.store);
      const { getSelectedBlockStyleState } = (0, import_lock_unlock.unlock)(
        select(import_block_editor.store)
      );
      return {
        media: featuredImage && getEntityRecord("postType", "attachment", featuredImage, {
          context: "view"
        }),
        postType: postTypeSlug && getPostType(postTypeSlug),
        postPermalink: getEditedEntityRecord(
          "postType",
          postTypeSlug,
          postId
        )?.link,
        selectedStyleState: getSelectedBlockStyleState(clientId)
      };
    },
    [clientId, featuredImage, postTypeSlug, postId]
  );
  const hasSelectedStyleState = !isDefaultBlockStyleState(selectedStyleState);
  const mediaUrl = media?.media_details?.sizes?.[sizeSlug]?.source_url || media?.source_url;
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: (0, import_clsx.default)({
      "is-transient": temporaryURL
    })
  });
  const borderProps = (0, import_block_editor.__experimentalUseBorderProps)(attributes);
  const shadowProps = (0, import_block_editor.__experimentalGetShadowClassesAndStyles)(attributes);
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  const aspectRatioStyle = aspectRatio === "auto" ? void 0 : aspectRatio;
  const placeholder = (content) => {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Placeholder,
      {
        className: (0, import_clsx.default)(
          "block-editor-media-placeholder",
          borderProps.className
        ),
        withIllustration: true,
        style: {
          aspectRatio: aspectRatioStyle,
          height: hasDimensionValue(height) ? height : hasDimensionValue(width) && "auto",
          width: hasDimensionValue(width) ? width : !!aspectRatio && "100%",
          ...borderProps.style,
          ...shadowProps.style
        },
        children: content
      }
    );
  };
  const onSelectImage = (value) => {
    if (value?.id) {
      setFeaturedImage(value.id);
    }
    if (value?.url && (0, import_blob.isBlobURL)(value.url)) {
      setTemporaryURL(value.url);
    }
  };
  const onResetImage = () => {
    setAttributes({
      isLink: false,
      linkTarget: "_self",
      rel: "",
      sizeSlug: void 0
    });
    setFeaturedImage(0);
  };
  (0, import_element.useEffect)(() => {
    if (mediaUrl && temporaryURL) {
      setTemporaryURL();
    }
  }, [mediaUrl, temporaryURL]);
  const { createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
  const onUploadError = (message) => {
    createErrorNotice(message, { type: "snackbar" });
    setTemporaryURL();
  };
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const controls = blockEditingMode === "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "color", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_overlay_controls.default,
      {
        attributes,
        setAttributes,
        clientId
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
              height: void 0,
              scale: void 0,
              width: void 0
            }
          });
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_dimension_controls.default,
          {
            clientId,
            attributes,
            setAttributes,
            media,
            selectedStyleState,
            hasSelectedStyleState
          }
        )
      }
    ),
    (featuredImage || isDescendentOfQueryLoop || !postId) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            isLink: false,
            linkTarget: "_self",
            rel: "",
            sizeSlug: DEFAULT_MEDIA_SIZE_SLUG
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: postType?.labels?.singular_name ? (0, import_i18n.sprintf)(
                // translators: %s: Name of the post type e.g: "post".
                (0, import_i18n.__)("Link to %s"),
                postType.labels.singular_name
              ) : (0, import_i18n.__)("Link to post"),
              isShownByDefault: true,
              hasValue: () => !!isLink,
              onDeselect: () => setAttributes({
                isLink: false
              }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Make image a link"),
                  onChange: () => setAttributes({ isLink: !isLink }),
                  checked: isLink
                }
              )
            }
          ),
          isLink && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Open in new tab"),
              isShownByDefault: true,
              hasValue: () => "_self" !== linkTarget,
              onDeselect: () => setAttributes({
                linkTarget: "_self"
              }),
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
          isLink && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Link relation"),
              isShownByDefault: true,
              hasValue: () => !!rel,
              onDeselect: () => setAttributes({
                rel: ""
              }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.TextControl,
                {
                  label: (0, import_i18n.__)("Link relation"),
                  help: (0, import_element.createInterpolateElement)(
                    (0, import_i18n.__)(
                      "The <a>Link Relation</a> attribute defines the relationship between a linked resource and the current document."
                    ),
                    {
                      a: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ExternalLink, { href: "https://developer.mozilla.org/docs/Web/HTML/Attributes/rel" })
                    }
                  ),
                  value: rel,
                  onChange: (newRel) => setAttributes({ rel: newRel })
                }
              )
            }
          ),
          !!media && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            FeaturedImageResolutionTool,
            {
              image: media,
              value: sizeSlug,
              onChange: (nextSizeSlug) => setAttributes({ sizeSlug: nextSizeSlug })
            }
          )
        ]
      }
    ) })
  ] });
  let image;
  if (!featuredImage && (isDescendentOfQueryLoop || !postId)) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      controls,
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
        !!isLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: postPermalink, target: linkTarget, children: placeholder() }) : placeholder(),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_overlay.default,
          {
            attributes,
            setAttributes,
            clientId
          }
        )
      ] })
    ] });
  }
  const label = (0, import_i18n.__)("Add a featured image");
  const imageStyles = {
    ...borderProps.style,
    ...shadowProps.style,
    aspectRatio: aspectRatioStyle,
    height: hasDimensionValue(height) ? height : hasDimensionValue(width) && "auto",
    width: hasDimensionValue(width) ? width : !!aspectRatio && "100%",
    objectFit: !!(height || aspectRatio) && scale
  };
  if (!featuredImage && !temporaryURL) {
    image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.MediaPlaceholder,
      {
        onSelect: onSelectImage,
        accept: "image/*",
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
              label,
              showTooltip: true,
              tooltipPosition: "top center",
              onClick: () => {
                open();
              }
            }
          );
        }
      }
    );
  } else {
    image = !media && !temporaryURL ? placeholder() : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          className: borderProps.className,
          src: temporaryURL || mediaUrl,
          alt: media && media?.alt_text ? (0, import_i18n.sprintf)(
            // translators: %s: The image's alt text.
            (0, import_i18n.__)("Featured image: %s"),
            media.alt_text
          ) : (0, import_i18n.__)("Featured image"),
          style: imageStyles
        }
      ),
      temporaryURL && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {})
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    !temporaryURL && controls,
    !!media && !isDescendentOfQueryLoop && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.MediaReplaceFlow,
      {
        mediaId: featuredImage,
        mediaURL: mediaUrl,
        allowedTypes: ALLOWED_MEDIA_TYPES,
        accept: "image/*",
        onSelect: onSelectImage,
        onError: onUploadError,
        onReset: onResetImage
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...blockProps, children: [
      !!isLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: postPermalink, target: linkTarget, children: image }) : image,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_overlay.default,
        {
          attributes,
          setAttributes,
          clientId
        }
      )
    ] })
  ] });
}
//# sourceMappingURL=edit.cjs.map
