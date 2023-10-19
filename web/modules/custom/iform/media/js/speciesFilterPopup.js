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

(function ($) {
  'use strict';

  function applySpeciesFilterMode(gridId, type, group_id, nameFilterMode) {
    var currentFilter;
    // Get the filter we are going to use. Use a) the provided parameter, when loading from a cookie,
    // b) the default name filter, when not in cookie and loading for first time, or c) the one selected on the form.
    if (typeof nameFilterMode === 'undefined') {
      nameFilterMode = $('#filter-name').length === 0 ? '$defaultFilterMode' : $('#filter-name').val();
    }
    currentFilter=$.extend({}, indiciaData.speciesChecklistFilterOpts.nameFilter[nameFilterMode]);
    // User preferred groups option should not be available if no groups set.
    if (type === 'user' && typeof indiciaData.usersPreferredTaxonGroups === 'undefined') {
      type = 'default';
    }
    //Extend the current query with any taxon group selections the user has made.
    switch (type) {
      case 'selected':
        currentFilter.taxon_group_id = group_id;
        break;
      case 'default':
        $('.scTaxonCell input').unsetExtraParams('taxon_group_id');
        break;
      case 'user':
        currentFilter.taxon_group_id = JSON.stringify(indiciaData.usersPreferredTaxonGroups);
        break;
    }
    if (type==='default') {
      $('#' + gridId + ' .species-filter').removeClass('button-active');
    } else {
      $('#' + gridId + ' .species-filter').addClass('button-active');
    }
    // clear out previous filter
    $('.scTaxonCell input').unsetExtraParams("language");
    $('.scTaxonCell input').unsetExtraParams("preferred");
    $('.scTaxonCell input').unsetExtraParams("synonyms");
    // Tell the system to use the current filter.
    indiciaData['taxonExtraParams-' + gridId] = currentFilter;
    $('.scTaxonCell input').setExtraParams(currentFilter);
    // store in cookie
    indiciaFns.cookie('user_selected_taxon_filter', JSON.stringify({
      type: type,
      group_id: group_id,
      name_filter: nameFilterMode
    }));
  }

  function applyButtonClicked(gridId) {
    if ($('#filter-mode-default:checked').length>0) {
      applySpeciesFilterMode(gridId, 'default');
    } else if ($('#filter-mode-selected:checked').length>0) {
      applySpeciesFilterMode(gridId, 'selected', $('#filter-group').val());
    } else if ($('#filter-mode-user').is(':checked')) {
      applySpeciesFilterMode(gridId, 'user');
    }
    $.fancybox.close();
  }

  function buildPopupFormHtml(userFilter) {
    var t = indiciaData.lang.speciesChecklistFilter;
    var defaultChecked = '';
    var userChecked = '';
    var selectedChecked = '';
    var popupFormHtml;
    //Select the radio button on the form depending on what is set in the cookie
    if (userFilter) {
      if (userFilter.type==='user') {
        userChecked = ' checked="checked"';
      } else if (userFilter.type==='selected') {
        selectedChecked = ' checked="checked"';
      } else {
        defaultChecked = ' checked="checked"';
      }
    } else {
      defaultChecked = ' checked="checked"';
    }
    popupFormHtml = '<div id="filter-form"><fieldset class="popup-form">' +
        '<legend>' + t.configureFilter + ':</legend>' +
        '<label class="auto"><input type="radio" name="filter-mode" id="filter-mode-default"' + defaultChecked + '/>' +
          indiciaData.speciesChecklistFilterOpts.defaultOptionLabel + '</label>';
    if (typeof indiciaData.usersPreferredTaxonGroups !== "undefined") {
      popupFormHtml += '<label class="auto"><input type="radio" name="filter-mode" id="filter-mode-user"' + userChecked+ '/>' +
          t.preferredGroupsOptionLabel+ '</label>';
    }
    popupFormHtml += '<label class="auto"><input type="radio" name="filter-mode" id="filter-mode-selected"'+selectedChecked+'/>' +
        t.singleGroupOptionLabel + '</label>' +
        '<select name="filter-group" id="filter-group"></select>' +
        '<label class="auto" for="filter-name">' + t.chooseSpeciesLabel + '</label>' +
        '<select name="filter-name" id="filter-name">' +
        '<option id="filter-all" value="all">' + t.namesOptionAllNamesLabel + '</option>' +
        '<option id="filter-common" value="currentLanguage">' + t.namesOptionCommonNamesLabel + '</option>' +
        '<option id="filter-common-preferred" value="excludeSynonyms">' + t.namesOptionCommonPrefLatinNamesLabel + '</option>' +
        '<option id="filter-preferred" value="preferred">' + t.namesOptionPrefLatinNamesLabel + '</option>' +
        '</select>' +
        '</fieldset><button type="button" class="default-button" id="filter-popup-apply">' + t.apply + '</button>' +
        '<button type="button" class="default-button" id="filter-popup-cancel">' + t.cancel + '</button></div>';
    return popupFormHtml;
  }

  function speciesFilterButtonClicked() {
    var gridId = $(this).closest('table').attr('id');
    var userFilter = $.cookie('user_selected_taxon_filter');
    var popupFormHtml;
    // decode the settings cookie
    if (userFilter) {
      userFilter = JSON.parse(userFilter);
    }
    popupFormHtml = buildPopupFormHtml(userFilter);
    $.fancybox.open(popupFormHtml);
    // Fill in the list of available taxon groups to choose from.
    $.getJSON(indiciaData.warehouseUrl +
        'index.php/services/report/requestReport?report=library/taxon_groups/taxon_groups_used_in_checklist.xml&reportSource=local&mode=json' +
        '&taxon_list_id=' + indiciaData.speciesChecklistFilterOpts.taxon_list_id +
        '&auth_token=' + indiciaData.read.auth_token + '&nonce=' + indiciaData.read.nonce + '&callback=?', function(data) {
      $.each(data, function(idx, item) {
        var selected = userFilter!==null && (item.id===userFilter.group_id) ? ' selected="selected"' : '';
        $('#filter-group').append('<option value="'+item.id+'"' + selected + '>'+item.title+'</option>');
      });
    });
    // By defult assume that the filter mode is the default one
    var filterMode = indiciaData.speciesChecklistFilterOpts.defaultFilterMode;
    // If the cookie is present and it holds one of the name type filters it  means the last time the user used the
    // screen they selected to filter for a particular name type, so auto-select those previous settings when the user
    // opens the popup (overriding the defaultFilterMode)
    if(userFilter) {
      if (typeof indiciaData.speciesChecklistFilterOpts.nameFilter[userFilter.name_filter] !== "undefined") {
        filterMode = userFilter.name_filter;
        $('#filter-mode-name').attr('selected','selected');
      }
    }
    if (filterMode === 'all')
      $('#filter-all').attr('selected','selected');
    if (filterMode === 'currentLanguage')
      $('#filter-common').attr('selected','selected');
    if (filterMode === 'preferred')
      $('#filter-preferred').attr('selected','selected');
    if (filterMode === 'excludeSynonyms')
      $('#filter-common-preferred').attr('selected','selected');
    $('#filter-group').focus(function() {
      $('#filter-mode-selected').attr('checked','checked');
    });
    // Button handlers
    $('#filter-popup-apply').click(function() { applyButtonClicked(gridId); });
    $('#filter-popup-cancel').click(function() {
      $.fancybox.close();
    });
  }

  /* Public functions */

  /**
   *
   * @param string gridId
   */
  indiciaFns.applyInitialSpeciesFilterMode = function(gridId) {
    // load the filter mode from a cookie
    var userFilter=$.cookie('user_selected_taxon_filter');
    if (userFilter) {
      userFilter = JSON.parse(userFilter);
      applySpeciesFilterMode(gridId, userFilter.type, userFilter.group_id, userFilter.name_filter);
    }
  };

  /**
   * Sets up the click handled on the filter button in the column title of the species column of the species checklist
   * input grid.
   * @param string gridId Element ID of the grid
   */
  indiciaFns.setupSpeciesFilterPopup = function(gridId) {
    $('#' + gridId + ' .species-filter').click(speciesFilterButtonClicked);
  };

}(jQuery));