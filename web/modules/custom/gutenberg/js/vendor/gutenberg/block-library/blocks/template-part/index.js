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

// packages/block-library/src/template-part/index.js
var template_part_exports = {};
__export(template_part_exports, {
  init: () => init,
  metadata: () => import_block.default,
  name: () => name,
  settings: () => settings
});
module.exports = __toCommonJS(template_part_exports);
var import_change_case = require("change-case");
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
var import_icons = require("@wordpress/icons");
var import_hooks = require("@wordpress/hooks");
var import_html_entities = require("@wordpress/html-entities");
var import_init_block = __toESM(require("../utils/init-block.cjs"));
var import_block = __toESM(require("./block.json"));
var import_edit = __toESM(require("./edit/index.cjs"));
var import_variations = require("./variations.cjs");
var { name } = import_block.default;
var settings = {
  icon: import_icons.symbolFilled,
  __experimentalLabel: ({ slug, theme }) => {
    if (!slug) {
      return;
    }
    const { getCurrentTheme, getEditedEntityRecord } = (0, import_data.select)(import_core_data.store);
    const entity = getEditedEntityRecord(
      "postType",
      "wp_template_part",
      (theme || getCurrentTheme()?.stylesheet) + "//" + slug
    );
    if (!entity) {
      return;
    }
    return (0, import_html_entities.decodeEntities)(entity.title) || (0, import_change_case.capitalCase)(entity.slug || "");
  },
  edit: import_edit.default
};
var init = () => {
  (0, import_hooks.addFilter)(
    "blocks.registerBlockType",
    "core/template-part",
    import_variations.enhanceTemplatePartVariations
  );
  const DISALLOWED_PARENTS = ["core/post-template", "core/post-content"];
  (0, import_hooks.addFilter)(
    "blockEditor.__unstableCanInsertBlockType",
    "core/block-library/removeTemplatePartsFromPostTemplates",
    (canInsert, blockType, rootClientId, { getBlock, getBlockParentsByBlockName }) => {
      if (blockType.name !== "core/template-part") {
        return canInsert;
      }
      for (const disallowedParentType of DISALLOWED_PARENTS) {
        const hasDisallowedParent = getBlock(rootClientId)?.name === disallowedParentType || getBlockParentsByBlockName(
          rootClientId,
          disallowedParentType
        ).length;
        if (hasDisallowedParent) {
          return false;
        }
      }
      return true;
    }
  );
  return (0, import_init_block.default)({ name, metadata: import_block.default, settings });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  init,
  metadata,
  name,
  settings
});
//# sourceMappingURL=index.cjs.map
