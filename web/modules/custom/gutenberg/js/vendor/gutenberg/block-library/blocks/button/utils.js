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

// packages/block-library/src/button/utils.js
var utils_exports = {};
__export(utils_exports, {
  getWidthClasses: () => getWidthClasses,
  isPercentageWidth: () => isPercentageWidth
});
module.exports = __toCommonJS(utils_exports);
function isPercentageWidth(width) {
  return typeof width === "string" && width.endsWith("%");
}
function getWidthClasses(width) {
  if (!width) {
    return {};
  }
  if (isPercentageWidth(width)) {
    const legacyWidthClasses = {
      "25%": "wp-block-button__width-25",
      "50%": "wp-block-button__width-50",
      "75%": "wp-block-button__width-75",
      "100%": "wp-block-button__width-100"
    };
    return {
      "has-custom-width": true,
      "wp-block-button__width": true,
      // Maintain legacy class for backwards compatibility.
      ...legacyWidthClasses[width] && {
        [legacyWidthClasses[width]]: true
      }
    };
  }
  return {
    "has-custom-width": true
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getWidthClasses,
  isPercentageWidth
});
//# sourceMappingURL=utils.cjs.map
