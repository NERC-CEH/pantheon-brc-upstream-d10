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

// packages/block-library/src/comment-date/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => Edit
});
module.exports = __toCommonJS(edit_exports);
var import_core_data = require("@wordpress/core-data");
var import_date = require("@wordpress/date");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function Edit({
  attributes: { format, isLink },
  context: { commentId },
  setAttributes
}) {
  const blockProps = (0, import_block_editor.useBlockProps)();
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  let [date] = (0, import_core_data.useEntityProp)("root", "comment", "date", commentId);
  const [siteFormat = (0, import_date.getSettings)().formats.date] = (0, import_core_data.useEntityProp)(
    "root",
    "site",
    "date_format"
  );
  const inspectorControls = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_components.__experimentalToolsPanel,
    {
      label: (0, import_i18n.__)("Settings"),
      resetAll: () => {
        setAttributes({
          format: void 0,
          isLink: true
        });
      },
      dropdownMenuProps,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Date format"),
            hasValue: () => format !== void 0,
            onDeselect: () => setAttributes({ format: void 0 }),
            isShownByDefault: true,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_block_editor.__experimentalDateFormatPicker,
              {
                format,
                defaultFormat: siteFormat,
                onChange: (nextFormat) => setAttributes({ format: nextFormat })
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Link to comment"),
            hasValue: () => !isLink,
            onDeselect: () => setAttributes({ isLink: true }),
            isShownByDefault: true,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Link to comment"),
                onChange: () => setAttributes({ isLink: !isLink }),
                checked: isLink
              }
            )
          }
        )
      ]
    }
  ) });
  if (!commentId || !date) {
    date = (0, import_i18n._x)("Comment Date", "block title");
  }
  let commentDate = date instanceof Date ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", { dateTime: (0, import_date.dateI18n)("c", date), children: format === "human-diff" ? (0, import_date.humanTimeDiff)(date) : (0, import_date.dateI18n)(format || siteFormat, date) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", { children: date });
  if (isLink) {
    commentDate = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "a",
      {
        href: "#comment-date-pseudo-link",
        onClick: (event) => event.preventDefault(),
        children: commentDate
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    inspectorControls,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: commentDate })
  ] });
}
//# sourceMappingURL=edit.cjs.map
