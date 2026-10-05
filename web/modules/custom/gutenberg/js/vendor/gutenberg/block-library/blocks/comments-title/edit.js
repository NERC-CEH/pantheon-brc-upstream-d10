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

// packages/block-library/src/comments-title/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => Edit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_i18n = require("@wordpress/i18n");
var import_core_data = require("@wordpress/core-data");
var import_components = require("@wordpress/components");
var import_element = require("@wordpress/element");
var import_data = require("@wordpress/data");
var import_api_fetch = __toESM(require("@wordpress/api-fetch"));
var import_url = require("@wordpress/url");
var import_hooks = require("../utils/hooks.cjs");
var import_deprecated_text_align_attributes = __toESM(require("../utils/deprecated-text-align-attributes.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function Edit(props) {
  (0, import_deprecated_text_align_attributes.default)(props);
  const { attributes, setAttributes, context } = props;
  const {
    showPostTitle,
    showCommentsCount,
    level = 2,
    levelOptions
  } = attributes;
  const { postId, postType } = context;
  const TagName = "h" + level;
  const [commentsCount, setCommentsCount] = (0, import_element.useState)();
  const [rawTitle] = (0, import_core_data.useEntityProp)("postType", postType, "title", postId);
  const isSiteEditor = typeof postId === "undefined";
  const blockProps = (0, import_block_editor.useBlockProps)();
  const {
    threadCommentsDepth,
    threadComments,
    commentsPerPage,
    pageComments
  } = (0, import_data.useSelect)((select) => {
    const { getSettings } = select(import_block_editor.store);
    return getSettings().__experimentalDiscussionSettings ?? {};
  }, []);
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  (0, import_element.useEffect)(() => {
    if (isSiteEditor) {
      const nestedCommentsNumber = threadComments ? Math.min(threadCommentsDepth, 3) - 1 : 0;
      const topLevelCommentsNumber = pageComments ? commentsPerPage : 3;
      const commentsNumber = parseInt(nestedCommentsNumber) + parseInt(topLevelCommentsNumber);
      setCommentsCount(Math.min(commentsNumber, 3));
      return;
    }
    const currentPostId = postId;
    (0, import_api_fetch.default)({
      path: (0, import_url.addQueryArgs)("/wp/v2/comments", {
        post: postId,
        _fields: "id"
      }),
      method: "HEAD",
      parse: false
    }).then((res) => {
      if (currentPostId === postId) {
        setCommentsCount(
          parseInt(res.headers.get("X-WP-Total"))
        );
      }
    }).catch(() => {
      setCommentsCount(0);
    });
  }, [postId]);
  const blockControls = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.HeadingLevelDropdown,
    {
      value: level,
      options: levelOptions,
      onChange: (newLevel) => setAttributes({ level: newLevel })
    }
  ) });
  const inspectorControls = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_components.__experimentalToolsPanel,
    {
      label: (0, import_i18n.__)("Settings"),
      resetAll: () => {
        setAttributes({
          showPostTitle: true,
          showCommentsCount: true
        });
      },
      dropdownMenuProps,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Show post title"),
            isShownByDefault: true,
            hasValue: () => !showPostTitle,
            onDeselect: () => setAttributes({ showPostTitle: true }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Show post title"),
                checked: showPostTitle,
                onChange: (value) => setAttributes({ showPostTitle: value })
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Show comments count"),
            isShownByDefault: true,
            hasValue: () => !showCommentsCount,
            onDeselect: () => setAttributes({ showCommentsCount: true }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Show comments count"),
                checked: showCommentsCount,
                onChange: (value) => setAttributes({ showCommentsCount: value })
              }
            )
          }
        )
      ]
    }
  ) });
  const postTitle = isSiteEditor ? (0, import_i18n.__)("Post Title") : rawTitle;
  let placeholder;
  if (showCommentsCount && commentsCount !== void 0) {
    if (showPostTitle) {
      if (commentsCount === 1) {
        placeholder = (0, import_i18n.sprintf)(
          /* translators: %s: Post title. */
          (0, import_i18n.__)('One response to "%s"'),
          postTitle
        );
      } else {
        placeholder = (0, import_i18n.sprintf)(
          /* translators: 1: Number of comments, 2: Post title. */
          (0, import_i18n._n)(
            '%1$s response to "%2$s"',
            '%1$s responses to "%2$s"',
            commentsCount
          ),
          commentsCount,
          postTitle
        );
      }
    } else if (commentsCount === 1) {
      placeholder = (0, import_i18n.__)("One response");
    } else {
      placeholder = (0, import_i18n.sprintf)(
        /* translators: %s: Number of comments. */
        (0, import_i18n._n)("%s response", "%s responses", commentsCount),
        commentsCount
      );
    }
  } else if (showPostTitle) {
    if (commentsCount === 1) {
      placeholder = (0, import_i18n.sprintf)((0, import_i18n.__)('Response to "%s"'), postTitle);
    } else {
      placeholder = (0, import_i18n.sprintf)((0, import_i18n.__)('Responses to "%s"'), postTitle);
    }
  } else if (commentsCount === 1) {
    placeholder = (0, import_i18n.__)("Response");
  } else {
    placeholder = (0, import_i18n.__)("Responses");
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    blockControls,
    inspectorControls,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: placeholder })
  ] });
}
//# sourceMappingURL=edit.cjs.map
