"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/block-library/src/heading/autogenerate-anchors.js
var autogenerate_anchors_exports = {};
__export(autogenerate_anchors_exports, {
  generateAnchor: () => generateAnchor,
  setAnchor: () => setAnchor
});
module.exports = __toCommonJS(autogenerate_anchors_exports);
var import_remove_accents = __toESM(require("remove-accents"));
var anchors = {};
var getTextWithoutMarkup = (text) => {
  const dummyElement = document.createElement("div");
  dummyElement.innerHTML = text;
  return dummyElement.innerText;
};
var getSlug = (content) => {
  return (0, import_remove_accents.default)(getTextWithoutMarkup(content)).replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase().replace(/(^-+)|(-+$)/g, "");
};
var generateAnchor = (clientId, content) => {
  const slug = getSlug(content);
  if ("" === slug) {
    return null;
  }
  delete anchors[clientId];
  let anchor = slug;
  let i = 0;
  while (Object.values(anchors).includes(anchor)) {
    i += 1;
    anchor = slug + "-" + i;
  }
  return anchor;
};
var setAnchor = (clientId, anchor) => {
  anchors[clientId] = anchor;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateAnchor,
  setAnchor
});
//# sourceMappingURL=autogenerate-anchors.cjs.map
