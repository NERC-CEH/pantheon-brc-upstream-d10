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

// packages/block-library/src/site-tagline/icon.jsx
var icon_exports = {};
__export(icon_exports, {
  default: () => icon_default
});
module.exports = __toCommonJS(icon_exports);
var import_components = require("@wordpress/components");
var import_jsx_runtime = require("react/jsx-runtime");
var icon_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.SVG, { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M4 10.5h16V9H4v1.5ZM4 15h9v-1.5H4V15Z" }) });
//# sourceMappingURL=icon.cjs.map
