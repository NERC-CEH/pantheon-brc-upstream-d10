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

// packages/block-library/src/categories/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => CategoriesEdit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_components = require("@wordpress/components");
var import_compose = require("@wordpress/compose");
var import_block_editor = require("@wordpress/block-editor");
var import_html_entities = require("@wordpress/html-entities");
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
var import_ui = require("@wordpress/ui");
var import_notices = require("@wordpress/notices");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function CategoriesEdit({
  attributes: {
    displayAsDropdown,
    showHierarchy,
    showPostCounts,
    showOnlyTopLevel,
    showEmpty,
    label,
    showLabel,
    taxonomy: taxonomySlug
  },
  setAttributes,
  className,
  clientId
}) {
  const selectId = (0, import_compose.useInstanceId)(CategoriesEdit, "blocks-category-select");
  const { records: allTaxonomies, isResolvingTaxonomies } = (0, import_core_data.useEntityRecords)(
    "root",
    "taxonomy",
    { per_page: -1 }
  );
  const taxonomies = allTaxonomies?.filter((t) => t.visibility.public);
  const taxonomy = taxonomies?.find((t) => t.slug === taxonomySlug);
  const isHierarchicalTaxonomy = !isResolvingTaxonomies && taxonomy?.hierarchical;
  const query = { per_page: -1, hide_empty: !showEmpty, context: "view" };
  if (isHierarchicalTaxonomy && showOnlyTopLevel) {
    query.parent = 0;
  }
  const { records: categories, isResolving } = (0, import_core_data.useEntityRecords)(
    "taxonomy",
    taxonomySlug,
    query
  );
  const { createWarningNotice } = (0, import_data.useDispatch)(import_notices.store);
  const showRedirectionPreventedNotice = (event) => {
    event.preventDefault();
    createWarningNotice((0, import_i18n.__)("Links are disabled in the editor."), {
      id: `block-library/core/categories/redirection-prevented/${clientId}`,
      type: "snackbar"
    });
  };
  const getCategoriesList = (parentId) => {
    if (!categories?.length) {
      return [];
    }
    if (parentId === null) {
      return categories;
    }
    return categories.filter(({ parent }) => parent === parentId);
  };
  const toggleAttribute = (attributeName) => (newValue) => setAttributes({ [attributeName]: newValue });
  const renderCategoryName = (name) => !name ? (0, import_i18n.__)("(Untitled)") : (0, import_html_entities.decodeEntities)(name).trim();
  const renderCategoryList = () => {
    const parentId = isHierarchicalTaxonomy && showHierarchy ? 0 : null;
    const categoriesList = getCategoriesList(parentId);
    return categoriesList.map(
      (category) => renderCategoryListItem(category)
    );
  };
  const renderCategoryListItem = (category) => {
    const childCategories = getCategoriesList(category.id);
    const { id, link, count, name } = category;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: `cat-item cat-item-${id}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: link, onClick: showRedirectionPreventedNotice, children: renderCategoryName(name) }),
      showPostCounts && ` (${count})`,
      isHierarchicalTaxonomy && showHierarchy && !!childCategories.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "children", children: childCategories.map(
        (childCategory) => renderCategoryListItem(childCategory)
      ) })
    ] }, id);
  };
  const renderCategoryDropdown = () => {
    const parentId = isHierarchicalTaxonomy && showHierarchy ? 0 : null;
    const categoriesList = getCategoriesList(parentId);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      showLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText,
        {
          className: "wp-block-categories__label",
          "aria-label": (0, import_i18n.__)("Label text"),
          placeholder: taxonomy?.name,
          withoutInteractiveFormatting: true,
          value: label,
          onChange: (html) => setAttributes({ label: html })
        }
      ) : (
        // eslint-disable-next-line jsx-a11y/label-has-associated-control
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.VisuallyHidden, { render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { htmlFor: selectId }), children: label ? label : taxonomy?.name })
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { id: selectId, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: (0, import_i18n.sprintf)(
          /* translators: %s: taxonomy's singular name */
          (0, import_i18n.__)("Select %s"),
          taxonomy?.labels?.singular_name
        ) }),
        categoriesList.map(
          (category) => renderCategoryDropdownItem(category, 0)
        )
      ] })
    ] });
  };
  const renderCategoryDropdownItem = (category, level) => {
    const { id, count, name } = category;
    const childCategories = getCategoriesList(id);
    return [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { className: `level-${level}`, children: [
        Array.from({ length: level * 3 }).map(() => " "),
        renderCategoryName(name),
        showPostCounts && ` (${count})`
      ] }, id),
      isHierarchicalTaxonomy && showHierarchy && !!childCategories.length && childCategories.map(
        (childCategory) => renderCategoryDropdownItem(childCategory, level + 1)
      )
    ];
  };
  const TagName = !!categories?.length && !displayAsDropdown && !isResolving ? "ul" : "div";
  const classes = (0, import_clsx.default)(
    className,
    `wp-block-categories-taxonomy-${taxonomySlug}`,
    {
      "wp-block-categories-list": !!categories?.length && !displayAsDropdown && !isResolving,
      "wp-block-categories-dropdown": !!categories?.length && displayAsDropdown && !isResolving
    }
  );
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: classes
  });
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TagName, { ...blockProps, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            taxonomy: "category",
            displayAsDropdown: false,
            showHierarchy: false,
            showPostCounts: false,
            showOnlyTopLevel: false,
            showEmpty: false,
            showLabel: true
          });
        },
        dropdownMenuProps,
        children: [
          Array.isArray(taxonomies) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => {
                return taxonomySlug !== "category";
              },
              label: (0, import_i18n.__)("Taxonomy"),
              onDeselect: () => {
                setAttributes({ taxonomy: "category" });
              },
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.SelectControl,
                {
                  label: (0, import_i18n.__)("Taxonomy"),
                  options: taxonomies.map((t) => ({
                    label: t.name,
                    value: t.slug
                  })),
                  value: taxonomySlug,
                  onChange: (selectedTaxonomy) => setAttributes({
                    taxonomy: selectedTaxonomy
                  })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!displayAsDropdown,
              label: (0, import_i18n.__)("Display as dropdown"),
              onDeselect: () => setAttributes({ displayAsDropdown: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Display as dropdown"),
                  checked: displayAsDropdown,
                  onChange: toggleAttribute("displayAsDropdown")
                }
              )
            }
          ),
          displayAsDropdown && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !showLabel,
              label: (0, import_i18n.__)("Show label"),
              onDeselect: () => setAttributes({ showLabel: true }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  className: "wp-block-categories__indentation",
                  label: (0, import_i18n.__)("Show label"),
                  checked: showLabel,
                  onChange: toggleAttribute("showLabel")
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!showPostCounts,
              label: (0, import_i18n.__)("Show post counts"),
              onDeselect: () => setAttributes({ showPostCounts: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show post counts"),
                  checked: showPostCounts,
                  onChange: toggleAttribute("showPostCounts")
                }
              )
            }
          ),
          isHierarchicalTaxonomy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!showOnlyTopLevel,
              label: (0, import_i18n.__)("Show only top level terms"),
              onDeselect: () => setAttributes({ showOnlyTopLevel: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show only top level terms"),
                  checked: showOnlyTopLevel,
                  onChange: toggleAttribute(
                    "showOnlyTopLevel"
                  )
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!showEmpty,
              label: (0, import_i18n.__)("Show empty terms"),
              onDeselect: () => setAttributes({ showEmpty: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show empty terms"),
                  checked: showEmpty,
                  onChange: toggleAttribute("showEmpty")
                }
              )
            }
          ),
          isHierarchicalTaxonomy && !showOnlyTopLevel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!showHierarchy,
              label: (0, import_i18n.__)("Show hierarchy"),
              onDeselect: () => setAttributes({ showHierarchy: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show hierarchy"),
                  checked: showHierarchy,
                  onChange: toggleAttribute("showHierarchy")
                }
              )
            }
          )
        ]
      }
    ) }),
    isResolving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Placeholder, { icon: import_icons.pin, label: (0, import_i18n.__)("Terms"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {}) }),
    !isResolving && categories?.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: taxonomy.labels.no_terms }),
    !isResolving && categories?.length > 0 && (displayAsDropdown ? renderCategoryDropdown() : renderCategoryList())
  ] });
}
//# sourceMappingURL=edit.cjs.map
