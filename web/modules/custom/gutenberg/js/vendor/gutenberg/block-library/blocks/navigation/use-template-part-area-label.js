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

// packages/block-library/src/navigation/use-template-part-area-label.js
var use_template_part_area_label_exports = {};
__export(use_template_part_area_label_exports, {
  default: () => useTemplatePartAreaLabel
});
module.exports = __toCommonJS(use_template_part_area_label_exports);
var import_block_editor = require("@wordpress/block-editor");
var import_core_data = require("@wordpress/core-data");
var import_data = require("@wordpress/data");
var import_create_template_part_id = require("../template-part/edit/utils/create-template-part-id.cjs");
var import_get_template_part_icon = require("../template-part/edit/utils/get-template-part-icon.cjs");
function useTemplatePartAreaLabel(clientId) {
  return (0, import_data.useSelect)(
    (select) => {
      if (!clientId) {
        return;
      }
      const { getBlock, getBlockParentsByBlockName } = select(import_block_editor.store);
      const withAscendingResults = true;
      const parentTemplatePartClientIds = getBlockParentsByBlockName(
        clientId,
        "core/template-part",
        withAscendingResults
      );
      if (!parentTemplatePartClientIds?.length) {
        return;
      }
      const { getCurrentTheme, getEditedEntityRecord } = select(import_core_data.store);
      const currentTheme = getCurrentTheme();
      const defaultTemplatePartAreas = currentTheme?.default_template_part_areas || [];
      const definedAreas = defaultTemplatePartAreas.map((item) => ({
        ...item,
        icon: (0, import_get_template_part_icon.getTemplatePartIcon)(item.icon)
      }));
      for (const templatePartClientId of parentTemplatePartClientIds) {
        const templatePartBlock = getBlock(templatePartClientId);
        const { theme = currentTheme?.stylesheet, slug } = templatePartBlock.attributes;
        const templatePartEntityId = (0, import_create_template_part_id.createTemplatePartId)(
          theme,
          slug
        );
        const templatePartEntity = getEditedEntityRecord(
          "postType",
          "wp_template_part",
          templatePartEntityId
        );
        if (templatePartEntity?.area) {
          return definedAreas.find(
            (definedArea) => definedArea.area !== "uncategorized" && definedArea.area === templatePartEntity.area
          )?.label;
        }
      }
    },
    [clientId]
  );
}
//# sourceMappingURL=use-template-part-area-label.cjs.map
