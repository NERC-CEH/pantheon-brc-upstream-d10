/**
 * @file
 * A plugin for managing downloads from Elasticsearch.
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

 /* eslint no-underscore-dangle: ["error", { "allow": ["_count"] }] */

 /**
 * Output plugin for data downloads.
 */
(function esDownloadPlugin() {
  'use strict';
  var $ = jQuery;

  /**
   * Place to store public methods.
   */
  var methods;

  /**
   * Flag to track when file generation completed.
   */
  var done;

  /**
   * Declare default settings.
   */
  var defaults = {};

  /**
   * Registered callbacks for events.
   */
  var callbacks = {};

  /**
   * Save rebuilding request data for each page
   */
  var currentRequestData;

  /**
   * Total rows to download. In some settings we only get this on first page.
   */
  var rowsToDownload;

  /**
   * Wind the progress spinner forward to a certain percentage.
   *
   * @param element el
   *   The plugin instance's element.
   * @param int progress
   *   Progress percentage.
   */
  function animateTo(el, progress) {
    var target = done ? 1006 : 503 + (progress * 503);
    // Stop previous animations if we are making better progress through the
    // download than 1 chunk per 0.5s. This allows the spinner to speed up.
    $(el).find('.circle').stop(true);
    $(el).find('.circle').animate({
      'stroke-dasharray': target
    }, {
      duration: 500
    });
  }

  /**
   * Updates the progress text and spinner after receiving a response.
   *
   * @param element el
   *   The plugin instance's element.
   * @param obj response
   *   Response body from the ES proxy containing progress data.
   */
  function updateProgress(el, response) {
    var rowsDone = response.done;
    if (response.total) {
      rowsToDownload = response.total;
    } else if (el.settings.linkToDataControl) {
      rowsToDownload = $('#' + el.settings.linkToDataControl)[0].settings.sourceObject.settings.total.value;
    }
    // ES V7 seems to overshoot, reporting whole rather than partial last page size.
    rowsDone = Math.min(rowsDone, rowsToDownload);
    $(el).find('.progress-text').text(rowsDone + ' of ' + rowsToDownload);
    animateTo(el, rowsDone / rowsToDownload);
  }

  /**
   * Retreive an object containing just settings relating to columns.
   *
   * @param element el
   *   The plugin instance's element which holds the settings.
   *
   * @return obj
   *   Object containing settings relating to columns to include.
   */
  function getColumnSettings(el) {
    var data = {};
    var agg;
    var sourceSettings = el.settings.sourceObject.settings;
    var isAggregation = el.settings.sourceObject.settings.mode.match(/Aggregation$/);
    // Note, columnsTemplate can be blank.
    if ($('#' + el.id + '-template').val()) {
      // If there is an associated download template select control,
      // set the columns template from its value.
      data.columnsTemplate = $('#' + el.id + '-template').val();
    } else if (typeof el.settings.columnsTemplate !== 'undefined') {
      data.columnsTemplate = el.settings.columnsTemplate;
    } else if (isAggregation) {
      // Aggregations default to no columns template.
      data.columnsTemplate = '';
    }
    // Set columnsSurveyId to survey ID if appropriate.
    if (typeof(el.settings.columnsSurveyId) !== "undefined") {
      if (el.settings.columnsSurveyId) {
        data.columnsSurveyId = el.settings.columnsSurveyId;
      } else if ($('.survey-filter').val() && $('.survey-filter').val() !== 'all') {
        // @columnsSurveyId attribute specified but without a value.
        // This indicates that survey ID should be taken from the
        // [surveyFilter] control value if one is on the page.
        data.columnsSurveyId = $('.survey-filter').val();
      }
    }
    if (el.settings.addColumns && el.settings.addColumns.length !== 0) {
      data.addColumns = el.settings.addColumns;
      if (isAggregation) {
        // Ensure composite aggregation source fields are named correctly.
        $.each(data.addColumns, function() {
          if ($.inArray(this.field, sourceSettings.fields) > -1) {
            this.field = 'key.' + this.field.asCompositeKeyName();
          }
        });
      }
    } else if (isAggregation && data.columnsTemplate === '') {
      // Find the first aggregation defined for this source.
      agg = sourceSettings.aggregation[Object.keys(sourceSettings.aggregation)[0]];
      data.addColumns = [];
      $.each(sourceSettings.fields, function eachField() {
        data.addColumns.push({
          field: 'key.' + this.asCompositeKeyName(),
          caption: this.asReadableKeyName()
        });
      });
      // The agg should also contain aggregation for calculated columns.
      $.each(agg.aggs, function eachAgg(key) {
        data.addColumns.push({
          field: key,
          caption: key.asReadableKeyName()
        });
      });
    }
    if (el.settings.removeColumns) {
      data.removeColumns = el.settings.removeColumns;
    }
    return data;
  }

  function initSource(el) {
    var settings = el.settings;
    var gridSettings;
    var sourceSettings;
    var gridColumns = [];
    if (settings.linkToDataControl) {
      if ($('#' + settings.linkToDataControl).length !== 1) {
        indiciaFns.controlFail(el, 'Failed to find dataGrid ' + settings.linkToDataControl + ' linked to download');
      }
      // Refresh the columns according to those currently in the dataGrid.
      gridSettings = $('#' + settings.linkToDataControl)[0].settings;
      settings.source = gridSettings.source;
      sourceSettings = indiciaData.esSourceObjects[Object.keys(settings.source)[0]].settings;
      settings.columnsTemplate = '';
      $.each(gridSettings.columns, function eachCol() {
        var field;
        if (sourceSettings.mode.match(/Aggregation$/) && $.inArray(this.field, sourceSettings.fields) > -1) {
          field = 'key.' + this.field.asCompositeKeyName();
        } else {
          field = this.field;
        }
        gridColumns.push({
          caption: gridSettings.availableColumnInfo[this.field].caption,
          field: field
        });
      });
      settings.addColumns = typeof settings.addColumns === 'undefined' ? gridColumns : gridColumns.concat(settings.addColumns);
    }
    // Only allow a single source for download, so simplify the sources.
    settings.sourceObject = indiciaData.esSourceObjects[Object.keys(settings.source)[0]];
    if (!settings.linkToDataControl) {
      // Ensure we get count data, in case source has already done a count for another control.
      settings.sourceObject.forceRecount();
    }
  }

  /**
   * Recurse until all the pages of a chunked download are received.
   *
   * @param obj lastResponse
   *   Response body from the ES proxy containing progress data.
   */
  function doPages(el, lastResponse, columnSettings) {
    var date;
    var hours;
    var minutes;
    var description = '';
    var sep = indiciaData.esProxyAjaxUrl.match(/\?/) ? '&' : '?';
    var query = sep + 'state=nextPage&uniq_id=' + lastResponse.uniq_id;
    if (lastResponse.state === 'nextPage') {
      if (lastResponse.scroll_id) {
        // Scrolls remember the search query so only need the scroll ID.
        query += '&scroll_id=' + lastResponse.scroll_id;
        // Scrolling remembers all the settings server-side except for cols
        // template.
        currentRequestData = getColumnSettings(el);
      } else if (el.settings.sourceObject.settings.mode.match(/Aggregation$/)) {
        // Inform the warehouse as composite paging behaviour different. The
        // uniq_id allows the warehouse to relocate the last request's after_key.
        query += '&aggregation_type=composite';
        // No need to recount!
        delete currentRequestData.aggs._count;
      }
      // Post to the ES proxy. Pass scroll_id (docs) or after_key (composite aggregations)
      // parameter to request the next chunk of the dataset.
      $.ajax({
        url: indiciaData.esProxyAjaxUrl + '/download/' + indiciaData.nid + query,
        type: 'POST',
        dataType: 'json',
        data: currentRequestData,
        success: function success(response) {
          updateProgress(el, response);
          doPages(el, response, columnSettings);
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          alert('An error occurred with the request to download data.');
          console.log(errorThrown);
        }
      });
    } else {
      // Finished.
      $(el).find('.progress-text').text('Done');
      date = new Date();
      // File available for 45 minutes.
      date.setTime(date.getTime() + (45 * 60 * 1000));
      hours = '0' + date.getHours();
      hours = hours.substr(hours.length - 2);
      minutes = '0' + date.getMinutes();
      minutes = minutes.substr(minutes.length - 2);
      description = 'File containing ' + lastResponse.done +
        (el.settings.sourceObject.settings.mode.match(/Aggregation$/) ? ' items. ' : ' occurrences. ');
      $(el).find('.progress-circle-container').addClass('download-done');
      $(el).find('.idc-download-files').append('<div><a href="' + lastResponse.filename + '">' +
        '<span class="fas fa-file-archive fa-2x"></span>' +
        'Download .zip file</a><br/>' + description +
        'Available until ' + hours + ':' + minutes + '.</div>');
      $(el).find('.idc-download-files').fadeIn('med');
    }
  }

  /**
   * Initialise the user interface event handlers.
   */
  function initHandlers(el) {
    /**
     * Download button click handler. Note that the selector must directly
     * find the button as it might not be a child of the element.
     */
    $('#' + el.id + '-button').on('click', function doDownload() {
      var sep = indiciaData.esProxyAjaxUrl.match(/\?/) ? '&' : '?';
      var query = sep + 'state=initial';
      var columnSettings;
      var srcSettings;
      var tab;
      var origSort;
      // If possibly not on outputs tab, switch.
      if (el.settings.buttonContainerElement) {
        tab = $(el).closest('.ui-tabs-panel');
        if (tab.length > 0) {
          indiciaFns.activeTab($(tab).parent(), tab[0].id);
        }
      }
      initSource(el);
      srcSettings = el.settings.sourceObject.settings;
      // The download can specify it's own preferred sort order.
      if (el.settings.sort) {
        origSort = typeof srcSettings.sort === 'undefined' ? null : srcSettings.sort;
        srcSettings.sort = el.settings.sort;
      }
      // Prepare the source aggregations in composite mode if using automatic
      // aggregation as it supports scrolling and is faster.
      el.settings.sourceObject.prepare(srcSettings.mode.match(/Aggregation$/)
        ? 'compositeAggregation' : srcSettings.mode);
      // Now reset the original sort so we don't mess with other controls using
      // the same source.
      if (origSort === null) {
        delete srcSettings.sort;
      }
      else {
        srcSettings.sort = origSort;
      }
      columnSettings = getColumnSettings(el);
      $(el).find('.progress-circle-container').removeClass('download-done');
      $(el).find('.progress-circle-container').show();
      done = false;
      $(el).find('.circle').attr('style', 'stroke-dashoffset: 503px');
      $(el).find('.progress-text').text('Loading...');
      currentRequestData = indiciaFns.getFormQueryData(el.settings.sourceObject);
      if (srcSettings.mode.match(/Aggregation$/)) {
        query += '&aggregation_type=composite';
        // Arbitrary choice of page size.
        currentRequestData.aggs._rows.composite.size = 500;
      }
      // Allow switch of Elasticsearch API endpoint.
      if (srcSettings.endpoint) {
        query += '&endpoint=' + srcSettings.endpoint;
      }
      $.extend(currentRequestData, columnSettings);
      // Reset.
      rowsToDownload = null;
      // Post to the ES proxy.
      $.ajax({
        url: indiciaData.esProxyAjaxUrl + '/download/' + indiciaData.nid + query,
        type: 'POST',
        dataType: 'json',
        data: currentRequestData,
        success: function success(response) {
          if (typeof response.code !== 'undefined' && response.code === 401) {
            alert('Elasticsearch alias configuration user or secret incorrect in the form configuration.');
            $('.progress-circle-container').hide();
          } else {
            updateProgress(el, response);
            doPages(el, response, columnSettings);
          }
        },
        error: function error(jqXHR, textStatus, errorThrown) {
          alert('An error occurred with the request to download data.');
          $('.progress-circle-container').hide();
          console.log(errorThrown);
        }
      });
    });
  }

  /**
   * Declare public methods.
   */
  methods = {

    /**
     * Initialise the idcEsDownload plugin.
     *
     * @param array options
     */
    init: function init(options) {
      var el = this;

      indiciaFns.registerOutputPluginClass('idcEsDownload');
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
      if (el.settings.buttonContainerElement) {
        if ($(el.settings.buttonContainerElement).length === 0) {
          indiciaFns.controlFail(el, 'Invalid @buttonContainerElement option for ' + el.id);
        }
        $(el).find('button').appendTo($(el.settings.buttonContainerElement));
      }
      // Don't do any more init at this point, as might be using a not-yet
      // instantiated dataGrid for config.
      initHandlers(el);
    },

    /*
     * The download plugin doesn't do anything until requested.
     */
    populate: function populate() {
      // Nothing to do.
    },

    /**
     * Downloads don't need to refresh until explicitly actioned.
     */
    getNeedsPopulation: function getNeedsPopulation() {
      return false;
    }
  };

  /**
   * Extend jQuery to declare idcEsDownload plugin.
   */
  $.fn.idcEsDownload = function buildEsDownload(methodOrOptions) {
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
      $.error('Method ' + methodOrOptions + ' does not exist on jQuery.idcEsDownload');
      return true;
    });
    // If the method has no explicit response, return this to allow chaining.
    return typeof result === 'undefined' ? this : result;
  };
}());
