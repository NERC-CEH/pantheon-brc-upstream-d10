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

// packages/block-library/src/accordion-heading/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => Edit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_i18n = require("@wordpress/i18n");
var import_element = require("@wordpress/element");
var import_block_editor = require("@wordpress/block-editor");
var import_data = require("@wordpress/data");
var import_jsx_runtime = require("react/jsx-runtime");
function Edit({ attributes, setAttributes, context }) {
  const { title } = attributes;
  const {
    "core/accordion-icon-position": iconPosition,
    "core/accordion-show-icon": showIcon,
    "core/accordion-heading-level": headingLevel
  } = context;
  const TagName = "h" + headingLevel;
  const { __unstableMarkNextChangeAsNotPersistent } = (0, import_data.useDispatch)(import_block_editor.store);
  (0, import_element.useEffect)(() => {
    if (iconPosition !== void 0 && showIcon !== void 0) {
      __unstableMarkNextChangeAsNotPersistent();
      setAttributes({
        iconPosition,
        showIcon
      });
    }
  }, [
    iconPosition,
    showIcon,
    setAttributes,
    __unstableMarkNextChangeAsNotPersistent
  ]);
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
  const blockProps = (0, import_block_editor.useBlockProps)({
    className: (0, import_clsx.default)({
      "has-icon": showIcon,
      "has-icon-left": showIcon && iconPosition === "left",
      "has-icon-right": showIcon && iconPosition === "right"
    })
  });
  const spacingProps = (0, import_block_editor.__experimentalGetSpacingClassesAndStyles)(attributes);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      className: "wp-block-accordion-heading__toggle",
      style: spacingProps.style,
      tabIndex: "-1",
      children: [
        showIcon && iconPosition === "left" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "span",
          {
            className: "wp-block-accordion-heading__toggle-icon",
            "aria-hidden": "true",
            children: "+"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_block_editor.RichText,
          {
            withoutInteractiveFormatting: true,
            disableLineBreaks: true,
            tagName: "span",
            value: title,
            onChange: (newTitle) => setAttributes({ title: newTitle }),
            placeholder: (0, import_i18n.__)("Accordion title"),
            className: "wp-block-accordion-heading__toggle-title",
            style: {
              letterSpacing: typographyProps.style.letterSpacing,
              textDecoration: typographyProps.style.textDecoration
            }
          }
        ),
        showIcon && iconPosition === "right" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "span",
          {
            className: "wp-block-accordion-heading__toggle-icon",
            "aria-hidden": "true",
            children: "+"
          }
        )
      ]
    }
  ) });
}
//# sourceMappingURL=edit.cjs.map
