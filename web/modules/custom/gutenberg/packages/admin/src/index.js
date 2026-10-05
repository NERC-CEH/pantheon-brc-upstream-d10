/* global Drupal, jQuery, once */
const $ = jQuery;

import '../../../css/admin.scss';

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
      .click((e) => {
        e.stopPropagation();
      });

    $($elements).click((e) => {
      $(e.currentTarget).find('input[type="checkbox"]').click();
    });

    if (context !== document) {
      return;
    }

    // "All" options of the allowed lists (blocks, Drupal blocks, image styles,
    // content block types, SDC components). The "All" value itself is dropped
    // on submit, so it only toggles the other checkboxes of its list.
    $('input[type="checkbox"][value$="/all"]')
      .toArray()
      .forEach((all) => {
        const $all = $(all);
        const group = all.name.slice(0, all.name.indexOf('['));
        const $options = $(`input[type="checkbox"][name^="${group}["]`)
          .not($all)
          .not(':disabled');
        const syncAll = () => {
          $all.prop(
            'checked',
            $options.length > 0 && $options.not(':checked').length === 0,
          );
        };

        $all.on('click', () => {
          $options.prop('checked', $all.is(':checked'));
        });
        $options.on('click', syncAll);
        syncAll();
      });

    $('details.more-settings', context).on('toggle', function () {
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
