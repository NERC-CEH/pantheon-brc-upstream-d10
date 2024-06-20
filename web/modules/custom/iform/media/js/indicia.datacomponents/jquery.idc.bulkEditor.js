/**
 * @file
 * Plugin for a bulk editor tool.
 *
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
 *
 * @author Indicia Team
 * @license http://www.gnu.org/licenses/gpl.html GPL 3.0
 * @link https://github.com/indicia-team/client_helpers
 */

/**
* Output plugin for the verification record details pane.
*/
(function idcBulkEditor() {
  'use strict';
  var $ = jQuery;

  /**
   * Place to store public methods.
   */
  var methods;

  /**
   * Declare default settings.
   */
  var defaults = {};

  var callbacks = {
    onEdit: []
  };

  /* Private methods. */

  /**
   * Returns true if the source filter is limited to the current user's data.
   */
  function checkHasMyRecordsFilter(el, filter) {
    var filterFound = false;
    if (indiciaData.esScope === 'user') {
      return true;
    }
    if (typeof filter.bool_queries !== 'undefined') {
      filter.bool_queries.forEach((qry) => {
        if (qry.bool_clause === 'must' && typeof qry.field !== 'undefined' && qry.field === 'metadata.created_by_id'
            && typeof qry.query_type !== 'undefined' && qry.query_type === 'term'
            && typeof qry.value !== 'undefined' && qry.value == indiciaData.user_id) {
          filterFound = true;
        }
      });
    }
    return filterFound;
  }

  /**
   * Popup a message if the edit cannot proceed.
   */
  function cannotProceedMessage(message) {
    $.fancyDialog({
      title: indiciaData.lang.bulkEditor.cannotProceed,
      message: message,
      cancelButton: null
    });
  }

  /**
   * Fetches the source from the linked data control.
   *
   * @param DOM el
   *   The bulkEditor container element.
   */
  function linkToDataSource(el) {
    let settings = $(el)[0].settings;
    let ctrlSettings;
    if (!settings.sourceObject) {
      if ($('#' + settings.linkToDataControl).length !== 1) {
        indiciaFns.controlFail(el, 'Failed to find data control ' + settings.linkToDataControl + ' linked to bulkEditor');
      }
      // Find the source linked to the data control.
      ctrlSettings = $('#' + settings.linkToDataControl)[0].settings;
      settings.source = ctrlSettings.source;
      settings.sourceObject = indiciaData.esSourceObjects[Object.keys(settings.source)[0]];
      if (settings.sourceObject.settings.mode !== 'docs') {
        indiciaFns.controlFail(el, 'The bulkEditor control needs to link to a source that lists occurrences rather than aggregated data');
      }
    }
  }

  /**
   * Retrieve a summary of the work to do.
   *
   * @param DOM el
   *   The bulkEditor container element.
   */
  function getTodoListInfo(el) {
    const linkToDataControl = $('#' + $(el)[0].settings.linkToDataControl);
    const total = linkToDataControl[0].settings.sourceObject.settings.total;
    var r;
    var selectedItems;
    if (linkToDataControl.hasClass('multiselect-mode')) {
      // Using multi-select checkboxes, so find how many are checked.
      r = {
        total: $(linkToDataControl).find('.multiselect:checked').length,
        totalAsText: $(linkToDataControl).find('.multiselect:checked').length,
        message: indiciaData.lang.bulkEditor.bulkEditorDialogMessageSelected,
        ids: []
      };
      selectedItems = $(linkToDataControl).find('.multiselect:checked').closest('tr,.card')
      $.each(selectedItems, function eachRow() {
        const doc = JSON.parse($(this).attr('data-doc-source'));
        r.ids.push(parseInt(doc.id, 10));
      });
    } else {
      // Not using multi-select checkboxes, so return count of all records in filter.
      r = {
        total: total.value,
        totalAsText : (total.relation === 'gte' ? 'at least ' : '') + total.value,
        message: indiciaData.lang.bulkEditor.bulkEditorDialogMessageAll
      }
    }
    r.message = r.message.replace('{1}', r.totalAsText);
    return r;
  }

  /**
   * Adds a message to the progress log box on the dialog.
   *
   * @param DOM dlg
   *   Dialog element.
   * @param string info
   *   Information to log.
   */
  function logOutput(dlg, info) {
    dlg.find('.post-bulk-edit-info .output').append('<p>' + info + '</p>');
  }

  /**
   * Adds a progress information line to the output log.
   *
   * @param DOM dlg
   *   Dialog element
   * @param object affected
   *   Sample and occurrences updated by the last API request.
   */
  function showProgressInOutput(dlg, affected) {
    let p = dlg.find('.post-bulk-edit-info .output p:last-child');
    if (!p || !p.hasClass('progress-message')) {
      p = $('<p class="progress-message">').appendTo(dlg.find('.post-bulk-edit-info .output'));
      dlg.data('affected-samples', 0);
      dlg.data('affected-occurrences', 0);
    }
    dlg.data('affected-samples', dlg.data('affected-samples') + parseInt(affected.samples, 10));
    dlg.data('affected-occurrences', dlg.data('affected-occurrences') + parseInt(affected.occurrences, 10));
    $(p).html(indiciaData.lang.bulkEditor.bulkEditProgress
      .replace('{samples}', dlg.data('affected-samples'))
      .replace('{occurrences}', dlg.data('affected-occurrences'))
    )
  }

  /**
   * Checks the response from the server is status 200 OK.
   *
   * If not, adds a message to the log output and returns false.
   *
   * @param DOM dlg
   *   Dialog element.
   * @param object response
   *   API request response object.
   *
   * @returns bool
   *   True if status is 200 OK.
   */
  function checkResponseCode(dlg, response) {
    if (response.code !== 200 && response.code !== 204) {
      logOutput(dlg, indiciaData.lang.bulkEditor.error);
      logOutput(dlg, response.message);
      return false;
    }
    return true;
  }

  /**
   * Resest the dialog before doing a bulk edit.
   *
   * @param DOM dlg
   *   Dialog element.
   */
  function prepareForBulkEdit(dlg) {
    dlg.find('.pre-bulk-edit-info').hide();
    dlg.find('.post-bulk-edit-info .output *').remove();
    dlg.find('.post-bulk-edit-info').show();
    logOutput(dlg, indiciaData.lang.bulkEditor.preparing);
  }

  /**
   * Perform the actual bulk edit operation once proceed confirmed.
   *
   * @param DOM dlg
   *   Dialog element.
   * @param object data
   *   Data object to send to the warehouse bulk edit web-service.
   * @param string endpoint
   *   Name of the endpoint to call: bulkeditids for a list of ids, or
   *   bulkeditall to edit all records in the current filter.
   */
  function performBulkEdit(dlg, data, endpoint) {
    $.post(indiciaData.esProxyAjaxUrl + '/' + endpoint + '/' + indiciaData.nid, data, null, 'json')
    .done(function(response, textStatus, jqXHR) {
      if (response.code === 200 && response.search_after) {
        // Paging through a set of records, send the same request again, but
        // with search_after set.
        showProgressInOutput(dlg, response.affected);
        data.search_after = response.search_after;
        performBulkEdit(dlg, data, endpoint);
      } else if (response.code === 200 || response.code === 204) {
        // Finished.
        const settings = $('#' + $(dlg).attr('id').replace(/-dlg$/, ''))[0].settings;
        settings.sourceObject.populate(true);
        dlg.find('.post-bulk-edit-info .close-bulk-edit-dlg').removeAttr('disabled');
        logOutput(dlg, indiciaData.lang.bulkEditor.done);
        // @todo Notify the user that it worked.
      } else if (response.code === 409 && response.errorCode && response.errorCode === 'SAMPLES_CONTAIN_OTHER_OCCURRENCES') {
        $.fancyDialog({
          title: indiciaData.lang.bulkEditor.allowSampleSplitting,
          message: indiciaData.lang.bulkEditor.promptAllowSampleSplit
            .replace('{1}', response.errorData.sample_id)
            .replace('{2}', response.errorData.included_occurrence_id)
            .replace('{3}', response.errorData.excluded_occurrence_id),
          okButton: indiciaData.lang.bulkEditor.confirm,
          callbackOk: function() {
            if (!data.options) {
              data.options = {};
            }
            data.options.allowSampleSplits = true;
            performBulkEdit(dlg, data, endpoint);
          },
          callbackCancel: function() {
            $.fancybox.close();
          }
        });
      } else {
        logOutput(dlg, indiciaData.lang.bulkEditor.error);
        if (response.message) {
          logOutput(dlg, response.message);
        }
        dlg.find('.post-bulk-edit-info .close-bulk-edit-dlg').removeAttr('disabled');
      }
    })
    .fail(function() {
      logOutput(dlg, indiciaData.lang.bulkEditor.error);
      dlg.find('.post-bulk-edit-info .close-bulk-edit-dlg').removeAttr('disabled');
    });
  }

  /**
   * Returns an object containing the updates implied by the edit form.
   *
   * @param DOM el
   *   Control element.
   *
   * @returns object
   *   Data object containing fields to update.
   */
  function getUpdates(el) {
    let r = {};
    if ($(el).find('[name="edit-recorder-name"]').val()) {
      r.recorder_name = $(el).find('[name="edit-recorder-name"]').val();
    }
    if ($(el).find('[name="edit-location-name"]').val()) {
      r.location_name = $(el).find('[name="edit-location-name"]').val();
    }
    if ($(el).find('[name="edit-date"]').val()) {
      r.date = $(el).find('[name="edit-date"]').val();
    }
    if ($(el).find('[name="edit-sref"]').val()) {
      r.sref = $(el).find('[name="edit-sref"]').val();
      r.sref_system = $(el).find('[name="edit-sref-system"]').val();
    }
    return r;
  }

  /**
   * Handler for the proceed button on the confirmation dialog.
   */
  function proceedClickHandler(el) {
    // Either pass through list of IDs or pass through a filter to restrict to.
    const linkToDataControl = $('#' + $(el)[0].settings.linkToDataControl);
    const dlg = $('#' + $(el)[0].settings.id + '-dlg');
    let data = {
      updates: getUpdates(dlg),
      website_id: indiciaData.website_id,
      restrictToOwnData: $(el)[0].settings.restrictToOwnData
    };
    if ($.isEmptyObject(data.updates)) {
      cannotProceedMessage(indiciaData.lang.bulkEditor.warningNoChanges);
      return;
    }
    prepareForBulkEdit(dlg);
    if (linkToDataControl.hasClass('multiselect-mode')) {
      data['occurrence:ids'] = getTodoListInfo(el).ids.join(',');
      performBulkEdit(dlg, data, 'bulkeditids');
    } else {
      const filter = indiciaFns.getFormQueryData($(el)[0].settings.sourceObject, false);
      data['occurrence:idsFromElasticFilter'] = filter;
      performBulkEdit(dlg, data, 'bulkeditall');
    }
  }

  /**
   * Click button displays info message before allowing user to proceed with edit.
   */
  function bulkEditRecordsBtnClickHandler(e) {
    const el = $(e.currentTarget).closest('.idc-bulkEditor');
    const todoInfo = getTodoListInfo(el);
    const dlg = $('#' + $(el)[0].settings.id + '-dlg');
    linkToDataSource(el);
    const filter = indiciaFns.getFormQueryData($(el)[0].settings.sourceObject, false);
    // Validate that it won't affect other user data if it shouldn't.
    if (el[0].settings.restrictToOwnData && !checkHasMyRecordsFilter(el, filter)) {
      cannotProceedMessage(indiciaData.lang.bulkEditor.errorEditNotFilteredToCurrentUser);
      return;
    }
    // Message if nothing to do.
    if (todoInfo.total === 0) {
      cannotProceedMessage(indiciaData.lang.bulkEditor.warningNothingToDo);
      return;
    }
    // Reset the dialog.
    dlg.find('.message').text(todoInfo.message);
    dlg.find('.pre-bulk-edit-info').show();
    dlg.find('.post-bulk-edit-info').hide();
    dlg.find('.post-bulk-edit-info .close-bulk-edit-dlg').attr('disabled', true);
    dlg.find('.post-bulk-edit-info .output p').remove();
    // Reset date picker so that placeholder works.
    dlg.find('[name="edit-date"]')[0].type='text';
    console.log('Reset inputs');
    dlg.find('.ctrl-wrap input').val('');
    // Now open it.
    $.fancybox.open({
      src: dlg,
      type: 'html',
      opts: {
        modal: true
      }
    });
  }

  /**
   * Register the various user interface event handlers.
   */
  function initHandlers(el) {
    $(el).find('.bulk-edit-records-btn').click(bulkEditRecordsBtnClickHandler);

    $(el).find('.proceed-bulk-edit').click(() => {
      proceedClickHandler(el);
    });

    $(el).find('.close-bulk-edit-dlg').click(() => {
      $.fancybox.close();
    });

    // For custom placeholder, only switch to date when focused.
    $(el).find('[name="edit-date"]').mouseover((e) => {
      if (e.currentTarget.type === 'text') {
        e.currentTarget.type = 'date';
      }
    });
  }

  /**
   * Declare public methods.
   */
  methods = {
    /**
     * Initialise the idcRecordDetailsPane plugin.
     *
     * @param array options
     */
    init: function init(options) {
      var el = this;
      el.settings = $.extend({}, defaults);
      el.callbacks = callbacks;
      // Apply settings passed in the HTML data-* attribute.
      if (typeof $(el).attr('data-idc-config') !== 'undefined') {
        $.extend(el.settings, JSON.parse($(el).attr('data-idc-config')));
      }
      // Apply settings passed to the constructor.
      if (typeof options !== 'undefined') {
        $.extend(el.settings, options);
      }
      initHandlers(el);
    },

    on: function on(event, handler) {
      if (typeof this.callbacks[event] === 'undefined') {
        indiciaFns.controlFail(this, 'Invalid event handler requested for ' + event);
      }
      this.callbacks[event].push(handler);
    },

    /**
     * Never needs population.
     */
    getNeedsPopulation: function getNeedsPopulation() {
      return false;
    }
  };

    /**
   * Extend jQuery to declare idcRecordDetailsPane method.
   */
  $.fn.idcBulkEditor = function buildBulkEditor(methodOrOptions) {
    var passedArgs = arguments;
    var result;
    $.each(this, function callOnEachOutput() {
      if (methods[methodOrOptions]) {
        // Call a declared method.
        result = methods[methodOrOptions].apply(this, Array.prototype.slice.call(passedArgs, 1));
        return true;
      } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
        // Default to "init".
        return methods.init.apply(this, passedArgs);
      }
      // If we get here, the wrong method was called.
      $.error('Method ' + methodOrOptions + ' does not exist on jQuery.idcBulkEditor');
      return true;
    });
    // If the method has no explicit response, return this to allow chaining.
    return typeof result === 'undefined' ? this : result;
  };

}());