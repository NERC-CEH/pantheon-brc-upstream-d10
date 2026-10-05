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

// packages/block-library/src/playlist/utils.js
var utils_exports = {};
__export(utils_exports, {
  getTrackAttributes: () => getTrackAttributes,
  getTrackImageAttributes: () => getTrackImageAttributes
});
module.exports = __toCommonJS(utils_exports);
var import_i18n = require("@wordpress/i18n");
var import_html_entities = require("@wordpress/html-entities");
function getMediaUrl(media) {
  return media?.url ?? media?.source_url;
}
function getMediaTitle(media) {
  const title = media?.title;
  if (title === void 0) {
    return void 0;
  }
  if (typeof title === "string") {
    return title;
  }
  return (0, import_html_entities.decodeEntities)(title?.raw || title?.rendered || "");
}
function getTrackImageAttributes(image) {
  const imageSrc = image?.src ?? getMediaUrl(image);
  if (imageSrc?.endsWith("/images/media/audio.svg")) {
    return {
      image: "",
      imageAlt: ""
    };
  }
  return {
    // Note: Image is not available when a new track is uploaded.
    image: imageSrc,
    imageAlt: imageSrc ? image?.alt || image?.alt_text || "" : void 0
  };
}
function getTrackAttributes(media) {
  const mediaUrl = getMediaUrl(media);
  return {
    id: media.id || mediaUrl,
    // Attachment ID or URL.
    src: mediaUrl,
    title: getMediaTitle(media),
    artist: media.artist || media?.meta?.artist || media?.media_details?.artist || (0, import_i18n.__)("Unknown artist"),
    album: media.album || media?.meta?.album || media?.media_details?.album || (0, import_i18n.__)("Unknown album"),
    length: media?.fileLength || media?.media_details?.length_formatted,
    ...getTrackImageAttributes(media?.image)
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getTrackAttributes,
  getTrackImageAttributes
});
//# sourceMappingURL=utils.cjs.map
