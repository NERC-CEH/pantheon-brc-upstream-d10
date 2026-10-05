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

// packages/block-library/src/columns/edit.jsx
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
var import_utils = require("./utils.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var DEFAULT_BLOCK = {
  name: "core/column"
};
function ColumnInspectorControls({
  clientId,
  setAttributes,
  isStackedOnMobile
}) {
  const { count, canInsertColumnBlock, minCount } = (0, import_data.useSelect)(
    (select) => {
      const { canInsertBlockType, canRemoveBlock, getBlockOrder } = select(import_block_editor.store);
      const blockOrder = getBlockOrder(clientId);
      const preventRemovalBlockIndexes = blockOrder.reduce(
        (acc, blockId, index) => {
          if (!canRemoveBlock(blockId)) {
            acc.push(index);
          }
          return acc;
        },
        []
      );
      return {
        count: blockOrder.length,
        canInsertColumnBlock: canInsertBlockType(
          "core/column",
          clientId
        ),
        minCount: Math.max(...preventRemovalBlockIndexes) + 1
      };
    },
    [clientId]
  );
  const { getBlocks } = (0, import_data.useSelect)(import_block_editor.store);
  const { replaceInnerBlocks } = (0, import_data.useDispatch)(import_block_editor.store);
  function updateColumns(previousColumns, newColumns) {
    let innerBlocks = getBlocks(clientId);
    const hasExplicitWidths = (0, import_utils.hasExplicitPercentColumnWidths)(innerBlocks);
    const isAddingColumn = newColumns > previousColumns;
    if (isAddingColumn && hasExplicitWidths) {
      const newColumnWidth = (0, import_utils.toWidthPrecision)(100 / newColumns);
      const newlyAddedColumns = newColumns - previousColumns;
      const widths = (0, import_utils.getRedistributedColumnWidths)(
        innerBlocks,
        100 - newColumnWidth * newlyAddedColumns
      );
      innerBlocks = [
        ...(0, import_utils.getMappedColumnWidths)(innerBlocks, widths),
        ...Array.from({
          length: newlyAddedColumns
        }).map(() => {
          return (0, import_blocks.createBlock)("core/column", {
            width: `${newColumnWidth}%`
          });
        })
      ];
    } else if (isAddingColumn) {
      innerBlocks = [
        ...innerBlocks,
        ...Array.from({
          length: newColumns - previousColumns
        }).map(() => {
          return (0, import_blocks.createBlock)("core/column");
        })
      ];
    } else if (newColumns < previousColumns) {
      innerBlocks = innerBlocks.slice(
        0,
        -(previousColumns - newColumns)
      );
      if (hasExplicitWidths) {
        const widths = (0, import_utils.getRedistributedColumnWidths)(innerBlocks, 100);
        innerBlocks = (0, import_utils.getMappedColumnWidths)(innerBlocks, widths);
      }
    }
    replaceInnerBlocks(clientId, innerBlocks);
  }
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_components.__experimentalToolsPanel,
    {
      label: (0, import_i18n.__)("Settings"),
      resetAll: () => {
        setAttributes({
          isStackedOnMobile: true
        });
      },
      dropdownMenuProps,
      children: [
        canInsertColumnBlock && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, { spacing: 4, style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.RangeControl,
            {
              label: (0, import_i18n.__)("Columns"),
              value: count,
              onChange: (value) => updateColumns(count, Math.max(minCount, value)),
              min: Math.max(1, minCount),
              max: Math.max(6, count)
            }
          ),
          count > 6 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Notice, { status: "warning", isDismissible: false, children: (0, import_i18n.__)(
            "This column count exceeds the recommended amount and may cause visual breakage."
          ) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Stack on mobile"),
            isShownByDefault: true,
            hasValue: () => isStackedOnMobile !== true,
            onDeselect: () => setAttributes({
              isStackedOnMobile: true
            }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Stack on mobile"),
                checked: isStackedOnMobile,
                onChange: () => setAttributes({
                  isStackedOnMobile: !isStackedOnMobile
                })
              }
            )
          }
        )
      ]
    }
  );
}
function ColumnsEditContainer({ attributes, setAttributes, clientId }) {
  const { isStackedOnMobile, verticalAlignment, templateLock } = attributes;
  const registry = (0, import_data.useRegistry)();
  const { getBlockOrder } = (0, import_data.useSelect)(import_block_editor.store);
  const { updateBlockAttributes } = (0, import_data.useDispatch)(import_block_editor.store);
  const classes = (0, import_clsx.default)({
    [`are-vertically-aligned-${verticalAlignment}`]: verticalAlignment,
    [`is-not-stacked-on-mobile`]: !isStackedOnMobile
  });
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: classes
  });
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    defaultBlock: DEFAULT_BLOCK,
    directInsert: true,
    orientation: "horizontal",
    renderAppender: false,
    templateLock
  });
  function updateAlignment(newVerticalAlignment) {
    const innerBlockClientIds = getBlockOrder(clientId);
    registry.batch(() => {
      setAttributes({ verticalAlignment: newVerticalAlignment });
      updateBlockAttributes(innerBlockClientIds, {
        verticalAlignment: newVerticalAlignment
      });
    });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.BlockVerticalAlignmentToolbar,
      {
        onChange: updateAlignment,
        value: verticalAlignment
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ColumnInspectorControls,
      {
        clientId,
        setAttributes,
        isStackedOnMobile
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...innerBlocksProps })
  ] });
}
function Placeholder({ clientId, name, setAttributes }) {
  const { blockType, variations } = (0, import_data.useSelect)(
    (select) => {
      const { getBlockVariations, getBlockType } = select(import_blocks.store);
      return {
        blockType: getBlockType(name),
        variations: getBlockVariations(name, "block")
      };
    },
    [name]
  );
  const { replaceInnerBlocks } = (0, import_data.useDispatch)(import_block_editor.store);
  const blockProps = (0, import_block_editor.useBlockProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.__experimentalBlockVariationPicker,
    {
      icon: blockType?.icon?.src,
      label: blockType?.title,
      variations,
      instructions: (0, import_i18n.__)("Divide into columns. Select a layout:"),
      onSelect: (nextVariation) => {
        if (nextVariation.attributes) {
          setAttributes(nextVariation.attributes);
        }
        if (nextVariation.innerBlocks) {
          replaceInnerBlocks(
            clientId,
            (0, import_blocks.createBlocksFromInnerBlocksTemplate)(
              nextVariation.innerBlocks
            ),
            true
          );
        }
      }
    }
  ) });
}
var ColumnsEdit = (props) => {
  const { clientId } = props;
  const hasInnerBlocks = (0, import_data.useSelect)(
    (select) => select(import_block_editor.store).getBlocks(clientId).length > 0,
    [clientId]
  );
  const Component = hasInnerBlocks ? ColumnsEditContainer : Placeholder;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, { ...props });
};
var edit_default = ColumnsEdit;
//# sourceMappingURL=edit.cjs.map
