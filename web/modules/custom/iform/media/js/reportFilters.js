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
 *
 * @package Client
 * @author  Indicia Team
 * @license http://www.gnu.org/licenses/gpl.html GPL 3.0
 * @link    http://code.google.com/p/indicia/
 */

var loadFilter;
var loadFilterUser;
var refreshFilters;

jQuery(document).ready(function ($) {
  'use strict';
  var saving = false;
  var loadingSites = false;
  var filterOverride = {};

  // override append and remove so we can track addition of sublist locations and draw them on the map
  var origAppend = $.fn.append;
  var origRemove = $.fn.remove;
  $.fn.append = function () {
    return origAppend.apply(this, arguments).trigger('append');
  };
  $.fn.remove = function () {
    return origRemove.apply(this, arguments).trigger('remove');
  };

  indiciaData.filter = { def: {}, id: null, title: null };

  function removeSite() {
    var idToRemove = $(this).find('input[name="location_list[]"]').val();
    var toRemove = [];
    var layer = indiciaData.mapdiv.map.editLayer;
    $.each(layer.features, function () {
      if (this.attributes.id == idToRemove) {
        toRemove.push(this);
      }
    });
    layer.removeFeatures(toRemove, {});
  }

  $('#location_list\\:sublist').bind('append', function () {
    if (!loadingSites) {
      loadSites($(this).find('li input[name="location_list[]"]').last().val(), false);
      // remove all non-site boundaries, i.e. grid squares
      indiciaData.mapdiv.removeAllFeatures(indiciaData.mapdiv.map.editLayer, 'boundary', true);
    }
    $('#location_list\\:sublist li:last-child').bind('remove', removeSite);
  });

  /**
   * If an of the supplied fields are defined in the supplied context filter, then disables
   * the list of controls given, otherwise re-enables them.
   * @param context
   * @param fields
   * @param ctrlIds
   */
  function disableIfPresent(context, fields, ctrlIds) {
    var disable = false;
    $.each(fields, function (idx, field) {
      if (context && context[field]) {
        disable = true;
      }
    });
    $.each(ctrlIds, function (idx, ctrlId) {
      if (disable) {
        $(ctrlId).prop('disabled', true);
      } else {
        $(ctrlId).prop('disabled', false);
      }
    });
  }

  function disableSourceControlsForContext(type, context, childTypes) {
    var allRelevantCheckboxes;
    var allCheckboxesMatchingIds = [];
    var typeIds;
    if (context && context[type + '_list_op'] && context[type + '_list']) {
      typeIds = context[type + '_list'].split(',');
      $('#filter-' + type + 's-mode').prop('disabled', true);
      // Get all the checkboxes relevant to this level (e.g. for surveys, it includes surveys and input forms.
      allRelevantCheckboxes = $('#' + type + '-list-checklist input');
      $.each(childTypes, function () {
        allRelevantCheckboxes = $.merge(allRelevantCheckboxes, $('#' + this + '-list-checklist input'));
      });
      // Now get just the checkboxes that are linked to the ID of the items in the context. E.g. for a website, the
      // website checkbox, plus linked survey and form checkboxes.
      $.each(typeIds, function () {
        allCheckboxesMatchingIds = $.merge(allCheckboxesMatchingIds,
          $('#check-website-' + type + '-' + this + ',.vis-' + type + '-' + this + ' input'));
      });
      if (context[type + '_list_op'] === 'not in') {
        $(allRelevantCheckboxes).prop('disabled', false);
        $(allCheckboxesMatchingIds).prop('disabled', true);
      } else {
        $(allRelevantCheckboxes).prop('disabled', true);
        $(allCheckboxesMatchingIds).prop('disabled', false);
      }
      // Force uncheck the websites you can't access
      $('#' + type + '-list-checklist input:disabled').attr('checked', false);
    } else {
      $('#filter-' + type + 's-mode').prop('disabled', false);
    }
  }

  /**
   * Returns true if a site or grid reference are currently selected on the filter
   * @returns boolean
   */
  function siteOrGridRefSelected() {
    return $('input[name="location_list[]"]').length > 0 || ($('#imp-sref').val() !== '' && $('#imp-sref').val() !== null);
  }

  // filterParser functions that are required globally.
  indiciaData.filterParser = {
    what: {
      loadFilter: function (filterDef) {
        // Cleanup if still refers to defunct higher_taxa_taxon_list_list.
        if (typeof filterDef.higher_taxa_taxon_list_list !== 'undefined' && filterDef.higher_taxa_taxon_list_list !== '') {
          filterDef.taxa_taxon_list_list = filterDef.higher_taxa_taxon_list_list;
          if (typeof filterDef.higher_taxa_taxon_list_names !== 'undefined' && filterDef.higher_taxa_taxon_list_names !== '') {
            filterDef.taxa_taxon_list_names = filterDef.higher_taxa_taxon_list_names;
          }
        }
        delete filterDef.higher_taxa_taxon_list_list;
        delete filterDef.higher_taxa_taxon_list_names;
        // if list of ids defined but not group names, this is a taxon group list loaded from the user profile.
        // Hijack the names from indiciaData.myGroups.
        if (typeof filterDef.taxon_group_list !== 'undefined' && typeof filterDef.taxon_group_names === 'undefined') {
          filterDef.taxon_group_names = [];
          var foundIds = [], foundNames = [];
          // Loop the group IDs we are expected to load
          $.each(filterDef.taxon_group_list, function (idx, groupId) {
            // Use the myGroups list to look them up
            $.each(indiciaData.myGroups, function () {
              if (this[0] === parseInt(groupId)) {
                foundIds.push(this['id']);
                foundNames.push(this['title']);
              }
            });
          });
          filterDef.taxon_group_names = foundNames;
          filterDef.taxon_group_list = foundIds;
        }
      },
      getDescription: function (filterDef, sep) {
        var groups = [];
        var taxa = [];
        var designations = [];
        var r = [];
        if (filterDef.taxon_group_list && filterDef.taxon_group_names) {
          $.each(filterDef.taxon_group_names, function (idx, group) {
            groups.push(group);
          });
        }
        if (filterDef.taxa_taxon_list_list && filterDef.taxa_taxon_list_names) {
          $.each(filterDef.taxa_taxon_list_names, function (idx, taxon) {
            taxa.push(taxon);
          });
        }
        if (filterDef.taxon_designation_list && filterDef.taxon_designation_list_names) {
          $.each(filterDef.taxon_designation_list_names, function (idx, designation) {
            designations.push(designation);
          });
        }
        if (groups.length > 0) {
          r.push(groups.join(', '));
        }
        if (taxa.length > 0) {
          r.push(taxa.join(', '));
        }
        if (designations.length > 0) {
          r.push(designations.join(', '));
        }
        if (filterDef.taxon_rank_sort_order_combined) {
          r.push($('#level-label').text() + ' ' + $('#taxon_rank_sort_order_op').find('option:selected').text() + ' ' +
            $('#taxon_rank_sort_order_combined').find('option:selected').text());
        }
        if (filterDef.marine_flag && filterDef.marine_flag !== 'all') {
          r.push($('#marine_flag').find('option[value=' + filterDef.marine_flag + ']').text());
        }
        if (filterDef.freshwater_flag && filterDef.freshwater_flag !== 'all') {
          r.push($('#freshwater_flag').find('option[value=' + filterDef.freshwater_flag + ']').text());
        }
        if (filterDef.terrestrial_flag && filterDef.terrestrial_flag !== 'all') {
          r.push($('#terrestrial_flag').find('option[value=' + filterDef.terrestrial_flag + ']').text());
        }
        if (filterDef.non_native_flag && filterDef.non_native_flag !== 'all') {
          r.push($('#non_native_flag').find('option[value=' + filterDef.non_native_flag + ']').text());
        }
        if (typeof filterDef.confidential !== 'undefined') {
          switch (filterDef.confidential) {
            case 't':
              r.push(indiciaData.lang.reportFilterParser.OnlyConfidentialRecords);
              break;
            case 'all':
              r.push(indiciaData.lang.reportFilterParser.AllConfidentialRecords);
              break;
            default:
              r.push(indiciaData.lang.reportFilterParser.NoConfidentialRecords);
          }
        }
        if (typeof filterDef.release_status !== 'undefined') {
          switch (filterDef.release_status) {
            case 'A':
              r.push(indiciaData.lang.reportFilterParser.includeUnreleasedRecords);
              break;
            default:
              r.push(indiciaData.lang.reportFilterParser.excludeUnreleasedRecords);
          }
        }
        if (typeof filterDef.taxa_taxon_list_attribute_term_descriptions !== 'undefined') {
          $.each(filterDef.taxa_taxon_list_attribute_term_descriptions, function getAttrDescription(label, terms) {
            r.push(label + ' ' + Object.values(terms).join(', '));
          });
        }
        return r.join(sep);
      }
    },
    when: {
      getDescription: function (filterDef, sep) {
        var r = [];
        var dateType = typeof filterDef.date_type === 'undefined' ? 'recorded' : filterDef.date_type;
        var dateFromField = 'date_from';
        var dateToField = 'date_to';
        var dateAgeField = 'date_age';
        if (filterDef.date_year_op && filterDef.date_year) {
          if (filterDef.date_year_op === '=') {
            dateFromField = 'date_year';
            dateToField = 'date_year';
          } else if (filterDef.date_year_op === '<=') {
            // Disable the date from field.
            dateFromField = 'not_used';
            dateToField = 'date_year';
          } else if (filterDef.date_year_op === '>=') {
            dateFromField = 'date_year';
            // Disable the date to field.
            dateToField = 'not_used';
          }
        }
        if (dateType !== 'recorded') {
          dateFromField = dateType + '_' + dateFromField;
          dateToField = dateType + '_' + dateToField;
          dateAgeField = dateType + '_' + dateAgeField;
        }
        if (filterDef[dateFromField] && filterDef[dateToField] && filterDef[dateFromField] === filterDef[dateToField]) {
          // Correct grammar.
          const inOrOn = filterDef.date_year_op && filterDef.date_year ? 'in' : 'on';
          r.push('Records ' + dateType + ' ' + inOrOn + ' ' + filterDef[dateFromField]);
        } else if (filterDef[dateFromField] && filterDef[dateToField]) {
          r.push('Records ' + dateType + ' between ' + filterDef[dateFromField] + ' and ' +
            filterDef[dateToField]);
        } else if (filterDef[dateFromField]) {
          r.push('Records ' + dateType + ' on or after ' + filterDef[dateFromField]);
        } else if (filterDef[dateToField]) {
          r.push('Records ' + dateType + ' on or before ' + filterDef[dateToField]);
        }
        if (filterDef[dateAgeField]) {
          r.push('Records ' + dateType + ' in last ' + filterDef[dateAgeField]);
        }
        return r.join(sep);
      },
    },
    where: {
      loadFilter: function () {
        var filter;
        var locationsToLoad;
        if (typeof indiciaData.mapdiv !== 'undefined') {
          filter = indiciaData.filter.def;
          if (filter.searchArea) {
            loadPolygon(filter.searchArea);
          } else if (filter.location_id || filter.location_list || filter.indexed_location_id || filter.indexed_location_list) {
            // need to load filter location boundaries onto map. Location_id variants are for legacy
            if (filter.location_id && !filter.location_list) {
              filter.location_list = filter.location_id;
            }
            if (filter.indexed_location_id && !filter.indexed_location_list) {
              filter.indexed_location_list = filter.indexed_location_id;
            }
            locationsToLoad = filter.indexed_location_list ? filter.indexed_location_list : filter.location_list;
            loadSites(locationsToLoad);
          }
        }
      },
      getDescription: function (filterDef) {
        if (filterDef.remembered_location_name) {
          return 'Records in ' + filterDef.remembered_location_name;
        } else if (filterDef['imp-location:name']) { // legacy
          return 'Records in ' + filterDef['imp-location:name'];
        } else if (filterDef.indexed_location_id) {
          // legacy location ID for the user's locality. In this case we need to hijack the site type drop down shortcuts to get the locality name
          return $('#site-type option[value=loc\\:' + filterDef.indexed_location_id + ']').text();
        } else if (filterDef.location_name) {
          return 'Records in places containing "' + filterDef.location_name + '"';
        } else if (filterDef.sref) {
          return 'Records in square ' + filterDef.sref;
        } else if (filterDef.searchArea) {
          return 'Records within a freehand boundary';
        } else {
          return '';
        }
      },
    },
    who: {
      getDescription: function (filterDef) {
        let phrases = [];
        if (filterDef.my_records && filterDef.my_records === '1') {
          phrases.push(indiciaData.lang.reportFilterParser.MyRecords);
        } else if (filterDef.my_records && filterDef.my_records === '0') {
          phrases.push(indiciaData.lang.reportFilterParser.NotMyRecords);
        }
        if (filterDef.recorder_name) {
          let nameList = filterDef.recorder_name.replace(/\s+/g, indiciaData.lang.reportFilterParser.ListJoin);
          phrases.push(indiciaData.lang.reportFilterParser.RecorderNameContains.replace('{1}', nameList));
        }
        return phrases.join('<br/>');
      },
    },
    occ_id: {
      getDescription: function (filterDef) {
        var op;
        if (filterDef.occ_id) {
          op = typeof filterDef.occ_id_op === 'undefined' ?
            '=' : filterDef.occ_id_op.replace(/[<=>]/g, '\\$&');
          return $('#occ_id_op').find("option[value='" + op + "']").html()
            + ' ' + filterDef.occ_id;
        }
        else if (filterDef.occurrence_external_key) {
          return $('#ctrl-wrap-occurrence_external_key label').html().replace(/:$/, '')
            + ' ' + filterDef.occurrence_external_key;
        }
        return '';
      },
    },
    smp_id: {
      getDescription: function (filterDef) {
        var op;
        if (filterDef.smp_id) {
          op = typeof filterDef.smp_id === 'undefined' ? '=' : filterDef.smp_id.replace(/[<=>]/g, "\\$&");
          return $('#smp_id_op option[value=' + op + ']').html()
            + ' ' + filterDef.smp_id;
        }
        return '';
      },
    },
    quality: {
      statusDescriptionFromFilter: function (quality, quality_op) {
        if (typeof quality === 'undefined') {
          quality = 'all';
        } else {
          quality = typeof quality === 'string' ? quality : quality.toString();
        }
        if (quality === '') {
          // No filter applied.
          return '';
        }
        if (typeof quality_op === 'undefined') {
          quality_op = 'in';
        }
        let statuses = typeof quality === 'object' ? quality : quality.split(',');
        let statusTerms = [];
        $.each(statuses, function () {
          if (this !== 'all' && statuses.indexOf('all') > -1) {
            // If all checked, only interested in the all option.
            return true;
          }
          if (this.match(/^[RV][1245]$/) && statuses.indexOf(this.substring(0, 1)) > -1) {
            // If V or R checked, can skip the 2nd levels.
            return true;
          }
          statusTerms.push(indiciaData.lang.reportFilters['quality:' + this]);
        });
        // Update all copies of the inputs with the text and the hidden filter value.
        return indiciaData.lang.reportFilters['quality_op:' + quality_op] + ' ' + statusTerms.join(', ');
      },
      fixLegacyFilter: function(filterDef) {
        // Handle some legacy filter options. Note that Trusted is not supported on ES currently.
        if (filterDef.quality === '!R') {
          filterDef.quality = 'R';
          filterDef.quality_op = 'not in';
        } else if (filterDef.quality === '!D') {
          filterDef.quality = 'D';
          filterDef.quality_op = 'not in';
        } else if (filterDef.quality === '-3') {
          filterDef.quality = 'C3,V';
          filterDef.quality_op = 'in';
        } else if (filterDef.quality === 'C') {
          filterDef.quality = 'R';
          filterDef.quality_op = 'not in';
          filterDef.certainty = 'C';
        } else if (filterDef.quality === 'L') {
          filterDef.quality = 'R';
          filterDef.quality_op = 'not in';
          filterDef.certainty = 'L';
        } else if (filterDef.quality === 'DR') {
          filterDef.quality = 'D,R';
          filterDef.quality_op = 'in';
        }
        // Autochecks and autocheck_rule now merged into 1.
        if (filterDef.autocheck_rule) {
          filterDef.autochecks = filterDef.autocheck_rule;
          delete filterDef.autocheck_rule;
        }
      },
      getDescription: function (filterDef, sep) {
        var r = [];
        var op;
        if (typeof filterDef.quality !== 'undefined' && filterDef.quality !== 'all') {
          r.push(indiciaData.filterParser.quality.statusDescriptionFromFilter(filterDef.quality, filterDef.quality_op));
        }
        let certainties = [];
        $.each($('#certainty-filter :checked'), function() {
          certainties.push($('label[for="' + this.id + '"]').text().toLowerCase());
        });
        if (certainties.length > 0) {
          r.push(indiciaData.lang.reportFilters.recorderCertaintyWas + ' ' + certainties.join(indiciaData.lang.reportFilters.orListJoin));
        }
        if (filterDef.autochecks) {
          r.push(indiciaData.lang.reportFilterParser['Autochecks_' + filterDef.autochecks]);
        }
        if (filterDef.identification_difficulty) {
          op = typeof filterDef.identification_difficulty_op === 'undefined' ?
            '=' : filterDef.identification_difficulty_op.replace(/[<=>]/g, '\\$&');
          r.push(indiciaData.lang.reportFilterParser.IdentificationDifficulty + ' ' +
            $('#identification_difficulty_op').find("option[value='" + op + "']").html() +
            ' ' + filterDef.identification_difficulty);
        }
        if (filterDef.has_photos && filterDef.has_photos === '1') {
          r.push(indiciaData.lang.reportFilterParser.HasPhotos);
        } else if (filterDef.has_photos && filterDef.has_photos === '0') {
          r.push(indiciaData.lang.reportFilterParser.HasNoPhotos);
        }
        if ($('#licences :checked').length > 0 && $('#licences :checked').length < 3) {
          let licences = [];
          $.each($('#licences :checked'), function() {
            licences.push($('label[for="' + this.id + '"]').text().toLowerCase());
          });
          r.push(indiciaData.lang.reportFilters.licenceIs + ' ' + licences.join(indiciaData.lang.reportFilters.orListJoin));
        }
        if ($('#media_licences :checked').length > 0 && $('#media_licences :checked').length < 3) {
          let licences = [];
          $.each($('#media_licences :checked'), function() {
            licences.push($('label[for="' + this.id + '"]').text().toLowerCase());
          });
          r.push(indiciaData.lang.reportFilters.mediaLicenceIs + ' ' + licences.join(indiciaData.lang.reportFilters.orListJoin));
        }
        if (filterDef.coordinate_precision) {
          const op = {
            '<=': indiciaData.lang.reportFilters.sameAsOrBetterThan,
            '>': indiciaData.lang.reportFilters.worseThan,
            '=': indiciaData.lang.reportFilters.equalTo,
          }[filterDef.coordinate_precision_op ? filterDef.coordinate_precision_op : '<='];
          r.push(indiciaData.lang.reportFilters.coordinatePrecisionIs + ' ' + op + ' ' + (filterDef.coordinate_precision / 1000) + 'km');
        }
        // @todo Block saving a filter with zero licence boxes ticked
        return r.join(sep);
      },
    },
    source: {
      getDescription: function (filterDef, sep) {
        var r = [];
        var list = [];
        var paramValue;
        if (filterDef.input_form_list) {
          $.each(filterDef.input_form_list.split(','), function (idx, id) {
            list.push(formPathToLabel(this));
          });
          r.push((filterDef.input_form_list_op === 'not in' ? 'Exclude ' : '') + list.join(', '));
        } else if (filterDef.survey_list) {
          paramValue = typeof filterDef.survey_list === 'string'
            ? filterDef.survey_list.split(',') : [filterDef.survey_list];
          $.each(paramValue, function (idx, id) {
            list.push(indiciaData.allSurveysList[id]);
          });
          r.push((filterDef.survey_list_op === 'not in' ? 'Exclude ' : '') + list.join(', '));
        } else if (filterDef.website_list) {
          paramValue = typeof filterDef.website_list === 'string'
            ? filterDef.website_list.split(',') : [filterDef.survey_list ];
          $.each(filterDef.website_list.toString().split(','), function (idx, id) {
            list.push($('#check-website-' + id).next('label').html());
          });
          r.push((filterDef.website_list_op === 'not in' ? 'Exclude ' : '') + list.join(', '));
        }
        return r.join(sep);
      },
    }
  }

  // functions that drive each of the filter panes, e.g. to obtain the description from the controls.
  var paneObjList = {
    what: {
      applyFormToDefinition: function () {
        var ttlAttrTermIds = [];
        var ttlAttrTermDescriptions = {};
        var i = 0;
        // Don't send unnecessary stuff like input values from sub_list controls.
        delete indiciaData.filter.def['taxon_group_list:search'];
        delete indiciaData.filter.def['taxon_group_list:search:q'];
        delete indiciaData.filter.def['taxa_taxon_list_list:search'];
        delete indiciaData.filter.def['taxa_taxon_list_list:search:searchterm'];
        delete indiciaData.filter.def['taxon_designation_list:search'];
        delete indiciaData.filter.def['taxon_designation_list:search:title'];
        while (typeof indiciaData.filter.def['taxa_taxon_list_attribute_termlist_term_ids:' + i + ':search'] !== 'undefined') {
          delete indiciaData.filter.def['taxa_taxon_list_attribute_termlist_term_ids:' + i + ':search'];
          delete indiciaData.filter.def['taxa_taxon_list_attribute_termlist_term_ids:' + i + ':search:term'];
        }

        // reset the list of group names and species
        indiciaData.filter.def.taxon_group_names = {};
        indiciaData.filter.def.taxa_taxon_list_names = {};
        indiciaData.filter.def.taxon_designation_list_names = {};
        // if nothing selected, clean up the def
        if ($('input[name="taxon_group_list\\[\\]"]').length === 0) {
          indiciaData.filter.def.taxon_group_list = '';
        } else {
          // store the list of names in the def, though not used for the report they save web service hits later
          $.each($('input[name="taxon_group_list\\[\\]"]'), function (idx, ctrl) {
            indiciaData.filter.def.taxon_group_names[$(ctrl).val()] = $.trim($(ctrl).parent().text());
          });
        }
        if ($('input[name="taxa_taxon_list_list\\[\\]"]').length === 0) {
          indiciaData.filter.def.taxa_taxon_list_list = '';
        } else {
          // store the list of names in the def, though not used for the report they save web service hits later
          $.each($('input[name="taxa_taxon_list_list\\[\\]"]'), function (idx, ctrl) {
            indiciaData.filter.def.taxa_taxon_list_names[$(ctrl).val()] = $.trim($(ctrl).parent().text());
          });
        }
        if ($('input[name="taxon_designation_list\\[\\]"]').length === 0) {
          indiciaData.filter.def.taxon_designation_list = '';
        } else {
          // store the list of names in the def, though not used for the report they save web service hits later
          $.each($('input[name="taxon_designation_list\\[\\]"]'), function (idx, ctrl) {
            indiciaData.filter.def.taxon_designation_list_names[$(ctrl).val()] = $.trim($(ctrl).parent().text());
          });
        }
        // because the rank sort order key includes both the sort order and rank ID, clean this up for the actual filter
        if (typeof indiciaData.filter.def.taxon_rank_sort_order_combined !== 'undefined') {
          indiciaData.filter.def.taxon_rank_sort_order = indiciaData.filter.def.taxon_rank_sort_order_combined.split(':')[0];
        }
        if (typeof indiciaData.taxaTaxonListAttributeIds !== "undefined") {
          $.each($('ul[id^="taxa_taxon_list_attribute_termlist_term_ids\\:"]'), function () {
            var groupIdx = this.id.replace(/^taxa_taxon_list_attribute_termlist_term_ids:/, '').replace(/:sublist$/, '');
            var groupTerms = {};
            $.each($(this).find('li'), function() {
              ttlAttrTermIds.push($(this).find('input[name$="\\[\\]"]').val());
              groupTerms[$(this).find('input[name$="\\[\\]"]').val()] = $(this).text().trim();
            });
            if ($(this).find('li').length > 0) {
              ttlAttrTermDescriptions[indiciaData.taxaTaxonListAttributeLabels[groupIdx]] = groupTerms;
            }
          });
          indiciaData.filter.def.taxa_taxon_list_attribute_ids = indiciaData.taxaTaxonListAttributeIds.join(',');
          indiciaData.filter.def.taxa_taxon_list_attribute_termlist_term_ids = ttlAttrTermIds.join(',');
          indiciaData.filter.def.taxa_taxon_list_attribute_term_descriptions = ttlAttrTermDescriptions;
        }
      },
      loadForm: function (context) {
        var firstTab = 'species-group-tab';
        var disabled = [];
        // Got a taxonomic context. So may as well disable the less specific
        // tabs as they won't be useful.
        if (context && context.taxa_taxon_list_list) {
          firstTab = 'designations-tab';
          disabled = [0, 1];
          $('#species-tab').find('.context-instruct').show();
        }
        if (context && context.taxon_designation_list) {
          disabled.push(2);
        }
        if (context && context.marine_flag && context.marine_flag !== 'all') {
          $('#marine_flag').find('option[value=' + context.marine_flag + ']').attr('selected', 'selected');
          $('#marine_flag').prop('disabled', true);
          $('#flags-tab .context-instruct').show();
        } else {
          $('#marine_flag').prop('disabled', false);
          $('#flags-tab .context-instruct').hide();
        }
        if (context && context.confidential && context.confidential !== 'all') {
          $('#confidential').prop('disabled', true);
          $('#confidential').find('option[value=' + context.confidential + ']').attr('selected', 'selected');
          $('#flags-tab .context-instruct').show();
        }
        if (context && context.release_status && context.release_status !== 'A') {
          $('#release_status').prop('disabled', true);
          $('#release_status').find('option[value=' + context.release_status + ']').attr('selected', 'selected');
          $('#flags-tab .context-instruct').show();
        }
        $('#what-tabs').tabs('option', 'disabled', disabled);
        indiciaFns.activeTab($('#what-tabs'), firstTab);
        if (context && context.taxon_group_list) {
          $('input#taxon_group_list\\:search\\:q').setExtraParams({
            idlist: context.taxon_group_list
          });
          $('#species-group-tab .context-instruct').show();
        }
        else if ($('input#taxon_group_list\\:search\\:q').length > 0) {
          $('input#taxon_group_list\\:search\\:q').unsetExtraParams('query');
        }
        // need to load the sub list control for taxon groups.
        $('#taxon_group_list\\:sublist').children().remove();
        if (typeof indiciaData.filter.def.taxon_group_names !== 'undefined') {
          $.each(indiciaData.filter.def.taxon_group_names, function (id, name) {
            $('#taxon_group_list\\:sublist').append('<li class="ui-widget-content ui-corner-all"><span class="ind-delete-icon"> </span>' + name +
              '<input type="hidden" value="' + id + '" name="taxon_group_list[]"/></li>');
          });
        }
        $('#taxa_taxon_list_list\\:sublist').children().remove();
        if (typeof indiciaData.filter.def.taxa_taxon_list_names !== 'undefined') {
          $.each(indiciaData.filter.def.taxa_taxon_list_names, function (id, name) {
            $('#taxa_taxon_list_list\\:sublist').append('<li class="ui-widget-content ui-corner-all"><span class="ind-delete-icon"> </span>' + name +
              '<input type="hidden" value="' + id + '" name="taxa_taxon_list_list[]"/></li>');
          });
        }
        $('#taxon_designation_list\\:sublist').children().remove();
        if (typeof indiciaData.filter.def.taxon_designation_list_names !== 'undefined') {
          $.each(indiciaData.filter.def.taxon_designation_list_names, function (id, name) {
            $('#taxon_designation_list\\:sublist').append('<li class="ui-widget-content ui-corner-all"><span class="ind-delete-icon"> </span>' + name +
              '<input type="hidden" value="' + id + '" name="taxon_designation_list[]"/></li>');
          });
        }
        // need to load the sub list control for each linked taxa_taxon_list_attribute.
        if (typeof indiciaData.filter.def.taxa_taxon_list_attribute_term_descriptions !== 'undefined' &&
            typeof indiciaData.taxaTaxonListAttributeLabels !== 'undefined') {
          $.each(indiciaData.taxaTaxonListAttributeLabels, function (idx, label) {
            var sublist = $('#taxa_taxon_list_attribute_termlist_term_ids\\:' + idx + '\\:sublist');
            sublist.children().remove();
            if (typeof indiciaData.filter.def.taxa_taxon_list_attribute_term_descriptions[label] !== 'undefined') {
              $.each(indiciaData.filter.def.taxa_taxon_list_attribute_term_descriptions[label], function (termlistTermId, term) {
                sublist.append('<li class="ui-widget-content ui-corner-all"><span class="ind-delete-icon"> </span>' + term +
                  '<input type="hidden" value="' + termlistTermId + '" name="taxa_taxon_list_attribute_termlist_term_ids:' + idx + '[]"/></li>');
              });
            }
          });
        }
        if (typeof hook_reportfilter_loadForm !== 'undefined') {
          hook_reportfilter_loadForm('what');
        }
      }
    },
    when: {
      loadForm: function (context) {
        var dateTypePrefix = '';
        if (typeof indiciaData.filter.def.date_type !== 'undefined' && indiciaData.filter.def.date_type !== 'recorded') {
          dateTypePrefix = indiciaData.filter.def.date_type + '_';
        }
        if (context && (context.date_from || context.date_to || context.date_age || context.date_year ||
          context.input_date_from || context.input_date_to || context.input_date_age || context.input_date_year ||
          context.edited_date_from || context.edited_date_to || context.edited_date_age || context.edited_date_year ||
          context.verified_date_from || context.verified_date_to || context.verified_date_age || context.verified_date_year)) {
          $('#controls-filter_when .context-instruct').show();
        }
        if (dateTypePrefix) {
          // We need to load the default values for each control, as if prefixed then they won't autoload
          if (typeof indiciaData.filter.def[dateTypePrefix + 'date_from'] !== 'undefined') {
            $('#date_from').val(indiciaData.filter.def[dateTypePrefix + 'date_from']);
          }
          if (typeof indiciaData.filter.def[dateTypePrefix + 'date_age'] !== 'undefined') {
            $('#date_to').val(indiciaData.filter.def[dateTypePrefix + 'date_to']);
          }
          if (typeof indiciaData.filter.def[dateTypePrefix + 'date_age'] !== 'undefined') {
            $('#date_age').val(indiciaData.filter.def[dateTypePrefix + 'date_age']);
          }
          if (typeof indiciaData.filter.def[dateTypePrefix + 'date_year'] !== 'undefined') {
            $('#date_year').val(indiciaData.filter.def[dateTypePrefix + 'date_year']);
          }
          if (typeof indiciaData.filter.def[dateTypePrefix + 'date_year_op'] !== 'undefined') {
            $('#date_year_op').val(indiciaData.filter.def[dateTypePrefix + 'date_year_op']);
          }
        }
      },
      applyFormToDefinition: function () {
        var dateTypePrefix = '';
        if (typeof indiciaData.filter.def.date_type !== 'undefined' && indiciaData.filter.def.date_type !== 'recorded') {
          dateTypePrefix = indiciaData.filter.def.date_type + '_';
        }
        // make sure we clean up, especially if switching date filter type
        delete indiciaData.filter.def.input_date_from;
        delete indiciaData.filter.def.input_date_to;
        delete indiciaData.filter.def.input_date_age;
        delete indiciaData.filter.def.input_date_year;
        delete indiciaData.filter.def.input_date_year_op;
        delete indiciaData.filter.def.edited_date_from;
        delete indiciaData.filter.def.edited_date_to;
        delete indiciaData.filter.def.edited_date_age;
        delete indiciaData.filter.def.edited_date_year;
        delete indiciaData.filter.def.edited_date_year_op;
        delete indiciaData.filter.def.verified_date_from;
        delete indiciaData.filter.def.verified_date_to;
        delete indiciaData.filter.def.verified_date_age;
        delete indiciaData.filter.def.verified_date_year;
        delete indiciaData.filter.def.verified_date_year_op;
        // if the date filter type needs a prefix on the parameter field names, then copy the values from the
        // date controls into the proper parameter field names
        if (dateTypePrefix) {
          indiciaData.filter.def[dateTypePrefix + 'date_from'] = indiciaData.filter.def.date_from;
          indiciaData.filter.def[dateTypePrefix + 'date_to'] = indiciaData.filter.def.date_to;
          indiciaData.filter.def[dateTypePrefix + 'date_age'] = indiciaData.filter.def.date_age;
          indiciaData.filter.def[dateTypePrefix + 'date_year'] = indiciaData.filter.def.date_year;
          indiciaData.filter.def[dateTypePrefix + 'date_year_op'] = indiciaData.filter.def.date_year_op;
          // the date control values must NOT apply to the field record date in this case - we are doing a different
          // type filter.
          delete indiciaData.filter.def.date_from;
          delete indiciaData.filter.def.date_to;
          delete indiciaData.filter.def.date_age;
          delete indiciaData.filter.def.date_year;
          delete indiciaData.filter.def.date_year_op;
        }
      }
    },
    where: {
      applyFormToDefinition: function () {
        var geoms = [];
        var geom;
        var ids;
        var names;
        delete indiciaData.filter.def.location_id;
        delete indiciaData.filter.def.indexed_location_id;
        delete indiciaData.filter.def.location_list;
        delete indiciaData.filter.def.indexed_location_list;
        delete indiciaData.filter.def.remembered_location_name;
        delete indiciaData.filter.def.searchArea;
        delete indiciaData.filter.def.sref;
        delete indiciaData.filter.def.sref_system;
        delete indiciaData.filter.def['imp-location:name'];
        // if we've got a location name to search for, no need to do anything else as the where filters are exclusive.
        if (indiciaData.filter.def.location_name) {
          return;
        }
        if ($('#site-type').val() !== '') {
          if ($('#site-type').val().match(/^loc:[0-9]+$/)) {
            indiciaData.filter.def.indexed_location_list = $('#site-type').val().replace(/^loc:/, '');
            indiciaData.filter.def.remembered_location_name = $('#site-type :selected').text();
            return;
          } else if ($('input[name="location_list[]"]').length > 0) {
            ids = [];
            names = [];
            $.each($('#location_list\\:sublist li'), function () {
              ids.push($(this).find('input[name="location_list[]"]').val());
              names.push($(this).text().trim());
            });
            if ($.inArray(parseInt($('#site-type').val(), 10), indiciaData.indexedLocationTypeIds) !== -1) {
              indiciaData.filter.def.indexed_location_list = ids.join(',');
            } else {
              indiciaData.filter.def.location_list = ids.join(',');
            }
            indiciaData.filter.def.remembered_location_name = names.join(', ');
            return;
          }
        }

        $.each(indiciaData.mapdiv.map.editLayer.features, function (i, feature) {
          var thisGeom;
          // ignore features with a special purpose, e.g. the selected record when verifying
          if (typeof feature.tag === 'undefined' &&
             (typeof feature.attributes.type === 'undefined' ||
             (feature.attributes.type !== 'boundary' && feature.attributes.type !== 'ghost') ||
             (feature.attributes.type === 'clickPoint' && $('#imp-sref').val().trim() !== ''))) {
            // In some cases, custom code adds a buffer to the search area feature.
            thisGeom = typeof feature.buffer === 'undefined' ? feature.geometry : feature.buffer.geometry;
            if (thisGeom.CLASS_NAME.indexOf('Multi') !== -1) {
              geoms = geoms.concat(thisGeom.components);
            } else {
              geoms.push(thisGeom);
            }
          }
        });
        if (geoms.length > 0) {
          if (geoms.length === 1) {
            geom = geoms[0];
          } else {
            if (geoms[0].CLASS_NAME === 'OpenLayers.Geometry.Polygon') {
              geom = new OpenLayers.Geometry.MultiPolygon(geoms);
            } else if (geoms[0].CLASS_NAME === 'OpenLayers.Geometry.LineString') {
              geom = new OpenLayers.Geometry.MultiLineString(geoms);
            } else if (geoms[0].CLASS_NAME === 'OpenLayers.Geometry.Point') {
              geom = new OpenLayers.Geometry.MultiPoint(geoms);
            }
          }
          if (indiciaData.mapdiv.map.projection.getCode() !== 'EPSG:3857') {
            geom.transform(indiciaData.mapdiv.map.projection, new OpenLayers.Projection('EPSG:3857'));
          }
          if (indiciaData.filter.def.searchArea !== geom.toString()) {
            indiciaData.filter.def.searchArea = geom.toString();
            filterParamsChanged();
          }
        }
        if ($('#imp-sref').val().trim() !== '') {
          indiciaData.filter.def.sref = $('#imp-sref').val().trim();
          indiciaData.filter.def.sref_system = $('#imp-sref-system').val().trim();
        }
        // cleanup
        delete indiciaData.filter.def['sref:geom'];
      },
      preloadForm: function () {
        // max size the map
        $('#filter-map-container').css('width', $(window).width() - 160);
        $('#filter-map-container').css('height', $(window).height() - 380);
      },
      loadForm: function (context) {
        var locationsToLoad;
        var siteType;
        // legacy
        if (indiciaData.filter.def.location_id && !indiciaData.filter.def.location_list) {
          indiciaData.filter.def.location_list = indiciaData.filter.def.location_id;
          delete indiciaData.filter.def.location_id;
        }
        if (indiciaData.filter.def.indexed_location_id && !indiciaData.filter.def.indexed_location_list) {
          indiciaData.filter.def.indexed_location_list = indiciaData.filter.def.indexed_location_id;
          delete indiciaData.filter.def.indexed_location_id;
        }
        indiciaData.disableMapDataLoading = true;
        if (indiciaData.mapdiv) {
          indiciaData.mapOrigCentre = indiciaData.mapdiv.map.getCenter();
          indiciaData.mapOrigZoom = indiciaData.mapdiv.map.getZoom();
        }
        if (indiciaData.filter.def.indexed_location_list &&
          $("#site-type option[value='loc:" + indiciaData.filter.def.indexed_location_list + "']").length > 0) {
          $('#site-type').val('loc:' + indiciaData.filter.def.indexed_location_list);
        } else if (indiciaData.filter.def.indexed_location_list || indiciaData.filter.def.location_list) {
          locationsToLoad = indiciaData.filter.def.indexed_location_list ?
            indiciaData.filter.def.indexed_location_list : indiciaData.filter.def.location_list;
          if (indiciaData.filter.def['site-type']) {
            siteType = indiciaData.filter.def['site-type'];
          } else {
            // legacy
            siteType = 'my';
          }
          if ($('#site-type').val() !== siteType) {
            $('#site-type').val(siteType);
          }
          changeSiteType();
          loadSites(locationsToLoad);
        } else if (indiciaData.filter.def.searchArea && indiciaData.mapdiv) {
          loadPolygon(indiciaData.filter.def.searchArea);
        }
        if (siteOrGridRefSelected()) {
          // don't want to be able to edit a loaded site boundary or grid reference
          $('.olControlModifyFeatureItemInactive').hide();
        }
        // select the first draw... tool if allowed to draw on the map by permissions, else select navigate
        if (indiciaData.mapdiv) {
          $.each(indiciaData.mapdiv.map.controls, function (idx, ctrl) {
            if (context && (((context.sref || context.searchArea) && ctrl.CLASS_NAME.indexOf('Control.Navigate') > -1) ||
              ((!context.sref && !context.searchArea) && ctrl.CLASS_NAME.indexOf('Control.Draw') > -1))) {
              ctrl.activate();
              return false;
            }
          });
        }
        if (context && (context.location_id || context.indexed_location_id || context.location_name || context.searchArea)) {
          $('#controls-filter_where .context-instruct').show();
        }
        disableIfPresent(context, ['location_id', 'location_list', 'indexed_location_id', 'indexed_location_list', 'location_name'],
          ['#location_list\\:search\\:name', '#location_name']);
        disableIfPresent(context, ['sref', 'searchArea'], ['#imp-sref']);
        if (context && (context.sref || context.searchArea)) {
          $('#controls-filter_where legend').hide();
          $('.olControlDrawFeaturePolygonItemInactive').addClass('disabled');
          $('.olControlDrawFeaturePathItemInactive').addClass('disabled');
          $('.olControlDrawFeaturePointItemInactive').addClass('disabled');
        } else {
          $('#controls-filter_where legend').show();
        }
      },
    },
    who: {
      loadForm: function (context) {
        if (context && context.my_records) {
          $('#my_records').prop('disabled', true);
          $('#controls-filter_who .context-instruct').show();
        } else {
          $('#my_records').prop('disabled', false);
          $('#controls-filter_who .context-instruct').hide();
        }
      }
    },
    occ_id: {
      loadForm: function () {
      }
    },
    smp_id: {
      loadForm: function () {
      }
    },
    quality: {
      loadForm: function (context) {
        // Disable quality options if defined by context.
        if (context && context.quality && context.quality !== 'all') {
          $('.quality-filter').prop('disabled', true);
        } else {
          $('.quality-filter').prop('disabled', false);
        }
        if (indiciaData.filterEntity === 'occurrence') {
          $('.quality-filter').val(indiciaData.filterParser.quality.statusDescriptionFromFilter(
            indiciaData.filter.def.quality, indiciaData.filter.def.quality_op));
        }
        if (context) {
          // If certainty context length is 4, all options are ticked so no need to disable.
          if (context.certainty) {
            if (context.certainty.split(',').length !== 4) {
              $('[name="certainty\[\]"]').prop('disabled', true);
            } else {
              $('[name="certainty\[\]"]').prop('disabled', false);
            }
          }
          if (context.autochecks) {
            $('#autochecks').prop('disabled', true);
          } else {
            $('#autochecks').prop('disabled', false);
          }
          if (context.identification_difficulty) {
            $('#identification_difficulty').prop('disabled', true);
            $('#identification_difficulty_op').prop('disabled', true);
          } else {
            $('#identification_difficulty').prop('disabled', false);
            $('#identification_difficulty_op').prop('disabled', false);
          }
          if (context.has_photos) {
            $('#has_photos').prop('disabled', true);
          } else {
            $('#has_photos').prop('disabled', false);
          }
          if (context.coordinate_precision) {
            $('#coordinate_precision_op').prop('disabled', true);
            $('#coordinate_precision').prop('disabled', true);
          } else {
            $('#coordinate_precision_op').prop('disabled', false);
            $('#coordinate_precision').prop('disabled', false);
          }
          if ((context.quality && context.quality !== 'all') ||
              (context.certainty && context.certainty.split(',').length !== 4) ||
              context.autochecks || context.identification_difficulty || context.has_photos ||
              context.licences || context.media_licences || context.coordinate_precision
            ) {
            $('#controls-filter_quality .context-instruct').show();
          }
        }
        // If no licences are selected, tick them all as that's the unfiltered
        // state.
        if (!indiciaData.filter.def.licences) {
          $('#licences :checkbox').prop('checked', true);
        }
        if (!indiciaData.filter.def.media_licences) {
          $('#media_licences :checkbox').prop('checked', true);
        }
        if (!indiciaData.filter.def.coordinate_precision) {
          // If no coordinate precision selected, tick the not filtered option.
          $('#coordinate_precision_op input').prop('checked', false);
          $('#coordinate_precision input[value=""]').prop('checked', true);
        }
        else if (!indiciaData.filter.def.coordinate_precision) {
          // Precision in filter, but not the op, so set a default.
          $('#coordinate_precision_op input[value="<="]').prop('checked', true);
        }
        // Trigger change to update hidden controls in UI.
        $('#autochecks').change();
      },
      applyFormToDefinition: function() {
        if (indiciaData.filterEntity === 'occurrence') {
          // Map the checked boxes to a comma-separated value.
          const checkedStatuses = $('.filter-controls .quality-pane input[type="checkbox"]:checked');
          let statusCodes = [];
          $.each(checkedStatuses, function () {
            statusCodes.push($(this).val());
          });
          indiciaData.filter.def.quality = statusCodes.filter(function(value) {
            if (value !== 'all' & statusCodes.indexOf('all') >= 0) {
              return false;
            }
            if (value.match(/^[RV][1245]$/) && statusCodes.indexOf(value.substring(0, 1)) >= 0) {
              return false;
            }
            return true;
          }).join(',');
        }
      },
    },
    source: {
      loadForm: function (context) {
        const loadingSurveyIds = typeof indiciaData.filter.def.survey_list === 'undefined' ? [] : indiciaData.filter.def.survey_list.split(',');
        const loadingInputForms = typeof indiciaData.filter.def.input_form_list === 'undefined' ? [] : indiciaData.filter.def.input_form_list.split(',');
        if (context && ((context.website_list && context.website_list_op) ||
          (context.survey_list && context.survey_list_op) || (context.input_form_list && context.input_form_list_op))) {
          $('#controls-filter_source .context-instruct').show();
        }
        $('#controls-filter_source ul input')
          .prop('checked', false)
          .prop('disabled', false);
        if (indiciaData.filter.def.website_list) {
          $.each(indiciaData.filter.def.website_list.split(','), function (idx, id) {
            $('#check-website-' + id).prop('checked', true);
          });
        }
        populateSurveys(loadingSurveyIds);
        populateInputForms(loadingSurveyIds, loadingInputForms);
        disableSourceControlsForContext('website', context, ['survey', 'input_form']);
        disableSourceControlsForContext('survey', context, ['input_form']);
        disableSourceControlsForContext('input_form', context, []);
      },
      applyFormToDefinition: function () {
        var websiteIds = [];
        var surveyIds = [];
        var inputForms = [];
        $.each($('#filter-websites input:checked').filter(':visible'), function (idx, ctrl) {
          websiteIds.push($(ctrl).val());
        });
        indiciaData.filter.def.website_list = websiteIds.join(',');
        $.each($('#filter-surveys input:checked').filter(':visible'), function (idx, ctrl) {
          surveyIds.push($(ctrl).val());
        });
        indiciaData.filter.def.survey_list = surveyIds.join(',');
        $.each($('#filter-input_forms input:checked').filter(':visible'), function (idx, ctrl) {
          inputForms.push("'" + $(ctrl).val() + "'");
        });
        indiciaData.filter.def.input_form_list = inputForms.join(',');
      }
    }
  };
  if (typeof hook_reportFilters_alter_paneObj != 'undefined') {
    paneObjList = hook_reportFilters_alter_paneObj(paneObjList);
  }
  // Event handler for a draw tool boundary being added which clears the other controls on the map pane.
  function addedFeature() {
    // Cleanup other spatial filters.
    $('#controls-filter_where').find('#site-type,#location_list\\:search\\:name,#location_name,#imp-sref').val('');
    $('#controls-filter_where').find(':checkbox').attr('checked', false);
    indiciaData.mapdiv.removeAllFeatures(indiciaData.mapdiv.map.editLayer, 'queryPolygon', true);
    // If a selected site but switching to freehand, we need to clear the site boundary.
    if (siteOrGridRefSelected()) {
      clearSites();
      $('#location_list\\:box').hide();
      indiciaData.mapdiv.map.updateSize();
    }
  }

  // Ensure that pane controls that are exclusive of others are only filled in one at a time.
  $('.filter-controls fieldset :input').change(function (e) {
    var formDiv = $(e.currentTarget).parents('.filter-popup');
    var thisFieldset = $(e.currentTarget).parents('fieldset')[0];
    if ($(this).val() !== '') {
      $.each($(formDiv).find('fieldset.exclusive'), function (idx, fieldset) {
        if (fieldset !== thisFieldset) {
          // Only change if it has a value, to avoid unnecessary loops.
          $(fieldset).find(':input').filter(function() {
              return this.value;
            }).not('#imp-sref-system,:checkbox,[type=button]').val('');
          $(fieldset).find(':checkbox').prop('checked', false);
        }
      });
    }
  });

  // Ensure that only one of families, species and species groups are picked on the what filter
  var taxonSelectionMethods = ['higher_taxa_taxon_list_list', 'taxa_taxon_list_list', 'taxon_group_list'];
  var fieldname;
  var keep = function (toKeep) {
    $.each(taxonSelectionMethods, function () {
      if (this !== toKeep) {
        $('#' + this + '\\:sublist').children().remove();
      }
    });
  };
  $.each(taxonSelectionMethods, function (idx, method) {
    fieldname = this === 'taxon_group_list' ? 'q' : 'searchterm';
    $('#' + this + '\\:search\\:' + fieldname).keypress(function (e) {
      if (e.which === 13) {
        keep(method);
      }
    });
    $('#' + this + '\\:add').click(function () {
      keep(method);
    });
  });

  // Show all taxon groups link.
  $('#show-species-groups').click(function() {
    $('.filter-controls').hide();
    let cntr = $('<div>').insertAfter($('.filter-controls'));
    let ul = $('<ul style="columns: 4">').appendTo(cntr);
    $.each(indiciaData.allTaxonGroups, function() {
      ul.append('<li>' + this.title + '</li>');
    });
    let btn = $('<button class="btn btn-primary">' + indiciaData.lang.reportFilters.back + '</button>').appendTo(cntr);
    btn.click(function() {
      cntr.remove();
      $('.filter-controls').show();
    });
  });

  function clearSites(all) {
    var map = indiciaData.mapdiv.map;
    $('#location_list\\:sublist').children().remove();
    $('.ac_results').hide();
    $('input#location_list\\:search\\:name').val('');
    if (typeof all === 'undefined' || all === false) {
      indiciaData.mapdiv.removeAllFeatures(map.editLayer, 'boundary');
      indiciaData.mapdiv.removeAllFeatures(map.editLayer, 'queryPolygon');
    } else {
      map.editLayer.removeAllFeatures();
    }
  }

  function loadPolygon(wkt) {
    var parser = new OpenLayers.Format.WKT();
    var feature = parser.read(wkt);
    var map = indiciaData.mapdiv.map;
    if (map.projection.getCode() !== indiciaData.mapdiv.indiciaProjection.getCode()) {
      feature.geometry.transform(indiciaData.mapdiv.indiciaProjection, map.projection);
    }
    map.editLayer.addFeatures([feature]);
    map.zoomToExtent(map.editLayer.getDataExtent());
  }

  function loadSites(idsToSelect, doClear) {
    var idQuery;
    if (typeof doClear === 'undefined' || doClear) {
      clearSites(true);
    }
    if (typeof idsToSelect === 'undefined' || idsToSelect.length === 0) {
      return;
    }
    idQuery = '{"in":{"id":[' + idsToSelect + ']}}';
    loadingSites = true;
    $.ajax({
      dataType: 'json',
      url: indiciaData.read.url + 'index.php/services/data/location',
      data: 'mode=json&view=list&orderby=name&auth_token=' + indiciaData.read.auth_token +
      '&nonce=' + indiciaData.read.nonce + '&query=' + idQuery + '&view=detail&callback=?',
      success: function (data) {
        // @todo Update this code to also work with the ES Leaflet map.
        var features = [];
        var feature;
        var geomwkt;
        var parser;
        if (data.length) {
          $.each(data, function (idx, loc) {
            if ($('input[name="location_list[]"][value="' + loc.id + '"]').length === 0) {
              $('#location_list\\:sublist').append('<li class="ui-widget-content ui-corner-all"><span class="ind-delete-icon">' +
                '&nbsp;</span>' + loc.name + '<input type="hidden" name="location_list[]" value="' + loc.id + '"/></li>');
            }
            if (loc.boundary_geom || loc.centroid_geom) {
              geomwkt = loc.boundary_geom || loc.centroid_geom;
              parser = new OpenLayers.Format.WKT();
              if (indiciaData.mapdiv.map.projection.getCode() !== indiciaData.mapdiv.indiciaProjection.getCode()) {
                geomwkt = parser.read(geomwkt).geometry.transform(indiciaData.mapdiv.indiciaProjection, indiciaData.mapdiv.map.projection).toString();
              }
              feature = parser.read(geomwkt);
              feature.attributes.type = 'boundary';
              feature.attributes.id = loc.id;
              features.push(feature);
            }
          });
          indiciaData.mapdiv.map.editLayer.addFeatures(features);
          indiciaData.mapdiv.map.zoomToExtent(indiciaData.mapdiv.map.editLayer.getDataExtent());
        }
        loadingSites = false;
      }
    });
  }

  function changeSiteType() {
    clearSites();
    if ($('#site-type').val() === 'my') {
      // my sites
      $('#location_list\\:box').show();
      if (indiciaData.includeSitesCreatedByUser) {
        $('input#location_list\\:search\\:name').setExtraParams({
          view: 'detail',
          created_by_id: indiciaData.user_id
        });
        $('input#location_list\\:search\\:name').unsetExtraParams('location_type_id');
      }
    } else if ($('#site-type').val().match(/^[0-9]+$/)) {
      // a location_type_id selected
      $('#location_list\\:box').show();
      $('input#location_list\\:search\\:name').setExtraParams({
        view: 'list',
        location_type_id: $('#site-type').val()
      });
      $('input#location_list\\:search\\:name').unsetExtraParams('created_by_id');
    } else {
      // a shortcut site from the site-types list
      $('#location_list\\:box').hide();
      if ($('#site-type').val().match(/^loc:[0-9]+$/)) {
        indiciaData.mapdiv.locationSelectedInInput(indiciaData.mapdiv, $('#site-type').val().replace(/^loc:/, ''));
      }
    }
    indiciaData.mapdiv.map.updateSize();
  }

  $('#site-type').change(function () {
    changeSiteType();
  });

  $('#my_groups').click(function () {
    $.each(indiciaData.myGroups, function(idx, group) {
      if ($('#taxon_group_list\\:sublist input[value=' + group['id'] + ']').length === 0) {
        $('#taxon_group_list\\:sublist').append('<li><span class="ind-delete-icon"> </span>' + group['title'] +
          '<input type="hidden" value="' + group['id'] + '" name="taxon_group_list[]"></li>');
      }
    });
  });

  // Event handler for selecting a filter from the drop down. Enables the apply filter button when appropriate.
  var filterChange = function () {
    if ($('#select-filter').val()) {
      $('#filter-apply').removeClass('disabled');
    } else {
      $('#filter-apply').addClass('disabled');
    }
  };

  // Hook the above event handler to the select filter dropdown.
  $('#select-filter').change(filterChange);

  /**
   * If a context is loaded, need to limit the filter to the records in the context
   */
  function applyContextLimits() {
    var context;
    // apply the selected context
    if ($('#context-filter').length) {
      context = indiciaData.filterContextDefs[$('#context-filter').val()];
      // Map deprecated parameters
      if (typeof context.higher_taxa_taxon_list_list !== 'undefined' && context.higher_taxa_taxon_list_list !== '') {
        context.taxa_taxon_list_list = context.higher_taxa_taxon_list_list;
        if (typeof indiciaData.filter.def.higher_taxa_taxon_list_names !== 'undefined' && context.higher_taxa_taxon_list_names !== '') {
          context.taxa_taxon_list_names = context.higher_taxa_taxon_list_names;
        }
      }
      $.each(context, function (param, value) {
        if (value !== '') {
          indiciaData.filter.def[param + '_context'] = value;
        }
      });
    }
  }

  refreshFilters = function () {
    $.each(paneObjList, function (name, obj) {
      if (typeof obj.refreshFilter !== 'undefined') {
        obj.refreshFilter();
      }
    });
    //Ensure that any other quality-filter controls on the page are kept in line.
    $('.quality-filter').val(indiciaData.filterParser.quality.statusDescriptionFromFilter(
      indiciaData.filter.def.quality, indiciaData.filter.def.quality_op));
    $('.standalone-media-filter select').val(indiciaData.filter.def.has_photos);
  };

  function codeToSharingTerm(code) {
    switch (code) {
      case 'R': return 'reporting';
      case 'V': return 'verification';
      case 'P': return 'peer review';
      case 'D': return 'data flow';
      case 'M': return 'moderation';
      case 'E': return 'editing';
      default: return code;
    }
  }

  indiciaFns.applyFilterToReports = function (doReload) {
    var filterDef;
    var reload = (typeof doReload === 'undefined') ? true : doReload;
    applyContextLimits();
    refreshFilters(); // make sure upto date.
    filterDef = $.extend({}, indiciaData.filter.def);
    delete filterDef.taxon_group_names;
    delete filterDef.taxa_taxon_list_names;
    delete filterDef.taxon_designation_list_names;
    delete filterDef.taxon_group_names_context;
    delete filterDef.taxa_taxon_list_names_context;
    delete filterDef.taxon_designation_list_names_context;
    // apply the filter to any reports on the page
    $.each(indiciaData.reports, function (i, group) {
      $.each(group, function () {
        var grid = this[0];
        // reset to first page
        grid.settings.offset = 0;
        // Reset the parameters which are fixed for the grid.
        grid.settings.extraParams = $.extend({}, grid.settings.fixedParams);
        // merge in the filter. Supplied filter overrides other location settings (since indexed_location_list and
        // location_list are logically the same filter setting.
        if ((typeof grid.settings.extraParams.indexed_location_list !== 'undefined' ||
            typeof grid.settings.extraParams.indexed_location_id !== 'undefined') &&
            typeof filterDef.location_list !== 'undefined') {
          delete grid.settings.extraParams.indexed_location_list;
          delete grid.settings.extraParams.indexed_location_id;
        } else if ((typeof grid.settings.extraParams.location_list !== 'undefined' ||
            typeof grid.settings.extraParams.location_id !== 'undefined') &&
            typeof filterDef.indexed_location_list !== 'undefined') {
          delete grid.settings.extraParams.location_list;
          delete grid.settings.extraParams.location_id;
        }
        grid.settings.extraParams = $.extend(grid.settings.extraParams, filterDef);
        if ($('#filter\\:sharing').length > 0) {
          grid.settings.extraParams.sharing = codeToSharingTerm($('#filter\\:sharing').val()).replace(' ', '_');
        }
        if (reload) {
          // reload the report grid
          this.ajaxload();
        }
      });
    });
    if (typeof indiciaData.mapdiv !== 'undefined' && typeof indiciaData.mapReportControllerGrid !== 'undefined') {
      indiciaData.mapReportControllerGrid.mapRecords();
    }
    // Integrate with Elasticsearch reports as well.
    if (indiciaData.esSourceObjects) {
      $.each(indiciaData.esSourceObjects, function eachSource() {
        // Reset to first page.
        this.settings.from = 0;
        this.populate();
      });
    }
    // If there's an ES filter summary control on the page, update it.
    if ($('#es-filter-summary').length > 0) {
      $('#es-filter-summary').idcFilterSummary('populate');
    }
  };

  function resetFilter() {
    indiciaData.filter.def = {};
    if (typeof indiciaData.filter.resetParams !== 'undefined') {
      indiciaData.filter.def = $.extend(indiciaData.filter.def, indiciaData.filter.resetParams);
    }
    indiciaData.filter.id = null;
    $('#filter\\:title').val('');
    $('#select-filter').val('');
    indiciaFns.applyFilterToReports();
    // clear map edit layer
    clearSites();
    $('#site-type').val('');
    $('#location_list\\:box').hide();
    // clear any sublists
    $('.ind-sub-list li').remove();
    indiciaFns.updateFilterDescriptions();
    $('#filter-build').html(indiciaData.lang.reportFilters.createAFilter);
    $('#filter-reset').addClass('disabled');
    $('#filter-delete').addClass('disabled');
    $('#filter-apply').addClass('disabled');
    // reset the filter label
    $('#active-filter-label').html('');
    $('#standard-params span.changed').hide();
  }

  indiciaFns.updateFilterDescriptions = function() {
    var description;
    var name;
    $.each($('#filter-panes .pane'), function (idx, pane) {
      name = pane.id.replace(/^pane-filter_/, '');
      description = indiciaData.filterParser[name].getDescription(indiciaData.filter.def, '<br/>');
      if (description === '') {
        description = indiciaData.lang.reportFiltersNoDescription[name];
        $(pane).removeClass('active');
      } else {
        $(pane).addClass('active');
      }
      $(pane).find('.filter-desc').html(description);
    });
  }

  function loadFilterOntoForm(paneName) {
    var context = $('#context-filter').length ? indiciaData.filterContextDefs[$('#context-filter').val()] : null;
    // Does the pane have any special code for loading the definition into the form?
    if (typeof paneObjList[paneName].loadForm !== 'undefined') {
      paneObjList[paneName].loadForm(context);
    }
  }

  function filterLoaded(data) {
    indiciaData.filter.def = $.extend(JSON.parse(data[0].definition), filterOverride);
    indiciaData.filter.id = data[0].id;
    indiciaData.filter.title = data[0].title;
    $('#filter\\:title').val(data[0].title);
    $.each($('#filter-panes .pane'), function (idx, pane) {
      var name = pane.id.replace(/^pane-filter_/, '');
      if (indiciaData.filterParser[name].fixLegacyFilter) {
        indiciaData.filterParser[name].fixLegacyFilter(indiciaData.filter.def);
      }
    });
    indiciaFns.applyFilterToReports();
    $('#filter-reset').removeClass('disabled');
    $('#filter-delete').removeClass('disabled');
    $('#active-filter-label').html('Active filter: ' + data[0].title);
    $.each($('#filter-panes .pane'), function (idx, pane) {
      var name = pane.id.replace(/^pane-filter_/, '');
      if (indiciaData.filterParser[name].loadFilter) {
        indiciaData.filterParser[name].loadFilter(indiciaData.filter.def);
      }
    });
    indiciaFns.updateFilterDescriptions();
    $('#filter-build').html(indiciaData.lang.reportFilters.modifyFilter);
    $('#standard-params span.changed').hide();
    // can't delete a filter you didn't create.
    if (data[0].created_by_id === indiciaData.user_id || indiciaData.admin === "1") {
      $('#filter-delete').show();
    } else {
      $('#filter-delete').hide();
    }
  }

  loadFilter = function (id, getParams) {
    var def;
    filterOverride = getParams;
    if ($('#standard-params span.changed:visible').length === 0
        || confirm(indiciaData.lang.reportFilters.confirmFilterChangedLoad)) {
      def = false;
      switch (id) {
        case 'all-records':
          def = '{"quality": "all"}';
          break;
        case 'my-records':
          def = '{"quality": "all", "my_records": "1"}';
          break;
        case 'my-queried-records':
          def = '{"quality": "D", "my_records": "1"}';
          break;
        case 'my-queried-or-not-accepted-records':
        case 'my-queried-rejected-records':
          def = '{"quality": "D,R", "my_records": "1"}';
          break;
        case 'my-not-reviewed-records':
        case 'my-pending-records':
          def = '{"quality": "P", "my_records": "1"}';
          break;
        case 'my-accepted-records':
        case 'my-verified-records':
          def = '{"quality": "V", "my_records": "1"}';
          break;
        case 'my-groups':
          def = '{"quality": "all", "my_records": "", "taxon_group_list": ' + indiciaData.userPrefsTaxonGroups + '}';
          break;
        case 'my-locality':
          def = '{"quality": "all", "my_records": "", "indexed_location_id": ' + indiciaData.userPrefsLocation + '}';
          break;
        case 'my-groups-locality':
          def = '{"quality": "all", "my_records": "", "taxon_group_list": ' + indiciaData.userPrefsTaxonGroups +
            ', "indexed_location_id": ' + indiciaData.userPrefsLocation + '}';
          break;
        case 'queried-records':
          def = '{"quality": "D"}';
          break;
        case 'answered-records':
          def = '{"quality": "A"}';
          break;
        case 'accepted-records':
          def = '{"quality": "V"}';
          break;
        case 'not-accepted-records':
          def = '{"quality": "R"}';
          break;
      }
      if (!def && typeof indiciaData.filterCustomDefs !== 'undefined'
          && typeof indiciaData.filterCustomDefs[id] !== 'undefined') {
        def = JSON.stringify(indiciaData.filterCustomDefs[id]);
      }
      if (indiciaData.mapdiv) {
        indiciaData.mapdiv.removeAllFeatures(indiciaData.mapdiv.map.editLayer, 'boundary');
      }
      if (def) {
        filterLoaded([{
          id: id,
          title: $('#select-filter option:selected').html(),
          definition: def
        }]);
      } else {
        $.ajax({
          dataType: 'json',
          url: indiciaData.read.url + 'index.php/services/data/filter/' + id,
          data: 'mode=json&view=list&auth_token=' + indiciaData.read.auth_token +
          '&nonce=' + indiciaData.read.nonce + '&callback=?',
          success: filterLoaded
        });
      }
    }
  };

  loadFilterUser = function (fu, getParams) {
    filterOverride = getParams;
    $('#filter\\:description').val(fu.filter_description);
    $('#filter\\:sharing').val(fu.filter_sharing);
    $('#sharing-type-label').html(codeToSharingTerm(fu.filter_sharing));
    $('#filters_user\\:user_id\\:person_name').val(fu.person_name);
    $('#filters_user\\:user_id').val(fu.user_id);
    filterLoaded([{
      id: fu.filter_id,
      title: fu.filter_title,
      definition: fu.filter_definition,
      created_by_id: fu.filter_created_by_id
    }]);
  };

  /**
   * Identify the form as having been changed by the user.
   */
  function filterParamsChanged() {
    // Don't proceed if change happens before doc ready done, as this will be
    // code changing values rather than the user.
    if (indiciaData.documentReady === 'done') {
      $('#standard-params span.changed').show();
      $('#filter-reset').removeClass('disabled');
    }
  }

  // Applies the current loaded filter to the controls within the pane.
  function updateControlValuesToReflectCurrentFilter(pane) {
    var attrName;
    var option;
    // regexp extracts the pane ID from the href. Loop through the controls in the pane
    $.each(pane.find(':input').not('#imp-sref-system,:checkbox,:radio,[type=button],[name="location_list[]"],.precise-date-picker'),
      function (idx, ctrl) {
        var value;
        // set control value to the stored filter setting
        attrName = $(ctrl).attr('name');
        // Special case for dates where the filter value name is prefixed with the date type.
        if (attrName && attrName.substring(0, 5) === 'date_' && attrName !== 'date_type'
          && typeof indiciaData.filter.def.date_type !== 'undefined' && indiciaData.filter.def.date_type !== 'recorded') {
          attrName = indiciaData.filter.def.date_type + '_' + attrName;
        }
        if ($(ctrl).is('select')) {
          $(ctrl).find('option:selected').prop('selected', false);
          value = typeof indiciaData.filter.def[attrName] === 'undefined' ? '' : indiciaData.filter.def[attrName];
          option = $(ctrl).find('option[value="' + value + '"]');
          if (option) {
            option.prop('selected', true);
          }
        } else {
          $(ctrl).val(indiciaData.filter.def[attrName]);
        }
      }
    );
    $.each(pane.find('[type="radio"]'), function (idx, ctrl) {
      $(ctrl).prop('checked', typeof indiciaData.filter.def[$(ctrl).attr('name')] !== 'undefined'
            && indiciaData.filter.def[$(ctrl).attr('name')] === $(ctrl).val());
    });
    $.each(pane.find(':checkbox'), function (idx, ctrl) {
      var tokens;
      var type;
      var ids;
      if (ctrl.id.match(/^check-/)) {
        // source checkboxes map to a list of IDs
        tokens = ctrl.id.split('-');
        type = tokens[0];
        if (typeof indiciaData.filter.def[type + '_list'] !== 'undefined') {
          ids = indiciaData.filter.def[type + '_list'].split(',');
          $(ctrl).prop('checked', $.inArray($(ctrl).val(), ids) > -1);
        }
      } else {
        if ($(ctrl).attr('name').match(/\[\]$/) && typeof indiciaData.filter.def[$(ctrl).attr('name').replace('[]', '')] !== 'undefined') {
          // An array mapped to a set of checkboxes.
          var field = $(ctrl).attr('name').replace('[]', '');
          var checkValues = indiciaData.filter.def[field].split(',');
          $(ctrl).prop('checked', checkValues.indexOf($(ctrl).val()) !== -1);
        } else {
          // other checkboxes are simple on/off flags for filter parameters.
          $(ctrl).prop('checked', typeof indiciaData.filter.def[$(ctrl).attr('name')] !== 'undefined'
            && indiciaData.filter.def[$(ctrl).attr('name')] === $(ctrl).val());
        }
      }
    });
  }
  if ($('.fb-filter-link').length){
    $('.fb-filter-link').fancybox({
      beforeLoad: function () {
        var pane = $(this.src.replace(/^[^#]+/, ''));
        var paneName = $(pane).attr('id').replace('controls-filter_', '');
        if (typeof paneObjList[paneName].preloadForm !== 'undefined') {
          paneObjList[paneName].preloadForm();
        }
        // reset
        pane.find('.fb-apply').data('clicked', false);
        updateControlValuesToReflectCurrentFilter(pane);
        loadFilterOntoForm(paneName);
      },
      afterShow: function () {
        var pane = $(this.src.replace(/^[^#]+/, ''));
        var element;
        $('.context-instruct').hide();
        if (pane[0].id === 'controls-filter_where') {
          if (typeof indiciaData.linkToMapDiv !== 'undefined') {
            // move the map div to our container so it appears on the popup
            element = $('#' + indiciaData.linkToMapDiv);
            indiciaData.origMapParent = element.parent();
            indiciaData.origMapSize = {
              width: $(indiciaData.mapdiv).css('width'),
              height: $(indiciaData.mapdiv).css('height')
            };
            $(indiciaData.mapdiv).css('width', '100%');
            $(indiciaData.mapdiv).css('height', '100%');
            $('#filter-map-container').append(element);
          }
          indiciaData.mapdiv.settings.drawObjectType = 'queryPolygon';
          if ($('#click-buffer').length > 0) {
            // Show tolerance control only if any draw control enabled.
            $('#click-buffer').hide();
            if ($('.olControlDrawFeaturePolygonItemActive,.olControlDrawFeaturePathItemActive,.olControlDrawFeaturePointItemActive').length) {
              $('#click-buffer').show();
              $('#click-buffer').css('right', $('.olControlEditingToolbar').outerWidth() + 10);
            }
          }
          indiciaData.mapdiv.map.updateSize();
          // Ensure that if FancyBox container scrolls, mouse position remains accurate.
          $(indiciaData.mapdiv).parents().scroll(function() {
            indiciaData.mapdiv.map.events.clearMouseCache();
          });
        }
        // these auto-disable on form submission
        $('#taxon_group_list\\:search\\:q').prop('disabled', false);
        $('#taxa_taxon_list_list\\:search\\:searchterm').prop('disabled', false);
        $('#taxon_designation_list\\:search').prop('disabled', false);
        $('#location_list\\:search\\:name').prop('disabled', false);
      },
      afterClose: function () {
        var pane = $(this.src.replace(/^[^#]+/, ''));
        var element;
        if (pane[0].id === 'controls-filter_where' && typeof indiciaData.linkToMapDiv !== 'undefined') {
          element = $('#' + indiciaData.linkToMapDiv);
          $(indiciaData.mapdiv).css('width', indiciaData.origMapSize.width);
          $(indiciaData.mapdiv).css('height', indiciaData.origMapSize.height);
          $(indiciaData.origMapParent).append(element);
          if ($('#click-buffer').length > 0) {
            $(indiciaData.origMapParent).append($('#click-buffer'));
            // Show tolerance control only if select feataure control enabled.
            $('#click-buffer').hide();
            if (!$('.olControlSelectFeatureItemActive').length) {
              $('#click-buffer').css('right', $('.olControlEditingToolbar').outerWidth() + 10);
              $('#click-buffer').show();
            }
          }
          indiciaData.mapdiv.map.setCenter(indiciaData.mapOrigCentre, indiciaData.mapOrigZoom);
          indiciaData.mapdiv.map.updateSize();
          indiciaData.mapdiv.settings.drawObjectType = 'boundary';
          indiciaData.disableMapDataLoading = false;
          $.each(indiciaData.mapdiv.map.controls, function () {
            if (this.CLASS_NAME === 'OpenLayers.Control.DrawFeature') {
              this.deactivate();
            }
          });
        }
      }
    });
  }

  $('form.filter-controls :input').change(function () {
    filterParamsChanged();
  });

  $('#filter-apply').click(function () {
    loadFilter($('#select-filter').val(), {});
  });

  $('#filter-reset').click(function () {
    resetFilter();
  });

  $('#filter-build').click(function () {
    var desc;
    $.each(indiciaData.filterParser, function (name, obj) {
      desc = obj.getDescription(indiciaData.filter.def, '<br/>');
      if (desc === '') {
        desc = indiciaData.lang.reportFiltersNoDescription[name];
        $('#pane-filter_' + name).removeClass('active');
      } else {
        $('#pane-filter_' + name).addClass('active');
      }
      $('#pane-filter_' + name + ' .filter-desc').html(desc);
    });
    $('#filter-details').slideDown();
    $('#filter-build').addClass('disabled');
  });

  $('#filter-delete').click(function (e) {
    var filter;
    if ($(e.currentTarget).hasClass('disabled')) {
      return;
    }
    if (confirm(indiciaData.lang.reportFilters.confirmFilterDelete.replace('{title}', indiciaData.filter.title))) {
      filter = {
        id: indiciaData.filter.id,
        website_id: indiciaData.website_id,
        user_id: indiciaData.user_id,
        deleted: 't'
      };
      $.post(indiciaData.filterPostUrl,
        filter,
        function (data) {
          if (typeof data.error === 'undefined') {
            alert(indiciaData.lang.reportFilters.filterDeleted);
            $('#select-filter').val('');
            $('#select-filter').find('option[value="' + indiciaData.filter.id + '"]').remove();
            resetFilter();
          } else {
            alert(data.error);
          }
        }
      );
    }
  });

  $('#filter-done').click(function () {
    $('#filter-details').slideUp();
    $('#filter-build').removeClass('disabled');
  });

  $('.fb-close').click(function () {
    $.fancybox.close();
  });

  // Change the year date operation, fill in current year as default.
  $('#date_year_op').change(function() {
    if ($('#date_year_op option:selected').val() !== '' && $('#date_year').val() === '') {
      $('#date_year').val(new Date().getFullYear());
    } else if ($('#date_year_op option:selected').val() === '') {
      // Blank the year if deselecting.
      $('#date_year').val('');
    }
  });

  // Select a named location - deactivate the drawFeature and hide modifyFeature controls.
  $('#location_list\\:search\\:name').change(function () {
    $.each(indiciaData.mapdiv.map.controls, function () {
      if (this.CLASS_NAME === 'OpenLayers.Control.DrawFeature') {
        this.deactivate();
      }
    });
    $('.olControlModifyFeatureItemInactive').hide();
  });


  if (typeof mapInitialisationHooks !== 'undefined') {
    mapInitialisationHooks.push(function(div) {
      // On initialisation of the map, hook event handlers to the draw feature control so we can link the modify feature
      // control visibility to it.
      $.each(div.map.controls, function eachControl() {
        if (this.CLASS_NAME === 'OpenLayers.Control.DrawFeature' || this.CLASS_NAME === 'OpenLayers.Control.ModifyFeature') {
          this.events.register('activate', '', function () {
            $('.olControlModifyFeatureItemInactive, .olControlModifyFeatureItemActive').show();
          });
          this.events.register('deactivate', '', function () {
            $('.olControlModifyFeatureItemInactive').hide();
          });
        }
        // Hook the addedFeature handler up to the draw controls on the map
        if (this.CLASS_NAME.indexOf('Control.Draw') > -1) {
          this.events.register('featureadded', this, addedFeature);
        }
      });
      // ensures that if part of a loaded filter description is a boundary, it gets loaded onto the map only when the map is ready
      indiciaFns.updateFilterDescriptions();
    });

    mapClickForSpatialRefHooks.push(function (data, mapdiv) {
      // on click to set a grid square, clear any other boundary data
      mapdiv.removeAllFeatures(mapdiv.map.editLayer, 'clickPoint', true);
      clearSites();
      $('#controls-filter_where').find(':input')
          .not('#imp-sref,#imp-sref-system,:checkbox,[type=button],[name="location_list[]"]').val('');
    });
  }

  $('form.filter-controls').submit(function(e) {
    var arrays = {};
    var arrayName;
    var pane;
    e.preventDefault();
    if (!$(e.currentTarget).valid() || $(e.currentTarget).find('.fb-apply').data('clicked')) {
      return false;
    }
    $(e.currentTarget).find('.fb-apply').data('clicked', true);
    // persist each control value into the stored settings
    $.each($(e.currentTarget).find(':input[name]').not('.filter-exclude'), function (idx, ctrl) {
      // Skip open layers switcher.
      if (!$(ctrl).hasClass('olButton')) {
        // Skip radio/checkboxes unless checked.
        if (($(ctrl).attr('type') !== 'checkbox' && $(ctrl).attr('type') !== 'radio') || $(ctrl).is(':checked')) {
          // array control?
          if ($(ctrl).attr('name').match(/\[\]$/)) {
            // store array control data to handle later
            arrayName = $(ctrl).attr('name').substring(0, $(ctrl).attr('name').length-2);
            if (typeof arrays[arrayName] === 'undefined') {
              arrays[arrayName] = [];
            }
            arrays[arrayName].push($(ctrl).val());
          } else {
            // normal control
            indiciaData.filter.def[$(ctrl).attr('name')] = $(ctrl).val();
          }
        }
      }
    });
    // convert array values to comma lists
    $.each(arrays, function (name, arr) {
      indiciaData.filter.def[name] = arr.join(',');
    });
    pane = e.currentTarget.parentNode.id.replace('controls-filter_', '');
    // Does the pane have any special code for applying it's settings to the definition?
    if (typeof paneObjList[pane].applyFormToDefinition !== 'undefined') {
      paneObjList[pane].applyFormToDefinition();
    }
    indiciaFns.applyFilterToReports();
    indiciaFns.updateFilterDescriptions();
    $.fancybox.close();
  });

  var saveFilter = function () {
    if (saving) {
      return;
    }
    if ($.trim($('#filter\\:title').val()) === '') {
      alert('Please provide a name for your filter.');
      $('#filter\\:title').focus();
      return;
    }
    if ($('#filters_user\\:user_id').length && $('#filters_user\\:user_id').val() === '') {
      alert('Please fill in who this filter is for.');
      $('#filters_user\\:user_id\\:person_name').focus();
      return;
    }
    saving = true;
    // TODO: Validate user control

    var adminMode = $('#filters_user\\:user_id').length === 1;
    var userId = adminMode ? $('#filters_user\\:user_id').val() : indiciaData.user_id;
    var sharing = adminMode ? $('#filter\\:sharing').val() : indiciaData.filterSharing;
    var url;
    var filter = {
      website_id: indiciaData.website_id,
      user_id: indiciaData.user_id,
      'filter:title': $('#filter\\:title').val(),
      'filter:description': $('#filter\\:description').val(),
      'filter:definition': JSON.stringify(indiciaData.filter.def),
      'filter:sharing': sharing,
      'filter:defines_permissions': adminMode ? 't' : 'f'
    };
    // If existing filter and the title has not changed, or in admin mode, overwrite.
    if (indiciaData.filter.id && ($('#filter\\:title').val() === indiciaData.filter.title || adminMode)) {
      filter['filter:id'] = indiciaData.filter.id;
      // Note, as overwriting, the filters_users record already exists.
      url = indiciaData.filterPostUrl;
    } else {
      // New filter, so need to link to the user.
      filter['filters_user:user_id'] = userId;
      url = indiciaData.filterAndUserPostUrl;
    }
    $.post(url, filter,
      function (data) {
        var handled;
        if (typeof data.error === 'undefined') {
          alert(indiciaData.lang.reportFilters.filterSaved);
          indiciaData.filter.id = data.outer_id;
          indiciaData.filter.title = $('#filter\\:title').val();
          $('#active-filter-label').html('Active filter: ' + $('#filter\\:title').val());
          $('#standard-params span.changed').hide();
          $('#select-filter').val(indiciaData.filter.id);
          if ($('#select-filter').val() === '') {
            // this is a new filter, so add to the select list
            $('#select-filter').append('<option value="' + indiciaData.filter.id + '" selected="selected">' +
              indiciaData.filter.title + '</option>');
          }
          if (indiciaData.redirectOnSuccess !== '') {
            window.location = indiciaData.redirectOnSuccess;
          }
        } else {
          handled = false;
          if (typeof data.errors !== 'undefined') {
            $.each(data.errors, function (key, msg) {
              if (msg.indexOf('duplicate') > -1) {
                if (confirm(indiciaData.lang.reportFilters.filterExistsOverwrite)) {
                  // need to load the existing filter to get it's ID, then resave
                  $.getJSON(indiciaData.read.url + 'index.php/services/data/filter?created_by_id=' +
                    indiciaData.user_id + '&title=' + encodeURIComponent($('#filter\\:title').val()) + '&sharing=' +
                    indiciaData.filterSharing + '&mode=json&view=list&auth_token=' + indiciaData.read.auth_token +
                    '&nonce=' + indiciaData.read.nonce + '&callback=?', function (response) {
                    indiciaData.filter.id = response[0].id;
                    indiciaData.filter.title = $('#filter\\:title').val();
                    saveFilter();
                  });
                }
                handled = true;
              }
            });
          }
          if (!handled) {
            alert(data.error);
          }
        }
        saving = false;
        $('#filter-build').html(indiciaData.lang.reportFilters.modifyFilter);
        $('#filter-reset').removeClass('disabled');
      },
      'json'
    );
  };

  /**
   * Refresh after a standalone filter control changed.
   */
  function updateStandaloneFilter() {
    // If there is a standard params control update the quality drop-down to reflect
    // the value selected in this control.
    indiciaFns.updateFilterDescriptions();
    filterParamsChanged();
    // Update reports
    indiciaFns.applyFilterToReports();
  }

  // Standalone quality media filters select change event.
  $('.standalone-media-filter select').change(function() {
    indiciaData.filter.def.has_photos = $(this).val();
    updateStandaloneFilter();
  });

  // Interactions betweem mutually exclusive filters.
  $('#occ_id').change(function() {
    if ($('#occ_id').val().trim() !== '') {
      $('#occurrence_external_key').val('');
    }
  });
  $('#occurrence_external_key').change(function() {
    if ($('#occurrence_external_key').val().trim() !== '') {
      $('#occ_id').val('');
    }
  });

  $('#location_list\\:box').hide();
  $('#filter-save').click(saveFilter);
  $('#context-filter').change(resetFilter);

  filterChange();
  $('#imp-sref').change(function () {
    window.setTimeout(function () { clearSites(); }, 500);
  });

  if ($('form.filter-controls').validate) {
    $('form.filter-controls').validate();
  }

  /**
   * Utility function to convert a form path alias to a control HTML ID.
   */
  function formPathToId(form) {
    return 'check-input_form-' + form
      .replace(/^'(.+)'$/, '$1')
      .replace(/[^a-z0-9]/, '-');
  }

  /**
   * Utility function to convert a form path alias to a display label.
   */
  function formPathToLabel(form) {
    let formLabel = indiciaFns.escapeHtml(form
      .replace(/(http(s)?:\/\/)|[\/\-_]|(\?q=)/g, ' ')
      .replace(/^'(.+)'$/, '$1'));
    return formLabel.charAt(0).toUpperCase() + formLabel.slice(1);
  }

  /**
   * Update the list of source surveys.
   *
   * @param array surveys
   *   The list of surveys to load. If null then the list is left untouched.
   * @param array surveyIdsToRetick
   *   List of forms that were previously ticked, so should be reticked after
   *   loading.
   */
  function updateSurveyList(surveys, surveyIdsToRetick) {
    if (surveys !== null) {
      $('#survey-list-checklist li').remove();
      $.each(surveys, function() {
        const surveyEscaped = indiciaFns.escapeHtml(this.title);
        $('<li>' +
          '<input type="checkbox" value="' + this.id + '" id="check-survey-' + this.id + '"/>' +
          '<label for="check-survey-' + this.id + '">' + surveyEscaped + '</label></li>')
          .appendTo($('#survey-list-checklist'));
      });
    }
    $.each(surveyIdsToRetick, function() {
      $('#check-survey-' + this).prop('checked', true);
    });
    if ($('#survey-list-checklist li').length === 0) {
      $('#filter-surveys p.alert').show();
    } else {
      $('#filter-surveys p.alert').hide();
    }
    if (surveyIdsToRetick.length === 0 && $('#survey-list-checklist li').length > 0) {
      $('#filter-input_forms p.alert').show();
    } else {
      $('#filter-input_forms p.alert').hide();
    }
  }

  /**
   * Populate the list of source surveys according to selected websites.
   */
  function populateSurveys(surveyIdsToRetick) {
    let loadSurveysUsingWebsites = [];
    // Grab list of websites to filter against, only in include mode.
    if ($('#filter-websites-mode').length === 0 || $('#filter-websites-mode').val() === 'in') {
      $.each($('#website-list-checklist :checked'), function() {
        loadSurveysUsingWebsites.push($(this).val());
      });
    }
    if (typeof surveyIdsToRetick === 'undefined') {
      surveyIdsToRetick = [];
      // Grab any existing checked surveys so we can keep them.
      $.each($('#survey-list-checklist :checked'), function() {
        surveyIdsToRetick.push($(this).val());
      });
    }
    if (loadSurveysUsingWebsites.length) {
      // We have some selected websites to load surveys for.
      if (indiciaData.lastLoadedSurveysUsingWebsites.join(',') !== loadSurveysUsingWebsites.join(',')) {
        $.getJSON(indiciaData.warehouseUrl + 'index.php/services/report/requestReport?' +
          'report=library/surveys/surveys_list.xml' +
          '&reportSource=local&orderby=fulltitle&website_ids=' + loadSurveysUsingWebsites.join(',') +
          '&nonce=' + indiciaData.read.nonce + '&auth_token=' + indiciaData.read.auth_token +
          '&mode=json&callback=?')
        .done(function(data) {
          $('#survey-list-checklist li').remove();
          // Load the list of surveys into the UI.
          let surveys = [];
          $.each(data, function() {
            let title = loadSurveysUsingWebsites.length > 1 ? this.fulltitle : this.title;
            title = indiciaFns.escapeHtml(title);
            surveys.push({
              id: this.id,
              title: title
            });
          });
          updateSurveyList(surveys, surveyIdsToRetick);
        });
      } else {
        updateSurveyList(null, surveyIdsToRetick);
      }
      indiciaData.lastLoadedSurveysUsingWebsites = loadSurveysUsingWebsites;
    } else {
      indiciaData.lastLoadedSurveysUsingWebsites = [];
      updateSurveyList([], surveyIdsToRetick);
    }
  }

  /**
   * Update the list of source input forms.
   *
   * @param array inputForms
   *   The list of input form names to load. If null then the list is left
   *   untouched.
   * @param array inputFormsToRetick
   *   List of forms that were previously ticked, so should be reticked after
   *   loading.
   *
   */
  function updateInputFormList(inputForms, inputFormsToRetick) {
    if (inputForms !== null) {
      $('#input_form-list-checklist li').remove();
      $.each(inputForms, function() {
        const formId = formPathToId(this);
        const formValue = indiciaFns.escapeHtml(this);
        const formLabel = formPathToLabel(this);
        $('<li>' +
          '<input type="checkbox" value="' + formValue + '" id="' + formId + '"/>' +
          '<label for="' + formId + '">' + formLabel + '</label></li>')
          .appendTo($('#input_form-list-checklist'));
      });
    }
    $.each(inputFormsToRetick, function() {
      // If loaded from a filter def, the form names are wrapped in ''.
      console.log(this + ' :: ' + formPathToId(this));
      $('#' + formPathToId(this)).prop('checked', true);
    });

    if ($('#survey-list-checklist li').length > 0 && $('#survey-list-checklist li :checked').length === 0) {
      $('#filter-input_forms p.alert').show();
    } else {
      $('#filter-input_forms p.alert').hide();
    }
  }

  /**
   * Populate the list of source input forms according to selected surveys.
   */
  function populateInputForms(loadInputFormsUsingSurveys, inputFormsToRetick) {
    if (typeof loadInputFormsUsingSurveys === 'undefined') {
      loadInputFormsUsingSurveys = [];
      // Grab list of websites to filter against, only in include mode.
      if ($('#filter-surveys-mode').val() === 'in') {
        $.each($('#survey-list-checklist :checked'), function() {
          loadInputFormsUsingSurveys.push($(this).val());
        });
      }
    }
    if (typeof inputFormsToRetick === 'undefined') {
      inputFormsToRetick = [];
      // Grab any existing checked surveys so we can keep them.
      $.each($('#input_form-list-checklist :checked'), function() {
        inputFormsToRetick.push($(this).val());
      });
    }
    if (loadInputFormsUsingSurveys.length) {
      // We have some selected surveys to load forms for.
      if (indiciaData.lastLoadedInputFormsUsingSurveys.join(',') !== loadInputFormsUsingSurveys.join(',')) {
        // Use Elasticsearch if available, as PG slow for getting input forms.
        if (indiciaData.esProxyAjaxUrl) {
          const url = indiciaData.esProxyAjaxUrl + '/searchbyparams/' + (indiciaData.nid || '0');
          const request = {
            proxyCacheTimeout: 3600,
            size: 0,
            bool_queries: [{
              bool_clause: 'must',
              field: 'metadata.survey.id',
              query_type: 'terms',
              value: JSON.stringify(loadInputFormsUsingSurveys)
            }],
            aggs: {
              by_form: {
                terms: {
                  field: 'metadata.input_form'
                }
              }
            }
          };
          $.ajax({
            url: url,
            type: 'post',
            data: request
          }).done(function(data) {
            let forms = [];
            $.each(data.aggregations.by_form.buckets, function() {
              forms.push(this.key);
            });
            updateInputFormList(forms, inputFormsToRetick);
          });
        } else {
          $.getJSON(indiciaData.warehouseUrl + 'index.php/services/report/requestReport?' +
            'report=library/input_forms/input_forms_list.xml' +
            '&reportSource=local&orderby=input_form&survey_ids=' + loadInputFormsUsingSurveys.join(',') +
            '&nonce=' + indiciaData.read.nonce + '&auth_token=' + indiciaData.read.auth_token +
            '&mode=json&callback=?')
          .done(function(data) {
            let forms = [];
            $.each(data, function() {
              forms.push(this.input_form);
            });
            updateInputFormList(forms, inputFormsToRetick);
          });
        }
      } else {
        updateInputFormList(null, inputFormsToRetick);
      }
      indiciaData.lastLoadedInputFormsUsingSurveys = loadInputFormsUsingSurveys;
      return;
    } else {
      indiciaData.lastLoadedInputFormsUsingSurveys = [];
      updateInputFormList([], inputFormsToRetick);
    }
  }

  // Set some initial data for tracking loaded source info.
  indiciaData.lastLoadedSurveysUsingWebsites = [];
  indiciaData.lastLoadedInputFormsUsingSurveys = [];

  indiciaFns.on('change', '#website-list-checklist input[type=checkbox], #filter-websites-mode', {}, function() {
    populateSurveys();
  });

  indiciaFns.on('change', '#survey-list-checklist input[type=checkbox], #filter-surveys-mode', {}, function() {
    populateInputForms();
  });

  /**
   * Function for filtering source lists by search filter.
   */
  function sourceListFilterKeyHandler() {
    const simplifiedSearchTerm = $(this).val().toLowerCase().replace(/[^0-9a-z]/, '');
    $.each($(this).closest('.filter-popup-columns').find('li'), function() {
      if ($(this).find('label').text().toLowerCase().replace(/[^0-9a-z]/, '').match(simplifiedSearchTerm)) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  }

  // Link source filter boxes handler to keyup for inputs.
  $('#websites-search').keyup(sourceListFilterKeyHandler);
  $('#surveys-search').keyup(sourceListFilterKeyHandler);
  $('#input_forms-search').keyup(sourceListFilterKeyHandler);

  /* Code for the custom quality filter select control. */
  function closeQualityPane(e) {
    const clickedOn = $(e.target);
    if ((clickedOn.is('button') || !clickedOn.closest('.quality-pane').length) && $('.quality-pane').is(':visible')) {
      $('.quality-pane').hide();
      document.removeEventListener('click', closeQualityPane);
    }
  }

  /**
   * OK button handler for the quality pane.
   */
  function saveAndCloseQualityPane(e) {
    const pane = $(e.currentTarget).closest('.quality-pane');
    const checkedStatuses = $(pane).find('input[type="checkbox"]:checked');
    let statusCodes = [];
    $.each(checkedStatuses, function () {
      statusCodes.push($(this).val());
    });
    $('input.quality-filter').val(indiciaData.filterParser.quality.statusDescriptionFromFilter(statusCodes, $('[name="quality_op"]:checked').val()));
    if ($(e.currentTarget).closest('.standalone-quality-filter').length !== 0) {
      // If standalone, this updates the filter immediately.
      indiciaData.filter.def.quality = statusCodes.filter(function(value) {
        if (value !== 'all' & statusCodes.indexOf('all') >= 0) {
          return false;
        }
        if (value.match(/^[RV][1245]$/) && statusCodes.indexOf(value.substring(0, 1)) >= 0) {
          return false;
        }
        return true;
      }).join(',');
      indiciaData.filter.def.quality_op = $(pane).find('[name="quality_op"]:checked').val();
      let desc = indiciaData.filterParser.quality.getDescription(indiciaData.filter.def, '<br/>');
      if (desc === '') {
        desc = indiciaData.lang.reportFiltersNoDescription[name];
        $('#pane-filter_quality').removeClass('active');
      } else {
        $('#pane-filter_quality').addClass('active');
      }
      $('#pane-filter_quality .filter-desc').html(desc);
      updateStandaloneFilter();
    }
    closeQualityPane(e);
  }

  // Show the custom quality panel drop-down div.
  $('.quality-filter').click(function(e) {
    var wrap = $(e.currentTarget).closest('.quality-cntr');
    var pane = wrap.find('.quality-pane');
    var input = wrap.find('.quality-filter');
    var inputPos = input.position();
    var inputHeight = input.outerHeight();
    if (pane.is(':visible')) {
      closeQualityPane(e);
    } else {
      // If a standalone, need to load the currrent filter into the controls.
      if ($(e.currentTarget).closest('.standalone-quality-filter').length > 0) {
        const inChecked = typeof indiciaData.filter.def.quality_op === 'undefined' || indiciaData.filter.def.quality_op === 'in';
        // Include.
        $('#quality_op--standalone\\:0').prop('checked', inChecked);
        // Exclude.
        $('#quality_op--standalone\\:1').prop('checked', !inChecked);
        // Statuses
        const statuses = indiciaData.filter.def.quality.split(',');
        $('.quality-pane input[type="checkbox"]').prop('checked', false);
        $.each(statuses, function() {
          $('.quality-pane input[type="checkbox"][value="' + this + '"]').prop('checked', true);
        });
      }
      // Adjust for select control margin.
      $(pane).css('top', (inputPos.top + inputHeight + parseInt( + $(input).css('margin-top').replace('px', ''), 10)) + 'px');
      $(pane).css('left', inputPos.left + parseInt($(input).css('margin-left').replace('px', ''), 10) + 'px');
      pane.show();
      document.addEventListener('click', closeQualityPane);
    }
    e.preventDefault();
    return false;
  });

  // Indent level 2 verification items hierarchical behaviour.
  $('.quality-pane').find('input[value="V1"], input[value="V2"], input[value="R4"], input[value="R5"]').addClass('indent');
  $('.quality-pane input.indent').change((e) => {
    const pane = $(e.currentTarget).closest('.quality-pane');
    const status = $(e.currentTarget).val().substring(0, 1);
    const l1Checkbox = $(pane).find('input[value="' + status + '"]');
    const l2Checkboxes = $(pane).find('input.indent[value^="' + status + '"]');
    const l2CheckboxesChecked = $(pane).find('input.indent[value^="' + status + '"]:checked');
    l1Checkbox.prop('checked', l2Checkboxes.length === l2CheckboxesChecked.length);
  });

  /**
   * Cascade level-1 status checkboxes to level 2, e.g. V ticks V1 and V2.
   */
  $('.quality-pane').find('input[value="V"], input[value="R"]').change((e) => {
    const pane = $(e.currentTarget).closest('.quality-pane');
    const status = $(e.currentTarget).val();
    const l1Checkbox = $(pane).find('input[value="' + status + '"]');
    const l2Checkboxes = $(pane).find('input.indent[value^="' + status + '"]');
    l2Checkboxes.prop('checked', l1Checkbox.is(':checked'));
  });

  /**
   * Cascade ticking all to the other checkboxes.
   */
  $('.quality-pane').find('input[value="all"]').change((e) => {
    const pane = $(e.currentTarget).closest('.quality-pane');
    const checkboxes = $(pane).find('input[type="checkbox"]').not('[value="all"]');
    checkboxes.prop('checked', $(e.currentTarget).is(':checked'));
  });

  /**
   * Uncheck all if another checkbox is unchecked.
   */
  $('.quality-pane').find('input[type="checkbox"]').not('[value="all"]').change((e) => {
    if (!$(e.currentTarget).is(':checked')) {
      const pane = $(e.currentTarget).closest('.quality-pane');
      const allCheckbox = $(pane).find('input[type="checkbox"][value="all"]');
      $(allCheckbox).prop('checked', false);
    }
  });

  $('#identification_difficulty').change(function() {
    if ($('#identification_difficulty').val() === '') {
      // Unsetting the ID diff filter, so set the op to = as makes more sense.
      $('#identification_difficulty_op').val('=');
    }
  });

  $('#coordinate_precision_op').change(function() {
    if ($('#coordinate_precision_op input:checked').length > 0 && $('#coordinate_precision input:checked').val() === '') {
      // Setting a coordinate precision op, so set the default precision to 1km
      // if not already set.
      $('#coordinate_precision input[value="1000"]').prop('checked', true);
    }
  });

  $('#coordinate_precision').change(function() {
    if ($('#coordinate_precision input:checked').val() === '') {
      // Unsetting the coord precision filter, so remove the op.
      $('#coordinate_precision_op input').prop('checked', false);
    }
    else if ($('#coordinate_precision_op input:checked').length === 0) {
      // Setting a coordinate precision, so set the default op to <= if not
      // already set.
      $('#coordinate_precision_op input[value="<="]').prop('checked', true);
    }
  });


  if ($('#controls-filter_quality').length) {
    $('#controls-filter_quality form').validate({
      rules: {
        "licences[]": {
          required: true,
          minlength: 1
        },
        "media_licences[]": {
          required: true,
          minlength: 1
        }
      },
      messages: {
        "licences[]": indiciaData.lang.reportFilters.cannotDeselectAllLicences,
        "media_licences[]": indiciaData.lang.reportFilters.cannotDeselectAllMediaLicences,
      },
      errorPlacement: function(error, element) {
        var placement = $(element).closest('.control-box');
        if (placement) {
          $(placement).append(error)
        } else {
          error.insertAfter(element);
        }
      },
      errorClass: indiciaData.templates.jQueryValidateErrorClass,
    });

    $('.quality-pane button.cancel').click(closeQualityPane);

    $('.quality-pane button.ok').click(saveAndCloseQualityPane);
  }

  /**
   * In vertical mode the panel descripts can be toggled on and off.
   */
  $('.toggle-description').click(function(e) {
    if ($(e.currentTarget).hasClass('fa-caret-down')) {
      $(e.currentTarget).removeClass('fa-caret-down');
      $(e.currentTarget).addClass('fa-caret-up');
      $(e.currentTarget).closest('.pane').find('.filter-desc').slideDown();
    } else {
      $(e.currentTarget).removeClass('fa-caret-up');
      $(e.currentTarget).addClass('fa-caret-down');
      $(e.currentTarget).closest('.pane').find('.filter-desc').slideUp();
    }
  });

});