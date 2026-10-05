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

// packages/block-library/src/post-content/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => PostContentEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_blocks = require("@wordpress/blocks");
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_hooks = require("../utils/hooks.cjs");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var { HTMLElementControl } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
function ReadOnlyContent({
  parentLayout,
  layoutClassNames,
  userCanEdit,
  postType,
  postId,
  tagName: TagName = "div"
}) {
  const [, , content] = (0, import_core_data.useEntityProp)(
    "postType",
    postType,
    "content",
    postId
  );
  const blockProps = (0, import_block_editor.useBlockProps)({ className: layoutClassNames });
  const blocks = (0, import_element.useMemo)(() => {
    return content?.raw ? (0, import_blocks.parse)(content.raw) : [];
  }, [content?.raw]);
  const blockPreviewProps = (0, import_block_editor.__experimentalUseBlockPreview)({
    blocks,
    props: blockProps,
    layout: parentLayout
  });
  if (userCanEdit) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockPreviewProps });
  }
  return content?.protected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.Warning, { children: (0, import_i18n.__)("This content is password protected.") }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    TagName,
    {
      ...blockProps,
      dangerouslySetInnerHTML: { __html: content?.rendered }
    }
  );
}
function EditableContentLoaded({
  blockProps,
  blocks,
  onInput,
  onChange,
  tagName: TagName = "div"
}) {
  const props = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    value: blocks,
    onInput,
    onChange
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...props });
}
function EditableContent({ context = {}, tagName: TagName = "div" }) {
  const { postType, postId } = context;
  const [blocks, onInput, onChange] = (0, import_core_data.useEntityBlockEditor)(
    "postType",
    postType,
    { id: postId }
  );
  const hasLoadedRecord = (0, import_data.useSelect)(
    (select) => select(import_core_data.store).getEntityRecord(
      "postType",
      postType,
      postId
    ) !== void 0 || select(import_core_data.store).hasFinishedResolution("getEntityRecord", [
      "postType",
      postType,
      postId
    ]),
    [postType, postId]
  );
  const blockProps = (0, import_block_editor.useBlockProps)({ className: "entry-content" });
  if (!hasLoadedRecord) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    EditableContentLoaded,
    {
      blockProps,
      blocks,
      onInput,
      onChange,
      tagName: TagName
    }
  );
}
function Content(props) {
  const {
    context: { queryId, postType, postId } = {},
    layoutClassNames,
    tagName
  } = props;
  const userCanEdit = (0, import_hooks.useCanEditEntity)("postType", postType, postId);
  if (userCanEdit === void 0) {
    return null;
  }
  const isDescendentOfQueryLoop = Number.isFinite(queryId);
  const isEditable = userCanEdit && !isDescendentOfQueryLoop;
  return isEditable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableContent, { ...props }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ReadOnlyContent,
    {
      parentLayout: props.parentLayout,
      layoutClassNames,
      userCanEdit,
      postType,
      postId,
      tagName
    }
  );
}
function Placeholder({ layoutClassNames }) {
  const blockProps = (0, import_block_editor.useBlockProps)({ className: layoutClassNames });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: (0, import_i18n.__)(
      "This is the Content block, it will display all the blocks in any single post or page."
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: (0, import_i18n.__)(
      "That might be a simple arrangement like consecutive paragraphs in a blog post, or a more elaborate composition that includes image galleries, videos, tables, columns, and any other block types."
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: (0, import_i18n.__)(
      "If there are any Custom Post Types registered at your site, the Content block can display the contents of those entries as well."
    ) })
  ] });
}
function RecursionError() {
  const blockProps = (0, import_block_editor.useBlockProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.Warning, { children: (0, import_i18n.__)("Block cannot be rendered inside itself.") }) });
}
function PostContentEditControls({ tagName, onSelectTagName, clientId }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "advanced", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    HTMLElementControl,
    {
      tagName,
      onChange: onSelectTagName,
      clientId,
      options: [
        { label: (0, import_i18n.__)("Default (<div>)"), value: "div" },
        { label: "<main>", value: "main" },
        { label: "<section>", value: "section" },
        { label: "<article>", value: "article" }
      ]
    }
  ) });
}
function PostContentEdit({
  context,
  attributes: { tagName = "div" },
  setAttributes,
  clientId,
  __unstableLayoutClassNames: layoutClassNames,
  __unstableParentLayout: parentLayout
}) {
  const { postId: contextPostId, postType: contextPostType } = context;
  const hasAlreadyRendered = (0, import_block_editor.useHasRecursion)(contextPostId);
  if (contextPostId && contextPostType && hasAlreadyRendered) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecursionError, {});
  }
  const handleSelectTagName = (value) => {
    setAttributes({ tagName: value });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      PostContentEditControls,
      {
        tagName,
        onSelectTagName: handleSelectTagName,
        clientId
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RecursionProvider, { uniqueId: contextPostId, children: contextPostId && contextPostType ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      Content,
      {
        context,
        parentLayout,
        layoutClassNames
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Placeholder, { layoutClassNames }) })
  ] });
}
//# sourceMappingURL=edit.cjs.map
