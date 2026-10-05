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

// packages/block-library/src/post-excerpt/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => PostExcerptEditor
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_core_data = require("@wordpress/core-data");
var import_element = require("@wordpress/element");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_data = require("@wordpress/data");
var import_hooks = require("../utils/hooks.cjs");
var import_deprecated_text_align_attributes = __toESM(require("../utils/deprecated-text-align-attributes.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var ELLIPSIS = "…";
function PostExcerptEditor(props) {
  const {
    attributes: { moreText, showMoreOnNewLine, excerptLength },
    setAttributes,
    isSelected,
    context: { postId, postType, queryId }
  } = props;
  (0, import_deprecated_text_align_attributes.default)(props);
  const isDescendentOfQueryLoop = Number.isFinite(queryId);
  const userCanEdit = (0, import_hooks.useCanEditEntity)("postType", postType, postId);
  const [
    rawExcerpt,
    setExcerpt,
    { rendered: renderedExcerpt, protected: isProtected } = {}
  ] = (0, import_core_data.useEntityProp)("postType", postType, "excerpt", postId);
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const postTypeSupportsExcerpts = (0, import_data.useSelect)(
    (select) => {
      if (postType === "page") {
        return true;
      }
      return !!select(import_core_data.store).getPostType(postType)?.supports?.excerpt;
    },
    [postType]
  );
  const isEditable = userCanEdit && !isDescendentOfQueryLoop && postTypeSupportsExcerpts;
  const blockProps = (0, import_block_editor.useBlockProps)();
  const wordCountType = (0, import_i18n._x)("words", "Word count type. Do not translate!");
  const strippedRenderedExcerpt = (0, import_element.useMemo)(() => {
    if (!renderedExcerpt) {
      return "";
    }
    const document = new window.DOMParser().parseFromString(
      renderedExcerpt,
      "text/html"
    );
    return document.body.textContent || document.body.innerText || "";
  }, [renderedExcerpt]);
  if (!postType || !postId) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: (0, import_i18n.__)("This block will display the excerpt.") }) });
  }
  if (isProtected && !userCanEdit) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.Warning, { children: (0, import_i18n.__)(
      "The content is currently protected and does not have the available excerpt."
    ) }) });
  }
  const readMoreLink = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.RichText,
    {
      identifier: "moreText",
      className: "wp-block-post-excerpt__more-link",
      tagName: "a",
      "aria-label": (0, import_i18n.__)("“Read more” link text"),
      placeholder: (0, import_i18n.__)('Add "read more" link text'),
      value: moreText,
      onChange: (newMoreText) => setAttributes({ moreText: newMoreText }),
      withoutInteractiveFormatting: true
    }
  );
  const excerptClassName = (0, import_clsx.default)("wp-block-post-excerpt__excerpt", {
    "is-inline": !showMoreOnNewLine
  });
  const rawOrRenderedExcerpt = (rawExcerpt || strippedRenderedExcerpt).trim();
  let trimmedExcerpt = "";
  if (wordCountType === "words") {
    trimmedExcerpt = rawOrRenderedExcerpt.split(/\s+/, excerptLength).join(" ");
  } else if (wordCountType === "characters_excluding_spaces") {
    const excerptWithSpaces = rawOrRenderedExcerpt.split("", excerptLength).join("");
    const numberOfSpaces = excerptWithSpaces.length - excerptWithSpaces.replaceAll(" ", "").length;
    trimmedExcerpt = rawOrRenderedExcerpt.split("", excerptLength + numberOfSpaces).join("");
  } else if (wordCountType === "characters_including_spaces") {
    trimmedExcerpt = rawOrRenderedExcerpt.split("", excerptLength).join("");
  }
  const isTrimmed = trimmedExcerpt !== rawOrRenderedExcerpt;
  const excerptContent = isEditable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.RichText,
    {
      className: excerptClassName,
      "aria-label": (0, import_i18n.__)("Excerpt text"),
      value: isSelected ? rawOrRenderedExcerpt : (!isTrimmed ? rawOrRenderedExcerpt : trimmedExcerpt + ELLIPSIS) || (0, import_i18n.__)("No excerpt found"),
      onChange: setExcerpt,
      tagName: "p",
      allowedFormats: [],
      preserveWhiteSpace: true
    }
  ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: excerptClassName, children: !isTrimmed ? rawOrRenderedExcerpt || (0, import_i18n.__)("No excerpt found") : trimmedExcerpt + ELLIPSIS });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            showMoreOnNewLine: true,
            excerptLength: 55
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => showMoreOnNewLine !== true,
              label: (0, import_i18n.__)("Show link on new line"),
              onDeselect: () => setAttributes({ showMoreOnNewLine: true }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show link on new line"),
                  checked: showMoreOnNewLine,
                  onChange: (newShowMoreOnNewLine) => setAttributes({
                    showMoreOnNewLine: newShowMoreOnNewLine
                  })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => excerptLength !== 55,
              label: (0, import_i18n.__)("Max number of words"),
              onDeselect: () => setAttributes({ excerptLength: 55 }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.RangeControl,
                {
                  label: (0, import_i18n.__)("Max number of words"),
                  value: excerptLength,
                  onChange: (value) => {
                    setAttributes({ excerptLength: value });
                  },
                  min: "10",
                  max: "100"
                }
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
      excerptContent,
      !showMoreOnNewLine && " ",
      showMoreOnNewLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "wp-block-post-excerpt__more-text", children: readMoreLink }) : readMoreLink
    ] })
  ] });
}
//# sourceMappingURL=edit.cjs.map
