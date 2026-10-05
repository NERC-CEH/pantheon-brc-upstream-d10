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

// packages/block-library/src/heading/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blocks = require("@wordpress/blocks");
var import_i18n = require("@wordpress/i18n");
var import_shared = require("./shared.cjs");
var import_get_transformed_attributes = require("../utils/get-transformed-attributes.cjs");
var transforms = {
  from: [
    {
      type: "block",
      isMultiBlock: true,
      blocks: ["core/paragraph"],
      // The level shortcuts are declared here as well as on the
      // variations, so that they reach a paragraph and not only a
      // heading. Both declarations describe the same shortcut, and only
      // one of them can apply to any given selection.
      shortcuts: [1, 2, 3, 4, 5, 6].map((level) => ({
        name: `core/block-editor/transform-to-heading-${level}`,
        description: (0, import_i18n.sprintf)(
          /* translators: %d: heading level e.g: "1", "2", "3" */
          (0, import_i18n.__)("Transform the selected block into a heading %d."),
          level
        ),
        keyCombination: {
          modifier: "access",
          character: `${level}`
        },
        variationName: `h${level}`
      })),
      transform: (attributes) => attributes.map((_attributes) => {
        const { content, anchor, style } = _attributes;
        const textAlign = style?.typography?.textAlign;
        return (0, import_blocks.createBlock)("core/heading", {
          ...(0, import_get_transformed_attributes.getTransformedAttributes)(
            _attributes,
            "core/heading",
            ({ content: contentBinding }) => ({
              content: contentBinding
            })
          ),
          content,
          anchor,
          ...textAlign && {
            style: {
              typography: {
                textAlign
              }
            }
          }
        });
      })
    },
    {
      type: "raw",
      selector: "h1,h2,h3,h4,h5,h6",
      schema: ({ phrasingContentSchema, isPaste }) => {
        const schema = {
          children: phrasingContentSchema,
          attributes: isPaste ? [] : ["style", "id"]
        };
        return {
          h1: schema,
          h2: schema,
          h3: schema,
          h4: schema,
          h5: schema,
          h6: schema
        };
      },
      transform(node) {
        const attributes = (0, import_blocks.getBlockAttributes)(
          "core/heading",
          node.outerHTML
        );
        const { textAlign } = node.style || {};
        attributes.level = (0, import_shared.getLevelFromHeadingNodeName)(node.nodeName);
        if (textAlign === "left" || textAlign === "center" || textAlign === "right") {
          attributes.style = {
            ...attributes.style,
            typography: {
              ...attributes.style?.typography,
              textAlign
            }
          };
        }
        return (0, import_blocks.createBlock)("core/heading", attributes);
      }
    },
    ...[1, 2, 3, 4, 5, 6].map((level) => ({
      type: "prefix",
      prefix: Array(level + 1).join("#"),
      transform(content) {
        return (0, import_blocks.createBlock)("core/heading", {
          level,
          content
        });
      }
    })),
    ...[1, 2, 3, 4, 5, 6].map((level) => ({
      type: "enter",
      regExp: new RegExp(`^/(h|H)${level}$`),
      transform: () => (0, import_blocks.createBlock)("core/heading", { level })
    }))
  ],
  to: [
    {
      type: "block",
      isMultiBlock: true,
      blocks: ["core/paragraph"],
      shortcuts: [
        {
          name: "core/block-editor/transform-heading-to-paragraph",
          description: (0, import_i18n.__)(
            "Transform the selected heading into a paragraph."
          ),
          keyCombination: {
            modifier: "access",
            character: "0"
          },
          aliases: [
            {
              modifier: "access",
              character: "7"
            }
          ]
        }
      ],
      transform: (attributes) => attributes.map((_attributes) => {
        const { content, style } = _attributes;
        const textAlign = style?.typography?.textAlign;
        return (0, import_blocks.createBlock)("core/paragraph", {
          ...(0, import_get_transformed_attributes.getTransformedAttributes)(
            _attributes,
            "core/paragraph",
            ({ content: contentBinding }) => ({
              content: contentBinding
            })
          ),
          content,
          ...textAlign && {
            style: {
              typography: {
                textAlign
              }
            }
          }
        });
      })
    }
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
