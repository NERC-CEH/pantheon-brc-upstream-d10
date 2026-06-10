
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

jQuery(document).ready(function docReady($) {
  function t(key, fallback) {
    if (indiciaData.lang && indiciaData.lang.import && typeof indiciaData.lang.import[key] !== 'undefined') {
      return indiciaData.lang.import[key];
    }
    return fallback;
  }

  function formatTemplate(template, replacements) {
    var output = template;
    $.each(replacements, function (idx, value) {
      output = output.replace(new RegExp('\\{' + (idx + 1) + '\\}', 'g'), value);
    });
    return output;
  }

  function escapeHtml(text) {
    return $('<div/>').text(text).html();
  }

  function lookupFieldLabel(fieldName) {
    var parts = fieldName.split(':');
    var label = parts[parts.length - 1];
    if (label.indexOf('fk_') === 0) {
      label = label.substring(3);
    }
    if (label.lastIndexOf('_id') === label.length - 3) {
      label = label.substring(0, label.length - 3);
    }
    label = label.replace(/[_\s]+/g, ' ');
    return label.charAt(0).toUpperCase() + label.substring(1);
  }

  function lowerFirst(text) {
    return text.charAt(0).toLowerCase() + text.substring(1);
  }

  function formatList(items) {
    if (items.length === 0) {
      return '';
    }
    if (items.length === 1) {
      return items[0];
    }
    if (items.length === 2) {
      return items[0] + ' and ' + items[1];
    }
    return items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1];
  }

  function formatListWithUnit(items, singular, plural) {
    if (items.length === 0) {
      return '';
    }
    return formatList(items) + ' ' + (items.length === 1 ? singular : plural);
  }

  function getModelNameFromLookupSelect(selectId) {
    return selectId.replace(/^lookupSelect/, '');
  }

  function getModelPluralLabel(modelName) {
    var label = modelName.replace(/_/g, ' ');
    if (label.slice(-1) === 'y') {
      label = label.slice(0, -1) + 'ies';
    } else if (label.slice(-1) !== 's') {
      label += 's';
    }
    return label.charAt(0).toUpperCase() + label.substring(1);
  }

  function getLookupFieldsForMessage(fields) {
    var labels = [];
    var i;
    var f;
    for (i = 0; i < fields.length; i++) {
      f = fields[i];
      if (typeof f.notInMappings !== 'undefined' && f.notInMappings === true) {
        continue;
      }
      if (f.fieldName === 'website_id') {
        continue;
      }
      labels.push(lowerFirst(lookupFieldLabel(f.fieldName)));
    }
    return labels;
  }

  function getSelectedLookupHelp(select) {
    var selectedVal = $(select).val();
    var fields;
    var labels;
    var extra;
    var modelPlural;
    if (!selectedVal) {
      return '';
    }
    fields = JSON.parse(selectedVal);
    labels = getLookupFieldsForMessage(fields);
    if (labels.length === 0) {
      return '';
    }
    extra = labels.slice(0, -1);
    modelPlural = getModelPluralLabel(getModelNameFromLookupSelect(select.id));
    return formatTemplate(
      t('lookup_selected_help', '{1} with the same {2} as rows in the import file will be updated.'),
      [modelPlural, formatList(labels)]
    );
  }

  indiciaFns.detectDuplicateFields = function detectDuplicateFields() {
    var valueStore = [];
    var duplicateStore = [];
    var valueStoreIndex = 0;
    var duplicateStoreIndex = 0;
    $.each($('.import-mappings-table select'), function () {
      var select = this;
      var i;
      if (valueStoreIndex === 0) {
        valueStore[valueStoreIndex] = select.value;
        valueStoreIndex++;
      } else {
        for (i = 0; i < valueStoreIndex; i++) {
          if (select.value === valueStore[i] && select.value !== '<' + indiciaData.lang.import.not_imported + '>') {
            duplicateStore[duplicateStoreIndex] = select.value;
            duplicateStoreIndex++;
          }
        }
        valueStore[valueStoreIndex] = select.value;
        valueStoreIndex++;
      }
    });
    if (duplicateStore.length === 0) {
      indiciaData.duplicateAllowsUpload = true;
      $('#duplicate-instruct').css('display', 'none');
    } else {
      indiciaData.duplicateAllowsUpload = false;
      $('#duplicate-instruct').css('display', 'inline');
    }
  };

  indiciaFns.updateRequiredFields = function updateRequiredFields() {
    var output = '';
    // copy the list of required fields
    var fields = $.extend(true, {}, required_fields);
    var sampleVagueDates = [];
    var locationReference = false;
    var fieldTokens;
    var thisValue;
    $('#required-instructions li').remove();
    // Default until we discover otherwise.
    indiciaData.requiredAllowsUpload = true;
    // Skip checking required fields if doing an existing value import.
    if ($('.lookupSelects option:selected[value!=""]').length === 0) {
      // strip out the ones we have already allocated
      $.each($('.import-mappings-table select'), function (i, select) {
        thisValue = select.value;
        // If there are several options of how to search a single lookup then they
        // are identified by a 3rd token, e.g. occurrence:fk_taxa_taxon_list:search_code.
        // These cases fulfil the needs of a required field so we can remove them.
        fieldTokens = thisValue.split(':');
        if (fieldTokens.length > 2) {
          fieldTokens.pop();
          thisValue = fieldTokens.join(':');
        }
        delete fields[thisValue];
        // special case for vague dates - if we have a complete sample vague date, then can strike out the sample:date required field
        if (select.value.substr(0, 12) === 'sample:date_') {
          sampleVagueDates.push(thisValue);
        }
        // and another special case for samples: can either include the sref or a foreign key reference to a location.
        if (select.value.substr(0, 18) === 'sample:fk_location') { // catches the code based fk as well
          locationReference = true;
        }
      });
      if (sampleVagueDates.length === 3) {
        // got a full vague date, so can remove the required date field
        delete fields['sample:date'];
      }
      if (locationReference) {
        // got a location foreign key reference, so can remove the required entered sref fields
        delete fields['sample:entered_sref'];
        delete fields['sample:entered_sref_system'];
      }
      $.each(fields, function(field, caption) {
        output += '<li>' + caption + '</li>';
        indiciaData.requiredAllowsUpload = false;
      });
    }
    $('#submit').attr('disabled', !(indiciaData.requiredAllowsUpload && indiciaData.duplicateAllowsUpload));
    $('#updating-instructions').css('display', $('.lookupSelects option:selected[value!=""]').length > 0 ? 'inline' : 'none');
    $('#required-instructions ul').html(output);
    $('#required-instructions').css('display', output === '' ? 'none' : 'inline');
  };

  // When a mapping is changed, this makes sure the options in the lookupSelects are valid for the new combination
  indiciaFns.checkLookupOptions = function checkLookupOptions() {
    var i;
    var field;
    var fields;
    var rows;
    var requiredFieldSelectedInMapping;
    var missingFields;
    var missingUnique;
    var unavailableReasons;
    var reasonHtml;
    var helpText;
    var toggle;
    if (!indiciaData.enableExistingDataLookup) {
      return;
    }
    $('.in-lookup').hide();
    $('.lookupSelects').each(function (idx, select) {
      unavailableReasons = [];
      $(select).find('option[value!=""]').each(function () {
        var option = this;
        var allFound = true;
        fields = JSON.parse($(option).val());
        missingFields = [];
        for (i = 0; i < fields.length; i++) {
          if (typeof fields[i].notInMappings === 'undefined' || fields[i].notInMappings !== true) {
            if (fields[i].fieldName.indexOf('_id') >= 0) {
              field = fields[i].fieldName.replace('_id', '');
              if (field.indexOf(':') >= 0) {
                field = field.replace(':', ':fk_');
              } else {
                field = 'fk_' + field;
              }
            } else {
              field = fields[i].fieldName;
            }
            // Keep a note of whether all the fields required by the lookup option to work have been filled in
            // e.g. for Sample External Key to work as the existing data lookup then the Sample External Key
            // must of been mapped and data such as the survey and sample method selected.
            // What fields are required is held as json in the value of the lookup option
            requiredFieldSelectedInMapping=false;
            //Cycle through each of the mappings where the user has selected a column
            $('.import-mappings-table select option:selected').each(function () {
              // Is the select mapping one of the ones that is required by one of the options
              // in the existing lookup drop-downs, if it is then note this
              if ($(this).filter(
                '[value="' + field.replace(':', '\\:') + '"],' +
                '[value^="' + field.replace(':', '\\:') + '\\:"],' +
                '[value="' + fields[i].fieldName.replace(':', '\\:') + '"]'
              ).length) {
                requiredFieldSelectedInMapping=true;
              }
            });
            if (indiciaData.presetFields.indexOf(fields[i].fieldName) >= 0
              || indiciaData.presetFields.indexOf(field) >= 0
              || requiredFieldSelectedInMapping) {
              allFound = allFound && true;
            } else {
              missingFields.push(lookupFieldLabel(fields[i].fieldName));
              allFound = false;
            }
          }
        }
        // Remove disabled from an of the existing lookup drop-downs where all the data required for that option
        // has been filled in
        if (allFound) {
          if ($(option).attr('disabled') === 'disabled' || $(option).attr('disabled')==true) {
            $(option).removeAttr('disabled');
          }
        } else {
          if ($(option).attr('disabled') !== 'disabled') {
            if ($(select).val() === $(option).val()) {
              $(select).val('');
            }
            $(option).attr('disabled', 'disabled');
          }
          missingUnique = $.grep(missingFields, function (value, index) {
            return $.inArray(value, missingFields) === index;
          });
          if (missingUnique.length > 0) {
            var allRequiredFields = getLookupFieldsForMessage(fields);
            var allRequiredValueList = formatListWithUnit(allRequiredFields, t('value_singular', 'value'), t('value_plural', 'values'));
            var missingValueList = formatListWithUnit($.map(missingUnique, function (f) {
              return lowerFirst(f);
            }), t('value_singular', 'value'), t('value_plural', 'values'));
            var missingVerb = missingUnique.length === 1
              ? t('not_available_singular', 'is not available')
              : t('not_available_plural', 'are not available');
            unavailableReasons.push(
              formatTemplate(
                t('lookup_unavailable_reason', 'Looking up {1} based on {2} requires {3} to match but {4} {5} in your import.'),
                [
                  getModelPluralLabel(getModelNameFromLookupSelect(select.id)).toLowerCase(),
                  $(option).text(),
                  allRequiredValueList,
                  missingValueList,
                  missingVerb,
                ]
              )
            );
          }
        }
      });
      helpText = getSelectedLookupHelp(select);
      $('#lookupHelp' + select.id).html(escapeHtml(helpText)).css('display', helpText === '' ? 'none' : 'block');
      reasonHtml = '';
      if (unavailableReasons.length > 0) {
        reasonHtml = '<strong>' + escapeHtml(t('unavailable_lookup_options', 'Unavailable lookup options')) + ':</strong><ul><li>';
        reasonHtml += unavailableReasons.map(function (text) {
          return escapeHtml(text);
        }).join('</li><li>');
        reasonHtml += '</li></ul>';
      }
      $('#lookupReason' + select.id).html(reasonHtml).css('display', 'none');
      toggle = $('#lookupReasonToggle' + select.id);
      if (reasonHtml === '') {
        toggle.hide();
      } else {
        toggle.show();
      }
      if ($(this).val() !== '') {
        fields = JSON.parse($(this).val());
        for (i = 0; i < fields.length; i++) {
          if (typeof fields[i].notInMappings === 'undefined' || fields[i].notInMappings !== true) {
            if (fields[i].fieldName.indexOf('_id') >= 0) {
              field = fields[i].fieldName.replace('_id', '');
              if (field.indexOf(':') >= 0) {
                field = field.replace(':', ':fk_');
              } else {
                field = 'fk_' + field;
              }
            } else field = fields[i].fieldName;
            rows = $('.import-mappings-table select option:selected')
              .filter(
                '[value="' + field.replace(':', '\\:') + '"],' +
                '[value^="' + field.replace(':', '\\:') + '\\:"],' +
                '[value="' + fields[i].fieldName.replace(':', '\\:') + '"]'
              ).closest('tr');
            rows.find('.in-lookup').show();
          }
        }
      }
    });
  };

  $('.lookup-reason-toggle').on('click', function lookupReasonToggleClick(e) {
    var targetId;
    e.preventDefault();
    targetId = this.id.replace('lookupReasonToggle', 'lookupReason');
    $('#' + targetId).toggle();
  });

  $('.lookupSelects').on('change', function lookupSelectChange() {
    indiciaFns.updateRequiredFields();
    indiciaFns.checkLookupOptions();
  });

  $('.import-mappings-table select').on('change', function mappingSelectChange() {
    indiciaFns.detectDuplicateFields();
    indiciaFns.updateRequiredFields();
    indiciaFns.checkLookupOptions();
  });
});
