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

// packages/block-library/src/tab/slug-from-label.js
var slug_from_label_exports = {};
__export(slug_from_label_exports, {
  default: () => slugFromLabel
});
module.exports = __toCommonJS(slug_from_label_exports);
var import_url = require("@wordpress/url");
function slugFromLabel(label, tabIndex) {
  const htmlDocument = new window.DOMParser().parseFromString(
    label,
    "text/html"
  );
  if (htmlDocument.body?.textContent) {
    return (0, import_url.cleanForSlug)(htmlDocument.body.textContent);
  }
  return `tab-panel-${tabIndex}`;
}
//# sourceMappingURL=slug-from-label.cjs.map
