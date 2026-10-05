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

// packages/block-library/src/gallery/responsive-styles.js
var responsive_styles_exports = {};
__export(responsive_styles_exports, {
  getGalleryResponsiveFlexCSS: () => getGalleryResponsiveFlexCSS,
  getUpdatedGalleryStyle: () => getUpdatedGalleryStyle,
  getViewportGalleryStyle: () => getViewportGalleryStyle,
  isValidGalleryColumns: () => isValidGalleryColumns
});
module.exports = __toCommonJS(responsive_styles_exports);
var import_constants = require("./constants.cjs");
function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function isValidGalleryColumns(value) {
  return Number.isInteger(value) && value >= 1 && value <= import_constants.MAX_COLUMNS;
}
function getViewportGalleryStyle(style, viewport) {
  if (!isObject(style) || !isObject(style[viewport])) {
    return {};
  }
  return style[viewport];
}
function cleanObject(value) {
  if (!isObject(value)) {
    return value;
  }
  const entries = Object.entries(value).filter(
    ([, entryValue]) => entryValue !== void 0
  );
  return entries.length ? Object.fromEntries(entries) : void 0;
}
function getUpdatedGalleryStyle({
  style,
  viewport,
  baseSettings,
  settings
}) {
  const currentStyle = isObject(style) ? style : {};
  const nextViewportStyle = {
    ...getViewportGalleryStyle(currentStyle, viewport)
  };
  Object.entries(settings).forEach(([key, value]) => {
    if (value === void 0 || value === baseSettings[key]) {
      delete nextViewportStyle[key];
    } else {
      nextViewportStyle[key] = value;
    }
  });
  const cleanedViewportStyle = cleanObject(nextViewportStyle);
  const nextStyle = { ...currentStyle };
  if (cleanedViewportStyle) {
    nextStyle[viewport] = cleanedViewportStyle;
  } else {
    delete nextStyle[viewport];
  }
  return cleanObject(nextStyle);
}
function getGallerySelector(selector) {
  return `${selector}.wp-block-gallery.has-nested-images:where(.is-layout-flex)`;
}
function getImageSelector(selector) {
  return `${getGallerySelector(
    selector
  )} figure.wp-block-image:not(#individual-image)`;
}
function getColumnsCSS(selector, columns) {
  const width = columns === 1 ? "100%" : `calc((100% - (var(--wp--style--unstable-gallery-gap, 16px) * ${columns - 1})) / ${columns})`;
  return `${getImageSelector(selector)}{width:${width} !important;}`;
}
function getImageCropCSS(selector, imageCrop) {
  const imageSelector = getImageSelector(selector);
  const wrapperSelector = `${imageSelector} > div:not(.components-drop-zone)`;
  const linkSelector = `${imageSelector} > a`;
  const mediaSelector = `${imageSelector} a,${imageSelector} img`;
  if (imageCrop) {
    return `${imageSelector}{align-self:inherit !important;margin-bottom:0 !important;}${wrapperSelector},${linkSelector}{display:flex !important;}${mediaSelector}{width:100% !important;flex:1 0 0% !important;height:100% !important;object-fit:cover !important;}`;
  }
  return `${imageSelector}{align-self:auto !important;margin-top:0 !important;margin-bottom:auto !important;}${wrapperSelector}{display:block !important;}${linkSelector}{display:inline-block !important;}${mediaSelector}{width:auto !important;flex:0 1 auto !important;height:auto !important;object-fit:fill !important;}`;
}
function getGalleryResponsiveFlexCSS(selector, style, mediaQueries) {
  if (!isObject(mediaQueries)) {
    return "";
  }
  return Object.entries(mediaQueries).map(([viewport, mediaQuery]) => {
    if (typeof mediaQuery !== "string") {
      return "";
    }
    const viewportStyle = getViewportGalleryStyle(style, viewport);
    let css = "";
    if (isValidGalleryColumns(viewportStyle.columns)) {
      css += getColumnsCSS(selector, viewportStyle.columns);
    }
    if (typeof viewportStyle.imageCrop === "boolean") {
      css += getImageCropCSS(selector, viewportStyle.imageCrop);
    }
    return css ? `${mediaQuery}{${css}}` : "";
  }).join("");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getGalleryResponsiveFlexCSS,
  getUpdatedGalleryStyle,
  getViewportGalleryStyle,
  isValidGalleryColumns
});
//# sourceMappingURL=responsive-styles.cjs.map
