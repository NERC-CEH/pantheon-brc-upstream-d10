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

// packages/block-library/src/pattern/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_blocks = require("@wordpress/blocks");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_block_editor = require("@wordpress/block-editor");
var import_core_data = require("@wordpress/core-data");
var import_i18n = require("@wordpress/i18n");
var import_recursion_detector = require("./recursion-detector.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var PatternEdit = ({ attributes, clientId }) => {
  const registry = (0, import_data.useRegistry)();
  const selectedPattern = (0, import_data.useSelect)(
    (select) => select(import_block_editor.store).__experimentalGetParsedPattern(
      attributes.slug
    ),
    [attributes.slug]
  );
  const currentThemeStylesheet = (0, import_data.useSelect)(
    (select) => select(import_core_data.store).getCurrentTheme()?.stylesheet,
    []
  );
  const {
    replaceBlocks,
    setBlockEditingMode,
    __unstableMarkNextChangeAsNotPersistent
  } = (0, import_data.useDispatch)(import_block_editor.store);
  const { getBlockRootClientId, getBlockEditingMode } = (0, import_data.useSelect)(import_block_editor.store);
  const [hasRecursionError, setHasRecursionError] = (0, import_element.useState)(false);
  const parsePatternDependencies = (0, import_recursion_detector.useParsePatternDependencies)();
  function injectThemeAttributeInBlockTemplateContent(block) {
    if (block.innerBlocks.find(
      (innerBlock) => innerBlock.name === "core/template-part"
    )) {
      block.innerBlocks = block.innerBlocks.map((innerBlock) => {
        if (innerBlock.name === "core/template-part" && innerBlock.attributes.theme === void 0) {
          innerBlock.attributes.theme = currentThemeStylesheet;
        }
        return innerBlock;
      });
    }
    if (block.name === "core/template-part" && block.attributes.theme === void 0) {
      block.attributes.theme = currentThemeStylesheet;
    }
    return block;
  }
  (0, import_element.useEffect)(() => {
    if (!hasRecursionError && selectedPattern?.blocks) {
      try {
        parsePatternDependencies(selectedPattern);
      } catch {
        setHasRecursionError(true);
        return;
      }
      window.queueMicrotask(() => {
        const rootClientId = getBlockRootClientId(clientId);
        const clonedBlocks = selectedPattern.blocks.map(
          (block) => (0, import_blocks.cloneBlock)(
            injectThemeAttributeInBlockTemplateContent(block)
          )
        );
        if (clonedBlocks.length === 1 && selectedPattern.categories?.length > 0) {
          clonedBlocks[0].attributes = {
            ...clonedBlocks[0].attributes,
            metadata: {
              ...clonedBlocks[0].attributes.metadata,
              categories: selectedPattern.categories,
              patternName: selectedPattern.name,
              name: clonedBlocks[0].attributes.metadata.name || selectedPattern.title
            }
          };
        }
        const rootEditingMode = getBlockEditingMode(rootClientId);
        registry.batch(() => {
          __unstableMarkNextChangeAsNotPersistent();
          setBlockEditingMode(rootClientId, "default");
          __unstableMarkNextChangeAsNotPersistent();
          replaceBlocks(clientId, clonedBlocks);
          __unstableMarkNextChangeAsNotPersistent();
          setBlockEditingMode(rootClientId, rootEditingMode);
        });
      });
    }
  }, [
    clientId,
    hasRecursionError,
    selectedPattern,
    __unstableMarkNextChangeAsNotPersistent,
    replaceBlocks,
    getBlockEditingMode,
    setBlockEditingMode,
    getBlockRootClientId
  ]);
  const props = (0, import_block_editor.useBlockProps)();
  if (hasRecursionError) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...props, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.Warning, { children: (0, import_i18n.sprintf)(
      // translators: A warning in which %s is the name of a pattern.
      (0, import_i18n.__)('Pattern "%s" cannot be rendered inside itself.'),
      selectedPattern?.name
    ) }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...props });
};
var edit_default = PatternEdit;
//# sourceMappingURL=edit.cjs.map
