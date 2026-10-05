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

// packages/block-library/src/query-pagination/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => QueryPaginationEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_components = require("@wordpress/components");
var import_element = require("@wordpress/element");
var import_query_pagination_arrow_controls = require("./query-pagination-arrow-controls.cjs");
var import_query_pagination_label_control = require("./query-pagination-label-control.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function QueryPaginationEdit({
  attributes: { paginationArrow, showLabel },
  setAttributes,
  clientId
}) {
  const hasNextPreviousBlocks = (0, import_data.useSelect)(
    (select) => {
      const { getBlocks } = select(import_block_editor.store);
      const innerBlocks = getBlocks(clientId);
      return innerBlocks?.find((innerBlock) => {
        return [
          "core/query-pagination-next",
          "core/query-pagination-previous"
        ].includes(innerBlock.name);
      });
    },
    [clientId]
  );
  const { __unstableMarkNextChangeAsNotPersistent } = (0, import_data.useDispatch)(import_block_editor.store);
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const blockProps = (0, import_block_editor.useBlockProps)();
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps);
  (0, import_element.useEffect)(() => {
    if (paginationArrow === "none" && !showLabel) {
      __unstableMarkNextChangeAsNotPersistent();
      setAttributes({ showLabel: true });
    }
  }, [
    paginationArrow,
    setAttributes,
    showLabel,
    __unstableMarkNextChangeAsNotPersistent
  ]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    hasNextPreviousBlocks && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            paginationArrow: "none",
            showLabel: true
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => paginationArrow !== "none",
              label: (0, import_i18n.__)("Pagination arrow"),
              onDeselect: () => setAttributes({ paginationArrow: "none" }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_query_pagination_arrow_controls.QueryPaginationArrowControls,
                {
                  value: paginationArrow,
                  onChange: (value) => {
                    setAttributes({ paginationArrow: value });
                  }
                }
              )
            }
          ),
          paginationArrow !== "none" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !showLabel,
              label: (0, import_i18n.__)("Show text"),
              onDeselect: () => setAttributes({ showLabel: true }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_query_pagination_label_control.QueryPaginationLabelControl,
                {
                  value: showLabel,
                  onChange: (value) => {
                    setAttributes({ showLabel: value });
                  }
                }
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { ...innerBlocksProps })
  ] });
}
//# sourceMappingURL=edit.cjs.map
