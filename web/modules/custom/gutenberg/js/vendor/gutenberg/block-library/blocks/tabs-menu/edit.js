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

// packages/block-library/src/tabs-menu/edit.js
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_add_tab_toolbar_control = __toESM(require("../tab/add-tab-toolbar-control.cjs"));
var import_remove_tab_toolbar_control = __toESM(require("../tab/remove-tab-toolbar-control.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function Edit({ clientId, __unstableLayoutClassNames: layoutClassNames }) {
  const { tabsClientId } = (0, import_data.useSelect)(
    (select) => ({
      tabsClientId: select(import_block_editor.store).getBlockRootClientId(clientId)
    }),
    [clientId]
  );
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: (0, import_clsx.default)(layoutClassNames),
    role: "tablist"
  });
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    allowedBlocks: ["core/tabs-menu-item"],
    orientation: "horizontal",
    renderAppender: false
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_add_tab_toolbar_control.default, { tabsClientId }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_remove_tab_toolbar_control.default, { tabsClientId }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...innerBlocksProps })
  ] });
}
var edit_default = Edit;
//# sourceMappingURL=edit.cjs.map
