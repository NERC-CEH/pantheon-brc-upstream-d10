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

// packages/block-library/src/table-of-contents/list.tsx
var list_exports = {};
__export(list_exports, {
  default: () => TableOfContentsList
});
module.exports = __toCommonJS(list_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var ENTRY_CLASS_NAME = "wp-block-table-of-contents__entry";
function TableOfContentsList({
  nestedHeadingList,
  disableLinkActivation,
  onClick,
  ordered = true
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: nestedHeadingList.map((node, index) => {
    const { content, link } = node.heading;
    const entry = link ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "a",
      {
        className: ENTRY_CLASS_NAME,
        href: link,
        "aria-disabled": disableLinkActivation || void 0,
        onClick: disableLinkActivation && "function" === typeof onClick ? onClick : void 0,
        children: content
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: ENTRY_CLASS_NAME, children: content });
    const NestedListTag = ordered ? "ol" : "ul";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
      entry,
      node.children ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NestedListTag, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        TableOfContentsList,
        {
          nestedHeadingList: node.children,
          disableLinkActivation,
          onClick: disableLinkActivation && "function" === typeof onClick ? onClick : void 0,
          ordered
        }
      ) }) : null
    ] }, index);
  }) });
}
//# sourceMappingURL=list.cjs.map
