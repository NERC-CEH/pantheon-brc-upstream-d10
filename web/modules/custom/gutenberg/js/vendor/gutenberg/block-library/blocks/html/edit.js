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

// packages/block-library/src/html/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => HTMLEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_element = require("@wordpress/element");
var import_block_editor = require("@wordpress/block-editor");
var import_blocks = require("@wordpress/blocks");
var import_data = require("@wordpress/data");
var import_deprecated = __toESM(require("@wordpress/deprecated"));
var import_components = require("@wordpress/components");
var import_icons = require("@wordpress/icons");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_modal = __toESM(require("./modal.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var { InnerContent } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
function HTMLEdit({ clientId, attributes }) {
  const [isModalOpen, setIsModalOpen] = (0, import_element.useState)(false);
  const registry = (0, import_data.useRegistry)();
  const { updateBlock, replaceInnerBlocks } = (0, import_data.useDispatch)(import_block_editor.store);
  const content = (0, import_data.useSelect)(
    (select) => {
      const block = select(import_block_editor.store).getBlock(clientId);
      return block ? (0, import_blocks.getBlockContent)(block) : "";
    },
    [clientId]
  );
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: "block-library-html__edit"
  });
  const onUpdate = (nextContent) => {
    if (nextContent === content) {
      return;
    }
    const [parsedBlock] = (0, import_blocks.parse)(
      `<!-- wp:html -->
${nextContent}
<!-- /wp:html -->`
    );
    const nextInnerBlocks = parsedBlock?.innerBlocks ?? [];
    const prevInnerBlocks = registry.select(import_block_editor.store).getBlocks(clientId);
    const innerBlocksUnchanged = prevInnerBlocks.length === nextInnerBlocks.length && prevInnerBlocks.every(
      (block, index) => (0, import_blocks.serialize)(block) === (0, import_blocks.serialize)(nextInnerBlocks[index])
    );
    registry.batch(() => {
      updateBlock(clientId, {
        innerContent: parsedBlock?.innerContent ?? (nextContent ? [nextContent] : [])
      });
      if (!innerBlocksUnchanged) {
        replaceInnerBlocks(clientId, nextInnerBlocks, false);
      }
    });
  };
  (0, import_element.useEffect)(() => {
    if (!attributes.content) {
      return;
    }
    (0, import_deprecated.default)("The content attribute on the Custom HTML block", {
      since: "7.1",
      alternative: "inner content"
    });
    updateBlock(clientId, {
      attributes: { content: void 0 },
      innerContent: [attributes.content]
    });
  }, [attributes.content]);
  if (!content?.trim()) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.Placeholder,
        {
          icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, { icon: import_icons.code }),
          label: (0, import_i18n.__)("Custom HTML"),
          instructions: (0, import_i18n.__)(
            "Add custom HTML code and preview how it looks."
          ),
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.Button,
            {
              __next40pxDefaultSize: true,
              variant: "primary",
              onClick: () => setIsModalOpen(true),
              children: (0, import_i18n.__)("Edit HTML")
            }
          )
        }
      ),
      isModalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_modal.default,
        {
          onRequestClose: () => setIsModalOpen(false),
          content,
          onUpdate
        }
      )
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarButton, { onClick: () => setIsModalOpen(true), children: (0, import_i18n.__)("Edit code") }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalVStack, { className: "block-library-html__edit-code", expanded: true, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Button,
      {
        className: "block-library-html__edit-code-button",
        __next40pxDefaultSize: true,
        variant: "secondary",
        onClick: () => setIsModalOpen(true),
        children: (0, import_i18n.__)("Edit code")
      }
    ) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InnerContent, { clientId }),
    isModalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_modal.default,
      {
        onRequestClose: () => setIsModalOpen(false),
        content,
        onUpdate
      }
    )
  ] });
}
//# sourceMappingURL=edit.cjs.map
