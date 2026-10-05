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

// packages/block-library/src/query-pagination/query-pagination-arrow-controls.jsx
var query_pagination_arrow_controls_exports = {};
__export(query_pagination_arrow_controls_exports, {
  QueryPaginationArrowControls: () => QueryPaginationArrowControls
});
module.exports = __toCommonJS(query_pagination_arrow_controls_exports);
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_jsx_runtime = require("react/jsx-runtime");
function QueryPaginationArrowControls({ value, onChange }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_components.__experimentalToggleGroupControl,
    {
      label: (0, import_i18n.__)("Arrow"),
      value,
      onChange,
      help: (0, import_i18n.__)(
        "A decorative arrow appended to the next and previous page link."
      ),
      isBlock: true,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToggleGroupControlOption,
          {
            value: "none",
            label: (0, import_i18n._x)(
              "None",
              "Arrow option for Query Pagination Next/Previous blocks"
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToggleGroupControlOption,
          {
            value: "arrow",
            label: (0, import_i18n._x)(
              "Arrow",
              "Arrow option for Query Pagination Next/Previous blocks"
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToggleGroupControlOption,
          {
            value: "chevron",
            label: (0, import_i18n._x)(
              "Chevron",
              "Arrow option for Query Pagination Next/Previous blocks"
            )
          }
        )
      ]
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  QueryPaginationArrowControls
});
//# sourceMappingURL=query-pagination-arrow-controls.cjs.map
