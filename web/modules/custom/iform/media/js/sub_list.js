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
 * @link    https://github.com/indicia-team/media
 */

/**
 * Functions to support the data_entry_helper::sub_list control.
 */

(function ($) {
  'use strict';

  /**
   * Adds an item to the list of values managed by a sub_list control.
   * @param escapedId
   * @param escapedCaptionField
   * @param fieldname
   * @param itemTemplate
   */
  indiciaFns.addSublistItem = function (escapedId, escapedCaptionField, fieldname, itemTemplate) {
    var search$;
    var caption;
    var value;
    var sublist$;
    var item;
    var isSelect = $('#' + escapedId + '\\:search').is('select');
    // Transfer caption and value from search control to the displayed and hidden lists.
    // Search control might be a select or a text input with hidden value
    if (isSelect) {
      search$ = $('select#' + escapedId + '\\:search');
      caption = search$.find('option:selected').html();
      value = search$.find('option:selected').val();
    } else {
      search$ = $('#' + escapedId + '\\:search\\:' + escapedCaptionField);
      caption = search$.val().trim();
      value = $('#' + escapedId + '\\:search').val();
    }
    if (caption === '') {
      return;
    }
    if ($('[name="' + escapedId + '\\:allowTermCreationLang"]').length > 0) {
      // allowTermCreation mode, so pass text captions.
      value = 'createTerm:' + caption;
      caption = caption + '<span title="new term">*</a>';
    }
    if (value !== '' && caption !== '') {
      sublist$ = $('#' + escapedId + '\\:sublist');
      item = itemTemplate
          .replace('{caption}', caption)
          .replace('{value}', value)
          .replace('{fieldname}', fieldname);
      sublist$.append(item);
      if (isSelect) {
        search$.find('option:selected').removeAttr('selected');
      } else {
        search$.val('');
        $('#' + escapedId + '\\:search').val('');
      }
    }
  };

  /**
   * Function that can be called to initialise a sub_list control's javascript.
   * @param escapedId
   * @param escapedCaptionField
   * @param fieldname
   * @param itemTemplate
   */
  indiciaFns.initSubList = function (escapedId, escapedCaptionField, fieldname, itemTemplate) {
    var searchInput = $('#' + escapedId + '\\:search\\:' + escapedCaptionField);
    searchInput.on('keydown',
      function (e) {
        searchInput.closest('.ctrl-wrap').removeClass(indiciaData.controlWrapErrorClass);
        searchInput.removeClass('ui-state-error');
        if (e.which === 13) {
          // Enter should add the selected item, not submit the form.
          if (searchInput.val().trim() !== '') {
            e.preventDefault();
            e.stopPropagation();
            indiciaFns.addSublistItem(escapedId, escapedCaptionField, fieldname, itemTemplate);
            return false;
          }
        }
      }
    );

    $('#' + escapedId + '\\:add').on('click', function () {
      indiciaFns.addSublistItem(escapedId, escapedCaptionField, fieldname, itemTemplate);
      searchInput.focus();
    });

    searchInput.on('blur', function () {
      if ($(this).val().trim() !== '') {
        if ($('[name="' + escapedId + '\\:allowTermCreationLang"]').length > 0) {
          // Term entered has not been linked to a term in db, but we are
          // allowed to treat it as a new term.
          indiciaFns.addSublistItem(escapedId, escapedCaptionField, fieldname, itemTemplate);
        } else {
          // Term entered has not been linked to a term in db, but we cannot
          // create new terms so treat it as an error.
          searchInput.closest('.ctrl-wrap').addClass(indiciaData.controlWrapErrorClass);
          searchInput.addClass('ui-state-error');
        }
      }
    });

    indiciaFns.on('click', '#' + escapedId + '\\:sublist span.ind-delete-icon', null,
      function () {
        // remove the value from the displayed list and the hidden list
        var li$ = $(this).closest('li');
        li$.remove();
      }
    );

    $('form:has(#' + escapedId + '\\:search)').submit(
      function () {
        // select autocomplete search controls in this sub_list and disable them to prevent submitting values
        $('#' + escapedId + '\\:search, #' + escapedId + '\\:search\\:' + escapedCaptionField)
          .attr('disabled', 'disabled');
      }
    );
  };
}(jQuery));

