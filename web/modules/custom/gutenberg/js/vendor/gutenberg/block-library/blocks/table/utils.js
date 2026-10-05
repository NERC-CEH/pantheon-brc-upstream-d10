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

// packages/block-library/src/table/utils.js
var utils_exports = {};
__export(utils_exports, {
  normalizeRowColSpan: () => normalizeRowColSpan
});
module.exports = __toCommonJS(utils_exports);
function normalizeRowColSpan(rowColSpan) {
  const parsedValue = parseInt(rowColSpan, 10);
  if (!Number.isInteger(parsedValue)) {
    return void 0;
  }
  return parsedValue < 0 || parsedValue === 1 ? void 0 : parsedValue.toString();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  normalizeRowColSpan
});
//# sourceMappingURL=utils.cjs.map
