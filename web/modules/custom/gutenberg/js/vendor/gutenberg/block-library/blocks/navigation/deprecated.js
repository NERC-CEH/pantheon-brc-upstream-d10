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

// packages/block-library/src/navigation/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_compose = require("@wordpress/compose");
var import_migrate_font_family = __toESM(require("../utils/migrate-font-family.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var TYPOGRAPHY_PRESET_DEPRECATION_MAP = {
  fontStyle: "var:preset|font-style|",
  fontWeight: "var:preset|font-weight|",
  textDecoration: "var:preset|text-decoration|",
  textTransform: "var:preset|text-transform|"
};
var migrateIdToRef = ({ navigationMenuId, ...attributes }) => {
  return {
    ...attributes,
    ref: navigationMenuId
  };
};
var migrateWithLayout = (attributes) => {
  if (!!attributes.layout) {
    return attributes;
  }
  const { itemsJustification, orientation, ...updatedAttributes } = attributes;
  if (itemsJustification || orientation) {
    Object.assign(updatedAttributes, {
      layout: {
        type: "flex",
        ...itemsJustification && {
          justifyContent: itemsJustification
        },
        ...orientation && { orientation }
      }
    });
  }
  return updatedAttributes;
};
var migrateOpenSubmenusOnClick = (attributes) => {
  const { openSubmenusOnClick, ...restAttributes } = attributes;
  if (openSubmenusOnClick === null || openSubmenusOnClick === void 0) {
    return attributes;
  }
  return {
    ...restAttributes,
    submenuVisibility: restAttributes.submenuVisibility ?? (openSubmenusOnClick ? "click" : "hover")
  };
};
var v7 = {
  attributes: {
    ref: {
      type: "number"
    },
    textColor: {
      type: "string"
    },
    customTextColor: {
      type: "string"
    },
    rgbTextColor: {
      type: "string"
    },
    backgroundColor: {
      type: "string"
    },
    customBackgroundColor: {
      type: "string"
    },
    rgbBackgroundColor: {
      type: "string"
    },
    showSubmenuIcon: {
      type: "boolean",
      default: true
    },
    openSubmenusOnClick: {
      type: "boolean",
      default: false
    },
    overlayMenu: {
      type: "string",
      default: "mobile"
    },
    icon: {
      type: "string",
      default: "handle"
    },
    hasIcon: {
      type: "boolean",
      default: true
    },
    __unstableLocation: {
      type: "string"
    },
    overlayBackgroundColor: {
      type: "string"
    },
    customOverlayBackgroundColor: {
      type: "string"
    },
    overlayTextColor: {
      type: "string"
    },
    customOverlayTextColor: {
      type: "string"
    },
    maxNestingLevel: {
      type: "number",
      default: 5
    },
    templateLock: {
      type: ["string", "boolean"],
      enum: ["all", "insert", "contentOnly", false]
    }
  },
  supports: {
    align: ["wide", "full"],
    anchor: true,
    html: false,
    inserter: true,
    typography: {
      fontSize: true,
      lineHeight: true,
      __experimentalFontStyle: true,
      __experimentalFontWeight: true,
      __experimentalTextTransform: true,
      __experimentalFontFamily: true,
      __experimentalLetterSpacing: true,
      __experimentalTextDecoration: true,
      __experimentalSkipSerialization: ["textDecoration"],
      __experimentalDefaultControls: {
        fontSize: true
      }
    },
    spacing: {
      blockGap: true,
      units: ["px", "em", "rem", "vh", "vw"],
      __experimentalDefaultControls: {
        blockGap: true
      }
    },
    layout: {
      allowSwitching: false,
      allowInheriting: false,
      allowVerticalAlignment: false,
      allowSizingOnChildren: true,
      default: {
        type: "flex"
      }
    },
    interactivity: true,
    renaming: false
  },
  save() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {});
  },
  isEligible: ({ openSubmenusOnClick }) => openSubmenusOnClick !== null && openSubmenusOnClick !== void 0,
  migrate: migrateOpenSubmenusOnClick
};
var v6 = {
  attributes: {
    navigationMenuId: {
      type: "number"
    },
    textColor: {
      type: "string"
    },
    customTextColor: {
      type: "string"
    },
    rgbTextColor: {
      type: "string"
    },
    backgroundColor: {
      type: "string"
    },
    customBackgroundColor: {
      type: "string"
    },
    rgbBackgroundColor: {
      type: "string"
    },
    showSubmenuIcon: {
      type: "boolean",
      default: true
    },
    overlayMenu: {
      type: "string",
      default: "mobile"
    },
    __unstableLocation: {
      type: "string"
    },
    overlayBackgroundColor: {
      type: "string"
    },
    customOverlayBackgroundColor: {
      type: "string"
    },
    overlayTextColor: {
      type: "string"
    },
    customOverlayTextColor: {
      type: "string"
    }
  },
  supports: {
    align: ["wide", "full"],
    anchor: true,
    html: false,
    inserter: true,
    typography: {
      fontSize: true,
      lineHeight: true,
      __experimentalFontStyle: true,
      __experimentalFontWeight: true,
      __experimentalTextTransform: true,
      __experimentalFontFamily: true,
      __experimentalTextDecoration: true,
      __experimentalDefaultControls: {
        fontSize: true
      }
    },
    spacing: {
      blockGap: true,
      units: ["px", "em", "rem", "vh", "vw"],
      __experimentalDefaultControls: {
        blockGap: true
      }
    },
    layout: {
      allowSwitching: false,
      allowInheriting: false,
      default: {
        type: "flex"
      }
    }
  },
  save() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {});
  },
  isEligible: ({ navigationMenuId }) => !!navigationMenuId,
  migrate: migrateIdToRef
};
var v5 = {
  attributes: {
    navigationMenuId: {
      type: "number"
    },
    orientation: {
      type: "string",
      default: "horizontal"
    },
    textColor: {
      type: "string"
    },
    customTextColor: {
      type: "string"
    },
    rgbTextColor: {
      type: "string"
    },
    backgroundColor: {
      type: "string"
    },
    customBackgroundColor: {
      type: "string"
    },
    rgbBackgroundColor: {
      type: "string"
    },
    itemsJustification: {
      type: "string"
    },
    showSubmenuIcon: {
      type: "boolean",
      default: true
    },
    openSubmenusOnClick: {
      type: "boolean",
      default: false
    },
    overlayMenu: {
      type: "string",
      default: "never"
    },
    __unstableLocation: {
      type: "string"
    },
    overlayBackgroundColor: {
      type: "string"
    },
    customOverlayBackgroundColor: {
      type: "string"
    },
    overlayTextColor: {
      type: "string"
    },
    customOverlayTextColor: {
      type: "string"
    }
  },
  supports: {
    align: ["wide", "full"],
    anchor: true,
    html: false,
    inserter: true,
    typography: {
      fontSize: true,
      lineHeight: true,
      __experimentalFontStyle: true,
      __experimentalFontWeight: true,
      __experimentalTextTransform: true,
      __experimentalFontFamily: true,
      __experimentalTextDecoration: true,
      __experimentalDefaultControls: {
        fontSize: true
      }
    },
    spacing: {
      blockGap: true,
      units: ["px", "em", "rem", "vh", "vw"],
      __experimentalDefaultControls: {
        blockGap: true
      }
    }
  },
  save() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {});
  },
  isEligible: ({ itemsJustification, orientation }) => !!itemsJustification || !!orientation,
  migrate: (0, import_compose.compose)(
    migrateIdToRef,
    migrateWithLayout,
    migrateOpenSubmenusOnClick
  )
};
var v4 = {
  attributes: {
    orientation: {
      type: "string",
      default: "horizontal"
    },
    textColor: {
      type: "string"
    },
    customTextColor: {
      type: "string"
    },
    rgbTextColor: {
      type: "string"
    },
    backgroundColor: {
      type: "string"
    },
    customBackgroundColor: {
      type: "string"
    },
    rgbBackgroundColor: {
      type: "string"
    },
    itemsJustification: {
      type: "string"
    },
    showSubmenuIcon: {
      type: "boolean",
      default: true
    },
    openSubmenusOnClick: {
      type: "boolean",
      default: false
    },
    overlayMenu: {
      type: "string",
      default: "never"
    },
    __unstableLocation: {
      type: "string"
    },
    overlayBackgroundColor: {
      type: "string"
    },
    customOverlayBackgroundColor: {
      type: "string"
    },
    overlayTextColor: {
      type: "string"
    },
    customOverlayTextColor: {
      type: "string"
    }
  },
  supports: {
    align: ["wide", "full"],
    anchor: true,
    html: false,
    inserter: true,
    typography: {
      fontSize: true,
      lineHeight: true,
      __experimentalFontStyle: true,
      __experimentalFontWeight: true,
      __experimentalTextTransform: true,
      __experimentalFontFamily: true,
      __experimentalTextDecoration: true
    },
    spacing: {
      blockGap: true,
      units: ["px", "em", "rem", "vh", "vw"],
      __experimentalDefaultControls: {
        blockGap: true
      }
    }
  },
  save() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {});
  },
  migrate: (0, import_compose.compose)(
    migrateIdToRef,
    migrateWithLayout,
    import_migrate_font_family.default,
    migrateOpenSubmenusOnClick
  ),
  isEligible({ style }) {
    return style?.typography?.fontFamily;
  }
};
var migrateIsResponsive = function(attributes) {
  delete attributes.isResponsive;
  return {
    ...attributes,
    overlayMenu: "mobile"
  };
};
var migrateTypographyPresets = function(attributes) {
  return {
    ...attributes,
    style: {
      ...attributes.style,
      typography: Object.fromEntries(
        Object.entries(attributes.style.typography ?? {}).map(
          ([key, value]) => {
            const prefix = TYPOGRAPHY_PRESET_DEPRECATION_MAP[key];
            if (prefix && value.startsWith(prefix)) {
              const newValue = value.slice(prefix.length);
              if ("textDecoration" === key && "strikethrough" === newValue) {
                return [key, "line-through"];
              }
              return [key, newValue];
            }
            return [key, value];
          }
        )
      )
    }
  };
};
var deprecated = [
  v7,
  v6,
  v5,
  v4,
  // Remove `isResponsive` attribute.
  {
    attributes: {
      orientation: {
        type: "string",
        default: "horizontal"
      },
      textColor: {
        type: "string"
      },
      customTextColor: {
        type: "string"
      },
      rgbTextColor: {
        type: "string"
      },
      backgroundColor: {
        type: "string"
      },
      customBackgroundColor: {
        type: "string"
      },
      rgbBackgroundColor: {
        type: "string"
      },
      itemsJustification: {
        type: "string"
      },
      showSubmenuIcon: {
        type: "boolean",
        default: true
      },
      openSubmenusOnClick: {
        type: "boolean",
        default: false
      },
      isResponsive: {
        type: "boolean",
        default: "false"
      },
      __unstableLocation: {
        type: "string"
      },
      overlayBackgroundColor: {
        type: "string"
      },
      customOverlayBackgroundColor: {
        type: "string"
      },
      overlayTextColor: {
        type: "string"
      },
      customOverlayTextColor: {
        type: "string"
      }
    },
    supports: {
      align: ["wide", "full"],
      anchor: true,
      html: false,
      inserter: true,
      typography: {
        fontSize: true,
        lineHeight: true,
        __experimentalFontStyle: true,
        __experimentalFontWeight: true,
        __experimentalTextTransform: true,
        __experimentalFontFamily: true,
        __experimentalTextDecoration: true
      }
    },
    isEligible(attributes) {
      return attributes.isResponsive;
    },
    migrate: (0, import_compose.compose)(
      migrateIdToRef,
      migrateWithLayout,
      import_migrate_font_family.default,
      migrateIsResponsive,
      migrateOpenSubmenusOnClick
    ),
    save() {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {});
    }
  },
  {
    attributes: {
      orientation: {
        type: "string"
      },
      textColor: {
        type: "string"
      },
      customTextColor: {
        type: "string"
      },
      rgbTextColor: {
        type: "string"
      },
      backgroundColor: {
        type: "string"
      },
      customBackgroundColor: {
        type: "string"
      },
      rgbBackgroundColor: {
        type: "string"
      },
      itemsJustification: {
        type: "string"
      },
      showSubmenuIcon: {
        type: "boolean",
        default: true
      }
    },
    supports: {
      align: ["wide", "full"],
      anchor: true,
      html: false,
      inserter: true,
      fontSize: true,
      __experimentalFontStyle: true,
      __experimentalFontWeight: true,
      __experimentalTextTransform: true,
      color: true,
      __experimentalFontFamily: true,
      __experimentalTextDecoration: true
    },
    save() {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {});
    },
    isEligible(attributes) {
      if (!attributes.style || !attributes.style.typography) {
        return false;
      }
      for (const styleAttribute in TYPOGRAPHY_PRESET_DEPRECATION_MAP) {
        const attributeValue = attributes.style.typography[styleAttribute];
        if (attributeValue && attributeValue.startsWith(
          TYPOGRAPHY_PRESET_DEPRECATION_MAP[styleAttribute]
        )) {
          return true;
        }
      }
      return false;
    },
    migrate: (0, import_compose.compose)(
      migrateIdToRef,
      migrateWithLayout,
      import_migrate_font_family.default,
      migrateTypographyPresets
    )
  },
  {
    attributes: {
      className: {
        type: "string"
      },
      textColor: {
        type: "string"
      },
      rgbTextColor: {
        type: "string"
      },
      backgroundColor: {
        type: "string"
      },
      rgbBackgroundColor: {
        type: "string"
      },
      fontSize: {
        type: "string"
      },
      customFontSize: {
        type: "number"
      },
      itemsJustification: {
        type: "string"
      },
      showSubmenuIcon: {
        type: "boolean"
      }
    },
    isEligible(attribute) {
      return attribute.rgbTextColor || attribute.rgbBackgroundColor;
    },
    supports: {
      align: ["wide", "full"],
      anchor: true,
      html: false,
      inserter: true
    },
    migrate: (0, import_compose.compose)(migrateIdToRef, (attributes) => {
      const { rgbTextColor, rgbBackgroundColor, ...restAttributes } = attributes;
      return {
        ...restAttributes,
        customTextColor: attributes.textColor ? void 0 : attributes.rgbTextColor,
        customBackgroundColor: attributes.backgroundColor ? void 0 : attributes.rgbBackgroundColor
      };
    }),
    save() {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {});
    }
  }
];
var deprecated_default = deprecated;
//# sourceMappingURL=deprecated.cjs.map
