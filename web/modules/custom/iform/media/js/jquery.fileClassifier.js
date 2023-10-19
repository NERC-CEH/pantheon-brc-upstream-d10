/**
 * Indicia, the OPAL Online Recording Toolkit.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see http://www.gnu.org/licenses/gpl.html.
 */

/*
The file classifier has two modes of operation:

 - single mode: all the files added to the classifier are sent to the
   classifier to obtain one result.
 - multi mode: the files added to the classifier are sent one at a time to 
   obtain multiple results.

The classifier can be

 - embedded in a species_checklist, in which case it has to be in single mode
   since the classifier is per-occurrence.
 - linked to a species_checklist, in which case it can be in single or multi
   mode since the classifier is per-checklist
 - linked to a single species input (not yet implemented), in which case it 
   would have to be in single mode.

When linked to a species_checklist, if the same classification result is
obtained several times, then that can either 
 - add several ocuurences, one for each classification result or,
 - append all the classification results to one occurrence.

If the classifer is embedded in a species_checklist and on the empty,
cloable-row then it will lead to the addition of a new row. If it is on an
existing, added-row, then the results will be added to that same row, possibly
updating the taxon. Currently having more than one result per occurrence is
disabled by removing the classify button after a single use. That is a blunt
instrument, added because the classifier can only handle a single image
currently.

These possibilities are stored in a mode setting which can take the following
values:
 - single:embedded
 - single:checklist:add
 - multi:checklist:add
 - single:checklist:append
 - multi:checklist:append
 - single:<control>:add

When the classifier is embedded in a species_checklist, a button is added to the
empty row at the bottom of the species grid. Click to open up a file
classifier control, add files, then click the classify button. All the files
are sent to the classifier to produce one classification result. Giving the
classifier several files of the same specimen may help the classifier give a
more accurate result. You could start with one file, classify, add another
file, classify again. Each time you hit the classify button, all the files are
sent and another classification result is added.

When the classifier is linked to a species_checklist, a file classifier
control is placed on the page with a species grid. Add as many files as you
like (within limits of the file uploader) then click the classify button. Each
file is sent to the classifier, one after the other. Rows are added to the grid
for each new identified species. If the same species is identified again, the
count of the record is incremented. A classification result is created for each
file and the file is added to the occurrence. Where a file is not
identified, a record of the unknown taxon is created.

To avoid database inconsistencies, we'll have to delete classification results
as files are deleted or prevent file deletion. 

More work may be needed here to customise the interface to the capabilities of
the classifier being used, e.g. PlantNet allows an image of a flower and a leaf
but you need to tag the image to indicate what it is.
*/



/** 
 * Scripts may add functions to this array and they will be executed after
 * the classifier has added a new occurrence to a species grid.
 * The function should accept two arguments:
 * * $row, a jQuery object of the row affected in the species grid. If there was
 *   already an occurrence of the species this is an existing row.
 * * prediction, an object containing the response from the classifier.
 */
let hook_image_classifier_new_occurrence = [];

(function ($) {

  /**
   * The document.ready function.
   */
  $(function(){
    // Add a click handler for the classify button in all classifier controls.
    indiciaFns.on('click', '.classify-btn', classify);
    
    // Add a click handler for the add-classifier button in a species grid. 
    // This adds a row containing a classifier when in single mode.
    indiciaFns.on('click', '.add-classifer-link', indiciaData.classifySettings, function(evt){
      // Call the handler is in addRowToGrid.js to add the classifier.
      // The classifySettings are passed through in evt.data.
      addMediaRowOnClick(evt);
      // Locate the new classifier which has been added in a row following the 
      // one with the button.
      let $div = $(evt.target).closest('tr').next().find('div')
      // Configure the classifier.
      $div.classifier();
    });    

    // Hook in to the addRowToGrid.handleSelectedTaxon function to update 
    // classifier suggestions when the recorder edits a taxon.
    hook_species_checklist_new_row.push(handleSelectedTaxon);

    // Hook in to the jquery.uploader delete-file click handler to update 
    // classifier results when the recorder deletes media.
    mediaDeleteAddedHooks.push(handleDeletedMedia);

    // Add a hidden dialog to use with all classifier controls.
    let bootstrapButton;
    if (typeof $.fn.button.noConflict != 'undefined'){
      // If Bootstap is also present it can cause conflicts with jQuery UI.
      // This should relieve that, hopefully.
      // See https://stackoverflow.com/a/23428433
      // In particular it affects the X button for closing the dialog.
      bootstrapButton = $.fn.button.noConflict();
    }

    let dialogHtml = '<div id="image-classifier-dialog"><p></p></div>';
    $('body').append(dialogHtml);
    // Initialise but immediately hide the dialog.
    $('#image-classifier-dialog')
      .dialog({
        modal: true,
      })
      .dialog('close');

    if (bootstrapButton) {
      // Restore Bootstrap behaviour if it was replaced.
      $.fn.button = bootstrapButton;
    }
  
  });


  // Add a method to the jQuery namespace to configure new classifiers.
  $.fn.classifier = function() {
    // Iterate over all objects that the function is called on. 
    return this.each(function() {
      if (!$(this).hasClass('file-box')) {
        // Only file boxes can be turned in to classifiers.
        return;
      }

      // Add a class to identifiy this as a classifier.
      $(this).addClass('file-classifier');

      // Add a classify button.
      // Obtain index of upload button which we will also give to the classify 
      // button so it is unique on page.
      let $upload = $(this).find('button');
      let id = $upload.attr('id');
      // The id is like upload-select-btn-<index>
      let index = id.split('-')[3];
      // Set up the classify button.
      let classifyBtn = this.settings.buttonTemplate
        .replace('{caption}', this.settings.classifyBtnCaption)
        .replace('{id}', 'classify-btn-' + index)
        .replace('{class}', 'classify-btn')
        .replace('{title}', this.settings.classifyBtnTitle);
      // Adding it after the upload button.
      $(classifyBtn).insertAfter($upload);
    });
  }


  /**
   * Event handler called when classification requested. Sends images to
   * a classifier and handles the responses.
   * @param {object} evt - The triggering event object.
   */
  function classify(evt){
    // Obtain the classifier object containing the button.
    let $classifier = $(evt.target).closest('div');
    let div = $classifier[0];

    // Get the list of files to be classified.
    files = getFilesInFilebox(div, $classifier);

    if (files.length === 0) {
      // Nothing to do as no files.
      return;
    }

    // Put up a jQueryUI dialog saying we are going to clasify the file.
    showDialog(div, 'dialogStart', false);

    // Set up handler for tracking progress with posts.
    let nrPosts;
    let nrSuccess = 0;
    let nrFail = 0;
    let donePost = function(response) {
      if (response === false) {
        nrPosts--;
        nrFail++;
      }
      else {
        nrPosts--;
        nrSuccess++;
      }

      if (nrPosts === 0) {
        // Put up a jQueryUI dialog saying we are done.
        // We could add something about number of successes and failures.
        showDialog(div, 'dialogEnd');
      }
    };

    // Post the files to the classifier.
    if (div.settings.mode.includes('single')) {
      // All the files are classified to give one result.
      nrPosts = 1;
      doPost(div, files)
      .then(donePost)
      .catch(donePost);
    }
    else {
      // Each file is classified to give a separate result.
      nrPosts = files.length;
      files.forEach((file) => {
        doPost(div, [file])
        .then(donePost)
        .catch(donePost);
       });
    }
  };


  /**
   * Send files to a classifier
   * 
   * @param {object} div - Contains all the details of the control.
   * @param {array} files - Array of file objects to be classified.
   * @returns {promise} 
   */
  function doPost(div, files) {
    return new Promise((resolve, reject) => {
      // At present the classifier module can only handle one image at a time.
      $.post(div.settings.url, {
        'image': files[0].path,
        'list': div.settings.taxonListId
      })
      .done(function(response){
        handleResponse(div, files, response);
        resolve(response);
      })
      .fail(function(){
        handleResponse(div, files, null)
        reject(false);
      });

    })
  }


  /**
   * Deals with the outcome of classification.
   * @param {object} div - Contains all the details of the control.
   * @param {array} files - Array of file objects that were classified.
   * @param {object} response - Response from the classifier
   */
  function handleResponse(div, files, response){
    let unknown = div.settings.unknownTaxon;
    let $row;
 
    if (response === null) {
      // Classifier encountered an error.
      // Add a row with unknown species
      $row = addSpecies(div, files, unknown);
    }
    else {
      if(response.suggestions.length > 0) {
        // Automatically add the first suggestion initially.
        // We may add in some user interaction here later.
        let prediction = Object.assign({}, response.suggestions[0])
        // Copy the suggestion to prediction so we can modify it without
        // changing response.
        if(typeof prediction.taxa_taxon_list_id === 'undefined'){
          // Classifier found a match but it was not in the Indicia species list.
          // Add a row with unknown species
          $row = addSpecies(div,files, unknown);
        }
        else {
          // Classifier matched a species.
          // Assuming that all classifiers will be using scientific names. If
          // not, will need to add language in to classifier response.
          prediction.language_iso = 'lat'
          $row = addSpecies(div, files, prediction);
          let probability = Math.floor(prediction.probability * 100);
        }
      }
      else {
        // Classifier made no suggestions.
        $row = addSpecies(div, files, unknown);
      }

      // Increment count attribute (which must have system function of
      // sex-stage-count). I'm assuming it is a text box in which numerals are
      // entered but realise there are other possibilities.
      let $count = $row.find('input.system-function-sex_stage_count');
      let value = Number($count.val());
      if (isNaN(value)) {
        // Maybe we need a dialogue with the recorder about this but, for now, 
        // we'll just set it to something matching expectations.
        value = 1;
      }
      else {
        value++;;
      }
      // Update the value and trigger any change handlers which may be attached.
      $count.val(value).change();

      // Prepare suggestions for saving.
      // The taxon_name_given cannot be null but the Drupal classification
      // module currently returns nothing if there is no match to a taxon in the
      // warehouse.
      // Initially assume the human agrees with the classifier.
      let suggestions = [], i;
      for (let i = 0; i < response.suggestions.length; i++) {
        let suggestion = response.suggestions[i];
        suggestions.push({
          'taxon_name_given': suggestion.taxon ?? '',
          'taxa_taxon_list_id': suggestion.taxa_taxon_list_id,
          'probability_given': suggestion.probability,
          'classifier_chosen': i == 0 ? 't' : 'f',
          'human_chosen': i == 0 ? 't' : 'f'
        });
      }

      // Prepare media as an array of file names that were used.
      let media = files.map(file => file.path);

      // Prepare result, containing suggestions, for saving.
      let result = JSON.stringify({
        'fields': {
          'classifier_id': response.classifier_id,
          'classifier_version': response.classifier_version,
          'results_raw': JSON.stringify(response)
        },
        'media': media,
        'suggestions': suggestions
      });

      // Save classifer response to html input for posting to our website.
      // Inputs should be named like
      //   sc:<species_checklist id>-<rowIdx>::classification_result:<index>
      // We need a classification result index as an occurrence can have 
      // multiple classification results. This may go wrong if we allow results
      // to be deleted but image indexing is done similarly.
      let table =  getInputNameRoot($row) + 'classification_result';
      let index = $row.next().find('.classification-result').length;
      let inputName = `${table}:${index}`;
      let $filelist = $row.next().find('.filelist');
      $(`<textarea id="${inputName}" name="${inputName}" class="classification-result" style="display:none"></textarea>`)
        .insertAfter($filelist)
        .text(result);
    }

    // Allow forms to hook into the event of a new occurrence being added.
    $.each(hook_image_classifier_new_occurrence, function (idx, fn) {
      fn(prediction, $row);
    });
    
  }


  /**
   * Change the content of the dialog to show the classification outcome.
   * @param {object} div - Contains all the details of the control.
   * @param {string} key - Specifies the property in div.settings holding the
   * text template.
   * @param {boolean} closable - Specifies whether the dialog can be closed by
   * the user.
   * @param {...string} [replacements] - Values to use as replacements in the 
   * text template for placeholders like {1}
   */
  function showDialog(div, key, closable = true, ...replacements) {
    let template = div.settings[key];

    // Replace any placeholders like {1} in the template.
    for (let i = 0; i < replacements.length; i++) {
      template = template.replace(`{${i + 1}}`, replacements[i]);
    }
    
    // Output dialog text 
    $('#image-classifier-dialog p').html(template)

    if (closable) {
      $('#image-classifier-dialog').dialog('option', {
        title: div.settings.dialogTitle,
        closeOnEscape: true,
        buttons: [{
          text: div.settings.dialogBtnOk,
          click: function() {
            $(this).dialog('close');
          }
        }]
      });
    }
    else {
      $('#image-classifier-dialog').dialog('option', {
        title: div.settings.dialogTitle,
        closeOnEscape: false,
        buttons: []
      });
    }

    $('#image-classifier-dialog').dialog('open');
  }


  /**
   * Adds the classification result to the species input.
   * 
   * Currently only supports a species checklist for input.
   * @param {object} div - Contains all the details of the control.
   * @param {array} files - Array of file objects that were classified.
   * @param {object} prediction - The response from the classifier
   * @returns The jquery object of the added row in the species grid.
   */
  function addSpecies(div, files, prediction) {
    if (!div.settings.mode.includes('embedded') &&
        !div.settings.mode.includes('checklist')) {
      // Alternative inputs not yet supported.
      return;
    }

    let $grid;
    // Locate the species_checklist.
    if (div.settings.mode.includes('embedded')) {
      let containerId = $.escapeSelector(div.settings.container);
      $grid = $('#' + containerId).closest('table');
      }
    else if (div.settings.mode.includes('checklist')) {
      let gridId = $.escapeSelector(div.settings.taxonControlId);
      $grid = $('#' + gridId);
    }

    let $speciesRow = null;
    if (div.settings.mode.includes('checklist:append')) {
      // Search for an existing occurrence of the same species if we can 
      // append to a linked checklist
      if (prediction.taxa_taxon_list_id !== 
          div.settings.unknownTaxon.taxa_taxon_list_id) {
        // This is not a record of unknown. (Unknown is never appended.)
        $grid.find('.added-row').each(function() {
          let ttlId = $(this).find('input.scTaxaTaxonListId').val();
          if (ttlId === prediction.taxa_taxon_list_id) {
            // Found a match.
            $speciesRow = $(this);
            // Stop the loop.
            return false;
          }
        })
      }
    }
    else if (div.settings.mode.includes('embedded')) {
      // Search for an associated occurrence which we may amend.
      let containerId = $.escapeSelector(div.settings.container); 
      let $imageRow = $('#' + containerId).closest('tr')
      if ($imageRow.prev().hasClass('added-row')) {
        $speciesRow = $imageRow.prev();
      }
    }

    if ($speciesRow === null) {
      // Add the species as a new occurrence.

      // Locate the autocomplete control to use for adding species.
      let $clonableRow = $grid.find('.scClonableRow');
      let $autocomplete = $clonableRow.find('.scTaxonCell input');

      // Trigger the event in addRowToGrid.js to add the species.
      $autocomplete.trigger('result', [prediction, prediction.taxa_taxon_list_id]);

      // Find the new species row which will be the last added-row in the grid.
      $speciesRow = $grid.find('.added-row').last();
    }
    else if (div.settings.mode.includes('embedded')) {
      // Amend the current taxon with the new result.
      // Not yet implemented.
    }
    
    // If we are linked to a checklist, move the files to the speciesRow.
    if (div.settings.mode.includes('checklist')) {
      moveImagesToGrid(div, $speciesRow, files)
    }
 
    // Prevent the insertion of another image row.
    $speciesRow.find('.add-media-link').hide();

    // For now, prevent further images being classified to put off the work of
    // resolving the results of multiple classifications.
    $imageRow = $speciesRow.next();
    $imageRow.find('button.classify-btn').hide();

    return $speciesRow;
  }


  /**
   * Move the file from the classifier to the correct row of the species grid.
   * 
   * This is called by a linked classifier. It adds a filebox to the row if
   * there is not one already present.
   * @param {object} div - Contains all the details of the control.
   * @param {object} $row - The jquery object of the added row in the species
   * grid.
   * @param {array} files - Array of file objects that were classified.
   */
  function moveImagesToGrid(div, $row, files) {
    // Test to see if there is already an image for this row.
    if (!$row.next().hasClass('image-row')) {
      // If not, trigger the event to add an image row.
      $row.find('.add-media-link').click();
    }
    // Locate the file list in the image row where we move the files.
    let $dest = $row.next().find('div.filelist');
    // Determine the prefix we will need to add to input names.
    let nameRoot = getInputNameRoot($row);

    let $classifer = $('#container-' + div.settings.id);
    files.forEach((file) => {
      // Locate the file in the classifier.
      let $src = $classifer.find('#' + file.mediafileId);
      // Rename the file inputs to match the species_checklist convention.
      $src.find('input').each(function() {
        let $this = $(this);
        if ($this.attr('id').startsWith('occurrence_medium')) {
          let newName = nameRoot + $this.attr('id');
          $this.attr('id', newName);
          $this.attr('name', newName);
        }
      });

      // Move the file to the image row.
      $dest.append($src);
     })

   // Remove the 'Drop files here...' text.
    $dest.find('span.drop-instruct').remove();
  }


  /**
   * Returns the name root for all inputs in a checklist row.
   * 
   * This can be extracted from the id of the presence checkbox which has the
   * form sc:<gridId>-<rowIdx>:<occurrenceId?>:present
   * @param {object} $row - The jquery object of a checklist added-row.
   * @returns {string} The name root which is of the form
   * sc:<gridId>-<rowIdx>:<occurrenceId?>:
   */
  function getInputNameRoot($row) {
    let presenceId = $row.find('input.scPresence').attr('id');
    let nameRootEnd = presenceId.indexOf('present');
    let nameRoot = presenceId.substring(0, nameRootEnd);
    return nameRoot;
  }


  /**
   * Get the list of file names contained in a filebox.
   * @param {object} div - Contains all the details of the control.
   * @param {object} $filebox - a jQuery object of the control.
   * @returns {array} An array of file objects in the filebox
   */
  function getFilesInFilebox(div, $filebox) {
    let files = [];
    $filebox.find('.mediafile').each(function() {
      let file = getFileInContainer(div, $(this));
      files.push(file);
    });
    return files;
  }


  /**
   * Get the properties of a file in a div.mediafile container.
   * @param {object} div - Contains all the details of the control.
   * @param {object} $container - jQuery object of the div.mediafile.
   * @returns {object} A file object holding the file properties.
   */
  function getFileInContainer(div, $container) {
    let file = {'mediafileId': $container.attr('id')};
    $container.find('input').each(function() {
      let id = $(this).attr('id');
      let idParts = id.split(':');
      let table, property;

      if (idParts[0] === 'sc') {
        // Ids we look for in a species checklist are like 
        // sc:<gridId>-<rowIdx>:<occurrenceId?>:occurrence_medium:<property>:<fiileIdx>
        table = idParts[3];
        property = idParts[4];
      }
      else {
        // Ids we look for in a standalone control are like
        // occurrence_medium:<property>:<fiileIdx>
        table = idParts[0];
        property = idParts[1];
      }

      if (table === 'occurrence_medium') {
        file[property] =  $(this).val();
      }
    });
    return file;
  }


  /**
   * Update suggestions.human_chosen when taxon altered.
   * 
   * This functions is triggered when 
   * - species are added manually
   * - species are added by the classifier
   * - species are edited namually.
   * In the latter case, we need to alter the human_chosen property of  
   * suggestions in all the classification results for the row.
   * @param {object} data - The output from the species autocomplete 'result'
   * @param {object} row - The DOM object of the row that has changed.
   */
  function handleSelectedTaxon(data, row) {
    let $filebox = $(row).next().find('.file-box');
    if ($filebox.length > 0) {
      // The row may have classification results.
      $filebox.find('.classification-result').each(function() {
        // Iterate over classification results.
        let result = JSON.parse($(this).text());
        result.suggestions.forEach((suggestion) => {
          // Iterate over suggestions.
          if (suggestion.taxa_taxon_list_id === data.taxa_taxon_list_id) {
            // The human choice matches this suggestion.
            suggestion.human_chosen = 't';
          }
          else {
            suggestion.human_chosen = 'f';
          }
        });
        // Update the classification result.
        $(this).text(JSON.stringify(result));
      });
    }
  }


  /**
   * Remove results based on media that has been deleted.
   * 
   * Note that a linked classifier puts results in a regular filebox while an
   * embedded classifier has additional behaviour.
   * @param {object} $container - jQuery object of the div.mediafile to be
   * deleted.
   * @param {boolean} isNew - true is results not saved to warehouse.
   */
  function handleDeletedMedia($container, isNew) {
    let $filebox = $container.closest('.file-box');

    if ($filebox.length > 0) {
      // Find the file being deleted.
      let div = $filebox[0];
      file = getFileInContainer(div, $container);

      $filebox.find('.classification-result').each(function() {
        // Iterate over classification results.

        let result = JSON.parse($(this).text());
        if(result.media.includes(file.path)) {
          // The classification result is deleted as it is no longer backed up
          // by the media which created it.
          if (isNew) {
            // Simply remove the result as it has not been saved to warehouse.
            $(this).remove();
          }
          else {
            // The editing of records with saved classification results is a
            // whole big chunk of work yet to be tackled.
          }
        }
      });

      if ($filebox.hasClass('file-classifier') &&
        $filebox.find('classification-result').length === 0) {
        // Restore the classify button that we are hidiing for embedded
        // classifiers if there are no results left.
        $filebox.find('button.classify-btn').show();
      }
    }
  }

}(jQuery));
