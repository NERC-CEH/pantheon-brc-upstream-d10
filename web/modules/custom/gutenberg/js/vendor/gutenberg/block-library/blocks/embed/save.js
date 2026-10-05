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

// packages/block-library/src/embed/save.jsx
var save_exports = {};
__export(save_exports, {
  default: () => save
});
module.exports = __toCommonJS(save_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
function save({ attributes }) {
  const { url, caption, type, providerNameSlug } = attributes;
  if (!url) {
    return null;
  }
  const className = (0, import_clsx.default)("wp-block-embed", {
    [`is-type-${type}`]: type,
    [`is-provider-${providerNameSlug}`]: providerNameSlug,
    [`wp-block-embed-${providerNameSlug}`]: providerNameSlug
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...import_block_editor.useBlockProps.save({ className }), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-embed__wrapper", children: `
${url}
` }),
    !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText.Content,
      {
        className: (0, import_block_editor.__experimentalGetElementClassName)("caption"),
        tagName: "figcaption",
        value: caption
      }
    )
  ] });
}
//# sourceMappingURL=save.cjs.map
