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

// packages/block-library/src/latest-posts/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => LatestPostsEdit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_date = require("@wordpress/date");
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_icons = require("@wordpress/icons");
var import_core_data = require("@wordpress/core-data");
var import_notices = require("@wordpress/notices");
var import_compose = require("@wordpress/compose");
var import_element = require("@wordpress/element");
var import_constants = require("./constants.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var CATEGORIES_LIST_QUERY = {
  per_page: -1,
  _fields: "id,name",
  context: "view"
};
var USERS_LIST_QUERY = {
  per_page: -1,
  has_published_posts: ["post"],
  context: "view"
};
var imageAlignmentOptions = [
  {
    value: "none",
    icon: import_icons.alignNone,
    label: (0, import_i18n.__)("None")
  },
  {
    value: "left",
    icon: import_icons.positionLeft,
    label: (0, import_i18n.__)("Left")
  },
  {
    value: "center",
    icon: import_icons.positionCenter,
    label: (0, import_i18n.__)("Center")
  },
  {
    value: "right",
    icon: import_icons.positionRight,
    label: (0, import_i18n.__)("Right")
  }
];
function getFeaturedImageDetails(post, size) {
  const image = post._embedded?.["wp:featuredmedia"]?.["0"];
  return {
    url: image?.media_details?.sizes?.[size]?.source_url ?? image?.source_url,
    alt: image?.alt_text
  };
}
function getCurrentAuthor(post) {
  return post._embedded?.author?.[0];
}
function Controls({ attributes, setAttributes }) {
  const {
    postsToShow,
    order,
    orderBy,
    categories,
    selectedAuthor,
    displayFeaturedImage,
    displayPostContentRadio,
    displayPostContent,
    displayPostDate,
    displayAuthor,
    excerptLength,
    featuredImageAlign,
    featuredImageSizeSlug,
    featuredImageSizeWidth,
    featuredImageSizeHeight,
    addLinkToFeaturedImage
  } = attributes;
  const {
    imageSizes,
    defaultImageWidth,
    defaultImageHeight,
    categoriesList,
    authorList
  } = (0, import_data.useSelect)(
    (select) => {
      const { getEntityRecords, getUsers } = select(import_core_data.store);
      const settings = select(import_block_editor.store).getSettings();
      return {
        defaultImageWidth: settings.imageDimensions?.[featuredImageSizeSlug]?.width ?? 0,
        defaultImageHeight: settings.imageDimensions?.[featuredImageSizeSlug]?.height ?? 0,
        imageSizes: settings.imageSizes,
        categoriesList: getEntityRecords(
          "taxonomy",
          "category",
          CATEGORIES_LIST_QUERY
        ),
        authorList: getUsers(USERS_LIST_QUERY)
      };
    },
    [featuredImageSizeSlug]
  );
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const imageSizeOptions = imageSizes.filter(({ slug }) => slug !== "full").map(({ name, slug }) => ({
    value: slug,
    label: name
  }));
  const categorySuggestions = categoriesList?.reduce((accumulator, category) => {
    accumulator[category.name] = category;
    return accumulator;
  }, {}) ?? {};
  const selectCategories = (tokens) => {
    const hasNoSuggestion = tokens.some(
      (token) => typeof token === "string" && !categorySuggestions[token]
    );
    if (hasNoSuggestion) {
      return;
    }
    const allCategories = tokens.map((token) => {
      return typeof token === "string" ? categorySuggestions[token] : token;
    });
    if (allCategories.includes(null)) {
      return false;
    }
    setAttributes({ categories: allCategories });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Post content"),
        resetAll: () => setAttributes({
          displayPostContent: false,
          displayPostContentRadio: "excerpt",
          excerptLength: import_constants.DEFAULT_EXCERPT_LENGTH
        }),
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!displayPostContent,
              label: (0, import_i18n.__)("Display post content"),
              onDeselect: () => setAttributes({ displayPostContent: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Display post content"),
                  checked: displayPostContent,
                  onChange: (value) => setAttributes({ displayPostContent: value })
                }
              )
            }
          ),
          displayPostContent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => displayPostContentRadio !== "excerpt",
              label: (0, import_i18n.__)("Content length"),
              onDeselect: () => setAttributes({
                displayPostContentRadio: "excerpt"
              }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.RadioControl,
                {
                  label: (0, import_i18n.__)("Content length"),
                  selected: displayPostContentRadio,
                  options: [
                    { label: (0, import_i18n.__)("Excerpt"), value: "excerpt" },
                    {
                      label: (0, import_i18n.__)("Full post"),
                      value: "full_post"
                    }
                  ],
                  onChange: (value) => setAttributes({
                    displayPostContentRadio: value
                  })
                }
              )
            }
          ),
          displayPostContent && displayPostContentRadio === "excerpt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => excerptLength !== import_constants.DEFAULT_EXCERPT_LENGTH,
              label: (0, import_i18n.__)("Max number of words"),
              onDeselect: () => setAttributes({
                excerptLength: import_constants.DEFAULT_EXCERPT_LENGTH
              }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.RangeControl,
                {
                  label: (0, import_i18n.__)("Max number of words"),
                  value: excerptLength,
                  onChange: (value) => setAttributes({ excerptLength: value }),
                  min: import_constants.MIN_EXCERPT_LENGTH,
                  max: import_constants.MAX_EXCERPT_LENGTH
                }
              )
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Post meta"),
        resetAll: () => setAttributes({
          displayAuthor: false,
          displayPostDate: false
        }),
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!displayAuthor,
              label: (0, import_i18n.__)("Display author name"),
              onDeselect: () => setAttributes({ displayAuthor: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Display author name"),
                  checked: displayAuthor,
                  onChange: (value) => setAttributes({ displayAuthor: value })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!displayPostDate,
              label: (0, import_i18n.__)("Display post date"),
              onDeselect: () => setAttributes({ displayPostDate: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Display post date"),
                  checked: displayPostDate,
                  onChange: (value) => setAttributes({ displayPostDate: value })
                }
              )
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Featured image"),
        resetAll: () => setAttributes({
          displayFeaturedImage: false,
          featuredImageAlign: void 0,
          featuredImageSizeSlug: "thumbnail",
          featuredImageSizeWidth: null,
          featuredImageSizeHeight: null,
          addLinkToFeaturedImage: false
        }),
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!displayFeaturedImage,
              label: (0, import_i18n.__)("Display featured image"),
              onDeselect: () => setAttributes({ displayFeaturedImage: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Display featured image"),
                  checked: displayFeaturedImage,
                  onChange: (value) => setAttributes({ displayFeaturedImage: value })
                }
              )
            }
          ),
          displayFeaturedImage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.__experimentalToolsPanelItem,
              {
                hasValue: () => featuredImageSizeSlug !== "thumbnail" || featuredImageSizeWidth !== null || featuredImageSizeHeight !== null,
                label: (0, import_i18n.__)("Image size"),
                onDeselect: () => setAttributes({
                  featuredImageSizeSlug: "thumbnail",
                  featuredImageSizeWidth: null,
                  featuredImageSizeHeight: null
                }),
                isShownByDefault: true,
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_block_editor.__experimentalImageSizeControl,
                  {
                    onChange: (value) => {
                      const newAttrs = {};
                      if (value.hasOwnProperty("width")) {
                        newAttrs.featuredImageSizeWidth = value.width;
                      }
                      if (value.hasOwnProperty("height")) {
                        newAttrs.featuredImageSizeHeight = value.height;
                      }
                      setAttributes(newAttrs);
                    },
                    slug: featuredImageSizeSlug,
                    width: featuredImageSizeWidth,
                    height: featuredImageSizeHeight,
                    imageWidth: defaultImageWidth,
                    imageHeight: defaultImageHeight,
                    imageSizeOptions,
                    imageSizeHelp: (0, import_i18n.__)(
                      "Select the size of the source image."
                    ),
                    onChangeImage: (value) => setAttributes({
                      featuredImageSizeSlug: value,
                      featuredImageSizeWidth: void 0,
                      featuredImageSizeHeight: void 0
                    })
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.__experimentalToolsPanelItem,
              {
                hasValue: () => !!featuredImageAlign,
                label: (0, import_i18n.__)("Image alignment"),
                onDeselect: () => setAttributes({
                  featuredImageAlign: void 0
                }),
                isShownByDefault: true,
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.__experimentalToggleGroupControl,
                  {
                    className: "editor-latest-posts-image-alignment-control",
                    label: (0, import_i18n.__)("Image alignment"),
                    value: featuredImageAlign || "none",
                    onChange: (value) => setAttributes({
                      featuredImageAlign: value !== "none" ? value : void 0
                    }),
                    children: imageAlignmentOptions.map(
                      ({ value, icon, label }) => {
                        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          import_components.__experimentalToggleGroupControlOptionIcon,
                          {
                            value,
                            icon,
                            label
                          },
                          value
                        );
                      }
                    )
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.__experimentalToolsPanelItem,
              {
                hasValue: () => !!addLinkToFeaturedImage,
                label: (0, import_i18n.__)("Add link to featured image"),
                onDeselect: () => setAttributes({
                  addLinkToFeaturedImage: false
                }),
                isShownByDefault: true,
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.ToggleControl,
                  {
                    label: (0, import_i18n.__)("Add link to featured image"),
                    checked: addLinkToFeaturedImage,
                    onChange: (value) => setAttributes({
                      addLinkToFeaturedImage: value
                    })
                  }
                )
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Sorting and filtering"),
        resetAll: () => setAttributes({
          order: "desc",
          orderBy: "date",
          postsToShow: 5,
          categories: void 0,
          selectedAuthor: void 0
        }),
        dropdownMenuProps,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            hasValue: () => order !== "desc" || orderBy !== "date" || postsToShow !== 5 || categories?.length > 0 || !!selectedAuthor,
            label: (0, import_i18n.__)("Sort and filter"),
            onDeselect: () => setAttributes({
              order: "desc",
              orderBy: "date",
              postsToShow: 5,
              categories: void 0,
              selectedAuthor: void 0
            }),
            isShownByDefault: true,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.QueryControls,
              {
                ...{ order, orderBy },
                numberOfItems: postsToShow,
                onOrderChange: (value) => setAttributes({ order: value }),
                onOrderByChange: (value) => setAttributes({ orderBy: value }),
                onNumberOfItemsChange: (value) => setAttributes({ postsToShow: value }),
                categorySuggestions,
                onCategoryChange: selectCategories,
                selectedCategories: categories,
                onAuthorChange: (value) => setAttributes({
                  selectedAuthor: "" !== value ? Number(value) : void 0
                }),
                authorList: authorList ?? [],
                selectedAuthorId: selectedAuthor
              }
            )
          }
        )
      }
    )
  ] });
}
function LatestPostsEdit({
  attributes,
  setAttributes,
  __unstableLayoutClassNames
}) {
  const instanceId = (0, import_compose.useInstanceId)(LatestPostsEdit);
  const {
    postsToShow,
    order,
    orderBy,
    categories,
    selectedAuthor,
    displayFeaturedImage,
    displayPostContentRadio,
    displayPostContent,
    displayPostDate,
    displayAuthor,
    layout,
    postLayout,
    columns,
    excerptLength,
    featuredImageAlign,
    featuredImageSizeSlug,
    featuredImageSizeWidth,
    featuredImageSizeHeight,
    addLinkToFeaturedImage
  } = attributes;
  const { type: savedLayoutType, minimumColumnWidth } = layout || {};
  const layoutType = savedLayoutType || (postLayout === "grid" ? "grid" : "default");
  const columnCount = layout?.columnCount ?? (!savedLayoutType ? columns : void 0) ?? 3;
  const { latestPosts } = (0, import_data.useSelect)(
    (select) => {
      const { getEntityRecords } = select(import_core_data.store);
      const catIds = categories && categories.length > 0 ? categories.map((cat) => cat.id) : [];
      const latestPostsQuery = Object.fromEntries(
        Object.entries({
          categories: catIds,
          author: selectedAuthor,
          order,
          orderby: orderBy,
          per_page: postsToShow,
          _embed: "author,wp:featuredmedia",
          ignore_sticky: true
        }).filter(([, value]) => typeof value !== "undefined")
      );
      return {
        latestPosts: getEntityRecords(
          "postType",
          "post",
          latestPostsQuery
        )
      };
    },
    [postsToShow, order, orderBy, categories, selectedAuthor]
  );
  const { createWarningNotice } = (0, import_data.useDispatch)(import_notices.store);
  const showRedirectionPreventedNotice = (event) => {
    event.preventDefault();
    createWarningNotice((0, import_i18n.__)("Links are disabled in the editor."), {
      id: `block-library/core/latest-posts/redirection-prevented/${instanceId}`,
      type: "snackbar"
    });
  };
  const hasPosts = !!latestPosts?.length;
  const inspectorControls = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    Controls,
    {
      attributes,
      setAttributes
    }
  ) });
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: (0, import_clsx.default)(__unstableLayoutClassNames, {
      "wp-block-latest-posts__list": true,
      "is-grid": layoutType === "grid",
      "has-dates": displayPostDate,
      "has-author": displayAuthor,
      [`columns-${columnCount}`]: layoutType === "grid" && columnCount,
      "has-native-responsive-grid": layoutType === "grid" && columnCount && minimumColumnWidth
    })
  });
  if (!hasPosts) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
      inspectorControls,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Placeholder, { icon: import_icons.pin, label: (0, import_i18n.__)("Latest Posts"), children: !Array.isArray(latestPosts) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {}) : (0, import_i18n.__)("No posts found.") })
    ] });
  }
  const displayPosts = latestPosts.length > postsToShow ? latestPosts.slice(0, postsToShow) : latestPosts;
  const setDisplayLayout = (newDisplayLayout) => setAttributes({
    layout: { ...layout, ...newDisplayLayout },
    postLayout: void 0,
    columns: void 0
  });
  const layoutControls = [
    {
      icon: import_icons.list,
      title: (0, import_i18n._x)("List view", "Latest posts block display setting"),
      onClick: () => setDisplayLayout({ type: "default" }),
      isActive: layoutType === "default" || layoutType === "constrained"
    },
    {
      icon: import_icons.grid,
      title: (0, import_i18n._x)("Grid view", "Latest posts block display setting"),
      onClick: () => setDisplayLayout({
        type: "grid",
        columnCount
      }),
      isActive: layoutType === "grid"
    }
  ];
  const dateFormat = (0, import_date.getSettings)().formats.date;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    inspectorControls,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { controls: layoutControls }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { ...blockProps, children: displayPosts.map((post) => {
      const titleTrimmed = post.title.rendered.trim();
      let excerpt = post.excerpt.rendered;
      const currentAuthor = getCurrentAuthor(post);
      const excerptElement = document.createElement("div");
      excerptElement.innerHTML = excerpt;
      excerpt = excerptElement.textContent || excerptElement.innerText || "";
      const { url: imageSourceUrl, alt: featuredImageAlt } = getFeaturedImageDetails(post, featuredImageSizeSlug);
      const imageClasses = (0, import_clsx.default)({
        "wp-block-latest-posts__featured-image": true,
        [`align${featuredImageAlign}`]: !!featuredImageAlign
      });
      const renderFeaturedImage = displayFeaturedImage && imageSourceUrl;
      const featuredImage = renderFeaturedImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          src: imageSourceUrl,
          alt: featuredImageAlt,
          style: {
            maxWidth: featuredImageSizeWidth,
            maxHeight: featuredImageSizeHeight
          }
        }
      );
      const needsReadMore = excerptLength < excerpt.trim().split(" ").length && post.excerpt.raw === "";
      const postExcerpt = needsReadMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        excerpt.trim().split(" ", excerptLength).join(" "),
        (0, import_element.createInterpolateElement)(
          (0, import_i18n.sprintf)(
            /* translators: 1: Hidden accessibility text: Post title */
            (0, import_i18n.__)(
              "… <a>Read more<span>: %1$s</span></a>"
            ),
            titleTrimmed || (0, import_i18n.__)("(no title)")
          ),
          {
            a: (
              // eslint-disable-next-line jsx-a11y/anchor-has-content
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "a",
                {
                  className: "wp-block-latest-posts__read-more",
                  href: post.link,
                  rel: "noopener",
                  onClick: showRedirectionPreventedNotice
                }
              )
            ),
            span: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "screen-reader-text" })
          }
        )
      ] }) : excerpt;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
        renderFeaturedImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: imageClasses, children: addLinkToFeaturedImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "a",
          {
            href: post.link,
            onClick: showRedirectionPreventedNotice,
            children: featuredImage
          }
        ) : featuredImage }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "a",
          {
            className: "wp-block-latest-posts__post-title",
            href: post.link,
            dangerouslySetInnerHTML: !!titleTrimmed ? {
              __html: titleTrimmed
            } : void 0,
            onClick: showRedirectionPreventedNotice,
            children: !titleTrimmed ? (0, import_i18n.__)("(no title)") : null
          }
        ),
        displayAuthor && currentAuthor && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-latest-posts__post-author", children: (0, import_i18n.sprintf)(
          /* translators: byline. %s: author. */
          (0, import_i18n.__)("by %s"),
          currentAuthor.name
        ) }),
        displayPostDate && post.date_gmt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "time",
          {
            dateTime: (0, import_date.format)("c", post.date_gmt),
            className: "wp-block-latest-posts__post-date",
            children: (0, import_date.dateI18n)(dateFormat, post.date_gmt)
          }
        ),
        displayPostContent && displayPostContentRadio === "excerpt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-latest-posts__post-excerpt", children: postExcerpt }),
        displayPostContent && displayPostContentRadio === "full_post" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "div",
          {
            className: "wp-block-latest-posts__post-full-content",
            dangerouslySetInnerHTML: {
              __html: post.content.rendered.trim()
            }
          }
        )
      ] }, post.id);
    }) })
  ] });
}
//# sourceMappingURL=edit.cjs.map
