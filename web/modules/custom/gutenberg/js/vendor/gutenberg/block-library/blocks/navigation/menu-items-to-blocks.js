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

// packages/block-library/src/navigation/menu-items-to-blocks.js
var menu_items_to_blocks_exports = {};
__export(menu_items_to_blocks_exports, {
  default: () => menuItemsToBlocks
});
module.exports = __toCommonJS(menu_items_to_blocks_exports);
var import_blocks = require("@wordpress/blocks");
var import_hooks = require("@wordpress/hooks");
var import_use_entity_binding = require("../navigation-link/shared/use-entity-binding.cjs");
function menuItemsToBlocks(menuItems) {
  if (!menuItems) {
    return null;
  }
  const menuTree = createDataTree(menuItems);
  const blocks = mapMenuItemsToBlocks(menuTree);
  return (0, import_hooks.applyFilters)(
    "blocks.navigation.__unstableMenuItemsToBlocks",
    blocks,
    menuItems
  );
}
function mapMenuItemsToBlocks(menuItems, level = 0) {
  let mapping = {};
  const sortedItems = [...menuItems].sort(
    (a, b) => a.menu_order - b.menu_order
  );
  const innerBlocks = sortedItems.map((menuItem) => {
    if (menuItem.type === "block") {
      const [block2] = (0, import_blocks.parse)(menuItem.content.raw);
      if (!block2) {
        return (0, import_blocks.createBlock)("core/freeform", {
          content: menuItem.content
        });
      }
      return block2;
    }
    const blockType = menuItem.children?.length ? "core/navigation-submenu" : "core/navigation-link";
    const attributes = menuItemToBlockAttributes(
      menuItem,
      blockType,
      level
    );
    const {
      innerBlocks: nestedBlocks = [],
      // alias to avoid shadowing
      mapping: nestedMapping = {}
      // alias to avoid shadowing
    } = menuItem.children?.length ? mapMenuItemsToBlocks(menuItem.children, level + 1) : {};
    mapping = {
      ...mapping,
      ...nestedMapping
    };
    const block = (0, import_blocks.createBlock)(blockType, attributes, nestedBlocks);
    mapping[menuItem.id] = block.clientId;
    return block;
  });
  return {
    innerBlocks,
    mapping
  };
}
function menuItemToBlockAttributes({
  title: menuItemTitleField,
  xfn,
  classes,
  // eslint-disable-next-line camelcase
  attr_title,
  object,
  // eslint-disable-next-line camelcase
  object_id,
  description,
  url,
  type: menuItemTypeField,
  target
}, blockType, level) {
  if (object && object === "post_tag") {
    object = "tag";
  }
  const inferredKind = menuItemTypeField?.replace("_", "-") || "custom";
  return {
    label: menuItemTitleField?.rendered || "",
    ...object?.length && {
      type: object
    },
    kind: inferredKind,
    url: url || "",
    ...xfn?.length && xfn.join(" ").trim() && {
      rel: xfn.join(" ").trim()
    },
    ...classes?.length && classes.join(" ").trim() && {
      className: classes.join(" ").trim()
    },
    /* eslint-disable camelcase */
    ...attr_title?.length && {
      title: attr_title
    },
    ...object_id && (inferredKind === "post-type" || inferredKind === "taxonomy") && {
      id: object_id,
      metadata: {
        bindings: (0, import_use_entity_binding.buildNavigationLinkEntityBinding)(inferredKind)
      }
    },
    /* eslint-enable camelcase */
    ...description?.length && {
      description
    },
    ...target === "_blank" && {
      opensInNewTab: true
    },
    ...blockType === "core/navigation-submenu" && {
      isTopLevelItem: level === 0
    },
    ...blockType === "core/navigation-link" && {
      isTopLevelLink: level === 0
    }
  };
}
function createDataTree(dataset, id = "id", relation = "parent") {
  const hashTable = /* @__PURE__ */ Object.create(null);
  const dataTree = [];
  for (const data of dataset) {
    hashTable[data[id]] = {
      ...data,
      children: []
    };
    if (data[relation]) {
      hashTable[data[relation]] = hashTable[data[relation]] || {};
      hashTable[data[relation]].children = hashTable[data[relation]].children || [];
      hashTable[data[relation]].children.push(
        hashTable[data[id]]
      );
    } else {
      dataTree.push(hashTable[data[id]]);
    }
  }
  return dataTree;
}
//# sourceMappingURL=menu-items-to-blocks.cjs.map
