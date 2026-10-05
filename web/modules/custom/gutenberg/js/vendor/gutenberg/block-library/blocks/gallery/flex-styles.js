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

// packages/block-library/src/gallery/flex-styles.js
var flex_styles_exports = {};
__export(flex_styles_exports, {
  default: () => GalleryFlexStyles
});
module.exports = __toCommonJS(flex_styles_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_global_styles_engine = require("@wordpress/global-styles-engine");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_responsive_styles = require("./responsive-styles.cjs");
var { getResponsiveMediaQueries } = (0, import_lock_unlock.unlock)(import_global_styles_engine.privateApis);
var { globalStylesDataKey } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
var GALLERY_BLOCK_NAME = "core/gallery";
var FALLBACK_VALUE = `var( --wp--style--gallery-gap-default, var( --gallery-block--gutter-size, var( --wp--style--block-gap, 0.5em ) ) )`;
function getGalleryGapCustomPropertyStyle(selector, blockGap) {
  let column = FALLBACK_VALUE;
  if (blockGap) {
    column = typeof blockGap === "string" ? (0, import_block_editor.__experimentalGetGapCSSValue)(blockGap) || FALLBACK_VALUE : (0, import_block_editor.__experimentalGetGapCSSValue)(blockGap?.left) || FALLBACK_VALUE;
  }
  return `${selector} {
		--wp--style--unstable-gallery-gap: ${column === "0" ? "0px" : column}
	}`;
}
function getBlockGapValue(style) {
  if (!Object.hasOwn(style?.spacing || {}, "blockGap")) {
    return void 0;
  }
  return style.spacing.blockGap;
}
function GalleryFlexStyles({ style, clientId }) {
  const selector = `.wp-block-gallery-${clientId}`;
  const [viewportSettings] = (0, import_block_editor.useSettings)("viewport");
  const globalStyles = (0, import_data.useSelect)(
    (select) => select(import_block_editor.store).getSettings()?.[globalStylesDataKey],
    []
  );
  const globalGalleryStyles = globalStyles?.blocks?.[GALLERY_BLOCK_NAME] || {};
  const styleBlockGap = getBlockGapValue(style);
  const globalGalleryBlockGap = globalGalleryStyles?.spacing?.blockGap ?? FALLBACK_VALUE;
  const blockGap = styleBlockGap === void 0 ? globalGalleryBlockGap : styleBlockGap;
  let css = getGalleryGapCustomPropertyStyle(selector, blockGap);
  const responsiveMediaQueries = getResponsiveMediaQueries(viewportSettings);
  Object.entries(responsiveMediaQueries).forEach(
    ([viewport, mediaQuery]) => {
      const styleViewportBlockGap = getBlockGapValue(
        style?.[viewport]
      );
      const globalViewportBlockGap = styleBlockGap === void 0 ? globalGalleryStyles?.[viewport]?.spacing?.blockGap : void 0;
      const viewportBlockGap = styleViewportBlockGap === void 0 ? globalViewportBlockGap : styleViewportBlockGap;
      if (viewportBlockGap === void 0 || viewportBlockGap === null) {
        return;
      }
      css += `${mediaQuery}{${getGalleryGapCustomPropertyStyle(
        selector,
        viewportBlockGap
      )}}`;
    }
  );
  css += (0, import_responsive_styles.getGalleryResponsiveFlexCSS)(
    selector,
    style,
    responsiveMediaQueries
  );
  (0, import_block_editor.useStyleOverride)({ css });
  return null;
}
//# sourceMappingURL=flex-styles.cjs.map
