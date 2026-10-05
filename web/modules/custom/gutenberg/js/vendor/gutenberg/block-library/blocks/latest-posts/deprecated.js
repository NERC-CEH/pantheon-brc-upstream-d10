"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/block-library/src/latest-posts/deprecated.js
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_block = __toESM(require("./block.json"));
var currentSupports = {
  anchor: true,
  align: true,
  color: {
    gradients: true,
    link: true,
    __experimentalDefaultControls: {
      background: true,
      text: true,
      link: true
    }
  },
  html: false,
  layout: true,
  spacing: {
    margin: true,
    padding: true,
    blockGap: {
      __experimentalDefault: "1.25em"
    },
    __experimentalDefaultControls: {
      blockGap: true
    }
  },
  typography: {
    fontSize: true,
    lineHeight: true,
    __experimentalFontFamily: true,
    __experimentalFontWeight: true,
    __experimentalFontStyle: true,
    __experimentalTextTransform: true,
    __experimentalTextDecoration: true,
    __experimentalLetterSpacing: true,
    __experimentalDefaultControls: {
      fontSize: true
    }
  },
  __experimentalBorder: {
    radius: true,
    color: true,
    width: true,
    style: true,
    __experimentalDefaultControls: {
      radius: true,
      color: true,
      width: true,
      style: true
    }
  },
  interactivity: {
    clientNavigation: true
  }
};
var legacyLayoutAttributes = {
  postLayout: {
    type: "string",
    default: "list"
  },
  columns: {
    type: "number",
    default: 3
  }
};
var migrateCategories = (oldAttributes) => {
  if (!oldAttributes.categories || "string" !== typeof oldAttributes.categories) {
    return oldAttributes;
  }
  return {
    ...oldAttributes,
    categories: [{ id: Number(oldAttributes.categories) }]
  };
};
var migratePostLayout = (oldAttributes) => {
  const { postLayout, columns, ...attributesWithoutLegacyLayout } = oldAttributes;
  if (!postLayout) {
    return oldAttributes;
  }
  return {
    ...attributesWithoutLegacyLayout,
    layout: {
      type: postLayout === "grid" ? "grid" : "default",
      ...postLayout === "grid" && columns && { columnCount: columns }
    }
  };
};
var deprecated_default = [
  {
    attributes: {
      ...import_block.default.attributes,
      ...legacyLayoutAttributes,
      categories: {
        type: ["array", "string"]
      }
    },
    supports: currentSupports,
    migrate: (oldAttributes) => migratePostLayout(migrateCategories(oldAttributes)),
    isEligible: ({ postLayout }) => postLayout,
    save: () => null
  },
  {
    attributes: {
      ...import_block.default.attributes,
      categories: {
        type: "string"
      }
    },
    supports: {
      align: true,
      html: false
    },
    migrate: migrateCategories,
    isEligible: ({ categories }) => categories && "string" === typeof categories,
    save: () => null
  }
];
//# sourceMappingURL=deprecated.cjs.map
