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

// packages/block-library/src/comment-author-avatar/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => Edit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
var import_i18n = require("@wordpress/i18n");
var import_jsx_runtime = require("react/jsx-runtime");
function Edit({
  attributes,
  context: { commentId },
  setAttributes,
  isSelected
}) {
  const { height, width } = attributes;
  const [avatars] = (0, import_core_data.useEntityProp)(
    "root",
    "comment",
    "author_avatar_urls",
    commentId
  );
  const [authorName] = (0, import_core_data.useEntityProp)(
    "root",
    "comment",
    "author_name",
    commentId
  );
  const avatarUrls = avatars ? Object.values(avatars) : null;
  const sizes = avatars ? Object.keys(avatars) : null;
  const minSize = sizes ? sizes[0] : 24;
  const maxSize = sizes ? sizes[sizes.length - 1] : 96;
  const blockProps = (0, import_block_editor.useBlockProps)();
  const spacingProps = (0, import_block_editor.__experimentalGetSpacingClassesAndStyles)(attributes);
  const maxSizeBuffer = Math.floor(maxSize * 2.5);
  const avatarURL = (0, import_data.useSelect)((select) => {
    const { __experimentalDiscussionSettings } = select(import_block_editor.store).getSettings();
    return __experimentalDiscussionSettings?.avatarURL;
  }, []);
  const inspectorControls = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.PanelBody, { title: (0, import_i18n.__)("Settings"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.RangeControl,
    {
      label: (0, import_i18n.__)("Image size"),
      onChange: (newWidth) => setAttributes({
        width: newWidth,
        height: newWidth
      }),
      min: minSize,
      max: maxSizeBuffer,
      initialPosition: width,
      value: width
    }
  ) }) });
  const resizableAvatar = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.ResizableBox,
    {
      size: {
        width,
        height
      },
      showHandle: isSelected,
      onResizeStop: (event, direction, elt, delta) => {
        setAttributes({
          height: parseInt(height + delta.height, 10),
          width: parseInt(width + delta.width, 10)
        });
      },
      lockAspectRatio: true,
      enable: {
        top: false,
        right: !(0, import_i18n.isRTL)(),
        bottom: true,
        left: (0, import_i18n.isRTL)()
      },
      minWidth: minSize,
      maxWidth: maxSizeBuffer,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          src: avatarUrls ? avatarUrls[avatarUrls.length - 1] : avatarURL,
          alt: `${authorName} ${(0, import_i18n.__)("Avatar")}`,
          ...blockProps
        }
      )
    }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    inspectorControls,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...spacingProps, children: resizableAvatar })
  ] });
}
//# sourceMappingURL=edit.cjs.map
