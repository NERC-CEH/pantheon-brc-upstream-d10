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

// packages/block-library/src/columns/utils.js
var utils_exports = {};
__export(utils_exports, {
  getColumnWidths: () => getColumnWidths,
  getEffectiveColumnWidth: () => getEffectiveColumnWidth,
  getMappedColumnWidths: () => getMappedColumnWidths,
  getRedistributedColumnWidths: () => getRedistributedColumnWidths,
  getTotalColumnsWidth: () => getTotalColumnsWidth,
  getWidthWithUnit: () => getWidthWithUnit,
  getWidths: () => getWidths,
  hasExplicitPercentColumnWidths: () => hasExplicitPercentColumnWidths,
  isPercentageUnit: () => isPercentageUnit,
  toWidthPrecision: () => toWidthPrecision
});
module.exports = __toCommonJS(utils_exports);
var toWidthPrecision = (value) => {
  const unitlessValue = parseFloat(value);
  return Number.isFinite(unitlessValue) ? parseFloat(unitlessValue.toFixed(2)) : void 0;
};
function getEffectiveColumnWidth(block, totalBlockCount) {
  const { width = 100 / totalBlockCount } = block.attributes;
  return toWidthPrecision(width);
}
function getTotalColumnsWidth(blocks, totalBlockCount = blocks.length) {
  return blocks.reduce(
    (sum, block) => sum + getEffectiveColumnWidth(block, totalBlockCount),
    0
  );
}
function getColumnWidths(blocks, totalBlockCount = blocks.length) {
  return blocks.reduce((accumulator, block) => {
    const width = getEffectiveColumnWidth(block, totalBlockCount);
    return Object.assign(accumulator, { [block.clientId]: width });
  }, {});
}
function getRedistributedColumnWidths(blocks, availableWidth, totalBlockCount = blocks.length) {
  const totalWidth = getTotalColumnsWidth(blocks, totalBlockCount);
  return Object.fromEntries(
    Object.entries(getColumnWidths(blocks, totalBlockCount)).map(
      ([clientId, width]) => {
        const newWidth = availableWidth * width / totalWidth;
        return [clientId, toWidthPrecision(newWidth)];
      }
    )
  );
}
function hasExplicitPercentColumnWidths(blocks) {
  return blocks.every((block) => {
    const blockWidth = block.attributes.width;
    return Number.isFinite(
      blockWidth?.endsWith?.("%") ? parseFloat(blockWidth) : blockWidth
    );
  });
}
function getMappedColumnWidths(blocks, widths) {
  return blocks.map((block) => ({
    ...block,
    attributes: {
      ...block.attributes,
      width: `${widths[block.clientId]}%`
    }
  }));
}
function getWidths(blocks, withParsing = true) {
  return blocks.map((innerColumn) => {
    const innerColumnWidth = innerColumn.attributes.width || 100 / blocks.length;
    return withParsing ? parseFloat(innerColumnWidth) : innerColumnWidth;
  });
}
function getWidthWithUnit(width, unit) {
  width = 0 > parseFloat(width) ? "0" : width;
  if (isPercentageUnit(unit)) {
    width = Math.min(width, 100);
  }
  return `${width}${unit}`;
}
function isPercentageUnit(unit) {
  return unit === "%";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getColumnWidths,
  getEffectiveColumnWidth,
  getMappedColumnWidths,
  getRedistributedColumnWidths,
  getTotalColumnsWidth,
  getWidthWithUnit,
  getWidths,
  hasExplicitPercentColumnWidths,
  isPercentageUnit,
  toWidthPrecision
});
//# sourceMappingURL=utils.cjs.map
