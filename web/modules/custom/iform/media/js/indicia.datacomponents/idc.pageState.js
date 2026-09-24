/**
 * @file
 * Contract bootstrap for optional Elasticsearch page-state controls.
 *
 * Indicia, the OPAL Online Recording Toolkit.
 *
 * This file contains the page-state coordinator and its storage contract.
 * Individual providers remain responsible for their own state shape.
 */

(function enclose($) {
  'use strict';

  /**
   * Read the configuration attached to a page-state control.
   *
   * @param object el
   *   Page-state control element.
   *
   * @return object
   *   Parsed control configuration.
   */
  function getControlConfig(el) {
    var config = $(el).attr('data-idc-config');
    if (!config) {
      return {};
    }
    try {
      return JSON.parse(config);
    }
    catch (error) {
      indiciaFns.controlFail($(el), 'Invalid page-state control configuration');
      return {};
    }
  }

  var cookieChunkSize = 3500;
  var stateSchemaVersion = 3;
  var customFilterControlSelector = '.es-filter-param:not(.es-location-select-geom), .es-location-select, .es-higher-geography-select';

  /**
   * Notify the page-state coordinator that component-owned state changed.
   *
   * @param object owner
   *   Component or source whose state changed.
   * @param string stateType
   *   Name of the changed state category.
   */
  indiciaFns.notifyPageStateChanged = function notifyPageStateChanged(owner, stateType) {
    $(document).trigger('idcPageStateChanged', [{
      owner: owner,
      stateType: stateType
    }]);
  };

  /**
   * Track asynchronous work required before restored filters can be applied.
   */
  indiciaFns.beginPageStateRestoreOperation = function beginPageStateRestoreOperation() {
    indiciaData.pageStateRestoreOperationCount = (indiciaData.pageStateRestoreOperationCount || 0) + 1;
  };

  /**
   * Complete asynchronous restoration and run any deferred population.
   */
  indiciaFns.endPageStateRestoreOperation = function endPageStateRestoreOperation() {
    indiciaData.pageStateRestoreOperationCount = Math.max((indiciaData.pageStateRestoreOperationCount || 1) - 1, 0);
    if (indiciaData.pageStateRestoreOperationCount === 0 && indiciaData.pageStatePopulationDeferred) {
      var resetPage = indiciaData.pageStateDeferredPopulationResetPage;
      indiciaData.pageStatePopulationDeferred = false;
      indiciaData.pageStateDeferredPopulationResetPage = false;
      indiciaFns.populateDataSources(resetPage);
    }
  };

  /**
   * Defer population while asynchronous restored filter values are incomplete.
   */
  indiciaFns.deferPageStateDataSourcePopulation = function deferPageStateDataSourcePopulation(resetPage) {
    if (!indiciaData.pageStateRestoreOperationCount) {
      return false;
    }
    indiciaData.pageStatePopulationDeferred = true;
    indiciaData.pageStateDeferredPopulationResetPage = indiciaData.pageStateDeferredPopulationResetPage || resetPage;
    return true;
  };

  /**
   * Split a value into chunks that remain within the limit after cookie
   * encoding.
   */
  function getCookieChunks(value) {
    var chunks = [];
    var chunk = '';
    var encodedLength = 0;
    for (var idx = 0; idx < value.length; idx++) {
      var character = value.charAt(idx);
      var characterCode = value.charCodeAt(idx);
      if (characterCode >= 0xD800 && characterCode <= 0xDBFF && idx + 1 < value.length) {
        var nextCharacterCode = value.charCodeAt(idx + 1);
        if (nextCharacterCode >= 0xDC00 && nextCharacterCode <= 0xDFFF) {
          character += value.charAt(++idx);
        }
      }
      var encodedCharacterLength = encodeURIComponent(character).length;
      if (chunk && encodedLength + encodedCharacterLength > cookieChunkSize) {
        chunks.push(chunk);
        chunk = '';
        encodedLength = 0;
      }
      chunk += character;
      encodedLength += encodedCharacterLength;
    }
    if (chunk) {
      chunks.push(chunk);
    }
    return chunks;
  }

  /**
   * Return a cookie-safe key derived from the current page.
   *
   * @param object el
   *   Page-state control element.
   * @return string
   *   Storage key prefix.
   */
  function getStorageKey(el, schemaVersion) {
    var configuredKey = el.settings.storageKey;
    var pageKey = window.location.pathname || 'page';
    var storageKey = configuredKey ||
      'idc-page-state-' + pageKey.replace(/[^a-zA-Z0-9_-]/g, '_') + (el.id ? '-' + el.id : '');
    var userScope = typeof indiciaData.user_id !== 'undefined' && indiciaData.user_id !== null && indiciaData.user_id !== ''
      ? String(indiciaData.user_id)
      : 'anonymous';
    schemaVersion = typeof schemaVersion === 'undefined' ? stateSchemaVersion : schemaVersion;
    return storageKey + '-v' + schemaVersion + '-u' + userScope.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * Remove a page-state cookie and any chunk cookies belonging to it.
   */
  function removeStoredState(key) {
    var manifest = indiciaFns.cookie(key);
    var chunkCount = manifest ? parseInt(manifest, 10) : 0;
    indiciaFns.cookie(key, null);
    if (!isNaN(chunkCount)) {
      for (var idx = 0; idx < chunkCount; idx++) {
        indiciaFns.cookie(key + '-' + idx, null);
      }
    }
  }

  /**
   * Remove cookies left behind by earlier page-state schemas.
   */
  function removeObsoleteStoredStates(el) {
    for (var version = 1; version < stateSchemaVersion; version++) {
      removeStoredState(getStorageKey(el, version));
    }
  }

  /**
   * Store JSON state in one or more cookies.
   *
   * A short manifest cookie stores the number of chunks. The wrapper used for
   * all reads and writes honours the site's cookie-consent configuration.
   */
  function storeState(key, state, expires) {
    var serialised = JSON.stringify({
      version: stateSchemaVersion,
      state: state
    });
    var chunks = getCookieChunks(serialised);
    var oldChunkCount = parseInt(indiciaFns.cookie(key), 10);
    var chunkCount = chunks.length;
    if (chunkCount < 1) {
      removeStoredState(key);
      return;
    }
    if (!isNaN(oldChunkCount)) {
      for (var oldIdx = chunkCount; oldIdx < oldChunkCount; oldIdx++) {
        indiciaFns.cookie(key + '-' + oldIdx, null);
      }
    }
    for (var idx = 0; idx < chunkCount; idx++) {
      indiciaFns.cookie(key + '-' + idx, chunks[idx], {
        expires: expires
      });
    }
    indiciaFns.cookie(key, String(chunkCount), { expires: expires });
  }

  /**
   * Read and parse state stored by storeState().
   */
  function readStoredState(key) {
    var chunkCount = parseInt(indiciaFns.cookie(key), 10);
    var serialised = '';
    var stored;
    if (isNaN(chunkCount) || chunkCount < 1) {
      return null;
    }
    for (var idx = 0; idx < chunkCount; idx++) {
      serialised += indiciaFns.cookie(key + '-' + idx) || '';
    }
    try {
      stored = JSON.parse(serialised);
      if (!stored || stored.version !== stateSchemaVersion || !stored.state || typeof stored.state !== 'object') {
        removeStoredState(key);
        return null;
      }
      return stored.state;
    }
    catch (error) {
      removeStoredState(key);
      return null;
    }
  }

  /**
   * Return true when a state category is enabled in the control config.
   */
  function categoryEnabled(el, category) {
    return el.settings[category] !== false;
  }

  /**
   * Capture visibility of the standard report-filter panels.
   */
  function getFilterPanelVisibility() {
    return {
      details: $('#filter-details').is(':visible')
    };
  }

  /**
   * Restore visibility of the standard report-filter panels.
   */
  function restoreFilterPanelVisibility(state) {
    if (!state || typeof state !== 'object') {
      return;
    }
    if (state.details) {
      // Clear inline values written by older page-state cookies. Pane
      // visibility is derived from the filter-details container.
      $('#filter-panes .pane').css('display', '');
      $('#filter-details').show();
      $('#filter-build').addClass('disabled');
    }
    else {
      $('#filter-details').hide();
      $('#filter-build').removeClass('disabled');
    }
  }

  /**
   * Get the registered output controls that expose page-state methods.
   */
  function getStatefulOutputs() {
    return $('.idc-dataGrid, .idc-cardGallery').filter(function statefulOutput() {
      return this.id && this.settings && this.settings.sourceObject;
    });
  }

  /**
   * Invoke a state method on a jQuery output plugin.
   */
  function callOutputMethod(el, method, state) {
    if ($(el).hasClass('idc-dataGrid')) {
      return $(el).idcDataGrid(method, state);
    }
    if ($(el).hasClass('idc-cardGallery')) {
      return $(el).idcCardGallery(method, state);
    }
    return null;
  }

  /**
   * Return a stable state key for an Elasticsearch filter control.
   */
  function getCustomFilterControlKey(control, index) {
    var id = $(control).attr('id');
    var name = $(control).attr('name');
    if (id) {
      return 'id:' + id;
    }
    if (name) {
      var nameIndex = $(customFilterControlSelector).filter(function matchingName() {
        return $(this).attr('name') === name;
      }).index(control);
      return 'name:' + name + ':' + nameIndex;
    }
    return 'index:' + index;
  }

  /**
   * Capture values of custom Elasticsearch filter controls.
   */
  function getCustomFilterControlState(useDefaults) {
    var state = {};
    $(customFilterControlSelector).each(function eachFilterControl(index) {
      var value = $(this).val();
      if (useDefaults && this.tagName === 'SELECT') {
        value = $(this).find('option').filter(function defaultOption() {
          return this.defaultSelected;
        }).map(function defaultOptionValue() {
          return this.value;
        }).get();
        if (!this.multiple) {
          value = value.length > 0 ? value[0] : '';
        }
      }
      else if (useDefaults && (this.tagName === 'INPUT' || this.tagName === 'TEXTAREA')) {
        value = this.defaultValue;
      }
      var controlState = {
        value: value
      };
      if ($(this).is(':checkbox, :radio')) {
        controlState.checked = useDefaults ? this.defaultChecked : $(this).is(':checked');
      }
      state[getCustomFilterControlKey(this, index)] = controlState;
    });
    return state;
  }

  /**
   * Restore custom Elasticsearch filter controls without triggering reloads.
   */
  function restoreCustomFilterControlState(state, resetLocations) {
    var linkedChildIds = {};
    var linkedSelectOptions = {};
    if (!state || typeof state !== 'object') {
      return;
    }
    indiciaData.restoredEsLocationFilterValues = {};
    $(customFilterControlSelector).each(function eachFilterControl(index) {
      var controlState = state[getCustomFilterControlKey(this, index)];
      var isLocationControl = $(this).hasClass('es-location-select') ||
        $(this).hasClass('es-higher-geography-select');
      if (!controlState || typeof controlState !== 'object') {
        return;
      }
      $(this).val(resetLocations && isLocationControl ? '' : controlState.value);
      if (isLocationControl && !resetLocations) {
        indiciaData.restoredEsLocationFilterValues[this.id] = controlState.value;
      }
      if (Object.prototype.hasOwnProperty.call(controlState, 'checked')) {
        $(this).prop('checked', controlState.checked === true);
      }
    });
    if (resetLocations) {
      $.each(indiciaData.linkedSelects || [], function indexLinkedSelect() {
        linkedSelectOptions[this.id] = this;
      });
      $(customFilterControlSelector).filter('.es-location-select, .es-higher-geography-select').each(function clearLocationControl() {
        var options = linkedSelectOptions[this.id];
        $(this).val('');
        $('#' + this.id + '-geom').val('');
        if (options && options.parentControlId) {
          if (options.hideChildrenUntilLoaded) {
            $(this).hide();
          }
          $(this).addClass('ui-state-disabled').html('<option disabled>' + options.instruct + '</option>');
        }
      });
    }
    $.each(indiciaData.linkedSelects || [], function identifyLinkedChildren() {
      linkedChildIds[$('#' + this.escapedId).attr('id')] = true;
    });
    $.each(resetLocations ? [] : (indiciaData.linkedSelects || []), function restoreRootLinkedSelect() {
      var parentSelect = $('#' + this.parentControlId);
      var parentId = parentSelect.attr('id');
      if (parentSelect.length && !linkedChildIds[parentId] &&
          Object.prototype.hasOwnProperty.call(indiciaData.restoredEsLocationFilterValues, parentId)) {
        indiciaFns.changeLinkedParentSelect(parentSelect[0], this);
      }
    });
    indiciaFns.restoreEsLocationFilterFeatures();
  }

  /**
   * Return only source fields enabled for this persistence control.
   */
  function getEnabledSourceState(el, sourceState) {
    var enabledState = {};
    var categories = {
      sort: 'sort',
      from: 'page',
      pageSize: 'rowsPerPage'
    };
    if (!sourceState || typeof sourceState !== 'object') {
      return enabledState;
    }
    $.each(categories, function eachCategory(field, category) {
      if (categoryEnabled(el, category) && Object.prototype.hasOwnProperty.call(sourceState, field)) {
        enabledState[field] = sourceState[field];
      }
    });
    return enabledState;
  }

  /**
   * Restore report-filter state when its optional provider is available.
   */
  function restoreReportFilterState(el, state) {
    var currentReportFilterState;
    var reportFilterState;
    if (!state || typeof indiciaFns.getReportFilterPageState !== 'function' ||
        typeof indiciaFns.restoreReportFilterPageState !== 'function') {
      return false;
    }
    currentReportFilterState = indiciaFns.getReportFilterPageState();
    reportFilterState = $.extend(true, {}, currentReportFilterState);
    if (categoryEnabled(el, 'selectedFilter')) {
      reportFilterState.selectedFilter = state.selectedFilter;
      reportFilterState.id = state.id;
      reportFilterState.title = state.title;
    }
    if (categoryEnabled(el, 'filterDefinition')) {
      reportFilterState.definition = state.definition;
      reportFilterState.standardParams = state.standardParams;
    }
    indiciaFns.restoreReportFilterPageState(reportFilterState);
    return true;
  }

  /**
   * Complete restoration deferred until the optional report-filter provider loaded.
   */
  indiciaFns.restorePendingReportFilterPageState = function restorePendingReportFilterPageState() {
    var pending = indiciaData.pendingReportFilterPageState;
    if (pending && restoreReportFilterState(pending.el, pending.state)) {
      delete indiciaData.pendingReportFilterPageState;
    }
  };

  /**
   * Capture all state exposed by the page's providers.
   */
  function captureState(el, useControlDefaults) {
    var state = {};
    if ((categoryEnabled(el, 'selectedFilter') || categoryEnabled(el, 'filterDefinition')) &&
        typeof indiciaFns.getReportFilterPageState === 'function') {
      state.reportFilters = indiciaFns.getReportFilterPageState();
      if (!categoryEnabled(el, 'selectedFilter')) {
        delete state.reportFilters.selectedFilter;
        delete state.reportFilters.id;
        delete state.reportFilters.title;
      }
      if (!categoryEnabled(el, 'filterDefinition')) {
        delete state.reportFilters.definition;
        delete state.reportFilters.standardParams;
      }
    }
    if (categoryEnabled(el, 'filterPanelVisibility')) {
      state.filterPanelVisibility = getFilterPanelVisibility();
    }
    if (categoryEnabled(el, 'customFilterControls')) {
      state.customFilterControls = getCustomFilterControlState(useControlDefaults);
    }
    state.sources = {};
    $.each(indiciaData.esSourceObjects || {}, function eachSource(name, source) {
      if (typeof source.getPageState !== 'function') {
        return;
      }
      var sourceState = source.getPageState();
      if (!categoryEnabled(el, 'sort')) {
        delete sourceState.sort;
      }
      if (!categoryEnabled(el, 'page')) {
        delete sourceState.from;
      }
      if (!categoryEnabled(el, 'rowsPerPage')) {
        delete sourceState.pageSize;
      }
      state.sources[name] = sourceState;
    });
    state.outputs = {};
    if (categoryEnabled(el, 'gridFilterRow')) {
      getStatefulOutputs().each(function eachOutput() {
        var outputState = callOutputMethod(this, 'getPageState');
        if (outputState) {
          state.outputs[this.id] = outputState;
        }
      });
    }
    return state;
  }

  /**
   * Restore provider state without triggering requests.
   */
  function restoreState(el, state) {
    if (!state || typeof state !== 'object') {
      return;
    }
    if (state.reportFilters && (categoryEnabled(el, 'selectedFilter') || categoryEnabled(el, 'filterDefinition'))) {
      if (!restoreReportFilterState(el, state.reportFilters)) {
        indiciaData.pendingReportFilterPageState = {
          el: el,
          state: state.reportFilters
        };
      }
    }
    if (categoryEnabled(el, 'filterPanelVisibility')) {
      restoreFilterPanelVisibility(state.filterPanelVisibility);
    }
    if (categoryEnabled(el, 'customFilterControls')) {
      restoreCustomFilterControlState(state.customFilterControls);
    }
    $.each(state.sources || {}, function eachSource(name, sourceState) {
      var source = indiciaData.esSourceObjects && indiciaData.esSourceObjects[name];
      if (source && typeof source.restorePageState === 'function') {
        source.restorePageState(getEnabledSourceState(el, sourceState));
      }
    });
    if (categoryEnabled(el, 'gridFilterRow')) {
      getStatefulOutputs().each(function eachOutput() {
        if (state.outputs && state.outputs[this.id]) {
          callOutputMethod(this, 'restorePageState', state.outputs[this.id]);
        }
      });
    }
  }

  /**
   * Reset provider state without triggering requests.
   */
  function resetState(el) {
    var currentReportFilterState;
    var resetReportFilterState;
    if ((categoryEnabled(el, 'selectedFilter') || categoryEnabled(el, 'filterDefinition')) &&
        typeof indiciaFns.getReportFilterPageState === 'function' &&
        typeof indiciaFns.resetReportFilterPageState === 'function' &&
        typeof indiciaFns.restoreReportFilterPageState === 'function') {
      currentReportFilterState = indiciaFns.getReportFilterPageState();
      indiciaFns.resetReportFilterPageState();
      resetReportFilterState = indiciaFns.getReportFilterPageState();
      if (!categoryEnabled(el, 'selectedFilter')) {
        resetReportFilterState.selectedFilter = currentReportFilterState.selectedFilter;
        resetReportFilterState.id = currentReportFilterState.id;
        resetReportFilterState.title = currentReportFilterState.title;
      }
      if (!categoryEnabled(el, 'filterDefinition')) {
        resetReportFilterState.definition = currentReportFilterState.definition;
        resetReportFilterState.standardParams = currentReportFilterState.standardParams;
      }
      indiciaFns.restoreReportFilterPageState(resetReportFilterState);
    }
    if (categoryEnabled(el, 'filterPanelVisibility')) {
      restoreFilterPanelVisibility(el.pageStateDefaults && el.pageStateDefaults.filterPanelVisibility);
    }
    if (categoryEnabled(el, 'customFilterControls')) {
      restoreCustomFilterControlState(el.pageStateDefaults && el.pageStateDefaults.customFilterControls, true);
    }
    $.each(indiciaData.esSourceObjects || {}, function eachSource(name, source) {
      if (typeof source.resetPageState === 'function') {
        source.resetPageState({
          sort: categoryEnabled(el, 'sort'),
          from: categoryEnabled(el, 'page'),
          pageSize: categoryEnabled(el, 'rowsPerPage')
        });
      }
    });
    if (categoryEnabled(el, 'gridFilterRow')) {
      getStatefulOutputs().each(function eachOutput() {
        callOutputMethod(this, 'resetPageState');
      });
    }
  }

  /**
   * Persist the current state for a control.
   */
  function saveControlState(el) {
    storeState(getStorageKey(el), captureState(el), el.settings.expires);
  }

  /**
   * Restore state for a control, if a valid cookie exists.
   */
  function loadControlState(el) {
    var state = readStoredState(getStorageKey(el));
    if (!state) {
      return false;
    }
    restoreState(el, state);
    return true;
  }

  /**
   * Initialise all page-state controls emitted on the page.
   *
   * The registry gives the future coordinator one stable discovery point while
   * keeping control-specific configuration on the originating DOM element.
   */
  indiciaFns.initPageStateControls = function initPageStateControls() {
    indiciaData.pageStateControls = indiciaData.pageStateControls || [];
    $('.idc-persistPageState').each(function eachControl() {
      var el = this;
      if (el.idcPageStateInitialised) {
        return;
      }
      el.idcPageStateInitialised = true;
      el.settings = getControlConfig(el);
      removeObsoleteStoredStates(el);
      el.pageStateDefaults = captureState(el, true);
      indiciaData.pageStateControls.push(el);
      $(el).find('.persist-page-state-reset').on('click', function resetClick() {
        indiciaFns.beginPageStateRestoreOperation();
        resetState(el);
        removeStoredState(getStorageKey(el));
        if (indiciaFns.applyFilterToReports) {
          indiciaFns.applyFilterToReports(true, false, false);
          indiciaFns.populateDataSources(true);
        }
        indiciaFns.endPageStateRestoreOperation();
        $(el).trigger('pageStateReset');
      });
      // If report filter builder on the page, move into the filter toolbar.
      if ($('#filter-reset').length) {
        $('#filter-reset').after($(el));
      }
    });
  };

  /**
   * Restore all registered page-state controls before initial population.
   *
   * Initialisation and restoration are separate because source and output
   * controls must exist before their state can be restored. The generated
   * page bootstrap calls this after datasource hookup and immediately before
   * the page's first population path.
   *
   * @return bool
   *   True if at least one control restored stored state.
   */
  indiciaFns.restorePageStateControls = function restorePageStateControls() {
    var restored = false;
    $.each(indiciaData.pageStateControls || [], function eachControl() {
      if (!this.idcPageStateRestoreAttempted) {
        this.idcPageStateRestoreAttempted = true;
        this.idcPageStateWasRestored = loadControlState(this);
      }
      restored = this.idcPageStateWasRestored || restored;
    });
    return restored;
  };

  /**
   * Bind persistence notifications after controls have been initialised.
   */
  indiciaFns.bindPageStateControls = function bindPageStateControls() {
    if (!indiciaData.pageStateChangeHandlerBound) {
      indiciaData.pageStateChangeHandlerBound = true;
      $(document).on('idcPageStateChanged.pageState', function pageStateChanged() {
        $.each(indiciaData.pageStateControls || [], function eachControl() {
          saveControlState(this);
        });
      });
    }
  };

  $(function pageStateFallback() {
    window.setTimeout(function initialiseWithoutGeneratedBootstrap() {
      if (indiciaData.documentReady !== 'done') {
        indiciaFns.initPageStateControls();
        indiciaFns.restorePageStateControls();
        indiciaFns.bindPageStateControls();
      }
    }, 0);
  });
}(jQuery));
