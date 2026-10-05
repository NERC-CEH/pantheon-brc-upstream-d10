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

// packages/block-library/src/calendar/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => CalendarEdit
});
module.exports = __toCommonJS(edit_exports);
var import_memize = __toESM(require("memize"));
var import_icons = require("@wordpress/icons");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_server_side_render = require("@wordpress/server-side-render");
var import_block_editor = require("@wordpress/block-editor");
var import_core_data = require("@wordpress/core-data");
var import_i18n = require("@wordpress/i18n");
var import_compose = require("@wordpress/compose");
var import_html_renderer = __toESM(require("../utils/html-renderer.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var getYearMonth = (0, import_memize.default)((date) => {
  if (!date) {
    return {};
  }
  const dateObj = new Date(date);
  return {
    year: dateObj.getFullYear(),
    month: dateObj.getMonth() + 1
  };
});
function CalendarEdit({ attributes, name }) {
  const { date, hasPosts, hasPostsResolved } = (0, import_data.useSelect)((select) => {
    const { getEntityRecords, hasFinishedResolution } = select(import_core_data.store);
    const singlePublishedPostQuery = {
      status: "publish",
      per_page: 1
    };
    const posts = getEntityRecords(
      "postType",
      "post",
      singlePublishedPostQuery
    );
    const postsResolved = hasFinishedResolution("getEntityRecords", [
      "postType",
      "post",
      singlePublishedPostQuery
    ]);
    let _date;
    const editorSelectors = select("core/editor");
    if (editorSelectors) {
      const postType = editorSelectors.getEditedPostAttribute("type");
      if (postType === "post") {
        _date = editorSelectors.getEditedPostAttribute("date");
      }
    }
    return {
      date: _date,
      hasPostsResolved: postsResolved,
      hasPosts: postsResolved && posts?.length === 1
    };
  }, []);
  const { content, status, error } = (0, import_server_side_render.useServerSideRender)({
    attributes: {
      ...attributes,
      ...getYearMonth(date)
    },
    block: name
  });
  const disabledRef = (0, import_compose.useDisabled)();
  const blockProps = (0, import_block_editor.useBlockProps)({ ref: disabledRef });
  if (!hasPosts) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Placeholder, { icon: import_icons.calendar, label: (0, import_i18n.__)("Calendar"), children: !hasPostsResolved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {}) : (0, import_i18n.__)("No published posts found.") }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
