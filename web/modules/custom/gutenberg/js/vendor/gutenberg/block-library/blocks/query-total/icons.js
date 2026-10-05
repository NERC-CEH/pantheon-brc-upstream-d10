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

// packages/block-library/src/query-total/icons.jsx
var icons_exports = {};
__export(icons_exports, {
  displayingResults: () => displayingResults,
  queryTotal: () => queryTotal,
  resultsFound: () => resultsFound
});
module.exports = __toCommonJS(icons_exports);
var import_components = require("@wordpress/components");
var import_jsx_runtime = require("react/jsx-runtime");
var resultsFound = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
  import_components.SVG,
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    "aria-hidden": "true",
    focusable: "false",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M4 11h4v2H4v-2zm6 0h6v2h-6v-2zm8 0h2v2h-2v-2z" })
  }
);
var displayingResults = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
  import_components.SVG,
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    "aria-hidden": "true",
    focusable: "false",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M4 13h2v-2H4v2zm4 0h10v-2H8v2zm12 0h2v-2h-2v2z" })
  }
);
var queryTotal = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
  import_components.SVG,
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    "aria-hidden": "true",
    focusable: "false",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm.5 14c0 .3-.2.5-.5.5H6c-.3 0-.5-.2-.5-.5V6c0-.3.2-.5.5-.5h12c.3 0 .5.2.5.5v12Zm-7-6-4.1 5h8.8v-3h-1.5v1.5h-4.2l2.9-3.5-2.9-3.5h4.2V10h1.5V7H7.4l4.1 5Z" })
  }
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  displayingResults,
  queryTotal,
  resultsFound
});
//# sourceMappingURL=icons.cjs.map
