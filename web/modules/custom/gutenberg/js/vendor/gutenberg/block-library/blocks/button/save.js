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

// packages/block-library/src/button/save.jsx
var save_exports = {};
__export(save_exports, {
  default: () => save
});
module.exports = __toCommonJS(save_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_jsx_runtime = require("react/jsx-runtime");
function save({ attributes }) {
  const {
    tagName,
    type,
    fontSize,
    linkTarget,
    rel,
    style,
    text,
    title,
    url
  } = attributes;
  const TagName = tagName || "a";
  const isButtonTag = "button" === TagName;
  const buttonType = type || "button";
  const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
  const colorProps = (0, import_block_editor.__experimentalGetColorClassesAndStyles)(attributes);
  const spacingProps = (0, import_block_editor.__experimentalGetSpacingClassesAndStyles)(attributes);
  const shadowProps = (0, import_block_editor.__experimentalGetShadowClassesAndStyles)(attributes);
  const typographyProps = (0, import_block_editor.getTypographyClassesAndStyles)(attributes);
  const buttonClasses = (0, import_clsx.default)(
    "wp-block-button__link",
    colorProps.className,
    borderProps.className,
    typographyProps.className,
    {
      // For backwards compatibility add style that isn't provided via
      // block support.
      "no-border-radius": style?.border?.radius === 0,
      [`has-custom-font-size`]: fontSize || style?.typography?.fontSize
    },
    (0, import_block_editor.__experimentalGetElementClassName)("button")
  );
  const buttonStyle = {
    ...borderProps.style,
    ...colorProps.style,
    ...spacingProps.style,
    ...shadowProps.style,
    ...typographyProps.style,
    writingMode: void 0
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...import_block_editor.useBlockProps.save(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.RichText.Content,
    {
      tagName: TagName,
      type: isButtonTag ? buttonType : null,
      className: buttonClasses,
      href: isButtonTag ? null : url,
      title,
      style: buttonStyle,
      value: text,
      target: isButtonTag ? null : linkTarget,
      rel: isButtonTag ? null : rel
    }
  ) });
}
//# sourceMappingURL=save.cjs.map
