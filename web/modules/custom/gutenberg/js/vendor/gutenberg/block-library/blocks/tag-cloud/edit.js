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

// packages/block-library/src/tag-cloud/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_core_data = require("@wordpress/core-data");
var import_server_side_render = require("@wordpress/server-side-render");
var import_compose = require("@wordpress/compose");
var import_hooks = require("../utils/hooks.cjs");
var import_html_renderer = __toESM(require("../utils/html-renderer.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var MIN_TAGS = 1;
var MAX_TAGS = 100;
var MIN_FONT_SIZE = 0.1;
var MAX_FONT_SIZE = 100;
function TagCloudEdit({ attributes, setAttributes, name }) {
  const {
    taxonomy,
    showTagCounts,
    numberOfTags,
    smallestFontSize,
    largestFontSize
  } = attributes;
  const [availableUnits] = (0, import_block_editor.useSettings)("spacing.units");
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const units = (0, import_components.__experimentalUseCustomUnits)({
    availableUnits: availableUnits ? [...availableUnits, "pt"] : ["%", "px", "em", "rem", "pt"]
  });
  const taxonomies = (0, import_data.useSelect)(
    (select) => select(import_core_data.store).getTaxonomies({ per_page: -1 }),
    []
  );
  const getTaxonomyOptions = () => {
    const selectOption = {
      label: (0, import_i18n.__)("- Select -"),
      value: "",
      disabled: true
    };
    const taxonomyOptions = (taxonomies ?? []).filter((tax) => !!tax.show_cloud).map((item) => {
      return {
        value: item.slug,
        label: item.name
      };
    });
    return [selectOption, ...taxonomyOptions];
  };
  const onFontSizeChange = (fontSizeLabel, newValue) => {
    const [quantity, newUnit] = (0, import_components.__experimentalParseQuantityAndUnitFromRawValue)(newValue);
    if (!Number.isFinite(quantity)) {
      return;
    }
    const updateObj = { [fontSizeLabel]: newValue };
    Object.entries({
      smallestFontSize,
      largestFontSize
    }).forEach(([attribute, currentValue]) => {
      const [currentQuantity, currentUnit] = (0, import_components.__experimentalParseQuantityAndUnitFromRawValue)(currentValue);
      if (attribute !== fontSizeLabel && currentUnit !== newUnit) {
        updateObj[attribute] = `${currentQuantity}${newUnit}`;
      }
    });
    setAttributes(updateObj);
  };
  const inspectorControls = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_components.__experimentalToolsPanel,
    {
      label: (0, import_i18n.__)("Settings"),
      resetAll: () => {
        setAttributes({
          taxonomy: "post_tag",
          showTagCounts: false,
          numberOfTags: 45,
          smallestFontSize: "8pt",
          largestFontSize: "22pt"
        });
      },
      dropdownMenuProps,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            hasValue: () => taxonomy !== "post_tag",
            label: (0, import_i18n.__)("Taxonomy"),
            onDeselect: () => setAttributes({ taxonomy: "post_tag" }),
            isShownByDefault: true,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.SelectControl,
              {
                label: (0, import_i18n.__)("Taxonomy"),
                options: getTaxonomyOptions(),
                value: taxonomy,
                onChange: (selectedTaxonomy) => setAttributes({ taxonomy: selectedTaxonomy })
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            hasValue: () => smallestFontSize !== "8pt" || largestFontSize !== "22pt",
            label: (0, import_i18n.__)("Font size"),
            onDeselect: () => setAttributes({
              smallestFontSize: "8pt",
              largestFontSize: "22pt"
            }),
            isShownByDefault: true,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.Flex, { gap: 4, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.FlexItem, { isBlock: true, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.__experimentalUnitControl,
                {
                  label: (0, import_i18n.__)("Smallest size"),
                  value: smallestFontSize,
                  onChange: (value) => {
                    onFontSizeChange(
                      "smallestFontSize",
                      value
                    );
                  },
                  units,
                  min: MIN_FONT_SIZE,
                  max: MAX_FONT_SIZE
                }
              ) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.FlexItem, { isBlock: true, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.__experimentalUnitControl,
                {
                  label: (0, import_i18n.__)("Largest size"),
                  value: largestFontSize,
                  onChange: (value) => {
                    onFontSizeChange(
                      "largestFontSize",
                      value
                    );
                  },
                  units,
                  min: MIN_FONT_SIZE,
                  max: MAX_FONT_SIZE
                }
              ) })
            ] })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            hasValue: () => numberOfTags !== 45,
            label: (0, import_i18n.__)("Number of tags"),
            onDeselect: () => setAttributes({ numberOfTags: 45 }),
            isShownByDefault: true,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.RangeControl,
              {
                label: (0, import_i18n.__)("Number of tags"),
                value: numberOfTags,
                onChange: (value) => setAttributes({ numberOfTags: value }),
                min: MIN_TAGS,
                max: MAX_TAGS,
                required: true
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            hasValue: () => showTagCounts !== false,
            label: (0, import_i18n.__)("Show tag counts"),
            onDeselect: () => setAttributes({ showTagCounts: false }),
            isShownByDefault: true,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Show tag counts"),
                checked: showTagCounts,
                onChange: () => setAttributes({ showTagCounts: !showTagCounts })
              }
            )
          }
        )
      ]
    }
  ) });
  const { content, status, error } = (0, import_server_side_render.useServerSideRender)({
    attributes,
    skipBlockSupportAttributes: true,
    block: name
  });
  const disabledRef = (0, import_compose.useDisabled)();
  const blockProps = (0, import_block_editor.useBlockProps)({ ref: disabledRef });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    inspectorControls,
    status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {}) }),
    status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: (0, import_i18n.sprintf)(
      /* translators: %s: error message returned when rendering the block. */
      (0, import_i18n.__)("Error: %s"),
      error
    ) }) }),
    status === "success" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_html_renderer.default, { wrapperProps: blockProps, html: content })
  ] });
}
var edit_default = TagCloudEdit;
//# sourceMappingURL=edit.cjs.map
