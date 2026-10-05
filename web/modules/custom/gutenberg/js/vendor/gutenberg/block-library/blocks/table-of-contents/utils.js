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

// packages/block-library/src/table-of-contents/utils.ts
var utils_exports = {};
__export(utils_exports, {
  createListItemBlocks: () => createListItemBlocks,
  linearToNestedHeadingList: () => linearToNestedHeadingList
});
module.exports = __toCommonJS(utils_exports);
var import_blocks = require("@wordpress/blocks");
var import_escape_html = require("@wordpress/escape-html");
function linearToNestedHeadingList(headingList) {
  const nestedHeadingList = [];
  headingList.forEach((heading, key) => {
    if (heading.content === "") {
      return;
    }
    if (heading.level === headingList[0].level) {
      if (headingList[key + 1]?.level > heading.level) {
        let endOfSlice = headingList.length;
        for (let i = key + 1; i < headingList.length; i++) {
          if (headingList[i].level === heading.level) {
            endOfSlice = i;
            break;
          }
        }
        nestedHeadingList.push({
          heading,
          children: linearToNestedHeadingList(
            headingList.slice(key + 1, endOfSlice)
          )
        });
      } else {
        nestedHeadingList.push({
          heading,
          children: null
        });
      }
    }
  });
  return nestedHeadingList;
}
function createListItemBlocks(nestedHeadingList, ordered) {
  return nestedHeadingList.map(
    ({ heading: { content, link }, children }) => (0, import_blocks.createBlock)(
      "core/list-item",
      {
        // Headings are plain text, and links can carry query args on
        // paginated posts, so both need escaping to become markup.
        content: link ? `<a href="${(0, import_escape_html.escapeAttribute)(
          link
        )}">${(0, import_escape_html.escapeEditableHTML)(content)}</a>` : (0, import_escape_html.escapeEditableHTML)(content)
      },
      children?.length ? [
        (0, import_blocks.createBlock)(
          "core/list",
          { ordered },
          createListItemBlocks(children, ordered)
        )
      ] : []
    )
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createListItemBlocks,
  linearToNestedHeadingList
});
//# sourceMappingURL=utils.cjs.map
