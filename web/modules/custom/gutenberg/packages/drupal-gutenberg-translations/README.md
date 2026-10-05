# Drupal Gutenberg Translations

Command-line utility that scans `.js` files for Gutenberg's `__()`, `_n()`,
`_x()` and `_nx()` translation calls and emits an equivalent file of
`Drupal.t()` and `Drupal.formatPlural()` calls. The output lets Drupal's
translation extractor pick up Gutenberg-side strings.

This tool was previously published as the
[`drupal-gutenberg-translations` npm package](https://github.com/front/drupal-gutenberg-translations);
it now lives in-tree under the Drupal Gutenberg module.

## Usage

From the Gutenberg module root:

```sh
node packages/drupal-gutenberg-translations/index.js <target-dir>
```

The tool writes `drupal-gutenberg-translations.js` into `<target-dir>`. The
module's `npm run translations` script wires this into the build.

## Using from another Drupal module

If your module depends on `gutenberg`, invoke the script directly:

```sh
node ../gutenberg/packages/drupal-gutenberg-translations/index.js ./js
```
