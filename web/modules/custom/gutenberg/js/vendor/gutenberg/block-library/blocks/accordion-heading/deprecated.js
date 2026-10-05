"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/block-library/src/accordion-heading/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
var v1 = {
  attributes: {
    openByDefault: {
      type: "boolean",
      default: false
    },
    title: {
      type: "rich-text",
      source: "rich-text",
      selector: ".wp-block-accordion-heading__toggle-title",
      role: "content"
    },
    level: {
      type: "number"
    },
    iconPosition: {
      type: "string",
      enum: ["left", "right"],
      default: "right"
    },
    showIcon: {
      type: "boolean",
      default: true
    }
  },
  supports: {
    anchor: true,
    color: {
      background: true,
      gradients: true
    },
    align: false,
    interactivity: true,
    spacing: {
      padding: true,
      __experimentalDefaultControls: {
        padding: true
      },
      __experimentalSkipSerialization: true,
      __experimentalSelector: ".wp-block-accordion-heading__toggle"
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
      __experimentalFontFamily: true,
      __experimentalFontWeight: true,
      __experimentalFontStyle: true,
      __experimentalTextTransform: true,
      __experimentalTextDecoration: true,
      __experimentalLetterSpacing: true,
      __experimentalDefaultControls: {
        fontSize: true,
        fontFamily: true
      }
    },
    shadow: true,
    visibility: false
  },
  save({ attributes }) {
    const { level, title, iconPosition, showIcon } = attributes;
    const TagName = "h" + (level || 3);
    const blockProps = import_block_editor.useBlockProps.save();
    const spacingProps = (0, import_block_editor.__experimentalGetSpacingClassesAndStyles)(attributes);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        className: "wp-block-accordion-heading__toggle",
        style: spacingProps.style,
        children: [
          showIcon && iconPosition === "left" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "span",
            {
              className: "wp-block-accordion-heading__toggle-icon",
              "aria-hidden": "true",
              children: "+"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.RichText.Content,
            {
              className: "wp-block-accordion-heading__toggle-title",
              tagName: "span",
              value: title
            }
          ),
          showIcon && iconPosition === "right" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "span",
            {
              className: "wp-block-accordion-heading__toggle-icon",
              "aria-hidden": "true",
              children: "+"
            }
          )
        ]
      }
    ) });
  }
};
var v2 = {
  attributes: {
    openByDefault: {
      type: "boolean",
      default: false
    },
    title: {
      type: "rich-text",
      source: "rich-text",
      selector: ".wp-block-accordion-heading__toggle-title",
      role: "content"
    },
    level: {
      type: "number"
    },
    iconPosition: {
      type: "string",
      enum: ["left", "right"],
      default: "right"
    },
    showIcon: {
      type: "boolean",
      default: true
    }
  },
  supports: {
    anchor: true,
    color: {
      background: true,
      gradients: true
    },
    align: false,
    interactivity: true,
    spacing: {
      padding: true,
      __experimentalDefaultControls: {
        padding: true
      },
      __experimentalSkipSerialization: true,
      __experimentalSelector: ".wp-block-accordion-heading__toggle"
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
      __experimentalSkipSerialization: [
        "textDecoration",
        "letterSpacing"
      ],
      fontSize: true,
      __experimentalFontFamily: true,
      __experimentalFontWeight: true,
      __experimentalFontStyle: true,
      __experimentalTextTransform: true,
      __experimentalTextDecoration: true,
      __experimentalLetterSpacing: true,
      __experimentalDefaultControls: {
        fontSize: true,
        fontFamily: true
      }
    },
    shadow: true,
    visibility: false,
    lock: false
  },
  save({ attributes }) {
    const { level, title, iconPosition, showIcon } = attributes;
    const TagName = "h" + (level || 3);
    const typographyProps = (0, import_block_editor.getTypographyClassesAndStyles)(attributes);
    const blockProps = import_block_editor.useBlockProps.save();
    const spacingProps = (0, import_block_editor.__experimentalGetSpacingClassesAndStyles)(attributes);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        className: "wp-block-accordion-heading__toggle",
        style: spacingProps.style,
        children: [
          showIcon && iconPosition === "left" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "span",
            {
              className: "wp-block-accordion-heading__toggle-icon",
              "aria-hidden": "true",
              children: "+"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.RichText.Content,
            {
              className: "wp-block-accordion-heading__toggle-title",
              tagName: "span",
              value: title,
              style: {
                letterSpacing: typographyProps.style.letterSpacing,
                textDecoration: typographyProps.style.textDecoration
              }
            }
          ),
          showIcon && iconPosition === "right" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "span",
            {
              className: "wp-block-accordion-heading__toggle-icon",
              "aria-hidden": "true",
              children: "+"
            }
          )
        ]
      }
    ) });
  }
};
var v3 = {
  attributes: {
    openByDefault: {
      type: "boolean",
      default: false
    },
    title: {
      type: "rich-text",
      source: "rich-text",
      selector: ".wp-block-accordion-heading__toggle-title",
      role: "content"
    },
    level: {
      type: "number"
    },
    iconPosition: {
      type: "string",
      enum: ["left", "right"],
      default: "right"
    },
    showIcon: {
      type: "boolean",
      default: true
    }
  },
  supports: {
    anchor: true,
    color: {
      background: true,
      gradients: true
    },
    align: false,
    interactivity: true,
    spacing: {
      padding: true,
      __experimentalDefaultControls: {
        padding: true
      },
      __experimentalSkipSerialization: true,
      __experimentalSelector: ".wp-block-accordion-heading__toggle"
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
      __experimentalSkipSerialization: [
        "textDecoration",
        "letterSpacing"
      ],
      fontSize: true,
      __experimentalFontFamily: true,
      __experimentalFontWeight: true,
      __experimentalFontStyle: true,
      __experimentalTextTransform: true,
      __experimentalTextDecoration: true,
      __experimentalLetterSpacing: true,
      __experimentalDefaultControls: {
        fontSize: true,
        fontFamily: true
      }
    },
    shadow: true,
    visibility: false,
    lock: false
  },
  save({ attributes }) {
    const { level, title, iconPosition, showIcon } = attributes;
    const TagName = "h" + (level || 3);
    const typographyProps = (0, import_block_editor.getTypographyClassesAndStyles)(attributes);
    const blockProps = import_block_editor.useBlockProps.save();
    const spacingProps = (0, import_block_editor.__experimentalGetSpacingClassesAndStyles)(attributes);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        type: "button",
        className: "wp-block-accordion-heading__toggle",
        style: spacingProps.style,
        children: [
          showIcon && iconPosition === "left" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "span",
            {
              className: "wp-block-accordion-heading__toggle-icon",
              "aria-hidden": "true",
              children: "+"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.RichText.Content,
            {
              className: "wp-block-accordion-heading__toggle-title",
              tagName: "span",
              value: title,
              style: {
                letterSpacing: typographyProps.style.letterSpacing,
                textDecoration: typographyProps.style.textDecoration
              }
            }
          ),
          showIcon && iconPosition === "right" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "span",
            {
              className: "wp-block-accordion-heading__toggle-icon",
              "aria-hidden": "true",
              children: "+"
            }
          )
        ]
      }
    ) });
  }
};
var deprecated_default = [v3, v2, v1];
//# sourceMappingURL=deprecated.cjs.map
