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

// packages/block-library/src/embed/variations.js
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var import_icons = require("./icons.cjs");
function getTitle(providerName) {
  return (0, import_i18n.sprintf)(
    /* translators: %s: provider name */
    (0, import_i18n.__)("%s Embed"),
    providerName
  );
}
var variations = [
  {
    name: "twitter",
    title: getTitle("X"),
    icon: import_icons.embedTwitterIcon,
    keywords: ["x", "twitter", "tweet", (0, import_i18n.__)("social")],
    description: (0, import_i18n.__)("Embed an X post."),
    patterns: [/^https?:\/\/(www\.)?twitter\.com\/.+/i],
    attributes: { providerNameSlug: "twitter", responsive: true }
  },
  {
    name: "youtube",
    title: getTitle("YouTube"),
    icon: import_icons.embedYouTubeIcon,
    keywords: [(0, import_i18n.__)("music"), (0, import_i18n.__)("video")],
    description: (0, import_i18n.__)("Embed a YouTube video."),
    patterns: [
      /^https?:\/\/((m|www)\.)?youtube\.com\/.+/i,
      /^https?:\/\/youtu\.be\/.+/i
    ],
    attributes: { providerNameSlug: "youtube", responsive: true }
  },
  {
    // Deprecate Facebook Embed per FB policy
    // See: https://developers.facebook.com/docs/plugins/oembed-legacy
    name: "facebook",
    title: getTitle("Facebook"),
    icon: import_icons.embedFacebookIcon,
    keywords: [(0, import_i18n.__)("social")],
    description: (0, import_i18n.__)("Embed a Facebook post."),
    scope: ["block"],
    patterns: [],
    attributes: {
      providerNameSlug: "facebook",
      previewable: false,
      responsive: true
    }
  },
  {
    // Deprecate Instagram per FB policy
    // See: https://developers.facebook.com/docs/instagram/oembed-legacy
    name: "instagram",
    title: getTitle("Instagram"),
    icon: import_icons.embedInstagramIcon,
    keywords: [(0, import_i18n.__)("image"), (0, import_i18n.__)("social")],
    description: (0, import_i18n.__)("Embed an Instagram post."),
    scope: ["block"],
    patterns: [],
    attributes: { providerNameSlug: "instagram", responsive: true }
  },
  {
    name: "wordpress",
    title: getTitle("WordPress"),
    icon: import_icons.embedWordPressIcon,
    keywords: [(0, import_i18n.__)("post"), (0, import_i18n.__)("blog")],
    description: (0, import_i18n.__)("Embed a WordPress post."),
    attributes: {
      providerNameSlug: "wordpress"
    }
  },
  {
    name: "soundcloud",
    title: getTitle("SoundCloud"),
    icon: import_icons.embedAudioIcon,
    keywords: [(0, import_i18n.__)("music"), (0, import_i18n.__)("audio")],
    description: (0, import_i18n.__)("Embed SoundCloud content."),
    patterns: [/^https?:\/\/(www\.)?soundcloud\.com\/.+/i],
    attributes: { providerNameSlug: "soundcloud", responsive: true }
  },
  {
    name: "spotify",
    title: getTitle("Spotify"),
    icon: import_icons.embedSpotifyIcon,
    keywords: [(0, import_i18n.__)("music"), (0, import_i18n.__)("audio")],
    description: (0, import_i18n.__)("Embed Spotify content."),
    patterns: [/^https?:\/\/(open|play)\.spotify\.com\/.+/i],
    attributes: { providerNameSlug: "spotify", responsive: true }
  },
  {
    name: "flickr",
    title: getTitle("Flickr"),
    icon: import_icons.embedFlickrIcon,
    keywords: [(0, import_i18n.__)("image")],
    description: (0, import_i18n.__)("Embed Flickr content."),
    patterns: [
      /^https?:\/\/(www\.)?flickr\.com\/.+/i,
      /^https?:\/\/flic\.kr\/.+/i
    ],
    attributes: { providerNameSlug: "flickr", responsive: true }
  },
  {
    name: "vimeo",
    title: getTitle("Vimeo"),
    icon: import_icons.embedVimeoIcon,
    keywords: [(0, import_i18n.__)("video")],
    description: (0, import_i18n.__)("Embed a Vimeo video."),
    patterns: [/^https?:\/\/(www\.)?vimeo\.com\/.+/i],
    attributes: { providerNameSlug: "vimeo", responsive: true }
  },
  {
    name: "animoto",
    title: getTitle("Animoto"),
    icon: import_icons.embedAnimotoIcon,
    description: (0, import_i18n.__)("Embed an Animoto video."),
    patterns: [/^https?:\/\/(www\.)?(animoto|video214)\.com\/.+/i],
    attributes: { providerNameSlug: "animoto", responsive: true }
  },
  {
    name: "cloudup",
    title: getTitle("Cloudup"),
    icon: import_icons.embedContentIcon,
    description: (0, import_i18n.__)("Embed Cloudup content."),
    patterns: [/^https?:\/\/cloudup\.com\/.+/i],
    attributes: { providerNameSlug: "cloudup", responsive: true }
  },
  {
    // Deprecated since CollegeHumor content is now powered by YouTube.
    name: "collegehumor",
    title: getTitle("CollegeHumor"),
    icon: import_icons.embedVideoIcon,
    description: (0, import_i18n.__)("Embed CollegeHumor content."),
    scope: ["block"],
    patterns: [],
    attributes: { providerNameSlug: "collegehumor", responsive: true }
  },
  {
    name: "crowdsignal",
    title: getTitle("Crowdsignal"),
    icon: import_icons.embedContentIcon,
    keywords: ["polldaddy", (0, import_i18n.__)("survey")],
    description: (0, import_i18n.__)("Embed Crowdsignal (formerly Polldaddy) content."),
    patterns: [
      /^https?:\/\/((.+\.)?polldaddy\.com|poll\.fm|.+\.crowdsignal\.net|.+\.survey\.fm)\/.+/i
    ],
    attributes: { providerNameSlug: "crowdsignal", responsive: true }
  },
  {
    name: "dailymotion",
    title: getTitle("Dailymotion"),
    icon: import_icons.embedDailymotionIcon,
    keywords: [(0, import_i18n.__)("video")],
    description: (0, import_i18n.__)("Embed a Dailymotion video."),
    patterns: [/^https?:\/\/(www\.)?dailymotion\.com\/.+/i],
    attributes: { providerNameSlug: "dailymotion", responsive: true }
  },
  {
    name: "imgur",
    title: getTitle("Imgur"),
    icon: import_icons.embedPhotoIcon,
    description: (0, import_i18n.__)("Embed Imgur content."),
    patterns: [/^https?:\/\/(.+\.)?imgur\.com\/.+/i],
    attributes: { providerNameSlug: "imgur", responsive: true }
  },
  {
    name: "issuu",
    title: getTitle("Issuu"),
    icon: import_icons.embedContentIcon,
    description: (0, import_i18n.__)("Embed Issuu content."),
    patterns: [/^https?:\/\/(www\.)?issuu\.com\/.+/i],
    attributes: { providerNameSlug: "issuu", responsive: true }
  },
  {
    name: "kickstarter",
    title: getTitle("Kickstarter"),
    icon: import_icons.embedContentIcon,
    description: (0, import_i18n.__)("Embed Kickstarter content."),
    patterns: [
      /^https?:\/\/(www\.)?kickstarter\.com\/.+/i,
      /^https?:\/\/kck\.st\/.+/i
    ],
    attributes: { providerNameSlug: "kickstarter", responsive: true }
  },
  {
    name: "mixcloud",
    title: getTitle("Mixcloud"),
    icon: import_icons.embedAudioIcon,
    keywords: [(0, import_i18n.__)("music"), (0, import_i18n.__)("audio")],
    description: (0, import_i18n.__)("Embed Mixcloud content."),
    patterns: [/^https?:\/\/(www\.)?mixcloud\.com\/.+/i],
    attributes: { providerNameSlug: "mixcloud", responsive: true }
  },
  {
    name: "pocket-casts",
    title: getTitle("Pocket Casts"),
    icon: import_icons.embedPocketCastsIcon,
    keywords: [(0, import_i18n.__)("podcast"), (0, import_i18n.__)("audio")],
    description: (0, import_i18n.__)("Embed a podcast player from Pocket Casts."),
    patterns: [/^https:\/\/pca.st\/\w+/i],
    attributes: { providerNameSlug: "pocket-casts", responsive: true }
  },
  {
    name: "reddit",
    title: getTitle("Reddit"),
    icon: import_icons.embedRedditIcon,
    description: (0, import_i18n.__)("Embed a Reddit thread."),
    patterns: [/^https?:\/\/(www\.)?reddit\.com\/.+/i],
    attributes: { providerNameSlug: "reddit", responsive: true }
  },
  {
    name: "reverbnation",
    title: getTitle("ReverbNation"),
    icon: import_icons.embedAudioIcon,
    description: (0, import_i18n.__)("Embed ReverbNation content."),
    patterns: [/^https?:\/\/(www\.)?reverbnation\.com\/.+/i],
    attributes: { providerNameSlug: "reverbnation", responsive: true }
  },
  {
    name: "scribd",
    title: getTitle("Scribd"),
    icon: import_icons.embedContentIcon,
    description: (0, import_i18n.__)("Embed Scribd content."),
    patterns: [/^https?:\/\/(www\.)?scribd\.com\/.+/i],
    attributes: { providerNameSlug: "scribd", responsive: true }
  },
  {
    name: "smugmug",
    title: getTitle("SmugMug"),
    icon: import_icons.embedPhotoIcon,
    description: (0, import_i18n.__)("Embed SmugMug content."),
    patterns: [/^https?:\/\/(.+\.)?smugmug\.com\/.*/i],
    attributes: {
      providerNameSlug: "smugmug",
      previewable: false,
      responsive: true
    }
  },
  {
    name: "speaker-deck",
    title: getTitle("Speaker Deck"),
    icon: import_icons.embedContentIcon,
    description: (0, import_i18n.__)("Embed Speaker Deck content."),
    patterns: [/^https?:\/\/(www\.)?speakerdeck\.com\/.+/i],
    attributes: { providerNameSlug: "speaker-deck", responsive: true }
  },
  {
    name: "tiktok",
    title: getTitle("TikTok"),
    icon: import_icons.embedVideoIcon,
    keywords: [(0, import_i18n.__)("video")],
    description: (0, import_i18n.__)("Embed a TikTok video."),
    patterns: [/^https?:\/\/(www\.)?tiktok\.com\/.+/i],
    attributes: { providerNameSlug: "tiktok", responsive: true }
  },
  {
    name: "ted",
    title: getTitle("TED"),
    icon: import_icons.embedVideoIcon,
    description: (0, import_i18n.__)("Embed a TED video."),
    patterns: [/^https?:\/\/(www\.|embed\.)?ted\.com\/.+/i],
    attributes: { providerNameSlug: "ted", responsive: true }
  },
  {
    name: "tumblr",
    title: getTitle("Tumblr"),
    icon: import_icons.embedTumblrIcon,
    keywords: [(0, import_i18n.__)("social")],
    description: (0, import_i18n.__)("Embed a Tumblr post."),
    patterns: [/^https?:\/\/(.+)\.tumblr\.com\/.+/i],
    attributes: { providerNameSlug: "tumblr", responsive: true }
  },
  {
    name: "videopress",
    title: getTitle("VideoPress"),
    icon: import_icons.embedVideoIcon,
    keywords: [(0, import_i18n.__)("video")],
    description: (0, import_i18n.__)("Embed a VideoPress video."),
    patterns: [/^https?:\/\/videopress\.com\/.+/i],
    attributes: { providerNameSlug: "videopress", responsive: true }
  },
  {
    name: "wordpress-tv",
    title: getTitle("WordPress.tv"),
    icon: import_icons.embedVideoIcon,
    description: (0, import_i18n.__)("Embed a WordPress.tv video."),
    patterns: [/^https?:\/\/wordpress\.tv\/.+/i],
    attributes: { providerNameSlug: "wordpress-tv", responsive: true }
  },
  {
    name: "amazon-kindle",
    title: getTitle("Amazon Kindle"),
    icon: import_icons.embedAmazonIcon,
    keywords: [(0, import_i18n.__)("ebook")],
    description: (0, import_i18n.__)("Embed Amazon Kindle content."),
    patterns: [
      /^https?:\/\/([a-z0-9-]+\.)?(amazon|amzn)(\.[a-z]{2,4})+\/.+/i,
      /^https?:\/\/(www\.)?(a\.co|z\.cn)\/.+/i
    ],
    attributes: { providerNameSlug: "amazon-kindle" }
  },
  {
    name: "pinterest",
    title: getTitle("Pinterest"),
    icon: import_icons.embedPinterestIcon,
    keywords: [(0, import_i18n.__)("social"), (0, import_i18n.__)("bookmark")],
    description: (0, import_i18n.__)("Embed Pinterest pins, boards, and profiles."),
    patterns: [
      /^https?:\/\/([a-z]{2}|www)\.pinterest\.com(\.(au|mx))?\/.*/i
    ],
    attributes: { providerNameSlug: "pinterest" }
  },
  {
    name: "wolfram-cloud",
    title: getTitle("Wolfram"),
    icon: import_icons.embedWolframIcon,
    description: (0, import_i18n.__)("Embed Wolfram notebook content."),
    patterns: [/^https?:\/\/(www\.)?wolframcloud\.com\/obj\/.+/i],
    attributes: { providerNameSlug: "wolfram-cloud", responsive: true }
  },
  {
    name: "bluesky",
    title: getTitle("Bluesky"),
    icon: import_icons.embedBlueskyIcon,
    description: (0, import_i18n.__)("Embed a Bluesky post."),
    patterns: [/^https?:\/\/bsky\.app\/profile\/.+\/post\/.+/i],
    attributes: { providerNameSlug: "bluesky" }
  }
];
variations.forEach((variation) => {
  if (variation.isActive) {
    return;
  }
  variation.isActive = (blockAttributes, variationAttributes) => blockAttributes.providerNameSlug === variationAttributes.providerNameSlug;
});
var variations_default = variations;
//# sourceMappingURL=variations.cjs.map
