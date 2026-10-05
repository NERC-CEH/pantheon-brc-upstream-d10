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

// packages/block-library/src/post-time-to-read/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_i18n = require("@wordpress/i18n");
var import_element = require("@wordpress/element");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_blocks = require("@wordpress/blocks");
var import_core_data = require("@wordpress/core-data");
var import_wordcount = require("@wordpress/wordcount");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function PostTimeToReadEdit({ attributes, setAttributes, context }) {
  const { displayAsRange, displayMode, averageReadingSpeed } = attributes;
  const { postId, postType } = context;
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const [contentStructure] = (0, import_core_data.useEntityProp)(
    "postType",
    postType,
    "content",
    postId
  );
  const [blocks] = (0, import_core_data.useEntityBlockEditor)("postType", postType, {
    id: postId
  });
  const displayString = (0, import_element.useMemo)(() => {
    let content;
    if (contentStructure instanceof Function) {
      content = contentStructure({ blocks });
    } else if (blocks) {
      content = (0, import_blocks.__unstableSerializeAndClean)(blocks);
    } else {
      content = contentStructure;
    }
    const wordCountType = (0, import_i18n._x)(
      "words",
      "Word count type. Do not translate!"
    );
    const totalWords = (0, import_wordcount.count)(content || "", wordCountType);
    if (displayMode === "time") {
      if (displayAsRange) {
        let maxMinutes = Math.max(
          1,
          Math.round(totalWords / averageReadingSpeed * 1.2)
        );
        const minMinutes = Math.max(
          1,
          Math.round(totalWords / averageReadingSpeed * 0.8)
        );
        if (minMinutes === maxMinutes) {
          maxMinutes = maxMinutes + 1;
        }
        const rangeLabel = (0, import_i18n._x)(
          "%1$s–%2$s minutes",
          "Range of minutes to read"
        );
        return (0, import_i18n.sprintf)(rangeLabel, minMinutes, maxMinutes);
      }
      const minutesToRead = Math.max(
        1,
        Math.round(totalWords / averageReadingSpeed)
      );
      return (0, import_i18n.sprintf)(
        /* translators: %s: the number of minutes to read the post. */
        (0, import_i18n._n)("%s minute", "%s minutes", minutesToRead),
        minutesToRead
      );
    }
    if (displayMode === "words") {
      return wordCountType === "words" ? (0, import_i18n.sprintf)(
        /* translators: %s: the number of words in the post. */
        (0, import_i18n._n)("%s word", "%s words", totalWords),
        totalWords.toLocaleString()
      ) : (0, import_i18n.sprintf)(
        /* translators: %s: the number of characters in the post. */
        (0, import_i18n._n)("%s character", "%s characters", totalWords),
        totalWords.toLocaleString()
      );
    }
  }, [
    contentStructure,
    blocks,
    displayAsRange,
    displayMode,
    averageReadingSpeed
  ]);
  const blockProps = (0, import_block_editor.useBlockProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    displayMode === "time" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            displayAsRange: true
          });
        },
        dropdownMenuProps,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            isShownByDefault: true,
            label: (0, import_i18n._x)(
              "Display as range",
              "Turns reading time range display on or off"
            ),
            hasValue: () => !displayAsRange,
            onDeselect: () => {
              setAttributes({
                displayAsRange: true
              });
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Display as range"),
                checked: !!displayAsRange,
                onChange: () => setAttributes({
                  displayAsRange: !displayAsRange
                })
              }
            )
          }
        )
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: displayString })
  ] });
}
var edit_default = PostTimeToReadEdit;
//# sourceMappingURL=edit.cjs.map
