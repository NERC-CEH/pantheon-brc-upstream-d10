/**
 * @file
 * Coordinate persistence and restoration of Elasticsearch page-state controls.
 *
 * Indicia, the OPAL Online Recording Toolkit.
 *
 * Collect user overrides from filter, source and output providers,
 * store them in browser storage, and restore them before data population.
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

  var stateSchemaVersion = 5;
  var customFilterControlSelector = '.es-filter-param:not(.es-location-select-geom), ' +
    '.es-location-select, .es-higher-geography-select, .user-filter';
  // Controls can opt out of persistence without being excluded from reset.
  var excludedCustomFilterControlSelector = '.exclude-page-state';

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
   *
   * Linked selects can require several requests to restore their options.
   * Population must wait until all outstanding restoration work has completed.
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
   * Apply the same consent check as indiciaFns.cookie(), including to reads.
   */
  function pageStateStorageAllowed() {
    if (indiciaData.cookieCompliance === 'eu_cookie_compliance') {
      var agreed = $.cookie ? $.cookie('cookie-agreed') : null;
      return agreed !== null && agreed !== '0';
    }
    return true;
  }

  /**
   * Keep zero-expiry state session-only; other state survives browser restarts.
   */
  function getPageStateStorage(expires) {
    return Number(expires) === 0 ? window.sessionStorage : window.localStorage;
  }

  /**
   * Report blocked or full browser storage without breaking the verification UI.
   */
  function reportStorageError(error) {
    if (error.name !== 'SecurityError' && error.name !== 'QuotaExceededError' &&
        error.name !== 'NS_ERROR_DOM_QUOTA_REACHED') {
      throw error;
    }
    console.warn('Page state could not be persisted: browser storage is blocked or full.', error);
  }

  /**
   * Return a browser-storage key scoped to the page, control and current user.
   *
   * @param object el
   *   Page-state control element.
   * @return string
   *   Storage key prefix.
   */
  function getStorageKey(el) {
    var configuredKey = el.settings.storageKey;
    var pageKey = window.location.pathname || 'page';
    var storageKey = configuredKey ||
      'idc-page-state-' + pageKey.replace(/[^a-zA-Z0-9_-]/g, '_') + (el.id ? '-' + el.id : '');
    var userScope = typeof indiciaData.user_id !== 'undefined' && indiciaData.user_id !== null && indiciaData.user_id !== ''
      ? String(indiciaData.user_id)
      : 'anonymous';
    return storageKey + '-v' + stateSchemaVersion + '-u' + userScope.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * Remove old page-state cookies, including orphaned chunks and other accounts.
   *
   * Cookie paths are not exposed to JavaScript, so expire each visible name at
   * the current path and its ancestors, including old browser-default paths.
   * Deletion intentionally bypasses the consent wrapper: it creates no state.
   */
  function removeLegacyStateCookies(el) {
    var paths = ['/'];
    var pathname = window.location.pathname;
    var configuredKey = el.settings.storageKey;
    for (var idx = 1; idx <= pathname.length; idx++) {
      if (idx === pathname.length || pathname.charAt(idx) === '/') {
        paths.push(pathname.substring(0, idx));
        paths.push(pathname.substring(0, idx) + '/');
      }
    }
    $.each(document.cookie.split(';'), function eachCookie(idx, cookie) {
      var name = cookie.trim().split('=')[0];
      if (name.indexOf('idc-page-state-') !== 0 &&
          !(configuredKey && name.indexOf(configuredKey + '-v') === 0 && /-v\d+-u[\w-]+$/.test(name))) {
        return;
      }
      $.each(paths, function eachPath(idx, path) {
        $.cookie(name, null, { path: path });
      });
    });
  }

  /**
   * Remove saved state even when consent has since been withdrawn.
   */
  function removeStoredState(key, expires) {
    try {
      getPageStateStorage(expires).removeItem(key);
    }
    catch (error) {
      reportStorageError(error);
    }
  }

  /**
   * Store JSON state without adding it to HTTP request headers.
   *
   * Browser storage has no cookie-style expiry, so record an absolute timestamp
   * for persistent state. Zero-expiry state lives only in this tab's session.
   */
  function storeState(key, state, expires) {
    if (!pageStateStorageAllowed()) {
      return false;
    }
    expires = typeof expires === 'undefined' ? 30 : Number(expires);
    var serialised = JSON.stringify({
      version: stateSchemaVersion,
      expiresAt: expires === 0 ? null : Date.now() + expires * 24 * 60 * 60 * 1000,
      state: state
    });
    try {
      getPageStateStorage(expires).setItem(key, serialised);
      return true;
    }
    catch (error) {
      reportStorageError(error);
      // Do not restore an outdated filter after a failed save.
      removeStoredState(key, expires);
      return false;
    }
  }

  /**
   * Read and parse state stored by storeState().
   */
  function readStoredState(key, expires) {
    if (!pageStateStorageAllowed()) {
      return null;
    }
    var serialised;
    var stored;
    try {
      serialised = getPageStateStorage(expires).getItem(key);
    }
    catch (error) {
      reportStorageError(error);
      return null;
    }
    if (serialised === null) {
      return null;
    }
    try {
      stored = JSON.parse(serialised);
    }
    catch (error) {
      if (!(error instanceof SyntaxError)) {
        throw error;
      }
      console.warn('Invalid saved page state was removed.', error);
      removeStoredState(key, expires);
      return null;
    }
    if (!stored || stored.version !== stateSchemaVersion || !Array.isArray(stored.state) ||
        !stored.state.every(function validChange(change) {
          return change && Array.isArray(change.path) && change.path.length > 0 &&
            change.path.every(function validPathPart(part) {
              return typeof part === 'string' && part !== '__proto__' &&
                part !== 'constructor' && part !== 'prototype';
            });
        }) ||
        (Number(expires) === 0 ? stored.expiresAt !== null :
          typeof stored.expiresAt !== 'number' || !isFinite(stored.expiresAt))) {
      console.warn('Invalid or incompatible saved page state was removed.');
      removeStoredState(key, expires);
      return null;
    }
    if (stored.expiresAt !== null && stored.expiresAt <= Date.now()) {
      removeStoredState(key, expires);
      return null;
    }
    return stored.state;
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
   *
   * Prefer IDs, then disambiguate repeated names by position. Positional keys
   * use the full control list so excluding a control does not shift other keys.
   */
  function getCustomFilterControlKey(control) {
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
    return 'index:' + $(customFilterControlSelector).index(control);
  }

  /**
   * Return custom filter controls not explicitly excluded from persistence.
   *
   * Use the same selection for capture and restoration so excluded controls
   * cannot be overwritten by values saved before they were excluded.
   */
  function getPersistedCustomFilterControls() {
    return $(customFilterControlSelector).filter(function excludeFreeTextControls() {
      return !$(this).is(excludedCustomFilterControlSelector);
    });
  }

  /**
   * Capture values of custom Elasticsearch filter controls.
   *
   * For reset defaults, use the original HTML values rather than live values
   * that may already have changed during page initialisation. Include excluded
   * controls in these defaults: exclusion applies to persistence, not reset.
   */
  function getCustomFilterControlState(useDefaults) {
    var state = {};
    var controls = useDefaults ? $(customFilterControlSelector) : getPersistedCustomFilterControls();
    controls.each(function eachFilterControl() {
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
      state[getCustomFilterControlKey(this)] = controlState;
    });
    return state;
  }

  /**
   * Restore custom Elasticsearch filter controls without triggering reloads.
   *
   * Reset uses defaults for all controls, including those excluded from saved
   * state, and clears linked location selections instead of restoring them.
   */
  function restoreCustomFilterControlState(state, resetLocations) {
    var linkedChildIds = {};
    var linkedSelectOptions = {};
    if (!state || typeof state !== 'object') {
      return;
    }
    indiciaData.restoredEsLocationFilterValues = {};
    var controls = resetLocations ? $(customFilterControlSelector) : getPersistedCustomFilterControls();
    controls.each(function eachFilterControl() {
      var controlState = state[getCustomFilterControlKey(this)];
      var $control = $(this);
      var isLocationControl = $control.hasClass('es-location-select') ||
        $control.hasClass('es-higher-geography-select');
      if (!controlState || typeof controlState !== 'object') {
        return;
      }
      $control.val(resetLocations && isLocationControl ? '' : controlState.value);
      // Ensure selects with no selected option default to the first option.
      if (this.tagName === 'SELECT' && this.selectedIndex === -1 && this.options.length) {
        this.selectedIndex = 0;
      }
      if (isLocationControl && !resetLocations) {
        indiciaData.restoredEsLocationFilterValues[this.id] = controlState.value;
      }
      if (Object.prototype.hasOwnProperty.call(controlState, 'checked')) {
        $control.prop('checked', controlState.checked === true);
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
    // Restore linked select chains from their roots only. Loading each parent's
    // options then allows its saved child selection to be restored in order.
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
    // Preserve current values for categories this control does not restore.
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
   * Capture JSON values only, excluding reset-only controls and undefined fields.
   */
  function capturePersistedState(el) {
    return JSON.parse(JSON.stringify(captureState(el)));
  }

  /**
   * Record changed leaves only. Arrays are replaced as a unit; an absent value
   * means deletion, so clearing a default filter is distinct from leaving it.
   */
  function getStateChanges(state, defaults, path, changes) {
    if (state && defaults && typeof state === 'object' && typeof defaults === 'object' &&
        !Array.isArray(state) && !Array.isArray(defaults)) {
      $.each(Object.keys(defaults), function eachDefault(idx, key) {
        if (!Object.prototype.hasOwnProperty.call(state, key)) {
          changes.push({ path: path.concat(key) });
        }
      });
      $.each(Object.keys(state), function eachField(idx, key) {
        getStateChanges(state[key], defaults[key], path.concat(key), changes);
      });
    }
    else if (JSON.stringify(state) !== JSON.stringify(defaults)) {
      changes.push({ path: path, value: state });
    }
    return changes;
  }

  /**
   * Rebuild full provider state from this page's defaults and saved overrides.
   * Do not deep-merge arrays or sort objects: removed fields must stay removed.
   */
  function applyStateChanges(defaults, changes) {
    var state = JSON.parse(JSON.stringify(defaults));
    $.each(changes, function eachChange(idx, change) {
      var target = state;
      $.each(change.path.slice(0, -1), function eachParent(idx, key) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        target = target[key];
      });
      var key = change.path[change.path.length - 1];
      if (Object.prototype.hasOwnProperty.call(change, 'value')) {
        target[key] = change.value;
      }
      else {
        delete target[key];
      }
    });
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
        // The optional provider can load later; retain its state for that hook.
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
      // The provider resets all categories; put back those excluded here.
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
    if (!el.idcPageStateRestoreAttempted || indiciaData.pageStateRestoreOperationCount) {
      return;
    }
    var changes = getStateChanges(capturePersistedState(el), el.pageStatePersistenceDefaults, [], []);
    if (!changes.length) {
      removeStoredState(getStorageKey(el), el.settings.expires);
      setResetButtonSavedState(el, false);
      return;
    }
    setResetButtonSavedState(el, storeState(getStorageKey(el), changes, el.settings.expires));
  }

  /**
   * Show whether this control currently has saved page state.
   */
  function setResetButtonSavedState(el, isSaved) {
    var $resetButton = $(el).find('.persist-page-state-reset');
    if (isSaved) {
      $resetButton.addClass('active');
    }
    else {
      $resetButton.removeClass('active');
    }
  }

  /**
   * Restore state for a control, if valid, unexpired browser state exists.
   */
  function loadControlState(el) {
    var state = readStoredState(getStorageKey(el), el.settings.expires);
    if (!state || !state.length) {
      if (state) {
        removeStoredState(getStorageKey(el), el.settings.expires);
      }
      setResetButtonSavedState(el, false);
      return false;
    }
    restoreState(el, applyStateChanges(el.pageStatePersistenceDefaults, state));
    setResetButtonSavedState(el, true);
    return true;
  }

  /**
   * Initialise all page-state controls emitted on the page.
   *
   * Register each control once and capture its defaults before restoring saved
   * values, so "Reset all" returns to page defaults rather than the saved state.
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
      removeLegacyStateCookies(el);
      el.pageStateDefaults = captureState(el, true);
      indiciaData.pageStateControls.push(el);
      $(el).find('.persist-page-state-reset').on('click', function resetClick() {
        indiciaFns.beginPageStateRestoreOperation();
        resetState(el);
        removeStoredState(getStorageKey(el), el.settings.expires);
        setResetButtonSavedState(el, false);
        if (indiciaFns.applyFilterToReports) {
          indiciaFns.applyFilterToReports(true, false, false);
          indiciaFns.populateDataSources(true);
        }
        indiciaFns.endPageStateRestoreOperation();
        // Reset providers may normalize their defaults (e.g. location selects).
        el.pageStatePersistenceDefaults = capturePersistedState(el);
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
   * @param bool restoreSavedState
   *   Set false when editing an explicitly supplied filter: establish defaults
   *   for subsequent user changes without replacing that filter with saved state.
   *
   * @return bool
   *   True if at least one control restored stored state.
   */
  indiciaFns.restorePageStateControls = function restorePageStateControls(restoreSavedState) {
    var restored = false;
    $.each(indiciaData.pageStateControls || [], function eachControl() {
      if (!this.idcPageStateRestoreAttempted) {
        // Report-filter defaults are not final until its initial filter loads.
        this.pageStatePersistenceDefaults = capturePersistedState(this);
        indiciaFns.beginPageStateRestoreOperation();
        try {
          this.idcPageStateWasRestored = restoreSavedState !== false && loadControlState(this);
          this.idcPageStateRestoreAttempted = true;
        }
        finally {
          indiciaFns.endPageStateRestoreOperation();
        }
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
