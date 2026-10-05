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

// packages/block-library/src/gallery/dynamic-source.js
var dynamic_source_exports = {};
__export(dynamic_source_exports, {
  ATTACHED_MEDIA: () => ATTACHED_MEDIA,
  DEFAULT_ORDER: () => DEFAULT_ORDER,
  DEFAULT_ORDERBY: () => DEFAULT_ORDERBY,
  MAX_IMAGES: () => MAX_IMAGES,
  getDynamicSource: () => getDynamicSource,
  getSourceQuery: () => getSourceQuery
});
module.exports = __toCommonJS(dynamic_source_exports);
var import_i18n = require("@wordpress/i18n");
var ATTACHED_MEDIA = "core/attached-media";
var DEFAULT_ORDERBY = "date";
var DEFAULT_ORDER = "desc";
var DYNAMIC_SOURCES = {
  [ATTACHED_MEDIA]: {
    // Short label for the entry affordance / future source chooser. Mirrors
    // the "Attached images" media inserter category name.
    title: (0, import_i18n.__)("Use attached images"),
    // Help text shown beneath the Source controls.
    description: (0, import_i18n.__)("Images attached to the post."),
    // Empty-state copy for the canvas preview.
    emptyMessage: (0, import_i18n.__)("Images attached to the post will appear here.")
  }
};
function getDynamicSource(source) {
  return DYNAMIC_SOURCES[source];
}
var MAX_IMAGES = 100;
function getSourceQuery(dynamicContent, { postId }) {
  const { source, args = {} } = dynamicContent ?? {};
  switch (source) {
    case ATTACHED_MEDIA:
      if (!postId) {
        return null;
      }
      return {
        parent: postId,
        per_page: MAX_IMAGES,
        // The gallery only accepts images, so constrain the source to
        // image media (matching the server resolver). This keeps the
        // editor preview in step with the rendered output for posts
        // that also have non-image attachments.
        media_type: "image",
        // Map the camelCase `args` to the REST-named media collection
        // params. Unexpected values (only reachable via hand-edited
        // markup) are coerced back to the defaults — mirroring the server
        // resolver's allow list — so the editor preview stays in step with
        // the frontend instead of issuing an invalid REST query.
        orderby: args.orderBy === "date" || args.orderBy === "title" ? args.orderBy : DEFAULT_ORDERBY,
        order: args.order === "asc" || args.order === "desc" ? args.order : DEFAULT_ORDER
      };
  }
  return null;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ATTACHED_MEDIA,
  DEFAULT_ORDER,
  DEFAULT_ORDERBY,
  MAX_IMAGES,
  getDynamicSource,
  getSourceQuery
});
//# sourceMappingURL=dynamic-source.cjs.map
