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

// packages/block-library/src/heading/index.js
var heading_exports = {};
__export(heading_exports, {
  init: () => init,
  metadata: () => import_block.default,
  name: () => name,
  settings: () => settings
});
module.exports = __toCommonJS(heading_exports);
var import_icons = require("@wordpress/icons");
var import_i18n = require("@wordpress/i18n");
var import_blocks = require("@wordpress/blocks");
var import_init_block = __toESM(require("../utils/init-block.cjs"));
var import_deprecated = __toESM(require("./deprecated.cjs"));
var import_edit = __toESM(require("./edit.cjs"));
var import_block = __toESM(require("./block.json"));
var import_save = __toESM(require("./save.cjs"));
var import_transforms = __toESM(require("./transforms.cjs"));
var import_variations = __toESM(require("./variations.cjs"));
var { name } = import_block.default;
var settings = {
  icon: import_icons.heading,
  example: {
    attributes: {
      content: (0, import_i18n.__)("Code is Poetry"),
      level: 2,
      style: {
        typography: {
          textAlign: "center"
        }
      }
    }
  },
  __experimentalLabel(attributes, { context }) {
    const { content, level } = attributes;
    const customName = attributes?.metadata?.name;
    const hasContent = content?.trim().length > 0;
    if (context === "list-view" && (customName || hasContent)) {
      return customName || content;
    }
    if (context === "breadcrumb" && customName) {
      return customName;
    }
    if (context === "accessibility") {
      return !hasContent ? (0, import_i18n.sprintf)(
        /* translators: accessibility text. %s: heading level. */
        (0, import_i18n.__)("Level %s. Empty."),
        level
      ) : (0, import_i18n.sprintf)(
        /* translators: accessibility text. 1: heading level. 2: heading content. */
        (0, import_i18n.__)("Level %1$s. %2$s"),
        level,
        content
      );
    }
  },
  transforms: import_transforms.default,
  deprecated: import_deprecated.default,
  merge(attributes, attributesToMerge) {
    return {
      content: (attributes.content || "") + (attributesToMerge.content || "")
    };
  },
  edit: import_edit.default,
  save: import_save.default,
  variations: import_variations.default
};
var init = () => {
  const block = (0, import_init_block.default)({ name, metadata: import_block.default, settings });
  const levelOptions = (0, import_blocks.getBlockType)(name)?.attributes?.levelOptions?.default;
  if (levelOptions) {
    [1, 2, 3, 4, 5, 6].forEach((level) => {
      if (!levelOptions.includes(level)) {
        (0, import_blocks.unregisterBlockVariation)(name, `h${level}`);
      }
    });
  }
  return block;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  init,
  metadata,
  name,
  settings
});
//# sourceMappingURL=index.cjs.map
