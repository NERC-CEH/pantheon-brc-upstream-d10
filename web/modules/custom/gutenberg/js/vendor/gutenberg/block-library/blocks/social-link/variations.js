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

// packages/block-library/src/social-link/variations.js
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var import_icons = require("./icons/index.cjs");
var variations = [
  {
    isDefault: true,
    name: "wordpress",
    attributes: { service: "wordpress" },
    title: (0, import_i18n._x)("WordPress", "social link block variation name"),
    icon: import_icons.WordPressIcon
  },
  {
    name: "fivehundredpx",
    attributes: { service: "fivehundredpx" },
    title: (0, import_i18n._x)("500px", "social link block variation name"),
    icon: import_icons.FivehundredpxIcon
  },
  {
    name: "amazon",
    attributes: { service: "amazon" },
    title: (0, import_i18n._x)("Amazon", "social link block variation name"),
    icon: import_icons.AmazonIcon
  },
  {
    name: "bandcamp",
    attributes: { service: "bandcamp" },
    title: (0, import_i18n._x)("Bandcamp", "social link block variation name"),
    icon: import_icons.BandcampIcon
  },
  {
    name: "behance",
    attributes: { service: "behance" },
    title: (0, import_i18n._x)("Behance", "social link block variation name"),
    icon: import_icons.BehanceIcon
  },
  {
    name: "bluesky",
    attributes: { service: "bluesky" },
    title: (0, import_i18n._x)("Bluesky", "social link block variation name"),
    icon: import_icons.BlueskyIcon
  },
  {
    name: "chain",
    attributes: { service: "chain" },
    title: (0, import_i18n._x)("Link", "social link block variation name"),
    icon: import_icons.ChainIcon
  },
  {
    name: "codepen",
    attributes: { service: "codepen" },
    title: (0, import_i18n._x)("CodePen", "social link block variation name"),
    icon: import_icons.CodepenIcon
  },
  {
    name: "deviantart",
    attributes: { service: "deviantart" },
    title: (0, import_i18n._x)("DeviantArt", "social link block variation name"),
    icon: import_icons.DeviantArtIcon
  },
  {
    name: "discord",
    attributes: { service: "discord" },
    title: (0, import_i18n._x)("Discord", "social link block variation name"),
    icon: import_icons.DiscordIcon
  },
  {
    name: "dribbble",
    attributes: { service: "dribbble" },
    title: (0, import_i18n._x)("Dribbble", "social link block variation name"),
    icon: import_icons.DribbbleIcon
  },
  {
    name: "dropbox",
    attributes: { service: "dropbox" },
    title: (0, import_i18n._x)("Dropbox", "social link block variation name"),
    icon: import_icons.DropboxIcon
  },
  {
    name: "etsy",
    attributes: { service: "etsy" },
    title: (0, import_i18n._x)("Etsy", "social link block variation name"),
    icon: import_icons.EtsyIcon
  },
  {
    name: "facebook",
    attributes: { service: "facebook" },
    title: (0, import_i18n._x)("Facebook", "social link block variation name"),
    icon: import_icons.FacebookIcon
  },
  {
    name: "feed",
    attributes: { service: "feed" },
    title: (0, import_i18n._x)("RSS Feed", "social link block variation name"),
    icon: import_icons.FeedIcon
  },
  {
    name: "flickr",
    attributes: { service: "flickr" },
    title: (0, import_i18n._x)("Flickr", "social link block variation name"),
    icon: import_icons.FlickrIcon
  },
  {
    name: "foursquare",
    attributes: { service: "foursquare" },
    title: (0, import_i18n._x)("Foursquare", "social link block variation name"),
    icon: import_icons.FoursquareIcon
  },
  {
    name: "goodreads",
    attributes: { service: "goodreads" },
    title: (0, import_i18n._x)("Goodreads", "social link block variation name"),
    icon: import_icons.GoodreadsIcon
  },
  {
    name: "google",
    attributes: { service: "google" },
    title: (0, import_i18n._x)("Google", "social link block variation name"),
    icon: import_icons.GoogleIcon
  },
  {
    name: "github",
    attributes: { service: "github" },
    title: (0, import_i18n._x)("GitHub", "social link block variation name"),
    icon: import_icons.GitHubIcon
  },
  {
    name: "gravatar",
    attributes: { service: "gravatar" },
    title: (0, import_i18n._x)("Gravatar", "social link block variation name"),
    icon: import_icons.GravatarIcon
  },
  {
    name: "instagram",
    attributes: { service: "instagram" },
    title: (0, import_i18n._x)("Instagram", "social link block variation name"),
    icon: import_icons.InstagramIcon
  },
  {
    name: "lastfm",
    attributes: { service: "lastfm" },
    title: (0, import_i18n._x)("Last.fm", "social link block variation name"),
    icon: import_icons.LastfmIcon
  },
  {
    name: "linkedin",
    attributes: { service: "linkedin" },
    title: (0, import_i18n._x)("LinkedIn", "social link block variation name"),
    icon: import_icons.LinkedInIcon
  },
  {
    name: "mail",
    attributes: { service: "mail" },
    title: (0, import_i18n._x)("Mail", "social link block variation name"),
    keywords: ["email", "e-mail"],
    icon: import_icons.MailIcon
  },
  {
    name: "mastodon",
    attributes: { service: "mastodon" },
    title: (0, import_i18n._x)("Mastodon", "social link block variation name"),
    icon: import_icons.MastodonIcon
  },
  {
    name: "meetup",
    attributes: { service: "meetup" },
    title: (0, import_i18n._x)("Meetup", "social link block variation name"),
    icon: import_icons.MeetupIcon
  },
  {
    name: "medium",
    attributes: { service: "medium" },
    title: (0, import_i18n._x)("Medium", "social link block variation name"),
    icon: import_icons.MediumIcon
  },
  {
    name: "patreon",
    attributes: { service: "patreon" },
    title: (0, import_i18n._x)("Patreon", "social link block variation name"),
    icon: import_icons.PatreonIcon
  },
  {
    name: "pinterest",
    attributes: { service: "pinterest" },
    title: (0, import_i18n._x)("Pinterest", "social link block variation name"),
    icon: import_icons.PinterestIcon
  },
  {
    name: "pocket",
    attributes: { service: "pocket" },
    title: (0, import_i18n._x)("Pocket", "social link block variation name"),
    icon: import_icons.PocketIcon
  },
  {
    name: "reddit",
    attributes: { service: "reddit" },
    title: (0, import_i18n._x)("Reddit", "social link block variation name"),
    icon: import_icons.RedditIcon
  },
  {
    name: "skype",
    attributes: { service: "skype" },
    title: (0, import_i18n._x)("Skype", "social link block variation name"),
    icon: import_icons.SkypeIcon,
    // Deprecated: Skype service is no longer available.
    scope: []
  },
  {
    name: "snapchat",
    attributes: { service: "snapchat" },
    title: (0, import_i18n._x)("Snapchat", "social link block variation name"),
    icon: import_icons.SnapchatIcon
  },
  {
    name: "soundcloud",
    attributes: { service: "soundcloud" },
    title: (0, import_i18n._x)("SoundCloud", "social link block variation name"),
    icon: import_icons.SoundCloudIcon
  },
  {
    name: "spotify",
    attributes: { service: "spotify" },
    title: (0, import_i18n._x)("Spotify", "social link block variation name"),
    icon: import_icons.SpotifyIcon
  },
  {
    name: "telegram",
    attributes: { service: "telegram" },
    title: (0, import_i18n._x)("Telegram", "social link block variation name"),
    icon: import_icons.TelegramIcon
  },
  {
    name: "threads",
    attributes: { service: "threads" },
    title: (0, import_i18n._x)("Threads", "social link block variation name"),
    icon: import_icons.ThreadsIcon
  },
  {
    name: "tiktok",
    attributes: { service: "tiktok" },
    title: (0, import_i18n._x)("TikTok", "social link block variation name"),
    icon: import_icons.TiktokIcon
  },
  {
    name: "tumblr",
    attributes: { service: "tumblr" },
    title: (0, import_i18n._x)("Tumblr", "social link block variation name"),
    icon: import_icons.TumblrIcon
  },
  {
    name: "twitch",
    attributes: { service: "twitch" },
    title: (0, import_i18n._x)("Twitch", "social link block variation name"),
    icon: import_icons.TwitchIcon
  },
  {
    name: "twitter",
    attributes: { service: "twitter" },
    title: (0, import_i18n._x)("Twitter", "social link block variation name"),
    icon: import_icons.TwitterIcon
  },
  {
    name: "vimeo",
    attributes: { service: "vimeo" },
    title: (0, import_i18n._x)("Vimeo", "social link block variation name"),
    icon: import_icons.VimeoIcon
  },
  {
    name: "vk",
    attributes: { service: "vk" },
    title: (0, import_i18n._x)("VK", "social link block variation name"),
    icon: import_icons.VkIcon
  },
  {
    name: "whatsapp",
    attributes: { service: "whatsapp" },
    title: (0, import_i18n._x)("WhatsApp", "social link block variation name"),
    icon: import_icons.WhatsAppIcon
  },
  {
    name: "x",
    attributes: { service: "x" },
    keywords: ["twitter"],
    title: (0, import_i18n._x)("X", "social link block variation name"),
    icon: import_icons.XIcon
  },
  {
    name: "yelp",
    attributes: { service: "yelp" },
    title: (0, import_i18n._x)("Yelp", "social link block variation name"),
    icon: import_icons.YelpIcon
  },
  {
    name: "youtube",
    attributes: { service: "youtube" },
    title: (0, import_i18n._x)("YouTube", "social link block variation name"),
    icon: import_icons.YouTubeIcon
  }
];
variations.forEach((variation) => {
  if (variation.isActive) {
    return;
  }
  variation.isActive = (blockAttributes, variationAttributes) => blockAttributes.service === variationAttributes.service;
});
var variations_default = variations;
//# sourceMappingURL=variations.cjs.map
