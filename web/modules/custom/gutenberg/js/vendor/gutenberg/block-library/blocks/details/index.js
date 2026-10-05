"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/block-library/src/details/index.js
var details_exports = {};
__export(details_exports, {
  init: () => init,
  metadata: () => import_block.default,
  name: () => name,
  settings: () => settings
});
module.exports = __toCommonJS(details_exports);
var import_icons = require("@wordpress/icons");
var import_i18n = require("@wordpress/i18n");
var import_init_block = __toESM(require("../utils/init-block.cjs"));
var import_block = __toESM(require("./block.json"));
var import_edit = __toESM(require("./edit.cjs"));
var import_save = __toESM(require("./save.cjs"));
var import_transforms = __toESM(require("./transforms.cjs"));
var { name } = import_block.default;
var TEMPLATE = [
  [
    "core/paragraph",
    {
      placeholder: (0, import_i18n.__)("Type / to add a hidden block")
    }
  ]
];
var settings = {
  icon: import_icons.details,
  template: TEMPLATE,
  example: {
    attributes: {
      summary: (0, import_i18n.__)("La Mancha"),
      showContent: true
    },
    innerBlocks: [
      {
        name: "core/paragraph",
        attributes: {
          content: (0, import_i18n.__)(
            "In a village of La Mancha, the name of which I have no desire to call to mind, there lived not long since one of those gentlemen that keep a lance in the lance-rack, an old buckler, a lean hack, and a greyhound for coursing."
          )
        }
      }
    ]
  },
  __experimentalLabel(attributes, { context }) {
    const { summary } = attributes;
    const customName = attributes?.metadata?.name;
    const hasSummary = summary?.trim().length > 0;
    if (context === "list-view" && (customName || hasSummary)) {
      return customName || summary;
    }
    if (context === "breadcrumb" && customName) {
      return customName;
    }
    if (context === "accessibility") {
      return !hasSummary ? (0, import_i18n.__)("Details. Empty.") : (0, import_i18n.sprintf)(
        /* translators: %s: accessibility text; summary title. */
        (0, import_i18n.__)("Details. %s"),
        summary
      );
    }
  },
  save: import_save.default,
  edit: import_edit.default,
  transforms: import_transforms.default
};
var init = () => (0, import_init_block.default)({ name, metadata: import_block.default, settings });
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  init,
  metadata,
  name,
  settings
});
//# sourceMappingURL=index.cjs.map
