/**
 * @file
 * A data card gallery plugin.
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
 * @license http://www.gnu.org/licenses/gpl.html GPL 3.0
 * @link https://github.com/indicia-team/client_helpers
 */

/**
 * Output plugin for a scale showing the count of records under grid squares.
 */

(function enclose() {
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
   * Converts a hexadecimal colour string to RGB.
   *
   * @param string hex
   *   Colour as Hexadecimal.
   *
   * @returns array
   *   Array containing r, g and b values.
   */
  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Update the colour/opacity of the scale.
   */
  function updateScaleStyle(el, scale) {
    const hex = $('#' + el.settings.linkToDataControl)[0].settings.layerConfig[el.settings.layer].style.color;
    const rgb = hexToRgb(hex);
    const savedOpacityCookieValue = indiciaFns.cookie('leafletMapDataLayerOpacity');
    for (let i = 0; i <= 10; i++) {
      // Scale is 0.2 to 0.7.
      const dataValue = i / 20 + 0.2;
      const opacity = indiciaFns.calculateFeatureOpacity(savedOpacityCookieValue ? savedOpacityCookieValue : 0.5, dataValue);
      // Ensure text legible according to background.
      const fontColour = opacity > 0.35 ? '#ffffff' : '#000000';
      $(scale).find(`.scale-box-${i}`).css('background-color', `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity}`);
      $(scale).find(`.scale-box-${i}`).css('color', fontColour);
    }
  }

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
      var scale = $('<div class="scale">').appendTo(el);
      $(el).hide();
      $('<div>' + indiciaData.lang.gridSquareOpacityScale.noOfRecords + ' <i class="fas fa-arrow-right"></i></div>').appendTo(el);
      indiciaFns.registerOutputPluginClass('idcGridSquareOpacityScale');
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
      // Prepare the sequence of shaded boxes.
      const hex = $('#' + el.settings.linkToDataControl)[0].settings.layerConfig[el.settings.layer].style.color;
      const rgb = hexToRgb(hex);
      for (let i = 0; i < 11; i++) {
        const opacity = i / 20 + .1;
        $(scale).append(`<span class="scale-box-${i}" style="border: solid ${hex} 1px;"></span>`);
      }
      $(scale).find('span:first-child').html('1');
      // Link to the map.
      $('#' + el.settings.linkToDataControl).idcLeafletMap('on', 'dataLayerStyleChange', function(mapEl, layer) {
        if (el.settings.layer === layer) {
          updateScaleStyle(el, scale);
        }
      });
      $('#' + el.settings.linkToDataControl).idcLeafletMap('on', 'populateDataLayerEnd', function(mapEl, mode, response, maxCount, maxMetric, layer) {
        if (el.settings.layer === layer) {
          if (maxCount > 0) {
            updateScaleStyle(el, scale);
            $(el).show();
            scale.find('span:last-child').html(maxCount);
          }
          else {
            $(el).hide();
          }
        }
      });
    },

    /**
     * Population is triggered from map, not datasource.
     */
    populate: function populate() {
    },

    /**
     * Population is triggered from map, not datasource.
     */
    getNeedsPopulation: function getNeedsPopulation(source) {
      return false;
    },

  };

  /**
   * Extend jQuery to declare idcGridSquareOpacityScale method.
   */
  $.fn.idcGridSquareOpacityScale = function buildGridSquareOpacityScale(methodOrOptions) {
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
      $.error('Method ' + methodOrOptions + ' does not exist on jQuery.idcGridSquareOpacityScale');
      return true;
    });
    // If the method has no explicit response, return this to allow chaining.
    return typeof result === 'undefined' ? this : result;
  };

}());