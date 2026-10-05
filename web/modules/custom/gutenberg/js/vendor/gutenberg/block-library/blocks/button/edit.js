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

// packages/block-library/src/button/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_i18n = require("@wordpress/i18n");
var import_element = require("@wordpress/element");
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_keycodes = require("@wordpress/keycodes");
var import_icons = require("@wordpress/icons");
var import_blocks = require("@wordpress/blocks");
var import_compose = require("@wordpress/compose");
var import_data = require("@wordpress/data");
var import_ui = require("@wordpress/ui");
var import_constants = require("./constants.cjs");
var import_get_updated_link_attributes = require("./get-updated-link-attributes.cjs");
var import_remove_anchor_tag = __toESM(require("../utils/remove-anchor-tag.cjs"));
var import_lock_unlock = require("../lock-unlock.cjs");
var import_deprecated_text_align_attributes = __toESM(require("../utils/deprecated-text-align-attributes.cjs"));
var import_utils = require("./utils.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var { HTMLElementControl } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
var { subscribeDelegatedListener } = (0, import_lock_unlock.unlock)(import_compose.privateApis);
var LINK_SETTINGS = [
  ...import_block_editor.LinkControl.DEFAULT_LINK_SETTINGS,
  {
    id: "nofollow",
    title: (0, import_i18n.__)("Mark as nofollow")
  }
];
function useEnter(clientId) {
  const { replaceBlocks, selectionChange } = (0, import_data.useDispatch)(import_block_editor.store);
  const {
    getBlock,
    getBlockAttributes,
    getBlockRootClientId,
    getBlockIndex
  } = (0, import_data.useSelect)(import_block_editor.store);
  return (0, import_compose.useRefEffect)((element) => {
    function onKeyDown(event) {
      if (event.defaultPrevented || event.keyCode !== import_keycodes.ENTER) {
        return;
      }
      const { text } = getBlockAttributes(clientId) ?? {};
      if (text?.length) {
        return;
      }
      event.preventDefault();
      const topParentListBlock = getBlock(
        getBlockRootClientId(clientId)
      );
      const blockIndex = getBlockIndex(clientId);
      const head = (0, import_blocks.cloneBlock)({
        ...topParentListBlock,
        innerBlocks: topParentListBlock.innerBlocks.slice(
          0,
          blockIndex
        )
      });
      const middle = (0, import_blocks.createBlock)((0, import_blocks.getDefaultBlockName)());
      const after = topParentListBlock.innerBlocks.slice(
        blockIndex + 1
      );
      const tail = after.length ? [
        (0, import_blocks.cloneBlock)({
          ...topParentListBlock,
          innerBlocks: after
        })
      ] : [];
      replaceBlocks(
        topParentListBlock.clientId,
        [head, middle, ...tail],
        1
      );
      selectionChange(middle.clientId);
    }
    return subscribeDelegatedListener(
      element,
      "keydown",
      onKeyDown,
      true
    );
  }, []);
}
function ButtonEdit(props) {
  const {
    attributes,
    setAttributes,
    className,
    isSelected,
    onReplace,
    mergeBlocks,
    clientId,
    context
  } = props;
  const {
    tagName,
    linkTarget,
    placeholder,
    rel,
    style,
    text,
    url,
    metadata
  } = attributes;
  const width = style?.dimensions?.width;
  (0, import_deprecated_text_align_attributes.default)(props);
  const TagName = tagName || "a";
  function onKeyDown(event) {
    if (import_keycodes.isKeyboardEvent.primary(event, "k")) {
      startEditing(event);
    } else if (import_keycodes.isKeyboardEvent.primaryShift(event, "k")) {
      unlink();
      richTextRef.current?.focus();
    }
  }
  const [popoverAnchor, setPopoverAnchor] = (0, import_element.useState)(null);
  const borderProps = (0, import_block_editor.__experimentalUseBorderProps)(attributes);
  const colorProps = (0, import_block_editor.__experimentalUseColorProps)(attributes);
  const spacingProps = (0, import_block_editor.__experimentalGetSpacingClassesAndStyles)(attributes);
  const shadowProps = (0, import_block_editor.__experimentalGetShadowClassesAndStyles)(attributes);
  const dimensionsProps = (0, import_block_editor.__experimentalGetDimensionsClassesAndStyles)(attributes);
  const ref = (0, import_element.useRef)();
  const richTextRef = (0, import_element.useRef)();
  const blockProps = (0, import_block_editor.useBlockProps)({
    ref: (0, import_compose.useMergeRefs)([setPopoverAnchor, ref]),
    onKeyDown
  });
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  const [isEditingURL, setIsEditingURL] = (0, import_element.useState)(false);
  const isURLSet = !!url;
  const opensInNewTab = linkTarget === import_constants.NEW_TAB_TARGET;
  const nofollow = !!rel?.includes(import_constants.NOFOLLOW_REL);
  const isLinkTag = "a" === TagName;
  const {
    createPageEntity,
    userCanCreatePages,
    lockUrlControls = false
  } = (0, import_data.useSelect)(
    (select) => {
      if (!isSelected) {
        return {};
      }
      const _settings = select(import_block_editor.store).getSettings();
      const blockBindingsSource = (0, import_blocks.getBlockBindingsSource)(
        metadata?.bindings?.url?.source
      );
      return {
        createPageEntity: _settings.__experimentalCreatePageEntity,
        userCanCreatePages: _settings.__experimentalUserCanCreatePages,
        lockUrlControls: !!metadata?.bindings?.url && !blockBindingsSource?.canUserEditValue?.({
          select,
          context,
          args: metadata?.bindings?.url?.args
        })
      };
    },
    [context, isSelected, metadata?.bindings?.url]
  );
  async function handleCreate(pageTitle) {
    const page = await createPageEntity({
      title: pageTitle,
      status: "draft"
    });
    return {
      id: page.id,
      type: page.type,
      title: page.title.rendered,
      url: page.link,
      kind: "post-type"
    };
  }
  function createButtonText(searchTerm) {
    return (0, import_element.createInterpolateElement)(
      (0, import_i18n.sprintf)(
        /* translators: %s: search term. */
        (0, import_i18n.__)("Create page: <mark>%s</mark>"),
        searchTerm
      ),
      { mark: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mark", {}) }
    );
  }
  function startEditing(event) {
    event.preventDefault();
    setIsEditingURL(true);
  }
  function unlink() {
    setAttributes({
      url: void 0,
      linkTarget: void 0,
      rel: void 0
    });
    setIsEditingURL(false);
  }
  (0, import_element.useEffect)(() => {
    if (!isSelected) {
      setIsEditingURL(false);
    }
  }, [isSelected]);
  const linkValue = (0, import_element.useMemo)(
    () => ({ url, opensInNewTab, nofollow }),
    [url, opensInNewTab, nofollow]
  );
  const useEnterRef = useEnter(clientId);
  const mergedRef = (0, import_compose.useMergeRefs)([useEnterRef, richTextRef]);
  const [fluidTypographySettings, layout, dimensionSizes] = (0, import_block_editor.useSettings)(
    "typography.fluid",
    "layout",
    "dimensions.dimensionSizes"
  );
  const dimensionPresets = (0, import_element.useMemo)(() => {
    if (!dimensionSizes) {
      return [];
    }
    return [
      ...dimensionSizes?.custom ?? [],
      ...dimensionSizes?.theme ?? [],
      ...dimensionSizes?.default ?? []
    ];
  }, [dimensionSizes]);
  const typographyProps = (0, import_block_editor.getTypographyClassesAndStyles)(attributes, {
    typography: {
      fluid: fluidTypographySettings
    },
    layout: {
      wideSize: layout?.wideSize
    }
  });
  const resolvedWidth = (0, import_element.useMemo)(() => {
    if (!width) {
      return void 0;
    }
    const presetPrefix = "var:preset|dimension|";
    if (width.startsWith(presetPrefix)) {
      const slug = width.slice(presetPrefix.length);
      const preset = dimensionPresets?.find((p) => p.slug === slug);
      return preset?.size ?? width;
    }
    return width;
  }, [width, dimensionPresets]);
  const hasNonContentControls = blockEditingMode === "default";
  const hasBlockControls = hasNonContentControls || isLinkTag && !lockUrlControls;
  const classes = (0, import_clsx.default)(
    blockProps.className,
    (0, import_utils.getWidthClasses)(resolvedWidth)
  );
  const widthStyle = (0, import_element.useMemo)(() => {
    if (!width) {
      return {};
    }
    if ((0, import_utils.isPercentageWidth)(resolvedWidth)) {
      return {
        "--wp--block-button--width": parseFloat(resolvedWidth)
      };
    }
    return dimensionsProps.style;
  }, [width, resolvedWidth, dimensionsProps.style]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        ...blockProps,
        className: classes,
        style: { ...blockProps.style, ...widthStyle },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_block_editor.RichText,
          {
            ref: mergedRef,
            "aria-label": (0, import_i18n.__)("Button text"),
            placeholder: placeholder || (0, import_i18n.__)("Add text…"),
            value: text,
            onChange: (value) => setAttributes({
              text: (0, import_remove_anchor_tag.default)(value)
            }),
            withoutInteractiveFormatting: true,
            className: (0, import_clsx.default)(
              className,
              "wp-block-button__link",
              colorProps.className,
              borderProps.className,
              typographyProps.className,
              {
                // For backwards compatibility add style that isn't
                // provided via block support.
                "no-border-radius": style?.border?.radius === 0,
                [`has-custom-font-size`]: blockProps.style.fontSize
              },
              (0, import_block_editor.__experimentalGetElementClassName)("button")
            ),
            style: {
              ...borderProps.style,
              ...colorProps.style,
              ...spacingProps.style,
              ...shadowProps.style,
              ...typographyProps.style,
              writingMode: void 0
            },
            onReplace,
            onMerge: mergeBlocks,
            identifier: "text"
          }
        )
      }
    ),
    hasBlockControls && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: isLinkTag && !lockUrlControls && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.ToolbarButton,
      {
        name: "link",
        icon: !isURLSet ? import_icons.link : import_icons.linkOff,
        title: !isURLSet ? (0, import_i18n.__)("Link") : (0, import_i18n.__)("Unlink"),
        shortcut: !isURLSet ? import_keycodes.displayShortcut.primary("k") : import_keycodes.displayShortcut.primaryShift("k"),
        onClick: !isURLSet ? startEditing : unlink,
        isActive: isURLSet
      }
    ) }),
    isLinkTag && isSelected && (isEditingURL || isURLSet) && !lockUrlControls && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Popover,
      {
        placement: "bottom",
        onClose: () => {
          setIsEditingURL(false);
          richTextRef.current?.focus();
        },
        anchor: popoverAnchor,
        focusOnMount: isEditingURL ? "firstElement" : false,
        __unstableSlotName: "__unstable-block-tools-after",
        shift: true,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_block_editor.LinkControl,
          {
            value: linkValue,
            onChange: ({
              url: newURL,
              opensInNewTab: newOpensInNewTab,
              nofollow: newNofollow
            }) => setAttributes(
              (0, import_get_updated_link_attributes.getUpdatedLinkAttributes)({
                rel,
                url: newURL,
                opensInNewTab: newOpensInNewTab,
                nofollow: newNofollow
              })
            ),
            onRemove: () => {
              unlink();
              richTextRef.current?.focus();
            },
            forceIsEditingLink: isEditingURL,
            settings: LINK_SETTINGS,
            createSuggestion: createPageEntity && handleCreate,
            withCreateSuggestion: userCanCreatePages,
            createSuggestionButtonText: createButtonText
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_block_editor.InspectorControls, { group: "advanced", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        HTMLElementControl,
        {
          tagName,
          onChange: (value) => setAttributes({ tagName: value }),
          options: [
            { label: (0, import_i18n.__)("Default (<a>)"), value: "a" },
            { label: "<button>", value: "button" }
          ]
        }
      ),
      isLinkTag && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.TextControl,
        {
          label: (0, import_i18n.__)("Link relation"),
          help: (0, import_element.createInterpolateElement)(
            (0, import_i18n.__)(
              "The <a>Link Relation</a> attribute defines the relationship between a linked resource and the current document."
            ),
            {
              a: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_ui.Link,
                {
                  openInNewTab: true,
                  href: "https://developer.mozilla.org/docs/Web/HTML/Attributes/rel"
                }
              )
            }
          ),
          value: rel || "",
          onChange: (newRel) => setAttributes({ rel: newRel })
        }
      )
    ] })
  ] });
}
var edit_default = ButtonEdit;
//# sourceMappingURL=edit.cjs.map
