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

// packages/block-library/src/term-count/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => TermCountEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_icons = require("./icons.cjs");
var import_use_term_count = require("./use-term-count.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var BRACKET_TYPES = {
  none: { label: (0, import_i18n.__)("No brackets"), icon: import_icons.bareNumber },
  round: {
    label: (0, import_i18n.__)("Round brackets"),
    icon: import_icons.numberInParenthesis,
    before: "(",
    after: ")"
  },
  square: {
    label: (0, import_i18n.__)("Square brackets"),
    icon: import_icons.numberInSquareBrackets,
    before: "[",
    after: "]"
  },
  curly: {
    label: (0, import_i18n.__)("Curly brackets"),
    icon: import_icons.numberInCurlyBrackets,
    before: "{",
    after: "}"
  },
  angle: {
    label: (0, import_i18n.__)("Angle brackets"),
    icon: import_icons.numberInAngleBrackets,
    before: "<",
    after: ">"
  }
};
function TermCountEdit({
  attributes,
  setAttributes,
  context: { termId, taxonomy }
}) {
  const { bracketType } = attributes;
  const term = (0, import_use_term_count.useTermCount)(termId, taxonomy);
  const termCount = term?.termCount || 0;
  const blockProps = (0, import_block_editor.useBlockProps)();
  const bracketTypeControls = Object.entries(BRACKET_TYPES).map(
    ([type, { label, icon }]) => ({
      role: "menuitemradio",
      title: label,
      isActive: bracketType === type,
      icon,
      onClick: () => {
        setAttributes({ bracketType: type });
      }
    })
  );
  const formatTermCount = (count, type) => {
    const { before = "", after = "" } = BRACKET_TYPES[type] || {};
    return `${before}${count}${after}`;
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarDropdownMenu,
      {
        icon: BRACKET_TYPES[bracketType]?.icon ?? import_icons.bareNumber,
        label: (0, import_i18n.__)("Change bracket type"),
        controls: bracketTypeControls
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: formatTermCount(termCount, bracketType) })
  ] });
}
//# sourceMappingURL=edit.cjs.map
