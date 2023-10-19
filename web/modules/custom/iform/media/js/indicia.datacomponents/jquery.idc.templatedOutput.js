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
 * Output plugin for templated output from ES or Indicia.
 */
(function templatedOutputPlugin() {
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

  /**
   * Registered callbacks for events.
   */
  var callbacks = {};

  /**
   * Declare public methods.
   */
  methods = {
    /**
     * Initialise the idcTemplatedOutput plugin.
     *
     * @param array options
     */
    init: function init(options) {
      var el = this;
      indiciaFns.registerOutputPluginClass('idcTemplatedOutput');
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
     * Populate the idcTemplatedOutput with Elasticsearch response data.
     *
     * @param obj sourceSettings
     *   Settings for the data source used to generate the response.
     * @param obj response
     *   Elasticsearch response data.
     * @param obj data
     *   Data sent in request.
     */
    populate: function populate(sourceSettings, response) {
      var el = this;
      var outputRows = el.settings.repeatField
        ? indiciaFns.getValueForField(response, el.settings.repeatField) : response;
      // Find the list of replacement tokens (field names) that are in the
      // content template.
      var tokenRegex = /{{ ([a-z_\.]+) }}/g;
      var tokens = [];
      var matches;
      var rows = [];
      while (matches = tokenRegex.exec(el.settings.content)) {
        tokens.push(matches[1]);
      }
      if (el.settings.header) {
        $('<div class="idcTemplatedOutput-header">' + el.settings.header + '</div>').appendTo(el);
      }
      // Convert non array output to array so can treat the same.
      if (!Array.isArray(outputRows)) {
        outputRows = [outputRows];
      }

      $.each(outputRows, function eachRow() {
        var rowContent = el.settings.content;
        var rowData = this;
        var value;
        $.each(tokens, function eachToken() {
          value = indiciaFns.getValueForField(rowData, this);
          rowContent = rowContent.replace('{{ ' + this + ' }}', value);
        });
        rows.push(rowContent);
      });
      $(el).html(rows.join(''));
      if (el.settings.footer) {
        $('<div class="idcTemplatedOutput-footer">' + el.settings.footer + '</div>').appendTo(el);
      }
    },

    /**
     * Templated outputs always re-populate when their source updates.
     */
    getNeedsPopulation: function getNeedsPopulation() {
      return true;
    }
  };

  /**
   * Extend jQuery to declare idcTemplatedOutput method.
   */
  $.fn.idcTemplatedOutput = function buildTemplatedOutput(methodOrOptions) {
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
      $.error('Method ' + methodOrOptions + ' does not exist on jQuery.idcTemplatedOutput');
      return true;
    });
    // If the method has no explicit response, return this to allow chaining.
    return typeof result === 'undefined' ? this : result;
  };
}());
