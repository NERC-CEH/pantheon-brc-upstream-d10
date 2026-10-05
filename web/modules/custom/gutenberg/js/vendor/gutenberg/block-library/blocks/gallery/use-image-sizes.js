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

// packages/block-library/src/gallery/use-image-sizes.js
var use_image_sizes_exports = {};
__export(use_image_sizes_exports, {
  default: () => useImageSizes
});
module.exports = __toCommonJS(use_image_sizes_exports);
var import_element = require("@wordpress/element");
function useImageSizes(images, isSelected, getSettings) {
  return (0, import_element.useMemo)(() => getImageSizing(), [images, isSelected]);
  function getImageSizing() {
    if (!images || images.length === 0) {
      return;
    }
    const { imageSizes } = getSettings();
    let resizedImages = {};
    if (isSelected) {
      resizedImages = images.reduce((currentResizedImages, img) => {
        if (!img.id) {
          return currentResizedImages;
        }
        const sizes = imageSizes.reduce((currentSizes, size) => {
          const defaultUrl = img.sizes?.[size.slug]?.url;
          const mediaDetailsUrl = img.media_details?.sizes?.[size.slug]?.source_url;
          return {
            ...currentSizes,
            [size.slug]: defaultUrl || mediaDetailsUrl
          };
        }, {});
        return {
          ...currentResizedImages,
          [parseInt(img.id, 10)]: sizes
        };
      }, {});
    }
    const resizedImageSizes = Object.values(resizedImages);
    return imageSizes.filter(
      ({ slug }) => resizedImageSizes.some((sizes) => sizes[slug])
    ).map(({ name, slug }) => ({ value: slug, label: name }));
  }
}
//# sourceMappingURL=use-image-sizes.cjs.map
