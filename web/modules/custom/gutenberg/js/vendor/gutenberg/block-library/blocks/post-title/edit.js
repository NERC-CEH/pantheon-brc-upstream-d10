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

// packages/block-library/src/post-title/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => PostTitleEdit
});
module.exports = __toCommonJS(edit_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_i18n = require("@wordpress/i18n");
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_hooks = require("../utils/hooks.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function PostTitleEdit({
  attributes: { level, levelOptions, isLink, rel, linkTarget, placeholder },
  setAttributes,
  context: { postType, postId, queryId }
}) {
  const TagName = level === 0 ? "p" : `h${level}`;
  const isDescendentOfQueryLoop = Number.isFinite(queryId);
  const userCanEdit = (0, import_data.useSelect)(
    (select) => {
      if (isDescendentOfQueryLoop) {
        return false;
      }
      return select(import_core_data.store).canUser("update", {
        kind: "postType",
        name: postType,
        id: postId
      });
    },
    [isDescendentOfQueryLoop, postType, postId]
  );
  const [rawTitle = "", setTitle, fullTitle] = (0, import_core_data.useEntityProp)(
    "postType",
    postType,
    "title",
    postId
  );
  const [link] = (0, import_core_data.useEntityProp)("postType", postType, "link", postId);
  const blockProps = (0, import_block_editor.useBlockProps)();
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  let titleElement = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: placeholder || (0, import_i18n.__)("Title") });
  if (postType && postId) {
    titleElement = userCanEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.PlainText,
      {
        tagName: TagName,
        placeholder: (0, import_i18n.__)("(no title)"),
        value: rawTitle,
        onChange: setTitle,
        __experimentalVersion: 2,
        disableLineBreaks: true,
        ...blockProps
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      TagName,
      {
        ...blockProps,
        dangerouslySetInnerHTML: {
          __html: fullTitle?.rendered || (0, import_i18n.__)("(no title)")
        }
      }
    );
  }
  if (isLink && postType && postId) {
    titleElement = userCanEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.PlainText,
      {
        tagName: "a",
        href: link,
        target: linkTarget,
        rel,
        placeholder: !rawTitle.length ? (0, import_i18n.__)("(no title)") : null,
        value: rawTitle,
        onChange: setTitle,
        __experimentalVersion: 2,
        disableLineBreaks: true
      }
    ) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagName, { ...blockProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "a",
      {
        href: link,
        target: linkTarget,
        rel,
        onClick: (event) => event.preventDefault(),
        dangerouslySetInnerHTML: {
          __html: fullTitle?.rendered || (0, import_i18n.__)("(no title)")
        }
      }
    ) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    blockEditingMode === "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "block", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.HeadingLevelDropdown,
        {
          value: level,
          options: levelOptions,
          onChange: (newLevel) => setAttributes({ level: newLevel })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        import_components.__experimentalToolsPanel,
        {
          label: (0, import_i18n.__)("Settings"),
          resetAll: () => {
            setAttributes({
              rel: "",
              linkTarget: "_self",
              isLink: false
            });
          },
          dropdownMenuProps,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.__experimentalToolsPanelItem,
              {
                label: (0, import_i18n.__)("Make title a link"),
                isShownByDefault: true,
                hasValue: () => isLink,
                onDeselect: () => setAttributes({ isLink: false }),
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.ToggleControl,
                  {
                    label: (0, import_i18n.__)("Make title a link"),
                    onChange: () => setAttributes({ isLink: !isLink }),
                    checked: isLink
                  }
                )
              }
            ),
            isLink && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.__experimentalToolsPanelItem,
                {
                  label: (0, import_i18n.__)("Open in new tab"),
                  isShownByDefault: true,
                  hasValue: () => linkTarget === "_blank",
                  onDeselect: () => setAttributes({
                    linkTarget: "_self"
                  }),
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    import_components.ToggleControl,
                    {
                      label: (0, import_i18n.__)("Open in new tab"),
                      onChange: (value) => setAttributes({
                        linkTarget: value ? "_blank" : "_self"
                      }),
                      checked: linkTarget === "_blank"
                    }
                  )
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.__experimentalToolsPanelItem,
                {
                  label: (0, import_i18n.__)("Link relation"),
                  isShownByDefault: true,
                  hasValue: () => !!rel,
                  onDeselect: () => setAttributes({ rel: "" }),
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    import_components.TextControl,
                    {
                      label: (0, import_i18n.__)("Link relation"),
                      help: (0, import_element.createInterpolateElement)(
                        (0, import_i18n.__)(
                          "The <a>Link Relation</a> attribute defines the relationship between a linked resource and the current document."
                        ),
                        {
                          a: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ExternalLink, { href: "https://developer.mozilla.org/docs/Web/HTML/Attributes/rel" })
                        }
                      ),
                      value: rel,
                      onChange: (newRel) => setAttributes({ rel: newRel })
                    }
                  )
                }
              )
            ] })
          ]
        }
      ) })
    ] }),
    titleElement
  ] });
}
//# sourceMappingURL=edit.cjs.map
