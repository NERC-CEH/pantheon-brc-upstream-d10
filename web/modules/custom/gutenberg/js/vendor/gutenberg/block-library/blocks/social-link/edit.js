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

// packages/block-library/src/social-link/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_keycodes = require("@wordpress/keycodes");
var import_data = require("@wordpress/data");
var import_block_editor = require("@wordpress/block-editor");
var import_element = require("@wordpress/element");
var import_components = require("@wordpress/components");
var import_compose = require("@wordpress/compose");
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var import_blocks = require("@wordpress/blocks");
var import_social_list = require("./social-list.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var SocialLinkURLPopover = ({
  url,
  setAttributes,
  setPopover,
  popoverAnchor,
  clientId
}) => {
  const { removeBlock } = (0, import_data.useDispatch)(import_block_editor.store);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.URLPopover,
    {
      anchor: popoverAnchor,
      "aria-label": (0, import_i18n.__)("Edit social link"),
      onClose: () => {
        setPopover(false);
        popoverAnchor?.focus();
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "form",
        {
          className: "block-editor-url-popover__link-editor",
          onSubmit: (event) => {
            event.preventDefault();
            setPopover(false);
            popoverAnchor?.focus();
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "block-editor-url-input", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.URLInput,
            {
              value: url,
              onChange: (nextURL) => setAttributes({ url: nextURL }),
              placeholder: (0, import_i18n.__)("Enter social link"),
              label: (0, import_i18n.__)("Enter social link"),
              hideLabelFromVision: true,
              disableSuggestions: true,
              onKeyDown: (event) => {
                if (!!url || event.defaultPrevented || ![import_keycodes.BACKSPACE, import_keycodes.DELETE].includes(
                  event.keyCode
                )) {
                  return;
                }
                removeBlock(clientId);
              },
              suffix: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalInputControlSuffixWrapper, { variant: "control", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.Button,
                {
                  icon: import_icons.keyboardReturn,
                  label: (0, import_i18n.__)("Apply"),
                  type: "submit",
                  size: "small"
                }
              ) })
            }
          ) })
        }
      )
    }
  );
};
var SocialLinkEdit = ({
  attributes,
  context,
  isSelected,
  setAttributes,
  clientId,
  name
}) => {
  const { url, service, label = "", rel } = attributes;
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const {
    showLabels,
    iconColor,
    iconColorValue,
    iconBackgroundColor,
    iconBackgroundColorValue
  } = context;
  const [showURLPopover, setPopover] = (0, import_element.useState)(false);
  const wrapperClasses = (0, import_clsx.default)(
    "wp-social-link",
    // Manually adding this class for backwards compatibility of CSS when moving the
    // blockProps from the li to the button: https://github.com/WordPress/gutenberg/pull/64883
    "wp-block-social-link",
    "wp-social-link-" + service,
    {
      "wp-social-link__is-incomplete": !url,
      [`has-${iconColor}-color`]: iconColor,
      [`has-${iconBackgroundColor}-background-color`]: iconBackgroundColor
    }
  );
  const [popoverAnchor, setPopoverAnchor] = (0, import_element.useState)(null);
  const isContentOnlyMode = (0, import_block_editor.useBlockEditingMode)() === "contentOnly";
  const { activeVariation } = (0, import_data.useSelect)(
    (select) => {
      const { getActiveBlockVariation } = select(import_blocks.store);
      return {
        activeVariation: getActiveBlockVariation(name, attributes)
      };
    },
    [name, attributes]
  );
  const { icon, label: socialLinkName } = (0, import_social_list.getSocialService)(activeVariation);
  const socialLinkText = label.trim() === "" ? socialLinkName : label;
  const ref = (0, import_element.useRef)();
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: "wp-block-social-link-anchor",
    ref: (0, import_compose.useMergeRefs)([setPopoverAnchor, ref]),
    onClick: () => setPopover(true),
    onKeyDown: (event) => {
      if (event.keyCode === import_keycodes.ENTER) {
        event.preventDefault();
        setPopover(true);
      }
    }
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    isContentOnlyMode && showLabels && // Add an extra control to modify the label attribute when content only mode is active.
    // With content only mode active, the inspector is hidden, so users need another way
    // to edit this attribute.
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Dropdown,
      {
        popoverProps: { placement: "bottom-start" },
        renderToggle: ({ isOpen, onToggle }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.ToolbarButton,
          {
            onClick: onToggle,
            "aria-haspopup": "true",
            "aria-expanded": isOpen,
            children: (0, import_i18n.__)("Text")
          }
        ),
        renderContent: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.TextControl,
          {
            className: "wp-block-social-link__toolbar_content_text",
            label: (0, import_i18n.__)("Text"),
            help: (0, import_i18n.__)(
              "Provide a text label or use the default."
            ),
            value: label,
            onChange: (value) => setAttributes({ label: value }),
            placeholder: socialLinkName
          }
        )
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({ label: void 0 });
        },
        dropdownMenuProps,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            isShownByDefault: true,
            label: (0, import_i18n.__)("Text"),
            hasValue: () => !!label,
            onDeselect: () => {
              setAttributes({ label: void 0 });
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.TextControl,
              {
                label: (0, import_i18n.__)("Text"),
                help: (0, import_i18n.__)(
                  "The text is visible when enabled from the parent Social Icons block."
                ),
                value: label,
                onChange: (value) => setAttributes({ label: value }),
                placeholder: socialLinkName
              }
            )
          }
        )
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "advanced", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.TextControl,
      {
        label: (0, import_i18n.__)("Link relation"),
        help: (0, import_element.createInterpolateElement)(
          (0, import_i18n.__)(
            "The <a>Link Relation</a> attribute defines the relationship between a linked resource and the current document."
          ),
          {
            a: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ExternalLink, { href: "https://developer.mozilla.org/docs/Web/HTML/Attributes/rel" })
          }
        ),
        value: rel || "",
        onChange: (value) => setAttributes({ rel: value })
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "li",
      {
        role: "presentation",
        className: wrapperClasses,
        style: {
          color: iconColorValue,
          backgroundColor: iconBackgroundColorValue
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { "aria-haspopup": "dialog", ...blockProps, role: "button", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Icon, { icon }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "span",
              {
                className: (0, import_clsx.default)("wp-block-social-link-label", {
                  "screen-reader-text": !showLabels
                }),
                children: socialLinkText
              }
            )
          ] }),
          isSelected && showURLPopover && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            SocialLinkURLPopover,
            {
              url,
              setAttributes,
              setPopover,
              popoverAnchor,
              clientId
            }
          )
        ]
      }
    )
  ] });
};
var edit_default = SocialLinkEdit;
//# sourceMappingURL=edit.cjs.map
