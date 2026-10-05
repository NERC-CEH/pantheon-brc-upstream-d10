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

// packages/block-library/src/tab/controls.js
var controls_exports = {};
__export(controls_exports, {
  default: () => Controls
});
module.exports = __toCommonJS(controls_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_data = require("@wordpress/data");
var import_add_tab_toolbar_control = __toESM(require("./add-tab-toolbar-control.cjs"));
var import_remove_tab_toolbar_control = __toESM(require("./remove-tab-toolbar-control.cjs"));
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function Controls({ tabsClientId, blockIndex, isDefaultTab }) {
  const { updateBlockAttributes } = (0, import_data.useDispatch)(import_block_editor.store);
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_add_tab_toolbar_control.default, { tabsClientId }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_remove_tab_toolbar_control.default, { tabsClientId }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          updateBlockAttributes(tabsClientId, {
            activeTabIndex: 0
          });
        },
        dropdownMenuProps,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Default tab"),
            hasValue: () => isDefaultTab && blockIndex !== 0,
            onDeselect: () => {
              updateBlockAttributes(tabsClientId, {
                activeTabIndex: 0
              });
            },
            isShownByDefault: true,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.CheckboxControl,
              {
                label: (0, import_i18n.__)("Default tab"),
                checked: isDefaultTab,
                onChange: (value) => {
                  updateBlockAttributes(tabsClientId, {
                    activeTabIndex: value ? blockIndex : 0
                  });
                }
              }
            )
          }
        )
      }
    ) })
  ] });
}
//# sourceMappingURL=controls.cjs.map
