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

// packages/block-library/src/image/use-open-image-media-editor-modal.js
var use_open_image_media_editor_modal_exports = {};
__export(use_open_image_media_editor_modal_exports, {
  getImageBlockMetadataFromAttachment: () => getImageBlockMetadataFromAttachment,
  getNewAttachmentImageBlockAttributes: () => getNewAttachmentImageBlockAttributes,
  getSyncedImageBlockAttributes: () => getSyncedImageBlockAttributes,
  useOpenImageMediaEditorModal: () => useOpenImageMediaEditorModal
});
module.exports = __toCommonJS(use_open_image_media_editor_modal_exports);
var import_core_data = require("@wordpress/core-data");
var import_block_editor = require("@wordpress/block-editor");
var import_dom = require("@wordpress/dom");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_constants = require("./constants.cjs");
function normalizeImageBlockCaption(caption) {
  if (typeof caption !== "string") {
    return "";
  }
  const textContent = (0, import_dom.__unstableStripHTML)(caption).trim();
  if (!textContent) {
    return "";
  }
  return caption.replace(/\n/g, "<br>");
}
function getAttachmentCaption(attachment) {
  const caption = attachment?.caption;
  if (typeof caption === "string") {
    return normalizeImageBlockCaption(caption);
  }
  if (caption && typeof caption === "object" && Object.hasOwn(caption, "raw")) {
    return normalizeImageBlockCaption(caption.raw);
  }
  return void 0;
}
function getImageBlockMetadataFromAttachment(attachment) {
  return {
    alt: typeof attachment?.alt_text === "string" ? attachment.alt_text : attachment?.alt || "",
    caption: getAttachmentCaption(attachment)
  };
}
function normalizeMetadataAttribute(value) {
  return value || "";
}
function getSyncedImageBlockAttributes(currentAttributes, originalAttachment, updatedAttachment) {
  if (!originalAttachment || !updatedAttachment) {
    return {};
  }
  const originalMetadata = getImageBlockMetadataFromAttachment(originalAttachment);
  const updatedMetadata = getImageBlockMetadataFromAttachment(updatedAttachment);
  const syncedAttributes = {};
  const normalizedCurrentAlt = normalizeMetadataAttribute(
    currentAttributes.alt
  );
  if (originalMetadata.alt !== updatedMetadata.alt && (normalizedCurrentAlt === originalMetadata.alt || !normalizedCurrentAlt)) {
    syncedAttributes.alt = updatedMetadata.alt;
  }
  const normalizedCurrentCaption = normalizeMetadataAttribute(
    currentAttributes.caption
  );
  if (originalMetadata.caption !== void 0 && updatedMetadata.caption !== void 0 && originalMetadata.caption !== updatedMetadata.caption && (normalizedCurrentCaption === originalMetadata.caption || !normalizedCurrentCaption)) {
    syncedAttributes.caption = updatedMetadata.caption || void 0;
  }
  return syncedAttributes;
}
function getNewAttachmentSizeAttributes(sizeSlug, attachment) {
  const sizes = attachment.media_details?.sizes;
  if (!sizeSlug || sizeSlug === import_constants.DEFAULT_MEDIA_SIZE_SLUG || !sizes) {
    return void 0;
  }
  const sizeUrl = sizes[sizeSlug]?.source_url;
  if (sizeUrl) {
    return { url: sizeUrl };
  }
  const fullUrl = attachment.source_url ?? sizes.full?.source_url;
  return fullUrl ? { url: fullUrl, sizeSlug: import_constants.DEFAULT_MEDIA_SIZE_SLUG } : void 0;
}
function getNewAttachmentLinkAttributes(linkDestination, attachment) {
  if (linkDestination === import_constants.LINK_DESTINATION_MEDIA) {
    return attachment.source_url ? { href: attachment.source_url } : void 0;
  }
  if (linkDestination === import_constants.LINK_DESTINATION_ATTACHMENT) {
    return attachment.link ? { href: attachment.link } : void 0;
  }
  return void 0;
}
function getNewAttachmentImageBlockAttributes(blockAttributes, attachment) {
  if (!attachment) {
    return void 0;
  }
  return {
    ...getNewAttachmentSizeAttributes(
      blockAttributes.sizeSlug,
      attachment
    ),
    ...getNewAttachmentLinkAttributes(
      blockAttributes.linkDestination,
      attachment
    )
  };
}
var { openMediaEditorModalKey } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
function getAttachmentFallbackForEmptyBlockMetadata({ alt, caption }) {
  const attachment = {};
  if (!alt) {
    attachment.alt_text = "";
  }
  if (!caption?.toString()) {
    attachment.caption = "";
  }
  return Object.keys(attachment).length ? attachment : void 0;
}
function hasKnownAttachmentMetadata(attachment) {
  if (!attachment) {
    return false;
  }
  const hasKnownAlt = typeof attachment.alt_text === "string" || typeof attachment.alt === "string";
  const hasKnownCaption = getImageBlockMetadataFromAttachment(attachment).caption !== void 0;
  return hasKnownAlt && hasKnownCaption;
}
function useOpenImageMediaEditorModal({
  attributes,
  setAttributes,
  onClose,
  onUrlChange
}) {
  const { id, url, alt, caption, sizeSlug, linkDestination } = attributes;
  const registry = (0, import_data.useRegistry)();
  const openMediaEditorModal = (0, import_data.useSelect)(
    (select) => select(import_block_editor.store).getSettings()[openMediaEditorModalKey],
    []
  );
  const blockAttributesRef = (0, import_element.useRef)({
    id,
    url,
    alt,
    caption: caption?.toString(),
    sizeSlug,
    linkDestination
  });
  const mediaEditorMetadataBaselineRef = (0, import_element.useRef)();
  const mediaEditorMetadataSyncRequestRef = (0, import_element.useRef)(0);
  (0, import_element.useEffect)(() => {
    blockAttributesRef.current = {
      id,
      url,
      alt,
      caption: caption?.toString(),
      sizeSlug,
      linkDestination
    };
  }, [alt, caption, id, linkDestination, sizeSlug, url]);
  const getCachedAttachmentRecord = (0, import_element.useCallback)(
    (attachmentId) => registry.select(import_core_data.store).getEditedEntityRecord(
      "postType",
      "attachment",
      attachmentId
    ),
    [registry]
  );
  const resolveAttachmentRecord = (0, import_element.useCallback)(
    async (attachmentId) => {
      const resolveSelect = registry.resolveSelect(import_core_data.store);
      try {
        return await resolveSelect.getEntityRecord(
          "postType",
          "attachment",
          attachmentId
        );
      } catch {
        return void 0;
      }
    },
    [registry]
  );
  const resolveFreshAttachmentRecord = (0, import_element.useCallback)(
    async (attachmentId) => {
      const { invalidateResolution } = registry.dispatch(import_core_data.store);
      invalidateResolution("getEntityRecord", [
        "postType",
        "attachment",
        attachmentId
      ]);
      return resolveAttachmentRecord(attachmentId);
    },
    [registry, resolveAttachmentRecord]
  );
  const handleMediaUpdate = (0, import_element.useCallback)(
    async ({ id: newId, url: newUrl }) => {
      if (typeof newId !== "number") {
        return;
      }
      const originalAttachment = mediaEditorMetadataBaselineRef.current;
      mediaEditorMetadataBaselineRef.current = void 0;
      const syncRequest = ++mediaEditorMetadataSyncRequestRef.current;
      const nextAttributes = {};
      const currentBlockAttributes = blockAttributesRef.current;
      const isNewAttachment = newId !== currentBlockAttributes.id;
      if (isNewAttachment) {
        nextAttributes.id = newId;
        nextAttributes.url = newUrl ?? currentBlockAttributes.url;
        if (nextAttributes.url !== currentBlockAttributes.url) {
          onUrlChange?.(nextAttributes.url);
        }
        blockAttributesRef.current = {
          ...blockAttributesRef.current,
          id: nextAttributes.id,
          url: nextAttributes.url
        };
      }
      if (originalAttachment || isNewAttachment) {
        const resolvedAttachment = await resolveFreshAttachmentRecord(newId);
        if (syncRequest !== mediaEditorMetadataSyncRequestRef.current) {
          return;
        }
        const attachmentRecord = resolvedAttachment ?? getCachedAttachmentRecord(newId);
        const latestBlockAttributes = blockAttributesRef.current;
        if (originalAttachment) {
          const resolvedMetadataAttributes = getSyncedImageBlockAttributes(
            latestBlockAttributes,
            originalAttachment,
            attachmentRecord
          );
          if (Object.keys(resolvedMetadataAttributes).length) {
            Object.assign(
              nextAttributes,
              resolvedMetadataAttributes
            );
          }
        }
        if (isNewAttachment) {
          const derivedAttributes = getNewAttachmentImageBlockAttributes(
            latestBlockAttributes,
            attachmentRecord
          );
          if (derivedAttributes) {
            Object.assign(nextAttributes, derivedAttributes);
            if (derivedAttributes.url && derivedAttributes.url !== latestBlockAttributes.url) {
              onUrlChange?.(derivedAttributes.url);
            }
          }
        }
      }
      if (Object.keys(nextAttributes).length) {
        blockAttributesRef.current = {
          ...blockAttributesRef.current,
          ...nextAttributes
        };
        setAttributes(nextAttributes);
      }
    },
    [
      getCachedAttachmentRecord,
      onUrlChange,
      resolveFreshAttachmentRecord,
      setAttributes
    ]
  );
  const openImageMediaEditorModal = (0, import_element.useCallback)(async () => {
    if (!id || !openMediaEditorModal) {
      return;
    }
    const cachedAttachmentRecord = getCachedAttachmentRecord(id);
    const fallbackAttachmentRecord = getAttachmentFallbackForEmptyBlockMetadata(
      blockAttributesRef.current
    );
    const resolvedAttachmentRecord = hasKnownAttachmentMetadata(
      cachedAttachmentRecord
    ) ? void 0 : await resolveAttachmentRecord(id);
    mediaEditorMetadataBaselineRef.current = resolvedAttachmentRecord || (hasKnownAttachmentMetadata(cachedAttachmentRecord) ? cachedAttachmentRecord : fallbackAttachmentRecord) || cachedAttachmentRecord;
    openMediaEditorModal({
      id,
      onUpdate: handleMediaUpdate,
      onClose
    });
  }, [
    getCachedAttachmentRecord,
    handleMediaUpdate,
    id,
    onClose,
    openMediaEditorModal,
    resolveAttachmentRecord
  ]);
  return id && openMediaEditorModal ? openImageMediaEditorModal : void 0;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getImageBlockMetadataFromAttachment,
  getNewAttachmentImageBlockAttributes,
  getSyncedImageBlockAttributes,
  useOpenImageMediaEditorModal
});
//# sourceMappingURL=use-open-image-media-editor-modal.cjs.map
