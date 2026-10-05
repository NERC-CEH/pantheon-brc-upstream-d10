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

// packages/block-library/src/list/utils.js
var utils_exports = {};
__export(utils_exports, {
  createListBlockFromDOMElement: () => createListBlockFromDOMElement,
  migrateToListV2: () => migrateToListV2,
  migrateTypeToInlineStyle: () => migrateTypeToInlineStyle
});
module.exports = __toCommonJS(utils_exports);
var import_blocks = require("@wordpress/blocks");
var LIST_STYLES = {
  A: "upper-alpha",
  a: "lower-alpha",
  I: "upper-roman",
  i: "lower-roman"
};
function createListBlockFromDOMElement(listElement) {
  const type = listElement.getAttribute("type");
  const listAttributes = {
    ordered: "OL" === listElement.tagName,
    anchor: listElement.id ? listElement.id : void 0,
    start: listElement.getAttribute("start") ? parseInt(listElement.getAttribute("start"), 10) : void 0,
    reversed: listElement.hasAttribute("reversed") ? true : void 0,
    type: type && LIST_STYLES[type] ? LIST_STYLES[type] : void 0
  };
  const innerBlocks = Array.from(listElement.children).map(
    (listItem) => {
      const children = Array.from(listItem.childNodes).filter(
        (node) => node.nodeType !== node.TEXT_NODE || node.textContent.trim().length !== 0
      );
      children.reverse();
      const [nestedList, ...nodes] = children;
      const hasNestedList = nestedList?.tagName === "UL" || nestedList?.tagName === "OL";
      if (!hasNestedList) {
        return (0, import_blocks.createBlock)("core/list-item", {
          content: listItem.innerHTML
        });
      }
      const htmlNodes = nodes.map((node) => {
        if (node.nodeType === node.TEXT_NODE) {
          return node.textContent;
        }
        return node.outerHTML;
      });
      htmlNodes.reverse();
      const childAttributes = {
        content: htmlNodes.join("").trim()
      };
      const childInnerBlocks = [
        createListBlockFromDOMElement(nestedList)
      ];
      return (0, import_blocks.createBlock)(
        "core/list-item",
        childAttributes,
        childInnerBlocks
      );
    }
  );
  return (0, import_blocks.createBlock)("core/list", listAttributes, innerBlocks);
}
function migrateToListV2(attributes) {
  const { values, start, reversed, ordered, type, ...otherAttributes } = attributes;
  const list = document.createElement(ordered ? "ol" : "ul");
  list.innerHTML = values;
  if (start) {
    list.setAttribute("start", start);
  }
  if (reversed) {
    list.setAttribute("reversed", true);
  }
  if (type) {
    list.setAttribute("type", type);
  }
  const [listBlock] = (0, import_blocks.rawHandler)({ HTML: list.outerHTML });
  return [
    { ...otherAttributes, ...listBlock.attributes },
    listBlock.innerBlocks
  ];
}
function migrateTypeToInlineStyle(attributes) {
  const { type } = attributes;
  if (type && LIST_STYLES[type]) {
    return {
      ...attributes,
      type: LIST_STYLES[type]
    };
  }
  return attributes;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createListBlockFromDOMElement,
  migrateToListV2,
  migrateTypeToInlineStyle
});
//# sourceMappingURL=utils.cjs.map
