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

// packages/block-library/src/group/placeholder.jsx
var placeholder_exports = {};
__export(placeholder_exports, {
  default: () => placeholder_default,
  useShouldShowPlaceHolder: () => useShouldShowPlaceHolder
});
module.exports = __toCommonJS(placeholder_exports);
var import_data = require("@wordpress/data");
var import_block_editor = require("@wordpress/block-editor");
var import_i18n = require("@wordpress/i18n");
var import_blocks = require("@wordpress/blocks");
var import_components = require("@wordpress/components");
var import_element = require("@wordpress/element");
var import_jsx_runtime = require("react/jsx-runtime");
var getGroupPlaceholderIcons = (name = "group") => {
  const icons = {
    group: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.SVG,
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M0 10a2 2 0 0 1 2-2h44a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V10Z" })
      }
    ),
    "group-row": /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.SVG,
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M0 10a2 2 0 0 1 2-2h19a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V10Zm25 0a2 2 0 0 1 2-2h19a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H27a2 2 0 0 1-2-2V10Z" })
      }
    ),
    "group-stack": /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.SVG,
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M0 10a2 2 0 0 1 2-2h44a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V10Zm0 17a2 2 0 0 1 2-2h44a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V27Z" })
      }
    ),
    "group-grid": /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.SVG,
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Path, { d: "M0 10a2 2 0 0 1 2-2h19a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V10Zm25 0a2 2 0 0 1 2-2h19a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H27a2 2 0 0 1-2-2V10ZM0 27a2 2 0 0 1 2-2h19a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V27Zm25 0a2 2 0 0 1 2-2h19a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H27a2 2 0 0 1-2-2V27Z" })
      }
    )
  };
  return icons?.[name];
};
function useShouldShowPlaceHolder({
  attributes = {
    style: void 0,
    backgroundColor: void 0,
    textColor: void 0,
    fontSize: void 0
  },
  usedLayoutType = "",
  hasInnerBlocks = false
}) {
  const { style, backgroundColor, textColor, fontSize } = attributes;
  const [showPlaceholder, setShowPlaceholder] = (0, import_element.useState)(
    !hasInnerBlocks && !backgroundColor && !fontSize && !textColor && !style && usedLayoutType !== "flex" && usedLayoutType !== "grid"
  );
  (0, import_element.useEffect)(() => {
    if (!!hasInnerBlocks || !!backgroundColor || !!fontSize || !!textColor || !!style || usedLayoutType === "flex") {
      setShowPlaceholder(false);
    }
  }, [
    backgroundColor,
    fontSize,
    textColor,
    style,
    usedLayoutType,
    hasInnerBlocks
  ]);
  return [showPlaceholder, setShowPlaceholder];
}
function GroupPlaceHolder({ name, onSelect }) {
  const variations = (0, import_data.useSelect)(
    (select) => select(import_blocks.store).getBlockVariations(name, "block"),
    [name]
  );
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: "wp-block-group__placeholder"
  });
  (0, import_element.useEffect)(() => {
    if (variations && variations.length === 1) {
      onSelect(variations[0]);
    }
  }, [onSelect, variations]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.Placeholder,
    {
      instructions: (0, import_i18n.__)("Group blocks together. Select a layout:"),
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "ul",
        {
          role: "list",
          className: "wp-block-group-placeholder__variations",
          "aria-label": (0, import_i18n.__)("Block variations"),
          children: variations.map((variation) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.Button,
            {
              __next40pxDefaultSize: true,
              variant: "tertiary",
              icon: getGroupPlaceholderIcons(
                variation.name
              ),
              iconSize: 48,
              onClick: () => onSelect(variation),
              className: "wp-block-group-placeholder__variation-button",
              label: `${variation.title}: ${variation.description}`
            }
          ) }, variation.name))
        }
      )
    }
  ) });
}
var placeholder_default = GroupPlaceHolder;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useShouldShowPlaceHolder
});
//# sourceMappingURL=placeholder.cjs.map
