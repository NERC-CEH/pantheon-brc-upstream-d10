/**
 * @file
 * A UI for running sets of custom verification rules.
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
 * Output plugin for card galleries.
 */
(function idcRunCustomVerificationRulesets() {
  'use strict';
  var $ = jQuery;

  /**
   * Place to store public methods.
   */
  var methods;

  /**
   * Declare default settings.
   */
  var defaults = { };

  /**
   * Register the various user interface event handlers.
   */
  function initHandlers(el) {

    // Handler for the button that shows the custom rule popup.
    $(el).find('.custom-rule-popup-btn').click(function() {
      const dlg = $('#' + el.settings.id + '-dlg-cntr');
      dlg.find('.progress-cntr').hide();
      // Only do anything if source population has completed.
      if (indiciaData.esSourceObjects[Object.keys(el.settings.source)[0]].settings.total) {
        dlg.find('.msg-count').html(indiciaData.esSourceObjects[Object.keys(el.settings.source)[0]].settings.total.value);
        $.fancybox.open(dlg);
      }
    });

    // Handler for the button on the popup that runs the selected ruleset.
    $('.run-custom-verification-ruleset').click(() => {
      const source = indiciaData.esSourceObjects[Object.keys(el.settings.source)[0]];
      const request = indiciaFns.getFormQueryData(source);
      const dlg = $('#' + el.settings.id + '-dlg-cntr');
      dlg.find('.progress-cntr').fadeIn();
      $.ajax({
        url: indiciaData.esProxyAjaxUrl + '/runcustomruleset/' + indiciaData.nid + '?ruleset_id=' + $('[name="ruleset-list"]:checked').val(),
        type: 'POST',
        dataType: 'json',
        data: request,
      })
      .done(function(data, code, jq) {
        dlg.find('.progress-cntr').hide();
        $.fancybox.close();
        if (jq.status === 200) {
          $.fancyDialog({
            title: indiciaData.lang.runCustomVerificationRulesets.processComplete,
            message: indiciaData.lang.runCustomVerificationRulesets.processCompleteMessage.replace('{1}', data.updated),
            cancelButton: null,
            callbackOk: () => {
              // Do this after the message closed so ES lazy updates are completed.
              source.populate(true);
            }
          });
        } else {
          $.fancyDialog({
            title: indiciaData.lang.runCustomVerificationRulesets.processNotComplete,
            message: data.message || data.status,
            cancelButton: null,
          });
        }
      })
      .fail(function(data) {
        dlg.find('.progress-cntr').hide();
        alert('An error occurred whilst applying the rules.');
      });
    });

    // Handler for the clear results button on the popup.
    $('.clear-results').click(() => {
      $.fancyDialog({
        title: indiciaData.lang.runCustomVerificationRulesets.clearResults,
        message: indiciaData.lang.runCustomVerificationRulesets.areYouSureClear,
        callbackOk: () => {
          const source = indiciaData.esSourceObjects[Object.keys(el.settings.source)[0]];
          const request = indiciaFns.getFormQueryData(source);
          const dlg = $('#' + el.settings.id + '-dlg-cntr');
          dlg.find('.progress-cntr').fadeIn();
          $.ajax({
            url: indiciaData.esProxyAjaxUrl + '/clearcustomresults/' + indiciaData.nid,
            type: 'POST',
            dataType: 'json',
            data: request,
          })
          .done(function(data) {
            dlg.find('.progress-cntr').hide();
            $.fancybox.close();
            $.fancyDialog({
              title: indiciaData.lang.runCustomVerificationRulesets.processComplete,
              message: indiciaData.lang.runCustomVerificationRulesets.clearResultsDoneMessage.replace('{1}', data.updated),
              cancelButton: null,
              callbackOk: () => {
                // Do this after the message closed so ES lazy updates are completed.
                source.populate(true);
              }
            });
          })
          .fail(function(data) {
            dlg.find('.progress-cntr').fadeIn();
            alert('An error occurred whilst clearing the results.');
          });
        }
      });
    });

    $(el).find('[name="ruleset-list"]').change(function() {
      $('#' + el.settings.id + '-dlg-cntr .run-custom-verification-ruleset').removeAttr('disabled');
    });

  }

  /**
   * Declare public methods.
   */
  methods = {
    /**
     * Initialise the idcRunCustomVerificationRulesets plugin.
     *
     * @param array options
     */
    init: function init(options) {
      var el = this;

      indiciaFns.registerOutputPluginClass('idcRunCustomVerificationRulesets');
      el.settings = $.extend(true, {}, defaults);
      // Apply settings passed in the HTML data-* attribute.
      if (typeof $(el).attr('data-idc-config') !== 'undefined') {
        $.extend(el.settings, JSON.parse($(el).attr('data-idc-config')));
      }
      // Apply settings passed to the constructor.
      if (typeof options !== 'undefined') {
        $.extend(el.settings, options);
      }
      if (!indiciaData.esSourceObjects[Object.keys(el.settings.source)[0]]) {
        throw new Error('[runCustomVerificationRulesets] control refers to missing @source ' + Object.keys(el.settings.source)[0]);
      }
      initHandlers(el);
    },

    /**
     * No need to populate for the benefit of the rulesets runner UI.
     */
    getNeedsPopulation: () => {
      return false;
    },

    populate: () => {

    }

  }

  /**
   * Extend jQuery to declare idcVerificationButtons plugin.
   */
  $.fn.idcRunCustomVerificationRulesets = function buildRunCustomVerificationRulesets(methodOrOptions) {
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