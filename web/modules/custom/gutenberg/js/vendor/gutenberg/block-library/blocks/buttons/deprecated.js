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

// packages/block-library/src/buttons/deprecated.jsx
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
  const { contentJustification, orientation, ...updatedAttributes } = attributes;
  if (contentJustification || orientation) {
    Object.assign(updatedAttributes, {
      layout: {
        type: "flex",
        ...contentJustification && {
          justifyContent: contentJustification
        },
        ...orientation && { orientation }
      }
    });
  }
  return updatedAttributes;
};
var deprecated = [
  {
    attributes: {
      contentJustification: {
        type: "string"
      },
      orientation: {
        type: "string",
        default: "horizontal"
      }
    },
    supports: {
      anchor: true,
      align: ["wide", "full"],
      __experimentalExposeControlsToChildren: true,
      spacing: {
        blockGap: true,
        margin: ["top", "bottom"],
        __experimentalDefaultControls: {
          blockGap: true
        }
      }
    },
    isEligible: ({ contentJustification, orientation }) => !!contentJustification || !!orientation,
    migrate: migrateWithLayout,
    save({ attributes: { contentJustification, orientation } }) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          ...import_block_editor.useBlockProps.save({
            className: (0, import_clsx.default)({
              [`is-content-justification-${contentJustification}`]: contentJustification,
              "is-vertical": orientation === "vertical"
            })
          }),
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {})
        }
      );
    }
  },
  {
    supports: {
      align: ["center", "left", "right"],
      anchor: true
    },
    save() {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {}) });
    },
    isEligible({ align }) {
      return align && ["center", "left", "right"].includes(align);
    },
    migrate(attributes) {
      return migrateWithLayout({
        ...attributes,
        align: void 0,
        // Floating Buttons blocks shouldn't have been supported in the
        // first place. Most users using them probably expected them to
        // act like content justification controls, so these blocks are
        // migrated to use content justification.
        // As for center-aligned Buttons blocks, the content justification
        // equivalent will create an identical end result in most cases.
        contentJustification: attributes.align
      });
    }
  }
];
var deprecated_default = deprecated;
//# sourceMappingURL=deprecated.cjs.map
