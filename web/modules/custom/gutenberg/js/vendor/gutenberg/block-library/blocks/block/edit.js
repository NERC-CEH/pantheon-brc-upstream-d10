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

// packages/block-library/src/block/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => ReusableBlockEditRecursionWrapper
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_core_data = require("@wordpress/core-data");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_patterns = require("@wordpress/patterns");
var import_blocks = require("@wordpress/blocks");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var { useLayoutClasses } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
var { isOverridableBlock } = (0, import_lock_unlock.unlock)(import_patterns.privateApis);
var fullAlignments = ["full", "wide", "left", "right"];
var useInferredLayout = (blocks, parentLayout) => {
  const initialInferredAlignmentRef = (0, import_element.useRef)();
  return (0, import_element.useMemo)(() => {
    if (!blocks?.length) {
      return {};
    }
    let alignment = initialInferredAlignmentRef.current;
    if (alignment === void 0) {
      const isConstrained = parentLayout?.type === "constrained";
      const hasFullAlignment = blocks.some(
        (block) => fullAlignments.includes(block.attributes.align)
      );
      alignment = isConstrained && hasFullAlignment ? "full" : null;
      initialInferredAlignmentRef.current = alignment;
    }
    const layout = alignment ? parentLayout : void 0;
    return { alignment, layout };
  }, [blocks, parentLayout]);
};
function RecursionWarning() {
  const blockProps = (0, import_block_editor.useBlockProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.Warning, { children: (0, import_i18n.__)("Block cannot be rendered inside itself.") }) });
}
var NOOP = () => {
};
function ReusableBlockEditRecursionWrapper(props) {
  const { ref } = props.attributes;
  const hasAlreadyRendered = (0, import_block_editor.useHasRecursion)(ref);
  if (hasAlreadyRendered) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecursionWarning, {});
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RecursionProvider, { uniqueId: ref, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReusableBlockEdit, { ...props }) });
}
function ReusableBlockControl({
  recordId,
  canOverrideBlocks,
  hasContent,
  handleEditOriginal,
  resetContent
}) {
  const canUserEdit = (0, import_data.useSelect)(
    (select) => !!select(import_core_data.store).canUser("update", {
      kind: "postType",
      name: "wp_block",
      id: recordId
    }),
    [recordId]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    canUserEdit && !!handleEditOriginal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarButton, { onClick: handleEditOriginal, children: (0, import_i18n.__)("Edit original") }) }) }),
    canOverrideBlocks && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarButton,
      {
        onClick: resetContent,
        disabled: !hasContent,
        children: (0, import_i18n.__)("Reset")
      }
    ) }) })
  ] });
}
var EMPTY_OBJECT = {};
function ReusableBlockEdit({
  name,
  attributes: { ref, content },
  __unstableParentLayout: parentLayout,
  setAttributes
}) {
  const { record, hasResolved } = (0, import_core_data.useEntityRecord)(
    "postType",
    "wp_block",
    ref
  );
  const [blocks] = (0, import_core_data.useEntityBlockEditor)("postType", "wp_block", {
    id: ref
  });
  const isMissing = hasResolved && !record;
  const { __unstableMarkLastChangeAsPersistent } = (0, import_data.useDispatch)(import_block_editor.store);
  const {
    onNavigateToEntityRecord,
    hasPatternOverridesSource,
    supportedBlockTypesRaw
  } = (0, import_data.useSelect)((select) => {
    const { getSettings } = select(import_block_editor.store);
    return {
      onNavigateToEntityRecord: getSettings().onNavigateToEntityRecord,
      hasPatternOverridesSource: !!(0, import_blocks.getBlockBindingsSource)(
        "core/pattern-overrides"
      ),
      supportedBlockTypesRaw: getSettings().__experimentalBlockBindingsSupportedAttributes || EMPTY_OBJECT
    };
  }, []);
  const canOverrideBlocks = (0, import_element.useMemo)(() => {
    const supportedBlockTypes = Object.keys(supportedBlockTypesRaw);
    const hasOverridableBlocks = (_blocks) => _blocks?.some((block) => {
      if (supportedBlockTypes.includes(block.name) && isOverridableBlock(block)) {
        return true;
      }
      return hasOverridableBlocks(block.innerBlocks);
    });
    return hasPatternOverridesSource && hasOverridableBlocks(blocks);
  }, [hasPatternOverridesSource, blocks, supportedBlockTypesRaw]);
  const { alignment, layout } = useInferredLayout(blocks, parentLayout);
  const layoutClasses = useLayoutClasses({ layout }, name);
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: (0, import_clsx.default)(
      "block-library-block__reusable-block-container",
      layout && layoutClasses,
      { [`align${alignment}`]: alignment }
    )
  });
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    layout,
    value: blocks,
    onInput: NOOP,
    onChange: NOOP,
    renderAppender: blocks?.length ? void 0 : import_block_editor.InnerBlocks.ButtonBlockAppender
  });
  const handleEditOriginal = () => {
    onNavigateToEntityRecord({
      postId: ref,
      postType: "wp_block"
    });
  };
  const resetContent = () => {
    if (content) {
      __unstableMarkLastChangeAsPersistent();
      setAttributes({ content: void 0 });
    }
  };
  let children = null;
  if (isMissing) {
    children = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.Warning, { children: (0, import_i18n.__)("Block has been deleted or is unavailable.") });
  }
  if (!hasResolved) {
    children = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Placeholder, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {}) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    hasResolved && !isMissing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ReusableBlockControl,
      {
        recordId: ref,
        canOverrideBlocks,
        hasContent: !!content,
        handleEditOriginal: onNavigateToEntityRecord ? handleEditOriginal : void 0,
        resetContent
      }
    ),
    children === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...innerBlocksProps }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children })
  ] });
}
//# sourceMappingURL=edit.cjs.map
