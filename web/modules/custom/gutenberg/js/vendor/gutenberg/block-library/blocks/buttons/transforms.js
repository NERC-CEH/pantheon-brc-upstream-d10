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

// packages/block-library/src/buttons/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blocks = require("@wordpress/blocks");
var import_rich_text = require("@wordpress/rich-text");
var import_get_transformed_attributes = require("../utils/get-transformed-attributes.cjs");
var transforms = {
  from: [
    {
      type: "block",
      isMultiBlock: true,
      blocks: ["core/button"],
      transform: (buttons) => (
        // Creates the buttons block.
        (0, import_blocks.createBlock)(
          "core/buttons",
          {},
          // Loop the selected buttons.
          buttons.map(
            (attributes) => (
              // Create singular button in the buttons block.
              (0, import_blocks.createBlock)("core/button", attributes)
            )
          )
        )
      )
    },
    {
      type: "block",
      isMultiBlock: true,
      blocks: ["core/paragraph"],
      transform: (buttons) => (
        // Creates the buttons block.
        (0, import_blocks.createBlock)(
          "core/buttons",
          {},
          // Loop the selected buttons.
          buttons.map((attributes) => {
            const { content } = attributes;
            const element = (0, import_rich_text.__unstableCreateElement)(document, content);
            const text = element.innerText || "";
            const link = element.querySelector("a");
            const url = link?.getAttribute("href");
            return (0, import_blocks.createBlock)("core/button", {
              ...attributes,
              ...(0, import_get_transformed_attributes.getTransformedAttributes)(
                attributes,
                "core/button",
                ({ content: contentBinding }) => ({
                  text: contentBinding
                })
              ),
              text,
              url
            });
          })
        )
      ),
      isMatch: (paragraphs) => {
        return paragraphs.every((attributes) => {
          const element = (0, import_rich_text.__unstableCreateElement)(
            document,
            attributes.content
          );
          const text = element.innerText || "";
          const links = element.querySelectorAll("a");
          return text.length <= 30 && links.length <= 1;
        });
      }
    }
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
