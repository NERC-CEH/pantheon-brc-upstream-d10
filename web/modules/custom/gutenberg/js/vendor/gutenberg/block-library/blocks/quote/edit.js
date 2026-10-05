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

// packages/block-library/src/quote/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => QuoteEdit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_deprecated = __toESM(require("@wordpress/deprecated"));
var import_icons = require("@wordpress/icons");
var import_deprecated2 = require("./deprecated.cjs");
var import_caption = require("../utils/caption.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var useMigrateOnLoad = (attributes, clientId) => {
  const registry = (0, import_data.useRegistry)();
  const { updateBlockAttributes, replaceInnerBlocks, selectBlock } = (0, import_data.useDispatch)(import_block_editor.store);
  (0, import_element.useEffect)(() => {
    if (!attributes.value) {
      return;
    }
    const [newAttributes, newInnerBlocks] = (0, import_deprecated2.migrateToQuoteV2)(attributes);
    (0, import_deprecated.default)("Value attribute on the quote block", {
      since: "6.0",
      version: "6.5",
      alternative: "inner blocks"
    });
    const shouldReselectBlock = registry.select(import_block_editor.store).hasSelectedInnerBlock(clientId, true);
    registry.batch(() => {
      updateBlockAttributes(clientId, newAttributes);
      replaceInnerBlocks(clientId, newInnerBlocks);
      if (shouldReselectBlock) {
        selectBlock(clientId);
      }
    });
  }, [attributes.value]);
};
function QuoteEdit({
  attributes,
  setAttributes,
  insertBlocksAfter,
  clientId,
  className,
  isSelected
}) {
  const { textAlign, allowedBlocks } = attributes;
  const { hasInnerBlocks } = (0, import_data.useSelect)(
    (select) => {
      const { getBlockCount } = select(import_block_editor.store);
      return {
        hasInnerBlocks: getBlockCount(clientId) > 0
      };
    },
    [clientId]
  );
  useMigrateOnLoad(attributes, clientId);
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: (0, import_clsx.default)(className, {
      [`has-text-align-${textAlign}`]: textAlign
    })
  });
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    __experimentalCaptureToolbars: true,
    renderAppender: hasInnerBlocks ? false : void 0,
    allowedBlocks
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.AlignmentControl,
      {
        value: textAlign,
        onChange: (nextAlign) => {
          setAttributes({ textAlign: nextAlign });
        }
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.BlockQuotation, { ...innerBlocksProps, children: [
      innerBlocksProps.children,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_caption.Caption,
        {
          attributeKey: "citation",
          tagName: "cite",
          style: { display: "block" },
          isSelected,
          attributes,
          setAttributes,
          icon: import_icons.verse,
          label: (0, import_i18n.__)("Quote citation"),
          placeholder: (
            // translators: placeholder text used for the
            // citation
            (0, import_i18n.__)("Add citation")
          ),
          addLabel: (0, import_i18n.__)("Add citation"),
          removeLabel: (0, import_i18n.__)("Remove citation"),
          excludeElementClassName: true,
          className: "wp-block-quote__citation",
          insertBlocksAfter
        }
      )
    ] })
  ] });
}
//# sourceMappingURL=edit.cjs.map
