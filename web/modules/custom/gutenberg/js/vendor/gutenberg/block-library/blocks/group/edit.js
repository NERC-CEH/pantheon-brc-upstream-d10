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

// packages/block-library/src/group/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_data = require("@wordpress/data");
var import_block_editor = require("@wordpress/block-editor");
var import_element = require("@wordpress/element");
var import_i18n = require("@wordpress/i18n");
var import_placeholder = __toESM(require("./placeholder.cjs"));
var import_lock_unlock = require("../lock-unlock.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var { HTMLElementControl } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
function GroupEditControls({ tagName, onSelectTagName, clientId }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "advanced", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    HTMLElementControl,
    {
      tagName,
      onChange: onSelectTagName,
      clientId,
      options: [
        { label: (0, import_i18n.__)("Default (<div>)"), value: "div" },
        { label: "<header>", value: "header" },
        { label: "<main>", value: "main" },
        { label: "<section>", value: "section" },
        { label: "<article>", value: "article" },
        { label: "<aside>", value: "aside" },
        { label: "<footer>", value: "footer" }
      ]
    }
  ) });
}
function GroupEdit({ attributes, name, setAttributes, clientId }) {
  const { hasInnerBlocks, themeSupportsLayout } = (0, import_data.useSelect)(
    (select) => {
      const { getBlock, getSettings } = select(import_block_editor.store);
      const block = getBlock(clientId);
      return {
        hasInnerBlocks: !!(block && block.innerBlocks.length),
        themeSupportsLayout: getSettings()?.supportsLayout
      };
    },
    [clientId]
  );
  const {
    tagName: TagName = "div",
    templateLock,
    allowedBlocks,
    layout = {}
  } = attributes;
  const { type = "default" } = layout;
  const layoutSupportEnabled = themeSupportsLayout || type === "flex" || type === "grid";
  const ref = (0, import_element.useRef)();
  const blockProps = (0, import_block_editor.useBlockProps)({ ref });
  const [showPlaceholder, setShowPlaceholder] = (0, import_placeholder.useShouldShowPlaceHolder)({
    attributes,
    usedLayoutType: type,
    hasInnerBlocks
  });
  let renderAppender;
  if (showPlaceholder) {
    renderAppender = false;
  } else if (!hasInnerBlocks) {
    renderAppender = import_block_editor.InnerBlocks.ButtonBlockAppender;
  }
  const innerBlocksProps = (0, import_block_editor.useInnerBlocksProps)(
    layoutSupportEnabled ? blockProps : { className: "wp-block-group__inner-container" },
    {
      dropZoneElement: ref.current,
      templateLock,
      allowedBlocks,
      renderAppender
    }
  );
  const { selectBlock } = (0, import_data.useDispatch)(import_block_editor.store);
  const selectVariation = (nextVariation) => {
    setAttributes(nextVariation.attributes);
    selectBlock(clientId, -1);
    setShowPlaceholder(false);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      GroupEditControls,
      {
        tagName: TagName,
        onSelectTagName: (value) => setAttributes({ tagName: value }),
        clientId
      }
    ),
    showPlaceholder && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      innerBlocksProps.children,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_placeholder.default,
        {
          name,
          onSelect: selectVariation
        }
      )
    ] }),
    layoutSupportEnabled && !showPlaceholder && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...innerBlocksProps }),
    !layoutSupportEnabled && !showPlaceholder && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...innerBlocksProps }) })
  ] });
}
var edit_default = GroupEdit;
//# sourceMappingURL=edit.cjs.map
