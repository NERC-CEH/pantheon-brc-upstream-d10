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

// packages/block-library/src/gallery/dynamic-gallery.jsx
var dynamic_gallery_exports = {};
__export(dynamic_gallery_exports, {
  GalleryDynamicView: () => GalleryDynamicView,
  GallerySourcePanel: () => GallerySourcePanel
});
module.exports = __toCommonJS(dynamic_gallery_exports);
var import_i18n = require("@wordpress/i18n");
var import_element = require("@wordpress/element");
var import_components = require("@wordpress/components");
var import_block_editor = require("@wordpress/block-editor");
var import_shared_icon = require("./shared-icon.cjs");
var import_shared = require("./shared.cjs");
var import_caption = require("../utils/caption.cjs");
var import_dynamic_source = require("./dynamic-source.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var ORDER_OPTIONS = [
  { label: (0, import_i18n.__)("Newest to oldest"), value: "date/desc" },
  { label: (0, import_i18n.__)("Oldest to newest"), value: "date/asc" },
  {
    /* translators: Label for ordering images by title in ascending order. */
    label: (0, import_i18n.__)("A → Z"),
    value: "title/asc"
  },
  {
    /* translators: Label for ordering images by title in descending order. */
    label: (0, import_i18n.__)("Z → A"),
    value: "title/desc"
  }
];
function OrderControl({ orderby, order, onChange }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.SelectControl,
    {
      label: (0, import_i18n.__)("Order by"),
      value: `${orderby}/${order}`,
      options: ORDER_OPTIONS,
      onChange: (value) => {
        const [newOrderby, newOrder] = value.split("/");
        onChange({ orderby: newOrderby, order: newOrder });
      }
    }
  );
}
function DetachGalleryDialog({ onConfirm, onCancel }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.__experimentalConfirmDialog,
    {
      isOpen: true,
      title: (0, import_i18n.__)("Detach Gallery"),
      __experimentalHideHeader: false,
      confirmButtonText: (0, import_i18n.__)("Detach"),
      onConfirm,
      onCancel,
      size: "medium",
      children: (0, import_i18n.__)(
        "The gallery displays the images attached to the post. Detaching will enable you to add, delete, or reorder images. However, new attachments will no longer be added automatically."
      )
    }
  );
}
function GallerySourcePanel({
  dynamic,
  dropdownMenuProps,
  hasImages
}) {
  const {
    dynamicContent,
    canUseDynamicSource,
    sourceDescriptor,
    sourceOrderby,
    sourceOrder,
    setSourceOrder,
    convertToStatic,
    enableDynamicMode,
    resetSource,
    isResolvingDynamic,
    hasMoreImagesThanCap,
    dynamicMediaTotal
  } = dynamic;
  const isDynamic = !!dynamicContent;
  const [isConfirming, setIsConfirming] = (0, import_element.useState)(false);
  const [isConfirmingDetach, setIsConfirmingDetach] = (0, import_element.useState)(false);
  function requestEnableDynamicMode() {
    if (hasImages) {
      setIsConfirming(true);
    } else {
      enableDynamicMode();
    }
  }
  if (isDynamic) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        import_components.__experimentalToolsPanel,
        {
          label: (0, import_i18n.__)("Source"),
          resetAll: resetSource,
          dropdownMenuProps,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wp-block-gallery__source-settings", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "wp-block-gallery__source-description", children: sourceDescriptor?.description ?? (0, import_i18n.__)("Dynamic images.") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.Button,
                {
                  __next40pxDefaultSize: true,
                  variant: "secondary",
                  onClick: () => setIsConfirmingDetach(true),
                  disabled: isResolvingDynamic,
                  accessibleWhenDisabled: true,
                  children: (0, import_i18n.__)("Detach Gallery")
                }
              )
            ] }),
            hasMoreImagesThanCap && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.Notice,
              {
                className: "wp-block-gallery__source-notice",
                status: "warning",
                isDismissible: false,
                children: (0, import_i18n.sprintf)(
                  /* translators: 1: number of images shown. 2: total number of matching images. */
                  (0, import_i18n.__)(
                    "Only the first %1$d of %2$d images will be displayed."
                  ),
                  import_dynamic_source.MAX_IMAGES,
                  dynamicMediaTotal
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.__experimentalToolsPanelItem,
              {
                isShownByDefault: true,
                label: (0, import_i18n.__)("Order by"),
                hasValue: () => sourceOrderby !== import_dynamic_source.DEFAULT_ORDERBY || sourceOrder !== import_dynamic_source.DEFAULT_ORDER,
                onDeselect: () => setSourceOrder(void 0, void 0),
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  OrderControl,
                  {
                    orderby: sourceOrderby,
                    order: sourceOrder,
                    onChange: ({ orderby, order }) => setSourceOrder(orderby, order)
                  }
                )
              }
            )
          ]
        }
      ),
      isConfirmingDetach && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        DetachGalleryDialog,
        {
          onConfirm: () => {
            convertToStatic();
            setIsConfirmingDetach(false);
          },
          onCancel: () => setIsConfirmingDetach(false)
        }
      )
    ] });
  }
  if (!canUseDynamicSource) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.PanelBody, { title: (0, import_i18n.__)("Source"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wp-block-gallery__source-settings", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "wp-block-gallery__source-description", children: (0, import_i18n.__)("Images added to the gallery.") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.Button,
        {
          __next40pxDefaultSize: true,
          variant: "secondary",
          onClick: requestEnableDynamicMode,
          children: (0, import_i18n.__)("Use attached images")
        }
      )
    ] }) }),
    isConfirming && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalConfirmDialog,
      {
        isOpen: true,
        title: (0, import_i18n.__)("Use images attached to the post?"),
        __experimentalHideHeader: false,
        confirmButtonText: (0, import_i18n.__)("Use attached images"),
        onConfirm: () => {
          enableDynamicMode();
          setIsConfirming(false);
        },
        onCancel: () => setIsConfirming(false),
        size: "medium",
        children: (0, import_i18n.__)(
          "The images in this gallery will be replaced, but will remain in the media library."
        )
      }
    )
  ] });
}
function GalleryImagesPreview({ imageBlocks, layout }) {
  const { children, ref, className } = (0, import_block_editor.__experimentalUseBlockPreview)({
    blocks: imageBlocks,
    layout
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      ref,
      className,
      style: { display: "contents" },
      children
    }
  );
}
function GalleryDynamicView({
  dynamic,
  blockProps,
  innerBlocksProps,
  attributes,
  setAttributes,
  isSelected,
  insertBlocksAfter,
  isContentLocked,
  multiGallerySelection
}) {
  const {
    sourceDescriptor,
    dynamicImageBlocks,
    galleryContext,
    isResolvingDynamic,
    convertToStatic
  } = dynamic;
  const blockEditingMode = (0, import_block_editor.useBlockEditingMode)();
  const [isConfirmingDetach, setIsConfirmingDetach] = (0, import_element.useState)(false);
  const previewLayout = (0, import_element.useMemo)(
    () => (0, import_shared.isGalleryFlexLayout)(attributes.layout) ? { ...attributes.layout, type: "flex" } : attributes.layout,
    [attributes.layout]
  );
  const emptyInstructions = isResolvingDynamic ? (0, import_i18n.__)("Loading images…") : sourceDescriptor?.emptyMessage ?? (0, import_i18n.__)("Dynamic images will appear here.");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    blockEditingMode === "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.ToolbarButton,
        {
          onClick: () => setIsConfirmingDetach(true),
          disabled: isResolvingDynamic,
          children: (0, import_i18n.__)("Detach")
        }
      ) }),
      isConfirmingDetach && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        DetachGalleryDialog,
        {
          onConfirm: () => {
            convertToStatic();
            setIsConfirmingDetach(false);
          },
          onCancel: () => setIsConfirmingDetach(false)
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...blockProps, children: [
      dynamicImageBlocks.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockContextProvider, { value: galleryContext, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        GalleryImagesPreview,
        {
          imageBlocks: dynamicImageBlocks,
          layout: previewLayout
        }
      ) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.Placeholder,
        {
          icon: import_shared_icon.sharedIcon,
          label: (0, import_i18n.__)("Gallery"),
          instructions: emptyInstructions,
          children: isResolvingDynamic && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {})
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_caption.Caption,
        {
          attributes,
          setAttributes,
          isSelected,
          insertBlocksAfter,
          showToolbarButton: !multiGallerySelection && !isContentLocked,
          className: "blocks-gallery-caption",
          label: (0, import_i18n.__)("Gallery caption text"),
          placeholder: (0, import_i18n.__)("Add gallery caption")
        }
      )
    ] }),
    innerBlocksProps.children
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GalleryDynamicView,
  GallerySourcePanel
});
//# sourceMappingURL=dynamic-gallery.cjs.map
