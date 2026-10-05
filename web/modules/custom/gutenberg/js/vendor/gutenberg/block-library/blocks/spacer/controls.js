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

// packages/block-library/src/spacer/controls.jsx
var controls_exports = {};
__export(controls_exports, {
  default: () => SpacerControls
});
module.exports = __toCommonJS(controls_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_compose = require("@wordpress/compose");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_constants = require("./constants.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var { useSpacingSizes } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
function DimensionInput({ label, onChange, isResizing, value = "" }) {
  const inputId = (0, import_compose.useInstanceId)(import_components.__experimentalUnitControl, "block-spacer-height-input");
  const spacingSizes = useSpacingSizes();
  const [spacingUnits] = (0, import_block_editor.useSettings)("spacing.units");
  const availableUnits = spacingUnits ? spacingUnits.filter((unit) => unit !== "%") : ["px", "em", "rem", "vw", "vh"];
  const units = (0, import_components.__experimentalUseCustomUnits)({
    availableUnits,
    defaultValues: { px: 100, em: 10, rem: 10, vw: 10, vh: 25 }
  });
  const [parsedQuantity, parsedUnit] = (0, import_components.__experimentalParseQuantityAndUnitFromRawValue)(value);
  const computedValue = (0, import_block_editor.isValueSpacingPreset)(value) ? value : [parsedQuantity, isResizing ? "px" : parsedUnit].join("");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: spacingSizes?.length < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.__experimentalUnitControl,
    {
      id: inputId,
      isResetValueOnUnitChange: true,
      min: import_constants.MIN_SPACER_SIZE,
      onChange,
      value: computedValue,
      units,
      label
    }
  ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "tools-panel-item-spacing", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.__experimentalSpacingSizesControl,
    {
      values: { all: computedValue },
      onChange: ({ all }) => {
        onChange(all);
      },
      label,
      sides: ["all"],
      units,
      allowReset: false,
      splitOnAxis: false,
      showSideInLabel: false
    }
  ) }) });
}
function SpacerControls({
  setAttributes,
  orientation,
  height,
  width,
  isResizing
}) {
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_components.__experimentalToolsPanel,
    {
      label: (0, import_i18n.__)("Settings"),
      resetAll: () => {
        setAttributes({
          width: void 0,
          height: "100px"
        });
      },
      dropdownMenuProps,
      children: [
        orientation === "horizontal" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Width"),
            isShownByDefault: true,
            hasValue: () => width !== void 0,
            onDeselect: () => setAttributes({ width: void 0 }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              DimensionInput,
              {
                label: (0, import_i18n.__)("Width"),
                value: width,
                onChange: (nextWidth) => setAttributes({ width: nextWidth }),
                isResizing
              }
            )
          }
        ),
        orientation !== "horizontal" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Height"),
            isShownByDefault: true,
            hasValue: () => height !== "100px",
            onDeselect: () => setAttributes({ height: "100px" }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              DimensionInput,
              {
                label: (0, import_i18n.__)("Height"),
                value: height,
                onChange: (nextHeight) => setAttributes({ height: nextHeight }),
                isResizing
              }
            )
          }
        )
      ]
    }
  ) });
}
//# sourceMappingURL=controls.cjs.map
