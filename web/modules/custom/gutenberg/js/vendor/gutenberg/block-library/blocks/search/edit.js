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

// packages/block-library/src/search/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => SearchEdit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_components = require("@wordpress/components");
var import_compose = require("@wordpress/compose");
var import_icons = require("@wordpress/icons");
var import_i18n = require("@wordpress/i18n");
var import_dom = require("@wordpress/dom");
var import_a11y = require("@wordpress/a11y");
var import_primitives = require("@wordpress/primitives");
var import_utils = require("./utils.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var TAG_NAME_MESSAGES = {
  "": (0, import_i18n.__)(
    "Lets the theme decide. Uses the <search> landmark element if the theme opts in, otherwise a <form>."
  ),
  search: (0, import_i18n.__)(
    "Wraps the block in a <search> landmark, announced as a search region by assistive technologies."
  ),
  form: (0, import_i18n.__)(
    'Uses a <form role="search"> wrapper for backward compatibility with existing theme styles.'
  )
};
var DEFAULT_INNER_PADDING = "4px";
var PERCENTAGE_WIDTHS = [25, 50, 75, 100];
var searchBlockIcon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M13 5c-3.3 0-6 2.7-6 6 0 1.4.5 2.7 1.3 3.7l-3.8 3.8 1.1 1.1 3.8-3.8c1 .8 2.3 1.3 3.7 1.3 3.3 0 6-2.7 6-6S16.3 5 13 5zm0 10.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z" }) });
function SearchEdit({
  className,
  attributes,
  setAttributes,
  toggleSelection,
  isSelected,
  clientId
}) {
  const {
    label,
    showLabel,
    placeholder,
    width,
    widthUnit,
    align,
    buttonText,
    buttonPosition,
    buttonUseIcon,
    tagName,
    style
  } = attributes;
  const wasJustInsertedIntoNavigationBlock = (0, import_data.useSelect)(
    (select) => {
      const { getBlockParentsByBlockName, wasBlockJustInserted } = select(import_block_editor.store);
      return !!getBlockParentsByBlockName(clientId, "core/navigation")?.length && wasBlockJustInserted(clientId);
    },
    [clientId]
  );
  const { __unstableMarkNextChangeAsNotPersistent } = (0, import_data.useDispatch)(import_block_editor.store);
  (0, import_element.useEffect)(() => {
    if (wasJustInsertedIntoNavigationBlock) {
      __unstableMarkNextChangeAsNotPersistent();
      setAttributes({
        showLabel: false,
        buttonUseIcon: true,
        buttonPosition: "button-inside"
      });
    }
  }, [
    __unstableMarkNextChangeAsNotPersistent,
    wasJustInsertedIntoNavigationBlock,
    setAttributes
  ]);
  const borderRadius = style?.border?.radius;
  let borderProps = (0, import_block_editor.__experimentalUseBorderProps)(attributes);
  if (typeof borderRadius === "number") {
    borderProps = {
      ...borderProps,
      style: {
        ...borderProps.style,
        borderRadius: `${borderRadius}px`
      }
    };
  }
  const colorProps = (0, import_block_editor.__experimentalUseColorProps)(attributes);
  const [fluidTypographySettings, layout] = (0, import_block_editor.useSettings)(
    "typography.fluid",
    "layout"
  );
  const typographyProps = (0, import_block_editor.getTypographyClassesAndStyles)(attributes, {
    typography: {
      fluid: fluidTypographySettings
    },
    layout: {
      wideSize: layout?.wideSize
    }
  });
  const unitControlInstanceId = (0, import_compose.useInstanceId)(import_components.__experimentalUnitControl);
  const unitControlInputId = `wp-block-search__width-${unitControlInstanceId}`;
  const isButtonPositionInside = "button-inside" === buttonPosition;
  const isButtonPositionOutside = "button-outside" === buttonPosition;
  const hasNoButton = "no-button" === buttonPosition;
  const hasOnlyButton = "button-only" === buttonPosition;
  const isSearchFieldHidden = hasOnlyButton && !isSelected;
  const searchFieldRef = (0, import_element.useRef)();
  const buttonRef = (0, import_element.useRef)();
  const units = (0, import_components.__experimentalUseCustomUnits)({
    availableUnits: ["%", "px"],
    defaultValues: { "%": import_utils.PC_WIDTH_DEFAULT, px: import_utils.PX_WIDTH_DEFAULT }
  });
  const getBlockClassNames = () => {
    return (0, import_clsx.default)(
      className,
      isButtonPositionInside ? "wp-block-search__button-inside" : void 0,
      isButtonPositionOutside ? "wp-block-search__button-outside" : void 0,
      hasNoButton ? "wp-block-search__no-button" : void 0,
      hasOnlyButton ? "wp-block-search__button-only" : void 0,
      !buttonUseIcon && !hasNoButton ? "wp-block-search__text-button" : void 0,
      buttonUseIcon && !hasNoButton ? "wp-block-search__icon-button" : void 0,
      isSearchFieldHidden ? "wp-block-search__searchfield-hidden" : void 0
    );
  };
  const buttonPositionControls = [
    {
      label: (0, import_i18n.__)("Button outside"),
      value: "button-outside"
    },
    {
      label: (0, import_i18n.__)("Button inside"),
      value: "button-inside"
    },
    {
      label: (0, import_i18n.__)("No button"),
      value: "no-button"
    },
    {
      label: (0, import_i18n.__)("Button only"),
      value: "button-only"
    }
  ];
  const getResizableSides = () => {
    if (hasOnlyButton) {
      return {};
    }
    return {
      right: align !== "right",
      left: align === "right"
    };
  };
  const renderTextField = () => {
    const textFieldClasses = (0, import_clsx.default)(
      "wp-block-search__input",
      hasNoButton ? colorProps.className : void 0,
      isButtonPositionInside ? void 0 : borderProps.className,
      typographyProps.className
    );
    const textFieldStyles = {
      ...hasNoButton ? colorProps.style : {},
      ...isButtonPositionInside ? {
        borderRadius: borderProps.style?.borderRadius,
        borderTopLeftRadius: borderProps.style?.borderTopLeftRadius,
        borderTopRightRadius: borderProps.style?.borderTopRightRadius,
        borderBottomLeftRadius: borderProps.style?.borderBottomLeftRadius,
        borderBottomRightRadius: borderProps.style?.borderBottomRightRadius
      } : borderProps.style,
      ...typographyProps.style,
      textDecoration: void 0
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "input",
      {
        type: "search",
        className: textFieldClasses,
        style: textFieldStyles,
        "aria-label": (0, import_i18n.__)("Optional placeholder text"),
        placeholder: placeholder ? void 0 : (0, import_i18n.__)("Optional placeholder…"),
        value: placeholder,
        onChange: (event) => setAttributes({ placeholder: event.target.value }),
        ref: searchFieldRef
      }
    );
  };
  const renderButton = () => {
    const buttonClasses = (0, import_clsx.default)(
      "wp-block-search__button",
      colorProps.className,
      typographyProps.className,
      isButtonPositionInside ? void 0 : borderProps.className,
      buttonUseIcon ? "has-icon" : void 0,
      (0, import_block_editor.__experimentalGetElementClassName)("button")
    );
    const buttonStyles = {
      ...colorProps.style,
      ...typographyProps.style,
      ...isButtonPositionInside ? {
        borderRadius: borderProps.style?.borderRadius,
        borderTopLeftRadius: borderProps.style?.borderTopLeftRadius,
        borderTopRightRadius: borderProps.style?.borderTopRightRadius,
        borderBottomLeftRadius: borderProps.style?.borderBottomLeftRadius,
        borderBottomRightRadius: borderProps.style?.borderBottomRightRadius
      } : borderProps.style
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      buttonUseIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: buttonClasses,
          style: buttonStyles,
          "aria-label": buttonText ? (0, import_dom.__unstableStripHTML)(buttonText) : (0, import_i18n.__)("Search"),
          ref: buttonRef,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_icons.Icon, { icon: searchBlockIcon })
        }
      ),
      !buttonUseIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText,
        {
          identifier: "buttonText",
          className: buttonClasses,
          style: buttonStyles,
          "aria-label": (0, import_i18n.__)("Button text"),
          placeholder: (0, import_i18n.__)("Add button text…"),
          withoutInteractiveFormatting: true,
          value: buttonText,
          onChange: (html) => setAttributes({ buttonText: html })
        }
      )
    ] });
  };
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const controls = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            width: void 0,
            widthUnit: void 0,
            showLabel: true,
            buttonUseIcon: false,
            buttonPosition: "button-outside"
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !showLabel,
              label: (0, import_i18n.__)("Show label"),
              onDeselect: () => {
                setAttributes({
                  showLabel: true
                });
              },
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  checked: showLabel,
                  label: (0, import_i18n.__)("Show label"),
                  onChange: (value) => setAttributes({
                    showLabel: value
                  })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => buttonPosition !== "button-outside",
              label: (0, import_i18n.__)("Button position"),
              onDeselect: () => {
                setAttributes({
                  buttonPosition: "button-outside"
                });
              },
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.SelectControl,
                {
                  value: buttonPosition,
                  label: (0, import_i18n.__)("Button position"),
                  onChange: (value) => {
                    setAttributes({
                      buttonPosition: value
                    });
                  },
                  options: buttonPositionControls
                }
              )
            }
          ),
          buttonPosition !== "no-button" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!buttonUseIcon,
              label: (0, import_i18n.__)("Use button with icon"),
              onDeselect: () => {
                setAttributes({
                  buttonUseIcon: false
                });
              },
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  checked: buttonUseIcon,
                  label: (0, import_i18n.__)("Use button with icon"),
                  onChange: (value) => setAttributes({
                    buttonUseIcon: value
                  })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!width,
              label: (0, import_i18n.__)("Width"),
              onDeselect: () => {
                setAttributes({
                  width: void 0,
                  widthUnit: void 0
                });
              },
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.__experimentalUnitControl,
                  {
                    label: (0, import_i18n.__)("Width"),
                    id: unitControlInputId,
                    min: (0, import_utils.isPercentageUnit)(widthUnit) ? 0 : import_utils.MIN_WIDTH,
                    max: (0, import_utils.isPercentageUnit)(widthUnit) ? 100 : void 0,
                    step: 1,
                    onChange: (newWidth) => {
                      const parsedNewWidth = newWidth === "" ? void 0 : parseInt(newWidth, 10);
                      setAttributes({
                        width: parsedNewWidth
                      });
                    },
                    onUnitChange: (newUnit) => {
                      setAttributes({
                        width: "%" === newUnit ? import_utils.PC_WIDTH_DEFAULT : import_utils.PX_WIDTH_DEFAULT,
                        widthUnit: newUnit
                      });
                    },
                    __unstableInputWidth: "80px",
                    value: `${width}${widthUnit}`,
                    units
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.__experimentalToggleGroupControl,
                  {
                    label: (0, import_i18n.__)("Percentage Width"),
                    value: PERCENTAGE_WIDTHS.includes(width) && widthUnit === "%" ? width : void 0,
                    hideLabelFromVision: true,
                    onChange: (newWidth) => {
                      setAttributes({
                        width: newWidth,
                        widthUnit: "%"
                      });
                    },
                    isBlock: true,
                    children: PERCENTAGE_WIDTHS.map((widthValue) => {
                      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        import_components.__experimentalToggleGroupControlOption,
                        {
                          value: widthValue,
                          label: (0, import_i18n.sprintf)(
                            /* translators: %d: Percentage value. */
                            (0, import_i18n.__)("%d%%"),
                            widthValue
                          )
                        },
                        widthValue
                      );
                    })
                  }
                )
              ] })
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "advanced", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.SelectControl,
      {
        label: (0, import_i18n.__)("HTML element"),
        value: tagName ?? "",
        options: [
          { label: (0, import_i18n.__)("Default"), value: "" },
          { label: "<search>", value: "search" },
          { label: "<form>", value: "form" }
        ],
        onChange: (value) => {
          setAttributes({ tagName: value });
          (0, import_a11y.speak)(
            TAG_NAME_MESSAGES[value].replace(/[<>]/g, "")
          );
        },
        help: TAG_NAME_MESSAGES[tagName ?? ""]
      }
    ) })
  ] });
  const isNonZeroBorderRadius = (radius) => radius !== void 0 && parseInt(radius, 10) !== 0;
  const padBorderRadius = (radius) => isNonZeroBorderRadius(radius) ? `calc(${radius} + ${DEFAULT_INNER_PADDING})` : void 0;
  const getWrapperStyles = () => {
    const styles = isButtonPositionInside ? borderProps.style : {
      borderRadius: borderProps.style?.borderRadius,
      borderTopLeftRadius: borderProps.style?.borderTopLeftRadius,
      borderTopRightRadius: borderProps.style?.borderTopRightRadius,
      borderBottomLeftRadius: borderProps.style?.borderBottomLeftRadius,
      borderBottomRightRadius: borderProps.style?.borderBottomRightRadius
    };
    if (isButtonPositionInside) {
      if (typeof borderRadius === "object") {
        const {
          borderTopLeftRadius,
          borderTopRightRadius,
          borderBottomLeftRadius,
          borderBottomRightRadius
        } = borderProps.style;
        return {
          ...styles,
          borderTopLeftRadius: padBorderRadius(borderTopLeftRadius),
          borderTopRightRadius: padBorderRadius(borderTopRightRadius),
          borderBottomLeftRadius: padBorderRadius(
            borderBottomLeftRadius
          ),
          borderBottomRightRadius: padBorderRadius(
            borderBottomRightRadius
          )
        };
      }
      const radius = Number.isInteger(borderRadius) ? `${borderRadius}px` : borderRadius;
      styles.borderRadius = `calc(${radius} + ${DEFAULT_INNER_PADDING})`;
    }
    return styles;
  };
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: getBlockClassNames(),
    style: {
      ...typographyProps.style,
      // Input opts out of text decoration.
      textDecoration: void 0
    }
  });
  const labelClassnames = (0, import_clsx.default)(
    "wp-block-search__label",
    typographyProps.className
  );
  const Wrapper = "search" === tagName ? "search" : "div";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    controls,
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Wrapper, { ...blockProps, children: [
      showLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText,
        {
          identifier: "label",
          className: labelClassnames,
          "aria-label": (0, import_i18n.__)("Label text"),
          placeholder: (0, import_i18n.__)("Add label…"),
          withoutInteractiveFormatting: true,
          value: label,
          onChange: (html) => setAttributes({ label: html }),
          style: typographyProps.style
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        import_components.ResizableBox,
        {
          size: {
            width: width === void 0 ? "auto" : `${width}${widthUnit}`,
            height: "auto"
          },
          className: (0, import_clsx.default)(
            "wp-block-search__inside-wrapper",
            isButtonPositionInside ? borderProps.className : void 0
          ),
          style: getWrapperStyles(),
          minWidth: import_utils.MIN_WIDTH,
          enable: getResizableSides(),
          onResizeStart: (event, direction, elt) => {
            setAttributes({
              width: parseInt(elt.offsetWidth, 10),
              widthUnit: "px"
            });
            toggleSelection(false);
          },
          onResizeStop: (event, direction, elt, delta) => {
            setAttributes({
              width: parseInt(width + delta.width, 10)
            });
            toggleSelection(true);
          },
          showHandle: isSelected,
          children: [
            (isButtonPositionInside || isButtonPositionOutside || hasOnlyButton) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              renderTextField(),
              renderButton()
            ] }),
            hasNoButton && renderTextField()
          ]
        }
      )
    ] })
  ] });
}
//# sourceMappingURL=edit.cjs.map
