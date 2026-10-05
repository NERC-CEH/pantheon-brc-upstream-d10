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

// packages/block-library/src/query/icons.jsx
var icons_exports = {};
__export(icons_exports, {
  imageDateTitle: () => imageDateTitle,
  titleDate: () => titleDate,
  titleDateExcerpt: () => titleDateExcerpt,
  titleExcerpt: () => titleExcerpt
});
module.exports = __toCommonJS(icons_exports);
var import_components = require("@wordpress/components");
var import_jsx_runtime = require("react/jsx-runtime");
var titleDate = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 48 48", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M41 9H7v3h34V9zm-22 5H7v1h12v-1zM7 26h12v1H7v-1zm34-5H7v3h34v-3zM7 38h12v1H7v-1zm34-5H7v3h34v-3z" }) });
var titleExcerpt = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 48 48", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M41 9H7v3h34V9zm-4 5H7v1h30v-1zm4 3H7v1h34v-1zM7 20h30v1H7v-1zm0 12h30v1H7v-1zm34 3H7v1h34v-1zM7 38h30v1H7v-1zm34-11H7v3h34v-3z" }) });
var titleDateExcerpt = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 48 48", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M41 9H7v3h34V9zm-22 5H7v1h12v-1zm22 3H7v1h34v-1zM7 20h34v1H7v-1zm0 12h12v1H7v-1zm34 3H7v1h34v-1zM7 38h34v1H7v-1zm34-11H7v3h34v-3z" }) });
var imageDateTitle = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 48 48", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M7 9h34v6H7V9zm12 8H7v1h12v-1zm18 3H7v1h30v-1zm0 18H7v1h30v-1zM7 35h12v1H7v-1zm34-8H7v6h34v-6z" }) });
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  imageDateTitle,
  titleDate,
  titleDateExcerpt,
  titleExcerpt
});
//# sourceMappingURL=icons.cjs.map
