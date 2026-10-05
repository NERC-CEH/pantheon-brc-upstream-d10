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

// packages/block-library/src/pullquote/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blocks = require("@wordpress/blocks");
var import_rich_text = require("@wordpress/rich-text");
var transforms = {
  from: [
    {
      type: "block",
      isMultiBlock: true,
      blocks: ["core/paragraph"],
      transform: (attributes) => {
        return (0, import_blocks.createBlock)("core/pullquote", {
          value: (0, import_rich_text.toHTMLString)({
            value: (0, import_rich_text.join)(
              attributes.map(
                ({ content }) => (0, import_rich_text.create)({ html: content })
              ),
              "\n"
            )
          }),
          anchor: attributes.anchor
        });
      }
    },
    {
      type: "block",
      blocks: ["core/heading"],
      transform: ({ content, anchor }) => {
        return (0, import_blocks.createBlock)("core/pullquote", {
          value: content,
          anchor
        });
      }
    }
  ],
  to: [
    {
      type: "block",
      blocks: ["core/paragraph"],
      transform: ({ value, citation }) => {
        const paragraphs = [];
        if (value) {
          paragraphs.push(
            (0, import_blocks.createBlock)("core/paragraph", {
              content: value
            })
          );
        }
        if (citation) {
          paragraphs.push(
            (0, import_blocks.createBlock)("core/paragraph", {
              content: citation
            })
          );
        }
        if (paragraphs.length === 0) {
          return (0, import_blocks.createBlock)("core/paragraph", {
            content: ""
          });
        }
        return paragraphs;
      }
    },
    {
      type: "block",
      blocks: ["core/heading"],
      transform: ({ value, citation }) => {
        if (!value) {
          return (0, import_blocks.createBlock)("core/heading", {
            content: citation
          });
        }
        const headingBlock = (0, import_blocks.createBlock)("core/heading", {
          content: value
        });
        if (!citation) {
          return headingBlock;
        }
        return [
          headingBlock,
          (0, import_blocks.createBlock)("core/heading", {
            content: citation
          })
        ];
      }
    }
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
