jQuery(document).ready(function($) {
  "use strict";

  /**
   * Track the file processing tasks.
   *
   * Tasks include sending a file to the warehouse and extracting if zipped.
   * Can be multiple files listed.
   *
   * @var array
   */
  var fileProcessingTasks = [];

  /**
   * List of files that have been uploaded to the warehouse.
   *
   * @var array
   */
  var uploadedFiles = [];

  /**
   * Unique ID used to identify the import config file on the server.
   *
   * @var string
   */
  var configId;

  /**
   * Select file page code.
   */

  indiciaFns.on('click', '#uploaded-files .remove-file', {}, function(e) {
    $(e.currentTarget).closest('.file-cntr').remove();

  });

  /**
   * Initialise the file upload control UI.
   */
  function initFileUploadControl() {
    $(indiciaData.importerDropArea).dmUploader({
      url: indiciaData.uploadFileUrl,
      multiple: true,
      extFilter: ['csv','xls','xlsx','zip'],
      onDragEnter: function() {
        // Happens when dragging something over the DnD area
        this.addClass('active');
      },
      onDragLeave: function() {
        // Happens when dragging something OUT of the DnD area
        this.removeClass('active');
      },
      onInit: function() {
        this.find('input[type="text"]').val('');
      },
      onUploadProgress: function(id, percent) {
        // Don't show the progress bar if it goes to 100% in 1 chunk.
        if (percent !== 100) {
          // Updating file progress
          $('#file-progress').show();
        }
        $('#file-progress').val(percent);
      },
      onFileExtError() {
        $.fancyDialog({
          title: 'Upload error',
          message: indiciaData.lang.import_helper_2.invalidType,
          cancelButton: null
        });
      },
      onUploadError(id, xhr, status, errorThrown) {
        $.fancyDialog({
          title: 'Upload error',
          message: indiciaData.lang.import_helper_2.uploadFailedWithError.replace('{1}', errorThrown),
          cancelButton: null
        });
      },
      onUploadSuccess: function(id, data) {
        $('#file-progress').val(100);
        // IForm proxy code doesn't set header correctly.
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        $('<div class="file-cntr" />')
          .append($('<i class="far fa-file-alt fa-7x"></i>'))
          .append($(`<i class="far fa-trash-alt remove-file" title="${indiciaData.lang.import_helper_2.removeUploadedFileHint}"></i>`))
          .append($(`<p>${data.originalName}</p>`))
          .append($(`<input type="hidden" name="interim-file[]" value="${data.interimFile}" />`))
          .appendTo($('#uploaded-files'));
      },
      onComplete: function() {
        $('#file-upload-form input[type="submit"]').attr('disabled', $('#uploaded-files .file-cntr').length === 0);
      }
    });
  }

  /**
   * Adds a background processing progress message to the log output panel.
   *
   * @param string msg
   *   Message to log.
   */
  function logBackgroundProcessingInfo(msg) {
    $('.background-processing .panel-body').append('<p>' + msg + '</p>');
    $('.background-processing .panel-body')[0].scrollTop = $('.background-processing .panel-body')[0].scrollHeight;
  }

  /**
   * Import settings page code.
   */

  if (indiciaData.step === 'globalValuesForm') {

    /**
     * Creates the config JSON file on the server, then proceeds with next step.
     *
     * @param string fileName
     *   Import file name.
     */
    function initServerConfig() {
      let data = {
        'data-files': uploadedFiles
      };
      if (indiciaData.import_template_id) {
        data.import_template_id = indiciaData.import_template_id;
      }
      $.ajax({
        url: indiciaData.initServerConfigUrl,
        dataType: 'json',
        data: data,
      })
      .done(function(response) {
        configId = response.configId;
        // For post to the next page.
        $('#config-id').val(configId);
        transferDataToTempTable(0);
      })
      .fail(function(response) {
        const message = response.responseJSON && response.responseJSON.msg ? response.responseJSON.msg : 'Server error - import failed.';
        alert(message);
      });
    }

    /**
     * Disallow progress past import settings until required fields selected.
     *
     * E.g. for occurrence data, we need at least a survey ID to determine the
     * available attributes.
     */
    function setImportSettingsNextStepState() {
      if (
        // File upload completed.
        $('#file-progress:visible').length === 0
        // Mandatory fields on form have been filled in.
        && $('#settings-form').find('input,select')
          // Only visible required inputs.
          .filter(':visible.\\{required\\:true\\}')
          // With no data value.
          .filter(function() { return this.value == ""; })
          // If we can't find any, enable the next step button.
          .length === 0) {
        $('#next-step').attr('disabled', false);
      }
      else {
        $('#next-step').attr('disabled', true);
      }
    }

    /**
     * Ajax error handler for the file upload and processing.
     *
     * @param string msgKey
     *   Key for the message to show (from indiciaData.lang.import_helper_2)
     */
    function handleAjaxError(jqXHR, textStatus, errorThrown, msgKey) {
      let message = jqXHR.responseJSON && jqXHR.responseJSON.msg ? jqXHR.responseJSON.msg : errorThrown;
      $.fancyDialog({
        // @todo i18n
        title: indiciaData.lang.import_helper_2.uploadError,
        message: indiciaData.lang.import_helper_2[msgKey] + ':<br/>' + message,
        cancelButton: null
      });
    }

    /**
     * Send a single import file to the warehouse.
     *
     * @param int idx
     *   Index of the next file to send in the list.
     */
    function sendFileToWarehouse(idx) {
      logBackgroundProcessingInfo(indiciaData.lang.import_helper_2.uploadingFile.replace('{1}', indiciaData.processUploadedInterimFiles[idx]));
      $.ajax({
        url: indiciaData.sendFileToWarehouseUrl,
        dataType: 'json',
        data: {
          'interim-file': indiciaData.processUploadedInterimFiles[idx],
        },
        success: function(sendFileResult) {
          if (sendFileResult.status === 'ok') {
            logBackgroundProcessingInfo(indiciaData.lang.import_helper_2.uploadedFile.replace('{1}', indiciaData.processUploadedInterimFiles[idx]));
            if (!isZipFile(indiciaData.processUploadedInterimFiles[idx])) {
              uploadedFiles.push(sendFileResult.uploadedFile);
            }
            nextFileProcessingTask(sendFileResult.uploadedFile);
          }
          else {
            if (sendFileResult.msg) {
              $.fancyDialog({
                title: indiciaData.lang.import_helper_2.uploadError,
                message: sendFileResult.msg,
                cancelButton: null
              });
            }
          }
        }
      })
      .fail(
        function(jqXHR, textStatus, errorThrown) {
          handleAjaxError(jqXHR, textStatus, errorThrown, 'errorUploadingFile');
        }
      );
    }

    /**
     * Extract a single compressed import file to the warehouse.
     *
     * @param int idx
     *   Index of the next file to send in the list.
     * @param string lastFileName
     *   Name of the last uploaded file, i.e. the one to extract.
     */
    function extractFileOnWarehouse(idx, lastFileName) {
      $.ajax({
        url: indiciaData.extractFileOnWarehouseUrl,
        data: {
          'uploaded-file': lastFileName
        },
        dataType: 'json',
        success: function(extractResult) {
          if (extractResult.status === 'ok') {
            logBackgroundProcessingInfo(indiciaData.lang.import_helper_2.extractedFile.replace('{1}', indiciaData.processUploadedInterimFiles[idx]));
            uploadedFiles.push(extractResult.dataFile);
            nextFileProcessingTask();
          }
          else {
            if (extractResult.msg) {
              $.fancyDialog({
                title: indiciaData.lang.import_helper_2.uploadError,
                message: extractResult.msg,
                cancelButton: null
              });
            }
          }
        }
      })
      .fail(
        function(jqXHR, textStatus, errorThrown) {
          handleAjaxError(jqXHR, textStatus, errorThrown, 'errorExtractingZip');
        }
      );
    }

    /**
     * Start the next upload or extraction task.
     *
     * @param string lastFileName
     *   Name of the last handled file, important if the next task is to
     *   extract it.
     */
    function nextFileProcessingTask(lastFileName) {
      if (fileProcessingTasks.length > 0) {
        var task = fileProcessingTasks.shift();
        task[0](task[1], lastFileName);
      } else {
        initServerConfig();
        console.log('All done');
      }
    }

    /**
     * Check if a file name refers to a zip file.
     *
     * @param string fileName
     *   File name to check.
     *
     * @returns
     *   True if a zip file.
     */
    function isZipFile(fileName) {
      return fileName.split('.').pop().toLowerCase() === 'zip';
    }

    /**
     * Transfer a chunk of data from the uploaded file(s) into the temp table.
     *
     * @param int fileIndex
     *   Index of the file being processed.
     */
    function transferDataToTempTable(fileIndex) {
      $.ajax({
        url: indiciaData.loadChunkToTempTableUrl,
        data: {
          'data-file': uploadedFiles[fileIndex],
          'config-id': configId,
        },
        dataType: 'json'
      }).done(function(transferResult) {
        var msg = indiciaData.lang.import_helper_2[transferResult.msgKey];
        if (transferResult.progress) {
          $('#file-progress').val(transferResult.progress);
          msg += ' (' + Math.round(transferResult.progress) + '%)';
          if (transferResult.progress >= 100) {
            $('#file-progress').hide();
            $('.background-processing .panel-heading span').text(indiciaData.lang.import_helper_2.backgroundProcessingDone);
          }
        }
        if (transferResult.status === 'ok') {
          logBackgroundProcessingInfo(msg);
          if (transferResult.msgKey === 'loadingRecords') {
            transferDataToTempTable(fileIndex);
          }
          else if (fileIndex < uploadedFiles.length - 1 && transferResult.msgKey === 'nextFile') {
            transferDataToTempTable(fileIndex + 1);
          }
          else {
            setImportSettingsNextStepState();
          }
        } else {
          if (transferResult.msg) {
            $.fancyDialog({
              title: indiciaData.lang.import_helper_2.uploadError,
              message: transferResult.msg,
              cancelButton: null
            });
          }
        }
      }).fail(function(qXHR, textStatus, errorThrown) {
        $.fancyDialog({
          title: indiciaData.lang.import_helper_2.uploadError,
          message: qXHR.responseText,
          cancelButton: null
        });
      });
    }

    if (indiciaData.processUploadedInterimFiles) {
      const ext = indiciaData.processUploadedInterimFiles[0].split('.').pop().toLowerCase();
      fileProcessingTasks = [];
      indiciaData.processUploadedInterimFiles.forEach(function(file, idx) {
        if (ext !== file.split('.').pop().toLowerCase()) {
          alert(indiciaData.lang.import_helper_2.mixedFileTypesError);
          return;
        }
        fileProcessingTasks.push([sendFileToWarehouse, idx]);
        if (isZipFile(indiciaData.processUploadedInterimFiles[idx])) {
          fileProcessingTasks.push([extractFileOnWarehouse, idx]);
        }
      });
      nextFileProcessingTask();
    }

    // Required fields state change handler - disables next step button if not
    // filled in.
    $('#settings-form').find(':input.\\{required\\:true\\}').on('change', setImportSettingsNextStepState);
    setImportSettingsNextStepState();

    /**
     * Button handler to show the unrestricted version of a global values control.
     *
     * Appears if the settings list several options, plus a special option *
     * which triggers the extra unrestricted control.
     */
    $('.show-unrestricted').on('click', function() {
      const cntrRestricted = $(this).closest('.ctrl-cntr');
      const inputRestricted = $(cntrRestricted).find('select');
      const inputUnrestricted = $('.unrestricted [name="' + $(inputRestricted).attr('name') + '"]');
      const cntrUnrestricted = $(inputUnrestricted).closest('.ctrl-cntr');
      cntrRestricted.slideUp();
      inputRestricted.attr('disabled', true);
      inputUnrestricted.removeAttr('disabled');
      cntrUnrestricted.slideDown();
    });

    /**
     * Button handler to return to the restricted version of a global values control.
     */
    $('.show-restricted').on('click', function() {
      const cntrUnrestricted = $(this).closest('.ctrl-cntr');
      const inputUnrestricted = $(cntrUnrestricted).find('select');
      const inputRestricted = $('.restricted [name="' + $(inputUnrestricted).attr('name') + '"]');
      const cntrRestricted = $(inputRestricted).closest('.ctrl-cntr');
      cntrUnrestricted.slideUp();
      inputUnrestricted.attr('disabled', true);
      inputRestricted.removeAttr('disabled');
      cntrRestricted.slideDown();
    });

    // Unrestricted versions of global value controls initially disabled.
    $.each($('.ctrl-cntr.unrestricted select'), function() {
      $(this).attr('disabled', true);
      // Also set the correct name for when the value is submitted.
      $(this).attr('name', $(this).attr('name').replace(/-unrestricted$/, ''));
    });
  }

  /**
   * Map import columns page code.
   */

  /**
   * Tests if a required field key is covered by one of the global values.
   *
   * @param string
   *   Key to check.
   */
  function inGlobalValues(key) {
    // If there are several options of how to search a single lookup then they
    // are identified by a 3rd token, e.g. occurrence:fk_taxa_taxon_list:search_code.
    // These cases fulfil the needs of a required field so we can remove them.
    var fieldTokens = key.split(':');
    var found;
    var parts;
    if (fieldTokens.length > 2) {
      fieldTokens.pop();
      key = fieldTokens.join(':');
    }
    found = typeof indiciaData.globalValues[key] !== 'undefined' && indiciaData.globalValues[key] !== '';
    // Global values also works if not entity specific.
    parts = key.split(':');
    if (parts.length > 1) {
      found = found || typeof indiciaData.globalValues[parts[1]] !== 'undefined' && indiciaData.globalValues[parts[1]] !== '';
    }
    return found;
  }

  /**
   * Ensure the selected fields don't conflict.
   *
   * E.g. if importing 2 different fields that both provide a way of selecting
   * a taxon for the imported occurrence.
   *
   * @return bool
   *   True if no conflicts.
   */
  function checkConflictingFields() {
    // Collections of fields where max one of each group should be selected.
    const conflictingFieldsets = [[
      'sample:date',
      'sample:date_start'
    ], [
      'occurrence:fk_taxa_taxon_list:id',
      'occurrence:fk_taxa_taxon_list:external_key',
      'occurrence:fk_taxa_taxon_list',
      'occurrence:fk_taxa_taxon_list:search_code',
      'occurrence:fk_taxa_taxon_list:specific',
    ]];
    let failures = 0;
    conflictingFieldsets.forEach(function(fieldset) {
      let selectedFieldsCount = 0;
      let selectedFields = [];
      fieldset.forEach(function(field) {
        if ($('.mapped-field option:selected[value="' + field + '"]').length > 0) {
          selectedFieldsCount++;
          selectedFields.push($('.mapped-field option:selected[value="' + field + '"]')[0].text);
        }
      });
      if (selectedFieldsCount > 1) {
        $('#selected-field-messages').append('<p>' + indiciaData.lang.import_helper_2.fieldSelectionConflict
          .replace('{1}', '<ul>' + $.map(selectedFields, label => '<li>' + label + '</li>').join('') + '</ul></p>'));
        failures++;
      }
    });
    return failures === 0;
  }

  /**
   * Ensure groups of related fields are complete.
   *
   * E.g. date type, date start and date end are all required if one present.
   * Adds warnings to the UI if incomplete groups found.
   */
  function checkGroupsOfRelatedFields() {
    // Regexes for fields where if one mapping is present, others are required.
    const groupedFields = [
      '^occurrence:fk_taxa_taxon_list:(genus|specific)$',
      ':date_(type|start|end)$'
    ];
    let messages = [];
    // First, check if any required checkbox is for a field in a field
    // group where checking 1 means the others are also required.
    $.each(groupedFields, function() {
      let matchExpr = new RegExp(this);
      const ticked = $('.mapped-field option:selected').filter(function() {
        return this.value.match(matchExpr);
      });
      if (ticked.length > 0) {
        const shouldTick = $('.mapped-field:first option').filter(function() {
          return this.value.match(matchExpr);
        });
        if (shouldTick.length > ticked.length) {
          const tickedArr = $.map(ticked, el => [el.text]);
          const shouldTickArr = $.map(shouldTick, el => [el.text]);
          const missing = shouldTickArr.filter(value => !tickedArr.includes(value));

          messages.push('<p>' +
            indiciaData.lang.import_helper_2.incompleteFieldGroupSelected
              .replace('{1}', '<ul>' + $.map(tickedArr, label => '<li>' + label + '</li>').join('') + '</ul>') +
            indiciaData.lang.import_helper_2.incompleteFieldGroupRequired
              .replace('{1}', '<ul>' + $.map(missing, label => '<li>' + label + '</li>').join('') + '</ul>') +
          '</p>');
        }
      }
    });
    if (messages.length) {
      $('#selected-field-messages').append(messages.join('<br/>'));
    }
    return !messages.length;
  }

  /**
   * Check that required fields are mapped. Set checkbox ticked state in UI.
   */
  function checkSelectedFields() {
    $('#selected-field-messages').html('');
    let passChecks = checkGroupsOfRelatedFields();
    passChecks = checkConflictingFields() && passChecks;
    if (passChecks) {
      $('#selected-field-messages').fadeOut();
    } else {
      $('#selected-field-messages').fadeIn();
    }
    $.each($('.required-checkbox'), function() {
      var checkbox = $(this);
      var checkboxKeyList = checkbox.data('key');
      var foundInMapping = false;
      // When there is a choice of one of several, keys are separated by '|'.
      var keys = checkboxKeyList.split('|');
      $.each(keys, function() {
        // Field can be populated from global values.
        var foundInGlobalValues = inGlobalValues(this);
        // *_id global values fill in FK fields.
        if (this.match(/\bfk_/)) {
          foundInGlobalValues = foundInGlobalValues || inGlobalValues(this.replace(/\bfk_/, '') + '_id');
        }
        // No need to show required fields that are filled in by global values
        // at this point.
        if (foundInGlobalValues) {
          $(checkbox).closest('li').hide();
        }
        // Or field can be populated by a mapping. A 2 part required field
        // (table:field) can be fulfilled by a 3 part mapped field
        // (table:field:subtype), e.g.
        // occurrence:fk_taxa_taxon_list:searchcode.
        foundInMapping = foundInMapping
          || $('.mapped-field option:selected[value="' + this + '"]').length > 0
          || $('.mapped-field option:selected[value^="' + this + ':"]').length > 0;
        // Date field is a special case that can be fulfulled by date_start,
        // date_end and date_type.
        foundInMapping = foundInMapping || (this.match(/:date$/)
          && $('.mapped-field option:selected[value="' + this + '_start"]').length > 0
          && $('.mapped-field option:selected[value="' + this + '_end"]').length > 0
          && $('.mapped-field option:selected[value="' + this + '_type"]').length > 0);
      });
      if (foundInMapping) {
        $(checkbox).removeClass('fa-square');
        $(checkbox).addClass('fa-check-square');
      } else {
        $(checkbox).removeClass('fa-check-square');
        $(checkbox).addClass('fa-square');
      }
    });
    $('input[type="submit"]').attr('disabled', $('.required-checkbox.fa-square:visible').length > 0);
    // Also disable the standard/advanced selector.
    const onlyStandardFieldsSelected = $('option.advanced:selected').length === 0;
    if (onlyStandardFieldsSelected) {
      $('[name="field-type-toggle"]').removeAttr('disabled');
      $('.field-type-selector').removeClass('disabled');
    } else {
      $('[name="field-type-toggle"]').attr('disabled', true);
      $('.field-type-selector').addClass('disabled');
      $('[name="field-type-toggle"][value="advanced"]').attr('checked', true);
    }
  }

  /**
   * Click a link on the suggested column mappings auto-selects the option.
   */
  function applySuggestion(e) {
    $(e.currentTarget).closest('td').find('option[value="' + $(e.currentTarget).data('value') + '"]').prop('selected', true);
    checkSelectedFields();
  }

  /**
   * Either show just standard import fields, or also show advanced.
   *
   * Depending on mode. If advanced fields are hidden, the original HTML for the
   * columns set is stored in a data attribute so it can be reset.
   */
  function showOrHideAdvancedFields() {
    const standardFieldsMode = $('[name="field-type-toggle"]:checked').val() === 'standard';
    const onlyStandardFieldsSelected = $('option.advanced:selected').length === 0;
    if (standardFieldsMode && onlyStandardFieldsSelected) {
      let parents = $('option.advanced').parents();
      $('option.advanced').remove();
      // Also remove parent option groups if now empty.
      $.each(parents, function() {
        if ($(this).find('option').length === 0) {
          $(this).remove();
        }
      });
    } else {
      $.each($('select.mapped-field'), function() {
        if (typeof indiciaData.fullImportFieldOptionsHtml !== 'undefined') {
          let originalValue = $(this).val();
          $(this).html(indiciaData.fullImportFieldOptionsHtml );
          $(this).val(originalValue);
        }
      });
    }
  }

  /**
   * Lookup matching page code.
   */

  /**
   * Adds a table for matching lookup values for a field.
   *
   * Returns a table with a row for each unmatched value, with a control for
   * allowing the user to select what to import.
   *
   * @param object result
   *   Data returned from the warehouse with the unmatched value info.
   */
  function addFkMatchingTableToForm(result) {
    if (result.unmatchedInfo.values.length === 0) {
      // Nothing to match.
      return;
    }
    var matchingPanelBody = $('<div class="panel-body">')
      .appendTo($('<div class="panel panel-default"><div class="panel-heading">' +
        indiciaData.lang.import_helper_2.matchingPanelFor.replace('{1}', result.columnLabel) + '</div></div>')
        .appendTo($('#matching-area')));
    var matchingTable = $('<table class="table" id="matches-' + result.sourceField + '"><thead><tr>' +
      '<th>' + indiciaData.lang.import_helper_2.dataValue + '</th>' +
      '<th>' + indiciaData.lang.import_helper_2.matchesToTerm + '</th></tr></table>')
      .appendTo(matchingPanelBody);
    var tbody = $('<tbody />')
      .appendTo(matchingTable);
    var options = '<option value="">' + indiciaData.lang.import_helper_2.pleaseSelect + '</option>';
    $.each(result.unmatchedInfo.matchOptions, function(id, term) {
      options += '<option value="' + id + '">' + term + '</option>';
    });
    $.each(result.unmatchedInfo.values, function(idx) {
      var controlName;
      controlName = 'match-' + result.unmatchedInfo.attrType + '-' + result.unmatchedInfo.attrId + '-' + idx;
      $('<tr><th scope="row" data-value="' + this + '">' + this + '</th>' +
        '<td><select class="form-control" required data-value="' + this.replace('"', '&quot;') + '" name="' + controlName + '">' + options + '</select></td></tr>')
        .appendTo(tbody);
    });
    $('<p>Once you have specified the terms that you wish to use when matching values from the "' + result.columnLabel + '" column, click the button below to apply the matched taxa to the current import.</p>' +
      '<button type="button" class="btn btn-primary save-matches" ' +
      'data-source-field="' + result.sourceField + '"' +
      '>Apply matches</button>')
      .appendTo($('<div class="panel-body">').appendTo(matchingPanelBody));
  }

  /**
   * Autocomplete handler to format the taxon list in the drop-down.
   */
  function formatTaxonName(item) {
    var r;
    var nameTest;
    var synText;

    if (item.language_iso !== null && item.language_iso.toLowerCase() === 'lat') {
      r = '<em class="taxon-name">' + item.taxon + '</em>';
    } else {
      r = '<span class="taxon-name">' + item.taxon + '</span>';
    }
    // This bit optionally adds '- common' or '- latin' depending on what was being searched
    nameTest = item.preferred_taxon !== item.taxon;

    if (item.preferred === 't' && item.default_common_name !== item.taxon && item.default_common_name) {
      r += '<br/>' + item.default_common_name;
    } else if (item.preferred==='f' && nameTest && item.preferred_taxon) {
      synText = item.language_iso==='lat' ? 'syn. of' : '';
      r += '<br/>[';
      if (item.language_iso==='lat') {
        r += 'syn. of ';
      }
      r += '<em>' + item.preferred_taxon+ '</em>';
      r += ']';
    }
    r += '<br/><strong>' + item.taxon_group + '</strong>';
    if (item.taxon_rank) {
      r += ' | <span class="taxon-rank">' + item.taxon_rank + '</span>';
    }
    return r;
  }

  /**
   * Returns autocomplete settings for species searches.
   */
  function getTaxonAutocompleteSettings(filters) {
    return {
      extraParams : $.extend({
        orderby : 'searchterm',
        mode : 'json',
        qfield : 'searchterm',
        auth_token: indiciaData.read.auth_token,
        nonce: indiciaData.read.nonce,
      }, filters),
      simplify: false,
      selectMode: false,
      warnIfNoMatch: true,
      continueOnBlur: true,
      matchContains: false,
      parse: function(data) {
        var results = [];
        var done = [];
        $.each(data, function(i, item) {
          if ($.inArray(item.taxon + '#' + item.taxon_meaning_id, done)===-1) {
            results.push({
              'data' : item,
              'result' : item.searchterm,
              'value' : item.taxa_taxon_list_id
            });
            done.push(item.taxon + '#' + item.taxon_meaning_id);
          }
        });
        return results;
      },
      formatItem: formatTaxonName
    };
  }

  function getTaxonCard(info) {
    var rows = [];
    var prefix = '';
    if (info.taxon_rank_sort_order >= 300 && info.language_iso === 'lat') {
      rows.push('<div class="card-name"><em>' + info.taxon + '</em>' + (info.authority ? ' ' + info.authority : '') + '</div>');
    } else {
      rows.push('<div class="card-name">' + info.taxon + (info.authority ? ' ' + info.authority : '') + '</div>');
    }
    if (info.taxon !== info.preferred_taxon || info.authority !== info.preferred_authority) {
      if (info.language_iso === 'lat') {
        prefix = indiciaData.lang.import_helper_2.synOf + ' ';
      }
      if (info.taxon_rank_sort_order >= 300 && info.preferred_language_iso === 'lat') {
        rows.push('<div>[' + prefix + '<em>' + info.preferred_taxon + '</em>' + (info.preferred_authority ? ' ' + info.preferred_authority : '') + ']</div>');
      } else {
        rows.push('<div>[' + prefix + info.preferred_taxon + (info.preferred_authority ? ' ' + info.preferred_authority : '') + ']</div>');
      }
    }
    rows.push('<div>' + info.taxon_group + (info.taxon_rank ? ' | ' + info.taxon_rank : '') + '</div>');
    return rows.join('');
  }

  /**
   * Returns autocomplete settings for location searches.
   */
  function getLocationAutocompleteSettings(filters) {
    return {
      extraParams : $.extend({
        orderby : 'name',
        mode : 'json',
        qfield : 'name',
        auth_token: indiciaData.read.auth_token,
        nonce: indiciaData.read.nonce,
        user_id: indiciaData.user_id,
        person_site_attr_id: '1',
        view : 'detail',
        report : 'library/locations/my_sites_lookup_for_import.xml',
        reportSource : 'local'
      }, filters),
      simplify: false,
      selectMode: false,
      warnIfNoMatch: false,
      continueOnBlur: false,
      matchContains: false,
      parse: function(data) {
        var results = [];
        $.each(data, function(i, item) {
          results.push({
            'data' : item,
            'result' : item.name,
            'value' : item.id
          });
        });
        return results;
      },
      formatItem: function(item) { return item.name; }
    };
  }

  /**
   * Build a card showing details of a potential location for duplicate possibility resolution.
   */
  function getLocationCard(info) {
    let rows = [];
    const fullName = info.parent_name ? info.parent_name + ' :: ' + info.name : info.name;
    rows.push('<div class="card-name">' + fullName + '</div>');
    if (info.code) {
      rows.push('<div>' + info.code + '</div>');
    }
    rows.push('<div>' + info.centroid_sref + '</div>');
    if (info.type) {
      rows.push('<div>' + info.type + '</div>');
    }
    return rows.join('');
  }

  /**
   * Where there are species names that need matching, adds a matching table.
   */
  function addTaxonMatchingTableToForm(result) {
    var matchingPanelBody = $('<div class="panel-body">')
      .appendTo($('<div class="panel panel-default"><div class="panel-heading">' +
        indiciaData.lang.import_helper_2.matchingPanelFor.replace('{1}', result.columnLabel) + '</div></div>')
        .appendTo($('#matching-area')));
    var matchingTable = $('<table class="table" id="matches-' + result.sourceField + '"><thead><tr>' +
      '<th>' + indiciaData.lang.import_helper_2.dataValue + '</th>' +
      '<th>' + indiciaData.lang.import_helper_2.matchesToTaxon + '</th></tr></table>')
      .appendTo(matchingPanelBody);
    var tbody = $('<tbody />')
      .appendTo(matchingTable);
    var idx = 0;
    $.each(result.unmatchedInfo.values, function(taxon, choiceInfo) {
      var controlName = 'match-taxon-' + idx;
      var searchControl = '<input type="text" class="taxon-search form-control" data-index="' + idx + '" placeholder="' + indiciaData.lang.import_helper_2.typeSpeciesNameToSearch + '" />';
      var choiceCards = [];
      var choicesObj = JSON.parse(choiceInfo);
      $.each(choicesObj, function() {
        choiceCards.push('<div class="taxon-card choice-card" data-taxon="' + this.taxon + '" data-id="' + this.id + '">' + getTaxonCard(this) + '</div>');
      })
      // Hidden input for the ID.
      searchControl += '<input type="hidden" name="' + controlName + '" class="taxon-id" data-value="' + taxon.replace('"', '&quot;') + '"/>';
      $('<tr><th scope="row" data-value="' + taxon + '">' + taxon + '</th>' +
        '<td>' + searchControl + '</td></tr>')
        .appendTo(tbody);
      if (choiceCards.length > 0) {
        $('<tr class="taxon-suggestions"><td colspan="2"><p>' + indiciaData.lang.import_helper_2.severalMatches.replace('{1}', result.columnLabel) + '</p>' + choiceCards.join('') + '</td></tr>')
        .appendTo(tbody);
      }
      idx++;
    });
    // Save button
    $('<p>Once you have specified the taxa that you wish to use when matching values from the "' + result.columnLabel + '" column, click the button below to apply the matched terms to the current import.</p>' +
      '<button type="button" class="btn btn-primary save-matches" ' +
      'data-source-field="' + result.sourceField + '"' +
      '>Apply matches</button>')
      .appendTo($('<div class="panel-body">').appendTo(matchingPanelBody));
    // Enable species search autocomplete for the matching inputs.
    $('.taxon-search').autocomplete(indiciaData.warehouseUrl+'index.php/services/data/taxa_search', getTaxonAutocompleteSettings(result.unmatchedInfo.taxonFilters));
    $('.taxon-search').on('change', function() {
      // Clear when changed, unless value is correct for the current search string.
      if ($('[name="match-taxon-' + $(this).data('index') + '"]').data('set-for') !== $(this).val()) {
        $('[name="match-taxon-' + $(this).data('index') + '"]').val('');
      }
    });
    $('.taxon-search').result(function(e, data) {
      $('input[name="match-taxon-' + $(e.currentTarget).data('index') + '"]').val(data.taxa_taxon_list_id);
      // Remember the string it was set for to prevent it being cleared.
      $('input[name="match-taxon-' + $(e.currentTarget).data('index')).data('set-for', $(e.currentTarget).val());
    });
    $(matchingPanelBody).find('.taxon-card').on('click', function(e) {
      var id = $(e.currentTarget).data('id');
      var taxon = $(e.currentTarget).data('taxon');
      var tr = $(e.currentTarget).closest('tr');
      var trPrev = $(tr).prev();
      $(tr).find('.taxon-card.active').removeClass('active');
      $(e.currentTarget).addClass('active');
      $(trPrev).find('.taxon-id').val(id);
      $(trPrev).find('.taxon-search').val(taxon);
    });
  }

  /**
   * Where there are species names that need matching, adds a matching table.
   */
  function addLocationMatchingTableToForm(result) {
    var matchingPanelBody = $('<div class="panel-body">')
      .appendTo($('<div class="panel panel-default"><div class="panel-heading">' +
        indiciaData.lang.import_helper_2.matchingPanelFor.replace('{1}', result.columnLabel) + '</div></div>')
        .appendTo($('#matching-area')));
    var matchingTable = $('<table class="table" id="matches-' + result.sourceField + '"><thead><tr>' +
      '<th>' + indiciaData.lang.import_helper_2.dataValue + '</th>' +
      '<th>' + indiciaData.lang.import_helper_2.matchesToLocation + '</th></tr></table>')
      .appendTo(matchingPanelBody);
    var tbody = $('<tbody />')
      .appendTo(matchingTable);
    var idx = 0;
    $.each(result.unmatchedInfo.values, function(location, choiceInfo) {
      var controlName = 'match-location-' + idx;
      var searchControl = '<input type="text" class="location-search form-control" data-index="' + idx + '" placeholder="' + indiciaData.lang.import_helper_2.typeLocationNameToSearch + '" />';
      var choiceCards = [];
      var choicesObj = JSON.parse(choiceInfo);
      $.each(choicesObj, function() {
        choiceCards.push('<div class="location-card choice-card" data-name="' + this.name + '" data-id="' + this.id + '">' + getLocationCard(this) + '</div>');
      })
      // Hidden input for the ID.
      searchControl += '<input type="hidden" name="' + controlName + '" class="location-id" data-value="' + location.replace('"', '&quot;') + '"/>';
      $('<tr><th scope="row" data-value="' + location + '">' + location + '</th>' +
        '<td>' + searchControl + '</td></tr>')
        .appendTo(tbody);
      if (choiceCards.length > 0) {
        $('<tr class="location-suggestions"><td colspan="2"><p>' + indiciaData.lang.import_helper_2.severalMatches.replace('{1}', result.columnLabel) + '</p>' + choiceCards.join('') + '</td></tr>')
        .appendTo(tbody);
      }
      idx++;
    });
    // Save button
    $('<p>Once you have specified the locations that you wish to use when matching values from the "' + result.columnLabel + '" column, click the button below to apply the matched names to the current import.</p>' +
      '<a class="save-matches" ' +
      'data-source-field="' + result.sourceField + '"' +
      '>Apply matches</a>')
      .appendTo($('<div class="panel-body">').appendTo(matchingPanelBody));

    // Enable location search autocomplete for the matching inputs.
    $(matchingPanelBody).find('.location-search').autocomplete(indiciaData.warehouseUrl+'index.php/services/report/requestReport', getLocationAutocompleteSettings(result.unmatchedInfo.locationFilters));
    $(matchingPanelBody).find('.location-search').on('change', function() {
      // Clear when changed, unless value is correct for the current search string.
      if ($('[name="match-location-' + $(this).data('index') + '"]').data('set-for') !== $(this).val()) {
        $('[name="match-location-' + $(this).data('index') + '"]').val('');
      }
    });
    $(matchingPanelBody).find('.location-search').result(function(e, data) {
      $('input[name="match-location-' + $(e.currentTarget).data('index') + '"]').val(data.id);
      // Remember the string it was set for to prevent it being cleared.
      $('input[name="match-location-' + $(e.currentTarget).data('index')).data('set-for', $(e.currentTarget).val());
    });
    $(matchingPanelBody).find('.location-card').on('click', function(e) {
      var id = $(e.currentTarget).data('id');
      var name = $(e.currentTarget).data('name');
      var tr = $(e.currentTarget).closest('tr');
      var trPrev = $(tr).prev();
      $(tr).find('.location-card.active').removeClass('active');
      $(e.currentTarget).addClass('active');
      $(trPrev).find('.location-id').val(id);
      $(trPrev).find('.location-search').val(name);
    });
  }

  /**
   * Requests scanning through the import cols to find the next that needs matching.
   */
  function nextLookupProcessingStep() {
    $.ajax({
      url: indiciaData.processLookupMatchingUrl,
      data: {
        'config-id': indiciaData.configId,
        'index': indiciaData.processLookupIndex
      },
      dataType: 'json'
    })
    .done(function(result) {
        if (result.status==='error') {
          if (result.msg) {
            $.fancyDialog({
              title:'Matching error',
              message: result.msg,
              cancelButton: null
            });
          }
        }
        else {
          logBackgroundProcessingInfo(indiciaData.lang.import_helper_2[result.msgKey].replace('{1}', result.columnLabel));
          if (result.unmatchedInfo) {
            // Prevent next step till matching done.
            $('#next-step').attr('disabled', true);
            if (result.unmatchedInfo.type === 'customAttribute' || result.unmatchedInfo.type === 'otherFk') {
              addFkMatchingTableToForm(result);
            }
            else if (result.unmatchedInfo.type === 'taxon') {
              addTaxonMatchingTableToForm(result);
            }
            else if (result.unmatchedInfo.type === 'location') {
              addLocationMatchingTableToForm(result);
            }
          }
          if (result.colTitle) {
            logBackgroundProcessingInfo(result.colTitle);
          }
          if (result.status === 'ok' && result.msgKey !== 'findLookupFieldsDone') {
            // Move to next lookup col.
            indiciaData.processLookupIndex++;
            nextLookupProcessingStep();
          }
          else if (result.msgKey === 'findLookupFieldsDone') {
            indiciaData.findLookupFieldsDone = true;
            $('.background-processing .panel-heading span').text(indiciaData.lang.import_helper_2.backgroundProcessingDone);
            if ($('.save-matches:enabled').length === 0) {
              // Nothing to match.
              $('#next-step').attr('disabled', false);
              $('#instructions').text(indiciaData.lang.import_helper_2.lookupMatchingFormNothingToDo);
            } else {
              $('lookup-matching-form').validate();
            }
          }
        }
      }
    )
    .fail(
      function(jqXHR, textStatus, errorThrown) {
        $.fancyDialog({
          // @todo i18n
          title: 'Import error',
          message: 'An error occurred on the server whilst finding fields to metch terms for:<br/>' + errorThrown,
          cancelButton: null
        });
      }
    );
  }

  /**
   * Retrieve data about the proposed term matches for a lookup attribute.
   *
   * Retrieves the user's chosen matches for terms, species or other lookups
   * in the import file that  did not automatically match entries on the
   * warehouse, ready to save.
   *
   * @param string sourceField
   *   The name of the column in the temp DB that contains the terms being
   *   matched.
   */
  function getProposedMatchesToSave(sourceField) {
    var matches = {
      'source-field': sourceField,
      values: {}
    };
    var anythingToSave = false;
    $.each($('#matches-' + sourceField).find('select, .taxon-id, .location-id'), function() {
      var select = this;
      if ($(select).val() !== '') {
        matches.values[$(select).data('value')] = $(select).val();
        anythingToSave = true;
      }
    });
    if (!anythingToSave) {
      $.fancyDialog({
        title:'Matching',
        message: indiciaData.lang.import_helper_2.pleaseMatchValues,
        cancelButton: null
      });
      return null;
    }
    return matches;
  }

  /**
   * Handler for the button click when saving a set of value lookup matches.
   */
  indiciaFns.on('click', '.save-matches', {}, function() {
    var button = this;
    var matches;
    matches = getProposedMatchesToSave($(button).data('source-field'));
    if (!matches) {
      return;
    }
    logBackgroundProcessingInfo(indiciaData.lang.import_helper_2.savingMatchesFor.replace('{1}', $(button).data('source-field')));
    const urlSep = indiciaData.saveLookupMatchesGroupUrl.indexOf('?') === -1 ? '?' : '&';
    $.ajax({
      url: indiciaData.saveLookupMatchesGroupUrl + urlSep + 'config-id=' + encodeURIComponent(indiciaData.configId),
      dataType: 'json',
      method: 'POST',
      data: matches,
      success: function(result) {
        logBackgroundProcessingInfo(indiciaData.lang.import_helper_2.savedMatches);
        $('#matching-area tr.unmatched').removeClass('unmatched');
        if (result.status === 'ok') {
          $(button).attr('disabled', true)
            .addClass('btn-success').removeClass('btn-primary')
            .find('i')
              // Tick the box;
              .addClass('fas').removeClass('far');
        if ($('.save-matches:enabled').length === 0 && indiciaData.findLookupFieldsDone) {
            // All done
            $('#next-step').attr('disabled', false);
          }
          // Make it clear these inputs are no longer in action.
          $(button).closest('.panel').find('select,.ac_input').attr('disabled', true);
          // Remove any duplicate taxon name suggestion cards.
          $(button).closest('.panel').find('tr.taxon-suggestions').slideUp();
        }
        else if (result.status === 'incomplete') {
          $.each(result.unmatched, function() {
            var unmatchedTerm = this;
            $('#matching-area').find('th[scope="row"]')
              .filter(function() {
                return $(this).data('value') === unmatchedTerm;
              })
              .closest('tr')
              .addClass('unmatched');
          });

          $.fancyDialog({
            title:'Matching',
            message: indiciaData.lang.import_helper_2.pleaseMatchAllValues.replace('{1}', $(button).data('source-field')),
            cancelButton: null
          });
        }
      }
    });
  });

  /**
   * Preprocessing page code.
   */

  function nextPreprocessingStep() {
    $.ajax({
      url: indiciaData.preprocessUrl,
      data: {
        'config-id': indiciaData.configId,
        'index': indiciaData.preprocessIndex
      },
      dataType: 'json'
    })
    .done(function(result) {
      console.log(result);
      if (indiciaData.preprocessIndex === 0 && result.description) {
        logBackgroundProcessingInfo(result.description);
      }
      if (result.message) {
        // @todo All possible messages need to go in i18n.
        logBackgroundProcessingInfo(result.message[0].replace('{1}', result.message[1]).replace('{2}', result.message[2]));
      }
      if (result.error) {
        // Abort process.
        logBackgroundProcessingInfo(result.error);
        $.fancyDialog({
          title: 'Upload error',
          message: indiciaData.lang.import_helper_2.importCannotProceed + '<br/><ul><li>' + result.error + '</li></ul>',
          cancelButton: null
        });
        if (result.errorCount) {
          // If the result informs us there are errors in the row details,
          // show a download button to access the errors file.
          const urlSep = indiciaData.getErrorFileUrl.indexOf('?') === -1 ? '?' : '&';
          $('.fancybox-content').append(' <a class="btn btn-info fancy-dialog-button" download href="' + indiciaData.getErrorFileUrl + urlSep + 'config-id=' + encodeURIComponent(indiciaData.configId) + '">' +
            indiciaData.lang.import_helper_2.downloadPreprocessingErrorsExplanationsFile +
            '</a>');
        }
      }
      else if (result.nextStep) {
        logBackgroundProcessingInfo(result.nextDescription);
        indiciaData.preprocessIndex++;
        nextPreprocessingStep();
      }
      else {
        $('#next-step').trigger('click');
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      $.fancyDialog({
        title: indiciaData.lang.import_helper_2.preprocessingError,
        message: indiciaData.lang.import_helper_2.preprocessingErrorInfo + '<br/>' + errorThrown,
        cancelButton: null
      });
    });
  }

  /**
   * Import progress page code.
   */

  /**
   * Show a message with a link to download the errors file.
   *
   * @param string msg
   *   Message to show in the dialog.
   * @param bool includeNotImported
   *   If true, include a parameter in the download link to include records
   *   that aren't yet imported.
   */
  function showFailureMessage(msg, includeNotImported) {
    const urlSep = indiciaData.getErrorFileUrl.indexOf('?') === -1 ? '?' : '&';
    const includeNotImportedParam = includeNotImported ? '&include-not-imported=true' : '';
    const fileLink = indiciaData.getErrorFileUrl + urlSep + 'config-id=' + encodeURIComponent(indiciaData.configId) + includeNotImportedParam;
    $('#error-info').append(msg);
    $('#error-info').append('<div><a class="btn btn-info" download href="' + fileLink + '">' + indiciaData.lang.import_helper_2.downloadErrors + '</a></div>');
    $('#error-info').fadeIn();
  }

  /**
   * When an import or precheck has validation errors, warn the user.
   *
   * @param obj result
   *   Result of warehouse service call
   * @param string state
   *   Current state variable, e.g. precheck.
   */
  function showErrorInfo(result, state) {
    var msg = result.errorsCount === 1 ? indiciaData.lang.import_helper_2.errorInImportFile : indiciaData.lang.import_helper_2.errorsInImportFile;
    msg = msg.replace('{1}', result.errorsCount);
    if (state === 'precheck') {
      msg += ' ' + indiciaData.lang.import_helper_2.precheckFoundErrors;
    } else {
      msg += ' ' + indiciaData.lang.import_helper_2.importingFoundErrors;
    }
    showFailureMessage(msg);
  }

  function importNextChunk(state, forceTemplateOverwrite) {
    var postData = {};
    // Post the description and template title of the import to save on the
    // first chunk only.
    if (!indiciaData.importOneOffFieldsToSaveDone) {
      postData.description = indiciaData.importDescription;
      postData.importTemplateTitle = indiciaData.importTemplateTitle;
      postData.training = indiciaData.training;
      // If user has confirmed overwrite OK.
      if (forceTemplateOverwrite) {
        postData.forceTemplateOverwrite = true;
      }
      indiciaData.importOneOffFieldsToSaveDone = true;
    }
    if (state === 'startPrecheck') {
      postData.restart = true;
      state = 'precheck';
    }
    if (state === 'precheck') {
      postData.precheck = true;
    } else if (state === 'restart') {
      postData.restart = true;
      state = 'doimport';
    }
    const urlSep = indiciaData.importChunkUrl.indexOf('?') === -1 ? '?' : '&';
    $.ajax({
      url: indiciaData.importChunkUrl + urlSep + 'config-id=' + encodeURIComponent(indiciaData.configId),
      dataType: 'json',
      method: 'POST',
      data: postData,
    }).done(
      function(result) {
        var msg;
        if (result.status === 'error') {
          // @todo standardise this way of doing the message.
          msg = result.msgKey ? indiciaData.lang.import_helper_2[transferResult.msgKey] : result.msg;
          $.fancyDialog({
            // @todo i18n on the titles throughout
            title: 'Import error',
            message: msg,
            cancelButton: null
          });
        } else if (result.status === 'conflict') {
          $.fancyDialog({
            message: indiciaData.lang.import_helper_2.confirmTemplateOverwrite,
            okButton: indiciaData.lang.import_helper_2.overwriteTemplate,
            cancelButton: indiciaData.lang.import_helper_2.cancel,
            callbackOk: function () {
              indiciaData.importOneOffFieldsToSaveDone = false;
              // Re-trigger save with flag set to force overwrite.
              importNextChunk(state, true);
            },
            callbackCancel: function () {
              $('#import-template-title').val(indiciaData.importTemplateTitle);
              $.fancyDialog({
                contentElement: '#template-title-form',
                okButton: indiciaData.lang.import_helper_2.saveTemplate,
                cancelButton: indiciaData.lang.import_helper_2.skipSavingTemplate,
                callbackOk: function () {
                  indiciaData.importTemplateTitle = $('#import-template-title').val();
                  indiciaData.importOneOffFieldsToSaveDone = false;
                  // Re-trigger save with updated title.
                  importNextChunk(state);
                },
                callbackCancel: function () {
                  // Continue without template save.
                  importNextChunk(state);
                }
              });
            }
          });
        } else if (result.status === 'queued') {
          $('#import-queued-info').show();
        }else {
          if (result.progress) {
            $('.progress').val(result.progress);
          }

          if (state === 'precheck') {
            $('#import-details-precheck-title').show();
            $('#import-details-precheck-details')
              .text(indiciaData.lang.import_helper_2.precheckDetails
                .replace('{rowsProcessed}', result.rowsProcessed)
                .replace('{totalRows}', result.totalRows)
                .replace('{errorsCount}', result.errorsCount))
              .show();
            if (result.status !== 'done') {
              importNextChunk(state);
            }
            else {
              // Checks are complete.
              $('#import-details-precheck-done').show();
              if (result.errorsCount) {
                showErrorInfo(result, state);
                $('#import-details-import-another').show();
              }
              else {
                // Update page title to importing.
                $('#current-task').text(indiciaData.lang.import_helper_2.importingData);
                // Start again for real.
                $('.progress').val(0);
                importNextChunk('restart');
              }
            }
          } else {
            $('#import-details-importing-title').show();
            $('#import-details-importing-details')
              .text(indiciaData.lang.import_helper_2.importingDetails
                .replace('{rowsProcessed}', result.rowsProcessed)
                .replace('{totalRows}', result.totalRows)
                .replace('{errorsCount}', result.errorsCount))
              .show();
            if (result.status !== 'done') {
              importNextChunk(state);
            } else {
              // Import is complete.
              $('#import-details-importing-done').show();
              $('#import-details-import-another').show();
              // Update page title to import complete.
              $('#current-task').text(indiciaData.lang.import_helper_2.completeMessage);
              $('#file-progress').slideUp();
              if (result.errorsCount) {
                showErrorInfo(result, state);
              }
            }
          }
        }
      },
    ).fail(
      function(jqXHR, textStatus, errorThrown) {
        showFailureMessage(indiciaData.lang.import_helper_2.importingCrashInfo + '<br/>' + errorThrown, true);
      }
    );
  }

  // Trigger the functionality for the appropriate page.
  if (indiciaData.step === 'fileSelectForm') {
    initFileUploadControl();
  }
  else if (indiciaData.step === 'globalValuesForm') {
    // Prevent hidden unrestricted versions of options controls from submitting
    // a value until they are selected by the user.
    $('.unrestricted-cntr :input').removeAttr('name');
  }
  else if (indiciaData.step === 'mappingsForm') {
    // On the mappings page.
    // Prepare the list of required fields.
    $('#required-fields').show();
    $.each(indiciaData.requiredFields, function(key, caption) {
       $('#required-fields ul').append($('<li><i class="far fa-square required-checkbox" data-key="' + key + '"></i>' + caption + '</li>'));
    });
    // Auto-match any obvious column/field matches.
    $.each($('#mappings-table tbody tr'), function() {
      const row = this;
      const columnLabel = $(row).find('td:first-child').text().toLowerCase().replace(/[^a-z0-9]/g, '');
      const columnLabelExcludeBrackets = $(row).find('td:first-child').text().toLowerCase().replace(/\(.+\)/, '').replace(/[^a-z0-9]/g, '');
      // 4 categories of match in descending order of exactness.
      let matches = {
        headingPlusLabel: [],
        label: []
      };
      let suggestions = [];
      let allMatches = [];
      if (indiciaData.columns && indiciaData.columns[$(row).find('td:first-child').text()] && indiciaData.columns[$(row).find('td:first-child').text()]['warehouseField']) {
        // Mapping is already in the columns info, e.g. when loaded from a
        // template.
        $(row).find('option[value="' + indiciaData.columns[$(row).find('td:first-child').text()]['warehouseField'] + '"]').attr('selected', true);
      } else if (!indiciaData.import_template_id) {
        // Scan for matches by field name, but only if not using a template.
        $.each($(row).find('option[value!=""]'), function() {
          const option = this;
          const optGroupHeading = $(option).parent().attr('label').toLowerCase().replace(/[^a-z0-9]/g, '');
          const possibleMatches = [
            $(option).data('untranslated').toLowerCase().replace(/[^a-z0-9]/g, '')
          ];
          if ($(option).text().toLowerCase().replace(/[^a-z0-9]/g, '') !== possibleMatches[0]) {
            possibleMatches.push($(option).text().toLowerCase().replace(/[^a-z0-9]/g, ''));
          }
          possibleMatches.forEach(function(matchText) {
            const matchTextExcludesBrackets = matchText.replace(/\(.+\)/, '');
            if (columnLabel === optGroupHeading + matchText) {
              matches.headingPlusLabel.push(option);
            }
            else if (columnLabel === matchText) {
              matches.label.push(option);
            }
            else if (matchText !== matchTextExcludesBrackets && columnLabelExcludeBrackets === optGroupHeading + matchTextExcludesBrackets) {
              matches.headingPlusLabel.push(option);
            }
            else if (matchText !== matchTextExcludesBrackets && columnLabelExcludeBrackets === matchTextExcludesBrackets) {
              matches.label.push(option);
            }
          });
          if ($(option).data('alt')) {
            $.each($(option).data('alt').split(','), function() {
              // Don't consider the alt term if already checked.
              if (possibleMatches.indexOf(this) === -1) {
                if (columnLabel === this) {
                  matches.label.push(option);
                }
              }
            });
          }
        });
        if (matches.headingPlusLabel.length === 1) {
          // A single, fully qualified match can be selected.
          $(matches.headingPlusLabel[0]).attr('selected', true);
        } else if (matches.headingPlusLabel.length === 0 && matches.label.length === 1) {
          // A single match without specifying the heading can also be
          // selected.
          $(matches.label[0]).attr('selected', true);
        } else if (matches.headingPlusLabel.length + matches.label.length > 0) {
          // Any other match scenario isn't certain enough for automatic
          // selection so show suggestions.
          $.extend(allMatches, matches.headingPlusLabel, matches.label);
          $.each(allMatches, function() {
            const suggestionLabel = $(this).parent().data('short-label') + ' - ' + this.text;
            suggestions.push('<a class="apply-suggestion ' + indiciaData.templates.buttonDefaultClass + ' ' + indiciaData.templates.buttonSmallClass + '" data-value="' + this.value + '">' + suggestionLabel + '</a>');
          });
          $(row).find('select.mapped-field').after('<p class="helpText">' +  indiciaData.lang.import_helper_2.suggestions + ': ' + suggestions.join(' ') + '</p>');
        }
      }
    });
    indiciaFns.on('change', '.mapped-field', {}, checkSelectedFields);
    indiciaFns.on('click', '.apply-suggestion', {}, applySuggestion);
    checkSelectedFields();
    $('[name="field-type-toggle"]').on('change', showOrHideAdvancedFields);
    // Capture the full field option HTML so selects can be reset as required.
    indiciaData.fullImportFieldOptionsHtml = $('select.mapped-field:first').html();
    showOrHideAdvancedFields();
  } else if (indiciaData.step === 'lookupMatchingForm') {
    // If on the lookup matching page, then trigger the process.
    logBackgroundProcessingInfo(indiciaData.lang.import_helper_2.findingLookupFieldsThatNeedMatching);
    // Requesting one lookup column at a time, so track which we are asking
    // for.
    indiciaData.processLookupIndex = 0;
    indiciaData.findLookupFieldsDone = false;
    nextLookupProcessingStep();
  } else if (indiciaData.step === 'preprocessPage') {
    // If on the lookup matching page, then trigger the process.
    logBackgroundProcessingInfo(indiciaData.lang.import_helper_2.preprocessingImport);
    // Requesting one lookup column at a time, so track which we are asking
    // for.
    indiciaData.preprocessIndex = 0;
    nextPreprocessingStep();
  } else if (indiciaData.step === 'doImportPage') {
    importNextChunk('startPrecheck');
  }
  // Code for import reverser.
  // Change the button label depending if user has chosen to abort.
  // Also change the next import step to be the first step again.
  $('[name=\"reverse-mode\"').on('change', function() {
    if ($(this).val() == 'abort_reverse') {
      $('[name=\"next-import-step\"').val('fileSelectForm');
      $('#run-reverse').prop('value', indiciaData.lang.import_helper_2.abort);
    }
    else {
      $('[name=\"next-import-step\"').val('reversalResult');
      $('#run-reverse').prop('value', indiciaData.lang.import_helper_2.continue);
    };
  });
  // Don't allow reverse to be run until an import has been selected.
  $('#reverse-guid').on('change', function() {
    if ($(this).val()) {
      $('#run-reverse').prop('disabled', false);
      $('.reverse-instructions-1').show();
    }
    else {
      $('#run-reverse').prop('disabled', true);
      $('.reverse-instructions-1').hide();
    }
  });
  $('#run-reverse').on('click', function() {
    // No need to confirm if aborting, as easy to go back.
    if ($(this).val() != indiciaData.lang.import_helper_2.abort) {
      if (confirm(indiciaData.lang.import_helper_2.are_you_sure_reverse) == true) {
        return true;
      } else {
        return false;
      }
    }
  });
});