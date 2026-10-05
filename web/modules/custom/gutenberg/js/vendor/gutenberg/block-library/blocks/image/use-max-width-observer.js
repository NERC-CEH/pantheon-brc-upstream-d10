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

// packages/block-library/src/image/use-max-width-observer.jsx
var use_max_width_observer_exports = {};
__export(use_max_width_observer_exports, {
  useMaxWidthObserver: () => useMaxWidthObserver
});
module.exports = __toCommonJS(use_max_width_observer_exports);
var import_element = require("@wordpress/element");
var import_compose = require("@wordpress/compose");
var import_jsx_runtime = require("react/jsx-runtime");
function useMaxWidthObserver() {
  const [contentResizeListener, { width }] = (0, import_compose.useResizeObserver)();
  const observerRef = (0, import_element.useRef)();
  const maxWidthObserver = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: "wp-block",
      "aria-hidden": "true",
      style: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: 0,
        margin: 0
      },
      ref: observerRef,
      children: contentResizeListener
    }
  );
  return [maxWidthObserver, width];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useMaxWidthObserver
});
//# sourceMappingURL=use-max-width-observer.cjs.map
