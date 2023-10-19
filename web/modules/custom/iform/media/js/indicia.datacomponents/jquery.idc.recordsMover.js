/**
 * @file
 * Plugin for a details pane for verification of records.
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
(function idcRecordsMover() {
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
    onMove: []
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
   * Fetches the source from the linked data control.
   *
   * @param DOM el
   *   The recordsMover container element.
   */
  function linkToDataSource(el) {
    let settings = $(el)[0].settings;
    let ctrlSettings;
    if (!settings.sourceObject) {
      if ($('#' + settings.linkToDataControl).length !== 1) {
        indiciaFns.controlFail(el, 'Failed to find data control ' + settings.linkToDataControl + ' linked to recordsMover');
      }
      // Find the source linked to the data control.
      ctrlSettings = $('#' + settings.linkToDataControl)[0].settings;
      settings.source = ctrlSettings.source;
      settings.sourceObject = indiciaData.esSourceObjects[Object.keys(settings.source)[0]];
      if (settings.sourceObject.settings.mode !== 'docs') {
        indiciaFns.controlFail(el, 'The recordsMover control needs to link to a source that lists occurrences rather than aggregated data');
      }
    }
  }

  /**
   * Retrieve a summary of the work to do.
   *
   * @param DOM el
   *   The recordsMover container element.
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
        message: indiciaData.lang.recordsMover.recordsMoverDialogMessageSelected,
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
        message: indiciaData.lang.recordsMover.recordsMoverDialogMessageAll
      }
    }
    r.message = r.message.replace('{1}', r.totalAsText);
    return r;
  }

  /**
   * Popup a message if the move cannot proceed.
   */
  function cannotProceedMessage(message) {
    $.fancyDialog({
      title: indiciaData.lang.recordsMover.cannotProceed,
      message: message,
      cancelButton: null
    });
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
    dlg.find('.post-move-info .output').append('<p>' + info + '</p>');
  }

  /**
   * Adds a progress information line to the output log.
   *
   * @param DOM dlg
   *   Dialog element
   * @param bool precheck
   *   Is this prechecking?
   * @param object affected
   *   Sample and occurrences updated by the last API request.
   */
  function showProgressInOutput(dlg, precheck, affected) {
    let p = dlg.find('.post-move-info .output p:last-child');
    let msg = precheck ? indiciaData.lang.recordsMover.precheckProgress : indiciaData.lang.recordsMover.moveProgress;
    if (!p || !p.hasClass('progress-message')) {
      p = $('<p class="progress-message">').appendTo(dlg.find('.post-move-info .output'));
      dlg.data('affected-samples', 0);
      dlg.data('affected-occurrences', 0);
    }
    dlg.data('affected-samples', dlg.data('affected-samples') + parseInt(affected.samples, 10));
    dlg.data('affected-occurrences', dlg.data('affected-occurrences') + parseInt(affected.occurrences, 10));
    $(p).html(msg
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
      logOutput(dlg, indiciaData.lang.recordsMover.error);
      logOutput(dlg, response.message);
      return false;
    }
    return true;
  }

  /**
   * Resest the dialog before doing a bulk move.
   *
   * @param DOM dlg
   *   Dialog element.
   */
  function prepareForBulkMove(dlg) {
    dlg.find('.pre-move-info').hide();
    dlg.find('.post-move-info .output *').remove();
    dlg.find('.post-move-info').show();
    logOutput(dlg, indiciaData.lang.recordsMover.preparing);
  }

  /**
   * Perform the actual move operation once proceed confirmed.
   *
   * @param DOM dlg
   *   Dialog element.
   * @param object data
   *   Data object to send to the warehouse bulk move web-service.
   * @param string endpoint
   *   Name of the endpoint to call: bulkmoveids for a list of ids, or
   *   bulkmoveall to move all records in the current filter.
   */
  function performBulkMove(dlg, data, endpoint) {
    $.post(indiciaData.esProxyAjaxUrl + '/' + endpoint + '/' + indiciaData.nid, data, null, 'json')
    .done(function(response) {
      if (!checkResponseCode(dlg, response)) {
        dlg.find('.post-move-info .close-move-dlg').removeAttr('disabled');
        return;
      }
      if (response.search_after) {
        // Paging through a set of records.
        showProgressInOutput(dlg, data.precheck, response.affected);
        data.search_after = response.search_after;
        performBulkMove(dlg, data, endpoint);
      } else if ((response.code === 200 && endpoint === 'bulkmoveids')
          || (response.code === 204 && endpoint === 'bulkmoveall')) {
        if (typeof data.precheck !== 'undefined') {
          // Finished doing the precheck.
          logOutput(dlg, indiciaData.lang.recordsMover.moving);
          // Restart without the precheck flag so it actually does updates.
          delete data.precheck;
          delete data.search_after;
          performBulkMove(dlg, data, endpoint);
        } else {
          // Finished.
          const settings = $('#' + $(dlg).attr('id').replace(/-dlg$/, ''))[0].settings;
          const dataOutputControl = $('#' + settings.linkToDataControl);
          const pagerLabel = dataOutputControl.find('.showing');
          var toRemove;
          dlg.find('.post-move-info .close-move-dlg').removeAttr('disabled');
          logOutput(dlg, indiciaData.lang.recordsMover.done);

          if (endpoint === 'bulkmoveall') {
            toRemove = dataOutputControl.find('[data-row-id]');
          } else {
            toRemove = dataOutputControl.find('[type=checkbox]:checked').closest('[data-row-id]');
          }
          dataOutputControl[0].settings.sourceObject.settings.total.value -= toRemove.length;
          toRemove.remove();
          // Update the pager to reflect the removed rows.
          if (pagerLabel.length) {
            indiciaFns.drawPager(
              pagerLabel,
              dataOutputControl.find('[data-row-id]').length,
              dataOutputControl[0].settings.sourceObject.settings
            );
          }
        }
      } else {
        logOutput(dlg, indiciaData.lang.recordsMover.error);
        logOutput(dlg, 'Internal error - incorrect response from server.');
        dlg.find('.post-move-info .close-move-dlg').removeAttr('disabled');
      }

    })
    .fail(function() {
      logOutput(dlg, indiciaData.lang.recordsMover.error);
      dlg.find('.post-move-info .close-move-dlg').removeAttr('disabled');
    });
  }

  /**
   * Handler for the proceed button on the confirmation dialog.
   */
  function proceedClickHandler(el) {
    // Either pass through list of IDs or pass through a filter to restrict to.
    const linkToDataControl = $('#' + $(el)[0].settings.linkToDataControl);
    const todoInfo = getTodoListInfo(el);
    const dlg = $('#' + $(el)[0].settings.id + '-dlg');
    let data = {
      datasetMappings: JSON.stringify($(el)[0].settings.datasetMappings),
      website_id: indiciaData.website_id,
      precheck: true
    };
    prepareForBulkMove(dlg);
    if (linkToDataControl.hasClass('multiselect-mode')) {
      data['occurrence:ids'] = todoInfo.ids.join(',');
      performBulkMove(dlg, data, 'bulkmoveids');
    } else {
      const filter = indiciaFns.getFormQueryData($(el)[0].settings.sourceObject, false);
      data['occurrence:idsFromElasticFilter'] = filter;
      performBulkMove(dlg, data, 'bulkmoveall');
    }
  }

  /**
   * Click button displays info message before allowing user to proceed with move.
   */
  function moveRecordsBtnClickHandler(e) {
    const el = $(e.currentTarget).closest('.idc-recordsMover');
    const todoInfo = getTodoListInfo(el);
    const dlg = $('#' + $(el)[0].settings.id + '-dlg');
    linkToDataSource(el);
    const filter = indiciaFns.getFormQueryData($(el)[0].settings.sourceObject, false);
    // Validate that it won't affect other user data if it shouldn't.
    if (el[0].settings.restrictToOwnData && !checkHasMyRecordsFilter(el, filter)) {
      cannotProceedMessage(indiciaData.lang.recordsMover.errorNotFilteredToCurrentUser);
      return;
    }
    // Message if nothing to do.
    if (todoInfo.total === 0) {
      cannotProceedMessage(indiciaData.lang.recordsMover.warningNothingToDo);
      return;
    }
    // Reset the dialog.
    dlg.find('.message').text(todoInfo.message);
    dlg.find('.pre-move-info').show();
    dlg.find('.post-move-info').hide();
    dlg.find('.post-move-info .close-move-dlg').attr('disabled', true);
    dlg.find('.post-move-info .output p').remove();
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
    $(el).find('.move-records-btn').click(moveRecordsBtnClickHandler);

    $(el).find('.proceed-move').click(() => {
      proceedClickHandler(el);
    });

    $(el).find('.close-move-dlg').click(() => {
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
  $.fn.idcRecordsMover = function buildRecordsMover(methodOrOptions) {
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
      $.error('Method ' + methodOrOptions + ' does not exist on jQuery.idcRecordsMover');
      return true;
    });
    // If the method has no explicit response, return this to allow chaining.
    return typeof result === 'undefined' ? this : result;
  };

}());