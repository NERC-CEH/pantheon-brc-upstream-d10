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

// packages/block-library/src/cover/shared.js
var shared_exports = {};
__export(shared_exports, {
  ALLOWED_MEDIA_TYPES: () => ALLOWED_MEDIA_TYPES,
  COVER_DEFAULT_HEIGHT: () => COVER_DEFAULT_HEIGHT,
  COVER_MAX_HEIGHT: () => COVER_MAX_HEIGHT,
  COVER_MIN_HEIGHT: () => COVER_MIN_HEIGHT,
  DEFAULT_FOCAL_POINT: () => DEFAULT_FOCAL_POINT,
  EMBED_VIDEO_BACKGROUND_TYPE: () => EMBED_VIDEO_BACKGROUND_TYPE,
  IMAGE_BACKGROUND_TYPE: () => IMAGE_BACKGROUND_TYPE,
  VIDEO_BACKGROUND_TYPE: () => VIDEO_BACKGROUND_TYPE,
  attributesFromMedia: () => attributesFromMedia,
  dimRatioToClass: () => dimRatioToClass,
  getPositionClassName: () => getPositionClassName,
  isContentPositionCenter: () => isContentPositionCenter,
  mediaPosition: () => mediaPosition
});
module.exports = __toCommonJS(shared_exports);
var import_blob = require("@wordpress/blob");
var POSITION_CLASSNAMES = {
  "top left": "is-position-top-left",
  "top center": "is-position-top-center",
  "top right": "is-position-top-right",
  "center left": "is-position-center-left",
  "center center": "is-position-center-center",
  center: "is-position-center-center",
  "center right": "is-position-center-right",
  "bottom left": "is-position-bottom-left",
  "bottom center": "is-position-bottom-center",
  "bottom right": "is-position-bottom-right"
};
var IMAGE_BACKGROUND_TYPE = "image";
var VIDEO_BACKGROUND_TYPE = "video";
var EMBED_VIDEO_BACKGROUND_TYPE = "embed-video";
var COVER_MIN_HEIGHT = 50;
var COVER_MAX_HEIGHT = 1e3;
var COVER_DEFAULT_HEIGHT = 300;
var DEFAULT_FOCAL_POINT = { x: 0.5, y: 0.5 };
var ALLOWED_MEDIA_TYPES = ["image", "video"];
function mediaPosition({ x, y } = DEFAULT_FOCAL_POINT) {
  return `${Math.round(x * 100)}% ${Math.round(y * 100)}%`;
}
function dimRatioToClass(ratio) {
  return ratio === 50 || ratio === void 0 ? null : "has-background-dim-" + 10 * Math.round(ratio / 10);
}
function attributesFromMedia(media) {
  if (!media || !media.url && !media.src) {
    return {
      url: void 0,
      id: void 0
    };
  }
  if ((0, import_blob.isBlobURL)(media.url)) {
    media.type = (0, import_blob.getBlobTypeByURL)(media.url);
  }
  let mediaType;
  if (media.media_type) {
    if (media.media_type === IMAGE_BACKGROUND_TYPE) {
      mediaType = IMAGE_BACKGROUND_TYPE;
    } else {
      mediaType = VIDEO_BACKGROUND_TYPE;
    }
  } else if (media.type && (media.type === IMAGE_BACKGROUND_TYPE || media.type === VIDEO_BACKGROUND_TYPE)) {
    mediaType = media.type;
  } else {
    return;
  }
  return {
    url: media.url || media.src,
    id: media.id,
    alt: media?.alt,
    backgroundType: mediaType,
    ...mediaType === VIDEO_BACKGROUND_TYPE ? { hasParallax: void 0 } : {}
  };
}
function isContentPositionCenter(contentPosition) {
  return !contentPosition || contentPosition === "center center" || contentPosition === "center";
}
function getPositionClassName(contentPosition) {
  if (isContentPositionCenter(contentPosition)) {
    return "";
  }
  return POSITION_CLASSNAMES[contentPosition];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ALLOWED_MEDIA_TYPES,
  COVER_DEFAULT_HEIGHT,
  COVER_MAX_HEIGHT,
  COVER_MIN_HEIGHT,
  DEFAULT_FOCAL_POINT,
  EMBED_VIDEO_BACKGROUND_TYPE,
  IMAGE_BACKGROUND_TYPE,
  VIDEO_BACKGROUND_TYPE,
  attributesFromMedia,
  dimRatioToClass,
  getPositionClassName,
  isContentPositionCenter,
  mediaPosition
});
//# sourceMappingURL=shared.cjs.map
