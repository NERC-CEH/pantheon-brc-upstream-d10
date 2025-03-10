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
* Output plugin for verification buttons.
*/
(function idcVerificationButtons() {
  'use strict';
  var $ = jQuery;

  /**
   * Currently selected row ID.
   */
  var occurrenceId;

  /**
   * Declare default settings.
   */
  var defaults = {
    keyboardNavigation: false
  };

  /**
   * Registered callbacks for events.
   */
  var callbacks = {
    itemUpdate: []
  };

  /**
   * jQuery validation instance.
   */
  var emailFormvalidator;

  /**
   * jQuery validation instance.
   */
  var redetFormValidator;

  /**
   * Control outputting the list of docs we are verifying - dataGrid or cardGallery.
   */
  var listOutputControl;

  /**
   * Class name for the list output control.
   */
  var listOutputControlClass;

  /**
   * Flag to prevent double click on Query button.
   */
  var doingQueryPopup = false;

  /**
   * Capture the chosen taxon when redetermining, for token replacements.
   */
  var redetToTaxon = null;

  /**
   * Track templates loaded for each status to save unnecessary hits.
   */
  var commentTemplatesLoaded = {};

  /**
   * Track count of active update requests.
   */
  var activeRequests = 0;

  /**
   * Track processed rows to remove after update requests completed.
   */
  var rowsToRemove = [];

  /**
   * Set to true when an update operation will result in the entire output list being emptied.
   */
  var listWillBeEmptied = false;

  /**
   * Is multi-select mode enabled?
   *
   * @returns bool
   *   True if multi-select mode enabled.
   */
  function multiselectMode() {
    return $(listOutputControl).hasClass('multiselect-mode');
  }

  /**
   * Is multi-select mode enabled and apply to whole table selected.
   *
   * @returns bool
   *   True if multi-select mode enabled and the apply to whole table toggle
   *   selected.
   */
  function multiselectWholeTableMode() {
    return $(listOutputControl).find('.multi-mode-table.active').length > 0;
  }

  /**
   * Fetch the "todo list" of records which need to be processed.
   *
   * @returns object
   *   Object which describes the current selection mode and records which are
   *   selected for processing.
   */
  function getTodoListInfo() {
    var selectedItems;
    let todoListInfo = {
      ids: []
    };
    if (multiselectWholeTableMode()) {
      todoListInfo.mode = 'table';
      todoListInfo.total = {
        value: $(listOutputControl)[0].settings.sourceObject.settings.total,
        relation: 'eq'
      };
    } else {
      todoListInfo.mode =  $(listOutputControl).hasClass('multiselect-mode') ? 'selection' : 'single';
      selectedItems = $(listOutputControl).hasClass('multiselect-mode')
        ? $(listOutputControl).find('.multiselect:checked').closest('tr,.card')
        : $(listOutputControl).find('.selected');
      $.each(selectedItems, function eachRow() {
        const doc = JSON.parse($(this).attr('data-doc-source'));
        todoListInfo.ids.push(parseInt(doc.id, 10));
      });
      todoListInfo.total = {
        value: todoListInfo.ids.length,
        relation: 'eq'
      };
    }
    return todoListInfo;
  }

  /**
   * Uploads a spreadsheet of verification decisions to the warehouse.
   */
  function uploadDecisionsFile() {
    var formdata = new FormData();
    var file;
    if($('#decisions-file').prop('files').length > 0) {
      $('#upload-decisions-form .upload-output').show();
      $('#upload-decisions-form .instruct').hide();
      $('#upload-decisions-file').val('').prop('disabled', true);
      file = $('#decisions-file').prop('files')[0];
      formdata.append('decisions', file);
      formdata.append('filter_id', $('.user-filter.defines-permissions').val());
      formdata.append('es_endpoint', indiciaData.esEndpoint);
      formdata.append('id_prefix', indiciaData.idPrefix);
      formdata.append('warehouse_name', indiciaData.warehouseName);
      $.ajax({
        url: indiciaData.esProxyAjaxUrl + '/verifyspreadsheet/' + indiciaData.nid,
        type: 'POST',
        data: formdata,
        processData: false,
        contentType: false,
        success: function (metadata) {
          nextSpreadsheetTask(metadata);
        },
        error: function(jqXHR) {
          var msg = indiciaData.lang.verificationButtons.uploadError;
          if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
            msg += '<br/>' + jqXHR.responseJSON.message;
          }
          $('.upload-output').removeClass('alert-info').addClass('alert-danger');
          $('.upload-output .msg').html('<p>' + msg + '</p>');
          $('.upload-output progress').hide();
        }
      });
    }
  }

  /**
   * Reset the form when a verification or redet popup first shown.
   *
   * @param string formId
   *   Form element ID.
   * @param text text
   *   Default comment text.
   */
  function resetCommentForm(formId, text) {
    $('#' + formId + ' textarea').val(text);
    $('#' + formId + ' input[type="text"]').val('');
    $('#' + formId + '.template-save-cntr').hide();
    $('#template-help-cntr').hide();
    $('#' + formId + ' .comment-edit').click();
    $('#' + formId + ' .comment-tools button').removeAttr('disabled');
    $('#' + formId + ' .form-buttons button').removeAttr('disabled');
  }

  /**
   * Display the redetermination form for a specific set of records.
   */
  function showRedetFormForOccurrenceIds(el, occurrenceIds) {
    if (el.settings.verificationTemplates) {
      loadVerificationTemplates('DT', '#redet-template');
    }
    $('#redet-form').data('ids', JSON.stringify(occurrenceIds));
    $.fancybox.open({
      src: $('#redet-form'),
      type: 'html',
      opts: {
        modal: true,
        beforeClose: function () {
          // Hide the species search dropdown if left in open state
          $('.ac_results').hide();
        }
      }
    });
  }

  /**
   * Display the redetermination form for the current record/selection.
   */
  function showRedetForm(el) {
    const todoListInfo = getTodoListInfo();
    redetToTaxon = null;
    resetCommentForm('redet-form', 'Redetermined from {{ rank }} {{ taxon full name }} to {{ new rank }} {{ new taxon full name }}.');
    if (todoListInfo.mode === 'selection' && todoListInfo.total.value === 0) {
      alert(indiciaData.lang.verificationButtons.nothingSelected);
      return;
    }
    if (todoListInfo.total.value > 1) {
      $('#redet-form .multiple-warning').show();
    } else {
      $('#redet-form .multiple-warning').hide();
    }
    showRedetFormForOccurrenceIds(el, todoListInfo.ids);
  }

  /**
   * If a template is selected, load the template into the comment.
   */
  function onSelectCommentTemplate(e) {
    const templateId = $(e.currentTarget).val();
    const data = $(e.currentTarget).data('data');
    const textarea = $(e.currentTarget).closest('.verification-popup').find('textarea');
    const deleteBtn = $(e.currentTarget).closest('.ctrl-wrap').find('.delete-template');
    if (templateId) {
      deleteBtn.removeClass('disabled');
    } else {
      deleteBtn.addClass('disabled');
    }
    $.each(data, function eachData() {
      if (this.id === templateId) {
        $(textarea).val(this.template);
      }
    });
  }

  /**
   * Always() handler for AJAX requests that update rows.
   *
   * Tracks if AJAX work completed, if so, removes the row(s) and updates the
   * pager. Ajax requests should increment activeRequests before starting.
   */
  function cleanupAfterAjaxUpdate() {
    var pagerLabel = listOutputControl.find('.showing');
    activeRequests--;
    if (activeRequests <= 0 && !listWillBeEmptied) {
      listOutputControl[0].settings.sourceObject.settings.total.value -= rowsToRemove.length;
      $.each(rowsToRemove, function() {
        $(this).remove();
      });
      indiciaFns.drawPager(
        pagerLabel,
        listOutputControl.find('[data-row-id]').length,
        listOutputControl[0].settings.sourceObject.settings
      );
    }
  }

  /**
   * Saves a redetermination that should apply to the whole table dataset.
   */
  function doRedeterminationWholeTable(newTaxaTaxonListId, comment) {
    const pgUpdates = getRedetPgUpdates(newTaxaTaxonListId, comment);
    // Since this might be slow.
    $('body').append('<div class="loading-spinner"><div>Loading...</div></div>');
    // Loop sources and apply the filter data, only 1 will apply.
    $.each($(listOutputControl)[0].settings.source, function eachSource(sourceId) {
      pgUpdates['occurrence:idsFromElasticFilter'] = indiciaFns.getFormQueryData(indiciaData.esSourceObjects[sourceId])
      return false;
    });
    $.post(
      indiciaData.esProxyAjaxUrl + '/redetall/' + indiciaData.nid,
      pgUpdates,
      function success() {
        // Unset all table mode as this is a "dangerous" state that should be explicitly chosen each time.
        $(listOutputControl).find('.multi-mode-table.active').removeClass('active');
        $(listOutputControl).find('.multi-mode-selected').addClass('active');
        // Table can be emptied.
        $(listOutputControl).find('[data-row-id]').remove();
        $(listOutputControl).find('.showing').html('No hits');
      }
    ).always(function cleanup() {
      $('body > .loading-spinner').remove();
    });
    // In all table mode, everything handled by the ES proxy so nothing else to do.
  }

  /**
   * Actually perform the task of redetermining one or more records.
   *
   * @param array occurrenceIds
   *   Array of occurrence IDs to redetermine.
   * @param int newTaxaTaxonListId
   *   Redetermine to this ID.
   * @param string comment
   *   Optional comment which can contain template tokens.
   */
  function saveRedeterminationForSelection(el, occurrenceIds, newTaxaTaxonListId, comment) {
    const pgUpdates = getRedetPgUpdates(newTaxaTaxonListId, comment);
    const esUpdates = getRedetEsUpdates(occurrenceIds);
    rowsToRemove = [];
    listWillBeEmptied = $(listOutputControl).find('[data-row-id]').length - occurrenceIds.length <= 0;
    activeRequests = 0;
    pgUpdates['occurrence:ids'] = occurrenceIds.join(',');
    rowsToRemove = disableRowsForIds(occurrenceIds);
    fireItemUpdate(el);
    if (listWillBeEmptied) {
      doRepopulateAfterVerify(occurrenceIds);
    }
    activeRequests++;
    $.post(
      indiciaData.ajaxFormPostRedet,
      pgUpdates,
      function onResponse(response) {
        if (typeof response.error !== 'undefined') {
          alert(response.error);
        }
        else if (response !== 'OK') {
          alert(indiciaData.lang.verificationButtons.redetErrorMsg);
        }
      }
    ).always(cleanupAfterAjaxUpdate);
    // Now post update to Elasticsearch. Remove the website ID to temporarily
    // disable the record until it is refreshed with the correct new taxonomy
    // info.
    activeRequests++;
    $.ajax({
      url: indiciaData.esProxyAjaxUrl + '/redetids/' + indiciaData.nid,
      type: 'post',
      data: esUpdates
    }).always(cleanupAfterAjaxUpdate);
  }

  /**
   * Submit handler for the redetermination popup form.
   */
  function redetFormSubmit(el) {
    if ($('#redet-species').val() === '') {
      redetFormValidator.showErrors({ 'redet-species:taxon': 'Please type a few characters then choose a name from the list of suggestions' });
    } else if (redetFormValidator.numberOfInvalids() === 0) {
      $.fancybox.close();
      if (multiselectWholeTableMode()) {
        doRedeterminationWholeTable($('#redet-species').val(), $('#redet-form').find('.comment-textarea').val());
      } else {
        const ids = JSON.parse($('#redet-form').data('ids'));
        saveRedeterminationForSelection(el, ids, $('#redet-species').val(), $('#redet-form').find('.comment-textarea').val());
      }
    }
  }

  /**
   * Click handler for the status buttons level toggle.
   *
   * Changes from showing just level one options to level 2 options and back.
   */
  function toggleStatusButtonLevelMode(e) {
    var div = $(e.currentTarget).closest('.idc-verificationButtons-row');
    if ($(e.currentTarget).hasClass('fa-toggle-on')) {
      $(e.currentTarget).removeClass('fa-toggle-on');
      $(e.currentTarget).addClass('fa-toggle-off');
      div.find('.l2').hide();
      div.find('.l1').show();
    } else {
      $(e.currentTarget).removeClass('fa-toggle-off');
      $(e.currentTarget).addClass('fa-toggle-on');
      div.find('.l1').hide();
      div.find('.l2').show();
    }
  }

  /**
   * Click handler for the save comment form which saves a comment.
   */
  function saveCommentPopup(e) {
    const popup = $(e.currentTarget).closest('.comment-popup');
    const ids = JSON.parse($(popup).data('ids'));
    let statusData = {};
    if ($(popup).data('status')) {
      statusData.status = $(popup).data('status');
    }
    if ($(popup).data('query')) {
      statusData.query = $(popup).data('query');
    }
    saveVerifyComment(ids, statusData, $(popup).find('textarea').val());
    $.fancybox.close();
  }

  /**
   * Update the loaded templates data object after saving a template.
   *
   * Either updates existing template details, or adds the template to the end
   * of the list.
   *
   * @param status
   *   Status code.
   * @param object templateData
   *   Object containing id, title and template for the template to add or update.
   */
  function updateTemplatesList(status, templateData) {
    let existingUpdated = false;
    $.each(commentTemplatesLoaded[mapToLevel1Status(status)], function() {
      if (this.id == templateData.id) {
        this.title = templateData.title;
        this.template = templateData.template;
        existingUpdated = true;
      }
    });
    if (!existingUpdated) {
      commentTemplatesLoaded[mapToLevel1Status(status)].push(templateData);
    }
  }

  /**
   * Save a template to the database for future use.
   */
  function saveTemplate(popupEl, data) {
    let duplicateFound = false;
    // Don't check duplicates if already selected to overwrite one.
    if (typeof data.id === 'undefined') {
      $.each(($(popupEl).find('.comment-template option')), function() {
        if (this.textContent === data.title) {
          duplicateFound = true;
          $.fancyDialog({
            title: indiciaData.lang.verificationButtons.saveTemplateError,
            message: indiciaData.lang.verificationButtons.duplicateTemplateMsg,
            okButton: indiciaData.lang.verificationButtons.overwrite,
            cancelButton: indiciaData.lang.verificationButtons.close,
            callbackOk: () => {
              data.id = $(this).val();
              saveTemplate(popupEl, data);
            }
          });
        }
      });
    }
    if (!duplicateFound) {
      $.post(
        indiciaData.ajaxFormPostVerificationTemplate,
        data,
        null,
        'json'
      ).done((response) => {
        const status = $(popupEl).data('status') || $(popupEl).data('query');
        if (typeof response.error !== 'undefined') {
          $.fancyDialog({
            title: indiciaData.lang.verificationButtons.saveTemplateError,
            message: response.error,
            cancelButton: null
          });
        } else {
          updateTemplatesList(mapToLevel1Status(status), {
            id: response.outer_id,
            title: data.title,
            template: data.template,
          });
          loadVerificationTemplates(mapToLevel1Status(status), '#' + $(popupEl).find('.comment-template').attr('id'));
          // Select it.
          $(popupEl).find('.comment-template').val(response.outer_id);
          closeSaveTemplateControl(popupEl);
        }
      }).fail((qXHR) => {
        $.fancyDialog({
          title: indiciaData.lang.verificationButtons.saveTemplateError,
          message: indiciaData.lang.verificationButtons.saveTemplateErrorMsg,
          cancelButton: null
        });
      });
    }
  }

  function deleteTemplate(popupEl, id) {
    const data = {
      website_id: indiciaData.website_id,
      id: id,
      deleted: true
    };
    $.post(
      indiciaData.ajaxFormPostVerificationTemplate,
      data,
      null,
      'json'
    ).done((response) => {
    }).fail((qXHR) => {
      $.fancyDialog({
        title: indiciaData.lang.verificationButtons.deleteTemplateError,
        message: indiciaData.lang.verificationButtons.deleteTemplateErrorMsg,
        cancelButton: null
      });
    });
  }

  /**
   * After saving a template or canceling, hide the template name and associated controls.
   */
  function closeSaveTemplateControl(popupEl) {
    $(popupEl).find('.template-save-cntr').slideUp();
    // Re-enable tool, save and cancel buttons.
    $(popupEl).find('.comment-tools button').removeAttr('disabled');
    $(popupEl).find('.form-buttons button').removeAttr('disabled');
  }

  /**
   * Register the various user interface event handlers.
   */
  function initHandlers(el) {

    /**
     * Click handler for the button which starts the upload decisions process off.
     */
    $('#upload-decisions-file').click(uploadDecisionsFile);

    /**
     * Redetermination button click handler.
     */
    $(el).find('button.redet').click(() => {
      showRedetForm(el);
    });

    /**
     * Show on the redetermination comment preview.
     */
    $('.comment-show-preview').click(function buttonClick() {
      var ctrlWrap = $(this).closest('.comment-cntr');
      var textarea = ctrlWrap.find('textarea');
      var previewBox = ctrlWrap.find('.comment-preview');
      var status = $(this).closest('.verification-popup').data('status') || $(this).closest('.verification-popup').data('query');
      previewBox.text(commentTemplateReplacements($(listOutputControl).find('.selected'), textarea.val(), status));
      // Hide whilst leaving in place to occupy space.
      textarea.css('opacity', 0);
      $(previewBox).css('top', $(textarea).position().top + 'px');
      previewBox.show();
      $('.comment-show-preview').hide();
      $('.comment-edit').show();
    });

    /**
     * Toggle off the redetermination comment preview.
     */
    $('.comment-edit').click(function buttonClick() {
      var ctrlWrap = $(this).closest('.comment-cntr');
      var textarea = ctrlWrap.find('textarea');
      var previewBox = ctrlWrap.find('.comment-preview');
      textarea.css('opacity', 100);
      previewBox.hide();
      $('.comment-edit').hide();
      $('.comment-show-preview').show();
    });

    /**
     * Save template button click handler.
     *
     * Displays the input controls for naming and saving the current comment as
     * a template.
     */
    $('.comment-save-template').click(function() {
      const popupEl = $(this).closest('.verification-popup');
      // Revert to edit mode so you can see the template you are editing.
      $(popupEl).find('.comment-edit').click();
      $(popupEl).find('.template-save-cntr input[type="text"]').val($(popupEl).find('select.comment-template').val() ? $(popupEl).find('select.comment-template option:selected').text() : '');
      $(popupEl).find('.template-save-cntr').slideDown();
      $(popupEl).find('.comment-tools button').attr('disabled', true);
      $(popupEl).find('.form-buttons button').attr('disabled', true);
    });

    /**
     * Click handler for the button which saves the template.
     */
    $('.save-template').click(function() {
      const ctrlWrap = $(this).closest('.comment-cntr');
      const popupEl = $(ctrlWrap).closest('.verification-popup');
      const status = $(popupEl).data('status') || $(popupEl).data('query');
      const templateName = $(ctrlWrap).find('[name="template-name"]').val().trim();
      const templateText = $(ctrlWrap).find('.comment-textarea').val().trim();
      const data = {
        website_id: indiciaData.website_id,
        restrict_to_website_id: 't',
        title: templateName,
        template: templateText,
        template_statuses: [mapToLevel1Status(status)],
      };
      if (!templateName || !templateText) {
        $.fancyDialog({
          title: indiciaData.lang.verificationButtons.templateNameTextRequired,
          message: indiciaData.lang.verificationButtons.pleaseSupplyATemplateNameAndText,
          cancelButton: null
        });
        return;
      }
      saveTemplate(popupEl, data);
    });

    /**
     * Click handler for the button which deletes a template.
     */
    $('.delete-template').click(function() {
      const ctrlWrap = $(this).closest('.ctrl-wrap');
      const popupEl = $(ctrlWrap).closest('.verification-popup');
      let option = $(ctrlWrap).find('select option:selected');
      if (option && $(option).val()) {
        $.fancyDialog({
          title: indiciaData.lang.verificationButtons.deleteTemplateConfirm,
          message: indiciaData.lang.verificationButtons.deleteTemplateMsg.replace('{{ title }}', $(option).text()),
          okButton: indiciaData.lang.verificationButtons.delete,
          cancelButton: indiciaData.lang.verificationButtons.cancel,
          callbackOk: () => {
            deleteTemplate(popupEl, $(option).val());
            $(ctrlWrap).find('select option[value=""]').attr('selected', true);
            $(option).remove();
          }
        });
      }
    });

    /**
     * Save template cancel button click handler.
     */
    $('.cancel-save-template').click(function() {
      const popupEl = $(this).closest('.verification-popup');
      closeSaveTemplateControl(popupEl);
    });

    /**
     * Click handler for the template help button.
     */
    $('.comment-help').click(function () {
      const popupEl = $(this).closest('.verification-popup');
      $('#template-help-cntr').appendTo(popupEl);
      $('#template-help-cntr').show();
    });

    /**
     * Click handler for the help close button.
     */
    $('.help-close').click(function() {
      $('#template-help-cntr').fadeOut();
    })

    /**
     * Result handler for the taxon redetermination autocomplete.
     *
     * Captures the taxon so it can be used in template token replacements.
     */
    $('#redet-species\\:taxon').result(function(event, data) {
      redetToTaxon = data;
    });

    /**
     * Redetermination dialog select template change handler.
     */
    $('.comment-template').change(onSelectCommentTemplate);

    /**
     * Redetermination dialog submit form handler.
     */
    $('#apply-redet').click((e) => {
      redetFormSubmit(el);
    });

    /**
     * Verification comment popup save button click handler.
     */
    indiciaFns.on('click', '.comment-popup button.save', {}, saveCommentPopup);

    /**
     * Redet, query and verification dialog cancel button click handler.
     */
    indiciaFns.on('click', 'button.cancel', {}, () => {
      $.fancybox.close();
    });

    /**
     * Status buttons level mode toggle click handler.
     */
    $(el).find('.toggle').click(toggleStatusButtonLevelMode);

    /**
     * Toggle the apply to selected|table mode buttons.
     */
    $(el).find('.apply-to button').click(function modeClick(e) {
      var div = $(e.currentTarget).closest('.idc-verificationButtons-row');
      div.find('.apply-to button').not(e.currentTarget).removeClass('active');
      $(e.currentTarget).addClass('active');
    });

    /**
     * Select all checkboxes event handler.
     */
    $(el).find('.multiselect-all').click(function selectAllClick(e) {
      const el = $(e.currentTarget).closest('.idc-control');
      const checkboxes = $(el).find('.multiselect:checkbox');
      var anyUnchecked = $(checkboxes).filter(':not(:checked)').length > 0;
      $(checkboxes).prop('checked', anyUnchecked);
    });

    indiciaFns.on('click', '.classifier-suggestion', [], (e) => {
      $('#redet-form .multiple-warning').hide();
      showRedetFormForOccurrenceIds(el, [$(e.currentTarget).data('occurrence_id')]);
      $.getJSON(indiciaData.warehouseUrl + 'index.php/services/data/taxa_search' +
        '?mode=json' +
        '&nonce=' + indiciaData.read.nonce +
        '&auth_token=' + indiciaData.read.auth_token +

        // @todo Correct the list ID? Can we get away without it?
        '&taxon_list_id=1' +

        '&taxa_taxon_list_id=' + $(e.currentTarget).data('taxa_taxon_list_id') +
        '&callback=?'
      ).done(function(data) {
        if (data.length > 0) {
          $('#redet-species').val(data[0].taxa_taxon_list_id);
          $('#redet-species\\:taxon').val(data[0].taxon);
        }
      });
    });

  }

  /**
   * Fetch the PG record updates required for a verification event.
   */
  function getVerifyPgUpdates(status, comment, email) {
    var currentDoc;
    var pgUpdates = {
      website_id: indiciaData.website_id,
      user_id: indiciaData.user_id
    };
    var commentToSave;
    if (status.status) {
      commentToSave = comment.trim() === ''
        ? indiciaData.statusMsgs[status.status]
        : comment.trim();
      $.extend(pgUpdates, {
        'occurrence:record_decision_source': 'H',
        'occurrence:record_status': status.status[0],
        'occurrence_comment:comment': commentToSave
      });
      if (status.status.length > 1) {
        pgUpdates['occurrence:record_substatus'] = status.status[1];
      }
    } else if (status.query) {
      commentToSave = comment.trim() === ''
        ? 'This record has been queried.'
        : comment.trim();
      $.extend(pgUpdates, {
        'occurrence_comment:query': 't',
        'occurrence_comment:comment': commentToSave
      });
    }
    if (email && indiciaData.workflowEnabled) {
      // This will only be the case when querying a single record. If the
      // species requires fully logged comms, add the email body to the
      // comment.
      currentDoc = JSON.parse($(listOutputControl).find('.selected').attr('data-doc-source'));
      if (indiciaData.workflowTaxonMeaningIDsLogAllComms.indexOf(currentDoc.taxon.taxon_meaning_id) !== -1) {
        pgUpdates['occurrence_comment:correspondence_data'] = JSON.stringify({
          email: [{
            from: indiciaData.siteEmail,
            to: email.to,
            subject: email.subject,
            body: email.body
          }]
        });
      }
    }
    return pgUpdates;
  }

  /**
   * Fetch the ES document updates required for a verification event.
   */
  function getVerifyEsUpdates(status) {
    var esUpdates = {
      identification: {}
    };
    if (status.status) {
      esUpdates.identification.verification_status = status.status[0];
      if (status.status.length > 1) {
        esUpdates.identification.verification_substatus = status.status[1];
      }
    } else if (status.query) {
      esUpdates.identification.query = status.query;
    }
    return esUpdates;
  }

  /**
   * Fetch the PostgreSQL occurrence updates required for a redetermination event.
   */
  function getRedetPgUpdates(newTaxaTaxonListId, comment) {
    let pgUpdates = {
      website_id: indiciaData.website_id,
      'occurrence:taxa_taxon_list_id': newTaxaTaxonListId,
      user_id: indiciaData.user_id,
    };
    // Note, template replacements will be done server side.
    pgUpdates['occurrence_comment:comment'] = comment ? comment : indiciaData.lang.verificationButtons.recordRedetermined;
    if ($('#no-update-determiner') && $('#no-update-determiner').prop('checked')) {
      // Determiner_id=-1 is special value that keeps the original
      // determiner info.
      pgUpdates['occurrence:determiner_id'] = -1;
    }
    return pgUpdates;
  }

  /**
   * Fetch the ES document updates required for a redetermination event.
   */
  function getRedetEsUpdates(occurrenceIds) {
    // This just wipes the website ID, disabling the record until Logstash
    // updates it properly.
    return {
      ids: occurrenceIds,
      doc: {
        metadata: {
          website: {
            id: 0
          }
        }
      }
    };
  }

  /**
   * Disables the rows for a selection of IDs to indicate they are being processed.
   *
   * @param array occurrenceIds
   *   Integer array of IDs.
   *
   * @return array
   *   Array of elements that were disabled.
   */
  function disableRowsForIds(occurrenceIds) {
    var rows = [];
    $.each(occurrenceIds, function() {
      // Find row using normal or sensitive version of data-row-id.
      var thisRow = $(listOutputControl).find('[data-row-id="' + indiciaData.idPrefix + this + '"],[data-row-id="' + indiciaData.idPrefix + this + '!"]');
      thisRow
        .addClass('disabled processing')
        .find('.footable-toggle-col').append('<i class="fas fa-spinner fa-spin"></i>');
      // Remember for later.
      rows.push(thisRow);
    });
    return rows;
  }

  /**
   * Disable all rows of same taxon in the parent sample.
   *
   * After a verification event where the apply to records of same taxon in
   * parent sample button is active, ensure that the disabled rows (which
   * eventually get removed from the grid) include all the records which are
   * being verified. We can work this out by scanning the docs loaded for each
   * row in the grid.
   *
   * @param int occurrenceId
   *   The selected occurrence that is being verified.
   *
   * @return array
   *   The list of rows being verified.
   */
  function disableRowForAllSameTaxonInParentSample(occurrenceId) {
    const selectedRow = $(listOutputControl).find('[data-row-id="' + indiciaData.idPrefix + occurrenceId + '"],[data-row-id="' + indiciaData.idPrefix + occurrenceId + '!"]');
    const selectedDoc = JSON.parse($(selectedRow).attr('data-doc-source'));
    if (selectedDoc.event.parent_event_id) {
      // Record in a parent sample, so find other rows in the same parent, with
      // the same taxon, that aren't verified.
      let rows = [];
      $.each($('.data-row'), function() {
        const thisRow = this;
        const doc = JSON.parse($(thisRow).attr('data-doc-source'));
        if (doc.event.parent_event_id === selectedDoc.event.parent_event_id
            && doc.taxon.accepted_taxon_id === selectedDoc.taxon.accepted_taxon_id
            && (doc.taxon.id === selectedDoc.taxon.id || (doc.identification.verification_status === 'C' && doc.identification.verification_substatus === '0'))
            ) {
          $(thisRow)
              .addClass('disabled processing')
              .find('.footable-toggle-col').append('<i class="fas fa-spinner fa-spin"></i>');
          rows.push(thisRow);
        }
      });
      return rows;
    } else {
      // Record not in a parent sample, so just use current row.
      return [selectedRow];
    }
  }

  /**
   * List output control will be empty after verification so re-populate.
   *
   * @param array occurrenceIds
   *   List of IDs being verified. Ensures that these don't reappear.
   */
  function doRepopulateAfterVerify(occurrenceIds) {
    var sourceSettings = $(listOutputControl)[0].settings.sourceObject.settings;
    var docIds = [];

    // Build list of verified IDs to exclude from the new view.
    $.each(occurrenceIds, function() {
      docIds.push(indiciaData.idPrefix + this);
      // Also exclude sensitive version.
      docIds.push(indiciaData.idPrefix + this + '!');
    });
    // As ES updates are not instant, we need a temporary must_not match
    // filter to prevent the verified records reappearing.
    if (!sourceSettings.filterBoolClauses) {
      sourceSettings.filterBoolClauses = {};
    }
    if (!sourceSettings.filterBoolClauses.must_not) {
      sourceSettings.filterBoolClauses.must_not = [];
    }
    sourceSettings.filterBoolClauses.must_not.push({
      query_type: 'terms',
      field: '_id',
      value: JSON.stringify(docIds)
    });
    // Reload the page.
    $(listOutputControl)[0].settings.sourceObject.populate(true);
    // Clean up the temporary exclusion filter.
    sourceSettings.filterBoolClauses.must_not.pop();
    if (!sourceSettings.filterBoolClauses.must_not.length) {
      delete sourceSettings.filterBoolClauses.must_not;
    }
  }

  /**
   * Fire item update callbacks after a verification change.
   */
  function fireItemUpdate(el) {
    $.each(el.callbacks.itemUpdate, function() {
      this($(listOutputControl).find('.selected'));
    });
  }

  /**
   * Saves a verification comment that should apply to the whole table dataset.
   */
  function saveVerifyCommentForWholeTable(status, comment, email) {
    var pgUpdates = getVerifyPgUpdates(status, comment, email);
    if (!status.status) {
      throw new Exception('saveVerifyCommentForWholeTable only works for verification status changes');
    }
    // Since this might be slow.
    $('body').append('<div class="loading-spinner"><div>Loading...</div></div>');
    // Loop sources and apply the filter data, only 1 will apply.
    $.each($(listOutputControl)[0].settings.source, function eachSource(sourceId) {
      $.extend(pgUpdates, {
        'occurrence:idsFromElasticFilter': indiciaFns.getFormQueryData(indiciaData.esSourceObjects[sourceId])
      });
      return false;
    });
    $.post(
      indiciaData.esProxyAjaxUrl + '/verifyall/' + indiciaData.nid,
      pgUpdates,
      function success() {
        // Unset all table mode as this is a "dangerous" state that should be explicitly chosen each time.
        $(listOutputControl).find('.multi-mode-table.active').removeClass('active');
        $(listOutputControl).find('.multi-mode-selected').addClass('active');
        // Table can be emptied.
        $(listOutputControl).find('[data-row-id]').remove();
        $(listOutputControl).find('.showing').html('No hits');
      }
    ).always(function cleanup() {
      $('body > .loading-spinner').remove();
    });
    // In all table mode, everything handled by the ES proxy so nothing else to do.
  }

  /**
   * Saves a verification comment for a selection of occurrences.
   *
   * Might be the verification of a single occurrence or list of occurrences.
   */
  function saveVerifyCommentForSelection(occurrenceIds, status, comment, email) {
    var pgUpdates = getVerifyPgUpdates(status, comment, email);
    var esUpdates = getVerifyEsUpdates(status);
    var data;
    const applyDecisionToParentSample = status.status && occurrenceIds.length === 1 && $('.apply-to-parent-sample-contents:enabled').hasClass('active');
    rowsToRemove = [];
    activeRequests = 0;
    listWillBeEmptied = $(listOutputControl).find('[data-row-id]').length - occurrenceIds.length <= 0;
    pgUpdates['occurrence:ids'] = occurrenceIds.join(',');
    // Disable rows that are being processed.
    rowsToRemove = applyDecisionToParentSample ? disableRowForAllSameTaxonInParentSample(occurrenceIds[0]) : disableRowsForIds(occurrenceIds);
    $.each($('.idc-verificationButtons'), function() {
      fireItemUpdate(this);
    });
    // @todo should repopulateAfterVerify be handled inside the list output control?
    if (listWillBeEmptied) {
      doRepopulateAfterVerify(occurrenceIds);
    }
    if (status.status) {
      // In single record mode, can request to also apply the decision to other
      // records of the same taxon within a transect or timed count.
      if (applyDecisionToParentSample) {
        pgUpdates['applyDecisionToParentSample'] = true;
      }
      // Post update to Indicia.
      activeRequests++;
      $.post(
        indiciaData.ajaxFormPostVerify,
        pgUpdates,
        function success(response) {
          if (response !== 'OK') {
            alert('Indicia records update failed');
          }
        }
      ).always(cleanupAfterAjaxUpdate);
    } else if (status.query) {
      const unprocessedComment = pgUpdates['occurrence_comment:comment'];
      // No bulk API for query updates at the moment, so process one at a time.
      $.each(occurrenceIds, function eachOccurrence() {
        var item = $(listOutputControl).find('[data-row-id="' + indiciaData.idPrefix + this + '"],[data-row-id="' + indiciaData.idPrefix + this + '!"]');
        pgUpdates['occurrence_comment:occurrence_id'] = this;
        // Using the standard data services API so comment template applied on
        // client.
        pgUpdates['occurrence_comment:comment'] = commentTemplateReplacements(item, unprocessedComment, 'Q');
        // Post update to Indicia.
        activeRequests++;
        $.post(
          indiciaData.ajaxFormPostComment,
          pgUpdates
        ).always(cleanupAfterAjaxUpdate);
      });
    }
    // Now post update to Elasticsearch.
    data = {
      ids: occurrenceIds,
      doc: esUpdates
    };
    activeRequests++;
    $.ajax({
      url: indiciaData.esProxyAjaxUrl + '/verifyids/' + indiciaData.nid,
      type: 'post',
      data: data,
      success: function success(response) {
        if (typeof response.error !== 'undefined' || (response.code && response.code !== 200)) {
          alert(indiciaData.lang.verificationButtons.elasticsearchUpdateError);
        } else {
          // Check updated count is as expected.
          if (response.updated < occurrenceIds.length) {
            alert(indiciaData.lang.verificationButtons.elasticsearchUpdateError);
          }
        }
      },
      error: function error() {
        alert(indiciaData.lang.verificationButtons.elasticsearchUpdateError);
      },
      dataType: 'json'
    }).always(cleanupAfterAjaxUpdate);
  }

  /**
   * Instigates a verification event.
   */
  function saveVerifyComment(occurrenceIds, status, comment, email) {
    resetCommentForm('verification-form', '');
    if (multiselectWholeTableMode()) {
      // Verifying the whole table.
      saveVerifyCommentForWholeTable(status, comment, email);
    }
    else {
      // Verifying a single record or selection.
      saveVerifyCommentForSelection(occurrenceIds, status, comment, email);
    }
  }

  /**
   * Simplifies a status code to V or R for accept/reject.
   *
   * Other statuses returned as is, with C3 for plausible.
   *
   * @param string status
   *   Status code.
   *
   * @return string
   *   Simplified code.
   */
  function mapToLevel1Status(status) {
    if (status[0] === 'V') {
      return 'V';
    }
    if (status[0] === 'R') {
      return 'R';
    }
    return status;
  }

  /**
   * Displays a popup dialog for capturing a verification or query comment.
   */
  function commentPopup(el, status, commentInstruction) {
    var heading;
    var overallStatus = status.status ? status.status : status.query;
    var todoListInfo;
    var totalAsText;
    var doc;
    var request;
    // Form reset.
    if (!el.settings.lastCommentStatus || (el.settings.lastCommentStatus !== overallStatus)) {
      resetCommentForm('verification-form', '');
      el.settings.lastCommentStatus = overallStatus;
    }
    if (el.settings.verificationTemplates) {
      loadVerificationTemplates(mapToLevel1Status(status.status ? status.status : status.query), '#verify-template');
    }
    todoListInfo = getTodoListInfo();
    if (todoListInfo.mode === 'selection' && todoListInfo.total.value === 0) {
      alert(indiciaData.lang.verificationButtons.nothingSelected);
      return;
    }
    if (todoListInfo.total.value > 1) {
      totalAsText = (todoListInfo.total.relation === 'gte' ? 'at least ' : '') + todoListInfo.total.value;
      heading = status.status
        ? 'Set status to <span class="status">' + indiciaData.statusMsgs[overallStatus].toLowerCase() + '</span> for ' + totalAsText + ' records'
        : 'Query ' + totalAsText + ' records';
      $('#verification-form .multiple-warning').show();
      $('#verification-form .multiple-in-parent-sample-warning').hide();
    } else {
      heading = status.status
        ? 'Set status to <span class="status">' + indiciaData.statusMsgs[overallStatus].toLowerCase() + '</span>'
        : 'Query this record';
      $('#verification-form .multiple-warning').hide();
      if ($(el).find('.apply-to-parent-sample-contents:enabled').hasClass('active')) {
        // Accept all of this taxon in same parent sample is enabled, so warn.
        // We need a count of affected records for the warning.
        doc = JSON.parse($(listOutputControl).find('.selected').attr('data-doc-source'));
        request = indiciaData.warehouseUrl + 'index.php/services/report/requestReport' +
          '?mode=json' +
          '&nonce=' + indiciaData.read.nonce +
          '&auth_token=' + indiciaData.read.auth_token +
          '&report=reports_for_prebuilt_forms/elasticsearch_verification/count_occurrences_in_parent_sample.xml' +
          '&parent_sample_id=' + doc.event.parent_event_id +
          '&wantRecords=0&wantCount=1' +
          '&reportSource=local&callback=?';
        $.getJSON(request).done(function(data) {
          $('#verification-form .multiple-in-parent-sample-warning')
            .html('<i class="fas fa-exclamation-triangle"></i> ' + indiciaData.lang.verificationButtons.updatingMultipleInParentSampleWarning.replace('{1}', data.count))
            .show();
        });
      } else {
        $('#verification-form .multiple-in-parent-sample-warning').hide();
      }
    }
    $('#verification-form').data('ids', JSON.stringify(todoListInfo.ids));
    status.status ? $('#verification-form').data('status', status.status) : $('#verification-form').removeData('status');
    status.query ? $('#verification-form').data('query', status.query) : $('#verification-form').removeData('query');
    $('#verification-form legend span:first-child')
      .removeClass()
      .addClass(indiciaData.statusClasses[overallStatus])
      .addClass('fa-2x');
    $('#verification-form legend span:last-child').text('').append(heading);

    if (commentInstruction) {
      $('#verification-form p.alert-info')
        .text(commentInstruction)
        .show();
    } else {
      $('#verification-form p.alert-info').hide();
    }
    $.fancybox.open({
      src: $('#verification-form'),
      type: 'html',
      opts: {
        modal: true
      }
    });
    $('#verification-form textarea').focus();
  }

  /**
   * Token replacements.
   *
   * Replaces tokens in text (e.g. {{ event.verbatim_location }}) with the
   * contents from fields in an ES document.
   */
  function replaceDocFields(text, doc) {
    var r = text;
    var matches = text.match(/\{\{ ([a-z\._]+) }}/g);
    if (matches) {
      $.each(matches, function() {
        var field = this.replace(/^\{\{ /, '').replace(/ }}$/, '');
        r = r.replace(this, indiciaFns.getValueForField(doc, field));
      });
    }
    return r;
  }

  /**
   * Retrieves key data to include in a record summary in an email.
   */
  function getRecordDataForEmail(doc) {
    var r = [];
    var fields = {
      id: 'ID',
      'taxon.taxon_name': 'Species',
      'event.date_start': 'Date',
      'location.output_sref': 'Grid ref.',
      'location.verbatim_locality': 'Location'
    };
    $.each(fields, function eachField(field, caption) {
      var value = indiciaFns.getValueForField(doc, field);
      if (value) {
        r.push(caption + ': ' + value);
      }
    });
    r.push('{{ photos }}');
    r.push('{{ comments }}');
    r.push('* {{ emailReplyOption }}');
    r.push('* {{ commentReplyOption }}');
    return r.join('\n');
  }

  /**
   * Gets the email address associated with the current record.
   *
   * A callback is used as this may need an AJAX request.
   */
  function getCurrentRecordEmail(doc, callback) {
    if (indiciaData.thisRecordEmail) {
      // indiciaData.thisRecordEmail is filled in by the record details pane.
      callback(indiciaData.thisRecordEmail);
    } else if (indiciaData.thisRecordEmail === null) {
      // If null, then the record details haven't been loaded. Need to load them.
      $.ajax({
        url: indiciaData.esProxyAjaxUrl + '/attrs/' + indiciaData.nid,
        data: { occurrence_id: doc.id },
        success: function success(response) {
          let email = '';
          $.each(response, function eachHeading(title, attrs) {
            if (title === 'Recorder attributes') {
              $.each(attrs, function eachAttr() {
                if (this.caption.toLowerCase() === 'email') {
                  email = this.value;
                  // Stop looking through attributes.
                  return false;
                }
                return true;
              });
              // Stop looking through headings.
              return false;
            }
            return true;
          });
          callback(email);
        }
      });
    } else {
      // indiciaData.thisRecordEmail=false implies record attrs loaded but no
      // email address available.
      callback('');
    }
  }

  /**
   * Add the HTML inputs for an expert email to a form.
   */
  function appendRecordEmailExpertControls(form, emailTo, emailSubject, emailBody, recordData) {
    $('<div class="form-group">' +
        '<label for="email-to-expert">Send email to:</label>' +
        '<input id="email-to-expert" class="form-control email required" placeholder="' + indiciaData.lang.verificationButtons.enterEmailAddress + '" value="' + emailTo + '" />' +
      '</div>').appendTo(form);
    $('<div class="form-group">' +
        '<label for="email-subject-expert">Email subject:</label>' +
        '<input id="email-subject-expert" class="form-control subject required" value="' + emailSubject + '" />' +
      '</div>').appendTo(form);
    $('<div class="form-group">' +
        '<label for="email-body-expert">Email body:</label>' +
        '<textarea id="email-body-expert" class="form-control required" rows="12">' + emailBody + '\n\n' + recordData + '</textarea>' +
      '</div>').appendTo(form);
    $('<button type="submit" class="' + indiciaData.templates.buttonHighlightedClass + '">Send email</button>&nbsp;').appendTo(form);
    $('<button type="button" class="' + indiciaData.templates.buttonDefaultClass + ' cancel">' + indiciaData.lang.verificationButtons.cancel + '</button>').appendTo(form);
  }

  function tabbedQueryPopup(doc, commentFirst, commentInstruct, emailInstruct, emailTo) {
    const emailSubject = replaceDocFields(indiciaData.lang.verificationButtons.emailQuerySubject, doc);
    const emailBody = replaceDocFields(indiciaData.lang.verificationButtons.emailQueryBodyHeader, doc);
    const recordData = getRecordDataForEmail(doc);
    if (commentFirst) {
      $('#tab-query-email-tab').insertAfter($('#tab-query-comment-tab'));
      $('#query-form').tabs({active: 0});
    } else {
      $('#tab-query-comment-tab').insertAfter($('#tab-query-email-tab'));
      $('#query-form').tabs({active: 1});
    }
    // Reset form.
    $('#query-comment-input').val('');
    $('#query-template').val('')
    // Comment tab supports a list of IDs.
    $('#tab-query-comment').data('ids', JSON.stringify([parseInt(doc.id, 10)]));
    // Email tab only supports 1 document at a time.
    $('#tab-query-email').data('id', parseInt(doc.id, 10));
    $('#tab-query-email').data('sample-id', doc.event.event_id);
    // Set instruction messages.
    $('#tab-query-comment .alert').html(commentInstruct);
    $('#tab-query-email .alert').html(emailInstruct);
    // Set default email to.
    $('#email-to').val(emailTo);
    $('#email-subject').val(emailSubject);
    $('#email-body').val(emailBody + '\n\n' + recordData);

    $.fancybox.open({
      src: $('#query-form'),
      type: 'html',
      opts: {
        modal: true,
      }
    });
  }

  /**
   * Display the popup dialog for querying a record.
   */
  function queryPopup(el) {
    var doc;
    if (doingQueryPopup) {
      return;
    }
    if (el.settings.verificationTemplates) {
      loadVerificationTemplates('Q', '#query-template');
    }
    if (multiselectMode()) {
      // As there are multiple records possibly selected, sending an email
      // option not available.
      commentPopup(el, { query: 'Q' }, indiciaData.lang.verificationButtons.queryInMultiselectMode);
    } else {
      doc = JSON.parse($(listOutputControl).find('.selected').attr('data-doc-source'));
      const thisRowId = doc.id;
      getCurrentRecordEmail(doc, function callback(emailTo) {
        var t = indiciaData.lang.verificationButtons;
        if (doc.metadata.created_by_id == 1 && emailTo === '' || !emailTo.match(/@/)) {
          // Anonymous record with no valid email.
          tabbedQueryPopup(doc, true, t.queryCommentTabAnonWithoutEmail, t.queryEmailTabAnonWithoutEmail, emailTo);
        } else if (doc.metadata.created_by_id == 1) {
          // Anonymous record with valid email.
          tabbedQueryPopup(doc, false,t.queryCommentTabAnonWithEmail, t.queryEmailTabAnonWithEmail, emailTo);
        } else {
          doingQueryPopup = true;
          // Got a logged in user with email address. Need to know if they check notifications.
          $.ajax({
            url: indiciaData.esProxyAjaxUrl + '/doesUserSeeNotifications/' + indiciaData.nid,
            data: { user_id: doc.metadata.created_by_id },
            success: function success(data) {
              // Skip if we've moved records.
              if ($(listOutputControl).find('.selected').length > 0) {
                const currentDoc = JSON.parse($(listOutputControl).find('.selected').attr('data-doc-source'));
                if (thisRowId === currentDoc.id) {
                  if (data.result === 'yes' || data.result === 'maybe') {
                    tabbedQueryPopup(doc, true, t.queryCommentTabUserIsNotified, t.queryEmailTabUserIsNotified, emailTo);
                  } else {
                    tabbedQueryPopup(doc, false, t.queryCommentTabUserIsNotNotified, t.queryEmailTabUserIsNotNotified, emailTo);
                  }
                }
              }
            },
            complete: function complete() {
              doingQueryPopup = false;
            }
          });
        }
      });
    }
  }

  /**
   * Get HTML for the query by email tab's form.
   */
   function getEmailExpertForm(doc) {
    var container = $('<div class="query-popup email-expert-popup" data-id="' + doc.id + '" data-sample-id="' + doc.event.event_id + '" data-query="Q" />');
    var emailSubject = replaceDocFields(indiciaData.lang.verificationButtons.emailExpertSubject, doc);
    var emailBody = replaceDocFields(indiciaData.lang.verificationButtons.emailExpertBodyHeader, doc);
    var recordData = getRecordDataForEmail(doc);
    var form;
    $('<legend><span class="fas fa-question-circle fa-2x"></span>' +
      indiciaData.lang.verificationButtons.emailTabTitle + '</legend>')
      .appendTo(container);
    form = $('<form />').appendTo(container);
    $('<p class="alert alert-info">' + indiciaData.lang.verificationButtons.emailExpertInstruct + '</p>')
      .appendTo(form);
    appendRecordEmailExpertControls(form, '', emailSubject, emailBody, recordData);
    emailFormvalidator = $(form).validate({});
    $(form).submit(processEmail);
    $(container).draggable();
    return container;
  }

  function emailExpertPopup() {
    var doc = JSON.parse($(listOutputControl).find('.selected').attr('data-doc-source'));
    $.fancybox.open({
      src: getEmailExpertForm(doc),
      type: 'html',
      opts: {
        modal: true
      }
    });
  }

  /**
   * Handle the next chunk of uploaded decisions spreadsheet.
   */
  function nextSpreadsheetTask(metadata) {
    if ($.fancybox.getInstance() === false) {
      // Dialog has been closed, so process cancelled.
      return;
    }
    if (metadata.state === 'checks failed') {
      $('.upload-output').removeClass('alert-info').addClass('alert-danger');
      $('.upload-output .msg').html(
        '<p>The upload failed as errors were found in the spreadsheet so no changes were made to the database. ' +
        'Download the following file which explains the problems: <br/>' +
        '<a href="' + indiciaData.warehouseUrl + 'import/' + metadata.fileId + '-errors.csv"><span class="fas fa-file-csv fa-3x"></span></a><br/>' +
        'Please correct the problems in the original spreadsheet then re-upload it.</p>')
    } else if (metadata.state === 'done') {
      $('.upload-output progress').val(100).show();
      setTimeout(function() {
        alert(metadata.totalProcessed + ' verifications, comments and queries were applied to the database.');
      }, 100);
      $.fancybox.close();
    } else {
      if (metadata.state === 'checking') {
        $('.upload-output .checked').text(metadata.totalChecked);
        $('.upload-output .verifications').text(metadata.verificationsFound);
        $('.upload-output .errors').text(metadata.errorsFound);
        // Set progress bar as indeterminate.
        $('.upload-output progress').show().removeAttr('value');
      } if (metadata.state === 'processing') {
        $('.upload-output dl').hide();
        $('.upload-output progress').show().val(metadata.totalProcessed * 100 / metadata.verificationsFound);
      }

      // UcFirst the state string.
      $('.upload-output .msg').html(metadata.state.charAt(0).toUpperCase() + metadata.state.slice(1) + '...');
      $.ajax({
        url: indiciaData.esProxyAjaxUrl + '/verifyspreadsheet/' + indiciaData.nid,
        type: 'POST',
        dataType: 'json',
        data: {
          fileId: metadata.fileId,
          id_prefix: indiciaData.idPrefix,
          warehouse_name: indiciaData.warehouseName
        },
        success: nextSpreadsheetTask,
        error: function(jqXHR) {
          var msg = indiciaData.lang.verificationButtons.uploadError;
          if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
            msg += '<br/>' + jqXHR.responseJSON.message;
          }
          $('.upload-output').removeClass('alert-info').addClass('alert-danger');
          $('.upload-output .msg').html('<p>' + msg + '</p>');
        }
      });
    }
  }

  /**
   * Reset the upload decisions form if it has already been used.
   */
  function resetUploadDecisionsForm() {
    $('.upload-output').removeClass('alert-danger').addClass('alert-info');
    $('#upload-decisions-form .instruct').show();
    $('.upload-output .msg').html('');
    $('.upload-output').hide();
    $('.upload-output .checked').text('0');
    $('.upload-output .verifications').text('0');
    $('.upload-output .errors').text('0');
    $('.upload-output dl').show();
    $('.upload-output progress').hide();
    $('#upload-decisions-file').prop('disabled', false);
    $('#decisions-file').val('');
  }

  /**
   * Click handler for the upload decisions spreadsheet button.
   *
   * Displays the upload decisions dialog.
   */
  function uploadDecisions() {
    if ($('.user-filter.defines-permissions').length === 0) {
      alert(indiciaData.lang.verificationButtons.csvDisallowedMessage);
      return;
    }
    resetUploadDecisionsForm();
    $.fancybox.open($('#upload-decisions-form'), {
      opts: {
        modal: true
      }
    });
  }

  /*
   * Saves the authorisation token for the Record Comment Quick Reply.
   *
   * Stored against the occurrence ID to ensure it is not abused.
   *
   * @param string authorisationNumber
   *   Generated random code.
   * @return bool
   *   Indicates if database was successfully written to or not.
   *
   */
  function saveAuthorisationNumberToDb(authorisationNumber, occurrenceId) {
    var data = {
      website_id: indiciaData.website_id,
      'comment_quick_reply_page_auth:occurrence_id': occurrenceId,
      'comment_quick_reply_page_auth:token': authorisationNumber
    };
    $.post(
      indiciaData.ajaxFormPostQuickReplyPageAuth,
      data,
      function onPost(r) {
        if (typeof r.error !== 'undefined') {
          alert(r.error);
        }
      },
      'json'
    );
  }

  // Use an AJAX call to get the server to send the email
  function sendEmail(email) {
    var notifyFailSend = function() {
      $.fancybox.open('<div class="manual-email">' + indiciaData.lang.verificationButtons.requestManualEmail +
          '<div class="ui-helper-clearfix"><span>To:</span> <span>' + email.to + '</span></div>' +
          '<div class="ui-helper-clearfix"><span>Subject:</span> <span>' + email.subject + '</span></div>' +
          '<div class="ui-helper-clearfix"><span>Content:</span><div>' + email.body.replace(/\n/g, '<br/>') + '</div></div>' +
          '</div>');
    }
    $.ajax({
      url: indiciaData.esProxyAjaxUrl + '/verificationQueryEmail/' + indiciaData.nid,
      method: 'POST',
      data: email
    })
    .done(function (response) {
      $.fancybox.close();
      if (response.message && response.message === 'OK') {
        alert(indiciaData.lang.verificationButtons.emailSent);
      } else {
        notifyFailSend();
      }
    })
    .fail(function() {
      $.fancybox.close();
      notifyFailSend();
    });
  }

  /*
   * Create a random authorisation number to pass to the Record Comment Quick Reply page
   * (This page sits outside the Warehouse)
   * @returns string random authorisation token
   */
  function makeAuthNumber() {
    var characterSelection = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var authNum = '';
    var digit;
    for (digit = 0; digit < 16; digit++) {
      authNum += characterSelection.charAt(Math.floor(Math.random() * characterSelection.length));
    }
    return authNum;
  }

  /**
   * Processes a query email (e.g. token replacements) then sends it.
   */
  function processEmail(e) {
    var email = {
      to: $(e.currentTarget).find('.email').val(),
      subject: $(e.currentTarget).find('.subject').val(),
      body: $(e.currentTarget).find('textarea').val(),
    };
    var popup = $(e.currentTarget).closest('.query-popup');
    var occurrenceId = $(popup).data('id');
    var sampleId = $(popup).data('sample-id');
    var urlSep = indiciaData.esProxyAjaxUrl.indexOf('?') === -1 ? '?' : '&';
    // Setup the quick reply page link and get an authorisation number.
    // Note: The quick reply page does actually support supplying a user_id parameter to it, however we don't do that in practice here as
    // we don't actually know if the user has an account (we would also have to collect the user_id for the entered email)
    var personIdentifierParam = '&email_address=' + email.to;
    // Need an authorisation unique string in URL, this is linked to the occurrence.
    // Only if correct auth and occurrence_id combination are present does the Record Comment Quick Reply page display
    var authorisationNumber = makeAuthNumber();
    var authorisationParam = '&auth=' + authorisationNumber;
    var commentQuickReplyPageLink = '<a href="' + indiciaData.warehouseUrl + 'occurrence_comment_quick_reply_page.php?occurrence_id=' +
        occurrenceId + personIdentifierParam + authorisationParam + '">' +
        indiciaData.lang.verificationButtons.commentReplyInstruct + '</a>';
    // Complete creation of email of record details
    if (emailFormvalidator.numberOfInvalids() === 0) {
      // Save info required for quick reply.
      saveAuthorisationNumberToDb(authorisationNumber, occurrenceId);
      // Replace the text tokens from the email with the actual text/link.
      email.body = email.body
        .replace('{{ emailReplyOption }}', indiciaData.lang.verificationButtons.emailReplyInstruct)
        .replace('{{ commentReplyOption }}', commentQuickReplyPageLink);
      // Ensure media and comments are loaded.
      $.ajax({
        url: indiciaData.esProxyAjaxUrl + '/mediaAndComments/' + indiciaData.nid + urlSep +
        'occurrence_id=' + occurrenceId + '&sample_id=' + sampleId,
        dataType: 'json'
      })
      .done(function handleResponse(response) {
          // Insert media and comment data into template tokens.
          email.body = email.body.replace(/\{{ photos }}/g, response.media);
          email.body = email.body.replace(/\{{ comments }}/g, response.comments);
          // Save a comment to indicate that the mail was sent.
          saveVerifyComment(
            [occurrenceId],
            { query: 'Q' },
            $(popup).hasClass('email-expert-popup') ? indiciaData.lang.verificationButtons.emailExpertLoggedAsComment : indiciaData.lang.verificationButtons.emailQueryLoggedAsComment,
            email
          );
          sendEmail(email);
        }
      )
      .fail(function () {
        alert('Request for media and comments to include in email failed.');
      });
    }
    // Block form submission otherwise page reloads.
    return false;
  }

  /**
   * Populates a select with the list of available verification templates.
   *
   * @param string select
   *   Selector for the select control.
   * @param array data
   *   Database data for the templates.
   */
  function populateVerificationTemplates(select, data) {
    // Remove all but the empty "please select" option.
    $(select).find('option[value!=""]').remove();
    if (data.length > 0) {
      $.each(data, function() {
        $(select).append('<option value="' + this.id + '">' + this.title + '</option>');
      });
      $(select).data('data', data);
      $(select).closest('.ctrl-wrap').show();
    } else {
      $(select).closest('.ctrl-wrap').hide();
    }
  }

  /**
   * Loads a user's templates from the database for a status.
   *
   * @param string status
   *   Status code to load templates for.
   * @param string select
   *   Selector for the <select> element to add them to.
   */
  function loadVerificationTemplates(statusCode, select) {
    var getTemplatesReport = indiciaData.read.url + '/index.php/services/report/requestReport?report=library/verification_templates/verification_templates.xml&mode=json&mode=json&callback=?';
    var getTemplatesReportParameters = {
      auth_token: indiciaData.read.auth_token,
      nonce: indiciaData.read.nonce,
      reportSource: 'local',
      template_status: statusCode,
      created_by_id: indiciaData.user_id,
      website_id: indiciaData.website_id
    };
    if (typeof commentTemplatesLoaded[statusCode] === 'undefined') {
      $.getJSON(
        getTemplatesReport,
        getTemplatesReportParameters,
        function (data) {
          commentTemplatesLoaded[statusCode] = data;
          populateVerificationTemplates(select, commentTemplatesLoaded[statusCode]);
        }
      );
    } else {
      populateVerificationTemplates(select, commentTemplatesLoaded[statusCode]);
    }
  }

  /**
   * Enables shortcut keys for verification actions.
   *
   * @param DOM el
   *   Control element.
   */
  function enableKeyboardNavigation(el) {
    var statuses = {
      V: [1, 49],
      V1: [1, 49],
      V2: [2, 50],
      C3: [3, 51],
      R4: [4, 52],
      R: [5, 53],
      R5: [5, 53]
    };
    if (el.settings.keyboardNavigation) {
      // Add hints to indicate shortcut keys.
      $.each(statuses, function(code, key) {
        $('[data-status="' + code +'"]').attr('title', $('[data-status="' + code +'"]').attr('title') + ' (' + key[0] + ')');
        $('[data-status="' + code +'"]').attr('data-keycode', key[1]);
      });
      $('[data-query="Q"]').attr('title', $('[data-query="Q"]').attr('title') + ' (Q)');
      $('.email-expert').attr('title', $('.email-expert').attr('title') + ' (X)');
      $('button.redet').attr('title', $('button.redet').attr('title') + ' (R)');
      // Keystroke handler for verification action shortcuts.
      $(document).keypress(function onKeypress(e) {
        // Abort if focus on an input control (as the event bubbles to the
        // container, or fancybox already visible).
        if ($(':input:focus').length || $.fancybox.getInstance()) {
          return true;
        }
        // Only interested in keys 1-5, q, r and x.
        if ($('[data-keycode="' + e.which +'"]:visible').length || e.which === 113 || e.which === 114 || e.which === 120) {
          if ($('[data-keycode="' + e.which +'"]:visible').length) {
            commentPopup(el, { status: $('[data-keycode="' + e.which +'"]:visible').attr('data-status') });
          } else if (e.which === 113) {
            // q
            queryPopup(el);
          } else if (e.which === 114) {
            // r
            showRedetForm(el);
          } else if (e.which === 120) {
            // x
            emailExpertPopup();
          }
          e.preventDefault;
          return false;
        }
      });
    }
  }

  function getTaxonNameLabel(doc) {
    var scientific = doc.taxon.accepted_name ? doc.taxon.accepted_name : doc.taxon.taxon_name;
    var vernacular;
    if (doc.taxon.vernacular_name) {
      vernacular = doc.taxon.vernacular_name;
      return vernacular === scientific ? scientific : scientific + ' (' + vernacular + ')';
    }
    return scientific;
  }

  /**
   * Replace tokens in a comment text.
   *
   * @param object item
   *   DOM item in the data grid or card gallery we are processing a comment for.
   * @param string text
   *   Comment text.
   * @param string status
   *   Status code, e.g. V or Q.
   *
   * @return string
   *   Text with tokens replaced by data values.
   */
  function commentTemplateReplacements(item, text, status) {
    const doc = JSON.parse(item.attr('data-doc-source'));
    // Action term can be overridden due to language construct, e.g. plausible should be "marked as plausible".
    var actionTerm = typeof indiciaData.lang.verificationButtons[status] !== 'undefined' ? indiciaData.lang.verificationButtons[status] : indiciaData.statusMsgs[status].toLowerCase();
    var conversions = {
      date: indiciaFns.fieldConvertors.event_date(doc),
      sref: doc.location.output_sref,
      taxon: doc.taxon.taxon_name,
      'common name': [doc.taxon.vernacular_name, doc.taxon.accepted_name, doc.taxon.taxon_name],
      'preferred name': [doc.taxon.accepted_name, doc.taxon.taxon_name],
      'taxon full name': getTaxonNameLabel(doc),
      'rank': doc.taxon.taxon_rank.charAt(0).toLowerCase() +  doc.taxon.taxon_rank.slice(1),
      action: actionTerm,
      'location name': doc.location.verbatim_locality
    };
    if (redetToTaxon) {
      conversions['new taxon full name'] = getTaxonNameLabel({
        taxon: {
          taxon_name: redetToTaxon.taxon,
          accepted_name: redetToTaxon.preferred_taxon,
          vernacular_name: redetToTaxon.default_common_name
        }
      });
      conversions['new taxon'] = redetToTaxon.taxon;
      conversions['new common name'] = [redetToTaxon.default_common_name, redetToTaxon.preferred_taxon];
      conversions['new rank'] = redetToTaxon.taxon_rank.charAt(0).toLowerCase() + redetToTaxon.taxon_rank.slice(1);
    }
    return indiciaFns.applyVerificationTemplateSubsitutions(text, conversions);
  }

  /**
   * Declare public methods.
   */
  var methods = {

    /**
     * Initialise the idcVerificationButtons plugin.
     *
     * @param array options
     */
    init: function init(options) {
      var el = this;

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
      // Validate settings.
      if (typeof el.settings.showSelectedRow === 'undefined') {
        indiciaFns.controlFail(el, 'Missing showSelectedRow config for table.');
      }
      listOutputControl = $('#' + el.settings.showSelectedRow);
      listOutputControlClass = $(listOutputControl).data('idc-class');
      // Form validation for redetermination
      redetFormValidator = $('#redet-form').validate();
      // Plus setup redet form texts.
      if ($('.alt-taxon-list-message').length > 0) {
        $('.alt-taxon-list-message').html(
          $('.alt-taxon-list-message').html().replace('{message}', indiciaData.lang.verificationButtons.redetPartialListInfo)
        );
      }
      // Enable dialog dragging.
      $('.verification-popup').draggable();
      $(listOutputControl)[listOutputControlClass]('on', 'itemSelect', function itemSelect(tr) {
        var sep;
        var doc;
        var key;
        var keyParts;
        var editPath = '';
        var editFormOnSameWebsite;
        const buttonEl = $('#' + el.settings.id + '-buttons');
        resetCommentForm('verification-form', '');
        $('.external-record-link').remove();
        // Reset the redetermination form.
        $('#redet-form :input').val('');
        if (tr) {
          // Update the view and edit button hrefs. This allows the user to
          // right click and open in a new tab, rather than have an active
          // button.
          doc = JSON.parse($(tr).attr('data-doc-source'));
          occurrenceId = doc.id;
          $('.idc-verificationButtons').show();
          sep = el.settings.viewPath.indexOf('?') === -1 ? '?' : '&';
          $(buttonEl).find('.view').attr('href', el.settings.viewPath + sep + 'occurrence_id=' + doc.id);
          editFormOnSameWebsite = doc.metadata.website.id == indiciaData.website_id && doc.metadata.input_form;
          if (el.settings.useLocalFormPaths && editFormOnSameWebsite) {
            editPath = doc.metadata.input_form;
          } else if (el.settings.editPath) {
            editPath = el.settings.editPath;
          }
          if (editPath) {
            $(buttonEl).find('.edit').attr('href', editPath + sep + 'occurrence_id=' + doc.id);
            $(buttonEl).find('.edit').show();
          } else {
            $(buttonEl).find('.edit').hide();
          }
          $(buttonEl).find('.species').attr('href', el.settings.speciesPath + sep + 'taxon_meaning_id=' + doc.taxon.taxon_meaning_id);
          // Deprecated doc field mappings had occurrence_external_key instead
          // of occurrence.source_system_key. This line can be removed if the
          // index has been rebuilt.
          if (doc.occurrence.source_system_key || doc.occurrence_external_key) {
            key = doc.occurrence.source_system_key ? doc.occurrence.source_system_key : doc.occurrence_external_key;
            if (key.match(/^iNat:/)) {
              keyParts = key.split(':');
              $(buttonEl).find('.view').after('<a href="https://www.inaturalist.org/observations/' + keyParts[1] + '" ' +
                'target="_blank" title="View source record on iNaturalist" class="external-record-link">' +
                '<span class="fas fa-file-invoice"></span>iNaturalist</a>');
            }
          }
          // Ensure redets against same list as recorded taxon.
          $('#redet-species\\:taxon').setExtraParams({"taxon_list_id": doc.taxon.taxon_list.id});
          // If list used for search is not master list, then controls shown
          // to allow user to opt for master list instead.
          // A value of mainTaxonListId = 0 signifies there is no master list.
          if (
            parseInt(doc.taxon.taxon_list.id) === parseInt(indiciaData.mainTaxonListId) ||
            parseInt(indiciaData.mainTaxonListId) === 0
          ) {
            $('.alt-taxon-list-controls').hide();
          }
          else {
            $('.alt-taxon-list-controls').show();
            $('#redet-from-full-list').prop('checked', false);
            indiciaData.selectedRecordTaxonListId = doc.taxon.taxon_list.id;
          }
          // Enable apply to parent sample button only if selected record in a
          // parent sample.
          if (doc.event.parent_event_id) {
            $(buttonEl).find('.apply-to-parent-sample-contents').removeAttr('disabled');
          } else {
            $(buttonEl).find('.apply-to-parent-sample-contents').attr('disabled', true);
          }
        } else {
          $('.idc-verificationButtons').hide();
        }
      });
      $(listOutputControl)[listOutputControlClass]('on', 'populate', function populate() {
        $('.idc-verificationButtons').hide();
      });
      // Redet form use main taxon list checkbox.
      $('#redet-from-full-list').change(function(e) {
        if ($(e.currentTarget).prop('checked')) {
          $('#redet-species\\:taxon').setExtraParams({ taxon_list_id: indiciaData.mainTaxonListId });
        } else {
          $('#redet-species\\:taxon').setExtraParams({ taxon_list_id: indiciaData.selectedRecordTaxonListId });
        }
      });

      // Verify button click handler pop's up dialog.
      $(el).find('button.verify').click(function buttonClick(e) {
        var status = $(e.currentTarget).attr('data-status');
        commentPopup(el, { status: status });
      });

      // Query button click handler pop's up dialog.
      $(el).find('button.query').click(function buttonClick() {
        queryPopup(el);
      });

      // Apply to parent sample click toggles active state.
      $(el).find('button.apply-to-parent-sample-contents').click(function buttonClick() {
        if ($(this).hasClass('active')) {
          $(this).removeClass('active');
        } else {
          $(this).addClass('active');
        }
      });

      // Email expert button click handler pop's up dialog.
      $(el).find('button.email-expert').click(function buttonClick() {
        emailExpertPopup();
      });

      // If we have an upload decisions spreadsheet button, set it up.
      if ($(el).find('button.upload-decisions').length) {
        // Click handler.
        $(el).find('button.upload-decisions').click(function buttonClick() {
          uploadDecisions();
        });
        // Move to correct parent.
        if (el.settings.uploadButtonContainerElement) {
          $(el.settings.uploadButtonContainerElement).append($(el).find('button.upload-decisions'));
        }
      }
      enableKeyboardNavigation(el);
      // Default state is to show the l2 verification status buttons.
      $(el).find('.l1').hide();
      // Hook up event handlers.
      initHandlers(el);
      // Add copy buttons to tokens in help text.
      $.each($('#template-help-cntr code'), function() {
        $(this).after(' <i class="far fa-copy" title="' + indiciaData.lang.verificationButtons.copyPlaceholder.replace('{{ placeholder }}', $(this).text())  + '"></i>');
      });
      // Click handler for copy button.
      $('#template-help-cntr .fa-copy').click(function() {
        navigator.clipboard.writeText($(this).prev('code').text());
        // Animation to show it worked.
        $(this).animate({
          opacity: 0.5
        }, 200, 'swing', () => {
            $(this).animate({
            opacity: 1
          }, 200);
        });
      });

      // Setup the query form.
      $('#query-form').draggable();
      $('#query-form').tabs();
      emailFormvalidator = $('#tab-query-email form').validate({});
      $('#tab-query-email form').submit(processEmail);
    },

    on: function on(event, handler) {
      if (typeof callbacks[event] === 'undefined') {
        indiciaFns.controlFail(this, 'Invalid event handler requested for ' + event);
      }
      callbacks[event].push(handler);
    },

    /**
     * No need to re-populate if source updates.
     */
    getNeedsPopulation: function getNeedsPopulation() {
      return false;
    }
  };

  /**
   * Extend jQuery to declare idcVerificationButtons plugin.
   */
  $.fn.idcVerificationButtons = function buildVerificationButtons(methodOrOptions) {
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
      $.error('Method ' + methodOrOptions + ' does not exist on jQuery.idcVerificationButtons');
      return true;
    });
    // If the method has no explicit response, return this to allow chaining.
    return typeof result === 'undefined' ? this : result;
  };
}());
