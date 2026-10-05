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

// packages/block-library/src/tabs/tab-toolbar-controls.jsx
var tab_toolbar_controls_exports = {};
__export(tab_toolbar_controls_exports, {
  default: () => TabToolbarControls
});
module.exports = __toCommonJS(tab_toolbar_controls_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_use_tab_actions = __toESM(require("./use-tab-actions.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function TabToolbarControls({ tabsClientId }) {
  const { insertTab, removeTab } = (0, import_use_tab_actions.default)(tabsClientId);
  const isRemoveDisabled = (0, import_data.useSelect)(
    (select) => {
      if (!tabsClientId) {
        return true;
      }
      const tabPanels = select(import_block_editor.store).getBlocks(tabsClientId).find((block) => block.name === "core/tab-panels");
      return (tabPanels?.innerBlocks.length ?? 0) <= 1;
    },
    [tabsClientId]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.ToolbarGroup, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarButton,
      {
        className: "components-toolbar__control",
        onClick: () => insertTab(),
        text: (0, import_i18n.__)("Add tab")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarButton,
      {
        className: "components-toolbar__control",
        onClick: () => removeTab(),
        text: (0, import_i18n.__)("Remove tab"),
        disabled: isRemoveDisabled
      }
    )
  ] }) });
}
//# sourceMappingURL=tab-toolbar-controls.cjs.map
