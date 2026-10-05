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

// packages/block-library/src/gallery/use-get-media.js
var use_get_media_exports = {};
__export(use_get_media_exports, {
  default: () => useGetMedia
});
module.exports = __toCommonJS(use_get_media_exports);
var import_data = require("@wordpress/data");
var import_core_data = require("@wordpress/core-data");
var EMPTY_IMAGE_MEDIA = [];
function useGetMedia(innerBlockImages) {
  return (0, import_data.useSelect)(
    (select) => {
      const imageIds = innerBlockImages.map((imageBlock) => imageBlock.attributes.id).filter((id) => id !== void 0);
      if (imageIds.length === 0) {
        return EMPTY_IMAGE_MEDIA;
      }
      return select(import_core_data.store).getEntityRecords(
        "postType",
        "attachment",
        {
          include: imageIds.join(","),
          per_page: -1,
          orderby: "include"
        }
      ) ?? EMPTY_IMAGE_MEDIA;
    },
    [innerBlockImages]
  );
}
//# sourceMappingURL=use-get-media.cjs.map
