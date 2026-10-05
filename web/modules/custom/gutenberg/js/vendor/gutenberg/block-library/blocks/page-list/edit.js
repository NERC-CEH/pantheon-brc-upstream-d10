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

// packages/block-library/src/page-list/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => PageListEdit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_blocks = require("@wordpress/blocks");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_element = require("@wordpress/element");
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
var import_use_convert_to_navigation_links = require("./use-convert-to-navigation-links.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var MAX_PAGE_COUNT = 100;
var NOOP = () => {
};
function DetachPageListDialog({ isBusy, onConfirm, onCancel }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.__experimentalConfirmDialog,
    {
      isOpen: true,
      title: (0, import_i18n.__)("Detach Page List"),
      __experimentalHideHeader: false,
      confirmButtonText: (0, import_i18n.__)("Detach"),
      onConfirm,
      onCancel,
      isBusy,
      size: "medium",
      children: (0, import_i18n.__)(
        "This Navigation Menu displays your website's pages. Detaching will enable you to add, delete, or reorder pages. However, new pages will no longer be added automatically."
      )
    }
  );
}
function BlockContent({
  blockProps,
  innerBlocksProps,
  hasResolvedPages,
  blockList,
  pages,
  parentPageID
}) {
  if (!hasResolvedPages) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-page-list__loading-indicator-container", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, { className: "wp-block-page-list__loading-indicator" }) }) });
  }
  if (pages === null) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Notice, { status: "warning", isDismissible: false, children: (0, import_i18n.__)("Page List: Cannot retrieve Pages.") }) });
  }
  if (pages.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Notice, { status: "info", isDismissible: false, children: (0, import_i18n.__)("Page List: Cannot retrieve Pages.") }) });
  }
  if (blockList.length === 0) {
    const parentPageDetails = pages.find(
      (page) => page.id === parentPageID
    );
    if (parentPageDetails?.title?.rendered) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.Warning, { children: (0, import_i18n.sprintf)(
        // translators: %s: Page title.
        (0, import_i18n.__)('Page List: "%s" page has no children.'),
        parentPageDetails.title.rendered
      ) }) });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Notice, { status: "warning", isDismissible: false, children: (0, import_i18n.__)("Page List: Cannot retrieve Pages.") }) });
  }
  if (pages.length > 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { ...innerBlocksProps });
  }
}
function PageListEdit({
  context,
  clientId,
  attributes,
  setAttributes
}) {
  const { parentPageID } = attributes;
  const [isConfirmingDetach, setIsConfirmingDetach] = (0, import_element.useState)(false);
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const { records: pages, hasResolved: hasResolvedPages } = (0, import_core_data.useEntityRecords)(
    "postType",
    "page",
    {
      per_page: MAX_PAGE_COUNT,
      _fields: ["id", "link", "menu_order", "parent", "title", "type"],
      // TODO: When https://core.trac.wordpress.org/ticket/39037 REST API support for multiple orderby
      // values is resolved, update 'orderby' to [ 'menu_order', 'post_title' ] to provide a consistent
      // sort.
      orderby: "menu_order",
      order: "asc"
    }
  );
  const allowConvertToLinks = "showSubmenuIcon" in context && pages?.length > 0 && pages?.length <= MAX_PAGE_COUNT;
  const pagesByParentId = (0, import_element.useMemo)(() => {
    if (pages === null) {
      return /* @__PURE__ */ new Map();
    }
    const sortedPages = pages.sort((a, b) => {
      if (a.menu_order === b.menu_order) {
        return a.title.rendered.localeCompare(b.title.rendered);
      }
      return a.menu_order - b.menu_order;
    });
    return sortedPages.reduce((accumulator, page) => {
      const { parent } = page;
      if (accumulator.has(parent)) {
        accumulator.get(parent).push(page);
      } else {
        accumulator.set(parent, [page]);
      }
      return accumulator;
    }, /* @__PURE__ */ new Map());
  }, [pages]);
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: (0, import_clsx.default)("wp-block-page-list", {
      "has-text-color": !!context.textColor,
      [(0, import_block_editor.getColorClassName)("color", context.textColor)]: !!context.textColor,
      "has-background": !!context.backgroundColor,
      [(0, import_block_editor.getColorClassName)(
        "background-color",
        context.backgroundColor
      )]: !!context.backgroundColor,
      "open-on-click": context.submenuVisibility === "click",
      "open-always": context.submenuVisibility === "always"
    }),
    style: { ...context.style?.color }
  });
  const pagesTree = (0, import_element.useMemo)(
    function makePagesTree(parentId = 0, level = 0) {
      const childPages = pagesByParentId.get(parentId);
      if (!childPages?.length) {
        return [];
      }
      return childPages.reduce((tree, page) => {
        const hasChildren = pagesByParentId.has(page.id);
        const item = {
          value: page.id,
          label: "— ".repeat(level) + page.title.rendered,
          rawName: page.title.rendered
        };
        tree.push(item);
        if (hasChildren) {
          tree.push(...makePagesTree(page.id, level + 1));
        }
        return tree;
      }, []);
    },
    [pagesByParentId]
  );
  const blockList = (0, import_element.useMemo)(
    function getBlockList(parentId = parentPageID) {
      const childPages = pagesByParentId.get(parentId);
      if (!childPages?.length) {
        return [];
      }
      return childPages.reduce((template, page) => {
        const hasChildren = pagesByParentId.has(page.id);
        const pageProps = {
          id: page.id,
          label: (
            // translators: displayed when a page has an empty title.
            page.title?.rendered?.trim() !== "" ? page.title?.rendered : (0, import_i18n.__)("(no title)")
          ),
          title: (
            // translators: displayed when a page has an empty title.
            page.title?.rendered?.trim() !== "" ? page.title?.rendered : (0, import_i18n.__)("(no title)")
          ),
          link: page.url,
          hasChildren
        };
        let item = null;
        const children = getBlockList(page.id);
        item = (0, import_blocks.createBlock)(
          "core/page-list-item",
          pageProps,
          children
        );
        template.push(item);
        return template;
      }, []);
    },
    [pagesByParentId, parentPageID]
  );
  const {
    hasSelectedChild,
    parentClientId,
    hasDraggedChild,
    isChildOfNavigation
  } = (0, import_data.useSelect)(
    (select) => {
      const {
        getBlockParentsByBlockName,
        hasSelectedInnerBlock,
        hasDraggedInnerBlock
      } = select(import_block_editor.store);
      const navigationBlockParents = getBlockParentsByBlockName(
        clientId,
        "core/navigation",
        true
      );
      return {
        isChildOfNavigation: navigationBlockParents.length > 0,
        hasSelectedChild: hasSelectedInnerBlock(clientId, true),
        hasDraggedChild: hasDraggedInnerBlock(clientId, true),
        parentClientId: navigationBlockParents[0]
      };
    },
    [clientId]
  );
  const convertToNavigationLinks = (0, import_use_convert_to_navigation_links.useConvertToNavigationLinks)({
    clientId,
    pages,
    parentClientId,
    parentPageID
  });
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    renderAppender: false,
    __unstableDisableDropZone: true,
    templateLock: isChildOfNavigation ? false : "all",
    onInput: NOOP,
    onChange: NOOP,
    value: blockList
  });
  const { selectBlock } = (0, import_data.useDispatch)(import_block_editor.store);
  (0, import_element.useEffect)(() => {
    if (hasSelectedChild || hasDraggedChild) {
      setIsConfirmingDetach(true);
      selectBlock(parentClientId);
    }
  }, [hasSelectedChild, hasDraggedChild, parentClientId, selectBlock]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    (pagesTree.length > 0 || allowConvertToLinks) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({ parentPageID: 0 });
        },
        dropdownMenuProps,
        children: [
          pagesTree.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Parent Page"),
              hasValue: () => parentPageID !== 0,
              onDeselect: () => setAttributes({ parentPageID: 0 }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ComboboxControl,
                {
                  className: "editor-page-attributes__parent",
                  label: (0, import_i18n.__)("Parent"),
                  value: parentPageID,
                  options: pagesTree,
                  onChange: (value) => setAttributes({
                    parentPageID: value ?? 0
                  }),
                  help: (0, import_i18n.__)(
                    "Choose a page to show only its subpages."
                  )
                }
              )
            }
          ),
          allowConvertToLinks && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.Button,
            {
              __next40pxDefaultSize: true,
              variant: "secondary",
              accessibleWhenDisabled: true,
              disabled: !hasResolvedPages,
              onClick: () => setIsConfirmingDetach(true),
              style: {
                gridColumn: "1 / -1",
                justifyContent: "center"
              },
              children: (0, import_i18n.__)("Detach Page List")
            }
          )
        ]
      }
    ) }),
    allowConvertToLinks && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.ToolbarButton,
        {
          title: (0, import_i18n.__)("Detach"),
          disabled: !hasResolvedPages,
          onClick: () => setIsConfirmingDetach(true),
          children: (0, import_i18n.__)("Detach")
        }
      ) }),
      isConfirmingDetach && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        DetachPageListDialog,
        {
          isBusy: !hasResolvedPages,
          onConfirm: () => {
            convertToNavigationLinks();
            setIsConfirmingDetach(false);
          },
          onCancel: () => setIsConfirmingDetach(false)
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      BlockContent,
      {
        blockProps,
        innerBlocksProps,
        hasResolvedPages,
        blockList,
        pages,
        parentPageID
      }
    )
  ] });
}
//# sourceMappingURL=edit.cjs.map
