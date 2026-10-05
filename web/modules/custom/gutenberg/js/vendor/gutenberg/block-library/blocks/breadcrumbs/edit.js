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

// packages/block-library/src/breadcrumbs/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => BreadcrumbEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_core_data = require("@wordpress/core-data");
var import_element = require("@wordpress/element");
var import_server_side_render = require("@wordpress/server-side-render");
var import_compose = require("@wordpress/compose");
var import_hooks = require("../utils/hooks.cjs");
var import_html_renderer = __toESM(require("../utils/html-renderer.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var separatorDefaultValue = "/";
function BreadcrumbEdit({
  attributes,
  setAttributes,
  name,
  context: { postId, postType, templateSlug }
}) {
  const {
    separator,
    showHomeItem,
    showCurrentItem,
    prefersTaxonomy,
    showOnHomePage
  } = attributes;
  const {
    post,
    isPostTypeHierarchical,
    postTypeHasTaxonomies,
    hasTermsAssigned,
    isLoading
  } = (0, import_data.useSelect)(
    (select) => {
      if (!postType) {
        return {};
      }
      const _post = select(import_core_data.store).getEntityRecord(
        "postType",
        postType,
        postId
      );
      const postTypeObject = select(import_core_data.store).getPostType(postType);
      const _postTypeHasTaxonomies = postTypeObject && postTypeObject.taxonomies.length;
      let taxonomies;
      if (_postTypeHasTaxonomies) {
        taxonomies = select(import_core_data.store).getTaxonomies({
          type: postType,
          per_page: -1
        });
      }
      return {
        post: _post,
        isPostTypeHierarchical: postTypeObject?.hierarchical,
        postTypeHasTaxonomies: _postTypeHasTaxonomies,
        hasTermsAssigned: _post && (taxonomies || []).filter(
          ({ visibility }) => visibility?.publicly_queryable
        ).some((taxonomy) => {
          return !!_post[taxonomy.rest_base]?.length;
        }),
        isLoading: postId && !_post || !postTypeObject || _postTypeHasTaxonomies && !taxonomies
      };
    },
    [postType, postId]
  );
  const [invalidationKey, setInvalidationKey] = (0, import_element.useState)(0);
  (0, import_element.useEffect)(() => {
    setInvalidationKey((c) => c + 1);
  }, [post]);
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const { content, status, error } = (0, import_server_side_render.useServerSideRender)({
    attributes,
    skipBlockSupportAttributes: true,
    block: name,
    urlQueryArgs: { post_id: postId, invalidationKey }
  });
  const prevContentRef = (0, import_element.useRef)("");
  (0, import_element.useEffect)(() => {
    if (status === "success") {
      prevContentRef.current = content;
    }
  }, [content, status]);
  const [showLoader, setShowLoader] = (0, import_element.useState)(false);
  (0, import_element.useEffect)(() => {
    if (status !== "loading") {
      return;
    }
    const timeout = setTimeout(() => {
      setShowLoader(true);
    }, 400);
    return () => {
      clearTimeout(timeout);
      setShowLoader(false);
    };
  }, [status]);
  const disabledRef = (0, import_compose.useDisabled)();
  const blockProps = (0, import_block_editor.useBlockProps)({ ref: disabledRef });
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {}) });
  }
  let _showTerms;
  if (!isPostTypeHierarchical && !post?.parent) {
    _showTerms = true;
  } else if (!postTypeHasTaxonomies) {
    _showTerms = false;
  } else {
    _showTerms = prefersTaxonomy;
  }
  let placeholder = null;
  const showPlaceholder = !postId || !postType || // When `templateSlug` is set only show placeholder if the post type is not.
  // This is needed because when we are showing the template in post editor we
  // want to show the real breadcrumbs if we have the post type.
  templateSlug && !postType || !_showTerms && !isPostTypeHierarchical || _showTerms && !hasTermsAssigned;
  if (showPlaceholder) {
    const placeholderItems = [];
    if (showHomeItem) {
      placeholderItems.push((0, import_i18n.__)("Home"));
    }
    if (templateSlug && !postId) {
      placeholderItems.push((0, import_i18n.__)("Page"));
    } else if (_showTerms) {
      placeholderItems.push((0, import_i18n.__)("Category"));
    } else {
      placeholderItems.push((0, import_i18n.__)("Ancestor"), (0, import_i18n.__)("Parent"));
    }
    placeholder = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "nav",
      {
        ...blockProps,
        style: {
          "--separator": `"${separator.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`,
          ...blockProps.style
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", { children: [
          placeholderItems.map((text, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: `#breadcrumbs-pseudo-link-${index}`, children: text }) }, index)),
          showCurrentItem && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-current": "page", children: (0, import_i18n.__)("Current") }) })
        ] })
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            separator: separatorDefaultValue,
            showHomeItem: true,
            showCurrentItem: true
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Show home breadcrumb"),
              isShownByDefault: true,
              hasValue: () => !showHomeItem,
              onDeselect: () => setAttributes({
                showHomeItem: true
              }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show home breadcrumb"),
                  onChange: (value) => setAttributes({ showHomeItem: value }),
                  checked: showHomeItem
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Show current breadcrumb"),
              isShownByDefault: true,
              hasValue: () => !showCurrentItem,
              onDeselect: () => setAttributes({
                showCurrentItem: true
              }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show current breadcrumb"),
                  onChange: (value) => setAttributes({ showCurrentItem: value }),
                  checked: showCurrentItem
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Separator"),
              isShownByDefault: true,
              hasValue: () => separator !== separatorDefaultValue,
              onDeselect: () => setAttributes({
                separator: separatorDefaultValue
              }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.TextControl,
                {
                  autoComplete: "off",
                  label: (0, import_i18n.__)("Separator"),
                  value: separator,
                  onChange: (value) => setAttributes({ separator: value }),
                  onBlur: () => {
                    if (!separator) {
                      setAttributes({
                        separator: separatorDefaultValue
                      });
                    }
                  }
                }
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_block_editor.InspectorControls, { group: "advanced", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.CheckboxControl,
        {
          label: (0, import_i18n.__)("Show on homepage"),
          checked: showOnHomePage,
          onChange: (value) => setAttributes({ showOnHomePage: value }),
          help: (0, import_i18n.__)(
            "If this Breadcrumbs block appears in a template or template part that’s shown on the homepage, enable this option to display the breadcrumb trail. Otherwise, this setting has no effect."
          )
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.CheckboxControl,
        {
          label: (0, import_i18n.__)("Prefer taxonomy terms"),
          checked: prefersTaxonomy,
          onChange: (value) => setAttributes({ prefersTaxonomy: value }),
          help: (0, import_i18n.__)(
            "The exact type of breadcrumbs shown will vary automatically depending on the page in which this block is displayed. In the specific case of a hierarchical post type with taxonomies, the breadcrumbs can either reflect its post hierarchy (default) or the hierarchy of its assigned taxonomy terms."
          )
        }
      )
    ] }),
    status === "loading" && !showPlaceholder && (prevContentRef.current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_html_renderer.default,
      {
        wrapperProps: {
          ...blockProps,
          style: {
            ...blockProps.style,
            opacity: showLoader ? 0.3 : 1
          }
        },
        html: prevContentRef.current
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {}) })),
    status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: (0, import_i18n.sprintf)(
      /* translators: %s: error message returned when rendering the block. */
      (0, import_i18n.__)("Error: %s"),
      error
    ) }) }),
    showPlaceholder && placeholder,
    !showPlaceholder && status === "success" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_html_renderer.default, { wrapperProps: blockProps, html: content })
  ] });
}
//# sourceMappingURL=edit.cjs.map
