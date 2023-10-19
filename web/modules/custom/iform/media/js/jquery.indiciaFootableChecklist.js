//
// jQuery plugin to make inidica species checklist tables responsive.
// Employs Footables 2, http://fooplugins.com/plugins/footable-jquery/
//
// Includes a lot of messing around to get over the problem that the checklist
// can dynamically add a colummn for buttons when a species is entered which
// messes up all the FooTable calculations. It also has to contend with
// existing functions to add and delete rows.

// Declare a variable of global scope, if not already defined, to allow us to
// hook in to addRowToGrid.js when a row is about to be deleted.
if (typeof hook_species_checklist_pre_delete_row === "undefined") {
    hook_species_checklist_pre_delete_row = null;
  }

(function($){
  // Add indiciaFootableChecklist to the jQuery function object.
  $.fn.indiciaFootableChecklist = function(options) {

    // Loop through the selected items (which are assumed to be indicia
    // checklist tables).
    this.each(function() {
      // Work on the table which is a child of the container div.
      var $table = $(this);

      // Using the version-independent 'on' function requires a selector for
      // the table to uniquely locate it from the context of document.
      var tableSelector = '#' + $table.attr('id');

      // We need to massage any clonable row before initialising with FooTable
      // to get rid of colspans.
      prepareClonableRow($table);

      // Attach an event handler to precede the normal footable_redraw and
      // row_update to prepare the cloneable row on all future changes too.
      indiciaFns.on('footable_resizing', tableSelector, {}, function(){
        var $table = $(this);
        prepareClonableRow($table);
      });
      indiciaFns.on('footable_row_detail_updating', tableSelector, {}, function(e){
        if (e.row.hasClass('scClonableRow')) {
          var $table = $(this);
          prepareClonableRow($table);
        }
      });

      // Get all the responsive goodness from FooTable.
      $table.footable(options);

      // Restore the clonable row after initialisation with FooTable.
      restoreClonableRow($table);

      // Attach an event handler to follow the normal footable_redraw and
      // row_update to restore the clonable row on all future changes.
      indiciaFns.on('footable_resized', tableSelector, {}, function(){
        var $table = $(this);
        restoreClonableRow($table);
      });
      indiciaFns.on('footable_row_detail_updated', tableSelector, {}, function(e){
        if (e.row.hasClass('scClonableRow')) {
          var $table = $(this);
          restoreClonableRow($table);
        }
      });

      //
      // ADD ROW
      //
      // Use the hook from addRowToGrid.js to ensure new row is drawn properly.
      hook_species_checklist_new_row.push(function(data, row){
        var $table = $(row).closest('table');
        prepareClonableRow($table);
        var ft = $table.data('footable');
        ft.redraw();
        restoreClonableRow($table);
      });

      //
      // DELETE ROW
      //
      // Use the pre-delete hook from addRowToGrid.js to ensure row deletion is
      // drawn properly.
      // Needs careful handling to avoid overwriting any other user of the
      // hook which is single-valued.
      var existingPreDeleteFunction = null;
      if(hook_species_checklist_pre_delete_row !== null){
        var existingPreDeleteFunction = hook_species_checklist_pre_delete_row;
      }
      hook_species_checklist_pre_delete_row = function(e){
        if(existingPreDeleteFunction !== null){
          // Call the existing function first.
          existingPreDeleteFunction(e);
        }

        // Now do whatever we need to do for pre-delete.
        var $row = $(e.target).closest('tr');
        var $next = $row.next();
        var $table = $row.closest('table');
        var ft = $table.data('footable');

        if ($next.hasClass(ft.options.classes.detail) === true) {
            //remove the detail row
          if ($row.hasClass('added-row')) {
            $next.remove();
          } else {
            // This was a pre-existing occurrence so we can't just delete the row from the grid. Grey it out
            $next.css('opacity',0.25);
            // disable or remove all active controls from the row.
            // Do NOT disable the sample Index field if present, otherwise it is not submitted.
            $next.find('*:not(.scSample,.scSampleCell)').attr('disabled','disabled');
            $next.find('a').remove();
          }
        }


        return true;
      };

      //
      // ADD MEDIA
      //
      // Take over the event handling of the media links from addRowToGrid.js.
      // The way it adds rows to the grid is not compatible with FooTables so
      // an alternative is supplied.
      indiciaFns.off('click', '.add-media-link');
      indiciaFns.on('click', tableSelector + ' .add-media-link', {}, function(evt) {
        evt.preventDefault();
        var $button = $(evt.target);
        var $buttonRow = $button.closest('tr'), $row;
        var $table = $buttonRow.closest('table');
        var ft = $table.data('footable');
        // The button may be in a principal row or a detail row.
        if ($buttonRow.hasClass(ft.options.classes.detail)) {
          $row = $buttonRow.prev();
        }
        else {
          $row = $buttonRow;
        }

        // Mark the row as having media added.
        $row.addClass('has-media');

        // Ensure the details row is displayed.
        $button.hide();
        if (!$row.hasClass(ft.options.classes.detailShow)) {
          ft.toggleDetail($row);
        }
        // Ensure that the media details will be visible.
        updateMediaDetails($row);

        // Locate the container for the media upload control we must create.
        var $container = $row.next().find('.scMedia');
        // The file-box class is not added until now because addRowToGrid uses
        // it as a marker for deleting rows in the non-reponsive case.
        $container.addClass('file-box');
        // Extract the 'table' value for the upload control which is buried in
        // the container id in the format
        // container-tableValue-randomNumber
        var containerId = $container.attr('id');
        var tableStart = containerId.indexOf('-') + 1;
        var tableEnd = containerId.lastIndexOf('-');
        var table = containerId.slice(tableStart, tableEnd);
        // Attach a file uploader to the container.
        mediaTypes = indiciaData.uploadSettings.mediaTypes;
        var opts={
//          caption : (mediaTypes.length===1 && mediaTypes[0]==='Image:Local') ? 'Photos' : 'Files',
          caption: '',
          autoupload: '1',
          msgUploadError: 'An error occurred uploading the file.',
          msgFileTooBig: 'The image file cannot be uploaded because it is larger than the maximum file size allowed.',
          runtimes: 'html5,flash,silverlight,html4',
          imagewidth: '250',
          uploadScript: indiciaData.uploadSettings.uploadScript,
          destinationFolder: indiciaData.uploadSettings.destinationFolder,
          relativeImageFolder: indiciaData.uploadSettings.relativeImageFolder,
          jsPath: indiciaData.uploadSettings.jsPath,
          table: table,
          maxUploadSize: '4000000', // 4mb
          container: containerId,
          autopick: true,
          mediaTypes: mediaTypes
        };
        if (typeof indiciaData.uploadSettings.resizeWidth !== "undefined") { opts.resizeWidth = indiciaData.uploadSettings.resizeWidth; }
        if (typeof indiciaData.uploadSettings.resizeHeight !== "undefined") { opts.resizeHeight = indiciaData.uploadSettings.resizeHeight; }
        if (typeof indiciaData.uploadSettings.resizeQuality !== "undefined") { opts.resizeQuality = indiciaData.uploadSettings.resizeQuality; }
        if (typeof buttonTemplate !== "undefined") { opts.buttonTemplate = buttonTemplate; }
        if (typeof file_boxTemplate !== "undefined") { opts.file_boxTemplate = file_boxTemplate; }
        if (typeof file_box_initial_file_infoTemplate !== "undefined") { opts.file_box_initial_file_infoTemplate = file_box_initial_file_infoTemplate; }
        if (typeof file_box_uploaded_imageTemplate !== "undefined") { opts.file_box_uploaded_imageTemplate = file_box_uploaded_imageTemplate; }
        $container.uploader(opts);
      });

      //
      // DISPLAY MEDIA
      //
      // Manage the display of the Media and Add Media fields in the details
      // view.
      indiciaFns.on('footable_row_detail_updated', tableSelector, {}, function(e) {
        updateMediaDetails(e.row);
      });

      // Return the original object for chaining.
      return this;
    });
  }

  /**
   * Given a row with a details row, updates addMedia and Media
   * field visibility according to row state.
   * @param object $row A jQuery object of a table row.
   */
  function updateMediaDetails($row) {
    var $next = $row.next();
    var ft = $row.closest('table').data('footable');
    var $media = $next.find('div.scMedia');
    var $mediaRow = $media.closest('.' + ft.options.classes.detailInnerRow);

    if ($row.hasClass('has-media')) {
      var $addMedia = $next.find('.add-media-link');
      var $addMediaRow = $addMedia.closest('.' + ft.options.classes.detailInnerRow);
      $addMediaRow.hide();
      $mediaRow.show();
    }
    else {
      $mediaRow.hide();
    }
  }

  /**
   * Removes the colspan in the Clonable Row.
   * @param object $table A jQuery object of the table.
   */
  function prepareClonableRow($table) {
    var $clonableRow = $table.find('.scClonableRow');
    var $taxonCell = $clonableRow.find('.scTaxonCell');
    var colspan = $taxonCell.attr('colspan');
    if(colspan == 2) {
      // To prevent FooTable getting in a muddle we must insert a table cell
      // and set colspan to 1.
      $taxonCell.before('<td class="indicia-footable-temp"></td>');
      $taxonCell.attr('colspan', '1');
    }
  }

  /**
   * Restores the colspan in the Clonable Row.
   * @param object $table A jQuery object of the table
   */
  function restoreClonableRow($table) {
    var $clonableRow = $table.find('.scClonableRow');
    var $tempCell = $clonableRow.find('.indicia-footable-temp')
    if($tempCell.length > 0) {
      // Remove the temporary cell inserted to help FooTable and restore the
      // colspan to 2.
      $tempCell.remove();
      var $taxonCell = $clonableRow.find('.scTaxonCell');
      $taxonCell.attr('colspan', '2');
    }
  }

})(jQuery);