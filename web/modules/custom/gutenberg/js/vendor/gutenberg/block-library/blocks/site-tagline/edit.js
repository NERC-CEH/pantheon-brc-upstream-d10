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

// packages/block-library/src/site-tagline/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => SiteTaglineEdit
});
module.exports = __toCommonJS(edit_exports);
var import_data = require("@wordpress/data");
var import_core_data = require("@wordpress/core-data");
var import_block_editor = require("@wordpress/block-editor");
var import_i18n = require("@wordpress/i18n");
var import_blocks = require("@wordpress/blocks");
var import_deprecated_text_align_attributes = __toESM(require("../utils/deprecated-text-align-attributes.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function SiteTaglineEdit(props) {
  (0, import_deprecated_text_align_attributes.default)(props);
  const { attributes, setAttributes, insertBlocksAfter } = props;
  const { level, levelOptions } = attributes;
  const canUserEdit = (0, import_data.useSelect)(
    (select) => select(import_core_data.store).canUser("update", {
      kind: "root",
      name: "site"
    }),
    []
  );
  const [tagline, setTagline] = (0, import_core_data.useEntityProp)(
    "root",
    canUserEdit ? "site" : "__unstableBase",
    "description",
    void 0
  );
  const TagName = level === 0 ? "p" : `h${level}`;
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: !canUserEdit && !tagline && "wp-block-site-tagline__placeholder"
  });
  const siteTaglineContent = canUserEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.RichText,
    {
      allowedFormats: [],
      onChange: setTagline,
      "aria-label": (0, import_i18n.__)("Site tagline text"),
      placeholder: (0, import_i18n.__)("Write site tagline…"),
      tagName: TagName,
      value: tagline,
      disableLineBreaks: true,
      __unstableOnSplitAtEnd: insertBlocksAfter ? () => insertBlocksAfter(
        (0, import_blocks.createBlock)((0, import_blocks.getDefaultBlockName)())
      ) : void 0,
      ...blockProps
    }
  ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: tagline || (0, import_i18n.__)("Site Tagline placeholder") });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.HeadingLevelDropdown,
      {
        value: level,
        options: levelOptions,
        onChange: (newLevel) => setAttributes({ level: newLevel })
      }
    ) }),
    siteTaglineContent
  ] });
}
//# sourceMappingURL=edit.cjs.map
