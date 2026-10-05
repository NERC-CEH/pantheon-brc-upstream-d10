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

// packages/block-library/src/comment-template/util.js
var util_exports = {};
__export(util_exports, {
  convertToTree: () => convertToTree
});
module.exports = __toCommonJS(util_exports);
var convertToTree = (data) => {
  const table = {};
  if (!data) {
    return [];
  }
  data.forEach((item) => {
    table[item.id] = { commentId: item.id, children: [] };
  });
  const tree = [];
  data.forEach((item) => {
    if (item.parent) {
      table[item.parent]?.children.push(table[item.id]);
    } else {
      tree.push(table[item.id]);
    }
  });
  return tree;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  convertToTree
});
//# sourceMappingURL=util.cjs.map
