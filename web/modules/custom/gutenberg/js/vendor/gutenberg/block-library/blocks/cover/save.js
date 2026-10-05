"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/block-library/src/cover/save.jsx
var save_exports = {};
__export(save_exports, {
  default: () => save
});
module.exports = __toCommonJS(save_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_shared = require("./shared.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
function save({ attributes }) {
  const {
    backgroundType,
    gradient,
    contentPosition,
    customGradient,
    customOverlayColor,
    dimRatio,
    focalPoint,
    useFeaturedImage,
    hasParallax,
    isDark,
    isRepeated,
    overlayColor,
    url,
    alt,
    id,
    minHeight: minHeightProp,
    minHeightUnit,
    tagName: Tag,
    sizeSlug,
    poster
  } = attributes;
  const overlayColorClass = (0, import_block_editor.getColorClassName)(
    "background-color",
    overlayColor
  );
  const gradientClass = (0, import_block_editor.__experimentalGetGradientClass)(gradient);
  const minHeight = minHeightProp && minHeightUnit ? `${minHeightProp}${minHeightUnit}` : minHeightProp;
  const isImageBackground = import_shared.IMAGE_BACKGROUND_TYPE === backgroundType;
  const isVideoBackground = import_shared.VIDEO_BACKGROUND_TYPE === backgroundType;
  const isEmbedVideoBackground = import_shared.EMBED_VIDEO_BACKGROUND_TYPE === backgroundType;
  const isImgElement = !(hasParallax || isRepeated);
  const style = {
    minHeight: minHeight || void 0
  };
  const bgStyle = {
    backgroundColor: !overlayColorClass ? customOverlayColor : void 0,
    background: customGradient ? customGradient : void 0
  };
  const objectPosition = (
    // prettier-ignore
    focalPoint && isImgElement ? (0, import_shared.mediaPosition)(focalPoint) : void 0
  );
  const backgroundImage = url ? `url(${url})` : void 0;
  const backgroundPosition = (0, import_shared.mediaPosition)(focalPoint);
  const classes = (0, import_clsx.default)(
    {
      "is-light": !isDark,
      "has-parallax": hasParallax,
      "is-repeated": isRepeated,
      "has-custom-content-position": !(0, import_shared.isContentPositionCenter)(contentPosition)
    },
    (0, import_shared.getPositionClassName)(contentPosition)
  );
  const imgClasses = (0, import_clsx.default)(
    "wp-block-cover__image-background",
    id ? `wp-image-${id}` : null,
    {
      [`size-${sizeSlug}`]: sizeSlug,
      "has-parallax": hasParallax,
      "is-repeated": isRepeated
    }
  );
  const gradientValue = gradient || customGradient;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tag, { ...import_block_editor.useBlockProps.save({ className: classes, style }), children: [
    !useFeaturedImage && isImageBackground && url && (isImgElement ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        className: imgClasses,
        alt,
        src: url,
        style: { objectPosition },
        "data-object-fit": "cover",
        "data-object-position": objectPosition
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        role: alt ? "img" : void 0,
        "aria-label": alt ? alt : void 0,
        className: imgClasses,
        style: { backgroundPosition, backgroundImage }
      }
    )),
    isVideoBackground && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "video",
      {
        className: (0, import_clsx.default)(
          "wp-block-cover__video-background",
          "intrinsic-ignore"
        ),
        autoPlay: true,
        muted: true,
        loop: true,
        playsInline: true,
        src: url,
        poster,
        style: { objectPosition },
        "data-object-fit": "cover",
        "data-object-position": objectPosition
      }
    ),
    isEmbedVideoBackground && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "figure",
      {
        className: (0, import_clsx.default)(
          "wp-block-cover__video-background",
          "wp-block-cover__embed-background",
          "wp-block-embed"
        ),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-embed__wrapper", children: url })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "span",
      {
        "aria-hidden": "true",
        className: (0, import_clsx.default)(
          "wp-block-cover__background",
          overlayColorClass,
          (0, import_shared.dimRatioToClass)(dimRatio),
          {
            "has-background-dim": dimRatio !== void 0,
            // For backwards compatibility. Former versions of the Cover Block applied
            // `.wp-block-cover__gradient-background` in the presence of
            // media, a gradient and a dim.
            "wp-block-cover__gradient-background": url && gradientValue && dimRatio !== 0,
            "has-background-gradient": gradientValue,
            [gradientClass]: gradientClass
          }
        ),
        style: bgStyle
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        ...import_block_editor.useInnerBlocksProps.save({
          className: "wp-block-cover__inner-container"
        })
      }
    )
  ] });
}
//# sourceMappingURL=save.cjs.map
