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

// packages/block-library/src/navigation-link/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => NavigationLinkEdit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_blocks = require("@wordpress/blocks");
var import_data = require("@wordpress/data");
var import_components = require("@wordpress/components");
var import_keycodes = require("@wordpress/keycodes");
var import_i18n = require("@wordpress/i18n");
var import_block_editor = require("@wordpress/block-editor");
var import_url = require("@wordpress/url");
var import_element = require("@wordpress/element");
var import_ui = require("@wordpress/ui");
var import_icons = require("@wordpress/icons");
var import_compose = require("@wordpress/compose");
var import_utils = require("../navigation/edit/utils.cjs");
var import_shared = require("./shared/index.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var DEFAULT_BLOCK = { name: "core/navigation-link" };
var NESTING_BLOCK_NAMES = [
  "core/navigation-link",
  "core/navigation-submenu"
];
function getMissingText(type) {
  let missingText = "";
  switch (type) {
    case "post":
      missingText = (0, import_i18n.__)("Select post");
      break;
    case "page":
      missingText = (0, import_i18n.__)("Select page");
      break;
    case "category":
      missingText = (0, import_i18n.__)("Select category");
      break;
    case "tag":
      missingText = (0, import_i18n.__)("Select tag");
      break;
    default:
      missingText = (0, import_i18n.__)("Add link");
  }
  return missingText;
}
function NavigationLinkEdit({
  attributes,
  isSelected,
  setAttributes,
  insertBlocksAfter,
  mergeBlocks,
  onReplace,
  context,
  clientId
}) {
  const { id, label, type, url, description, kind, metadata } = attributes;
  const { maxNestingLevel } = context;
  const {
    replaceBlock,
    __unstableMarkNextChangeAsNotPersistent,
    selectBlock
  } = (0, import_data.useDispatch)(import_block_editor.store);
  const [isLinkOpen, setIsLinkOpen] = (0, import_element.useState)(isSelected && !url);
  const [popoverAnchor, setPopoverAnchor] = (0, import_element.useState)(null);
  const listItemRef = (0, import_element.useRef)(null);
  const isDraggingWithin = (0, import_shared.useIsDraggingWithin)(listItemRef);
  const itemLabelPlaceholder = (0, import_i18n.__)("Add label…");
  const ref = (0, import_element.useRef)();
  const linkUIref = (0, import_element.useRef)();
  const isNewLink = (0, import_element.useRef)(label === void 0);
  const shouldSelectSubmenuAppenderOnClose = (0, import_element.useRef)(false);
  const {
    isAtMaxNesting,
    isTopLevelLink,
    isParentOfSelectedBlock,
    hasChildren,
    parentBlockClientId,
    isSubmenu
  } = (0, import_data.useSelect)(
    (select) => {
      const {
        getBlockCount,
        getBlockName,
        getBlockRootClientId,
        hasSelectedInnerBlock,
        getBlockParentsByBlockName
      } = select(import_block_editor.store);
      const rootClientId = getBlockRootClientId(clientId);
      const parentBlockName = getBlockName(rootClientId);
      const isTopLevel = parentBlockName === "core/navigation";
      const rootNavigationClientId = isTopLevel ? rootClientId : getBlockParentsByBlockName(
        clientId,
        "core/navigation"
      )[0];
      const parentBlockId = parentBlockName === "core/navigation-submenu" ? rootClientId : rootNavigationClientId;
      return {
        isAtMaxNesting: getBlockParentsByBlockName(clientId, NESTING_BLOCK_NAMES).length >= maxNestingLevel,
        isTopLevelLink: isTopLevel,
        isParentOfSelectedBlock: hasSelectedInnerBlock(
          clientId,
          true
        ),
        hasChildren: !!getBlockCount(clientId),
        parentBlockClientId: parentBlockId,
        isSubmenu: parentBlockName === "core/navigation-submenu"
      };
    },
    [clientId, maxNestingLevel]
  );
  const validateLinkStatus = (0, import_shared.useEnableLinkStatusValidation)(clientId);
  const { getBlocks } = (0, import_data.useSelect)(import_block_editor.store);
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
  const [isInvalid, isDraft] = (0, import_shared.useIsInvalidLink)(
    kind,
    type,
    id,
    validateLinkStatus
  );
  const transformToSubmenu = (0, import_element.useCallback)(() => {
    let innerBlocks = getBlocks(clientId);
    if (innerBlocks.length === 0) {
      innerBlocks = [(0, import_blocks.createBlock)("core/navigation-link")];
      selectBlock(innerBlocks[0].clientId);
    }
    const newSubmenu = (0, import_blocks.createBlock)(
      "core/navigation-submenu",
      attributes,
      innerBlocks
    );
    replaceBlock(clientId, newSubmenu);
  }, [getBlocks, clientId, selectBlock, replaceBlock, attributes]);
  (0, import_element.useEffect)(() => {
    if (isNewLink.current && isSelected) {
      selectBlock(parentBlockClientId);
    }
  }, []);
  (0, import_element.useEffect)(() => {
    if (hasChildren) {
      __unstableMarkNextChangeAsNotPersistent();
      transformToSubmenu();
    }
  }, [
    hasChildren,
    __unstableMarkNextChangeAsNotPersistent,
    transformToSubmenu
  ]);
  (0, import_element.useEffect)(() => {
    if (!isNewLink.current || !url || !isLinkOpen) {
      return;
    }
    isNewLink.current = false;
    if ((0, import_url.isURL)((0, import_url.prependHTTP)(label)) && /^.+\.[a-z]+/.test(label)) {
      (0, import_shared.selectLabelText)(ref);
    } else {
      selectBlock(clientId, null);
      if (isSubmenu) {
        const parentBlocks = getBlocks(parentBlockClientId);
        if (parentBlocks.length === 1 && parentBlocks[0].clientId === clientId) {
          shouldSelectSubmenuAppenderOnClose.current = true;
        }
      }
    }
  }, [url, isLinkOpen, isNewLink, label]);
  function removeLink() {
    setAttributes({
      url: void 0,
      label: void 0,
      id: void 0,
      kind: void 0,
      type: void 0,
      opensInNewTab: false
    });
    setIsLinkOpen(false);
  }
  const {
    textColor,
    customTextColor,
    backgroundColor,
    customBackgroundColor
  } = (0, import_utils.getColors)(context, !isTopLevelLink);
  function onKeyDown(event) {
    if (import_keycodes.isKeyboardEvent.primary(event, "k")) {
      event.preventDefault();
      event.stopPropagation();
      setIsLinkOpen(true);
    }
  }
  const instanceId = (0, import_compose.useInstanceId)(NavigationLinkEdit);
  const hasMissingEntity = hasUrlBinding && !isBoundEntityAvailable;
  const missingEntityDescriptionId = hasMissingEntity ? (0, import_i18n.sprintf)("navigation-link-edit-%d-desc", instanceId) : void 0;
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
      [(0, import_block_editor.getColorClassName)("background-color", backgroundColor)]: !!backgroundColor
    }),
    "aria-describedby": missingEntityDescriptionId,
    "aria-invalid": hasMissingEntity,
    style: {
      color: !textColor && customTextColor,
      backgroundColor: !backgroundColor && customBackgroundColor
    },
    onKeyDown
  });
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(
    {
      className: "remove-outline"
      // Remove the outline from the inner blocks container.
    },
    {
      defaultBlock: DEFAULT_BLOCK,
      directInsert: true,
      renderAppender: false
    }
  );
  const needsValidLink = !url && !(hasUrlBinding && isBoundEntityAvailable) || isInvalid || isDraft || hasUrlBinding && !isBoundEntityAvailable;
  if (needsValidLink) {
    blockProps.onClick = () => {
      setIsLinkOpen(true);
    };
  }
  const classes = (0, import_clsx.default)("wp-block-navigation-item__content", {
    "wp-block-navigation-link__placeholder": needsValidLink
  });
  const missingText = getMissingText(type);
  const invalidLinkHelpText = (0, import_shared.getInvalidLinkHelpText)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.ToolbarGroup, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
      !isAtMaxNesting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.ToolbarButton,
        {
          name: "submenu",
          icon: import_icons.addSubmenu,
          title: (0, import_i18n.__)("Add submenu"),
          onClick: transformToSubmenu
        }
      )
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "content", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_shared.Controls,
      {
        attributes,
        setAttributes,
        clientId
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...blockProps, children: [
      hasMissingEntity && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.VisuallyHidden, { id: missingEntityDescriptionId, children: invalidLinkHelpText }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", { className: classes, children: [
        !url && !metadata?.bindings?.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-navigation-link__placeholder-text", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: missingText }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          !isInvalid && !isDraft && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_block_editor.RichText,
              {
                ref,
                identifier: "label",
                className: "wp-block-navigation-item__label",
                value: label,
                onChange: (labelValue) => setAttributes({
                  label: labelValue
                }),
                onMerge: mergeBlocks,
                onReplace,
                __unstableOnSplitAtEnd: insertBlocksAfter ? () => insertBlocksAfter(
                  (0, import_blocks.createBlock)(
                    "core/navigation-link"
                  )
                ) : void 0,
                "aria-label": (0, import_i18n.__)(
                  "Navigation link text"
                ),
                placeholder: itemLabelPlaceholder,
                withoutInteractiveFormatting: true
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
              className: "wp-block-navigation-link__label"
            }
          )
        ] }),
        isLinkOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_shared.LinkUI,
          {
            ref: linkUIref,
            clientId,
            link: attributes,
            entity: {
              entityRecord,
              hasBinding: hasUrlBinding,
              isEntityAvailable: isBoundEntityAvailable
            },
            onClose: () => {
              setIsLinkOpen(false);
              if (!url && !hasUrlBinding && onReplace) {
                onReplace([]);
                return;
              }
              if (shouldSelectSubmenuAppenderOnClose.current) {
                shouldSelectSubmenuAppenderOnClose.current = false;
                if (listItemRef.current?.nextElementSibling) {
                  const appenderButton = listItemRef.current.nextElementSibling.querySelector(
                    ".block-editor-button-block-appender"
                  );
                  if (appenderButton) {
                    appenderButton.focus();
                  }
                }
              }
            },
            anchor: popoverAnchor,
            onRemove: removeLink,
            onChange: handleLinkChange
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...innerBlocksProps })
    ] })
  ] });
}
//# sourceMappingURL=edit.cjs.map
