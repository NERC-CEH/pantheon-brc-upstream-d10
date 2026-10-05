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

// packages/block-library/src/post-featured-image/overlay.jsx
var overlay_exports = {};
__export(overlay_exports, {
  default: () => overlay_default
});
module.exports = __toCommonJS(overlay_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_compose = require("@wordpress/compose");
var import_utils = require("./utils.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var Overlay = ({ attributes, overlayColor }) => {
  const { dimRatio } = attributes;
  const { gradientClass, gradientValue } = (0, import_block_editor.__experimentalUseGradient)();
  const colorGradientSettings = (0, import_block_editor.__experimentalUseMultipleOriginColorsAndGradients)();
  const borderProps = (0, import_block_editor.__experimentalUseBorderProps)(attributes);
  const overlayStyles = {
    backgroundColor: overlayColor.color,
    backgroundImage: gradientValue,
    ...borderProps.style
  };
  if (!colorGradientSettings.hasColorsOrGradients || !dimRatio) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "span",
    {
      "aria-hidden": "true",
      className: (0, import_clsx.default)(
        "wp-block-post-featured-image__overlay",
        (0, import_utils.dimRatioToClass)(dimRatio),
        {
          [overlayColor.class]: overlayColor.class,
          "has-background-dim": dimRatio !== void 0,
          "has-background-gradient": gradientValue,
          [gradientClass]: gradientClass
        },
        borderProps.className
      ),
      style: overlayStyles
    }
  );
};
var overlay_default = (0, import_compose.compose)([
  (0, import_block_editor.withColors)({ overlayColor: "background-color" })
])(Overlay);
//# sourceMappingURL=overlay.cjs.map
