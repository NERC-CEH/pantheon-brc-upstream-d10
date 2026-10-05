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

// packages/block-library/src/spacer/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_element = require("@wordpress/element");
var import_data = require("@wordpress/data");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_controls = __toESM(require("./controls.cjs"));
var import_constants = require("./constants.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var { useSpacingSizes } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
var ResizableSpacer = ({
  orientation,
  onResizeStart,
  onResize,
  onResizeStop,
  isSelected,
  isResizing,
  setIsResizing,
  ...props
}) => {
  const getCurrentSize = (elt) => {
    return orientation === "horizontal" ? elt.clientWidth : elt.clientHeight;
  };
  const getNextVal = (elt) => {
    return `${getCurrentSize(elt)}px`;
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.ResizableBox,
    {
      className: (0, import_clsx.default)("block-library-spacer__resize-container", {
        "resize-horizontal": orientation === "horizontal",
        "is-resizing": isResizing,
        "is-selected": isSelected
      }),
      onResizeStart: (_event, _direction, elt) => {
        const nextVal = getNextVal(elt);
        onResizeStart(nextVal);
        onResize(nextVal);
      },
      onResize: (_event, _direction, elt) => {
        onResize(getNextVal(elt));
        if (!isResizing) {
          setIsResizing(true);
        }
      },
      onResizeStop: (_event, _direction, elt) => {
        const nextVal = getCurrentSize(elt);
        onResizeStop(`${nextVal}px`);
        setIsResizing(false);
      },
      __experimentalShowTooltip: true,
      __experimentalTooltipProps: {
        axis: orientation === "horizontal" ? "x" : "y",
        position: "corner",
        isVisible: isResizing
      },
      showHandle: isSelected,
      ...props
    }
  );
};
var SpacerEdit = ({
  attributes,
  isSelected,
  setAttributes,
  toggleSelection,
  context,
  __unstableParentLayout: parentLayout,
  className
}) => {
  const disableCustomSpacingSizes = (0, import_data.useSelect)((select) => {
    const editorSettings = select(import_block_editor.store).getSettings();
    return editorSettings?.disableCustomSpacingSizes;
  });
  const { orientation } = context;
  const {
    orientation: parentOrientation,
    type,
    default: { type: defaultType } = {}
  } = parentLayout || {};
  const isFlexLayout = type === "flex" || !type && defaultType === "flex";
  const inheritedOrientation = !parentOrientation && isFlexLayout ? "horizontal" : parentOrientation || orientation;
  const { height, width, style: blockStyle = {} } = attributes;
  const { layout = {} } = blockStyle;
  const { selfStretch, flexSize } = layout;
  const spacingSizes = useSpacingSizes();
  const [isResizing, setIsResizing] = (0, import_element.useState)(false);
  const [temporaryHeight, setTemporaryHeight] = (0, import_element.useState)(null);
  const [temporaryWidth, setTemporaryWidth] = (0, import_element.useState)(null);
  const onResizeStart = () => toggleSelection(false);
  const onResizeStop = () => toggleSelection(true);
  const { __unstableMarkNextChangeAsNotPersistent } = (0, import_data.useDispatch)(import_block_editor.store);
  const handleOnVerticalResizeStop = (newHeight) => {
    onResizeStop();
    if (isFlexLayout) {
      setAttributes({
        style: {
          ...blockStyle,
          layout: {
            ...layout,
            flexSize: newHeight,
            selfStretch: "fixed"
          }
        }
      });
    }
    setAttributes({ height: newHeight });
    setTemporaryHeight(null);
  };
  const handleOnHorizontalResizeStop = (newWidth) => {
    onResizeStop();
    if (isFlexLayout) {
      setAttributes({
        style: {
          ...blockStyle,
          layout: {
            ...layout,
            flexSize: newWidth,
            selfStretch: "fixed"
          }
        }
      });
    }
    setAttributes({ width: newWidth });
    setTemporaryWidth(null);
  };
  const getHeightForVerticalBlocks = () => {
    if (isFlexLayout) {
      return void 0;
    }
    return temporaryHeight || (0, import_block_editor.getSpacingPresetCssVar)(height) || void 0;
  };
  const getWidthForHorizontalBlocks = () => {
    if (isFlexLayout) {
      return void 0;
    }
    return temporaryWidth || (0, import_block_editor.getSpacingPresetCssVar)(width) || void 0;
  };
  const sizeConditionalOnOrientation = inheritedOrientation === "horizontal" ? temporaryWidth || flexSize : temporaryHeight || flexSize;
  const style = {
    height: inheritedOrientation === "horizontal" ? 24 : getHeightForVerticalBlocks(),
    width: inheritedOrientation === "horizontal" ? getWidthForHorizontalBlocks() : void 0,
    // In vertical flex containers, the spacer shrinks to nothing without a minimum width.
    minWidth: inheritedOrientation === "vertical" && isFlexLayout ? 48 : void 0,
    // Add flex-basis so temporary sizes are respected.
    flexBasis: isFlexLayout ? sizeConditionalOnOrientation : void 0,
    // Remove flex-grow when resizing.
    flexGrow: isFlexLayout && isResizing ? 0 : void 0
  };
  const resizableBoxWithOrientation = (blockOrientation) => {
    if (blockOrientation === "horizontal") {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ResizableSpacer,
        {
          minWidth: import_constants.MIN_SPACER_SIZE,
          enable: {
            top: false,
            right: true,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false
          },
          orientation: blockOrientation,
          onResizeStart,
          onResize: setTemporaryWidth,
          onResizeStop: handleOnHorizontalResizeStop,
          isSelected,
          isResizing,
          setIsResizing
        }
      );
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ResizableSpacer,
      {
        minHeight: import_constants.MIN_SPACER_SIZE,
        enable: {
          top: false,
          right: false,
          bottom: true,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        },
        orientation: blockOrientation,
        onResizeStart,
        onResize: setTemporaryHeight,
        onResizeStop: handleOnVerticalResizeStop,
        isSelected,
        isResizing,
        setIsResizing
      }
    ) });
  };
  (0, import_element.useEffect)(() => {
    const setAttributesCovertly = (nextAttributes) => {
      __unstableMarkNextChangeAsNotPersistent();
      setAttributes(nextAttributes);
    };
    if (isFlexLayout && selfStretch !== "fill" && selfStretch !== "fit" && flexSize === void 0) {
      if (inheritedOrientation === "horizontal") {
        const newSize = (0, import_block_editor.getCustomValueFromPreset)(width, spacingSizes) || (0, import_block_editor.getCustomValueFromPreset)(height, spacingSizes) || "100px";
        setAttributesCovertly({
          width: "0px",
          style: {
            ...blockStyle,
            layout: {
              ...layout,
              flexSize: newSize,
              selfStretch: "fixed"
            }
          }
        });
      } else {
        const newSize = (0, import_block_editor.getCustomValueFromPreset)(height, spacingSizes) || (0, import_block_editor.getCustomValueFromPreset)(width, spacingSizes) || "100px";
        setAttributesCovertly({
          height: "0px",
          style: {
            ...blockStyle,
            layout: {
              ...layout,
              flexSize: newSize,
              selfStretch: "fixed"
            }
          }
        });
      }
    } else if (isFlexLayout && (selfStretch === "fill" || selfStretch === "fit")) {
      setAttributesCovertly(
        inheritedOrientation === "horizontal" ? { width: void 0 } : { height: void 0 }
      );
    } else if (!isFlexLayout && (selfStretch || flexSize)) {
      setAttributesCovertly({
        ...inheritedOrientation === "horizontal" ? { width: flexSize } : { height: flexSize },
        style: {
          ...blockStyle,
          layout: {
            ...layout,
            flexSize: void 0,
            selfStretch: void 0
          }
        }
      });
    }
  }, [
    blockStyle,
    flexSize,
    height,
    inheritedOrientation,
    isFlexLayout,
    layout,
    selfStretch,
    setAttributes,
    spacingSizes,
    width,
    __unstableMarkNextChangeAsNotPersistent
  ]);
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        ...(0, import_block_editor.useBlockProps)({
          style,
          className: (0, import_clsx.default)(className, {
            "custom-sizes-disabled": disableCustomSpacingSizes
          })
        }),
        children: blockEditingMode === "default" && resizableBoxWithOrientation(inheritedOrientation)
      }
    ),
    !isFlexLayout && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_controls.default,
      {
        setAttributes,
        height: temporaryHeight || height,
        width: temporaryWidth || width,
        orientation: inheritedOrientation,
        isResizing
      }
    )
  ] });
};
var edit_default = SpacerEdit;
//# sourceMappingURL=edit.cjs.map
