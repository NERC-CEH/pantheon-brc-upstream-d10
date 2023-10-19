(function enclose() {
  'use strict';
  var $ = jQuery;

  /**
   * Repopulates a control with the next or previous data page.
   *
   * @param DOM el
   *   Control element.
   * @param bool forward
   *   True for next page, false for previous.
   * @param string itemSelector
   *   Selector to find an individual data item element.
   */
  indiciaFns.movePage = function movePage(el, forward, itemSelector) {
    var sourceSettings = el.settings.sourceObject.settings;
    if (el.settings.sourceObject.settings.mode === 'compositeAggregation') {
      el.settings.compositeInfo.page += (forward ? 1 : -1);
      // Composite aggregations use after_key to find next page.
      if (el.settings.compositeInfo.pageAfterKeys[el.settings.compositeInfo.page]) {
        sourceSettings.after_key = el.settings.compositeInfo.pageAfterKeys[el.settings.compositeInfo.page];
      } else {
        delete sourceSettings.after_key;
      }
    } else {
      if (typeof sourceSettings.from === 'undefined') {
        sourceSettings.from = 0;
      }
      if (forward) {
        // Move to next page based on currently visible row count, in case some
        // have been removed.
        sourceSettings.from += $(el).find(itemSelector).length;
      } else {
        sourceSettings.from -= sourceSettings.size;
      }
      sourceSettings.from = Math.max(0, sourceSettings.from);
    }
    el.settings.sourceObject.populate();
  }

  /**
   * Change the number of rows loaded per page in a control's datasource.
   *
   * @param DOM el
   *   Control element.
   */
  indiciaFns.rowsPerPageChange = function rowsPerPageChange(el) {
    var newRowsPerPage = $(el).find('.rows-per-page select option:selected').val();
    if (el.settings.sourceObject.settings.mode.match(/Aggregation$/)) {
      el.settings.sourceObject.settings.aggregationSize = newRowsPerPage;
    } else {
      el.settings.sourceObject.settings.size = newRowsPerPage;
    }
    el.settings.sourceObject.populate();
  }

  /**
   * A select box for changing the rows per grid page.
   *
   * @param DOM el
   *   Control element.
   */
  function getRowsPerPageControl(el) {
    var opts = [];
    var sourceSize = el.settings.sourceObject.settings.aggregationSize || el.settings.sourceObject.settings.size;
    var buildPageSizeOptionsFrom = sourceSize || 30;
    // Set default rowsPerPageOptions unless explicitly empty.
    if (!el.settings.rowsPerPageOptions) {
      el.settings.rowsPerPageOptions = [];
      if (buildPageSizeOptionsFrom >= 40) {
        el.settings.rowsPerPageOptions.push(Math.round(buildPageSizeOptionsFrom / 2));
      }
      el.settings.rowsPerPageOptions.push(buildPageSizeOptionsFrom);
      el.settings.rowsPerPageOptions.push(buildPageSizeOptionsFrom * 2);
      if (buildPageSizeOptionsFrom < 40) {
        el.settings.rowsPerPageOptions.push(buildPageSizeOptionsFrom * 4);
      }
    }
    // If no size specified, we are showing some arbitrary ES limit on row count.
    if ($.inArray(sourceSize, el.settings.rowsPerPageOptions) === -1) {
      // Add a non-visible default option to represent initial state.
      opts.push('<option selected disabled hidden style="display: none"></option>');
    }
    if (el.settings.rowsPerPageOptions.length > 0) {
      $.each(el.settings.rowsPerPageOptions, function eachOpt() {
        var selected = this === sourceSize ? ' selected="selected"' : '';
        opts.push('<option value="' + this + '"' + selected + '>' + this + '</option>');
      });
      return '<span class="rows-per-page">Rows per page: <select>' + opts.join('') + '</select>';
    }
    return '';
  }

  /**
   * HTML for footer controls such as pager and rows per page.
   *
   * @param DOM el
   *   Control element.
   */
  indiciaFns.getFooterControls = function getFooterControls(el) {
    return '<span class="showing"></span> ' +
      '<span class="buttons"><button class="prev">Previous</button><button class="next">Next</button></span> ' +
      getRowsPerPageControl(el);
  }

  /**
   * Update the HTML for the paging footer after a data response.
   *
   * @param DOM el
   *   Pager message element.
   * @param int pageSize
   *   Number of data items on the current page.
   * @param obj sourceSettings
   *   Settings for the source that provides the data for the control the pager
   *   is linked to. Determines the limit, offset and total.
   */
  indiciaFns.drawPager = (pagerEl, pageSize, sourceSettings) => {
    // Output text describing loaded hits.
    if (pageSize > 0) {
      if (sourceSettings.from === 0 && pageSize === sourceSettings.total.value) {
        $(pagerEl).html('Showing all ' + sourceSettings.total.value + ' hits');
      } else {
        const toLabel = sourceSettings.from === 0 ? 'first ' : (sourceSettings.from + 1) + ' to ';
        // Indicate if approximate.
        const ofLabel = sourceSettings.total.relation === 'gte' ? 'at least ' : '';
        $(pagerEl).html('Showing ' + toLabel + (sourceSettings.from + pageSize) + ' of ' + ofLabel + sourceSettings.total.value);
      }
    } else {
      $(pagerEl).html('No hits');
    }
  }

  /**
   * Update the HTML for the paging footer after a data response.
   *
   * @param DOM el
   *   Control element.
   * @param obj response
   *   Elasticsearch response data.
   * @param obj data
   *   Data sent in request.
   * @param string itemSelector
   *   CSS selector for each item in the output.
   */
  indiciaFns.updatePagingFooter = function updatePagingFooter(el, response, data, itemSelector, afterKey) {
    var offset;
    var pageSize = $(el).find(itemSelector).length;
    var footer = $(el).find('.footer');
    var sourceSettings = el.settings.sourceObject.settings;
    // Set up the count info in the footer.
    if (sourceSettings.mode === 'compositeAggregation') {
      // Composite aggs use after_key for simple paging.
      if (afterKey) {
        el.settings.compositeInfo.pageAfterKeys[el.settings.compositeInfo.page + 1] = afterKey;
      }
      $(footer).find('.next').prop('disabled', !afterKey);
      $(footer).find('.prev').prop('disabled', el.settings.compositeInfo.page === 0);
      offset = (el.settings.compositeInfo.page * sourceSettings.aggregationSize);
    } else if (sourceSettings.mode === 'termAggregation') {
      // Can't page through a standard terms aggregation.
      $(footer).find('.buttons').hide();
      offset = 0;
    } else {
      offset = typeof data.from === 'undefined' ? 0 : data.from;
      // Enable or disable the paging buttons.
      $(footer).find('.prev').prop('disabled', offset <= 0);
      $(footer).find('.next').prop('disabled', offset + response.hits.hits.length > response.hits.total.value);
    }
    indiciaFns.drawPager($(footer).find('.showing'), pageSize, sourceSettings);
  }

}());