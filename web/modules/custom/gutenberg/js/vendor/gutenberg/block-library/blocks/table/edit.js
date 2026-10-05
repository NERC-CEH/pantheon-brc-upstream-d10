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

// packages/block-library/src/table/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_element = require("@wordpress/element");
var import_block_editor = require("@wordpress/block-editor");
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_icons = require("@wordpress/icons");
var import_state = require("./state.cjs");
var import_caption = require("../utils/caption.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var ALIGNMENT_CONTROLS = [
  {
    icon: import_icons.alignLeft,
    title: (0, import_i18n.__)("Align column left"),
    align: "left"
  },
  {
    icon: import_icons.alignCenter,
    title: (0, import_i18n.__)("Align column center"),
    align: "center"
  },
  {
    icon: import_icons.alignRight,
    title: (0, import_i18n.__)("Align column right"),
    align: "right"
  }
];
var cellAriaLabel = {
  head: (0, import_i18n.__)("Header cell text"),
  body: (0, import_i18n.__)("Body cell text"),
  foot: (0, import_i18n.__)("Footer cell text")
};
var placeholder = {
  head: (0, import_i18n._x)("Header label", "table header"),
  foot: (0, import_i18n._x)("Footer label", "table footer")
};
function TSection({ name, ...props }) {
  const TagName = `t${name}`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...props });
}
function TableEdit({
  attributes,
  setAttributes,
  insertBlocksAfter,
  isSelected: isSingleSelected
}) {
  const { hasFixedLayout, head, foot } = attributes;
  const [initialRowCount, setInitialRowCount] = (0, import_element.useState)(2);
  const [initialColumnCount, setInitialColumnCount] = (0, import_element.useState)(2);
  const [selectedCell, setSelectedCell] = (0, import_element.useState)();
  const colorProps = (0, import_block_editor.__experimentalUseColorProps)(attributes);
  const borderProps = (0, import_block_editor.__experimentalUseBorderProps)(attributes);
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  const tableRef = (0, import_element.useRef)();
  const [hasTableCreated, setHasTableCreated] = (0, import_element.useState)(false);
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  function onChangeInitialColumnCount(count) {
    setInitialColumnCount(count);
  }
  function onChangeInitialRowCount(count) {
    setInitialRowCount(count);
  }
  function onCreateTable(event) {
    event.preventDefault();
    setAttributes(
      (0, import_state.createTable)({
        rowCount: parseInt(initialRowCount, 10) || 2,
        columnCount: parseInt(initialColumnCount, 10) || 2
      })
    );
    setHasTableCreated(true);
  }
  function onChangeFixedLayout() {
    setAttributes({ hasFixedLayout: !hasFixedLayout });
  }
  const onChange = (0, import_element.useCallback)(
    function(content) {
      if (!selectedCell) {
        return;
      }
      setAttributes(
        (currentAttributes) => (0, import_state.updateSelectedCell)(
          currentAttributes,
          selectedCell,
          (cellAttributes) => ({
            ...cellAttributes,
            content
          })
        )
      );
    },
    [selectedCell, setAttributes]
  );
  function onChangeColumnAlignment(align) {
    if (!selectedCell) {
      return;
    }
    const columnSelection = {
      type: "column",
      columnIndex: selectedCell.columnIndex
    };
    const newAttributes = (0, import_state.updateSelectedCell)(
      attributes,
      columnSelection,
      (cellAttributes) => ({
        ...cellAttributes,
        align
      })
    );
    setAttributes(newAttributes);
  }
  function getCellAlignment() {
    if (!selectedCell) {
      return;
    }
    return (0, import_state.getCellAttribute)(attributes, selectedCell, "align");
  }
  function onToggleHeaderSection() {
    setAttributes((0, import_state.toggleSection)(attributes, "head"));
  }
  function onToggleFooterSection() {
    setAttributes((0, import_state.toggleSection)(attributes, "foot"));
  }
  function onInsertRow(delta) {
    if (!selectedCell) {
      return;
    }
    const { sectionName, rowIndex } = selectedCell;
    const newRowIndex = rowIndex + delta;
    setAttributes(
      (0, import_state.insertRow)(attributes, {
        sectionName,
        rowIndex: newRowIndex
      })
    );
    setSelectedCell({
      sectionName,
      rowIndex: newRowIndex,
      columnIndex: 0,
      type: "cell"
    });
  }
  function onInsertRowBefore() {
    onInsertRow(0);
  }
  function onInsertRowAfter() {
    onInsertRow(1);
  }
  function onDeleteRow() {
    if (!selectedCell) {
      return;
    }
    const { sectionName, rowIndex } = selectedCell;
    setSelectedCell();
    setAttributes((0, import_state.deleteRow)(attributes, { sectionName, rowIndex }));
  }
  function onInsertColumn(delta = 0) {
    if (!selectedCell) {
      return;
    }
    const { columnIndex } = selectedCell;
    const newColumnIndex = columnIndex + delta;
    setAttributes(
      (0, import_state.insertColumn)(attributes, {
        columnIndex: newColumnIndex
      })
    );
    setSelectedCell({
      rowIndex: 0,
      columnIndex: newColumnIndex,
      type: "cell"
    });
  }
  function onInsertColumnBefore() {
    onInsertColumn(0);
  }
  function onInsertColumnAfter() {
    onInsertColumn(1);
  }
  function onDeleteColumn() {
    if (!selectedCell) {
      return;
    }
    const { sectionName, columnIndex } = selectedCell;
    setSelectedCell();
    setAttributes(
      (0, import_state.deleteColumn)(attributes, { sectionName, columnIndex })
    );
  }
  (0, import_element.useEffect)(() => {
    if (!isSingleSelected) {
      setSelectedCell();
    }
  }, [isSingleSelected]);
  (0, import_element.useEffect)(() => {
    if (hasTableCreated) {
      tableRef?.current?.querySelector('td div[contentEditable="true"]')?.focus();
      setHasTableCreated(false);
    }
  }, [hasTableCreated]);
  const sections = ["head", "body", "foot"].filter(
    (name) => !(0, import_state.isEmptyTableSection)(attributes[name])
  );
  const tableControls = [
    {
      icon: import_icons.tableRowBefore,
      title: (0, import_i18n.__)("Insert row before"),
      isDisabled: !selectedCell,
      onClick: onInsertRowBefore
    },
    {
      icon: import_icons.tableRowAfter,
      title: (0, import_i18n.__)("Insert row after"),
      isDisabled: !selectedCell,
      onClick: onInsertRowAfter
    },
    {
      icon: import_icons.tableRowDelete,
      title: (0, import_i18n.__)("Delete row"),
      isDisabled: !selectedCell,
      onClick: onDeleteRow
    },
    {
      icon: import_icons.tableColumnBefore,
      title: (0, import_i18n.__)("Insert column before"),
      isDisabled: !selectedCell,
      onClick: onInsertColumnBefore
    },
    {
      icon: import_icons.tableColumnAfter,
      title: (0, import_i18n.__)("Insert column after"),
      isDisabled: !selectedCell,
      onClick: onInsertColumnAfter
    },
    {
      icon: import_icons.tableColumnDelete,
      title: (0, import_i18n.__)("Delete column"),
      isDisabled: !selectedCell,
      onClick: onDeleteColumn
    }
  ];
  const renderedSections = sections.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TSection, { name, children: attributes[name].map(({ cells }, rowIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: cells.map((cellProps, columnIndex) => {
    const isSelected = selectedCell?.sectionName === name && selectedCell?.rowIndex === rowIndex && selectedCell?.columnIndex === columnIndex;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      Cell,
      {
        name,
        rowIndex,
        columnIndex,
        onChange: (
          // Only pass the `onChange` handler to the selectedCell.
          // Cell components are memoized, so it's best to avoid
          // passing in a value that will cause all cells to re-render
          // whenever it changes.
          isSelected ? onChange : void 0
        ),
        setSelectedCell,
        ...cellProps
      },
      columnIndex
    );
  }) }, rowIndex)) }, name));
  const isEmpty = !sections.length;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...(0, import_block_editor.useBlockProps)({ ref: tableRef }), children: [
    !isEmpty && blockEditingMode === "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.AlignmentControl,
        {
          label: (0, import_i18n.__)("Align column content"),
          alignmentControls: ALIGNMENT_CONTROLS,
          value: getCellAlignment(),
          onChange: (nextAlign) => onChangeColumnAlignment(nextAlign)
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.ToolbarDropdownMenu,
        {
          icon: import_icons.table,
          label: (0, import_i18n.__)("Edit table"),
          controls: tableControls
        }
      ) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            hasFixedLayout: true,
            head: [],
            foot: []
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => hasFixedLayout !== true,
              label: (0, import_i18n.__)("Fixed width table cells"),
              onDeselect: () => setAttributes({ hasFixedLayout: true }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Fixed width table cells"),
                  checked: !!hasFixedLayout,
                  onChange: onChangeFixedLayout
                }
              )
            }
          ),
          !isEmpty && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.__experimentalToolsPanelItem,
              {
                hasValue: () => head && head.length,
                label: (0, import_i18n.__)("Header section"),
                onDeselect: () => setAttributes({ head: [] }),
                isShownByDefault: true,
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.ToggleControl,
                  {
                    label: (0, import_i18n.__)("Header section"),
                    checked: !!(head && head.length),
                    onChange: onToggleHeaderSection
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.__experimentalToolsPanelItem,
              {
                hasValue: () => foot && foot.length,
                label: (0, import_i18n.__)("Footer section"),
                onDeselect: () => setAttributes({ foot: [] }),
                isShownByDefault: true,
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.ToggleControl,
                  {
                    label: (0, import_i18n.__)("Footer section"),
                    checked: !!(foot && foot.length),
                    onChange: onToggleFooterSection
                  }
                )
              }
            )
          ] })
        ]
      }
    ) }),
    !isEmpty && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "table",
      {
        className: (0, import_clsx.default)(
          colorProps.className,
          borderProps.className,
          {
            "has-fixed-layout": hasFixedLayout,
            // This is required in the editor only to overcome
            // the fact the editor rewrites individual border
            // widths into a shorthand format.
            "has-individual-borders": (0, import_components.__experimentalHasSplitBorders)(
              attributes?.style?.border
            )
          }
        ),
        style: { ...colorProps.style, ...borderProps.style },
        children: renderedSections
      }
    ),
    isEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Placeholder,
      {
        label: (0, import_i18n.__)("Table"),
        icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, { icon: import_icons.blockTable, showColors: true }),
        instructions: (0, import_i18n.__)("Insert a table for sharing data."),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "form",
          {
            className: "blocks-table__placeholder-form",
            onSubmit: onCreateTable,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.TextControl,
                {
                  type: "number",
                  label: (0, import_i18n.__)("Column count"),
                  value: initialColumnCount,
                  onChange: onChangeInitialColumnCount,
                  min: "1",
                  className: "blocks-table__placeholder-input"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.TextControl,
                {
                  type: "number",
                  label: (0, import_i18n.__)("Row count"),
                  value: initialRowCount,
                  onChange: onChangeInitialRowCount,
                  min: "1",
                  className: "blocks-table__placeholder-input"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.Button,
                {
                  __next40pxDefaultSize: true,
                  variant: "primary",
                  type: "submit",
                  children: (0, import_i18n.__)("Create Table")
                }
              )
            ]
          }
        )
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_caption.Caption,
      {
        attributes,
        setAttributes,
        isSelected: isSingleSelected,
        insertBlocksAfter,
        label: (0, import_i18n.__)("Table caption text"),
        showToolbarButton: isSingleSelected && blockEditingMode === "default"
      }
    )
  ] });
}
var Cell = (0, import_element.memo)(function({
  tag: CellTag,
  name,
  scope,
  colspan,
  rowspan,
  rowIndex,
  columnIndex,
  align,
  content,
  onChange,
  setSelectedCell
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    CellTag,
    {
      scope: CellTag === "th" ? scope : void 0,
      colSpan: colspan,
      rowSpan: rowspan,
      className: (0, import_clsx.default)(
        {
          [`has-text-align-${align}`]: align
        },
        "wp-block-table__cell-content"
      ),
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText,
        {
          identifier: `${name}.${rowIndex}.cells.${columnIndex}.content`,
          value: content,
          onChange,
          onFocus: () => {
            setSelectedCell({
              sectionName: name,
              rowIndex,
              columnIndex,
              type: "cell"
            });
          },
          "aria-label": cellAriaLabel[name],
          placeholder: placeholder[name]
        }
      )
    }
  );
});
var edit_default = TableEdit;
//# sourceMappingURL=edit.cjs.map
