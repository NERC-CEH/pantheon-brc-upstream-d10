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

// packages/block-library/src/avatar/user-control.jsx
var user_control_exports = {};
__export(user_control_exports, {
  default: () => UserControl
});
module.exports = __toCommonJS(user_control_exports);
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_core_data = require("@wordpress/core-data");
var import_element = require("@wordpress/element");
var import_compose = require("@wordpress/compose");
var import_html_entities = require("@wordpress/html-entities");
var import_jsx_runtime = require("react/jsx-runtime");
var AUTHORS_QUERY = {
  who: "authors",
  per_page: 100,
  _fields: "id,name",
  context: "view"
};
function UserControl({ value, onChange }) {
  const [filterValue, setFilterValue] = (0, import_element.useState)("");
  const { authors, isLoading } = (0, import_data.useSelect)(
    (select) => {
      const { getUsers, isResolving } = select(import_core_data.store);
      const query = { ...AUTHORS_QUERY };
      if (filterValue) {
        query.search = filterValue;
        query.search_columns = ["name"];
      }
      return {
        authors: getUsers(query),
        isLoading: isResolving("getUsers", [query])
      };
    },
    [filterValue]
  );
  const options = (0, import_element.useMemo)(() => {
    return (authors ?? []).map((author) => {
      return {
        value: author.id,
        label: (0, import_html_entities.decodeEntities)(author.name)
      };
    });
  }, [authors]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.ComboboxControl,
    {
      label: (0, import_i18n.__)("User"),
      help: (0, import_i18n.__)(
        "Select the avatar user to display, if it is blank it will use the post/page author."
      ),
      value,
      onChange,
      options,
      onFilterValueChange: (0, import_compose.debounce)(setFilterValue, 300),
      isLoading
    }
  );
}
//# sourceMappingURL=user-control.cjs.map
