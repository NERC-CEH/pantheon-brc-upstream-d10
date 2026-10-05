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

// packages/block-library/src/image/constants.js
var constants_exports = {};
__export(constants_exports, {
  ALLOWED_MEDIA_TYPES: () => ALLOWED_MEDIA_TYPES,
  DEFAULT_MEDIA_SIZE_SLUG: () => DEFAULT_MEDIA_SIZE_SLUG,
  IMAGE_PRELOAD_DELAY: () => IMAGE_PRELOAD_DELAY,
  LINK_DESTINATION_ATTACHMENT: () => LINK_DESTINATION_ATTACHMENT,
  LINK_DESTINATION_CUSTOM: () => LINK_DESTINATION_CUSTOM,
  LINK_DESTINATION_MEDIA: () => LINK_DESTINATION_MEDIA,
  LINK_DESTINATION_NONE: () => LINK_DESTINATION_NONE,
  MEDIA_ID_NO_FEATURED_IMAGE_SET: () => MEDIA_ID_NO_FEATURED_IMAGE_SET,
  MIN_SIZE: () => MIN_SIZE,
  NEW_TAB_REL: () => NEW_TAB_REL,
  SIZED_LAYOUTS: () => SIZED_LAYOUTS
});
module.exports = __toCommonJS(constants_exports);
var MIN_SIZE = 20;
var LINK_DESTINATION_NONE = "none";
var LINK_DESTINATION_MEDIA = "media";
var LINK_DESTINATION_ATTACHMENT = "attachment";
var LINK_DESTINATION_CUSTOM = "custom";
var NEW_TAB_REL = ["noopener"];
var ALLOWED_MEDIA_TYPES = ["image"];
var MEDIA_ID_NO_FEATURED_IMAGE_SET = 0;
var SIZED_LAYOUTS = ["flex", "grid"];
var DEFAULT_MEDIA_SIZE_SLUG = "full";
var IMAGE_PRELOAD_DELAY = 200;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ALLOWED_MEDIA_TYPES,
  DEFAULT_MEDIA_SIZE_SLUG,
  IMAGE_PRELOAD_DELAY,
  LINK_DESTINATION_ATTACHMENT,
  LINK_DESTINATION_CUSTOM,
  LINK_DESTINATION_MEDIA,
  LINK_DESTINATION_NONE,
  MEDIA_ID_NO_FEATURED_IMAGE_SET,
  MIN_SIZE,
  NEW_TAB_REL,
  SIZED_LAYOUTS
});
//# sourceMappingURL=constants.cjs.map
