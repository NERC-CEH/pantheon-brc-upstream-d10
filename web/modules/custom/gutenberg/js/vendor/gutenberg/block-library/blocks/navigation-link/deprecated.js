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

// packages/block-library/src/navigation-link/deprecated.tsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
var deprecated = [
  {
    isEligible(attributes) {
      return attributes.nofollow;
    },
    attributes: {
      label: {
        type: "string"
      },
      type: {
        type: "string"
      },
      nofollow: {
        type: "boolean"
      },
      description: {
        type: "string"
      },
      id: {
        type: "number"
      },
      opensInNewTab: {
        type: "boolean",
        default: false
      },
      url: {
        type: "string"
      }
    },
    migrate({ nofollow, ...rest }) {
      return {
        rel: nofollow ? "nofollow" : "",
        ...rest
      };
    },
    save() {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {});
    }
  }
];
var deprecated_default = deprecated;
//# sourceMappingURL=deprecated.cjs.map
