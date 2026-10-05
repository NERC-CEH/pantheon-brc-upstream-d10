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

// packages/block-library/src/cover/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blocks = require("@wordpress/blocks");
var import_block_editor = require("@wordpress/block-editor");
var import_shared = require("./shared.cjs");
var import_lock_unlock = require("../lock-unlock.cjs");
var { cleanEmptyObject } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
var transforms = {
  from: [
    {
      type: "block",
      blocks: ["core/image"],
      transform: ({ caption, url, alt, align, id, anchor, style }) => (0, import_blocks.createBlock)(
        "core/cover",
        {
          dimRatio: 50,
          url,
          alt,
          align,
          id,
          anchor,
          style: {
            color: {
              duotone: style?.color?.duotone
            }
          }
        },
        [
          (0, import_blocks.createBlock)("core/paragraph", {
            content: caption,
            fontSize: "large",
            style: {
              typography: {
                textAlign: "center"
              }
            }
          })
        ]
      )
    },
    {
      type: "block",
      blocks: ["core/video"],
      transform: ({ caption, src, align, id, anchor }) => (0, import_blocks.createBlock)(
        "core/cover",
        {
          dimRatio: 50,
          url: src,
          align,
          id,
          backgroundType: import_shared.VIDEO_BACKGROUND_TYPE,
          anchor
        },
        [
          (0, import_blocks.createBlock)("core/paragraph", {
            content: caption,
            fontSize: "large",
            style: {
              typography: {
                textAlign: "center"
              }
            }
          })
        ]
      )
    },
    {
      type: "block",
      blocks: ["core/group"],
      transform: (attributes, innerBlocks) => {
        const { align, anchor, backgroundColor, gradient, style } = attributes;
        if (innerBlocks?.length === 1 && innerBlocks[0]?.name === "core/cover") {
          return (0, import_blocks.createBlock)(
            "core/cover",
            innerBlocks[0].attributes,
            innerBlocks[0].innerBlocks
          );
        }
        const dimRatio = backgroundColor || gradient || style?.color?.background || style?.color?.gradient ? void 0 : 50;
        const parentAttributes = {
          align,
          anchor,
          dimRatio,
          overlayColor: backgroundColor,
          customOverlayColor: style?.color?.background,
          gradient,
          customGradient: style?.color?.gradient
        };
        const attributesWithoutBackgroundColors = {
          ...attributes,
          backgroundColor: void 0,
          gradient: void 0,
          style: cleanEmptyObject({
            ...attributes?.style,
            color: style?.color ? {
              ...style?.color,
              background: void 0,
              gradient: void 0
            } : void 0
          })
        };
        return (0, import_blocks.createBlock)("core/cover", parentAttributes, [
          (0, import_blocks.createBlock)(
            "core/group",
            attributesWithoutBackgroundColors,
            innerBlocks
          )
        ]);
      }
    }
  ],
  to: [
    {
      type: "block",
      blocks: ["core/image"],
      isMatch: ({
        backgroundType,
        url,
        overlayColor,
        customOverlayColor,
        gradient,
        customGradient
      }) => {
        if (url) {
          return backgroundType === import_shared.IMAGE_BACKGROUND_TYPE;
        }
        return !overlayColor && !customOverlayColor && !gradient && !customGradient;
      },
      transform: ({ title, url, alt, align, id, anchor, style }) => (0, import_blocks.createBlock)("core/image", {
        caption: title,
        url,
        alt,
        align,
        id,
        anchor,
        style: {
          color: {
            duotone: style?.color?.duotone
          }
        }
      })
    },
    {
      type: "block",
      blocks: ["core/video"],
      isMatch: ({
        backgroundType,
        url,
        overlayColor,
        customOverlayColor,
        gradient,
        customGradient
      }) => {
        if (url) {
          return backgroundType === import_shared.VIDEO_BACKGROUND_TYPE;
        }
        return !overlayColor && !customOverlayColor && !gradient && !customGradient;
      },
      transform: ({ title, url, align, id, anchor }) => (0, import_blocks.createBlock)("core/video", {
        caption: title,
        src: url,
        id,
        align,
        anchor
      })
    },
    {
      type: "block",
      blocks: ["core/group"],
      isMatch: ({ url, useFeaturedImage }) => {
        if (url || useFeaturedImage) {
          return false;
        }
        return true;
      },
      transform: (attributes, innerBlocks) => {
        const transformedColorAttributes = {
          backgroundColor: attributes?.overlayColor,
          gradient: attributes?.gradient,
          style: cleanEmptyObject({
            ...attributes?.style,
            color: attributes?.customOverlayColor || attributes?.customGradient || attributes?.style?.color ? {
              background: attributes?.customOverlayColor,
              gradient: attributes?.customGradient,
              ...attributes?.style?.color
            } : void 0
          })
        };
        if (innerBlocks?.length === 1 && innerBlocks[0]?.name === "core/group") {
          const groupAttributes = cleanEmptyObject(
            innerBlocks[0].attributes || {}
          );
          if (groupAttributes?.backgroundColor || groupAttributes?.gradient || groupAttributes?.style?.color?.background || groupAttributes?.style?.color?.gradient) {
            return (0, import_blocks.createBlock)(
              "core/group",
              groupAttributes,
              innerBlocks[0]?.innerBlocks
            );
          }
          return (0, import_blocks.createBlock)(
            "core/group",
            {
              ...transformedColorAttributes,
              ...groupAttributes,
              style: cleanEmptyObject({
                ...groupAttributes?.style,
                color: transformedColorAttributes?.style?.color || groupAttributes?.style?.color ? {
                  ...transformedColorAttributes?.style?.color,
                  ...groupAttributes?.style?.color
                } : void 0
              })
            },
            innerBlocks[0]?.innerBlocks
          );
        }
        return (0, import_blocks.createBlock)(
          "core/group",
          { ...attributes, ...transformedColorAttributes },
          innerBlocks
        );
      }
    }
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
