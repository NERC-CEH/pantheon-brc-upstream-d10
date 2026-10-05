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

// packages/block-library/src/social-links/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  SocialLinksEdit: () => SocialLinksEdit,
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_element = require("@wordpress/element");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_data = require("@wordpress/data");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var sizeOptions = [
  { label: (0, import_i18n.__)("Default"), value: "" },
  { label: (0, import_i18n.__)("Small"), value: "has-small-icon-size" },
  { label: (0, import_i18n.__)("Normal"), value: "has-normal-icon-size" },
  { label: (0, import_i18n.__)("Large"), value: "has-large-icon-size" },
  { label: (0, import_i18n.__)("Huge"), value: "has-huge-icon-size" }
];
function SocialLinksEdit(props) {
  const {
    clientId,
    attributes,
    iconBackgroundColor,
    iconColor,
    isSelected,
    setAttributes,
    setIconBackgroundColor,
    setIconColor
  } = props;
  const {
    iconBackgroundColorValue,
    iconColorValue,
    openInNewTab,
    showLabels,
    size
  } = attributes;
  const { hasSocialIcons, hasSelectedChild, hasSelectedStyleState } = (0, import_data.useSelect)(
    (select) => {
      const {
        getBlockCount,
        hasSelectedInnerBlock,
        hasSelectedStyleState: hasSelectedBlockStyleState
      } = (0, import_lock_unlock.unlock)(select(import_block_editor.store));
      return {
        hasSocialIcons: getBlockCount(clientId) > 0,
        hasSelectedChild: hasSelectedInnerBlock(clientId),
        hasSelectedStyleState: hasSelectedBlockStyleState(clientId)
      };
    },
    [clientId]
  );
  const hasAnySelected = isSelected || hasSelectedChild;
  const logosOnly = attributes.className?.includes("is-style-logos-only");
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  (0, import_element.useEffect)(() => {
    if (logosOnly) {
      let restore;
      setAttributes((prev) => {
        restore = {
          iconBackgroundColor: prev.iconBackgroundColor,
          iconBackgroundColorValue: prev.iconBackgroundColorValue,
          customIconBackgroundColor: prev.customIconBackgroundColor
        };
        return {
          iconBackgroundColor: void 0,
          iconBackgroundColorValue: void 0,
          customIconBackgroundColor: void 0
        };
      });
      return () => setAttributes({ ...restore });
    }
  }, [logosOnly, setAttributes]);
  const className = (0, import_clsx.default)(size, {
    "has-visible-labels": showLabels,
    "has-icon-color": iconColor.color || iconColorValue,
    "has-icon-background-color": iconBackgroundColor.color || iconBackgroundColorValue
  });
  const blockProps = (0, import_block_editor.useBlockProps)({ className });
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    templateLock: false,
    orientation: attributes.layout?.orientation ?? "horizontal",
    __experimentalAppenderTagName: "li",
    renderAppender: !hasSocialIcons || hasAnySelected ? import_block_editor.InnerBlocks.ButtonBlockAppender : void 0
  });
  const colorSettings = [
    {
      // Use custom attribute as fallback to prevent loss of named color selection when
      // switching themes to a new theme that does not have a matching named color.
      value: iconColor.color || iconColorValue,
      onChange: (colorValue) => {
        setIconColor(colorValue);
        setAttributes({ iconColorValue: colorValue });
      },
      label: (0, import_i18n.__)("Icon color"),
      resetAllFilter: () => {
        setIconColor(void 0);
        setAttributes({ iconColorValue: void 0 });
      }
    }
  ];
  if (!logosOnly) {
    colorSettings.push({
      // Use custom attribute as fallback to prevent loss of named color selection when
      // switching themes to a new theme that does not have a matching named color.
      value: iconBackgroundColor.color || iconBackgroundColorValue,
      onChange: (colorValue) => {
        setIconBackgroundColor(colorValue);
        setAttributes({
          iconBackgroundColorValue: colorValue
        });
      },
      label: (0, import_i18n.__)("Icon background"),
      resetAllFilter: () => {
        setIconBackgroundColor(void 0);
        setAttributes({ iconBackgroundColorValue: void 0 });
      }
    });
  }
  const colorGradientSettings = (0, import_block_editor.__experimentalUseMultipleOriginColorsAndGradients)();
  const showColorControls = colorGradientSettings.hasColorsOrGradients && !hasSelectedStyleState;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            openInNewTab: false,
            showLabels: false,
            size: void 0
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              isShownByDefault: true,
              hasValue: () => !!size,
              label: (0, import_i18n.__)("Icon size"),
              onDeselect: () => setAttributes({ size: void 0 }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.SelectControl,
                {
                  label: (0, import_i18n.__)("Icon size"),
                  onChange: (newSize) => {
                    setAttributes({
                      size: newSize === "" ? void 0 : newSize
                    });
                  },
                  value: size ?? "",
                  options: sizeOptions
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              isShownByDefault: true,
              label: (0, import_i18n.__)("Show text"),
              hasValue: () => !!showLabels,
              onDeselect: () => setAttributes({ showLabels: false }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show text"),
                  checked: showLabels,
                  onChange: () => setAttributes({ showLabels: !showLabels })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              isShownByDefault: true,
              label: (0, import_i18n.__)("Open links in new tab"),
              hasValue: () => !!openInNewTab,
              onDeselect: () => setAttributes({ openInNewTab: false }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Open links in new tab"),
                  checked: openInNewTab,
                  onChange: () => setAttributes({
                    openInNewTab: !openInNewTab
                  })
                }
              )
            }
          )
        ]
      }
    ) }),
    showColorControls && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_block_editor.InspectorControls, { group: "color", children: [
      colorSettings.map(
        ({ onChange, label, value, resetAllFilter }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_block_editor.__experimentalColorGradientSettingsDropdown,
          {
            __experimentalIsRenderedInSidebar: true,
            settings: [
              {
                colorValue: value,
                label,
                onColorChange: onChange,
                isShownByDefault: true,
                resetAllFilter,
                enableAlpha: true,
                clearable: true
              }
            ],
            panelId: clientId,
            ...colorGradientSettings
          },
          `social-links-color-${label}`
        )
      ),
      !logosOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.ContrastChecker,
        {
          ...{
            textColor: iconColorValue,
            backgroundColor: iconBackgroundColorValue
          },
          isLargeText: false
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { ...innerBlocksProps })
  ] });
}
var iconColorAttributes = {
  iconColor: "icon-color",
  iconBackgroundColor: "icon-background-color"
};
var edit_default = (0, import_block_editor.withColors)(iconColorAttributes)(SocialLinksEdit);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SocialLinksEdit
});
//# sourceMappingURL=edit.cjs.map
