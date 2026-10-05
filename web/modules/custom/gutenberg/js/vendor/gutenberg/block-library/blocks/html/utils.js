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

// packages/block-library/src/html/utils.js
var utils_exports = {};
__export(utils_exports, {
  parseContent: () => parseContent,
  serializeContent: () => serializeContent
});
module.exports = __toCommonJS(utils_exports);
function parseContent(content = "") {
  if (!content || !content.trim()) {
    return { html: "", css: "", js: "" };
  }
  const doc = document.implementation.createHTMLDocument("");
  doc.body.innerHTML = content;
  const styleTag = doc.body.querySelector(
    'style[data-wp-block-html="css"]'
  );
  const css = styleTag ? styleTag.textContent.trim() : "";
  if (styleTag) {
    styleTag.remove();
  }
  const scriptTag = doc.body.querySelector(
    'script[data-wp-block-html="js"]'
  );
  const js = scriptTag ? scriptTag.textContent.trim() : "";
  if (scriptTag) {
    scriptTag.remove();
  }
  const html = doc.body.innerHTML.trim();
  return { html, css, js };
}
function serializeContent({ html = "", css = "", js = "" }) {
  const parts = [];
  if (css.trim()) {
    parts.push(`<style data-wp-block-html="css">
${css}
</style>`);
  }
  if (js.trim()) {
    parts.push(`<script data-wp-block-html="js">
${js}
</script>`);
  }
  if (html.trim()) {
    parts.push(html);
  }
  return parts.join("\n\n");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseContent,
  serializeContent
});
//# sourceMappingURL=utils.cjs.map
