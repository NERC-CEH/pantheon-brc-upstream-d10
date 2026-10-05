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

// packages/block-library/src/list/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => Edit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var import_blocks = require("@wordpress/blocks");
var import_element = require("@wordpress/element");
var import_deprecated = __toESM(require("@wordpress/deprecated"));
var import_ordered_list_settings = __toESM(require("./ordered-list-settings.cjs"));
var import_utils = require("./utils.cjs");
var import_tag_name = __toESM(require("./tag-name.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var DEFAULT_BLOCK = {
  name: "core/list-item"
};
function useMigrateOnLoad(attributes, clientId) {
  const registry = (0, import_data.useRegistry)();
  const { updateBlockAttributes, replaceInnerBlocks, selectBlock } = (0, import_data.useDispatch)(import_block_editor.store);
  (0, import_element.useEffect)(() => {
    if (!attributes.values) {
      return;
    }
    const [newAttributes, newInnerBlocks] = (0, import_utils.migrateToListV2)(attributes);
    (0, import_deprecated.default)("Value attribute on the list block", {
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
  }, [attributes.values]);
}
function useOutdentList(clientId) {
  const { replaceBlocks, selectionChange } = (0, import_data.useDispatch)(import_block_editor.store);
  const { getBlockRootClientId, getBlockAttributes, getBlock } = (0, import_data.useSelect)(import_block_editor.store);
  return (0, import_element.useCallback)(() => {
    const parentBlockId = getBlockRootClientId(clientId);
    const parentBlockAttributes = getBlockAttributes(parentBlockId);
    const newParentBlock = (0, import_blocks.createBlock)(
      "core/list-item",
      parentBlockAttributes
    );
    const { innerBlocks } = getBlock(clientId);
    replaceBlocks([parentBlockId], [newParentBlock, ...innerBlocks]);
    selectionChange(innerBlocks[innerBlocks.length - 1].clientId);
  }, [clientId]);
}
function IndentUI({ clientId }) {
  const outdentList = useOutdentList(clientId);
  const canOutdent = (0, import_data.useSelect)(
    (select) => {
      const { getBlockRootClientId, getBlockName } = select(import_block_editor.store);
      return getBlockName(getBlockRootClientId(clientId)) === "core/list-item";
    },
    [clientId]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.ToolbarButton,
    {
      icon: (0, import_i18n.isRTL)() ? import_icons.formatOutdentRTL : import_icons.formatOutdent,
      title: (0, import_i18n.__)("Outdent"),
      description: (0, import_i18n.__)("Outdent list item"),
      disabled: !canOutdent,
      onClick: outdentList
    }
  ) });
}
function Edit({ attributes, setAttributes, clientId }) {
  const { ordered, type, reversed, start } = attributes;
  const blockProps = (0, import_block_editor.useBlockProps)({
    style: {
      listStyleType: ordered && type !== "decimal" ? type : void 0
    }
  });
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    defaultBlock: DEFAULT_BLOCK,
    directInsert: true,
    templateLock: false,
    __experimentalCaptureToolbars: true
  });
  useMigrateOnLoad(attributes, clientId);
  const controls = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_block_editor.BlockControls, { group: "block", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarButton,
      {
        icon: (0, import_i18n.isRTL)() ? import_icons.formatListBulletsRTL : import_icons.formatListBullets,
        title: (0, import_i18n.__)("Unordered"),
        description: (0, import_i18n.__)("Convert to unordered list"),
        isActive: ordered === false,
        onClick: () => {
          setAttributes({ ordered: false });
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarButton,
      {
        icon: (0, import_i18n.isRTL)() ? import_icons.formatListNumberedRTL : import_icons.formatListNumbered,
        title: (0, import_i18n.__)("Ordered"),
        description: (0, import_i18n.__)("Convert to ordered list"),
        isActive: ordered === true,
        onClick: () => {
          setAttributes({ ordered: true });
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndentUI, { clientId })
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_tag_name.default,
      {
        ordered,
        reversed,
        start,
        ...innerBlocksProps
      }
    ),
    controls,
    ordered && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_ordered_list_settings.default,
      {
        ...{
          setAttributes,
          reversed,
          start,
          type
        }
      }
    )
  ] });
}
//# sourceMappingURL=edit.cjs.map
