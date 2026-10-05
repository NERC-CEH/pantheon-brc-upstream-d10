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

// packages/block-library/src/embed/wp-embed-preview.jsx
var wp_embed_preview_exports = {};
__export(wp_embed_preview_exports, {
  default: () => WpEmbedPreview
});
module.exports = __toCommonJS(wp_embed_preview_exports);
var import_compose = require("@wordpress/compose");
var import_element = require("@wordpress/element");
var import_jsx_runtime = require("react/jsx-runtime");
var attributeMap = {
  class: "className",
  frameborder: "frameBorder",
  marginheight: "marginHeight",
  marginwidth: "marginWidth"
};
function WpEmbedPreview({ html }) {
  const ref = (0, import_element.useRef)();
  const props = (0, import_element.useMemo)(() => {
    const doc = new window.DOMParser().parseFromString(html, "text/html");
    const iframe = doc.querySelector("iframe");
    const iframeProps = {};
    if (!iframe) {
      return iframeProps;
    }
    Array.from(iframe.attributes).forEach(({ name, value }) => {
      if (name === "style") {
        return;
      }
      iframeProps[attributeMap[name] || name] = value;
    });
    return iframeProps;
  }, [html]);
  (0, import_element.useEffect)(() => {
    const { ownerDocument } = ref.current;
    const { defaultView } = ownerDocument;
    function resizeWPembeds({ data: { secret, message, value } = {} }) {
      if (message !== "height" || secret !== props["data-secret"]) {
        return;
      }
      ref.current.height = value;
    }
    defaultView.addEventListener("message", resizeWPembeds);
    return () => {
      defaultView.removeEventListener("message", resizeWPembeds);
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-embed__wrapper", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "iframe",
    {
      ref: (0, import_compose.useMergeRefs)([ref, (0, import_compose.useFocusableIframe)()]),
      title: props.title,
      ...props
    }
  ) });
}
//# sourceMappingURL=wp-embed-preview.cjs.map
