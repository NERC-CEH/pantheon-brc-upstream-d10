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

// packages/block-library/src/query/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_blocks = require("@wordpress/blocks");
var import_block_editor = require("@wordpress/block-editor");
var import_lock_unlock = require("../lock-unlock.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var { cleanEmptyObject } = (0, import_lock_unlock.unlock)(import_block_editor.privateApis);
var migrateToTaxQuery = (attributes) => {
  const { query } = attributes;
  const { categoryIds, tagIds, taxQuery, ...newQuery } = query;
  if (!!categoryIds?.length || !!tagIds?.length) {
    newQuery.taxQuery = {
      include: {
        category: !!categoryIds?.length ? categoryIds : void 0,
        post_tag: !!tagIds?.length ? tagIds : void 0
      }
    };
  }
  if (!!Object.keys(taxQuery || {}).length) {
    newQuery.taxQuery = { include: taxQuery };
  }
  return {
    ...attributes,
    query: newQuery
  };
};
var migrateColors = (attributes, innerBlocks) => {
  const { style, backgroundColor, gradient, textColor, ...newAttributes } = attributes;
  const hasColorStyles = backgroundColor || gradient || textColor || style?.color || style?.elements?.link;
  if (!hasColorStyles) {
    return [attributes, innerBlocks];
  }
  if (style) {
    newAttributes.style = cleanEmptyObject({
      ...style,
      color: void 0,
      elements: {
        ...style.elements,
        link: void 0
      }
    });
  }
  if (hasSingleInnerGroupBlock(innerBlocks)) {
    const groupBlock = innerBlocks[0];
    const hasStyles = style?.color || style?.elements?.link || groupBlock.attributes.style;
    const newStyles = hasStyles ? cleanEmptyObject({
      ...groupBlock.attributes.style,
      color: style?.color,
      elements: style?.elements?.link ? { link: style?.elements?.link } : void 0
    }) : void 0;
    const updatedGroupBlock = (0, import_blocks.createBlock)(
      "core/group",
      {
        ...groupBlock.attributes,
        backgroundColor,
        gradient,
        textColor,
        style: newStyles
      },
      groupBlock.innerBlocks
    );
    return [newAttributes, [updatedGroupBlock]];
  }
  const newGroupBlock = (0, import_blocks.createBlock)(
    "core/group",
    {
      backgroundColor,
      gradient,
      textColor,
      style: cleanEmptyObject({
        color: style?.color,
        elements: style?.elements?.link ? { link: style?.elements?.link } : void 0
      })
    },
    innerBlocks
  );
  return [newAttributes, [newGroupBlock]];
};
var hasSingleInnerGroupBlock = (innerBlocks = []) => innerBlocks.length === 1 && innerBlocks[0].name === "core/group";
var migrateToConstrainedLayout = (attributes) => {
  const { layout = null } = attributes;
  if (!layout) {
    return attributes;
  }
  const { inherit = null, contentSize = null, ...newLayout } = layout;
  if (inherit || contentSize) {
    return {
      ...attributes,
      layout: {
        ...newLayout,
        contentSize,
        type: "constrained"
      }
    };
  }
  return attributes;
};
var findPostTemplateBlock = (innerBlocks = []) => {
  let foundBlock = null;
  for (const block of innerBlocks) {
    if (block.name === "core/post-template") {
      foundBlock = block;
      break;
    } else if (block.innerBlocks.length) {
      foundBlock = findPostTemplateBlock(block.innerBlocks);
    }
  }
  return foundBlock;
};
var replacePostTemplateBlock = (innerBlocks = [], replacementBlock) => {
  innerBlocks.forEach((block, index) => {
    if (block.name === "core/post-template") {
      innerBlocks.splice(index, 1, replacementBlock);
    } else if (block.innerBlocks.length) {
      block.innerBlocks = replacePostTemplateBlock(
        block.innerBlocks,
        replacementBlock
      );
    }
  });
  return innerBlocks;
};
var migrateDisplayLayout = (attributes, innerBlocks) => {
  const { displayLayout = null, ...newAttributes } = attributes;
  if (!displayLayout) {
    return [attributes, innerBlocks];
  }
  const postTemplateBlock = findPostTemplateBlock(innerBlocks);
  if (!postTemplateBlock) {
    return [attributes, innerBlocks];
  }
  const { type, columns } = displayLayout;
  const updatedLayoutType = type === "flex" ? "grid" : "default";
  const newPostTemplateBlock = (0, import_blocks.createBlock)(
    "core/post-template",
    {
      ...postTemplateBlock.attributes,
      layout: {
        type: updatedLayoutType,
        ...columns && { columnCount: columns }
      }
    },
    postTemplateBlock.innerBlocks
  );
  return [
    newAttributes,
    replacePostTemplateBlock(innerBlocks, newPostTemplateBlock)
  ];
};
var v1 = {
  attributes: {
    queryId: {
      type: "number"
    },
    query: {
      type: "object",
      default: {
        perPage: null,
        pages: 0,
        offset: 0,
        postType: "post",
        categoryIds: [],
        tagIds: [],
        order: "desc",
        orderBy: "date",
        author: "",
        search: "",
        exclude: [],
        sticky: "",
        inherit: true
      }
    },
    layout: {
      type: "object",
      default: {
        type: "list"
      }
    }
  },
  supports: {
    html: false
  },
  migrate(attributes, innerBlocks) {
    const withTaxQuery = migrateToTaxQuery(attributes);
    const { layout, ...restWithTaxQuery } = withTaxQuery;
    const newAttributes = {
      ...restWithTaxQuery,
      displayLayout: withTaxQuery.layout
    };
    return migrateDisplayLayout(newAttributes, innerBlocks);
  },
  save() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InnerBlocks.Content, {});
  }
};
var v2 = {
  attributes: {
    queryId: {
      type: "number"
    },
    query: {
      type: "object",
      default: {
        perPage: null,
        pages: 0,
        offset: 0,
        postType: "post",
        categoryIds: [],
        tagIds: [],
        order: "desc",
        orderBy: "date",
        author: "",
        search: "",
        exclude: [],
        sticky: "",
        inherit: true
      }
    },
    tagName: {
      type: "string",
      default: "div"
    },
    displayLayout: {
      type: "object",
      default: {
        type: "list"
      }
    }
  },
  supports: {
    align: ["wide", "full"],
    html: false,
    color: {
      gradients: true,
      link: true
    },
    layout: true
  },
  isEligible: ({ query: { categoryIds, tagIds } = {} }) => categoryIds || tagIds,
  migrate(attributes, innerBlocks) {
    const withTaxQuery = migrateToTaxQuery(attributes);
    const [withColorAttributes, withColorInnerBlocks] = migrateColors(
      withTaxQuery,
      innerBlocks
    );
    const withConstrainedLayoutAttributes = migrateToConstrainedLayout(withColorAttributes);
    return migrateDisplayLayout(
      withConstrainedLayoutAttributes,
      withColorInnerBlocks
    );
  },
  save({ attributes: { tagName: Tag = "div" } }) {
    const blockProps = import_block_editor.useBlockProps.save();
    const innerBlocksProps = import_block_editor.useInnerBlocksProps.save(blockProps);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { ...innerBlocksProps });
  }
};
var v3 = {
  attributes: {
    queryId: {
      type: "number"
    },
    query: {
      type: "object",
      default: {
        perPage: null,
        pages: 0,
        offset: 0,
        postType: "post",
        order: "desc",
        orderBy: "date",
        author: "",
        search: "",
        exclude: [],
        sticky: "",
        inherit: true,
        taxQuery: null,
        parents: []
      }
    },
    tagName: {
      type: "string",
      default: "div"
    },
    displayLayout: {
      type: "object",
      default: {
        type: "list"
      }
    },
    namespace: {
      type: "string"
    }
  },
  supports: {
    align: ["wide", "full"],
    html: false,
    color: {
      gradients: true,
      link: true,
      __experimentalDefaultControls: {
        background: true,
        text: true
      }
    },
    layout: true
  },
  isEligible(attributes) {
    const { style, backgroundColor, gradient, textColor } = attributes;
    return backgroundColor || gradient || textColor || style?.color || style?.elements?.link;
  },
  migrate(attributes, innerBlocks) {
    const [withColorAttributes, withColorInnerBlocks] = migrateColors(
      attributes,
      innerBlocks
    );
    const withConstrainedLayoutAttributes = migrateToConstrainedLayout(withColorAttributes);
    return migrateDisplayLayout(
      withConstrainedLayoutAttributes,
      withColorInnerBlocks
    );
  },
  save({ attributes: { tagName: Tag = "div" } }) {
    const blockProps = import_block_editor.useBlockProps.save();
    const innerBlocksProps = import_block_editor.useInnerBlocksProps.save(blockProps);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { ...innerBlocksProps });
  }
};
var v4 = {
  attributes: {
    queryId: {
      type: "number"
    },
    query: {
      type: "object",
      default: {
        perPage: null,
        pages: 0,
        offset: 0,
        postType: "post",
        order: "desc",
        orderBy: "date",
        author: "",
        search: "",
        exclude: [],
        sticky: "",
        inherit: true,
        taxQuery: null,
        parents: []
      }
    },
    tagName: {
      type: "string",
      default: "div"
    },
    displayLayout: {
      type: "object",
      default: {
        type: "list"
      }
    },
    namespace: {
      type: "string"
    }
  },
  supports: {
    align: ["wide", "full"],
    html: false,
    color: {
      gradients: true,
      link: true,
      __experimentalDefaultControls: {
        background: true,
        text: true
      }
    },
    layout: true
  },
  save({ attributes: { tagName: Tag = "div" } }) {
    const blockProps = import_block_editor.useBlockProps.save();
    const innerBlocksProps = import_block_editor.useInnerBlocksProps.save(blockProps);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { ...innerBlocksProps });
  },
  isEligible: ({ layout }) => layout?.inherit || layout?.contentSize && layout?.type !== "constrained",
  migrate(attributes, innerBlocks) {
    const withConstrainedLayoutAttributes = migrateToConstrainedLayout(attributes);
    return migrateDisplayLayout(
      withConstrainedLayoutAttributes,
      innerBlocks
    );
  }
};
var v5 = {
  attributes: {
    queryId: {
      type: "number"
    },
    query: {
      type: "object",
      default: {
        perPage: null,
        pages: 0,
        offset: 0,
        postType: "post",
        order: "desc",
        orderBy: "date",
        author: "",
        search: "",
        exclude: [],
        sticky: "",
        inherit: true,
        taxQuery: null,
        parents: []
      }
    },
    tagName: {
      type: "string",
      default: "div"
    },
    displayLayout: {
      type: "object",
      default: {
        type: "list"
      }
    },
    namespace: {
      type: "string"
    }
  },
  supports: {
    align: ["wide", "full"],
    anchor: true,
    html: false,
    layout: true
  },
  save({ attributes: { tagName: Tag = "div" } }) {
    const blockProps = import_block_editor.useBlockProps.save();
    const innerBlocksProps = import_block_editor.useInnerBlocksProps.save(blockProps);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { ...innerBlocksProps });
  },
  isEligible: ({ displayLayout }) => {
    return !!displayLayout;
  },
  migrate: migrateDisplayLayout
};
var v6 = {
  attributes: {
    queryId: {
      type: "number"
    },
    query: {
      type: "object",
      default: {
        perPage: null,
        pages: 0,
        offset: 0,
        postType: "post",
        order: "desc",
        orderBy: "date",
        author: "",
        search: "",
        exclude: [],
        sticky: "",
        inherit: true,
        taxQuery: null,
        parents: [],
        format: []
      }
    },
    tagName: {
      type: "string",
      default: "div"
    },
    namespace: {
      type: "string"
    },
    enhancedPagination: {
      type: "boolean",
      default: false
    }
  },
  supports: {
    align: ["wide", "full"],
    html: false,
    layout: true,
    interactivity: true,
    contentRole: true
  },
  save({ attributes: { tagName: Tag = "div" } }) {
    const blockProps = import_block_editor.useBlockProps.save();
    const innerBlocksProps = import_block_editor.useInnerBlocksProps.save(blockProps);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { ...innerBlocksProps });
  },
  isEligible: ({ query: { taxQuery } = {} }) => !!taxQuery && Object.keys(taxQuery).some(
    (key) => !["include", "exclude"].includes(key)
  ),
  migrate(attributes, innerBlocks) {
    const withTaxQuery = migrateToTaxQuery(attributes);
    return migrateDisplayLayout(withTaxQuery, innerBlocks);
  }
};
var deprecated = [v6, v5, v4, v3, v2, v1];
var deprecated_default = deprecated;
//# sourceMappingURL=deprecated.cjs.map
