/* Indicia, the OPAL Online Recording Toolkit.
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
 */

/**
 * Class: OpenLayers.Control.HoverFeature
 * Gets data for features under the mouse cursor: runs an ajax request
 *     and inseerts the returning data into a popup
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.HoverFeature = OpenLayers.Class(OpenLayers.Control, {
    
    /**
     * APIProperty: clickTolerance
     * {Integer} Tolerance for the filter query in pixels. This has the
     *     same effect as the tolerance parameter on WMS GetFeatureInfo
     *     requests.  Will be ignored for box selections.  Applies only if
     *     <click> or <hover> is true.  Default is 5.  Note that this not
     *     only affects requests on click, but also on hover.
     */
    clickTolerance: 5,

    /**
     * Property: handlers
     * {Object} Object with references to multiple <OpenLayers.Handler>
     *     instances.
     */
    handlers: null,

    /** 
     * APIProperty: events
     * {<OpenLayers.Events>} Events instance for listeners and triggering
     *     control specific events.
     *
     * Register a listener for a particular event with the following syntax:
     * (code)
     * control.events.register(type, obj, listener);
     * (end)
     */

    /**
     * Constructor: OpenLayers.Control.HoverFeature
     * Create a new control for fetching remote features.
     *
     * Parameters:
     * options - {Object} A configuration object
     */
    initialize: function(options) {
        options.handlerOptions = options.handlerOptions || {};

        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        
        this.handlers = {};
        
        this.handlers.hover = new OpenLayers.Handler.Hover(
            this, {'move': this.cancelHover, 'pause': this.selectHover},
            OpenLayers.Util.extend(this.handlerOptions.hover, {
                'pixelTolerance': 4
            })
        );
    },
    
    /**
     * Method: activate
     * Activates the control.
     * 
     * Returns:
     * {Boolean} The control was effectively activated.
     */
    activate: function () {
        if (!this.active) {
            for(var i in this.handlers) {
                this.handlers[i].activate();
            }
        }
        return OpenLayers.Control.prototype.activate.apply(
            this, arguments
        );
    },

    /**
     * Method: deactivate
     * Deactivates the control.
     * 
     * Returns:
     * {Boolean} The control was effectively deactivated.
     */
    deactivate: function () {
        if (this.active) {
            for(var i in this.handlers) {
                this.handlers[i].deactivate();
            }
        }
        return OpenLayers.Control.prototype.deactivate.apply(
            this, arguments
        );
    },
  
    /**
     * Method: selectHover
     * Callback from the handlers.hover set up when <hover> selection is on
     *
     * Parameters:
     * evt - {Object} event object with an xy property
     */
    pixelToBounds: function(pixel) {
        var llPx = pixel.add(-this.clickTolerance/2, this.clickTolerance/2);
        var urPx = pixel.add(this.clickTolerance/2, -this.clickTolerance/2);
        var ll = this.map.getLonLatFromPixel(llPx);
        var ur = this.map.getLonLatFromPixel(urPx);
        return new OpenLayers.Bounds(ll.lon, ll.lat, ur.lon, ur.lat);
    },

    /**
     * Method: selectHover
     * Callback from the handlers.hover set up when <hover> selection is on
     *
     * Parameters:
     * evt - {Object} event object with an xy property
     */
    selectHover: function(evt) {

        var bounds = this.pixelToBounds(evt.xy);
        
        for (var i=0; i<this.map.popups.length; i++) {
          this.map.removePopup(this.map.popups[i]);
        }

        var layers = this.layers || [this.layer];
        var layer;
layerloop: {
          for(var l=0; l<layers.length; ++l) {
            layer = layers[l];
            for(var i=0, len = layer.features.length; i<len; ++i) {
                var feature = layer.features[i];
                // check if the feature is displayed
                if (!feature.getVisibility()) {
                    continue;
                }

                if (bounds.toGeometry().intersects(feature.geometry)) {
                  var urlSep = indiciaData.ajaxUrl.indexOf('?') === -1 ? '?' : '&';
                  var url = indiciaData.ajaxUrl + '/get_feature_popup_details/' + indiciaData.nid;
                  if (typeof feature.attributes.occurrence_ids !== 'undefined') {
                    url = url + urlSep + 'occurrence_ids=' + feature.attributes.occurrence_ids
                  } else if (typeof feature.attributes.occurrence_id !== 'undefined') {
                    url = url + urlSep + 'occurrence_ids=' + feature.attributes.occurrence_id
                  }
                  jQuery.ajax({
                    dataType: "json",
                    url: url,
                    data: {},
                    context: this,
                    success: function (data) {
                          this.map.addPopup(new OpenLayers.Popup.FramedCloud(
                                  "popup",
                                  this.map.getLonLatFromPixel(evt.xy),
                                  null,
                                  this.hoverOutputFn(data) ,
                                  null,
                                  true));
                      }
                    });
                    break layerloop; // only put up one popup
                }
            }
          }
        }
    },

    /**
     * Method: hoverOutputFn
     * Formats the returning data from the Ajax call into HTML for the Popup
     *
     * Parameters:
     * records - {Array{}} An array of objects containing the data to be displayed.
     */
    hoverOutputFn: function(records) {
      var html='<table>',
          keepVagueDates = typeof records[0].date === 'undefined';
      if(records.length <= 1) {
        // use normal for (in) to get object properties
        for(var attr in records[0]) {
          // skip vague date component columns if we have a standard date
          if (keepVagueDates || attr.substr(0, 5)!=='date_') {
            html += '<tr><td>' + attr.charAt(0).toUpperCase() + attr.slice(1) + '</td>' + '<td>' + records[0][attr] + '</td></tr>';
          }
        };
      } else {
        html += '<thead><tr>';
        for(var attr in records[0]) {
          // skip vague date component columns if we have a standard date
          if (keepVagueDates || attr.substr(0, 5)!=='date_') {
            html += '<td>' + attr.charAt(0).toUpperCase() + attr.slice(1) + '</td>';
          }
        };
        html += '</tr></thead><tbody>';
        for(var i = 0; i < records.length && i < 8; i++) { /// force a maximum of 8, otherwise there is havoc on the map
          html += '<tr>';
          for(var attr in records[0]) {
            if (keepVagueDates || attr.substr(0, 5)!=='date_') {
              html += '<td>' + records[i][attr] + '</td>';
            }
          };
          html += '</tr>';
        }
        html += '</tbody>';
      }
      html += '</table>';
      return html;
    },
    
    /**
     * Method: cancelHover
     * Callback from the handlers.hover set up when <hover> selection is on
     */
    cancelHover: function() {

    },

    /** 
     * Method: setMap
     * Set the map property for the control. 
     * 
     * Parameters:
     * map - {<OpenLayers.Map>} 
     */
    setMap: function(map) {
        for(var i in this.handlers) {
            this.handlers[i].setMap(map);
        }
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
    },
    
    CLASS_NAME: "OpenLayers.Control.HoverFeature"
});
