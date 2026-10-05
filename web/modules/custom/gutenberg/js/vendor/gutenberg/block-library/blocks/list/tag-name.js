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

// packages/block-library/src/list/tag-name.jsx
var tag_name_exports = {};
__export(tag_name_exports, {
  default: () => tag_name_default
});
module.exports = __toCommonJS(tag_name_exports);
var import_element = require("@wordpress/element");
var import_jsx_runtime = require("react/jsx-runtime");
function TagName(props, ref) {
  const { ordered, ...extraProps } = props;
  const Tag = ordered ? "ol" : "ul";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { ref, ...extraProps });
}
var tag_name_default = (0, import_element.forwardRef)(TagName);
//# sourceMappingURL=tag-name.cjs.map
