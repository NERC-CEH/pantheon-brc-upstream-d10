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

// packages/block-library/src/column/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_i18n = require("@wordpress/i18n");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function ColumnInspectorControls({ width, setAttributes }) {
  const [availableUnits] = (0, import_block_editor.useSettings)("spacing.units");
  const units = (0, import_components.__experimentalUseCustomUnits)({
    availableUnits: availableUnits || ["%", "px", "em", "rem", "vw"]
  });
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.__experimentalToolsPanel,
    {
      label: (0, import_i18n.__)("Settings"),
      resetAll: () => {
        setAttributes({ width: void 0 });
      },
      dropdownMenuProps,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.__experimentalToolsPanelItem,
        {
          hasValue: () => width !== void 0,
          label: (0, import_i18n.__)("Width"),
          onDeselect: () => setAttributes({ width: void 0 }),
          isShownByDefault: true,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalUnitControl,
            {
              label: (0, import_i18n.__)("Width"),
              __unstableInputWidth: "calc(50% - 8px)",
              value: width || "",
              onChange: (nextWidth) => {
                nextWidth = 0 > parseFloat(nextWidth) ? "0" : nextWidth;
                setAttributes({ width: nextWidth });
              },
              units
            }
          )
        }
      )
    }
  );
}
function ColumnEdit({
  attributes: { verticalAlignment, width, templateLock, allowedBlocks },
  setAttributes,
  clientId
}) {
  const classes = (0, import_clsx.default)("block-core-columns", {
    [`is-vertically-aligned-${verticalAlignment}`]: verticalAlignment
  });
  const { columnsIds, hasChildBlocks, rootClientId } = (0, import_data.useSelect)(
    (select) => {
      const { getBlockOrder, getBlockRootClientId } = select(import_block_editor.store);
      const rootId = getBlockRootClientId(clientId);
      return {
        hasChildBlocks: getBlockOrder(clientId).length > 0,
        rootClientId: rootId,
        columnsIds: getBlockOrder(rootId)
      };
    },
    [clientId]
  );
  const { updateBlockAttributes } = (0, import_data.useDispatch)(import_block_editor.store);
  const updateAlignment = (value) => {
    setAttributes({ verticalAlignment: value });
    updateBlockAttributes(rootClientId, {
      verticalAlignment: null
    });
  };
  const widthWithUnit = Number.isFinite(width) ? width + "%" : width;
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: classes,
    style: widthWithUnit ? { flexBasis: widthWithUnit } : void 0
  });
  const columnsCount = columnsIds.length;
  const currentColumnPosition = columnsIds.indexOf(clientId) + 1;
  const label = (0, import_i18n.sprintf)(
    /* translators: 1: Block label (i.e. "Block: Column"), 2: Position of the selected block, 3: Total number of sibling blocks of the same type */
    (0, import_i18n.__)("%1$s (%2$d of %3$d)"),
    blockProps["aria-label"],
    currentColumnPosition,
    columnsCount
  );
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(
    { ...blockProps, "aria-label": label },
    {
      templateLock,
      allowedBlocks,
      renderAppender: hasChildBlocks ? false : import_block_editor.InnerBlocks.ButtonBlockAppender
    }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.BlockVerticalAlignmentToolbar,
      {
        onChange: updateAlignment,
        value: verticalAlignment,
        controls: ["top", "center", "bottom", "stretch"]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ColumnInspectorControls,
      {
        width,
        setAttributes
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...innerBlocksProps })
  ] });
}
var edit_default = ColumnEdit;
//# sourceMappingURL=edit.cjs.map
