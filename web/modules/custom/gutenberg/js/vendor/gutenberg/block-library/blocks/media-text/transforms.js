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

// packages/block-library/src/media-text/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blocks = require("@wordpress/blocks");
var transforms = {
  from: [
    {
      type: "block",
      blocks: ["core/image"],
      transform: ({ alt, url, id, anchor }) => (0, import_blocks.createBlock)("core/media-text", {
        mediaAlt: alt,
        mediaId: id,
        mediaUrl: url,
        mediaType: "image",
        anchor
      })
    },
    {
      type: "block",
      blocks: ["core/video"],
      transform: ({ src, id, anchor }) => (0, import_blocks.createBlock)("core/media-text", {
        mediaId: id,
        mediaUrl: src,
        mediaType: "video",
        anchor
      })
    },
    {
      type: "block",
      blocks: ["core/cover"],
      transform: ({
        align,
        alt,
        anchor,
        backgroundType,
        customGradient,
        customOverlayColor,
        gradient,
        id,
        overlayColor,
        style,
        textColor,
        url,
        useFeaturedImage
      }, innerBlocks) => {
        let additionalAttributes = {};
        if (customGradient) {
          additionalAttributes = {
            style: {
              color: {
                gradient: customGradient
              }
            }
          };
        } else if (customOverlayColor) {
          additionalAttributes = {
            style: {
              color: {
                background: customOverlayColor
              }
            }
          };
        }
        if (style?.color?.text) {
          additionalAttributes.style = {
            color: {
              ...additionalAttributes.style?.color,
              text: style.color.text
            }
          };
        }
        return (0, import_blocks.createBlock)(
          "core/media-text",
          {
            align,
            anchor,
            backgroundColor: overlayColor,
            gradient,
            mediaAlt: alt,
            mediaId: id,
            mediaType: backgroundType,
            mediaUrl: url,
            textColor,
            useFeaturedImage,
            ...additionalAttributes
          },
          innerBlocks
        );
      }
    }
  ],
  to: [
    {
      type: "block",
      blocks: ["core/image"],
      isMatch: ({ mediaType, mediaUrl }) => {
        return !mediaUrl || mediaType === "image";
      },
      transform: ({ mediaAlt, mediaId, mediaUrl, anchor }) => {
        return (0, import_blocks.createBlock)("core/image", {
          alt: mediaAlt,
          id: mediaId,
          url: mediaUrl,
          anchor
        });
      }
    },
    {
      type: "block",
      blocks: ["core/video"],
      isMatch: ({ mediaType, mediaUrl }) => {
        return !mediaUrl || mediaType === "video";
      },
      transform: ({ mediaId, mediaUrl, anchor }) => {
        return (0, import_blocks.createBlock)("core/video", {
          id: mediaId,
          src: mediaUrl,
          anchor
        });
      }
    },
    {
      type: "block",
      blocks: ["core/cover"],
      transform: ({
        align,
        anchor,
        backgroundColor,
        focalPoint,
        gradient,
        mediaAlt,
        mediaId,
        mediaType,
        mediaUrl,
        style,
        textColor,
        useFeaturedImage
      }, innerBlocks) => {
        const additionalAttributes = {};
        if (style?.color?.gradient) {
          additionalAttributes.customGradient = style.color.gradient;
        } else if (style?.color?.background) {
          additionalAttributes.customOverlayColor = style.color.background;
        }
        if (style?.color?.text) {
          additionalAttributes.style = {
            color: { text: style.color.text }
          };
        }
        const coverAttributes = {
          align,
          alt: mediaAlt,
          anchor,
          backgroundType: mediaType,
          dimRatio: !!mediaUrl || useFeaturedImage ? 50 : 100,
          focalPoint,
          gradient,
          id: mediaId,
          overlayColor: backgroundColor,
          textColor,
          url: mediaUrl,
          useFeaturedImage,
          ...additionalAttributes
        };
        return (0, import_blocks.createBlock)(
          "core/cover",
          coverAttributes,
          innerBlocks
        );
      }
    }
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
