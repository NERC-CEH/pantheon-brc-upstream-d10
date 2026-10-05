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

// packages/block-library/src/missing/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => MissingEdit
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_element = require("@wordpress/element");
var import_components = require("@wordpress/components");
var import_blocks = require("@wordpress/blocks");
var import_data = require("@wordpress/data");
var import_block_editor = require("@wordpress/block-editor");
var import_dom = require("@wordpress/dom");
var import_jsx_runtime = require("react/jsx-runtime");
function MissingEdit({ attributes, clientId }) {
  const { originalName, originalUndelimitedContent } = attributes;
  const hasContent = !!originalUndelimitedContent;
  const { hasFreeformBlock, hasHTMLBlock } = (0, import_data.useSelect)(
    (select) => {
      const { canInsertBlockType, getBlockRootClientId } = select(import_block_editor.store);
      return {
        hasFreeformBlock: canInsertBlockType(
          "core/freeform",
          getBlockRootClientId(clientId)
        ),
        hasHTMLBlock: canInsertBlockType(
          "core/html",
          getBlockRootClientId(clientId)
        )
      };
    },
    [clientId]
  );
  const { replaceBlock } = (0, import_data.useDispatch)(import_block_editor.store);
  function convertToHTML() {
    replaceBlock(
      clientId,
      (0, import_blocks.createBlock)("core/html", {}, [], [originalUndelimitedContent])
    );
  }
  const actions = [];
  let messageHTML;
  const convertToHtmlButton = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.Button,
    {
      __next40pxDefaultSize: true,
      onClick: convertToHTML,
      variant: "primary",
      children: (0, import_i18n.__)("Keep as HTML")
    },
    "convert"
  );
  if (hasContent && !hasFreeformBlock && (!originalName || originalName === "core/freeform")) {
    if (hasHTMLBlock) {
      messageHTML = (0, import_i18n.__)(
        "It appears you are trying to use the deprecated Classic block. You can leave this block intact, convert its content to a Custom HTML block, or remove it entirely. Alternatively, if you have unsaved changes, you can save them and refresh to use the Classic block."
      );
      actions.push(convertToHtmlButton);
    } else {
      messageHTML = (0, import_i18n.__)(
        "It appears you are trying to use the deprecated Classic block. You can leave this block intact, or remove it entirely. Alternatively, if you have unsaved changes, you can save them and refresh to use the Classic block."
      );
    }
  } else if (hasContent && hasHTMLBlock) {
    messageHTML = (0, import_i18n.sprintf)(
      /* translators: %s: block name */
      (0, import_i18n.__)(
        'Your site doesn’t include support for the "%s" block. You can leave it as-is, convert it to custom HTML, or remove it.'
      ),
      originalName
    );
    actions.push(convertToHtmlButton);
  } else {
    messageHTML = (0, import_i18n.sprintf)(
      /* translators: %s: block name */
      (0, import_i18n.__)(
        'Your site doesn’t include support for the "%s" block. You can leave it as-is or remove it.'
      ),
      originalName
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ...(0, import_block_editor.useBlockProps)({ className: "has-warning" }), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.Warning, { actions, children: messageHTML }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_element.RawHTML, { children: (0, import_dom.safeHTML)(originalUndelimitedContent) })
  ] });
}
//# sourceMappingURL=edit.cjs.map
