/**
 * @file
 * Code for the controlLayout Elasticsearch control.
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
 * Output plugin for data grids.
 */
jQuery(document).ready(function($) {

  /**
   * Functions that need to be notified when a control layout resize occurs.
   */
  indiciaFns.controlLayoutHooks = [];

  /**
   * Get correct component(s) to set scrollbox on.
   *
   * For anchoring to the bottom of the page using alignBottom.
   *
   * @param string id
   *   ID of the control container.
   */
  function getResizeableScrollComponent(id) {
    let thisCtrl = $('#' + id);
    if (thisCtrl.hasClass('idc-recordDetails')) {
      return thisCtrl.find('.ui-tabs-panel');
    }
    if (thisCtrl.hasClass('idc-dataGrid')) {
      return thisCtrl.find('tbody');
    }
    if (thisCtrl.hasClass('idc-cardGallery')) {
      return thisCtrl.find('.es-card-gallery');
    }
    return thisCtrl;
  }

  /**
   * Find the css style of a margin or padding size, as an integer.
   *
   * @param DOM ctrl
   *   Control to check.
   * @param string measurement
   *   E.g. marginTop or paddingTop.
   *
   * @return float
   *   Size (hopefully in pixels but doesn't check).
   */
  function getCtrlStyledSizing(ctrl, measurement) {
    const size = ctrl[0].style[measurement];
    return size ? parseInt(size.match(/\d+/)[0], 10) : 0;
  }

  if (typeof indiciaData.esControlLayout !== 'undefined') {
    if ($('#' + indiciaData.esControlLayout.setOriginY).length === 0) {
      alert('Invalid [controlLayout] @setOriginY option - must point to the ID of another control.');
      return;
    }
    // If being aligned to the top, we want no initial margin.
    $.each(indiciaData.esControlLayout.alignTop, function() {
      $('#' + this).css('margin-top', 0);
    });

    /**
     * Resize layout management function.
     */
    indiciaFns.updateControlLayout = function updateLayout() {
      const belowBreakpoint = window.matchMedia('(max-width: ' + indiciaData.esControlLayout.breakpoint + 'px)').matches;
      // setOriginY refers to a control used to consider as the top origin of
      // the active area of the page. originY is the number of pixels between
      // its visible top and the top of the browser viewport.
      const originY = $('#' + indiciaData.esControlLayout.setOriginY)[0].getBoundingClientRect().y;
      $.each(indiciaData.esControlLayout.alignTop, function() {
        const thisCtrl = $('#' + this);
        if (belowBreakpoint) {
          // Below breakpoint, so don't set margin.
          thisCtrl.css('margin-top', 0);
        } else {
          const thisCtrlTop = thisCtrl[0].getBoundingClientRect().y;
          // Get the previuosly applied margin without 'px';
          const currentMargin = getCtrlStyledSizing(thisCtrl, 'marginTop');
          const newMargin = originY - (thisCtrlTop - currentMargin);
          // If tiny change, probably a rounding issue,
          if (Math.abs(currentMargin - newMargin) > 2) {
            thisCtrl.css('margin-top', newMargin + 'px');
          }
        }
      });
      $.each(indiciaData.esControlLayout.setHeightPercent, function(id, height) {
        if (belowBreakpoint) {
          // Below breakpoint, so revert to unstyled height.
          $('#' + id).css('height', '');
        } else {
          $('#' + id).css('height', ((window.innerHeight - originY) * height / 100) + 'px');
        }
      });
      $.each(indiciaData.esControlLayout.alignBottom, function() {
        const resizeEl = $(getResizeableScrollComponent(this));
        // Ensure control ready.
        if (resizeEl.length > 0) {
          if (belowBreakpoint) {
            // Below breakpoint, so revert to unstyled height.
            resizeEl.css('max-height', '');
            $('body').css('padding-bottom', '4px');
          } else {
            const padding = 4;
            const resizeElTop = resizeEl[0].getBoundingClientRect().y;
            // Unset any min-height defined for outer container - we want to
            // know it's true intrinsic height.
            $('#' + this).css('min-height', 'auto');
            // Allow for any footer area in the control that is under the scrollbox area (e.g. a tfoot).
            const allowForSpaceBelowResizeEl = $('#' + this)[0].getBoundingClientRect().height - resizeEl[0].getBoundingClientRect().height - (resizeElTop - $('#' + this)[0].getBoundingClientRect().y);
            // Reset.
            $('#' + this).css('min-height', '');
            const controlHeight = window.innerHeight - resizeElTop - allowForSpaceBelowResizeEl - padding * 2;
            resizeEl.css('overflow-y', 'auto');
            resizeEl.css('max-height', Math.max(controlHeight, 50));
            $('body').css('padding-bottom', padding + 'px');
          }
        }
      });
      // Allow control specific resize behaviour.
      $.each(indiciaFns.controlLayoutHooks, function() {
        this();
      });
    }

    // Ensure dataGrids have scrollbar on tbody set, as this changes various
    // bits of table behaviour.
    $.each(indiciaData.esControlLayout.alignBottom, function() {
      if ($('#' + this).hasClass('idc-dataGrid')) {
        $('#' + this).data('idc-config').tbodyHasScrollBar = true;
        $('#' + this).addClass('layout-align-bottom');
      }
    });

    window.addEventListener('resize', indiciaFns.updateControlLayout);
    // Also recalc on fullscreen change otherwise layout refreshes too early
    // when closing fullscreen.
    document.addEventListener("fullscreenchange", indiciaFns.updateControlLayout);
    document.addEventListener("webkitfullscreenchange", indiciaFns.updateControlLayout);

    indiciaFns.updateControlLayout();
  } else {
    // No control layout settings so nothing to do.
    indiciaFns.updateControlLayout = () => {};
  }

});