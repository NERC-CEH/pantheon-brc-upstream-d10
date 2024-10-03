(function ($, Drupal) {
  $(document).ready(function() {
    if (indiciaData.logoPath && indiciaData.logoSelector) {
      var logoEl = $(indiciaData.logoSelector).first();
      // Find the main page logo and insert this after.
      $('<img src="' + indiciaData.warehouseUrl + 'upload/' + indiciaData.logoPath + '" id="group-logo">')
        .appendTo(logoEl);
    }
  });

  Drupal.behaviors.group_landing_pages = {
    attach: function (context, settings) {
      once('attach-group-blog', 'html', context).forEach(
        function() {
          $(document).ajaxComplete(function (event, xhr, settings) {
            if (settings.url && settings.url.match(/^\/group_landing_pages\/modal_blog_form/)) {
              $('.view-id-group_blog_entries').trigger('RefreshView');
            }
          });
        }
      );
    }
  };

})(jQuery, Drupal);
