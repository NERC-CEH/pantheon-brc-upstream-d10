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

// packages/block-library/src/post-date/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => PostDateEdit,
  is12HourFormat: () => is12HourFormat
});
module.exports = __toCommonJS(edit_exports);
var import_core_data = require("@wordpress/core-data");
var import_element = require("@wordpress/element");
var import_date = require("@wordpress/date");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var import_keycodes = require("@wordpress/keycodes");
var import_data = require("@wordpress/data");
var import_blocks = require("@wordpress/blocks");
var import_hooks = require("../utils/hooks.cjs");
var import_deprecated_text_align_attributes = __toESM(require("../utils/deprecated-text-align-attributes.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function PostDateEdit(props) {
  const {
    attributes,
    context: { postType: postTypeSlug, queryId },
    setAttributes,
    name
  } = props;
  (0, import_deprecated_text_align_attributes.default)(props);
  const { datetime, format, isLink } = attributes;
  const blockProps = (0, import_block_editor.useBlockProps)();
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const [popoverAnchor, setPopoverAnchor] = (0, import_element.useState)(null);
  const popoverProps = (0, import_element.useMemo)(
    () => ({ anchor: popoverAnchor }),
    [popoverAnchor]
  );
  const { __unstableMarkNextChangeAsNotPersistent } = (0, import_data.useDispatch)(import_block_editor.store);
  (0, import_element.useEffect)(() => {
    if (datetime === void 0) {
      __unstableMarkNextChangeAsNotPersistent();
      setAttributes({ datetime: /* @__PURE__ */ new Date() });
    }
  }, [datetime]);
  const isDescendentOfQueryLoop = Number.isFinite(queryId);
  const dateSettings = (0, import_date.getSettings)();
  const {
    postType,
    siteFormat = dateSettings.formats.date,
    siteTimeFormat = dateSettings.formats.time
  } = (0, import_data.useSelect)(
    (select) => {
      const { getPostType, getEntityRecord } = select(import_core_data.store);
      const siteSettings = getEntityRecord("root", "site");
      return {
        siteFormat: siteSettings?.date_format,
        siteTimeFormat: siteSettings?.time_format,
        postType: postTypeSlug ? getPostType(postTypeSlug) : null
      };
    },
    [postTypeSlug]
  );
  const activeBlockVariationName = (0, import_data.useSelect)(
    (select) => select(import_blocks.store).getActiveBlockVariation(name, attributes)?.name,
    [name, attributes]
  );
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  const validDatetime = datetime || /* @__PURE__ */ new Date();
  let postDate = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "time",
    {
      dateTime: (0, import_date.dateI18n)("c", validDatetime),
      ref: setPopoverAnchor,
      children: format === "human-diff" ? (0, import_date.humanTimeDiff)(validDatetime) : (0, import_date.dateI18n)(format || siteFormat, validDatetime)
    }
  );
  if (isLink && datetime) {
    postDate = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "a",
      {
        href: "#post-date-pseudo-link",
        onClick: (event) => event.preventDefault(),
        children: postDate
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    (blockEditingMode === "default" || !isDescendentOfQueryLoop) && activeBlockVariationName !== "post-date-modified" && (!isDescendentOfQueryLoop || !activeBlockVariationName) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Dropdown,
      {
        popoverProps,
        renderContent: ({ onClose }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_block_editor.__experimentalPublishDateTimePicker,
          {
            title: activeBlockVariationName === "post-date" ? (0, import_i18n.__)("Publish Date") : (0, import_i18n.__)("Date"),
            currentDate: datetime,
            onChange: (newDatetime) => setAttributes({
              datetime: newDatetime
            }),
            is12Hour: is12HourFormat(
              siteTimeFormat
            ),
            onClose,
            dateOrder: (
              /* translators: Order of day, month, and year. Available formats are 'dmy', 'mdy', and 'ymd'. */
              (0, import_i18n._x)("dmy", "date order")
            )
          }
        ),
        renderToggle: ({ isOpen, onToggle }) => {
          const openOnArrowDown = (event) => {
            if (!isOpen && event.keyCode === import_keycodes.DOWN) {
              event.preventDefault();
              onToggle();
            }
          };
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.ToolbarButton,
            {
              "aria-expanded": isOpen,
              icon: import_icons.pencil,
              title: (0, import_i18n.__)("Change Date"),
              onClick: onToggle,
              onKeyDown: openOnArrowDown
            }
          );
        }
      }
    ) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            datetime: void 0,
            format: void 0,
            isLink: false
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => !!format,
              label: (0, import_i18n.__)("Date Format"),
              onDeselect: () => setAttributes({ format: void 0 }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_block_editor.__experimentalDateFormatPicker,
                {
                  format,
                  defaultFormat: siteFormat,
                  onChange: (nextFormat) => setAttributes({ format: nextFormat })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              hasValue: () => isLink !== false,
              label: postType?.labels?.singular_name ? (0, import_i18n.sprintf)(
                // translators: %s: Name of the post type e.g: "post".
                (0, import_i18n.__)("Link to %s"),
                postType.labels.singular_name.toLowerCase()
              ) : (0, import_i18n.__)("Link to post"),
              onDeselect: () => setAttributes({ isLink: false }),
              isShownByDefault: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: postType?.labels?.singular_name ? (0, import_i18n.sprintf)(
                    // translators: %s: Name of the post type e.g: "post".
                    (0, import_i18n.__)("Link to %s"),
                    postType.labels.singular_name.toLowerCase()
                  ) : (0, import_i18n.__)("Link to post"),
                  onChange: () => setAttributes({ isLink: !isLink }),
                  checked: isLink
                }
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: postDate })
  ] });
}
function is12HourFormat(format) {
  return /(?:^|[^\\])[aAgh]/.test(format);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  is12HourFormat
});
//# sourceMappingURL=edit.cjs.map
