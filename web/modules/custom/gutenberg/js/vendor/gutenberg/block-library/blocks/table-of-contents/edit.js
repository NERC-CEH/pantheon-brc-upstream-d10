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

// packages/block-library/src/table-of-contents/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => TableOfContentsEdit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_blocks = require("@wordpress/blocks");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_i18n = require("@wordpress/i18n");
var import_compose = require("@wordpress/compose");
var import_notices = require("@wordpress/notices");
var import_icons = require("@wordpress/icons");
var import_list = __toESM(require("./list.cjs"));
var import_utils = require("./utils.cjs");
var import_hooks = require("./hooks.cjs");
var import_hooks2 = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function TableOfContentsToolbar({
  clientId,
  headingTree,
  ordered,
  setAttributes
}) {
  const canInsertList = (0, import_data.useSelect)(
    (select) => {
      const { getBlockRootClientId, canInsertBlockType } = select(import_block_editor.store);
      const rootClientId = getBlockRootClientId(clientId);
      return canInsertBlockType("core/list", rootClientId);
    },
    [clientId]
  );
  const { replaceBlocks } = (0, import_data.useDispatch)(import_block_editor.store);
  const [isConfirmingDetach, setIsConfirmingDetach] = (0, import_element.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_block_editor.BlockControls, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.ToolbarGroup, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.ToolbarButton,
          {
            icon: (0, import_i18n.isRTL)() ? import_icons.formatListBulletsRTL : import_icons.formatListBullets,
            title: (0, import_i18n.__)("Unordered"),
            description: (0, import_i18n.__)("Convert to unordered list"),
            onClick: () => setAttributes({ ordered: false }),
            isActive: ordered === false
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.ToolbarButton,
          {
            icon: (0, import_i18n.isRTL)() ? import_icons.formatListNumberedRTL : import_icons.formatListNumbered,
            title: (0, import_i18n.__)("Ordered"),
            description: (0, import_i18n.__)("Convert to ordered list"),
            onClick: () => setAttributes({ ordered: true }),
            isActive: ordered === true
          }
        )
      ] }),
      canInsertList && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.ToolbarButton,
        {
          onClick: () => setIsConfirmingDetach(true),
          children: (0, import_i18n.__)("Detach")
        }
      ) })
    ] }),
    isConfirmingDetach && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalConfirmDialog,
      {
        isOpen: true,
        title: (0, import_i18n.__)("Detach Table of Contents"),
        __experimentalHideHeader: false,
        confirmButtonText: (0, import_i18n.__)("Detach"),
        onConfirm: () => {
          setIsConfirmingDetach(false);
          replaceBlocks(
            clientId,
            (0, import_blocks.createBlock)(
              "core/list",
              { ordered },
              (0, import_utils.createListItemBlocks)(headingTree, ordered)
            )
          );
        },
        onCancel: () => setIsConfirmingDetach(false),
        size: "medium",
        children: (0, import_i18n.__)(
          "The Table of Contents block lists the headings in the post. Detaching will enable you to edit, reorder, or remove entries. However, new headings will no longer be added automatically."
        )
      }
    )
  ] });
}
function TableOfContentsEdit({
  attributes: {
    headings = [],
    onlyIncludeCurrentPage,
    maxLevel,
    ordered = true
  },
  clientId,
  setAttributes
}) {
  (0, import_hooks.useObserveHeadings)(clientId);
  const blockProps = (0, import_block_editor.useBlockProps)();
  const instanceId = (0, import_compose.useInstanceId)(
    TableOfContentsEdit,
    "table-of-contents"
  );
  const { createWarningNotice } = (0, import_data.useDispatch)(import_notices.store);
  const showRedirectionPreventedNotice = (event) => {
    event.preventDefault();
    createWarningNotice((0, import_i18n.__)("Links are disabled in the editor."), {
      id: `block-library/core/table-of-contents/redirection-prevented/${instanceId}`,
      type: "snackbar"
    });
  };
  const dropdownMenuProps = (0, import_hooks2.useToolsPanelDropdownMenuProps)();
  const headingTree = (0, import_utils.linearToNestedHeadingList)(headings);
  const toolbarControls = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    TableOfContentsToolbar,
    {
      clientId,
      headingTree,
      ordered,
      setAttributes
    }
  );
  const inspectorControls = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_components.__experimentalToolsPanel,
    {
      label: (0, import_i18n.__)("Settings"),
      resetAll: () => {
        setAttributes({
          onlyIncludeCurrentPage: false,
          maxLevel: void 0,
          ordered: true
        });
      },
      dropdownMenuProps,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            hasValue: () => !!onlyIncludeCurrentPage,
            label: (0, import_i18n.__)("Only include current page"),
            onDeselect: () => setAttributes({ onlyIncludeCurrentPage: false }),
            isShownByDefault: true,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Only include current page"),
                checked: onlyIncludeCurrentPage,
                onChange: (value) => setAttributes({ onlyIncludeCurrentPage: value }),
                help: onlyIncludeCurrentPage ? (0, import_i18n.__)(
                  "Only including headings from the current page (if the post is paginated)."
                ) : (0, import_i18n.__)(
                  "Include headings from all pages (if the post is paginated)."
                )
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            hasValue: () => !!maxLevel,
            label: (0, import_i18n.__)("Limit heading levels"),
            onDeselect: () => setAttributes({ maxLevel: void 0 }),
            isShownByDefault: true,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.SelectControl,
              {
                label: (0, import_i18n.__)("Include headings down to level"),
                value: maxLevel || "",
                options: [
                  { value: "", label: (0, import_i18n.__)("All levels") },
                  { value: "1", label: (0, import_i18n.__)("Heading 1") },
                  { value: "2", label: (0, import_i18n.__)("Heading 2") },
                  { value: "3", label: (0, import_i18n.__)("Heading 3") },
                  { value: "4", label: (0, import_i18n.__)("Heading 4") },
                  { value: "5", label: (0, import_i18n.__)("Heading 5") },
                  { value: "6", label: (0, import_i18n.__)("Heading 6") }
                ],
                onChange: (value) => setAttributes({
                  maxLevel: value ? parseInt(value) : void 0
                }),
                help: !maxLevel ? (0, import_i18n.__)(
                  "Including all heading levels in the table of contents."
                ) : (0, import_i18n.__)(
                  "Only include headings up to and including this level."
                )
              }
            )
          }
        )
      ]
    }
  ) });
  if (headings.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.Placeholder,
        {
          icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, { icon: import_icons.tableOfContents }),
          label: (0, import_i18n.__)("Table of Contents"),
          instructions: (0, import_i18n.__)(
            "Start adding Heading blocks to create a table of contents. Headings with HTML anchors will be linked here."
          )
        }
      ) }),
      inspectorControls
    ] });
  }
  const ListTag = ordered ? "ol" : "ul";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListTag, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_list.default,
      {
        nestedHeadingList: headingTree,
        disableLinkActivation: true,
        onClick: showRedirectionPreventedNotice,
        ordered
      }
    ) }) }),
    toolbarControls,
    inspectorControls
  ] });
}
//# sourceMappingURL=edit.cjs.map
