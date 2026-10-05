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

// packages/block-library/src/avatar/hooks.js
var hooks_exports = {};
__export(hooks_exports, {
  useCommentAvatar: () => useCommentAvatar,
  useUserAvatar: () => useUserAvatar
});
module.exports = __toCommonJS(hooks_exports);
var import_core_data = require("@wordpress/core-data");
var import_i18n = require("@wordpress/i18n");
var import_data = require("@wordpress/data");
var import_hooks = require("../utils/hooks.cjs");
function getAvatarSizes(sizes) {
  const minSize = sizes ? sizes[0] : 24;
  const maxSize = sizes ? sizes[sizes.length - 1] : 96;
  const maxSizeBuffer = Math.floor(maxSize * 2.5);
  return {
    minSize,
    maxSize: maxSizeBuffer
  };
}
function useCommentAvatar({ commentId }) {
  const [avatars] = (0, import_core_data.useEntityProp)(
    "root",
    "comment",
    "author_avatar_urls",
    commentId
  );
  const [authorName] = (0, import_core_data.useEntityProp)(
    "root",
    "comment",
    "author_name",
    commentId
  );
  const avatarUrls = avatars ? Object.values(avatars) : null;
  const sizes = avatars ? Object.keys(avatars) : null;
  const { minSize, maxSize } = getAvatarSizes(sizes);
  const defaultAvatar = (0, import_hooks.useDefaultAvatar)();
  return {
    src: avatarUrls ? avatarUrls[avatarUrls.length - 1] : defaultAvatar,
    minSize,
    maxSize,
    alt: authorName ? (
      // translators: %s: Author name.
      (0, import_i18n.sprintf)((0, import_i18n.__)("%s Avatar"), authorName)
    ) : (0, import_i18n.__)("Default Avatar")
  };
}
function useUserAvatar({ userId, postId, postType }) {
  const { authorDetails } = (0, import_data.useSelect)(
    (select) => {
      const { getEditedEntityRecord, getUser } = select(import_core_data.store);
      if (userId) {
        return {
          authorDetails: getUser(userId)
        };
      }
      const _authorId = getEditedEntityRecord(
        "postType",
        postType,
        postId
      )?.author;
      return {
        authorDetails: _authorId ? getUser(_authorId) : null
      };
    },
    [postType, postId, userId]
  );
  const avatarUrls = authorDetails?.avatar_urls ? Object.values(authorDetails.avatar_urls) : null;
  const sizes = authorDetails?.avatar_urls ? Object.keys(authorDetails.avatar_urls) : null;
  const { minSize, maxSize } = getAvatarSizes(sizes);
  const defaultAvatar = (0, import_hooks.useDefaultAvatar)();
  return {
    src: avatarUrls ? avatarUrls[avatarUrls.length - 1] : defaultAvatar,
    minSize,
    maxSize,
    alt: authorDetails ? (
      // translators: %s: Author name.
      (0, import_i18n.sprintf)((0, import_i18n.__)("%s Avatar"), authorDetails?.name)
    ) : (0, import_i18n.__)("Default Avatar")
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useCommentAvatar,
  useUserAvatar
});
//# sourceMappingURL=hooks.cjs.map
