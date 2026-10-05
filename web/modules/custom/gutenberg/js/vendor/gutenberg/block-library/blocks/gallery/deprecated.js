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

// packages/block-library/src/gallery/deprecated.jsx
var deprecated_exports = {};
__export(deprecated_exports, {
  default: () => deprecated_default,
  defaultColumnsNumberV1: () => defaultColumnsNumberV1,
  getHrefAndDestination: () => getHrefAndDestination,
  getImageBlock: () => getImageBlock
});
module.exports = __toCommonJS(deprecated_exports);
var import_clsx = __toESM(require("clsx"));
var import_block_editor = require("@wordpress/block-editor");
var import_blocks = require("@wordpress/blocks");
var import_constants = require("./constants.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var DEPRECATED_LINK_DESTINATION_MEDIA = "file";
var DEPRECATED_LINK_DESTINATION_ATTACHMENT = "post";
function defaultColumnsNumberV1(attributes) {
  return Math.min(3, attributes?.images?.length);
}
function getHrefAndDestination(image, destination) {
  switch (destination) {
    case DEPRECATED_LINK_DESTINATION_MEDIA:
      return {
        href: image?.source_url || image?.url,
        linkDestination: import_constants.LINK_DESTINATION_MEDIA
      };
    case DEPRECATED_LINK_DESTINATION_ATTACHMENT:
      return {
        href: image?.link,
        linkDestination: import_constants.LINK_DESTINATION_ATTACHMENT
      };
    case import_constants.LINK_DESTINATION_MEDIA:
      return {
        href: image?.source_url || image?.url,
        linkDestination: import_constants.LINK_DESTINATION_MEDIA
      };
    case import_constants.LINK_DESTINATION_ATTACHMENT:
      return {
        href: image?.link,
        linkDestination: import_constants.LINK_DESTINATION_ATTACHMENT
      };
    case import_constants.LINK_DESTINATION_NONE:
      return {
        href: void 0,
        linkDestination: import_constants.LINK_DESTINATION_NONE
      };
  }
  return {};
}
function runV2Migration(attributes) {
  let linkTo = attributes.linkTo ? attributes.linkTo : "none";
  if (linkTo === "post") {
    linkTo = "attachment";
  } else if (linkTo === "file") {
    linkTo = "media";
  }
  const imageBlocks = attributes.images.map((image) => {
    return getImageBlock(image, attributes.sizeSlug, linkTo);
  });
  const { images, ids, ...restAttributes } = attributes;
  return [
    {
      ...restAttributes,
      linkTo,
      allowResize: false
    },
    imageBlocks
  ];
}
function getImageBlock(image, sizeSlug, linkTo) {
  return (0, import_blocks.createBlock)("core/image", {
    ...image.id && { id: parseInt(image.id) },
    url: image.url,
    alt: image.alt,
    caption: image.caption,
    sizeSlug,
    ...getHrefAndDestination(image, linkTo)
  });
}
var v7 = {
  attributes: {
    images: {
      type: "array",
      default: [],
      source: "query",
      selector: ".blocks-gallery-item",
      query: {
        url: {
          type: "string",
          source: "attribute",
          selector: "img",
          attribute: "src"
        },
        fullUrl: {
          type: "string",
          source: "attribute",
          selector: "img",
          attribute: "data-full-url"
        },
        link: {
          type: "string",
          source: "attribute",
          selector: "img",
          attribute: "data-link"
        },
        alt: {
          type: "string",
          source: "attribute",
          selector: "img",
          attribute: "alt",
          default: ""
        },
        id: {
          type: "string",
          source: "attribute",
          selector: "img",
          attribute: "data-id"
        },
        caption: {
          type: "string",
          source: "html",
          selector: ".blocks-gallery-item__caption"
        }
      }
    },
    ids: {
      type: "array",
      items: {
        type: "number"
      },
      default: []
    },
    shortCodeTransforms: {
      type: "array",
      default: [],
      items: {
        type: "object"
      }
    },
    columns: {
      type: "number",
      minimum: 1,
      maximum: 8
    },
    caption: {
      type: "string",
      source: "html",
      selector: ".blocks-gallery-caption"
    },
    imageCrop: {
      type: "boolean",
      default: true
    },
    fixedHeight: {
      type: "boolean",
      default: true
    },
    linkTarget: {
      type: "string"
    },
    linkTo: {
      type: "string"
    },
    sizeSlug: {
      type: "string",
      default: "large"
    },
    allowResize: {
      type: "boolean",
      default: false
    }
  },
  save({ attributes }) {
    const { caption, columns, imageCrop } = attributes;
    const className = (0, import_clsx.default)("has-nested-images", {
      [`columns-${columns}`]: columns !== void 0,
      [`columns-default`]: columns === void 0,
      "is-cropped": imageCrop
    });
    const blockProps = import_block_editor.useBlockProps.save({ className });
    const innerBlocksProps = import_block_editor.useInnerBlocksProps.save(blockProps);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...innerBlocksProps, children: [
      innerBlocksProps.children,
      !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          tagName: "figcaption",
          className: "blocks-gallery-caption",
          value: caption
        }
      )
    ] });
  }
};
var v6 = {
  attributes: {
    images: {
      type: "array",
      default: [],
      source: "query",
      selector: ".blocks-gallery-item",
      query: {
        url: {
          type: "string",
          source: "attribute",
          selector: "img",
          attribute: "src"
        },
        fullUrl: {
          type: "string",
          source: "attribute",
          selector: "img",
          attribute: "data-full-url"
        },
        link: {
          type: "string",
          source: "attribute",
          selector: "img",
          attribute: "data-link"
        },
        alt: {
          type: "string",
          source: "attribute",
          selector: "img",
          attribute: "alt",
          default: ""
        },
        id: {
          type: "string",
          source: "attribute",
          selector: "img",
          attribute: "data-id"
        },
        caption: {
          type: "string",
          source: "html",
          selector: ".blocks-gallery-item__caption"
        }
      }
    },
    ids: {
      type: "array",
      items: {
        type: "number"
      },
      default: []
    },
    columns: {
      type: "number",
      minimum: 1,
      maximum: 8
    },
    caption: {
      type: "string",
      source: "html",
      selector: ".blocks-gallery-caption"
    },
    imageCrop: {
      type: "boolean",
      default: true
    },
    fixedHeight: {
      type: "boolean",
      default: true
    },
    linkTo: {
      type: "string"
    },
    sizeSlug: {
      type: "string",
      default: "large"
    }
  },
  supports: {
    anchor: true,
    align: true
  },
  save({ attributes }) {
    const {
      images,
      columns = defaultColumnsNumberV1(attributes),
      imageCrop,
      caption,
      linkTo
    } = attributes;
    const className = `columns-${columns} ${imageCrop ? "is-cropped" : ""}`;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...import_block_editor.useBlockProps.save({ className }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "blocks-gallery-grid", children: images.map((image) => {
        let href;
        switch (linkTo) {
          case DEPRECATED_LINK_DESTINATION_MEDIA:
            href = image.fullUrl || image.url;
            break;
          case DEPRECATED_LINK_DESTINATION_ATTACHMENT:
            href = image.link;
            break;
        }
        const img = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "img",
          {
            src: image.url,
            alt: image.alt,
            "data-id": image.id,
            "data-full-url": image.fullUrl,
            "data-link": image.link,
            className: image.id ? `wp-image-${image.id}` : null
          }
        );
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "li",
          {
            className: "blocks-gallery-item",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { children: [
              href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href, children: img }) : img,
              !import_block_editor.RichText.isEmpty(image.caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_block_editor.RichText.Content,
                {
                  tagName: "figcaption",
                  className: "blocks-gallery-item__caption",
                  value: image.caption
                }
              )
            ] })
          },
          image.id || image.url
        );
      }) }),
      !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.RichText.Content,
        {
          tagName: "figcaption",
          className: "blocks-gallery-caption",
          value: caption
        }
      )
    ] });
  },
  migrate(attributes) {
    return runV2Migration(attributes);
  }
};
var v5 = {
  attributes: {
    images: {
      type: "array",
      default: [],
      source: "query",
      selector: ".blocks-gallery-item",
      query: {
        url: {
          type: "string",
          source: "attribute",
          selector: "img",
          attribute: "src"
        },
        fullUrl: {
          type: "string",
          source: "attribute",
          selector: "img",
          attribute: "data-full-url"
        },
        link: {
          type: "string",
          source: "attribute",
          selector: "img",
          attribute: "data-link"
        },
        alt: {
          type: "string",
          source: "attribute",
          selector: "img",
          attribute: "alt",
          default: ""
        },
        id: {
          type: "string",
          source: "attribute",
          selector: "img",
          attribute: "data-id"
        },
        caption: {
          type: "string",
          source: "html",
          selector: ".blocks-gallery-item__caption"
        }
      }
    },
    ids: {
      type: "array",
      items: {
        type: "number"
      },
      default: []
    },
    columns: {
      type: "number",
      minimum: 1,
      maximum: 8
    },
    caption: {
      type: "string",
      source: "html",
      selector: ".blocks-gallery-caption"
    },
    imageCrop: {
      type: "boolean",
      default: true
    },
    linkTo: {
      type: "string",
      default: "none"
    },
    sizeSlug: {
      type: "string",
      default: "large"
    }
  },
  supports: {
    align: true
  },
  isEligible({ linkTo }) {
    return !linkTo || linkTo === "attachment" || linkTo === "media";
  },
  migrate(attributes) {
    return runV2Migration(attributes);
  },
  save({ attributes }) {
    const {
      images,
      columns = defaultColumnsNumberV1(attributes),
      imageCrop,
      caption,
      linkTo
    } = attributes;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "figure",
      {
        className: `columns-${columns} ${imageCrop ? "is-cropped" : ""}`,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "blocks-gallery-grid", children: images.map((image) => {
            let href;
            switch (linkTo) {
              case "media":
                href = image.fullUrl || image.url;
                break;
              case "attachment":
                href = image.link;
                break;
            }
            const img = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "img",
              {
                src: image.url,
                alt: image.alt,
                "data-id": image.id,
                "data-full-url": image.fullUrl,
                "data-link": image.link,
                className: image.id ? `wp-image-${image.id}` : null
              }
            );
            return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "li",
              {
                className: "blocks-gallery-item",
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { children: [
                  href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href, children: img }) : img,
                  !import_block_editor.RichText.isEmpty(image.caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    import_block_editor.RichText.Content,
                    {
                      tagName: "figcaption",
                      className: "blocks-gallery-item__caption",
                      value: image.caption
                    }
                  )
                ] })
              },
              image.id || image.url
            );
          }) }),
          !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.RichText.Content,
            {
              tagName: "figcaption",
              className: "blocks-gallery-caption",
              value: caption
            }
          )
        ]
      }
    );
  }
};
var v4 = {
  attributes: {
    images: {
      type: "array",
      default: [],
      source: "query",
      selector: ".blocks-gallery-item",
      query: {
        url: {
          source: "attribute",
          selector: "img",
          attribute: "src"
        },
        fullUrl: {
          source: "attribute",
          selector: "img",
          attribute: "data-full-url"
        },
        link: {
          source: "attribute",
          selector: "img",
          attribute: "data-link"
        },
        alt: {
          source: "attribute",
          selector: "img",
          attribute: "alt",
          default: ""
        },
        id: {
          source: "attribute",
          selector: "img",
          attribute: "data-id"
        },
        caption: {
          type: "string",
          source: "html",
          selector: ".blocks-gallery-item__caption"
        }
      }
    },
    ids: {
      type: "array",
      default: []
    },
    columns: {
      type: "number"
    },
    caption: {
      type: "string",
      source: "html",
      selector: ".blocks-gallery-caption"
    },
    imageCrop: {
      type: "boolean",
      default: true
    },
    linkTo: {
      type: "string",
      default: "none"
    }
  },
  supports: {
    align: true
  },
  isEligible({ ids }) {
    return ids && ids.some((id) => typeof id === "string");
  },
  migrate(attributes) {
    return runV2Migration(attributes);
  },
  save({ attributes }) {
    const {
      images,
      columns = defaultColumnsNumberV1(attributes),
      imageCrop,
      caption,
      linkTo
    } = attributes;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "figure",
      {
        className: `columns-${columns} ${imageCrop ? "is-cropped" : ""}`,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "blocks-gallery-grid", children: images.map((image) => {
            let href;
            switch (linkTo) {
              case "media":
                href = image.fullUrl || image.url;
                break;
              case "attachment":
                href = image.link;
                break;
            }
            const img = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "img",
              {
                src: image.url,
                alt: image.alt,
                "data-id": image.id,
                "data-full-url": image.fullUrl,
                "data-link": image.link,
                className: image.id ? `wp-image-${image.id}` : null
              }
            );
            return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "li",
              {
                className: "blocks-gallery-item",
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { children: [
                  href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href, children: img }) : img,
                  !import_block_editor.RichText.isEmpty(image.caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    import_block_editor.RichText.Content,
                    {
                      tagName: "figcaption",
                      className: "blocks-gallery-item__caption",
                      value: image.caption
                    }
                  )
                ] })
              },
              image.id || image.url
            );
          }) }),
          !import_block_editor.RichText.isEmpty(caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.RichText.Content,
            {
              tagName: "figcaption",
              className: "blocks-gallery-caption",
              value: caption
            }
          )
        ]
      }
    );
  }
};
var v3 = {
  attributes: {
    images: {
      type: "array",
      default: [],
      source: "query",
      selector: "ul.wp-block-gallery .blocks-gallery-item",
      query: {
        url: {
          source: "attribute",
          selector: "img",
          attribute: "src"
        },
        fullUrl: {
          source: "attribute",
          selector: "img",
          attribute: "data-full-url"
        },
        alt: {
          source: "attribute",
          selector: "img",
          attribute: "alt",
          default: ""
        },
        id: {
          source: "attribute",
          selector: "img",
          attribute: "data-id"
        },
        link: {
          source: "attribute",
          selector: "img",
          attribute: "data-link"
        },
        caption: {
          type: "string",
          source: "html",
          selector: "figcaption"
        }
      }
    },
    ids: {
      type: "array",
      default: []
    },
    columns: {
      type: "number"
    },
    imageCrop: {
      type: "boolean",
      default: true
    },
    linkTo: {
      type: "string",
      default: "none"
    }
  },
  supports: {
    align: true
  },
  save({ attributes }) {
    const {
      images,
      columns = defaultColumnsNumberV1(attributes),
      imageCrop,
      linkTo
    } = attributes;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "ul",
      {
        className: `columns-${columns} ${imageCrop ? "is-cropped" : ""}`,
        children: images.map((image) => {
          let href;
          switch (linkTo) {
            case "media":
              href = image.fullUrl || image.url;
              break;
            case "attachment":
              href = image.link;
              break;
          }
          const img = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "img",
            {
              src: image.url,
              alt: image.alt,
              "data-id": image.id,
              "data-full-url": image.fullUrl,
              "data-link": image.link,
              className: image.id ? `wp-image-${image.id}` : null
            }
          );
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "li",
            {
              className: "blocks-gallery-item",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { children: [
                href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href, children: img }) : img,
                image.caption && image.caption.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_block_editor.RichText.Content,
                  {
                    tagName: "figcaption",
                    value: image.caption
                  }
                )
              ] })
            },
            image.id || image.url
          );
        })
      }
    );
  },
  migrate(attributes) {
    return runV2Migration(attributes);
  }
};
var v2 = {
  attributes: {
    images: {
      type: "array",
      default: [],
      source: "query",
      selector: "ul.wp-block-gallery .blocks-gallery-item",
      query: {
        url: {
          source: "attribute",
          selector: "img",
          attribute: "src"
        },
        alt: {
          source: "attribute",
          selector: "img",
          attribute: "alt",
          default: ""
        },
        id: {
          source: "attribute",
          selector: "img",
          attribute: "data-id"
        },
        link: {
          source: "attribute",
          selector: "img",
          attribute: "data-link"
        },
        caption: {
          type: "string",
          source: "html",
          selector: "figcaption"
        }
      }
    },
    columns: {
      type: "number"
    },
    imageCrop: {
      type: "boolean",
      default: true
    },
    linkTo: {
      type: "string",
      default: "none"
    }
  },
  isEligible({ images, ids }) {
    return images && images.length > 0 && (!ids && images || ids && images && ids.length !== images.length || images.some((id, index) => {
      if (!id && ids[index] !== null) {
        return true;
      }
      return parseInt(id, 10) !== ids[index];
    }));
  },
  migrate(attributes) {
    return runV2Migration(attributes);
  },
  supports: {
    align: true
  },
  save({ attributes }) {
    const {
      images,
      columns = defaultColumnsNumberV1(attributes),
      imageCrop,
      linkTo
    } = attributes;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "ul",
      {
        className: `columns-${columns} ${imageCrop ? "is-cropped" : ""}`,
        children: images.map((image) => {
          let href;
          switch (linkTo) {
            case "media":
              href = image.url;
              break;
            case "attachment":
              href = image.link;
              break;
          }
          const img = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "img",
            {
              src: image.url,
              alt: image.alt,
              "data-id": image.id,
              "data-link": image.link,
              className: image.id ? `wp-image-${image.id}` : null
            }
          );
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "li",
            {
              className: "blocks-gallery-item",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { children: [
                href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href, children: img }) : img,
                image.caption && image.caption.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_block_editor.RichText.Content,
                  {
                    tagName: "figcaption",
                    value: image.caption
                  }
                )
              ] })
            },
            image.id || image.url
          );
        })
      }
    );
  }
};
var v1 = {
  attributes: {
    images: {
      type: "array",
      default: [],
      source: "query",
      selector: "div.wp-block-gallery figure.blocks-gallery-image img",
      query: {
        url: {
          source: "attribute",
          attribute: "src"
        },
        alt: {
          source: "attribute",
          attribute: "alt",
          default: ""
        },
        id: {
          source: "attribute",
          attribute: "data-id"
        }
      }
    },
    columns: {
      type: "number"
    },
    imageCrop: {
      type: "boolean",
      default: true
    },
    linkTo: {
      type: "string",
      default: "none"
    },
    align: {
      type: "string",
      default: "none"
    }
  },
  supports: {
    align: true
  },
  save({ attributes }) {
    const {
      images,
      columns = defaultColumnsNumberV1(attributes),
      align,
      imageCrop,
      linkTo
    } = attributes;
    const className = (0, import_clsx.default)(`columns-${columns}`, {
      alignnone: align === "none",
      "is-cropped": imageCrop
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className, children: images.map((image) => {
      let href;
      switch (linkTo) {
        case "media":
          href = image.url;
          break;
        case "attachment":
          href = image.link;
          break;
      }
      const img = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          src: image.url,
          alt: image.alt,
          "data-id": image.id
        }
      );
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "figure",
        {
          className: "blocks-gallery-image",
          children: href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href, children: img }) : img
        },
        image.id || image.url
      );
    }) });
  },
  migrate(attributes) {
    return runV2Migration(attributes);
  }
};
var deprecated_default = [v7, v6, v5, v4, v3, v2, v1];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defaultColumnsNumberV1,
  getHrefAndDestination,
  getImageBlock
});
//# sourceMappingURL=deprecated.cjs.map
