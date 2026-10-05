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

// packages/block-library/src/file/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blob = require("@wordpress/blob");
var import_blocks = require("@wordpress/blocks");
var import_data = require("@wordpress/data");
var import_core_data = require("@wordpress/core-data");
var import_i18n = require("@wordpress/i18n");
var import_url = require("@wordpress/url");
var downloadButtonText = (0, import_i18n._x)("Download", "button label");
var toMediaTransform = (blockName, mediaType, srcAttribute) => ({
  type: "block",
  blocks: [blockName],
  isMatch: ({ id }) => {
    if (!id) {
      return false;
    }
    const { getEntityRecord } = (0, import_data.select)(import_core_data.store);
    const media = getEntityRecord("postType", "attachment", id, {
      context: "view"
    });
    return !!media && media.mime_type.includes(mediaType);
  },
  transform: (attributes) => {
    return (0, import_blocks.createBlock)(blockName, {
      [srcAttribute]: attributes.href,
      caption: attributes.fileName,
      id: attributes.id,
      anchor: attributes.anchor
    });
  }
});
var transforms = {
  from: [
    {
      type: "files",
      isMatch(files) {
        return files.length > 0;
      },
      // We define a lower priority (higher number) than the default of 10. This
      // ensures that the File block is only created as a fallback.
      priority: 15,
      transform: (files) => {
        const blocks = [];
        files.forEach((file) => {
          const blobURL = (0, import_blob.createBlobURL)(file);
          if (file.type.startsWith("video/")) {
            blocks.push(
              (0, import_blocks.createBlock)("core/video", {
                blob: (0, import_blob.createBlobURL)(file)
              })
            );
          } else if (file.type.startsWith("image/")) {
            blocks.push(
              (0, import_blocks.createBlock)("core/image", {
                blob: (0, import_blob.createBlobURL)(file)
              })
            );
          } else if (file.type.startsWith("audio/")) {
            blocks.push(
              (0, import_blocks.createBlock)("core/audio", {
                blob: (0, import_blob.createBlobURL)(file)
              })
            );
          } else {
            blocks.push(
              (0, import_blocks.createBlock)("core/file", {
                blob: blobURL,
                fileName: file.name,
                downloadButtonText
              })
            );
          }
        });
        return blocks;
      }
    },
    {
      type: "block",
      blocks: ["core/audio", "core/video", "core/image"],
      transform: (attributes) => {
        const href = attributes.src ?? attributes.url;
        return (0, import_blocks.createBlock)("core/file", {
          href,
          fileName: attributes.caption || (0, import_url.getFilename)(href),
          textLinkHref: href,
          id: attributes.id,
          anchor: attributes.anchor,
          downloadButtonText
        });
      }
    }
  ],
  to: [
    toMediaTransform("core/audio", "audio", "src"),
    toMediaTransform("core/video", "video", "src"),
    toMediaTransform("core/image", "image", "url")
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
