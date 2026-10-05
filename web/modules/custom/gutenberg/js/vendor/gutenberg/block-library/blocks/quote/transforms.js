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

// packages/block-library/src/quote/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_blocks = require("@wordpress/blocks");
var transforms = {
  from: [
    {
      type: "block",
      blocks: ["core/verse"],
      transform: ({ content }) => {
        return (0, import_blocks.createBlock)("core/quote", {}, [
          (0, import_blocks.createBlock)("core/paragraph", { content })
        ]);
      }
    },
    {
      type: "block",
      blocks: ["core/pullquote"],
      transform: ({
        value,
        align,
        citation,
        anchor,
        fontSize,
        style
      }) => {
        return (0, import_blocks.createBlock)(
          "core/quote",
          {
            align,
            citation,
            anchor,
            fontSize,
            style
          },
          [(0, import_blocks.createBlock)("core/paragraph", { content: value })]
        );
      }
    },
    {
      type: "prefix",
      prefix: ">",
      transform: (content) => (0, import_blocks.createBlock)("core/quote", {}, [
        (0, import_blocks.createBlock)("core/paragraph", { content })
      ])
    },
    {
      type: "raw",
      schema: () => ({
        blockquote: {
          children: "*"
        }
      }),
      selector: "blockquote",
      transform: (node, handler) => {
        return (0, import_blocks.createBlock)(
          "core/quote",
          // Don't try to parse any `cite` out of this content.
          // * There may be more than one cite.
          // * There may be more attribution text than just the cite.
          // * If the cite is nested in the quoted text, it's wrong to
          //   remove it.
          {},
          handler({
            HTML: node.innerHTML,
            mode: "BLOCKS"
          })
        );
      }
    },
    {
      type: "block",
      isMultiBlock: true,
      blocks: ["*"],
      isMatch: ({}, blocks) => {
        if (blocks.length === 1) {
          return [
            "core/paragraph",
            "core/heading",
            "core/list",
            "core/pullquote"
          ].includes(blocks[0].name);
        }
        return !blocks.some(({ name }) => name === "core/quote");
      },
      __experimentalConvert: (blocks) => (0, import_blocks.createBlock)(
        "core/quote",
        {},
        blocks.map((block) => (0, import_blocks.cloneSanitizedBlock)(block))
      )
    }
  ],
  to: [
    {
      type: "block",
      blocks: ["core/pullquote"],
      isMatch: ({}, block) => {
        return block.innerBlocks.every(
          ({ name }) => name === "core/paragraph"
        );
      },
      transform: ({ align, citation, anchor, fontSize, style }, innerBlocks) => {
        const value = innerBlocks.map(({ attributes }) => `${attributes.content}`).join("<br>");
        return (0, import_blocks.createBlock)("core/pullquote", {
          value,
          align,
          citation,
          anchor,
          fontSize,
          style
        });
      }
    },
    {
      type: "block",
      blocks: ["core/verse"],
      isMatch: ({}, block) => {
        return block.innerBlocks.every((innerBlock) => {
          if (innerBlock.name === "core/paragraph") {
            return true;
          }
          const converted = (0, import_blocks.switchToBlockType)(
            innerBlock,
            "core/paragraph"
          );
          return converted !== null;
        });
      },
      transform: ({}, innerBlocks) => {
        const paragraphs = innerBlocks.flatMap((innerBlock) => {
          if (innerBlock.name === "core/paragraph") {
            return innerBlock;
          }
          return (0, import_blocks.switchToBlockType)(innerBlock, "core/paragraph") || [];
        });
        const content = paragraphs.map(({ attributes }) => attributes.content || "").filter(Boolean).join("<br>");
        return (0, import_blocks.createBlock)("core/verse", { content });
      }
    },
    {
      type: "block",
      blocks: ["core/paragraph"],
      isMatch: ({ citation }, block) => {
        const innerBlocks = block.innerBlocks;
        if (!innerBlocks.length) {
          return !import_block_editor.RichText.isEmpty(citation);
        }
        return innerBlocks.every((innerBlock) => {
          if (innerBlock.name === "core/paragraph") {
            return true;
          }
          const converted = (0, import_blocks.switchToBlockType)(
            innerBlock,
            "core/paragraph"
          );
          return converted !== null;
        });
      },
      transform: ({ citation }, innerBlocks) => {
        const paragraphs = innerBlocks.flatMap((innerBlock) => {
          if (innerBlock.name === "core/paragraph") {
            return innerBlock;
          }
          return (0, import_blocks.switchToBlockType)(innerBlock, "core/paragraph") || [];
        });
        return import_block_editor.RichText.isEmpty(citation) ? paragraphs : [
          ...paragraphs,
          (0, import_blocks.createBlock)("core/paragraph", {
            content: citation
          })
        ];
      }
    },
    {
      type: "block",
      blocks: ["core/group"],
      transform: ({ citation, anchor }, innerBlocks) => (0, import_blocks.createBlock)(
        "core/group",
        { anchor },
        import_block_editor.RichText.isEmpty(citation) ? innerBlocks : [
          ...innerBlocks,
          (0, import_blocks.createBlock)("core/paragraph", {
            content: citation
          })
        ]
      )
    }
  ],
  ungroup: ({ citation }, innerBlocks) => import_block_editor.RichText.isEmpty(citation) ? innerBlocks : [
    ...innerBlocks,
    (0, import_blocks.createBlock)("core/paragraph", {
      content: citation
    })
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
