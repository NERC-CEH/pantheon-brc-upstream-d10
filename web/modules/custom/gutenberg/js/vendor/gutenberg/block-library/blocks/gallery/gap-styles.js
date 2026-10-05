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

// packages/block-library/src/gallery/gap-styles.js
var gap_styles_exports = {};
__export(gap_styles_exports, {
  default: () => GapStyles
});
module.exports = __toCommonJS(gap_styles_exports);
var import_block_editor = require("@wordpress/block-editor");
function GapStyles({ blockGap, clientId }) {
  const fallbackValue = `var( --wp--style--gallery-gap-default, var( --gallery-block--gutter-size, var( --wp--style--block-gap, 0.5em ) ) )`;
  let gapValue = fallbackValue;
  let column = fallbackValue;
  let row;
  if (!!blockGap) {
    row = typeof blockGap === "string" ? (0, import_block_editor.__experimentalGetGapCSSValue)(blockGap) : (0, import_block_editor.__experimentalGetGapCSSValue)(blockGap?.top) || fallbackValue;
    column = typeof blockGap === "string" ? (0, import_block_editor.__experimentalGetGapCSSValue)(blockGap) : (0, import_block_editor.__experimentalGetGapCSSValue)(blockGap?.left) || fallbackValue;
    gapValue = row === column ? row : `${row} ${column}`;
  }
  const gap = `#block-${clientId} {
		--wp--style--unstable-gallery-gap: ${column === "0" ? "0px" : column};
		gap: ${gapValue}
	}`;
  (0, import_block_editor.useStyleOverride)({ css: gap });
  return null;
}
//# sourceMappingURL=gap-styles.cjs.map
