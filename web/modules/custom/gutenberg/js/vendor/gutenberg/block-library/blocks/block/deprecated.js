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

// packages/block-library/src/block/deprecated.js
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var isObject = (obj) => typeof obj === "object" && !Array.isArray(obj) && obj !== null;
var v2 = {
  attributes: {
    ref: {
      type: "number"
    },
    content: {
      type: "object"
    }
  },
  supports: {
    customClassName: false,
    html: false,
    inserter: false,
    renaming: false
  },
  // Force this deprecation to run whenever there's a values sub-property that's an object.
  //
  // This could fail in the future if a block ever has binding to a `values` attribute.
  // Some extra protection is added to ensure `values` is an object, but this only reduces
  // the likelihood, it doesn't solve it completely.
  isEligible({ content }) {
    return !!content && Object.keys(content).every(
      (contentKey) => content[contentKey].values && isObject(content[contentKey].values)
    );
  },
  /*
   * Old attribute format:
   * content: {
   *     "V98q_x": {
   * 	   		// The attribute values are now stored as a 'values' sub-property.
   *         values: { content: 'My content value' },
   * 	       // ... additional metadata, like the block name can be stored here.
   *     }
   * }
   *
   * New attribute format:
   * content: {
   *     "V98q_x": {
   *         content: 'My content value',
   *     }
   * }
   */
  migrate(attributes) {
    const { content, ...retainedAttributes } = attributes;
    if (content && Object.keys(content).length) {
      const updatedContent = { ...content };
      for (const contentKey in content) {
        updatedContent[contentKey] = content[contentKey].values;
      }
      return {
        ...retainedAttributes,
        content: updatedContent
      };
    }
    return attributes;
  }
};
var v1 = {
  attributes: {
    ref: {
      type: "number"
    },
    overrides: {
      type: "object"
    }
  },
  supports: {
    customClassName: false,
    html: false,
    inserter: false,
    renaming: false
  },
  // Force this deprecation to run whenever there's an `overrides` object.
  isEligible({ overrides }) {
    return !!overrides;
  },
  /*
   * Old attribute format:
   * overrides: {
   *     // An key is an id that represents a block.
   *     // The values are the attribute values of the block.
   *     "V98q_x": { content: 'My content value' }
   * }
   *
   * New attribute format:
   * content: {
   *     "V98q_x": { content: 'My content value' }
   * }
   *
   */
  migrate(attributes) {
    const { overrides, ...retainedAttributes } = attributes;
    const content = {};
    Object.keys(overrides).forEach((id) => {
      content[id] = overrides[id];
    });
    return {
      ...retainedAttributes,
      content
    };
  }
};
var deprecated_default = [v2, v1];
//# sourceMappingURL=deprecated.cjs.map
