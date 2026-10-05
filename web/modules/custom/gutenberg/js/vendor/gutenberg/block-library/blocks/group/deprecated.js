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

// packages/block-library/src/group/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
var migrateAttributes = (attributes) => {
  if (!attributes.tagName) {
    attributes = {
      ...attributes,
      tagName: "div"
    };
  }
  if (!attributes.customTextColor && !attributes.customBackgroundColor) {
    return attributes;
  }
  const style = { color: {} };
  if (attributes.customTextColor) {
    style.color.text = attributes.customTextColor;
  }
  if (attributes.customBackgroundColor) {
    style.color.background = attributes.customBackgroundColor;
  }
  const { customTextColor, customBackgroundColor, ...restAttributes } = attributes;
  return {
    ...restAttributes,
    style
  };
};
var deprecated = [
  // Version with default layout.
  {
    attributes: {
      tagName: {
        type: "string",
        default: "div"
      },
      templateLock: {
        type: ["string", "boolean"],
        enum: ["all", "insert", false]
      }
    },
    supports: {
      __experimentalOnEnter: true,
      __experimentalSettings: true,
      align: ["wide", "full"],
      anchor: true,
      ariaLabel: true,
      html: false,
      color: {
        gradients: true,
        link: true,
        __experimentalDefaultControls: {
          background: true,
          text: true
        }
      },
      spacing: {
        margin: ["top", "bottom"],
        padding: true,
        blockGap: true,
        __experimentalDefaultControls: {
          padding: true,
          blockGap: true
        }
      },
      __experimentalBorder: {
        color: true,
        radius: true,
        style: true,
        width: true,
        __experimentalDefaultControls: {
          color: true,
          radius: true,
          style: true,
          width: true
        }
      },
      typography: {
        fontSize: true,
        lineHeight: true,
        __experimentalFontStyle: true,
        __experimentalFontWeight: true,
        __experimentalLetterSpacing: true,
        __experimentalTextTransform: true,
        __experimentalDefaultControls: {
          fontSize: true
        }
      },
      layout: true
    },
    save({ attributes: { tagName: Tag } }) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { ...import_block_editor.useInnerBlocksProps.save(import_block_editor.useBlockProps.save()) });
    },
    isEligible: ({ layout }) => layout?.inherit || layout?.contentSize && layout?.type !== "constrained",
    migrate: (attributes) => {
      const { layout = null } = attributes;
      if (layout?.inherit || layout?.contentSize) {
        return {
          ...attributes,
          layout: {
            ...layout,
            type: "constrained"
          }
        };
      }
    }
  },
  // Version of the block with the double div.
  {
    attributes: {
      tagName: {
        type: "string",
        default: "div"
      },
      templateLock: {
        type: ["string", "boolean"],
        enum: ["all", "insert", false]
      }
    },
    supports: {
      align: ["wide", "full"],
      anchor: true,
      color: {
        gradients: true,
        link: true
      },
      spacing: {
        padding: true
      },
      __experimentalBorder: {
        radius: true
      }
    },
    save({ attributes }) {
      const { tagName: Tag } = attributes;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { ...import_block_editor.useBlockProps.save(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-group__inner-container", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) }) });
    }
  },
  // Version of the block without global styles support
  {
    attributes: {
      backgroundColor: {
        type: "string"
      },
      customBackgroundColor: {
        type: "string"
      },
      textColor: {
        type: "string"
      },
      customTextColor: {
        type: "string"
      }
    },
    supports: {
      align: ["wide", "full"],
      anchor: true,
      html: false
    },
    migrate: migrateAttributes,
    save({ attributes }) {
      const {
        backgroundColor,
        customBackgroundColor,
        textColor,
        customTextColor
      } = attributes;
      const backgroundClass = (0, import_block_editor.getColorClassName)(
        "background-color",
        backgroundColor
      );
      const textClass = (0, import_block_editor.getColorClassName)("color", textColor);
      const className = (0, import_clsx.default)(backgroundClass, textClass, {
        "has-text-color": textColor || customTextColor,
        "has-background": backgroundColor || customBackgroundColor
      });
      const styles = {
        backgroundColor: backgroundClass ? void 0 : customBackgroundColor,
        color: textClass ? void 0 : customTextColor
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className, style: styles, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-group__inner-container", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) }) });
    }
  },
  // Version of the group block with a bug that made text color class not applied.
  {
    attributes: {
      backgroundColor: {
        type: "string"
      },
      customBackgroundColor: {
        type: "string"
      },
      textColor: {
        type: "string"
      },
      customTextColor: {
        type: "string"
      }
    },
    migrate: migrateAttributes,
    supports: {
      align: ["wide", "full"],
      anchor: true,
      html: false
    },
    save({ attributes }) {
      const {
        backgroundColor,
        customBackgroundColor,
        textColor,
        customTextColor
      } = attributes;
      const backgroundClass = (0, import_block_editor.getColorClassName)(
        "background-color",
        backgroundColor
      );
      const textClass = (0, import_block_editor.getColorClassName)("color", textColor);
      const className = (0, import_clsx.default)(backgroundClass, {
        "has-text-color": textColor || customTextColor,
        "has-background": backgroundColor || customBackgroundColor
      });
      const styles = {
        backgroundColor: backgroundClass ? void 0 : customBackgroundColor,
        color: textClass ? void 0 : customTextColor
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className, style: styles, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-group__inner-container", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) }) });
    }
  },
  // v1 of group block. Deprecated to add an inner-container div around `InnerBlocks.Content`.
  {
    attributes: {
      backgroundColor: {
        type: "string"
      },
      customBackgroundColor: {
        type: "string"
      }
    },
    supports: {
      align: ["wide", "full"],
      anchor: true,
      html: false
    },
    migrate: migrateAttributes,
    save({ attributes }) {
      const { backgroundColor, customBackgroundColor } = attributes;
      const backgroundClass = (0, import_block_editor.getColorClassName)(
        "background-color",
        backgroundColor
      );
      const className = (0, import_clsx.default)(backgroundClass, {
        "has-background": backgroundColor || customBackgroundColor
      });
      const styles = {
        backgroundColor: backgroundClass ? void 0 : customBackgroundColor
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className, style: styles, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) });
    }
  }
];
var deprecated_default = deprecated;
//# sourceMappingURL=deprecated.cjs.map
