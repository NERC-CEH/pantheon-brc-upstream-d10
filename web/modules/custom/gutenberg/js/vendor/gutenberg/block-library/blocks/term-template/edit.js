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

// packages/block-library/src/term-template/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => TermTemplateEdit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_components = require("@wordpress/components");
var import_icons = require("@wordpress/icons");
var import_element = require("@wordpress/element");
var import_data = require("@wordpress/data");
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_core_data = require("@wordpress/core-data");
var import_jsx_runtime = require("react/jsx-runtime");
var INNER_BLOCKS_LAYOUT = { type: "default" };
function TermTemplateInnerBlocks({ classList }) {
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(
    { className: (0, import_clsx.default)("wp-block-term", classList) },
    {
      __unstableDisableLayoutClassNames: true,
      layout: INNER_BLOCKS_LAYOUT
    }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { ...innerBlocksProps });
}
function TermTemplateBlockPreview({
  blocks,
  blockContextId,
  classList,
  isHidden,
  setActiveBlockContextId
}) {
  const blockPreviewProps = (0, import_block_editor.__experimentalUseBlockPreview)({
    blocks,
    props: {
      className: (0, import_clsx.default)("wp-block-term", classList)
    }
  });
  const handleOnClick = () => {
    setActiveBlockContextId(blockContextId);
  };
  const style = {
    display: isHidden ? "none" : void 0
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "li",
    {
      ...blockPreviewProps,
      tabIndex: 0,
      role: "button",
      onClick: handleOnClick,
      onKeyPress: handleOnClick,
      style
    }
  );
}
var MemoizedTermTemplateBlockPreview = (0, import_element.memo)(TermTemplateBlockPreview);
function TermTemplateEdit({
  clientId,
  attributes: { layout },
  setAttributes,
  context: {
    termQuery: {
      taxonomy,
      order,
      orderBy,
      hideEmpty,
      showNested = false,
      perPage,
      include
    } = {}
  },
  __unstableLayoutClassNames
}) {
  const { type: layoutType, columnCount = 3 } = layout || {};
  const [activeBlockContextId, setActiveBlockContextId] = (0, import_element.useState)();
  const queryArgs = {
    hide_empty: hideEmpty,
    order,
    orderby: orderBy,
    // There is a mismatch between `WP_Term_Query` and the REST API parameter default
    // values to fetch all items. In `WP_Term_Query`, the default is `''|0` and in
    // the REST API is `-1`.
    per_page: perPage || -1
  };
  if (!showNested && !include?.length) {
    queryArgs.parent = 0;
  }
  if (include?.length) {
    queryArgs.include = include;
    queryArgs.orderby = "include";
    queryArgs.order = "asc";
  }
  const { records: terms } = (0, import_core_data.useEntityRecords)(
    "taxonomy",
    taxonomy,
    queryArgs
  );
  const blocks = (0, import_data.useSelect)(
    (select) => select(import_block_editor.store).getBlocks(clientId),
    [clientId]
  );
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: __unstableLayoutClassNames
  });
  const blockContexts = (0, import_element.useMemo)(
    () => terms?.map((term) => ({
      taxonomy,
      termId: term.id,
      classList: `term-${term.id}`,
      termData: term
    })),
    [terms, taxonomy]
  );
  if (!terms) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { className: "wp-block-term term-loading", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "term-loading-placeholder" }) }) });
  }
  if (!terms.length) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { ...blockProps, children: [
      " ",
      (0, import_i18n.__)("No terms found.")
    ] });
  }
  const setDisplayLayout = (newDisplayLayout) => setAttributes((prevAttributes) => ({
    layout: { ...prevAttributes.layout, ...newDisplayLayout }
  }));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarGroup,
      {
        controls: [
          {
            icon: import_icons.list,
            title: (0, import_i18n._x)(
              "List view",
              "Term template block display setting"
            ),
            onClick: () => setDisplayLayout({ type: "default" }),
            isActive: layoutType === "default" || layoutType === "constrained"
          },
          {
            icon: import_icons.grid,
            title: (0, import_i18n._x)(
              "Grid view",
              "Term template block display setting"
            ),
            onClick: () => setDisplayLayout({
              type: "grid",
              columnCount
            }),
            isActive: layoutType === "grid"
          }
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { ...blockProps, children: blockContexts?.map((blockContext) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_block_editor.BlockContextProvider,
      {
        value: blockContext,
        children: [
          blockContext.termId === (activeBlockContextId || blockContexts[0]?.termId) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            TermTemplateInnerBlocks,
            {
              classList: blockContext.classList
            }
          ) : null,
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            MemoizedTermTemplateBlockPreview,
            {
              blocks,
              blockContextId: blockContext.termId,
              classList: blockContext.classList,
              setActiveBlockContextId,
              isHidden: blockContext.termId === (activeBlockContextId || blockContexts[0]?.termId)
            }
          )
        ]
      },
      blockContext.termId
    )) })
  ] });
}
//# sourceMappingURL=edit.cjs.map
