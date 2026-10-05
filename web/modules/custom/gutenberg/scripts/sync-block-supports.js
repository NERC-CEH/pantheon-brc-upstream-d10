#!/usr/bin/env node

/**
 * @file
 * Syncs PHP block-support files from the upstream WordPress/gutenberg repository.
 *
 * Unlike the Style Engine (which ships in an npm package), the lib/block-supports/
 * PHP files are NOT published to npm. They must be fetched directly from GitHub
 * at the exact monorepo commit that matches our installed @wordpress/style-engine.
 *
 * For each configured block-support file the script:
 *   1. Resolves the GitHub commit from the installed @wordpress/style-engine version
 *   2. Fetches the upstream file from GitHub
 *   3. Stores a baseline copy in src/BlockProcessor/upstream/
 *   4. Extracts specified functions (brace-counting parser)
 *   5. Writes them to src/BlockProcessor/block-supports/
 *   6. Validates dependency coverage against utils.php + Style Engine shims
 *   7. Shows diffs of non-syncable functions for manual porting reference
 *
 * Usage:
 *   node scripts/sync-block-supports.js                       # fetch + sync all configured files
 *   node scripts/sync-block-supports.js --dry-run             # show diff only
 *   node scripts/sync-block-supports.js --check-deps-only     # validate shims
 *   node scripts/sync-block-supports.js --show-render-diff    # diff of render functions for manual porting
 *   node scripts/sync-block-supports.js --offline             # use stored baselines only
 *   node scripts/sync-block-supports.js --ref v19.9.0         # specific git ref
 *   node scripts/sync-block-supports.js --only layout         # sync only one file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const UPSTREAM_DIR = path.join(ROOT, 'src/BlockProcessor/upstream');
const BLOCK_SUPPORTS_DIR = path.join(ROOT, 'src/BlockProcessor/block-supports');
const UTILS_PATH = path.join(ROOT, 'src/StyleEngine/utils.php');
const SHIMS_PATH = path.join(ROOT, 'src/BlockProcessor/block-supports-shims.php');
const STYLE_ENGINE_DIR = path.join(ROOT, 'src/StyleEngine');

// --- Sync Configuration ---
// Adding a new processor sync is just adding an entry here.
const SYNC_CONFIG = {
  layout: {
    upstream: 'lib/block-supports/layout.php',
    extract: [
      'gutenberg_get_layout_definitions',
      'gutenberg_get_layout_style',
      'gutenberg_incremental_id_per_prefix',
      'gutenberg_unique_id_from_values',
      'gutenberg_render_layout_support_flag',
      'gutenberg_restore_group_inner_container',
      'gutenberg_sanitize_block_gap_value',
      'gutenberg_get_layout_container_values',
      'gutenberg_get_layout_child_values',
      'gutenberg_get_child_layout_style_rules',
    ],
    // Functions to show diff for (manual porting reference).
    diffOnly: [],
  },
  colors: {
    upstream: 'lib/block-supports/colors.php',
    extract: [
      'gutenberg_register_colors_support',
      'gutenberg_apply_colors_support',
    ],
    diffOnly: [],
  },
  dimensions: {
    upstream: 'lib/block-supports/dimensions.php',
    extract: [
      'gutenberg_register_dimensions_support',
      'gutenberg_apply_dimensions_support',
      'gutenberg_render_dimensions_support',
      'gutenberg_is_explicit_aspect_ratio_value',
    ],
    diffOnly: [],
  },
  spacing: {
    upstream: 'lib/block-supports/spacing.php',
    extract: [
      'gutenberg_register_spacing_support',
      'gutenberg_apply_spacing_support',
    ],
    diffOnly: [],
  },
  border: {
    upstream: 'lib/block-supports/border.php',
    extract: [
      'gutenberg_register_border_support',
      'gutenberg_apply_border_support',
      'gutenberg_has_border_feature_support',
    ],
    diffOnly: [],
  },
  'aria-label': {
    upstream: 'lib/block-supports/aria-label.php',
    extract: [
      'gutenberg_register_aria_label_support',
      'gutenberg_apply_aria_label_support',
    ],
    diffOnly: [],
  },
  'block-visibility': {
    upstream: 'lib/block-supports/block-visibility.php',
    extract: [
      'gutenberg_render_block_visibility_support',
    ],
    diffOnly: [],
  },
  shadow: {
    upstream: 'lib/block-supports/shadow.php',
    extract: [
      'gutenberg_register_shadow_support',
      'gutenberg_apply_shadow_support',
    ],
    diffOnly: [],
  },
  typography: {
    upstream: 'lib/block-supports/typography.php',
    extract: [
      'gutenberg_register_typography_support',
      'gutenberg_apply_typography_support',
      'gutenberg_typography_get_preset_inline_style_value',
      'gutenberg_get_typography_value_and_unit',
      'gutenberg_get_computed_fluid_typography_value',
      'gutenberg_get_typography_font_size_value',
    ],
    diffOnly: [],
  },
  // anchor: not in Gutenberg plugin (lives in WP core wp-includes/block-supports/anchor.php).
  // Implemented natively in AnchorProcessor.php.
  background: {
    upstream: 'lib/block-supports/background.php',
    extract: [
      'gutenberg_register_background_support',
      'gutenberg_render_background_support',
    ],
    diffOnly: [],
  },
  // custom-css: not in Gutenberg plugin (lives in WP core wp-includes/block-supports/custom-css.php).
  // Implemented natively in CustomCssProcessor.php.
  elements: {
    upstream: 'lib/block-supports/elements.php',
    extract: [
      'gutenberg_should_add_elements_class_name',
      'gutenberg_render_elements_class_name',
    ],
    // render_elements_support_styles uses WP_Theme_JSON_Resolver_Gutenberg which
    // requires complex theme JSON infrastructure; implemented natively instead.
    diffOnly: [
      'gutenberg_render_elements_support_styles',
    ],
  },
  'block-style-variations': {
    upstream: 'lib/block-supports/block-style-variations.php',
    extract: [
      'gutenberg_get_block_style_variation_name_from_class',
      'gutenberg_resolve_block_style_variation_ref_values',
      'gutenberg_render_block_style_variation_class_name',
    ],
    // render_block_style_variation_support_styles uses WP_Theme_JSON_Resolver_Gutenberg
    // and WP_Block_Styles_Registry; implemented natively in the Drupal processor.
    diffOnly: [
      'gutenberg_render_block_style_variation_support_styles',
      'gutenberg_enqueue_block_style_variation_styles',
      'gutenberg_register_block_style_variations_from_theme_json_partials',
    ],
  },
  // Per-instance responsive (@mobile/@tablet) and pseudo-state (:hover) styles.
  states: {
    upstream: 'lib/block-supports/states.php',
    extract: [
      'gutenberg_normalize_state_preset_vars',
      'gutenberg_normalize_state_style_for_css_output',
      'gutenberg_get_state_declarations_with_fallback_border_styles',
      'gutenberg_get_state_declarations_with_background_resets',
      'gutenberg_get_state_style_with_fallback_dimension_styles',
      'gutenberg_add_state_style_group',
      'gutenberg_get_state_style_groups',
      'gutenberg_get_root_state_style',
      'gutenberg_get_block_state_element_selectors',
      'gutenberg_add_block_state_style_rule',
      'gutenberg_get_block_state_style_rules',
      'gutenberg_get_block_state_unique_class',
      'gutenberg_split_selector_list',
      'gutenberg_build_state_selector',
      'gutenberg_render_block_states_support',
    ],
    diffOnly: [],
  },
  // Used by layout.php to normalize legacy style state keys (e.g. 'mobile').
  'style-state-aliases': {
    upstream: 'lib/compat/plugin/style-state-aliases.php',
    extract: [
      'gutenberg_resolve_style_state_aliases',
    ],
    diffOnly: [],
  },
  settings: {
    upstream: 'lib/block-supports/settings.php',
    extract: [
      '_gutenberg_add_block_level_presets_class',
    ],
    // _gutenberg_add_block_level_preset_styles uses wp_get_block_css_selector(),
    // WP_Theme_JSON_Gutenberg::scope_selector(), wp_enqueue_block_support_styles()
    // and full block type registry iteration; implemented natively instead.
    diffOnly: [
      '_gutenberg_add_block_level_preset_styles',
    ],
  },
};

// --- CLI Arguments ---
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const checkDepsOnly = args.includes('--check-deps-only');
const showRenderDiff = args.includes('--show-render-diff');
const offline = args.includes('--offline');
const refIndex = args.indexOf('--ref');
const explicitRef = refIndex !== -1 ? args[refIndex + 1] : null;
const onlyIndex = args.indexOf('--only');
const onlyName = onlyIndex !== -1 ? args[onlyIndex + 1] : null;

// --- PHP Built-in Functions ---
// Shared with sync-style-engine.js — functions that don't need shims.
const PHP_BUILTINS = new Set([
  // Language constructs and control flow
  'array', 'empty', 'isset', 'unset', 'list', 'echo', 'print',
  'if', 'elseif', 'else', 'foreach', 'while', 'for', 'switch', 'case',
  'return', 'break', 'continue', 'throw', 'try', 'catch', 'finally',
  // Type functions
  'is_array', 'is_string', 'is_object', 'is_scalar', 'is_null', 'is_integer',
  'is_numeric', 'is_bool', 'is_int', 'is_float', 'gettype', 'intval', 'floatval', 'boolval',
  'settype',
  // String functions
  'trim', 'rtrim', 'ltrim', 'strtolower', 'strtoupper', 'strlen', 'str_pad',
  'str_replace', 'str_contains', 'str_starts_with', 'str_ends_with',
  'strtr', 'strrpos', 'strpos',
  'substr', 'explode', 'implode', 'sprintf', 'preg_replace', 'preg_match',
  'preg_match_all', 'preg_quote', 'preg_replace_callback',
  'strip_tags', 'parse_str', 'number_format',
  'ucfirst', 'lcfirst', 'nl2br', 'wordwrap', 'str_repeat', 'str_word_count',
  'chunk_split', 'md5',
  // Array functions
  'array_merge', 'array_map', 'array_keys', 'array_values', 'array_unique',
  'array_filter', 'array_key_exists', 'array_pop', 'array_push',
  'array_shift', 'array_unshift', 'array_slice', 'array_splice',
  'array_combine', 'array_flip', 'array_reverse', 'array_search',
  'array_intersect', 'array_intersect_key', 'array_diff', 'array_diff_key',
  'count', 'in_array', 'ksort', 'sort', 'usort', 'compact', 'extract',
  'range', 'array_fill', 'reset', 'end', 'current', 'next', 'prev',
  // Object functions
  'get_object_vars', 'property_exists',
  // JSON
  'json_encode', 'json_decode',
  // Class/function checks
  'class_exists', 'function_exists', 'is_callable', 'call_user_func',
  'defined', 'define', 'constant',
  // Misc
  'trigger_error', 'var_export', 'print_r', 'debug_backtrace',
  'min', 'max', 'abs', 'round', 'ceil', 'floor', 'log',
  'floatval', 'intval',
  // OOP keywords that look like function calls
  'self', 'static', 'parent', 'new',
  // Type casting and special
  '__METHOD__', '__FUNCTION__', '__CLASS__',
]);

// --- Helper Functions ---

/**
 * Fetch a URL via HTTPS. Returns a Promise<string>.
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const doFetch = (fetchUrl) => {
      https.get(fetchUrl, { headers: { 'User-Agent': 'drupal-gutenberg-sync' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          doFetch(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} fetching ${fetchUrl}`));
          return;
        }
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
        res.on('error', reject);
      }).on('error', reject);
    };
    doFetch(url);
  });
}

/**
 * Resolve the git commit hash for the installed @wordpress/style-engine version.
 * Uses `npm info @wordpress/style-engine@<version> gitHead` to get the monorepo commit.
 */
function resolveGitCommit() {
  const pkgPath = path.join(ROOT, 'node_modules/@wordpress/style-engine/package.json');
  if (!fs.existsSync(pkgPath)) {
    console.error('Error: @wordpress/style-engine not found in node_modules.');
    console.error('Run "npm install" first.');
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const version = pkg.version;

  console.log(`Resolving git commit for @wordpress/style-engine v${version}...`);

  try {
    const gitHead = execSync(
      `npm info @wordpress/style-engine@${version} gitHead`,
      { encoding: 'utf8' }
    ).trim();

    if (!gitHead || gitHead.length < 7) {
      throw new Error('Empty or invalid gitHead');
    }

    console.log(`  Commit: ${gitHead}`);
    return { commit: gitHead, version };
  } catch (err) {
    console.error(`Error resolving gitHead for @wordpress/style-engine@${version}:`);
    console.error(err.message);
    console.error('Use --ref <commit> to specify a git ref manually, or --offline to use stored baselines.');
    process.exit(1);
  }
}

/**
 * Extract a single PHP function (including its docblock) from source content.
 *
 * Uses brace-counting to handle nested braces, and skips braces inside
 * strings and comments to avoid false matches.
 */
function extractFunction(content, functionName) {
  // Find the function declaration.
  const funcDeclRegex = new RegExp(
    `function\\s+${functionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`,
    'g'
  );

  const match = funcDeclRegex.exec(content);
  if (!match) {
    return null;
  }

  // Walk backwards from the function declaration to find the docblock.
  let docblockStart = match.index;
  const beforeFunc = content.substring(0, match.index);
  const trimmedBefore = beforeFunc.trimEnd();

  if (trimmedBefore.endsWith('*/')) {
    // Find the opening /** for this docblock.
    const docStart = trimmedBefore.lastIndexOf('/**');
    if (docStart !== -1) {
      docblockStart = docStart;
    }
  }

  // Now find the function body by counting braces.
  let pos = match.index + match[0].length;
  // First, skip to the opening brace.
  let depth = 0;
  let foundOpenBrace = false;

  while (pos < content.length) {
    const ch = content[pos];

    // Skip single-line comments.
    if (ch === '/' && content[pos + 1] === '/') {
      const eol = content.indexOf('\n', pos);
      pos = eol === -1 ? content.length : eol + 1;
      continue;
    }

    // Skip block comments.
    if (ch === '/' && content[pos + 1] === '*') {
      const endComment = content.indexOf('*/', pos + 2);
      pos = endComment === -1 ? content.length : endComment + 2;
      continue;
    }

    // Skip single-quoted strings.
    if (ch === "'") {
      pos++;
      while (pos < content.length) {
        if (content[pos] === '\\') {
          pos += 2;
          continue;
        }
        if (content[pos] === "'") {
          pos++;
          break;
        }
        pos++;
      }
      continue;
    }

    // Skip double-quoted strings.
    if (ch === '"') {
      pos++;
      while (pos < content.length) {
        if (content[pos] === '\\') {
          pos += 2;
          continue;
        }
        if (content[pos] === '"') {
          pos++;
          break;
        }
        pos++;
      }
      continue;
    }

    // Skip heredocs/nowdocs.
    if (ch === '<' && content[pos + 1] === '<' && content[pos + 2] === '<') {
      const heredocMatch = content.substring(pos).match(/^<<<\s*['"]?([A-Za-z_][A-Za-z0-9_]*)['"]?\s*\n/);
      if (heredocMatch) {
        const label = heredocMatch[1];
        const endLabel = new RegExp(`^${label};?\\s*$`, 'm');
        const rest = content.substring(pos + heredocMatch[0].length);
        const heredocEnd = rest.search(endLabel);
        if (heredocEnd !== -1) {
          const endMatch = rest.substring(heredocEnd).match(endLabel);
          pos = pos + heredocMatch[0].length + heredocEnd + endMatch[0].length;
          continue;
        }
      }
    }

    if (ch === '{') {
      depth++;
      foundOpenBrace = true;
    } else if (ch === '}') {
      depth--;
      if (foundOpenBrace && depth === 0) {
        // Found the closing brace of the function.
        return content.substring(docblockStart, pos + 1);
      }
    }

    pos++;
  }

  console.warn(`  Warning: Could not find closing brace for function ${functionName}`);
  return null;
}

/**
 * Strip comments and string literals from PHP content to avoid false positives.
 */
function stripCommentsAndStrings(content) {
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  content = content.replace(/\/\/[^\n]*/g, '');
  content = content.replace(/'(?:[^'\\]|\\.)*'/g, "''");
  content = content.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  return content;
}

/**
 * Extract all function calls from PHP content.
 */
function extractFunctionCalls(content) {
  const calls = new Set();
  const stripped = stripCommentsAndStrings(content);

  // Match function calls but skip method calls (preceded by -> or ::).
  const callRegex = /(?:->|::)?\s*\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
  let match;
  while ((match = callRegex.exec(stripped)) !== null) {
    // Skip method calls (->method() or ::method()).
    if (match[0].startsWith('->') || match[0].startsWith('::')) continue;
    const name = match[1];
    // Skip class names (start with uppercase).
    if (/^[A-Z]/.test(name)) continue;
    if (name === 'function') continue;
    if (name === 'class') continue;
    calls.add(name);
  }

  return calls;
}

/**
 * Extract function definitions from PHP content.
 */
function extractFunctionDefinitions(content) {
  const defs = new Set();
  const defRegex = /\bfunction\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
  let match;
  while ((match = defRegex.exec(content)) !== null) {
    defs.add(match[1]);
  }
  return defs;
}

/**
 * Check dependency coverage for extracted functions.
 */
function checkDependencies(extractedContent, utilsContent, shimsContent, styleEngineContents) {
  const allCalls = extractFunctionCalls(extractedContent);
  const selfDefined = extractFunctionDefinitions(extractedContent);
  const utilsDefined = extractFunctionDefinitions(utilsContent);
  const shimsDefined = extractFunctionDefinitions(shimsContent);

  const styleEngineDefined = new Set();
  for (const content of styleEngineContents) {
    for (const def of extractFunctionDefinitions(content)) {
      styleEngineDefined.add(def);
    }
  }

  const missing = [];
  for (const fn of allCalls) {
    if (PHP_BUILTINS.has(fn)) continue;
    if (selfDefined.has(fn)) continue;
    if (utilsDefined.has(fn)) continue;
    if (shimsDefined.has(fn)) continue;
    if (styleEngineDefined.has(fn)) continue;
    if (fn.startsWith('__') && fn.endsWith('__')) continue;
    missing.push(fn);
  }

  return {
    missing,
    utilsDefined: [...utilsDefined],
    styleEngineDefined: [...styleEngineDefined],
    selfDefined: [...selfDefined],
  };
}

/**
 * Compute a simple line diff between two strings.
 */
function simpleDiff(oldContent, newContent) {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const output = [];
  let hasChanges = false;

  const maxLines = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine !== newLine) {
      hasChanges = true;
      if (oldLine !== undefined) {
        output.push(`  - ${oldLine}`);
      }
      if (newLine !== undefined) {
        output.push(`  + ${newLine}`);
      }
    }
  }

  return { hasChanges, diff: output.join('\n') };
}

/**
 * Ensure a directory exists.
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Read all Style Engine PHP files for dependency checking.
 */
function readStyleEngineFiles() {
  const contents = [];
  if (!fs.existsSync(STYLE_ENGINE_DIR)) return contents;

  const files = fs.readdirSync(STYLE_ENGINE_DIR).filter(f => f.endsWith('.php'));
  for (const file of files) {
    contents.push(fs.readFileSync(path.join(STYLE_ENGINE_DIR, file), 'utf8'));
  }
  return contents;
}

// --- Main ---

async function main() {
  // Determine git ref.
  let commit, version;

  if (explicitRef) {
    commit = explicitRef;
    version = '(explicit ref)';
    console.log(`Using explicit ref: ${commit}`);
  } else if (offline) {
    commit = null;
    version = '(offline)';
    console.log('Offline mode: using stored baselines only.');
  } else {
    ({ commit, version } = resolveGitCommit());
  }

  console.log('');
  if (dryRun) {
    console.log('(dry run - no files will be written)\n');
  }

  // Determine which configs to process.
  const configEntries = Object.entries(SYNC_CONFIG).filter(
    ([name]) => !onlyName || name === onlyName
  );

  if (onlyName && configEntries.length === 0) {
    console.error(`Error: No config entry found for "${onlyName}".`);
    console.error(`Available: ${Object.keys(SYNC_CONFIG).join(', ')}`);
    process.exit(1);
  }

  // Read dependency files for checking.
  const utilsContent = fs.existsSync(UTILS_PATH)
    ? fs.readFileSync(UTILS_PATH, 'utf8')
    : '';
  const shimsContent = fs.existsSync(SHIMS_PATH)
    ? fs.readFileSync(SHIMS_PATH, 'utf8')
    : '';
  const styleEngineContents = readStyleEngineFiles();

  // Process each configured block-support file.
  let totalExtracted = 0;
  let totalMissing = 0;

  for (const [name, config] of configEntries) {
    console.log(`=== ${name} ===`);
    console.log(`  Upstream: ${config.upstream}`);

    const upstreamLocalPath = path.join(UPSTREAM_DIR, `${name}.php`);
    const outputPath = path.join(BLOCK_SUPPORTS_DIR, `${name}.php`);

    // Step 1: Get upstream content.
    let upstreamContent;

    if (offline) {
      if (!fs.existsSync(upstreamLocalPath)) {
        console.error(`  Error: No stored baseline found at ${upstreamLocalPath}`);
        console.error('  Run without --offline to fetch from GitHub first.');
        continue;
      }
      upstreamContent = fs.readFileSync(upstreamLocalPath, 'utf8');
      // Strip our metadata header to get raw upstream content.
      upstreamContent = upstreamContent.replace(/^<\?php\n\/\/[^\n]*\n\/\/[^\n]*\n\/\/[^\n]*\n\/\/[^\n]*\n\n/, '');
      console.log('  Using stored baseline.');
    } else {
      const url = `https://raw.githubusercontent.com/WordPress/gutenberg/${commit}/${config.upstream}`;
      console.log(`  Fetching: ${url}`);

      try {
        upstreamContent = await fetchUrl(url);
      } catch (err) {
        console.error(`  Error fetching: ${err.message}`);
        if (fs.existsSync(upstreamLocalPath)) {
          console.log('  Falling back to stored baseline.');
          upstreamContent = fs.readFileSync(upstreamLocalPath, 'utf8');
          upstreamContent = upstreamContent.replace(/^<\?php\n\/\/[^\n]*\n\/\/[^\n]*\n\/\/[^\n]*\n\/\/[^\n]*\n\n/, '');
        } else {
          console.error('  No stored baseline available. Skipping.');
          continue;
        }
      }
    }

    // Step 2: Store baseline copy.
    if (!checkDepsOnly && !offline) {
      const baselineContent =
        `<?php\n` +
        `// Upstream: WordPress/gutenberg @ ${commit}\n` +
        `// Source: ${config.upstream}\n` +
        `// Fetched: ${new Date().toISOString().split('T')[0]}\n` +
        `// DO NOT EDIT — managed by scripts/sync-block-supports.js\n` +
        `\n` +
        upstreamContent.replace(/^<\?php\s*\n?/, '');

      if (!dryRun) {
        ensureDir(UPSTREAM_DIR);
        fs.writeFileSync(upstreamLocalPath, baselineContent);
        console.log(`  Stored baseline: ${path.relative(ROOT, upstreamLocalPath)}`);
      } else {
        console.log(`  Would store baseline: ${path.relative(ROOT, upstreamLocalPath)}`);
      }
    }

    // Step 3: Extract specified functions.
    console.log(`  Extracting functions:`);
    const extractedFunctions = [];

    for (const funcName of config.extract) {
      const extracted = extractFunction(upstreamContent, funcName);
      if (extracted) {
        extractedFunctions.push(extracted);
        const lineCount = extracted.split('\n').length;
        console.log(`    ${funcName}: ${lineCount} lines`);
        totalExtracted++;
      } else {
        console.warn(`    ${funcName}: NOT FOUND`);
      }
    }

    if (extractedFunctions.length === 0) {
      console.warn('  No functions extracted. Skipping output.');
      continue;
    }

    // Step 4: Build output file.
    const commitRef = commit || 'offline';
    const outputContent =
      `<?php\n` +
      `/**\n` +
      ` * Auto-generated from WordPress/gutenberg ${config.upstream}\n` +
      ` * Commit: ${commitRef}\n` +
      ` * DO NOT EDIT — managed by scripts/sync-block-supports.js\n` +
      ` */\n` +
      `\n` +
      extractedFunctions.join('\n\n') + '\n';

    // Step 5: Check dependencies.
    const { missing } = checkDependencies(
      outputContent,
      utilsContent,
      shimsContent,
      styleEngineContents
    );

    console.log('');
    console.log(`  --- Dependency Check ---`);
    if (missing.length > 0) {
      console.log(`  Missing shims (${missing.length}):`);
      for (const fn of missing.sort()) {
        console.log(`    ${fn}`);
      }
      totalMissing += missing.length;
    } else {
      console.log('  All function dependencies are covered.');
    }

    if (checkDepsOnly) {
      console.log('');
      continue;
    }

    // Step 6: Show render diff if requested.
    if (showRenderDiff && config.diffOnly) {
      console.log('');
      console.log('  --- Render Function Diffs (for manual porting) ---');
      for (const funcName of config.diffOnly) {
        const upstreamFunc = extractFunction(upstreamContent, funcName);
        if (!upstreamFunc) {
          console.log(`    ${funcName}: not found in upstream`);
          continue;
        }

        // Try to read stored baseline for comparison.
        if (fs.existsSync(upstreamLocalPath)) {
          const baselineRaw = fs.readFileSync(upstreamLocalPath, 'utf8');
          const baselineStripped = baselineRaw.replace(/^<\?php\n\/\/[^\n]*\n\/\/[^\n]*\n\/\/[^\n]*\n\/\/[^\n]*\n\n/, '');
          const baselineFunc = extractFunction(baselineStripped, funcName);
          if (baselineFunc) {
            const { hasChanges, diff } = simpleDiff(baselineFunc, upstreamFunc);
            if (hasChanges) {
              console.log(`\n    ${funcName}: CHANGED`);
              console.log(diff);
            } else {
              console.log(`    ${funcName}: unchanged from baseline`);
            }
          } else {
            console.log(`    ${funcName}: not found in baseline (new upstream)`);
            console.log(`    ${upstreamFunc.split('\n').length} lines`);
          }
        } else {
          console.log(`    ${funcName}: no baseline to compare against`);
          console.log(`    ${upstreamFunc.split('\n').length} lines`);
        }
      }
    }

    // Step 7: Write output file.
    console.log('');
    const existingContent = fs.existsSync(outputPath)
      ? fs.readFileSync(outputPath, 'utf8')
      : '';

    if (existingContent === outputContent) {
      console.log(`  ${path.relative(ROOT, outputPath)}: unchanged`);
    } else if (dryRun) {
      if (existingContent) {
        const { diff } = simpleDiff(existingContent, outputContent);
        console.log(`  ${path.relative(ROOT, outputPath)}: would be modified`);
        console.log(diff);
      } else {
        console.log(`  ${path.relative(ROOT, outputPath)}: would be created (${extractedFunctions.length} functions)`);
      }
    } else {
      ensureDir(BLOCK_SUPPORTS_DIR);
      fs.writeFileSync(outputPath, outputContent);
      if (existingContent) {
        console.log(`  ${path.relative(ROOT, outputPath)}: updated`);
      } else {
        console.log(`  ${path.relative(ROOT, outputPath)}: created`);
      }
    }

    console.log('');
  }

  // Summary.
  console.log('--- Summary ---');
  console.log(`Functions extracted: ${totalExtracted}`);
  if (totalMissing > 0) {
    console.log(`Missing shims: ${totalMissing}`);
    console.log('Add shims to src/StyleEngine/utils.php before using the synced files.');
  }
  if (dryRun) {
    console.log('\nRun without --dry-run to apply changes.');
  } else if (!checkDepsOnly) {
    console.log('\nFiles synced. Review the changes and test in Drupal.');
  }

  process.exit(checkDepsOnly && totalMissing > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
