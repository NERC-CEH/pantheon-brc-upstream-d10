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

// packages/block-library/src/gallery/index.js
var gallery_exports = {};
__export(gallery_exports, {
  init: () => init,
  metadata: () => import_block.default,
  name: () => name,
  settings: () => settings
});
module.exports = __toCommonJS(gallery_exports);
var import_icons = require("@wordpress/icons");
var import_init_block = __toESM(require("../utils/init-block.cjs"));
var import_deprecated = __toESM(require("./deprecated.cjs"));
var import_edit = __toESM(require("./edit.cjs"));
var import_block = __toESM(require("./block.json"));
var import_save = __toESM(require("./save.cjs"));
var import_transforms = __toESM(require("./transforms.cjs"));
var import_variations = __toESM(require("./variations.cjs"));
var { name } = import_block.default;
var settings = {
  icon: import_icons.gallery,
  example: {
    attributes: {
      columns: 2
    },
    innerBlocks: [
      {
        name: "core/image",
        attributes: {
          url: "https://s.w.org/images/core/5.3/Glacial_lakes%2C_Bhutan.jpg"
        }
      },
      {
        name: "core/image",
        attributes: {
          url: "https://s.w.org/images/core/5.3/Sediment_off_the_Yucatan_Peninsula.jpg"
        }
      }
    ]
  },
  transforms: import_transforms.default,
  variations: import_variations.default,
  edit: import_edit.default,
  save: import_save.default,
  deprecated: import_deprecated.default
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
