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

// packages/block-library/src/gallery/shared.js
var shared_exports = {};
__export(shared_exports, {
  defaultColumnsNumber: () => defaultColumnsNumber,
  isGalleryFlexLayout: () => isGalleryFlexLayout,
  isObject: () => isObject,
  pickRelevantMediaFiles: () => pickRelevantMediaFiles
});
module.exports = __toCommonJS(shared_exports);
function defaultColumnsNumber(imageCount) {
  return imageCount ? Math.min(3, imageCount) : 3;
}
function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function isGalleryFlexLayout(layout) {
  const layoutType = isObject(layout) ? layout.type : void 0;
  return typeof layoutType !== "string" || layoutType === "" || layoutType === "flex";
}
var pickRelevantMediaFiles = (image, sizeSlug = "large") => {
  const imageProps = Object.fromEntries(
    Object.entries(image ?? {}).filter(
      ([key]) => ["alt", "id", "link"].includes(key)
    )
  );
  imageProps.url = image?.sizes?.[sizeSlug]?.url || image?.media_details?.sizes?.[sizeSlug]?.source_url || image?.url || image?.source_url;
  const fullUrl = image?.sizes?.full?.url || image?.media_details?.sizes?.full?.source_url;
  if (fullUrl) {
    imageProps.fullUrl = fullUrl;
  }
  return imageProps;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defaultColumnsNumber,
  isGalleryFlexLayout,
  isObject,
  pickRelevantMediaFiles
});
//# sourceMappingURL=shared.cjs.map
