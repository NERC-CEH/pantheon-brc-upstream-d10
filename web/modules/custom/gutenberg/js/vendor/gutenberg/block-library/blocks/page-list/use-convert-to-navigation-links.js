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

// packages/block-library/src/page-list/use-convert-to-navigation-links.js
var use_convert_to_navigation_links_exports = {};
__export(use_convert_to_navigation_links_exports, {
  convertToNavigationLinks: () => convertToNavigationLinks,
  useConvertToNavigationLinks: () => useConvertToNavigationLinks
});
module.exports = __toCommonJS(use_convert_to_navigation_links_exports);
var import_blocks = require("@wordpress/blocks");
var import_data = require("@wordpress/data");
var import_block_editor = require("@wordpress/block-editor");
var import_shared = require("../navigation-link/shared/index.cjs");
function createNavigationLinks(pages = []) {
  const POST_TYPE_KIND = "post-type";
  const linkMap = {};
  const navigationLinks = [];
  pages.forEach(({ id, title, link: url, type, parent }) => {
    const innerBlocks = linkMap[id]?.innerBlocks ?? [];
    linkMap[id] = (0, import_blocks.createBlock)(
      "core/navigation-link",
      {
        id,
        label: title.rendered,
        url,
        type,
        kind: POST_TYPE_KIND,
        metadata: {
          bindings: (0, import_shared.buildNavigationLinkEntityBinding)(POST_TYPE_KIND)
        }
      },
      innerBlocks
    );
    if (!parent) {
      navigationLinks.push(linkMap[id]);
    } else {
      if (!linkMap[parent]) {
        linkMap[parent] = { innerBlocks: [] };
      }
      const parentLinkInnerBlocks = linkMap[parent].innerBlocks;
      parentLinkInnerBlocks.push(linkMap[id]);
    }
  });
  return navigationLinks;
}
function findNavigationLinkById(navigationLinks, id) {
  for (const navigationLink of navigationLinks) {
    if (navigationLink.attributes.id === id) {
      return navigationLink;
    }
    if (navigationLink.innerBlocks && navigationLink.innerBlocks.length) {
      const foundNavigationLink = findNavigationLinkById(
        navigationLink.innerBlocks,
        id
      );
      if (foundNavigationLink) {
        return foundNavigationLink;
      }
    }
  }
  return null;
}
function convertToNavigationLinks(pages = [], parentPageID = null) {
  let navigationLinks = createNavigationLinks(pages);
  if (parentPageID) {
    const parentPage = findNavigationLinkById(
      navigationLinks,
      parentPageID
    );
    if (parentPage && parentPage.innerBlocks) {
      navigationLinks = parentPage.innerBlocks;
    }
  }
  const transformSubmenus = (listOfLinks) => {
    listOfLinks.forEach((block, index, listOfLinksArray) => {
      const { attributes, innerBlocks } = block;
      if (innerBlocks.length !== 0) {
        transformSubmenus(innerBlocks);
        const transformedBlock = (0, import_blocks.createBlock)(
          "core/navigation-submenu",
          attributes,
          innerBlocks
        );
        listOfLinksArray[index] = transformedBlock;
      }
    });
  };
  transformSubmenus(navigationLinks);
  return navigationLinks;
}
function useConvertToNavigationLinks({
  clientId,
  pages,
  parentClientId,
  parentPageID
}) {
  const { replaceBlock, selectBlock } = (0, import_data.useDispatch)(import_block_editor.store);
  return () => {
    const navigationLinks = convertToNavigationLinks(pages, parentPageID);
    replaceBlock(clientId, navigationLinks);
    selectBlock(parentClientId);
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  convertToNavigationLinks,
  useConvertToNavigationLinks
});
//# sourceMappingURL=use-convert-to-navigation-links.cjs.map
