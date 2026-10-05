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

// packages/block-library/src/form/icons.js
var icons_exports = {};
__export(icons_exports, {
  icon: () => icon
});
module.exports = __toCommonJS(icons_exports);
var import_primitives = require("@wordpress/primitives");
var import_jsx_runtime = require("react/jsx-runtime");
var icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M18 16H6c-1.1 0-2 .9-2 2s.9 2 2 2h12c1.1 0 2-.9 2-2s-.9-2-2-2Zm0 2.5H6c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h12c.3 0 .5.2.5.5s-.2.5-.5.5ZM13 13H4v1.5h9V13Zm-7-2h12c1.1 0 2-.9 2-2s-.9-2-2-2H6c-1.1 0-2 .9-2 2s.9 2 2 2Zm0-2.5h12c.3 0 .5.2.5.5s-.2.5-.5.5H6c-.3 0-.5-.2-.5-.5s.2-.5.5-.5ZM13 4H4v1.5h9V4Z" }) });
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  icon
});
//# sourceMappingURL=icons.cjs.map
