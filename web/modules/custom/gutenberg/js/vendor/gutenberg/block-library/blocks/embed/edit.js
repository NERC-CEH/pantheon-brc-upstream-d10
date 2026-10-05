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

// packages/block-library/src/embed/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_i18n = require("@wordpress/i18n");
var import_element = require("@wordpress/element");
var import_data = require("@wordpress/data");
var import_block_editor = require("@wordpress/block-editor");
var import_core_data = require("@wordpress/core-data");
var import_caption = require("../utils/caption.cjs");
var import_util = require("./util.cjs");
var import_embed_controls = __toESM(require("./embed-controls.cjs"));
var import_icons = require("./icons.cjs");
var import_embed_loading = __toESM(require("./embed-loading.cjs"));
var import_embed_placeholder = __toESM(require("./embed-placeholder.cjs"));
var import_embed_preview = __toESM(require("./embed-preview.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var EmbedEdit = (props) => {
  const {
    attributes: {
      providerNameSlug,
      previewable,
      responsive,
      url: attributesUrl
    },
    attributes,
    isSelected,
    onReplace,
    setAttributes,
    insertBlocksAfter,
    onFocus
  } = props;
  const defaultEmbedInfo = {
    title: (0, import_i18n._x)("Embed", "block title"),
    icon: import_icons.embedContentIcon
  };
  const { icon, title } = (0, import_util.getEmbedInfoByProvider)(providerNameSlug) || defaultEmbedInfo;
  const [url, setURL] = (0, import_element.useState)(attributesUrl);
  const [isEditingURL, setIsEditingURL] = (0, import_element.useState)(false);
  const { invalidateResolution } = (0, import_data.useDispatch)(import_core_data.store);
  const { __unstableMarkNextChangeAsNotPersistent } = (0, import_data.useDispatch)(import_block_editor.store);
  const {
    preview,
    fetching,
    themeSupportsResponsive,
    cannotEmbed,
    hasResolved
  } = (0, import_data.useSelect)(
    (select) => {
      const {
        getEmbedPreview,
        isPreviewEmbedFallback,
        isRequestingEmbedPreview,
        getThemeSupports,
        hasFinishedResolution
      } = select(import_core_data.store);
      if (!attributesUrl) {
        return { fetching: false, cannotEmbed: false };
      }
      const embedPreview = getEmbedPreview(attributesUrl);
      const previewIsFallback = isPreviewEmbedFallback(attributesUrl);
      const badEmbedProvider = embedPreview?.html === false && embedPreview?.type === void 0;
      const wordpressCantEmbed = embedPreview?.data?.status === 404;
      const validPreview = !!embedPreview && !badEmbedProvider && !wordpressCantEmbed;
      return {
        preview: validPreview ? embedPreview : void 0,
        fetching: isRequestingEmbedPreview(attributesUrl),
        themeSupportsResponsive: getThemeSupports()["responsive-embeds"],
        cannotEmbed: !validPreview || previewIsFallback,
        hasResolved: hasFinishedResolution("getEmbedPreview", [
          attributesUrl
        ])
      };
    },
    [attributesUrl]
  );
  const getMergedAttributes = () => (0, import_util.getMergedAttributesWithPreview)(
    attributes,
    preview,
    title,
    responsive
  );
  function toggleResponsive(newAllowResponsive) {
    const { className: className2 } = attributes;
    const { html } = preview;
    setAttributes({
      allowResponsive: newAllowResponsive,
      className: (0, import_util.getClassNames)(
        html,
        className2,
        responsive && newAllowResponsive
      )
    });
  }
  (0, import_element.useEffect)(() => {
    if (!cannotEmbed || !hasResolved || !attributesUrl) {
      return;
    }
    const newURL = attributesUrl.replace(/\/$/, "");
    if (newURL === attributesUrl) {
      return;
    }
    setURL(newURL);
    setIsEditingURL(false);
    __unstableMarkNextChangeAsNotPersistent();
    setAttributes({ url: newURL });
  }, [
    attributesUrl,
    cannotEmbed,
    hasResolved,
    setAttributes,
    __unstableMarkNextChangeAsNotPersistent
  ]);
  (0, import_element.useEffect)(() => {
    if (!preview || isEditingURL) {
      return;
    }
    const mergedAttributes = getMergedAttributes();
    if (onReplace) {
      const upgradedBlock = (0, import_util.createUpgradedEmbedBlock)(
        props,
        mergedAttributes
      );
      if (upgradedBlock) {
        __unstableMarkNextChangeAsNotPersistent();
        setAttributes(upgradedBlock.attributes);
        return;
      }
    }
    const hasChanges = Object.keys(mergedAttributes).some(
      (key) => mergedAttributes[key] !== attributes[key]
    );
    if (hasChanges) {
      __unstableMarkNextChangeAsNotPersistent();
      setAttributes(mergedAttributes);
    }
  }, [preview, isEditingURL]);
  const blockProps = (0, import_block_editor.useBlockProps)();
  if (fetching) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_embed_loading.default, {}) });
  }
  const label = (0, import_i18n.sprintf)((0, import_i18n.__)("%s URL"), title);
  const showEmbedPlaceholder = !preview || cannotEmbed || isEditingURL;
  if (showEmbedPlaceholder) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_embed_placeholder.default,
      {
        icon,
        label,
        onFocus,
        onSubmit: (event) => {
          if (event) {
            event.preventDefault();
          }
          const rewrittenURL = (0, import_util.rewriteXToTwitter)(url);
          const blockClass = (0, import_util.removeAspectRatioClasses)(
            attributes.className
          );
          setURL(rewrittenURL);
          setAttributes({
            url: rewrittenURL,
            ...(0, import_util.findMoreSuitableBlock)(rewrittenURL)?.attributes,
            className: blockClass
          });
          setIsEditingURL(false);
        },
        value: url,
        cannotEmbed,
        onChange: (value) => setURL(value),
        fallback: onReplace ? () => (0, import_util.fallback)(url, onReplace) : void 0,
        tryAgain: () => {
          invalidateResolution("getEmbedPreview", [url]);
        }
      }
    ) });
  }
  const {
    caption,
    type,
    allowResponsive,
    className: classFromPreview
  } = getMergedAttributes();
  const className = (0, import_clsx.default)(classFromPreview, props.className);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_embed_controls.default,
      {
        showEditButton: preview && !cannotEmbed,
        themeSupportsResponsive,
        blockSupportsResponsive: responsive,
        allowResponsive,
        toggleResponsive,
        switchBackToURLInput: () => setIsEditingURL(true)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "figure",
      {
        ...blockProps,
        className: (0, import_clsx.default)(blockProps.className, className, {
          [`is-type-${type}`]: type,
          [`is-provider-${providerNameSlug}`]: providerNameSlug,
          [`wp-block-embed-${providerNameSlug}`]: providerNameSlug
        }),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_embed_preview.default,
            {
              preview,
              previewable,
              className,
              url,
              type,
              caption,
              onCaptionChange: (value) => setAttributes({ caption: value }),
              isSelected,
              icon,
              label,
              insertBlocksAfter,
              attributes,
              setAttributes
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_caption.Caption,
            {
              attributes,
              setAttributes,
              isSelected,
              insertBlocksAfter,
              label: (0, import_i18n.__)("Embed caption text"),
              showToolbarButton: isSelected
            }
          )
        ]
      }
    )
  ] });
};
var edit_default = EmbedEdit;
//# sourceMappingURL=edit.cjs.map
