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

// packages/block-library/src/video/tracks.jsx
var tracks_exports = {};
__export(tracks_exports, {
  default: () => Tracks
});
module.exports = __toCommonJS(tracks_exports);
var import_jsx_runtime = require("react/jsx-runtime");
function Tracks({ tracks = [] }) {
  return tracks.map((track) => {
    const { id, ...trackAttrs } = track;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("track", { ...trackAttrs }, id ?? trackAttrs.src);
  });
}
//# sourceMappingURL=tracks.cjs.map
