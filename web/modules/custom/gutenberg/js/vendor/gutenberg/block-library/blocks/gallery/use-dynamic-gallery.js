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

// packages/block-library/src/gallery/use-dynamic-gallery.js
var use_dynamic_gallery_exports = {};
__export(use_dynamic_gallery_exports, {
  default: () => useDynamicGallery
});
module.exports = __toCommonJS(use_dynamic_gallery_exports);
var import_element = require("@wordpress/element");
var import_data = require("@wordpress/data");
var import_block_editor = require("@wordpress/block-editor");
var import_core_data = require("@wordpress/core-data");
var import_blocks = require("@wordpress/blocks");
var import_shared = require("./shared.cjs");
var import_utils = require("./utils.cjs");
var import_utils2 = require("../image/utils.cjs");
var import_dynamic_source = require("./dynamic-source.cjs");
var EMPTY_ARRAY = [];
function buildImageBlockAttributes(media, galleryAttributes) {
  const { sizeSlug, linkTo, linkTarget, aspectRatio } = galleryAttributes;
  const hasAspectRatio = !!aspectRatio && aspectRatio !== "auto";
  return {
    id: media.id,
    ...(0, import_shared.pickRelevantMediaFiles)(media, sizeSlug),
    ...(0, import_utils.getHrefAndDestination)(media, linkTo),
    ...(0, import_utils2.getUpdatedLinkTargetSettings)(linkTarget, galleryAttributes),
    sizeSlug,
    // Raw caption, mirroring the frontend (`index.php`). Gap: the REST API
    // exposes no caption run through `wp_get_attachment_caption`, so neither
    // side applies that filter.
    caption: media.caption?.raw || "",
    alt: media.alt_text || "",
    aspectRatio: hasAspectRatio ? aspectRatio : void 0,
    // Pair `scale` with `aspectRatio` so the image crops rather than stretches,
    // matching the image block's UI and the frontend (`index.php`).
    scale: hasAspectRatio ? "cover" : void 0
  };
}
function buildImageBlocks(media, galleryAttributes) {
  return media.map(
    (mediaItem) => (0, import_blocks.createBlock)(
      "core/image",
      buildImageBlockAttributes(mediaItem, galleryAttributes)
    )
  );
}
function useDynamicGallery({
  attributes,
  setAttributes,
  clientId,
  postId,
  postType
}) {
  const { dynamicContent } = attributes;
  const canUseDynamicSource = !!postType;
  const sourceDescriptor = (0, import_dynamic_source.getDynamicSource)(dynamicContent?.source);
  const sourceOrderby = dynamicContent?.args?.orderBy ?? import_dynamic_source.DEFAULT_ORDERBY;
  const sourceOrder = dynamicContent?.args?.order ?? import_dynamic_source.DEFAULT_ORDER;
  const registry = (0, import_data.useRegistry)();
  const { replaceInnerBlocks, __unstableMarkNextChangeAsNotPersistent } = (0, import_data.useDispatch)(import_block_editor.store);
  const query = (0, import_element.useMemo)(
    () => dynamicContent ? (0, import_dynamic_source.getSourceQuery)(dynamicContent, { postId }) : null,
    [dynamicContent, postId]
  );
  const { dynamicMedia, dynamicMediaTotal, isResolvingDynamic } = (0, import_data.useSelect)(
    (select) => {
      if (!query) {
        return {
          dynamicMedia: EMPTY_ARRAY,
          dynamicMediaTotal: 0,
          isResolvingDynamic: false
        };
      }
      const selectorArgs = ["postType", "attachment", query];
      return {
        dynamicMedia: select(import_core_data.store).getEntityRecords(...selectorArgs) ?? EMPTY_ARRAY,
        // Total matching attachments (the `X-WP-Total` header), which the
        // query's `per_page` cap doesn't bound — so it reveals when the
        // post has more attached images than are shown.
        dynamicMediaTotal: select(import_core_data.store).getEntityRecordsTotalItems(
          ...selectorArgs
        ) ?? 0,
        isResolvingDynamic: !select(import_core_data.store).hasFinishedResolution(
          "getEntityRecords",
          selectorArgs
        )
      };
    },
    [query]
  );
  const hasMoreImagesThanCap = dynamicMediaTotal > import_dynamic_source.MAX_IMAGES;
  const { sizeSlug, linkTo, linkTarget, aspectRatio } = attributes;
  const imageAttributes = (0, import_element.useMemo)(
    () => ({ sizeSlug, linkTo, linkTarget, aspectRatio }),
    [sizeSlug, linkTo, linkTarget, aspectRatio]
  );
  const dynamicImageBlocks = (0, import_element.useMemo)(
    () => buildImageBlocks(dynamicMedia, imageAttributes),
    [dynamicMedia, imageAttributes]
  );
  const galleryContext = (0, import_element.useMemo)(
    () => ({
      allowResize: attributes.allowResize ?? false,
      imageCrop: attributes.imageCrop,
      fixedHeight: attributes.fixedHeight,
      navigationButtonType: attributes.navigationButtonType
    }),
    [
      attributes.allowResize,
      attributes.imageCrop,
      attributes.fixedHeight,
      attributes.navigationButtonType
    ]
  );
  function enableDynamicMode() {
    registry.batch(() => {
      setAttributes({ dynamicContent: { source: import_dynamic_source.ATTACHED_MEDIA } });
      __unstableMarkNextChangeAsNotPersistent();
      replaceInnerBlocks(clientId, []);
    });
  }
  function convertToStatic() {
    registry.batch(() => {
      replaceInnerBlocks(
        clientId,
        buildImageBlocks(dynamicMedia, imageAttributes)
      );
      __unstableMarkNextChangeAsNotPersistent();
      setAttributes({ dynamicContent: void 0 });
    });
  }
  function setSourceOrder(nextOrderby, nextOrder) {
    const nextArgs = { ...dynamicContent?.args };
    delete nextArgs.orderBy;
    delete nextArgs.order;
    if (nextOrderby !== void 0 && (nextOrderby !== import_dynamic_source.DEFAULT_ORDERBY || nextOrder !== import_dynamic_source.DEFAULT_ORDER)) {
      nextArgs.orderBy = nextOrderby;
      nextArgs.order = nextOrder;
    }
    const nextSource = { ...dynamicContent };
    if (Object.keys(nextArgs).length) {
      nextSource.args = nextArgs;
    } else {
      delete nextSource.args;
    }
    setAttributes({ dynamicContent: nextSource });
  }
  function resetSource() {
    setAttributes({
      dynamicContent: { source: dynamicContent.source }
    });
  }
  return {
    dynamicContent,
    canUseDynamicSource,
    sourceDescriptor,
    hasMoreImagesThanCap,
    dynamicMediaTotal,
    sourceOrderby,
    sourceOrder,
    dynamicMedia,
    dynamicImageBlocks,
    isResolvingDynamic,
    galleryContext,
    enableDynamicMode,
    convertToStatic,
    setSourceOrder,
    resetSource
  };
}
//# sourceMappingURL=use-dynamic-gallery.cjs.map
