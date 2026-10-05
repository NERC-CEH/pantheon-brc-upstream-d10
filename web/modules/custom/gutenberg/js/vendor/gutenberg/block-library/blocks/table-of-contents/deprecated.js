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

// packages/block-library/src/table-of-contents/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
var ENTRY_CLASS_NAME = "wp-block-table-of-contents__entry";
var attributes = {
  headings: {
    type: "array",
    items: {
      type: "object"
    },
    default: []
  },
  onlyIncludeCurrentPage: {
    type: "boolean",
    default: false
  },
  maxLevel: {
    type: "number"
  },
  ordered: {
    type: "boolean",
    default: true
  }
};
var supports = {
  anchor: true,
  ariaLabel: true,
  html: false,
  color: {
    text: true,
    background: true,
    gradients: true,
    link: true
  },
  spacing: {
    margin: true,
    padding: true
  },
  typography: {
    fontSize: true,
    lineHeight: true,
    __experimentalFontFamily: true,
    __experimentalFontWeight: true,
    __experimentalFontStyle: true,
    __experimentalTextTransform: true,
    __experimentalTextDecoration: true,
    __experimentalLetterSpacing: true,
    __experimentalDefaultControls: {
      fontSize: true
    }
  },
  interactivity: {
    clientNavigation: true
  },
  __experimentalBorder: {
    radius: true,
    color: true,
    width: true,
    style: true,
    __experimentalDefaultControls: {
      radius: true,
      color: true,
      width: true,
      style: true
    }
  }
};
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
function TableOfContentsList({ nestedHeadingList, ordered = true }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: nestedHeadingList.map((node, index) => {
    const { content, link } = node.heading;
    const entry = link ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { className: ENTRY_CLASS_NAME, href: link, children: content }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: ENTRY_CLASS_NAME, children: content });
    const NestedListTag = ordered ? "ol" : "ul";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
      entry,
      node.children ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NestedListTag, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        TableOfContentsList,
        {
          nestedHeadingList: node.children,
          ordered
        }
      ) }) : null
    ] }, index);
  }) });
}
var hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
var v1 = {
  attributes,
  supports,
  isEligible: (blockAttributes, innerBlocks, { blockNode } = {}) => {
    return hasOwn(blockAttributes, "headings") || blockNode?.innerHTML?.includes("wp-block-table-of-contents");
  },
  migrate: ({ headings, ...persistentAttributes }) => persistentAttributes,
  save({ attributes: { headings = [], ordered = true } }) {
    if (headings.length === 0) {
      return null;
    }
    const ListTag = ordered ? "ol" : "ul";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { ...import_block_editor.useBlockProps.save(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListTag, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      TableOfContentsList,
      {
        nestedHeadingList: linearToNestedHeadingList(
          headings
        ),
        ordered
      }
    ) }) });
  }
};
var deprecated_default = [v1];
//# sourceMappingURL=deprecated.cjs.map
