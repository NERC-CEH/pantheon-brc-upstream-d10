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

// packages/block-library/src/columns/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_blocks = require("@wordpress/blocks");
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
function getDeprecatedLayoutColumn(originalContent) {
  let { doc } = getDeprecatedLayoutColumn;
  if (!doc) {
    doc = document.implementation.createHTMLDocument("");
    getDeprecatedLayoutColumn.doc = doc;
  }
  let columnMatch;
  doc.body.innerHTML = originalContent;
  for (const classListItem of doc.body.firstChild.classList) {
    if (columnMatch = classListItem.match(/^layout-column-(\d+)$/)) {
      return Number(columnMatch[1]) - 1;
    }
  }
}
var migrateCustomColors = (attributes) => {
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
    style,
    isStackedOnMobile: true
  };
};
var deprecated_default = [
  {
    attributes: {
      verticalAlignment: {
        type: "string"
      },
      backgroundColor: {
        type: "string"
      },
      customBackgroundColor: {
        type: "string"
      },
      customTextColor: {
        type: "string"
      },
      textColor: {
        type: "string"
      }
    },
    migrate: migrateCustomColors,
    save({ attributes }) {
      const {
        verticalAlignment,
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
      const className = (0, import_clsx.default)({
        "has-background": backgroundColor || customBackgroundColor,
        "has-text-color": textColor || customTextColor,
        [backgroundClass]: backgroundClass,
        [textClass]: textClass,
        [`are-vertically-aligned-${verticalAlignment}`]: verticalAlignment
      });
      const style = {
        backgroundColor: backgroundClass ? void 0 : customBackgroundColor,
        color: textClass ? void 0 : customTextColor
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          className: className ? className : void 0,
          style,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {})
        }
      );
    }
  },
  {
    attributes: {
      columns: {
        type: "number",
        default: 2
      }
    },
    isEligible(attributes, innerBlocks) {
      const isFastPassEligible = innerBlocks.some(
        (innerBlock) => /layout-column-\d+/.test(innerBlock.originalContent)
      );
      if (!isFastPassEligible) {
        return false;
      }
      return innerBlocks.some(
        (innerBlock) => getDeprecatedLayoutColumn(innerBlock.originalContent) !== void 0
      );
    },
    migrate(attributes, innerBlocks) {
      const columns = innerBlocks.reduce((accumulator, innerBlock) => {
        const { originalContent } = innerBlock;
        let columnIndex = getDeprecatedLayoutColumn(originalContent);
        if (columnIndex === void 0) {
          columnIndex = 0;
        }
        if (!accumulator[columnIndex]) {
          accumulator[columnIndex] = [];
        }
        accumulator[columnIndex].push(innerBlock);
        return accumulator;
      }, []);
      const migratedInnerBlocks = columns.map(
        (columnBlocks) => (0, import_blocks.createBlock)("core/column", {}, columnBlocks)
      );
      const { columns: ignoredColumns, ...restAttributes } = attributes;
      return [
        {
          ...restAttributes,
          isStackedOnMobile: true
        },
        migratedInnerBlocks
      ];
    },
    save({ attributes }) {
      const { columns } = attributes;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `has-${columns}-columns`, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) });
    }
  },
  {
    attributes: {
      columns: {
        type: "number",
        default: 2
      }
    },
    migrate(attributes, innerBlocks) {
      const { columns, ...restAttributes } = attributes;
      attributes = {
        ...restAttributes,
        isStackedOnMobile: true
      };
      return [attributes, innerBlocks];
    },
    save({ attributes }) {
      const { verticalAlignment, columns } = attributes;
      const wrapperClasses = (0, import_clsx.default)(`has-${columns}-columns`, {
        [`are-vertically-aligned-${verticalAlignment}`]: verticalAlignment
      });
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: wrapperClasses, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) });
    }
  }
];
//# sourceMappingURL=deprecated.cjs.map
