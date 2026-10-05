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

// packages/block-library/src/query-total/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => QueryTotalEdit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_icons = require("./icons.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function QueryTotalEdit({ attributes, setAttributes }) {
  const { displayType } = attributes;
  const blockProps = (0, import_block_editor.useBlockProps)();
  const getButtonPositionIcon = () => {
    switch (displayType) {
      case "total-results":
        return import_icons.resultsFound;
      case "range-display":
        return import_icons.displayingResults;
    }
  };
  const buttonPositionControls = [
    {
      role: "menuitemradio",
      title: (0, import_i18n.__)("Total results"),
      isActive: displayType === "total-results",
      icon: import_icons.resultsFound,
      onClick: () => {
        setAttributes({ displayType: "total-results" });
      }
    },
    {
      role: "menuitemradio",
      title: (0, import_i18n.__)("Range display"),
      isActive: displayType === "range-display",
      icon: import_icons.displayingResults,
      onClick: () => {
        setAttributes({ displayType: "range-display" });
      }
    }
  ];
  const controls = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.ToolbarDropdownMenu,
    {
      icon: getButtonPositionIcon(),
      label: (0, import_i18n.__)("Change display type"),
      controls: buttonPositionControls
    }
  ) }) });
  const renderDisplay = () => {
    if (displayType === "total-results") {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: (0, import_i18n.__)("12 results found") });
    }
    if (displayType === "range-display") {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: (0, import_i18n.__)("Displaying 1 – 10 of 12") });
    }
    return null;
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
    controls,
    renderDisplay()
  ] });
}
//# sourceMappingURL=edit.cjs.map
