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

// packages/block-library/src/social-links/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
var migrateWithLayout = (attributes) => {
  if (!!attributes.layout) {
    return attributes;
  }
  const { className } = attributes;
  const prefix = `items-justified-`;
  const justifiedItemsRegex = new RegExp(`\\b${prefix}[^ ]*[ ]?\\b`, "g");
  const newAttributes = {
    ...attributes,
    className: className?.replace(justifiedItemsRegex, "").trim()
  };
  const justifyContent = className?.match(justifiedItemsRegex)?.[0]?.trim();
  if (justifyContent) {
    Object.assign(newAttributes, {
      layout: {
        type: "flex",
        justifyContent: justifyContent.slice(prefix.length)
      }
    });
  }
  return newAttributes;
};
var deprecated = [
  // V1. Remove CSS variable use for colors.
  {
    attributes: {
      iconColor: {
        type: "string"
      },
      customIconColor: {
        type: "string"
      },
      iconColorValue: {
        type: "string"
      },
      iconBackgroundColor: {
        type: "string"
      },
      customIconBackgroundColor: {
        type: "string"
      },
      iconBackgroundColorValue: {
        type: "string"
      },
      openInNewTab: {
        type: "boolean",
        default: false
      },
      size: {
        type: "string"
      }
    },
    providesContext: {
      openInNewTab: "openInNewTab"
    },
    supports: {
      align: ["left", "center", "right"],
      anchor: true
    },
    migrate: migrateWithLayout,
    save: (props) => {
      const {
        attributes: {
          iconBackgroundColorValue,
          iconColorValue,
          itemsJustification,
          size
        }
      } = props;
      const className = (0, import_clsx.default)(size, {
        "has-icon-color": iconColorValue,
        "has-icon-background-color": iconBackgroundColorValue,
        [`items-justified-${itemsJustification}`]: itemsJustification
      });
      const style = {
        "--wp--social-links--icon-color": iconColorValue,
        "--wp--social-links--icon-background-color": iconBackgroundColorValue
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { ...import_block_editor.useBlockProps.save({ className, style }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) });
    }
  }
];
var deprecated_default = deprecated;
//# sourceMappingURL=deprecated.cjs.map
