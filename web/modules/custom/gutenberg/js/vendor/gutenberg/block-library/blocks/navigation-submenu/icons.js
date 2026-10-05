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

// packages/block-library/src/navigation-submenu/icons.jsx
var icons_exports = {};
__export(icons_exports, {
  ItemSubmenuIcon: () => ItemSubmenuIcon
});
module.exports = __toCommonJS(icons_exports);
var import_components = require("@wordpress/components");
var import_jsx_runtime = require("react/jsx-runtime");
var ItemSubmenuIcon = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
  import_components.SVG,
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M1.50002 4L6.00002 8L10.5 4", strokeWidth: "1.5" })
  }
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ItemSubmenuIcon
});
//# sourceMappingURL=icons.cjs.map
