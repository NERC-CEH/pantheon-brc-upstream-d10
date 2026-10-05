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

// packages/block-library/src/separator/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => SeparatorEdit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_use_deprecated_opacity = __toESM(require("./use-deprecated-opacity.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var HtmlElementControl = ({ tagName, setAttributes }) => {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.SelectControl,
    {
      label: (0, import_i18n.__)("HTML element"),
      value: tagName,
      onChange: (newValue) => setAttributes({ tagName: newValue }),
      options: [
        { label: (0, import_i18n.__)("Default (<hr>)"), value: "hr" },
        { label: "<div>", value: "div" }
      ],
      help: tagName === "hr" ? (0, import_i18n.__)(
        "Only select <hr> if the separator conveys important information and should be announced by screen readers."
      ) : (0, import_i18n.__)(
        "The <div> element should only be used if the block is a design element with no semantic meaning."
      )
    }
  );
};
function SeparatorEdit({ attributes, setAttributes }) {
  const { backgroundColor, opacity, style, tagName } = attributes;
  const colorProps = (0, import_block_editor.__experimentalUseColorProps)(attributes);
  const currentColor = colorProps?.style?.backgroundColor;
  const hasCustomColor = !!style?.color?.background;
  (0, import_use_deprecated_opacity.default)(opacity, currentColor, setAttributes);
  const colorClass = (0, import_block_editor.getColorClassName)("color", backgroundColor);
  const className = (0, import_clsx.default)(
    {
      "has-text-color": backgroundColor || currentColor,
      [colorClass]: colorClass,
      "has-css-opacity": opacity === "css",
      "has-alpha-channel-opacity": opacity === "alpha-channel"
    },
    colorProps.className
  );
  const styles = {
    color: currentColor,
    backgroundColor: currentColor
  };
  const Wrapper = tagName === "hr" ? import_components.HorizontalRule : tagName;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "advanced", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      HtmlElementControl,
      {
        tagName,
        setAttributes
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      Wrapper,
      {
        ...(0, import_block_editor.useBlockProps)({
          className,
          style: hasCustomColor ? styles : void 0
        })
      }
    )
  ] });
}
//# sourceMappingURL=edit.cjs.map
