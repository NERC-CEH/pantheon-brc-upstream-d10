# Gutenberg

 - Drupal Gutenberg brings the powerful content editing experience of Gutenberg
   to Drupal.

 - [Drupal](https://www.drupal.org/) +
   [Gutenberg](https://wordpress.org/gutenberg/) is a powerful combo. Drupal 8 is a rock solid CMS framework packed with powerful admin features.
   Our only complaint? Drupal 8 is missing a modern UI for rich content
   creation. Let’s change this!

 - More functionality wrapped in a smooth UI. Hundreds of hours with user
   testing. Decoupled. React.js. Clean output. Open source.

 - [Gutenberg on GitHub](https://github.com/WordPress/gutenberg/)

 - For a full description of the module, visit the
[project page](https://www.drupal.org/project/gutenberg)

 - To submit bug reports and feature suggestions, or to track changes
[issue queue](https://www.drupal.org/project/issues/gutenberg)

  - Also check [Gutenberg-JS](https://www.npmjs.com/package/@frontkom/gutenberg-js), a stand-alone Gutenberg editor for your custom sites or web apps.

## Contents of this file

 - Requirements
 - Installation
 - Configuration
 - Maintainers


## Requirements

No specific requirements.

## Installation

Install as you would normally install a contributed Drupal module. For further
information, see
[Installing Drupal Modules](https://www.drupal.org/docs/extending-drupal/installing-drupal-modules).


## Configuration

 - To test the module, simply download it from the
   [Drupal Gutenberg project page](https://www.drupal.org/project/gutenberg)
   and enable it.

 - Then go to any content type edit page and enable *Gutenberg Experience*.
   Check *Show the title in the editor* to edit the title directly above the
   content instead of in the sidebar. Themes can style it in both the editor
   and the frontend with `globalStyles.blocks.core/post-title` in
   `<theme>.gutenberg.yml` (or a `.wp-block-post-title` CSS rule loaded in
   both), as long as the node template renders the title with the
   `wp-block-post-title` class, as the Gutenberg Base theme does.
   To place the title elsewhere on a single node, e.g. inside a Cover, insert
   the *Title* block: the editor then hides the title above the content, and
   the Gutenberg Base theme does too on the frontend.

 - Assign the `use gutenberg` permission and access to the "Gutenberg" text format to all desired user roles.

## Development

  Node.js 22.13+ is required; Node 24 is recommended (see `.nvmrc`, run `nvm use`).
  - `npm install`
  - Watching file while developing: `npm start`
  - Build: `npm run build`

For custom block development, check the `example_block` sub-module.

## Local development with DDEV

The repository ships a [DDEV](https://ddev.com/) project that runs Drupal 10,
11 and 12 side by side against your checkout of the module. Each site has its
own PHP version and database, and all of them are built and installed on the
first `ddev start`.

```
ddev start
```

| Site | URL | Core | PHP |
|---|---|---|---|
| D10 | https://d10.gutenberg.ddev.site | ^10.4 | 8.3 |
| D11 | https://d11.gutenberg.ddev.site (also https://gutenberg.ddev.site) | ^11 | 8.4 |
| D12 | https://d12.gutenberg.ddev.site | ^12 (alpha) | 8.5 |

Log in with `admin` / `admin`. Gutenberg is enabled on Basic page and Article.

The [Gin](https://www.drupal.org/project/gin) admin theme is downloaded on D10
and D11 but not enabled (Claro stays the admin theme). To switch:

```
ddev d11 theme:install gin
ddev d11 config:set system.theme admin gin --yes
```

The sites live in the git-ignored `.sites/<site>` directory. Each one links the
repository into `web/modules/custom/gutenberg`, so PHP changes and
`npm run build` output show up on every site at once. The first start runs
composer for all three sites and takes a few minutes; later starts skip sites
that are already installed.

Managing the sites:

```
ddev site                      # Status of all sites
ddev site d12 install          # Build/install if missing (idempotent)
ddev site d10 reinstall        # Fresh database and files, same code
ddev site d11 rebuild          # Delete .sites/d11 and start over
ddev site all update           # composer update + updatedb everywhere
ddev site d12 composer require drupal/token
ddev site d10 php -v
ddev d11 uli                   # Drush shortcut, same as: ddev site d11 drush uli
ddev d10 cr
ddev playwright                # Playwright tests (tests/src/Playwright), against D11
```

To manage fewer sites, or turn off the automatic setup, add this to a
git-ignored `.ddev/config.local.yaml` and run `ddev restart`:

```yaml
web_environment:
  - GUTENBERG_SITES=d11,d12   # Only build/install these on start
  # - GUTENBERG_SITES_AUTO=0  # Never build/install on start
```

Site definitions (core, PHP and Drush constraints, extra composer packages
and dev packages, like `drupal/core-dev` for the Playwright test sites) are in
`.ddev/sites/sites.conf`. To add another site, also add an
`additional_hostnames` entry, a `.ddev/nginx_full/<site>.conf` server block
and, when its PHP version differs from `php_version`, a
`.ddev/sites/fpm-<site>.conf` plus a `web_extra_daemons` entry in
`.ddev/config.yaml`.

Known limits:
 - `ddev xdebug` only affects DDEV's main PHP (the D11 site), not the extra
   PHP-FPM masters serving D10 and D12.
 - The server blocks assume the DDEV project name `gutenberg`.

## Updating WordPress Gutenberg Packages

The `@wordpress/*` npm packages are pinned to specific versions that match a WordPress release. A helper script resolves the correct package versions from the npm dist-tag for a given WP version.

Steps to update:
 1. `node scripts/update-wp-packages.js <wp-version>` (e.g. `6.9`). Use `--dry-run` first to preview changes.
 2. `npm install`
 3. `npm run build:vendor` — compiles every `@wordpress/*` package into `js/vendor/gutenberg/`, copies third-party libraries, and regenerates `gutenberg.libraries.yml`.
 4. `npm run build` — builds the module's own packages under `build/`.
 5. Review the `gutenberg.libraries.yml` diff, clear the Drupal cache and test.

Steps 3 and 4 can be combined with `npm run release`.

If `@wordpress/block-editor` was updated, verify that the patch file in `patches/` still applies cleanly. If not, manually fix the patched file and run `npx patch-package @wordpress/block-editor`.
