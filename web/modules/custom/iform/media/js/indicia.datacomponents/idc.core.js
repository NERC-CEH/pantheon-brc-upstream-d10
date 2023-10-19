/**
 * @file
 * Core functionality for the indicia.datacomponents library,
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

/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_source", "_latlng", "_idfield"] }] */
/* eslint no-extend-native: ["error", { "exceptions": ["String"] }] */
/* eslint no-param-reassign: ["error", { "props": false }]*/

(function enclose() {
  'use strict';
  var $ = jQuery;

  /**
   * Extend the String class to simplify a column fieldname string.
   *
   * For special column handlers, a fieldname can be given as the following
   * format:
   * #fieldname:param1:param2:...#
   * This function will return just fieldname.
   */
  String.prototype.simpleFieldName = function simpleFieldName() {
    return this.replace(/#/g, '').split(':')[0];
  };

  /**
   * Convert an ES field to a name suitable for composite aggregation keys.
   *
   * When auto-generating a composite aggregation we want the name given to
   * each field's key to have hyphens instead of full stops, so the names are
   * not confused with paths in the document.
   */
  String.prototype.asCompositeKeyName = function asCompositeKeyName() {
    return this.replace(/[\.#:]/g, '-');
  };

  /**
   * String function to make a field name readable.
   */
  String.prototype.asReadableKeyName = function asReadableKeyName() {
    // Spaces instead of .-_
    var name = this.replace(/[\.\-_:#]/g, ' ').trim();
    // Leading caps.
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  /**
   * Keep track of a list of all the plugin instances that output something.
   */
  indiciaData.outputPluginClasses = [];

  /**
   * List of the Elasticsearch bound sources.
   */
  indiciaData.esSourceObjects = {};

  /**
   * List of the user filters we've used, so we can refresh cache appropriately.
   */
  indiciaData.esUserFiltersLoaded = [];

  /**
   * Font Awesome icon and other classes for record statuses and flags.
   */
  indiciaData.statusClasses = {
    V: 'far fa-check-circle status-V',
    V1: 'fas fa-check-double status-V1',
    V2: 'fas fa-check status-V2',
    C: 'fas fa-clock status-C',
    C3: 'fas fa-check-square status-C3',
    R: 'far fa-times-circle status-R',
    R4: 'fas fa-times status-R4',
    R5: 'fas fa-times status-R5',
    // Additional flags
    Q: 'fas fa-question-circle',
    A: 'fas fa-reply',
    Sensitive: 'fas fa-exclamation-circle',
    Confidential: 'fas fa-exclamation-triangle',
    ZeroAbundance: 'fas fa-ban',
    Anonymous: 'fas fa-user-slash'
  };

  /**
   * Messages for record statuses and other flags.
   */
  indiciaData.statusMsgs = {
    V: 'Accepted',
    V1: 'Accepted as correct',
    V2: 'Accepted as considered correct',
    C: 'Pending review',
    C3: 'Plausible',
    R: 'Not accepted',
    R4: 'Not accepted as unable to verify',
    R5: 'Not accepted as incorrect',
    // Additional flags
    Q: 'Queried',
    A: 'Answered',
    Sensitive: 'Sensitive',
    Confidential: 'Confidential',
    ZeroAbundance: 'Absence record',
    Anonymous: 'Entered by a user who was not logged in'
  };

  /**
   * Font Awesome icon classes for verification automatic check rules.
   */
  indiciaData.ruleClasses = {
    WithoutPolygon: 'fas fa-globe',
    PeriodWithinYear: 'far fa-calendar-times',
    IdentificationDifficulty: 'fas fa-microscope',
    default: 'fas fa-ruler',
    pass: 'fas fa-thumbs-up',
    fail: 'fas fa-thumbs-down',
    pending: 'fas fa-cog',
    checksDisabled: 'fas fa-eye-slash'
  };

  /**
   * Browser-tolerant fullscreenElement.
   */
  indiciaFns.fullscreenElement = function fullscreenElement() {
    return document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
  }

  /**
   * Make an output control fullscreen.
   */
  indiciaFns.goFullscreen = function goFullscreen(el) {
    if (indiciaFns.fullscreenElement()) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      if ($.fancybox) {
        // Reset Fancybox container.
        $.fancybox.defaults.parentEl = 'body';
      }
    } else {
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
      // Fancybox popups must use the fullscreen element as container.
      $.fancybox.defaults.parentEl = el;
    }
  }

  /**
     * Hides a row and moves to next row.
     *
     * When an action is taken on a row so it is no longer required in the grid
     * this method hides the row and moves to the next row, for example after
     * a verification accept.
     *
     * @todo Move this into a base class for dataGrid and cardGallery
     */
  indiciaFns.hideItemAndMoveNext = function hideItemAndMoveNext(el) {
    var oldSelected = $(el).find('.selected');
    var newSelectedId;
    var pagerLabel = $(el).find('.showing');
    var selectedIds = [];
    var sourceSettings = el.settings.sourceObject.settings;
    if ($(el).find('.multiselect-mode').length > 0) {
      $.each($(el).find('input.multiselect:checked'), function eachRow() {
        var item = $(this).closest('[data-row-id]');
        selectedIds.push($(item).attr('[data-row-id]'));
        item.remove();
      });
    } else {
      if ($(oldSelected).next('[data-row-id]').length > 0) {
        newSelectedId = $(oldSelected).next('[data-row-id]').attr('data-row-id');
      } else if ($(oldSelected).prev('[data-row-id]').length > 0) {
        newSelectedId = $(oldSelected).prev('[data-row-id]').attr('data-row-id');
      }
      selectedIds.push($(oldSelected).attr('data-row-id'));
      $(oldSelected).remove();
    }
    // If the number of rows below 75% of page size, refresh the grid.
    if ($(el).find('[data-row-id]').length < sourceSettings.size * 0.75) {
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
        value: JSON.stringify(selectedIds)
      });
      $(el)[0].settings.selectIdsOnNextLoad = [newSelectedId];
      // Reload the page.
      el.settings.sourceObject.populate(true);
      // Clean up the temporary exclusion filter.
      sourceSettings.filterBoolClauses.must_not.pop();
      if (!sourceSettings.filterBoolClauses.must_not.length) {
        delete sourceSettings.filterBoolClauses.must_not;
      }
    } else {
      // Update the paging info if some rows left.
      if (pagerLabel) {
        indiciaFns.drawPager(
          pagerLabel,
          $(el).find('[data-row-id]').length,
          el.settings.sourceObject.settings
        );
      }
      // Immediately select the next row.
      if (typeof newSelectedId !== 'undefined') {
        $(el).find('[data-row-id="' + newSelectedId + '"]').addClass('selected').focus();
      }
      // Fire callbacks for selected row.
      $.each(el.callbacks.itemSelect, function eachCallback() {
        this($(el).find('.selected').length === 0 ? null : $(el).find('.selected')[0]);
      });
    }
  },

  /**
   * Takes a string and applies token replacement for field values.
   *
   * @param object el
   *   The dataGrid element.
   * @param object doc
   *   The ES document for the row.
   * @param string text
   *   Text to perform replacements on.
   * @param obj tokenDefaults
   *   Each property can be a field name token (e..g [id]) with values being
   *   the replacement that will be used if no value found for this field in
   *   the doc.
   *
   * @return string
   *   Updated text.
   */
  indiciaFns.applyFieldReplacements = function applyFieldReplacements(el, doc, text, tokenDefaults) {
    // Find any field name replacements.
    var fieldMatches = text.match(/\[(.*?)\]/g);
    var updatedText = text;
    $.each(fieldMatches, function eachMatch(i, fieldToken) {
      var dataVal;
      // Cleanup the square brackets which are not part of the field name.
      var field = fieldToken.replace(/\[/, '').replace(/\]/, '');
      // Field names can be separated by OR if we want to pick the first.
      var fieldOrList = field.split(' OR ');
      $.each(fieldOrList, function eachFieldName() {
        var fieldName = this;
        var fieldDef = {};
        var srcSettings = el.settings.sourceObject.settings;
        if ($.inArray(fieldName, el.settings.sourceObject.settings.fields) > -1) {
          // Auto-locate aggregation fields in document.
          if (srcSettings.mode === 'termAggregation') {
            fieldDef.path = 'fieldlist.hits.hits.0._source';
          } else if (srcSettings.mode === 'compositeAggregation') {
            fieldDef.path = 'key';
            // Aggregate keys use hyphens to represent path in doc.
            fieldName = fieldName.replace(/\./g, '-');
          }
        }
        dataVal = indiciaFns.getValueForField(doc, fieldName, fieldDef);
        if (dataVal === '' && typeof tokenDefaults !== 'undefined' && typeof tokenDefaults['[' + fieldName + ']'] !== 'undefined') {
          dataVal = tokenDefaults['[' + fieldName + ']'];
        }
        // Drop out when we find a value.
        return dataVal === '';
      });
      updatedText = updatedText.replace(fieldToken, dataVal);
    });
    return updatedText;
  }

  /**
  * Retrieve any action links to attach to an idcDataGrid or idcCardCalendar row.
  *
  * @param object el
  *   The output control element.
  * @param array actions
  *   List of actions from configuration.
  * @param object doc
  *   The ES document for the row.
  *
  * @return string
  *   Action link HTML.
  */
  indiciaFns.getActions = function getActions(el, actions, doc) {
    var html = '';
    $.each(actions, function eachActions() {
      var item;
      var link;
      var params = [];
      if (this.hideIfFromOtherWebsite && doc.metadata.website.id != indiciaData.website_id) {
        // Skip this action.
        return true;
      }
      if (this.hideIfFromOtherUser && doc.metadata.created_by_id != indiciaData.user_id) {
        // Skip this action.
        return true;
      }
      if (!this.tokenDefaults) {
        this.tokenDefaults = {};
      }
      if (typeof this.title === 'undefined') {
        html += '<span class="fas fa-times-circle error" title="Invalid action definition - missing title"></span>';
      } else {
        if (this.iconClass) {
          item = '<span class="' + this.iconClass + '" title="' + this.title + '"></span>';
        } else {
          item = this.title;
        }
        if (this.path) {
          link = this.path
            .replace(/{rootFolder}/g, indiciaData.rootFolder)
            .replace(/\{language\}/g, indiciaData.currentLanguage);
          if (this.urlParams) {
            link += link.indexOf('?') === -1 ? '?' : '&';
            $.each(this.urlParams, function eachParam(name, value) {
              params.push(name + '=' + value);
            });
            link += params.join('&');
          }
          item = '<a href="' + indiciaFns.applyFieldReplacements(el, doc, link, this.tokenDefaults) + '" title="' + this.title + '">' + item + '</a>';
        }
        else if (this.onClickFn) {
          item = '<a onclick="indiciaFns.' + this.onClickFn + '(JSON.parse(jQuery(this).closest(\'tr\').attr(\'data-doc-source\')), jQuery(this).closest(\'tr\')[0]);" title="' + this.title + '">' + item + '</a>';
        }
        html += item;
      }
    });
    return html;
  }

  /**
   * Instantiate the data sources.
   */
  indiciaFns.initDataSources = function initDataSources() {
    // Build the Elasticsearch source objects and run initial population.
    $.each(indiciaData.esSources, function eachSource() {
      var sourceObject = new IdcEsDataSource(this);
      indiciaData.esSourceObjects[this.id] = sourceObject;
    });
  };

  /**
   * Hookup datasources to their controls.
   */
  indiciaFns.hookupDataSources = function hookupDataSources() {
    // Build the Elasticsearch source objects and run initial population.
    $.each(indiciaData.esSourceObjects, function eachSource() {
      this.hookup();
    });
  };

  /**
   * Initially populate the data sources.
   */
  indiciaFns.populateDataSources = function populateDataSources() {
    // Build the Elasticsearch source objects and run initial population.
    $.each(indiciaData.esSourceObjects, function eachSource() {
      this.populate();
    });
  };

  /**
   * Keep track of a unique list of output plugin classes active on the page.
   */
  indiciaFns.registerOutputPluginClass = function registerOutputPluginClasses(name) {
    if ($.inArray(name, indiciaData.outputPluginClasses) === -1) {
      indiciaData.outputPluginClasses.push(name);
    }
  };

  /**
   * Function to flag an output plugin as failed.
   *
   * Places an error message before the plugin instance then throws a message.
   *
   * @param object el
   *   Plugin element.
   * @param string msg
   *   Failure message.
   */
  indiciaFns.controlFail = function controlFail(el, msg) {
    $(el).before('<p class="alert alert-danger">' +
      '<span class="fas fa-exclamation-triangle fa-2x"></span>Error loading control' +
      '</p>');
    throw new Error(msg);
  };

  /**
   * Auto-add keyword suffix for aggregating/sorting on fields with keywords.
   *
   * Allows the configuration to not care about keyword sub-fields.
   */
  indiciaFns.esFieldWithKeywordSuffix = function esFieldWithKeywordSuffix(field) {
    var keywordFields = [
      'event.attributes.id',
      'event.attributes.value',
      'event.habitat',
      'event.recorded_by',
      'event.sampling_protocol',
      'identification.auto_checks.output.message',
      'identification.auto_checks.output.rule_type',
      'identification.identified_by',
      'identification.query',
      'identification.recorder_certainty',
      'identification.verifier.name',
      'indexed_location_ids',
      'location.name',
      'location.output_sref',
      'location.output_sref_system',
      'location.parent.name',
      'location.verbatim_locality',
      'message',
      'metadata.group.title',
      'metadata.licence_code',
      'metadata.query',
      'metadata.survey.title',
      'metadata.website.title',
      'occurrence.associated_media',
      'occurrence.attributes.id',
      'occurrence.attributes.value',
      'occurrence.life_stage',
      'occurrence.media.caption',
      'occurrence.media.licence',
      'occurrence.media.path',
      'occurrence.media.path2',
      'occurrence.media.type',
      'occurrence.organism_quantity',
      'occurrence.sex',
      'output_sref',
      'tags',
      'taxon.accepted_name',
      'taxon.accepted_name_authorship',
      'taxon.class',
      'taxon.family',
      'taxon.genus',
      'taxon.group',
      'taxon.input_group',
      'taxon.kingdom',
      'taxon.order',
      'taxon.phylum',
      'taxon.species',
      'taxon.subfamily',
      'taxon.taxon_list.title',
      'taxon.taxon_name',
      'taxon.taxon_name_authorship',
      'taxon.taxon_rank',
      'taxon.vernacular_name',
      'warehouse'
    ];
    if ($.inArray(field, keywordFields) > -1) {
      return field + '.keyword';
    }
    return field;
  };

  /**
   * Close a Fancybox popup and reselects the item it was called by.
   *
   * Used by dataGrid and cardGallery controls.
   */
  indiciaFns.closeFancyboxForSelectedItem = function closeFancyboxForSelectedItem() {
    setTimeout(function() {
      // Close on timeout to prevent a JS error.
      $.fancybox.close(true);
    }, 100);
    // Refocus last selected row or card.
    if ($('.selected:visible').length) {
      $('.selected:visible').focus();
    }
  }

  /**
   * Convert an ES media file to thumbnail HTML.
   *
   * @param integer id
   *   Document ID.
   * @param object file
   *   Nested file object from ES document.
   * @param string imgClass
   *   Class to attach to <img>, either single or multi depending on number of
   *   thumbnails.
   * @param string imgSize
   *   Default thumb. Specify 'med' or another image size configured on the
   *   warehouse, or an empty string, to control the warehouse image size
   *   shown.
   */
  indiciaFns.drawMediaFile = function drawMediaFile(id, file, imgClass, imgSize) {
    var domainClass;
    var urlMatch;
    var captionItems = [];
    var captionAttr;
    var mediaInfo = {
      id: file['id'],
      loaded: {
        caption: file['caption'],
        licence_code: file['licence'],
        type: file['type']
      }
    };
    var mediaAttr = 'data-media-info="' + indiciaFns.escapeHtml(JSON.stringify(mediaInfo)) + '"';
    var iNatThumbnail;
    var path;
    var thumbPath;
    // Default image size to thumb.
    imgSize = typeof imgSize === 'undefined' ? 'thumb' : imgSize;
    if (file.caption) {
      captionItems.push(file.caption);
    }
    if (file.licence) {
      captionItems.push('Licence is ' + file.licence);
    }
    captionAttr = captionItems.length ? ' title="' + captionItems.join(' | ').replace('"', '&quot;') + '"' : '';
    if (file.type === 'Image:Local') {
      path = file.path.match(/^http/) ? file.path : indiciaData.warehouseUrl + 'upload/' + file.path;
      thumbPath = file.path.match(/^http/) ? file.path : indiciaData.warehouseUrl + 'upload/' + (imgSize === '' ? '' : imgSize + '-') + file.path;
      // Standard link to Indicia image.
      return '<a ' + mediaAttr + captionAttr +
        'href="' + path + '" ' +
        'data-fancybox="group-' + id + '">' +
        '<img class="' + imgClass + '" src="' + thumbPath + '" />' +
        '</a>';
    }
    if (file.type === 'Audio:Local') {
      // Audio files can have a player control.
      return '<audio controls ' + mediaAttr + ' ' + captionAttr +
        ' src="' + indiciaData.warehouseUrl + 'upload/' + file.path + '" type="audio/mpeg"/>';
    }
    if (file.type === 'Image:iNaturalist') {
      iNatThumbnail = imgSize === 'med' ? file.path.replace('/square.', '/medium.') : file.path;
      return '<a ' + mediaAttr + ' ' + captionAttr +
        ' href="' + file.path.replace('/square.', '/original.') + '" ' +
        'class="inaturalist" data-fancybox="group-' + id + '">' +
        '<img class="' + imgClass + '" src="' + iNatThumbnail + '" /></a>';
    }
    // Fallback for any other local files - just a link.
    if (file.type.match(/:Local$/)) {
      return '<a ' + mediaAttr + ' ' + captionAttr +
        ' href="' + indiciaData.warehouseUrl + 'upload/' + file.path + '">' +
        '<span class="fas fa-file-invoice fa-2x"></span><br/>' +
        file.type.split(':')[0] + '</a>';
    }
    urlMatch = file.path.match(/^http(s)?:\/\/(www\.)?([a-z]+(\.kr)?)/);
    if (urlMatch) {
      // Everything else will be treated using noembed on the popup.
      // Build icon class using web domain.
      domainClass = file.path.match(/^http(s)?:\/\/(www\.)?([a-z]+(\.kr)?)/)[3].replace('.', '');
      return '<a ' + mediaAttr + ' ' + captionAttr +
          ' href="' + file.path + '" class="social-icon ' + domainClass + '"></a>';
    }
    // Shouldn't really get here.
    return '[file]';
  };

  /**
   * Detect date/time patterns and convert to a suitable ES query string.
   */
  indiciaFns.dateToEsFilter = function dateToEsFilter(text, field) {
    // A series of possible date patterns, with the info required to build
    // a query string.
    var tests = [
      {
        // yyyy format.
        pattern: '(\\d{4})',
        format: '[`1`-01-01 TO `1`-12-31]'
      },
      {
        // yyyy format.
        pattern: '(\\d{4})-(\\d{4})',
        format: '[`1`-01-01 TO `2`-12-31]'
      },
      {
        // dd/mm/yyyy format.
        pattern: '(\\d{2})\\/(\\d{2})\\/(\\d{4})',
        format: '`3`-`2`-`1`'
      },
      {
        // yyyy-mm-dd format.
        pattern: '(\\d{4})\\-(\\d{2})\\-(\\d{2})',
        format: '`1`-`2`-`3`'
      },
      {
        // dd/mm/yyyy hh:mm format.
        pattern: '(\\d{2})\\/(\\d{2})\\/(\\d{4}) (\\d{2})\\:(\\d{2})',
        format: '["`3`-`2`-`1` `4`:`5`:00" TO "`3`-`2`-`1` `4`:`5`:59"]'
      }
    ];
    var filter = false;
    // Loop the patterns to find a match.
    $.each(tests, function eachTest() {
      var regex = new RegExp('^' + this.pattern + '$');
      var match = text.match(regex);
      var value = this.format;
      var i;
      if (match) {
        // Got a match, so reformat and build the filter string.
        for (i = 1; i < match.length; i++) {
          value = value.replace(new RegExp('`' + i + '`', 'g'), match[i]);
        }
        filter = field + ':' + value;
        // Abort the search.
        return false;
      }
      return true;
    });
    return filter;
  };

  /**
   * Utility function to retrieve status icon HTML from a status code.
   *
   * @param object flags
   *   Array of flags, including any of:
   *   * status
   *   * substatus
   *   * query
   *   * sensitive
   *   * confidential
   * @param string iconClass
   *   Additional class to add to the icons, e.g. fa-2x.
   *
   * @return string
   *   HTML for the icons.
   */
  indiciaFns.getEsStatusIcons = function getEsStatusIcons(flags, iconClass) {
    var html = '';
    var fullStatus;

    var addIcon = function addIcon(flag) {
      var classes = [];
      if (typeof indiciaData.statusClasses[flag] !== 'undefined') {
        classes = [indiciaData.statusClasses[flag]];
        if (iconClass) {
          classes.push(iconClass);
        }
        html += '<span title="' + indiciaData.statusMsgs[flag] + '" class="' + classes.join(' ') + '"></span>';
      }
    };
    // Add the record status icon.
    if (flags.status) {
      fullStatus = flags.status + (!flags.substatus || flags.substatus === '0' ? '' : flags.substatus);
      addIcon(fullStatus);
    }
    // Add other metadata icons as required.
    if (flags.query) {
      addIcon(flags.query);
    }
    if (flags.sensitive && flags.sensitive !== 'false') {
      addIcon('Sensitive');
    }
    if (flags.confidential && flags.confidential !== 'false') {
      addIcon('Confidential');
    }
    if (flags.confidential && flags.confidential !== 'false') {
      addIcon('ZeroAbundance');
    }
    if (flags.anonymous && flags.anonymous !== 'false') {
      addIcon('Anonymous');
    }
    return html;
  };

  /**
   * Searches an object for a nested property.
   *
   * Useful for finding the buckets property of an aggregation for example.
   *
   * @return mixed
   *   Property value.
   */
  indiciaFns.findValue = function findValue(object, key) {
    var value;
    Object.keys(object).some(function eachKey(k) {
      if (k === key) {
        value = object[k];
        return true;
      }
      if (object[k] && typeof object[k] === 'object') {
        value = indiciaFns.findValue(object[k], key);
        return value !== undefined;
      }
      return false;
    });
    return value;
  };

  /**
   * Searches an object for a nested property and sets its value.
   *
   * @param object object
   *   Object whose value is to be changed.
   * @param string key
   *   Name of the property to change.
   * @param mixed updateTo
   *   Value to update to.
   * @param mixed updateFrom
   *   Optional. If set, then value only changed if originally equal to this.
   *
   * @return mixed
   *   Property value.
   */
  indiciaFns.findAndSetValue = function findAndSetValue(object, key, updateTo, updateFrom) {
    var value;
    Object.keys(object).some(function eachKey(k) {
      if (k === key && (typeof updateFrom === 'undefined' || updateFrom === object[k])) {
        object[k] = updateTo;
        return true;
      }
      if (object[k] && typeof object[k] === 'object') {
        value = indiciaFns.findAndSetValue(object[k], key, updateTo, updateFrom);
        return value !== undefined;
      }
      return false;
    });
    return value;
  };

  /**
   * Converts sort info in settings into a list of actual field/direction pairs.
   *
   * Expands special fields into their constituent field list to sort on.
   */
  indiciaFns.expandSpecialFieldSortInfo = function expandSpecialFieldSortInfo(sort, withKeyword) {
    var sortInfo = {};
    if (sort) {
      $.each(sort, function eachSortField(field, dir) {
        if (indiciaData.fieldConvertorSortFields[field.simpleFieldName()] &&
            $.isArray(indiciaData.fieldConvertorSortFields[field.simpleFieldName()])) {
          $.each(indiciaData.fieldConvertorSortFields[field.simpleFieldName()], function eachUnderlyingField() {
            sortInfo[this] = dir;
          });
        } else if (indiciaData.fieldConvertorSortFields[field.simpleFieldName()]) {
          sortInfo = indiciaData.fieldConvertorSortFields[field.simpleFieldName()];
        } else if (withKeyword) {
          // Normal field with keyword ready to send to ES.
          sortInfo[indiciaFns.esFieldWithKeywordSuffix(field)] = dir;
        } else {
          // If just getting sort info, not sending to ES, then easier without keyword
          // for comparison with field names.
          sortInfo[field.replace(/\.keyword$/, '')] = dir;
        }
      });
    }
    return sortInfo;
  };

  /**
   * A list of functions which provide HTML generation for special fields.
   *
   * These are field values in HTML that can be extracted from an Elasticsearch
   * doc which are not simple values.
   */
  indiciaFns.fieldConvertors = {

    /**
     * Output an associations summary.
     */
    associations: function associations(doc) {
      var output = [];
      if (doc.occurrence.associations) {
        $.each(doc.occurrence.associations, function eachAssociation() {
          var label = '<em>' + this.accepted_name + '</em>';
          if (this.vernacular_name) {
            label = this.vernacular_name + ' (' + label + ')';
          }
          output.push(label);
        });
      }
      return output.join('; ');
    },

    /**
     * Output an attribute value.
     *
     * Pass 2 parameters:
     * * The entity name (event (=sample) or occurrence).
     * * The attribute ID.
     *
     * Multiple attribute values are returned as a single semi-colon separated
     * value.
     */
    attr_value: function attrValue(doc, params) {
      var output = [];
      var entity = params && params.length > 1 ? params[0] : '';
      // Map to ES document structure.
      var key = entity === 'parent_event' ? 'parent_attributes' : 'attributes';
      // Tolerate sample or event for entity parameter.
      entity = $.inArray(entity, ['sample', 'event', 'parent_event']) > -1 ? 'event' : 'occurrence';
      if (doc[entity] && doc[entity][key]) {
        $.each(doc[entity][key], function eachAttr() {
          if (this.id === params[1]) {
            output.push(this.value);
          }
        });
      }
      return output.join('; ');
    },

    /**
     * Output a constant.
     *
     * Pass the constant value to output which can be an empty string.
     */
     constant: function constant(doc, params) {
      if (params.length === 1) {
        return params[0];
      }
      else {
        return '';
      }
    },

    /**
     * Data cleaner automatic rule check result icons.
     */
    data_cleaner_icons: function dataCleanerIcons(doc) {
      var autoChecks = doc.identification.auto_checks;
      var icons = [];
      if (autoChecks.enabled === 'false') {
        icons.push('<span title="Automatic rule checks will not be applied to records in this dataset." class="' + indiciaData.ruleClasses.checksDisabled + '"></span>');
      } else if (autoChecks.result === 'true') {
        if (autoChecks.verification_rule_types_applied) {
          icons.push('<span title="All automatic rule checks passed." class="' + indiciaData.ruleClasses.pass + '"></span>');
        }
      } else if (autoChecks.result === 'false') {
        if (autoChecks.output.length > 0) {
          icons = ['<span title="The following automatic rule checks were triggered for this record." class="' + indiciaData.ruleClasses.fail + '"></span>'];
          // Add an icon for each rule violation.
          $.each(autoChecks.output, function eachViolation() {
            // Set a default for any other rules.
            var icon = Object.prototype.hasOwnProperty.call(indiciaData.ruleClasses, this.rule_type)
              ? indiciaData.ruleClasses[this.rule_type] : indiciaData.ruleClasses.default;
            icons.push('<span title="' + this.message + '" class="' + icon + '"></span>');
          });
        }
      } else {
        // Not yet checked.
        icons.push('<span title="Record not yet checked against rules." class="' + indiciaData.ruleClasses.pending + '"></span>');
      }
      if (doc.identification.custom_verification_rule_flags) {
        $.each(doc.identification.custom_verification_rule_flags, function() {
          // Only show the user's own rule flags.
          if (this.created_by_id == indiciaData.user_id) {
            const mapping = {
              'bar-chart': 'fas fa-chart-bar',
              'bug': 'fas fa-bug',
              'calendar': 'fas fa-calendar-alt',
              'calendar-cross': 'fas fa-calendar-times',
              'calendar-tick': 'fas fa-calendar-check',
              'clock': 'far fa-clock',
              'count': 'fas fa-sort-amount-up-alt',
              'cross': 'fas fa-times',
              'exclamation': 'fas fa-exclamation',
              'flag': 'far fa-flag',
              'globe': 'fas fa-globe',
              'history': 'fas fa-history',
              'leaf': 'fas fa-leaf',
              'spider': 'fas fa-spider',
              'tick-in-box': 'fas fa-check-square',
              'warning': 'fas fa-exclamation-triangle'
            };
            const icon = (typeof mapping[this.icon] === 'undefined') ? 'fas fa-exclamation' : mapping[this.icon];
            icons.push('<i class="custom-rule-flag ' + icon + '" title="Custom rule check failed: ' + this.message + '"></i>');
          }
        });

      }
      return icons.join('');
    },

    /**
     * A simple output of website and survey ID.
     *
     * Has a hint to show the underlying titles.
     */
    datasource_code: function datasourceCode(doc) {
      return '<abbr title="' + doc.metadata.website.title + ' | ' + doc.metadata.survey.title + '">' +
        doc.metadata.website.id + '|' + doc.metadata.survey.id +
        '</abbr>';
    },

    /**
     * Output the event date or date range.
     *
     * Can also cope if date fields are embedded in key (e.g. in composite
     * agg response).
     */
    event_date: function eventDate(doc) {
      var root = doc.event || doc.key || doc;
      var start = indiciaFns.formatDate(root.date_start || root['event-date_start']);
      var end = indiciaFns.formatDate(root.date_end || root['event-date_end']);
      if (!start && !end) {
        return 'Unknown';
      }
      if (!start) {
        return 'Before ' + end;
      }
      if (!end) {
        return 'After ' + start;
      }
      if (start !== end) {
        return start + ' - ' + end;
      }
      return start;
    },

    /**
     * Output a higher geography value.
     *
     * The column should be configured with two parameters, the first is the
     * type (e.g. Vice county) and the second the field to return (e.g. name,
     * code). For example:
     * {"caption":"VC code","field":"#higher_geography:Vice County:code#"}
     */
    higher_geography: function higherGeography(doc, params) {
      var output = [];
      var text = [];
      if (doc.location.higher_geography) {
        if (params.length === 0 || !params[0]) {
          output = doc.location.higher_geography;
        } else {
          $.each(doc.location.higher_geography, function eachGeography() {
            // If the correct type and not a combined geo-area (indicated by + in the code).
            // See https://github.com/BiologicalRecordsCentre/iRecord/issues/606
            if (this.type === params[0] && !this.code.match(/\+/)) {
              if (params.length >= 2 && params[1]) {
                // Limiting to one field.
                output.push(this[params[1]]);
              } else {
                // Include whole location object.
                output.push(this);
              }
            }
          });
        }
      }
      if (params.length >= 3 && params[2] === 'json') {
        return JSON.stringify(output);
      }
      // Convert response to a string.
      $.each(output, function eachRow(i, item) {
        text.push(typeof item === 'string' ? item : Object.values(item).join('; '));
      });
      return text.join(' | ');
    },

    /**
     * A formatted latitude.
     */
    lat: function lat(doc, params) {
      var point = doc.location.point || doc.point;
      var coords = point.split(',') || doc.p;
      var lat = parseFloat(coords[0]);
      var format = params && params[0] ? params[0] : "";
      var precision;
      switch(format) {
        case "decimal":
          if (params && params[1]) {
            return lat.toFixed(params[1]);
          }
          return lat;
        case "nssuffix":
          // Implemented as the default.
        default:
          precision = params && params[1] ? params[1] : 3;
          return Math.abs(lat).toFixed(precision) + (lat >= 0 ? 'N' : 'S');
      }
    },

    /**
     * A formatted lat long.
     */
    lat_lon: function latLon(doc, params) {
      var point = doc.location.point || doc.point;
      var coords = point.split(',') || doc.p;
      var lat = parseFloat(coords[0]);
      var lon = parseFloat(coords[1]);
      var precision = params && params[0] ? params[0] : 3;
      return Math.abs(lat).toFixed(precision) + (lat >= 0 ? 'N' : 'S') + ' ' +
             Math.abs(lon).toFixed(precision) + (lon >= 0 ? 'E' : 'W');
    },

    /**
     * A summary of location information.
     *
     * Includes the given location name (verbatim locality) as well as list of
     * higher geography.
     */
     locality: function locality(doc) {
      var info = '';
      if (doc.location.verbatim_locality) {
        info += '<div>' + doc.location.verbatim_locality + '</div>';
        if (doc.location.higher_geography) {
          info += '<ul>';
          $.each(doc.location.higher_geography, function eachPlace() {
            info += '<li>' + this.type + ': ' + this.name + '</li>';
          });
          info += '</ul>';
        }
      }
      return info;
    },

    /**
     * A formatted longitude.
     */
    lon: function lon(doc, params) {
      var point = doc.location.point || doc.point;
      var coords = point.split(',') || doc.p;
      var lon = parseFloat(coords[1]);
      var format = params && params[0] ? params[0] : "";
      var precision;
      switch(format) {
        case "decimal":
          if (params && params[1]) {
            return lon.toFixed(params[1]);
          }
          return lon;
        case "ewsuffix":
          // Implemented as the default.
        default:
          precision = params && params[1] ? params[1] : 3;
          return Math.abs(lon).toFixed(precision) + (lon >= 0 ? 'E' : 'W');
      }
    },

    /**
     * Retrieve a field value, or null if value is '0'.
     *
     * The first parameter provided should be the field name from the ES document.
     */
    null_if_zero: function nullIfZero(doc, params) {
      var value;
      if (params.length !== 1) {
        return 'Incorrect parameters for null_if_zero column configuration';
      }
      value = indiciaFns.getValueForField(doc, params[0]);
      if (value === '0') {
        return '';
      }
      return value;
    },

    /**
     * Retrieve HTML representing media thumbnails.
     */
    occurrence_media: function occurrenceMedia(doc) {
      var value = doc.occurrence.media;
      // Tweak image sizes if more than 1.
      var imgClass = value && value.length === 1 ? 'single' : 'multi';
      var media = [];
      if (value) {
        // Build media HTML.
        $.each(value, function eachFile() {
          media.push(indiciaFns.drawMediaFile(doc.id, this, imgClass));
        });
      }
      return media.join('');
    },

    /**
     * Record status and other flag icons.
     */
    status_icons: function statusIcons(doc) {
      return indiciaFns.getEsStatusIcons({
        status: doc.identification.verification_status,
        substatus: doc.identification.verification_substatus,
        query: doc.identification.query ? doc.identification.query : '',
        sensitive: doc.metadata.sensitive,
        confidential: doc.metadata.confidential,
        zero_abundance: doc.occurrence.zero_abundance,
        anonymous: doc.metadata.created_by_id === "1"
      });
    },

    taxon_label: function taxonLabel(doc) {
      var acceptedName;
      if (doc.taxon.taxon_rank_sort_order >= 290) {
        acceptedName = '<em>' + doc.taxon.accepted_name + '</em>';
      } else {
        acceptedName = doc.taxon.taxon_rank + ' ' + doc.taxon.accepted_name;
      }
      if (doc.taxon.vernacular_name) {
        return '<h3>' + doc.taxon.vernacular_name + '</h3>' + acceptedName;
      } else {
        return '<h3>' + acceptedName + '</h3>';
      }
    }
  };

  /**
   * Special fields provided by field convertors are not searchable unless a
   * dedicated function is provided to build an appropriate query string for
   * the user input.
   *
   * This list could also potentially override the search behaviour for normal
   * mapped fields.
   *
   * Builders should return:
   * * false if the input text is not a valid filter.
   * * a string suitable for use as a query_string.
   * * an object that defines any filter suitable for adding to the bool
   *   queries array.
   * The builder can assume that the input text value is already trimmed.
   */
  indiciaFns.fieldConvertorQueryBuilders = {

    /**
     * Builds a nested query for association columns.
     */
    associations: function associations(text) {
      var query = {
        nested: {
          path: 'occurrence.associations',
          query: {
            bool: {
              must: [
                {
                  query_string: {
                    query: text
                  }
                }
              ]
            }
          }
        }
      };
      return {
        bool_clause: 'must',
        value: '',
        query: JSON.stringify(query)
      };
    },

    /**
     * Builds a query for attribute values.
     */
    attr_value: function attrValue(text, params) {
      var filter1 = {};
      var filter2 = {};
      var query;
      filter1[params[0] + '.attributes.id'] = params[1];
      filter2[params[0] + '.attributes.value'] = text;
      query = {
        nested: {
          path: params[0] + '.attributes',
          query: {
            bool: {
              must: [
                { match: filter1 },
                { match: filter2 }
              ]
            }
          }
        }
      };
      return {
        bool_clause: 'must',
        value: '',
        query: JSON.stringify(query)
      };
    },

    /**
     * Handle datasource_code filtering in format website_id [| survey ID].
     */
    datasource_code: function datasourceCode(text) {
      var parts;
      var query;
      if (text.match(/^\d+(\s*\|\s*\d*)?$/)) {
        parts = text.split('|');
        // Search always includes the website ID.
        query = 'metadata.website.id:' + parts[0].trim();
        // Search can optionally include the survey ID.
        if (parts.length > 1 && parts[1].trim() !== '') {
          query += ' AND metadata.survey.id:' + parts[1].trim();
        }
        return query;
      }
      return false;
    },

    /**
     * Event date filtering.
     *
     * Supports yyyy, mm/dd/yyyy or yyyy-mm-dd formats.
     */
    event_date: function eventDate(text) {
      return indiciaFns.dateToEsFilter(text, 'event.date_start');
    },

    /**
     * Builds a nested query for higher geography columns.
     */
    higher_geography: function higherGeography(text, params) {
      var filter = {};
      var query;
      filter['location.higher_geography.' + params[1]] = text;
      query = {
        nested: {
          path: 'location.higher_geography',
          query: {
            bool: {
              must: [
                { match: { 'location.higher_geography.type': params[0] } },
                { match: filter }
              ]
            }
          }
        }
      };
      return {
        bool_clause: 'must',
        value: '',
        query: JSON.stringify(query)
      };
    },

    /**
     * Implement a filter for records near a lat long point.
     */
    lat_lon: function latLon(text) {
      var coords = text.split(/[, ]/);
      var query;
      if (coords.length !== 2) {
        // Invalid format.
        return false;
      }
      coords[0] = coords[0].match(/S$/) ? 0 - coords[0].replace(/S$/, '') : parseFloat(coords[0].replace(/[^\d\.]$/, ''));
      coords[1] = coords[1].match(/W$/) ? 0 - coords[1].replace(/[^\d\.]$/, '') : parseFloat(coords[1].replace(/[^\d\.]$/, ''));
      query = {
        geo_distance: {
          distance: '5km',
          'location.point': {
            lat: coords[0],
            lon: coords[1]
          }
        }
      };
      return {
        bool_clause: 'must',
        value: '',
        query: JSON.stringify(query)
      };
    }
  };

  /**
   * Allow special fields to provide custom hints for their filter row inputs.
   */
  indiciaFns.fieldConvertorQueryDescriptions = {
    lat_lon: 'Enter a latitude and longitude value to filter to records in the vicinity.',
    event_date: 'Enter a date in dd/mm/yyyy or yyyy-mm-dd format. Filtering to a year or range or years is possible ' +
      'using yyyy or yyyy-yyyy format.'
  };

  /**
   * Field convertors which allow sort on underlying fields are listed here.
   *
   * Either specify an array of field names, or an object defining the sort
   * data that needs to be sent in the request.
   */
  indiciaData.fieldConvertorSortFields = {
    // Unsupported possibilities are commented out.
    data_cleaner_icons: ['identification.auto_checks.result'],
    datasource_code: ['metadata.website.id', 'metadata.survey.id'],
    event_date: ['event.date_start'],
    // higher_geography: [],
    // locality: [],
    // Do a distance sort from the North Pole
    lat_lon: {
      _geo_distance: {
        'location.point': {
          lat: 0,
          lon: 0
        },
        order: 'asc',
        unit: 'km'
      }
    },
    status_icons: [
      'identification.verification_status',
      'identification.verification_substatus',
      'metadata.sensitive',
      'metadata.confidential',
      'occurrence.zero_abundance',
      'metadata.created_by_id'
    ],
    'taxon_label': ['taxon.accepted_name']
  };

  /**
   * Walk down a path in a document to find a value.
   */
  indiciaFns.iterateDownPath = function iterateDownPath(doc, path) {
    var pathArray = path.split('.');
    var i;
    var thisPath = doc;
    var filterInfo;
    for (i = 0; i < pathArray.length; i++) {
      // Special case when the path element is [...] as this is a filter on an
      // array of buckets.
      filterInfo = pathArray[i].match(/^\[(.+)=(.+)\]$/);
      if (filterInfo) {
        $.each(thisPath, function eachPathEntry(idx) {
          if (this[filterInfo[1]] === filterInfo[2]) {
            pathArray[i] = idx;
            return false;
          }
          return true;
        });
      }
      if (typeof thisPath[pathArray[i]] === 'undefined') {
        thisPath = '';
        break;
      }
      thisPath = thisPath[pathArray[i]];
    }
    return thisPath;
  };

  /**
   * Retrieves a field value from the document.
   *
   * @param object doc
   *   Document read from Elasticsearch.
   * @param string field
   *   Name of the field. Either a path to the field in the document (such as
   *   taxon.accepted_name) or a special field name surrounded by # characters,
   *   e.g. #locality.
   * @param object colDef
   *   Optional definition of the column.
   */
  indiciaFns.getValueForField = function getValueForField(doc, field, colDef) {
    var convertor;
    // Find location of fields nested in ES response.
    var valuePath = (colDef && colDef.path) ? indiciaFns.iterateDownPath(doc, colDef.path) : doc;
    // Special field handlers are in the list of convertors.
    if (field.match(/^#/)) {
      // Find the convertor definition between the hashes. If there are
      // colons, stuff that follows the first colon are parameters.
      convertor = field.replace(/^#(.+)#$/, '$1').split(':');
      if (typeof indiciaFns.fieldConvertors[convertor[0]] !== 'undefined') {
        return indiciaFns.fieldConvertors[convertor[0]](valuePath, convertor.slice(1));
      }
    }
    // If not a special field, work down the document hierarchy according to
    // the field's path components.
    valuePath = indiciaFns.iterateDownPath(valuePath, field);
    // Reformat date fields to user-friendly format.
    // @todo Localisation for non-UK dates.
    if (field.match(/_on$/)) {
      valuePath = valuePath.replace(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}).*/, '$3/$2/$1 $4:$5');
    }
    // Path might be to an aggregation response object, in which case we just
    // want the value (or value_as_string if aggregation format specified).
    if (valuePath && typeof (valuePath.value_as_string || valuePath.value) !== 'undefined') {
      return valuePath.value_as_string || valuePath.value;
    }
    return valuePath;
  };

  /**
   * Retrieve the grid filter rows which are relevent to an upcoming API request.
   *
   * @return array
   *   List of <tr> DOM elements.
   */
  function getFilterRows(source) {
    var filterRows = [];
    // Any dataGrid this source outputs to may bave a filter row that affects
    // this source.
    if (typeof source.outputs.idcDataGrid !== 'undefined') {
      $.each(source.outputs.idcDataGrid, function eachGrid() {
        filterRows.push($(this).find('.es-filter-row').toArray());
      });
    }
    // Find additional grids that choose to apply their filter to this source.
    $.each($('.idc-dataGrid'), function eachGrid() {
      var grid = this;
      if (grid.settings.applyFilterRowToSources) {
        $.each(this.settings.applyFilterRowToSources, function eachSource() {
          if (this === source.settings.id) {
            filterRows = filterRows.concat($(grid).find('.es-filter-row').toArray());
          }
        });
      }
    });
    return filterRows;
  }

  /**
   * Applies the filter from inputs in a set of filter rows to the request.
   */
  function applyFilterRowsToRequest(filterRows, data) {
    $.each(filterRows, function eachFilterRow() {
      var filterRow = this;
      // Remove search text format errors.
      $(filterRow).find('.fa-exclamation-circle').remove();
      // Build the filter required for values in each filter row input.
      $.each($(filterRow).find('input'), function eachInput() {
        var cell = $(this).closest('td');
        var field = $(cell).attr('data-field');
        var fnQueryBuilder;
        var query;
        var fieldNameParts;
        var fn;
        if ($(this).val().trim() !== '') {
          // If there is a special field name, break it into the name
          // + parameters.
          fieldNameParts = field.replace(/#/g, '').split(':');
          // Remove the convertor name from the start of the array,
          // leaving the parameters.
          fn = fieldNameParts.shift();
          if (typeof indiciaFns.fieldConvertorQueryBuilders[fn] !== 'undefined') {
            // A special field with a convertor function.
            fnQueryBuilder = indiciaFns.fieldConvertorQueryBuilders[fn];
            query = fnQueryBuilder($(this).val().trim(), fieldNameParts);
            if (query === false) {
              // Flag input as invalid.
              $(this).after('<span title="Invalid search text" class="fas fa-exclamation-circle"></span>');
            } else if (typeof query === 'object') {
              // Query is an object, so use it as is.
              data.bool_queries.push(query);
            } else {
              // Query is a string, so treat as a query_string.
              data.bool_queries.push({
                bool_clause: 'must',
                query_type: 'query_string',
                value: query
              });
            }
          } else if (indiciaData.esMappings[field].type === 'keyword' || indiciaData.esMappings[field].type === 'text') {
            // Normal text filter.
            data.textFilters[field] = $(this).val().trim();
          } else if (indiciaData.esMappings[field].type === 'date') {
            // Date filter.
            query = indiciaFns.dateToEsFilter($(this).val().trim(), field);
            if (query === false) {
              $(this).after('<span title="Invalid search text" class="fas fa-exclamation-circle"></span>');
            } else {
              data.bool_queries.push({
                bool_clause: 'must',
                query_type: 'query_string',
                value: query
              });
            }
          } else {
            // Normal numeric filter.
            data.numericFilters[field] = $(this).val().trim();
          }
        }
      });
    });
  }

  /**
   * If parameters named filter-* in the URL, copy to the ES filter.
   */
  function applyQueryStringFiltersToRequest(data) {
    var urlParams = new URLSearchParams(location.search);
    urlParams.forEach(function(value, key) {
      if (key.match(/^filter-/)) {
        if (typeof data.filter_def === 'undefined') {
          data.filter_def = {};
        }
        data.filter_def[key.replace(/^filter-/, '')] = value;
      }
    });
  }

  /**
   * If a standard params filter active on the page, copy it into the ES filter.
   */
  function applyFilterBuilderSettingsToRequest(data) {
    if (indiciaData.filter && indiciaData.filter.def) {
      if (typeof data.filter_def === 'undefined') {
        data.filter_def = {};
      }
      $.extend(data.filter_def, indiciaData.filter.def);
    }
  }

  /**
   * Search area needs to be in GPS Lat Long for ES, not Web Mercator.
   */
  function ensureFilterDefSearchAreaWGS84(data) {
    var geom;
    if (data.filter_def && data.filter_def.searchArea && OpenLayers) {
      geom = OpenLayers.Geometry.fromWKT(data.filter_def.searchArea);
      data.filter_def.searchArea = geom.transform('EPSG:3857', 'EPSG:4326').toString();
    }
  }

  /**
   * Applies any filterBoolClauses in the source's settings to an API request.
   */
  function applyFilterBoolClausesToRequest(source, data) {
    if (source.settings.filterBoolClauses) {
      // Using filter paremeter controls.
      $.each(source.settings.filterBoolClauses, function eachBoolClause(type, filters) {
        $.each(filters, function eachFilter() {
          data.bool_queries.push({
            bool_clause: type,
            query_type: this.query_type,
            field: this.field ? this.field : null,
            query: this.query ? this.query : null,
            value: this.value ? this.value : null,
            nested: this.nested ? this.nested : null
          });
        });
      });
    }
  }

  /**
   * Applies any filters defined by inputs with class es-filter-param to an API request.
   */
  function applyFilterParameterControlsToRequest(data) {
    $.each($('.es-filter-param'), function eachParam() {
      var val = $(this).val();
      // Skip if no value.
      if (val === null || val.trim() === '') {
        return;
      }
      // Skip if unchecked checkbox
      if ($(this).is(':checkbox') && !$(this).is(':checked')) {
        return;
      }
      // Replace tokens in value.
      val = val.trim().replace(/{{ indicia_user_id }}/g, indiciaData.user_id);
      data.bool_queries.push({
        bool_clause: indiciaFns.getDataValueFromInput(this, 'data-es-bool-clause'),
        field: indiciaFns.getDataValueFromInput(this, 'data-es-field'),
        query_type: indiciaFns.getDataValueFromInput(this, 'data-es-query-type'),
        query: indiciaFns.getDataValueFromInput(this, 'data-es-query'),
        nested: indiciaFns.getDataValueFromInput(this, 'data-es-nested'),
        value: val
      });
    });
  }

  /**
   * Apply group reporting filter, e.g. group_id=n?implicit=f in URL.
   */
  function applyGroupFilter(data) {
    if (indiciaData.filter_group_id) {
      if (typeof indiciaData.filter_group_implicit === 'undefined') {
        // Apply default, strictest mode.
        indiciaData.filter_group_implicit = false;
      }
      // Proxy will be responsible for filter setup.
      data.group_filter = {
        id: indiciaData.filter_group_id,
        implicit: indiciaData.filter_group_implicit
      };
    }
  }

  /**
   * Retrieve the value of a named data attribute from an input.
   *
   * If the input is a select, then the selected option can override the
   * attribute specified at the input element level. Returns null if no
   * value available.
   */
  indiciaFns.getDataValueFromInput = function getDataValueFromInput(input, dataName) {
    var option = $(input).find('option:selected');
    var val;
    if (option.length > 0) {
      val = option.attr(dataName);
      if (val) {
        return val;
      }
    }
    val = $(input).attr(dataName);
    return val || null;
  };

  /**
   * Calculated a buffered bounding box for a map query.
   *
   * Buffering used to reduce number of service hits resulting from small pan
   * or zoom movements of the map.
   *
   * @param bounds bounds
   *   Bounds object.
   *
   * @return object
   *   Bounds data buffered.
   */
  function getBufferedBBforQuery(bounds) {
    var width;
    var height;
    if (typeof indiciaData.lastBufferedBB === 'undefined'
        || bounds.getNorth() > indiciaData.lastBufferedBB.north
        || bounds.getSouth() < indiciaData.lastBufferedBB.south
        || bounds.getEast() > indiciaData.lastBufferedBB.east
        || bounds.getWest() < indiciaData.lastBufferedBB.west) {
      // Need a new query bounding box. Build one with a wide buffer.
      width = bounds.getEast() - bounds.getWest();
      height = bounds.getNorth() - bounds.getSouth();
      indiciaData.lastBufferedBB = {
        north: Math.max(-90, Math.min(90, bounds.getNorth() + height * 2)),
        south: Math.max(-90, Math.min(90, bounds.getSouth() - height * 2)),
        east: Math.max(-180, Math.min(180, bounds.getEast() + width * 2)),
        west: Math.max(-180, Math.min(180, bounds.getWest() - width * 2))
      };
    }
    return indiciaData.lastBufferedBB;
  }

  /**
   * Build query data to send to ES proxy.
   *
   * Builds the data to post to the Elasticsearch search proxy to represent
   * the current state of the form inputs on the page.
   *
   * Returns false if the query is linked to a grid selection but there is no
   * selected row.
   *
   * @param object source
   *   The source object.
   * @param bool doingCount
   *   Set to true if getting query data for a request intended to count a
   *   dataset rather than retrieve data. Disables from and sort options,
   *   allowing unnecessary recounts to be avoided.
   */
  indiciaFns.getFormQueryData = function getFormQueryData(source, doingCount) {
    var data = {
      textFilters: {},
      numericFilters: {},
      bool_queries: [],
      user_filters: [],
      refresh_user_filters: false
    };
    var mapToFilterTo = null;
    var bounds;
    var agg = {};
    var filterRows;
    var bufferedBB;
    if (typeof source.settings.size !== 'undefined') {
      data.size = source.settings.size;
    }
    if (!doingCount) {
      if (source.settings.from) {
        data.from = source.settings.from;
      }
      // Sort order of returned documents - only useful for non-aggregated data which have to store
      // sort info in the aggregation itself.
      if (source.settings.sort && !source.settings.aggregation) {
        data.sort = indiciaFns.expandSpecialFieldSortInfo(source.settings.sort, true);
      }
    }
    applyFilterBoolClausesToRequest(source, data);
    if (source.settings.rowFilterField && source.settings.rowFilterValue) {
      // Using a value from selected grid row as a filter, e.g. to show data
      // for the species associated with a selected record.
      data.bool_queries.push({
        bool_clause: 'must',
        field: source.settings.rowFilterField,
        query_type: 'term',
        value: source.settings.rowFilterValue
      });
    } else {
      if (source.settings.filterSourceGrid) {
        // If using a source grid to set the filter but no row data available,
        // don't populate.
        return false;
      }
      applyFilterParameterControlsToRequest(data);
      filterRows = getFilterRows(source);
      applyFilterRowsToRequest(filterRows, data);
      applyQueryStringFiltersToRequest(data);
      applyFilterBuilderSettingsToRequest(data);
      ensureFilterDefSearchAreaWGS84(data);
      // Apply select in user filters drop down.
      if ($('.user-filter').length > 0) {
        $.each($('.user-filter'), function eachUserFilter() {
          if ($(this).val()) {
            data.user_filters.push($(this).val());
            if (indiciaData.esUserFiltersLoaded.indexOf($(this).val()) === -1) {
              data.refresh_user_filters = true;
              indiciaData.esUserFiltersLoaded.push($(this).val());
            }
          }
        });
      }
      // Apply filters from permissionFilters select drop down.
      if ($('.permissions-filter').length > 0 && $('.permissions-filter').val()) {
        // Just pass through permission filter so proxy can apply settings securely.
        data.permissions_filter = $('.permissions-filter').val();
      }
      applyGroupFilter(data);
    }
    // Find the map bounds if limited to the viewport of a map and not counting total.
    if (source.settings.filterBoundsUsingMap) {
      mapToFilterTo = $('#' + source.settings.filterBoundsUsingMap);
      bounds = mapToFilterTo[0].map.getBounds();
      if (mapToFilterTo.length === 0 || !mapToFilterTo[0].map) {
        alert('Data source incorrectly configured. @filterBoundsUsingMap does not point to a valid map.');
      } else if (!doingCount && !source.settings.initialMapBounds || mapToFilterTo[0].settings.initialBoundsSet) {
        if (bounds.getNorth() !== bounds.getSouth() && bounds.getEast() !== bounds.getWest()) {
          bufferedBB = getBufferedBBforQuery(bounds);
          data.bool_queries.push({
            bool_clause: 'must',
            query_type: 'geo_bounding_box',
            value: {
              ignore_unmapped: true,
              'location.point': {
                top_left: {
                  lat: bufferedBB.north,
                  lon: bufferedBB.west
                },
                bottom_right: {
                  lat: bufferedBB.south,
                  lon: bufferedBB.east
                }
              }
            }
          });
        }
      }
      source.settings.showGeomsAsTooClose = source.settings.mode === 'mapGridSquare' && source.settings.switchToGeomsAt
        && mapToFilterTo[0].map.getZoom() >= source.settings.switchToGeomsAt;
    }
    if (source.settings.showGeomsAsTooClose) {
      // Maximum
      data.size = 10000;
      data._source = ['location.geom', 'location.point', 'location.coordinate_uncertainty_in_meters'];
    } else if (source.settings.aggregation) {
      // Copy to avoid changing original.
      $.extend(true, agg, source.settings.aggregation);
      if (doingCount && source.settings.mode === 'termAggregation' && agg._idfield) {
        delete agg._idfield.terms.order;
      }
      if (source.settings.mode === 'mapGridSquare' && mapToFilterTo) {
        // Set grid square size if auto.
        indiciaFns.findAndSetValue(agg, 'field', $(mapToFilterTo).idcLeafletMap('getAutoSquareField'), 'autoGridSquareField');
        // Don't display unsuitably imprecise data.
        data.numericFilters['location.coordinate_uncertainty_in_meters'] = '0-' + $(mapToFilterTo).idcLeafletMap('getAutoSquareSize');
      } else if (source.settings.mode === 'mapGeoHash' && mapToFilterTo) {
        // Set geohash_grid precision.
        // See https://gis.stackexchange.com/questions/231719/calculating-optimal-geohash-precision-from-bounding-box
        var viewportAreaSqDegrees = (bounds.getEast() - bounds.getWest()) * (bounds.getNorth() - bounds.getSouth());
        var hashPrecisionAreas = [2025, 63.281, 1.97754, 0.061799, 0.0019311904, 0.0000603497028, 0.000001885928, 0.0000000589352567];
        var precision = 1;
        for (var i = 8; i >= 1; i--) {
          if (viewportAreaSqDegrees / hashPrecisionAreas[i - 1] < 10000) {
            precision = i;
            break;
          }
        }
        indiciaFns.findAndSetValue(agg, 'precision', precision);
      }
      data.aggs = agg;
    }
    return data;
  };
}());

jQuery(document).ready(function docReady() {
  'use strict';
  var $ = jQuery;

  // Hook up higher geography controls.
  $('.es-higher-geography-select').addClass('es-filter-param');
  $('.es-higher-geography-select').attr('data-es-bool-clause', 'must');
  $('.es-higher-geography-select').attr('data-es-query', JSON.stringify({
    nested: {
      path: 'location.higher_geography',
      query: {
        bool: {
          must: [
            { match: { 'location.higher_geography.id': '#value#' } }
          ]
        }
      }
    }
  }));

  // Hook up unindexed location controls.
  $('.es-location-select-geom').attr('data-es-query', JSON.stringify({
    geo_shape: {
      "location.geom": {
        shape: '#value#',
        relation: 'intersects',
      },
    },
  }));

  /**
   * A generic change handler for higher geography and normal location selects.
   *
   * @param DOM select
   *   Select control.
   * @param function callback
   *   Will be called with polygon data loaded from warehouse, or empty array
   *   if nothing selected.
   */
  function onLocationSelectChange(select, callback) {
    var baseId;
    var idx = 0;
    var thisSelect;
    var locIdToLoad;
    // Find the most precise specified boundary in the list of linked selects.
    if ($(select).hasClass('linked-select')) {
      baseId = select.id.replace(/\-\d+$/, '');
      thisSelect = $('#' + baseId + '-' + idx);
      while (thisSelect.length) {
        if ($(thisSelect).val() && $(thisSelect).val().match(/^\d+$/)) {
          locIdToLoad = $(thisSelect).val();
        }
        idx++;
        thisSelect = $('#' + baseId + '-' + idx);
      }
    } else {
      locIdToLoad = $(select).val();
    }
    if (locIdToLoad && locIdToLoad.match(/^\d+$/)) {
      $.getJSON(indiciaData.warehouseUrl + 'index.php/services/report/requestReport?' +
          'report=library/locations/location_boundary_projected.xml' +
          '&reportSource=local&srid=4326&location_id=' + locIdToLoad +
          '&nonce=' + indiciaData.read.nonce + '&auth_token=' + indiciaData.read.auth_token +
          '&mode=json&callback=?', function(data) {
        if (callback) {
          callback(data);
        }
        // Draw the polygon.
        $.each($('.idc-leafletMap'), function eachMap() {
          var map = this;
          $.each(data, function() {
            $(map).idcLeafletMap('showFeature', this.boundary_geom, true);
          });
        });
      });
    } else {
      // Not selected, so clear the current selection.
      if (callback) {
        callback([]);
      }
      $.each($('.idc-leafletMap.leaflet-container'), function eachMap() {
        $(this).idcLeafletMap('clearFeature');
        $(this).idcLeafletMap('resetViewport');
      });
    }
  }

  // Hook up event handler to location select controls.
  $('.es-higher-geography-select').change(function selectChange() {
    onLocationSelectChange(this, null);
  });

  $('.es-location-select').change(function selectChange() {
    var changedSelect = this;
    // Callback needs to handle the geometry filters.
    onLocationSelectChange(this, function callback(data) {
      if (data.length === 0) {
        $('.es-location-select-geom').val('');
      }
      else {
        // Empty the location select geom controls, then set the one at the
        // correct level for the selected location type.
        $('#' + changedSelect.id + '-geom').val(data[0].boundary_geom);
      }
      // Update the sources.
      $('#' + changedSelect.id + '-geom').change();
    });
  });

  /**
   * Change event handlers on filter inputs.
   */
  $('.es-filter-param, .user-filter, .permissions-filter').change(function eachFilter() {
    // Force map to update viewport for new data.
    $.each($('.idc-leafletMap'), function eachMap() {
      this.settings.initialBoundsSet = false;
    });
    // Reload all sources.
    $.each(indiciaData.esSourceObjects, function eachSource() {
      // Reset to first page.
      this.settings.from = 0;
      this.populate();
    });
  });
});
