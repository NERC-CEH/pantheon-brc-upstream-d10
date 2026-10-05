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

// packages/block-library/src/post-date/deprecated.js
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_migrate_font_family = __toESM(require("../utils/migrate-font-family.cjs"));
var import_migrate_text_align = __toESM(require("../utils/migrate-text-align.cjs"));
var v4 = {
  attributes: {
    datetime: {
      type: "string",
      role: "content"
    },
    textAlign: {
      type: "string"
    },
    format: {
      type: "string"
    },
    isLink: {
      type: "boolean",
      default: false,
      role: "content"
    }
  },
  supports: {
    anchor: true,
    html: false,
    color: {
      gradients: true,
      link: true,
      __experimentalDefaultControls: {
        background: true,
        text: true,
        link: true
      }
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
    interactivity: {
      clientNavigation: true
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
    }
  },
  save() {
    return null;
  },
  migrate: import_migrate_text_align.default,
  isEligible(attributes) {
    return !!attributes.textAlign || !!attributes.className?.match(
      /\bhas-text-align-(left|center|right)\b/
    );
  }
};
var v3 = {
  attributes: {
    datetime: {
      type: "string",
      role: "content"
    },
    textAlign: {
      type: "string"
    },
    format: {
      type: "string"
    },
    isLink: {
      type: "boolean",
      default: false,
      role: "content"
    }
  },
  supports: {
    html: false,
    color: {
      gradients: true,
      link: true,
      __experimentalDefaultControls: {
        background: true,
        text: true,
        link: true
      }
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
    interactivity: {
      clientNavigation: true
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
    }
  },
  save() {
    return null;
  },
  migrate({
    metadata: {
      bindings: {
        datetime: {
          source,
          args: { key, ...otherArgs }
        },
        ...otherBindings
      },
      ...otherMetadata
    },
    ...otherAttributes
  }) {
    return (0, import_migrate_text_align.default)({
      metadata: {
        bindings: {
          datetime: {
            source,
            args: { field: key, ...otherArgs }
          },
          ...otherBindings
        },
        ...otherMetadata
      },
      ...otherAttributes
    });
  },
  isEligible(attributes) {
    return attributes?.metadata?.bindings?.datetime?.source === "core/post-data" && !!attributes?.metadata?.bindings?.datetime?.args?.key;
  }
};
var v2 = {
  attributes: {
    textAlign: {
      type: "string"
    },
    format: {
      type: "string"
    },
    isLink: {
      type: "boolean",
      default: false,
      role: "content"
    },
    displayType: {
      type: "string",
      default: "date"
    }
  },
  supports: {
    html: false,
    color: {
      gradients: true,
      link: true,
      __experimentalDefaultControls: {
        background: true,
        text: true,
        link: true
      }
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
    interactivity: {
      clientNavigation: true
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
    }
  },
  save() {
    return null;
  },
  migrate({ className, displayType, metadata, ...otherAttributes }) {
    if (displayType === "date" || displayType === "modified") {
      if (displayType === "modified") {
        className = (0, import_clsx.default)(
          className,
          "wp-block-post-date__modified-date"
        );
      }
      return (0, import_migrate_text_align.default)({
        ...otherAttributes,
        className,
        metadata: {
          ...metadata,
          bindings: {
            datetime: {
              source: "core/post-data",
              args: { field: displayType }
            }
          }
        }
      });
    }
  },
  isEligible(attributes) {
    return !attributes.datetime && !attributes?.metadata?.bindings?.datetime;
  }
};
var v1 = {
  attributes: {
    textAlign: {
      type: "string"
    },
    format: {
      type: "string"
    },
    isLink: {
      type: "boolean",
      default: false
    }
  },
  supports: {
    html: false,
    color: {
      gradients: true,
      link: true
    },
    typography: {
      fontSize: true,
      lineHeight: true,
      __experimentalFontFamily: true,
      __experimentalFontWeight: true,
      __experimentalFontStyle: true,
      __experimentalTextTransform: true,
      __experimentalLetterSpacing: true
    }
  },
  save() {
    return null;
  },
  migrate(attributes) {
    return (0, import_migrate_text_align.default)((0, import_migrate_font_family.default)(attributes));
  },
  isEligible({ style }) {
    return style?.typography?.fontFamily;
  }
};
var deprecated_default = [v4, v3, v2, v1];
//# sourceMappingURL=deprecated.cjs.map
