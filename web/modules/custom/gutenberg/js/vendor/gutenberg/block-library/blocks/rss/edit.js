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

// packages/block-library/src/rss/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => RSSEdit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_element = require("@wordpress/element");
var import_icons = require("@wordpress/icons");
var import_i18n = require("@wordpress/i18n");
var import_url = require("@wordpress/url");
var import_server_side_render = require("@wordpress/server-side-render");
var import_compose = require("@wordpress/compose");
var import_hooks = require("../utils/hooks.cjs");
var import_html_renderer = __toESM(require("../utils/html-renderer.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var DEFAULT_MIN_ITEMS = 1;
var DEFAULT_MAX_ITEMS = 20;
function RSSEdit({ attributes, setAttributes, name }) {
  const [isEditing, setIsEditing] = (0, import_element.useState)(!attributes.feedURL);
  const {
    blockLayout,
    columns,
    displayAuthor,
    displayDate,
    displayExcerpt,
    excerptLength,
    feedURL,
    itemsToShow,
    openInNewTab,
    rel
  } = attributes;
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  function toggleAttribute(propName) {
    return () => {
      const value = attributes[propName];
      setAttributes({ [propName]: !value });
    };
  }
  function onSubmitURL(event) {
    event.preventDefault();
    if (feedURL) {
      setAttributes({ feedURL: (0, import_url.prependHTTPS)(feedURL) });
      setIsEditing(false);
    }
  }
  const { content, status, error } = (0, import_server_side_render.useServerSideRender)({
    attributes,
    skipBlockSupportAttributes: true,
    block: name
  });
  const disabledRef = (0, import_compose.useDisabled)();
  const blockProps = (0, import_block_editor.useBlockProps)({ ref: isEditing ? null : disabledRef });
  const label = (0, import_i18n.__)("RSS URL");
  if (isEditing) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Placeholder,
      {
        icon: import_icons.rss,
        label,
        instructions: (0, import_i18n.__)(
          "Display entries from any RSS or Atom feed."
        ),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "form",
          {
            onSubmit: onSubmitURL,
            className: "wp-block-rss__placeholder-form",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.__experimentalInputControl,
                {
                  label,
                  type: "url",
                  hideLabelFromVision: true,
                  placeholder: (0, import_i18n.__)("Enter URL here…"),
                  value: feedURL,
                  onChange: (value) => setAttributes({ feedURL: value }),
                  className: "wp-block-rss__placeholder-input"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.Button,
                {
                  __next40pxDefaultSize: true,
                  variant: "primary",
                  type: "submit",
                  children: (0, import_i18n.__)("Apply")
                }
              )
            ]
          }
        )
      }
    ) });
  }
  const toolbarControls = [
    {
      icon: import_icons.pencil,
      title: (0, import_i18n.__)("Edit RSS URL"),
      onClick: () => setIsEditing(true)
    },
    {
      icon: import_icons.list,
      title: (0, import_i18n._x)("List view", "RSS block display setting"),
      onClick: () => setAttributes({ blockLayout: "list" }),
      isActive: blockLayout === "list"
    },
    {
      icon: import_icons.grid,
      title: (0, import_i18n._x)("Grid view", "RSS block display setting"),
      onClick: () => setAttributes({ blockLayout: "grid" }),
      isActive: blockLayout === "grid"
    }
  ];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { controls: toolbarControls }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            itemsToShow: 5,
            displayAuthor: false,
            displayDate: false,
            displayExcerpt: false,
            excerptLength: 55,
            columns: 2,
            openInNewTab: false
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Number of items"),
              hasValue: () => itemsToShow !== 5,
              onDeselect: () => setAttributes({ itemsToShow: 5 }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.RangeControl,
                {
                  label: (0, import_i18n.__)("Number of items"),
                  value: itemsToShow,
                  onChange: (value) => setAttributes({ itemsToShow: value }),
                  min: DEFAULT_MIN_ITEMS,
                  max: DEFAULT_MAX_ITEMS,
                  required: true
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Display author"),
              hasValue: () => !!displayAuthor,
              onDeselect: () => setAttributes({ displayAuthor: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Display author"),
                  checked: displayAuthor,
                  onChange: toggleAttribute("displayAuthor")
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Display date"),
              hasValue: () => !!displayDate,
              onDeselect: () => setAttributes({ displayDate: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Display date"),
                  checked: displayDate,
                  onChange: toggleAttribute("displayDate")
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Display excerpt"),
              hasValue: () => !!displayExcerpt,
              onDeselect: () => setAttributes({ displayExcerpt: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Display excerpt"),
                  checked: displayExcerpt,
                  onChange: toggleAttribute("displayExcerpt")
                }
              )
            }
          ),
          displayExcerpt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Max number of words in excerpt"),
              hasValue: () => excerptLength !== 55,
              onDeselect: () => setAttributes({ excerptLength: 55 }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.RangeControl,
                {
                  label: (0, import_i18n.__)("Max number of words in excerpt"),
                  value: excerptLength,
                  onChange: (value) => setAttributes({ excerptLength: value }),
                  min: 10,
                  max: 100,
                  required: true
                }
              )
            }
          ),
          blockLayout === "grid" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Columns"),
              hasValue: () => columns !== 2,
              onDeselect: () => setAttributes({ columns: 2 }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.RangeControl,
                {
                  label: (0, import_i18n.__)("Columns"),
                  value: columns,
                  onChange: (value) => setAttributes({ columns: value }),
                  min: 2,
                  max: 6,
                  required: true
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Open links in new tab"),
              hasValue: () => !!openInNewTab,
              onDeselect: () => setAttributes({ openInNewTab: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Open links in new tab"),
                  checked: openInNewTab,
                  onChange: (value) => setAttributes({ openInNewTab: value })
                }
              )
            }
          )
        ]
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
    status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {}) }),
    status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: (0, import_i18n.sprintf)(
      /* translators: %s: error message returned when rendering the block. */
      (0, import_i18n.__)("Error: %s"),
      error
    ) }) }),
    status === "success" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_html_renderer.default, { wrapperProps: blockProps, html: content })
  ] });
}
//# sourceMappingURL=edit.cjs.map
