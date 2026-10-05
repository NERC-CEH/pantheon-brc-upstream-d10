/**
 * @file
 * Javascript behaviors for the Gutenberg module admin.
 */

/* eslint func-names: ["error", "never"] */
(function($, Drupal, once) {
  /**
   * Adds summaries to the book outline form.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches summary behavior to book outline forms.
   */
  Drupal.behaviors.gutenbergAdmin = {
    attach(context) {
      const $elements = $(
        once(
          'view-reusable-blocks-item-click',
          '.view-reusable-blocks .views-view-responsive-grid__item, .view-reusable-blocks .views-col',
          context,
        ),
      );

      $($elements)
        .find('input[type="checkbox"]')
        .click(e => {
          e.stopPropagation();
        });

      $($elements).click(e => {
        $(e.currentTarget)
          .find('input[type="checkbox"]')
          .click();
      });

      if (context !== document) {
        return;
      }

      $('input[name*="allowed_blocks_"]:not([value*="/all"])').click(ev => {
        const category = $(ev.currentTarget)
          .val()
          .split('/')[0];
        const checked = $(ev.currentTarget).is(':checked');

        if (checked) {
          return;
        }

        $(`input[name="allowed_blocks_${category}[${category}/all]"]`)
          .not(':disabled')
          .prop('checked', checked);
      });

      $('input[name*="allowed_blocks_core"][value*="/all"]').click(ev => {
        const category = $(ev.currentTarget)
          .val()
          .split('/')[0];
        const checked = $(ev.currentTarget).is(':checked');

        $(`input[name*="allowed_blocks_${category}[${category}"]`)
          .not(':disabled')
          .prop('checked', checked);
      });

      $('input[name^="allowed_drupal_blocks_"][value*="/all"]').click(ev => {
        const $target = $(ev.currentTarget);
        const category = $target
          .val()
          .split('/')[0];
        const checked = $target.is(':checked');

        // Check/uncheck siblings.
        $(`input[name^="allowed_drupal_blocks_${category}[`)
          .not(':disabled')
          .prop('checked', checked);
      });

      $('input[name="allowed_image_styles[image_styles/all]"]').click(ev => {
        const checked = $(ev.currentTarget).is(':checked');

        // Check/uncheck siblings.
        $(`input[name^="allowed_image_styles[`)
          .prop('checked', checked);
      });

      $('input[name="allowed_content_block_types[content-block/all]"]').click(ev => {
        const checked = $(ev.currentTarget).is(':checked');

        // Check/uncheck siblings.
        $(`input[name^="allowed_content_block_types[`)
          .prop('checked', checked);
      });

      $('details.more-settings', context).on('toggle', function () {
        // When opening, scroll enough so the user can see the whole More Settings content.
        if (this.open) {
          this.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
          });
        }
      });
    },
  };
})(jQuery, Drupal, once);
