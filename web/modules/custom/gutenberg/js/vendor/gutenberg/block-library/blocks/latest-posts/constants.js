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

// packages/block-library/src/latest-posts/constants.js
var constants_exports = {};
__export(constants_exports, {
  DEFAULT_EXCERPT_LENGTH: () => DEFAULT_EXCERPT_LENGTH,
  MAX_EXCERPT_LENGTH: () => MAX_EXCERPT_LENGTH,
  MIN_EXCERPT_LENGTH: () => MIN_EXCERPT_LENGTH
});
module.exports = __toCommonJS(constants_exports);
var MIN_EXCERPT_LENGTH = 10;
var MAX_EXCERPT_LENGTH = 100;
var DEFAULT_EXCERPT_LENGTH = 55;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_EXCERPT_LENGTH,
  MAX_EXCERPT_LENGTH,
  MIN_EXCERPT_LENGTH
});
//# sourceMappingURL=constants.cjs.map
