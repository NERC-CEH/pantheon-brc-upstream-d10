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

// packages/block-library/src/social-link/social-list.js
var social_list_exports = {};
__export(social_list_exports, {
  getSocialService: () => getSocialService
});
module.exports = __toCommonJS(social_list_exports);
var import_i18n = require("@wordpress/i18n");
var import_icons = require("./icons/index.cjs");
function getSocialService(variation) {
  if (!variation?.name) {
    return {
      icon: import_icons.ChainIcon,
      label: (0, import_i18n.__)("Social Icon")
    };
  }
  return {
    icon: variation?.icon ?? import_icons.ChainIcon,
    label: variation?.title ?? (0, import_i18n.__)("Social Icon")
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getSocialService
});
//# sourceMappingURL=social-list.cjs.map
