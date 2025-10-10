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
 * @author Indicia Team
 * @license http://www.gnu.org/licenses/gpl.html GPL 3.0
 * @link https://github.com/indicia-team/client_helpers
 */

 /**
 * Output plugin for filter summary.
 */
(function filterSummaryPlugin() {
  'use strict';
  var $ = jQuery;

  indiciaFns.setFilterSummary = function(data) {

    var filterDef, selector;
    if (data && data[0]) {
      filterDef = JSON.parse(data[0].definition);
      selector = '#filterSummary-' + data[0].id;
    } else {
      filterDef = indiciaData.filter.def;
      selector = '#filterSummary-standard-params';
    }

    var r = [];
    indiciaData.filterParser.what.loadFilter(filterDef);
    r.push(indiciaData.filterParser.what.getDescription(filterDef, '</li><li>'));
    r.push(indiciaData.filterParser.when.getDescription(filterDef, '</li><li>'));
    r.push(indiciaData.filterParser.where.getDescription(filterDef, '</li><li>'));
    r.push(indiciaData.filterParser.who.getDescription(filterDef, '</li><li>'));
    r.push(indiciaData.filterParser.occ_id.getDescription(filterDef, '</li><li>'));
    r.push(indiciaData.filterParser.smp_id.getDescription(filterDef, '</li><li>'));
    r.push(indiciaData.filterParser.quality.getDescription(filterDef, '</li><li>'));
    r.push(indiciaData.filterParser.source.getDescription(filterDef, '</li><li>'));

    // Filter out empty elements
    r = r.filter(function(e) {if(e) return e;});

    if (r.length) {
      $(selector).html('<ul><li>' + r.join('</li><li>') + '</li></ul>');
    } else {
      if (selector === '#filterSummary-standard-params') {
        $('#filterSummary-standard-params-header').hide();
      }

    }
  }

  function addHtml(currentHtml, newHtml) {
    return currentHtml ? currentHtml + newHtml : newHtml
  }

  /**
   * Place to store public methods.
   */
  var methods;

  /**
   * Declare default settings.
   */
  var defaults = {};

  /**
   * Registered callbacks for events.
   */
  var callbacks = {};

  /**
   * Declare public methods.
   */
  methods = {
    /**
     * Initialise the idcFilterSummary plugin.
     *
     * @param array options
     */
    init: function init(options) {
      var el = this;
      indiciaFns.registerOutputPluginClass('idcFilterSummary');
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
    },

    /*
     * Populate the idcFilterSummary.
     */
    populate: function populate() {
      var el = $(this).find('.filter-summary-contents');
      var html = '';
      var functionCalls = [];

      // permissionFilters control
      if ($('.permissions-filter').length > 0) {
        $.each($('.permissions-filter'), function eachPermissionFilter() {
          if ($(this).val()) {
            if ($(this).val().substr(0,1) === 'p' || $(this).val().substr(0,1) === 'g') {
              // If the selected value starts with p, it is a general permissions filter and the
              // text value of the control can just be output.
              // If the selected value starts with g, it is a group filter and the
              // text value of the control can just be output.
              html = addHtml(html, '<div><b>Context:</b> ' + $(this).find('option:selected').text() + '</div>');
            } else {
              // The selected value specifies a permissions filter which needs parsing
              var filterId = $(this).val().substr(2);
              html = addHtml(html, '<div><b>' + $(this).find('option:selected').text() + ":</b></div>");
              html = addHtml(html, '<div id="filterSummary-' + filterId + '"></div>');

              functionCalls.push({
                function: $.ajax,
                arg: {
                  url: indiciaData.read.url + 'index.php/services/data/filter/' + filterId,
                  data: {
                    mode: 'json',
                    view: 'list',
                    auth_token: indiciaData.read.auth_token,
                    nonce: indiciaData.read.nonce
                  },
                  dataType: 'jsonp',
                  crossDomain: true,
                  success: indiciaFns.setFilterSummary
                }
              })
            }
          }
        });
      }

      // surveyFilter control
      if ($('.survey-filter').length > 0) {
        $.each($('.survey-filter'), function eachSurveyFilter() {
          if ($(this).val() && $(this).val() !== 'all') {
            html = addHtml(html, '<div><b>Limit records to survey:</b> ' + $(this).find('option:selected').text() + '</div>');
          }
        });
      }

      // User filters drop down.
      if ($('.user-filter').length > 0) {
        $.each($('.user-filter'), function eachUserFilter() {
          if ($(this).val()) {
            // The value specifies a permissions filter which needs parsing
            var filterId = $(this).val()
            html = addHtml(html, '<div><b>' + $(this).find('option:selected').text() + ":</b></div>");
            html = addHtml(html, '<div id="filterSummary-' + filterId + '"></div>');

            functionCalls.push({
              function: $.ajax,
              arg: {
                url: indiciaData.read.url + 'index.php/services/data/filter/' + filterId,
                data: {
                  mode: 'json',
                  view: 'list',
                  auth_token: indiciaData.read.auth_token,
                  nonce: indiciaData.read.nonce
                },
                dataType: 'jsonp',
                crossDomain: true,
                success: indiciaFns.setFilterSummary
              }
            })
          }
        });
      }

      // Standard params
      if ($('#standard-params').length > 0) {
        html = addHtml(html, '<div id="filterSummary-standard-params-header"></div>');
        html = addHtml(html, '<div id="filterSummary-standard-params"></div>');
        functionCalls.push({
          function: function() {
            setTimeout(function() {
              var title=$('#active-filter-label').text()
              if (title) {
                $('#filterSummary-standard-params-header').html('<b>Standard filter (' + title + '):</b>')
              } else {
                $('#filterSummary-standard-params-header').html('<b>Standard filter:</b>')
              }
            }, 100);
            indiciaFns.setFilterSummary();
          },
          arg: null
        })
      }

      // Status filters drop down.
      if ($('.standalone-quality-filter select').length > 0) {
        $.each($('.standalone-quality-filter select'), function eachStatusFilter() {
          if ($(this).val()) {
            // The value specifies a record status - display the text value of the selected option
            html = addHtml(html, '<div><b>Status:</b> ' + $(this).find('option:selected').text() + '</div>');
          }
        });
      }

      // es-filter-param controls
      $.each($('.es-filter-param'), function eachParam() {
        if (!$(this).hasClass('survey-filter')) {
          var val = $(this).val();
          // Skip if no value.
          if (val === null || val.trim() === '') {
            return;
          }
          // Skip if unchecked checkbox
          if ($(this).is(':checkbox') && !$(this).is(':checked')) {
            return;
          }

          var esBoolClause = indiciaFns.getDataValueFromInput(this, 'data-es-bool-clause');
          var esField = indiciaFns.getDataValueFromInput(this, 'data-es-field');
          var esQueryType = indiciaFns.getDataValueFromInput(this, 'data-es-query-type');
          var esQuery = indiciaFns.getDataValueFromInput(this, 'data-es-query');
          var esNested = indiciaFns.getDataValueFromInput(this, 'data-es-nested');
          var esSummary = indiciaFns.getDataValueFromInput(this, 'data-es-summary');
          html = addHtml(html, '<div><b>Form filter: </b>');
          if (esSummary) {
            html = addHtml(html, esSummary.replace('#value#', '<strong>' + val + '</strong>'));
          } else {
            if (esField) {
              html = addHtml(html, esField + ' ');
            }
            if (esBoolClause) {
                html = addHtml(html, esBoolClause + ' ');
            }
            if (esQueryType) {
                html = addHtml(html, esQueryType + ' ');
            }
            if (esNested) {
                html = addHtml(html, esNested + ' ');
            }
            if (esQuery) {
                html = addHtml(html, esQuery.replace('#value#', '<strong>' + val + '</strong>'));
            } else {
                html = addHtml(html, '<strong>' + val + '</strong>');
            }
          }
          html = addHtml(html, '</div>');
        }
      });

      $(el).html(html);
      if (functionCalls.length) {
         functionCalls.forEach(function(fc) {
          fc.function(fc.arg);
        });
      }
    }
  };

  /**
   * Extend jQuery to declare idcFilterSummary method.
   */
  $.fn.idcFilterSummary = function buildFilterSummary(methodOrOptions) {

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
      $.error('Method ' + methodOrOptions + ' does not exist on jQuery.idcFilterSummary');
      return true;
    });
    // If the method has no explicit response, return this to allow chaining.
    return typeof result === 'undefined' ? this : result;
  };
}());
