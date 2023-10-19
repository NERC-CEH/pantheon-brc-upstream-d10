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

 /**
  * Functions to support species autocompletes that enable immediate addition
  * of new taxa  when the searched for taxa cannot be found.
  */
 jQuery(document).ready(function($) {
  'use strict';

  var currentInput;

  /**
   * PHP ucfirst function equivalent.
   */
  function ucfirst(str) {
    var firstChar = str.charAt(0);
    var strWithoutFirstChar = str.slice(1);
    firstChar = firstChar.toUpperCase();
    return firstChar + strWithoutFirstChar;
  }

  /**
   * Add new taxon button click handler.
   */
  indiciaFns.on('click', '.add-new-taxon', {}, function() {
    currentInput = $(this).parent().find('input:visible');
    $('#new-taxon-name').val(ucfirst(currentInput.val()));
    $('#new-taxon-group').val('');
    $('#new-taxon-form').prop('disabled', false)
    $.fancybox.open($('#new-taxon-form'));
  });

  /**
   * Popup form Save button click handler.
   *
   * Checks if a new taxon request already exists in the temporary taxa list or
   * needs to be saved.
   */
  function handleAddedTaxon() {
    if ($('#new-taxon-name').val().trim() === '' || !$('#new-taxon-group').val()) {
      alert('Please fill in all the values before proceeding.')
      return false;
    }
    $.ajax({
      dataType: 'jsonp',
      url: indiciaData.read.url + 'index.php/services/data/taxa_taxon_list',
      data: {
        taxon_list_id: indiciaData.allowTaxonAdditionToList,
        taxon: $('#new-taxon-name').val().trim(),
        taxon_group_id: $('#new-taxon-group').val().trim(),
        auth_token: indiciaData.read.auth_token,
        nonce: indiciaData.read.nonce
      },
      success: function (data) {
        if (data.length) {
          // Existing match already saved, so use that.
          saveAddedTaxonIdInForm(data[0]['id']);
        } else {
          saveAddedTaxon();
        }
        $.fancybox.close();
        $('#new-taxon-form').prop('disabled', true);
      }
    });
  }

  /**
   * Adds a new taxon to the database.
   */
  function saveAddedTaxon() {
    var taxon = {
      website_id: indiciaData.website_id,
      user_id: indiciaData.user_id,
      'taxa_taxon_list:taxon_list_id': indiciaData.allowTaxonAdditionToList,
      'taxa_taxon_list:preferred': 't',
      'taxon:taxon': $('#new-taxon-name').val().trim(),
      'taxon:taxon_group_id': $('#new-taxon-group').val().trim(),
      'taxon:language_id': indiciaData.latinLanguageId,
    };
    // Post new taxa to the warehouse.
    $.post(indiciaData.taxonAdditionPostUrl, taxon,
      function (data) {
        if (data.success) {
          saveAddedTaxonIdInForm(data.outer_id);
        }
      },
      'json'
    );
  }

  function saveAddedTaxonIdInForm(ttlId) {
    if ($(currentInput).closest('.species-grid').length > 0) {
      // Get the grid to handle the new taxon.
      handleSelectedTaxon(
        {target: currentInput[0]},
        {
          taxa_taxon_list_id: ttlId,
          searchterm:$('#new-taxon-name').val().trim(),
          highlighted: $('#new-taxon-name').val().trim(),
          taxon: $('#new-taxon-name').val().trim(),
          authority: '',
          language_iso: 'lat',
          preferred_taxon: $('#new-taxon-name').val().trim(),
          preferred_authority: '',
          default_common_name :null,
          taxon_group: $('#new-taxon-group option:selected').text(),
          preferred: 't',
          preferred_taxa_taxon_list_id: ttlId
        },
        ttlId
      );
    } else {
      // Normal single species input control.
      $('#occurrence\\:taxa_taxon_list_id').val(ttlId);
    }
    alert('Your record will be saved against the proposed taxon which will be reviewed by an expert.');
    $(currentInput).parent().find('.add-new-taxon').remove();
  }

  indiciaFns.on('click', '#do-add-new-taxon', {}, handleAddedTaxon);

  /**
   * Hook into autocomplete lookup failures.
   */
  if (!indiciaFns.hookTaxonLookupFailed) {
    indiciaFns.hookTaxonLookupFailed = [];
  }
  indiciaFns.hookTaxonLookupFailed.push(function(input) {
    if (indiciaData.allowTaxonAdditionToList) {
      if ($(input).parent().find('.add-new-taxon').length === 0) {
        $(input).after('<button type="button" class="add-new-taxon" title="Request a new taxon"><i class="fas fa-plus"></i></span>');
      }
    }
  });
});