Gutenberg 4.0-beta1, 2026-02-17
--------------------------------------------------

### Core Gutenberg upgrade: WordPress 6.4 → 6.9

This release updates the bundled Gutenberg editor packages from WordPress 6.4
to WordPress 6.9, bringing a wide range of block editor improvements accumulated
over five WordPress releases.

#### New blocks
- **Accordion block** — Collapsible content panels with heading + body structure.
- **Math block** — LaTeX-based mathematical formulas (block and inline).
- **Time to Read block** — Displays estimated reading time or word count.
- **Query Total block** — Shows the number of results in a query loop.
- **Stretchy Heading & Paragraph** — Auto-expanding text block variations.

#### Block editor UI
- Block inserter stays open while interacting with the editor canvas.
- **Zoom Out mode** — Bird's-eye editing with pattern drag-and-drop.
- **Command Palette** — Quick actions via Ctrl/Cmd+K, now available in the block editor.
- Right-click context menu on blocks for quick access to block settings.
- Rename any block in the List View for better content organization.
- Cut blocks from the block options menu (alongside Copy).
- Keyboard shortcut Ctrl/Cmd+G to group selected blocks.
- Inline reset buttons for color, shadow, and duotone controls.
- Improved link control with better context menus and page/post indicators.

#### Design tools
- **Grid layout** — Group block now supports Auto and Manual grid modes with resize handles.
- **Drop shadows** — Expanded to button, image, and columns blocks; custom shadow editor.
- **Custom aspect ratio presets** for images.
- **Negative margin** support across all blocks.
- **Background images** with positioning and sizing controls.
- **Font management** — Create, edit, and delete custom font size presets with optional fluid scaling.
- **Font Library** — Install and manage local and Google Fonts from the editor.
- **Section Styles** — Apply style variations to multiple blocks simultaneously.

#### Performance
- Up to 5× faster input processing in the editor (6.5).
- Over 110 cumulative performance updates across releases.
- **AVIF image format** support for better compression.

#### APIs
- **Block Bindings API** — Connect block attributes to custom fields and dynamic data sources, with a UI selector in 6.7+.
- **Interactivity API** — Richer front-end interactions between blocks without custom JavaScript.
- **Block API v3** — Updated block registration API used by all custom blocks.
- **React 18.3** — Upstream React upgrade with new JSX transform support.
- **Pattern overrides** — Synced patterns can have per-instance content customization (Heading, Paragraph, Image, Button blocks).
- **theme.json v3** — Override default font sizes and spacing sizes; reduced CSS specificity.

#### Block improvements
- **Image block** — Set as featured image directly; AVIF support.
- **Cover block** — Resolution controls; poster-image for videos.
- **Details block** — New name attribute for grouped FAQ sections.
- **File block** — Customizable filename and download button text.
- **Gallery block** — "Expand to click" lightbox mode for all images.
- **Button block** — HTML element selection (button/anchor) for accessibility.
- **Navigation block** — Menu names in List View; transparent background option.
- **Social Icons block** — Discord support; streamlined color options.

### Build system

- Replaced Gutenberg repository clone + esbuild with npm packages + `@wordpress/scripts` + webpack.
- Custom JS/CSS packages now built via standard `@wordpress/scripts` tooling.
- Forked `edit-post` into a custom `edit-entity` package for Drupal-specific editor shell.

### Drupal integration improvements

- Gin admin theme style support with dynamic accent color variables forwarded into the editor iframe.
- Admin theme CSS variables (Claro/Gin) correctly propagated to the block editor canvas.
- Block inserter Media tab now shows media entities (or file entities as fallback when Media module is disabled).
- Remote video media type support in Media blocks and block inserter.
- Stretchy Heading (fitText) support on frontend with Interactivity API.
- Wrap non-iframe metaboxes in expandable details elements.
- Replaced jQuery header injection with React-based DrupalFormActions component.
- Disable Drupal form actions during pattern editing to prevent sidebar field loss.
- Sync Drupal node title to the editor store; hide WordPress-specific sidebar post actions.
- Media browser style fixes.
- Automated block supports sync script to keep PHP block support code aligned with upstream.
- Automated Style Engine sync script (updated to v2.33.1).
- Block processors for aria-label, block-visibility, shadow, and typography.
- CSS preset generator for common design tokens.
- CSRF token enforcement on editor API routes.
- Config schema fixes for Drupal 11 compatibility.

### Bug fixes

- Fix mapping fields type coercion for entity reference `target_id`.
- Fix image rotations not working (#3462581).
- Fix SVGs incorrectly getting image styles applied (#3341296).
- Fix overriding existing `#group` when moving fields to metabox (#3573342).
- Add `core/missing` block support (#3573075).
- Fix media search pagination, dynamic upload size limit, and block placeholder translations.
- Guard media selection access with proper dependency.
- Normalize `gutenberg.settings` config (#3415218).

### Testing

- FunctionalJavascript test suite fully operational with 8 passing tests.
- All Drupal and PHPUnit deprecation warnings resolved (PHP 8 attributes).
- Reduced test wait times for faster CI runs.

Gutenberg 8.x-2.x-dev, xxxx-xx-xx
--------------------------------------------------
- Update to Gutenberg 8.4.0.
- Move library loading from `gutenberg_preprocess_node` to `GutenbergFilter` so that it works on the field level.
- Issue #3152053: Use Block parser for the `mappingFields` integration.
  Add optional processing options to the definition:
    * `text_format` - The text format to use for text fields.
    * `allowed_tags` - Array of HTML tags that should not be stripped.
    * `no_strip` - specifies that `strip_tags` should not be applied on the value.
- Remove the `MappingFieldsFilter` configuration since that feature should always be enabled. Remove `mappingField` attribute support.
- Issue #3104989: Set minimum PHP support to 7.0 rather than 7.1
- API: Use the WordPress Gutenberg block parser so that blocks are easier to work with.
- API: Add `gutenberg_block_processor` tag services which act upon the blocks in a single-pass (ordered by priority).
- API: Integrate the `drupalmedia` block with the dynamic render block API so that it can be extended by other themes/modules.
- API: Use a `GutenbergLibraryManager` Plugin Manager to manage all the `.gutenberg.yml` definitions to improve performance.
- Inherit Gutenberg theme library definitions from their base themes.
- Update `gutenberg.schema.yml` to include the configuration schemas.
- Add dynamic block functionality as well as a demo of the API in the `example_block` module.
- Replace the `gutenberg-palette.html.twig` template with a procedural version - removing the extra rendering overhead (also minified the output).
  - Add a `theme-includes-colors` property for theme `.gutenberg.yml` definitions to indicate that the theme already supplies its own palette styles - removing the need for head styles.
- Removed `\Drupal\gutenberg\BlocksRendererHelper::isAccessForbidden` in favour of `\Drupal\gutenberg\BlocksRendererHelper::getBlockAccess` so that the cache tags can be referenced.
- `GutenbergFilter` now replaces the previous Gutenberg filters (database update is required):
    - `BlockFilter`
    - `CommentDelimiterFilter`
    - `FieldMappingFilter`
    - `MappingFieldsFilter`
    - `MediaEntityBlockFilter`
    - `OEmbedFilter`
    - `ReusableBlockFilter`
- Add a text formatter for rendering a text through Gutenberg. This allows Reusable blocks to render dynamic blocks.
  - It removes the default Drupal field wrappers by default to avoid conflicting element styles.
- oEmbed processor now uses the Media module's resolver if available, then falls back to the internal implementation.
- Flexible theme attributes support. [#3089943](https://www.drupal.org/project/gutenberg/issues/3089943)
- Add RTL editor support.
- Replace `drupalSettings.path.baseUrl` calls with `Drupal.url()` calls to support sites with url prefixes.
- `gutenberg.routing.yml`: Enforce the JSON response `_format` and update deprecated `_method` property.
- Add support for custom media types. [#3107837](https://www.drupal.org/project/gutenberg/issues/3107837)
- Media controller:
    - Throw appropriate http response codes when relevant.
    - `MediaController::dialog`: Fix bug relating to explode an array instead of a string when the `types` query is empty.
- Reusable Blocks controller:
    - Address null pointer exception when a block with empty content or title is saved.
    - Ensure that only reusable block entities are loaded and modified.
- Search controller: Add ability to limit results per page (defaults to 20).
- `BlocksRendererHelper`:
    - Apply context to context aware blocks.
    - Log plugin exceptions when they occur.
- Add scripts for simplifying updating/switching the Gutenberg JS versions.
