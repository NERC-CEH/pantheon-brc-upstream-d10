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

// packages/block-library/src/image/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_utils = require("./utils.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var v1 = {
  attributes: {
    url: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "src"
    },
    alt: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "alt",
      default: ""
    },
    caption: {
      type: "array",
      source: "children",
      selector: "figcaption"
    },
    href: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "href"
    },
    id: {
      type: "number"
    },
    align: {
      type: "string"
    },
    width: {
      type: "number"
    },
    height: {
      type: "number"
    }
  },
  save({ attributes }) {
    const { url, alt, caption, align, href, width, height } = attributes;
    const extraImageProps = width || height ? { width, height } : {};
    const image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: url, alt, ...extraImageProps });
    let figureStyle = {};
    if (width) {
      figureStyle = { width };
    } else if (align === "left" || align === "right") {
      figureStyle = { maxWidth: "50%" };
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "figure",
      {
        className: align ? `align${align}` : null,
        style: figureStyle,
        children: [
          href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href, children: image }) : image,
          !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "figcaption", value: caption })
        ]
      }
    );
  }
};
var v2 = {
  attributes: {
    url: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "src"
    },
    alt: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "alt",
      default: ""
    },
    caption: {
      type: "array",
      source: "children",
      selector: "figcaption"
    },
    href: {
      type: "string",
      source: "attribute",
      selector: "a",
      attribute: "href"
    },
    id: {
      type: "number"
    },
    align: {
      type: "string"
    },
    width: {
      type: "number"
    },
    height: {
      type: "number"
    }
  },
  save({ attributes }) {
    const { url, alt, caption, align, href, width, height, id } = attributes;
    const image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: url,
        alt,
        className: id ? `wp-image-${id}` : null,
        width,
        height
      }
    );
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { className: align ? `align${align}` : null, children: [
      href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href, children: image }) : image,
      !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "figcaption", value: caption })
    ] });
  }
};
var v3 = {
  attributes: {
    url: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "src"
    },
    alt: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "alt",
      default: ""
    },
    caption: {
      type: "array",
      source: "children",
      selector: "figcaption"
    },
    href: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "href"
    },
    id: {
      type: "number"
    },
    align: {
      type: "string"
    },
    width: {
      type: "number"
    },
    height: {
      type: "number"
    },
    linkDestination: {
      type: "string",
      default: "none"
    }
  },
  save({ attributes }) {
    const { url, alt, caption, align, href, width, height, id } = attributes;
    const classes = (0, import_clsx.default)({
      [`align${align}`]: align,
      "is-resized": width || height
    });
    const image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: url,
        alt,
        className: id ? `wp-image-${id}` : null,
        width,
        height
      }
    );
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { className: classes, children: [
      href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href, children: image }) : image,
      !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "figcaption", value: caption })
    ] });
  }
};
var v4 = {
  attributes: {
    align: {
      type: "string"
    },
    url: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "src"
    },
    alt: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "alt",
      default: ""
    },
    caption: {
      type: "string",
      source: "html",
      selector: "figcaption"
    },
    title: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "title"
    },
    href: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "href"
    },
    rel: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "rel"
    },
    linkClass: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "class"
    },
    id: {
      type: "number"
    },
    width: {
      type: "number"
    },
    height: {
      type: "number"
    },
    sizeSlug: {
      type: "string"
    },
    linkDestination: {
      type: "string"
    },
    linkTarget: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "target"
    }
  },
  supports: {
    anchor: true
  },
  save({ attributes }) {
    const {
      url,
      alt,
      caption,
      align,
      href,
      rel,
      linkClass,
      width,
      height,
      id,
      linkTarget,
      sizeSlug,
      title
    } = attributes;
    const newRel = !rel ? void 0 : rel;
    const classes = (0, import_clsx.default)({
      [`align${align}`]: align,
      [`size-${sizeSlug}`]: sizeSlug,
      "is-resized": width || height
    });
    const image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: url,
        alt,
        className: id ? `wp-image-${id}` : null,
        width,
        height,
        title
      }
    );
    const figure = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          className: linkClass,
          href,
          target: linkTarget,
          rel: newRel,
          children: image
        }
      ) : image,
      !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "figcaption", value: caption })
    ] });
    if ("left" === align || "right" === align || "center" === align) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...import_block_editor.useBlockProps.save(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", { className: classes, children: figure }) });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", { ...import_block_editor.useBlockProps.save({ className: classes }), children: figure });
  }
};
var v5 = {
  attributes: {
    align: {
      type: "string"
    },
    url: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "src"
    },
    alt: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "alt",
      default: ""
    },
    caption: {
      type: "string",
      source: "html",
      selector: "figcaption"
    },
    title: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "title"
    },
    href: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "href"
    },
    rel: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "rel"
    },
    linkClass: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "class"
    },
    id: {
      type: "number"
    },
    width: {
      type: "number"
    },
    height: {
      type: "number"
    },
    sizeSlug: {
      type: "string"
    },
    linkDestination: {
      type: "string"
    },
    linkTarget: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "target"
    }
  },
  supports: {
    anchor: true,
    color: {
      __experimentalDuotone: "img",
      text: false,
      background: false
    },
    __experimentalBorder: {
      radius: true,
      __experimentalDefaultControls: {
        radius: true
      }
    },
    __experimentalStyle: {
      spacing: {
        margin: "0 0 1em 0"
      }
    }
  },
  save({ attributes }) {
    const {
      url,
      alt,
      caption,
      align,
      href,
      rel,
      linkClass,
      width,
      height,
      id,
      linkTarget,
      sizeSlug,
      title
    } = attributes;
    const newRel = !rel ? void 0 : rel;
    const classes = (0, import_clsx.default)({
      [`align${align}`]: align,
      [`size-${sizeSlug}`]: sizeSlug,
      "is-resized": width || height
    });
    const image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: url,
        alt,
        className: id ? `wp-image-${id}` : null,
        width,
        height,
        title
      }
    );
    const figure = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          className: linkClass,
          href,
          target: linkTarget,
          rel: newRel,
          children: image
        }
      ) : image,
      !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.RichText.Content, { tagName: "figcaption", value: caption })
    ] });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", { ...import_block_editor.useBlockProps.save({ className: classes }), children: figure });
  }
};
var v6 = {
  attributes: {
    align: {
      type: "string"
    },
    url: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "src",
      role: "content"
    },
    alt: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "alt",
      default: "",
      role: "content"
    },
    caption: {
      type: "string",
      source: "html",
      selector: "figcaption",
      role: "content"
    },
    title: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "title",
      role: "content"
    },
    href: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "href",
      role: "content"
    },
    rel: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "rel"
    },
    linkClass: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "class"
    },
    id: {
      type: "number",
      role: "content"
    },
    width: {
      type: "number"
    },
    height: {
      type: "number"
    },
    aspectRatio: {
      type: "string"
    },
    scale: {
      type: "string"
    },
    sizeSlug: {
      type: "string"
    },
    linkDestination: {
      type: "string"
    },
    linkTarget: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "target"
    }
  },
  supports: {
    anchor: true,
    color: {
      text: false,
      background: false
    },
    filter: {
      duotone: true
    },
    __experimentalBorder: {
      color: true,
      radius: true,
      width: true,
      __experimentalSkipSerialization: true,
      __experimentalDefaultControls: {
        color: true,
        radius: true,
        width: true
      }
    }
  },
  migrate(attributes) {
    const { height, width } = attributes;
    return {
      ...attributes,
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height
    };
  },
  save({ attributes }) {
    const {
      url,
      alt,
      caption,
      align,
      href,
      rel,
      linkClass,
      width,
      height,
      aspectRatio,
      scale,
      id,
      linkTarget,
      sizeSlug,
      title
    } = attributes;
    const newRel = !rel ? void 0 : rel;
    const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
    const classes = (0, import_clsx.default)({
      [`align${align}`]: align,
      [`size-${sizeSlug}`]: sizeSlug,
      "is-resized": width || height,
      "has-custom-border": !!borderProps.className || borderProps.style && Object.keys(borderProps.style).length > 0
    });
    const imageClasses = (0, import_clsx.default)(borderProps.className, {
      [`wp-image-${id}`]: !!id
    });
    const image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: url,
        alt,
        className: imageClasses || void 0,
        style: {
          ...borderProps.style,
          aspectRatio,
          objectFit: scale
        },
        width,
        height,
        title
      }
    );
    const figure = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          className: linkClass,
          href,
          target: linkTarget,
          rel: newRel,
          children: image
        }
      ) : image,
      !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          className: (0, import_block_editor.__experimentalGetElementClassName)(
            "caption"
          ),
          tagName: "figcaption",
          value: caption
        }
      )
    ] });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", { ...import_block_editor.useBlockProps.save({ className: classes }), children: figure });
  }
};
var v7 = {
  attributes: {
    align: {
      type: "string"
    },
    url: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "src",
      role: "content"
    },
    alt: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "alt",
      default: "",
      role: "content"
    },
    caption: {
      type: "string",
      source: "html",
      selector: "figcaption",
      role: "content"
    },
    title: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "title",
      role: "content"
    },
    href: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "href",
      role: "content"
    },
    rel: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "rel"
    },
    linkClass: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "class"
    },
    id: {
      type: "number",
      role: "content"
    },
    width: {
      type: "number"
    },
    height: {
      type: "number"
    },
    aspectRatio: {
      type: "string"
    },
    scale: {
      type: "string"
    },
    sizeSlug: {
      type: "string"
    },
    linkDestination: {
      type: "string"
    },
    linkTarget: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "target"
    }
  },
  supports: {
    anchor: true,
    color: {
      text: false,
      background: false
    },
    filter: {
      duotone: true
    },
    __experimentalBorder: {
      color: true,
      radius: true,
      width: true,
      __experimentalSkipSerialization: true,
      __experimentalDefaultControls: {
        color: true,
        radius: true,
        width: true
      }
    }
  },
  migrate(attributes) {
    const { width, height } = attributes;
    return {
      ...attributes,
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height
    };
  },
  save({ attributes }) {
    const {
      url,
      alt,
      caption,
      align,
      href,
      rel,
      linkClass,
      width,
      height,
      aspectRatio,
      scale,
      id,
      linkTarget,
      sizeSlug,
      title
    } = attributes;
    const newRel = !rel ? void 0 : rel;
    const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
    const classes = (0, import_clsx.default)({
      [`align${align}`]: align,
      [`size-${sizeSlug}`]: sizeSlug,
      "is-resized": width || height,
      "has-custom-border": !!borderProps.className || borderProps.style && Object.keys(borderProps.style).length > 0
    });
    const imageClasses = (0, import_clsx.default)(borderProps.className, {
      [`wp-image-${id}`]: !!id
    });
    const image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: url,
        alt,
        className: imageClasses || void 0,
        style: {
          ...borderProps.style,
          aspectRatio,
          objectFit: scale,
          width,
          height
        },
        width,
        height,
        title
      }
    );
    const figure = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          className: linkClass,
          href,
          target: linkTarget,
          rel: newRel,
          children: image
        }
      ) : image,
      !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          className: (0, import_block_editor.__experimentalGetElementClassName)(
            "caption"
          ),
          tagName: "figcaption",
          value: caption
        }
      )
    ] });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", { ...import_block_editor.useBlockProps.save({ className: classes }), children: figure });
  }
};
var v8 = {
  attributes: {
    align: {
      type: "string"
    },
    behaviors: {
      type: "object"
    },
    url: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "src",
      role: "content"
    },
    alt: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "alt",
      default: "",
      role: "content"
    },
    caption: {
      type: "string",
      source: "html",
      selector: "figcaption",
      role: "content"
    },
    title: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "title",
      role: "content"
    },
    href: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "href",
      role: "content"
    },
    rel: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "rel"
    },
    linkClass: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "class"
    },
    id: {
      type: "number",
      role: "content"
    },
    width: {
      type: "string"
    },
    height: {
      type: "string"
    },
    aspectRatio: {
      type: "string"
    },
    scale: {
      type: "string"
    },
    sizeSlug: {
      type: "string"
    },
    linkDestination: {
      type: "string"
    },
    linkTarget: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "target"
    }
  },
  supports: {
    anchor: true,
    color: {
      text: false,
      background: false
    },
    filter: {
      duotone: true
    },
    __experimentalBorder: {
      color: true,
      radius: true,
      width: true,
      __experimentalSkipSerialization: true,
      __experimentalDefaultControls: {
        color: true,
        radius: true,
        width: true
      }
    }
  },
  migrate({ width, height, ...attributes }) {
    if (!attributes.behaviors?.lightbox) {
      return attributes;
    }
    const {
      behaviors: {
        lightbox: { enabled }
      }
    } = attributes;
    const newAttributes = {
      ...attributes,
      lightbox: {
        enabled
      }
    };
    delete newAttributes.behaviors;
    return newAttributes;
  },
  isEligible(attributes) {
    return !!attributes.behaviors;
  },
  save({ attributes }) {
    const {
      url,
      alt,
      caption,
      align,
      href,
      rel,
      linkClass,
      width,
      height,
      aspectRatio,
      scale,
      id,
      linkTarget,
      sizeSlug,
      title
    } = attributes;
    const newRel = !rel ? void 0 : rel;
    const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
    const classes = (0, import_clsx.default)({
      [`align${align}`]: align,
      [`size-${sizeSlug}`]: sizeSlug,
      "is-resized": width || height,
      "has-custom-border": !!borderProps.className || borderProps.style && Object.keys(borderProps.style).length > 0
    });
    const imageClasses = (0, import_clsx.default)(borderProps.className, {
      [`wp-image-${id}`]: !!id
    });
    const image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: url,
        alt,
        className: imageClasses || void 0,
        style: {
          ...borderProps.style,
          aspectRatio,
          objectFit: scale,
          width,
          height
        },
        title
      }
    );
    const figure = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          className: linkClass,
          href,
          target: linkTarget,
          rel: newRel,
          children: image
        }
      ) : image,
      !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          className: (0, import_block_editor.__experimentalGetElementClassName)(
            "caption"
          ),
          tagName: "figcaption",
          value: caption
        }
      )
    ] });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", { ...import_block_editor.useBlockProps.save({ className: classes }), children: figure });
  }
};
var v9 = {
  attributes: {
    blob: {
      type: "string",
      role: "local"
    },
    url: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "src",
      role: "content"
    },
    alt: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "alt",
      default: "",
      role: "content"
    },
    caption: {
      type: "rich-text",
      source: "rich-text",
      selector: "figcaption",
      role: "content"
    },
    lightbox: {
      type: "object",
      enabled: {
        type: "boolean"
      }
    },
    title: {
      type: "string",
      source: "attribute",
      selector: "img",
      attribute: "title",
      role: "content"
    },
    href: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "href",
      role: "content"
    },
    rel: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "rel"
    },
    linkClass: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "class"
    },
    id: {
      type: "number",
      role: "content"
    },
    width: {
      type: "string"
    },
    height: {
      type: "string"
    },
    aspectRatio: {
      type: "string"
    },
    scale: {
      type: "string"
    },
    focalPoint: {
      type: "object"
    },
    sizeSlug: {
      type: "string"
    },
    linkDestination: {
      type: "string"
    },
    linkTarget: {
      type: "string",
      source: "attribute",
      selector: "figure > a",
      attribute: "target"
    }
  },
  supports: {
    interactivity: true,
    align: ["left", "center", "right", "wide", "full"],
    anchor: true,
    color: {
      text: false,
      background: false
    },
    filter: {
      duotone: true
    },
    spacing: {
      margin: true
    },
    __experimentalBorder: {
      color: true,
      radius: true,
      width: true,
      __experimentalSkipSerialization: true,
      __experimentalDefaultControls: {
        color: true,
        radius: true,
        width: true
      }
    },
    shadow: {
      __experimentalSkipSerialization: true
    }
  },
  save({ attributes }) {
    const {
      url,
      alt,
      caption,
      align,
      href,
      rel,
      linkClass,
      width,
      height,
      aspectRatio,
      scale,
      focalPoint,
      id,
      linkTarget,
      sizeSlug,
      title,
      metadata: { bindings = {} } = {}
    } = attributes;
    const newRel = !rel ? void 0 : rel;
    const borderProps = (0, import_block_editor.__experimentalGetBorderClassesAndStyles)(attributes);
    const shadowProps = (0, import_block_editor.__experimentalGetShadowClassesAndStyles)(attributes);
    const classes = (0, import_clsx.default)({
      alignnone: "none" === align,
      [`size-${sizeSlug}`]: sizeSlug,
      "is-resized": width || height,
      "has-custom-border": !!borderProps.className || borderProps.style && Object.keys(borderProps.style).length > 0
    });
    const imageClasses = (0, import_clsx.default)(borderProps.className, {
      [`wp-image-${id}`]: !!id
    });
    const image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: url,
        alt,
        className: imageClasses || void 0,
        style: {
          ...borderProps.style,
          ...shadowProps.style,
          aspectRatio,
          objectFit: scale,
          objectPosition: focalPoint && scale ? (0, import_utils.mediaPosition)(focalPoint) : void 0,
          width,
          height
        },
        title
      }
    );
    const displayCaption = !import_block_editor.RichText.isEmpty(caption) || bindings.caption || bindings?.__default?.source === "core/pattern-overrides";
    const figure = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "a",
        {
          className: linkClass,
          href,
          target: linkTarget,
          rel: newRel,
          children: image
        }
      ) : image,
      displayCaption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          className: (0, import_block_editor.__experimentalGetElementClassName)(
            "caption"
          ),
          tagName: "figcaption",
          value: caption
        }
      )
    ] });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", { ...import_block_editor.useBlockProps.save({ className: classes }), children: figure });
  }
};
var deprecated_default = [v9, v8, v7, v6, v5, v4, v3, v2, v1];
//# sourceMappingURL=deprecated.cjs.map
