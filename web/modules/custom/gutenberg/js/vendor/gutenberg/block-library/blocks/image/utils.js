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

// packages/block-library/src/image/utils.js
var utils_exports = {};
__export(utils_exports, {
  evalAspectRatio: () => evalAspectRatio,
  getImageSizeAttributes: () => getImageSizeAttributes,
  getUpdatedLinkTargetSettings: () => getUpdatedLinkTargetSettings,
  isValidFileType: () => isValidFileType,
  mediaPosition: () => mediaPosition,
  removeNewTabRel: () => removeNewTabRel
});
module.exports = __toCommonJS(utils_exports);
var import_constants = require("./constants.cjs");
function evalAspectRatio(value) {
  const [width, height = 1] = value.split("/").map(Number);
  const aspectRatio = width / height;
  return aspectRatio === Infinity || aspectRatio === 0 ? NaN : aspectRatio;
}
function removeNewTabRel(currentRel) {
  let newRel = currentRel;
  if (currentRel !== void 0 && newRel) {
    import_constants.NEW_TAB_REL.forEach((relVal) => {
      const regExp = new RegExp("\\b" + relVal + "\\b", "gi");
      newRel = newRel.replace(regExp, "");
    });
    if (newRel !== currentRel) {
      newRel = newRel.trim();
    }
    if (!newRel) {
      newRel = void 0;
    }
  }
  return newRel;
}
function getUpdatedLinkTargetSettings(value, { rel }) {
  const linkTarget = value ? "_blank" : void 0;
  let updatedRel;
  if (!linkTarget && !rel) {
    updatedRel = void 0;
  } else {
    updatedRel = removeNewTabRel(rel);
  }
  return {
    linkTarget,
    rel: updatedRel
  };
}
function getImageSizeAttributes(image, size) {
  const url = image?.media_details?.sizes?.[size]?.source_url;
  if (url) {
    return { url, width: void 0, height: void 0, sizeSlug: size };
  }
  return {};
}
function isValidFileType(file) {
  return import_constants.ALLOWED_MEDIA_TYPES.some(
    (mediaType) => file.type.indexOf(mediaType) === 0
  );
}
function mediaPosition({ x, y } = { x: 0.5, y: 0.5 }) {
  return `${Math.round(x * 100)}% ${Math.round(y * 100)}%`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  evalAspectRatio,
  getImageSizeAttributes,
  getUpdatedLinkTargetSettings,
  isValidFileType,
  mediaPosition,
  removeNewTabRel
});
//# sourceMappingURL=utils.cjs.map
