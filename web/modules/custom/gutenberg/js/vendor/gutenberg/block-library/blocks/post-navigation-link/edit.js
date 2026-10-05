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

// packages/block-library/src/post-navigation-link/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => PostNavigationLinkEdit
});
module.exports = __toCommonJS(edit_exports);
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_i18n = require("@wordpress/i18n");
var import_data = require("@wordpress/data");
var import_core_data = require("@wordpress/core-data");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function PostNavigationLinkEdit({
  context: { postType },
  attributes: { type, label, showTitle, linkLabel, arrow, taxonomy },
  setAttributes
}) {
  const isNext = type === "next";
  let placeholder = isNext ? (0, import_i18n.__)("Next") : (0, import_i18n.__)("Previous");
  const arrowMap = {
    none: "",
    arrow: isNext ? "→" : "←",
    chevron: isNext ? "»" : "«"
  };
  const displayArrow = arrowMap[arrow];
  if (showTitle) {
    placeholder = isNext ? (
      /* translators: Label before for next and previous post. There is a space after the colon. */
      (0, import_i18n.__)("Next: ")
    ) : (
      /* translators: Label before for next and previous post. There is a space after the colon. */
      (0, import_i18n.__)("Previous: ")
    );
  }
  const ariaLabel = isNext ? (0, import_i18n.__)("Next post") : (0, import_i18n.__)("Previous post");
  const blockProps = (0, import_block_editor.useBlockProps)();
  const taxonomies = (0, import_data.useSelect)(
    (select) => {
      const { getTaxonomies } = select(import_core_data.store);
      const filteredTaxonomies = getTaxonomies({
        type: postType,
        per_page: -1
      });
      return filteredTaxonomies;
    },
    [postType]
  );
  const getTaxonomyOptions = () => {
    const selectOption = {
      label: (0, import_i18n.__)("Unfiltered"),
      value: ""
    };
    const taxonomyOptions = (taxonomies ?? []).filter(({ visibility }) => !!visibility?.publicly_queryable).map((item) => {
      return {
        value: item.slug,
        label: item.name
      };
    });
    return [selectOption, ...taxonomyOptions];
  };
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            showTitle: false,
            linkLabel: false,
            arrow: "none"
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Display the title as a link"),
              isShownByDefault: true,
              hasValue: () => showTitle,
              onDeselect: () => setAttributes({ showTitle: false }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Display the title as a link"),
                  help: (0, import_i18n.__)(
                    "If you have entered a custom label, it will be prepended before the title."
                  ),
                  checked: !!showTitle,
                  onChange: () => setAttributes({
                    showTitle: !showTitle
                  })
                }
              )
            }
          ),
          showTitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)(
                "Include the label as part of the link"
              ),
              isShownByDefault: true,
              hasValue: () => !!linkLabel,
              onDeselect: () => setAttributes({ linkLabel: false }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)(
                    "Include the label as part of the link"
                  ),
                  checked: !!linkLabel,
                  onChange: () => setAttributes({
                    linkLabel: !linkLabel
                  })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Arrow"),
              isShownByDefault: true,
              hasValue: () => arrow !== "none",
              onDeselect: () => setAttributes({ arrow: "none" }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                import_components.__experimentalToggleGroupControl,
                {
                  label: (0, import_i18n.__)("Arrow"),
                  value: arrow,
                  onChange: (value) => {
                    setAttributes({ arrow: value });
                  },
                  help: (0, import_i18n.__)(
                    "A decorative arrow for the next and previous link."
                  ),
                  isBlock: true,
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_components.__experimentalToggleGroupControlOption,
                      {
                        value: "none",
                        label: (0, import_i18n._x)(
                          "None",
                          "Arrow option for Next/Previous link"
                        )
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_components.__experimentalToggleGroupControlOption,
                      {
                        value: "arrow",
                        label: (0, import_i18n._x)(
                          "Arrow",
                          "Arrow option for Next/Previous link"
                        )
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_components.__experimentalToggleGroupControlOption,
                      {
                        value: "chevron",
                        label: (0, import_i18n._x)(
                          "Chevron",
                          "Arrow option for Next/Previous link"
                        )
                      }
                    )
                  ]
                }
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "advanced", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.SelectControl,
      {
        label: (0, import_i18n.__)("Filter by taxonomy"),
        value: taxonomy,
        options: getTaxonomyOptions(),
        onChange: (value) => setAttributes({
          taxonomy: value
        }),
        help: (0, import_i18n.__)(
          "Only link to posts that have the same taxonomy terms as the current post. For example the same tags or categories."
        )
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
      !isNext && displayArrow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          className: `wp-block-post-navigation-link__arrow-previous is-arrow-${arrow}`,
          children: displayArrow
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText,
        {
          tagName: "a",
          identifier: "label",
          "aria-label": ariaLabel,
          placeholder,
          value: label,
          withoutInteractiveFormatting: true,
          onChange: (newLabel) => setAttributes({ label: newLabel })
        }
      ),
      showTitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          href: "#post-navigation-pseudo-link",
          onClick: (event) => event.preventDefault(),
          children: (0, import_i18n.__)("An example title")
        }
      ),
      isNext && displayArrow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          className: `wp-block-post-navigation-link__arrow-next is-arrow-${arrow}`,
          "aria-hidden": true,
          children: displayArrow
        }
      )
    ] })
  ] });
}
//# sourceMappingURL=edit.cjs.map
