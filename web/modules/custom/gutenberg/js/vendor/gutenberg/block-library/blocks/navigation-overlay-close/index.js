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

// packages/block-library/src/navigation-overlay-close/index.js
var navigation_overlay_close_exports = {};
__export(navigation_overlay_close_exports, {
  init: () => init,
  metadata: () => import_block.default,
  name: () => name,
  settings: () => settings
});
module.exports = __toCommonJS(navigation_overlay_close_exports);
var import_hooks = require("@wordpress/hooks");
var import_init_block = __toESM(require("../utils/init-block.cjs"));
var import_is_within_overlay = require("../utils/is-within-overlay.cjs");
var import_edit = __toESM(require("./edit.cjs"));
var import_block = __toESM(require("./block.json"));
var import_icon = __toESM(require("./icon.cjs"));
var { name } = import_block.default;
var settings = {
  icon: import_icon.default,
  edit: import_edit.default
};
var init = () => {
  (0, import_hooks.addFilter)(
    "blockEditor.__unstableCanInsertBlockType",
    "core/navigation-overlay-close/restrict-to-overlay-template-parts",
    (canInsert, blockType) => {
      if (blockType.name !== "core/navigation-overlay-close") {
        return canInsert;
      }
      if (!canInsert) {
        return canInsert;
      }
      return (0, import_is_within_overlay.isWithinNavigationOverlay)();
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
