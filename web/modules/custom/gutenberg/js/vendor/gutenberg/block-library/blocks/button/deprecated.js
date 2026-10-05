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

// packages/block-library/src/button/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_compose = require("@wordpress/compose");
var import_migrate_font_family = __toESM(require("../utils/migrate-font-family.cjs"));
var import_migrate_text_align = __toESM(require("../utils/migrate-text-align.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var migrateWidth = (attributes) => {
  const { width, ...otherAttributes } = attributes;
  if (!width) {
    return otherAttributes;
  }
  return {
    ...otherAttributes,
    style: {
      ...otherAttributes.style,
      dimensions: {
        ...otherAttributes.style?.dimensions,
        width: `${width}%`
      }
    }
  };
};
var migrateBorderRadius = (attributes) => {
  const { borderRadius, ...newAttributes } = attributes;
  const oldBorderRadius = [
    borderRadius,
    newAttributes.style?.border?.radius
  ].find((possibleBorderRadius) => {
    return typeof possibleBorderRadius === "number" && possibleBorderRadius !== 0;
  });
  if (!oldBorderRadius) {
    return newAttributes;
  }
  return {
    ...newAttributes,
    style: {
      ...newAttributes.style,
      border: {
        ...newAttributes.style?.border,
        radius: `${oldBorderRadius}px`
      }
    }
  };
};
function migrateAlign(attributes) {
  if (!attributes.align) {
    return attributes;
  }
  const { align, ...otherAttributes } = attributes;
  return {
    ...otherAttributes,
    className: (0, import_clsx.default)(
      otherAttributes.className,
      `align${attributes.align}`
    )
  };
}
var migrateCustomColorsAndGradients = (attributes) => {
  if (!attributes.customTextColor && !attributes.customBackgroundColor && !attributes.customGradient) {
    return attributes;
  }
  const style = { color: {} };
  if (attributes.customTextColor) {
    style.color.text = attributes.customTextColor;
  }
  if (attributes.customBackgroundColor) {
    style.color.background = attributes.customBackgroundColor;
  }
  if (attributes.customGradient) {
    style.color.gradient = attributes.customGradient;
  }
  const {
    customTextColor,
    customBackgroundColor,
    customGradient,
    ...restAttributes
  } = attributes;
  return {
    ...restAttributes,
    style
  };
};
var oldColorsMigration = (attributes) => {
  const { color, textColor, ...restAttributes } = {
    ...attributes,
    customTextColor: attributes.textColor && "#" === attributes.textColor[0] ? attributes.textColor : void 0,
    customBackgroundColor: attributes.color && "#" === attributes.color[0] ? attributes.color : void 0
  };
  return migrateCustomColorsAndGradients(restAttributes);
};
var blockAttributes = {
  url: {
    type: "string",
    source: "attribute",
    selector: "a",
    attribute: "href"
  },
  title: {
    type: "string",
    source: "attribute",
    selector: "a",
    attribute: "title"
  },
  text: {
    type: "string",
    source: "html",
    selector: "a"
  }
};
var v14 = {
  attributes: {
    tagName: {
      type: "string",
      enum: ["a", "button"],
      default: "a"
    },
    type: {
      type: "string",
      default: "button"
    },
    url: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "href",
      role: "content"
    },
    title: {
      type: "string",
      source: "attribute",
      selector: "a,button",
      attribute: "title",
      role: "content"
    },
    text: {
      type: "rich-text",
      source: "rich-text",
      selector: "a,button",
      role: "content"
    },
    linkTarget: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "target",
      role: "content"
    },
    rel: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "rel",
      role: "content"
    },
    placeholder: {
      type: "string"
    },
    backgroundColor: {
      type: "string"
    },
    textColor: {
      type: "string"
    },
    gradient: {
      type: "string"
    },
    width: {
      type: "number"
    }
  },
  supports: {
    anchor: true,
    splitting: true,
    align: false,
    alignWide: false,
    color: {
      __experimentalSkipSerialization: true,
      gradients: true,
      __experimentalDefaultControls: {
        background: true,
        text: true
      }
    },
    typography: {
      __experimentalSkipSerialization: [
        "fontSize",
        "lineHeight",
        "textAlign",
        "fontFamily",
        "fontWeight",
        "fontStyle",
        "textTransform",
        "textDecoration",
        "letterSpacing"
      ],
      fontSize: true,
      lineHeight: true,
      textAlign: true,
      __experimentalFontFamily: true,
      __experimentalFontWeight: true,
      __experimentalFontStyle: true,
      __experimentalTextTransform: true,
      __experimentalTextDecoration: true,
      __experimentalLetterSpacing: true,
      __experimentalWritingMode: true,
      __experimentalDefaultControls: {
        fontSize: true
      }
    },
    reusable: false,
    shadow: {
      __experimentalSkipSerialization: true
    },
    spacing: {
      __experimentalSkipSerialization: true,
      padding: ["horizontal", "vertical"],
      __experimentalDefaultControls: {
        padding: true
      }
    },
    __experimentalBorder: {
      color: true,
      radius: true,
      style: true,
      width: true,
      __experimentalSkipSerialization: true,
      __experimentalDefaultControls: {
        color: true,
        radius: true,
        style: true,
        width: true
      }
    },
    interactivity: {
      clientNavigation: true
    }
  },
  selectors: {
    root: ".wp-block-button .wp-block-button__link",
    typography: {
      writingMode: ".wp-block-button"
    }
  },
  save({ attributes, className }) {
    const {
      tagName,
      type,
      fontSize,
      linkTarget,
      rel,
      style,
      text,
      title,
      url,
      width
    } = attributes;
    const TagName = tagName || "a";
    const isButtonTag = "button" === TagName;
    const buttonType = type || "button";
    const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
    const colorProps = (0, import_block_editor.__experimentalGetColorClassesAndStyles)(attributes);
    const spacingProps = (0, import_block_editor.__experimentalGetSpacingClassesAndStyles)(attributes);
    const shadowProps = (0, import_block_editor.__experimentalGetShadowClassesAndStyles)(attributes);
    const typographyProps = (0, import_block_editor.getTypographyClassesAndStyles)(attributes);
    const buttonClasses = (0, import_clsx.default)(
      "wp-block-button__link",
      colorProps.className,
      borderProps.className,
      typographyProps.className,
      {
        // For backwards compatibility add style that isn't
        // provided via block support.
        "no-border-radius": style?.border?.radius === 0,
        [`has-custom-font-size`]: fontSize || style?.typography?.fontSize
      },
      (0, import_block_editor.__experimentalGetElementClassName)("button")
    );
    const buttonStyle = {
      ...borderProps.style,
      ...colorProps.style,
      ...spacingProps.style,
      ...shadowProps.style,
      ...typographyProps.style,
      writingMode: void 0
    };
    const wrapperClasses = (0, import_clsx.default)(className, {
      [`has-custom-width wp-block-button__width-${width}`]: width
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...import_block_editor.useBlockProps.save({ className: wrapperClasses }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText.Content,
      {
        tagName: TagName,
        type: isButtonTag ? buttonType : null,
        className: buttonClasses,
        href: isButtonTag ? null : url,
        title,
        style: buttonStyle,
        value: text,
        target: isButtonTag ? null : linkTarget,
        rel: isButtonTag ? null : rel
      }
    ) });
  },
  isEligible(attributes) {
    return typeof attributes.width === "number";
  },
  migrate: migrateWidth
};
var v13 = {
  attributes: {
    tagName: {
      type: "string",
      enum: ["a", "button"],
      default: "a"
    },
    type: {
      type: "string",
      default: "button"
    },
    textAlign: {
      type: "string"
    },
    url: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "href",
      role: "content"
    },
    title: {
      type: "string",
      source: "attribute",
      selector: "a,button",
      attribute: "title",
      role: "content"
    },
    text: {
      type: "rich-text",
      source: "rich-text",
      selector: "a,button",
      role: "content"
    },
    linkTarget: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "target",
      role: "content"
    },
    rel: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "rel",
      role: "content"
    },
    placeholder: {
      type: "string"
    },
    backgroundColor: {
      type: "string"
    },
    textColor: {
      type: "string"
    },
    gradient: {
      type: "string"
    },
    width: {
      type: "number"
    }
  },
  supports: {
    anchor: true,
    align: true,
    alignWide: false,
    color: {
      __experimentalSkipSerialization: true,
      gradients: true,
      __experimentalDefaultControls: {
        background: true,
        text: true
      }
    },
    typography: {
      __experimentalSkipSerialization: [
        "fontSize",
        "lineHeight",
        "fontFamily",
        "fontWeight",
        "fontStyle",
        "textTransform",
        "textDecoration",
        "letterSpacing"
      ],
      fontSize: true,
      lineHeight: true,
      __experimentalFontFamily: true,
      __experimentalFontWeight: true,
      __experimentalFontStyle: true,
      __experimentalTextTransform: true,
      __experimentalTextDecoration: true,
      __experimentalLetterSpacing: true,
      __experimentalWritingMode: true,
      __experimentalDefaultControls: {
        fontSize: true
      }
    },
    reusable: false,
    shadow: {
      __experimentalSkipSerialization: true
    },
    spacing: {
      __experimentalSkipSerialization: true,
      padding: ["horizontal", "vertical"],
      __experimentalDefaultControls: {
        padding: true
      }
    },
    __experimentalBorder: {
      color: true,
      radius: true,
      style: true,
      width: true,
      __experimentalSkipSerialization: true,
      __experimentalDefaultControls: {
        color: true,
        radius: true,
        style: true,
        width: true
      }
    },
    interactivity: {
      clientNavigation: true
    }
  },
  selectors: {
    root: ".wp-block-button .wp-block-button__link",
    typography: {
      writingMode: ".wp-block-button"
    }
  },
  save({ attributes, className }) {
    const {
      tagName,
      type,
      textAlign,
      fontSize,
      linkTarget,
      rel,
      style,
      text,
      title,
      url,
      width
    } = attributes;
    const TagName = tagName || "a";
    const isButtonTag = "button" === TagName;
    const buttonType = type || "button";
    const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
    const colorProps = (0, import_block_editor.__experimentalGetColorClassesAndStyles)(attributes);
    const spacingProps = (0, import_block_editor.__experimentalGetSpacingClassesAndStyles)(attributes);
    const shadowProps = (0, import_block_editor.__experimentalGetShadowClassesAndStyles)(attributes);
    const typographyProps = (0, import_block_editor.getTypographyClassesAndStyles)(attributes);
    const buttonClasses = (0, import_clsx.default)(
      "wp-block-button__link",
      colorProps.className,
      borderProps.className,
      typographyProps.className,
      {
        [`has-text-align-${textAlign}`]: textAlign,
        // For backwards compatibility add style that isn't provided via
        // block support.
        "no-border-radius": style?.border?.radius === 0,
        [`has-custom-font-size`]: fontSize || style?.typography?.fontSize
      },
      (0, import_block_editor.__experimentalGetElementClassName)("button")
    );
    const buttonStyle = {
      ...borderProps.style,
      ...colorProps.style,
      ...spacingProps.style,
      ...shadowProps.style,
      ...typographyProps.style,
      writingMode: void 0
    };
    const wrapperClasses = (0, import_clsx.default)(className, {
      [`has-custom-width wp-block-button__width-${width}`]: width
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...import_block_editor.useBlockProps.save({ className: wrapperClasses }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText.Content,
      {
        tagName: TagName,
        type: isButtonTag ? buttonType : null,
        className: buttonClasses,
        href: isButtonTag ? null : url,
        title,
        style: buttonStyle,
        value: text,
        target: isButtonTag ? null : linkTarget,
        rel: isButtonTag ? null : rel
      }
    ) });
  },
  isEligible(attributes) {
    return !!attributes.textAlign || typeof attributes.width === "number";
  },
  migrate: (0, import_compose.compose)(migrateWidth, import_migrate_text_align.default)
};
var v12 = {
  attributes: {
    tagName: {
      type: "string",
      enum: ["a", "button"],
      default: "a"
    },
    type: {
      type: "string",
      default: "button"
    },
    textAlign: {
      type: "string"
    },
    url: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "href"
    },
    title: {
      type: "string",
      source: "attribute",
      selector: "a,button",
      attribute: "title",
      role: "content"
    },
    text: {
      type: "rich-text",
      source: "rich-text",
      selector: "a,button",
      role: "content"
    },
    linkTarget: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "target",
      role: "content"
    },
    rel: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "rel",
      role: "content"
    },
    placeholder: {
      type: "string"
    },
    backgroundColor: {
      type: "string"
    },
    textColor: {
      type: "string"
    },
    gradient: {
      type: "string"
    },
    width: {
      type: "number"
    }
  },
  supports: {
    anchor: true,
    align: true,
    alignWide: false,
    color: {
      __experimentalSkipSerialization: true,
      gradients: true,
      __experimentalDefaultControls: {
        background: true,
        text: true
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
      __experimentalWritingMode: true,
      __experimentalDefaultControls: {
        fontSize: true
      }
    },
    reusable: false,
    shadow: {
      __experimentalSkipSerialization: true
    },
    spacing: {
      __experimentalSkipSerialization: true,
      padding: ["horizontal", "vertical"],
      __experimentalDefaultControls: {
        padding: true
      }
    },
    __experimentalBorder: {
      color: true,
      radius: true,
      style: true,
      width: true,
      __experimentalSkipSerialization: true,
      __experimentalDefaultControls: {
        color: true,
        radius: true,
        style: true,
        width: true
      }
    },
    __experimentalSelector: ".wp-block-button__link",
    interactivity: {
      clientNavigation: true
    }
  },
  save({ attributes, className }) {
    const {
      tagName,
      type,
      textAlign,
      fontSize,
      linkTarget,
      rel,
      style,
      text,
      title,
      url,
      width
    } = attributes;
    const TagName = tagName || "a";
    const isButtonTag = "button" === TagName;
    const buttonType = type || "button";
    const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
    const colorProps = (0, import_block_editor.__experimentalGetColorClassesAndStyles)(attributes);
    const spacingProps = (0, import_block_editor.__experimentalGetSpacingClassesAndStyles)(attributes);
    const shadowProps = (0, import_block_editor.__experimentalGetShadowClassesAndStyles)(attributes);
    const buttonClasses = (0, import_clsx.default)(
      "wp-block-button__link",
      colorProps.className,
      borderProps.className,
      {
        [`has-text-align-${textAlign}`]: textAlign,
        // For backwards compatibility add style that isn't provided via
        // block support.
        "no-border-radius": style?.border?.radius === 0
      },
      (0, import_block_editor.__experimentalGetElementClassName)("button")
    );
    const buttonStyle = {
      ...borderProps.style,
      ...colorProps.style,
      ...spacingProps.style,
      ...shadowProps.style
    };
    const wrapperClasses = (0, import_clsx.default)(className, {
      [`has-custom-width wp-block-button__width-${width}`]: width,
      [`has-custom-font-size`]: fontSize || style?.typography?.fontSize
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...import_block_editor.useBlockProps.save({ className: wrapperClasses }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText.Content,
      {
        tagName: TagName,
        type: isButtonTag ? buttonType : null,
        className: buttonClasses,
        href: isButtonTag ? null : url,
        title,
        style: buttonStyle,
        value: text,
        target: isButtonTag ? null : linkTarget,
        rel: isButtonTag ? null : rel
      }
    ) });
  },
  isEligible(attributes) {
    return typeof attributes.width === "number";
  },
  migrate: migrateWidth
};
var v11 = {
  attributes: {
    url: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "href"
    },
    title: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "title"
    },
    text: {
      type: "string",
      source: "html",
      selector: "a"
    },
    linkTarget: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "target"
    },
    rel: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "rel"
    },
    placeholder: {
      type: "string"
    },
    backgroundColor: {
      type: "string"
    },
    textColor: {
      type: "string"
    },
    gradient: {
      type: "string"
    },
    width: {
      type: "number"
    }
  },
  supports: {
    anchor: true,
    align: true,
    alignWide: false,
    color: {
      __experimentalSkipSerialization: true,
      gradients: true,
      __experimentalDefaultControls: {
        background: true,
        text: true
      }
    },
    typography: {
      fontSize: true,
      __experimentalFontFamily: true,
      __experimentalDefaultControls: {
        fontSize: true
      }
    },
    reusable: false,
    spacing: {
      __experimentalSkipSerialization: true,
      padding: ["horizontal", "vertical"],
      __experimentalDefaultControls: {
        padding: true
      }
    },
    __experimentalBorder: {
      radius: true,
      __experimentalSkipSerialization: true,
      __experimentalDefaultControls: {
        radius: true
      }
    },
    __experimentalSelector: ".wp-block-button__link"
  },
  save({ attributes, className }) {
    const { fontSize, linkTarget, rel, style, text, title, url, width } = attributes;
    if (!text) {
      return null;
    }
    const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
    const colorProps = (0, import_block_editor.__experimentalGetColorClassesAndStyles)(attributes);
    const spacingProps = (0, import_block_editor.__experimentalGetSpacingClassesAndStyles)(attributes);
    const buttonClasses = (0, import_clsx.default)(
      "wp-block-button__link",
      colorProps.className,
      borderProps.className,
      {
        // For backwards compatibility add style that isn't provided via
        // block support.
        "no-border-radius": style?.border?.radius === 0
      }
    );
    const buttonStyle = {
      ...borderProps.style,
      ...colorProps.style,
      ...spacingProps.style
    };
    const wrapperClasses = (0, import_clsx.default)(className, {
      [`has-custom-width wp-block-button__width-${width}`]: width,
      [`has-custom-font-size`]: fontSize || style?.typography?.fontSize
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...import_block_editor.useBlockProps.save({ className: wrapperClasses }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText.Content,
      {
        tagName: "a",
        className: buttonClasses,
        href: url,
        title,
        style: buttonStyle,
        value: text,
        target: linkTarget,
        rel
      }
    ) });
  }
};
var v10 = {
  attributes: {
    url: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "href"
    },
    title: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "title"
    },
    text: {
      type: "string",
      source: "html",
      selector: "a"
    },
    linkTarget: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "target"
    },
    rel: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "rel"
    },
    placeholder: {
      type: "string"
    },
    backgroundColor: {
      type: "string"
    },
    textColor: {
      type: "string"
    },
    gradient: {
      type: "string"
    },
    width: {
      type: "number"
    }
  },
  supports: {
    anchor: true,
    align: true,
    alignWide: false,
    color: {
      __experimentalSkipSerialization: true,
      gradients: true
    },
    typography: {
      fontSize: true,
      __experimentalFontFamily: true
    },
    reusable: false,
    spacing: {
      __experimentalSkipSerialization: true,
      padding: ["horizontal", "vertical"],
      __experimentalDefaultControls: {
        padding: true
      }
    },
    __experimentalBorder: {
      radius: true,
      __experimentalSkipSerialization: true
    },
    __experimentalSelector: ".wp-block-button__link"
  },
  save({ attributes, className }) {
    const { fontSize, linkTarget, rel, style, text, title, url, width } = attributes;
    if (!text) {
      return null;
    }
    const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
    const colorProps = (0, import_block_editor.__experimentalGetColorClassesAndStyles)(attributes);
    const spacingProps = (0, import_block_editor.__experimentalGetSpacingClassesAndStyles)(attributes);
    const buttonClasses = (0, import_clsx.default)(
      "wp-block-button__link",
      colorProps.className,
      borderProps.className,
      {
        // For backwards compatibility add style that isn't provided via
        // block support.
        "no-border-radius": style?.border?.radius === 0
      }
    );
    const buttonStyle = {
      ...borderProps.style,
      ...colorProps.style,
      ...spacingProps.style
    };
    const wrapperClasses = (0, import_clsx.default)(className, {
      [`has-custom-width wp-block-button__width-${width}`]: width,
      [`has-custom-font-size`]: fontSize || style?.typography?.fontSize
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...import_block_editor.useBlockProps.save({ className: wrapperClasses }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText.Content,
      {
        tagName: "a",
        className: buttonClasses,
        href: url,
        title,
        style: buttonStyle,
        value: text,
        target: linkTarget,
        rel
      }
    ) });
  },
  migrate: (0, import_compose.compose)(migrateWidth, import_migrate_font_family.default),
  isEligible({ style, width }) {
    return style?.typography?.fontFamily || typeof width === "number";
  }
};
var deprecated = [
  v14,
  v13,
  v12,
  v11,
  v10,
  {
    supports: {
      anchor: true,
      align: true,
      alignWide: false,
      color: {
        __experimentalSkipSerialization: true,
        gradients: true
      },
      typography: {
        fontSize: true,
        __experimentalFontFamily: true
      },
      reusable: false,
      __experimentalSelector: ".wp-block-button__link"
    },
    attributes: {
      ...blockAttributes,
      linkTarget: {
        type: "string",
        source: "attribute",
        selector: "a",
        attribute: "target"
      },
      rel: {
        type: "string",
        source: "attribute",
        selector: "a",
        attribute: "rel"
      },
      placeholder: {
        type: "string"
      },
      backgroundColor: {
        type: "string"
      },
      textColor: {
        type: "string"
      },
      gradient: {
        type: "string"
      },
      width: {
        type: "number"
      }
    },
    isEligible({ style }) {
      return typeof style?.border?.radius === "number";
    },
    save({ attributes, className }) {
      const {
        fontSize,
        linkTarget,
        rel,
        style,
        text,
        title,
        url,
        width
      } = attributes;
      if (!text) {
        return null;
      }
      const borderRadius = style?.border?.radius;
      const colorProps = (0, import_block_editor.__experimentalGetColorClassesAndStyles)(attributes);
      const buttonClasses = (0, import_clsx.default)(
        "wp-block-button__link",
        colorProps.className,
        {
          "no-border-radius": style?.border?.radius === 0
        }
      );
      const buttonStyle = {
        borderRadius: borderRadius ? borderRadius : void 0,
        ...colorProps.style
      };
      const wrapperClasses = (0, import_clsx.default)(className, {
        [`has-custom-width wp-block-button__width-${width}`]: width,
        [`has-custom-font-size`]: fontSize || style?.typography?.fontSize
      });
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...import_block_editor.useBlockProps.save({ className: wrapperClasses }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          tagName: "a",
          className: buttonClasses,
          href: url,
          title,
          style: buttonStyle,
          value: text,
          target: linkTarget,
          rel
        }
      ) });
    },
    migrate: (0, import_compose.compose)(
      migrateWidth,
      import_migrate_font_family.default,
      migrateBorderRadius
    )
  },
  {
    supports: {
      anchor: true,
      align: true,
      alignWide: false,
      color: {
        __experimentalSkipSerialization: true
      },
      reusable: false,
      __experimentalSelector: ".wp-block-button__link"
    },
    attributes: {
      ...blockAttributes,
      linkTarget: {
        type: "string",
        source: "attribute",
        selector: "a",
        attribute: "target"
      },
      rel: {
        type: "string",
        source: "attribute",
        selector: "a",
        attribute: "rel"
      },
      placeholder: {
        type: "string"
      },
      borderRadius: {
        type: "number"
      },
      backgroundColor: {
        type: "string"
      },
      textColor: {
        type: "string"
      },
      gradient: {
        type: "string"
      },
      style: {
        type: "object"
      },
      width: {
        type: "number"
      }
    },
    save({ attributes, className }) {
      const { borderRadius, linkTarget, rel, text, title, url, width } = attributes;
      const colorProps = (0, import_block_editor.__experimentalGetColorClassesAndStyles)(attributes);
      const buttonClasses = (0, import_clsx.default)(
        "wp-block-button__link",
        colorProps.className,
        {
          "no-border-radius": borderRadius === 0
        }
      );
      const buttonStyle = {
        borderRadius: borderRadius ? borderRadius + "px" : void 0,
        ...colorProps.style
      };
      const wrapperClasses = (0, import_clsx.default)(className, {
        [`has-custom-width wp-block-button__width-${width}`]: width
      });
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...import_block_editor.useBlockProps.save({ className: wrapperClasses }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          tagName: "a",
          className: buttonClasses,
          href: url,
          title,
          style: buttonStyle,
          value: text,
          target: linkTarget,
          rel
        }
      ) });
    },
    migrate: (0, import_compose.compose)(
      migrateWidth,
      import_migrate_font_family.default,
      migrateBorderRadius
    )
  },
  {
    supports: {
      anchor: true,
      align: true,
      alignWide: false,
      color: {
        __experimentalSkipSerialization: true
      },
      reusable: false,
      __experimentalSelector: ".wp-block-button__link"
    },
    attributes: {
      ...blockAttributes,
      linkTarget: {
        type: "string",
        source: "attribute",
        selector: "a",
        attribute: "target"
      },
      rel: {
        type: "string",
        source: "attribute",
        selector: "a",
        attribute: "rel"
      },
      placeholder: {
        type: "string"
      },
      borderRadius: {
        type: "number"
      },
      backgroundColor: {
        type: "string"
      },
      textColor: {
        type: "string"
      },
      gradient: {
        type: "string"
      },
      style: {
        type: "object"
      },
      width: {
        type: "number"
      }
    },
    save({ attributes, className }) {
      const { borderRadius, linkTarget, rel, text, title, url, width } = attributes;
      const colorProps = (0, import_block_editor.__experimentalGetColorClassesAndStyles)(attributes);
      const buttonClasses = (0, import_clsx.default)(
        "wp-block-button__link",
        colorProps.className,
        {
          "no-border-radius": borderRadius === 0
        }
      );
      const buttonStyle = {
        borderRadius: borderRadius ? borderRadius + "px" : void 0,
        ...colorProps.style
      };
      const wrapperClasses = (0, import_clsx.default)(className, {
        [`has-custom-width wp-block-button__width-${width}`]: width
      });
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...import_block_editor.useBlockProps.save({ className: wrapperClasses }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          tagName: "a",
          className: buttonClasses,
          href: url,
          title,
          style: buttonStyle,
          value: text,
          target: linkTarget,
          rel
        }
      ) });
    },
    migrate: (0, import_compose.compose)(
      migrateWidth,
      import_migrate_font_family.default,
      migrateBorderRadius
    )
  },
  {
    supports: {
      align: true,
      alignWide: false,
      color: { gradients: true }
    },
    attributes: {
      ...blockAttributes,
      linkTarget: {
        type: "string",
        source: "attribute",
        selector: "a",
        attribute: "target"
      },
      rel: {
        type: "string",
        source: "attribute",
        selector: "a",
        attribute: "rel"
      },
      placeholder: {
        type: "string"
      },
      borderRadius: {
        type: "number"
      },
      backgroundColor: {
        type: "string"
      },
      textColor: {
        type: "string"
      },
      gradient: {
        type: "string"
      },
      style: {
        type: "object"
      }
    },
    save({ attributes }) {
      const { borderRadius, linkTarget, rel, text, title, url } = attributes;
      const buttonClasses = (0, import_clsx.default)("wp-block-button__link", {
        "no-border-radius": borderRadius === 0
      });
      const buttonStyle = {
        borderRadius: borderRadius ? borderRadius + "px" : void 0
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          tagName: "a",
          className: buttonClasses,
          href: url,
          title,
          style: buttonStyle,
          value: text,
          target: linkTarget,
          rel
        }
      );
    },
    migrate: (0, import_compose.compose)(migrateWidth, migrateBorderRadius)
  },
  {
    supports: {
      align: true,
      alignWide: false
    },
    attributes: {
      ...blockAttributes,
      linkTarget: {
        type: "string",
        source: "attribute",
        selector: "a",
        attribute: "target"
      },
      rel: {
        type: "string",
        source: "attribute",
        selector: "a",
        attribute: "rel"
      },
      placeholder: {
        type: "string"
      },
      borderRadius: {
        type: "number"
      },
      backgroundColor: {
        type: "string"
      },
      textColor: {
        type: "string"
      },
      customBackgroundColor: {
        type: "string"
      },
      customTextColor: {
        type: "string"
      },
      customGradient: {
        type: "string"
      },
      gradient: {
        type: "string"
      }
    },
    isEligible: (attributes) => !!attributes.customTextColor || !!attributes.customBackgroundColor || !!attributes.customGradient || !!attributes.align,
    migrate: (0, import_compose.compose)(
      migrateWidth,
      migrateBorderRadius,
      migrateCustomColorsAndGradients,
      migrateAlign
    ),
    save({ attributes }) {
      const {
        backgroundColor,
        borderRadius,
        customBackgroundColor,
        customTextColor,
        customGradient,
        linkTarget,
        gradient,
        rel,
        text,
        textColor,
        title,
        url
      } = attributes;
      const textClass = (0, import_block_editor.getColorClassName)("color", textColor);
      const backgroundClass = !customGradient && (0, import_block_editor.getColorClassName)("background-color", backgroundColor);
      const gradientClass = (0, import_block_editor.__experimentalGetGradientClass)(gradient);
      const buttonClasses = (0, import_clsx.default)("wp-block-button__link", {
        "has-text-color": textColor || customTextColor,
        [textClass]: textClass,
        "has-background": backgroundColor || customBackgroundColor || customGradient || gradient,
        [backgroundClass]: backgroundClass,
        "no-border-radius": borderRadius === 0,
        [gradientClass]: gradientClass
      });
      const buttonStyle = {
        background: customGradient ? customGradient : void 0,
        backgroundColor: backgroundClass || customGradient || gradient ? void 0 : customBackgroundColor,
        color: textClass ? void 0 : customTextColor,
        borderRadius: borderRadius ? borderRadius + "px" : void 0
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          tagName: "a",
          className: buttonClasses,
          href: url,
          title,
          style: buttonStyle,
          value: text,
          target: linkTarget,
          rel
        }
      ) });
    }
  },
  {
    attributes: {
      ...blockAttributes,
      align: {
        type: "string",
        default: "none"
      },
      backgroundColor: {
        type: "string"
      },
      textColor: {
        type: "string"
      },
      customBackgroundColor: {
        type: "string"
      },
      customTextColor: {
        type: "string"
      },
      linkTarget: {
        type: "string",
        source: "attribute",
        selector: "a",
        attribute: "target"
      },
      rel: {
        type: "string",
        source: "attribute",
        selector: "a",
        attribute: "rel"
      },
      placeholder: {
        type: "string"
      }
    },
    isEligible(attribute) {
      return attribute.className && attribute.className.includes("is-style-squared");
    },
    migrate(attributes) {
      let newClassName = attributes.className;
      if (newClassName) {
        newClassName = newClassName.replace(/is-style-squared[\s]?/, "").trim();
      }
      return migrateBorderRadius(
        migrateCustomColorsAndGradients({
          ...attributes,
          className: newClassName ? newClassName : void 0,
          borderRadius: 0
        })
      );
    },
    save({ attributes }) {
      const {
        backgroundColor,
        customBackgroundColor,
        customTextColor,
        linkTarget,
        rel,
        text,
        textColor,
        title,
        url
      } = attributes;
      const textClass = (0, import_block_editor.getColorClassName)("color", textColor);
      const backgroundClass = (0, import_block_editor.getColorClassName)(
        "background-color",
        backgroundColor
      );
      const buttonClasses = (0, import_clsx.default)("wp-block-button__link", {
        "has-text-color": textColor || customTextColor,
        [textClass]: textClass,
        "has-background": backgroundColor || customBackgroundColor,
        [backgroundClass]: backgroundClass
      });
      const buttonStyle = {
        backgroundColor: backgroundClass ? void 0 : customBackgroundColor,
        color: textClass ? void 0 : customTextColor
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          tagName: "a",
          className: buttonClasses,
          href: url,
          title,
          style: buttonStyle,
          value: text,
          target: linkTarget,
          rel
        }
      ) });
    }
  },
  {
    attributes: {
      ...blockAttributes,
      align: {
        type: "string",
        default: "none"
      },
      backgroundColor: {
        type: "string"
      },
      textColor: {
        type: "string"
      },
      customBackgroundColor: {
        type: "string"
      },
      customTextColor: {
        type: "string"
      }
    },
    migrate: (0, import_compose.compose)(migrateWidth, oldColorsMigration),
    save({ attributes }) {
      const {
        url,
        text,
        title,
        backgroundColor,
        textColor,
        customBackgroundColor,
        customTextColor
      } = attributes;
      const textClass = (0, import_block_editor.getColorClassName)("color", textColor);
      const backgroundClass = (0, import_block_editor.getColorClassName)(
        "background-color",
        backgroundColor
      );
      const buttonClasses = (0, import_clsx.default)("wp-block-button__link", {
        "has-text-color": textColor || customTextColor,
        [textClass]: textClass,
        "has-background": backgroundColor || customBackgroundColor,
        [backgroundClass]: backgroundClass
      });
      const buttonStyle = {
        backgroundColor: backgroundClass ? void 0 : customBackgroundColor,
        color: textClass ? void 0 : customTextColor
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          tagName: "a",
          className: buttonClasses,
          href: url,
          title,
          style: buttonStyle,
          value: text
        }
      ) });
    }
  },
  {
    attributes: {
      ...blockAttributes,
      color: {
        type: "string"
      },
      textColor: {
        type: "string"
      },
      align: {
        type: "string",
        default: "none"
      }
    },
    save({ attributes }) {
      const { url, text, title, align, color, textColor } = attributes;
      const buttonStyle = {
        backgroundColor: color,
        color: textColor
      };
      const linkClass = "wp-block-button__link";
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `align${align}`, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          tagName: "a",
          className: linkClass,
          href: url,
          title,
          style: buttonStyle,
          value: text
        }
      ) });
    },
    migrate: (0, import_compose.compose)(migrateWidth, oldColorsMigration)
  },
  {
    attributes: {
      ...blockAttributes,
      color: {
        type: "string"
      },
      textColor: {
        type: "string"
      },
      align: {
        type: "string",
        default: "none"
      }
    },
    save({ attributes }) {
      const { url, text, title, align, color, textColor } = attributes;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          className: `align${align}`,
          style: { backgroundColor: color },
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.RichText.Content,
            {
              tagName: "a",
              href: url,
              title,
              style: { color: textColor },
              value: text
            }
          )
        }
      );
    },
    migrate: (0, import_compose.compose)(migrateWidth, oldColorsMigration)
  }
];
var deprecated_default = deprecated;
//# sourceMappingURL=deprecated.cjs.map
