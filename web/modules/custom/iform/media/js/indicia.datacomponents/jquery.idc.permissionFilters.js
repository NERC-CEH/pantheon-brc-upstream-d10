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
 * Output plugin for permission filters.
 */
(function permissionFiltersPlugin() {
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
     * Initialise the idcPermissionFilters plugin.
     *
     * @param array options
     */
    init: function init(options) {
      var el = this;
      indiciaFns.registerOutputPluginClass('idcPermissionFilters');
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

      function permissionFilterChanged() {
        var jsonFilterNotices = JSON.parse($(el).attr('data-idc-config'))['notices'];
        $(el).find('#permission-filters-notice').html('');
        Object.keys(jsonFilterNotices).forEach(function(key) {
          if ($(el).find('#es-permissions-filter option:selected').text().indexOf(key) === 0) {
            $(el).find('#permission-filters-notice').html(jsonFilterNotices[key]);
          }
        });
      }
      $(el).find('#es-permissions-filter').on('change', permissionFilterChanged);
      permissionFilterChanged();
    },

    /*
     * Populate the idcPermissionFilters.
     */
    populate: function populate() {

    }
  }

  /**
  * Extend jQuery to declare idcPermissionFilters method.
  */
  $.fn.idcPermissionFilters = function buildPermissionFilters(methodOrOptions) {
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
      $.error('Method ' + methodOrOptions + ' does not exist on jQuery.idcPermissionFilters');
      return true;
    });
    // If the method has no explicit response, return this to allow chaining.
    return typeof result === 'undefined' ? this : result;
  };

}());
