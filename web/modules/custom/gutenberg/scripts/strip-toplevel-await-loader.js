/**
 * @file
 * Webpack loader that strips the top-level `await import("preact/debug")`
 * from @wordpress/interactivity's index.mjs.
 *
 * The interactivity package conditionally loads preact/debug via:
 *   if (globalThis.SCRIPT_DEBUG) { await import("preact/debug"); }
 *
 * This top-level await causes webpack to treat the module as async, which
 * breaks the synchronous `window.wp.interactivity = exports` assignment
 * in the library output. Since SCRIPT_DEBUG is never true in production,
 * removing this line has zero functional impact.
 */
module.exports = function (source) {
  return source.replace(
    /if\s*\(globalThis\.SCRIPT_DEBUG\)\s*\{\s*await\s+import\(["']preact\/debug["']\);\s*\}/g,
    '/* SCRIPT_DEBUG: preact/debug stripped for production */',
  );
};
