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

// packages/block-library/src/gallery/utils.js
var utils_exports = {};
__export(utils_exports, {
  getHrefAndDestination: () => getHrefAndDestination
});
module.exports = __toCommonJS(utils_exports);
var import_constants = require("./constants.cjs");
var import_constants2 = require("../image/constants.cjs");
function getHrefAndDestination(image, galleryDestination, imageDestination, attributes, lightboxSetting) {
  switch (imageDestination ? imageDestination : galleryDestination) {
    case import_constants.LINK_DESTINATION_MEDIA_WP_CORE:
    case import_constants.LINK_DESTINATION_MEDIA:
      return {
        href: image?.source_url || image?.url,
        linkDestination: import_constants2.LINK_DESTINATION_MEDIA,
        lightbox: lightboxSetting?.enabled ? { ...attributes?.lightbox, enabled: false } : void 0
      };
    case import_constants.LINK_DESTINATION_ATTACHMENT_WP_CORE:
    case import_constants.LINK_DESTINATION_ATTACHMENT:
      return {
        href: image?.link,
        linkDestination: import_constants2.LINK_DESTINATION_ATTACHMENT,
        lightbox: lightboxSetting?.enabled ? { ...attributes?.lightbox, enabled: false } : void 0
      };
    case import_constants.LINK_DESTINATION_LIGHTBOX:
      return {
        href: void 0,
        lightbox: !lightboxSetting?.enabled ? { ...attributes?.lightbox, enabled: true } : void 0,
        linkDestination: import_constants2.LINK_DESTINATION_NONE
      };
    case import_constants.LINK_DESTINATION_NONE:
      return {
        href: void 0,
        linkDestination: import_constants2.LINK_DESTINATION_NONE,
        lightbox: void 0
      };
  }
  return {};
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getHrefAndDestination
});
//# sourceMappingURL=utils.cjs.map
