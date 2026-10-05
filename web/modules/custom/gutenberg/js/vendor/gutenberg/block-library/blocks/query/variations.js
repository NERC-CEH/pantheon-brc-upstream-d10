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

// packages/block-library/src/query/variations.js
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var import_icons = require("./icons.cjs");
var postDate = [
  "core/post-date",
  {
    metadata: {
      bindings: {
        datetime: {
          source: "core/post-data",
          args: { field: "date" }
        }
      }
    }
  }
];
var variations = [
  {
    name: "title-date",
    title: (0, import_i18n.__)("Title & Date"),
    icon: import_icons.titleDate,
    attributes: {},
    innerBlocks: [
      ["core/post-template", {}, [["core/post-title"], postDate]],
      ["core/query-pagination"],
      ["core/query-no-results"]
    ],
    scope: ["block"]
  },
  {
    name: "title-excerpt",
    title: (0, import_i18n.__)("Title & Excerpt"),
    icon: import_icons.titleExcerpt,
    attributes: {},
    innerBlocks: [
      [
        "core/post-template",
        {},
        [["core/post-title"], ["core/post-excerpt"]]
      ],
      ["core/query-pagination"],
      ["core/query-no-results"]
    ],
    scope: ["block"]
  },
  {
    name: "title-date-excerpt",
    title: (0, import_i18n.__)("Title, Date, & Excerpt"),
    icon: import_icons.titleDateExcerpt,
    attributes: {},
    innerBlocks: [
      [
        "core/post-template",
        {},
        [["core/post-title"], postDate, ["core/post-excerpt"]]
      ],
      ["core/query-pagination"],
      ["core/query-no-results"]
    ],
    scope: ["block"]
  },
  {
    name: "image-date-title",
    title: (0, import_i18n.__)("Image, Date, & Title"),
    icon: import_icons.imageDateTitle,
    attributes: {},
    innerBlocks: [
      [
        "core/post-template",
        {},
        [
          ["core/post-featured-image"],
          postDate,
          ["core/post-title"]
        ]
      ],
      ["core/query-pagination"],
      ["core/query-no-results"]
    ],
    scope: ["block"]
  }
];
var variations_default = variations;
//# sourceMappingURL=variations.cjs.map
