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

// packages/block-library/src/footnotes/format.jsx
var format_exports = {};
__export(format_exports, {
  format: () => format,
  formatName: () => formatName
});
module.exports = __toCommonJS(format_exports);
var import_uuid = require("uuid");
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var import_rich_text = require("@wordpress/rich-text");
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_core_data = require("@wordpress/core-data");
var import_blocks = require("@wordpress/blocks");
var import_lock_unlock = require("../lock-unlock.cjs");
var import__ = require("./index.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var formatName = "core/footnote";
var { usesContextKey } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
var POST_CONTENT_BLOCK_NAME = "core/post-content";
var SYNCED_PATTERN_BLOCK_NAME = "core/block";
var format = {
  title: (0, import_i18n.__)("Footnote"),
  tagName: "sup",
  className: "fn",
  attributes: {
    "data-fn": "data-fn"
  },
  interactive: true,
  contentEditable: false,
  [usesContextKey]: ["postType", "postId"],
  edit: function Edit({
    value,
    onChange,
    isObjectActive,
    context: { postType, postId }
  }) {
    const registry = (0, import_data.useRegistry)();
    const {
      getSelectedBlockClientId,
      getBlocks,
      getBlockRootClientId,
      getBlockName,
      getBlockParentsByBlockName
    } = registry.select(import_block_editor.store);
    const isFootnotesSupported = (0, import_data.useSelect)(
      (select) => {
        if (!select(import_blocks.store).getBlockType("core/footnotes")) {
          return false;
        }
        const allowedBlocks = select(import_block_editor.store).getSettings().allowedBlockTypes;
        if (allowedBlocks === false || Array.isArray(allowedBlocks) && !allowedBlocks.includes("core/footnotes")) {
          return false;
        }
        const entityRecord = select(import_core_data.store).getEntityRecord(
          "postType",
          postType,
          postId
        );
        if ("string" !== typeof entityRecord?.meta?.footnotes) {
          return false;
        }
        const {
          getBlockParentsByBlockName: _getBlockParentsByBlockName,
          getSelectedBlockClientId: _getSelectedBlockClientId,
          getBlockName: _getBlockName
        } = select(import_block_editor.store);
        const selectedClientId = _getSelectedBlockClientId();
        if (!selectedClientId) {
          return false;
        }
        if (_getBlockName(selectedClientId) === import__.name) {
          return false;
        }
        const parentCoreBlocks = _getBlockParentsByBlockName(
          selectedClientId,
          SYNCED_PATTERN_BLOCK_NAME
        );
        return !parentCoreBlocks || parentCoreBlocks.length === 0;
      },
      [postType, postId]
    );
    const { selectionChange, insertBlock } = (0, import_data.useDispatch)(import_block_editor.store);
    if (!isFootnotesSupported) {
      return null;
    }
    function onClick() {
      registry.batch(() => {
        let id;
        if (isObjectActive) {
          const object = value.replacements[value.start];
          id = object?.attributes?.["data-fn"];
        } else {
          id = `fn-${(0, import_uuid.v4)()}`;
          const newValue = (0, import_rich_text.insertObject)(
            value,
            {
              type: formatName,
              attributes: {
                "data-fn": id
              },
              innerHTML: `<a href="#${id}" id="${id}-link">*</a>`
            },
            value.end,
            value.end
          );
          newValue.start = newValue.end - 1;
          onChange(newValue);
        }
        const selectedClientId = getSelectedBlockClientId();
        const parentPostContent = getBlockParentsByBlockName(
          selectedClientId,
          POST_CONTENT_BLOCK_NAME
        );
        const blocks = parentPostContent.length ? getBlocks(parentPostContent[0]) : getBlocks();
        let fnBlock = null;
        {
          const queue = [...blocks];
          while (queue.length) {
            const block = queue.shift();
            if (block.name === "core/footnotes") {
              fnBlock = block;
              break;
            }
            queue.push(...block.innerBlocks);
          }
        }
        if (!fnBlock) {
          let rootClientId = getBlockRootClientId(selectedClientId);
          while (rootClientId && getBlockName(rootClientId) !== POST_CONTENT_BLOCK_NAME) {
            rootClientId = getBlockRootClientId(rootClientId);
          }
          fnBlock = (0, import_blocks.createBlock)("core/footnotes");
          insertBlock(fnBlock, void 0, rootClientId);
        }
        selectionChange(fnBlock.clientId, id, 0, 0);
      });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.RichTextToolbarButton,
      {
        icon: import_icons.formatListNumbered,
        title: (0, import_i18n.__)("Footnote"),
        onClick,
        isActive: isObjectActive
      }
    );
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  format,
  formatName
});
//# sourceMappingURL=format.cjs.map
