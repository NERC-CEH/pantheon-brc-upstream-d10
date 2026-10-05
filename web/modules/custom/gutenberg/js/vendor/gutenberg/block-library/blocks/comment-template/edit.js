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

// packages/block-library/src/comment-template/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => CommentTemplateEdit
});
module.exports = __toCommonJS(edit_exports);
var import_element = require("@wordpress/element");
var import_data = require("@wordpress/data");
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_core_data = require("@wordpress/core-data");
var import_hooks = require("./hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var getCommentsPlaceholder = ({
  perPage,
  pageComments,
  threadComments,
  threadCommentsDepth
}) => {
  const commentsDepth = !threadComments ? 1 : Math.min(threadCommentsDepth, 3);
  const buildChildrenComment = (commentsLevel) => {
    if (commentsLevel < commentsDepth) {
      const nextLevel = commentsLevel + 1;
      return [
        {
          commentId: -(commentsLevel + 3),
          children: buildChildrenComment(nextLevel)
        }
      ];
    }
    return [];
  };
  const placeholderComments = [
    { commentId: -1, children: buildChildrenComment(1) }
  ];
  if ((!pageComments || perPage >= 2) && commentsDepth < 3) {
    placeholderComments.push({
      commentId: -2,
      children: []
    });
  }
  if ((!pageComments || perPage >= 3) && commentsDepth < 2) {
    placeholderComments.push({
      commentId: -3,
      children: []
    });
  }
  return placeholderComments;
};
function CommentTemplateInnerBlocks({
  comment,
  activeCommentId,
  setActiveCommentId,
  firstCommentId,
  blocks
}) {
  const { children, ...innerBlocksProps } = (0, import_block_editor.useInnerBlocksProps)({});
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { ...innerBlocksProps, children: [
    comment.commentId === (activeCommentId || firstCommentId) ? children : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      MemoizedCommentTemplatePreview,
      {
        blocks,
        commentId: comment.commentId,
        setActiveCommentId,
        isHidden: comment.commentId === (activeCommentId || firstCommentId)
      }
    ),
    comment?.children?.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      CommentsList,
      {
        comments: comment.children,
        activeCommentId,
        setActiveCommentId,
        blocks,
        firstCommentId
      }
    ) : null
  ] });
}
var CommentTemplatePreview = ({
  blocks,
  commentId,
  setActiveCommentId,
  isHidden
}) => {
  const blockPreviewProps = (0, import_block_editor.__experimentalUseBlockPreview)({
    blocks
  });
  const handleOnClick = () => {
    setActiveCommentId(commentId);
  };
  const style = {
    display: isHidden ? "none" : void 0
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      ...blockPreviewProps,
      tabIndex: 0,
      role: "button",
      style,
      onClick: handleOnClick,
      onKeyPress: handleOnClick
    }
  );
};
var MemoizedCommentTemplatePreview = (0, import_element.memo)(CommentTemplatePreview);
var CommentsList = ({
  comments,
  blockProps,
  activeCommentId,
  setActiveCommentId,
  blocks,
  firstCommentId
}) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", { ...blockProps, children: comments && comments.map(({ commentId, ...comment }, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
  import_block_editor.BlockContextProvider,
  {
    value: {
      // If the commentId is negative it means that this comment is a
      // "placeholder" and that the block is most likely being used in the
      // site editor. In this case, we have to set the commentId to `null`
      // because otherwise the (non-existent) comment with a negative ID
      // would be requested from the REST API.
      commentId: commentId < 0 ? null : commentId
    },
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      CommentTemplateInnerBlocks,
      {
        comment: { commentId, ...comment },
        activeCommentId,
        setActiveCommentId,
        blocks,
        firstCommentId
      }
    )
  },
  comment.commentId || index
)) });
function CommentTemplateEdit({
  clientId,
  context: { postId }
}) {
  const blockProps = (0, import_block_editor.useBlockProps)();
  const [activeCommentId, setActiveCommentId] = (0, import_element.useState)();
  const {
    commentOrder,
    threadCommentsDepth,
    threadComments,
    commentsPerPage,
    pageComments
  } = (0, import_data.useSelect)((select) => {
    const { getSettings } = select(import_block_editor.store);
    return getSettings().__experimentalDiscussionSettings ?? {};
  }, []);
  const commentQuery = (0, import_hooks.useCommentQueryArgs)({
    postId
  });
  const { topLevelComments, blocks } = (0, import_data.useSelect)(
    (select) => {
      const { getEntityRecords } = select(import_core_data.store);
      const { getBlocks } = select(import_block_editor.store);
      return {
        // Request only top-level comments. Replies are embedded.
        topLevelComments: commentQuery ? getEntityRecords("root", "comment", commentQuery) : null,
        blocks: getBlocks(clientId)
      };
    },
    [clientId, commentQuery]
  );
  let commentTree = (0, import_hooks.useCommentTree)(
    // Reverse the order of top comments if needed.
    commentOrder === "desc" && topLevelComments ? [...topLevelComments].reverse() : topLevelComments
  );
  if (!topLevelComments) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {}) });
  }
  if (!postId) {
    commentTree = getCommentsPlaceholder({
      perPage: commentsPerPage,
      pageComments,
      threadComments,
      threadCommentsDepth
    });
  }
  if (!commentTree.length) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { ...blockProps, children: (0, import_i18n.__)("No results found.") });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    CommentsList,
    {
      comments: commentTree,
      blockProps,
      blocks,
      activeCommentId,
      setActiveCommentId,
      firstCommentId: commentTree[0]?.commentId
    }
  );
}
//# sourceMappingURL=edit.cjs.map
