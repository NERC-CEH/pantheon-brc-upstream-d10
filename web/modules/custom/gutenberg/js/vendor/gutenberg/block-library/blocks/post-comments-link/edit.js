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

// packages/block-library/src/post-comments-link/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_element = require("@wordpress/element");
var import_data = require("@wordpress/data");
var import_api_fetch = __toESM(require("@wordpress/api-fetch"));
var import_url = require("@wordpress/url");
var import_i18n = require("@wordpress/i18n");
var import_core_data = require("@wordpress/core-data");
var import_jsx_runtime = require("react/jsx-runtime");
function PostCommentsLinkEdit({ context }) {
  const { postType, postId } = context;
  const [commentsCount, setCommentsCount] = (0, import_element.useState)();
  const blockProps = (0, import_block_editor.useBlockProps)();
  (0, import_element.useEffect)(() => {
    if (!postId) {
      return;
    }
    const currentPostId = postId;
    (0, import_api_fetch.default)({
      path: (0, import_url.addQueryArgs)("/wp/v2/comments", {
        post: postId
      }),
      parse: false
    }).then((res) => {
      if (currentPostId === postId) {
        setCommentsCount(res.headers.get("X-WP-Total"));
      }
    });
  }, [postId]);
  const post = (0, import_data.useSelect)(
    (select) => select(import_core_data.store).getEditedEntityRecord(
      "postType",
      postType,
      postId
    ),
    [postType, postId]
  );
  let commentsText;
  if (commentsCount !== void 0) {
    const commentsNumber = parseInt(commentsCount);
    if (commentsNumber === 0) {
      commentsText = (0, import_i18n.__)("No comments");
    } else {
      commentsText = (0, import_i18n.sprintf)(
        /* translators: %s: Number of comments */
        (0, import_i18n._n)("%s comment", "%s comments", commentsNumber),
        commentsNumber.toLocaleString()
      );
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: post?.link && commentsText !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "a",
    {
      href: post?.link + "#comments",
      onClick: (event) => event.preventDefault(),
      children: commentsText
    }
  ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "a",
    {
      href: "#post-comments-link-pseudo-link",
      onClick: (event) => event.preventDefault(),
      children: (0, import_i18n.__)("No comments")
    }
  ) });
}
var edit_default = PostCommentsLinkEdit;
//# sourceMappingURL=edit.cjs.map
