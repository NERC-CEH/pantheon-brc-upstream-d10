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

// packages/block-library/src/group/variations.js
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var example = {
  innerBlocks: [
    {
      name: "core/paragraph",
      attributes: {
        content: (0, import_i18n.__)("One.")
      }
    },
    {
      name: "core/paragraph",
      attributes: {
        content: (0, import_i18n.__)("Two.")
      }
    },
    {
      name: "core/paragraph",
      attributes: {
        content: (0, import_i18n.__)("Three.")
      }
    },
    {
      name: "core/paragraph",
      attributes: {
        content: (0, import_i18n.__)("Four.")
      }
    },
    {
      name: "core/paragraph",
      attributes: {
        content: (0, import_i18n.__)("Five.")
      }
    },
    {
      name: "core/paragraph",
      attributes: {
        content: (0, import_i18n.__)("Six.")
      }
    }
  ]
};
var variations = [
  {
    name: "group",
    title: (0, import_i18n.__)("Group"),
    description: (0, import_i18n.__)("Gather blocks in a container."),
    attributes: { layout: { type: "constrained" } },
    isDefault: true,
    scope: ["block", "inserter", "transform"],
    icon: import_icons.group
  },
  {
    name: "group-row",
    title: (0, import_i18n._x)("Row", "single horizontal line"),
    description: (0, import_i18n.__)("Arrange blocks horizontally."),
    attributes: { layout: { type: "flex", flexWrap: "nowrap" } },
    scope: ["block", "inserter", "transform"],
    isActive: ["layout.type"],
    icon: import_icons.row,
    example
  },
  {
    name: "group-stack",
    title: (0, import_i18n.__)("Stack"),
    description: (0, import_i18n.__)("Arrange blocks vertically."),
    attributes: { layout: { type: "flex", orientation: "vertical" } },
    scope: ["block", "inserter", "transform"],
    isActive: ["layout.type", "layout.orientation"],
    icon: import_icons.stack,
    example
  },
  {
    name: "group-grid",
    title: (0, import_i18n.__)("Grid"),
    description: (0, import_i18n.__)("Arrange blocks in a grid."),
    attributes: { layout: { type: "grid" } },
    scope: ["block", "inserter", "transform"],
    isActive: ["layout.type"],
    icon: import_icons.grid,
    example
  }
];
var variations_default = variations;
//# sourceMappingURL=variations.cjs.map
