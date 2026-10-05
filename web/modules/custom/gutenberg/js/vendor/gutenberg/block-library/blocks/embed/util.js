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

// packages/block-library/src/embed/util.jsx
var util_exports = {};
__export(util_exports, {
  createUpgradedEmbedBlock: () => createUpgradedEmbedBlock,
  fallback: () => fallback,
  findMoreSuitableBlock: () => findMoreSuitableBlock,
  getAttributesFromPreview: () => getAttributesFromPreview,
  getClassNames: () => getClassNames,
  getEmbedInfoByProvider: () => getEmbedInfoByProvider,
  getMergedAttributesWithPreview: () => getMergedAttributesWithPreview,
  getPhotoHtml: () => getPhotoHtml,
  hasAspectRatioClass: () => hasAspectRatioClass,
  hasInlineResponsivePadding: () => hasInlineResponsivePadding,
  isFromWordPress: () => isFromWordPress,
  matchesPatterns: () => matchesPatterns,
  removeAspectRatioClasses: () => removeAspectRatioClasses,
  rewriteXToTwitter: () => rewriteXToTwitter
});
module.exports = __toCommonJS(util_exports);
var import_clsx = __toESM(require("clsx"));
var import_memize = __toESM(require("memize"));
var import_element = require("@wordpress/element");
var import_blocks = require("@wordpress/blocks");
var import_url = require("@wordpress/url");
var import_kebab_case = require("@wordpress/kebab-case");
var import_block = __toESM(require("./block.json"));
var import_constants = require("./constants.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var { name: DEFAULT_EMBED_BLOCK } = import_block.default;
var getEmbedInfoByProvider = (provider) => (0, import_blocks.getBlockVariations)(DEFAULT_EMBED_BLOCK)?.find(
  ({ name }) => name === provider
);
var matchesPatterns = (url, patterns = []) => patterns.some((pattern) => url.match(pattern));
var findMoreSuitableBlock = (url) => (0, import_blocks.getBlockVariations)(DEFAULT_EMBED_BLOCK)?.find(
  ({ patterns }) => matchesPatterns(url, patterns)
);
function rewriteXToTwitter(url) {
  if (!url || (0, import_url.getAuthority)(url) !== "x.com") {
    return url;
  }
  const rewritten = new URL(url);
  rewritten.host = "twitter.com";
  return rewritten.toString();
}
var isFromWordPress = (html) => html && html.includes('class="wp-embedded-content"');
var getPhotoHtml = (photo) => {
  const imageUrl = photo.url || photo.thumbnail_url;
  const photoPreview = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: imageUrl, alt: photo.title, width: "100%" }) });
  return (0, import_element.renderToString)(photoPreview);
};
var createUpgradedEmbedBlock = (props, attributesFromPreview = {}) => {
  const { preview, attributes = {} } = props;
  const { url, providerNameSlug, type, ...restAttributes } = attributes;
  if (!url || !(0, import_blocks.getBlockType)(DEFAULT_EMBED_BLOCK)) {
    return;
  }
  const matchedBlock = findMoreSuitableBlock(url);
  const isCurrentBlockWP = providerNameSlug === "wordpress" || type === import_constants.WP_EMBED_TYPE;
  const shouldCreateNewBlock = !isCurrentBlockWP && matchedBlock && (matchedBlock.attributes.providerNameSlug !== providerNameSlug || !providerNameSlug);
  if (shouldCreateNewBlock) {
    return (0, import_blocks.createBlock)(DEFAULT_EMBED_BLOCK, {
      url,
      ...restAttributes,
      ...matchedBlock.attributes
    });
  }
  const wpVariation = (0, import_blocks.getBlockVariations)(DEFAULT_EMBED_BLOCK)?.find(
    ({ name }) => name === "wordpress"
  );
  if (!wpVariation || !preview || !isFromWordPress(preview.html) || isCurrentBlockWP) {
    return;
  }
  return (0, import_blocks.createBlock)(DEFAULT_EMBED_BLOCK, {
    url,
    ...wpVariation.attributes,
    // By now we have the preview, but when the new block first renders, it
    // won't have had all the attributes set, and so won't get the correct
    // type and it won't render correctly. So, we pass through the current attributes
    // here so that the initial render works when we switch to the WordPress
    // block. This only affects the WordPress block because it can't be
    // rendered in the usual Sandbox (it has a sandbox of its own) and it
    // relies on the preview to set the correct render type.
    ...attributesFromPreview
  });
};
var hasAspectRatioClass = (existingClassNames) => {
  if (!existingClassNames) {
    return false;
  }
  return import_constants.ASPECT_RATIOS.some(
    ({ className }) => existingClassNames.includes(className)
  );
};
var removeAspectRatioClasses = (existingClassNames) => {
  if (!existingClassNames) {
    return existingClassNames;
  }
  const aspectRatioClassNames = import_constants.ASPECT_RATIOS.reduce(
    (accumulator, { className }) => {
      accumulator.push(className);
      return accumulator;
    },
    ["wp-has-aspect-ratio"]
  );
  let outputClassNames = existingClassNames;
  for (const className of aspectRatioClassNames) {
    outputClassNames = outputClassNames.replace(className, "");
  }
  return outputClassNames.trim();
};
function hasInlineResponsivePadding(html) {
  const paddingPattern = /padding-(top|bottom)\s*:\s*[\d.]+%/i;
  return paddingPattern.test(html);
}
function getClassNames(html, existingClassNames, allowResponsive = true) {
  if (!allowResponsive) {
    return removeAspectRatioClasses(existingClassNames);
  }
  if (hasInlineResponsivePadding(html)) {
    return removeAspectRatioClasses(existingClassNames);
  }
  const previewDocument = document.implementation.createHTMLDocument("");
  previewDocument.body.innerHTML = html;
  const iframe = previewDocument.body.querySelector("iframe");
  if (iframe && iframe.height && iframe.width) {
    const aspectRatio = (iframe.width / iframe.height).toFixed(2);
    for (let ratioIndex = 0; ratioIndex < import_constants.ASPECT_RATIOS.length; ratioIndex++) {
      const potentialRatio = import_constants.ASPECT_RATIOS[ratioIndex];
      if (aspectRatio >= potentialRatio.ratio) {
        const ratioDiff = aspectRatio - potentialRatio.ratio;
        if (ratioDiff > 0.1) {
          return removeAspectRatioClasses(existingClassNames);
        }
        return (0, import_clsx.default)(
          removeAspectRatioClasses(existingClassNames),
          potentialRatio.className,
          "wp-has-aspect-ratio"
        );
      }
    }
  }
  return existingClassNames;
}
function fallback(url, onReplace) {
  const link = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: url, children: url });
  onReplace(
    (0, import_blocks.createBlock)("core/paragraph", { content: (0, import_element.renderToString)(link) })
  );
}
var getAttributesFromPreview = (0, import_memize.default)(
  (preview, title, currentClassNames, isResponsive, allowResponsive = true) => {
    if (!preview) {
      return {};
    }
    const attributes = {};
    let { type = "rich" } = preview;
    const { html, provider_name: providerName } = preview;
    const providerNameSlug = (0, import_kebab_case.kebabCase)(
      (providerName || title).toLowerCase()
    );
    if (isFromWordPress(html)) {
      type = import_constants.WP_EMBED_TYPE;
    }
    if (html || "photo" === type) {
      attributes.type = type;
      attributes.providerNameSlug = providerNameSlug;
    }
    if (hasAspectRatioClass(currentClassNames)) {
      return attributes;
    }
    attributes.className = getClassNames(
      html,
      currentClassNames,
      isResponsive && allowResponsive
    );
    return attributes;
  }
);
var getMergedAttributesWithPreview = (currentAttributes, preview, title, isResponsive) => {
  const { allowResponsive, className } = currentAttributes;
  return {
    ...currentAttributes,
    ...getAttributesFromPreview(
      preview,
      title,
      className,
      isResponsive,
      allowResponsive
    )
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createUpgradedEmbedBlock,
  fallback,
  findMoreSuitableBlock,
  getAttributesFromPreview,
  getClassNames,
  getEmbedInfoByProvider,
  getMergedAttributesWithPreview,
  getPhotoHtml,
  hasAspectRatioClass,
  hasInlineResponsivePadding,
  isFromWordPress,
  matchesPatterns,
  removeAspectRatioClasses,
  rewriteXToTwitter
});
//# sourceMappingURL=util.cjs.map
