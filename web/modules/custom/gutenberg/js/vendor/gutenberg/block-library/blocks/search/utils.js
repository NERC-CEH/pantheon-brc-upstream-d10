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

// packages/block-library/src/search/utils.js
var utils_exports = {};
__export(utils_exports, {
  MIN_WIDTH: () => MIN_WIDTH,
  PC_WIDTH_DEFAULT: () => PC_WIDTH_DEFAULT,
  PX_WIDTH_DEFAULT: () => PX_WIDTH_DEFAULT,
  isPercentageUnit: () => isPercentageUnit
});
module.exports = __toCommonJS(utils_exports);
var PC_WIDTH_DEFAULT = 50;
var PX_WIDTH_DEFAULT = 350;
var MIN_WIDTH = 220;
function isPercentageUnit(unit) {
  return unit === "%";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MIN_WIDTH,
  PC_WIDTH_DEFAULT,
  PX_WIDTH_DEFAULT,
  isPercentageUnit
});
//# sourceMappingURL=utils.cjs.map
