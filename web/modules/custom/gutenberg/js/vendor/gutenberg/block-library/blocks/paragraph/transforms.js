"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
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

// packages/block-library/src/paragraph/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blocks = require("@wordpress/blocks");
var import_block = __toESM(require("./block.json"));
var { name } = import_block.default;
var transforms = {
  from: [
    {
      type: "raw",
      // Paragraph is a fallback and should be matched last.
      priority: 20,
      selector: "p",
      schema: ({ phrasingContentSchema, isPaste }) => ({
        p: {
          children: phrasingContentSchema,
          attributes: isPaste ? [] : ["style", "id"]
        }
      }),
      transform(node) {
        const attributes = (0, import_blocks.getBlockAttributes)(name, node.outerHTML);
        const { textAlign } = node.style || {};
        if (textAlign === "left" || textAlign === "center" || textAlign === "right") {
          attributes.style = {
            ...attributes.style,
            typography: {
              ...attributes.style?.typography,
              textAlign
            }
          };
        }
        return (0, import_blocks.createBlock)(name, attributes);
      }
    }
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
