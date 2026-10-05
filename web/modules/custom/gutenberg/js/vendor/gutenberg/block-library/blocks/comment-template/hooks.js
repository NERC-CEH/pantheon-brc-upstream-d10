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

// packages/block-library/src/comment-template/hooks.js
var hooks_exports = {};
__export(hooks_exports, {
  useCommentQueryArgs: () => useCommentQueryArgs,
  useCommentTree: () => useCommentTree
});
module.exports = __toCommonJS(hooks_exports);
var import_element = require("@wordpress/element");
var import_data = require("@wordpress/data");
var import_block_editor = require("@wordpress/block-editor");
var import_url = require("@wordpress/url");
var import_api_fetch = __toESM(require("@wordpress/api-fetch"));
var MAX_COMMENTS_PER_PAGE = 100;
var useCommentQueryArgs = ({ postId }) => {
  const queryArgs = {
    status: "approve",
    order: "asc",
    context: "embed",
    parent: 0,
    _embed: "children"
  };
  const {
    pageComments,
    commentsPerPage,
    defaultCommentsPage: defaultPage
  } = (0, import_data.useSelect)((select) => {
    const { getSettings } = select(import_block_editor.store);
    const { __experimentalDiscussionSettings } = getSettings();
    return __experimentalDiscussionSettings ?? {};
  }, []);
  const perPage = pageComments ? Math.min(commentsPerPage, MAX_COMMENTS_PER_PAGE) : MAX_COMMENTS_PER_PAGE;
  const page = useDefaultPageIndex({
    defaultPage,
    postId,
    perPage,
    queryArgs
  });
  return (0, import_element.useMemo)(() => {
    return page ? {
      ...queryArgs,
      post: postId,
      per_page: perPage,
      page
    } : null;
  }, [postId, perPage, page]);
};
var useDefaultPageIndex = ({ defaultPage, postId, perPage, queryArgs }) => {
  const [defaultPages, setDefaultPages] = (0, import_element.useState)({});
  const key = `${postId}_${perPage}`;
  const page = defaultPages[key] || 0;
  (0, import_element.useEffect)(() => {
    if (page || defaultPage !== "newest") {
      return;
    }
    (0, import_api_fetch.default)({
      path: (0, import_url.addQueryArgs)("/wp/v2/comments", {
        ...queryArgs,
        post: postId,
        per_page: perPage,
        _fields: "id"
      }),
      method: "HEAD",
      parse: false
    }).then((res) => {
      const pages = parseInt(res.headers.get("X-WP-TotalPages"));
      setDefaultPages({
        ...defaultPages,
        [key]: pages <= 1 ? 1 : pages
        // If there are 0 pages, it means that there are no comments, but there is no 0th page.
      });
    }).catch(() => {
      setDefaultPages({
        ...defaultPages,
        [key]: 1
      });
    });
  }, [defaultPage, postId, perPage, setDefaultPages]);
  return defaultPage === "newest" ? page : 1;
};
var useCommentTree = (topLevelComments) => {
  const commentTree = (0, import_element.useMemo)(
    () => topLevelComments?.map(({ id, _embedded }) => {
      const [children] = _embedded?.children || [[]];
      return {
        commentId: id,
        children: children.map((child) => ({
          commentId: child.id
        }))
      };
    }),
    [topLevelComments]
  );
  return commentTree;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useCommentQueryArgs,
  useCommentTree
});
//# sourceMappingURL=hooks.cjs.map
