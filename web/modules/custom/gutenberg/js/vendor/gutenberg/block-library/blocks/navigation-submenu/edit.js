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

// packages/block-library/src/navigation-submenu/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => NavigationSubmenuEdit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_data = require("@wordpress/data");
var import_components = require("@wordpress/components");
var import_keycodes = require("@wordpress/keycodes");
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_url = require("@wordpress/url");
var import_element = require("@wordpress/element");
var import_icons = require("@wordpress/icons");
var import_a11y = require("@wordpress/a11y");
var import_blocks = require("@wordpress/blocks");
var import_compose = require("@wordpress/compose");
var import_icons2 = require("./icons.cjs");
var import_shared = require("../navigation-link/shared/index.cjs");
var import_utils = require("../navigation/edit/utils.cjs");
var import_constants = require("../navigation/constants.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var ALLOWED_BLOCKS = [
  "core/navigation-link",
  "core/navigation-submenu",
  "core/page-list",
  "core/loginout"
];
function NavigationSubmenuEdit({
  attributes,
  isSelected,
  setAttributes,
  mergeBlocks,
  onReplace,
  context,
  clientId
}) {
  const { label, url, description, kind, type, id } = attributes;
  const { showSubmenuIcon, maxNestingLevel, submenuVisibility } = context;
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  const openSubmenusOnClick = blockEditingMode !== "default" ? true : submenuVisibility === "click";
  const { hasUrlBinding, isBoundEntityAvailable, entityRecord } = (0, import_shared.useEntityBinding)({
    clientId,
    attributes
  });
  const handleLinkChange = (0, import_shared.useHandleLinkChange)({
    clientId,
    attributes,
    setAttributes,
    allowTextUpdate: true
  });
  const { __unstableMarkNextChangeAsNotPersistent, replaceBlock } = (0, import_data.useDispatch)(import_block_editor.store);
  const [isLinkOpen, setIsLinkOpen] = (0, import_element.useState)(false);
  const [popoverAnchor, setPopoverAnchor] = (0, import_element.useState)(null);
  const listItemRef = (0, import_element.useRef)(null);
  const isDraggingWithin = (0, import_shared.useIsDraggingWithin)(listItemRef);
  const itemLabelPlaceholder = (0, import_i18n.__)("Add text…");
  const ref = (0, import_element.useRef)();
  const {
    parentCount,
    isParentOfSelectedBlock,
    isImmediateParentOfSelectedBlock,
    hasChildren,
    selectedBlockHasChildren,
    onlyDescendantIsEmptyLink
  } = (0, import_data.useSelect)(
    (select) => {
      const {
        hasSelectedInnerBlock,
        getSelectedBlockClientId,
        getBlockParentsByBlockName,
        getBlock,
        getBlockCount,
        getBlockOrder
      } = select(import_block_editor.store);
      let _onlyDescendantIsEmptyLink;
      const selectedBlockId = getSelectedBlockClientId();
      const selectedBlockChildren = getBlockOrder(selectedBlockId);
      if (selectedBlockChildren?.length === 1) {
        const singleBlock = getBlock(selectedBlockChildren[0]);
        _onlyDescendantIsEmptyLink = singleBlock?.name === "core/navigation-link" && !singleBlock?.attributes?.label;
      }
      return {
        parentCount: getBlockParentsByBlockName(
          clientId,
          "core/navigation-submenu"
        ).length,
        isParentOfSelectedBlock: hasSelectedInnerBlock(
          clientId,
          true
        ),
        isImmediateParentOfSelectedBlock: hasSelectedInnerBlock(
          clientId,
          false
        ),
        hasChildren: !!getBlockCount(clientId),
        selectedBlockHasChildren: !!selectedBlockChildren?.length,
        onlyDescendantIsEmptyLink: _onlyDescendantIsEmptyLink
      };
    },
    [clientId]
  );
  const validateLinkStatus = (0, import_shared.useEnableLinkStatusValidation)(clientId);
  const prevHasChildren = (0, import_compose.usePrevious)(hasChildren);
  const [isInvalid, isDraft] = (0, import_shared.useIsInvalidLink)(
    kind,
    type,
    id,
    validateLinkStatus
  );
  (0, import_element.useEffect)(() => {
    if (!openSubmenusOnClick && !url) {
      setIsLinkOpen(true);
    }
  }, []);
  (0, import_element.useEffect)(() => {
    if (!isSelected) {
      setIsLinkOpen(false);
    }
  }, [isSelected]);
  (0, import_element.useEffect)(() => {
    if (isLinkOpen && url) {
      if ((0, import_url.isURL)((0, import_url.prependHTTP)(label)) && /^.+\.[a-z]+/.test(label)) {
        (0, import_shared.selectLabelText)(ref);
      }
    }
  }, [url]);
  const {
    textColor,
    customTextColor,
    backgroundColor,
    customBackgroundColor
  } = (0, import_utils.getColors)(context, parentCount > 0);
  function onKeyDown(event) {
    if (import_keycodes.isKeyboardEvent.primary(event, "k")) {
      event.preventDefault();
      event.stopPropagation();
      setIsLinkOpen(true);
    }
  }
  const blockProps = (0, import_block_editor.useBlockProps)({
    ref: (0, import_compose.useMergeRefs)([setPopoverAnchor, listItemRef]),
    className: (0, import_clsx.default)("wp-block-navigation-item", {
      "is-editing": isSelected || isParentOfSelectedBlock,
      "is-dragging-within": isDraggingWithin,
      "has-link": !!url,
      "has-child": hasChildren,
      "has-text-color": !!textColor || !!customTextColor,
      [(0, import_block_editor.getColorClassName)("color", textColor)]: !!textColor,
      "has-background": !!backgroundColor || customBackgroundColor,
      [(0, import_block_editor.getColorClassName)("background-color", backgroundColor)]: !!backgroundColor,
      "open-on-click": openSubmenusOnClick,
      "open-always": submenuVisibility === "always"
    }),
    style: {
      color: !textColor && customTextColor,
      backgroundColor: !backgroundColor && customBackgroundColor
    },
    onKeyDown
  });
  const innerBlocksColors = (0, import_utils.getColors)(context, true);
  const allowedBlocks = parentCount >= maxNestingLevel ? ALLOWED_BLOCKS.filter(
    (blockName) => blockName !== "core/navigation-submenu"
  ) : ALLOWED_BLOCKS;
  const navigationChildBlockProps = (0, import_utils.getNavigationChildBlockProps)(innerBlocksColors);
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(navigationChildBlockProps, {
    allowedBlocks,
    defaultBlock: import_constants.DEFAULT_BLOCK,
    directInsert: true,
    // Ensure block toolbar is not too far removed from item
    // being edited.
    // see: https://github.com/WordPress/gutenberg/pull/34615.
    __experimentalCaptureToolbars: true,
    renderAppender: isSelected || isImmediateParentOfSelectedBlock && !selectedBlockHasChildren || // Show the appender while dragging to allow inserting element between item and the appender.
    hasChildren ? import_block_editor.InnerBlocks.ButtonBlockAppender : false
  });
  const ParentElement = openSubmenusOnClick ? "button" : "a";
  function transformToLink() {
    const newLinkBlock = (0, import_blocks.createBlock)("core/navigation-link", attributes);
    replaceBlock(clientId, newLinkBlock);
  }
  (0, import_element.useEffect)(() => {
    if (!hasChildren && prevHasChildren) {
      __unstableMarkNextChangeAsNotPersistent();
      transformToLink();
    }
  }, [hasChildren, prevHasChildren]);
  const canConvertToLink = !selectedBlockHasChildren || onlyDescendantIsEmptyLink;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.ToolbarGroup, { children: [
      !openSubmenusOnClick && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.ToolbarButton,
        {
          name: "link",
          icon: import_icons.link,
          title: (0, import_i18n.__)("Link"),
          shortcut: import_keycodes.displayShortcut.primary("k"),
          onClick: () => {
            setIsLinkOpen(true);
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.ToolbarButton,
        {
          name: "revert",
          icon: import_icons.removeSubmenu,
          title: (0, import_i18n.__)("Convert to Link"),
          onClick: transformToLink,
          className: "wp-block-navigation__submenu__revert",
          disabled: !canConvertToLink
        }
      )
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "content", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_shared.Controls,
      {
        attributes,
        setAttributes,
        clientId,
        isLinkEditable: !openSubmenusOnClick
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ParentElement, { className: "wp-block-navigation-item__content", children: [
        !isInvalid && !isDraft && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.RichText,
            {
              ref,
              identifier: "label",
              className: "wp-block-navigation-item__label",
              value: label,
              onChange: (labelValue) => setAttributes({ label: labelValue }),
              onMerge: mergeBlocks,
              onReplace,
              "aria-label": (0, import_i18n.__)("Navigation link text"),
              placeholder: itemLabelPlaceholder,
              withoutInteractiveFormatting: true,
              onClick: () => {
                if (!openSubmenusOnClick && !url) {
                  setIsLinkOpen(true);
                }
              }
            }
          ),
          description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wp-block-navigation-item__description", children: description })
        ] }),
        (isInvalid || isDraft) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_shared.InvalidDraftDisplay,
          {
            label,
            isInvalid,
            isDraft,
            className: "wp-block-navigation-item__label"
          }
        ),
        !openSubmenusOnClick && isLinkOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_shared.LinkUI,
          {
            clientId,
            link: attributes,
            entity: {
              entityRecord,
              hasBinding: hasUrlBinding,
              isEntityAvailable: isBoundEntityAvailable
            },
            onClose: () => {
              setIsLinkOpen(false);
            },
            anchor: popoverAnchor,
            onRemove: () => {
              setAttributes({ url: "" });
              (0, import_a11y.speak)((0, import_i18n.__)("Link removed."), "assertive");
            },
            onChange: handleLinkChange
          }
        )
      ] }),
      (showSubmenuIcon || openSubmenusOnClick) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wp-block-navigation__submenu-icon", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_icons2.ItemSubmenuIcon, {}) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...innerBlocksProps })
    ] })
  ] });
}
//# sourceMappingURL=edit.cjs.map
