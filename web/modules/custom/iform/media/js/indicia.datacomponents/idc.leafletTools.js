var idcLeafletTools;

(function enclose($) {
  'use strict';

  idcLeafletTools = L.Control.extend({
    options: {
      mapEl: null,
      position: 'topright',
      title: 'Map tools',
      tools: [
        'dataLayerOpacity',
        'gridSquareSize',
        'impreciseMapRefHandling',
      ]
    },

    /**
     * Check if a map includes a clickable data layer.
     *
     * Checks if the map has layers that can be clicked, set opacity etc.
     *
     * @returns bool
     *   True if the map has a gridded data layer (square, circle).
     */
    hasClickableLayer: function(allowed) {
      let foundClickableLayer = false;
      if (typeof allowed === 'undefined') {
        allowed = ['circle', 'square', 'geom'];
      }
      $.each(this.options.mapEl.settings.layerConfig, function() {
        if (allowed.indexOf(this.type) !== -1) {
          foundClickableLayer = true;
        }
      });
      return foundClickableLayer;
    },

    isValidCtrl_dataLayerOpacity() {
      return this.hasClickableLayer();
    },

    isValidCtrl_gridSquareSize() {
      // GeoHash (geom) mode does not allow control over grid square size
      // currently.
      return this.hasClickableLayer(['circle', 'square']);
    },

    isValidCtrl_impreciseMapRefHandling() {
      // GeoHash (geom) mode does not switch to precise geoms at any level, so
      // this control is not required.
      return this.hasClickableLayer(['circle', 'square']);
    },

    getCtrl_dataLayerOpacity: function(ctrlId, label) {
      const savedOpacityCookieValue = indiciaFns.cookie('leafletMapDataLayerOpacity');
      const slider = $('<input>', {
        id: ctrlId,
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        value: savedOpacityCookieValue ? savedOpacityCookieValue : 0.2,
        class: 'opacity-slider form-control'
      });
      var options = this.options;

      slider.on('input', function () {
        const opacitySetting = parseFloat(slider.val());
        $.each(options.mapEl.outputLayers, function(layerName, layer) {
          if (layer.getLayers) {
            let layerStyleChanged = false;
            $.each(layer.getLayers(), function() {
              if (this.options.origFillOpacity) {
                layerStyleChanged = true;
                // Combine the opacity setting from the tools popup with the
                // original opacity implied by the data value.
                const calculatedOpacity = indiciaFns.calculateFeatureOpacity(opacitySetting, this.options.origFillOpacity);
                $(this.getElement()).attr('fill-opacity', calculatedOpacity);
                // Stroke opacity also set, but on a scale of 0.3 to 1 so it
                // never completely disappears and reaches 1 roughly half way
                // along scale.
                $(this.getElement()).attr('stroke-opacity', Math.min(1, 0.3 + calculatedOpacity * 1.5));
              }
            });
            if (layerStyleChanged) {
              $.each(options.mapEl.callbacks.dataLayerStyleChange, function eachCallback() {
                this(options.mapEl, layerName);
              });
            }
          }
        });
        indiciaFns.cookie('leafletMapDataLayerOpacity', opacitySetting);
      });
      let div = $('<div>');
      div.append($(`<label for="${ctrlId}">${label}:</label>`));
      div.append(slider);
      return div;
    },

    getCtrl_gridSquareSize: function(ctrlId, label) {
      const savedGridSquareSizeValue = indiciaFns.cookie('leafletMapGridSquareSize');
      this.options.mapEl.settings.overrideGridSquareSize = savedGridSquareSizeValue;
      if (savedGridSquareSizeValue && savedGridSquareSizeValue !== 'autoGridSquareSize') {
        // Less than 10 km squares should not be zoomed out too far due to data
        // volumes.
        this.options.mapEl.map.setMinZoom(Math.max(0, 10 - (savedGridSquareSizeValue / 1000)));
      }
      const select = $('<select>', {
        id: ctrlId,
        class: 'form-control'
      });
      $(`<option value="autoGridSquareSize">${indiciaData.lang.leafletTools.autoLayerTitle}</option>`).appendTo(select);
      $('<option value="10000">10 km</option>').appendTo(select);
      $('<option value="2000">2 km</option>').appendTo(select);
      $('<option value="1000">1 km</option>').appendTo(select);
      var options = this.options;
      select.on('change', function() {
        const sqSize = $(this).val();
        indiciaFns.cookie('leafletMapGridSquareSize', sqSize);
        if (sqSize === 'autoGridSquareSize') {
          delete options.mapEl.settings.maxSqSizeKms;
          delete options.mapEl.settings.minSqSizeKms;
          options.mapEl.map.setMinZoom(0);
        }  else {
          const sqSizeInKms = sqSize / 1000;
          options.mapEl.settings.maxSqSizeKms = sqSizeInKms;
          options.mapEl.settings.minSqSizeKms = sqSizeInKms;
          // Less than 10 km squares should not be zoomed out too far due to data volumes.
          options.mapEl.map.setMinZoom(Math.max(0, 10 - sqSizeInKms));
        }
        $.each(options.mapEl.settings.layerConfig, function() {
          let sqFieldName;
          if ((this.type === 'circle' || this.type === 'square')
            && indiciaData.esSourceObjects[this.source].settings.aggregation
            && indiciaData.esSourceObjects[this.source].settings.aggregation.by_srid
          ) {
            sqFieldName = sqSize === 'autoGridSquareSize' ? 'autoGridSquareField' : $(options.mapEl).idcLeafletMap('getAutoSquareField');
            indiciaFns.findAndSetValue(indiciaData.esSourceObjects[this.source].settings.aggregation.by_srid.aggs.by_square, 'field', sqFieldName);
            indiciaData.esSourceObjects[this.source].populate();
          }
        });
        // Hide messages and controls depending on grid square size.
        if (sqSize === '1000' || sqSize === '2000') {
          $('.sq-size-help-text').show();
        } else {
          $('.sq-size-help-text').hide();
        }
        if (sqSize === 'autoGridSquareSize') {
          $('.imprecise-map-ref-handling').show();
        } else {
          $('.imprecise-map-ref-handling').hide();
        }
      });
      select.val(savedGridSquareSizeValue ? savedGridSquareSizeValue : 'autoGridSquareSize');
      // Apply initial settings.
      select.change();
      let row = $('<div>')
        .append($(`<label for="${ctrlId}">${label}:</label>`))
        .append(select)
        .append($('<div>')
          .addClass('sq-size-help-text')
          .append($('<i class="fas fa-exclamation-triangle"></i>'))
          .append($('<span>').text(indiciaData.lang.leafletTools.gridSquareSizeHelp))
        );
      if (select.val() !== '1000' && select.val() !== '2000') {
        row.find('.sq-size-help-text').hide();
      }
      return row;
    },

    getCtrl_impreciseMapRefHandling: function(ctrlId, label, options) {
      const savedMapRefLimitCookieValue = indiciaFns.cookie('impreciseMapRefHandlingLimitTo1kmOrBetter') === 'true';
      const savedGridSquareSizeValue = indiciaFns.cookie('leafletMapGridSquareSize');
      const radioAll = $('<input>', {
        id: `${ctrlId}-all`,
        type: 'radio',
        name: 'mapref-limiter',
        checked: savedMapRefLimitCookieValue ? !savedMapRefLimitCookieValue : true,
      });
      const radioLimited = $('<input>', {
        id: `${ctrlId}-limited`,
        type: 'radio',
        name: 'mapref-limiter',
        checked: savedMapRefLimitCookieValue ? savedMapRefLimitCookieValue : false,
      });
      const div = $('<div>')
        .addClass('imprecise-map-ref-handling')
        .append($(`<p>${label}:</p>`));
      div.append($('<div>')
        .append(radioAll)
        .append($(`<label for="${ctrlId}-all">${indiciaData.lang.leafletTools.impreciseMapRefHandlingNotLimited}</label>`))
      );
      div.append($('<div>')
        .append(radioLimited)
        .append($(`<label for="${ctrlId}-limited">${indiciaData.lang.leafletTools.impreciseMapRefHandlingLimitTo1kmOrBetter}</label>`))
      );
      $([radioAll, radioLimited]).map (function () {return this.toArray(); } ).on('change', function() {
        const limited = $(this).prop('checked') === ($(this).attr('id') === `${ctrlId}-limited`);
        indiciaFns.cookie('impreciseMapRefHandlingLimitTo1kmOrBetter', limited);
        const opacitySetting = indiciaFns.cookie('leafletMapDataLayerOpacity');
        // Update all the output layer features to either hide or show as
        // required.
        $.each(options.mapEl.outputLayers, function(layerName, layer) {
          if (layer.getLayers) {
            $.each(layer.getLayers(), function() {
              if (this.options.origFillOpacity && (!limited || this.options.metric <= 1000)) {
                // Only re-show if previuosly hidden.
                if (this.options.hidden) {
                  const calculatedOpacity = indiciaFns.calculateFeatureOpacity(opacitySetting ? opacitySetting : 0.5, this.options.origFillOpacity);
                  $(this.getElement()).attr('fill-opacity', calculatedOpacity);
                  // Stroke opacity also set, but on a scale of 0.3 to 1 so it
                  // never completely disappears and reaches 1 roughly half way
                  // along scale.
                  $(this.getElement()).attr('stroke-opacity', Math.min(1, 0.3 + calculatedOpacity * 1.5));
                  this.options.hidden = false;
                }
              } else if (limited && this.options.metric > 1000) {
                $(this.getElement()).attr('fill-opacity', 0);
                $(this.getElement()).attr('stroke-opacity', 0);
                this.options.hidden = true;
              }
            });
          }
        });
      });
      if (savedGridSquareSizeValue !== 'autoGridSquareSize') {
        // Hide this control if grid square size set to anything other than auto.
        div.attr('style', 'display: none;');
      }
      return div;
    },

    onAdd: function (map) {
      const container = $('<div>').addClass('leaflet-control-indicia-tools collapsed');
      const title = $('<div>').addClass('title').appendTo(container);
      $(title).append(`<i title="${this.options.title}" class="fas fa-cog fa-2x"></i>`);

      const controlsContainer = $('<div>').addClass('controls').appendTo(container);

      // Prevent clicks from propagating to the map
      L.DomEvent.disableClickPropagation(container[0]);

      this.options.tools.forEach(opt => {
        const label = {
          'dataLayerOpacity': indiciaData.lang.leafletTools.dataLayerOpacity,
          'gridSquareSize': indiciaData.lang.leafletTools.gridSquareSize ,
          'impreciseMapRefHandling': indiciaData.lang.leafletTools.impreciseMapRefHandling
        }[opt];
        const ctrlId = `ctrl-${opt}`;
        const fn = 'getCtrl_' + opt;
        if (this[fn]) {
          if (this['isValidCtrl_' + opt]()) {
            const toolDiv = $('<div>').addClass('tool').appendTo(controlsContainer);
            this[fn](ctrlId, label).appendTo(toolDiv);
          } else {
            console.log('LeafletTool not compatible with any available map layer: ' + opt);
          }
        } else {
          console.log('Invalid control option for leafletTools: ' + opt);
        }
      });

      // Toggle collapse.
      title[0].addEventListener('mouseenter', () => {
        container.removeClass('collapsed');
        const availableHeight = (map.getContainer().getBoundingClientRect().height - controlsContainer[0].getBoundingClientRect().top + map.getContainer().getBoundingClientRect().top) - 10
        controlsContainer.css('max-height', availableHeight + 'px');
      });
      container[0].addEventListener('mouseleave', () => {
        container.addClass('collapsed');
      });

      return container[0];
    }
  });
})(jQuery);