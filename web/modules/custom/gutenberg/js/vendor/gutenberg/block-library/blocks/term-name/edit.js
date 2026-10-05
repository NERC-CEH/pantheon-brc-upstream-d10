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

// packages/block-library/src/term-name/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => TermNameEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_html_entities = require("@wordpress/html-entities");
var import_hooks = require("../utils/hooks.cjs");
var import_use_term_name = require("./use-term-name.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function TermNameEdit({
  attributes,
  setAttributes,
  context: { termId, taxonomy }
}) {
  const { level = 0, isLink, levelOptions } = attributes;
  const { term } = (0, import_use_term_name.useTermName)(termId, taxonomy);
  const termName = term?.name ? (0, import_html_entities.decodeEntities)(term.name) : (0, import_i18n.__)("Term Name");
  const blockProps = (0, import_block_editor.useBlockProps)();
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const TagName = level === 0 ? "p" : `h${level}`;
  let termNameDisplay = termName;
  if (isLink) {
    termNameDisplay = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "a",
      {
        href: "#term-name-pseudo-link",
        onClick: (e) => e.preventDefault(),
        children: termName
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.HeadingLevelDropdown,
      {
        value: level,
        options: levelOptions,
        onChange: (newLevel) => {
          setAttributes({ level: newLevel });
        }
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            isLink: false
          });
        },
        dropdownMenuProps,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            hasValue: () => !!isLink,
            label: (0, import_i18n.__)("Make term name a link"),
            onDeselect: () => setAttributes({ isLink: false }),
            isShownByDefault: true,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Make term name a link"),
                onChange: () => setAttributes({ isLink: !isLink }),
                checked: isLink
              }
            )
          }
        )
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: termNameDisplay })
  ] });
}
//# sourceMappingURL=edit.cjs.map
