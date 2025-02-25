/**
 * @file
 * A data card gallery plugin.
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
 * @license http://www.gnu.org/licenses/gpl.html GPL 3.0
 * @link https://github.com/indicia-team/client_helpers
 */

 /* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_source", "_count"] }] */
 /* eslint no-param-reassign: ["error", { "props": false }]*/

/**
 * Output plugin for card galleries.
 */
(function idcCardGalleryPlugin() {
  'use strict';
  var $ = jQuery;

  /**
   * Place to store public methods.
   */
  var methods;

  /**
   * Prevent nav arrow key clicks bubbling to re-select card.
   */
  var changingSelection = false;

  /**
   * Declare default settings.
   */
  var defaults = {
    actions: [],
    includeFieldCaptions: false,
    includeFullScreenTool: true,
    includeImageClassifierInfo: false,
    includePager: true,
    includeSortTool: true,
    keyboardNavigation: false
  };

  /**
   * Registered callbacks for different events.
   */
  var callbacks = {
    itemSelect: [],
    itemDblClick: [],
    populate: []
  };

  /**
     * Zooms a card in to use the full width of the control, as an overlay.
     *
     * @param DOM card
     *   Card to zoom.
     */
  function setCardToMaxSize(card) {
    $(card).addClass('show-max-size');
    // Load the full size images.
    $.each($(card).find('img'), function() {
      var anchor = $(this).closest('a');
      if ($(anchor).attr('href') !== $(this).attr('src')) {
        $(this).data('thumb-src', $(this).attr('src'));
        $(this).attr('src', $(anchor).attr('href'));
      }
    });
    // Move verification buttons onto the card.
    if ($('.idc-verificationButtons').length > 0) {
      $(card).find('.data-container').after($('.verification-buttons-cntr'));
    }
    // Show the navigation buttons.
    $(card).find('.verification-buttons-cntr').append($('#card-nav-buttons'));
    // Ensure card visible.
    $(card)[0].scrollIntoView();
  }

  /**
   * Undoes the max size of a card.
   *
   * @param DOM card
   *   Card to unzoom.
   */
  function setCardToNormalSize(card) {
    $(card).removeClass('show-max-size');
    // Load the medium size images.
    $.each($(card).find('img'), function() {
      if ($(this).data('thumb-src')) {
        $(this).attr('src', $(this).data('thumb-src'));
      }
    });
  }

  /**
   * Max size mode handling.
   *
   * @param DOM el
   *   Card gallery element.
   * @param bool on
   *   If true, then sets max size mode on. If false, then turns it off. If
   *   not provided, then just returns the current state.
   *
   * @returns bool
   *   True if in max size mode, else false.
   */
  function inMaxSizeMode(el, on) {
    if (typeof on !== 'undefined') {
      on ? $(el).addClass('max-size-mode') : $(el).removeClass('max-size-mode');
      if (!on && $('.idc-verificationButtons').length > 0) {
        // Move verification buttons back to original location.
        $('.idc-verificationButtons').append($('.verification-buttons-cntr'));
      }
      if (!on) {
        // Hide the nav buttons.
        $('#card-nav-buttons-cntr').append($('#card-nav-buttons'));
      }
      indiciaFns.updateControlLayout();
    }
    return $(el).hasClass('max-size-mode');
  }

  /**
   * Register the various user interface event handlers.
   */
  function initHandlers(el) {

    /**
     * Track loaded card ID to avoid duplicate effort.
     */
    var lastLoadedCardId = null;

    /**
     * SetTimeout handle so the row load timeout can be cleared when navigating quickly.
     */
    var loadRowTimeout;

    /**
     * Fire callbacks when a card has been selected.
     */
    function loadSelectedCard() {
      var card = $(el).find('.card.selected');
      if (card.length && card.data('row-id') !== lastLoadedCardId) {
        lastLoadedCardId = card.data('row-id');
        $.each(el.callbacks.itemSelect, function eachCallback() {
          this(card);
        });
      }
      if (inMaxSizeMode(el)) {
        // Minimise cards that were max size but are no longer selected.
        $.each($(el).find('.card.show-max-size:not(.selected)'), function() {
          setCardToNormalSize(this);
        });
        // Maximise the selected card.
        if ($(el).find('.card.selected').length > 0 && !$(el).find('.card.selected').hasClass('show-max-size')) {
          setCardToMaxSize($(el).find('.card.selected'));
        }
      }
    }

    /**
     * Card click handler.
     *
     * Adds selected class and fires callbacks.
     */
    indiciaFns.on('click', '#' + el.id + ' .es-card-gallery .card', {}, function onCardGalleryCardClick() {
      var card = this;
      if (!changingSelection && !$(card).hasClass('selected')) {
        $(card).closest('.es-card-gallery').find('.card.selected').removeClass('selected');
        $(card).addClass('selected');
        loadSelectedCard();
      }
    });

    /**
     * Double click grid row handler.
     *
     * Adds selected class. fires callbacks and maximises the card.
     */
    indiciaFns.on('dblclick', '#' + el.id + ' .es-card-gallery .card', {}, function onCardGalleryitemDblClick() {
      var card = this;
      if (!changingSelection && !$(card).hasClass('selected')) {
        $(card).closest('.es-card-gallery').find('.card.selected').removeClass('selected');
        $(card).addClass('selected');
      }
      setCardToMaxSize(card);
      inMaxSizeMode(el, true);
      $.each(el.callbacks.itemDblClick, function eachCallback() {
        this(card);
      });
    });

    /**
     * Toggle sort on a data value item in the sort tool popup.
     */
    indiciaFns.on('click', '#' + el.id + ' .sort-dropdown li', {}, function onSortItemClick() {
      var fieldName = $(this).data('field');
      var sortSpan = $(this).find('span');
      var sortDesc = sortSpan.hasClass('fa-sort-alpha-up');
      var sourceObj = el.settings.sourceObject;
      // Clear sort arrows.
      $('#' + el.id + ' .sort-dropdown li span').hide();
      if (fieldName) {
        // Set arrow class and show.
        $(sortSpan).removeClass(sortDesc ? 'fa-sort-alpha-up' : 'fa-sort-alpha-down-alt');
        $(sortSpan).addClass(sortDesc ? 'fa-sort-alpha-down-alt' : 'fa-sort-alpha-up');
        $(sortSpan).show();
        sourceObj.settings.sort = {};
        sourceObj.settings.sort[fieldName] = sortDesc ? 'desc' : 'asc';
        sourceObj.populate();
      }
    });

    /**
     * Implement arrow key and other navigation tools.
     */
    if (el.settings.keyboardNavigation) {

      /**
       * Navigate when arrow key pressed.
       */
      function handleArrowKeyNavigation(key, oldSelected) {
        var newSelected;
        var oldCardBounds;
        var nextRowTop;
        var nextRowContents = [];
        var navFn;
        var closestVerticalDistance = null;
        if (key === 'ArrowLeft') {
          newSelected = $(oldSelected).prev('.card');
        } else if (key === 'ArrowRight') {
          newSelected = $(oldSelected).next('.card');
        } else {
          navFn = key === 'ArrowUp' ? 'prev' : 'next';
          oldCardBounds = oldSelected[0].getBoundingClientRect();
          newSelected = $(oldSelected)[navFn]('.card');
          // Since we are going up or down, find the whole contents of the
          // row we are moving into by inspecting the y position.
          while (newSelected.length !== 0) {
            if (newSelected[0].getBoundingClientRect().y !== oldCardBounds.y) {
              if (!nextRowTop) {
                nextRowTop = newSelected[0].getBoundingClientRect().y;
              } else if (nextRowTop !== newSelected[0].getBoundingClientRect().y) {
                break;
              }
              nextRowContents.push(newSelected);
            }
            newSelected = $(newSelected)[navFn]('.card');
          }
          // Now find the item in that row with the closest vertical centre
          // to the card we are leaving.
          $.each(nextRowContents, function() {
            var thisCardBounds = this[0].getBoundingClientRect();
            var thisVerticalDistance = Math.abs((oldCardBounds.left + oldCardBounds.right) / 2 - (thisCardBounds.left + thisCardBounds.right) / 2);
            if (closestVerticalDistance === null || thisVerticalDistance < closestVerticalDistance) {
              newSelected = this;
              closestVerticalDistance = thisVerticalDistance;
            }
          });
        }
        if (newSelected.length) {
          changingSelection = true;
          $(newSelected).addClass('selected');
          $(newSelected).focus();
          $(oldSelected).removeClass('selected');
        }
        // Load row on timeout to avoid rapidly hitting services if repeat-hitting key.
        if (loadRowTimeout) {
          clearTimeout(loadRowTimeout);
        }
        loadRowTimeout = setTimeout(function() {
          loadSelectedCard();
          changingSelection = false;
        }, 200);
      }

      /**
       * Keyboard handler for the gallery.
       */
      indiciaFns.on('keydown', 'body', {}, function onDataGridKeydown(e) {
        var oldSelected = $(el).find('.card.selected');
        // Prevent capturing when the user trying to do something else, e.g. copy text.
        if (e.ctrlKey || e.metaKey) {
          return;
        }
        if ($(':input:focus').length) {
          // Input focused, so the only keystroke we are interested in is
          // escape to close a Fancbox dialog.
          if (e.key === 'Escape' && $.fancybox.getInstance()) {
            indiciaFns.closeFancyboxForSelectedItem();
          }
        } else if (e.key.match(/^Arrow/) && !$('.fancybox-image').length) {
          // Arrow key pressed when image popup not shown.
          // Only allow left/right when showing a card in max size mode.
          if (!inMaxSizeMode(el) || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            handleArrowKeyNavigation(e.key, oldSelected);
          }
          e.preventDefault();
          return false;
        } else if (e.key.toLowerCase() === 'i') {
          // i key opens and closes image popups.
          if ($('.fancybox-image').length) {
            indiciaFns.closeFancyboxForSelectedItem();
          } else {
            var fbLink = oldSelected.find('[data-fancybox]');
            if (fbLink.length) {
              // Open first image in set.
              $(fbLink[0]).click();
            }
          }
        }
        else if (e.key.toLowerCase() === 'c' || e.key === '+') {
          // c or + key toggles the current card zooming to full size of the control.
          if (inMaxSizeMode(el)) {
            setCardToNormalSize(oldSelected);
            inMaxSizeMode(el, false);
          } else {
            setCardToMaxSize(oldSelected);
            inMaxSizeMode(el, true);
          }
        }
      });

      /**
       * Handler for the in-card nav Next button.
       */
      indiciaFns.on('click', '.nav-next', {}, function() {
        var oldSelected = $(el).find('.card.selected');
        handleArrowKeyNavigation('ArrowRight', oldSelected);
      });

      /**
       * Handler for the in-card nav Prev button.
       */
      indiciaFns.on('click', '.nav-prev', {}, function() {
        var oldSelected = $(el).find('.card.selected');
        handleArrowKeyNavigation('ArrowLeft', oldSelected);
      });

      /**
       * Handler for the in-card expand card button.
       */
      indiciaFns.on('click', '.expand-card', {}, function() {
        const card = $(this).closest('.card');
        setCardToMaxSize(card);
        inMaxSizeMode(el, true);
      });

      /**
       * Handler for the in-card expand collapse button.
       */
      indiciaFns.on('click', '.collapse-card', {}, function() {
        const card = $(this).closest('.card');
        setCardToNormalSize(card);
        inMaxSizeMode(el, false);
      });

      // Public function so it can be called from bindControls event handlers.
      el.loadSelectedCard = loadSelectedCard;
    }

    /**
     * Next page click.
     */
    $(el).find('.footer .next').click(function clickNext() {
      indiciaFns.movePage(el, true, '.card');
    });

    /**
     * Previous page click.
     */
    $(el).find('.footer .prev').click(function clickPrev() {
      indiciaFns.movePage(el, false, '.card');
    });

    /**
     * Rows per page change.
     */
    $(el).find('.rows-per-page select').change(function changeRowsPerPage() {
      indiciaFns.rowsPerPageChange(el);
    });

    /**
     * Multi-select switch toggle handler.
     */
    $(el).find('.multiselect-switch').click(function clickMultiselectSwitch(e) {
      if ($(el).hasClass('multiselect-mode')) {
        $(el).removeClass('multiselect-mode');
        $(el).find('.multiselect-cntr').remove();
        $('.selection-buttons-placeholder').append($('.all-selected-buttons'));
      } else {
        $(el).addClass('multiselect-mode');
        $(el).find('.card').prepend('<div class="multiselect-cntr"><input type="checkbox" title="' + indiciaData.lang.cardGallery.checkToIncludeInList + '" class="multiselect" /></div>');
        $(el).prepend(
          $('.all-selected-buttons')
        );
      }
    });

    /**
     * Fullscreen tool.
     */
    $(el).find('.fullscreen-tool').click(function settingsIconClick() {
      indiciaFns.goFullscreen(el);
    });

    /**
     * Sort tool.
     */
    $(el).find('.sort-tool').click(function settingsIconClick() {
      $('.sort-dropdown').fadeIn();
    });

    /* Sort tool close icon. */
    $(el).find('.sort-close').click(function closeIconClick() {
      $('.sort-dropdown').fadeOut();
    });
  }

  /**
   * After population of the gallery, fire callbacks.
   *
   * Callbacks may be linked to the populate event or the itemSelect event if
   * the selected card changes.
   */
  function fireAfterPopulationCallbacks(el) {
    // Fire any population callbacks.
    $.each(el.callbacks.populate, function eachCallback() {
      this(el);
    });
    // Fire callbacks for selected card if any.
    $.each(el.callbacks.itemSelect, function eachCallback() {
      this($(el).find('.card.selected').length === 0 ? null : $(el).find('.card.selected')[0]);
    });
  }

  /**
   * Declare public methods.
   */
  methods = {
    /**
     * Initialise the idcCardGallery plugin.
     *
     * @param array options
     */
    init: function init(options) {
      var el = this;
      var tools = [];

      indiciaFns.registerOutputPluginClass('idcCardGallery');
      el.settings = $.extend(true, {}, defaults);
      el.callbacks = callbacks;
      // Apply settings passed in the HTML data-* attribute.
      if (typeof $(el).attr('data-idc-config') !== 'undefined') {
        $.extend(el.settings, JSON.parse($(el).attr('data-idc-config')));
      }
      // Apply settings passed to the constructor.
      if (typeof options !== 'undefined') {
        $.extend(el.settings, options);
      }
      // CardGallery does not make use of multiple sources.
      el.settings.sourceObject = indiciaData.esSourceObjects[Object.keys(el.settings.source)[0]];

      if (!el.settings.columns) {
        el.settings.columns = [
          {
            field: '#taxon_label#',
            caption: indiciaData.gridMappingFields['taxon.accepted_name'].caption
          }, {
            field: '#event_date#',
            caption: 'Date'
          }, {
            field: 'event.recorded_by',
            caption: indiciaData.gridMappingFields['event.recorded_by'].caption
          }, {
            field: 'location.output_sref',
            caption: indiciaData.gridMappingFields['location.output_sref'].caption
          }, {
            field: '#status_icons#',
            caption: 'Status',
          }
        ];
      }

      if (el.settings.includePager) {
        $('<div class="footer form-inline">' + indiciaFns.getFooterControls(el) + '</div>').appendTo(el);
      }
      // Add tool icons for full screen and multiselect mode.
      if (el.settings.includeMultiSelectTool) {
        tools.push('<span title="Enable multiple selection mode" class="fas fa-list multiselect-switch"></span>');
      }
      if (el.settings.includeFullScreenTool &&
        (document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled)) {
        tools.push('<span class="far fa-window-maximize fullscreen-tool" title="' + indiciaData.lang.cardGallery.fullScreenToolHint + '"></span>');
      }
      if (el.settings.includeSortTool) {
        tools.push('<span class="fas fa-sort-alpha-up sort-tool" title="' + indiciaData.lang.cardGallery.sortToolHint + '"></span>');
        $('<div class="sort-dropdown" style="display: none"><h3>' + indiciaData.lang.cardGallery.sortConfiguration + '</h3>' +
          '<p>' + indiciaData.lang.cardGallery.clickToSort + '<ul></ul>' +
          '<button class="sort-close ' + indiciaData.templates.buttonHighlightedClass + '">Close</button></div>').appendTo(el);
        $.each(el.settings.columns, function() {
          if (indiciaData.gridMappingFields[this.field]) {
            const caption = this.caption ? this.caption : '<em>' + indiciaData.lang.cardGallery.noHeading + '</em>';
            let li = $('<li data-field="' + this.field + '"><h4>' + caption + '</h4>' +
              '<span class="fas fa-2x" display="none"></span></li>');
            if (typeof indiciaData.gridMappingFields[this.field] !== 'undefined') {
              li.append($('<p>' + indiciaData.gridMappingFields[this.field].description + '</p>'));
            }
            $('.sort-dropdown ul').append(li);
          }
        });
      }
      $('<div class="idc-tools">' + tools.join('<br/>') + '</div>').appendTo(el);
      // Add overlay for loading.
      $('<div class="loading-spinner" style="display: block"><div>Loading...</div></div>').appendTo(el);
      initHandlers(el);
      indiciaFns.updateControlLayout();
    },

    /**
     * Populate the data grid with Elasticsearch response data.
     *
     * @param obj sourceSettings
     *   Settings for the data source used to generate the response.
     * @param obj response
     *   Elasticsearch response data.
     * @param obj data
     *   Data sent in request.
     */
    populate: function populate(sourceSettings, response, data) {
      var el = this;
      var dataList = response.hits.hits;

      // If currently in max size mode, move the verification and nav buttons
      // off the card so they don't get inadvertently removed.
      if (inMaxSizeMode(el)) {
        if ($('.idc-verificationButtons').length > 0) {
          // Move verification buttons back to original location.
          $('.idc-verificationButtons').append($('.verification-buttons-cntr'));
        }
        // Hide the nav buttons.
        $('#card-nav-buttons-cntr').append($('#card-nav-buttons'));
      }

      // Cleanup before repopulating.
      $(el).find('.card').remove();

      $.each(dataList, function eachHit(i) {
        var hit = this;
        var doc = hit._source ? hit._source : hit;
        var card = $('<div>')
          .attr('data-row-id', hit._id)
          .attr('data-doc-source', JSON.stringify(doc))
          .appendTo($(el).find('.es-card-gallery'));
        // @todo class warning for rejected.
        var classes = ['card', 'panel', 'panel-info'];
        var imageContainer;
        var dataContainer;
        var value;
        // Add multiselect checkbox if required.
        if ($(el).hasClass('multiselect-mode')) {
          $(card).prepend('<div class="multiselect-cntr"><input type="checkbox" title="' + indiciaData.lang.cardGallery.checkToIncludeInList + '" class="multiselect" /></div>');
        }
        // For keyboard navigation, need to enable row focus.
        if (el.settings.keyboardNavigation) {
          $(card).attr('tabindex', i);
        }
        if (doc.occurrence.media) {
          imageContainer = $('<div>').addClass('image-container').appendTo(card);
          if (doc.occurrence.media.length > 2) {
            // More than two photo needs a very large card.
            classes.push('x-big');
          } else if (doc.occurrence.media.length > 1) {
            // More than one photo needs a large card.
            classes.push('big');
          }
          $.each(doc.occurrence.media, function() {
            var thumb = indiciaFns.drawMediaFile(doc.id, this, 'med', 'med');
            var thumbwrap = $('<div>').append(thumb);
            $(thumbwrap).appendTo(imageContainer);
          });
        }
        $(card).addClass(classes.join(' '));
        if (el.settings.includeFieldCaptions) {
          dataContainer = $('<dl>').addClass('dl-horizontal');
        } else {
          dataContainer = $('<ul>');
        }
        const cardFooter = $('<div class="card-footer" />').appendTo(card);
        dataContainer.addClass('data-container panel-body').appendTo(cardFooter);
        $.each(el.settings.columns, function() {
          value = indiciaFns.getValueForField(doc, this.field);
          var valueClass = 'field-' + this.field.replace(/\./g, '--').replace(/_/g, '-');
          if (value !== '') {
            if (el.settings.includeFieldCaptions) {
              $('<dt>' + this.caption + '</dt>').appendTo(dataContainer);
              $('<dd >' + value + '</dd>').addClass(valueClass).appendTo(dataContainer);
            } else {
              $('<li>' + value + '</li>').addClass(valueClass).appendTo(dataContainer);
            }
          }
        });
        if (el.settings.actions.length) {
          value = indiciaFns.getActions(el, el.settings.actions, doc);
          if (el.settings.includeFieldCaptions) {
            $('<dt>Actions</dt>').appendTo(dataContainer);
            $('<dd>' + value + '</dd>').appendTo(dataContainer);
          } else {
            $('<li>' + value + '</li>').appendTo(dataContainer);
          }
        }
        if (el.settings.includeImageClassifierInfo && doc.identification.classifier) {
          $(indiciaFns.getImageClassifierAgreementHtml(doc)).appendTo(cardFooter);
          $(indiciaFns.getImageClassifierSuggestionsHtml(doc)).appendTo(cardFooter);
        }
        $('<button type="button" title="' + indiciaData.lang.cardGallery.expandCard + '" class="expand-card ' + indiciaData.templates.buttonDefaultClass + ' ' + indiciaData.templates.buttonSmallClass + '">' +
          '<i class="fas fa-expand-arrows-alt"></i></i></button>')
          .appendTo(card);
        $('<button type="button" title="' + indiciaData.lang.cardGallery.collapseCard + '" class="collapse-card ' + indiciaData.templates.buttonDefaultClass + ' ' + indiciaData.templates.buttonSmallClass + '">' +
          '<i class="fas fa-compress-arrows-alt"></i></button>')
          .appendTo(card);
        if (i === 0 && inMaxSizeMode(el)) {
          setCardToMaxSize(card);
          $(card).addClass('selected');
        }
      });
      indiciaFns.updatePagingFooter(el, response, data, '.card');
      fireAfterPopulationCallbacks(el);
    },

    /**
     * Bind control to other control event callbacks.
     *
     * Call after init of all controls. Finds other controls that update items
     * and binds to the event handler. E.g. picks up changes caused by
     * verification buttons.
     */
    bindControls: function() {
      var el = this;
      $.each($('.idc-control'), function() {
        var controlClass = $(this).data('idc-class');
        if (typeof this.callbacks.itemUpdate !== 'undefined') {
          $(this)[controlClass]('on', 'itemUpdate', (item) => {
            $(item).removeClass('selected');
            while (item.length > 0 && $(item).hasClass('disabled')) {
              item = $(item).next('[data-row-id]');
            }
            if (item) {
              $(item).addClass('selected').focus();
            }
            el.loadSelectedCard();
          });
        }
      });
    },

    /**
     * Register an event handler.
     *
     * @param string event
     *   Event name.
     * @param function handler
     *   Callback function called on this event.
     */
    on: function on(event, handler) {
      if (typeof this.callbacks[event] === 'undefined') {
        indiciaFns.controlFail(this, 'Invalid event handler requested for ' + event);
      }
      this.callbacks[event].push(handler);
    },

    /**
     * Card galleries always populate when their source updates.
     */
    getNeedsPopulation: function getNeedsPopulation() {
      return true;
    }

  };

  /**
   * Extend jQuery to declare idcCardGallery plugin.
   */
  $.fn.idcCardGallery = function buildCardGallery(methodOrOptions) {
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
      $.error('Method ' + methodOrOptions + ' does not exist on jQuery.idcCardGallery');
      return true;
    });
    // If the method has no explicit response, return this to allow chaining.
    return typeof result === 'undefined' ? this : result;
  };
}());