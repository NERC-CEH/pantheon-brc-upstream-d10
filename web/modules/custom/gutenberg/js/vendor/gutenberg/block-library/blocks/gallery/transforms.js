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

// packages/block-library/src/gallery/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blocks = require("@wordpress/blocks");
var import_blob = require("@wordpress/blob");
var import_hooks = require("@wordpress/hooks");
var import_constants = require("./constants.cjs");
var import_shared = require("./shared.cjs");
var parseShortcodeIds = (ids) => {
  if (!ids) {
    return [];
  }
  return ids.split(",").map((id) => parseInt(id, 10));
};
var cloneInnerBlocks = (innerBlocks) => innerBlocks.map(
  (innerBlock) => (0, import_blocks.createBlock)(
    innerBlock.name,
    innerBlock.attributes,
    cloneInnerBlocks(innerBlock.innerBlocks || [])
  )
);
function updateThirdPartyTransformToGallery(block) {
  if (block.name === "core/gallery" && block.attributes?.images.length > 0) {
    const innerBlocks = block.attributes.images.map(
      ({ url, id, alt }) => {
        return (0, import_blocks.createBlock)("core/image", {
          url,
          id: id ? parseInt(id, 10) : null,
          alt,
          sizeSlug: block.attributes.sizeSlug,
          linkDestination: block.attributes.linkDestination
        });
      }
    );
    delete block.attributes.ids;
    delete block.attributes.images;
    block.innerBlocks = innerBlocks;
  }
  return block;
}
(0, import_hooks.addFilter)(
  "blocks.switchToBlockType.transformedBlock",
  "core/gallery/update-third-party-transform-to",
  updateThirdPartyTransformToGallery
);
function updateThirdPartyTransformFromGallery(toBlock, fromBlocks) {
  const from = Array.isArray(fromBlocks) ? fromBlocks : [fromBlocks];
  const galleryBlock = from.find(
    (transformedBlock) => transformedBlock.name === "core/gallery" && transformedBlock.innerBlocks.length > 0 && !transformedBlock.attributes.images?.length > 0 && !toBlock.name.includes("core/")
  );
  if (galleryBlock) {
    const images = galleryBlock.innerBlocks.map(
      ({ attributes: { url, id, alt } }) => ({
        url,
        id: id ? parseInt(id, 10) : null,
        alt
      })
    );
    const ids = images.map(({ id }) => id);
    galleryBlock.attributes.images = images;
    galleryBlock.attributes.ids = ids;
  }
  return toBlock;
}
(0, import_hooks.addFilter)(
  "blocks.switchToBlockType.transformedBlock",
  "core/gallery/update-third-party-transform-from",
  updateThirdPartyTransformFromGallery
);
var transforms = {
  from: [
    {
      type: "block",
      isMultiBlock: true,
      blocks: ["core/image"],
      transform: (attributes) => {
        let { align, sizeSlug } = attributes[0];
        align = attributes.every(
          (attribute) => attribute.align === align
        ) ? align : void 0;
        sizeSlug = attributes.every(
          (attribute) => attribute.sizeSlug === sizeSlug
        ) ? sizeSlug : void 0;
        const validImages = attributes.filter(({ url }) => url);
        const innerBlocks = validImages.map((image) => {
          image.width = void 0;
          image.height = void 0;
          return (0, import_blocks.createBlock)("core/image", image);
        });
        return (0, import_blocks.createBlock)(
          "core/gallery",
          {
            align,
            sizeSlug
          },
          innerBlocks
        );
      }
    },
    {
      type: "shortcode",
      tag: "gallery",
      transform({ named: { ids, columns = 3, link, orderby, size } }) {
        const imageIds = parseShortcodeIds(ids).map(
          (id) => parseInt(id, 10)
        );
        let linkTo = import_constants.LINK_DESTINATION_NONE;
        if (link === "post") {
          linkTo = import_constants.LINK_DESTINATION_ATTACHMENT;
        } else if (link === "file") {
          linkTo = import_constants.LINK_DESTINATION_MEDIA;
        }
        const galleryBlock = (0, import_blocks.createBlock)(
          "core/gallery",
          {
            columns: parseInt(columns, 10),
            linkTo,
            randomOrder: orderby === "rand",
            ...size && { sizeSlug: size }
          },
          imageIds.map(
            (imageId) => (0, import_blocks.createBlock)("core/image", {
              id: imageId,
              ...size && { sizeSlug: size }
            })
          )
        );
        return galleryBlock;
      },
      isMatch({ named }) {
        return void 0 !== named.ids;
      }
    },
    {
      // When created by drag and dropping multiple files on an insertion point. Because multiple
      // files must not be transformed to a gallery when dropped within a gallery there is another transform
      // within the image block to handle that case. Therefore this transform has to have priority 1
      // set so that it overrides the image block transformation when multiple images are dropped outside
      // of a gallery block.
      type: "files",
      priority: 1,
      isMatch(files) {
        return files.length !== 1 && files.every(
          (file) => file.type.indexOf("image/") === 0
        );
      },
      transform(files) {
        const innerBlocks = files.map(
          (file) => (0, import_blocks.createBlock)("core/image", {
            blob: (0, import_blob.createBlobURL)(file)
          })
        );
        return (0, import_blocks.createBlock)("core/gallery", {}, innerBlocks);
      }
    }
  ],
  to: [
    {
      type: "block",
      blocks: ["core/image"],
      // A dynamic gallery has no inner blocks — its images are resolved
      // from a source at render time — so this transform would produce a
      // single empty image and drop the source.
      isMatch: ({ dynamicContent }) => !dynamicContent,
      transform: ({ align }, innerBlocks) => {
        if (innerBlocks.length > 0) {
          return innerBlocks.map(
            ({
              attributes: {
                url,
                alt,
                caption,
                title,
                href,
                rel,
                linkClass,
                id,
                sizeSlug: imageSizeSlug,
                linkDestination,
                linkTarget,
                anchor,
                className
              }
            }) => (0, import_blocks.createBlock)("core/image", {
              align,
              url,
              alt,
              caption,
              title,
              href,
              rel,
              linkClass,
              id,
              sizeSlug: imageSizeSlug,
              linkDestination,
              linkTarget,
              anchor,
              className
            })
          );
        }
        return (0, import_blocks.createBlock)("core/image", { align });
      }
    },
    {
      type: "block",
      blocks: ["core/group"],
      variationName: "group-grid",
      // As above: with no inner blocks to clone, a dynamic gallery would
      // transform into an empty grid.
      isMatch: ({ dynamicContent }) => !dynamicContent,
      transform: (attributes, innerBlocks) => {
        const {
          allowResize,
          aspectRatio,
          caption,
          columns,
          dynamicContent,
          fixedHeight,
          ids,
          imageCrop,
          images,
          linkTarget,
          linkTo,
          navigationButtonType,
          randomOrder,
          shortCodeTransforms,
          sizeSlug,
          ...rest
        } = attributes;
        return (0, import_blocks.createBlock)(
          "core/group",
          {
            ...rest,
            layout: {
              type: "grid",
              columnCount: columns ?? (0, import_shared.defaultColumnsNumber)(innerBlocks.length)
            }
          },
          cloneInnerBlocks(innerBlocks)
        );
      }
    }
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
