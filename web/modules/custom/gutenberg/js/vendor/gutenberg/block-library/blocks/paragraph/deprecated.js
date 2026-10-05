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

// packages/block-library/src/paragraph/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_element = require("@wordpress/element");
var import_block_editor = require("@wordpress/block-editor");
var import_i18n = require("@wordpress/i18n");
var import_jsx_runtime = require("react/jsx-runtime");
var supports = {
  className: false
};
var blockAttributes = {
  align: {
    type: "string"
  },
  content: {
    type: "string",
    source: "html",
    selector: "p",
    default: ""
  },
  dropCap: {
    type: "boolean",
    default: false
  },
  placeholder: {
    type: "string"
  },
  textColor: {
    type: "string"
  },
  backgroundColor: {
    type: "string"
  },
  fontSize: {
    type: "string"
  },
  direction: {
    type: "string",
    enum: ["ltr", "rtl"]
  },
  style: {
    type: "object"
  }
};
var migrateCustomColorsAndFontSizes = (attributes) => {
  if (!attributes.customTextColor && !attributes.customBackgroundColor && !attributes.customFontSize) {
    return attributes;
  }
  const style2 = {};
  if (attributes.customTextColor || attributes.customBackgroundColor) {
    style2.color = {};
  }
  if (attributes.customTextColor) {
    style2.color.text = attributes.customTextColor;
  }
  if (attributes.customBackgroundColor) {
    style2.color.background = attributes.customBackgroundColor;
  }
  if (attributes.customFontSize) {
    style2.typography = { fontSize: attributes.customFontSize };
  }
  const {
    customTextColor,
    customBackgroundColor,
    customFontSize,
    ...restAttributes
  } = attributes;
  return {
    ...restAttributes,
    style: style2
  };
};
var migrateTextAlign = (attributes) => {
  const { align, ...restAttributes } = attributes;
  if (!align) {
    return attributes;
  }
  return {
    ...restAttributes,
    style: {
      ...attributes.style,
      typography: {
        ...attributes.style?.typography,
        textAlign: align
      }
    }
  };
};
var { style, ...restBlockAttributes } = blockAttributes;
var deprecated = [
  // Version with `align` attribute.
  {
    supports: {
      className: false,
      color: true,
      typography: {
        fontSize: true
      }
    },
    attributes: blockAttributes,
    isEligible(attributes) {
      return !!attributes.align || !!attributes.className?.match(
        /\bhas-text-align-(left|center|right)\b/
      );
    },
    save({ attributes }) {
      const { align, content, dropCap, direction } = attributes;
      const className = (0, import_clsx.default)({
        "has-drop-cap": align === ((0, import_i18n.isRTL)() ? "left" : "right") || align === "center" ? false : dropCap,
        [`has-text-align-${align}`]: align
      });
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { ...import_block_editor.useBlockProps.save({ className, dir: direction }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: content }) });
    },
    migrate: migrateTextAlign
  },
  // Version without drop cap on aligned text.
  {
    supports,
    attributes: {
      ...restBlockAttributes,
      customTextColor: {
        type: "string"
      },
      customBackgroundColor: {
        type: "string"
      },
      customFontSize: {
        type: "number"
      }
    },
    migrate: migrateTextAlign,
    save({ attributes }) {
      const { align, content, dropCap, direction } = attributes;
      const className = (0, import_clsx.default)({
        "has-drop-cap": align === ((0, import_i18n.isRTL)() ? "left" : "right") || align === "center" ? false : dropCap,
        [`has-text-align-${align}`]: align
      });
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { ...import_block_editor.useBlockProps.save({ className, dir: direction }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: content }) });
    }
  },
  {
    supports,
    attributes: {
      ...restBlockAttributes,
      customTextColor: {
        type: "string"
      },
      customBackgroundColor: {
        type: "string"
      },
      customFontSize: {
        type: "number"
      }
    },
    migrate(attributes) {
      return migrateCustomColorsAndFontSizes(
        migrateTextAlign(attributes)
      );
    },
    save({ attributes }) {
      const {
        align,
        content,
        dropCap,
        backgroundColor,
        textColor,
        customBackgroundColor,
        customTextColor,
        fontSize,
        customFontSize,
        direction
      } = attributes;
      const textClass = (0, import_block_editor.getColorClassName)("color", textColor);
      const backgroundClass = (0, import_block_editor.getColorClassName)(
        "background-color",
        backgroundColor
      );
      const fontSizeClass = (0, import_block_editor.getFontSizeClass)(fontSize);
      const className = (0, import_clsx.default)({
        "has-text-color": textColor || customTextColor,
        "has-background": backgroundColor || customBackgroundColor,
        "has-drop-cap": dropCap,
        [`has-text-align-${align}`]: align,
        [fontSizeClass]: fontSizeClass,
        [textClass]: textClass,
        [backgroundClass]: backgroundClass
      });
      const styles = {
        backgroundColor: backgroundClass ? void 0 : customBackgroundColor,
        color: textClass ? void 0 : customTextColor,
        fontSize: fontSizeClass ? void 0 : customFontSize
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          tagName: "p",
          style: styles,
          className: className ? className : void 0,
          value: content,
          dir: direction
        }
      );
    }
  },
  {
    supports,
    attributes: {
      ...restBlockAttributes,
      customTextColor: {
        type: "string"
      },
      customBackgroundColor: {
        type: "string"
      },
      customFontSize: {
        type: "number"
      }
    },
    migrate(attributes) {
      return migrateCustomColorsAndFontSizes(
        migrateTextAlign(attributes)
      );
    },
    save({ attributes }) {
      const {
        align,
        content,
        dropCap,
        backgroundColor,
        textColor,
        customBackgroundColor,
        customTextColor,
        fontSize,
        customFontSize,
        direction
      } = attributes;
      const textClass = (0, import_block_editor.getColorClassName)("color", textColor);
      const backgroundClass = (0, import_block_editor.getColorClassName)(
        "background-color",
        backgroundColor
      );
      const fontSizeClass = (0, import_block_editor.getFontSizeClass)(fontSize);
      const className = (0, import_clsx.default)({
        "has-text-color": textColor || customTextColor,
        "has-background": backgroundColor || customBackgroundColor,
        "has-drop-cap": dropCap,
        [fontSizeClass]: fontSizeClass,
        [textClass]: textClass,
        [backgroundClass]: backgroundClass
      });
      const styles = {
        backgroundColor: backgroundClass ? void 0 : customBackgroundColor,
        color: textClass ? void 0 : customTextColor,
        fontSize: fontSizeClass ? void 0 : customFontSize,
        textAlign: align
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          tagName: "p",
          style: styles,
          className: className ? className : void 0,
          value: content,
          dir: direction
        }
      );
    }
  },
  {
    supports,
    attributes: {
      ...restBlockAttributes,
      customTextColor: {
        type: "string"
      },
      customBackgroundColor: {
        type: "string"
      },
      customFontSize: {
        type: "number"
      },
      width: {
        type: "string"
      }
    },
    migrate(attributes) {
      return migrateCustomColorsAndFontSizes(
        migrateTextAlign(attributes)
      );
    },
    save({ attributes }) {
      const {
        width,
        align,
        content,
        dropCap,
        backgroundColor,
        textColor,
        customBackgroundColor,
        customTextColor,
        fontSize,
        customFontSize
      } = attributes;
      const textClass = (0, import_block_editor.getColorClassName)("color", textColor);
      const backgroundClass = (0, import_block_editor.getColorClassName)(
        "background-color",
        backgroundColor
      );
      const fontSizeClass = fontSize && `is-${fontSize}-text`;
      const className = (0, import_clsx.default)({
        [`align${width}`]: width,
        "has-background": backgroundColor || customBackgroundColor,
        "has-drop-cap": dropCap,
        [fontSizeClass]: fontSizeClass,
        [textClass]: textClass,
        [backgroundClass]: backgroundClass
      });
      const styles = {
        backgroundColor: backgroundClass ? void 0 : customBackgroundColor,
        color: textClass ? void 0 : customTextColor,
        fontSize: fontSizeClass ? void 0 : customFontSize,
        textAlign: align
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          tagName: "p",
          style: styles,
          className: className ? className : void 0,
          value: content
        }
      );
    }
  },
  {
    supports,
    attributes: {
      ...restBlockAttributes,
      fontSize: {
        type: "number"
      }
    },
    save({ attributes }) {
      const {
        width,
        align,
        content,
        dropCap,
        backgroundColor,
        textColor,
        fontSize
      } = attributes;
      const className = (0, import_clsx.default)({
        [`align${width}`]: width,
        "has-background": backgroundColor,
        "has-drop-cap": dropCap
      });
      const styles = {
        backgroundColor,
        color: textColor,
        fontSize,
        textAlign: align
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "p",
        {
          style: styles,
          className: className ? className : void 0,
          children: content
        }
      );
    },
    migrate(attributes) {
      return migrateCustomColorsAndFontSizes(
        migrateTextAlign({
          ...attributes,
          customFontSize: Number.isFinite(attributes.fontSize) ? attributes.fontSize : void 0,
          customTextColor: attributes.textColor && "#" === attributes.textColor[0] ? attributes.textColor : void 0,
          customBackgroundColor: attributes.backgroundColor && "#" === attributes.backgroundColor[0] ? attributes.backgroundColor : void 0
        })
      );
    }
  },
  {
    supports,
    attributes: {
      ...blockAttributes,
      content: {
        type: "string",
        source: "html",
        default: ""
      }
    },
    save({ attributes }) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_element.RawHTML, { children: attributes.content });
    },
    migrate: (attributes) => attributes
  }
];
var deprecated_default = deprecated;
//# sourceMappingURL=deprecated.cjs.map
