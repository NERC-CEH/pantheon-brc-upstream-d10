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

// packages/block-library/src/post-featured-image/dimension-controls.jsx
var dimension_controls_exports = {};
__export(dimension_controls_exports, {
  default: () => dimension_controls_default
});
module.exports = __toCommonJS(dimension_controls_exports);
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_style_state = require("../utils/style-state.cjs");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var { DimensionsTool } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
var DEFAULT_SCALE = "cover";
var DIMENSION_KEYS = ["aspectRatio", "width", "height", "scale"];
var scaleOptions = [
  {
    value: "cover",
    label: (0, import_i18n._x)("Cover", "Scale option for Image dimension control"),
    help: (0, import_i18n.__)(
      "Image is scaled and cropped to fill the entire space without being distorted."
    )
  },
  {
    value: "contain",
    label: (0, import_i18n._x)("Contain", "Scale option for Image dimension control"),
    help: (0, import_i18n.__)(
      "Image is scaled to fill the space without clipping nor distorting."
    )
  },
  {
    value: "fill",
    label: (0, import_i18n._x)("Fill", "Scale option for Image dimension control"),
    help: (0, import_i18n.__)(
      "Image will be stretched and distorted to completely fill the space."
    )
  }
];
var DimensionControls = ({
  clientId,
  attributes,
  setAttributes,
  selectedStyleState,
  hasSelectedStyleState = false
}) => {
  const { style } = attributes;
  const selectedStyleStateKey = (0, import_style_state.getStyleStateKey)(selectedStyleState);
  const activeAspectRatio = (0, import_style_state.getActiveDimensionValue)({
    attributes,
    selectedState: selectedStyleState,
    hasSelectedStyleState,
    attributeKey: "aspectRatio"
  });
  const activeWidth = (0, import_style_state.getActiveDimensionValue)({
    attributes,
    selectedState: selectedStyleState,
    hasSelectedStyleState,
    attributeKey: "width"
  });
  const activeHeight = (0, import_style_state.getActiveDimensionValue)({
    attributes,
    selectedState: selectedStyleState,
    hasSelectedStyleState,
    attributeKey: "height"
  });
  const activeScale = (0, import_style_state.getActiveDimensionValue)({
    attributes,
    selectedState: selectedStyleState,
    hasSelectedStyleState,
    attributeKey: "scale",
    styleKey: "objectFit"
  });
  const [availableUnits] = (0, import_block_editor.useSettings)("spacing.units");
  const units = (0, import_components.__experimentalUseCustomUnits)({
    availableUnits: availableUnits || ["px", "%", "vw", "em", "rem"]
  });
  const setDimensionAttributes = (nextDimensions) => {
    const nextImageDimensions = {
      ...nextDimensions,
      width: !nextDimensions.width && nextDimensions.height ? "auto" : nextDimensions.width
    };
    setAttributes(
      (0, import_style_state.getDimensionUpdateAttributes)({
        style,
        selectedState: selectedStyleState,
        hasSelectedStyleState,
        nextDimensions: nextImageDimensions,
        dimensionKeyMap: { scale: "objectFit" },
        dimensionKeys: DIMENSION_KEYS
      })
    );
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    DimensionsTool,
    {
      panelId: clientId,
      value: {
        aspectRatio: activeAspectRatio,
        width: activeWidth,
        height: activeHeight,
        scale: activeScale
      },
      onChange: setDimensionAttributes,
      defaultScale: DEFAULT_SCALE,
      defaultAspectRatio: "auto",
      scaleOptions,
      unitsOptions: units
    },
    selectedStyleStateKey
  );
};
var dimension_controls_default = DimensionControls;
//# sourceMappingURL=dimension-controls.cjs.map
