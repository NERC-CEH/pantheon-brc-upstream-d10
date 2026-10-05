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

// packages/block-library/src/post-terms/use-post-terms.js
var use_post_terms_exports = {};
__export(use_post_terms_exports, {
  default: () => usePostTerms
});
module.exports = __toCommonJS(use_post_terms_exports);
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
var EMPTY_ARRAY = [];
function usePostTerms({ postId, term }) {
  const { slug } = term;
  return (0, import_data.useSelect)(
    (select) => {
      const visible = term?.visibility?.publicly_queryable;
      if (!visible || !postId) {
        return {
          postTerms: EMPTY_ARRAY,
          isLoading: false,
          hasPostTerms: false
        };
      }
      const { getEntityRecords, isResolving } = select(import_core_data.store);
      const taxonomyArgs = [
        "taxonomy",
        slug,
        {
          post: postId,
          per_page: -1,
          context: "view"
        }
      ];
      const terms = getEntityRecords(...taxonomyArgs);
      return {
        postTerms: terms,
        isLoading: isResolving("getEntityRecords", taxonomyArgs),
        hasPostTerms: !!terms?.length
      };
    },
    [postId, term?.visibility?.publicly_queryable, slug]
  );
}
//# sourceMappingURL=use-post-terms.cjs.map
