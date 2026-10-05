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

// packages/block-library/src/separator/use-deprecated-opacity.js
var use_deprecated_opacity_exports = {};
__export(use_deprecated_opacity_exports, {
  default: () => useDeprecatedOpacity
});
module.exports = __toCommonJS(use_deprecated_opacity_exports);
var import_element = require("@wordpress/element");
var import_compose = require("@wordpress/compose");
function useDeprecatedOpacity(opacity, currentColor, setAttributes) {
  const [deprecatedOpacityWithNoColor, setDeprecatedOpacityWithNoColor] = (0, import_element.useState)(false);
  const previousColor = (0, import_compose.usePrevious)(currentColor);
  (0, import_element.useEffect)(() => {
    if (opacity === "css" && !currentColor && !previousColor) {
      setDeprecatedOpacityWithNoColor(true);
    }
  }, [currentColor, previousColor, opacity]);
  (0, import_element.useEffect)(() => {
    if (opacity === "css" && (deprecatedOpacityWithNoColor && currentColor || previousColor && currentColor !== previousColor)) {
      setAttributes({ opacity: "alpha-channel" });
      setDeprecatedOpacityWithNoColor(false);
    }
  }, [deprecatedOpacityWithNoColor, currentColor, previousColor]);
}
//# sourceMappingURL=use-deprecated-opacity.cjs.map
