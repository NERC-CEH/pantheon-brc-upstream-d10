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

// packages/block-library/src/video/edit-common-settings.jsx
var edit_common_settings_exports = {};
__export(edit_common_settings_exports, {
  default: () => edit_common_settings_default
});
module.exports = __toCommonJS(edit_common_settings_exports);
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_element = require("@wordpress/element");
var import_jsx_runtime = require("react/jsx-runtime");
var options = [
  { value: "auto", label: (0, import_i18n.__)("Auto") },
  { value: "metadata", label: (0, import_i18n.__)("Metadata") },
  { value: "none", label: (0, import_i18n._x)("None", "Preload value") }
];
var VideoSettings = ({ setAttributes, attributes }) => {
  const { autoplay, controls, loop, muted, playsInline, preload } = attributes;
  const autoPlayHelpText = (0, import_i18n.__)(
    "Autoplay may cause usability issues for some users."
  );
  const getAutoplayHelp = (0, import_element.useCallback)((checked) => {
    return checked ? autoPlayHelpText : null;
  }, []);
  const toggleFactory = (0, import_element.useMemo)(() => {
    const toggleAttribute = (attribute) => {
      return (newValue) => {
        setAttributes({
          [attribute]: newValue,
          // Set muted and playsInLine when autoplay changes
          // playsInline is set to true when autoplay is true to support iOS devices
          ...attribute === "autoplay" && {
            muted: newValue,
            playsInline: newValue
          }
        });
      };
    };
    return {
      autoplay: toggleAttribute("autoplay"),
      loop: toggleAttribute("loop"),
      muted: toggleAttribute("muted"),
      controls: toggleAttribute("controls"),
      playsInline: toggleAttribute("playsInline")
    };
  }, []);
  const onChangePreload = (0, import_element.useCallback)((value) => {
    setAttributes({ preload: value });
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanelItem,
      {
        label: (0, import_i18n.__)("Autoplay"),
        isShownByDefault: true,
        hasValue: () => !!autoplay,
        onDeselect: () => {
          setAttributes({ autoplay: false, muted: false });
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.ToggleControl,
          {
            label: (0, import_i18n.__)("Autoplay"),
            onChange: toggleFactory.autoplay,
            checked: !!autoplay,
            help: getAutoplayHelp
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanelItem,
      {
        label: (0, import_i18n.__)("Loop"),
        isShownByDefault: true,
        hasValue: () => !!loop,
        onDeselect: () => {
          setAttributes({ loop: false });
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.ToggleControl,
          {
            label: (0, import_i18n.__)("Loop"),
            onChange: toggleFactory.loop,
            checked: !!loop
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanelItem,
      {
        label: (0, import_i18n.__)("Muted"),
        isShownByDefault: true,
        hasValue: () => !!muted,
        onDeselect: () => {
          setAttributes({ muted: false });
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.ToggleControl,
          {
            label: (0, import_i18n.__)("Muted"),
            onChange: toggleFactory.muted,
            checked: !!muted,
            disabled: autoplay,
            help: autoplay ? (0, import_i18n.__)("Muted because of Autoplay.") : null
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanelItem,
      {
        label: (0, import_i18n.__)("Playback controls"),
        isShownByDefault: true,
        hasValue: () => !controls,
        onDeselect: () => {
          setAttributes({ controls: true });
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.ToggleControl,
          {
            label: (0, import_i18n.__)("Playback controls"),
            onChange: toggleFactory.controls,
            checked: !!controls
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanelItem,
      {
        label: (0, import_i18n.__)("Play inline"),
        isShownByDefault: true,
        hasValue: () => !!playsInline,
        onDeselect: () => {
          setAttributes({ playsInline: false });
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.ToggleControl,
          {
            label: (0, import_i18n.__)("Play inline"),
            onChange: toggleFactory.playsInline,
            checked: !!playsInline,
            disabled: autoplay,
            help: autoplay ? (0, import_i18n.__)("Play inline enabled because of Autoplay.") : (0, import_i18n.__)(
              "When enabled, videos will play directly within the webpage on mobile browsers, instead of opening in a fullscreen player."
            )
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.__experimentalToolsPanelItem,
      {
        label: (0, import_i18n.__)("Preload"),
        isShownByDefault: true,
        hasValue: () => preload !== "metadata",
        onDeselect: () => {
          setAttributes({ preload: "metadata" });
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.SelectControl,
          {
            label: (0, import_i18n.__)("Preload"),
            value: preload,
            onChange: onChangePreload,
            options,
            hideCancelButton: true
          }
        )
      }
    )
  ] });
};
var edit_common_settings_default = VideoSettings;
//# sourceMappingURL=edit-common-settings.cjs.map
