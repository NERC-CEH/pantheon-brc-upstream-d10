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

// packages/block-library/src/terms-query/utils.js
var utils_exports = {};
__export(utils_exports, {
  usePublicTaxonomies: () => usePublicTaxonomies
});
module.exports = __toCommonJS(utils_exports);
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
function usePublicTaxonomies() {
  const taxonomies = (0, import_data.useSelect)(
    (select) => select(import_core_data.store).getTaxonomies({ per_page: -1 }),
    []
  );
  return (0, import_element.useMemo)(() => {
    return taxonomies?.filter(
      ({ visibility }) => visibility?.publicly_queryable
    ) || [];
  }, [taxonomies]);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  usePublicTaxonomies
});
//# sourceMappingURL=utils.cjs.map
