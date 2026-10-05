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

// packages/block-library/src/post-author/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_compose = require("@wordpress/compose");
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_html_entities = require("@wordpress/html-entities");
var import_i18n = require("@wordpress/i18n");
var import_blocks = require("@wordpress/blocks");
var import_utils = require("./utils.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var { InspectorControlsLastItem } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
var AUTHORS_QUERY = {
  who: "authors",
  per_page: 100,
  _fields: "id,name",
  context: "view"
};
function AuthorCombobox({ value, onChange }) {
  const [filterValue, setFilterValue] = (0, import_element.useState)("");
  const { authors, isLoading } = (0, import_data.useSelect)(
    (select) => {
      const { getUsers, isResolving } = select(import_core_data.store);
      const query = { ...AUTHORS_QUERY };
      if (filterValue) {
        query.search = filterValue;
        query.search_columns = ["name"];
      }
      return {
        authors: getUsers(query),
        isLoading: isResolving("getUsers", [query])
      };
    },
    [filterValue]
  );
  const authorOptions = (0, import_element.useMemo)(() => {
    const fetchedAuthors = (authors ?? []).map((author) => {
      return {
        value: author.id,
        label: (0, import_html_entities.decodeEntities)(author.name)
      };
    });
    const foundAuthor = fetchedAuthors.findIndex(
      (fetchedAuthor) => value?.id === fetchedAuthor.value
    );
    let currentAuthor = [];
    if (foundAuthor < 0 && value) {
      currentAuthor = [
        {
          value: value.id,
          label: (0, import_html_entities.decodeEntities)(value.name)
        }
      ];
    } else if (foundAuthor < 0 && !value) {
      currentAuthor = [
        {
          value: 0,
          label: (0, import_i18n.__)("(No author)")
        }
      ];
    }
    return [...currentAuthor, ...fetchedAuthors];
  }, [authors, value]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.ComboboxControl,
    {
      label: (0, import_i18n.__)("Author"),
      options: authorOptions,
      value: value?.id,
      onFilterValueChange: (0, import_compose.debounce)(setFilterValue, 300),
      onChange,
      allowReset: false,
      isLoading
    }
  );
}
function PostAuthorEdit({
  isSelected,
  context: { postType, postId, queryId },
  attributes,
  setAttributes,
  clientId
}) {
  const isDescendentOfQueryLoop = Number.isFinite(queryId);
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const defaultAvatar = (0, import_hooks.useDefaultAvatar)();
  const { authorDetails, canAssignAuthor, supportsAuthor } = (0, import_data.useSelect)(
    (select) => {
      const { getEditedEntityRecord, getUser, getPostType } = select(import_core_data.store);
      const currentPost = getEditedEntityRecord(
        "postType",
        postType,
        postId
      );
      const authorId = currentPost?.author;
      return {
        authorDetails: authorId ? getUser(authorId, { context: "view" }) : null,
        supportsAuthor: getPostType(postType)?.supports?.author ?? false,
        canAssignAuthor: currentPost?._links?.["wp:action-assign-author"] ? true : false
      };
    },
    [postType, postId]
  );
  const blockTypes = (0, import_data.useSelect)(
    (select) => select(import_blocks.store).getBlockTypes(),
    []
  );
  const { editEntityRecord } = (0, import_data.useDispatch)(import_core_data.store);
  const { replaceBlock } = (0, import_data.useDispatch)(import_block_editor.store);
  const {
    textAlign,
    showAvatar,
    showBio,
    byline,
    isLink,
    linkTarget,
    avatarSize
  } = attributes;
  const avatarSizes = [];
  const authorName = authorDetails?.name || (0, import_i18n.__)("Post Author");
  if (authorDetails?.avatar_urls) {
    Object.keys(authorDetails.avatar_urls).forEach((size) => {
      avatarSizes.push({
        value: size,
        label: `${size} x ${size}`
      });
    });
  }
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: (0, import_clsx.default)({
      [`has-text-align-${textAlign}`]: textAlign
    })
  });
  const handleSelect = (nextAuthorId) => {
    editEntityRecord("postType", postType, postId, {
      author: nextAuthorId
    });
  };
  const showAuthorControl = !!postId && !isDescendentOfQueryLoop && canAssignAuthor;
  if (!supportsAuthor && postType !== void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: (0, import_i18n.sprintf)(
      // translators: %s: Name of the post type e.g: "post".
      (0, import_i18n.__)("This post type (%s) does not support the author."),
      postType
    ) });
  }
  function transformBlock() {
    replaceBlock(
      clientId,
      (0, import_utils.recreateWithRecommendedBlocks)(attributes, blockTypes)
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            avatarSize: 48,
            showAvatar: true,
            isLink: false,
            linkTarget: "_self"
          });
        },
        dropdownMenuProps,
        children: [
          showAuthorControl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { gridColumn: "1 / -1" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            AuthorCombobox,
            {
              value: authorDetails,
              onChange: handleSelect
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Show avatar"),
              isShownByDefault: true,
              hasValue: () => !showAvatar,
              onDeselect: () => setAttributes({ showAvatar: true }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show avatar"),
                  checked: showAvatar,
                  onChange: () => setAttributes({
                    showAvatar: !showAvatar
                  })
                }
              )
            }
          ),
          showAvatar && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Avatar size"),
              isShownByDefault: true,
              hasValue: () => avatarSize !== 48,
              onDeselect: () => setAttributes({ avatarSize: 48 }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.SelectControl,
                {
                  label: (0, import_i18n.__)("Avatar size"),
                  value: avatarSize,
                  options: avatarSizes,
                  onChange: (size) => {
                    setAttributes({
                      avatarSize: Number(size)
                    });
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Show bio"),
              isShownByDefault: true,
              hasValue: () => !!showBio,
              onDeselect: () => setAttributes({ showBio: void 0 }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show bio"),
                  checked: !!showBio,
                  onChange: () => setAttributes({ showBio: !showBio })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Link author name to author page"),
              isShownByDefault: true,
              hasValue: () => !!isLink,
              onDeselect: () => setAttributes({ isLink: false }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Link author name to author page"),
                  checked: isLink,
                  onChange: () => setAttributes({ isLink: !isLink })
                }
              )
            }
          ),
          isLink && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Link target"),
              isShownByDefault: true,
              hasValue: () => linkTarget !== "_self",
              onDeselect: () => setAttributes({ linkTarget: "_self" }),
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
    ) }),
    blockTypes.some(
      (blockType) => blockType.name === "core/group"
    ) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlsLastItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalVStack,
      {
        className: "wp-block-post-author__transform",
        alignment: "left",
        spacing: 4,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalText, { as: "p", children: (0, import_i18n.__)(
            "This block is no longer supported. Recreate its design with the Avatar, Author Name and Author Biography blocks."
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.Button,
            {
              variant: "primary",
              onClick: transformBlock,
              __next40pxDefaultSize: true,
              children: (0, import_i18n.__)("Recreate")
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.AlignmentControl,
      {
        value: textAlign,
        onChange: (nextAlign) => {
          setAttributes({ textAlign: nextAlign });
        }
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
      showAvatar && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-post-author__avatar", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          width: avatarSize,
          src: authorDetails?.avatar_urls?.[avatarSize] || defaultAvatar,
          alt: authorDetails?.name || (0, import_i18n.__)("Default Avatar")
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wp-block-post-author__content", children: [
        (!import_block_editor.RichText.isEmpty(byline) || isSelected) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_block_editor.RichText,
          {
            identifier: "byline",
            className: "wp-block-post-author__byline",
            "aria-label": (0, import_i18n.__)("Post author byline text"),
            placeholder: (0, import_i18n.__)("Write byline…"),
            value: byline,
            onChange: (value) => setAttributes({ byline: value })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "wp-block-post-author__name", children: isLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "a",
          {
            href: "#post-author-pseudo-link",
            onClick: (event) => event.preventDefault(),
            children: authorName
          }
        ) : authorName }),
        showBio && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "p",
          {
            className: "wp-block-post-author__bio",
            dangerouslySetInnerHTML: {
              __html: authorDetails?.description
            }
          }
        )
      ] })
    ] })
  ] });
}
var edit_default = PostAuthorEdit;
//# sourceMappingURL=edit.cjs.map
