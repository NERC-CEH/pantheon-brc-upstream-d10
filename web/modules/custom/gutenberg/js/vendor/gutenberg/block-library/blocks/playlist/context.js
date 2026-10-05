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

// packages/block-library/src/playlist/context.js
var context_exports = {};
__export(context_exports, {
  PlaylistContext: () => PlaylistContext
});
module.exports = __toCommonJS(context_exports);
var import_element = require("@wordpress/element");
var PlaylistContext = (0, import_element.createContext)({
  currentTrackClientId: null,
  setCurrentTrackClientId: () => {
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PlaylistContext
});
//# sourceMappingURL=context.cjs.map
