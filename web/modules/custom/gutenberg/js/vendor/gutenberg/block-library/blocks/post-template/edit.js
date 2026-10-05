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

// packages/block-library/src/post-template/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => PostTemplateEdit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_element = require("@wordpress/element");
var import_data = require("@wordpress/data");
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_core_data = require("@wordpress/core-data");
var import_icons = require("@wordpress/icons");
var import_jsx_runtime = require("react/jsx-runtime");
var INNER_BLOCKS_LAYOUT = { type: "default" };
function PostTemplateInnerBlocks({ classList }) {
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(
    { className: (0, import_clsx.default)("wp-block-post", classList) },
    {
      __unstableDisableLayoutClassNames: true,
      layout: INNER_BLOCKS_LAYOUT
    }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { ...innerBlocksProps });
}
function PostTemplateBlockPreview({
  blocks,
  blockContextId,
  classList,
  isHidden,
  setActiveBlockContextId
}) {
  const blockPreviewProps = (0, import_block_editor.__experimentalUseBlockPreview)({
    blocks,
    props: {
      className: (0, import_clsx.default)("wp-block-post", classList)
    }
  });
  const handleOnClick = () => {
    setActiveBlockContextId(blockContextId);
  };
  const style = {
    display: isHidden ? "none" : void 0
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "li",
    {
      ...blockPreviewProps,
      tabIndex: 0,
      role: "button",
      onClick: handleOnClick,
      onKeyPress: handleOnClick,
      style
    }
  );
}
var MemoizedPostTemplateBlockPreview = (0, import_element.memo)(PostTemplateBlockPreview);
function PostTemplateEdit({
  setAttributes,
  clientId,
  context: {
    query: {
      perPage,
      offset = 0,
      // Match `build_query_vars_from_query_block()`, which queries posts when
      // `query` has no post type.
      postType = "post",
      order,
      orderBy,
      author,
      search,
      exclude,
      sticky,
      inherit,
      taxQuery,
      parents,
      pages,
      format,
      excludeCurrent,
      // We gather extra query args to pass to the REST API call.
      // This way extenders of Query Loop can add their own query args,
      // and have accurate previews in the editor.
      // Noting though that these args should either be supported by the
      // REST API or be handled by custom REST filters like `rest_{$this->post_type}_query`.
      ...restQueryArgs
    } = {},
    templateSlug,
    previewPostType,
    postId
  },
  attributes: { layout },
  __unstableLayoutClassNames
}) {
  const {
    type: layoutType,
    columnCount = 3,
    minimumColumnWidth
  } = layout || {};
  const [activeBlockContextId, setActiveBlockContextId] = (0, import_element.useState)();
  const { posts, blocks } = (0, import_data.useSelect)(
    (select) => {
      const { getEntityRecords, getTaxonomies } = select(import_core_data.store);
      const { getBlocks } = select(import_block_editor.store);
      const templateCategory = inherit && templateSlug?.startsWith("category-") && getEntityRecords("taxonomy", "category", {
        context: "view",
        per_page: 1,
        _fields: ["id"],
        slug: templateSlug.replace("category-", "")
      });
      const templateTag = inherit && templateSlug?.startsWith("tag-") && getEntityRecords("taxonomy", "post_tag", {
        context: "view",
        per_page: 1,
        _fields: ["id"],
        slug: templateSlug.replace("tag-", "")
      });
      const query = {
        offset: offset || 0,
        order,
        orderby: orderBy
      };
      if (taxQuery && !inherit) {
        const taxonomies = getTaxonomies({
          type: postType,
          per_page: -1,
          context: "view"
        });
        const buildTaxQuery = (terms, suffix = "") => {
          return Object.entries(terms || {}).reduce(
            (accumulator, [taxonomySlug, termIds]) => {
              const taxonomy = taxonomies?.find(
                ({ slug }) => slug === taxonomySlug
              );
              if (taxonomy?.rest_base && termIds?.length) {
                accumulator[taxonomy.rest_base + suffix] = termIds;
              }
              return accumulator;
            },
            {}
          );
        };
        const builtTaxQuery = buildTaxQuery(taxQuery.include);
        if (taxQuery.exclude) {
          Object.assign(
            builtTaxQuery,
            buildTaxQuery(taxQuery.exclude, "_exclude")
          );
        }
        if (!!Object.keys(builtTaxQuery).length) {
          Object.assign(query, builtTaxQuery);
        }
      }
      if (perPage) {
        query.per_page = perPage;
      }
      if (author) {
        query.author = author;
      }
      if (search) {
        query.search = search;
      }
      if (exclude?.length) {
        query.exclude = exclude;
      }
      if (parents?.length) {
        query.parent = parents;
      }
      if (format?.length) {
        query.format = format;
      }
      if (excludeCurrent && postId) {
        if (query.exclude) {
          query.exclude = [...query.exclude, postId];
        } else {
          query.exclude = [postId];
        }
      }
      if (["exclude", "only"].includes(sticky)) {
        query.sticky = sticky === "only";
      }
      if (["", "ignore"].includes(sticky)) {
        delete query.sticky;
        query.ignore_sticky = sticky === "ignore";
      }
      let currentPostType = postType;
      if (inherit) {
        if (templateSlug?.startsWith("archive-")) {
          query.postType = templateSlug.replace("archive-", "");
          currentPostType = query.postType;
        } else if (templateCategory) {
          query.categories = templateCategory[0]?.id;
        } else if (templateTag) {
          query.tags = templateTag[0]?.id;
        } else if (templateSlug?.startsWith("taxonomy-post_format")) {
          query.format = templateSlug.replace(
            "taxonomy-post_format-post-format-",
            ""
          );
        }
      }
      const usedPostType = previewPostType || currentPostType;
      return {
        posts: getEntityRecords("postType", usedPostType, {
          ...query,
          ...restQueryArgs
        }),
        blocks: getBlocks(clientId)
      };
    },
    [
      perPage,
      offset,
      order,
      orderBy,
      clientId,
      author,
      search,
      postType,
      exclude,
      sticky,
      inherit,
      templateSlug,
      taxQuery,
      parents,
      format,
      restQueryArgs,
      previewPostType
    ]
  );
  const blockContexts = (0, import_element.useMemo)(
    () => posts?.map((post) => ({
      postType: post.type,
      postId: post.id,
      classList: post.class_list ?? ""
    })),
    [posts]
  );
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: (0, import_clsx.default)(__unstableLayoutClassNames, {
      [`columns-${columnCount}`]: layoutType === "grid" && columnCount,
      // Ensure column count is flagged via classname for backwards compatibility.
      "has-native-responsive-grid": layoutType === "grid" && columnCount && minimumColumnWidth
      // Flag native responsive grid when minimum column width is provided.
    })
  });
  if (!posts) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {}) });
  }
  if (!posts.length) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { ...blockProps, children: [
      " ",
      (0, import_i18n.__)("No results found.")
    ] });
  }
  const setDisplayLayout = (newDisplayLayout) => setAttributes({
    layout: { ...layout, ...newDisplayLayout }
  });
  const displayLayoutControls = [
    {
      icon: import_icons.list,
      title: (0, import_i18n._x)("List view", "Post template block display setting"),
      onClick: () => setDisplayLayout({ type: "default" }),
      isActive: layoutType === "default" || layoutType === "constrained"
    },
    {
      icon: import_icons.grid,
      title: (0, import_i18n._x)("Grid view", "Post template block display setting"),
      onClick: () => setDisplayLayout({
        type: "grid",
        columnCount
      }),
      isActive: layoutType === "grid"
    }
  ];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { controls: displayLayoutControls }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { ...blockProps, children: blockContexts && blockContexts.map((blockContext) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_block_editor.BlockContextProvider,
      {
        value: blockContext,
        children: [
          blockContext.postId === (activeBlockContextId || blockContexts[0]?.postId) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            PostTemplateInnerBlocks,
            {
              classList: blockContext.classList
            }
          ) : null,
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            MemoizedPostTemplateBlockPreview,
            {
              blocks,
              blockContextId: blockContext.postId,
              classList: blockContext.classList,
              setActiveBlockContextId,
              isHidden: blockContext.postId === (activeBlockContextId || blockContexts[0]?.postId)
            }
          )
        ]
      },
      blockContext.postId
    )) })
  ] });
}
//# sourceMappingURL=edit.cjs.map
