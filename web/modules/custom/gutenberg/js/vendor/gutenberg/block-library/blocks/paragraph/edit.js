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

// packages/block-library/src/paragraph/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_blocks = require("@wordpress/blocks");
var import_icons = require("@wordpress/icons");
var import_use_enter = require("./use-enter.cjs");
var import_deprecated_attributes = __toESM(require("./deprecated-attributes.cjs"));
var import_lock_unlock = require("../lock-unlock.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function ParagraphRTLControl({ direction, setDirection }) {
  return (0, import_i18n.isRTL)() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.ToolbarButton,
    {
      icon: import_icons.formatLTR,
      title: (0, import_i18n._x)("Left to right", "editor button"),
      isActive: direction === "ltr",
      onClick: () => {
        setDirection(direction === "ltr" ? void 0 : "ltr");
      }
    }
  );
}
function hasDropCapDisabled(align) {
  return align === ((0, import_i18n.isRTL)() ? "left" : "right") || align === "center";
}
function DropCapControl({ clientId, attributes, setAttributes, name }) {
  const [isDropCapFeatureEnabled] = (0, import_block_editor.useSettings)("typography.dropCap");
  const hasSelectedStyleState = (0, import_data.useSelect)(
    (select) => {
      const { hasSelectedStyleState: hasSelectedBlockStyleState } = (0, import_lock_unlock.unlock)(select(import_block_editor.store));
      return hasSelectedBlockStyleState(clientId);
    },
    [clientId]
  );
  if (!isDropCapFeatureEnabled || hasSelectedStyleState) {
    return null;
  }
  const { style, dropCap } = attributes;
  const textAlign = style?.typography?.textAlign;
  let helpText;
  if (hasDropCapDisabled(textAlign)) {
    helpText = (0, import_i18n.__)("Not available for aligned text.");
  } else if (dropCap) {
    helpText = (0, import_i18n.__)("Showing large initial letter.");
  } else {
    helpText = (0, import_i18n.__)("Show a large initial letter.");
  }
  const isDropCapControlEnabledByDefault = (0, import_blocks.getBlockSupport)(
    name,
    "typography.defaultControls.dropCap",
    false
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "typography", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.__experimentalToolsPanelItem,
    {
      hasValue: () => !!dropCap,
      label: (0, import_i18n.__)("Drop cap"),
      isShownByDefault: isDropCapControlEnabledByDefault,
      onDeselect: () => setAttributes({ dropCap: false }),
      resetAllFilter: () => ({ dropCap: false }),
      panelId: clientId,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.ToggleControl,
        {
          label: (0, import_i18n.__)("Drop cap"),
          checked: !!dropCap,
          onChange: () => setAttributes({ dropCap: !dropCap }),
          help: helpText,
          disabled: hasDropCapDisabled(textAlign)
        }
      )
    }
  ) });
}
function ParagraphBlock({
  attributes,
  mergeBlocks,
  onReplace,
  onRemove,
  setAttributes,
  clientId,
  isSelected: isSingleSelected,
  name
}) {
  const { content, direction, dropCap, placeholder, style } = attributes;
  const textAlign = style?.typography?.textAlign;
  (0, import_deprecated_attributes.default)(attributes.align, style, setAttributes);
  const blockProps = (0, import_block_editor.useBlockProps)({
    ref: (0, import_use_enter.useOnEnter)({ clientId, content }),
    className: (0, import_clsx.default)({
      "has-drop-cap": hasDropCapDisabled(textAlign) ? false : dropCap
    }),
    style: { direction },
    "aria-label": import_block_editor.RichText.isEmpty(content) ? (0, import_i18n.__)(
      "Empty block; start writing or type forward slash to choose a block"
    ) : (0, import_i18n.__)("Block: Paragraph")
  });
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    blockEditingMode === "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ParagraphRTLControl,
      {
        direction,
        setDirection: (newDirection) => setAttributes({ direction: newDirection })
      }
    ) }),
    isSingleSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      DropCapControl,
      {
        name,
        clientId,
        attributes,
        setAttributes
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichText,
      {
        identifier: "content",
        tagName: "p",
        ...blockProps,
        value: content,
        onChange: (newContent) => setAttributes({ content: newContent }),
        onMerge: mergeBlocks,
        onReplace,
        onRemove,
        "data-empty": import_block_editor.RichText.isEmpty(content),
        placeholder: placeholder || (0, import_i18n.__)("Type / to choose a block"),
        "data-custom-placeholder": placeholder ? true : void 0,
        __unstableEmbedURLOnPaste: true,
        __unstableAllowPrefixTransformations: true
      }
    )
  ] });
}
var edit_default = ParagraphBlock;
//# sourceMappingURL=edit.cjs.map
