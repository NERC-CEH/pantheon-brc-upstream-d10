/**
 * @file
 * Gutenberg implementation of {@link Drupal.editors} API.
 */

/* global Drupal, DrupalGutenberg, drupalSettings, jQuery */

import { registerDrupalStore } from './drupal-store';
import {
  registerDrupalBlocks,
  registerDrupalMedia,
  registerContentBlocks,
  registerFieldBlock,
  reportInvalidFieldWidget,
  registerEntityTitleBlock,
  getEntityTitleBlocks,
  isTitleInEditor,
} from '@drupal-gutenberg/block-library';
import { registerSdcBlocks } from '@drupal-gutenberg/sdc-blocks';
import defaultSettings from './settings';

const $ = jQuery;
const { wp } = window;

/**
 * Check if Drupal's media module is enabled.
 *
 * @return {boolean} The media module is enabled.
 */
Drupal.isMediaEnabled = () =>
  (drupalSettings.gutenberg || false) &&
  drupalSettings.gutenberg['media-enabled'];

/**
 * Lazily query a jQuery element that might or might not yet exist.
 *
 * @param {string}       selector       The selector of the element.
 * @param {Element|null} context        The element to search in.
 * @param {boolean}      autoDisconnect Whether to stop observing once found.
 */
function lazyjQuery(selector, context = null, autoDisconnect = true) {
  return new Promise((resolve) => {
    const $elements = $(selector, context);
    if ($elements.length) {
      return resolve($elements);
    }

    const observer = new MutationObserver(() => {
      const $found = $(selector, context);
      if ($found.length) {
        if (autoDisconnect) {
          observer.disconnect();
        }
        resolve($found);
      }
    });

    observer.observe(context || document.body, {
      childList: true,
      subtree: true,
    });
  });
}

/**
 * Get Drupal's node title field.
 *
 * @return {HTMLInputElement|null} The title input.
 */
const getTitleField = () => document.getElementById('edit-title-0-value');

/**
 * Copy the title edited in the editor to Drupal's title field.
 *
 * Only applies when the title is edited in the editor, in the canvas or in an
 * entity title block.
 */
function syncTitleField() {
  const titleField = getTitleField();
  if (!isTitleInEditor() || !titleField) {
    return;
  }

  titleField.value =
    wp.data.select('core/editor').getEditedPostAttribute('title') || '';
}

/**
 * Report an invalid title and focus the editor title.
 *
 * Drupal's title field is hidden when the title is shown in the editor, so
 * the browser can't report its validity itself.
 *
 * @return {boolean} Whether the title field was invalid and got reported.
 */
function reportInvalidTitle() {
  const titleField = getTitleField();
  if (!isTitleInEditor() || !titleField || titleField.checkValidity()) {
    return false;
  }

  const label =
    document
      .querySelector(`label[for="${titleField.id}"]`)
      ?.textContent.trim() || Drupal.t('Title');
  const message = titleField.validity.valueMissing
    ? Drupal.t('@label field is required.', { '@label': label })
    : `${label}: ${titleField.validationMessage}`;

  wp.data.dispatch('core/notices').createErrorNotice(message, {
    id: 'drupal-title-invalid',
    isDismissible: true,
  });

  // An entity title block takes the place of the canvas title.
  const [titleBlock] = getEntityTitleBlocks();
  if (titleBlock) {
    wp.data.dispatch('core/block-editor').selectBlock(titleBlock, 0);
    return true;
  }

  // The visual editor's title lives in the canvas iframe, the code editor's
  // is a textarea in the main document.
  const canvas = document.querySelector('iframe[name="editor-canvas"]');
  const editorTitle =
    canvas?.contentDocument?.querySelector('.editor-post-title') ||
    document.querySelector('.editor-text-editor .editor-post-title textarea');
  editorTitle?.focus();

  return true;
}

/**
 * Check if Drupal's media_library module is enabled.
 *
 * @return {boolean} The media library module is enabled.
 */
Drupal.isMediaLibraryEnabled = () =>
  (drupalSettings.gutenberg || false) &&
  drupalSettings.gutenberg['media-library-enabled'];

/**
 * Toggles Gutenberg loader.
 *
 * @param {string} state The loader state.
 */
Drupal.toggleGutenbergLoader = (state) => {
  const $gutenbergLoader = $('#gutenberg-loading');
  if (state === 'show') {
    $gutenbergLoader.removeClass('hide');
  } else if (state === 'hide') {
    $gutenbergLoader.addClass('hide');
  }
};

/**
 * Display error message.
 *
 * @param {string}  message Notice message.
 * @param {boolean} rawHTML Render as HTML.
 *
 * @return {Object} Action object.
 */
Drupal.notifyError = (message, rawHTML = false) =>
  wp.data.dispatch('core/notices').createErrorNotice(message, {
    isDismissible: true,
    __unstableHTML: rawHTML,
  });

/**
 * Display success message.
 *
 * @param {string}  message Notice message.
 * @param {boolean} rawHTML Render as HTML.
 *
 * @return {Object} Action object.
 */
Drupal.notifySuccess = (message, rawHTML = false) =>
  wp.data.dispatch('core/notices').createSuccessNotice(message, {
    isDismissible: true,
    __unstableHTML: rawHTML,
  });

/**
 * Add new command for reloading a block.
 */
Drupal.AjaxCommands.prototype.reloadBlock = function () {
  const { select, dispatch } = wp.data;
  const selectedBlock = select('core/block-editor').getSelectedBlock();
  const { clientId } = selectedBlock;
  const { mediaEntityIds } = selectedBlock.attributes;

  (async () => {
    await dispatch('core/block-editor').updateBlock(clientId, {
      attributes: { mediaEntityIds: [] },
    });

    setTimeout(() => {
      dispatch('core/block-editor').updateBlock(clientId, {
        attributes: { mediaEntityIds },
      });
    }, 100);
  })();
};

wp.galleryBlockV2Enabled = false;

/**
 * @namespace
 */
Drupal.editors.gutenberg = {
  /**
   * Editor attach callback.
   *
   * @param {HTMLElement} element
   *                              The element to attach the editor to.
   * @param {string}      format
   *                              The text format for the editor.
   *
   * @return {boolean}
   *   Whether the call to `CKEDITOR.replace()` created an editor or not.
   */
  async attach(element, format) {
    const $gutenbergLoader = $('#gutenberg-loading');
    $gutenbergLoader.html(
      Drupal.theme.ajaxProgressThrobber(Drupal.t('Loading')),
    );

    // A bit of a hack. This avoids Gutenberg to be reinitialized on AJAX calls.
    // TODO: could be done in another way?
    if (drupalSettings.gutenbergLoaded) {
      return false;
    }
    drupalSettings.gutenbergLoaded = true;

    const { contentType, denyList } = format.editorSettings;
    const { data, blocks } = wp;
    const { dispatch } = data;
    // const { addFilter } = hooks;
    const { unregisterBlockType } = blocks;

    // Register plugins.
    // Not needed now. Leaving it here for reference.
    // const { AdditionalFieldsPluginSidebar } = DrupalGutenberg.Plugins;
    // plugins.registerPlugin('drupal', {
    //   icon: 'forms',
    //   render: AdditionalFieldsPluginSidebar,
    // });

    await registerDrupalStore(data);

    await registerDrupalBlocks(contentType);
    await registerDrupalMedia();
    await registerContentBlocks(contentType);
    registerFieldBlock();
    registerEntityTitleBlock();
    await registerSdcBlocks();

    await this._initGutenberg(element);

    /*
     * This is a hack to deal with an image editing crop issue.
     *
     * @todo Figure out why react-easy-crop is getting container's
     * width and height as 0.
     */
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);

    if (drupalSettings.gutenberg._listeners.init) {
      drupalSettings.gutenberg._listeners.init.forEach((callback) => {
        callback();
      });
    }

    if (drupalSettings.gutenberg.messages) {
      Object.keys(drupalSettings.gutenberg.messages).forEach((key) => {
        drupalSettings.gutenberg.messages[key].forEach((message) => {
          switch (key) {
            case 'error':
              dispatch('core/notices').createErrorNotice(message);
              break;
            case 'warning':
              dispatch('core/notices').createWarningNotice(message);
              break;
            case 'success':
              dispatch('core/notices').createSuccessNotice(message);
              break;
            default:
              dispatch('core/notices').createWarningNotice(message);
              break;
          }
        });
      });
    }

    // Handle late messages, i.e. processed after node edit form hook.
    // Example: System update messages are coming after node edit form.
    // TODO: There must be a better way to do this on server side.
    $('div.messages--error').each((index, el) => {
      dispatch('core/notices').createErrorNotice($(el).html(), {
        __unstableHTML: $(el).html(),
      });
      $(el).remove();
    });

    $('div.messages--warning').each((index, el) => {
      dispatch('core/notices').createWarningNotice($(el).html(), {
        __unstableHTML: $(el).html(),
      });
      $(el).remove();
    });

    $('div.messages--success').each((index, el) => {
      dispatch('core/notices').createSuccessNotice($(el).html(), {
        __unstableHTML: $(el).html(),
      });
      $(el).remove();
    });

    // Unregister the denied blocks.
    denyList
      .filter((value) => !value.includes('drupalblock/'))
      .forEach((value) => {
        unregisterBlockType(value);
      });

    // Remove the "Theme" category — its blocks (e.g. navigation,
    // site-logo, query-loop) are not usable in Drupal.
    const categories = data
      .select('core/blocks')
      .getCategories()
      .filter((cat) => cat.slug !== 'theme');
    data.dispatch('core/blocks').setCategories(categories);

    const { openGeneralSidebar, setAvailableMetaBoxesPerLocation } =
      data.dispatch('core/edit-post');

    // On page load always select sidebar's document tab.
    openGeneralSidebar('edit-post/document');

    setAvailableMetaBoxesPerLocation({
      advanced: ['drupalSettings'],
    });

    const { removeEditorPanel, savePost } = data.dispatch('core/editor');

    // Disable status panel from sidebar
    removeEditorPanel('post-status');

    const metaBoxes = [];
    drupalSettings.gutenberg.metaboxes.forEach((id) => {
      const $metabox = $(`#${id}`);
      const metabox = $metabox.get(0);

      // Detach the original editors used within the metabox elements
      // which can break after they've been moved.
      // Then queue them up for reattachment once the metabox container is available.
      Drupal.behaviors.editor.detach(metabox, drupalSettings);
      metaBoxes.push(metabox);
    });
    lazyjQuery(
      '.edit-post-meta-boxes-area.is-advanced .edit-post-meta-boxes-area__container',
    )
      // lazyjQuery('.gutenberg-header-settings #edit-actions')
      .then(($metaBoxContainer) => {
        metaBoxes.forEach((metabox) => {
          $(metabox).appendTo($metaBoxContainer);
          Drupal.behaviors.editor.attach(metabox, drupalSettings);
        });
      });

    // Create fake form for metabox.
    // On post save, REQUEST_META_BOX_UPDATES action is called and
    // it relies on metaboxes forms.
    // The only way to bypass an exception is to create the "advanced" metabox form.
    // It has no other practical use.
    const metaboxesContainer = $(document.createElement('div'));
    metaboxesContainer.attr('id', 'metaboxes');
    $('body').append(metaboxesContainer);
    const metaboxForm = $(document.createElement('form'));
    metaboxForm.addClass('metabox-location-advanced');
    metaboxesContainer.append(metaboxForm);

    // Disable form validation
    // We need some ninja hacks because every button in Gutenberg will
    // cause the form to submit.
    $(document.forms[0]).attr('novalidate', true);

    let isFormValid = false;

    const $form = $(element.form);
    $('.gutenberg-header-settings .form-submit').on('click', (e) => {
      const $currentTarget = $(e.currentTarget);
      const $moreSettings = $('.edit-post-meta-boxes-main');

      $currentTarget.attr('active', true);

      // For these buttons enable form validation.
      $form.removeAttr('novalidate');

      // Validate the title edited in the editor, not the stale field value.
      syncTitleField();

      isFormValid = element.form.checkValidity();

      // An invalid title in the editor, or an invalid widget of a field
      // placed in the content, is reported by us, not by the browser.
      let isTitleReported = false;
      let isFieldReported = false;

      if (!isFormValid) {
        $currentTarget.removeAttr('active');

        isTitleReported = reportInvalidTitle();
        isFieldReported = !isTitleReported && reportInvalidFieldWidget();

        let isMetaboxValid = true;

        // Check the "More Settings" section's validity.
        $moreSettings.find(':input').each((index, el) => {
          if (!el.checkValidity()) {
            isMetaboxValid = false;
            return true;
          }
        });

        if (isMetaboxValid) {
          // Open the sidebar if the "More settings" appears to be valid,
          // unless the invalid title is in the editor and already focused.
          if (!isTitleReported && !isFieldReported) {
            openGeneralSidebar('edit-post/document');
          }
        } else if (!isFieldReported) {
          // Expand the "More settings" if it's currently collapsed.
          $moreSettings
            .find(
              '.edit-post-meta-boxes-main__presenter > button[aria-expanded="false"]',
            )
            .click();
        }
      } else {
        element.form.requestSubmit(e.currentTarget);
      }

      // Then disable form validation again :(
      $form.attr('novalidate', true);

      // No need to proceed to form validation, it'll report the validity to the user.
      if (!isFormValid) {
        // Report the validity after the next animation frame.
        if (!isTitleReported && !isFieldReported) {
          requestAnimationFrame(() => {
            element.form.reportValidity();
          });
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });

    let formSubmitted = false;
    // Gutenberg is full of buttons which cause the form
    // to submit (no default prevent).
    $form.on('submit', (e) => {
      // Get the original button clicked...
      const $source = $('input[active="true"]');
      // ...and reset its active state.
      $source.removeAttr('active');

      // If none of those buttons were clicked...
      if (
        !$source.hasClass('form-submit') &&
        $source.attr('id') !== 'edit-delete'
      ) {
        // Just stop everything.
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Update editor textarea with gutenberg content.
      $(element).val(data.select('core/editor').getEditedPostContent());
      syncTitleField();

      // We need to update the 'editor-value-is-changed' flag
      // otherwise the content won't be updated.
      $(element).data({ 'editor-value-is-changed': true });
      $(element).attr('data-editor-value-is-changed', true);

      // Clear content "dirty" state.
      if (!formSubmitted) {
        // savePost() is async so we must cancel form submission
        // to avoid to "changes not saved" alert.
        e.preventDefault();
        e.stopPropagation();

        (async () => {
          // Save selected reusable blocks.
          const entitiesToSave = await data
            .select('drupal')
            .getEntitiesToSave();

          for await (const [
            // eslint-disable-next-line no-unused-vars
            index,
            { kind, name, key, property },
          ] of Object.entries(entitiesToSave)) {
            await data
              .dispatch('core')
              .saveEditedEntityRecord(kind, name, key, property);
          }

          await savePost({ isAutosave: false });

          formSubmitted = true;

          // Submit again to save content on Drupal.
          // We need to submit the form via button click.
          // Drupal's form submit handler needs it.
          // TODO: Could we submit and passing the button reference to formState?
          $source.click();
        })();
      }
    });

    return true;
  },

  /**
   * Attaches an inline editor to a DOM element.
   *
   * @return {boolean}
   *   Whether the call to `CKEDITOR.replace()` created an editor or not.
   */
  attachInlineEditor() {
    // We define this function so that quickedit doesn't throw an error.
    return false;
  },

  /**
   * Editor detach callback.
   *
   * @return {boolean}
   *   Whether the call to `CKEDITOR.dom.element.get(element).getEditor()`
   *   found an editor or not.
   */
  detach() {
    return true;
  },

  /**
   * Reacts on a change in the editor element.
   *
   * @return {boolean}
   *   Whether the call to `CKEDITOR.dom.element.get(element).getEditor()`
   *   found an editor or not.
   */
  onChange() {
    return true;
  },

  /**
   * Initializes the editor on a given element.
   *
   * @param {HTMLElement} element
   *                              The element where the editor will be initialized.
   */
  async _initGutenberg(element) {
    const { data } = wp;
    const $textArea = $(element);
    const target = `editor-${$textArea.data('drupal-selector')}`; // 'editor-' + $textArea.data('drupal-selector');
    const $editor = $(`<div id="${target}" class="gutenberg__editor"></div>`); // $('<div id="' + target + '" class="gutenberg__editor"></div>');
    $editor.insertAfter($textArea);
    $textArea.hide();

    // The code editor always renders a title field, hide it unless the
    // content type shows the title in the editor.
    if (!drupalSettings.gutenberg.titleInEditor) {
      $editor.addClass('gutenberg__editor--no-title');
    }

    // Read the node title from the Drupal form field.
    const titleField = document.getElementById('edit-title-0-value');
    const nodeTitle =
      (titleField && titleField.value && titleField.value.trim()) || '';

    wp.node = {
      categories: [],
      content: {
        block_version: 0,
        protected: false,
        raw: $(element).val(),
        rendered: '',
      },
      featured_media: 0,
      // Gutenberg expects an id != 0 and != null. A negative value for new nodes will work.
      // Number() is required because Drupal's $node->id() returns a string.
      id: Number(drupalSettings.gutenberg.entityId) || -1,
      parent: 0,
      permalink_template: '',
      revisions: { count: 0, last_id: 1 },
      status: drupalSettings.gutenberg.entityId ? 'draft' : 'auto-draft',
      theme_style: true,
      title: {
        raw: nodeTitle,
        rendered: nodeTitle,
      },
      type: 'page',
      slug: '',
    };

    const editorSettings = {
      ...(DrupalGutenberg.defaultSettings
        ? DrupalGutenberg.defaultSettings
        : defaultSettings),
      ...drupalSettings.gutenberg['theme-support'],
      supportsTemplateMode: false,
      availableTemplates: [],
      allowedBlockTypes: true,
      disablePostFormats: false,
      mediaLibrary: true,
      // See issue: https://www.drupal.org/project/gutenberg/issues/3035313
      imageSizes: drupalSettings.gutenberg['image-sizes'],
      titlePlaceholder: Drupal.t('Add title'),
      bodyPlaceholder: Drupal.t('Add text or type / to add content'),
      isRTL: drupalSettings.gutenberg['is-rtl'],
      maxUploadFileSize: drupalSettings.gutenberg.maxUploadFileSize || 0,
      localAutosaveInterval: 0,
      autosaveInterval: 0, // Must set > 0 for undo and redo to work.
      template: drupalSettings.gutenberg.template || [],
      templateLock:
        drupalSettings.gutenberg['template-lock'] === 'none'
          ? false
          : drupalSettings.gutenberg['template-lock'] || false,
    };

    // Override block lock permission when using a locked template.
    if (editorSettings.template && editorSettings.templateLock === 'all') {
      editorSettings.canLockBlocks = false;
    }

    // Inject editor CSS for iframe support. When the editor renders in an
    // iframe (all blocks API v3, or tablet/mobile preview), parent page
    // stylesheets don't apply. Use __unstableResolvedAssets to load library
    // CSS as <link> tags in the iframe <head>.

    // Forward admin theme CSS custom properties into the iframe.
    // Claro/Gin set --wp-admin-theme-color and related variables on the
    // parent page; Gutenberg components inside the iframe need them for
    // button colors, focus rings, etc. Read computed values from the parent
    // and inject as an inline <style> so they resolve inside the iframe
    // without loading the full admin theme CSS (which would bleed styles).
    //
    // Use a lazy getter because Gin sets `data-gin-accent` on <html> via JS
    // at runtime — the CSS variables won't resolve until that attribute is
    // present. By the time the editor creates the iframe and reads this
    // property, Gin will have initialized.
    const editorCssUrls = drupalSettings.gutenberg['editor-css-urls'] || [];
    const editorCssLinks = editorCssUrls
      .map((url) => `<link rel="stylesheet" href="${url}">`)
      .join('\n');

    const adminVars = [
      '--wp-admin-theme-color',
      '--wp-admin-theme-color--rgb',
      '--wp-admin-theme-color-darker-10',
      '--wp-admin-theme-color-darker-20',
      '--wp-admin-border-width-focus',
      '--wp-components-color-accent',
      '--wp-components-color-accent-inverted',
      '--wp-components-color-accent-darker-10',
    ];

    let resolvedAssets = null;
    Object.defineProperty(editorSettings, '__unstableResolvedAssets', {
      get() {
        if (!resolvedAssets) {
          const el =
            document.querySelector('[data-gin-accent]') ||
            document.documentElement;
          const style = getComputedStyle(el);
          const decls = adminVars
            .map((v) => {
              const val = style.getPropertyValue(v).trim();
              return val ? `${v}:${val}` : null;
            })
            .filter(Boolean)
            .join(';');
          const adminStyle = decls
            ? `<style id="admin-vars-style">:root{${decls}}</style>`
            : '';
          resolvedAssets = {
            styles: [adminStyle, editorCssLinks].filter(Boolean).join('\n'),
            scripts: '',
          };
        }
        return resolvedAssets;
      },
      set(val) {
        resolvedAssets = val;
      },
      configurable: true,
      enumerable: true,
    });

    // Generate CSS custom properties from __experimentalFeatures presets.
    // WP's Global Styles system generates these dynamically via REST APIs
    // that don't exist in our Drupal integration. We generate them ourselves
    // so that preset spacing, colors, font sizes, and gradients work.
    const features = editorSettings.__experimentalFeatures;
    if (features) {
      const getPresets = (obj) => {
        if (Array.isArray(obj)) {
          return obj;
        }
        if (obj && typeof obj === 'object') {
          return [
            ...(obj.theme || []),
            ...(obj.default || []),
            ...(obj.custom || []),
            ...(obj.core || []),
          ];
        }
        return [];
      };

      const vars = [];
      getPresets(features.spacing?.spacingSizes).forEach(({ slug, size }) => {
        if (slug && size) {
          vars.push(`--wp--preset--spacing--${slug}: ${size}`);
        }
      });
      getPresets(features.color?.palette).forEach(({ slug, color }) => {
        if (slug && color) {
          vars.push(`--wp--preset--color--${slug}: ${color}`);
        }
      });
      getPresets(features.color?.gradients).forEach(({ slug, gradient }) => {
        if (slug && gradient) {
          vars.push(`--wp--preset--gradient--${slug}: ${gradient}`);
        }
      });
      getPresets(features.typography?.fontSizes).forEach(({ slug, size }) => {
        if (slug && size) {
          vars.push(`--wp--preset--font-size--${slug}: ${size}`);
        }
      });
      getPresets(features.typography?.fontFamilies).forEach(
        ({ slug, fontFamily }) => {
          if (slug && fontFamily) {
            vars.push(`--wp--preset--font-family--${slug}: ${fontFamily}`);
          }
        },
      );
      getPresets(features.shadow?.presets).forEach(({ slug, shadow }) => {
        if (slug && shadow) {
          vars.push(`--wp--preset--shadow--${slug}: ${shadow}`);
        }
      });

      if (vars.length > 0) {
        // Prepend as :root so CSS custom properties are available globally.
        // WP's EditorStyles will scope this to ':root :where(.editor-styles-wrapper)'
        // in non-iframe mode, and leave it as ':root { ... }' in iframe mode.
        editorSettings.styles = [
          { css: `:root { ${vars.join('; ')}; }` },
          ...(editorSettings.styles || []),
        ];
      }
    }

    // Do NOT pre-transform styles here. WP's EditorStyles component handles
    // this itself via transformStyles:
    //   - Iframe mode (body IS .editor-styles-wrapper): no scope transform,
    //     'body { ... }' applies directly to the iframe body. ✓
    //   - Non-iframe mode: scope=':where(.editor-styles-wrapper)',
    //     'body { ... }' → 'body :where(.editor-styles-wrapper) { ... }'. ✓
    // Pre-transforming before EditorStyles causes double-scoping in non-iframe
    // mode and broken body selectors in iframe mode (body IS the wrapper,
    // not a parent of it).

    const onEditorReady = () => {
      // Flag the editor as ready.
      // Moving the action buttons to the header should be the last
      // UI change/shift.
      lazyjQuery(
        '.drupal-form-actions .gutenberg-header-settings #edit-submit',
      ).then(() => {
        $('.gutenberg-full-editor').addClass('ready');
        Drupal.toggleGutenbergLoader('hide');
      });
    };

    let editorReady = false;
    data.subscribe(() => {
      if (!editorReady) {
        const currentPostType = data.select('core/editor').getCurrentPostType();
        const postType = data.select('core').getPostType(currentPostType);
        // The editor is only fully ready once we can successfully resolve the
        // post type.
        if (postType) {
          editorReady = true;
          onEditorReady();
        }
      }

      // Handle extra root container classes.
      if (
        drupalSettings.gutenberg['theme-support'].extraRootContainerClassNames
      ) {
        const $isRootContainer = $('.is-root-container');
        if (
          !$isRootContainer.hasClass(
            drupalSettings.gutenberg['theme-support']
              .extraRootContainerClassNames,
          )
        ) {
          $isRootContainer.addClass(
            drupalSettings.gutenberg['theme-support']
              .extraRootContainerClassNames,
          );
        }
      }

      // Back button is handled by the drupal-back-button plugin
      // (packages/plugins/src/back-button.jsx) using createPortal.

      // Clear template validation.
      // Force template validity to true.
      if (!data.select('core/block-editor').isValidTemplate()) {
        // see https://github.com/WordPress/gutenberg/issues/11681
        data.dispatch('core/block-editor').setTemplateValidity(true);
      }
    });

    // To avoid restore backup notices from local autosave.
    sessionStorage.removeItem('wp-autosave-block-editor-post-1');
    localStorage.removeItem('wp-autosave-block-editor-post-1');

    // The former Drupal welcome guide had a preference of its own: whoever
    // dismissed it doesn't see the welcome guide again.
    const preferences = data.select('core/preferences');
    if (preferences.get('core/edit-post', 'welcomeGuideDrupalDisabled')) {
      const { set } = data.dispatch('core/preferences');
      set('core/edit-post', 'welcomeGuide', false);
      set('core/edit-post', 'welcomeGuideDrupalDisabled', undefined);
    }

    await DrupalGutenberg.editEntity.initializeEditor(
      target,
      wp.node.type,
      wp.node.id,
      editorSettings,
      [],
    );

    // Initialize the command palette (Cmd+K / Ctrl+K).
    if (wp.coreCommands?.initializeCommandPalette) {
      wp.coreCommands.initializeCommandPalette({});
    }

    // Register "Remote Videos" inserter media category.
    if (Drupal.isMediaEnabled()) {
      data.dispatch('core/block-editor').registerInserterMediaCategory({
        name: 'remote_videos',
        labels: {
          name: Drupal.t('Remote Videos'),
          search_items: Drupal.t('Search remote videos'),
        },
        mediaType: 'image',
        fetch: async (query = {}) => {
          const params = new URLSearchParams({
            media_type: 'remote_video',
            per_page: String(query.per_page || 10),
            ...(query.search ? { search: query.search } : {}),
          });
          const response = await fetch(
            Drupal.url(`editor/media/list?${params}`),
          );
          const items = await response.json();
          return items.map((item) => ({
            ...item,
            title: item.title || item.media_entity?.label || '',
            url: item.source_url || item.oembed_source_url || '',
            sourceUrl: item.oembed_source_url || item.source_url || '',
            previewUrl: item.media_details?.sizes?.medium?.source_url || '',
          }));
        },
      });

      // Transform core/image blocks with OEmbed URLs to core/embed.
      // We use mediaType 'image' so thumbnails render as <img> in the
      // inserter, but the vendor then creates core/image blocks. We detect
      // OEmbed URLs and replace with core/embed for proper video embedding.
      const OEMBED_PATTERNS = [
        /youtube\.com\/watch/,
        /youtu\.be\//,
        /vimeo\.com\//,
        /dailymotion\.com\//,
        /dai\.ly\//,
        /tiktok\.com\//,
        /facebook\.com\/.*\/videos\//,
        /twitter\.com\/.*\/status\//,
        /x\.com\/.*\/status\//,
        /spotify\.com\//,
        /soundcloud\.com\//,
      ];
      const isOEmbedUrl = (url) =>
        url && OEMBED_PATTERNS.some((p) => p.test(url));

      const findOEmbedImageBlock = (blockList) => {
        for (const block of blockList) {
          if (
            block.name === 'core/image' &&
            isOEmbedUrl(block.attributes.url)
          ) {
            return block;
          }
          if (block.innerBlocks?.length) {
            const found = findOEmbedImageBlock(block.innerBlocks);
            if (found) {
              return found;
            }
          }
        }
        return null;
      };

      let transforming = false;

      data.subscribe(() => {
        if (transforming) {
          return;
        }

        const allBlocks = data.select('core/block-editor').getBlocks();
        const oembedBlock = findOEmbedImageBlock(allBlocks);

        if (oembedBlock) {
          transforming = true;
          const embedBlock = wp.blocks.createBlock('core/embed', {
            url: oembedBlock.attributes.url,
            type: 'video',
            responsive: true,
          });
          data
            .dispatch('core/block-editor')
            .replaceBlock(oembedBlock.clientId, embedBlock);
          setTimeout(() => {
            transforming = false;
          }, 200);
        }
      });
    }
  },
};

/**
 * Gutenberg media library behavior.
 *
 * @type {Object}
 */
Drupal.behaviors.gutenbergMediaLibrary = {
  attach(context) {
    const $form = $('#media-entity-browser-modal .media-library-add-form');
    if (!$form.length) {
      return;
    }

    const $context = $(context);
    const $dialog = $context.closest('.ui-dialog-content');

    // Altering new media entity form buttons.
    $form
      .find('[data-drupal-selector="edit-save-insert"]')
      .css('display', 'none');

    // Applied only to the add media form modal context.
    if (context && context.id === 'media-library-add-form-wrapper') {
      const saveAndSelectButton = $form.find(
        '[data-drupal-selector="edit-save-select"]',
      );
      if (saveAndSelectButton.length) {
        // Hide button.
        saveAndSelectButton.css({
          display: 'none',
        });

        // Add button to buttonpane.
        const originalButtons = $dialog.dialog('option', 'buttons');
        const buttons = [];
        buttons.push({
          text: saveAndSelectButton.html() || saveAndSelectButton.attr('value'),
          class: saveAndSelectButton.attr('class'),
          click(e) {
            saveAndSelectButton
              .trigger('mousedown')
              .trigger('mouseup')
              .trigger('click');
            // Restore buttons
            $dialog.dialog('option', 'buttons', originalButtons);
            e.preventDefault();
          },
        });
        $dialog.dialog('option', 'buttons', buttons);
      }
    }
  },
};

/**
 * Update drupal block.
 *
 * @param {number|string} id
 *                           Id.
 */
async function updateDrupalBlockBasedOnMediaEntity(id) {
  const { dispatch } = wp.data;
  const response = await fetch(Drupal.url(`editor/media/render/${id}`));
  if (response.ok) {
    const mediaEntity = await response.json();

    if (mediaEntity && mediaEntity.view_modes) {
      dispatch('drupal').setMediaEntity(id, mediaEntity);
    }
  }
}

/**
 * Add new command for reloading the media block after editing..
 */
Drupal.AjaxCommands.prototype.gutenbergUpdateMediaEntities = function () {
  const { select } = wp.data;
  const selectedBlock = select('core/block-editor').getSelectedBlock();
  const { attributes } = selectedBlock;
  const { mediaEntityIds } = attributes;
  updateDrupalBlockBasedOnMediaEntity(mediaEntityIds[0]);
};
