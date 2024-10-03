/* Indicia, the OPAL Online Recording Toolkit.
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

jQuery(document).ready(function($) {
  'use strict';

  /**
   * jQuery plugin for AJAX enabling a freeform report.
   */
  $.fn.freeformReport = function (options) {
    // Extend our default options with those provided, basing this on an empty object
    // so the defaults don't get changed.
    var opts = $.extend({}, $.fn.freeformReport.defaults, options);

    return this.each(function () {
      this.settings = opts;

      // Make this accessible inside functions.
      var div = this;

      div.settings.rowContainer = $('#' + div.settings.id + ' .freeform-row-placeholder').parent();
      $('#' + div.settings.id + ' .freeform-row-placeholder').remove();

      var request;
      var params;
      if (div.settings.proxy) {
        request = div.settings.proxy;
        params = div.settings.extraParams;
      }  else {
        request = indiciaData.read.url + 'index.php/services/report/requestReport';
        params = $.extend({
          report: div.settings.dataSource + '.xml',
          reportSource: 'local',
          mode: 'json',
          nonce: indiciaData.read.nonce,
          auth_token: indiciaData.read.auth_token
        }, div.settings.extraParams);
      }
      request = request + '?' + Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      if (!div.settings.proxy) {
        // JSONP if going direct to warehouse.
        request += '&callback=?';
      }
      $.ajax({
        dataType: 'json',
        url: request,
        data: null,
      }).done(function(data) {
        $.each(data, function() {
          // Add some extra replacements for handling links.
          const row = $.extend({}, this, {
            rootFolder: indiciaData.rootFolder,
            sep: indiciaData.rootFolder.match(/\?/) ? '&' : '?'
          });
          $.each(div.settings.bands, function() {
            const band = this;
            let outputBand = true;
            // Handle group headings.
            if (band.triggerFields) {
              outputBand = false;
              // Make sure we have somewhere to store the current field values for checking against
              if (typeof band.triggerValues === 'undefined') {
                band.triggerValues = {};
              }
              // look for changes in each trigger field
              $.each(band.triggerFields, function() {
                const triggerField = this;
                if (typeof band.triggerFields[triggerField] === 'undefined' || band.triggerFields[triggerField] !== row[triggerField]) {
                  // One of the trigger fields has changed value, so it means
                  // the band gets output.
                  outputBand = true;
                }
                // Store the last value to compare against next time.
                band.triggerValues[triggerField] = row[triggerField];
              });
            }
            if (outputBand) {
              let itemHtml = band.content;
              // Field token replacements.
              $.each(row, function(field, value) {
                const regexp = new RegExp('\\{' + field + '\\}', 'g');
                itemHtml = itemHtml.replace(regexp, value === null ? '' : value.replace('\n', '<br/>'));
              });
              // Custom functions can also be used to replace tokens.
              $.each(div.settings.customFieldFns, function() {
                const regexp = new RegExp('\\{fn:' + this + '\\}', 'g');
                itemHtml = itemHtml.replace(regexp, indiciaFns[this](row));
              });
              $(div.settings.rowContainer).append(itemHtml);
            }
          });
        });
      }).fail(function() {
        console.log('request failed');
      });
    });

  };

  /*
   * Main default options for the report grid
   */
  $.fn.freeformReport.defaults = {
    ajax: false
  };

  jQuery.each(indiciaData.freeformReports, function(id, options) {
    $('#' + id).freeformReport(options);
  });

});