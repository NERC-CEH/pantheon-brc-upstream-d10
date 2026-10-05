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

// packages/block-library/src/pattern/recursion-detector.js
var recursion_detector_exports = {};
__export(recursion_detector_exports, {
  parsePatternDependencies: () => parsePatternDependencies,
  registerDependency: () => registerDependency,
  useParsePatternDependencies: () => useParsePatternDependencies
});
module.exports = __toCommonJS(recursion_detector_exports);
var import_data = require("@wordpress/data");
var cachedParsers = /* @__PURE__ */ new WeakMap();
function useParsePatternDependencies() {
  const registry = (0, import_data.useRegistry)();
  if (!cachedParsers.has(registry)) {
    const deps = /* @__PURE__ */ new Map();
    cachedParsers.set(
      registry,
      parsePatternDependencies.bind(null, deps)
    );
  }
  return cachedParsers.get(registry);
}
function parsePatternDependencies(deps, { name, blocks }) {
  const queue = [...blocks];
  while (queue.length) {
    const block = queue.shift();
    for (const innerBlock of block.innerBlocks ?? []) {
      queue.unshift(innerBlock);
    }
    if (block.name === "core/pattern") {
      registerDependency(deps, name, block.attributes.slug);
    }
  }
}
function registerDependency(deps, a, b) {
  if (!deps.has(a)) {
    deps.set(a, /* @__PURE__ */ new Set());
  }
  deps.get(a).add(b);
  if (hasCycle(deps, a)) {
    throw new TypeError(
      `Pattern ${a} has a circular dependency and cannot be rendered.`
    );
  }
}
function hasCycle(deps, slug, visitedNodes = /* @__PURE__ */ new Set(), currentPath = /* @__PURE__ */ new Set()) {
  visitedNodes.add(slug);
  currentPath.add(slug);
  const dependencies = deps.get(slug) ?? /* @__PURE__ */ new Set();
  for (const dependency of dependencies) {
    if (!visitedNodes.has(dependency)) {
      if (hasCycle(deps, dependency, visitedNodes, currentPath)) {
        return true;
      }
    } else if (currentPath.has(dependency)) {
      return true;
    }
  }
  currentPath.delete(slug);
  return false;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parsePatternDependencies,
  registerDependency,
  useParsePatternDependencies
});
//# sourceMappingURL=recursion-detector.cjs.map
