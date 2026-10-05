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

// packages/block-library/src/site-title/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => SiteTitleEdit
});
module.exports = __toCommonJS(edit_exports);
var import_data = require("@wordpress/data");
var import_core_data = require("@wordpress/core-data");
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_html_entities = require("@wordpress/html-entities");
var import_hooks = require("../utils/hooks.cjs");
var import_deprecated_text_align_attributes = __toESM(require("../utils/deprecated-text-align-attributes.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function SiteTitleEdit(props) {
  (0, import_deprecated_text_align_attributes.default)(props);
  const { attributes, setAttributes } = props;
  const { level, levelOptions, isLink, linkTarget } = attributes;
  const canUserEdit = (0, import_data.useSelect)(
    (select) => select(import_core_data.store).canUser("update", {
      kind: "root",
      name: "site"
    }),
    []
  );
  const [title, setSiteTitle] = (0, import_core_data.useEntityProp)(
    "root",
    canUserEdit ? "site" : "__unstableBase",
    canUserEdit ? "title" : "name",
    void 0
  );
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  const TagName = level === 0 ? "p" : `h${level}`;
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: !canUserEdit && !title && "wp-block-site-title__placeholder"
  });
  const siteTitleContent = canUserEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.RichText,
    {
      tagName: isLink ? "a" : "span",
      href: isLink ? "#site-title-pseudo-link" : void 0,
      "aria-label": (0, import_i18n.__)("Site title text"),
      placeholder: (0, import_i18n.__)("Write site title…"),
      value: title,
      onChange: (newTitle) => setSiteTitle(newTitle.trim()),
      allowedFormats: [],
      disableLineBreaks: true
    }
  ) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: isLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "a",
    {
      href: "#site-title-pseudo-link",
      onClick: (event) => event.preventDefault(),
      children: (0, import_html_entities.decodeEntities)(title) || (0, import_i18n.__)("Site Title placeholder")
    }
  ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: (0, import_html_entities.decodeEntities)(title) || (0, import_i18n.__)("Site Title placeholder") }) });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    blockEditingMode === "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.HeadingLevelDropdown,
      {
        value: level,
        options: levelOptions,
        onChange: (newLevel) => setAttributes({ level: newLevel })
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            isLink: true,
            linkTarget: "_self"
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !isLink,
              label: (0, import_i18n.__)("Make title link to home"),
              onDeselect: () => setAttributes({ isLink: true }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Make title link to home"),
                  onChange: () => setAttributes({ isLink: !isLink }),
                  checked: isLink
                }
              )
            }
          ),
          isLink && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => linkTarget !== "_self",
              label: (0, import_i18n.__)("Open in new tab"),
              onDeselect: () => setAttributes({ linkTarget: "_self" }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Open in new tab"),
                  onChange: (value) => setAttributes({
                    linkTarget: value ? "_blank" : "_self"
                  }),
                  checked: linkTarget === "_blank"
                }
              )
            }
          )
        ]
      }
    ) }),
    siteTitleContent
  ] });
}
//# sourceMappingURL=edit.cjs.map
