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

// packages/block-library/src/post-author/utils.js
var utils_exports = {};
__export(utils_exports, {
  recreateWithRecommendedBlocks: () => recreateWithRecommendedBlocks
});
module.exports = __toCommonJS(utils_exports);
var import_blocks = require("@wordpress/blocks");
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_lock_unlock = require("../lock-unlock.cjs");
var { cleanEmptyObject } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
function recreateWithRecommendedBlocks(attributes, blockTypes) {
  const {
    avatarSize,
    byline,
    showAvatar,
    showBio,
    isLink,
    linkTarget,
    textAlign,
    style,
    ...restAttributes
  } = attributes;
  const shouldInsertAvatarBlock = showAvatar && blockTypes.some((blockType) => blockType.name === "core/avatar");
  const shouldInsertParagraphBlock = byline && blockTypes.some((blockType) => blockType.name === "core/paragraph");
  const shouldInsertPostAuthorNameBlock = blockTypes.some(
    (blockType) => blockType.name === "core/post-author-name"
  );
  const shouldInsertPostAuthorBiographyBlock = showBio && blockTypes.some(
    (blockType) => blockType.name === "core/post-author-biography"
  );
  return (0, import_blocks.createBlock)(
    "core/group",
    {
      ...restAttributes,
      style: cleanEmptyObject({
        ...style,
        spacing: {
          ...style?.spacing,
          blockGap: "1em"
        },
        color: {
          ...style?.color,
          // Duotone must be applied to the avatar block.
          duotone: void 0
        }
      }),
      layout: {
        type: "flex",
        flexWrap: "nowrap",
        verticalAlignment: "top"
      }
    },
    [
      shouldInsertAvatarBlock && (0, import_blocks.createBlock)("core/avatar", {
        size: avatarSize,
        style: cleanEmptyObject({
          border: {
            radius: "0px"
          },
          color: {
            duotone: style?.color?.duotone
          }
        })
      }),
      (0, import_blocks.createBlock)(
        "core/group",
        {
          style: {
            layout: {
              selfStretch: "fill",
              flexSize: null
            },
            spacing: {
              blockGap: "0"
            }
          },
          layout: {
            type: "flex",
            orientation: "vertical",
            justifyContent: "stretch"
          }
        },
        [
          shouldInsertParagraphBlock && (0, import_blocks.createBlock)("core/paragraph", {
            content: byline,
            placeholder: (0, import_i18n.__)("Write byline…"),
            style: {
              typography: {
                fontSize: "0.5em",
                textAlign
              }
            }
          }),
          shouldInsertPostAuthorNameBlock && (0, import_blocks.createBlock)("core/post-author-name", {
            isLink,
            linkTarget,
            style: {
              typography: {
                fontSize: "1em",
                textAlign
              }
            }
          }),
          shouldInsertPostAuthorBiographyBlock && (0, import_blocks.createBlock)("core/post-author-biography", {
            style: {
              typography: {
                fontSize: "0.7em",
                textAlign
              }
            }
          })
        ].filter(Boolean)
      )
    ].filter(Boolean)
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  recreateWithRecommendedBlocks
});
//# sourceMappingURL=utils.cjs.map
