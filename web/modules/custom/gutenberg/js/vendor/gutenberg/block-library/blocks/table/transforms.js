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

// packages/block-library/src/table/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default
});
module.exports = __toCommonJS(transforms_exports);
var import_blocks = require("@wordpress/blocks");
var import_utils = require("./utils.cjs");
var tableContentPasteSchema = ({ phrasingContentSchema }) => ({
  tr: {
    allowEmpty: true,
    children: {
      th: {
        allowEmpty: true,
        children: phrasingContentSchema,
        attributes: ["scope", "colspan", "rowspan", "style"]
      },
      td: {
        allowEmpty: true,
        children: phrasingContentSchema,
        attributes: ["colspan", "rowspan", "style"]
      }
    }
  }
});
var tablePasteSchema = (args) => ({
  table: {
    children: {
      thead: {
        allowEmpty: true,
        children: tableContentPasteSchema(args)
      },
      tfoot: {
        allowEmpty: true,
        children: tableContentPasteSchema(args)
      },
      tbody: {
        allowEmpty: true,
        children: tableContentPasteSchema(args)
      }
    }
  }
});
var transforms = {
  from: [
    {
      type: "raw",
      selector: "table",
      schema: tablePasteSchema,
      transform: (node) => {
        const attributes = Array.from(node.children).reduce(
          (sectionAcc, section) => {
            if (!section.children.length) {
              return sectionAcc;
            }
            const sectionName = section.nodeName.toLowerCase().slice(1);
            const sectionAttributes = Array.from(
              section.children
            ).reduce((rowAcc, row) => {
              if (!row.children.length) {
                return rowAcc;
              }
              const rowAttributes = Array.from(
                row.children
              ).reduce((colAcc, col) => {
                const rowspan = (0, import_utils.normalizeRowColSpan)(
                  col.getAttribute("rowspan")
                );
                const colspan = (0, import_utils.normalizeRowColSpan)(
                  col.getAttribute("colspan")
                );
                const { textAlign } = col.style || {};
                let align;
                if (textAlign === "left" || textAlign === "center" || textAlign === "right") {
                  align = textAlign;
                }
                colAcc.push({
                  tag: col.nodeName.toLowerCase(),
                  content: col.innerHTML,
                  rowspan,
                  colspan,
                  align
                });
                return colAcc;
              }, []);
              rowAcc.push({
                cells: rowAttributes
              });
              return rowAcc;
            }, []);
            sectionAcc[sectionName] = sectionAttributes;
            return sectionAcc;
          },
          {}
        );
        return (0, import_blocks.createBlock)("core/table", attributes);
      }
    }
  ]
};
var transforms_default = transforms;
//# sourceMappingURL=transforms.cjs.map
