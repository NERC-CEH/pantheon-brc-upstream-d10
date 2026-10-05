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

// packages/block-library/src/table/state.js
var state_exports = {};
__export(state_exports, {
  createTable: () => createTable,
  deleteColumn: () => deleteColumn,
  deleteRow: () => deleteRow,
  getCellAttribute: () => getCellAttribute,
  getFirstRow: () => getFirstRow,
  insertColumn: () => insertColumn,
  insertRow: () => insertRow,
  isCellSelected: () => isCellSelected,
  isEmptyRow: () => isEmptyRow,
  isEmptyTableSection: () => isEmptyTableSection,
  toggleSection: () => toggleSection,
  updateSelectedCell: () => updateSelectedCell
});
module.exports = __toCommonJS(state_exports);
var INHERITED_COLUMN_ATTRIBUTES = ["align"];
function createTable({ rowCount, columnCount }) {
  return {
    body: Array.from({ length: rowCount }).map(() => ({
      cells: Array.from({ length: columnCount }).map(() => ({
        content: "",
        tag: "td"
      }))
    }))
  };
}
function getFirstRow(state) {
  if (!isEmptyTableSection(state.head)) {
    return state.head[0];
  }
  if (!isEmptyTableSection(state.body)) {
    return state.body[0];
  }
  if (!isEmptyTableSection(state.foot)) {
    return state.foot[0];
  }
}
function getCellAttribute(state, cellLocation, attributeName) {
  const { sectionName, rowIndex, columnIndex } = cellLocation;
  return state[sectionName]?.[rowIndex]?.cells?.[columnIndex]?.[attributeName];
}
function updateSelectedCell(state, selection, updateCell) {
  if (!selection) {
    return state;
  }
  const tableSections = Object.fromEntries(
    Object.entries(state).filter(
      ([key]) => ["head", "body", "foot"].includes(key)
    )
  );
  const { sectionName: selectionSectionName, rowIndex: selectionRowIndex } = selection;
  return Object.fromEntries(
    Object.entries(tableSections).map(([sectionName, section]) => {
      if (selectionSectionName && selectionSectionName !== sectionName) {
        return [sectionName, section];
      }
      return [
        sectionName,
        section.map((row, rowIndex) => {
          if (selectionRowIndex && selectionRowIndex !== rowIndex) {
            return row;
          }
          return {
            cells: row.cells.map(
              (cellAttributes, columnIndex) => {
                const cellLocation = {
                  sectionName,
                  columnIndex,
                  rowIndex
                };
                if (!isCellSelected(cellLocation, selection)) {
                  return cellAttributes;
                }
                return updateCell(cellAttributes);
              }
            )
          };
        })
      ];
    })
  );
}
function isCellSelected(cellLocation, selection) {
  if (!cellLocation || !selection) {
    return false;
  }
  switch (selection.type) {
    case "column":
      return selection.type === "column" && cellLocation.columnIndex === selection.columnIndex;
    case "cell":
      return selection.type === "cell" && cellLocation.sectionName === selection.sectionName && cellLocation.columnIndex === selection.columnIndex && cellLocation.rowIndex === selection.rowIndex;
  }
}
function insertRow(state, { sectionName, rowIndex, columnCount }) {
  const firstRow = getFirstRow(state);
  const cellCount = columnCount === void 0 ? firstRow?.cells?.length : columnCount;
  if (!cellCount) {
    return state;
  }
  return {
    [sectionName]: [
      ...state[sectionName].slice(0, rowIndex),
      {
        cells: Array.from({ length: cellCount }).map(
          (_, index) => {
            const firstCellInColumn = firstRow?.cells?.[index] ?? {};
            const inheritedAttributes = Object.fromEntries(
              Object.entries(firstCellInColumn).filter(
                ([key]) => INHERITED_COLUMN_ATTRIBUTES.includes(key)
              )
            );
            return {
              ...inheritedAttributes,
              content: "",
              tag: sectionName === "head" ? "th" : "td"
            };
          }
        )
      },
      ...state[sectionName].slice(rowIndex)
    ]
  };
}
function deleteRow(state, { sectionName, rowIndex }) {
  return {
    [sectionName]: state[sectionName].filter(
      (row, index) => index !== rowIndex
    )
  };
}
function insertColumn(state, { columnIndex }) {
  const tableSections = Object.fromEntries(
    Object.entries(state).filter(
      ([key]) => ["head", "body", "foot"].includes(key)
    )
  );
  return Object.fromEntries(
    Object.entries(tableSections).map(([sectionName, section]) => {
      if (isEmptyTableSection(section)) {
        return [sectionName, section];
      }
      return [
        sectionName,
        section.map((row) => {
          if (isEmptyRow(row) || row.cells.length < columnIndex) {
            return row;
          }
          return {
            cells: [
              ...row.cells.slice(0, columnIndex),
              {
                content: "",
                tag: sectionName === "head" ? "th" : "td"
              },
              ...row.cells.slice(columnIndex)
            ]
          };
        })
      ];
    })
  );
}
function deleteColumn(state, { columnIndex }) {
  const tableSections = Object.fromEntries(
    Object.entries(state).filter(
      ([key]) => ["head", "body", "foot"].includes(key)
    )
  );
  return Object.fromEntries(
    Object.entries(tableSections).map(([sectionName, section]) => {
      if (isEmptyTableSection(section)) {
        return [sectionName, section];
      }
      return [
        sectionName,
        section.map((row) => ({
          cells: row.cells.length >= columnIndex ? row.cells.filter(
            (cell, index) => index !== columnIndex
          ) : row.cells
        })).filter((row) => row.cells.length)
      ];
    })
  );
}
function toggleSection(state, sectionName) {
  if (!isEmptyTableSection(state[sectionName])) {
    return { [sectionName]: [] };
  }
  const columnCount = state.body?.[0]?.cells?.length ?? 1;
  return insertRow(state, { sectionName, rowIndex: 0, columnCount });
}
function isEmptyTableSection(section) {
  return !section || !section.length || section.every(isEmptyRow);
}
function isEmptyRow(row) {
  return !(row.cells && row.cells.length);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createTable,
  deleteColumn,
  deleteRow,
  getCellAttribute,
  getFirstRow,
  insertColumn,
  insertRow,
  isCellSelected,
  isEmptyRow,
  isEmptyTableSection,
  toggleSection,
  updateSelectedCell
});
//# sourceMappingURL=state.cjs.map
