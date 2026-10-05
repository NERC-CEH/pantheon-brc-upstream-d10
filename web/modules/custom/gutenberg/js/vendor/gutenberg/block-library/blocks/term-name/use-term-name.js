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

// packages/block-library/src/term-name/use-term-name.js
var use_term_name_exports = {};
__export(use_term_name_exports, {
  useTermName: () => useTermName
});
module.exports = __toCommonJS(use_term_name_exports);
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
function useTermName(termId, taxonomy) {
  const contextBasedTerm = (0, import_data.useSelect)(
    (select) => {
      if (!termId || !taxonomy) {
        return null;
      }
      return select(import_core_data.store).getEntityRecord(
        "taxonomy",
        taxonomy,
        termId
      );
    },
    [termId, taxonomy]
  );
  const templateBasedTerm = useTemplateBasedTermData();
  const hasContext = Boolean(termId && taxonomy);
  return {
    hasContext,
    term: hasContext ? contextBasedTerm : templateBasedTerm
  };
}
function useTemplateBasedTermData() {
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
  let termSlug;
  if (taxonomyMatches) {
    if (taxonomyMatches[3]) {
      taxonomy = taxonomyMatches[6] ? taxonomyMatches[6] : taxonomyMatches[4];
      termSlug = taxonomyMatches[7];
    }
    taxonomy = taxonomy === "tag" ? "post_tag" : taxonomy;
  }
  return (0, import_data.useSelect)(
    (select) => {
      if (!taxonomy || !termSlug) {
        return null;
      }
      const { getEntityRecords } = select(import_core_data.store);
      const termRecords = getEntityRecords("taxonomy", taxonomy, {
        slug: termSlug,
        per_page: 1
      });
      if (termRecords && termRecords[0]) {
        return termRecords[0];
      }
      return null;
    },
    [taxonomy, termSlug]
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useTermName
});
//# sourceMappingURL=use-term-name.cjs.map
