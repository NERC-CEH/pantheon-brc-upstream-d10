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

// packages/block-library/src/heading/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_element = require("@wordpress/element");
var import_data = require("@wordpress/data");
var import_block_editor = require("@wordpress/block-editor");
var import_autogenerate_anchors = require("./autogenerate-anchors.cjs");
var import_deprecated_text_align_attributes = __toESM(require("../utils/deprecated-text-align-attributes.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
function HeadingEdit(props) {
  const {
    attributes,
    setAttributes,
    mergeBlocks,
    onReplace,
    style,
    clientId
  } = props;
  (0, import_deprecated_text_align_attributes.default)(props);
  const { content, level, placeholder, anchor } = attributes;
  const tagName = "h" + level;
  const blockProps = (0, import_block_editor.useBlockProps)({
    style
  });
  const { canGenerateAnchors } = (0, import_data.useSelect)((select) => {
    const { getGlobalBlockCount, getSettings } = select(import_block_editor.store);
    const settings = getSettings();
    return {
      canGenerateAnchors: !!settings.generateAnchors || getGlobalBlockCount("core/table-of-contents") > 0
    };
  }, []);
  const { __unstableMarkNextChangeAsNotPersistent } = (0, import_data.useDispatch)(import_block_editor.store);
  (0, import_element.useEffect)(() => {
    if (!canGenerateAnchors) {
      return;
    }
    if (!anchor && content) {
      __unstableMarkNextChangeAsNotPersistent();
      setAttributes({
        anchor: (0, import_autogenerate_anchors.generateAnchor)(clientId, content)
      });
    }
    (0, import_autogenerate_anchors.setAnchor)(clientId, anchor);
    return () => (0, import_autogenerate_anchors.setAnchor)(clientId, null);
  }, [
    anchor,
    content,
    clientId,
    canGenerateAnchors,
    setAttributes,
    __unstableMarkNextChangeAsNotPersistent
  ]);
  const onContentChange = (value) => {
    const newAttrs = { content: value };
    if (canGenerateAnchors && (!anchor || !value || (0, import_autogenerate_anchors.generateAnchor)(clientId, content) === anchor)) {
      newAttrs.anchor = (0, import_autogenerate_anchors.generateAnchor)(clientId, value);
    }
    setAttributes(newAttrs);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_block_editor.RichText,
    {
      identifier: "content",
      tagName,
      value: content,
      onChange: onContentChange,
      onMerge: mergeBlocks,
      onReplace,
      onRemove: onReplace ? () => onReplace([]) : void 0,
      placeholder: placeholder || (0, import_i18n.__)("Heading"),
      ...blockProps
    }
  );
}
var edit_default = HeadingEdit;
//# sourceMappingURL=edit.cjs.map
