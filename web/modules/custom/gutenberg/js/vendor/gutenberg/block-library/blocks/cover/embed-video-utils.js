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

// packages/block-library/src/cover/embed-video-utils.js
var embed_video_utils_exports = {};
__export(embed_video_utils_exports, {
  detectProviderFromSrc: () => detectProviderFromSrc,
  getAllowedVideoProviders: () => getAllowedVideoProviders,
  getBackgroundEmbedHtml: () => getBackgroundEmbedHtml,
  getBackgroundVideoSrc: () => getBackgroundVideoSrc,
  getVideoEmbedProvider: () => getVideoEmbedProvider,
  isValidVideoEmbedUrl: () => isValidVideoEmbedUrl
});
module.exports = __toCommonJS(embed_video_utils_exports);
var import_blocks = require("@wordpress/blocks");
var import_util = require("../embed/util.cjs");
var DEFAULT_EMBED_BLOCK = "core/embed";
var DEFAULT_VIDEO_PROVIDERS = [
  "youtube",
  "vimeo",
  "videopress",
  "animoto",
  "tiktok",
  "wordpress-tv"
];
function getAllowedVideoProviders(allowedVideoProviders) {
  if (!Array.isArray(allowedVideoProviders)) {
    return [];
  }
  return DEFAULT_VIDEO_PROVIDERS.filter(
    (provider) => allowedVideoProviders.includes(provider)
  );
}
function isValidVideoEmbedUrl(url, allowedProviders) {
  if (!url) {
    return false;
  }
  const embedBlock = findVideoEmbedProvider(url, allowedProviders);
  return embedBlock !== null;
}
function getVideoEmbedProvider(url, allowedProviders) {
  const embedBlock = findVideoEmbedProvider(url, allowedProviders);
  return embedBlock ? embedBlock.name : null;
}
function findVideoEmbedProvider(url, allowedProviders = DEFAULT_VIDEO_PROVIDERS) {
  const embedVariations = (0, import_blocks.getBlockVariations)(DEFAULT_EMBED_BLOCK);
  if (!embedVariations) {
    return null;
  }
  const matchingVariation = embedVariations.find(
    ({ patterns }) => (0, import_util.matchesPatterns)(url, patterns)
  );
  if (!matchingVariation || !allowedProviders.includes(matchingVariation.name)) {
    return null;
  }
  return matchingVariation;
}
function getBackgroundEmbedHtml(html) {
  const srcMatch = html?.match(/src=["']([^"']+)["']/);
  if (!srcMatch) {
    return null;
  }
  const iframeSrc = srcMatch[1];
  const backgroundSrc = getBackgroundVideoSrc(iframeSrc);
  return html.replace(iframeSrc, backgroundSrc);
}
function detectProviderFromSrc(src) {
  if (!src) {
    return null;
  }
  const lowerSrc = src.toLowerCase();
  if (lowerSrc.includes("youtube.com") || lowerSrc.includes("youtu.be")) {
    return "youtube";
  }
  if (lowerSrc.includes("vimeo.com")) {
    return "vimeo";
  }
  if (lowerSrc.includes("videopress.com")) {
    return "videopress";
  }
  if (lowerSrc.includes("animoto.com")) {
    return "animoto";
  }
  if (lowerSrc.includes("tiktok.com")) {
    return "tiktok";
  }
  if (lowerSrc.includes("wordpress.tv")) {
    return "wordpress-tv";
  }
  return null;
}
function getBackgroundVideoSrc(src) {
  if (!src) {
    return src;
  }
  try {
    const url = new URL(src);
    const provider = detectProviderFromSrc(src);
    switch (provider) {
      case "youtube":
        url.searchParams.set("autoplay", "1");
        url.searchParams.set("mute", "1");
        url.searchParams.set("loop", "1");
        url.searchParams.set("controls", "0");
        url.searchParams.set("showinfo", "0");
        url.searchParams.set("modestbranding", "1");
        url.searchParams.set("playsinline", "1");
        url.searchParams.set("rel", "0");
        const videoId = url.pathname.split("/").pop();
        if (videoId) {
          url.searchParams.set("playlist", videoId);
        }
        break;
      case "vimeo":
        url.searchParams.set("autoplay", "1");
        url.searchParams.set("muted", "1");
        url.searchParams.set("loop", "1");
        url.searchParams.set("background", "1");
        url.searchParams.set("controls", "0");
        break;
      case "videopress":
      case "wordpress-tv":
        url.searchParams.set("autoplay", "1");
        url.searchParams.set("loop", "1");
        url.searchParams.set("muted", "1");
        break;
      default:
        url.searchParams.set("autoplay", "1");
        url.searchParams.set("muted", "1");
        url.searchParams.set("loop", "1");
        break;
    }
    return url.toString();
  } catch {
    return src;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  detectProviderFromSrc,
  getAllowedVideoProviders,
  getBackgroundEmbedHtml,
  getBackgroundVideoSrc,
  getVideoEmbedProvider,
  isValidVideoEmbedUrl
});
//# sourceMappingURL=embed-video-utils.cjs.map
