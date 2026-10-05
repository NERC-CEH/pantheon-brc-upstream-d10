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

// packages/block-library/src/accordion/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => Edit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_blocks = require("@wordpress/blocks");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var ACCORDION_BLOCK_NAME = "core/accordion-item";
var ACCORDION_HEADING_BLOCK_NAME = "core/accordion-heading";
var ACCORDION_BLOCK = {
  name: ACCORDION_BLOCK_NAME
};
function Edit({
  attributes: {
    autoclose,
    iconPosition,
    showIcon,
    headingLevel,
    levelOptions
  },
  clientId,
  setAttributes,
  isSelected: isSingleSelected
}) {
  const registry = (0, import_data.useRegistry)();
  const { getBlockOrder } = (0, import_data.useSelect)(import_block_editor.store);
  const blockProps = (0, import_block_editor.useBlockProps)({
    role: "group"
  });
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const { updateBlockAttributes, insertBlock } = (0, import_data.useDispatch)(import_block_editor.store);
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  const isContentOnlyMode = blockEditingMode === "contentOnly";
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps, {
    defaultBlock: ACCORDION_BLOCK,
    directInsert: true
  });
  const addAccordionItemBlock = () => {
    const newAccordionItem = (0, import_blocks.createBlock)(ACCORDION_BLOCK_NAME, {}, [
      (0, import_blocks.createBlock)(ACCORDION_HEADING_BLOCK_NAME, {
        level: headingLevel
      }),
      (0, import_blocks.createBlock)("core/accordion-panel", {})
    ]);
    insertBlock(newAccordionItem, void 0, clientId);
  };
  const updateHeadingLevel = (newHeadingLevel) => {
    const innerBlockClientIds = getBlockOrder(clientId);
    const accordionHeaderClientIds = [];
    innerBlockClientIds.forEach((contentClientId) => {
      const headerClientIds = getBlockOrder(contentClientId);
      accordionHeaderClientIds.push(...headerClientIds);
    });
    registry.batch(() => {
      setAttributes({ headingLevel: newHeadingLevel });
      updateBlockAttributes(accordionHeaderClientIds, {
        level: newHeadingLevel
      });
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    isSingleSelected && !isContentOnlyMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.HeadingLevelDropdown,
        {
          value: headingLevel,
          options: levelOptions,
          onChange: updateHeadingLevel
        }
      ) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarButton, { onClick: addAccordionItemBlock, children: (0, import_i18n.__)("Add item") }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            autoclose: false,
            showIcon: true,
            iconPosition: "right"
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Auto-close"),
              isShownByDefault: true,
              hasValue: () => !!autoclose,
              onDeselect: () => setAttributes({ autoclose: false }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Auto-close"),
                  onChange: (value) => {
                    setAttributes({
                      autoclose: value
                    });
                  },
                  checked: autoclose,
                  help: (0, import_i18n.__)(
                    "Automatically close accordions when a new one is opened."
                  )
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Show icon"),
              isShownByDefault: true,
              hasValue: () => !showIcon,
              onDeselect: () => setAttributes({ showIcon: true }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show icon"),
                  onChange: (value) => {
                    setAttributes({
                      showIcon: value,
                      iconPosition: value ? iconPosition : "right"
                    });
                  },
                  checked: showIcon,
                  help: (0, import_i18n.__)(
                    "Display a plus icon next to the accordion header."
                  )
                }
              )
            }
          ),
          showIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Icon Position"),
              isShownByDefault: true,
              hasValue: () => iconPosition !== "right",
              onDeselect: () => setAttributes({ iconPosition: "right" }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                import_components.__experimentalToggleGroupControl,
                {
                  isBlock: true,
                  label: (0, import_i18n.__)("Icon Position"),
                  value: iconPosition,
                  onChange: (value) => {
                    setAttributes({ iconPosition: value });
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_components.__experimentalToggleGroupControlOption,
                      {
                        label: (0, import_i18n.__)("Left"),
                        value: "left"
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_components.__experimentalToggleGroupControlOption,
                      {
                        label: (0, import_i18n.__)("Right"),
                        value: "right"
                      }
                    )
                  ]
                }
              )
            }
          )
        ]
      }
    ) }, "setting"),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...innerBlocksProps })
  ] });
}
//# sourceMappingURL=edit.cjs.map
