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

// packages/block-library/src/post-featured-image/overlay-controls.jsx
var overlay_controls_exports = {};
__export(overlay_controls_exports, {
  default: () => overlay_controls_default
});
module.exports = __toCommonJS(overlay_controls_exports);
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_compose = require("@wordpress/compose");
var import_i18n = require("@wordpress/i18n");
var import_jsx_runtime = require("react/jsx-runtime");
var Overlay = ({
  clientId,
  attributes,
  setAttributes,
  overlayColor,
  setOverlayColor
}) => {
  const { dimRatio } = attributes;
  const { gradientValue, setGradient } = (0, import_block_editor.__experimentalUseGradient)();
  const colorGradientSettings = (0, import_block_editor.__experimentalUseMultipleOriginColorsAndGradients)();
  if (!colorGradientSettings.hasColorsOrGradients) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.__experimentalColorGradientSettingsDropdown,
      {
        __experimentalIsRenderedInSidebar: true,
        settings: [
          {
            colorValue: overlayColor.color,
            gradientValue,
            label: (0, import_i18n.__)("Overlay"),
            onColorChange: setOverlayColor,
            onGradientChange: setGradient,
            isShownByDefault: true,
            resetAllFilter: () => ({
              overlayColor: void 0,
              customOverlayColor: void 0,
              gradient: void 0,
              customGradient: void 0
            }),
            clearable: true
          }
        ],
        panelId: clientId,
        ...colorGradientSettings
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanelItem,
      {
        hasValue: () => dimRatio !== void 0,
        label: (0, import_i18n.__)("Overlay opacity"),
        onDeselect: () => setAttributes({ dimRatio: 0 }),
        resetAllFilter: () => ({
          dimRatio: 0
        }),
        isShownByDefault: true,
        panelId: clientId,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.RangeControl,
          {
            label: (0, import_i18n.__)("Overlay opacity"),
            value: dimRatio,
            onChange: (newDimRatio) => setAttributes({
              dimRatio: newDimRatio
            }),
            min: 0,
            max: 100,
            step: 10,
            required: true
          }
        )
      }
    )
  ] });
};
var overlay_controls_default = (0, import_compose.compose)([
  (0, import_block_editor.withColors)({ overlayColor: "background-color" })
])(Overlay);
//# sourceMappingURL=overlay-controls.cjs.map
