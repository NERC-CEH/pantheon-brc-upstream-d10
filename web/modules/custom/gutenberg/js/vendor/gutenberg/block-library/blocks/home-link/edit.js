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

// packages/block-library/src/home-link/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => HomeEdit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_data = require("@wordpress/data");
var import_core_data = require("@wordpress/core-data");
var import_icons = require("@wordpress/icons");
var import_dom = require("@wordpress/dom");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var preventDefault = (event) => event.preventDefault();
function HomeEdit({ attributes, setAttributes, context }) {
  const {
    homeUrl,
    onNavigateToEntityRecord,
    frontPageId,
    frontPageTemplateId
  } = (0, import_data.useSelect)((select) => {
    const { getEntityRecord, getDefaultTemplateId, canUser } = select(import_core_data.store);
    const baseUrl = getEntityRecord("root", "__unstableBase")?.home;
    const canReadSettings = canUser("read", {
      kind: "root",
      name: "site"
    });
    const site = canReadSettings ? getEntityRecord("root", "site") : null;
    const resolvedFrontPageId = site?.show_on_front === "page" ? site?.page_on_front : null;
    const resolvedFrontPageTemplateId = !resolvedFrontPageId ? getDefaultTemplateId({ slug: "front-page" }) : null;
    return {
      homeUrl: baseUrl,
      onNavigateToEntityRecord: select(import_block_editor.store).getSettings().onNavigateToEntityRecord,
      frontPageId: resolvedFrontPageId,
      frontPageTemplateId: resolvedFrontPageTemplateId
    };
  }, []);
  const { textColor, backgroundColor, style } = context;
  const { label, opensInNewTab, description } = attributes;
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: (0, import_clsx.default)("wp-block-navigation-item", {
      "has-text-color": !!textColor || !!style?.color?.text,
      [`has-${textColor}-color`]: !!textColor,
      "has-background": !!backgroundColor || !!style?.color?.background,
      [`has-${backgroundColor}-background-color`]: !!backgroundColor
    }),
    style: {
      color: style?.color?.text,
      backgroundColor: style?.color?.background
    }
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "content", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            label: "",
            opensInNewTab: false,
            description: ""
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!label,
              label: (0, import_i18n.__)("Text"),
              onDeselect: () => setAttributes({ label: "" }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.TextControl,
                {
                  label: (0, import_i18n.__)("Text"),
                  value: label ? (0, import_dom.__unstableStripHTML)(label) : "",
                  onChange: (labelValue) => {
                    setAttributes({ label: labelValue });
                  },
                  autoComplete: "off"
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!opensInNewTab,
              label: (0, import_i18n.__)("Open in new tab"),
              onDeselect: () => setAttributes({ opensInNewTab: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.CheckboxControl,
                {
                  label: (0, import_i18n.__)("Open in new tab"),
                  checked: opensInNewTab,
                  onChange: (value) => setAttributes({ opensInNewTab: value })
                }
              )
            }
          ),
          onNavigateToEntityRecord && (frontPageId || frontPageTemplateId) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.Button,
            {
              variant: "secondary",
              onClick: () => {
                if (frontPageId) {
                  onNavigateToEntityRecord({
                    postId: frontPageId,
                    postType: "page"
                  });
                } else {
                  onNavigateToEntityRecord({
                    postId: frontPageTemplateId,
                    postType: "wp_template"
                  });
                }
              },
              __next40pxDefaultSize: true,
              className: "navigation-link-to__action-button",
              children: (0, import_i18n.__)("Edit")
            }
          ),
          homeUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.Button,
            {
              variant: "secondary",
              href: homeUrl,
              target: "_blank",
              icon: import_icons.external,
              iconPosition: "right",
              __next40pxDefaultSize: true,
              className: "navigation-link-to__action-button",
              children: (0, import_i18n.__)("View")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!description,
              label: (0, import_i18n.__)("Description"),
              onDeselect: () => setAttributes({ description: "" }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.TextareaControl,
                {
                  label: (0, import_i18n.__)("Description"),
                  value: description || "",
                  onChange: (descriptionValue) => {
                    setAttributes({
                      description: descriptionValue
                    });
                  },
                  help: (0, import_i18n.__)(
                    "The description will be displayed in the menu if the current theme supports it."
                  )
                }
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "a",
      {
        className: "wp-block-home-link__content wp-block-navigation-item__content",
        href: homeUrl,
        onClick: preventDefault,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.RichText,
            {
              identifier: "label",
              className: "wp-block-home-link__label",
              value: label ?? (0, import_i18n.__)("Home"),
              onChange: (labelValue) => {
                setAttributes({ label: labelValue });
              },
              "aria-label": (0, import_i18n.__)("Home link text"),
              placeholder: (0, import_i18n.__)("Add label…"),
              withoutInteractiveFormatting: true
            }
          ),
          description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wp-block-navigation-item__description", children: description })
        ]
      }
    ) })
  ] });
}
//# sourceMappingURL=edit.cjs.map
