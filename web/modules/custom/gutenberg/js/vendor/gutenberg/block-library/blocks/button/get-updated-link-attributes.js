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

// packages/block-library/src/button/get-updated-link-attributes.js
var get_updated_link_attributes_exports = {};
__export(get_updated_link_attributes_exports, {
  getUpdatedLinkAttributes: () => getUpdatedLinkAttributes
});
module.exports = __toCommonJS(get_updated_link_attributes_exports);
var import_url = require("@wordpress/url");
var import_constants = require("./constants.cjs");
function getUpdatedLinkAttributes({
  rel = "",
  url = "",
  opensInNewTab,
  nofollow
}) {
  let newLinkTarget;
  let updatedRel = rel;
  if (opensInNewTab) {
    newLinkTarget = import_constants.NEW_TAB_TARGET;
    updatedRel = updatedRel?.includes(import_constants.NEW_TAB_REL) ? updatedRel : updatedRel + ` ${import_constants.NEW_TAB_REL}`;
  } else {
    const relRegex = new RegExp(`\\b${import_constants.NEW_TAB_REL}\\s*`, "g");
    updatedRel = updatedRel?.replace(relRegex, "").trim();
  }
  if (nofollow) {
    updatedRel = updatedRel?.includes(import_constants.NOFOLLOW_REL) ? updatedRel : (updatedRel + ` ${import_constants.NOFOLLOW_REL}`).trim();
  } else {
    const relRegex = new RegExp(`\\b${import_constants.NOFOLLOW_REL}\\s*`, "g");
    updatedRel = updatedRel?.replace(relRegex, "").trim();
  }
  return {
    url: (0, import_url.prependHTTPS)(url),
    linkTarget: newLinkTarget,
    rel: updatedRel || void 0
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getUpdatedLinkAttributes
});
//# sourceMappingURL=get-updated-link-attributes.cjs.map
