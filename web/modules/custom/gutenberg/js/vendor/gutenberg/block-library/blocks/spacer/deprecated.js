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

// packages/block-library/src/spacer/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
var deprecated = [
  {
    attributes: {
      height: {
        type: "number",
        default: 100
      },
      width: {
        type: "number"
      }
    },
    migrate(attributes) {
      const { height, width } = attributes;
      return {
        ...attributes,
        width: width !== void 0 ? `${width}px` : void 0,
        height: height !== void 0 ? `${height}px` : void 0
      };
    },
    save({ attributes }) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          ...import_block_editor.useBlockProps.save({
            style: {
              height: attributes.height,
              width: attributes.width
            },
            "aria-hidden": true
          })
        }
      );
    }
  }
];
var deprecated_default = deprecated;
//# sourceMappingURL=deprecated.cjs.map
