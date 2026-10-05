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

// packages/block-library/src/query/utils.js
var utils_exports = {};
__export(utils_exports, {
  getEntitiesInfo: () => getEntitiesInfo,
  getQueryContextFromTemplate: () => getQueryContextFromTemplate,
  getTransformedBlocksFromPattern: () => getTransformedBlocksFromPattern,
  getValueFromObjectPath: () => getValueFromObjectPath,
  isControlAllowed: () => isControlAllowed,
  mapToIHasNameAndId: () => mapToIHasNameAndId,
  useAllowedControls: () => useAllowedControls,
  useBlockNameForPatterns: () => useBlockNameForPatterns,
  useIsPostTypeHierarchical: () => useIsPostTypeHierarchical,
  useOrderByOptions: () => useOrderByOptions,
  usePatterns: () => usePatterns,
  usePostTypes: () => usePostTypes,
  useScopedBlockVariations: () => useScopedBlockVariations,
  useTaxonomies: () => useTaxonomies,
  useUnsupportedBlocks: () => useUnsupportedBlocks
});
module.exports = __toCommonJS(utils_exports);
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_core_data = require("@wordpress/core-data");
var import_block_editor = require("@wordpress/block-editor");
var import_html_entities = require("@wordpress/html-entities");
var import_i18n = require("@wordpress/i18n");
var import_blocks = require("@wordpress/blocks");
var getEntitiesInfo = (entities) => {
  const mapping = entities?.reduce(
    (accumulator, entity) => {
      const { mapById, mapByName, names } = accumulator;
      mapById[entity.id] = entity;
      mapByName[entity.name] = entity;
      names.push(entity.name);
      return accumulator;
    },
    { mapById: {}, mapByName: {}, names: [] }
  );
  return {
    entities,
    ...mapping
  };
};
var getValueFromObjectPath = (object, path) => {
  const normalizedPath = path.split(".");
  let value = object;
  normalizedPath.forEach((fieldName) => {
    value = value?.[fieldName];
  });
  return value;
};
var mapToIHasNameAndId = (entities, path) => {
  return (entities || []).map((entity) => ({
    ...entity,
    name: (0, import_html_entities.decodeEntities)(getValueFromObjectPath(entity, path))
  }));
};
var usePostTypes = () => {
  const postTypes = (0, import_data.useSelect)((select) => {
    const { getPostTypes } = select(import_core_data.store);
    const excludedPostTypes = ["attachment"];
    const filteredPostTypes = getPostTypes({ per_page: -1 })?.filter(
      ({ viewable, slug }) => viewable && !excludedPostTypes.includes(slug)
    );
    return filteredPostTypes;
  }, []);
  const postTypesTaxonomiesMap = (0, import_element.useMemo)(() => {
    if (!postTypes?.length) {
      return;
    }
    return postTypes.reduce((accumulator, type) => {
      accumulator[type.slug] = type.taxonomies;
      return accumulator;
    }, {});
  }, [postTypes]);
  const postTypesSelectOptions = (0, import_element.useMemo)(
    () => (postTypes || []).map(({ labels, slug }) => ({
      label: labels.singular_name,
      value: slug
    })),
    [postTypes]
  );
  const postTypeFormatSupportMap = (0, import_element.useMemo)(() => {
    if (!postTypes?.length) {
      return {};
    }
    return postTypes.reduce((accumulator, type) => {
      accumulator[type.slug] = type.supports?.["post-formats"] || false;
      return accumulator;
    }, {});
  }, [postTypes]);
  return {
    postTypesTaxonomiesMap,
    postTypesSelectOptions,
    postTypeFormatSupportMap
  };
};
var useTaxonomies = (postType) => {
  const taxonomies = (0, import_data.useSelect)(
    (select) => {
      const { getTaxonomies, getPostType } = select(import_core_data.store);
      if (getPostType(postType)?.taxonomies?.length > 0) {
        return getTaxonomies({
          type: postType,
          per_page: -1
        });
      }
      return [];
    },
    [postType]
  );
  return (0, import_element.useMemo)(() => {
    return taxonomies?.filter(
      ({ visibility }) => !!visibility?.publicly_queryable
    );
  }, [taxonomies]);
};
function useIsPostTypeHierarchical(postType) {
  return (0, import_data.useSelect)(
    (select) => {
      const type = select(import_core_data.store).getPostType(postType);
      return type?.viewable && type?.hierarchical;
    },
    [postType]
  );
}
function useOrderByOptions(postType) {
  const supportsCustomOrder = (0, import_data.useSelect)(
    (select) => {
      const type = select(import_core_data.store).getPostType(postType);
      return !!type?.supports?.["page-attributes"];
    },
    [postType]
  );
  return (0, import_element.useMemo)(() => {
    const orderByOptions = [
      {
        label: (0, import_i18n.__)("Newest to oldest"),
        value: "date/desc"
      },
      {
        label: (0, import_i18n.__)("Oldest to newest"),
        value: "date/asc"
      },
      {
        /* translators: Label for ordering posts by title in ascending order. */
        label: (0, import_i18n.__)("A → Z"),
        value: "title/asc"
      },
      {
        /* translators: Label for ordering posts by title in descending order. */
        label: (0, import_i18n.__)("Z → A"),
        value: "title/desc"
      }
    ];
    if (supportsCustomOrder) {
      orderByOptions.push(
        {
          /* translators: Label for ordering posts by ascending menu order. */
          label: (0, import_i18n.__)("Ascending by order"),
          value: "menu_order/asc"
        },
        {
          /* translators: Label for ordering posts by descending menu order. */
          label: (0, import_i18n.__)("Descending by order"),
          value: "menu_order/desc"
        }
      );
    }
    return orderByOptions;
  }, [supportsCustomOrder]);
}
function useAllowedControls(attributes) {
  return (0, import_data.useSelect)(
    (select) => select(import_blocks.store).getActiveBlockVariation(
      "core/query",
      attributes
    )?.allowedControls,
    [attributes]
  );
}
function isControlAllowed(allowedControls, key) {
  if (!allowedControls) {
    return true;
  }
  return allowedControls.includes(key);
}
var getTransformedBlocksFromPattern = (blocks, queryBlockAttributes) => {
  const {
    query: { postType, inherit },
    namespace
  } = queryBlockAttributes;
  const clonedBlocks = blocks.map((block) => (0, import_blocks.cloneBlock)(block));
  const queryClientIds = [];
  const blocksQueue = [...clonedBlocks];
  while (blocksQueue.length > 0) {
    const block = blocksQueue.shift();
    if (block.name === "core/query") {
      block.attributes.query = {
        ...block.attributes.query,
        postType,
        inherit
      };
      if (namespace) {
        block.attributes.namespace = namespace;
      }
      queryClientIds.push(block.clientId);
    }
    block.innerBlocks?.forEach((innerBlock) => {
      blocksQueue.push(innerBlock);
    });
  }
  return { newBlocks: clonedBlocks, queryClientIds };
};
function useBlockNameForPatterns(clientId, attributes) {
  return (0, import_data.useSelect)(
    (select) => {
      const activeVariationName = select(
        import_blocks.store
      ).getActiveBlockVariation("core/query", attributes)?.name;
      if (!activeVariationName) {
        return "core/query";
      }
      const { getBlockRootClientId, getPatternsByBlockTypes } = select(import_block_editor.store);
      const rootClientId = getBlockRootClientId(clientId);
      const activePatterns = getPatternsByBlockTypes(
        `core/query/${activeVariationName}`,
        rootClientId
      );
      return activePatterns.length > 0 ? `core/query/${activeVariationName}` : "core/query";
    },
    [clientId, attributes]
  );
}
function useScopedBlockVariations(attributes) {
  const { activeVariationName, blockVariations } = (0, import_data.useSelect)(
    (select) => {
      const { getActiveBlockVariation, getBlockVariations } = select(import_blocks.store);
      return {
        activeVariationName: getActiveBlockVariation(
          "core/query",
          attributes
        )?.name,
        blockVariations: getBlockVariations("core/query", "block")
      };
    },
    [attributes]
  );
  const variations = (0, import_element.useMemo)(() => {
    const isNotConnected = (variation) => !variation.attributes?.namespace;
    if (!activeVariationName) {
      return blockVariations.filter(isNotConnected);
    }
    const connectedVariations = blockVariations.filter(
      (variation) => variation.attributes?.namespace?.includes(activeVariationName)
    );
    if (!!connectedVariations.length) {
      return connectedVariations;
    }
    return blockVariations.filter(isNotConnected);
  }, [activeVariationName, blockVariations]);
  return variations;
}
var usePatterns = (clientId, name) => {
  return (0, import_data.useSelect)(
    (select) => {
      const { getBlockRootClientId, getPatternsByBlockTypes } = select(import_block_editor.store);
      const rootClientId = getBlockRootClientId(clientId);
      return getPatternsByBlockTypes(name, rootClientId);
    },
    [name, clientId]
  );
};
var useUnsupportedBlocks = (clientId) => {
  return (0, import_data.useSelect)(
    (select) => {
      const { getClientIdsOfDescendants, getBlockName } = select(import_block_editor.store);
      const { getBlockSupport, getBlockType } = select(import_blocks.store);
      const blockTitles = /* @__PURE__ */ new Set();
      getClientIdsOfDescendants(clientId).forEach(
        (descendantClientId) => {
          const blockName = getBlockName(descendantClientId);
          const blockSupportsInteractivity = Object.is(
            getBlockSupport(blockName, "interactivity"),
            true
          );
          const blockSupportsInteractivityClientNavigation = getBlockSupport(
            blockName,
            "interactivity.clientNavigation"
          );
          if (!blockSupportsInteractivity && !blockSupportsInteractivityClientNavigation) {
            blockTitles.add(
              getBlockType(blockName)?.title || blockName
            );
          }
        }
      );
      return [...blockTitles];
    },
    [clientId]
  );
};
function getQueryContextFromTemplate(templateSlug) {
  if (!templateSlug) {
    return { isSingular: true };
  }
  let isSingular = false;
  let templateType = templateSlug === "wp" ? "custom" : templateSlug;
  const singularTemplates = ["404", "blank", "single", "page", "custom"];
  const templateTypeFromSlug = templateSlug.includes("-") ? templateSlug.split("-", 1)[0] : templateSlug;
  const queryFromTemplateSlug = templateSlug.includes("-") ? templateSlug.split("-").slice(1).join("-") : "";
  if (queryFromTemplateSlug) {
    templateType = templateTypeFromSlug;
  }
  isSingular = singularTemplates.includes(templateType);
  return { isSingular, templateType };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getEntitiesInfo,
  getQueryContextFromTemplate,
  getTransformedBlocksFromPattern,
  getValueFromObjectPath,
  isControlAllowed,
  mapToIHasNameAndId,
  useAllowedControls,
  useBlockNameForPatterns,
  useIsPostTypeHierarchical,
  useOrderByOptions,
  usePatterns,
  usePostTypes,
  useScopedBlockVariations,
  useTaxonomies,
  useUnsupportedBlocks
});
//# sourceMappingURL=utils.cjs.map
