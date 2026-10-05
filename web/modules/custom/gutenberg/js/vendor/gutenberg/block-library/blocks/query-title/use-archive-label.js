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

// packages/block-library/src/query-title/use-archive-label.js
var use_archive_label_exports = {};
__export(use_archive_label_exports, {
  useArchiveLabel: () => useArchiveLabel
});
module.exports = __toCommonJS(use_archive_label_exports);
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
function useArchiveLabel() {
  const templateSlug = (0, import_data.useSelect)((select) => {
    const { getCurrentPostId, getCurrentPostType, getCurrentTemplateId } = select("core/editor");
    const currentPostType = getCurrentPostType();
    const templateId = getCurrentTemplateId() || (currentPostType === "wp_template" ? getCurrentPostId() : null);
    return templateId ? select(import_core_data.store).getEditedEntityRecord(
      "postType",
      "wp_template",
      templateId
    )?.slug : null;
  }, []);
  const taxonomyMatches = templateSlug?.match(
    /^(category|tag|taxonomy-([^-]+))$|^(((category|tag)|taxonomy-([^-]+))-(.+))$/
  );
  let taxonomy;
  let term;
  let isAuthor = false;
  let authorSlug;
  if (taxonomyMatches) {
    if (taxonomyMatches[1]) {
      taxonomy = taxonomyMatches[2] ? taxonomyMatches[2] : taxonomyMatches[1];
    } else if (taxonomyMatches[3]) {
      taxonomy = taxonomyMatches[6] ? taxonomyMatches[6] : taxonomyMatches[4];
      term = taxonomyMatches[7];
    }
    taxonomy = taxonomy === "tag" ? "post_tag" : taxonomy;
  } else {
    const authorMatches = templateSlug?.match(/^(author)$|^author-(.+)$/);
    if (authorMatches) {
      isAuthor = true;
      if (authorMatches[2]) {
        authorSlug = authorMatches[2];
      }
    }
  }
  return (0, import_data.useSelect)(
    (select) => {
      const { getEntityRecords, getTaxonomy, getAuthors } = select(import_core_data.store);
      let archiveTypeLabel;
      let archiveNameLabel;
      if (taxonomy) {
        archiveTypeLabel = getTaxonomy(taxonomy)?.labels?.singular_name;
      }
      if (term) {
        const records = getEntityRecords("taxonomy", taxonomy, {
          slug: term,
          per_page: 1
        });
        if (records && records[0]) {
          archiveNameLabel = records[0].name;
        }
      }
      if (isAuthor) {
        archiveTypeLabel = "Author";
        if (authorSlug) {
          const authorRecords = getAuthors({ slug: authorSlug });
          if (authorRecords && authorRecords[0]) {
            archiveNameLabel = authorRecords[0].name;
          }
        }
      }
      return {
        archiveTypeLabel,
        archiveNameLabel
      };
    },
    [authorSlug, isAuthor, taxonomy, term]
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useArchiveLabel
});
//# sourceMappingURL=use-archive-label.cjs.map
