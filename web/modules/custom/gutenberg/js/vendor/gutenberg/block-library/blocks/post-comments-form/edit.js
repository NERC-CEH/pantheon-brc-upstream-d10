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

// packages/block-library/src/post-comments-form/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => PostCommentsFormEdit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_compose = require("@wordpress/compose");
var import_i18n = require("@wordpress/i18n");
var import_ui = require("@wordpress/ui");
var import_form = __toESM(require("./form.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function PostCommentsFormEdit({ context }) {
  const { postId, postType } = context;
  const instanceId = (0, import_compose.useInstanceId)(PostCommentsFormEdit);
  const instanceIdDesc = (0, import_i18n.sprintf)("comments-form-edit-%d-desc", instanceId);
  const blockProps = (0, import_block_editor.useBlockProps)({
    "aria-describedby": instanceIdDesc
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_form.default, { postId, postType }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.VisuallyHidden, { id: instanceIdDesc, children: (0, import_i18n.__)("Comments form disabled in editor.") })
  ] });
}
//# sourceMappingURL=edit.cjs.map
