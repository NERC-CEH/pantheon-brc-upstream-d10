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

// packages/block-library/src/tabs/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_tab_toolbar_controls = __toESM(require("./tab-toolbar-controls.cjs"));
var import_use_tab_list_items_sync = __toESM(require("./use-tab-list-items-sync.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function Edit({ clientId }) {
  (0, import_use_tab_list_items_sync.default)(clientId);
  const blockProps = (0, import_block_editor.useBlockProps)();
  const innerBlockProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    __experimentalCaptureToolbars: true,
    templateLock: "all",
    renderAppender: false
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...innerBlockProps, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_tab_toolbar_controls.default, { tabsClientId: clientId }),
    innerBlockProps.children
  ] });
}
var edit_default = Edit;
//# sourceMappingURL=edit.cjs.map
