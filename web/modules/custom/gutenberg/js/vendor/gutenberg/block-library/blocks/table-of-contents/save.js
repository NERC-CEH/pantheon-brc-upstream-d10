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

// packages/block-library/src/table-of-contents/save.js
var save_exports = {};
__export(save_exports, {
  default: () => save
});
module.exports = __toCommonJS(save_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_list = __toESM(require("./list.cjs"));
var import_utils = require("./utils.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function save({
  attributes: { headings = [], ordered = true }
}) {
  if (headings.length === 0) {
    return null;
  }
  const ListTag = ordered ? "ol" : "ul";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { ...import_block_editor.useBlockProps.save(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListTag, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_list.default,
    {
      nestedHeadingList: (0, import_utils.linearToNestedHeadingList)(headings),
      ordered
    }
  ) }) });
}
//# sourceMappingURL=save.cjs.map
