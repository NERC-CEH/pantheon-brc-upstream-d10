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

// packages/block-library/src/navigation-link/variations.js
var variations_exports = {};
__export(variations_exports, {
  default: () => variations_default
});
module.exports = __toCommonJS(variations_exports);
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var variations = [
  {
    name: "custom-link",
    title: (0, import_i18n.__)("Custom Link"),
    description: (0, import_i18n.__)("Add a custom link to your navigation."),
    icon: import_icons.customLink,
    attributes: {
      kind: "custom"
    },
    isActive: (blockAttributes) => blockAttributes.kind === "custom",
    isDefault: true,
    scope: ["inserter"]
  }
];
var variations_default = variations;
//# sourceMappingURL=variations.cjs.map
