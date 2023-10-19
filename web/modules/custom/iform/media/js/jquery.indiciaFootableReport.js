//
// jQuery plugin to add html to inidica report tables and then invoke
// footables upon them to make them responsive.
// http://fooplugins.com/plugins/footable-jquery/
//
(function($) {
  // Track whether the controls tab has an event handler attached
  var tabsHandled = false;

  function removeFilterRow($table) {
    return $table.find('.filter-row,.es-filter-row').detach();
  }

  function restoreFilterRow($table, $filterRow) {
    // Each filter cell needs restoring with the same visibility as the
    // corresponding header cell
    var $headerCells = $table.find('th');
    var $filterCells = $filterRow.find('th,td');
    // If there is no filter row then do nothing.
    if ($filterRow.length === 0) {
      return;
    }
    // Loop through the table headers
    $headerCells.each(function eachTh(index) {
      var $filterCell = $filterCells.eq(index);
      if ($(this).css('display') === 'none') {
        // This column is hidden so hide it in the filter.
        $filterCell.css('display', 'none');
        $filterCell.removeClass('footable-visible');
      } else {
        // This column is visible so ensure it appears in the filter.
        $filterCell.css('display', '');
        $filterCell.addClass('footable-visible');
      }
    });
    $table.find('thead tr:first-child').after($filterRow);
  }


  // Add indiciaFootableReport to the jQuery function object.
  $.fn.indiciaFootableReport = function indiciaFootableReport(options) {
    // Loop through the selected items (which are assumed to be indicia
    // report grid containers).
    this.each(function eachEl() {
      // Work on the table which is a child of the container div.
      var $table = $(this).find('table');

      // Using the version-independent 'on' function requires a selector for
      // the table to uniquely locate it from the context of document.
      var tableSelector = '#' + $(this).attr('id') + ' table';
      // We need to manually remove the filter row before trying to
      // initialise with FooTable.
      var $filterRow = removeFilterRow($table);
      var $tabs = $(this).closest('#controls');

      // Attach an event handler to precede the normal footable_redraw to
      // remove the filter row on all future changes too.
      indiciaFns.on('footable_resizing.indiciaFootableReport', tableSelector, {}, function onResizing() {
        // Remove the filter row from the thead before calling footable
        removeFilterRow($table);
      });

      // Get all the responsive goodness from FooTable.
      $table.footable(options);

      // Manually restore the filter row after initialisation with FooTable.
      restoreFilterRow($table, $filterRow);

      // Attach an event handler to follow the normal footable_redraw to
      // reattach the filter row on all future changes.
      indiciaFns.on('footable_resized.indiciaFootableReport', tableSelector, $filterRow, function onResized() {
        restoreFilterRow($table, $filterRow);
      });

      // The table may be hidden on a tab, in which case it will have not
      // responded to resize events. Therefore, when its tab is activated,
      // trigger a redraw.
      // The tabs may not be initialised at the point when this code is hit but
      // the html will be present and the Dynamic Report Explorer puts all the
      // tabs in a div#controls.

      if ($tabs.length > 0 && !tabsHandled) {
        tabsHandled = true;
        indiciaFns.bindTabsActivate($tabs, function tabActivate(evt, ui) {
          var panel = typeof ui.newPanel === 'undefined' ? ui.panel : ui.newPanel[0];
          var $tables = $(panel).find('table.footable');
          if ($tables.length > 0) {
            // The activated panel holds some footablea.
            $tables.each(function eachTable() {
              var ft;
              $table = $(this);
              ft = $table.data('footable');
              ft.resize();
            });
          }
        });
      }
    });

    // Return the original object for chaining.
    return this;
  };
})(jQuery);
