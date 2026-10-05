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

// packages/block-library/src/image/transforms.js
var transforms_exports = {};
__export(transforms_exports, {
  default: () => transforms_default,
  stripFirstImage: () => stripFirstImage
});
module.exports = __toCommonJS(transforms_exports);
var import_blob = require("@wordpress/blob");
var import_blocks = require("@wordpress/blocks");
var import_data = require("@wordpress/data");
var import_core_data = require("@wordpress/core-data");
function getCarriedGifConversionAttributes(attributes) {
  const { align, anchor, className, style } = attributes;
  const margin = style?.spacing?.margin;
  return {
    ...align && { align },
    ...anchor && { anchor },
    ...className && { className },
    ...margin && { style: { spacing: { margin } } }
  };
}
function getAnimatedGifVideoCompanion(id, url) {
  if (!id) {
    return null;
  }
  const urlPath = url?.split(/[?#]/)[0];
  if (!urlPath?.toLowerCase().endsWith(".gif")) {
    return null;
  }
  const record = (0, import_data.select)(import_core_data.store).getEntityRecord(
    "postType",
    "attachment",
    id,
    { context: "view" }
  );
  const details = record?.media_details;
  if (!details?.animated_video || !record?.source_url) {
    return null;
  }
  const dir = record.source_url.slice(
    0,
    record.source_url.lastIndexOf("/") + 1
  );
  return {
    src: dir + details.animated_video,
    poster: details.animated_video_poster ? dir + details.animated_video_poster : void 0,
    width: details.width,
    height: details.height
  };
}
function stripFirstImage(attributes, { shortcode }) {
  const { body } = document.implementation.createHTMLDocument("");
  body.innerHTML = shortcode.content;
  let nodeToRemove = body.querySelector("img");
  while (nodeToRemove && nodeToRemove.parentNode && nodeToRemove.parentNode !== body) {
    nodeToRemove = nodeToRemove.parentNode;
  }
  if (nodeToRemove) {
    nodeToRemove.parentNode.removeChild(nodeToRemove);
  }
  return body.innerHTML.trim();
}
function getFirstAnchorAttributeFormHTML(html, attributeName) {
  const { body } = document.implementation.createHTMLDocument("");
  body.innerHTML = html;
  const { firstElementChild } = body;
  if (firstElementChild && firstElementChild.nodeName === "A") {
    return firstElementChild.getAttribute(attributeName) || void 0;
  }
}
var imageSchema = {
  img: {
    attributes: ["src", "alt", "title", "width", "height"],
    classes: [
      "alignleft",
      "aligncenter",
      "alignright",
      "alignnone",
      /^wp-image-\d+$/
    ]
  }
};
function parsePixelDimension(value) {
  return value && /^\d+$/.test(value) ? `${value}px` : void 0;
}
var schema = ({ phrasingContentSchema }) => ({
  figure: {
    require: ["img"],
    children: {
      ...imageSchema,
      a: {
        attributes: ["href", "rel", "target"],
        classes: ["*"],
        children: imageSchema
      },
      figcaption: {
        children: phrasingContentSchema
      }
    }
  }
});
var transforms = {
  from: [
    {
      type: "raw",
      isMatch: (node) => node.nodeName === "FIGURE" && !!node.querySelector("img"),
      schema,
      transform: (node) => {
        const img = node.querySelector("img");
        const className = node.className + " " + img.className;
        const alignMatches = /(?:^|\s)align(left|center|right)(?:$|\s)/.exec(
          className
        );
        const anchor = node.id === "" ? void 0 : node.id;
        const align = alignMatches ? alignMatches[1] : void 0;
        const idMatches = /(?:^|\s)wp-image-(\d+)(?:$|\s)/.exec(
          className
        );
        const id = idMatches ? Number(idMatches[1]) : void 0;
        const anchorElement = node.querySelector("a");
        const linkDestination = anchorElement && anchorElement.href ? "custom" : void 0;
        const href = anchorElement && anchorElement.href ? anchorElement.href : void 0;
        const rel = anchorElement && anchorElement.rel ? anchorElement.rel : void 0;
        const linkClass = anchorElement && anchorElement.className ? anchorElement.className : void 0;
        const widthValue = parsePixelDimension(
          img.getAttribute("width")
        );
        const heightValue = parsePixelDimension(
          img.getAttribute("height")
        );
        const widthNumber = parseInt(widthValue, 10);
        const heightNumber = parseInt(heightValue, 10);
        const aspectRatio = widthNumber && heightNumber ? String(widthNumber / heightNumber) : void 0;
        const width = widthValue || (heightValue ? "auto" : void 0);
        const height = widthValue ? "auto" : heightValue;
        const attributes = (0, import_blocks.getBlockAttributes)(
          "core/image",
          node.outerHTML,
          {
            align,
            id,
            linkDestination,
            href,
            rel,
            linkClass,
            anchor,
            width,
            height,
            aspectRatio
          }
        );
        if ((0, import_blob.isBlobURL)(attributes.url)) {
          attributes.blob = attributes.url;
          delete attributes.url;
        }
        return (0, import_blocks.createBlock)("core/image", attributes);
      }
    },
    {
      // Note: when dragging and dropping multiple files onto a gallery this overrides the
      // gallery transform in order to add new images to the gallery instead of
      // creating a new gallery.
      type: "files",
      isMatch(files) {
        return files.every(
          (file) => file.type.indexOf("image/") === 0
        );
      },
      transform(files) {
        const blocks = files.map((file) => {
          return (0, import_blocks.createBlock)("core/image", {
            blob: (0, import_blob.createBlobURL)(file)
          });
        });
        return blocks;
      }
    },
    {
      type: "shortcode",
      tag: "caption",
      attributes: {
        url: {
          type: "string",
          source: "attribute",
          attribute: "src",
          selector: "img"
        },
        alt: {
          type: "string",
          source: "attribute",
          attribute: "alt",
          selector: "img"
        },
        caption: {
          shortcode: stripFirstImage
        },
        href: {
          shortcode: (attributes, { shortcode }) => {
            return getFirstAnchorAttributeFormHTML(
              shortcode.content,
              "href"
            );
          }
        },
        rel: {
          shortcode: (attributes, { shortcode }) => {
            return getFirstAnchorAttributeFormHTML(
              shortcode.content,
              "rel"
            );
          }
        },
        linkClass: {
          shortcode: (attributes, { shortcode }) => {
            return getFirstAnchorAttributeFormHTML(
              shortcode.content,
              "class"
            );
          }
        },
        id: {
          type: "number",
          shortcode: ({ named: { id } }) => {
            if (!id) {
              return;
            }
            return parseInt(id.replace("attachment_", ""), 10);
          }
        },
        align: {
          type: "string",
          shortcode: ({ named: { align = "alignnone" } }) => {
            return align.replace("align", "");
          }
        }
      }
    }
  ],
  to: [
    {
      // Offer converting an animated GIF into the Video block's "GIF"
      // variation: a muted, looping, autoplaying video transcoded from
      // the GIF and sideloaded next to it when it was uploaded. Only
      // matches when that companion video exists, so ordinary images
      // never see this transform.
      type: "block",
      blocks: ["core/video"],
      isMatch: ({ id, url }) => !!getAnimatedGifVideoCompanion(id, url),
      transform(attributes) {
        const { id, url, caption } = attributes;
        const companion = getAnimatedGifVideoCompanion(id, url);
        return (0, import_blocks.createBlock)("core/video", {
          ...getCarriedGifConversionAttributes(attributes),
          id,
          src: companion.src,
          poster: companion.poster,
          caption,
          controls: false,
          loop: true,
          autoplay: true,
          muted: true,
          playsInline: true,
          /*
           * Carry the GIF's intrinsic dimensions so the <video>
           * keeps its aspect ratio from the first paint. Without
           * them the element collapses to the browser-default size
           * and then jumps once the poster/metadata load, which
           * shows up as a brief duplicated image during the swap.
           */
          width: companion.width,
          height: companion.height
        });
      }
    }
  ]
};
var transforms_default = transforms;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  stripFirstImage
});
//# sourceMappingURL=transforms.cjs.map
