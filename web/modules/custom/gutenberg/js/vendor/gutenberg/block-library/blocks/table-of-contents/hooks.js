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

// packages/block-library/src/table-of-contents/hooks.js
var hooks_exports = {};
__export(hooks_exports, {
  useObserveHeadings: () => useObserveHeadings
});
module.exports = __toCommonJS(hooks_exports);
var import_es6 = __toESM(require("fast-deep-equal/es6/index.js"));
var import_data = require("@wordpress/data");
var import_dom = require("@wordpress/dom");
var import_element = require("@wordpress/element");
var import_url = require("@wordpress/url");
var import_block_editor = require("@wordpress/block-editor");
function getLatestHeadings(select, clientId) {
  const {
    getBlockAttributes,
    getBlockName,
    getBlocksByName,
    getClientIdsOfDescendants
  } = select(import_block_editor.store);
  const permalink = select("core/editor").getPermalink() ?? null;
  const isPaginated = getBlocksByName("core/nextpage").length !== 0;
  const { onlyIncludeCurrentPage, maxLevel } = getBlockAttributes(clientId) ?? {};
  const [postContentClientId = ""] = getBlocksByName("core/post-content");
  const allBlockClientIds = getClientIdsOfDescendants(postContentClientId);
  let tocPage = 1;
  if (isPaginated && onlyIncludeCurrentPage) {
    const tocIndex = allBlockClientIds.indexOf(clientId);
    for (const [
      blockIndex,
      blockClientId
    ] of allBlockClientIds.entries()) {
      if (blockIndex >= tocIndex) {
        break;
      }
      if (getBlockName(blockClientId) === "core/nextpage") {
        tocPage++;
      }
    }
  }
  const latestHeadings = [];
  let headingPage = 1;
  let headingPageLink = null;
  if (typeof permalink === "string") {
    headingPageLink = isPaginated ? (0, import_url.addQueryArgs)(permalink, { page: headingPage }) : permalink;
  }
  for (const blockClientId of allBlockClientIds) {
    const blockName = getBlockName(blockClientId);
    if (blockName === "core/nextpage") {
      headingPage++;
      if (onlyIncludeCurrentPage && headingPage > tocPage) {
        break;
      }
      if (typeof permalink === "string") {
        headingPageLink = (0, import_url.addQueryArgs)(
          (0, import_url.removeQueryArgs)(permalink, ["page"]),
          { page: headingPage }
        );
      }
    } else if (!onlyIncludeCurrentPage || headingPage === tocPage) {
      if (blockName === "core/heading") {
        const headingAttributes = getBlockAttributes(blockClientId);
        if (maxLevel && headingAttributes.level > maxLevel) {
          continue;
        }
        const canBeLinked = typeof headingPageLink === "string" && typeof headingAttributes.anchor === "string" && headingAttributes.anchor !== "";
        latestHeadings.push({
          // Convert line breaks to spaces, and get rid of HTML tags in the headings.
          content: (0, import_dom.__unstableStripHTML)(
            headingAttributes.content.replace(
              /(<br *\/?>)+/g,
              " "
            )
          ),
          level: headingAttributes.level,
          link: canBeLinked ? `${headingPageLink}#${headingAttributes.anchor}` : null
        });
      }
    }
  }
  return latestHeadings;
}
function observeCallback(select, dispatch, clientId) {
  const { getBlockAttributes } = select(import_block_editor.store);
  const { updateBlockAttributes, __unstableMarkNextChangeAsNotPersistent } = dispatch(import_block_editor.store);
  const attributes = getBlockAttributes(clientId);
  if (attributes === null) {
    return;
  }
  const headings = getLatestHeadings(select, clientId);
  if (!(0, import_es6.default)(headings, attributes.headings)) {
    window.queueMicrotask(() => {
      __unstableMarkNextChangeAsNotPersistent();
      updateBlockAttributes(clientId, { headings });
    });
  }
}
function useObserveHeadings(clientId) {
  const registry = (0, import_data.useRegistry)();
  (0, import_element.useEffect)(() => {
    return registry.subscribe(
      () => observeCallback(registry.select, registry.dispatch, clientId)
    );
  }, [registry, clientId]);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useObserveHeadings
});
//# sourceMappingURL=hooks.cjs.map
