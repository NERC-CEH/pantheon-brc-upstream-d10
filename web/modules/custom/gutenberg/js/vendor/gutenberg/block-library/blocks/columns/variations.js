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

// packages/block-library/src/columns/variations.jsx
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_jsx_runtime = require("react/jsx-runtime");
var variations = [
  {
    name: "one-column-full",
    title: (0, import_i18n.__)("100"),
    description: (0, import_i18n.__)("One column"),
    icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.SVG,
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M0 10a2 2 0 0 1 2-2h44a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V10Z" })
      }
    ),
    innerBlocks: [["core/column"]],
    scope: ["block"]
  },
  {
    name: "two-columns-equal",
    title: (0, import_i18n.__)("50 / 50"),
    description: (0, import_i18n.__)("Two columns; equal split"),
    icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.SVG,
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M0 10a2 2 0 0 1 2-2h19a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V10Zm25 0a2 2 0 0 1 2-2h19a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H27a2 2 0 0 1-2-2V10Z" })
      }
    ),
    isDefault: true,
    innerBlocks: [["core/column"], ["core/column"]],
    scope: ["block"]
  },
  {
    name: "two-columns-one-third-two-thirds",
    title: (0, import_i18n.__)("33 / 66"),
    description: (0, import_i18n.__)("Two columns; one-third, two-thirds split"),
    icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.SVG,
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M0 10a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V10Zm17 0a2 2 0 0 1 2-2h27a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H19a2 2 0 0 1-2-2V10Z" })
      }
    ),
    innerBlocks: [
      ["core/column", { width: "33.33%" }],
      ["core/column", { width: "66.66%" }]
    ],
    scope: ["block"]
  },
  {
    name: "two-columns-two-thirds-one-third",
    title: (0, import_i18n.__)("66 / 33"),
    description: (0, import_i18n.__)("Two columns; two-thirds, one-third split"),
    icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.SVG,
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M0 10a2 2 0 0 1 2-2h27a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V10Zm33 0a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H35a2 2 0 0 1-2-2V10Z" })
      }
    ),
    innerBlocks: [
      ["core/column", { width: "66.66%" }],
      ["core/column", { width: "33.33%" }]
    ],
    scope: ["block"]
  },
  {
    name: "three-columns-equal",
    title: (0, import_i18n.__)("33 / 33 / 33"),
    description: (0, import_i18n.__)("Three columns; equal split"),
    icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.SVG,
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M0 10a2 2 0 0 1 2-2h10.531c1.105 0 1.969.895 1.969 2v28c0 1.105-.864 2-1.969 2H2a2 2 0 0 1-2-2V10Zm16.5 0c0-1.105.864-2 1.969-2H29.53c1.105 0 1.969.895 1.969 2v28c0 1.105-.864 2-1.969 2H18.47c-1.105 0-1.969-.895-1.969-2V10Zm17 0c0-1.105.864-2 1.969-2H46a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H35.469c-1.105 0-1.969-.895-1.969-2V10Z" })
      }
    ),
    innerBlocks: [
      ["core/column"],
      ["core/column"],
      ["core/column"]
    ],
    scope: ["block"]
  },
  {
    name: "three-columns-wider-center",
    title: (0, import_i18n.__)("25 / 50 / 25"),
    description: (0, import_i18n.__)("Three columns; wide center column"),
    icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.SVG,
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M0 10a2 2 0 0 1 2-2h7.531c1.105 0 1.969.895 1.969 2v28c0 1.105-.864 2-1.969 2H2a2 2 0 0 1-2-2V10Zm13.5 0c0-1.105.864-2 1.969-2H32.53c1.105 0 1.969.895 1.969 2v28c0 1.105-.864 2-1.969 2H15.47c-1.105 0-1.969-.895-1.969-2V10Zm23 0c0-1.105.864-2 1.969-2H46a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2h-7.531c-1.105 0-1.969-.895-1.969-2V10Z" })
      }
    ),
    innerBlocks: [
      ["core/column", { width: "25%" }],
      ["core/column", { width: "50%" }],
      ["core/column", { width: "25%" }]
    ],
    scope: ["block"]
  }
];
var variations_default = variations;
//# sourceMappingURL=variations.cjs.map
