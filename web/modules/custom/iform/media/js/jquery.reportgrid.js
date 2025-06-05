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

/**
 * JQuery report grid widget for Indicia. Note that this is designed to attach to an already
 * loaded HTML grid (loaded using PHP on page load), and provides AJAX pagination and sorting without
 * page refreshes. It does not do the initial grid load operation.
 */

(function ($) {
  'use strict';
  /**
   *Function to enable tooltips for the filter inputs
   */
  indiciaFns.simpleTooltip = function (targetItems, name) {
    $(targetItems).each(function (i) {
      var myTooltip;
      $('body').append('<div class="' + name + '" id="' + name + i + '"><p>' + $(this).attr('title') + '</p></div>');
      myTooltip = $('#' + name + i);
      if (myTooltip.width() > 450) {
        myTooltip.css({ width: '450px' });
      }

      if ($(this).attr('title') !== '' && typeof $(this).attr('title') !== 'undefined') {
        $(this).removeAttr('title').mouseover(function () {
          var inputRect = this.getBoundingClientRect();
          var tooltipRect = myTooltip[0].getBoundingClientRect();
          var leftPos = Math.min(inputRect.left, $(window).width() - tooltipRect.width);
          var topPos = inputRect.bottom + 4;
          if (topPos + tooltipRect.height > $(window).height()) {
            topPos = inputRect.top - (tooltipRect.height + 4);
          }
          topPos += $(window).scrollTop();
          myTooltip.css({ left: leftPos, top: topPos, opacity: 0.8, display: 'none' }).fadeIn(400);
          if ($(this).closest('tr').length) {
            // we don't want the row title tooltip muddling with this one
            $(this).closest('tr').removeAttr('title');
          }
        })
        .mouseout(function () {
          myTooltip.css({ left: '-9999px' });
        });
      }
    });
  };

  $.fn.reportgrid = function (options) {
    // Extend our default options with those provided, basing this on an empty object
    // so the defaults don't get changed.
    var opts = $.extend({}, $.fn.reportgrid.defaults, options);
    // flag to prevent double clicks
    var loading = false;
    // prevent duplicate error messages
    var errorShownOnFilter = false;

    function getRequest(div) {
      var serviceCall;
      var request;
      if (div.settings.mode === 'report') {
        serviceCall = 'report/requestReport?report=' + div.settings.dataSource + '.xml&reportSource=local&';
      } else if (div.settings.mode === 'direct') {
        serviceCall = 'data/' + div.settings.dataSource + '?';
      }
      request = div.settings.url + 'index.php/services/' +
          serviceCall +
          'mode=json&nonce=' + div.settings.nonce +
          '&auth_token=' + div.settings.auth_token +
          '&view=' + div.settings.view +
          '&callback=?';
      return request;
    }

    function getUrlParamsForAllRecords(div) {
      var request = {};
      var paramName;
      if (typeof div.settings.extraParams !== 'undefined') {
        $.each(div.settings.extraParams, function (key, value) {
          // skip sorting params if the grid has its own sort applied by clicking a column title
          if ((key !== 'orderby' && key !== 'sortdir') || div.settings.orderby === null) {
            request[key] = value;
          }
        });
      }
      // Extract any parameters from the attached form as long as they are report parameters
      $('form#' + div.settings.reportGroup + '-params').find(':input[name]').each(function () {
        if (this.type !== 'submit' && $(this).attr('name').indexOf(div.settings.reportGroup + '-') === 0
            && (this.type !== 'checkbox' || $(this).prop('checked'))) {
          paramName = $(this).attr('name').replace(div.settings.reportGroup + '-', '');
          request[paramName] = $(this).val();
        }
      });
      $.extend(request, getQueryParam(div), div.settings.immutableParams);
      return request;
    }

    function mergeParamsIntoTemplate (div, params, template) {
      var r = template;
      $.each(params, function (param) {
        var paramStr = params[param] || '';
        var regex = new RegExp('\\{' + param + '\\}', 'g');
        var regexEsc = new RegExp('\\{' + param + '-escape-quote\\}', 'g');
        var regexEscDbl = new RegExp('\\{' + param + '-escape-dblquote\\}', 'g');
        var regexHtmlEsc = new RegExp('\\{' + param + '-escape-htmlquote\\}', 'g');
        var regexHtmlEscDbl = new RegExp('\\{' + param + '-escape-htmldblquote\\}', 'g');
        var regexHtmlEscUrl = new RegExp('\\{' + param + '-escape-urlpath\\}', 'g');
        r = r.replace(regex, paramStr);
        r = r.replace(regexEsc, paramStr.replace(/'/g, "\\'"));
        r = r.replace(regexEscDbl, paramStr.replace(/"/g, '\\"'));
        r = r.replace(regexHtmlEsc, paramStr.replace(/'/g, '&#39;'));
        r = r.replace(regexHtmlEscDbl, paramStr.replace(/"/g, '&quot;'));
        // Convert to lowercase, hyphen separated, with leading/trailing hyphens trimmed.
        r = r.replace(regexHtmlEscUrl, paramStr.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9\-]/g, '').replace(/^\-+|\-+$/g, ''));
      });
      // Also do some standard params from the settings, for various paths/urls
      r = r.replace(/\{rootFolder\}/g, div.settings.rootFolder);
      r = r.replace(/\{sep\}/g, div.settings.rootFolder.indexOf('?') === -1 ? '?' : '&');
      r = r.replace(/\{imageFolder\}/g, div.settings.imageFolder);
      r = r.replace(/\{currentUrl\}/g, div.settings.currentUrl);
      return r;
    }

    function getActions (div, row, actions, queryParams) {
      var result = '';
      var onclick;
      var href;
      var content;
      var img;
      var classAttr;
      var classes;
      var link;
      var linkParams;
      var thisrow = $.extend(queryParams, row);
      $.each(actions, function (idx, action) {
        if (typeof action.visibility_field === 'undefined' || thisrow[action.visibility_field] !== 'f') {
          if (typeof action.javascript !== 'undefined') {
            onclick = ' onclick="' + mergeParamsIntoTemplate(div, thisrow, action.javascript) + '"';
          } else {
            onclick = '';
          }
          if (typeof action.url !== 'undefined') {
            link = action.url;
            linkParams = [];
            thisrow.rootFolder = div.settings.rootFolder;
            if (div.settings.pathParam !== '' &&
                link.indexOf('?' + div.settings.pathParam + '=') === -1 &&
                thisrow.rootFolder.indexOf('?' + div.settings.pathParam + '=') === -1) {
              // if there is a path param but it is not in either the link or the rootfolder already then add it to the rootFolder
              thisrow.rootFolder += '?' + div.settings.pathParam + '=';
            }
            if (link.substr(0, 12).toLowerCase() !== '{rootfolder}' && link.substr(0, 12).toLowerCase() !== '{currenturl}'
                && link.substr(0, 4).toLowerCase() !== 'http') {
              link = '{rootFolder}' + link;
            }
            link = mergeParamsIntoTemplate(div, thisrow, link);
            if (!$.isEmptyObject(action.urlParams)) {
              if (link.indexOf('?') === -1) {
                link += '?';
              } else {
                link += '&';
              }
              $.each(action.urlParams, function (name, value) {
                linkParams.push(name + '=' + value);
              });
            }
            link += mergeParamsIntoTemplate(div, thisrow, linkParams.join('&'));
            href = ' href="' + link + '"';
          } else {
            href = '';
          }
          if (typeof action.img !== 'undefined') {
            img = action.img.replace(/\{rootFolder\}/g, div.settings.rootFolder.replace(/\?q=$/, ''));
            content = '<img src="' + img + '" title="' + action.caption + '" />';
          } else {
            content = action.caption;
          }
          classes = ['action-button'];
          if (typeof action.class !== 'undefined') {
            classes.push(action.class);
          }
          classAttr = ' class="' + classes.join(' ') + '"';
          result += mergeParamsIntoTemplate(div,
              { class: classAttr, href: href, onclick: onclick, content: content },
              div.settings.actionButtonTemplate
          );
          // result += '<a class="' + classlist + '" ' + onclick + href + '>' + content + '</a>';
        }
      });
      return result;
    }

    function loadColPickerSettingsFromCookie(div) {
      var visibleCols;
      // the col picker only saves to cookie if grid id specified, otherwise you get grids overwriting each other's settings
      if (typeof $.cookie !== 'undefined' && !div.id.match(/^report-grid-\d+$/)) {
        visibleCols = $.cookie(div.id + '-visibleCols');
        if (visibleCols) {
          visibleCols = visibleCols.split(',');
          $(div).find("th[class^='col-'],th[class*=' col-'],td[class^='col-'],td[class*=' col-']").hide();
          $.each(visibleCols, function () {
            $(div).find('.col-' + this).show();
          });
        }
      }
    }

    function simplePager (pager, div, hasMore) {
      var pagerContent = '';
      if (div.settings.offset !== 0) {
        pagerContent += '<a class="pag-prev pager-button" rel="nofollow" href="#">previous</a> ';
      } else {
        pagerContent += '<span class="pag-prev pager-button ui-state-disabled">previous</span> ';
      }

      if (hasMore) {
        pagerContent += '<a class="pag-next pager-button" rel="nofollow" href="#">next</a>';
      } else {
        pagerContent += '<span class="pag-next pager-button ui-state-disabled">next</span>';
      }
      if (div.settings.offset !== 0 || hasMore) {
        pager.append(pagerContent);
      }
    }

    function advancedPager (pager, div, hasMore) {
      var pagerContent = div.settings.pagingTemplate;
      var pagelist = '';
      var page;
      var showing = div.settings.langShowing;
      if (div.settings.offset !== 0) {
        pagerContent = pagerContent.replace('{prev}', '<a class="pag-prev pager-button" rel="nofollow" href="#">' + div.settings.langPrev + '</a> ');
        pagerContent = pagerContent.replace('{first}', '<a class="pag-first pager-button" rel="nofollow" href="#">' + div.settings.langFirst + '</a> ');
      } else {
        pagerContent = pagerContent.replace('{prev}', '<span class="pag-prev pager-button ui-state-disabled">' + div.settings.langPrev + '</span> ');
        pagerContent = pagerContent.replace('{first}', '<span class="pag-first pager-button ui-state-disabled">' + div.settings.langFirst + '</span> ');
      }

      if (hasMore) {
        pagerContent = pagerContent.replace('{next}', '<a class="pag-next pager-button" rel="nofollow" href="#">' + div.settings.langNext + '</a> ');
        pagerContent = pagerContent.replace('{last}', '<a class="pag-last pager-button" rel="nofollow" href="#">' + div.settings.langLast + '</a> ');
      } else {
        pagerContent = pagerContent.replace('{next}', '<span class="pag-next pager-button ui-state-disabled">' + div.settings.langNext + '</span> ');
        pagerContent = pagerContent.replace('{last}', '<span class="pag-last pager-button ui-state-disabled">' + div.settings.langLast + '</span> ');
      }

      for (page = Math.max(1, div.settings.offset/div.settings.itemsPerPage - 4);
          page <= Math.min(div.settings.offset/div.settings.itemsPerPage + 6, Math.ceil(div.settings.recordCount / div.settings.itemsPerPage));
          page += 1) {
        if (page === div.settings.offset / div.settings.itemsPerPage + 1) {
          pagelist += '<span class="pag-page pager-button ui-state-disabled" id="page-' + div.settings.id + '-' + page + '">' + page + '</span> ';
        } else {
          pagelist += '<a href="#" class="pag-page pager-button" rel="nofollow" id="page-' + div.settings.id + '-' + page + '">' + page + '</a> ';
        }
      }
      pagerContent = pagerContent.replace('{pagelist}', pagelist);
      if (div.settings.recordCount === 0) {
        pagerContent = pagerContent.replace('{showing}', div.settings.noRecords);
      } else if (div.settings.offset + 1 > div.settings.recordCount) {
        pagerContent = pagerContent.replace('{showing}', '');
      } else {
        showing = showing.replace('{1}', div.settings.offset + 1);
        showing = showing.replace('{2}', div.settings.offset + div.settings.currentPageCount);
        showing = showing.replace('{3}', div.settings.recordCount);
        pagerContent = pagerContent.replace('{showing}', showing);
      }

      pager.append(pagerContent);
    }

    /**
     * Stores the current page in a cookie, if being remembered.
     */
    function storeCurrentPageCookie(settings) {
      if (settings.rememberGridPosition) {
        indiciaFns.cookie('report-page-' + opts.id, Math.round(settings.offset / opts.itemsPerPage));
      }
    }

    /**
     * Attach event handlers to the pager buttons.
     *
     * @param DOM div
     *   Report grid container.
     */
    function setupPagerEvents(div) {
      var lastPageOffset = Math.max(0, Math.floor((div.settings.recordCount - 1) / div.settings.itemsPerPage)
        * div.settings.itemsPerPage);
      // Define pagination clicks.
      if (div.settings.itemsPerPage !== null) {
        $(div).find('.pager .pag-next').click(function (e) {
          e.preventDefault();
          if (div.loading) { return; }
          div.loading = true;
          div.settings.offset += div.settings.currentPageCount; // in case not showing full page after deletes
          if (div.settings.offset > lastPageOffset) {
            div.settings.offset = lastPageOffset;
          }
          storeCurrentPageCookie(div.settings);
          load(div, false);
        });

        $(div).find('.pager .pag-prev').click(function (e) {
          e.preventDefault();
          if (div.loading) { return; }
          div.loading = true;
          div.settings.offset -= div.settings.itemsPerPage;
          // Min offset is zero.
          if (div.settings.offset < 0) {
            div.settings.offset = 0;
          }
          storeCurrentPageCookie(div.settings);
          load(div, false);
        });

        $(div).find('.pager .pag-first').click(function (e) {
          e.preventDefault();
          if (div.loading) { return; }
          div.loading = true;
          div.settings.offset = 0;
          storeCurrentPageCookie(div.settings);
          load(div, false);
        });

        $(div).find('.pager .pag-last').click(function (e) {
          e.preventDefault();
          if (div.loading) { return; }
          div.loading = true;
          div.settings.offset = lastPageOffset;
          storeCurrentPageCookie(div.settings);
          load(div, false);
        });

        $(div).find('.pager .pag-page').click(function (e) {
          e.preventDefault();
          if (div.loading) { return; }
          div.loading = true;
          var page = this.id.replace('page-' + div.settings.id + '-', '');
          div.settings.offset = (page - 1) * div.settings.itemsPerPage;
          storeCurrentPageCookie(div.settings);
          load(div, false);
        });
      }
    }

    // recreate the pagination footer
    function updatePager (div, hasMore) {
      var pager = $(div).find('.pager');
      pager.empty();
      if (typeof div.settings.recordCount === 'undefined') {
        simplePager(pager, div, hasMore);
      } else {
        advancedPager(pager, div, hasMore);
      }
      setupPagerEvents(div);
    }

    /**
     * Returns the query parameter, which filters the output based on the filters and filtercol/filtervalue.
     */
    function getQueryParam (div) {
      var query = {};
      var needQuery = false;
      if (div.settings.filterCol !== null && div.settings.filterValue !== null) {
        query.like = {};
        query.like[div.settings.filterCol] = div.settings.filterValue;
        needQuery = true;
      }
      // were any predefined parameter values supplied?
      if (typeof div.settings.filters !== 'undefined') {
        $.each(div.settings.filters, function (name, value) {
          if (Array.isArray(value)) {
            if (typeof query.in === 'undefined') {
              query.in = {};
            }
            query.in[name] = value;
          } else {
            if (typeof query.where === 'undefined') {
              query.where = {};
            }
            query.where[name] = value;
          }
          needQuery = true;
        });
      }
      if (needQuery) {
        return { query: JSON.stringify(query) };
      }
      return {};
    }

    /*
     * Function to remove items from a supplied set of rows based on the selections
     * the user has made on the popup filter page.
     * Returns an array containing the rows to keep.
     */
    function applyPopupFilterExclusionsToRows(rows, div) {
      var rowsToDisplay = [];
      var keepRow;
      // Keep a count of each row we have worked on starting from 1.
      var rowCount = 1;
      indiciaData.popupFilterRemovedRowsCount = 0;
      indiciaData.allReportGridRecords = [];
      $.each(rows, function(rowIdx, theRow) {
        // To start assume we are keeping the data
        keepRow = true;
        // Only need to exclude data if the user has set the option to do so
        if (indiciaData.dataToExclude) {
          $.each(indiciaData.dataToExclude, function(exclusionIdx, exclusionData) {
            // each dataToExclude item contains an array of the database field (such as occurrence_id) and
            // the data to exclude (such 6301). If we find for a row that the database field and the data for that field match an
            // item in the dataToExclude array, then we know to exclude it.
            if (theRow[exclusionData[0]]==exclusionData[1]) {
              keepRow = false;
              indiciaData.popupFilterRemovedRowsCount++;
            }
          });
        }
        // After testing each row, then if it hasn't been excluded, then keep it.
        if (keepRow === true) {
          // Only display the row itself if it is greater than the offset value. The offset number tells
          // the system how many rows there are before the report grid page the user is actually viewing.
          // So If there are 4 items per page, and the user is viewing page 3, then the offset is 8.
          if (div.settings.offset<rowCount) {
            rowsToDisplay.push(theRow);
          }
          // Note the difference between "rowsToDisplay" and "indiciaData.allReportGridRecords" is that indiciaData.allReportGridRecords includes more items, as "rowsToDisplay" doesn't include
          // rows on pages on the grid previous to the one the user is currently viewing.
          // indiciaData.allReportGridRecords is used to display the options on the popup filter, this needs all the items on the
          // grid regardless of whether they are actually displayed on screen (e.g items on pages previous to the one being viewed).
          indiciaData.allReportGridRecords.push(theRow);
          rowCount++;
        }
      });

      return rowsToDisplay;
    }

    function loadGridFrom(div, request, clearExistingRows, callback) {
      var rowTitle;
      $(div).find('.loading-spinner').show();
      // If the grid is too tall to fit on the page, temporarily shrink it to ensure
      // the loading spinner is visible.
      $(div).css('max-height', $(window).height() - $(div).offset().top + $(window).scrollTop() - 20);
      div.settings.populated = true;
      $.ajax({
        dataType: 'json',
        url: request,
        data: null,
        success: function(response) {
          var tbody = $(div).find('tbody');
          var rows;
          var rowclass;
          var rowclasses;
          var tdclasses;
          var classes;
          var hasMore = false;
          var rowInProgress = false;
          var rowOutput = '';
          var rowId;
          var features = [];
          var feature;
          var geom;
          var map;
          var valueData;
          // if we get a count back then the structure is slightly different
          if (typeof response.count === 'undefined') {
            rows = response;
          } else {
            rows = response.records;
          }
          // Get the rows on the grid as they first appear on the page, before any filtering is applied.
          if (!indiciaData.initialReportGridRecords) {
            indiciaData.initialReportGridRecords = rows;
          }
          // The report grid can be configured with a popup that allows the user to remove rows containing particular
          // data from the grid e.g. if there is a location column, then the user can select not to show rows containing the data East Sussex.
          if (indiciaData.includePopupFilter) {
            rows = applyPopupFilterExclusionsToRows(rows, div);
          }
          div.settings.currentPageCount = Math.min(rows.length, div.settings.itemsPerPage);
          // clear current grid rows
          if (clearExistingRows) {
            tbody.children().remove();
          }
          if (typeof rows.error !== 'undefined') {
            div.loading = false;
            $(div).find('.loading-spinner').hide();
            $(div).css('max-height', '');
            if (!errorShownOnFilter) {
              alert('The data did not load successfully. The reason given was: \n' + rows.error);
              errorShownOnFilter = true;
            }
            return;
          }
          if (div.settings.sendOutputToMap && typeof indiciaData.reportlayer !== 'undefined') {
            indiciaData.mapdiv.removeAllFeatures(indiciaData.reportlayer, 'linked');
          }
          rowTitle = (div.settings.rowId && typeof indiciaData.reportlayer !== 'undefined') ?
            ' title="' + div.settings.msgRowLinkedToMapHint + '"' : '';
          if (rows.length === 0) {
            var viscols = 0;
            var msg;
            $.each(div.settings.columns, function(idx, col) {
              if (col.visible !== false && col.visible !== 'false') {
                viscols++;
              }
            });
            if (div.settings.offset === 0) {
              msg = div.settings.msgNoInformation;
              $(div).find('.pager').hide();
            }
            else {
              msg = div.settings.noInfoAsPageTooHigh;
              $(div).find('.pager').show();
            }
            tbody.append('<tr class="empty-row"><td colspan="' + viscols + '">' + msg + '</td></tr>');
          } else {
            $(div).find('.pager').show();
          }
          var queryParams = indiciaFns.getUrlVars();
          $.each(rows, function (rowidx, row) {
            if (div.settings.rowClass !== '') {
              rowclasses = [mergeParamsIntoTemplate(div, row, div.settings.rowClass)];
            } else {
              rowclasses = [];
            }
            if (div.settings.altRowClass !== '' && rowidx % 2 === 0) {
              rowclasses.push(div.settings.altRowClass);
            }
            rowclass = (rowclasses.length > 0) ? 'class="' + rowclasses.join(' ') + '" ' : '';
            // We asked for one too many rows. If we got it, then we can add a next page button
            if (div.settings.itemsPerPage !== null && rowidx >= div.settings.itemsPerPage) {
              hasMore = true;
            } else {
              rowId = (div.settings.rowId !== '') ? 'id="row' + row[div.settings.rowId] + '" ' : '';
              // Initialise a new row, unless this is a gallery with multi-columns and not starting a new line
              if ((rowidx % div.settings.galleryColCount) === 0) {
                rowOutput = '<tr ' + rowId + rowclass + rowTitle + '>';
                rowInProgress=true;
              }
              // decode any json columns
              $.each(div.settings.columns, function(idx, col) {
                if (typeof col.json !== 'undefined' && col.json && typeof row[col.fieldname] !== 'undefined') {
                  valueData = JSON.parse(row[col.fieldname]);
                  $.extend(row, valueData);
                }
              });
              $.each(div.settings.columns, function(idx, col) {
                tdclasses = [];
                if (div.settings.sendOutputToMap && typeof indiciaData.reportlayer !== 'undefined' &&
                    typeof col.mappable !== 'undefined' && (col.mappable === 'true' || col.mappable === true)) {
                  map=indiciaData.mapdiv.map;
                  geom=OpenLayers.Geometry.fromWKT(row[col.fieldname]);
                  if (map.projection.getCode() != map.div.indiciaProjection.getCode()) {
                    geom.transform(map.div.indiciaProjection, map.projection);
                  }
                  feature = new OpenLayers.Feature.Vector(geom, {type: 'linked'});
                  if (div.settings.rowId !== "") {
                    feature.id = row[div.settings.rowId];
                    feature.attributes[div.settings.rowId] = row[div.settings.rowId];
                  }
                  features.push(feature);
                }
                if (col.visible !== false && col.visible !== 'false') {
                  if ((col.img === true || col.img === 'true') && row[col.fieldname] !== null && row[col.fieldname] !== '' && typeof col.template === 'undefined') {
                    var imgs = row[col.fieldname].split(','), match, value='',
                      imgclass=imgs.length>1 ? 'multi' : 'single',
                      group=imgs.length>1 && div.settings.rowId !== '' ? 'group-' + row[div.settings.rowId] + '"' : '';
                    $.each(imgs, function(idx, img) {
                      var mediaInfo;
                      var mediaInfoAttr = '';
                      var entity;
                      var matches;
                      var iNatThumbnail;
                      if (div.settings.rowId) {
                        if (matches = div.settings.rowId.match(/([a-z_]+)_id$/)) {
                          entity = matches[1];
                        } else {
                          entity = div.settings.entity ? div.settings.entity : 'occurrence';
                        }
                        mediaInfo = {
                          path: img
                        };
                        mediaInfo[entity + '_id'] = row[div.settings.rowId];
                        mediaInfoAttr = 'data-media-info="' + indiciaFns.escapeHtml(JSON.stringify(mediaInfo)) + '" ';
                      }
                      match = img.match(/^http(s)?:\/\/(www\.)?([a-z]+(\.kr)?)/);
                      if (match !== null) {
                        if (img.match(/^https:\/\/static\.inaturalist\.org/)) {
                          iNatThumbnail = div.settings.imageThumbPreset === 'med' ? img.replace('/square.', '/medium.') : img;
                          value += '<a ' + mediaInfoAttr +
                            'href="' + img.replace('/square.', '/original.') + '" ' +
                            'data-fancybox="' + group + '" class="inaturalist ' + imgclass + '"><img src="' + iNatThumbnail + '" /></a>';
                        } else {
                          value += '<a ' + mediaInfoAttr +
                            'href="' + img + '" class="social-icon ' + match[3].replace('.', '') + '"></a>';
                        }
                      } else if ($.inArray(img.split('.').pop(), ['mp3', 'wav']) > -1) {
                        value += '<audio controls src="' + div.settings.imageFolder + img + '" ' + mediaInfoAttr + 'type="audio/mpeg"/>';
                      } else {
                        value += '<a ' + mediaInfoAttr +
                            'href="' + div.settings.imageFolder + img + '" ' + 'class="' + imgclass + '" data-fancybox="' + group + '">' +
                            '<img src="' + div.settings.imageFolder + div.settings.imageThumbPreset + '-' + img + '" />' +
                            '</a>';
                      }
                    });
                    row[col.fieldname] = value;
                  }
                  if (col.img === true || col.img === 'true') {
                    tdclasses.push('table-gallery');
                  }
                  // either template the output, or just use the content according to the fieldname
                  if (typeof col.template !== 'undefined') {
                    value = mergeParamsIntoTemplate(div, row, col.template);
                  } else if (typeof col.actions !== 'undefined') {
                    value = getActions(div, row, col.actions, queryParams);
                    tdclasses.push('col-actions');
                  } else {
                    value = indiciaFns.escapeHtml(row[col.fieldname]);
                    tdclasses.push('data');
                  }
                  if (col.fieldname) {
                    tdclasses.push('col-' + col.fieldname);
                  }
                  if (typeof col['class'] !== 'undefined' && col['class'] !== '') {
                    tdclasses.push(col['class']);
                  }
                  // clear null value cells
                  value = (value === null || typeof value === 'undefined') ? '' : value;
                  classes = (tdclasses.length === 0) ? '' : ' class="' + tdclasses.join(' ') + '"';
                  rowOutput += '<td' + classes + '>' + value + '</td>';
                }
              });
              if ((rowidx % div.settings.galleryColCount) === div.settings.galleryColCount-1) {
                rowOutput += '</tr>';
                tbody.append(rowOutput);
                rowInProgress = false;
              }
            }
          });
          if (rowInProgress) {
            rowOutput += '</tr>';
            tbody.append(rowOutput);
          }
          if (features.length > 0) {
            indiciaData.reportlayer.addFeatures(features);
            map.zoomToExtent(indiciaData.reportlayer.getDataExtent());
          }

          // Set a class to indicate the sorted column
          $('#' + div.id + ' th').removeClass('asc').removeClass('desc');
          if (div.settings.orderby) {
            $('#' + div.id + '-th-' + div.settings.orderby).addClass(div.settings.sortdir.toLowerCase());
          }
          updatePager(div, hasMore);
          div.loading=false;
          setupReloadLinks(div);
          $(div).find(".loading-spinner").hide();
          $(div).css('max-height', '');
          // execute callback it there is one
          if (div.settings.callback !== '') {
            window[div.settings.callback](div);
          }
          if (typeof callback !== 'undefined') {
            callback(response);
          }
          loadColPickerSettingsFromCookie(div);
        },
        error: function () {
          div.loading = false;
          $(div).find('.loading-spinner').hide();
          $(div).css('max-height', '');
          alert('The report did not load correctly.');
        }
      });
    }

    /**
     * Build the URL required for a report request, excluding the pagination (limit + offset) parameters. Option to exclude the sort info and idlist param.
     */
    function getFullRequestPathWithoutPaging(div, sort, idlist, knownCount) {
      var request = getRequest(div), params = getUrlParamsForAllRecords(div);
      $.each(params, function (key, val) {
        if (typeof knownCount === 'undefined' || knownCount === true || key !== 'knownCount') {
          if (!idlist && key === 'idlist') {
            // skip the idlist param value as we want the whole map
            val = '';
          }
          request += '&' + key + '=' + encodeURIComponent(val);
        }
      });
      if (sort && div.settings.orderby !== null) {
        request += '&orderby=' + div.settings.orderby + '&sortdir=' + div.settings.sortdir;
      }
      return request;
    }

    /**
     * When a response received from a report service call, update count and
     * pager info.
     */
    function updateCountFromResponse(div, response) {
      var count;
      if (typeof response.count !== 'undefined') {
        count = parseInt(response.count, 10);
        if (indiciaData.includePopupFilter) {
          count -= indiciaData.popupFilterRemovedRowsCount;
        }
        div.settings.recordCount = count;
        div.settings.extraParams.knownCount = count;
        updatePager(div, div.settings.itemsPerPage!== null && div.settings.recordCount > (div.settings.offset + div.settings.itemsPerPage));
      }
    }

    /**
     * Function to make a service call to load the grid data.
     */
    function load(div, recount) {
      var request;
      if (recount) {
        delete div.settings.recordCount;
        delete div.settings.extraParams.knownCount;
      }
      request = getFullRequestPathWithoutPaging(div, true, true);

      // If using the popup filter, we don't want to perform any offset until after records are returned and filtered.
      if (!indiciaData.includePopupFilter) {
        request += '&offset=' + div.settings.offset;
      }
      // Ask for one more row than we need so we know if the next page link is available
      if (div.settings.itemsPerPage !== null && !indiciaData.includePopupFilter) {
        // If using a popup filter, we need to return all items from the report so that we can populate the popup.
        // Normally records are returned one page at a time. We load +1 records in case recordCount is not available so we
        // know if there is a next page of records (not necessary when loading 0 records to get just column metadata etc).
        request += '&limit=' + (div.settings.itemsPerPage === 0 ? 0 : div.settings.itemsPerPage + 1);
      }
      if (recount) {
        // Call the report API with a callback that will update count info.
        loadGridFrom(div, request, true, function doRecount(recordsResponse) {
          // The report API will return count data if requested OR it worked it
          // out anyway during optimisations, so make use of it when available.
          // Therefore set up a 2nd lazy call to count the records only if
          // necessary.
          if (typeof recordsResponse.count === 'undefined') {
            request = getFullRequestPathWithoutPaging(div, true, true);
            request += '&wantCount=1&wantRecords=0';
            $.ajax({
              dataType: 'json',
              url: request,
              data: null,
              success: function countSuccess(countResponse) {
                updateCountFromResponse(div, countResponse);
              }
            });
          } else {
            updateCountFromResponse(div, recordsResponse);
          }
        });
      } else {
        loadGridFrom(div, request, true);
      }
    }

    // Sets up various clickable things like the filter button on a direct report, or the pagination links.
    function setupReloadLinks(div) {
      if (div.settings.mode === 'direct' && div.settings.autoParamsForm) {
        // define a filter form click
        $(div).find('.run-filter').click(function(e) {
          e.preventDefault();
          div.settings.offset = 0;
          if (div.loading) { return; }
          div.loading = true;
          div.settings.filterCol = $(div).find('.filterSelect').val();
          div.settings.filterValue = $(div).find('.filterInput').val();
          load(div, true);
          if (div.settings.filterValue === '') {
            $(div).find('.clear-filter').hide();
          } else {
            $(div).find('.clear-filter').show();
          }
        });
        $(div).find('.clear-filter').click(function (e) {
          e.preventDefault();
          $(div).find('.filterSelect').val('');
          $(div).find('.filterInput').val('');
          $(div).find('.run-filter').click();
        });
      }
    }

    /**
     * On initial grid load, load settings for this grid ID from cookies.
     *
     * E.g. sort, paging and filter info can be remembered between page visits.
     */
    function applySettingsFromCookies(opts) {
      var filterRow;
      var fieldname;
      var resetButtonNeeded = false;
      if (opts.rememberGridPosition && typeof $.cookie !== 'undefined') {
        opts.originalGridPosition = {
          orderby: (opts.orderby ? opts.orderby : null),
          sortdir: (opts.sortdir ? opts.sortdir : null),
          offset: (opts.offset ? opts.offset : 0),
        };
        if ($.cookie('report-orderby-' + opts.id)) {
          opts.orderby = $.cookie('report-orderby-' + opts.id);
          resetButtonNeeded = true;
        }
        if ($.cookie('report-sortdir-' + opts.id)) {
          opts.sortdir = $.cookie('report-sortdir-' + opts.id);
          resetButtonNeeded = true;
        }
        if ($.cookie('report-page-' + opts.id)) {
          opts.offset = $.cookie('report-page-' + opts.id) * opts.itemsPerPage;
          resetButtonNeeded = true;
        }
        if ($.cookie('report-filterrow-' + opts.id)) {
          filterRow = JSON.parse($.cookie('report-filterrow-' + opts.id));
          $.each(filterRow, function(id, val) {
            $('#' + opts.id + ' .col-filter#' + id).val(val);
            fieldname = id.match(new RegExp('^col-filter-(.*)-' + opts.id + '$'))[1];
            if (val.trim() !== '') {
              opts.extraParams[fieldname] = val;
              resetButtonNeeded = true;
            }
          });
        }
      }
      // Adds a reset button if any settings loaded from a cookie.
      if (resetButtonNeeded) {
        $('#' + opts.id).before('<button type="button" class="' + indiciaData.templates.buttonHighlightedClass + '" id="reset-' + opts.id + '">Reset report</button>');
        $('#reset-' + opts.id).click(function() {
          resetSettingsFromCookies($('#' + opts.id)[0]);
        });
      }
    }

    /**
     * Button handler to reset settings loaded from cookies.
     */
    function resetSettingsFromCookies(div) {
      var fieldname;
      if (div.settings.originalGridPosition) {
        div.settings.orderby = div.settings.originalGridPosition.orderby;
        div.settings.sortdir = div.settings.originalGridPosition.sortdir;
        div.settings.offset = div.settings.originalGridPosition.offset;
        $.each($('#' + div.settings.id + ' .col-filter'), function() {
          $(this).val('');
          fieldname = $(this).attr('id').match(new RegExp('^col-filter-(.*)-' + div.settings.id + '$'))[1];
          delete div.settings.extraParams[fieldname];
        });
        // Cleanup cookies.
        $.cookie('report-orderby-' + div.settings.id, null);
        $.cookie('report-sortdir-' + div.settings.id, null);
        $.cookie('report-offset-' + div.settings.id, null);
        $.cookie('report-filterrow-' + div.settings.id, null);
      }
      load(div, true);
    }

    /**
     * Public function which adds a list of records to the bottom of the grid, loaded according to a filter.
     * Typical usage might be to specify an id to add a single record.
     */
    this.addRecords = function (filterField, filterValue) {
      $.each($(this), function (idx, div) {
        var request = getRequest(div);
        request += '&' + filterField + '=' + filterValue;
        loadGridFrom(div, request, false);
      });
    };

    this.getUrlParamsForAllRecords = function () {
      var r = {};
      // loop, though we only return 1.
      $.each($(this), function (idx, div) {
        r = getUrlParamsForAllRecords(div, false);
      });
      return r;
    };

    this.reload = function (recount) {
      var doRecount = typeof recount === 'undefined' ? true : recount;
      $.each($(this), function () {
        load(this, doRecount);
      });
    };

    /**
     * Public method to support late-loading of the initial page of grid data via AJAX.
     * Automatically waits for the current tab to load if on jquery tabs.
     */
    this.ajaxload = function (recount) {
      var doRecount = typeof recount === 'undefined' ? true : recount;
      var report = this;
      // are we on a hidden tab?
      if ($(this).parents('.ui-tabs-panel').length > 0 && $(this).parents('.ui-tabs-panel:visible').length === 0) {
        indiciaFns.bindTabsActivate($(this).parents('.ui-tabs-panel').parent(), function (evt, ui) {
          var panel = typeof ui.newPanel === 'undefined' ? ui.panel : ui.newPanel[0];
          if (panel.id === $(report).parents('.ui-tabs-panel')[0].id) {
            report.reload(doRecount);
            $(this).unbind(evt);
          }
        });
      } else {
        this.reload(doRecount);
      }
    };

    this.setupPagerEvents = function() {
      setupPagerEvents(this[0]);
    }

    var BATCH_SIZE=2000, currentMapRequest;

    function hasIntersection(a, b) {
      var ai=0, bi=0;

      while( ai < a.length && bi < b.length ){
         if      (a[ai] < b[bi] ){ ai++; }
         else if (a[ai] > b[bi] ){ bi++; }
         else /* they're equal */
         {
           return true;
         }
      }

      return false;
    }

    /**
     * Determine if a feature being adding to the map is in the list of selected rows.
     */
    function featureInSelectedRows(div, feature) {
      return typeof indiciaData.selectedRows !== 'undefined' && (
        (typeof feature[div.settings.rowId] !== 'undefined' && $.inArray(div.settings.rowId, indiciaData.selectedRows) > -1) ||
        // plural - report returns list of IDs
        (typeof feature[div.settings.rowId + 's'] !== 'undefined' && hasIntersection(feature[div.settings.rowId + 's'].split(','), indiciaData.selectedRows))
      );
    }

    function _internalMapRecords(div, request, offset, callback, recordCount) {
      $('#map-loading').show();
      var matchString, feature, url;
      // first call- get the record count
      $.ajax({
        dataType: "json",
        url: request + '&offset=' + offset + (typeof recordCount === 'undefined' ? '&wantCount=1' : ''),
        success: function(response) {
          if (typeof response.error !== 'undefined') {
            if (!errorShownOnFilter) {
              alert('The data did not load successfully. The reason given was: \n' + response.error);
              errorShownOnFilter = true;
            }
            $('#map-loading').hide();
            return;
          }
          if (typeof recordCount === 'undefined' && typeof response.count !== 'undefined' && !isNaN(response.count)) {
            recordCount = response.count;
            response = response.records;
          }
          //Need to apply popup filter to map records as well as the grid.
          if (indiciaData.includePopupFilter) {
            response=applyPopupFilterExclusionsToRows(response,div, true);
            if (typeof response.count !== 'undefined') {
              //response.count can be included in the response data, however as we applied a filter we
              //need to override this.
              response.count=response.count-indiciaData.popupFilterRemovedRowsCount;
            }
          }
          // implement a crude way of aborting out of date requests, since jsonp does not support xhr
          // therefore no xhr.abort...&jsonp
          matchString = this.url.replace(/((jsonp\d+)|(jQuery\d+_\d+))/, '?').substring(0, currentMapRequest.length);
          if (matchString === currentMapRequest) {
            // start the load of the next batch
            if (offset + BATCH_SIZE<recordCount) {
              _internalMapRecords(div, request, offset + BATCH_SIZE, callback, recordCount);
            }
            // whilst that is loading, put the dots on the map
            var features=[];
            $.each(response, function (idx, obj) {
              feature = indiciaData.mapdiv.addPt(features, obj, 'geom', {"type":"vector"}, obj[div.settings.rowId]);
              if (featureInSelectedRows(div, obj)) {
                feature.renderIntent='select';
                indiciaData.reportlayer.selectedFeatures.push(feature);
              }
            });
            indiciaData.reportlayer.addFeatures(features);
            indiciaData.mapdiv.reapplyQuery();
            if (indiciaData.mapdiv.settings.zoomMapToOutput && features.length > 0) {
              indiciaData.disableMapDataLoading = true;
              indiciaData.mapdiv.map.zoomToExtent(indiciaData.reportlayer.getDataExtent());
              // zoomMapToOutput is one off.
              indiciaData.mapdiv.settings.zoomMapToOutput = false;
              indiciaData.disableMapDataLoading = false;
            }
            if (typeof recordCount === 'undefined' || offset + BATCH_SIZE >= recordCount) {
              $('#map-loading').hide();
            }
          }
          if (callback !== null) {
            callback();
          }
        }
      });
    }

    /**
     * Public function which loads the current report request output onto a map.
     * The request is handled in chunks of 1000 records. Optionally supply an id to map just 1 record.
     */
    function mapRecords(div, zooming, id, callback) {
      var layerInfo = { bounds: null };
      var map = indiciaData.mapdiv.map;
      var currentBounds = null;
      var p = div.settings.extraParams;
      var hasLocationIdToLoad = (p.indexed_location_id !== 'undefined' && p.indexed_location_id !== '')
        || (p.indexed_location_list !== 'undefined' && p.indexed_location_list !== '')
      if (indiciaData.minMapReportZoom && indiciaData.minMapReportZoom > map.zoom) {
        indiciaData.mapdiv.removeAllFeatures(indiciaData.reportlayer, 'linked', true);
        return;
      }
      // we need to reload the map layer using the mapping report, so temporarily switch the report
      var origReport = div.settings.dataSource, request;
      if (typeof indiciaData.mapdiv === 'undefined'
          || typeof indiciaData.reportlayer === 'undefined'
          || indiciaData.reportlayer.visibility === false) {
        indiciaData.reportlayer.needsRedraw = true;
        return false;
      }
      delete indiciaData.reportlayer.needsRedraw;
      if (indiciaData.mapDataSource.fullRes !== '') {
        if (map.resolution > 30 && indiciaData.mapDataSource.loRes) {
          div.settings.dataSource = indiciaData.mapDataSource.loRes;
        } else {
          div.settings.dataSource = indiciaData.mapDataSource.fullRes;
        }
      }
      try {
        request = getFullRequestPathWithoutPaging(div, false, false, false) + '&limit=' + BATCH_SIZE;
        if (map.resolution > 600 && indiciaData.mapDataSource.loRes) {
          request += '&sq_size=10000';
          layerInfo.zoomLayerIdx = 0;
        } else if (map.resolution > 120 && indiciaData.mapDataSource.loRes) {
          request += '&sq_size=2000';
          layerInfo.zoomLayerIdx = 1;
        } else if (map.resolution > 30 && indiciaData.mapDataSource.loRes) {
          request += '&sq_size=1000';
          layerInfo.zoomLayerIdx = 2;
        } else {
          layerInfo.zoomLayerIdx = 3;
        }
        layerInfo.report = div.settings.dataSource;

        if (typeof id !== 'undefined') {
          request += '&' + div.settings.rowId + '=' + id;
        } else if (map.resolution <= 600 && indiciaData.mapDataSource.loRes &&
            (map.resolution <= 30 || !hasLocationIdToLoad)) {
          // If zoomed in below a 10k map, use the map bounding box to limit the loaded features. Having an indexed site
          // filter changes the threshold as it is less necessary.
          // Get the current map bounds. If zoomed in close, get a larger bounds so that the map can be panned a bit
          // without reload.
          layerInfo.bounds = map.calculateBounds(map.getCenter(), Math.max(39, map.getResolution() * 1.5));
          // plus the current bounds to test if a reload is necessary
          currentBounds = map.calculateBounds();
          if (map.projection.getCode() != indiciaData.mapdiv.indiciaProjection.getCode()) {
            layerInfo.bounds.transform(map.projection, indiciaData.mapdiv.indiciaProjection);
            currentBounds.transform(map.projection, indiciaData.mapdiv.indiciaProjection);
          }
          request += '&bounds=' + encodeURIComponent(layerInfo.bounds.toGeometry().toString());
        }
      }
      finally {
        div.settings.dataSource = origReport;
      }
      if (!zooming || typeof indiciaData.loadedReportLayerInfo === 'undefined' || layerInfo.report !== indiciaData.loadedReportLayerInfo.report
          || (indiciaData.loadedReportLayerInfo.bounds !== null && (currentBounds === null || !indiciaData.loadedReportLayerInfo.bounds.containsBounds(currentBounds)))
          || layerInfo.zoomLayerIdx !== indiciaData.loadedReportLayerInfo.zoomLayerIdx) {
        indiciaData.mapdiv.removeAllFeatures(indiciaData.reportlayer, 'linked', true);
        currentMapRequest = request;
        _internalMapRecords(div, request, 0, typeof callback === 'undefined' ? null : callback);
        if (typeof id === 'undefined') {
          // remmeber the layer we just loaded, so we can only reload if really required. If loading a single record, this doesn't count.
          indiciaData.loadedReportLayerInfo = layerInfo;
        }
      }
    }

    this.mapRecords = function (zooming) {
      if (typeof zooming === 'undefined') {
        zooming = false;
      }
      $.each($(this), function (idx, div) {
        mapRecords(div, zooming);
      });
    };

    /**
     * Public method to be called after deleting rows from the grid - to keep paginator updated
     */
    this.removeRecordsFromPage = function (count) {
      $.each($(this), function (idx, div) {
        div.settings.recordCount -= count;
        div.settings.extraParams.knownCount = div.settings.recordCount;
        updatePager(div, true);
        setupReloadLinks(div);
      });
    };

    function highlightFeatureById(featureId, zoomIn, div) {
      var featureArr;
      var map;
      var extent;
      var zoom;
      var zoomToFeature;
      if (typeof div === 'undefined') {
        div = this[0];
      }
      if (typeof indiciaData.reportlayer !== 'undefined') {
        map = indiciaData.reportlayer.map;
        featureArr = map.div.getFeaturesByVal(indiciaData.reportlayer, featureId, div.settings.rowId);
        zoomToFeature = function () {
          var i;
          if (featureArr.length !== 0) {
            extent = featureArr[0].geometry.getBounds().clone();
            for (i = 1; i < featureArr.length; i++) {
              extent.extend(featureArr[i].geometry.getBounds());
            }
            if (zoomIn) {
              zoom = Math.min(
                indiciaData.reportlayer.map.getZoomForExtent(extent) - 2, indiciaData.mapdiv.settings.maxZoom);
              indiciaData.reportlayer.map.setCenter(extent.getCenterLonLat(), zoom);
            } else {
              indiciaData.reportlayer.map.setCenter(extent.getCenterLonLat());
            }
            indiciaData.mapdiv.map.events.triggerEvent('moveend');
          }
        };
        if (featureArr.length === 0) {
          // feature not available on the map, probably because we are loading just the viewport and
          // and the point is not visible. So try to load it with a callback to zoom in.
          mapRecords(div, false, featureId, function () {
            featureArr = map.div.getFeaturesByVal(indiciaData.reportlayer, featureId, div.settings.rowId);
            zoomToFeature();
          });
        } else {
          // feature available on the map, so we can pan and zoom to show it.
          zoomToFeature();
        }
      }
    };

    this.highlightFeatureById = highlightFeatureById;
    applySettingsFromCookies(opts);

    return this.each(function () {
      this.settings = opts;

      // Make this accessible inside functions
      var div = this;

      // Define clicks on column headers to apply sort
      $(div).find('th.sortable').click(function(e) {
        e.preventDefault();
        if (div.loading) {return;}
        div.loading = true;
        // $(this).text() = display label for column, but this may have had language string translation carried out against it.
        // use hidden input field to store the field name.
        var colName = $(this).find('input').val();
        $.each(div.settings.columns, function(idx, col) {
          if (col.display === colName) {
            colName=col.orderby || col.fieldname;
          }
        });
        if (div.settings.orderby === colName && div.settings.sortdir === 'ASC') {
          div.settings.sortdir = 'DESC';
        } else {
          div.settings.sortdir = 'ASC';
        }
        div.settings.orderby = colName;
        // Change stored sort to this column.
        indiciaFns.cookie('report-orderby-' + div.settings.id, div.settings.orderby);
        indiciaFns.cookie('report-sortdir-' + div.settings.id, div.settings.sortdir);
        // Reload the data.
        load(div, false);
      });

      $(div).find('.report-download-link').click(function(e) {
        e.preventDefault();
        var url=$(e.target).attr('href'), field;
        $.each($(div).find('tr.filter-row input'), function(idx, input) {
          if ($(input).val() !== '') {
            field=input.id.replace('col-filter-', '');
            url += '&' + field + '=' + $(input).val();
          }
        });
        $.each(div.settings.extraParams, function(field, val) {
          if (field.match(/^[a-zA-Z_]+$/)) { // filter out rubbish in the extraParams
            // strip any prior values out before replacing with the latest filter settings
            url = url.replace(new RegExp('[?&]' + field + '=[^&]*&?'), function replacer(match) {
                return match.substr(0,1);
              }) + '&' + field + '=' + encodeURIComponent(val);
          }
        });
        window.location=url;
      });

      /**
       * Saves changed filter to cookie, if rememberGridPosition enabled.
       */
      function saveFilterRowToCookie() {
        if (div.settings.rememberGridPosition) {
          var values = {};
          $.each($('#' + div.settings.id + ' th .col-filter'), function() {
            values[this.id] = $(this).val();
          });
          indiciaFns.cookie('report-filterrow-' + opts.id, JSON.stringify(values));
        }
      }

      var doFilter = function(e) {
        var fieldname;
        if (e.target.hasChanged) {
          errorShownOnFilter = false;
          fieldname = e.target.id.match(new RegExp('^col-filter-(.*)-' + div.id + '$'))[1];
          if ($(e.target).val().trim() === '') {
            delete div.settings.extraParams[fieldname];
          } else {
            div.settings.extraParams[fieldname] = $(e.target).val();
          }
          div.settings.offset=0;
          load(div, true);
          if (div.settings.linkFilterToMap && typeof indiciaData.reportlayer !== 'undefined') {
            mapRecords(div);
          }
          e.target.hasChanged = false;
          saveFilterRowToCookie();
        }
      };
      // In column header is optional popup allowing user to filter out data from the grid.
      $('.col-popup-filter').click(function () {
        var dataInColumnCell;
        var dataCellsForFilter = [];
        var dataRowsForFilter = [];
        var popupFilterHtml = '<div class="popup-filter-options-container">';
        var splitButtonId = $(this).attr('id').split('-');
        var databaseColumnToGet = splitButtonId[3];
        // Use a number to make unique checkbox ids, had considered using the data itself to make up the id, but there there
        // might be problems with special characters.
        var popupItemCounter = 0;
        var recordHasBeenExcluded,checkboxCheckedString,sortedRowWithoutImageOrGeom,sortedRowWithoutImageOrGeomStringified;
        var gridRecordsWithoutImagesOrGeomStringified = [];
        if (indiciaData.allReportGridRecords) {
          // Loop through all the records on the grid currently.
          $.each(indiciaData.allReportGridRecords, function(currentRowIdx, currentRow) {
            // Stringify the object and remove any data that aren't useful when comparing records, so rows are ready for comparison with
            // other rows.
            delete currentRow.images;
            delete currentRow.geom;
            delete currentRow.rootFolder;
            gridRecordsWithoutImagesOrGeomStringified.push(JSON.stringify(currentRow));
          });
        }
        // Cycle through all all the initial records on the grid, this is items
        // that were on the grid before the popup filter was applied
        if (indiciaData.initialReportGridRecords) {
          $.each(indiciaData.initialReportGridRecords, function (initialRowIdx, theInitialRow) {
            // The popup filter box has a checkbox for each distinct data in the grid coloumn we are filtering. This
            // needs to be from the data initially shown on the grid, as the filter is applied data is removed on the
            // grid, but we want this data to still be available to the filter so the user can reselect it.
            dataInColumnCell = theInitialRow[databaseColumnToGet];
            // Collect any data we haven't already saved, so we have a disinct list of the data
            if ($.inArray(dataInColumnCell, dataCellsForFilter) === -1) {
              // Grab the data in the column we are interested in, this can be sorted easily
              dataCellsForFilter.push(dataInColumnCell);
              // Get whole rows also
              dataRowsForFilter.push(theInitialRow);
            }
          });
        }
        // Need to order the items to appear on the filter popup
        var recordsToSort = dataRowsForFilter.slice();
        recordsToSort.sort(sortFilterPopupRecords(databaseColumnToGet));
        // Create the popup html
        // Note that recordsToSort has now been sorted
        if (recordsToSort) {
          $.each(recordsToSort, function(itemIdx, theFilterRow) {
            // Stringify the object and remove any data that aren't useful when comparing records, so rows are ready for
            // comparison with other rows.
            sortedRowWithoutImageOrGeom = theFilterRow;
            delete sortedRowWithoutImageOrGeom.images;
            // Also remove the geometry because sometimes the comparison is done with a grid record and sometimes from
            // the map report, the grid lacks the geom
            delete sortedRowWithoutImageOrGeom.geom;
            delete sortedRowWithoutImageOrGeom.rootFolder;
            sortedRowWithoutImageOrGeomStringified=JSON.stringify(sortedRowWithoutImageOrGeom);
            recordHasBeenExcluded = false;
            //If we find a record that was displayed initially when screen first opened is not currently displayed, then
            //we know it has been excluded by the filter
            if ($.inArray(sortedRowWithoutImageOrGeomStringified,gridRecordsWithoutImagesOrGeomStringified) === -1) {
              recordHasBeenExcluded = true;
            }
            //If the record is excluded by the popup filter, then when the user reopens the popup filter
            //box, then the checkbox needs to default to be unchecked for that data
            if (recordHasBeenExcluded === false) {
              checkboxCheckedString = 'checked=\"checked\"';
            } else {
              checkboxCheckedString = '';
            }
            dataInColumnCell = theFilterRow[databaseColumnToGet];
            popupFilterHtml += '<div>' + dataInColumnCell + '</div><input class=\"popup-filter-checkbox\" id=\"popup-filter-include-'+popupItemCounter+'\" name=\"popup-filter-include-'+popupItemCounter+'\" databaseColumnName=\"'+databaseColumnToGet+'\" databaseData=\"'+dataInColumnCell+'\" type=\"checkbox\" '+checkboxCheckedString+'><br>';
            popupItemCounter++;
          });
        }
        popupFilterHtml += '</div>';
        popupFilterHtml += '<input type="button" class="clear-popup-filter" value="Clear">';
        popupFilterHtml += '<input type="button" class="select-all-popup-filter" value="Select All"><br>';
        popupFilterHtml += '<input type="button" class="apply-popup-filter" value="Apply">';
        $.fancybox.open('<div>' + popupFilterHtml + '</div>');
      });

      /**
       * Retrieves a unique ID from a col's col- class.
       */
      function getColId(col) {
        var r;
        $.each(col.classList, function () {
          if (this.match(/^col-/)) {
            r = this.replace(/^col-/, '');
          }
        });
        return r;
      }

      // Show a picker for the visible columns
      $(div).find('.col-picker').click(function () {
        var pickableCols = $(div).find('thead tr:first-child').find("th[class^='col-'],th[class*=' col-']");
        var visibleCols = $(pickableCols).filter(':visible').length;
        var hiddenCols = $(pickableCols).filter(':hidden').length;
        var checked = visibleCols > 0 ? 'checked="checked"' : '';
        var opacity = visibleCols > 0 && hiddenCols > 0 ? ' style="opacity: 0.4"' : '';
        var colPickerHtml = '<div class="col-picker-options-container"><p>Choose which columns to display:</p>';
        colPickerHtml += '<input type="hidden" class="div-id-holder" data-divid="' + div.id + '" />';
        colPickerHtml += '<ul><li id="col-checkbox-all-container" ' + opacity + '><input id="col-checkbox-all" type="checkbox" ' + checked + '/>' +
            '<label for="col-checkbox-all">Check/uncheck all</label></li>';
        $.each($(div).find('thead tr:first-child').find("th[class^='col-'],th[class*=' col-']"), function (ix) {
          var label = $(this).ignore('.skip-text').text() === '' ? '-' : $(this).ignore('.skip-text').text();
          var id = getColId(this);
          checked = $(this).is(':visible') ? ' checked="checked"' : '';
          colPickerHtml += '<li><input id="show-col-' + id + '" class="col-checkbox" type="checkbox" ' + checked +
            '/><label for="show-col-' + id + '">' + label + '</label></li>';
        });
        colPickerHtml += '</ul></div>';
        colPickerHtml += '<input type="button" class="apply-col-picker" value="Apply">';
        $.fancybox.open('<div>' + colPickerHtml + '</div>');
      });

      /*
       * Sort the items on the popup filter
       */
      function sortFilterPopupRecords(property) {
        var sortOrder = 1;
        if (property[0] === '-') {
          sortOrder = -1;
          property = property.substr(1);
        }
        return function (a,b) {
          var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
          return result * sortOrder;
        };
      }
      // When the user applies the popup filter
      var doPopupFilter = function() {
        indiciaData.dataToExclude=[];
        // Cycle through each checkbox
        $('.popup-filter-checkbox').each(function (index, theCheckbox) {
          // If the checkbox is not checked, then make a note of the data that needs to be excluded.
          if (!$(theCheckbox).is(':checked')) {
            indiciaData.dataToExclude.push([$(theCheckbox).attr('databaseColumnName'),$(theCheckbox).attr('databaseData')]);
          }
        });
        $.fancybox.close();
        // Reload the grid once the filter is applied
        load(div, true);
        if (div.settings.linkFilterToMap && typeof indiciaData.reportlayer !== 'undefined') {
          mapRecords(div);
        }
      };
      $(this).find('th .col-filter').focus(function(e) {
        e.target.hasChanged = false;
      });
      $(this).find('th .col-filter').change(function(e) {
        e.target.hasChanged = true;
      });
      $(this).find('th .col-filter').blur(doFilter);
      $(this).find('th .col-filter').keypress(function(e) {
        e.target.hasChanged = true;
        if (e.keyCode === 13) {
          doFilter(e);
        }
      });
      indiciaFns.on('click', '.apply-popup-filter', {}, function() {
        doPopupFilter();
      });
      indiciaFns.on('click', '.clear-popup-filter', {}, function() {
        $('.popup-filter-checkbox').each(function (index, theCheckbox) {
          // If the checkbox is checked, then deselect it
          if ($(theCheckbox).is(':checked')) {
            $(theCheckbox).attr("checked", false);
          }
        });
      });
      indiciaFns.on('click', '.select-all-popup-filter', {}, function() {
        $('.popup-filter-checkbox').each(function (index, theCheckbox) {
          // If the checkbox is not checked, then select it
          if (!$(theCheckbox).is(':checked')) {
            $(theCheckbox).attr("checked", true);
          }
        });
      });

      function saveColPickerToCookie() {
        var visibleCols;
        // the col picker only saves to cookie if grid id specified, otherwise you get grids overwriting each other's settings
        if (typeof $.cookie !== 'undefined' && !div.id.match(/^report-grid-\d+$/)) {
          visibleCols = [];
          $.each($(div).find('thead tr:first-child th:visible').filter("[class^='col-'],[class*=' col-']"), function () {
            visibleCols.push(getColId(this));
          });
          indiciaFns.cookie(div.id + '-visibleCols', visibleCols, { expires: 7 });
        }
      }

      loadColPickerSettingsFromCookie(div);

      // Col picker event handlers

      indiciaFns.on('click', '.apply-col-picker', {}, function (e) {
        var colId;
        var el;
        var table = $('#' + $(e.currentTarget).parent().find('.div-id-holder').attr('data-divid'));
        $.each($('.col-checkbox'), function () {
          colId = this.id.replace('show-col-', '');
          el = $(table).find('th.col-' + colId + ',td.col-' + colId);
          if (this.checked) {
            el.show();
          } else {
            el.hide();
          }
        });
        saveColPickerToCookie();
        $.fancybox.close();
      });
      indiciaFns.on('change', '#col-checkbox-all', {}, function () {
        $('#col-checkbox-all-container').css('opacity', 1);
        if (this.checked) {
          $('.col-checkbox').prop('checked', true);
        } else {
          $('.col-checkbox').prop('checked', false);
        }
      });
      indiciaFns.on('change', '.col-checkbox', {}, function () {
        // set the state of the check all button when the individual checkboxes change
        var checkedCols = $('.col-checkbox:checked').length;
        var uncheckedCols = $('.col-checkbox:not(:checked)').length;
        var checked = checkedCols > 0;
        var opacity = checkedCols === 0 || uncheckedCols === 0 ? 1 : 0.4;
        if (checked) {
          $('#col-checkbox-all').prop('checked', true);
        } else {
          $('#col-checkbox-all').prop('checked', false);
        }
        $('#col-checkbox-all-container').css('opacity', opacity);
      });

      setupReloadLinks(div);

      if (div.settings.rowId) {
        // Setup highlighting of features on an associated map when rows are clicked
        $(div).find('tbody').click(function(e) {
          if ($(e.target).hasClass('no-select')) {
            // clicked object might request no auto row selection
            return;
          }
          if (typeof indiciaData.reportlayer !== 'undefined') {
            var tr=$(e.target).parents('tr')[0], featureId=tr.id.substr(3),
                featureArr, map=indiciaData.reportlayer.map;
            featureArr=map.div.getFeaturesByVal(indiciaData.reportlayer, featureId, div.settings.rowId);
            // deselect any existing selection and select the feature
            map.setSelection(indiciaData.reportlayer, featureArr);
            $(div).find('tbody tr').removeClass('selected');
            // select row
            $(tr).addClass('selected');
          }
        });
        $(div).find('tbody').dblclick(function (e) {
          var tr = $(e.target).parents('tr')[0];
          var featureId = tr.id.substr(3);
          highlightFeatureById(featureId, true, div);
        });
      }

      // execute callback it there is one
      if (div.settings.callback !== '') {
        window[div.settings.callback](div);
      }

    });
  };

  indiciaFns.on('click', '.social-icon', {}, function(e) {
    e.preventDefault();
    var href=$(e.target).attr('href');
    if (href) {
      $.ajax({
        url: 'https://noembed.com/embed?url=' + encodeURIComponent(href),
        dataType: 'jsonp',
        success: function(data) {
          if (data.error) {
            alert(data.error);
          } else {
            $.fancybox.open({
              caption: data.title,
              type: 'html',
              src: data.html
            });
          }
        }
      });
    }
    return false;
  });
}(jQuery));

/**
 * Main default options for the report grid
 */
jQuery.fn.reportgrid.defaults = {
  id: 'report',
  mode: 'report',
  auth_token : '',
  nonce : '',
  dataSource : '',
  mapDataSource: {fullRes: '', loRes: ''},
  view: 'list',
  columns : null,
  orderby : null,
  sortdir : 'ASC',
  itemsPerPage : null,
  offset : 0,
  currentPageCount : 0,
  rowClass : '', // template for the output row class
  altRowClass : 'odd',
  rowId: '',
  imageFolder : '',
  imageThumbPreset : 'thumb',
  rootFolder: '',
  currentUrl: '',
  callback : '',
  filterCol: null,
  filterValue: null,
  langFirst: 'first',
  langPrev: 'prev',
  langNext: 'next',
  langLast: 'last',
  langShowing: 'Showing records {1} to {2} of {3}',
  noRecords: 'No records',
  sendOutputToMap: false, // does the current page of report data get shown on a map?
  linkFilterToMap: false, // requires a rowId - filtering the grid also filters the map
  msgRowLinkedToMapHint: 'Click the row to highlight the record on the map. Double click to zoom in.',
  actionButtonTemplate: '<a{class}{href}{onclick}>{content}</a>',
  immutableParams: {},
  populated: false
};
