"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/block-library/src/table/save.jsx
var save_exports = {};
__export(save_exports, {
  default: () => save
});
module.exports = __toCommonJS(save_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
function save({ attributes }) {
  const { hasFixedLayout, head, body, foot, caption } = attributes;
  const isEmpty = !head.length && !body.length && !foot.length;
  if (isEmpty) {
    return null;
  }
  const colorProps = (0, import_block_editor.__experimentalGetColorClassesAndStyles)(attributes);
  const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
  const classes = (0, import_clsx.default)(colorProps.className, borderProps.className, {
    "has-fixed-layout": hasFixedLayout
  });
  const hasCaption = !import_block_editor.RichText.isEmpty(caption);
  const Section = ({ type, rows }) => {
    if (!rows.length) {
      return null;
    }
    const Tag = `t${type}`;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { children: rows.map(({ cells }, rowIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: cells.map(
      ({
        content,
        tag,
        scope,
        align,
        colspan,
        rowspan
      }, cellIndex) => {
        const cellClasses = (0, import_clsx.default)({
          [`has-text-align-${align}`]: align
        });
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_block_editor.RichText.Content,
          {
            className: cellClasses ? cellClasses : void 0,
            "data-align": align,
            tagName: tag,
            value: content,
            scope: tag === "th" ? scope : void 0,
            colSpan: colspan,
            rowSpan: rowspan
          },
          cellIndex
        );
      }
    ) }, rowIndex)) });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...import_block_editor.useBlockProps.save(), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "table",
      {
        className: classes === "" ? void 0 : classes,
        style: { ...colorProps.style, ...borderProps.style },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { type: "head", rows: head }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { type: "body", rows: body }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { type: "foot", rows: foot })
        ]
      }
    ),
    hasCaption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText.Content,
      {
        tagName: "figcaption",
        value: caption,
        className: (0, import_block_editor.__experimentalGetElementClassName)("caption")
      }
    )
  ] });
}
//# sourceMappingURL=save.cjs.map
