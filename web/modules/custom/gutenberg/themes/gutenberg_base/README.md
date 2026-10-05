# Gutenberg Base

A base theme for sites edited with the Gutenberg module: the Drupal templates
(header, menus, breadcrumb, local tasks, messages, nodes, comments, forms,
pager) and the core blocks, styled from one set of design tokens, with the
same styles in the editor canvas and on the page. Extend it with a sub-theme.

## Files

| Path | What it holds |
|---|---|
| `css/tokens/` | The design tokens as CSS custom properties: colors (with dark mode and the color schemes), the fluid type and spacing scale, effects, and the `--wp--preset--*` aliases of the Gutenberg presets. |
| `css/theme/` | The styles of the design system: elements (`base.css`), containers and layouts (`layout.css`), Drupal templates (`drupal.css`), forms and buttons (`forms.css`), core blocks (`blocks.css`), and the light weight set. |
| `css/icons.css` | A subset of the [Lucide](https://lucide.dev) icons as CSS masks (`<span class="icon icon-search" aria-hidden="true"></span>`), generated from `icons/*.svg`. |
| `css/header-overlay.css` | The "Overlay the site header" option of the Cover block, see below. |
| `css/editor-overrides.css` | Editor canvas only: what the frontend gets from its page layout. |
| `gutenberg_base.gutenberg.yml` | The editor configuration: presets in `__experimentalFeatures` (the `settings` of a theme.json) and `globalStyles` (its `styles`). |
| `schemes/*.json` | The editor palette of each color scheme. |
| `js/` | The menu panel and header scroll state, dark mode, message dismissal, and the editor scripts. |

`css/tokens/` and `css/theme/` follow the design system as they are. Put
Drupal-specific rules in the theme-owned files instead, or in a sub-theme.

## Theme settings

- **Color scheme** (Appearance > Settings): remaps the tint, primary and
  secondary colors (`data-scheme` on `<html>`), and swaps the editor palette
  for the one in `schemes/`.
- **Light type weights**: body text at 300, headings at 400 (`data-weight`).
- **Button shape**: square, or round pills (`data-buttons`, `css/round-buttons.css`).
- **Dark mode** is the visitor's choice (the header toggle, or the system
  preference), `data-theme="dark"` on `<html>`.

A sub-theme changes the brand by overriding the semantic tokens of
`css/tokens/colors.css` (`--color-tint`, `--color-tint-strong`,
`--color-surface-inverse`, `--color-accent`…) and `--font-sans` in a
stylesheet loaded after the global library, and the matching values in its
own `.gutenberg.yml`.

## Extending core blocks

The theme adds an option to the core Cover block, to show how a theme extends
a core block without touching the module. When a Cover is the first block of
a node's content, its block settings have a **Site header** panel with an
**Overlay the site header** toggle. With it on, the page pulls the cover up
under the sticky site header, which is translucent while the page is at the
top: a hero.

The pieces, which a new option follows the same way:

1. **The attribute and the control**, `js/cover-header-overlay.js`, in the
   `editor` library that `libraries-edit` loads on the node form. Three
   filters of the WordPress hooks API:
   - `blocks.registerBlockType` adds the `headerOverlay` attribute to
     `core/cover`;
   - `editor.BlockEdit` adds the toggle to the block settings sidebar, only
     while the cover is the first root block;
   - `editor.BlockListBlock` adds an editor-only class to the cover in the
     canvas, which `css/editor-overrides.css` uses to draw a placeholder of
     the header.

   There is no build step: the script uses the `wp.*` globals, so its library
   depends on the `gutenberg/*` libraries, and calls
   `wp.element.createElement` instead of writing JSX. The filters are
   registered when the script loads, before the editor registers the core
   blocks.
2. **The frontend reads the attribute**, `gutenberg_base.theme`: the
   attribute is saved in the block comment (`<!-- wp:cover
   {"headerOverlay":true} -->`). `_gutenberg_base_first_block()` parses the
   content with the block parser of the module, and
   `_gutenberg_base_has_header_overlay()` checks the first block, and that
   the title is placed in the content, since the page header band would
   otherwise sit between the header and the cover. Then
   `gutenberg_base_preprocess_html()` adds `has-header-overlay` to `<body>`,
   with the node's cache tags. The saved HTML of the block is not changed,
   so the content stays valid when the script is not loaded, e.g. with
   another theme.
3. **The styles**, `css/header-overlay.css`: the translucent header, the
   cover pulled up under it, and a guard that keeps the plain layout while
   messages or local tasks sit between the header and the content.
   `js/navigation.js` adds `is-scrolled` to the header, which makes it opaque
   again.
4. **The test**, `tests/src/Playwright/cover-header-overlay.spec.mjs`, in the
   module's Playwright suite.

To add another option, copy the script and change its constants (the block,
the attribute, the class) and the condition of the control. When the styling
is local to the block, the attribute can instead add a class to the saved
markup with the `blocks.getSaveContent.extraProps` filter, and no PHP is
needed, but the content then depends on the script to stay valid.
