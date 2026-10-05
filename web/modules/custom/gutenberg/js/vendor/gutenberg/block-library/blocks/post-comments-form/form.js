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

// packages/block-library/src/post-comments-form/form.jsx
var form_exports = {};
__export(form_exports, {
  default: () => form_default
});
module.exports = __toCommonJS(form_exports);
var import_clsx = __toESM(require("clsx"));
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_compose = require("@wordpress/compose");
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
var import_jsx_runtime = require("react/jsx-runtime");
var CommentsFormPlaceholder = () => {
  const instanceId = (0, import_compose.useInstanceId)(CommentsFormPlaceholder);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "comment-respond", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "comment-reply-title", children: (0, import_i18n.__)("Leave a Reply") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "form",
      {
        noValidate: true,
        className: "comment-form",
        onSubmit: (event) => event.preventDefault(),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { htmlFor: `comment-${instanceId}`, children: (0, import_i18n.__)("Comment") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "textarea",
              {
                id: `comment-${instanceId}`,
                name: "comment",
                cols: "45",
                rows: "8",
                readOnly: true
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "form-submit wp-block-button", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              name: "submit",
              type: "submit",
              className: (0, import_clsx.default)(
                "wp-block-button__link",
                (0, import_block_editor.__experimentalGetElementClassName)("button")
              ),
              label: (0, import_i18n.__)("Post Comment"),
              value: (0, import_i18n.__)("Post Comment"),
              "aria-disabled": "true"
            }
          ) })
        ]
      }
    )
  ] });
};
var CommentsForm = ({ postId, postType }) => {
  const [commentStatus, setCommentStatus] = (0, import_core_data.useEntityProp)(
    "postType",
    postType,
    "comment_status",
    postId
  );
  const isSiteEditor = postType === void 0 || postId === void 0;
  const defaultCommentStatus = (0, import_data.useSelect)(
    (select) => select(import_block_editor.store).getSettings().__experimentalDiscussionSettings?.defaultCommentStatus,
    []
  );
  const postTypeSupportsComments = (0, import_data.useSelect)(
    (select) => postType ? !!select(import_core_data.store).getPostType(postType)?.supports.comments : false
  );
  if (!isSiteEditor && "open" !== commentStatus) {
    if ("closed" === commentStatus) {
      const actions = [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.Button,
          {
            __next40pxDefaultSize: true,
            onClick: () => setCommentStatus("open"),
            variant: "primary",
            children: (0, import_i18n._x)(
              "Enable comments",
              "action that affects the current post"
            )
          },
          "enableComments"
        )
      ];
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.Warning, { actions, children: (0, import_i18n.__)(
        "Post Comments Form block: Comments are not enabled for this item."
      ) });
    } else if (!postTypeSupportsComments) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.Warning, { children: (0, import_i18n.sprintf)(
        /* translators: %s: Post type (i.e. "post", "page") */
        (0, import_i18n.__)(
          "Post Comments Form block: Comments are not enabled for this post type (%s)."
        ),
        postType
      ) });
    } else if ("open" !== defaultCommentStatus) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.Warning, { children: (0, import_i18n.__)(
        "Post Comments Form block: Comments are not enabled."
      ) });
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentsFormPlaceholder, {});
};
var form_default = CommentsForm;
//# sourceMappingURL=form.cjs.map
