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

// packages/block-library/src/navigation/index.js
var navigation_exports = {};
__export(navigation_exports, {
  init: () => init,
  metadata: () => import_block.default,
  name: () => name,
  settings: () => settings
});
module.exports = __toCommonJS(navigation_exports);
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var import_data = require("@wordpress/data");
var import_core_data = require("@wordpress/core-data");
var import_html_entities = require("@wordpress/html-entities");
var import_init_block = __toESM(require("../utils/init-block.cjs"));
var import_block = __toESM(require("./block.json"));
var import_edit = __toESM(require("./edit/index.cjs"));
var import_save = __toESM(require("./save.cjs"));
var import_deprecated = __toESM(require("./deprecated.cjs"));
var { name } = import_block.default;
var settings = {
  icon: import_icons.navigation,
  example: {
    attributes: {
      overlayMenu: "never"
    },
    innerBlocks: [
      {
        name: "core/navigation-link",
        attributes: {
          // translators: 'Home' as in a website's home page.
          label: (0, import_i18n.__)("Home"),
          url: "https://make.wordpress.org/"
        }
      },
      {
        name: "core/navigation-link",
        attributes: {
          // translators: 'About' as in a website's about page.
          label: (0, import_i18n.__)("About"),
          url: "https://make.wordpress.org/"
        }
      },
      {
        name: "core/navigation-link",
        attributes: {
          // translators: 'Contact' as in a website's contact page.
          label: (0, import_i18n.__)("Contact"),
          url: "https://make.wordpress.org/"
        }
      }
    ]
  },
  edit: import_edit.default,
  save: import_save.default,
  __experimentalLabel: ({ ref }) => {
    if (!ref) {
      return;
    }
    const navigation = (0, import_data.select)(import_core_data.store).getEditedEntityRecord(
      "postType",
      "wp_navigation",
      ref
    );
    if (!navigation?.title) {
      return;
    }
    return (0, import_html_entities.decodeEntities)(navigation.title);
  },
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
