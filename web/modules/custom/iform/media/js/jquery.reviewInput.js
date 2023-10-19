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
 * @package Media
 * @author  Indicia Team
 * @license http://www.gnu.org/licenses/gpl.html GPL 3.0
 * @link    http://code.google.com/p/indicia/
 */

(function reviewInputPlugin($) {
  'use strict';

  jQuery.fn.reviewInput = function reviewInput(options) {
    /**
     * General purpose code to retrieve the display value from a variety of form inputs.
     * @param el Form element
     * @returns string
     */
    function getValue(el) {
      if ($(el).is(':checkbox:checked')) {
        return '&#10004';
      }
      if ($(el).is(':checkbox')) {
        return '';
      }
      if ($(el).is('select')) {
        return $(el).find('option:selected').html();
      }
      return $(el).val();
    }

    function getComplexAttrGridLabel(grid) {
      var labelParts = [];
      // make a comma separated label from the column titles
      $.each($(grid).find('thead th'), function pushLabelPart() {
        if ($(this).text()) {
          labelParts.push($(this).text());
        }
      });
      return labelParts.join(', ');
    }

    function getComplexAttrGridValue(grid) {
      var valueParts = [];
      var rowParts;
      $.each($(grid).find('tbody tr').not('.row-deleted'), function pushValuePart() {
        rowParts = [];
        $.each($(this).find(':input:visible'), function pushRowPart() {
          rowParts.push(getValue(this));
        });
        if (rowParts.join('').trim() !== '') {
          valueParts.push(rowParts.join(', '));
        }
      });
      return valueParts.join(' & ');
    }

    /**
     * Repopulate the value in the review summary when an input is changed.
     */
    function handleInputChange() {
      var grid = $(this).closest('.complex-attr-grid');
      var value;
      var el = grid.length ? grid : this;
      var row$ = $('#review-' + $(el).attr('id').replace(/:/g, '\\:'));
      if (grid.length) {
        value = getComplexAttrGridValue(grid);
      } else {
        value = getValue(this);
      }
      row$.find('td').html(value);
      if (value) {
        row$.show();
      } else {
        row$.hide();
      }
    }

    /**
     * Ensures the layout of rows in the input table and review table matchup. Especially important when footable rows
     * get in the mix.
     * @param inputTableBody
     * @param reviewTableBody
     */
    function matchupRows(inputTableBody, reviewTableBody, colspan) {
      var rowAtSamePosInReview;
      var newRow;
      $.each(inputTableBody.find('tr').not('.scClonableRow'), function matchupRow(idx) {
        if ($(this).hasClass('footable-row-detail')) {
          rowAtSamePosInReview = reviewTableBody.find('tr:nth-child(' + (idx + 1) + ')');
          // if row in output table is missing, or of the wrong type then insert it.
          if (rowAtSamePosInReview.length === 0 || !rowAtSamePosInReview.hasClass('footable-row-detail')) {
            newRow = '<tr class="footable-row-detail"><td colspan="' + colspan + '"></td></tr>';
            if (rowAtSamePosInReview.length === 0) {
              reviewTableBody.append(newRow);
            } else {
              $(rowAtSamePosInReview).before(newRow);
            }
          }
        }
      });
    }

    /**
     * Repopulate the value in the review summary when an input is changed in a species checklist grid row.
     */
    function handleGridInputChange() {
      var inputTable = $(this).closest('table');
      var row = $(this).closest('tr');
      var td = $(this).closest('td');
      var reviewTableBody = $('#review-' + inputTable.attr('id') + ' tbody');
      var outputTd;
      var outputRowIndex = row.index() + 1;
      var footableReviewHtml = '';
      matchupRows(inputTable.find('tbody'), reviewTableBody, td.attr('colspan'));
      if (td.hasClass('footable-row-detail-cell')) {
        outputTd = $(reviewTableBody).find('tr:nth-child(' + outputRowIndex + ') td');
        $.each(td.find('.footable-row-detail-row:visible'), function addTableHtml() {
          footableReviewHtml += '<div><span>' + $(this).find('.footable-row-detail-name').html() + '</span> ' +
            getValue($(this).find('.footable-row-detail-value :input')) + '</div>';
        });
        outputTd.html(footableReviewHtml);
      } else {
        outputTd = $(reviewTableBody).find('tr:nth-child(' + outputRowIndex + ') ' +
          'td[headers="review-' + td.attr('headers') + '"]');
        outputTd.html(getValue(this));
        outputTd.removeClass('warning');
      }
    }

    function updateGridRowTotals(table) {
      var reviewTable = $('#review-' + $(table).attr('id'));
      $(reviewTable).find('tfoot td').html('Total: ' + $(reviewTable).find('tbody tr').length);
    }

    /**
     * Generate a guid, used to link rows from the species checklist to the review lists.
     */
    function uid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    /**
     * Maps the information in a row of a data_entry_controls::species_checklist into the review output.
     */
    function handleSpeciesChecklistRowInReview(data, row) {
      var $table = $(row).closest('table');
      var rowUid;
      var reviewTableBody = $('#review-' + $table.attr('id') + ' tbody');
      var rowTemplate;
      var value;
      var $td;
      var existingRow = $(reviewTableBody).find('tr:nth-child(' + ($(row).index() + 1) + ')');
      var idAttr;
      var colClass;
      var input;
      if (existingRow.length) {
        // Hook called after species name edit on existing row, so just update the species cell.
        $(existingRow).find('td:first-child').html($(row).find('.scTaxonCell').html());
      } else {
        rowTemplate = '';
        $.each($table.find('thead tr:first-child th:visible')
          .not('.row-buttons,.footable-toggle-col'), function handleColumn() {
          if (this.id.match(/images-0$/)) {
            return;
          }
          $td = $(row).find('td[headers="' + this.id + '"]');
          idAttr = '';
          colClass = 'review-value-' + this.id.replace(/^species-grid-\d+-/, '').replace(/-\d+$/, '');
          if ($td.hasClass('scTaxonCell')) {
            value = $(row).find('.scTaxonCell').html();
          } else if ($td.hasClass('scAddMediaCell')) {
            value = 'photos';
          } else {
            input = $td.find(':input');
            value = getValue(input);
            idAttr = input.attr('id') ? ' id="review-' + input.attr('id') + '"' : '';
          }
          rowTemplate += '<td headers="review-' + this.id + '"' + idAttr + ' class="' + colClass + '">' +
              value + '</td>';
        });
        // Add the row and link the row back to source
        rowUid = uid();
        $(reviewTableBody).append('<tr data-guid="' + rowUid + '">' + rowTemplate + '</tr>');
        // link the rows back to source
        $(row).attr('data-guid', rowUid);
      }
      updateGridRowTotals($table);
    }

    function handleRemoveSpeciesChecklistRow(e, table) {
      var reviewTableBody = $('#review-' + $(table).attr('id') + ' tbody');
      $.each($(reviewTableBody).find('tr'), function checkRowExists() {
        // @todo Handle mark deleted rows

        if ($('.species-grid tr[data-guid="' + $(this).attr('data-guid') + '"]').length === 0) {
          $(this).remove();
        }
      });
      updateGridRowTotals(table);
    }

    $.each(this, function initReviewInput() {
      var div = this;
      var container = $(div).find('#' + this.id + '-content');
      var content = '';

      div.settings = $.extend({}, $.fn.reviewInput.defaults, options);

      // Trap new rows in species checklists so they can be reflected in output
      if (typeof window.hook_species_checklist_new_row !== 'undefined') {
        window.hook_species_checklist_new_row.push(handleSpeciesChecklistRowInReview);
      }
      if (typeof window.hook_species_checklist_delete_row !== 'undefined') {
        window.hook_species_checklist_delete_row.push(handleRemoveSpeciesChecklistRow);
      }

      // Trap changes to inputs to update the review
      indiciaFns.on('change',
        '.ctrl-wrap :input:visible:not(.ac_input), .complex-attr-grid :input:visible:not(.ac_input)',
        {},
        handleInputChange
      );
      // autocompletes don't fire when picking from the list, so use blur instead.
      indiciaFns.on('blur',
        '.ctrl-wrap input.ac_input:visible, .complex-attr-grid input.ac_input:visible',
        {}, handleInputChange
      );
      // delete a row in a complex attr grid also fires an update
      indiciaFns.on('click', '.complex-attr-grid .ind-delete-icon', {}, handleInputChange);

      // Initial population of basic inputs, skip buttons, place searches etc
      $.each($('.ctrl-wrap :input:visible, .complex-attr-grid')
        .not('button,#imp-georef-search,.scSensitivity'), function handleComplexAttrGrid() {
        var label;
        var value;
        var hide;
        if ($.inArray(this.id, div.settings.exclude) === -1 &&
            $.inArray($(this).attr('name'), div.settings.exclude) === -1) {
          if ($(this).is('.complex-attr-grid')) {
            label = getComplexAttrGridLabel(this);
            value = getComplexAttrGridValue(this);
          } else {
            label = $(this).closest('.ctrl-wrap').find('label').text()
                .replace(/:$/, '');
            value = getValue(this);
          }
          label = indiciaFns.escapeHtml(label);
          value = indiciaFns.escapeHtml(value);
          hide = value ? '' : ' style="display: none"';
          content += '<tr id="review-' + this.id + '"' + hide + '><th>' + label + '</th><td>' + value + '</td></tr>\n';
        }
      });
      $(container).append('<table><tbody>' + content + '</tbody></table>');

      // Initial setup of species checklists review table
      $.each($('table.species-grid'), function handleSpeciesGrid() {
        var head = '';
        var colCount = 0;
        $.each($(this).find('thead tr:first-child th:visible')
          .not('.row-buttons,.footable-toggle-col'), function handleGridColumn() {
          if (this.id.match(/images-0$/)) {
            return;
          }
          head += '<th id="review-' + this.id + '">' + $(this).text() + '</th>';
          colCount++;
        });
        $(container).append(
          '<table id="review-' + this.id + '">' +
          '<thead><tr>' + head + '</tr></thead>' +
          '<tbody></tbody>' +
          '<tfoot><tr><td colspan="' + colCount + '">Total: 0</td></tr></tfoot>' +
          '</table>');
        // On initial load of existing form, load up initial rows.
        $.each($(this).find('tbody tr').not('.scClonableRow'), function addRow() {
          handleSpeciesChecklistRowInReview({}, this);
        });
      });

      // Trap changes to species checklist inputs to update the review. Don't bother with the species autocomplete,
      // we'll use the new row hook to trap that
      indiciaFns.on('change', 'table.species-grid :input:visible:not(.ac_input)', {}, handleGridInputChange);

      indiciaFns.bindTabsActivate($('#controls'), function activateTab(event, ui) {
        var element = $(indiciaData.mapdiv);
        var features = [];
        if ($(div).closest('.ui-tabs-panel')[0] === ui.newPanel[0]) {
          indiciaData.origMapParent = element.parent();
          indiciaData.origMapWidth = $(indiciaData.mapdiv).css('width');
          $(indiciaData.mapdiv).css('width', '100%');
          $('#review-map-container').append(element);
          indiciaData.mapdiv.map.updateSize();
          // Remove boundaries when assessing the size of the area to show on review map, just want records
          $.each(indiciaData.mapdiv.map.editLayer.features, function() {
            if ($.inArray(this.attributes.type, ['ghost', 'boundary', 'linkedboundary']) > -1) {
              features.push(this);
            }
          });
          indiciaData.mapdiv.map.editLayer.removeFeatures(features);
          // Zoom to the extent of the records
          indiciaData.mapdiv.map.zoomToExtent(indiciaData.mapdiv.map.editLayer.getDataExtent());
          // Add the boundary features back
          indiciaData.mapdiv.map.editLayer.addFeatures(features);
        } else if (typeof indiciaData.origMapParent !== 'undefined') {
          $(indiciaData.mapdiv).css('width', indiciaData.origMapWidth);
          $(indiciaData.origMapParent).append(element);
          indiciaData.mapdiv.map.updateSize();
          delete indiciaData.origMapParent;
        }
      });
    });
    return this;
  };

  jQuery.fn.reviewInput.defaults = {
    exclude: ['sample:entered_sref_system']
  };
}(jQuery));
