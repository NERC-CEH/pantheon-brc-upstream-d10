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

// packages/block-library/src/comment-author-name/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => Edit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_data = require("@wordpress/data");
var import_block_editor = require("@wordpress/block-editor");
var import_core_data = require("@wordpress/core-data");
var import_components = require("@wordpress/components");
var import_hooks = require("../utils/hooks.cjs");
var import_deprecated_text_align_attributes = __toESM(require("../utils/deprecated-text-align-attributes.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function Edit(props) {
  const {
    attributes: { isLink, linkTarget },
    context: { commentId },
    setAttributes
  } = props;
  (0, import_deprecated_text_align_attributes.default)(props);
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const blockProps = (0, import_block_editor.useBlockProps)();
  let displayName = (0, import_data.useSelect)(
    (select) => {
      const { getEntityRecord } = select(import_core_data.store);
      const comment = getEntityRecord("root", "comment", commentId);
      const authorName = comment?.author_name;
      if (comment && !authorName) {
        const user = getEntityRecord("root", "user", comment.author);
        return user?.name ?? (0, import_i18n.__)("Anonymous");
      }
      return authorName ?? "";
    },
    [commentId]
  );
  const inspectorControls = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
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
            label: (0, import_i18n.__)("Link to authors URL"),
            isShownByDefault: true,
            hasValue: () => !isLink,
            onDeselect: () => setAttributes({
              isLink: true
            }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Link to authors URL"),
                onChange: () => setAttributes({ isLink: !isLink }),
                checked: isLink
              }
            )
          }
        ),
        isLink && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Open in new tab"),
            isShownByDefault: true,
            hasValue: () => linkTarget !== "_self",
            onDeselect: () => setAttributes({
              linkTarget: "_self"
            }),
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
  ) });
  if (!commentId || !displayName) {
    displayName = (0, import_i18n._x)("Comment Author", "block title");
  }
  const displayAuthor = isLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "a",
    {
      href: "#comment-author-pseudo-link",
      onClick: (event) => event.preventDefault(),
      children: displayName
    }
  ) : displayName;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    inspectorControls,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: displayAuthor })
  ] });
}
//# sourceMappingURL=edit.cjs.map
