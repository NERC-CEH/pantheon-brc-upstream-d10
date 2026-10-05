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

// packages/block-library/src/media-text/constants.js
var constants_exports = {};
__export(constants_exports, {
  DEFAULT_MEDIA_SIZE_SLUG: () => DEFAULT_MEDIA_SIZE_SLUG,
  LINK_DESTINATION_ATTACHMENT: () => LINK_DESTINATION_ATTACHMENT,
  LINK_DESTINATION_MEDIA: () => LINK_DESTINATION_MEDIA,
  LINK_DESTINATION_NONE: () => LINK_DESTINATION_NONE,
  TEMPLATE: () => TEMPLATE,
  WIDTH_CONSTRAINT_PERCENTAGE: () => WIDTH_CONSTRAINT_PERCENTAGE
});
module.exports = __toCommonJS(constants_exports);
var import_i18n = require("@wordpress/i18n");
var DEFAULT_MEDIA_SIZE_SLUG = "full";
var WIDTH_CONSTRAINT_PERCENTAGE = 15;
var LINK_DESTINATION_NONE = "none";
var LINK_DESTINATION_MEDIA = "media";
var LINK_DESTINATION_ATTACHMENT = "attachment";
var TEMPLATE = [
  [
    "core/paragraph",
    {
      placeholder: (0, import_i18n._x)("Content…", "content placeholder")
    }
  ]
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_MEDIA_SIZE_SLUG,
  LINK_DESTINATION_ATTACHMENT,
  LINK_DESTINATION_MEDIA,
  LINK_DESTINATION_NONE,
  TEMPLATE,
  WIDTH_CONSTRAINT_PERCENTAGE
});
//# sourceMappingURL=constants.cjs.map
