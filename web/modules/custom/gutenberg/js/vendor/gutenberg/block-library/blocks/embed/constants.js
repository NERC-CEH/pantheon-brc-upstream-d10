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

// packages/block-library/src/embed/constants.js
var constants_exports = {};
__export(constants_exports, {
  ASPECT_RATIOS: () => ASPECT_RATIOS,
  WP_EMBED_TYPE: () => WP_EMBED_TYPE
});
module.exports = __toCommonJS(constants_exports);
var ASPECT_RATIOS = [
  // Common video resolutions.
  { ratio: "2.33", className: "wp-embed-aspect-21-9" },
  { ratio: "2.00", className: "wp-embed-aspect-18-9" },
  { ratio: "1.78", className: "wp-embed-aspect-16-9" },
  { ratio: "1.33", className: "wp-embed-aspect-4-3" },
  // Vertical video and instagram square video support.
  { ratio: "1.00", className: "wp-embed-aspect-1-1" },
  { ratio: "0.56", className: "wp-embed-aspect-9-16" },
  { ratio: "0.50", className: "wp-embed-aspect-1-2" }
];
var WP_EMBED_TYPE = "wp-embed";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ASPECT_RATIOS,
  WP_EMBED_TYPE
});
//# sourceMappingURL=constants.cjs.map
