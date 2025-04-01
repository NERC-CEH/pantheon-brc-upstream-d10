/**
 * @file
 * A data grid plugin.
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

 /* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_source", "_count"] }] */
 /* eslint no-param-reassign: ["error", { "props": false }]*/

/**
 * Output plugin for data grids.
 */
(function idcDataGridPlugin() {
  'use strict';
  var $ = jQuery;

  /**
   * Place to store public methods.
   */
  var methods;

  /**
   * Declare default settings.
   */
  var defaults = {
    actions: [],
    aggregation: null,
    autoResponsiveCols: false,
    // Page tracking for composite aggregations
    compositeInfo: {
      page: 0,
      pageAfterKeys: {}
    },
    cookies: true,
    includeColumnHeadings: true,
    includeColumnSettingsTool: true,
    includeFilterRow: true,
    includeFullScreenTool: true,
    includePager: true,
    keyboardNavigation: false,
    sortable: true,
    responsive: true,
    responsiveOptions: {
      breakpoints: {
        xs: 480,
        sm: 768,
        md: 992,
        lg: 1200
      }
    },
    tbodyHasScrollBar: false
  };

  /**
   * Registered callbacks for different events.
   */
  var callbacks = {
    itemSelect: [],
    itemDblClick: [],
    populate: []
  };

  /**
   * Track loaded row ID to avoid duplicate effort.
   */
  var lastLoadedRowId = null;

  /**
   * Find the column config panel for a grid el.
   *
   * Use the data-el attribute to locate it, in case the panel is relocated to
   * Fancybox's overlay.
   */
  function findSettingsPanel(el) {
    var panel = null;
    $.each($('.data-grid-settings'), function eachCheckList() {
      if ($(this).data('el') === el.id) {
        panel = this;
      }
    });
    return panel;
  }

  /**
   * Gets the <li> element for a single column in the config list.
   */
  function getColInfoItem(el, field, checked) {
    var colInfo = el.settings.availableColumnInfo[field];
    var caption = colInfo.caption ? colInfo.caption : '<em>' + indiciaData.lang.dataGrid.noHeading + '</em>';
    var description = colInfo.description ? '<p>' + colInfo.description + '</p>' : '';
    var checkedAttr = checked ? ' checked="checked"' : '';
    return '<li>' +
      '<div class="checkbox">' +
      '<label><input type="checkbox"' + checkedAttr + ' value="' + field + '">' + caption + '</label>' +
      '</div>' + description +
      '</li>';
  }

  /**
   * Populate the UI for the list of available columns to select from.
   */
  function appendColumnsToConfigList(el, columns) {
    var done = [];
    var ol = $(findSettingsPanel(el)).find('ol');
    $(ol).children().remove();
    $.each(columns, function eachColumn() {
      done.push(this.field);
      $(getColInfoItem(el, this.field, true)).appendTo(ol);
    });
    $.each(el.settings.availableColumnInfo, function eachField(key, colInfo) {
      if ($.inArray(key, done) === -1) {
        $(getColInfoItem(el, key, false)).appendTo(ol);
      }
    });
  }

  /**
   * Encode text for use in HTML data.
   *
   * @param string text
   *   Unencoded text.
   *
   * @return string
   *   Encoded text.
   */
  function htmlEncode(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&/g, '&quot;');
  }

  /**
   * Adds the header cells to the table header.
   */
  function addColumnHeadings(el, header) {
    var headerRow = $('<tr/>').appendTo(header);
    var breakpointsByIdx = [];
    var srcSettings = el.settings.sourceObject.settings;
    var aggInfo = srcSettings.aggregation;
    if (el.settings.autoResponsiveCols) {
      // Build list of breakpoints to use by column position.
      $.each(el.settings.responsiveOptions.breakpoints, function eachPoint(name, point) {
        var i;
        for (i = Math.round(point / 100); i < el.settings.columns.length; i++) {
          while (breakpointsByIdx.length < i + 1) {
            breakpointsByIdx.push([]);
          }
          breakpointsByIdx[i].push(name);
        }
      });
    }
    if (el.settings.responsive) {
      $('<th class="footable-toggle-col" data-sort-ignore="true"></th>').appendTo(headerRow);
    }
    $.each(el.settings.columns, function eachColumn(idx) {
      var colDef = el.settings.availableColumnInfo[this.field];
      var heading = colDef.caption;
      var footableExtras = '';
      var sortableField = false;
      // Tolerate hyphen or camelCase.
      var hideBreakpoints = colDef.hideBreakpoints || colDef['hide-breakpoints'];
      var dataType = colDef.dataType || colDef['data-type'];
      if (srcSettings.mode === 'docs') {
        // Either a standard field, or a special field which provides an
        // associated sort field.
        sortableField = (indiciaData.esMappings[this.field] && indiciaData.esMappings[this.field].sort_field) ||
          indiciaData.fieldConvertorSortFields[this.field.simpleFieldName()];
      } else if (srcSettings.mode === 'compositeAggregation') {
        // CompositeAggregation can sort on any field column, not aggregations.
        sortableField = !(aggInfo[this.field] || this.field === 'doc_count');
      } else if (srcSettings.mode === 'termAggregation') {
        // Term aggregations allow sort on the aggregation cols, or fields if
        // numeric or date, but not normal text fields.
        sortableField = aggInfo[this.field] || this.field === 'doc_count' ||
          (indiciaData.esMappings[this.field] && !indiciaData.esMappings[this.field].type.match(/^(text|keyword)$/));
      }
      if (el.settings.sortable !== false && sortableField) {
        heading += '<span class="sort fas fa-sort"></span>';
      }
      // Extra data attrs to support footable.
      if (el.settings.autoResponsiveCols) {
        footableExtras = ' data-hide="' + breakpointsByIdx[idx].join(',') + '"';
      } else if (hideBreakpoints) {
        footableExtras = ' data-hide="' + hideBreakpoints + '"';
      }
      if (dataType) {
        footableExtras += ' data-type="' + dataType + '"';
      }
      const fieldHtmlEncode = htmlEncode(this.field);
      $('<th class="col-' + idx + '" data-field="' + fieldHtmlEncode + '"' + footableExtras + '>' + heading + '</th>')
        .appendTo(headerRow);
    });
    if (el.settings.actions.length) {
      $('<th class="col-actions"></th>').appendTo(headerRow);
    }
    if (el.settings.tbodyHasScrollBar) {
      // Spacer in header to allow for scrollbar in body.
      $('<th class="scroll-spacer"></th>').appendTo(headerRow);
    }
  }

  /**
   * Adds the filter row cells and inputs to the table header.
   */
  function addFilterRow(el, header) {
    var filterRow = $('<tr class="es-filter-row" />').appendTo(header);
    if (el.settings.responsive) {
      $('<td class="footable-toggle-col"></td>').appendTo(filterRow);
    }
    $.each(el.settings.columns, function eachColumn(idx) {
      const fieldHtmlEncode = htmlEncode(this.field);
      var td = $('<td class="col-' + idx + '" data-field="' + fieldHtmlEncode + '"></td>').appendTo(filterRow);
      var title;
      var caption = el.settings.availableColumnInfo[this.field].caption;
      // No filter input if this column has no mapping unless there is a
      // special field function that can work out the query.
      if (typeof indiciaData.esMappings[this.field] !== 'undefined'
          || typeof indiciaFns.fieldConvertorQueryBuilders[this.field.simpleFieldName()] !== 'undefined') {
        if (indiciaFns.fieldQueryDescriptions[this.field.simpleFieldName()]) {
          title = indiciaFns.fieldQueryDescriptions[this.field.simpleFieldName()];
        } else if (indiciaFns.fieldConvertorQueryBuilders[this.field.simpleFieldName()]) {
          title = 'Enter a value to find matches in the ' + caption + ' column.';
        } else if (indiciaData.esMappings[this.field].type === 'text' || indiciaData.esMappings[this.field].type === 'keyword') {
          title = 'Search for words in the ' + caption + ' column. Prefix with ! to exclude rows which contain words ' +
            'beginning with the text you enter. Use * at the end of words to find words starting with. Use ' +
            '&quot;&quot; to group words into phrases and | between words to request either/or searches. Use - ' +
            'before a word to exclude that word from the search results.';
        } else if (indiciaData.esMappings[this.field].type === 'date') {
          title = 'Search for dates in the ' + caption + ' column. Searches can be in the format yyyy, yyyy-yyyy, ' +
            'dd/mm/yyyy or dd/mm/yyyy hh:mm.';
        } else {
          title = 'Search for a number in the ' + caption + ' column. Prefix with ! to exclude rows which match the ' +
            'number you enter or separate a range with a hyphen (e.g. 123-456).';
        }
        $('<input type="text" title="' + title + '">').appendTo(td);
      }
    });
  }

  function applyColumnsList(el, colsList) {
    el.settings.columns = [];
    $.each(colsList, function eachCol() {
      if (el.settings.availableColumnInfo[this]) {
        el.settings.columns.push(el.settings.availableColumnInfo[this]);
      }
    });
  }

  /**
   * Apply settings that are dependent on the source's mode.
   */
  function applySourceModeSettings(el) {
    var sourceSettings = el.settings.sourceObject.settings;
    var pathsPerMode = {
      compositeAggregation: 'key',
      termAggregation: 'fieldlist.hits.hits.0._source'
    };
    if (sourceSettings.mode.match(/Aggregation$/)) {
      // Columns linked to aggregation's fields array need to have a path
      // in the response document defined.
      $.each(el.settings.availableColumnInfo, function eachCol(field, colDef) {
        // Everything not in the aggregations list must be a field.
        const fieldRoot = field.split('.')[0];
        if (!sourceSettings.suppliedAggregation[fieldRoot] && field !== 'doc_count') {
          colDef.path = pathsPerMode[sourceSettings.mode];
        }
      });
    }
  }

  /**
   * Calculate the correct tbody height on resize, if a fixed or anchored height.
   */
  function setTableHeight(el) {
    var tbody = $(el).find('tbody');
    var fullscreenOffset;
    if (el.settings.scrollY) {
      if (el.settings.scrollY.match(/^-/)) {
        // If fullscreen, treat full screen element as page top, so need to offset.
        fullscreenOffset = indiciaFns.fullscreenElement() ? $(indiciaFns.fullscreenElement()).offset().top : 0;
        tbody.css('max-height', fullscreenOffset + (($(window).height() + parseInt(el.settings.scrollY.replace('px', ''), 10))
          - ($(el).find('tbody').offset().top + $(el).find('tfoot').height())));
      } else {
        tbody.css('max-height', el.settings.scrollY);
      }
    }
  }

  /**
   * Assigns the classes required to show sort info icons in the header row.
   */
  function showHeaderSortInfo(sortButton, sortDesc) {
    var headingRow = $(sortButton).closest('tr');
    $(headingRow).find('.sort.fas').removeClass('fa-sort-down');
    $(headingRow).find('.sort.fas').removeClass('fa-sort-up');
    $(headingRow).find('.sort.fas').addClass('fa-sort');
    $(sortButton).removeClass('fa-sort');
    $(sortButton).addClass('fa-sort-' + (sortDesc ? 'down' : 'up'));
  }

  /**
   * Register the various user interface event handlers.
   */
  function initHandlers(el) {

    /**
     * SetTimeout handle so the row load timeout can be cleared when navigating quickly.
     */
    var loadRowTimeout;

    /**
     * Fire callbacks when a row has been selected
     * */
    function loadSelectedRow() {
      var tr = $('#' + el.id + ' .es-data-grid tbody tr.selected').not('.disabled');
      if (tr.length && tr.data('row-id') !== lastLoadedRowId) {
        lastLoadedRowId = tr.data('row-id');
        $.each(el.callbacks.itemSelect, function eachCallback() {
          this(tr);
        });
      }
      else if (!tr.length) {
        // No row selected - still inform callbacks.
        lastLoadedRowId = null;
        $.each(el.callbacks.itemSelect, function eachCallback() {
          this(null);
        });
      }
    }

    /**
     * Row click handler.
     *
     * Adds selected class and fires callbacks.
     */
    indiciaFns.on('click', '#' + el.id + ' .es-data-grid tbody tr', {}, function onDataGridRowClick() {
      var tr = this;
      $(tr).closest('tbody').find('tr.selected').removeClass('selected');
      $(tr).addClass('selected');
      loadSelectedRow();
    });

    /**
     * Double click grid row handler.
     *
     * Adds selected class and fires callbacks.
     */
    indiciaFns.on('dblclick', '#' + el.id + ' .es-data-grid tbody tr', {}, function onDataGriditemDblClick() {
      var tr = this;
      if (!$(tr).hasClass('selected')) {
        $(tr).closest('tbody').find('tr.selected').removeClass('selected');
        $(tr).addClass('selected');
      }
      $.each(el.callbacks.itemDblClick, function eachCallback() {
        this(tr);
      });
    });

    /**
     * Implement arrow key and other navigation tools.
     */
    if (el.settings.keyboardNavigation) {

      /**
       * Navigate when arrow key pressed.
       */
      function handleArrowKeyNavigation(keyCode, oldSelected) {
        var newSelected = keyCode === 38 ? $(oldSelected).prev('tr') : $(oldSelected).next('tr');
        if (newSelected.length) {
          $(newSelected).addClass('selected');
          $(newSelected).focus();
          $(oldSelected).removeClass('selected');
        }
        // Load row on timeout to avoid rapidly hitting services if repeat-hitting key.
        if (loadRowTimeout) {
          clearTimeout(loadRowTimeout);
        }
        loadRowTimeout = setTimeout(function() {
          loadSelectedRow();
        }, 500);
      }

      indiciaFns.on('keydown', 'body', {}, function onDataGridKeydown(e) {
        var oldSelected = $(el).find('tr.selected');
        if ($(':input:focus').length) {
          // Input focused, so the only keystroke we are interested in is
          // escape to close a Fancbox dialog.
          if (e.which === 27 && $.fancybox.getInstance()) {
            indiciaFns.closeFancyboxForSelectedItem();
          }
        } else if (e.which === 38 || e.which === 40 && !$('.fancybox-image').length) {
          // Arrow key pressed when image popup not shown.
          handleArrowKeyNavigation(e.which, oldSelected);
          e.preventDefault();
          return false;
        } else if (e.which === 73) {
          // i key opens and closes image popups.
          if ($('.fancybox-image').length) {
            indiciaFns.closeFancyboxForSelectedItem();
          } else {
            var fbLink = oldSelected.find('[data-fancybox]');
            if (fbLink.length) {
              // Open first image in set.
              $(fbLink[0]).click();
            }
          }
        }
      });
    }

    /**
     * Next page click.
     */
    $(el).find('.footer .next').click(function clickNext() {
      indiciaFns.movePage(el, true, 'tbody tr.data-row');
    });

    /**
     * Previous page click.
     */
    $(el).find('.footer .prev').click(function clickPrev() {
      indiciaFns.movePage(el, false, 'tbody tr.data-row');
    });

    /**
     * Rows per page change.
     */
    $(el).find('.rows-per-page select').change(function changeRowsPerPage() {
      indiciaFns.rowsPerPageChange(el);
    });

    /**
     * Sort column headers click handler.
     */
    indiciaFns.on('click', '#' + el.id + ' th', {}, function clickSort() {
      var $sortSpan = $(this).find('span.sort');
      var fieldName = $sortSpan.closest('th').attr('data-field');
      var sortDesc = $sortSpan.hasClass('fa-sort-up');
      var sourceObj = el.settings.sourceObject;
      if (fieldName) {
        showHeaderSortInfo($sortSpan, sortDesc);
        sourceObj.settings.sort = {};
        sourceObj.settings.sort[fieldName] = sortDesc ? 'desc' : 'asc';
        sourceObj.populate();
      }
    });

    /**
     * Filter row input change handler.
     */
    indiciaFns.on('change', '#' + el.id + ' .es-filter-row input', {}, function changeFilterInput() {
      var sources = Object.keys(el.settings.source);
      if (el.settings.applyFilterRowToSources) {
        sources = sources.concat(el.settings.applyFilterRowToSources);
      }
      $.each(sources, function eachSource() {
        var source = indiciaData.esSourceObjects[this];
        // Reset to first page.
        source.settings.from = 0;
        source.populate();
      });
    });

    /**
     * Multi-select switch toggle handler.
     */
    $(el).find('.multiselect-switch').click(function clickMultiselectSwitch() {
      var table = $(el).find('table');
      if ($(el).hasClass('multiselect-mode')) {
        $(el).removeClass('multiselect-mode');
        $(table).find('.multiselect-cntr').remove();
        $('.selection-buttons-placeholder').append($('.all-selected-buttons'));
      } else {
        $(el).addClass('multiselect-mode');
        $(table).find('thead tr').prepend(
          '<th class="multiselect-cntr" />'
        );
        $(table).find('tbody tr').prepend('<td class="multiselect-cntr"><input type="checkbox" title="' + indiciaData.lang.dataGrid.checkToIncludeInList + '" class="multiselect" /></td>');
        $(table).closest('div').prepend(
          $('.all-selected-buttons')
        );
      }
      setTableHeight(el);
    });

    /**
     * Click handler for the settings icon. Displays the config overlay pane.
     */
    $(el).find('.data-grid-show-settings').click(function settingsIconClick() {
      const panel = findSettingsPanel(el);
      appendColumnsToConfigList(el, el.settings.columns);
      Sortable.create($(panel).find('ol')[0]);
      $.fancybox.open(panel);
    });

    $(el).find('.fullscreen-tool').click(function fullscreenIconClick() {
      indiciaFns.goFullscreen(el);
    });

    /**
     * Config save button handler.
     */
    $('#' + el.id + ' .data-grid-settings .save').click(function() {
      var header = $(el).find('thead');
      var colsList = [];
      const panel = findSettingsPanel(el);
      $.each($(panel).find('ol :checkbox:checked'), function eachCheckedCol() {
        colsList.push($(this).val());
      });
      applyColumnsList(el, colsList);
      // Save columns in a cookie.
      if (el.settings.cookies) {
        indiciaFns.cookie('cols-' + el.id, JSON.stringify(colsList), { expires: 3650 });
      }
      $(header).find('*').remove();
      // Output header row for column titles.
      if (el.settings.includeColumnHeadings !== false) {
        addColumnHeadings(el, header);
      }
      // Output header row for filtering.
      if (el.settings.includeFilterRow !== false) {
        addFilterRow(el, header);
      }
      el.settings.sourceObject.populate(true);
      $.fancybox.close();
    });

    /**
     * Config cancel button handler.
     */
    $('#' + el.id + ' .data-grid-settings .cancel').click(function() {
      $.fancybox.close();
    });

    /**
     * Config restore button handler.
     */
    $('#' + el.id + ' .data-grid-settings .restore').click(function(e) {
      // Discard current columns and replace with defaults.
      $(findSettingsPanel(el)).find('ol li').remove();
      appendColumnsToConfigList(el, el.settings.defaultColumns);
    });

    /**
     * Config toggle button handler.
     */
    $('#' + el.id + ' .data-grid-settings .toggle').click(function() {
      const panel = findSettingsPanel(el);
      var anyUnchecked = $([panel]).find('ol li :checkbox:not(:checked)').length > 0;
      $(panel).find('ol li :checkbox').prop('checked', anyUnchecked);
    });

    /**
     * On text entry into the search box, filter the visible columns.
     */
    $('#' + el.id + ' .grid-settings-search').keyup(function(e) {
      // Retrieve the search text from the input element and convert it to lowercase
      const searchText = $(e.currentTarget).val().toLowerCase();

      // Iterate over each list item within the element with class 'data-grid-settings'
      $.each($('.data-grid-settings li'), function() {
        const li = this;
        // Check if the list item's text content contains the search text
        if (li.textContent.toLowerCase().indexOf(searchText) === -1) {
          // Hide the list item if it does not contain the search text
          $(li).hide();
        } else {
          // Show the list item if it contains the search text
          $(li).show();
        }
      });
    });

    // Public function so it can be called from bindControls event handlers.
    el.loadSelectedRow = loadSelectedRow;
  }

  /**
   * Find the data used to populate the table in the response.
   *
   * Data can be found in the response hits (i.e. standard occurrence
   * documents), the buckets of an aggregation, or a custom built source table.
   */
  function getSourceDataList(el, response) {
    if (el.settings.sourceObject.settings.aggregation) {
      // Aggregated data so use the buckets.
      return indiciaFns.findValue(response.aggregations, 'buckets');
    }
    // A standard list of records.
    return response.hits.hits;
  }

  function addHeader(el, table) {
    var header;
    // If we need any sort of header, add <thead>.
    if (el.settings.includeColumnHeadings !== false || el.settings.includeFilterRow !== false) {
      header = $('<thead/>').appendTo(table);
      // Output header row for column titles.
      if (el.settings.includeColumnHeadings !== false) {
        addColumnHeadings(el, header);
      }
      // Output header row for filtering.
      if (el.settings.includeFilterRow !== false) {
        addFilterRow(el, header);
      }
    }
  }

  /**
   * Return the <td> elements for special behaviours in a row.
   *
   * Includes row selection and responsive table toggle cells.
   */
  function getRowBehaviourCells(el) {
    var cells = [];
    if ($(el).hasClass('multiselect-mode')) {
      cells.push('<td class="multiselect-cntr"><input type="checkbox" title="' + indiciaData.lang.dataGrid.checkToIncludeInList + '" class="multiselect" /></td>');
    }
    if (el.settings.responsive) {
      cells.push('<td class="footable-toggle-col"></td>');
    }
    return cells;
  }

  /**
   * Return the <td> elements for data in a row.
   */
  function getDataCells(el, doc, maxCharsPerCol) {
    var cells = [];
    var sourceSettings = el.settings.sourceObject.settings;
    $.each(el.settings.columns, function eachColumn(idx) {
      var value;
      var rangeValue;
      var classes = ['col-' + idx];
      var style = '';
      var colDef = el.settings.availableColumnInfo[this.field];
      var date;
      // Extra space in last col to account for tool icons.
      var extraSpace = idx === el.settings.columns.length - 1 && !el.settings.actions.length ? 2 : 0;
      var charWidth;
      // In compositeAggregation mode, fields are replaced by key names. We replace
      // . with - to avoid confusion when iterating down paths.
      var field = sourceSettings.mode === 'compositeAggregation' && $.inArray(this.field, sourceSettings.fields) > -1
        ? this.field.asCompositeKeyName() : this.field;
      value = indiciaFns.getValueForField(doc, field, colDef);
      if (colDef.rangeField) {
        rangeValue = indiciaFns.getValueForField(doc, colDef.rangeField);
        if (value !== rangeValue) {
          value = value + ' to ' + rangeValue;
        }
      }
      if (value && colDef.handler && colDef.handler === 'date') {
        date = new Date(value);
        value = date.toLocaleDateString();
      } else if (value && colDef.handler && colDef.handler === 'datetime') {
        date = new Date(value);
        value = date.toLocaleString();
      }
      if (value && typeof value === 'string' && value.match(/class="(single|multi)"/)) {
        // Thumbnail(s) so give approx column size.
        charWidth = value.match(/class="single"/) ? 8 : 14;
        maxCharsPerCol['col-' + idx] = Math.max(maxCharsPerCol['col-' + idx], extraSpace + charWidth);
      } else {
        maxCharsPerCol['col-' + idx] =
          Math.max(maxCharsPerCol['col-' + idx], longestWordLength($('<p>' + value + '</p>').text()) + extraSpace);
      }
      if (value === '!' && (field.substr(0, 9) === '#sitename' || field === 'location.verbatim_locality')) {
        value = '<i class="fas fa-eye-slash" title="' + indiciaData.lang.dataGrid.siteNameWitheld + '"></i>';
      }
      classes.push('field-' + this.field.replace(/\./g, '--').replace(/_/g, '-').replace(/[^a-z\-]/g, ''));
      // Copy across responsive hidden cols.
      if ($(el).find('table th.col-' + idx).css('display') === 'none') {
        style = ' style="display: none"';
      }
      value = value === null ? '' : value;
      if (colDef.ifEmpty && value === '') {
        value = colDef.ifEmpty;
      }
      cells.push('<td class="' + classes.join(' ') + '"' + style + '>' + value + '</td>');
      return true;
    });
    return cells;
  }

  /**
   * After population of the table, fire callbacks.
   *
   * Callbacks may be linked to the populate event or the itemSelect event if
   * the selected row changes.
   */
  function fireAfterPopulationCallbacks(el) {
    // Fire any population callbacks.
    $.each(el.callbacks.populate, function eachCallback() {
      this(el);
    });
    // Fire callbacks for selected row if any.
    $.each(el.callbacks.itemSelect, function eachCallback() {
      this($(el).find('tr.selected').length === 0 ? null : $(el).find('tr.selected')[0]);
    });
  }

  /**
   * Column resizing needs to be done manually when tbody has scroll bar.
   *
   * Tbody can only have scroll bar if not it's normal CSS display setting, so
   * we lose col auto-resizing. This sets col widths according to the max
   * amount of data in each.
   */
  function setColWidths(el, maxCharsPerCol) {
    var maxCharsPerRow = 0;
    var tbody = $(el).find('tbody');
    var hiddenContainer;
    var hiddenContainerOrigStyle;
    if ($(el).is(':hidden')) {
      // If on a hidden tab, clientWidth is broken, so we need to temporarily
      // show the container with opacity 0 in order for calculations to work.
      hiddenContainer = $(el).closest('.indicia-lazy-load');
      hiddenContainerOrigStyle = hiddenContainer.attr('style');
      hiddenContainer
        .css('opacity', 0)
        .css('position', 'absolute')
        .css('display', 'block');
    }
    var pixelsAvailable = tbody[0].clientWidth;
    var scrollbarWidth = tbody[0].offsetWidth - tbody[0].clientWidth;
    var scrollBarInnerWidth;
    var outerSpacing = $(el).find('.col-0').outerWidth() - $(el).find('.col-0').width();
    if (hiddenContainer) {
      hiddenContainer.attr('style', hiddenContainerOrigStyle)
    }
    // Column resizing needs to be done manually when tbody has scroll bar.
    if (el.settings.tbodyHasScrollBar) {
      if (el.settings.responsive) {
        // Allow 14px space for responsive show + button.
        $(el).find('.footable-toggle-col').css('width', '14px');
        pixelsAvailable -= $(el).find('.footable-toggle-col').outerWidth();
      }
      if (el.settings.actions.length > 0) {
        // Allow 22px space for actions column.
        $(el).find('.col-actions').css('width', '22px');
        pixelsAvailable -= $(el).find('.col-actions').outerWidth();
      } else {
        $(el).find('.col-actions').css('width', 0);
      }
      // Space header if a scroll bar visible.
      if (tbody.find('tr').length > 0 && scrollbarWidth > 0) {
        scrollBarInnerWidth = scrollbarWidth - outerSpacing;
        $(el).find('.scroll-spacer').css('width', scrollBarInnerWidth + 'px');
        pixelsAvailable -= $(el).find('.scroll-spacer').outerWidth();
      } else {
        $(el).find('.scroll-spacer').css('width', 0);
      }
      $.each(el.settings.columns, function eachColumn(idx) {
        // Allow extra char per col for padding.
        maxCharsPerCol['col-' + idx] += 1;
        maxCharsPerRow += maxCharsPerCol['col-' + idx];
      });
      $.each(el.settings.columns, function eachColumn(idx) {
        $(el).find('.col-' + idx).css('width', (pixelsAvailable * (maxCharsPerCol['col-' + idx] / maxCharsPerRow) - outerSpacing) + 'px');
      });
    }
  }

  /**
   * Finds the longest word in a string.
   */
  function longestWordLength(str) {
    var strSplit = str.split(' ');
    var longestWord = 0;
    var i;
    for (i = 0; i < strSplit.length; i++) {
      if (strSplit[i].length > longestWord) {
        longestWord = strSplit[i].length;
      }
    }
    return longestWord;
  }

  function buildColDef(field, agg) {
    var colDef = {
      field: field,
      caption: field.asReadableKeyName()
    };
    var aggField;
    if (indiciaData.esMappings[field] && indiciaData.esMappings[field].type === 'date') {
      colDef.handler = 'date';
    } else if (agg) {
      aggField = indiciaFns.findValue(agg, 'field');
      if (aggField && indiciaData.esMappings[aggField] && indiciaData.esMappings[aggField].type === 'date') {
        colDef.handler = 'date';
      }
    }
    return colDef;
  }

  /**
   * Column setup.
   *
   * * Applies default list of columns if not specified.
   * * Defines the list of available columns for selection.
   */
  function setupColumnInfo(el) {
    var srcSettings = el.settings.sourceObject.settings;
    if (!el.settings.columns) {
      el.settings.columns = [];
      // In aggregation mode, defaults are the field list + aggs list.
      if (srcSettings.mode.match(/Aggregation$/)) {
        el.settings.columns.push(buildColDef(srcSettings.uniqueField));
        $.each(srcSettings.fields, function eachField() {
          if (this !== srcSettings.uniqueField) {
            el.settings.columns.push(buildColDef(this));
          }
        });
        $.each(srcSettings.aggregation, function eachAgg(key) {
          el.settings.columns.push(buildColDef(key, this));
        });
      } else {
        // Docs mode.
        el.settings.columns.push({
          field: 'taxon.accepted_name',
          caption: indiciaData.gridMappingFields['taxon.accepted_name'].caption
        });
        el.settings.columns.push({
          field: '#event_date#',
          caption: 'Date'
        });
        el.settings.columns.push({
          field: 'location.output_sref',
          caption: indiciaData.gridMappingFields['location.output_sref'].caption
        });
      }
    }
    el.settings.availableColumnInfo = {};
    // Keep the list of names in order.
    el.settings.availableColumnNames = [];
    // Specified columns must appear first.
    $.each(el.settings.columns, function eachCol() {
      el.settings.availableColumnInfo[this.field] = this;
      el.settings.availableColumnNames.push(this.field);
    });
    // Add other mappings if in docs mode, unless overridden by availableColumns
    // setting.
    if (srcSettings.mode === 'docs') {
      $.each(indiciaData.gridMappingFields, function eachMapping(key, obj) {
        var exist = el.settings.availableColumnInfo[key] || {};
        // Include unless not in configured list of available cols.
        if (!el.settings.availableColumns || $.inArray(key, el.settings.availableColumns) > -1) {
          el.settings.availableColumnInfo[key] = $.extend({}, obj, exist, { field: key });
          el.settings.availableColumnNames.push(key);
        }
      });
    }
  }

  /**
   * Declare public methods.
   */
  methods = {
    /**
     * Initialise the idcDataGrid plugin.
     *
     * @param array options
     */
    init: function init(options) {
      var el = this;
      var table;
      var totalCols;
      var footableSort;
      var tableClasses = ['table', 'es-data-grid'];
      var savedCols;
      var tools = [];

      indiciaFns.registerOutputPluginClass('idcDataGrid');
      el.settings = $.extend(true, {}, defaults);
      // Apply settings passed in the HTML data-* attribute.
      if ($(el).data('idc-config')) {
        $.extend(el.settings, $(el).data('idc-config'));
      }
      if (el.settings.scrollY) {
        el.settings.tbodyHasScrollBar = true;
      }
      // Apply settings passed to the constructor.
      if (typeof options !== 'undefined') {
        $.extend(el.settings, options);
      }
      el.callbacks = callbacks;
      // dataGrid does not make use of multiple sources.
      el.settings.sourceObject = indiciaData.esSourceObjects[Object.keys(el.settings.source)[0]];
      // Disable cookies unless id specified.
      if (!el.id || !$.cookie) {
        el.settings.cookies = false;
      }
      setupColumnInfo(el);
      // Store original column settings.
      el.settings.defaultColumns = el.settings.columns.slice();
      // Load from cookie.
      if (el.settings.cookies) {
        savedCols = $.cookie('cols-' + el.id);
        // Don't recall cookie if empty, as this is unlikely to be deliberate.
        if (savedCols && savedCols !== '[]') {
          applyColumnsList(el, JSON.parse(savedCols));
        }
      }
      // Revert to default in case of broken cookie.
      if (el.settings.columns.length === 0) {
        el.settings.columns = el.settings.defaultColumns.slice();
      }
      footableSort = el.settings.sourceObject.settings.mode === 'compositeAggregation' && el.settings.sortable
        ? 'true' : 'false';
      if (el.settings.tbodyHasScrollBar) {
        tableClasses.push('fixed-header');
      }
      // Build the elements required for the table.
      table = $('<table class="' + tableClasses.join(' ') + '" data-sort="' + footableSort + '" />').appendTo(el);
      addHeader(el, table);
      // We always want a table body for the data.
      $('<tbody />').appendTo(table);
      // Output a footer if we want a pager.
      if (el.settings.includePager) {
        totalCols = el.settings.columns.length
          + (el.settings.responsive ? 1 : 0)
          + (el.settings.actions.length > 0 ? 1 : 0);
        $('<tfoot><tr class="footer"><td colspan="' + totalCols + '"><div class="form-inline">' + indiciaFns.getFooterControls(el) + '</div></td></tr></tfoot>').appendTo(table);
      }
      setTableHeight(el);
      // Add tool icons for table settings, full screen and multiselect mode.
      if (el.settings.includeMultiSelectTool) {
        tools.push('<span title="Enable multiple selection mode" class="fas fa-list multiselect-switch"></span>');
      }
      if (el.settings.includeColumnSettingsTool) {
        tools.push('<span class="fas fa-wrench data-grid-show-settings" title="' + indiciaData.lang.dataGrid.columnSettingsToolHint + '"></span>');
      }
      if (el.settings.includeFullScreenTool &&
          (document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled)) {
        tools.push('<span class="far fa-window-maximize fullscreen-tool" title="' + indiciaData.lang.dataGrid.fullScreenToolHint + '"></span>');
      }
      $('<div class="idc-tools">' + tools.join('<br/>') + '</div>').appendTo(el);
      initHandlers(el);
      if (footableSort === 'true' || el.settings.responsive) {
        // Make grid responsive.
        $(el).indiciaFootableReport(el.settings.responsiveOptions);
      }
      if (el.settings.responsive && el.settings.autoResponsiveExpand) {
        // Auto-expand the extra details row if cols hidden because below a
        // breakpoint.
        $(table).trigger('footable_expand_all');
        $(table).bind('footable_breakpoint', function onBreak() {
          $(table).trigger('footable_expand_all');
        });
      }
      indiciaFns.updateControlLayout();
      window.addEventListener('resize', function resize() { setTableHeight(el); });
    },

    /**
     * Populate the data grid with Elasticsearch response data.
     *
     * @param obj sourceSettings
     *   Settings for the data source used to generate the response.
     * @param obj response
     *   Elasticsearch response data.
     * @param obj data
     *   Data sent in request.
     */
    populate: function populate(sourceSettings, response, data) {
      var el = this;
      var dataList = getSourceDataList(el, response);
      var maxCharsPerCol = {};
      var afterKey = indiciaFns.findValue(response, 'after_key');
      applySourceModeSettings(el);
      if (sourceSettings.mode === 'compositeAggregation' && !afterKey && el.settings.compositeInfo.page > 0) {
        // Moved past last page, so abort.
        $(el).find('.next').prop('disabled', true);
        el.settings.compositeInfo.page--;
        return;
      }
      // Cleanup before repopulating.
      $(el).find('tbody tr').remove();
      lastLoadedRowId = null;
      $(el).find('.multiselect-all').prop('checked', false);
      // In tbodyHasScrollBar mode, we have to calculate the column widths
      // ourselves since putting CSS overflow on tbody requires us to lose
      // table layout. Start by finding the number of characters in header
      // cells. Later we'll increase this if  we find cells in a column that
      // contain more characters.
      $.each(el.settings.columns, function eachColumn(idx) {
        // Only use the longest word in the caption as we'd rather break the
        // heading than the data rows.
        maxCharsPerCol['col-' + idx] = Math.max(longestWordLength(el.settings.availableColumnInfo[this.field].caption), 3);
        if (typeof indiciaData.esMappings[this] !== 'undefined' && indiciaData.esMappings[this.field].sort_field) {
          // Add 2 chars to allow for the sort icon.
          maxCharsPerCol['col-' + idx] += 2;
        }
      });
      if (el.settings.actions.length === 0 && !el.settings.tbodyHasScrollBar) {
        // If no scrollbar or actions column, 2 extra chars for the last
        // heading as it contains tool icons.
        maxCharsPerCol['col-' + (el.settings.columns.length - 1)] += 2;
      }
      $.each(dataList, function eachHit(i) {
        var hit = this;
        var cells = [];
        var row;
        var classes = ['data-row'];
        var doc = hit._source ? hit._source : hit;
        var dataRowIdAttr;
        // For keyboard navigation, need to enable row focus.
        var tabindexAttr = el.settings.keyboardNavigation ? 'tabindex="' + i + '" ' : '';
        cells = getRowBehaviourCells(el);
        cells = cells.concat(getDataCells(el, doc, maxCharsPerCol));
        if (el.settings.actions.length) {
          cells.push('<td class="col-actions">' + indiciaFns.getActions(el, el.settings.actions, doc) + '</td>');
        }
        if (el.settings.selectIdsOnNextLoad && $.inArray(hit._id, el.settings.selectIdsOnNextLoad) !== -1) {
          classes.push('selected');
        }
        // Automatically add class for zero abundance data so it can be struck
        // through.
        if (doc.occurrence && doc.occurrence.zero_abundance === 'true') {
          classes.push('zero-abundance');
        }
        if (el.settings.rowClasses) {
          $.each(el.settings.rowClasses, function eachClass() {
            classes.push(indiciaFns.applyFieldReplacements(el, doc, this));
          });
        }
        dataRowIdAttr = hit._id ? ' data-row-id="' + hit._id + '"' : '';
        row = $('<tr class="' + classes.join(' ') + '"' + tabindexAttr + dataRowIdAttr + '>'
           + cells.join('') +
           '</tr>').appendTo($(el).find('tbody'));
        $(row).attr('data-doc-source', JSON.stringify(doc));
        return true;
      });
      if (el.settings.responsive) {
        $(el).find('table').trigger('footable_redraw');
      }
      indiciaFns.updatePagingFooter(el, response, data, 'tbody tr', afterKey);
      fireAfterPopulationCallbacks(el);
      setColWidths(el, maxCharsPerCol);
    },

    /**
     * Bind control to other control event callbacks.
     *
     * Call after init of all controls. Finds other controls that update items
     * and binds to the event handler. E.g. picks up changes caused by
     * verification buttons.
     */
    bindControls: function() {
      var el = this;
      $.each($('.idc-control'), function() {
        var controlClass = $(this).data('idc-class');
        if (this.callbacks && this.callbacks.itemUpdate) {
          $(this)[controlClass]('on', 'itemUpdate', (item) => {
            $(item).removeClass('selected');
            while (item.length > 0 && $(item).hasClass('disabled')) {
              item = $(item).next('[data-row-id]');
            }
            if (item) {
              $(item).addClass('selected').focus();
            }
            el.loadSelectedRow();
          });
        }
      });
    },

    /**
     * Register an event handler.
     *
     * @param string event
     *   Event name.
     * @param function handler
     *   Callback function called on this event.
     */
    on: function on(event, handler) {
      if (typeof this.callbacks[event] === 'undefined') {
        indiciaFns.controlFail(this, 'Invalid event handler requested for ' + event);
      }
      this.callbacks[event].push(handler);
    },

    /**
     * Grids always populate when their source updates.
     */
    getNeedsPopulation: function getNeedsPopulation() {
      return true;
    }

  };

  /**
   * Extend jQuery to declare idcDataGrid plugin.
   */
  $.fn.idcDataGrid = function buildDataGrid(methodOrOptions) {
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
      $.error('Method ' + methodOrOptions + ' does not exist on jQuery.idcDataGrid');
      return true;
    });
    // If the method has no explicit response, return this to allow chaining.
    return typeof result === 'undefined' ? this : result;
  };
}());
