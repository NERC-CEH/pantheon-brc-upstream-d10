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

// packages/block-library/src/query-title/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => QueryTitleEdit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_use_archive_label = require("./use-archive-label.cjs");
var import_use_post_type_label = require("./use-post-type-label.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_deprecated_text_align_attributes = __toESM(require("../utils/deprecated-text-align-attributes.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var SUPPORTED_TYPES = ["archive", "search", "post-type"];
function QueryTitleEdit(props) {
  (0, import_deprecated_text_align_attributes.default)(props);
  const {
    attributes: { type, level, levelOptions, showPrefix, showSearchTerm },
    setAttributes,
    context: { query }
  } = props;
  const { archiveTypeLabel, archiveNameLabel } = (0, import_use_archive_label.useArchiveLabel)();
  const { postTypeLabel } = (0, import_use_post_type_label.usePostTypeLabel)(query?.postType);
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const TagName = level === 0 ? "p" : `h${level}`;
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: "wp-block-query-title__placeholder"
  });
  if (!SUPPORTED_TYPES.includes(type)) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.Warning, { children: (0, import_i18n.__)("Provided type is not supported.") }) });
  }
  let titleElement;
  if (type === "archive") {
    let title;
    if (archiveTypeLabel) {
      if (showPrefix) {
        if (archiveNameLabel) {
          title = (0, import_i18n.sprintf)(
            /* translators: 1: Archive type title e.g: "Category", 2: Label of the archive e.g: "Shoes" */
            (0, import_i18n._x)("%1$s: %2$s", "archive label"),
            archiveTypeLabel,
            archiveNameLabel
          );
        } else {
          title = (0, import_i18n.sprintf)(
            /* translators: %s: Archive type title e.g: "Category", "Tag"... */
            (0, import_i18n.__)("%s: Name"),
            archiveTypeLabel
          );
        }
      } else if (archiveNameLabel) {
        title = archiveNameLabel;
      } else {
        title = (0, import_i18n.sprintf)(
          /* translators: %s: Archive type title e.g: "Category", "Tag"... */
          (0, import_i18n.__)("%s name"),
          archiveTypeLabel
        );
      }
    } else {
      title = showPrefix ? (0, import_i18n.__)("Archive type: Name") : (0, import_i18n.__)("Archive title");
    }
    titleElement = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.__experimentalToolsPanel,
        {
          label: (0, import_i18n.__)("Settings"),
          resetAll: () => setAttributes({
            showPrefix: true
          }),
          dropdownMenuProps,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !showPrefix,
              label: (0, import_i18n.__)("Show archive type in title"),
              onDeselect: () => setAttributes({ showPrefix: true }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show archive type in title"),
                  onChange: () => setAttributes({
                    showPrefix: !showPrefix
                  }),
                  checked: showPrefix
                }
              )
            }
          )
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: title })
    ] });
  }
  if (type === "search") {
    titleElement = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.__experimentalToolsPanel,
        {
          label: (0, import_i18n.__)("Settings"),
          resetAll: () => setAttributes({
            showSearchTerm: true
          }),
          dropdownMenuProps,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !showSearchTerm,
              label: (0, import_i18n.__)("Show search term in title"),
              onDeselect: () => setAttributes({ showSearchTerm: true }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show search term in title"),
                  onChange: () => setAttributes({
                    showSearchTerm: !showSearchTerm
                  }),
                  checked: showSearchTerm
                }
              )
            }
          )
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: showSearchTerm ? (0, import_i18n.__)("Search results for: “search term”") : (0, import_i18n.__)("Search results") })
    ] });
  }
  if (type === "post-type") {
    let title;
    if (postTypeLabel) {
      if (showPrefix) {
        title = (0, import_i18n.sprintf)(
          /* translators: %s: Singular post type name of the queried object */
          (0, import_i18n.__)('Post Type: "%s"'),
          postTypeLabel
        );
      } else {
        title = postTypeLabel;
      }
    } else {
      title = showPrefix ? (0, import_i18n.__)("Post Type: Name") : (0, import_i18n.__)("Name");
    }
    titleElement = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.__experimentalToolsPanel,
        {
          label: (0, import_i18n.__)("Settings"),
          resetAll: () => setAttributes({
            showPrefix: true
          }),
          dropdownMenuProps,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !showPrefix,
              label: (0, import_i18n.__)("Show post type label"),
              onDeselect: () => setAttributes({ showPrefix: true }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show post type label"),
                  onChange: () => setAttributes({
                    showPrefix: !showPrefix
                  }),
                  checked: showPrefix
                }
              )
            }
          )
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: title })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.HeadingLevelDropdown,
      {
        value: level,
        options: levelOptions,
        onChange: (newLevel) => setAttributes({ level: newLevel })
      }
    ) }),
    titleElement
  ] });
}
//# sourceMappingURL=edit.cjs.map
