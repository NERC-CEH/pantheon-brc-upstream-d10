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

// packages/block-library/src/icon/icon.jsx
var icon_exports = {};
__export(icon_exports, {
  default: () => icon_default,
  icon: () => icon
});
module.exports = __toCommonJS(icon_exports);
var import_components = require("@wordpress/components");
var import_jsx_runtime = require("react/jsx-runtime");
var icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.SVG, { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", fill: "none", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M6 9.5h3.5V6H6v3.5Zm5 .5a1 1 0 0 1-.898.995L10 11H5.5l-.103-.005a1 1 0 0 1-.892-.893L4.5 10V5.5a1 1 0 0 1 1-1H10a1 1 0 0 1 1 1V10ZM18.25 7.75a2 2 0 1 0-4 0 2 2 0 0 0 4 0Zm1.5 0a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM6.88 13.535a1 1 0 0 1 1.74 0l2.534 4.472a1 1 0 0 1-.87 1.493H5.216a1 1 0 0 1-.87-1.493l2.534-4.472ZM6.074 18h3.352L7.75 15.041l-1.676 2.96ZM14.952 13h2.596a1 1 0 0 1 .866.5l1.298 2.25a1 1 0 0 1 0 1L18.414 19l-.074.11a1 1 0 0 1-.792.39h-2.596a1 1 0 0 1-.792-.39l-.074-.11-1.298-2.25a1.001 1.001 0 0 1 0-1l1.298-2.25a1 1 0 0 1 .866-.5Zm-.72 3.25 1.01 1.75h2.017l1.009-1.75-1.01-1.75h-2.017l-1.01 1.75Z" }) });
var icon_default = icon;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  icon
});
//# sourceMappingURL=icon.cjs.map
