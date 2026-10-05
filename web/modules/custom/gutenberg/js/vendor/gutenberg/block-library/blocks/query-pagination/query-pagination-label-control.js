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

// packages/block-library/src/query-pagination/query-pagination-label-control.jsx
var query_pagination_label_control_exports = {};
__export(query_pagination_label_control_exports, {
  QueryPaginationLabelControl: () => QueryPaginationLabelControl
});
module.exports = __toCommonJS(query_pagination_label_control_exports);
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_jsx_runtime = require("react/jsx-runtime");
function QueryPaginationLabelControl({ value, onChange }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.ToggleControl,
    {
      label: (0, import_i18n.__)("Show label text"),
      help: (0, import_i18n.__)('Make label text visible, e.g. "Next Page".'),
      onChange,
      checked: value === true
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  QueryPaginationLabelControl
});
//# sourceMappingURL=query-pagination-label-control.cjs.map
