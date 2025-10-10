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

 /**
  * Functionality to support date pickers.
  *
  * Indicia uses an HTML5 date input to support drop-down date selection.
  * Because this control uses ISO date format rather than local and because
  * Indicia also supports imprecise (vague) dates, the date picker is paired
  * with a text input that holds the actual date value sent to the database.
  * When vague dates are disabled, the text input is hidden and the date input
  * show - event handlers then keep the values in sync.
  * When vague dates are enabled, this text input is shown and the date input
  * hidden, though the user can toggle.
  */
(function ($) {
  'use strict';

  /**
   * Override $.val() to trigger change event if code used to update a date
   * input.
   */
  var originalVal = $.fn.val;
  $.fn.val = function (value) {
    var res = originalVal.apply(this, arguments);
    if (this.is('.date-text') && arguments.length >= 1) {
      this.trigger('change');
    }

    return res;
  };

  /**
   * Toggle switch handler for vague date control mode.
   */
  indiciaFns.on('change', '.date-mode-toggle', {}, function(e) {
    var rootId = e.currentTarget.id.replace(/:toggle$/, '').replace(/:/g, '\\:');
    var showVagueDates = $(e.currentTarget).prop('checked');
    if (showVagueDates) {
      $('#' + rootId).show();
      $('#' + rootId + '\\:date').hide();
      $('#' + rootId).insertBefore($('#' + rootId + '\\:date'));
    } else {
      $('#' + rootId).hide();
      $('#' + rootId + '\\:date').show();
      $('#' + rootId).insertAfter($('#' + rootId + '\\:date'));
    }
    indiciaFns.cookie('vagueDatesEnabled', showVagueDates);
  });

  /**
   * Copy changes to the date picker associated with a vague date text into the text input.
   */
  indiciaFns.on('change', '.precise-date-picker', {}, function(e) {
    var rootId = e.currentTarget.id.replace(/:date$/, '').replace(/:/g, '\\:');
    var wrap = $('#' + rootId).closest('.ctrl-wrap');
    var dateToSave = $(e.currentTarget).val();
    if (dateToSave.trim().match(/^\d{4}/)) {
      // Date given year first, so ISO format. That's how HTML5 date input
      // values are formatted.
      dateToSave = indiciaFns.formatDate(dateToSave);
    }
    $('#' + rootId)
      // Copy over value using prop to not trigger overridden val() method.
      .prop('value', dateToSave)
      // But clean up it's error state now it has a new value.
      .removeClass('ui-state-error');
    if (wrap.length) {
      $(wrap).find('.inline-error').remove();
    }
  });

  /**
   * Copy changes from the vague date text box back to the date picker.
   */
  indiciaFns.on('change', '.date-text', {}, function(e) {
    var rootId = e.currentTarget.id.replace(/:/g, '\\:');
    var dateVal = $(e.currentTarget).val();
    var parts;
    var order;
    // Convert to ISO date if necessary for date input value.
    if (dateVal.trim() !== '' && !dateVal.match(/^\d{4}-\d{2}-\d{2}$/)) {
      parts = dateVal.split(/\D+/);
      if (parts.length === 3) {
        order = indiciaData.dateFormat.split(/[^A-Za-z]+/);
        dateVal = parts[order.indexOf('Y')] + '-' + parts[order.indexOf('m')] + '-' + parts[order.indexOf('d')];
      } else {
        dateVal = '';
      }
    }
    $('#' + rootId + '\\:date').val(dateVal);
  });

}(jQuery));

jQuery(document).ready(function($) {
  var rememberVagueDatesEnabled;
  // Ensure existing data copied from text date input to HTML5 date.
  $('.date-text').trigger('change');

  // Toggle all vague dates on if
  // - one was turned on last time the page was visited,
  // - the server has requested it.
  if (typeof $.cookie !== 'undefined') {
    rememberVagueDatesEnabled = $.cookie('vagueDatesEnabled');
    if (rememberVagueDatesEnabled === 'true' || typeof indiciaData.enableVagueDateToggle !== 'undefined') {
      $('.date-mode-toggle').prop('checked', true);
      $('.date-mode-toggle').trigger('change');
    }
  }

  // Toggle individual vague dates on if current value cannot be shown precisely.
  $('.date-mode-toggle').each(function(){
    var rootId = this.id.replace(/:toggle$/, '').replace(/:/g, '\\:');
    var precise_date = $('#' + rootId + '\\:date').val();
    var vague_date = $('#' + rootId).val();
    if (precise_date === '' && vague_date !== '') {
      $(this).prop('checked', true);
      $(this).trigger('change');
    }
  });
});