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

// packages/block-library/src/post-terms/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => PostTermsEdit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_blocks = require("@wordpress/blocks");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_html_entities = require("@wordpress/html-entities");
var import_i18n = require("@wordpress/i18n");
var import_core_data = require("@wordpress/core-data");
var import_use_post_terms = __toESM(require("./use-post-terms.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var ALLOWED_FORMATS = [
  "core/bold",
  "core/image",
  "core/italic",
  "core/link",
  "core/strikethrough",
  "core/text-color"
];
function PostTermsEdit({
  attributes,
  clientId,
  context,
  isSelected,
  setAttributes,
  insertBlocksAfter
}) {
  const { term, separator, prefix, suffix } = attributes;
  const { postId, postType } = context;
  const selectedTerm = (0, import_data.useSelect)(
    (select) => {
      if (!term) {
        return {};
      }
      const { getTaxonomy } = select(import_core_data.store);
      const taxonomy = getTaxonomy(term);
      return taxonomy?.visibility?.publicly_queryable ? taxonomy : {};
    },
    [term]
  );
  const { postTerms, hasPostTerms, isLoading } = (0, import_use_post_terms.default)({
    postId,
    term: selectedTerm
  });
  const hasPost = postId && postType;
  const blockInformation = (0, import_block_editor.useBlockDisplayInformation)(clientId);
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: term && `taxonomy-${term}`
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "advanced", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.TextControl,
      {
        autoComplete: "off",
        label: (0, import_i18n.__)("Separator"),
        value: separator || "",
        onChange: (nextValue) => {
          setAttributes({ separator: nextValue });
        },
        help: (0, import_i18n.__)("Enter character(s) used to separate terms.")
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
      isLoading && hasPost && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {}),
      !isLoading && (isSelected || prefix) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText,
        {
          identifier: "prefix",
          allowedFormats: ALLOWED_FORMATS,
          className: "wp-block-post-terms__prefix",
          "aria-label": (0, import_i18n.__)("Prefix"),
          placeholder: (0, import_i18n.__)("Prefix") + " ",
          value: prefix,
          onChange: (value) => setAttributes({ prefix: value }),
          tagName: "span"
        }
      ),
      (!hasPost || !term) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: blockInformation.title }),
      hasPost && !isLoading && hasPostTerms && postTerms.map((postTerm) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          href: postTerm.link,
          onClick: (event) => event.preventDefault(),
          rel: "tag",
          children: (0, import_html_entities.decodeEntities)(postTerm.name)
        },
        postTerm.id
      )).reduce((prev, curr) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        prev,
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wp-block-post-terms__separator", children: separator || " " }),
        curr
      ] })),
      hasPost && !isLoading && !hasPostTerms && (selectedTerm?.labels?.no_terms || (0, import_i18n.__)("Term items not found.")),
      !isLoading && (isSelected || suffix) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText,
        {
          identifier: "suffix",
          allowedFormats: ALLOWED_FORMATS,
          className: "wp-block-post-terms__suffix",
          "aria-label": (0, import_i18n.__)("Suffix"),
          placeholder: " " + (0, import_i18n.__)("Suffix"),
          value: suffix,
          onChange: (value) => setAttributes({ suffix: value }),
          tagName: "span",
          __unstableOnSplitAtEnd: insertBlocksAfter ? () => insertBlocksAfter(
            (0, import_blocks.createBlock)((0, import_blocks.getDefaultBlockName)())
          ) : void 0
        }
      )
    ] })
  ] });
}
//# sourceMappingURL=edit.cjs.map
