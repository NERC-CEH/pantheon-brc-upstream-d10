/**
 * @file
 * Plugin for a details pane for verification of records.
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
 * @author Indicia Team
 * @license http://www.gnu.org/licenses/gpl.html GPL 3.0
 * @link https://github.com/indicia-team/client_helpers
 */

/**
* Output plugin for the verification record details pane.
*/
(function idcRecordDetailsPane() {
  'use strict';
  var $ = jQuery;

  /**
   * Currently selected row ID.
   */
  var occurrenceId;

  /**
   * Selected row sensitive or private.
   */
  var sensitiveOrPrivate;

  /**
   * Additional useful field values.
   */
  var extraFieldValues;

  /**
   * Place to store public methods.
   */
  var methods;

  /**
   * Declare default settings.
   */
  var defaults = {
    controlLayoutDone: false,
    includeImageClassifierInfo: false
  };

  var callbacks = {
    tabShow: []
  };

  /**
   * The element that the row source is obtained from.
   */
  var rowSourceControl;

  // Info for tracking loaded tabs.
  var loadedCommentsOcurrenceId = 0;
  var loadedAttrsOcurrenceId = 0;
  var loadedExperienceOcurrenceId = 0;

  function getExperienceCells(buckets, userId, el, filter, yr) {
    var total = buckets.C + buckets.V + buckets.R;
    var indicatorSize;
    var datedUrl;
    var links;
    var urls;
    var settings = $(el)[0].settings;
    var html = '';

    if (settings.exploreUrl) {
      datedUrl = settings.exploreUrl.replace('-userId-', userId);
      if (yr) {
        datedUrl = datedUrl
          .replace('-df-', yr + '-01-01')
          .replace('-dt-', yr + '-12-31');
      } else {
        datedUrl = datedUrl
        .replace('-df-', '')
        .replace('-dt-', '');
      }
      urls = {
        V: datedUrl.replace('-q-', 'V'),
        C: datedUrl.replace('-q-', 'P'),
        R: datedUrl.replace('-q-', 'R')
      };
      links = {
        V: buckets.V ? '<a target="_blank" href="' + urls.V + '&' + filter + '">' + buckets.V + '</a>' : '<a>0</a>',
        C: buckets.C ? '<a target="_blank" href="' + urls.C + '&' + filter + '">' + buckets.C + '</a>' : '<a>0</a>',
        R: buckets.R ? '<a target="_blank" href="' + urls.R + '&' + filter + '">' + buckets.R + '</a>' : '<a>0</a>'
      };
    } else {
      // No explore URL, so just output the numbers.
      links = buckets;
    }
    indicatorSize = Math.min(80, total * 2);
    html += '<td>' + links.V + '<span class="exp-V" style="width: ' + (indicatorSize * (buckets.V / total)) + 'px;"></span></td>';
    html += '<td>' + links.C + '<span class="exp-C" style="width: ' + (indicatorSize * (buckets.C / total)) + 'px;"></span></td>';
    html += '<td>' + links.R + '<span class="exp-R" style="width: ' + (indicatorSize * (buckets.R / total)) + 'px;"></span></td>';
    return html;
  }

  /**
   * Returns a single HTML table of experience data for a user.
   */
  function getExperienceAggregation(data, type, userId, filter, el) {
    var html = '';
    var minYear = 9999;
    var maxYear = 0;
    var yr;
    var matrix = { C: {}, V: {}, R: {} };
    var buckets;

    $.each(data[type + '_status'][type + '_status_filtered'].buckets, function eachStatus() {
      var status = this.key;
      $.each(this[type + '_status_filtered_age'].buckets, function eachYear() {
        minYear = Math.min(minYear, this.key);
        maxYear = Math.max(maxYear, this.key);
        if (typeof matrix[status] !== 'undefined') {
          matrix[status][this.key] = this.doc_count;
        }
      });
    });
    html += '<strong>Total records:</strong> ' + data[type + '_status'].doc_count;
    if (minYear < 9999) {
      html += '<table><thead><tr><th>Year</th>'
        + '<th>Verified</th>' +
        '<th>Other</th>' +
        '<th>Rejected</th>' +
        '</tr></thead>';
      for (yr = maxYear; yr >= Math.max(minYear, maxYear - 2); yr--) {
        html += '<tr>';
        html += '<th scope="row">' + yr + '</th>';
        buckets = {
          V: typeof matrix.V[yr] !== 'undefined' ? matrix.V[yr] : 0,
          C: typeof matrix.C[yr] !== 'undefined' ? matrix.C[yr] : 0,
          R: typeof matrix.R[yr] !== 'undefined' ? matrix.R[yr] : 0
        };
        html += getExperienceCells(buckets, userId, el, filter, yr);
        html += '</tr>';
      }
      buckets = {
        V: 0,
        C: 0,
        R: 0
      };
      for (yr = minYear; yr <= maxYear; yr++) {
        buckets.V += typeof matrix.V[yr] !== 'undefined' ? matrix.V[yr] : 0;
        buckets.C += typeof matrix.C[yr] !== 'undefined' ? matrix.C[yr] : 0;
        buckets.R += typeof matrix.R[yr] !== 'undefined' ? matrix.R[yr] : 0;
      }
      html += '<tr>';
      html += '<th scope="row">Total</th>';
      html += getExperienceCells(buckets, userId, el, filter);
      html += '</tr>';
      html += '<tbody>';
      html += '</tbody></table>';
    }
    return html;
  }

  /**
   * Loads and appends comments to the tab.
   */
  function loadComments(el) {
    // Check not already loaded.
    if (loadedCommentsOcurrenceId === occurrenceId) {
      return;
    }
    loadedCommentsOcurrenceId = occurrenceId;
    // Load the comments
    $.ajax({
      url: indiciaData.esProxyAjaxUrl + '/comments/' + indiciaData.nid,
      data: { occurrence_id: occurrenceId },
      success: function success(response) {
        $(el).find('.comments').html('');
        if (response.length === 0) {
          $('<div class="alert alert-info">There are no comments for this record.</div>')
            .appendTo($(el).find('.comments'));
        } else {
          $.each(response, function eachComment() {
            var statusIcon = indiciaFns.getEsStatusIcons({
              status: this.record_status,
              substatus: this.record_substatus,
              query: this.query === 't' ? 'Q' : null
            });
            var action = this.record_status !== null
              ? indiciaData.lang.recordDetails.verificationDecision
              : indiciaData.lang.recordDetails[this.type];
            var title = indiciaData.lang.recordDetails.actionByPersonOnDate
              .replace('{1}', action)
              .replace('{2}', this.person_name)
              .replace('{3}', new Date(this.updated_on).toLocaleString());
            var panelType;
            if (this.status === 'V') {
              panelType = 'success';
            } else if (this.status === 'R') {
              panelType = 'danger';
            } else if (this.type !== 'comment') {
              panelType = 'default';
            } else {
              panelType = 'info';
            }

            if (statusIcon === '' && this.type === 'comment') {
              statusIcon += ' <span class="far fa-comment"></span>';
            }
            else if (this.type === 'recordEntered') {
              statusIcon += ' <span class="fas fa-keyboard"></span>';
            }
            else if (this.type === 'redetermination') {
              statusIcon += ' <span class="fas fa-tag"></span>';
            }

            $('<div class="panel panel-' + panelType + '">' +
              '<div class="panel-heading">' + statusIcon + ' ' + title + '</div>' +
              '<div class="panel-body">' + this.comment + '</div>' +
              '</div').appendTo($(el).find('.comments'));
          });
        }
      },
      dataType: 'json'
    });
  }

  function loadAttributes(el) {
    // Check not already loaded.
    if (loadedAttrsOcurrenceId === occurrenceId) {
      return;
    }
    loadedAttrsOcurrenceId = occurrenceId;
    $.ajax({
      url: indiciaData.esProxyAjaxUrl + '/attrs/' + indiciaData.nid,
      data: { occurrence_id: occurrenceId },
      success: function success(response) {
        var attrsDiv = $(el).find('.record-details .attrs');
        // Make sure standard headings are present.
        var combined = $.extend({ 'Additional occurrence attributes': [] }, response);
        var publicGeom = response.public_geom;
        delete combined.public_geom;
        // False indicates record loaded but email not yet found.
        indiciaData.thisRecordEmail = false;
        $(attrsDiv).html('');
        if (sensitiveOrPrivate) {
          $.each($('.idc-leafletMap'), function eachMap() {
            $(this).idcLeafletMap('showFeature', publicGeom, false);
          });
          $('.record-details table:first-child tbody').append('<tr><th>Map legend</th><td><span class="far fa-square" style="color: blue"></span>Publicly visible grid square' +
            '&nbsp;&nbsp;<span class="far fa-square" style="color: red; opacity: 0.7;"></span>Precise location</td></tr');
        }
        $.each(combined, function eachHeading(title, attrs) {
          if (title === 'auth') {
            // Use auth section to refresh token, not for display.
            indiciaData.read.auth_token = attrs.auth_token;
            indiciaData.read.nonce = attrs.nonce;
            $('#redet-species\\:taxon').setExtraParams(attrs);
            return;
          }
          var table;
          var tbody;
          $(attrsDiv).append('<h3>' + title + '</h3>');
          table = $('<table>').appendTo(attrsDiv);
          tbody = $('<tbody>').appendTo($(table));
          if (title === 'Additional occurrence attributes') {
            $('<tr><th>Submitted on</th><td>' + extraFieldValues.created_on + '</td></tr>').appendTo(tbody);
            $('<tr><th>Last updated on</th><td>' + extraFieldValues.updated_on + '</td></tr>').appendTo(tbody);
          }
          $.each(attrs, function eachAttr() {
            var val = this.value.match(/^http(s)?:\/\//)
              ? '<a href="' + this.value + '" target="_blank">' + this.value + '</a>'
              : this.value;
            val = indiciaFns.escapeHtml(val);
            $('<tr><th>' + this.caption + '</th><td>' + val + '</td></tr>').appendTo(tbody);
            if (title === 'Recorder attributes' && this.system_function === 'email' && val.match(/@/)) {
              // Store recorder email address for querying etc.
              indiciaData.thisRecordEmail = val;
            }
          });
          if (title === 'Additional occurrence attributes') {
            if (extraFieldValues.licence) {
              $('<tr><th>Licence</th><td>' + extraFieldValues.licence + '</td></tr>').appendTo(tbody);
            }
            if (extraFieldValues.external_key) {
              $('<tr><th>ID in source system</th><td>' + extraFieldValues.external_key + '</td></tr>').appendTo(tbody);
            }
          }
        });
      },
      dataType: 'json'
    });
  }

  function loadExperience(el, doc) {
    var data;
    // Check not already loaded.
    if (loadedExperienceOcurrenceId === doc.id) {
      return;
    }
    if (doc.metadata.created_by_id === '1') {
      $(el).find('.recorder-experience').html(
        '<div class="alert alert-info"><span class="fas fa-info-circle"></span>' +
          'Recorder was not logged in so experience cannot be loaded.</div>'
      );
      return;
    }
    loadedExperienceOcurrenceId = doc.id;
    data = {
      size: 0,
      query: {
        bool: {
          must: [{
            term: { 'metadata.created_by_id': doc.metadata.created_by_id }
          }]
        }
      },
      aggs: {
        group_status: {
          filter: {
            term: { 'taxon.group.keyword': doc.taxon.group }
          },
          aggs: {
            group_status_filtered: {
              terms: {
                field: 'identification.verification_status',
                size: 10,
                order: {
                  _count: 'desc'
                }
              },
              aggs: {
                group_status_filtered_age: {
                  terms: {
                    field: 'event.year',
                    size: 5,
                    order: {
                      _key: 'desc'
                    }
                  }
                }
              }
            }
          }
        },
        species_status: {
          filter: {
            term: { 'taxon.accepted_taxon_id': doc.taxon.accepted_taxon_id }
          },
          aggs: {
            species_status_filtered: {
              terms: {
                field: 'identification.verification_status',
                size: 10,
                order: {
                  _count: 'desc'
                }
              },
              aggs: {
                species_status_filtered_age: {
                  terms: {
                    field: 'event.year',
                    size: 5,
                    order: {
                      _key: 'desc'
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    $(el).find('.loading-spinner').show();
    $.ajax({
      url: indiciaData.esProxyAjaxUrl + '/rawsearch/' + indiciaData.nid,
      type: 'post',
      data: data,
      success: function success(response) {
        var html = '';
        if (typeof response.error !== 'undefined' || (response.code && response.code !== 200)) {
          alert('Elasticsearch query failed');
          $(el).find('.recorder-experience').html(
            '<div class="alert alert-warning">Experience could not be loaded.</div>'
          );
          $(el).find('.loading-spinner').hide();
        } else {
          html += '<h3>Experience for <span class="field-taxon--accepted-name">' +
            doc.taxon.accepted_name + '</span></h3>';
          html += getExperienceAggregation(response.aggregations, 'species', doc.metadata.created_by_id,
            'filter-taxa_taxon_list_external_key_list=' + doc.taxon.accepted_taxon_id, el);
          html += '<h3>Experience for ' + doc.taxon.group + '</h3>';
          html += getExperienceAggregation(response.aggregations, 'group', doc.metadata.created_by_id,
            'filter-taxon_group_list=' + doc.taxon.group_id, el);
          $(el).find('.recorder-experience').html(html);
          $(el).find('.loading-spinner').hide();
        }
      },
      error: function error(jqXHR) {
        if (jqXHR.readyState === 4) {
          // Don't bother if not done - i.e. error because user navigated away.
          alert('Elasticsearch query failed');
        }
      },
      dataType: 'json'
    });
  }

  /**
   * Load info onto the image classifier info tab.
   */
  function loadImageClassifierInfo(el, doc) {
    $(el).find('.classifier-info').html(indiciaFns.getImageClassifierSuggestionsHtml(doc));
  }

  function loadCurrentTabAjax(el) {
    var selectedItem = $(rowSourceControl).find('.selected');
    var doc;
    var activeTab = indiciaFns.activeTab($(el).find('.tabs'));
    var functions = [
      loadAttributes,
      loadComments,
      loadExperience,
      loadImageClassifierInfo,
    ];
    var tabNames = [
      'Details',
      'Comments',
      'Recorder experience',
      'Image classifier info.'
    ]
    if (selectedItem.length > 0) {
      doc = JSON.parse(selectedItem.attr('data-doc-source'));
      // Populate the tab.
      functions[activeTab](el, doc);
      // Fire callbacks.
      $.each(el.callbacks.tabShow, function eachCallback() {
        this(tabNames[activeTab], doc, $(el).find('.tabs .ui-tabs-panel:visible'));
      });
    }
  }

  function tabActivate(event, ui) {
    loadCurrentTabAjax($(ui.newPanel).closest('.idc-recordDetails')[0]);
  }

  /**
   * Adds a row to the details pane.
   *
   * Row only added if there is a value for the row.
   */
  function addRow(rows, doc, caption, fields, separator) {
    var values = [];
    var value;
    var item;
    // Always treat fields as array so code can be consistent.
    var fieldArr = Array.isArray(fields) ? fields : [fields];
    $.each(fieldArr, function eachField(i, field) {
      var fieldClass = 'field-' + field.replace('.', '--').replace('_', '-').replace(/#/g, '-');
      item = indiciaFns.getValueForField(doc, field);
      if (item !== '') {
        // Convert to hyperlink where relevant.
        item = item.match(/^http(s)?:\/\//) ? '<a href="' + item + '" target="_blank">' + item + '</a>' : item;
        values.push('<span class="' + fieldClass + '">' + item + '</span>');
      }
    });
    value = values.join(separator);
    if (typeof value === 'undefined' || value === '') {
      value = '-';
    }
    if (typeof value !== 'undefined' && value !== '') {
      rows.push('<tr><th scope="row">' + caption + '</th><td>' + value + '</td></tr>');
    }
  }

  function doItemSelect(el, tr) {
    var doc;
    var rows = [];
    var anAnnotation;
    var vnAnnotation;
    var key;
    var externalMessage;
    var msgClass = 'info';
    var recordDetails = $(el).find('.record-details');
    // Clear the stored email until details loaded.
    indiciaData.thisRecordEmail = null;

    if (tr) {
      doc = JSON.parse($(tr).attr('data-doc-source'));
      occurrenceId = doc.id;
      sensitiveOrPrivate = doc.metadata.sensitivity_blur === 'F';
      anAnnotation = doc.taxon.taxon_name === doc.taxon.accepted_name ? ' (as entered)' : '';
      vnAnnotation = doc.taxon.taxon_name === doc.taxon.vernacular_name ? ' (as entered)' : '';
      addRow(rows, doc, 'ID|status|checks', ['id', '#status_icons#', '#data_cleaner_icons#'], ' | ');
      addRow(rows, doc, 'Accepted name' + anAnnotation, ['taxon.accepted_name', 'taxon.accepted_name_authorship'], ' ');
      addRow(rows, doc, 'Common name' + vnAnnotation, 'taxon.vernacular_name');
      if (doc.taxon.taxon_name !== doc.taxon.accepted_name && doc.taxon.taxon_name !== doc.taxon.vernacular_name) {
        addRow(rows, doc, 'Name as entered', ['taxon.taxon_name', 'taxon.taxon_name_authorship'], ' ');
      }
      if (el.settings.locationTypes) {
        addRow(rows, doc, 'Location', 'location.verbatim_locality');
        $.each(el.settings.locationTypes, function eachType() {
          addRow(rows, doc, this, '#higher_geography:' + this + ':name#');
        });
      } else {
        addRow(rows, doc, 'Location', '#locality#');
      }
      addRow(rows, doc, 'Grid ref', 'location.output_sref');
      addRow(rows, doc, 'Date seen', '#event_date#');
      addRow(rows, doc, 'Recorder', 'event.recorded_by');
      addRow(rows, doc, 'Determiner', 'identification.identified_by');
      addRow(rows, doc, 'Dataset',
        ['metadata.website.title', 'metadata.survey.title', 'metadata.group.title'], ' :: ');
      addRow(rows, doc, 'Sample comment', 'event.event_remarks');
      addRow(rows, doc, 'Occurrence comment', 'occurrence.occurrence_remarks');

      extraFieldValues = {
        created_on: indiciaFns.getValueForField(doc, 'metadata.created_on'),
        updated_on: indiciaFns.getValueForField(doc, 'metadata.updated_on'),
        licence: indiciaFns.getValueForField(doc, 'metadata.licence_code'),
        external_key: indiciaFns.getValueForField(doc, 'occurrence.source_system_key'),
      };

      $(recordDetails).html('<table><tbody>' + rows.join('') + '</tbody></table>');
      $(recordDetails).append('<div class="attrs"><div class="loading-spinner"><div>Loading...</div></div></div>');
      rows = [];
      addRow(rows, doc, 'Taxonomy', ['taxon.phylum', 'taxon.order', 'taxon.family'], ' :: ');
      if (el.settings.extraLocationTypes) {
        $.each(el.settings.extraLocationTypes, function eachType() {
          addRow(rows, doc, this, '#higher_geography:' + this + ':name#');
        });
      }
      $(recordDetails).append('<h3>Derived info</h3>');
      $(recordDetails).append('<table><tbody>' + rows.join('') + '</tbody></table>');
      loadedAttrsOcurrenceId = 0;
      // Reference to doc.occurrence_external_key is deprecated and can be
      // removed if the BRC index has been re-indexed.
      if (doc.occurrence.source_system_key || doc.occurrence_external_key) {
        key = doc.occurrence.source_system_key ? doc.occurrence.source_system_key : doc.occurrence_external_key;
        if (key.match(/^iNat:/)) {
          externalMessage = 'View details of this record in iNaturalist using the link provided.';
          if (!doc.occurrence.media) {
            externalMessage += ' Although there are no media files linked to the imported record, this may be ' +
              'because the source record\'s images were not licensed so could not be imported. If so then they ' +
              'may be viewed in iNaturalist.';
            msgClass = 'warning';
          }
          $(recordDetails).prepend('<div class="alert alert-' + msgClass + '">' + externalMessage + '</div>');
        }
      }
      $(el).find('.empty-message').hide();
      if (el.settings.includeImageClassifierInfo && doc.identification.classifier) {
        $('#classifier-info-tab').show();
      } else {
        $('#classifier-info-tab').hide();
      }
      $(el).find('.tabs').show();
      if (!el.settings.controlLayoutDone) {
        // On first show, make sure controlLayout control can apply any changes.
        indiciaFns.updateControlLayout();
        el.settings.controlLayoutDone = true;
      }

      // Load Ajax content depending on the tab.
      loadCurrentTabAjax(el);
    } else {
      // If no row selected, hide the details tabs.
      $(el).find('.empty-message').show();
      $(el).find('.tabs').hide();
    }
  }

  /**
   * Declare public methods.
   */
  methods = {
    /**
     * Initialise the idcRecordDetailsPane plugin.
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
        indiciaFns.controlFail(el, 'Missing showSelectedRow config for idcRecordDetailsPane.');
      }
      rowSourceControl = $('#' + el.settings.showSelectedRow);
      if (rowSourceControl.length === 0) {
        indiciaFns.controlFail(el, 'Missing control ' + el.settings.showSelectedRow +
          ' for idcRecordDetailsPane @showSelectedRow setting.');
      }
      // Tabify
      $(el).find('.tabs').tabs({
        activate: tabActivate
      });
      // Clean tabs
      $('.ui-tabs-nav').removeClass('ui-widget-header');
      $('.ui-tabs-nav').removeClass('ui-corner-all');
    },

    bindControls: function() {
      var el = this;
      var controlClass = $(rowSourceControl).data('idc-class');
      // Hook up events for the row source control.
      $(rowSourceControl)[controlClass]('on', 'itemSelect', function itemSelect(tr) {
        doItemSelect(el, tr);
      });
      $(rowSourceControl)[controlClass]('on', 'populate', function populate() {
        $(el).find('.empty-message').show();
        $(el).find('.tabs').hide();
      });
    },

    on: function on(event, handler) {
      if (typeof this.callbacks[event] === 'undefined') {
        indiciaFns.controlFail(this, 'Invalid event handler requested for ' + event);
      }
      this.callbacks[event].push(handler);
    },

    /**
     * Details pane doesn't repopulate if source changes until row clicked.
     */
    getNeedsPopulation: function getNeedsPopulation() {
      return false;
    }
  };

    /**
   * Extend jQuery to declare idcRecordDetailsPane method.
   */
  $.fn.idcRecordDetailsPane = function buildRecordDetailsPane(methodOrOptions) {
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
      $.error('Method ' + methodOrOptions + ' does not exist on jQuery.idcRecordDetailsPane');
      return true;
    });
    // If the method has no explicit response, return this to allow chaining.
    return typeof result === 'undefined' ? this : result;
  };
}());
