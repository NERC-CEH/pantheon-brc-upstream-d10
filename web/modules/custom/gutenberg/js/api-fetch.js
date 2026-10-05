/* eslint func-names: ["error", "never"] */
(function(wp, Drupal, drupalSettings, $) {
  const { t } = Drupal;

  /**
   * Retrieves the Gutenberg CSRF token.
   */
  function getCsrfToken() {
    return drupalSettings.gutenberg.csrfToken;
  }

  /**
   * Parse query strings into an object.
   * @see https://stackoverflow.com/a/2880929
   *
   * @param {string} query The query string
   *
   * @return {object} The decoded query string as an object.
   */
  function parseQueryStrings(query) {
    let match;
    const urlParams = {};
    // Regex for replacing addition symbol with a space
    const pl = /\+/g;
    const search = /([^&=]+)=?([^&]*)/g;
    const decode = function(s) {
      return decodeURIComponent(s.replace(pl, ' '));
    };

    // eslint-disable-next-line no-cond-assign
    while ((match = search.exec(query)) !== null) {
      if (decode(match[1]) in urlParams) {
        if (!Array.isArray(urlParams[decode(match[1])])) {
          urlParams[decode(match[1])] = [urlParams[decode(match[1])]];
        }
        urlParams[decode(match[1])].push(decode(match[2]));
      } else {
        urlParams[decode(match[1])] = decode(match[2]);
      }
    }

    return urlParams;
  }

  /**
   * Handles API errors.
   *
   * @param {object} errorResponse The error object.
   * @param {function} reject The promise reject callback.
   * @param {string|null} fallbackMessage The fallback error message.
   */
  function errorHandler(errorResponse, reject, fallbackMessage = null) {
    let errorMessage;
    let rawHTML = false;
    if (errorResponse && errorResponse.responseJSON) {
      const responseJSON = errorResponse.responseJSON;
      if (typeof responseJSON.error === 'string') {
        errorMessage = responseJSON.error;
      } else if (typeof responseJSON.message === 'string') {
        // ExceptionJsonSubscriber error handler.
        errorMessage = responseJSON.message;
      }
      if (errorMessage && responseJSON.rawHTML) {
        rawHTML = responseJSON.rawHTML;
      }

      // We need to reject with the responseJSON object so that the
      // Gutenberg API can handle the error.
      reject(responseJSON);
      return;
    }

    if (!errorMessage && fallbackMessage) {
      errorMessage = fallbackMessage;
    }

    if (errorMessage) {
      Drupal.notifyError(errorMessage, rawHTML);
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `API error: unexpected error message: ${JSON.stringify(errorResponse)}`,
      );
    }

    reject(errorResponse);
  }

  const taxonomies = {
    wp_pattern_category: {
      name: t('Pattern Categories'),
      slug: 'wp_pattern_category',
      capabilities: {
        manage_terms: 'manage_categories',
        edit_terms: 'manage_categories',
        delete_terms: 'manage_categories',
        assign_terms: 'edit_posts',
      },
      description: '',
      labels: {
        name: t('Pattern Categories'),
        singular_name: t('Pattern Category'),
        search_items: t('Search Tags'),
        popular_items: t('Popular Tags'),
        all_items: t('Pattern Categories'),
        parent_item: null,
        parent_item_colon: null,
        name_field_description: 'The name is how it appears on your site.',
        slug_field_description:
          'The &#8220;slug&#8221; is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens.',
        parent_field_description: null,
        desc_field_description:
          'The description is not prominent by default; however, some themes may show it.',
        edit_item: 'Edit Tag',
        view_item: 'View Tag',
        update_item: 'Update Tag',
        add_new_item: 'Add New Tag',
        new_item_name: 'New Tag Name',
        separate_items_with_commas: 'Separate tags with commas',
        add_or_remove_items: 'Add or remove tags',
        choose_from_most_used: 'Choose from the most used tags',
        not_found: 'No tags found.',
        no_terms: 'No tags',
        filter_by_item: null,
        items_list_navigation: 'Tags list navigation',
        items_list: 'Tags list',
        most_used: 'Most Used',
        back_to_items: '&larr; Go to Tags',
        item_link: 'Tag Link',
        item_link_description: 'A link to a tag.',
        menu_name: 'Pattern Categories',
        name_admin_bar: 'Pattern Category',
        archives: 'Pattern Categories',
      },
      types: ['wp_block'],
      show_cloud: true,
      hierarchical: false,
      rest_base: 'wp_pattern_category',
      rest_namespace: 'wp/v2',
      visibility: {
        public: false,
        publicly_queryable: false,
        show_admin_column: true,
        show_in_nav_menus: false,
        show_in_quick_edit: true,
        show_ui: true,
      },
    },
  };

  // Not in use.
  const templates = [
    {
      id: 'theme//page',
      theme: 'theme',
      content: {
        raw:
          '<!-- wp:template-part {"slug":"header","theme":"twentytwentyfour","tagName":"header","area":"header"} /-->\n\n<!-- wp:group {"tagName":"main"} -->\n<main class="wp-block-group"><!-- wp:group {"layout":{"type":"constrained"}} -->\n<div class="wp-block-group"><!-- wp:spacer {"height":"var:preset|spacing|50"} -->\n<div style="height:var(--wp--preset--spacing--50)" aria-hidden="true" class="wp-block-spacer"></div>\n<!-- /wp:spacer -->\n\n<!-- wp:post-title {"textAlign":"center","level":1} /-->\n\n<!-- wp:spacer {"height":"var:preset|spacing|30","style":{"spacing":{"margin":{"top":"0","bottom":"0"}}}} -->\n<div style="margin-top:0;margin-bottom:0;height:var(--wp--preset--spacing--30)" aria-hidden="true" class="wp-block-spacer"></div>\n<!-- /wp:spacer -->\n\n<!-- wp:post-featured-image {"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|40"}}}} /--></div>\n<!-- /wp:group -->\n\n<!-- wp:columns -->\n<div class="wp-block-columns"><!-- wp:column {"width":"33.33%"} -->\n<div class="wp-block-column" style="flex-basis:33.33%"><!-- wp:heading -->\n<h2 class="wp-block-heading">Testing template changes</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>Will it work?</p>\n<!-- /wp:paragraph --></div>\n<!-- /wp:column -->\n\n<!-- wp:column {"width":"66.66%"} -->\n<div class="wp-block-column" style="flex-basis:66.66%"><!-- wp:post-content {"lock":{"move":false,"remove":true},"layout":{"type":"constrained"}} /--></div>\n<!-- /wp:column --></div>\n<!-- /wp:columns --></main>\n<!-- /wp:group -->\n\n<!-- wp:template-part {"slug":"footer","theme":"twentytwentyfour","tagName":"footer","area":"footer"} /-->',
        block_version: 1,
      },
      slug: 'page',
      source: 'custom',
      origin: 'theme',
      type: 'wp_template',
      description:
        'Display all static pages unless a custom template has been applied or a dedicated template exists.',
      title: {
        raw: 'Pages',
        rendered: 'Pages',
      },
      status: 'publish',
      wp_id: 1,
      has_theme_file: true,
      is_custom: false,
      author: 1,
      modified: '2023-11-14T11:31:04',
    },
  ];

  const types = {
    page: {
      id: 1,
      labels: {
        singular_name: drupalSettings.gutenberg.nodeTypeLabel,
        Document: drupalSettings.gutenberg.nodeTypeLabel,
        document: drupalSettings.gutenberg.nodeTypeLabel,
        item_published: 'Content saved.',
        item_reverted_to_draft: 'Content saved.',
        // posts: Drupal.t('Nodes'),
      },
      name: 'Page',
      rest_base: 'pages',
      slug: 'page',
      supports: {
        author: false,
        comments: false, // hide discussion-panel
        'custom-fields': true,
        editor: true,
        'editor.notes': !!drupalSettings.gutenberg?.notesEnabled,
        excerpt: false,
        discussion: false,
        'page-attributes': false, // hide page-attributes panel
        revisions: false,
        thumbnail: false, // featured-image panel
        // The canvas title is opt-in per content type, otherwise the title is
        // managed by Drupal's form field in the sidebar.
        title: !!drupalSettings.gutenberg?.titleInEditor,
        layout: false,
      },
      taxonomies: [],
    },
    attachment: {
      labels: {
        singular_name: 'Media',
        name: 'Media',
      },
      name: 'Attachments',
      rest_base: 'media',
      rest_namespace: 'wp/v2',
      slug: 'attachment',
      supports: {
        title: true,
        author: false,
      },
      taxonomies: [],
      viewable: true,
    },
    wp_block: {
      capabilities: {},
      labels: {
        singular_name: 'Block',
      },
      name: 'Blocks',
      rest_base: 'blocks',
      slug: 'wp_block',
      description: '',
      hierarchical: false,
      supports: {
        title: true,
        editor: true,
      },
      viewable: true,
    },
    // Not in use.
    wp_template: {
      capabilities: {
        edit_post: 'edit_template',
        read_post: 'read_template',
        delete_post: 'delete_template',
        edit_posts: 'edit_theme_options',
        edit_others_posts: 'edit_theme_options',
        delete_posts: 'edit_theme_options',
        publish_posts: 'edit_theme_options',
        read_private_posts: 'edit_theme_options',
        read: 'edit_theme_options',
        delete_private_posts: 'edit_theme_options',
        delete_published_posts: 'edit_theme_options',
        delete_others_posts: 'edit_theme_options',
        edit_private_posts: 'edit_theme_options',
        edit_published_posts: 'edit_theme_options',
        create_posts: 'edit_theme_options',
      },
      description: 'Templates to include in your theme.',
      hierarchical: false,
      has_archive: false,
      visibility: {
        show_in_nav_menus: false,
        show_ui: false,
      },
      viewable: false,
      labels: {
        name: 'Templates',
        singular_name: 'Template',
        add_new: 'Add New Template',
        add_new_item: 'Add New Template',
        edit_item: 'Edit Template',
        new_item: 'New Template',
        view_item: 'View Template',
        view_items: 'View Posts',
        search_items: 'Search Templates',
        not_found: 'No templates found.',
        not_found_in_trash: 'No templates found in Trash.',
        parent_item_colon: 'Parent Template:',
        all_items: 'Templates',
        archives: 'Template archives',
        attributes: 'Post Attributes',
        insert_into_item: 'Insert into template',
        uploaded_to_this_item: 'Uploaded to this template',
        featured_image: 'Featured image',
        set_featured_image: 'Set featured image',
        remove_featured_image: 'Remove featured image',
        use_featured_image: 'Use as featured image',
        filter_items_list: 'Filter templates list',
        filter_by_date: 'Filter by date',
        items_list_navigation: 'Templates list navigation',
        items_list: 'Templates list',
        item_published: 'Post published.',
        item_published_privately: 'Post published privately.',
        item_reverted_to_draft: 'Post reverted to draft.',
        item_trashed: 'Post trashed.',
        item_scheduled: 'Post scheduled.',
        item_updated: 'Post updated.',
        item_link: 'Post Link',
        item_link_description: 'A link to a post.',
        menu_name: 'Templates',
        name_admin_bar: 'Template',
      },
      name: 'Templates',
      slug: 'wp_template',
      icon: null,
      supports: {
        title: true,
        slug: true,
        excerpt: true,
        editor: true,
        revisions: true,
        author: true,
      },
      taxonomies: [],
      rest_base: 'templates',
      rest_namespace: 'wp/v2',
    },
  };

  // Build user object from Drupal's current user data when available.
  const drupalUser = drupalSettings.gutenberg?.currentUser || {};
  const collabUser = drupalSettings.gutenberg?.collaboration?.currentUser || {};
  const avatarUrl = collabUser.avatarUrl || drupalUser.avatarUrl || '';
  const user = {
    id: drupalUser.id || 1,
    name: drupalUser.name || 'Anonymous',
    url: '',
    description: '',
    link: '',
    slug: (drupalUser.name || 'anonymous').toLowerCase().replace(/\s+/g, '-'),
    avatar_urls: {
      24: avatarUrl,
      48: avatarUrl,
      96: avatarUrl,
    },
    meta: [],
    _links: {
      self: [],
      collection: [],
    },
  };

  const requestPaths = {
    'save-page': {
      method: 'PUT',
      regex: /\/wp\/v2\/pages\/(\d*)/g,
      process(matches, data) {
        const date = new Date().toISOString();

        window.wp.node = {
          ...window.wp.node,
          date,
          date_gmt: date,
          status: 'publish',
          content: {
            raw: data.content,
            rendered: data.content,
          },
          // Keep an edited title, or the save response would revert it.
          ...(typeof data.title === 'string' && {
            title: {
              raw: data.title,
              rendered: data.title,
            },
          }),
        };

        return new Promise(resolve => {
          resolve(window.wp.node);
        });
      },
    },
    'load-node': {
      method: 'GET',
      regex: /\/wp\/v2\/pages\/(\d*)/g,
      process() {
        return new Promise(resolve => {
          resolve(window.wp.node);
        });
      },
    },
    'page-options': {
      method: 'OPTIONS',
      regex: /\/wp\/v2\/pages/g,
      process() {
        return new Promise(resolve => {
          resolve({
            headers: {
              get: value => {
                if (value === 'allow') {
                  return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
                }
              },
            },
          });
        });
      },
    },
    'media-options': {
      method: 'OPTIONS',
      regex: /\/wp\/v2\/media/g,
      process() {
        return new Promise(resolve => {
          resolve({
            headers: {
              get: value => {
                if (value === 'allow') {
                  return ['GET', 'POST'];
                }
              },
            },
          });
        });
      },
    },
    'edit-media': {
      method: 'POST',
      regex: /\/wp\/v2\/media\/((\d+)\/edit(.*))/,
      process(matches, data) {
        return new Promise((resolve, reject) => {
          const csrfToken = getCsrfToken();
          Drupal.toggleGutenbergLoader('show');
          $.ajax({
            method: 'POST',
            url: Drupal.url(`editor/media/edit/${matches[2]}`),
            headers: {
              'X-CSRF-Token': csrfToken,
            },
            data,
          })
            .done(resolve)
            .fail(error => {
              errorHandler(error, reject);
            })
            .always(() => {
              Drupal.toggleGutenbergLoader('hide');
            });
        });
      },
    },
    'load-media': {
      method: 'GET',
      regex: /\/wp\/v2\/media\/(\d+)/,
      process(matches) {
        return new Promise((resolve, reject) => {
          Drupal.toggleGutenbergLoader('show');
          $.ajax({
            method: 'GET',
            url: Drupal.url(`editor/media/load/${matches[1]}`),
          })
            .done(resolve)
            .fail(error => {
              errorHandler(error, reject);
            })
            .always(() => {
              Drupal.toggleGutenbergLoader('hide');
            });
        });
      },
    },
    'save-media': {
      method: 'POST',
      regex: /\/wp\/v2\/media/g,
      process(matches, data, options) {
        const csrfToken = getCsrfToken();
        return new Promise((resolve, reject) => {
          let file;
          const entries = options.body.entries();

          for (const pair of entries) {
            if (pair[0] === 'file') {
              /* eslint prefer-destructuring: ["error", {"array": false}] */
              file = pair[1];
            }
          }

          const formData = new FormData();
          formData.append('files[fid]', file);
          formData.append('fid[fids]', '');
          formData.append('attributes[alt]', 'Test');
          formData.append('_drupal_ajax', '1');
          formData.append('form_id', $('[name="form_id"]').val());
          formData.append('form_build_id', $('[name="form_build_id"]').val());
          formData.append('form_token', $('[name="form_token"]').val());

          Drupal.toggleGutenbergLoader('show');
          $.ajax({
            method: 'POST',
            // TODO match the current editor instance dynamically.
            url: Drupal.url('editor/media/upload/gutenberg'),
            headers: {
              'X-CSRF-Token': csrfToken,
            },
            data: formData,
            dataType: 'json',
            cache: false,
            contentType: false,
            processData: false,
          })
            .done(result => {
              if (Drupal.isMediaEnabled()) {
                Drupal.notifySuccess(
                  Drupal.t(
                    'File and media entity have been created successfully.',
                  ),
                );
              } else {
                Drupal.notifySuccess(
                  Drupal.t('File entity has been created successfully.'),
                );
              }
              resolve(result);
            })
            .fail(error => {
              errorHandler(error, reject);
            })
            .always(() => {
              Drupal.toggleGutenbergLoader('hide');
            });
        });
      },
    },
    'load-medias': {
      method: 'GET',
      regex: /\/wp\/v2\/media($|\?(.*))/g,
      process(matches) {
        const params = matches[2] ? parseQueryStrings(matches[2]) : {};
        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'GET',
            url: Drupal.url('editor/media/list'),
            data: params,
          })
            .done(result => {
              resolve(result);
            })
            .fail(error => {
              errorHandler(error, reject);
            });
        });
      },
    },
    'load-media-library-dialog': {
      method: 'GET',
      regex: /load-media-library-dialog/g,
      process(matches, data) {
        Drupal.toggleGutenbergLoader('show');
        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'GET',
            url: Drupal.url('editor/media/dialog'),
            data: {
              types: (data.allowedTypes || []).join(','),
              bundles: (data.allowedBundles || []).join(','),
            },
          })
            .done(resolve)
            .fail(error => {
              errorHandler(error, reject);
            })
            .always(() => {
              Drupal.toggleGutenbergLoader('hide');
            });
        });
      },
    },
    'load-media-edit-dialog': {
      method: 'GET',
      regex: /load-media-edit-dialog/g,
      process() {
        // FIXME is this actually used?
        Drupal.toggleGutenbergLoader('show');
        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'GET',
            url: Drupal.url('media/6/edit'),
          })
            .done(resolve)
            .fail(error => {
              errorHandler(error, reject);
            })
            .always(() => {
              Drupal.toggleGutenbergLoader('hide');
            });
        });
      },
    },
    categories: {
      method: 'GET',
      regex: /\/wp\/v2\/categories\?(.*)/g,
      process() {
        return new Promise(resolve => {
          resolve([]);
        });
      },
    },
    users: {
      method: 'GET',
      regex: /\/wp\/v2\/users\/\?(.*)/g,
      process() {
        return new Promise(resolve => {
          resolve([user]);
        });
      },
    },
    taxonomies: {
      method: 'GET',
      regex: /\/wp\/v2\/taxonomies/g,
      process() {
        return new Promise(resolve => {
          resolve(taxonomies);
        });
      },
    },
    embed: {
      method: 'GET',
      regex: /\/oembed\/1\.0\/proxy\?(.*)/g,
      process(matches) {
        return new Promise((resolve, reject) => {
          const data = parseQueryStrings(matches[1]);
          data.maxWidth = data.maxWidth || 800;

          $.ajax({
            method: 'GET',
            url: Drupal.url('editor/oembed'),
            data,
          })
            .done(resolve)
            .fail(error => {
              errorHandler(error, reject);
            });
        });
      },
    },
    root: {
      method: 'GET',
      regex: /(^\/$|^$)/g,
      process() {
        return new Promise(resolve => {
          resolve({
            theme_supports: {
              formats: [
                'standard',
                'aside',
                'image',
                'video',
                'quote',
                'link',
                'gallery',
                'audio',
              ],
              'post-thumbnails': true,
            },
          })
        });
      },
    },
    themes: {
      method: 'GET',
      regex: /\/wp\/v2\/themes\?(.*)/g,
      process() {
        return new Promise(resolve => {
          resolve([
            {
              stylesheet: 'default',
              status: 'active',
              theme_supports: {
                formats: [
                  'standard',
                  'aside',
                  'image',
                  'video',
                  'quote',
                  'link',
                  'gallery',
                  'audio',
                ],
                'post-thumbnails': true,
                'responsive-embeds': false,
              },
            },
          ])
        });
      },
    },

    'load-type-page': {
      method: 'GET',
      regex: /\/wp\/v2\/types\/page/g,
      process() {
        return new Promise(resolve => {resolve(types.page)});
      },
    },
    'load-type-block': {
      method: 'GET',
      regex: /\/wp\/v2\/types\/wp_block/g,
      process() {
        return new Promise(resolve => {resolve(types.block)});
      },
    },
    'load-type-attachment': {
      method: 'GET',
      regex: /\/wp\/v2\/types\/attachment/g,
      process() {
        return new Promise(resolve => {resolve(types.attachment)});
      },
    },
    'load-type': {
      method: 'GET',
      regex: /\/wp\/v2\/types\/(\w+)/g,
      process(matches) {
        const slug = matches[1];
        return new Promise((resolve, reject) => {
          if (types[slug]) {
            resolve(types[slug]);
          } else {
            reject(new Error(`Post type not found: ${slug}`));
          }
        });
      },
    },
    'load-types': {
      method: 'GET',
      regex: /\/wp\/v2\/types($|\?(.*))/g,
      process() {
        return new Promise(resolve => {resolve(types)});
      },
    },

    'update-block': {
      method: 'PUT',
      regex: /\/wp\/v2\/blocks\/(\d+)/g,
      process(matches, data) {
        const csrfToken = getCsrfToken();
        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'PUT',
            url: Drupal.url(`editor/reusable-blocks/${data.id}`),
            headers: {
              'X-CSRF-Token': csrfToken,
            },
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            dataType: 'json',
          })
            .done(resolve)
            .fail(error => {
              errorHandler(error, reject);
            });
        });
      },
    },

    'delete-block': {
      method: 'DELETE',
      regex: /\/wp\/v2\/blocks\/(\d+)/g,
      process(matches) {
        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'DELETE',
            url: Drupal.url(`editor/reusable-blocks/${matches[1]}`),
          })
            .done(resolve)
            .fail(error => {
              errorHandler(error, reject);
            });
        });
      },
    },

    'insert-block': {
      method: 'POST',
      regex: /\/wp\/v2\/blocks/g,
      process(matches, data) {
        const csrfToken = getCsrfToken();
        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'POST',
            url: Drupal.url('editor/reusable-blocks'),
            headers: {
              'X-CSRF-Token': csrfToken,
            },
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            dataType: 'json',
            cache: false,
            processData: false,
          })
            .done(resolve)
            .fail(error => {
              errorHandler(error, reject);
            });
        });
      },
    },
    'load-block': {
      method: 'GET',
      regex: /\/wp\/v2\/blocks\/(\d*)/g,
      process(matches) {
        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'GET',
            url: Drupal.url(`editor/reusable-blocks/${matches[1]}`),
          })
            .done(resolve)
            .fail(error => {
              errorHandler(error, reject);
            });
        });
      },
    },
    'load-blocks': {
      method: 'GET',
      regex: /\/wp\/v2\/blocks\?(.*)/g,
      process(matches) {
        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'GET',
            url: Drupal.url(`editor/reusable-blocks`),
            data: parseQueryStrings(matches[1]),
          })
            .done(resolve)
            .fail(error => {
              errorHandler(error, reject);
            });
        });
      },
    },
    'block-options': {
      method: 'OPTIONS',
      regex: /\/wp\/v2\/blocks/g,
      process() {
        return new Promise(resolve => {
          resolve({
            headers: {
              get: value => {
                if (value === 'allow') {
                  return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
                }
              },
            },
          });
        });
      },
    },

    'insert-pattern-category': {
      method: 'POST', // /wp/v2/wp_pattern_category
      regex: /\/wp\/v2\/wp_pattern_category/g,
      process(matches, data) {
        const csrfToken = getCsrfToken();
        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'POST',
            url: Drupal.url('editor/patterns/categories'),
            headers: {
              'X-CSRF-Token': csrfToken,
            },
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            dataType: 'json',
            cache: false,
            processData: false,
          })
            .done(resolve)
            .fail(error => {
              errorHandler(error, reject);
            });
        });
      },
    },
    'load-pattern-categories': {
      method: 'GET',
      regex: /\/wp\/v2\/wp_pattern_category/g,
      process(matches) {
        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'GET',
            url: Drupal.url(`editor/patterns/categories`),
            data: parseQueryStrings(matches[1]),
          })
            .done(resolve)
            .fail(error => {
              errorHandler(error, reject);
            });
        });
      },
    },

    'search-content': {
      method: 'GET',
      regex: /\/wp\/v2\/search\?(.*)/g,
      process(matches) {
        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'GET',
            url: Drupal.url('editor/search'),
            data: parseQueryStrings(matches[1]),
          })
            .done(result => {
              resolve(result);
            })
            .fail(err => {
              reject(err);
            });
        });
      },
    },

    'load-autosaves': {
      method: 'GET',
      regex: /\/wp\/v2\/(.*)\/autosaves\?(.*)/g,
      process() {
        return new Promise(resolve => {
          resolve([]);
        });
      },
    },
    'save-autosaves': {
      method: 'POST',
      regex: /\/wp\/v2\/(.*)\/autosaves\?(.*)/g,
      process() {
        return new Promise(resolve => {
          resolve([]);
        });
      },
    },
    'load-me': {
      method: 'GET',
      regex: /\/wp\/v2\/users\/me/g,
      process() {
        return new Promise(resolve => {
          resolve(user);
        });
      },
    },
    'set-me': {
      method: [ 'POST', 'PUT', 'PATCH' ],
      regex: /^\/wp\/v2\/users\/me/g,
      process(matches, data, options) {
        return new Promise((resolve, reject) => {
          // Do nothing with the data. It's already been persisted in
          // localStorage.
          // @todo could create a Drupal controller to persist this data
          //   same as in WordPress.
          resolve(user);
        });
      },
    },
    // Not in use.
    'template-options': {
      method: 'OPTIONS',
      regex: /\/wp\/v2\/templates/g,
      process() {
        return new Promise(resolve => {
          resolve({
            headers: {
              get: value => {
                if (value === 'allow') {
                  return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
                }
              },
            },
          });
        });
      },
    },

    // Collaborative editing sync relay.
    // Routes @wordpress/sync HTTP polling to the Drupal sync endpoint.
    // Only active when the gutenberg_collaboration submodule is enabled.
    'sync-updates': {
      method: 'POST',
      regex: /\/wp-sync\/v1\/updates/g,
      process(matches, data, options) {
        if (!drupalSettings.gutenberg?.collaboration?.syncEnabled) {
          return Promise.reject(new Error('Collaboration not enabled'));
        }
        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'POST',
            url: Drupal.url('editor/collaboration/sync'),
            data: options.body,
            contentType: 'application/json',
            processData: false,
            headers: {
              'X-CSRF-Token': drupalSettings.gutenberg.csrfToken,
            },
          }).done(resolve).fail((jqXHR, textStatus, errorThrown) => {
            reject(new Error(`Sync failed: ${textStatus} ${errorThrown}`));
          });
        });
      },
    },

    // Gutenberg Notes (block-level comments).
    // Routes @wordpress/core-data comment entity requests to the Drupal
    // gutenberg_notes controller. Only active when the module is enabled.
    'delete-comment': {
      method: 'DELETE',
      regex: /\/wp\/v2\/comments\/(\d+)/g,
      process(matches) {
        if (!drupalSettings.gutenberg?.notesEnabled) {
          return Promise.reject(new Error('Notes not enabled'));
        }
        const commentId = matches[1];
        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'DELETE',
            url: Drupal.url(`editor/notes/${commentId}`),
            headers: {
              'X-CSRF-Token': getCsrfToken(),
            },
          }).done(resolve).fail((jqXHR, textStatus, errorThrown) => {
            reject(new Error(`Delete note failed: ${textStatus} ${errorThrown}`));
          });
        });
      },
    },
    'update-comment': {
      method: 'PUT',
      regex: /\/wp\/v2\/comments\/(\d+)/g,
      process(matches, data) {
        if (!drupalSettings.gutenberg?.notesEnabled) {
          return Promise.reject(new Error('Notes not enabled'));
        }
        const commentId = matches[1];
        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'PUT',
            url: Drupal.url(`editor/notes/${commentId}`),
            contentType: 'application/json',
            data: JSON.stringify(data),
            headers: {
              'X-CSRF-Token': getCsrfToken(),
            },
          }).done(resolve).fail((jqXHR, textStatus, errorThrown) => {
            reject(new Error(`Update note failed: ${textStatus} ${errorThrown}`));
          });
        });
      },
    },
    'create-comment': {
      method: 'POST',
      regex: /\/wp\/v2\/comments(?:$|\?)/g,
      process(matches, data) {
        if (!drupalSettings.gutenberg?.notesEnabled) {
          return Promise.reject(new Error('Notes not enabled'));
        }
        const notesConfig = drupalSettings.gutenberg.notes || {};
        const entityType = notesConfig.entityType || 'node';
        const entityId = data.post || notesConfig.entityId;

        // For root notes (not replies), include the selected block's type title
        // so the controller can store it as the comment subject.
        if (!data.parent) {
          const blockEditorSelect = wp.data.select('core/block-editor');
          const blocksSelect = wp.data.select('core/blocks');
          const clientId = blockEditorSelect.getSelectedBlockClientId();
          if (clientId) {
            const blockName = blockEditorSelect.getBlockName(clientId);
            const blockType = blockName ? blocksSelect.getBlockType(blockName) : null;
            data.block_type = blockType?.title || blockName || '';
          }
        }

        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'POST',
            url: Drupal.url(`editor/notes/${entityType}/${entityId}`),
            contentType: 'application/json',
            data: JSON.stringify(data),
            headers: {
              'X-CSRF-Token': getCsrfToken(),
            },
          }).done(resolve).fail((jqXHR, textStatus, errorThrown) => {
            reject(new Error(`Create note failed: ${textStatus} ${errorThrown}`));
          });
        });
      },
    },
    'load-comments': {
      method: 'GET',
      regex: /\/wp\/v2\/comments/g,
      process(matches, data, options) {
        if (!drupalSettings.gutenberg?.notesEnabled) {
          return Promise.resolve([]);
        }
        // Parse query params from the path to get the post ID.
        const pathParts = options.path.split('?');
        const params = pathParts.length > 1 ? parseQueryStrings(pathParts[1]) : {};
        const notesConfig = drupalSettings.gutenberg.notes || {};
        const entityType = notesConfig.entityType || 'node';
        const entityId = params.post || notesConfig.entityId;

        if (!entityId) {
          return Promise.resolve([]);
        }

        return new Promise((resolve, reject) => {
          $.ajax({
            method: 'GET',
            url: Drupal.url(`editor/notes/${entityType}/${entityId}`),
          }).done(resolve).fail((jqXHR, textStatus, errorThrown) => {
            reject(new Error(`Load notes failed: ${textStatus} ${errorThrown}`));
          });
        });
      },
    },
    'comment-options': {
      method: 'OPTIONS',
      regex: /\/wp\/v2\/comments/g,
      process() {
        return new Promise(resolve => {
          resolve({
            headers: {
              get: value => {
                if (value === 'allow') {
                  return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
                }
              },
            },
          });
        });
      },
    },

    // Not in use.
    'load-templates': {
      method: 'GET',
      regex: /\/wp\/v2\/templates($|\?(.*))/g,
      process() {
        return new Promise(resolve => {resolve(templates)});
      },
    },
  };

  /**
   * Wraps a data value in a Response-like object for callers using parse: false.
   *
   * WordPress 6.9+ core-data resolvers call apiFetch({ parse: false }) and expect
   * a Response object with .json() and .headers.get() methods.
   */
  function wrapAsResponse(data) {
    const items = Array.isArray(data) ? data : [];
    return {
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
      headers: {
        get: (name) => {
          const lower = name.toLowerCase();
          if (lower === 'allow') {
            return 'GET, POST, PUT, PATCH, DELETE';
          }
          if (lower === 'x-wp-total') {
            return String(items.length);
          }
          if (lower === 'x-wp-totalpages') {
            return '1';
          }
          return null;
        },
      },
    };
  }

  function processPath(options) {
    if (!options.path) {
      return new Promise(resolve => {resolve('No action required.')});
    }

    // for-in is used to be able to do a simple short-circuit
    // when a match is found.
    /* eslint no-restricted-syntax: ["error", "never"] */
    for (const key in requestPaths) {
      if (requestPaths.hasOwnProperty(key)) {
        const requestPath = requestPaths[key];
        requestPath.regex.lastIndex = 0;
        const matches = requestPath.regex.exec(`${options.path}`);

        if (
          matches &&
          matches.length > 0 &&
          ((options.method && options.method === requestPath.method) ||
            requestPath.method === 'GET')
        ) {
          try {
            const result = requestPath.process(matches, options.data, options);
            // When parse: false, callers expect a Response-like object with
            // .json() and .headers.get() methods (WordPress 6.9+).
            if (options.parse === false) {
              return result.then(data => wrapAsResponse(data));
            }
            return result;
          } catch (error) {
            // Handle unexpected exceptions.
            return Promise.reject(error);
          }
        }
      }
    }

    // None found, return type settings.
    return new Promise((resolve, reject) =>
      {reject(new Error(`API handler not found - ${JSON.stringify(options)}`))},
    );
  }

  processPath._originalApiFetch = wp.apiFetch;
  wp.apiFetch = processPath;
})(wp, Drupal, drupalSettings, jQuery);
