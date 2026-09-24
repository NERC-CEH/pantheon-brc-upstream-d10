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
    // If my records applied to Who pane.
    if (indiciaData.filter?.def?.my_records === '1') {
      return true;
    }
    // Or filter has a created_by_id limit for the current user.
    if (typeof filter.bool_queries !== 'undefined') {
      filter.bool_queries.forEach((qry) => {
        if ((qry.bool_clause === 'must' || qry.bool_clause === 'filter')
            && qry.field === 'metadata.created_by_id'
            && qry.query_type === 'term'
            && qry.value !== undefined
            && String(qry.value) === String(indiciaData.user_id)) {
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
   * Resest the dialog before doing a bulk edit.
   *
   * @param DOM dlg
   *   Dialog element.
   */
  function prepareForBulkEdit(dlg) {
    dlg.find('.bulk-edit-action-buttons').hide();
    dlg.find('.bulk-edit-form-controls').hide();
    dlg.find('.post-bulk-edit-info .output *').remove();
    dlg.find('.post-bulk-edit-info').show();
    logOutput(dlg, indiciaData.lang.bulkEditor.preparing);
  }

  /**
   * Convert a date entered in the configured display format to ISO format.
   *
   * @param string dateValue
   *   Date in the configured display format, or an ISO date.
   *
   * @returns string
   *   Date in yyyy-mm-dd format.
   */
  function dateToIso(dateValue) {
    if (!dateValue || dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue;
    }
    const parts = dateValue.split(/\D+/);
    const formatParts = indiciaData.dateFormat.split(/[^A-Za-z]+/);
    if (parts.length !== 3 || formatParts.length !== 3) {
      return dateValue;
    }
    const year = parts[formatParts.indexOf('Y')];
    const month = parts[formatParts.indexOf('m')];
    const day = parts[formatParts.indexOf('d')];
    if (!year || !month || !day) {
      return dateValue;
    }
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
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
      const status = typeof response !== 'undefined' ? response.code : jqXHR.status;
      if (status === 200 && response.search_after) {
        // Paging through a set of records, send the same request again, but
        // with search_after set.
        showProgressInOutput(dlg, response.affected);
        data.search_after = response.search_after;
        performBulkEdit(dlg, data, endpoint);
      } else if (status === 200 || status === 204) {
        // Finished.
        const settings = $('#' + $(dlg).attr('id').replace(/-dlg$/, ''))[0].settings;
        settings.sourceObject.populate(true);
        dlg.find('.post-bulk-edit-info .close-bulk-edit-dlg').removeAttr('disabled');
        logOutput(dlg, indiciaData.lang.bulkEditor.done);
        // @todo Notify the user that it worked.
      } else {
        logOutput(dlg, indiciaData.lang.bulkEditor.error);
        if (response.message) {
          logOutput(dlg, response.message);
        }
        dlg.find('.post-bulk-edit-info .close-bulk-edit-dlg').removeAttr('disabled');
      }
    })
    .fail(function(response) {
      // Todo test if the 409 code now goes here.
      if (response.status === 409 && response.responseJSON && response.responseJSON.errorCode && response.responseJSON.errorCode === 'SAMPLES_CONTAIN_OTHER_OCCURRENCES') {
        $.fancyDialog({
          title: indiciaData.lang.bulkEditor.allowSampleSplitting,
          message: indiciaData.lang.bulkEditor.promptAllowSampleSplit
            .replace('{1}', response.responseJSON .errorData.sample_id)
            .replace('{2}', response.responseJSON .errorData.included_occurrence_id)
            .replace('{3}', response.responseJSON .errorData.excluded_occurrence_id),
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
        if (response.responseJSON && response.responseJSON.message) {
          logOutput(dlg, response.responseJSON.message);
        }
        dlg.find('.post-bulk-edit-info .close-bulk-edit-dlg').removeAttr('disabled');
      }
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
    // Can't skip requirement to reverify changed records if the date or sref
    // change.
    let canSkipReverify = $(el).find('[name="edit-date"]').val().trim() === ''
        && $(el).find('[name="edit-sref"]').val().trim() === '';
    if ($(el).find('[name="edit-recorder-name"]').val().trim() !== '') {
      r.recorder_name = $(el).find('[name="edit-recorder-name"]').val().trim();
    }
    if ($(el).find('[name="edit-location-name"]').val().trim() !== '') {
      r.location_name = $(el).find('[name="edit-location-name"]').val().trim();
    }
    if ($(el).find('[name="edit-date"]').val().trim() !== '') {
      r.date = dateToIso($(el).find('[name="edit-date"]').val());
    }
    if ($(el).find('[name="edit-sref"]').val().trim() !== '') {
      r.sref = $(el).find('[name="edit-sref"]').val().trim();
      r.sref_system = $(el).find('[name="edit-sref_system"]').val().trim();
    }
    if ($(el).find('[name="append-comment"]').val().trim() !== '') {
      r.append_comment = $(el).find('[name="append-comment"]').val().trim();
    }
    if ($(el).find('[name="skip-reverify"]:visible').prop('checked') && canSkipReverify) {
      r.skip_reverify = true;
    }
    return r;
  }

  /**
   * Show the skip-reverify option only when date and spatial reference are unchanged.
   *
   * @param DOM dlg
   *   Dialog element.
   */
  function updateSkipReverifyVisibility(dlg) {
    const hasDateOrSref = dlg.find('[name="edit-date"], [name="edit-sref"]').filter(function hasValue() {
      return $(this).val().trim() !== '';
    }).length > 0;
    dlg.find('#ctrl-wrap-skip-reverify').css('visibility', hasDateOrSref ? 'hidden' : '');
  }

  /**
   * Generate a sample preview of updates that are about to happen.
   *
   * Output is loaded into a table on the dialog.
   */
  function previewClickHandler(el) {
    const dlg = $('#' + $(el)[0].settings.id + '-dlg');
    const updates = getUpdates(dlg);
    const todoListInfo = getTodoListInfo(el);
    if (Object.keys(updates).length === 0) {
      $.fancyDialog({
        title: indiciaData.lang.bulkEditor.cannotProceed,
        message: indiciaData.lang.bulkEditor.noUpdatesSpecified,
        cancelButton: null
      });
      return;
    }
    // Hide context sensitive messages - will show appropriate ones once we
    // have the preview info.
    $(dlg).find('.preview-messages p').hide();
    $(dlg).find('.preview-info-partial strong').text(todoListInfo.total);
    // Show the preview.
    $(dlg).find('.preview-output').show();
    $(dlg).find('.bulk-edit-form-controls').hide();
    $(dlg).find('#ctrl-wrap-append-comment').hide();
    $(dlg).find('#ctrl-wrap-skip-reverify').hide();
    $(dlg).find('.preview-bulk-edit').attr('disabled', true);
    let previewRequest = {
      updates: updates,
      website_id: indiciaData.website_id,
      restrictToOwnData: $(el)[0].settings.restrictToOwnData
    };
    if ($('#' + $(el)[0].settings.linkToDataControl).hasClass('multiselect-mode')) {
      previewRequest['occurrence:ids'] = todoListInfo.ids.join(',');
    } else {
      const filter = indiciaFns.getFormQueryData($(el)[0].settings.sourceObject, false);
      previewRequest['occurrence:idsFromElasticFilter'] = filter;
    }
    $.post(indiciaData.esProxyAjaxUrl + '/bulkeditpreview/' + indiciaData.nid, previewRequest, null, 'json')
      .done(function(response) {
        const hasVerifiedRecords = response.aggregations.has_verified_records.doc_count > 0;
        $(dlg).find(todoListInfo.total > response.records.length ? '.preview-info-partial' : '.preview-info-complete').show();
        if (hasVerifiedRecords) {
          $(dlg).find(updates.skip_reverify ? '.preview-info-skip-reverify' : '.preview-info-verified').show();
        }
        $.each(response.records, function() {
          const tr = $('<tr>').appendTo($(dlg).find('.preview-output tbody'));
          let date = indiciaFns.formatDate(this._source.event.date_start);
          let recordedBy = typeof this._source.event.recorded_by === 'undefined' ? indiciaData.lang.bulkEditor.noValue : this._source.event.recorded_by;
          let locationName = typeof this._source.location.verbatim_locality === 'undefined' ? indiciaData.lang.bulkEditor.noValue : this._source.location.verbatim_locality;
          let sref = this._source.location.input_sref;
          date = updates.date ? `<span class="old-value">${date}</span> <span class="new-value">${indiciaFns.formatDate(updates.date)}</span>` : date;
          recordedBy = updates.recorder_name ? `<span class="old-value">${recordedBy}</span> <span class="new-value">${updates.recorder_name}</span>` : recordedBy;
          locationName = updates.location_name ? `<span class="old-value">${locationName}</span> <span class="new-value">${updates.location_name}</span>` : locationName;
          sref = updates.sref ? `<span class="old-value">${sref}</span> <span class="new-value">${updates.sref}</span>` : sref;

          tr.append('<th>' + this._source.id + '</th>');
          tr.append('<th>' + this._source.taxon.accepted_name + '</th>');
          tr.append('<th>' + (typeof this._source.taxon.vernacular_name === 'undefined' ? '' : this._source.taxon.vernacular_name) + '</th>');
          tr.append(`<th>${date}</th>`);
          tr.append(`<th>${locationName}</th>`);
          tr.append(`<th>${sref}</th>`);
          tr.append(`<th>${recordedBy}</th>`);
        })
        if (updates.append_comment) {
          const previewComment = $('<div class="preview-comment">');
          $('<h3 class="preview-comment-heading">')
            .text(indiciaData.lang.bulkEditor.addComment)
            .appendTo(previewComment);
          $('<p>')
            .text(updates.append_comment)
            .appendTo(previewComment);
          $(dlg).find('.preview-output').append(previewComment);
        }
        $(dlg).find('.proceed-bulk-edit').removeAttr('disabled');
      });
    return;
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
    dlg.find('.message').html(todoInfo.message);
    dlg.find('.bulk-edit-action-buttons').show();
    dlg.find('.bulk-edit-form-controls').show();
    dlg.find('#ctrl-wrap-append-comment').show();
    dlg.find('#ctrl-wrap-skip-reverify').show();
    dlg.find('#ctrl-wrap-skip-reverify').css('visibility', 'visible');
    dlg.find('.post-bulk-edit-info').hide();
    dlg.find('.post-bulk-edit-info .close-bulk-edit-dlg').attr('disabled', true);
    dlg.find('.post-bulk-edit-info .output p').remove();
    dlg.find('.preview-output').hide();
    dlg.find('.preview-output tbody tr').remove();
    dlg.find('.preview-comment').remove();
    dlg.find('.proceed-bulk-edit').attr('disabled', true);
    dlg.find('.preview-bulk-edit').removeAttr('disabled');
    dlg.find('.ctrl-wrap input').val('');
    dlg.find('#append-comment').val('');

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
    $(el).find('.bulk-edit-records-btn').on('click', bulkEditRecordsBtnClickHandler);

    const dlg = $('#' + $(el)[0].settings.id + '-dlg');
    const dateOrSrefControls = dlg.find('[name="edit-date"], #edit-date\\:date, [name="edit-sref"]');
    dateOrSrefControls.on('input change', function updateSkipReverify() {
      window.setTimeout(function refreshSkipReverify() {
        updateSkipReverifyVisibility(dlg);
      }, 0);
    });
    updateSkipReverifyVisibility(dlg);

    $(el).find('.preview-bulk-edit').on('click', () => {
      previewClickHandler(el);
    });

    $(el).find('.proceed-bulk-edit').on('click', () => {
      proceedClickHandler(el);
    });

    $(el).find('.close-bulk-edit-dlg').on('click', () => {
      $.fancybox.close();
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
        if (!indiciaFns.initialiseControl(this)) {
          return true;
        }
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