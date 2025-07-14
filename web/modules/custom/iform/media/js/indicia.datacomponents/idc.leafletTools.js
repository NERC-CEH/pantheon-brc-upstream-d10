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
        'queryLimitTo1kmOrBetter'
      ]
    },

    getCtrl_dataLayerOpacity: function(ctrlId, label, options) {
      const savedOpacityCookieValue = indiciaFns.cookie('leafletMapDataLayerOpacity');
      const slider = $('<input>', {
        id: ctrlId,
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        value: savedOpacityCookieValue ? savedOpacityCookieValue : 0.5,
        class: 'opacity-slider form-control'
      });

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
                //console.log(opacitySetting + ' :: ' + this.options.origFillOpacity + ' :: ' + calculatedOpacity);
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
      let rowDiv = $(indiciaData.templates.twoCol50);
      rowDiv.find('.col-1').append($(`<label for="${ctrlId}">${label}</label>`));
      rowDiv.find('.col-2').append(slider);
      return rowDiv;
    },

    getCtrl_gridSquareSize: function(ctrlId, label, options) {
      const savedGridSquareSizeValue = indiciaFns.cookie('leafletMapGridSquareSize');
      options.mapEl.settings.overrideGridSquareSize = savedGridSquareSizeValue;
      if (savedGridSquareSizeValue !== 'autoGridSquareSize') {
        // Less than 10km squares should not be zoomed out too far due to data volumes.
        options.mapEl.map.setMinZoom(Math.max(0, 10 - (savedGridSquareSizeValue / 1000)));
      }
      const select = $('<select>', {
        id: ctrlId,
        class: 'form-control'
      });
      $(`<option value="autoGridSquareSize">${indiciaData.lang.leafletTools.autoLayerTitle}</option>`).appendTo(select);
      $(`<option value="10000">10km</option>`).appendTo(select);
      $(`<option value="2000">2km</option>`).appendTo(select);
      $(`<option value="1000">1km</option>`).appendTo(select);
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
          // Less than 10km squares should not be zoomed out too far due to data volumes.
          options.mapEl.map.setMinZoom(Math.max(0, 10 - sqSizeInKms));
        }
        $.each(options.mapEl.settings.layerConfig, function() {
          let sqFieldName;
          if (this.type === 'circle' || this.type === 'square') {
            sqFieldName = sqSize === 'autoGridSquareSize' ? 'autoGridSquareField' : $(options.mapEl).idcLeafletMap('getAutoSquareField');
            indiciaFns.findAndSetValue(indiciaData.esSourceObjects[this.source].settings.aggregation.by_srid.aggs.by_square, 'field', sqFieldName);
            indiciaData.esSourceObjects[this.source].populate();
          }
        });
      });
      select.val(savedGridSquareSizeValue ? savedGridSquareSizeValue : 'autoGridSquareSize');
      let rowDiv = $(indiciaData.templates.twoCol50);
      rowDiv.find('.col-1').append($(`<label for="${ctrlId}">${label}</label>`));
      rowDiv.find('.col-2').append(select);
      return rowDiv;
    },

    getCtrl_queryLimitTo1kmOrBetter: function(ctrlId, label) {
      const savedQueryLimitCookieValue = indiciaFns.cookie('leafletMapQueryLimitTo1kmOrBetter') === 'true';
      const checkbox = $('<input>', {
        id: ctrlId,
        type: 'checkbox',
        class: 'query-limiter',
        checked: savedQueryLimitCookieValue ? savedQueryLimitCookieValue : false,
      });
      checkbox.on('change', function() {
        indiciaFns.cookie('leafletMapQueryLimitTo1kmOrBetter', $(this).prop('checked') ? true : false);
      });
      return $('<div>')
          .append(checkbox)
          .append($(`<label for="${ctrlId}">${label}</label>`));
    },

    onAdd: function (map) {
      const container = $('<div>').addClass('leaflet-control-indicia-tools collapsed');
      const title = $('<div>').addClass('title').appendTo(container);
      $(title).append(`<i title="${this.options.title}" class="fas fa-cog fa-2x"></i>`);

      const controlsContainer = $('<div>').addClass('controls').appendTo(container);

      // Prevent clicks from propagating to the map
      L.DomEvent.disableClickPropagation(container[0]);

      this.options.tools.forEach(opt => {
        const toolDiv = $('<div>').addClass('tool').appendTo(controlsContainer);
        const label = {
          'dataLayerOpacity': indiciaData.lang.leafletTools.dataLayerOpacity,
          'gridSquareSize': indiciaData.lang.leafletTools.gridSquareSize ,
          'queryLimitTo1kmOrBetter': indiciaData.lang.leafletTools.queryLimitTo1kmOrBetter
        }[opt];
        const ctrlId = `ctrl-${opt}`;
        const fn = 'getCtrl_' + opt;
        if (this[fn]) {
          this[fn](ctrlId, label, this.options).appendTo(toolDiv);
        } else {
          console.log('Invalid control option for leafletTools: ' + opt);
        }
      });


      // Toggle collapse
      title[0].addEventListener('mouseenter', () => {
        container.removeClass('collapsed');
      });
      container[0].addEventListener('mouseleave', () => {
        container.addClass('collapsed');
      });

      return container[0];
    }
  });
})(jQuery);