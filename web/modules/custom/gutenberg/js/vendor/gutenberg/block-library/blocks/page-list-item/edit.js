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

// packages/block-library/src/page-list-item/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => PageListItemEdit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_core_data = require("@wordpress/core-data");
var import_dom = require("@wordpress/dom");
var import_icons = require("../navigation-link/icons.cjs");
var import_utils = require("../navigation/edit/utils.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function useFrontPageId() {
  return (0, import_data.useSelect)((select) => {
    const canReadSettings = select(import_core_data.store).canUser("read", {
      kind: "root",
      name: "site"
    });
    if (!canReadSettings) {
      return void 0;
    }
    const site = select(import_core_data.store).getEntityRecord("root", "site");
    return site?.show_on_front === "page" && site?.page_on_front;
  }, []);
}
function PageListItemEdit({ context, attributes }) {
  const { id, label, link, hasChildren, title } = attributes;
  const isNavigationChild = "showSubmenuIcon" in context;
  const frontPageId = useFrontPageId();
  const submenuVisibility = context.submenuVisibility;
  const openOnClick = submenuVisibility === "click";
  const innerBlocksColors = (0, import_utils.getColors)(context, true);
  const navigationChildBlockProps = (0, import_utils.getNavigationChildBlockProps)(innerBlocksColors);
  const blockProps = (0, import_block_editor.useBlockProps)(navigationChildBlockProps, {
    className: "wp-block-pages-list__item"
  });
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(blockProps);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "li",
    {
      className: (0, import_clsx.default)("wp-block-pages-list__item", {
        "has-child": hasChildren,
        "wp-block-navigation-item": isNavigationChild,
        // Class assignment logic matches PHP rendering in page-list/index.php
        "open-on-click": openOnClick,
        "open-always": submenuVisibility === "always",
        // Must check hover mode explicitly to match PHP elseif structure (index.php:212)
        "open-on-hover-click": submenuVisibility === "hover" && context.showSubmenuIcon,
        "menu-item-home": id === frontPageId
      }),
      children: [
        hasChildren && openOnClick ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              className: "wp-block-navigation-item__content wp-block-navigation-submenu__toggle",
              "aria-expanded": "false",
              dangerouslySetInnerHTML: {
                __html: (0, import_dom.safeHTML)(label)
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wp-block-page-list__submenu-icon wp-block-navigation__submenu-icon", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_icons.ItemSubmenuIcon, {}) })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "a",
          {
            className: (0, import_clsx.default)("wp-block-pages-list__item__link", {
              "wp-block-navigation-item__content": isNavigationChild
            }),
            href: link,
            dangerouslySetInnerHTML: {
              __html: (0, import_dom.safeHTML)(title)
            }
          }
        ),
        hasChildren && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          !openOnClick && context.showSubmenuIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "wp-block-navigation-item__content wp-block-navigation-submenu__toggle wp-block-page-list__submenu-icon wp-block-navigation__submenu-icon",
              "aria-expanded": "false",
              type: "button",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_icons.ItemSubmenuIcon, {})
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { ...innerBlocksProps })
        ] })
      ]
    },
    id
  );
}
//# sourceMappingURL=edit.cjs.map
