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

// packages/block-library/src/pullquote/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_shared = require("./shared.cjs");
var import_migrate_text_align = __toESM(require("../utils/migrate-text-align.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var blockAttributes = {
  value: {
    type: "string",
    source: "html",
    selector: "blockquote",
    multiline: "p"
  },
  citation: {
    type: "string",
    source: "html",
    selector: "cite",
    default: ""
  },
  mainColor: {
    type: "string"
  },
  customMainColor: {
    type: "string"
  },
  textColor: {
    type: "string"
  },
  customTextColor: {
    type: "string"
  }
};
function parseBorderColor(styleString) {
  if (!styleString) {
    return;
  }
  const matches = styleString.match(/border-color:([^;]+)[;]?/);
  if (matches && matches[1]) {
    return matches[1];
  }
}
function multilineToInline(value) {
  value = value || `<p></p>`;
  const padded = `</p>${value}<p>`;
  const values = padded.split(`</p><p>`);
  values.shift();
  values.pop();
  return values.join("<br>");
}
var v6 = {
  attributes: {
    value: {
      type: "rich-text",
      source: "rich-text",
      selector: "p",
      role: "content"
    },
    citation: {
      type: "rich-text",
      source: "rich-text",
      selector: "cite",
      role: "content"
    },
    textAlign: {
      type: "string"
    }
  },
  supports: {
    anchor: true,
    align: ["left", "right", "wide", "full"],
    background: {
      backgroundImage: true,
      backgroundSize: true,
      __experimentalDefaultControls: {
        backgroundImage: true
      }
    },
    color: {
      gradients: true,
      background: true,
      link: true,
      __experimentalDefaultControls: {
        background: true,
        text: true
      }
    },
    dimensions: {
      minHeight: true
    },
    spacing: {
      margin: true,
      padding: true
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
    __experimentalStyle: {
      typography: {
        fontSize: "1.5em",
        lineHeight: "1.6"
      }
    },
    interactivity: {
      clientNavigation: true
    }
  },
  save({ attributes }) {
    const { textAlign, citation, value } = attributes;
    const shouldShowCitation = !import_block_editor.RichText.isEmpty(citation);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "figure",
      {
        ...import_block_editor.useBlockProps.save({
          className: (0, import_clsx.default)({
            [`has-text-align-${textAlign}`]: textAlign
          })
        }),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "p", value }),
          shouldShowCitation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "cite", value: citation })
        ] })
      }
    );
  },
  isEligible(attributes) {
    return !!attributes.textAlign || !!attributes.className?.match(
      /\bhas-text-align-(left|center|right)\b/
    );
  },
  migrate: import_migrate_text_align.default
};
var v5 = {
  attributes: {
    value: {
      type: "string",
      source: "html",
      selector: "blockquote",
      multiline: "p",
      role: "content"
    },
    citation: {
      type: "string",
      source: "html",
      selector: "cite",
      default: "",
      role: "content"
    },
    textAlign: {
      type: "string"
    }
  },
  supports: {
    anchor: true,
    align: ["left", "right", "wide", "full"],
    color: {
      gradients: true,
      background: true,
      link: true,
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
      __experimentalDefaultControls: {
        fontSize: true,
        fontAppearance: true
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
    __experimentalStyle: {
      typography: {
        fontSize: "1.5em",
        lineHeight: "1.6"
      }
    }
  },
  save({ attributes }) {
    const { textAlign, citation, value } = attributes;
    const shouldShowCitation = !import_block_editor.RichText.isEmpty(citation);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "figure",
      {
        ...import_block_editor.useBlockProps.save({
          className: (0, import_clsx.default)({
            [`has-text-align-${textAlign}`]: textAlign
          })
        }),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value, multiline: true }),
          shouldShowCitation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "cite", value: citation })
        ] })
      }
    );
  },
  migrate({ value, ...attributes }) {
    return (0, import_migrate_text_align.default)({
      value: multilineToInline(value),
      ...attributes
    });
  }
};
var v4 = {
  attributes: {
    ...blockAttributes
  },
  supports: {
    anchor: true,
    align: ["left", "right", "wide", "full"],
    color: {
      gradients: true,
      background: true,
      link: true
    },
    __experimentalBorder: {
      color: true,
      radius: true,
      style: true,
      width: true
    }
  },
  save({ attributes }) {
    const {
      mainColor,
      customMainColor,
      customTextColor,
      textColor,
      value,
      citation,
      className
    } = attributes;
    const isSolidColorStyle = className?.includes(import_shared.SOLID_COLOR_CLASS);
    let figureClasses, figureStyles;
    if (isSolidColorStyle) {
      const backgroundClass = (0, import_block_editor.getColorClassName)(
        "background-color",
        mainColor
      );
      figureClasses = (0, import_clsx.default)({
        "has-background": backgroundClass || customMainColor,
        [backgroundClass]: backgroundClass
      });
      figureStyles = {
        backgroundColor: backgroundClass ? void 0 : customMainColor
      };
    } else if (customMainColor) {
      figureStyles = {
        borderColor: customMainColor
      };
    }
    const blockquoteTextColorClass = (0, import_block_editor.getColorClassName)(
      "color",
      textColor
    );
    const blockquoteClasses = (0, import_clsx.default)({
      "has-text-color": textColor || customTextColor,
      [blockquoteTextColorClass]: blockquoteTextColorClass
    });
    const blockquoteStyles = blockquoteTextColorClass ? void 0 : { color: customTextColor };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "figure",
      {
        ...import_block_editor.useBlockProps.save({
          className: figureClasses,
          style: figureStyles
        }),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "blockquote",
          {
            className: blockquoteClasses,
            style: blockquoteStyles,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value, multiline: true }),
              !import_block_editor.RichText.isEmpty(citation) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "cite", value: citation })
            ]
          }
        )
      }
    );
  },
  migrate({
    value,
    className,
    mainColor,
    customMainColor,
    customTextColor,
    ...attributes
  }) {
    const isSolidColorStyle = className?.includes(import_shared.SOLID_COLOR_CLASS);
    let style;
    if (customMainColor) {
      if (!isSolidColorStyle) {
        style = {
          border: {
            color: customMainColor
          }
        };
      } else {
        style = {
          color: {
            background: customMainColor
          }
        };
      }
    }
    if (customTextColor && style) {
      style.color = {
        ...style.color,
        text: customTextColor
      };
    }
    return (0, import_migrate_text_align.default)({
      value: multilineToInline(value),
      className,
      backgroundColor: isSolidColorStyle ? mainColor : void 0,
      borderColor: isSolidColorStyle ? void 0 : mainColor,
      textAlign: isSolidColorStyle ? "left" : void 0,
      ...attributes,
      style
    });
  }
};
var v3 = {
  attributes: {
    ...blockAttributes,
    // figureStyle is an attribute that never existed.
    // We are using it as a way to access the styles previously applied to the figure.
    figureStyle: {
      source: "attribute",
      selector: "figure",
      attribute: "style"
    }
  },
  save({ attributes }) {
    const {
      mainColor,
      customMainColor,
      textColor,
      customTextColor,
      value,
      citation,
      className,
      figureStyle
    } = attributes;
    const isSolidColorStyle = className?.includes(import_shared.SOLID_COLOR_CLASS);
    let figureClasses, figureStyles;
    if (isSolidColorStyle) {
      const backgroundClass = (0, import_block_editor.getColorClassName)(
        "background-color",
        mainColor
      );
      figureClasses = (0, import_clsx.default)({
        "has-background": backgroundClass || customMainColor,
        [backgroundClass]: backgroundClass
      });
      figureStyles = {
        backgroundColor: backgroundClass ? void 0 : customMainColor
      };
    } else if (customMainColor) {
      figureStyles = {
        borderColor: customMainColor
      };
    } else if (mainColor) {
      const borderColor = parseBorderColor(figureStyle);
      figureStyles = {
        borderColor
      };
    }
    const blockquoteTextColorClass = (0, import_block_editor.getColorClassName)(
      "color",
      textColor
    );
    const blockquoteClasses = (textColor || customTextColor) && (0, import_clsx.default)("has-text-color", {
      [blockquoteTextColorClass]: blockquoteTextColorClass
    });
    const blockquoteStyles = blockquoteTextColorClass ? void 0 : { color: customTextColor };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", { className: figureClasses, style: figureStyles, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "blockquote",
      {
        className: blockquoteClasses,
        style: blockquoteStyles,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value, multiline: true }),
          !import_block_editor.RichText.isEmpty(citation) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "cite", value: citation })
        ]
      }
    ) });
  },
  migrate({
    value,
    className,
    figureStyle,
    mainColor,
    customMainColor,
    customTextColor,
    ...attributes
  }) {
    const isSolidColorStyle = className?.includes(import_shared.SOLID_COLOR_CLASS);
    let style;
    if (customMainColor) {
      if (!isSolidColorStyle) {
        style = {
          border: {
            color: customMainColor
          }
        };
      } else {
        style = {
          color: {
            background: customMainColor
          }
        };
      }
    }
    if (customTextColor && style) {
      style.color = {
        ...style.color,
        text: customTextColor
      };
    }
    if (!isSolidColorStyle && mainColor && figureStyle) {
      const borderColor = parseBorderColor(figureStyle);
      if (borderColor) {
        return {
          value: multilineToInline(value),
          ...attributes,
          className,
          // Block supports: Set style.border.color if a deprecated block has `mainColor`, inline border CSS and is not a solid color style.
          style: {
            border: {
              color: borderColor
            }
          }
        };
      }
    }
    return (0, import_migrate_text_align.default)({
      value: multilineToInline(value),
      className,
      backgroundColor: isSolidColorStyle ? mainColor : void 0,
      borderColor: isSolidColorStyle ? void 0 : mainColor,
      textAlign: isSolidColorStyle ? "left" : void 0,
      ...attributes,
      style
    });
  }
};
var v2 = {
  attributes: blockAttributes,
  save({ attributes }) {
    const {
      mainColor,
      customMainColor,
      textColor,
      customTextColor,
      value,
      citation,
      className
    } = attributes;
    const isSolidColorStyle = className?.includes(import_shared.SOLID_COLOR_CLASS);
    let figureClass, figureStyles;
    if (isSolidColorStyle) {
      figureClass = (0, import_block_editor.getColorClassName)("background-color", mainColor);
      if (!figureClass) {
        figureStyles = {
          backgroundColor: customMainColor
        };
      }
    } else if (customMainColor) {
      figureStyles = {
        borderColor: customMainColor
      };
    } else if (mainColor) {
      const colors = (0, import_data.select)(import_block_editor.store).getSettings().colors ?? [];
      const colorObject = (0, import_block_editor.getColorObjectByAttributeValues)(
        colors,
        mainColor
      );
      figureStyles = {
        borderColor: colorObject.color
      };
    }
    const blockquoteTextColorClass = (0, import_block_editor.getColorClassName)(
      "color",
      textColor
    );
    const blockquoteClasses = textColor || customTextColor ? (0, import_clsx.default)("has-text-color", {
      [blockquoteTextColorClass]: blockquoteTextColorClass
    }) : void 0;
    const blockquoteStyle = blockquoteTextColorClass ? void 0 : { color: customTextColor };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", { className: figureClass, style: figureStyles, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "blockquote",
      {
        className: blockquoteClasses,
        style: blockquoteStyle,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value, multiline: true }),
          !import_block_editor.RichText.isEmpty(citation) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "cite", value: citation })
        ]
      }
    ) });
  },
  migrate({
    value,
    className,
    mainColor,
    customMainColor,
    customTextColor,
    ...attributes
  }) {
    const isSolidColorStyle = className?.includes(import_shared.SOLID_COLOR_CLASS);
    let style = {};
    if (customMainColor) {
      if (!isSolidColorStyle) {
        style = {
          border: {
            color: customMainColor
          }
        };
      } else {
        style = {
          color: {
            background: customMainColor
          }
        };
      }
    }
    if (customTextColor && style) {
      style.color = {
        ...style.color,
        text: customTextColor
      };
    }
    return (0, import_migrate_text_align.default)({
      value: multilineToInline(value),
      className,
      backgroundColor: isSolidColorStyle ? mainColor : void 0,
      borderColor: isSolidColorStyle ? void 0 : mainColor,
      textAlign: isSolidColorStyle ? "left" : void 0,
      ...attributes,
      style
    });
  }
};
var v1 = {
  attributes: {
    ...blockAttributes
  },
  save({ attributes }) {
    const { value, citation } = attributes;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value, multiline: true }),
      !import_block_editor.RichText.isEmpty(citation) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "cite", value: citation })
    ] });
  },
  migrate({ value, ...attributes }) {
    return {
      value: multilineToInline(value),
      ...attributes
    };
  }
};
var v0 = {
  attributes: {
    ...blockAttributes,
    citation: {
      type: "string",
      source: "html",
      selector: "footer"
    },
    align: {
      type: "string",
      default: "none"
    }
  },
  save({ attributes }) {
    const { value, citation, align } = attributes;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", { className: `align${align}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value, multiline: true }),
      !import_block_editor.RichText.isEmpty(citation) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "footer", value: citation })
    ] });
  },
  migrate({ value, ...attributes }) {
    return {
      value: multilineToInline(value),
      ...attributes
    };
  }
};
var deprecated_default = [v6, v5, v4, v3, v2, v1, v0];
//# sourceMappingURL=deprecated.cjs.map
