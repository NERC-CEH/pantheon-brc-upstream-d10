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

// packages/block-library/src/terms-query/variations.jsx
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default,
  titleDate: () => titleDate,
  titleExcerpt: () => titleExcerpt
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_jsx_runtime = require("react/jsx-runtime");
var titleDate = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 48 48", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M 41,9 H 7 v 3 h 34 z m 0,9 H 7 v 3 h 34 z m 0,18 H 7 v 3 h 34 z m 0,-9 H 7 v 3 h 34 z" }) });
var titleExcerpt = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 48 48", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "m 36,36 h 5 v 3 h -5 z m 0,-9 h 5 v 3 h -5 z m 0,-9 h 5 v 3 h -5 z m 0,-9 h 5 v 3 H 36 Z M 31,9 H 7 v 3 h 24 z m 0,9 H 7 v 3 h 24 z m 0,18 H 7 v 3 h 24 z m 0,-9 H 7 v 3 h 24 z" }) });
var termName = [
  "core/term-name",
  {
    isLink: true
  }
];
var variations = [
  {
    name: "name",
    title: (0, import_i18n.__)("Name"),
    description: (0, import_i18n.__)("Display the terms' names."),
    attributes: {},
    icon: titleDate,
    scope: ["block"],
    innerBlocks: [["core/term-template", {}, [termName]]]
  },
  {
    name: "name-count",
    title: (0, import_i18n.__)("Name & Count"),
    description: (0, import_i18n.__)(
      "Display the terms' names and number of posts assigned to each term."
    ),
    attributes: {},
    icon: titleExcerpt,
    scope: ["block"],
    innerBlocks: [
      [
        "core/term-template",
        {},
        [
          [
            "core/group",
            { layout: { type: "flex", flexWrap: "nowrap" } },
            [termName, ["core/term-count"]]
          ]
        ]
      ]
    ]
  }
];
var variations_default = variations;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  titleDate,
  titleExcerpt
});
//# sourceMappingURL=variations.cjs.map
