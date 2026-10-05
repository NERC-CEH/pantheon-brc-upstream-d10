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

// packages/block-library/src/gallery/use-get-new-images.js
var use_get_new_images_exports = {};
__export(use_get_new_images_exports, {
  default: () => useGetNewImages
});
module.exports = __toCommonJS(use_get_new_images_exports);
var import_element = require("@wordpress/element");
function useGetNewImages(images, imageData) {
  const [currentImages, setCurrentImages] = (0, import_element.useState)([]);
  return (0, import_element.useMemo)(() => getNewImages(), [images, imageData]);
  function getNewImages() {
    let imagesUpdated = false;
    const newCurrentImages = currentImages.filter(
      (currentImg) => images.find((img) => {
        return currentImg.clientId === img.clientId;
      })
    );
    if (newCurrentImages.length < currentImages.length) {
      imagesUpdated = true;
    }
    images.forEach((image) => {
      if (image.fromSavedContent && !newCurrentImages.find(
        (currentImage) => currentImage.id === image.id
      )) {
        imagesUpdated = true;
        newCurrentImages.push(image);
      }
    });
    const newImages = images.filter(
      (image) => !newCurrentImages.find(
        (currentImage) => image.clientId && currentImage.clientId === image.clientId
      ) && imageData?.find((img) => img.id === image.id) && !image.fromSavedContent
    );
    if (imagesUpdated || newImages?.length > 0) {
      setCurrentImages([...newCurrentImages, ...newImages]);
    }
    return newImages.length > 0 ? newImages : null;
  }
}
//# sourceMappingURL=use-get-new-images.cjs.map
