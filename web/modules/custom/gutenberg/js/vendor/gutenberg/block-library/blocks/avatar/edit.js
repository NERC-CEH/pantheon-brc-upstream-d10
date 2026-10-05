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

// packages/block-library/src/avatar/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => Edit
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_url = require("@wordpress/url");
var import_hooks = require("../utils/hooks.cjs");
var import_hooks2 = require("./hooks.cjs");
var import_user_control = __toESM(require("./user-control.cjs"));
var import_jsx_runtime = require("react/jsx-runtime");
var AvatarInspectorControls = ({
  setAttributes,
  avatar,
  attributes,
  selectUser
}) => {
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_components.__experimentalToolsPanel,
    {
      label: (0, import_i18n.__)("Settings"),
      resetAll: () => {
        setAttributes({
          size: 96,
          isLink: false,
          linkTarget: "_self",
          userId: void 0
        });
      },
      dropdownMenuProps,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Image size"),
            isShownByDefault: true,
            hasValue: () => attributes?.size !== 96,
            onDeselect: () => setAttributes({ size: 96 }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.RangeControl,
              {
                label: (0, import_i18n.__)("Image size"),
                onChange: (newSize) => setAttributes({
                  size: newSize
                }),
                min: avatar.minSize,
                max: avatar.maxSize,
                initialPosition: attributes?.size,
                value: attributes?.size
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Link to user profile"),
            isShownByDefault: true,
            hasValue: () => attributes?.isLink,
            onDeselect: () => setAttributes({ isLink: false }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Link to user profile"),
                onChange: () => setAttributes({ isLink: !attributes.isLink }),
                checked: attributes.isLink
              }
            )
          }
        ),
        attributes.isLink && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("Open in new tab"),
            isShownByDefault: true,
            hasValue: () => attributes?.linkTarget !== "_self",
            onDeselect: () => setAttributes({ linkTarget: "_self" }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.ToggleControl,
              {
                label: (0, import_i18n.__)("Open in new tab"),
                onChange: (value) => setAttributes({
                  linkTarget: value ? "_blank" : "_self"
                }),
                checked: attributes.linkTarget === "_blank"
              }
            )
          }
        ),
        selectUser && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.__experimentalToolsPanelItem,
          {
            label: (0, import_i18n.__)("User"),
            isShownByDefault: true,
            hasValue: () => !!attributes?.userId,
            onDeselect: () => setAttributes({ userId: void 0 }),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_user_control.default,
              {
                value: attributes?.userId,
                onChange: (value) => {
                  setAttributes({
                    userId: value
                  });
                }
              }
            )
          }
        )
      ]
    }
  ) });
};
var AvatarLinkWrapper = ({ children, isLink }) => isLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
  "a",
  {
    href: "#avatar-pseudo-link",
    className: "wp-block-avatar__link",
    onClick: (event) => event.preventDefault(),
    children
  }
) : children;
var ResizableAvatar = ({
  setAttributes,
  attributes,
  avatar,
  blockProps,
  isSelected
}) => {
  const borderProps = (0, import_block_editor.__experimentalUseBorderProps)(attributes);
  const doubledSizedSrc = (0, import_url.addQueryArgs)(
    (0, import_url.removeQueryArgs)(avatar?.src, ["s"]),
    {
      s: attributes?.size * 2
    }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarLinkWrapper, { isLink: attributes.isLink, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.ResizableBox,
    {
      size: {
        width: attributes.size,
        height: attributes.size
      },
      showHandle: isSelected,
      onResizeStop: (event, direction, elt, delta) => {
        setAttributes({
          size: parseInt(
            attributes.size + (delta.height || delta.width),
            10
          )
        });
      },
      lockAspectRatio: true,
      enable: {
        top: false,
        right: !(0, import_i18n.isRTL)(),
        bottom: true,
        left: (0, import_i18n.isRTL)()
      },
      minWidth: avatar.minSize,
      maxWidth: avatar.maxSize,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          src: doubledSizedSrc,
          alt: avatar.alt,
          className: (0, import_clsx.default)(
            "avatar",
            "avatar-" + attributes.size,
            "photo",
            "wp-block-avatar__image",
            borderProps.className
          ),
          style: borderProps.style
        }
      )
    }
  ) }) });
};
var CommentEdit = ({ attributes, context, setAttributes, isSelected }) => {
  const { commentId } = context;
  const blockProps = (0, import_block_editor.useBlockProps)();
  const avatar = (0, import_hooks2.useCommentAvatar)({ commentId });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      AvatarInspectorControls,
      {
        avatar,
        setAttributes,
        attributes,
        selectUser: false
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ResizableAvatar,
      {
        attributes,
        avatar,
        blockProps,
        isSelected,
        setAttributes
      }
    )
  ] });
};
var UserEdit = ({ attributes, context, setAttributes, isSelected }) => {
  const { postId, postType } = context;
  const avatar = (0, import_hooks2.useUserAvatar)({
    userId: attributes?.userId,
    postId,
    postType
  });
  const blockProps = (0, import_block_editor.useBlockProps)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      AvatarInspectorControls,
      {
        selectUser: true,
        attributes,
        avatar,
        setAttributes
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ResizableAvatar,
      {
        attributes,
        avatar,
        blockProps,
        isSelected,
        setAttributes
      }
    )
  ] });
};
function Edit(props) {
  if (props?.context?.commentId || props?.context?.commentId === null) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentEdit, { ...props });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserEdit, { ...props });
}
//# sourceMappingURL=edit.cjs.map
