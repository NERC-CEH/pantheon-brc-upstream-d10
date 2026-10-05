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

// packages/block-library/src/list/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blocks = require("@wordpress/blocks");
var import_rich_text = require("@wordpress/rich-text");
var import_utils = require("./utils.cjs");
function getListContentSchema({ phrasingContentSchema }) {
  const listContentSchema = {
    ...phrasingContentSchema,
    ul: {},
    ol: { attributes: ["type", "start", "reversed"] }
  };
  ["ul", "ol"].forEach((tag) => {
    listContentSchema[tag].children = {
      li: {
        children: listContentSchema
      }
    };
  });
  return listContentSchema;
}
function getListContentFlat(blocks) {
  return blocks.flatMap(({ name, attributes, innerBlocks = [] }) => {
    if (name === "core/list-item") {
      return [attributes.content, ...getListContentFlat(innerBlocks)];
    }
    return getListContentFlat(innerBlocks);
  });
}
var transforms = {
  from: [
    {
      type: "block",
      isMultiBlock: true,
      blocks: ["core/paragraph", "core/heading"],
      transform: (blockAttributes) => {
        let childBlocks = [];
        if (blockAttributes.length > 1) {
          childBlocks = blockAttributes.map(({ content }) => {
            return (0, import_blocks.createBlock)("core/list-item", { content });
          });
        } else if (blockAttributes.length === 1) {
          const value = (0, import_rich_text.create)({
            html: blockAttributes[0].content
          });
          childBlocks = (0, import_rich_text.split)(value, "\n").map((result) => {
            return (0, import_blocks.createBlock)("core/list-item", {
              content: (0, import_rich_text.toHTMLString)({ value: result })
            });
          });
        }
        return (0, import_blocks.createBlock)(
          "core/list",
          {
            anchor: blockAttributes.anchor
          },
          childBlocks
        );
      }
    },
    {
      type: "raw",
      selector: "ol,ul",
      schema: (args) => ({
        ol: getListContentSchema(args).ol,
        ul: getListContentSchema(args).ul
      }),
      transform: import_utils.createListBlockFromDOMElement
    },
    ...["*", "-"].map((prefix) => ({
      type: "prefix",
      prefix,
      transform(content) {
        return (0, import_blocks.createBlock)("core/list", {}, [
          (0, import_blocks.createBlock)("core/list-item", { content })
        ]);
      }
    })),
    ...["1.", "1)"].map((prefix) => ({
      type: "prefix",
      prefix,
      transform(content) {
        return (0, import_blocks.createBlock)(
          "core/list",
          {
            ordered: true
          },
          [(0, import_blocks.createBlock)("core/list-item", { content })]
        );
      }
    }))
  ],
  to: [
    ...["core/paragraph", "core/heading"].map((block) => ({
      type: "block",
      blocks: [block],
      transform: (_attributes, childBlocks) => {
        return getListContentFlat(childBlocks).map(
          (content) => (0, import_blocks.createBlock)(block, {
            content
          })
        );
      }
    }))
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
