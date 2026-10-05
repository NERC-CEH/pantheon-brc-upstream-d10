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

// packages/block-library/src/heading/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_migrate_text_align = __toESM(require("../utils/migrate-text-align.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var blockSupports = {
  className: false,
  anchor: true
};
var blockAttributes = {
  align: {
    type: "string"
  },
  content: {
    type: "string",
    source: "html",
    selector: "h1,h2,h3,h4,h5,h6",
    default: ""
  },
  level: {
    type: "number",
    default: 2
  },
  placeholder: {
    type: "string"
  }
};
var migrateCustomColors = (attributes) => {
  if (!attributes.customTextColor) {
    return attributes;
  }
  const style = {
    color: {
      text: attributes.customTextColor
    }
  };
  const { customTextColor, ...restAttributes } = attributes;
  return {
    ...restAttributes,
    style
  };
};
var TEXT_ALIGN_OPTIONS = ["left", "right", "center"];
var migrateTextAlign = (attributes) => {
  const { align, ...rest } = attributes;
  return TEXT_ALIGN_OPTIONS.includes(align) ? { ...rest, textAlign: align } : attributes;
};
var v1 = {
  supports: blockSupports,
  attributes: {
    ...blockAttributes,
    customTextColor: {
      type: "string"
    },
    textColor: {
      type: "string"
    }
  },
  migrate: (attributes) => (0, import_migrate_text_align.default)(
    migrateCustomColors(migrateTextAlign(attributes))
  ),
  save({ attributes }) {
    const { align, level, content, textColor, customTextColor } = attributes;
    const tagName = "h" + level;
    const textClass = (0, import_block_editor.getColorClassName)("color", textColor);
    const className = (0, import_clsx.default)({
      [textClass]: textClass
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText.Content,
      {
        className: className ? className : void 0,
        tagName,
        style: {
          textAlign: align,
          color: textClass ? void 0 : customTextColor
        },
        value: content
      }
    );
  }
};
var v2 = {
  attributes: {
    ...blockAttributes,
    customTextColor: {
      type: "string"
    },
    textColor: {
      type: "string"
    }
  },
  migrate: (attributes) => (0, import_migrate_text_align.default)(
    migrateCustomColors(migrateTextAlign(attributes))
  ),
  save({ attributes }) {
    const { align, content, customTextColor, level, textColor } = attributes;
    const tagName = "h" + level;
    const textClass = (0, import_block_editor.getColorClassName)("color", textColor);
    const className = (0, import_clsx.default)({
      [textClass]: textClass,
      [`has-text-align-${align}`]: align
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText.Content,
      {
        className: className ? className : void 0,
        tagName,
        style: {
          color: textClass ? void 0 : customTextColor
        },
        value: content
      }
    );
  },
  supports: blockSupports
};
var v3 = {
  supports: blockSupports,
  attributes: {
    ...blockAttributes,
    customTextColor: {
      type: "string"
    },
    textColor: {
      type: "string"
    }
  },
  migrate: (attributes) => (0, import_migrate_text_align.default)(
    migrateCustomColors(migrateTextAlign(attributes))
  ),
  save({ attributes }) {
    const { align, content, customTextColor, level, textColor } = attributes;
    const tagName = "h" + level;
    const textClass = (0, import_block_editor.getColorClassName)("color", textColor);
    const className = (0, import_clsx.default)({
      [textClass]: textClass,
      "has-text-color": textColor || customTextColor,
      [`has-text-align-${align}`]: align
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText.Content,
      {
        className: className ? className : void 0,
        tagName,
        style: {
          color: textClass ? void 0 : customTextColor
        },
        value: content
      }
    );
  }
};
var v4 = {
  supports: {
    align: ["wide", "full"],
    anchor: true,
    className: false,
    color: { link: true },
    fontSize: true,
    lineHeight: true,
    __experimentalSelector: {
      "core/heading/h1": "h1",
      "core/heading/h2": "h2",
      "core/heading/h3": "h3",
      "core/heading/h4": "h4",
      "core/heading/h5": "h5",
      "core/heading/h6": "h6"
    },
    __unstablePasteTextInline: true
  },
  attributes: blockAttributes,
  isEligible: ({ align }) => TEXT_ALIGN_OPTIONS.includes(align),
  migrate: (attributes) => (0, import_migrate_text_align.default)(
    migrateCustomColors(migrateTextAlign(attributes))
  ),
  save({ attributes }) {
    const { align, content, level } = attributes;
    const TagName = "h" + level;
    const className = (0, import_clsx.default)({
      [`has-text-align-${align}`]: align
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...import_block_editor.useBlockProps.save({ className }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: content }) });
  }
};
var v5 = {
  supports: {
    align: ["wide", "full"],
    anchor: true,
    className: false,
    color: {
      gradients: true,
      link: true,
      __experimentalDefaultControls: {
        background: true,
        text: true
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
      __experimentalFontStyle: true,
      __experimentalFontWeight: true,
      __experimentalLetterSpacing: true,
      __experimentalTextTransform: true,
      __experimentalTextDecoration: true,
      __experimentalDefaultControls: {
        fontSize: true,
        fontAppearance: true,
        textTransform: true
      }
    },
    __experimentalSelector: "h1,h2,h3,h4,h5,h6",
    __unstablePasteTextInline: true,
    __experimentalSlashInserter: true
  },
  attributes: {
    textAlign: {
      type: "string"
    },
    content: {
      type: "string",
      source: "html",
      selector: "h1,h2,h3,h4,h5,h6",
      default: "",
      role: "content"
    },
    level: {
      type: "number",
      default: 2
    },
    placeholder: {
      type: "string"
    }
  },
  save({ attributes }) {
    const { textAlign, content, level } = attributes;
    const TagName = "h" + level;
    const className = (0, import_clsx.default)({
      [`has-text-align-${textAlign}`]: textAlign
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...import_block_editor.useBlockProps.save({ className }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: content }) });
  },
  migrate: (attributes) => (0, import_migrate_text_align.default)(
    migrateCustomColors(migrateTextAlign(attributes))
  )
};
var v6 = {
  supports: {
    align: ["wide", "full"],
    anchor: true,
    className: true,
    splitting: true,
    __experimentalBorder: {
      color: true,
      radius: true,
      style: true,
      width: true
    },
    color: {
      gradients: true,
      link: true,
      __experimentalDefaultControls: {
        background: true,
        text: true
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
      __experimentalFontStyle: true,
      __experimentalFontWeight: true,
      __experimentalLetterSpacing: true,
      __experimentalTextTransform: true,
      __experimentalTextDecoration: true,
      __experimentalWritingMode: true,
      fitText: true,
      __experimentalDefaultControls: {
        fontSize: true
      }
    },
    __unstablePasteTextInline: true,
    __experimentalSlashInserter: true,
    interactivity: {
      clientNavigation: true
    }
  },
  attributes: {
    textAlign: {
      type: "string"
    },
    content: {
      type: "string",
      source: "html",
      selector: "h1,h2,h3,h4,h5,h6",
      default: "",
      role: "content"
    },
    level: {
      type: "number",
      default: 2
    },
    levelOptions: {
      type: "array"
    },
    placeholder: {
      type: "string"
    }
  },
  save({ attributes }) {
    const { textAlign, content, level } = attributes;
    const TagName = "h" + level;
    const className = (0, import_clsx.default)({
      [`has-text-align-${textAlign}`]: textAlign
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...import_block_editor.useBlockProps.save({ className }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { value: content }) });
  },
  migrate: (attributes) => (0, import_migrate_text_align.default)(
    migrateCustomColors(migrateTextAlign(attributes))
  ),
  isEligible(attributes) {
    return !!attributes.textAlign || !!attributes.className?.match(
      /\bhas-text-align-(left|center|right)\b/
    );
  }
};
var deprecated = [v6, v5, v4, v3, v2, v1];
var deprecated_default = deprecated;
//# sourceMappingURL=deprecated.cjs.map
