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
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_i18n = require("@wordpress/i18n");
var import_primitives = require("@wordpress/primitives");
var import_icons = require("@wordpress/icons");
const variations = [
  {
    name: "paragraph",
    title: (0, import_i18n.__)("Paragraph"),
    description: (0, import_i18n.__)(
      "Start with the basic building block of all narrative."
    ),
    isDefault: true,
    scope: ["block", "inserter", "transform"],
    attributes: { fitText: void 0 },
    icon: import_icons.paragraph
  },
  // There is a hardcoded workaround in packages/block-editor/src/store/selectors.js
  // to make Stretchy variations appear as the last of their sections in the inserter.
  {
    name: "stretchy-paragraph",
    title: (0, import_i18n.__)("Stretchy Paragraph"),
    description: (0, import_i18n.__)("Paragraph that resizes to fit its container."),
    icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M3 9c0 2.8 2.2 5 5 5v-.2V20h1.5V5.5H12V20h1.5V5.5h3V4H8C5.2 4 3 6.2 3 9Zm16.2-.2v1.5h2.2L17.7 14l1.1 1.1 3.7-3.7v2.2H24V8.8h-4.8Z" }) }),
    attributes: {
      fitText: true
    },
    scope: ["inserter", "transform"],
    isActive: (blockAttributes) => blockAttributes.fitText === true
  }
];
var variations_default = variations;
//# sourceMappingURL=variations.js.map
