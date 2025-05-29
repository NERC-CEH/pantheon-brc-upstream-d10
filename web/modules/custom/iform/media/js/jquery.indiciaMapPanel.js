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
 * Add functions to this array for them to be called when the map settings are
 * available, allowing any setting to be overridden..
 */
mapSettingsHooks = [];

/**
 * Add functions to this array for them to be called when the map initialises.
 */
mapInitialisationHooks = [];

/**
 * Add functions to this array for them to be called a location is georeferenced.
 */
mapGeoreferenceHooks = [];

/**
 * Add functions to this array for them to be called when a location is picked in an input control.
 */
mapLocationSelectedHooks = [];

/**
 * Add functions to this array for them to be called when clicking on the map to set a spatial reference.
 * Functions will be passed data (click point information) and the map div as parameters.
 */
mapClickForSpatialRefHooks = [];

//Save the position of the last clicked as a lat long and zoom. This can then be used to automatically change the spatial
//reference when the spatial reference system is altered.
var lastClickedLatLonZoom = {};

var destroyAllFeatures;

/**
* Class: indiciaMapPanel
* JavaScript & OpenLayers based map implementation class for Indicia data entry forms.
* This code file supports read only maps. A separate plugin will then run on top of this to provide editing support
* and can be used in a chainable way. Likewise, another plugin will provide support for finding places.
*/

(function($) {
  $.fn.indiciaMapPanel = function(options, olOptions) {

    // The ghost grid square drawn when hovering
    var ghost = null;

    var plusKeyDown = false;
    var minusKeyDown = false;
    var overMap = false;
    var currentMousePixel = null;

    /**
     * Adds the distribution point indicated by a record object to a list of features.
     */
    function addPt(features, record, wktCol, opts, id) {
      var feature;
      var geom;
      if (record[wktCol] === null) {
        return;
      }
      // if an int supplied instead of a geom, this must be an index into the indiciaData.geoms array.
      if (!isNaN(record[wktCol])) {
        record[wktCol] = indiciaData.geoms[record[wktCol]];
      }
      geom = OpenLayers.Geometry.fromWKT(record[wktCol]);
      if (this.map.projection.getCode() !== this.indiciaProjection.getCode()) {
        geom.transform(this.indiciaProjection, this.map.projection);
      }
      delete record[wktCol];
      if (typeof opts.type !== 'undefined' && opts.type !== 'vector') {
        // render a point for symbols
        geom = geom.getCentroid();
      }
      feature = new OpenLayers.Feature.Vector(geom, record);
      if (typeof id !== 'undefined') {
        // store a supplied identifier against the feature
        feature.id = id;
      }
      features.push(feature);
      return feature;
    }

    /**
     * Add a feature from a WKT string to a layer.
     */
    function addWkt(wkt, layer, type) {
      _showWktFeature(this, wkt, layer, null, false, type, false);
    }

    /**
     * Version of layer.getDataExtent that filters to a feature type.
     *
     * @return OpenLayers.Bounds.
     */
    function getDataExtent(layer, type) {
      var maxExtent = null;
      var features = layer.features;
      if (features && (features.length > 0)) {
        var geometry = null;
        for(var i=0, len=features.length; i<len; i++) {
          if (features[i].attributes.type === type) {
            geometry = features[i].geometry;
            if (geometry) {
              if (maxExtent === null) {
                maxExtent = new OpenLayers.Bounds();
              }
              maxExtent.extend(geometry.getBounds());
            }
          }
        }
      }
      return maxExtent;
    }

    function reapplyQuery() {
      if (this.settings.rememberSelectionGeom) {
        selectFeaturesAndRowsInBufferedGeom(this.settings.rememberSelectionGeom, this.settings.clickableLayers, this);
      }
    }

    /**
     * Remove all features of a specific type or not of a specific type
     * This functionality allows a location to have a centroid and separate boundary.
     * Note that inverse mode does not interfere with annotations mode as this is a seperate mode added after code was originally created.
     */
    function removeAllFeatures(layer, type, inverse) {
      var toRemove = [];
      if (typeof inverse === 'undefined') {
        inverse = false;
      }
      $.each(layer.features, function checkFeature() {
        // Annotations is a special seperate mode added after original code was written, so do not interfere with
        // annotations even in inverse mode.
        if ((!inverse && this.attributes.type === type) || (inverse && this.attributes.type !== type
            && this.attributes.type !== 'annotation')) {
          toRemove.push(this);
        }
      });
      layer.removeFeatures(toRemove, {});
    }

    /*
     * Destroy features version of removeAllFeatures function. Once destroyed features cannot be added back to the layer.
     */
    destroyAllFeatures = function (layer, type, inverse) {
      var toRemove = [];
      if (typeof inverse ===' undefined') {
        inverse = false;
      }
      $.each(layer.features, function() {
        // Annotations is a special separate mode added after original code was
        // written, so do not interfere with annotations even in inverse mode.
        if ((!inverse && this.attributes.type === type) || (inverse && this.attributes.type !== type && this.attributes.type !== 'annotation')) {
          toRemove.push(this);
        }
      });
      layer.destroyFeatures(toRemove, {});
    };

    /**
     * A public method that can be fired when a location is selected in an input control, to load the location's
     * boundary onto the map. Automatic for #imp-location, but can be attached to other controls as well.
     */
    function locationSelectedInInput(div, val, loading) {
      var intValue = parseInt(val, 10);
      var geomwkt;
      var parser;
      var feature;
      if (div.map.editLayer) {
        removeAllFeatures(div.map.editLayer, 'boundary');
      }
      if (!isNaN(intValue)) {
        // Change the location control requests the location's geometry to place on the map.
        $.getJSON(div.settings.indiciaSvc + 'index.php/services/data/location/' + val +
            '?mode=json&view=detail' + div.settings.readAuth + '&callback=?', function (data) {
          // store value in saved field?
          if (data.length > 0) {
            // TODO not sure best way of doing this using the services, we don't really want
            // to use the proj4 client transform until its issues are sorted out, but have little choice here as
            // the wkt for a boundary could be too big to send to the services on the URL
            geomwkt = data[0].boundary_geom || data[0].centroid_geom;
            if (_diffProj(div.indiciaProjection, div.map.projection)) {
              // NB geometry may not be a point (especially if a boundary!)
              parser = new OpenLayers.Format.WKT();
              feature = parser.read(geomwkt);
              geomwkt = feature.geometry.transform(div.indiciaProjection, div.map.projection).toString();
            }
            _showWktFeature(div, geomwkt, div.map.editLayer, null, true, 'boundary');

            if (typeof loading === 'undefined' &&
                typeof indiciaData.searchUpdatesSref !== 'undefined' && indiciaData.searchUpdatesSref) {
              // The location search box must fill in the sample sref box, but not during initial page load
              $('#' + div.settings.srefId).val(data[0].centroid_sref);
              $('#' + div.settings.srefSystemId).val(data[0].centroid_sref_system);
              if (indiciaData.searchUpdatesUsingBoundary && data[0].boundary_geom) {
                $('#' + div.settings.geomId).val(data[0].boundary_geom);
              } else {
                $('#' + div.settings.geomId).val(data[0].centroid_geom);
              }
              // If the sref is in two parts, then we might need to split it across 2 input fields for lat and long
              if (data[0].centroid_sref.indexOf(' ') !== -1) {
                var parts = data[0].centroid_sref.trim().split(' ');
                // part 1 may have a comma at the end, so remove
                var part1 = parts.shift().split(',')[0];
                $('#' + div.settings.srefLatId).val(part1);
                $('#' + div.settings.srefLongId).val(parts.join(''));
              }
            }
            if (typeof loading === 'undefined' &&
                typeof indiciaData.searchUpdatesGeom !== 'undefined' && indiciaData.searchUpdatesGeom) {
              // The location search box must fill in the sample sref box, but not during initial page load
              $('#' + div.settings.geomId).val(data[0].boundary_geom);
            }
            $.each(mapLocationSelectedHooks, function callHook() {
              this(div, data);
            });
          }
        });
      }
    }

    /**
     * Variant of getFeatureById which allows for the features being checked being a comma
     * separated list of values, against any field.
     */
    function getFeaturesByVal(layer, value, field) {
      var features = [];
      var ids;
      var featureVal;
      var i;
      var len;
      for (i = 0, len = layer.features.length; i < len; ++i) {
        if (typeof field !== 'undefined' && typeof layer.features[i].attributes[field + 's'] !== 'undefined') {
          ids = layer.features[i].attributes[field + 's'].split(',');
          if ($.inArray(value, ids) > -1) {
            features.push(layer.features[i]);
          }
        } else {
          featureVal = (typeof field === 'undefined' ? layer.features[i].id : layer.features[i].attributes[field]);
          if (featureVal == value) {
            features.push(layer.features[i]);
          }
        }
      }
      return features;
    }

    /**
     * Compare 2 projection representations.
     */
    function _diffProj(proj1, proj2) {
      return (indiciaFns.projectionToSystem(proj1, true) !== indiciaFns.projectionToSystem(proj2, true));
    }

    /**
     * Adds a buffer around a boundary so you can zoom to the boundary without zooming too tight.
     */
    function _extendBounds(bounds, buffer) {
      var dy = Math.max(50, (bounds.top - bounds.bottom) * buffer);
      var dx = Math.max(50, (bounds.right - bounds.left) * buffer);
      bounds.top = bounds.top + dy;
      bounds.bottom = bounds.bottom - dy;
      bounds.right = bounds.right + dx;
      bounds.left = bounds.left - dx;
      return bounds;
    }

    /**
     * Add a well known text definition of a feature to the map.
     * WKT is assumed to be in map projection, unless transform is set to true
     * in which case it is transformed from the indicia projection to map projection.
     * @access private
     */
    function _showWktFeature(div, wkt, layer, invisible, temporary, type, panzoom, transform) {
      var parser = new OpenLayers.Format.WKT();
      var bounds = new OpenLayers.Bounds();
      var geometry;
      var features = [];
      var feature;
      var styletype;
      // This replaces other features of the same type
      removeAllFeatures(layer, type);
      if (wkt) {
        feature = parser.read(wkt);
        // this could be an array of features for a GEOMETRYCOLLECTION
        if (Array.isArray(feature) === false) {
          feature = [feature];
        }
        styletype = (typeof type !== 'undefined') ? type : 'default';
        $.each(feature, function () {
          if (typeof transform !== 'undefined' && transform && div.map.projection.getCode() !== div.indiciaProjection.getCode()) {
            this.geometry.transform(div.indiciaProjection, div.map.projection);
          }
          this.style = new Style(styletype, div.settings);
          this.attributes.type = type;
          if (temporary) {
            this.attributes.temp = true;
          }
          features.push(this);
          // get max extent of just the features we are adding.
          geometry = this.geometry;
          if (geometry) {
            bounds.extend(geometry.getBounds());
          }
        });
      }

      if (invisible !== null) {
        // there are invisible features that define the map extent
        $.each(invisible, function () {
          feature = parser.read(this);
          feature.style = new Style('invisible', div.settings);
          // give the invisible features a type so that they are replaced too
          feature.attributes.type = type;
          if (temporary) {
            feature.attributes.temp = true;
          }
          features.push(feature);
          bounds.extend(feature.geometry);
        });
      }
      if (features.length === 0) return false;
      layer.addFeatures(features);

      if (invisible === null) {
        // extend the boundary to include a buffer, so the map does not zoom too tight.
        bounds = _extendBounds(bounds, div.settings.maxZoomBuffer);
      }
      if (typeof panzoom === 'undefined' || panzoom) {
        if (div.map.getZoomForExtent(bounds) > div.settings.maxZoom) {
          // if showing something small, don't zoom in too far
          div.map.setCenter(bounds.getCenterLonLat(), div.settings.maxZoom);
        } else {
          // Set the default view to show something a bit larger than the size of the grid square
          div.map.zoomToExtent(bounds);
          // If map not yet drawn, e.g. on another tab, remember this boundary to zoom into
          if ($('div#map:visible').length === 0 && typeof indiciaData.zoomedBounds === 'undefined') {
            indiciaData.zoomedBounds = bounds;
          }
        }
        if (indiciaData['zoomToAfterFetchingGoogleApiScript-' + div.map.id]) {
          indiciaData['zoomToAfterFetchingGoogleApiScript-' + div.map.id] = div.map.getZoomForExtent(bounds);
        }
      }
      return features.length === 1 ? features[0] : features;
    }

    /*
     * An OpenLayers vector style object
     */
    function Style(styletype, settings) {
      var styleToApply = (typeof styletype !== 'undefined') ? styletype : 'default';

      this.fillColor = settings.fillColor;
      this.fillOpacity = settings.fillOpacity;
      this.hoverFillColor = settings.hoverFillColor;
      this.hoverFillOpacity = settings.hoverFillOpacity;
      this.hoverStrokeColor = settings.hoverStrokeColor;
      this.hoverStrokeOpacity = settings.hoverStrokeOpacity;
      this.hoverStrokeWidth = settings.hoverStrokeWidth;
      this.strokeColor = settings.strokeColor;
      this.strokeOpacity = settings.strokeOpacity;
      this.strokeWidth = settings.strokeWidth;
      this.strokeLinecap = settings.strokeLinecap;
      this.strokeDashstyle = settings.strokeDashstyle;

      this.pointRadius = settings.pointRadius;
      this.hoverPointRadius = settings.hoverPointRadius;
      this.hoverPointUnit = settings.hoverPointUnit;
      this.pointerEvents = settings.pointerEvents;
      this.cursor = settings.cursor;

      switch (styleToApply) {
        case 'georef':
          this.fillColor = settings.fillColorSearch;
          this.fillOpacity = settings.fillOpacitySearch;
          this.strokeColor = settings.strokeColorSearch;
          break;
        case 'ghost':
          this.fillColor = settings.fillColorGhost;
          this.fillOpacity = settings.fillOpacityGhost;
          this.strokeColor = settings.strokeColorGhost;
          this.strokeOpacity = settings.strokeOpacityGhost;
          this.strokeDashstyle = settings.strokeDashstyleGhost;
          break;
        case 'boundary':
          this.fillColor = settings.fillColorBoundary;
          this.fillOpacity = settings.fillOpacityBoundary;
          this.strokeColor = settings.strokeColorBoundary;
          this.strokeWidth = settings.strokeWidthBoundary;
          this.strokeDashstyle = settings.strokeDashstyleBoundary;
          // pointRadius needed for clickForPlot rotation handle circle size.
          this.pointRadius = settings.pointRadiusBoundary;
          break;
        case 'invisible':
          this.pointRadius = 0;
          break;
      }
    }

    /**
     * Hides graticules other than the one currently selected as a system.
     *
     * If the currently selected system doesn't have an associated graticule,
     * then the last shown graticule is left visible.
     */
    function _hideOtherGraticules(div) {
      var graticuleProjection;
      if (typeof div.settings.graticules[$('#' + opts.srefSystemId).val()] !== 'undefined') {
        graticuleProjection = 'EPSG:' + div.settings.graticules[$('#' + opts.srefSystemId).val()].projection;
        $.each(div.map.controls, function updateGratControl() {
          var show;
          if (this.CLASS_NAME === 'OpenLayers.Control.Graticule') {
            show = this.projection === graticuleProjection;
            this.gratLayer.setVisibility(show);
          }
        });
      }
    }

    /**
     * Bind spatial reference controls to the map behaviour.
     *
     * Use jQuery selectors to locate any other related controls on the
     * page which need to have events bound to them to associate them with the
     * map.
     */
    function _bindControls(div) {
      var currentZoom;
      indiciaData.spatialRefWhenSrefInputFocused = null;
      var userChangedSref = function () {
        // We know value has been changed if it is different when the user
        // moves off the field.
        if (indiciaData.spatialRefWhenSrefInputFocused !== null && $(this).val() !== indiciaData.spatialRefWhenSrefInputFocused) {
          _handleEnteredSref($(this).val(), div);
          _hideOtherGraticules(div);
        }
        indiciaData.spatialRefWhenSrefInputFocused = null;
      }
      // Track when the sref input focused, so we know if user made the
      // change.
      $('#' + opts.srefId).focus(function () {
        indiciaData.spatialRefWhenSrefInputFocused = $(this).val();
      });

      // If the spatial ref input control exists, bind it to the map, so
      // entering a ref updates the map.
      $('#' + opts.srefId).change(userChangedSref);
      // If the spatial ref latitude or longitude input control exists, bind it to the map, so entering a ref updates the map
      $('#' + opts.srefLatId).change(function () {
        // Only do something if both the lat and long are populated
        if ($(this).val().trim() !== '' && $('#' + opts.srefLongId).val().trim() !== '') {
          // copy the complete sref into the sref field
          $('#' + opts.srefId).val($(this).val().trim() + ', ' + $('#' + opts.srefLongId).val().trim());
          _handleEnteredSref($('#' + opts.srefId).val(), div);
        }
      });
      $('#' + opts.srefLongId).change(function () {
        // Only do something if both the lat and long are populated
        if ($('#'+opts.srefLatId).val().trim() !== '' && $(this).val().trim() !== '') {
          // copy the complete sref into the sref field
          $('#' + opts.srefId).val($('#' + opts.srefLatId).val().trim()) + ', ' + $(this).val().trim();
          _handleEnteredSref($('#' + opts.srefId).val(), div);
        }
      });
      $('#' + opts.srefSystemId).change(function () {
        // When Spatial reference system is changed then do the following....
        // -If the spatial referece has already been changed by the user since the page was loaded
        // then use that last position to provide the position to switch the spatial reference system for
        // -If the spatial reference field is loaded onto the page (e.g. existing data) then get the position
        // from the centre of the geometry rather than the last click point
        // @todo
        // -If the Spatial Reference is typed then currently it will only do a conversion if the clickForPlot option is used (which isn't very often)
        // Only do the conversion if the spatial reference field is not blank
        // -Hide graticules other than that for the the selected system
        if ($('#' + opts.srefId).val()) {
          // indiciaData.no_conversion_on_sp_system_changed should not be needed, however the system doesn't not currently support the
          // conversion of spatial reference if clickForPlot is off and the sp reference is typed by hand, so we need to switch off this function
          // in that scenario
          if (!indiciaData.no_conversion_on_sp_system_changed || indiciaData.no_conversion_on_sp_system_changed == false) {
            // When the user zooms out on the map, the spatial reference doesn't change until they click on the map,
            // This means when we convert the spatial reference we need to remember the zoom state the map was in
            // when it was last clicked (else the precision will suddenly change when switching sref system)
            // However once the conversion is done, we need to set the zoom back to its proper state so that the zoombar
            // continues to operate normally.
            currentZoom = div.map.zoom;
            // When switching spatial reference system, we don't want to suddenly zoom in without warning
            indiciaData.skip_zoom = true;
            // If user has already clicked on map, then use last click position for the conversion
            if (lastClickedLatLonZoom.lat) {
              div.map.zoom = lastClickedLatLonZoom.zoom;
              processLonLatPositionOnMap(lastClickedLatLonZoom, div);
              // If user not yet clicked on map, we can use the centre of the spatial reference geom loaded from database to do a conversion
            } else if ($('#'+opts.srefSystemId).val() && div.map.editLayer.features[0].geometry.getCentroid().y && div.map.editLayer.features[0].geometry.getCentroid().x) {
              // Set the loaded spatial reference geom to be our last "click point"
              lastClickedLatLonZoom.lat = div.map.editLayer.features[0].geometry.getCentroid().y;
              lastClickedLatLonZoom.lon = div.map.editLayer.features[0].geometry.getCentroid().x;
              lastClickedLatLonZoom.zoom = div.map.zoom;
              processLonLatPositionOnMap(lastClickedLatLonZoom, div);
            }
            div.map.zoom = currentZoom;
          }
        }
        _hideOtherGraticules(div);
      });

      // If a place search (georeference) control exists, bind it to the map.
      $('#' + div.georefOpts.georefSearchId).keypress(function (e) {
        if (e.which === 13) {
          _georeference(div);
          return false;
        }
        return true;
      });

      $('#' + div.georefOpts.georefSearchBtnId).click(function () {
        _georeference(div);
      });

      $('#' + div.georefOpts.georefCloseBtnId).click(function (e) {
        $('#' + div.georefOpts.georefDivId).hide('fast', function () { div.map.updateSize(); });
        e.preventDefault();
      });
      if ($('#imp-location').length) {
        var locChange = function () {
          locationSelectedInInput(div, $('#imp-location').val());
        };
        $('#imp-location').change(locChange);
        // trigger change event, incase imp-location was already populated when the map loaded
        locationSelectedInInput(div, $('#imp-location').val(), true);
      }
    }

    /**
     * After a click on the map, zoom in to the clicked on point.
     */
    function zoomInToClickPoint(div) {
      var features = getFeaturesByVal(div.map.editLayer, 'clickPoint', 'type');
      var bounds = features[0].geometry.getBounds();
      var maxZoom = Math.min(div.map.getZoom() + 3, div.settings.maxZoom);
      bounds = _extendBounds(bounds, div.settings.maxZoomBuffer);
      if (div.map.getZoomForExtent(bounds) > maxZoom) {
        // if showing something small, don't zoom in too far
        div.map.setCenter(bounds.getCenterLonLat(), maxZoom);
      } else {
        // Set the default view to show something triple the size of the grid square
        div.map.zoomToExtent(bounds);
      }
    }

    function switchToSatelliteBaseLayer(map) {
      $.each(map.layers, function eachLayer() {
        if (this.isBaseLayer
            && (this.name.indexOf('Satellite') !== -1 || this.name.indexOf('Hybrid') !== -1)
            && map.baseLayer !== this) {
          map.setBaseLayer(this);
          return false;
        }
      });
    }

    function getPrecisionHelp(div, value) {
      var helpText = [];
      var helpClass = '';
      var info;
      var handler = indiciaData.srefHandlers[_getSystem().toLowerCase()];
      if (div.settings.helpToPickPrecisionMin && typeof indiciaData.srefHandlers !== 'undefined' &&
          typeof indiciaData.srefHandlers[_getSystem().toLowerCase()] !== 'undefined' &&
          $.inArray('precisions', indiciaData.srefHandlers[_getSystem().toLowerCase()].returns) !== -1) {
        info = handler.getPrecisionInfo(handler.valueToAccuracy(value));
        if (info.metres > div.settings.helpToPickPrecisionMin) {
          helpText.push(div.settings.hlpImproveResolution1.replace('{size}', info.display).replace('{type}', info.type));
          helpClass = 'help-red';
        } else if (info.metres > div.settings.helpToPickPrecisionMax) {
          helpText.push(div.settings.hlpImproveResolution2.replace('{size}', info.display).replace('{type}', info.type));
          helpClass = 'help-amber';
        } else {
          helpText.push(div.settings.hlpImproveResolution3.replace('{size}', info.display).replace('{type}', info.type));
          helpClass = 'help-green';
        }
        // Switch layer, but not if on a dynamic layer which already handles this.
        if (div.settings.helpToPickPrecisionSwitchAt && info.metres <= div.settings.helpToPickPrecisionSwitchAt
            && !div.map.baseLayer.dynamicLayerIndex) {
          switchToSatelliteBaseLayer(div.map);
          helpText.push(div.settings.hlpImproveResolutionSwitch);
        }
        zoomInToClickPoint(div);
      }
      return {
        text: helpText.join(' '),
        class: helpClass
      };
    }

    function _handleEnteredSref(value, div) {
      indiciaData.invalidSrefDetected = false;
      $('#' + div.settings.helpDiv).hide();
      // old sref no longer valid so clear the geom
      $('#' + opts.geomId).val('');
      if (value !== '') {
        $.ajax({
          dataType: 'jsonp',
          url: div.settings.indiciaSvc + 'index.php/services/spatial/sref_to_wkt',
          data: 'sref=' + value +
            '&system=' + _getSystem() +
            '&mapsystem=' + indiciaFns.projectionToSystem(div.map.projection, false),
          success: function(data) {
            var feature;
            // JSONP can't handle http status code errors. So error check in success response.
            if (typeof data.error !== 'undefined')
              if (data.code === 4001) {
                indiciaData.invalidSrefDetected = true;
                alert(div.settings.msgSrefNotRecognised);
              } else
                alert(data.error);
            else {
              // data should contain 2 wkts, one in indiciaProjection which is stored in the geom field,
              // and one in mapProjection which is used to draw the object.
              if (div.map.editLayer) {
                // Code for drawing a plot if the user clicks on the map or changes a spatial reference.
                if (div.settings.clickForPlot) {
                  data.sref = value;
                  // Get front of the WKT to find out the spatial reference type the user used, a point would be a lat long, a polygon would be an OSGB square
                  var typeCheck = data.mapwkt.substr(0, 6);
                  var wktPoints = [];
                  // The plot is drawn from a lat long position, Just take the first value to draw the plot from for
                  // lat/long. For OSGB, take an average of all the points to get a single point to draw the plot from
                  // as there are multiple points in that instance representing the OSGB square. Note the OSGB value
                  // will be a small square such as 1m (we obviously need to draw a plot that is bigger than the OSGB square we draw from)
                  var openlayersLatlong = new OpenLayers.LonLat();
                  var splitPointFromWkt;
                  openlayersLatlong.lon = 0;
                  openlayersLatlong.lat = 0;
                  // Split the points making up the wkt into an array for working on
                  if (typeCheck === 'POINT(') {
                    data.mapwkt = data.mapwkt.slice(6).split(')');
                    wktPoints[0] = data.mapwkt[0];
                  } else {
                    data.mapwkt = data.mapwkt.slice(9);
                    data.mapwkt = data.mapwkt.slice(0,-2);
                    wktPoints = data.mapwkt.split(',');
                  }
                  // If there are multiple points representing the spatial reference (e.g. OSGB square)
                  // then average all the points to get single point to draw from.
                  for (var i = 0; i < wktPoints.length; i++) {
                    splitPointFromWkt = wktPoints[i].split(' ');
                    openlayersLatlong.lon += parseFloat(splitPointFromWkt[0]);
                    openlayersLatlong.lat += parseFloat(splitPointFromWkt[1]);
                  }
                  openlayersLatlong.lon /= wktPoints.length;
                  openlayersLatlong.lat /= wktPoints.length;
                  // TO DO - Get spatial reference conversion working when sp system is changed when clickForPlot is off
                  if (!indiciaData.no_conversion_on_sp_system_changed || indiciaData.no_conversion_on_sp_system_changed == false) {
                    lastClickedLatLonZoom.lon = openlayersLatlong.lon;
                    lastClickedLatLonZoom.lat = openlayersLatlong.lat;
                    lastClickedLatLonZoom.zoom = div.map.zoom;
                  } else {
                    // If clickForPlot is off, then typed spatial reference conversions are not currently supported
                    indiciaData.no_conversion_on_sp_system_changed = true;
                  }
                  // Run code that handles when a user has selected a position on the map (either a click or changing sref)
                  processLonLatPositionOnMap(openlayersLatlong, div);
                } else {
                  feature = _showWktFeature(div, data.mapwkt, div.map.editLayer, null, false, 'clickPoint');
                  if (feature) {
                    checkIfOutsideBounds(div, feature.geometry);
                  }
                }
              }
              $('#' + opts.geomId).val(data.wkt).change();
            }
          }
        });
      }
    }

    function updatePlotAfterMapClick(data, div, feature) {
      if (div.settings.clickForPlot && !div.settings.noPlotRotation) {
        // if adding a plot, select it for modification
        var modifier = new OpenLayers.Control.ModifyFeature(div.map.editLayer, {
          standalone: true,
          mode: OpenLayers.Control.ModifyFeature.DRAG | OpenLayers.Control.ModifyFeature.ROTATE
        });
        div.map.addControl(modifier);
        div.map.editLayer.events.register('featuremodified', modifier, modifyPlot);
        modifier.activate();
        div.map.plotModifier = modifier;
        // Needed check for undefined, as the ability to click for plot can now be altered on the fly once the screen
        // has loaded. This function is still always called, but now there isn't always a plot when user clicks.
        if (typeof feature !== 'undefined') {
          div.map.plotModifier.selectFeature(feature);
        }
        // Optional switch to satellite layer
        if (div.settings.helpToPickPrecisionSwitchAt && data.sref.length >= div.settings.helpToPickPrecisionSwitchAt) {
          switchToSatelliteBaseLayer(div.map);
        }
      }
    }

    /**
     * After clicking on the map, if the option is set, output encouragement and help text to get the
     * user to specify an accurate map reference. Also zooms the map in to assist this process.
     */
    function updateHelpAfterMapClick(data, div, feature) {
      var helptext = [];
      var helpItem;
      var helpDiv = $('#' + div.settings.helpDiv);
      var contentDiv = helpDiv.find('div.help-content');
      if (contentDiv.length === 0) {
        contentDiv = $('<div class="help-content"/>').appendTo(helpDiv);
      };
      helpDiv.removeClass('help-green');
      helpDiv.removeClass('help-amber');
      helpDiv.removeClass('help-red');
      // Output optional help and zoom in if more precision needed
      helpItem = getPrecisionHelp(div, data.sref);
      if (helpItem.text !== '') {
        contentDiv.html(helpItem.text);
        helpDiv.addClass(helpItem.class);
      } else {
        helptext.push(div.settings.hlpClickAgainToCorrect);
        // Extra help for grid square precision, as long as the precision is not fixed.
        if (feature.geometry.CLASS_NAME !== 'OpenLayers.Geometry.Point' &&
            (div.settings.clickedSrefPrecisionMin === '' || div.settings.clickedSrefPrecisionMin !== div.settings.clickedSrefPrecisionMax)) {
          helptext.push(div.settings.hlpZoomChangesPrecision);
        }
        contentDiv.html(helptext.join(' '));
      }
      helpDiv.show();
      // Just in case the change shifted the map
      div.map.updateSize();
    }

    /**
     * After clicking on the map, if the option is set, zoom the map in to facilitate a more accurate setting
     * of the position subsequently.
     */
    function updateZoomAfterMapClick(data, div) {
      // Skip zooming as a "one-off" even if click_zoom is on. This is currenty used when the spatial reference is set
      // by a switch in the spatial reference system where we don't want it to suddenly zoom -in without warning.
      if (!indiciaData.skip_zoom || indiciaData.skip_zoom === false) {
        // Optional zoom in after clicking when helpDiv not in use.
        zoomInToClickPoint(div);
        // Optional switch to satellite layer when using click_zoom
        if (div.settings.helpToPickPrecisionSwitchAt && data.sref.length >= div.settings.helpToPickPrecisionSwitchAt) {
          switchToSatelliteBaseLayer(div.map);
        }
      } else {
        // If we are skipping zoom on this occasion then set back to not skip it next time as skip_zoom is a used as a one_off
        // rather than permanent setting
        indiciaData.skip_zoom = false;
      }
    }

    /**
     * Return a clicked spatial ref to the species checklist that requested it.
     *
     * @param object data
     *   Data containing the clicked spatial ref.
     */
    function returnClickPointToSpeciesGrid(data) {
      var gridId;
      // Fetching grid ref for a grid row is active.
      $('.scSpatialRefFromMap.active').parent().find('.scSpatialRef').val(data.sref);
      $('.scSpatialRefFromMap.active').parent().find('.scSpatialRef').change();
      gridId = $('.scSpatialRefFromMap.active').closest('table').attr('id');
      if (indiciaData['spatialRefPerRowUseFullscreenMap-' + gridId] &&
          ((document.fullscreenElement && document.fullscreenElement !== null) ||    // alternative standard methods
            document.mozFullScreen || document.webkitIsFullScreen)) {
        (document.exitFullscreen || document.mozCancelFullScreen || webkitExitFullScreen || msExitFullScreen).call(document);
        $('.scSpatialRefFromMap.active').removeClass('active');
        if (indiciaData.lastScrollTop) {
          setTimeout(function () {
            $(document).scrollTop(indiciaData.lastScrollTop);
            delete indiciaData.lastScrollTop;
          }, 200);
        }
      }
    }

    /**
     * Having clicked on the map, transform this to a WKT, add the feature to
     * the map editlayer. If the feature is a plot, enable dragging and
     * rotating. Finally add relevant help.
     */
    function setClickPoint(data, div) {
      // data holds the sref in _getSystem format, wkt in indiciaProjection, optional mapwkt in mapProjection
      var feature;
      var parser = new OpenLayers.Format.WKT();

      if ($('.scSpatialRefFromMap.active').length > 0) {
        returnClickPointToSpeciesGrid(data);
        return;
      }
      if (div.settings.disallowManualSrefUpdate) {
        return;
      }
      // Update the spatial reference control
      $('#' + opts.srefId).val(data.sref);
      $('#' + opts.geomId).val(data.wkt).change();
      // If the sref is in two parts, then we might need to split it across 2 input fields for lat and long
      if (data.sref.indexOf(' ') !== -1) {
        var parts = data.sref.trim().split(' ');
        // part 1 may have a comma at the end, so remove
        var part1 = parts.shift().split(',')[0];
        $('#' + opts.srefLatId).val(part1);
        $('#' + opts.srefLongId).val(parts.join(''));
      }
      if ($('#annotations-mode-on').length && $('#annotations-mode-on').val() === 'yes') {
        // When in annotations mode, if the user sets the centroid on the map, we only want the previous centroid point to be removed.
        removeAllFeatures(div.map.editLayer, 'clickPoint');
      } else {
        var toRemove = [];
        $.each(div.map.editLayer.features, function () {
          // Annotations is a special seperate mode added after original code was written, so do not interfere with annotations even in inverse mode.
          // Subsample geoms should be left in place (linked to grid data).
          if (this.attributes.type && this.attributes.type !== 'boundary' && this.attributes.type !== 'zoomToBoundary' &&
              this.attributes.type !== 'annotation' && this.attributes.type !== 'subsample') {
            toRemove.push(this);
          }
        });
        div.map.editLayer.removeFeatures(toRemove, {});
      }
      ghost = null;
      // If mapwkt not provided, calculate it
      if (typeof data.mapwkt === 'undefined') {
        if (div.indiciaProjection.getCode() === div.map.projection.getCode()) {
          data.mapwkt = data.wkt;
        } else {
          feature = parser.read(data.wkt);
          data.mapwkt = feature.geometry.transform(div.indiciaProjection, div.map.projection).toString();
        }
      }
      feature = parser.read(data.mapwkt);
      feature.attributes = { type: 'clickPoint' };
      feature.style = new Style('default', div.settings);
      div.map.editLayer.addFeatures([feature]);

      checkIfOutsideBounds(div, feature.geometry);

      // Call any code which handles a click to set the spatial reference, e.g. zoom the map in, or set help hints.
      $.each(mapClickForSpatialRefHooks, function() {
        this(data, div, feature);
      });

      showGridRefHints(div);
    }

    function _georeference(div) {
      if (!div.georefInProgress) {
        div.georefInProgress = true;
        $('#' + div.georefOpts.georefDivId).hide();
        div.map.updateSize();
        $('#' + div.georefOpts.georefOutputDivId).empty();
        var searchtext = $('#' + div.georefOpts.georefSearchId).val();
        if (searchtext !== '') {
          // delegate the service lookup task to the georeferencer driver that is loaded.
          div.georeferencer.georeference(searchtext);
        } else {
          div.georefInProgress = false;
        }
      }
    }

    /**
     * Convert a georeferenced place into a display place name.
     */
    function _getPlacename(place) {
      var placename = typeof place.display === 'undefined' ? place.name : place.display;
      if (place.placeTypeName !== undefined) {
        placename = placename + ' (' + place.placeTypeName + ')';
      }
      if (place.admin1 !== undefined && place.admin1 !== '') {
        placename = placename + ', ' + place.admin1;
      }
      if (place.admin2 !== undefined && place.admin2 !== '') {
        placename = placename + '\\' + place.admin2;
      }
      return placename;
    }

    /**
     * Callback function, called by the georeferencer driver when it has found the results of a place
     * search.
     */
    function _displayGeorefOutput(div, places) {
      if (places.length > 0) {
        var ref, corner1, corner2, obj, name,
            epsg = (places[0].epsg === undefined ? 4326 : places[0].epsg);
        if (places.length === 1 &&
          places[0].name.toLowerCase().replace('.', '') === $('#' + div.georefOpts.georefSearchId).val().toLowerCase().replace('.','')) {
          // one place found that matches (ignoring case and full stop) e.g. 'st albans' matches 'St. Albans'
          ref = places[0].centroid.y + ', ' + places[0].centroid.x;
          name = places[0].name;
          corner1 = places[0].boundingBox.northEast.y + ', ' + places[0].boundingBox.northEast.x;
          corner2 = places[0].boundingBox.southWest.y + ', ' + places[0].boundingBox.southWest.x;
          obj = typeof places[0].obj === 'undefined' ? {} : places[0].obj;
          _displayLocation(div, ref, corner1, corner2, epsg, name, obj);
        } else if (places.length !== 0) {
          // one inexact match or multiple matches
          $('<p>' + opts.msgGeorefSelectPlace + '</p>').appendTo('#' + div.georefOpts.georefOutputDivId);
          var ol = $('<ol>'), placename;
          $.each(places, function () {
            ref = this.centroid.y + ', ' + this.centroid.x;
            corner1 = this.boundingBox.northEast.y + ', ' + this.boundingBox.northEast.x;
            corner2 = this.boundingBox.southWest.y + ', ' + this.boundingBox.southWest.x;
            placename = _getPlacename(this);

            obj = typeof this.obj === 'undefined' ? {} : this.obj;

            ol.append($('<li>').append(
              $("<a href='#'>" + placename + '</a>')
                .click(function (e) {
                  e.preventDefault();
                })
                .click((
                  // use closures to persist the values of ref, corner1, etc, admin1, admin2
                  function (ref, corner1, corner2, epsg, placename, obj) {
                    return function () {
                      _displayLocation(div, ref, corner1, corner2, epsg, placename, obj);
                    };
                  }
                )(ref, corner1, corner2, epsg, placename, obj))
            ));
          });

          ol.appendTo('#' + div.georefOpts.georefOutputDivId);
          $('#'+div.georefOpts.georefDivId).show('fast', function() { div.map.updateSize(); });
        }
      } else {
        // no matches found
        $('<p>' + opts.msgGeorefNothingFound + '</p>').appendTo('#' + div.georefOpts.georefOutputDivId);
        $('#' + div.georefOpts.georefDivId).show('fast', function() { div.map.updateSize(); });
      }
      div.georefInProgress = false;
    }

    /**
    * After georeferencing a place, display a point on the map representing that place.
    * @access private
    */
    function _displayLocation(div, ref, corner1, corner2, epsgCode, name, obj) {
      // TODO either confirm that transform is OK or convert srefs using services.
      var epsg = new OpenLayers.Projection('EPSG:' + epsgCode);
      var refxy = ref.split(', ');
      var dataref = new OpenLayers.Geometry.Point(refxy[1], refxy[0]).transform(epsg, div.map.projection).toString();
      var corner1xy = corner1.split(', ');
      var datac1 = new OpenLayers.Geometry.Point(corner1xy[1], corner1xy[0]).transform(epsg, div.map.projection).toString();
      var corner2xy = corner2.split(', ');
      var datac2 = new OpenLayers.Geometry.Point(corner2xy[1], corner2xy[0]).transform(epsg, div.map.projection).toString();
      _showWktFeature(div, div.settings.searchDisplaysPoint ? dataref : false, div.map.searchLayer, [datac1, datac2], true, 'georef');
      // if no separate search layer, ensure sref matches feature in editlayer, if requested.
      if (div.settings.searchUpdatesSref && !div.settings.searchLayer) {
        // Unfortunately there is no guarentee that the georeferencer will return the sref in the system required: eg it will usually be in
        // Lat/Long EPSG:4326 WGS 84, but the sref system being used to record the data (which may not even be selectable by the user)
        // may be eg 27700 (British National Grid) or 2169 (Luxembourg), or 27572 (French).
        // We need to convert to the required system if the systems differ - the wkt is always in 900913.
        if (_getSystem() !== epsgCode) {
          $.getJSON(opts.indiciaSvc + 'index.php/services/spatial/wkt_to_sref' +
                '?wkt=' + dataref +
                '&system=' + _getSystem() +
                '&precision=8' +
                '&output=' + div.settings.latLongFormat +
                '&callback=?', function(data)
           {
            if (typeof data.error !== 'undefined') {
              if (data.error == 'wkt_to_sref translation is outside range of grid.') {
                alert(div.settings.msgSrefOutsideGrid);
              } else {
                alert(data.error);
              }
            } else {
                $('#' + opts.srefId).val(data.sref);
                $('#' + opts.geomId).val(dataref);
                // If the sref is in two parts, then we might need to split it across 2 input fields for lat and long
                if (data.sref.indexOf(' ') !== -1) {
                  var parts = data.sref.trim().split(' ');
                  // part 1 may have a comma at the end, so remove
                  var part1 = parts.shift().split(',')[0];
                  $('#' + opts.srefLatId).val(part1);
                  $('#' + opts.srefLongId).val(parts.join(''));
                }
            }
           }
          );
        } else {
          $('#' + opts.srefId).val(ref);
          $('#' + opts.srefLatId).val(refxy[0].trim());
          $('#' + opts.srefLongId).val(refxy[1].trim());
          $('#' + opts.geomId).val(dataref);
        }
      } else {
        // clear the sref so the user doesn't accidentally submit an old one.'
        $('#' + opts.srefId).val('');
        $('#' + opts.srefLatId).val('');
        $('#' + opts.srefLongId).val('');
        $('#' + opts.geomId).val('');
      }
      if (div.georefOpts.georefQueryMap) {
        $.each(div.map.controls, function eachControl() {
          if (typeof this.onGetInfo !== 'undefined') {
            this.onGetInfo(div.map.getPixelFromLonLat(div.map.getCenter()));
          }
        });
      }
      // call any hooks that need to know about georeferences
      $.each(mapGeoreferenceHooks, function eachHook() {
        this(div, ref, corner1, corner2, epsgCode, name, obj);
      });
      if (div.georefOpts.autoCollapseResults) {
        $('#' + div.georefOpts.georefDivId).hide('fast', function() { div.map.updateSize(); });
      }
    }

    /**
     * Return the system, by loading from the system control. If not present, revert to the default.
     */
    function _getSystem() {
      var selector=$('#' + opts.srefSystemId);
      if (selector.length===0) {
        return opts.defaultSystem;
      }
      else {
        return selector.val();
      }
    }

    /**
    * Some pre-configured layers that can be added to the map.
    */
    function _getPresetLayers(settings) {
      var osOptions = {
        // Values obtained from
        // https://api.os.uk/maps/raster/v1/wmts?request=getcapabilities&service=WMTS&key=
        // and https://osdatahub.os.uk/docs/wmts/technicalSpecification
        url: 'https://api.os.uk/maps/raster/v1/wmts?key=' + settings.os_api_key,
        version: '1.0.0',
        style: true,
        format: 'image/png',
        tileMatrixSet: 'EPSG:3857',
        matrixSet: 'EPSG:3857',
        tileOrigin: new OpenLayers.LonLat(-20037508, 20037508),
        tileSize: new OpenLayers.Size(256, 256),
        /* resolutions in web mercator result from assuming an earth with
         * equatorial radius 6378137m being shown on a 256 pixel wide map at
         * zoom level 0, i.e
         *   resolution[0] (m/pixel) = 2 * pi * 6378137 (m) / 256 (pixel)
         * Each subsequent zoom level has half the resolution of the preceeding
         * hence, at zoom level 7
         *   2 * 3.14159265 * 6378137 / (256 * 2^7) = 1222.99245
         * Not sure just where I got the numbers below from orginally.
         */
        resolutions: [
          1222.9924523925783,
          611.4962261962892,
          305.7481130981446,
          152.8740565490723,
          76.43702827453615,
          38.21851413726807,
          19.109257068634037,
          9.554628534317018,
          4.777314267158509,
          2.3886571335792546,
          1.1943285667896273,
          0.5971642833948136,
          0.2985821416974068,
          0.1492910708487034
        ],
        // 49.52834N 10.76418W ; 61.33122N 1.7801E
        maxExtent: [-1198264, 6364988, 198162, 8702278],
        /* OGC spec assumes a pixel is 0.28mm so
         *   resolution (m/pixel) = scaleDenominator (m/m) * 0.00028 (m/pixel)
         *   e.g. 1223 = 43678730 * 0.00028
         * scaleDenominators below come from getcapabilities API request.
         */
        matrixIds: [
          { identifier: 'EPSG:3857:7', scaleDenominator: 4367830.1870353315 },
          { identifier: 'EPSG:3857:8', scaleDenominator: 2183915.0935181477 },
          { identifier: 'EPSG:3857:9', scaleDenominator: 1091957.5467586026 },
          { identifier: 'EPSG:3857:10', scaleDenominator: 545978.7733797727 },
          { identifier: 'EPSG:3857:11', scaleDenominator: 272989.3866894138 },
          { identifier: 'EPSG:3857:12', scaleDenominator: 136494.6933447069 },
          { identifier: 'EPSG:3857:13', scaleDenominator: 68247.34667235345 },
          { identifier: 'EPSG:3857:14', scaleDenominator: 34123.673336176726 },
          { identifier: 'EPSG:3857:15', scaleDenominator: 17061.836668560845 },
          { identifier: 'EPSG:3857:16', scaleDenominator: 8530.918334280406 },
          { identifier: 'EPSG:3857:17', scaleDenominator: 4265.459166667739 },
          { identifier: 'EPSG:3857:18', scaleDenominator: 2132.7295838063405 },
          { identifier: 'EPSG:3857:19', scaleDenominator: 1066.3647914307007 },
          { identifier: 'EPSG:3857:20', scaleDenominator: 533.1823957153497 }
        ]
      };

      var osLeisureOptions = {
        // Values obtained from
        // https://api.os.uk/maps/raster/v1/wmts?request=getcapabilities&service=WMTS&key=
        // and https://osdatahub.os.uk/docs/wmts/technicalSpecification
        name: 'Ordnance Survey Leisure',
        layer: 'Leisure 27700',
        layerId: 'os_leisure.0',
        url: 'https://api.os.uk/maps/raster/v1/wmts?key=' + settings.os_api_key,
        version: '1.0.0',
        style: true,
        format: 'image/png',
        projection: 'EPSG:27700',
        tileMatrixSet: 'EPSG:27700',
        matrixSet: 'EPSG:27700',
        tileOrigin: new OpenLayers.LonLat(-238375, 1376256),
        tileSize: new OpenLayers.Size(256, 256),
        /* serverResolutions have to have the values set by the provider in
         * order to position the layer correctly.
         * resolutions different to serverResolutions cause the tiles to be
         * resized and allows approximate matching of the scales between this
         * and the standard Web Mercator layers.
         * http://dev.openlayers.org/docs/files/OpenLayers/Layer/WMTS-js.html#OpenLayers.Layer.WMTS.serverResolutions
         *
         * The resolution of Web Mercator varies with the cosine of the
         * latitude. Britain is roughly centred on 54 degrees north. Our target
         * resolutions are therefore res = wm_res * cos(54). E.g, for the
         * lowest zoom level
         *      r = 1222.9924523925783 * cos(54) = 718.8569
         *
         * Providing more resolutions than serverResolutions allows us to
         * magnify/reduce the final/first tile layer and add extra zoom levels.
         *
         * When switching to a Web Mercator base layer, the new zoom is set
         * based upon closest matching resolution. This means that from zoom 0
         * (res 718) we will end up with zoom 1 (res 611). Likewise, when
         * switching back we will end up zoomed out a level. This is
         * compensated for in matchMapProjectionToLayer()
         */
        serverResolutions: [896, 448, 224, 112, 56, 28, 14, 7, 3.5, 1.75],
        resolutions: [
          1437.713854,
          718.8569272,
          359.4284636,
          179.7142318,
          89.8571159,
          44.92855795,
          22.46427897,
          11.23213949,
          5.616069744,
          2.808034872,
          1.404017436,
          0.702008718,
          0.351004359],
        maxExtent: [0, 0, 700000, 1300000],
        /* OGC spec assumes a pixel is 0.28mm so
         *   serverResolution (m/pixel) = scaleDenominator (m/m) * 0.00028 (m/pixel)
         *   e.g. 896 = 3200000 * 0.00028
         * scaleDenominators below come from getcapabilities API request.
         */
        matrixIds: [
          { identifier: 'EPSG:27700:0', scaleDenominator: 3199999.999496063 },
          { identifier: 'EPSG:27700:1', scaleDenominator: 1599999.9997480316 },
          { identifier: 'EPSG:27700:2', scaleDenominator: 799999.9998740158 },
          { identifier: 'EPSG:27700:3', scaleDenominator: 399999.9999370079 },
          { identifier: 'EPSG:27700:4', scaleDenominator: 199999.99996850395 },
          { identifier: 'EPSG:27700:5', scaleDenominator: 99999.99998425198 },
          { identifier: 'EPSG:27700:6', scaleDenominator: 49999.99999212599 },
          { identifier: 'EPSG:27700:7', scaleDenominator: 24999.999996062994 },
          { identifier: 'EPSG:27700:8', scaleDenominator: 12499.999998031497 },
          { identifier: 'EPSG:27700:9', scaleDenominator: 6249.9999990157485 }
        ]
      };
      // List of available preset layers. A layer can either be defined by a
      // single function which builds the base layer, or can be an array of
      // sub-layers that together form a dynamic layer (which auto-switches as)
      // you zoom in and out. All layers defined have a property layerId, which
      // is the property name of the item in the list, plus a period then the
      // index of the layer in the group. This will be 0 for standard layers,
      // or a sequential number for dynamic layer parts.
      var r = {
        bing_aerial: function bingAerial() {
          return new OpenLayers.Layer.Bing({
            name: 'Bing Aerial',
            type: 'Aerial',
            key: settings.bing_api_key,
            sphericalMercator: true,
            layerId: 'bing_aerial.0'
          });
        },
        bing_hybrid: function bingHybrid() {
          return new OpenLayers.Layer.Bing({
            name: 'Bing Hybrid',
            type: 'AerialWithLabels',
            key: settings.bing_api_key,
            sphericalMercator: true,
            layerId: 'bing_hybrid.0'
          });
        },
        bing_shaded: function bingShaded() {
          return new OpenLayers.Layer.Bing({
            name: 'Bing Shaded',
            type: 'road',
            key: settings.bing_api_key,
            sphericalMercator: true,
            layerId: 'bing_shaded.0'
          });
        },
        bing_os: function bingOs() {
          return new OpenLayers.Layer.Bing({
            name: 'Bing Ordnance Survey',
            type: 'ordnanceSurvey',
            key: settings.bing_api_key,
            sphericalMercator: true,
            layerId: 'bing_os.0'
          });
        },
        osm: function osm() {
        // OpenStreetMap standard tile layer
          return new OpenLayers.Layer.OSM('OpenStreetMap',
            [
              'https://a.tile.openstreetmap.org/${z}/${x}/${y}.png',
              'https://b.tile.openstreetmap.org/${z}/${x}/${y}.png',
              'https://c.tile.openstreetmap.org/${z}/${x}/${y}.png'
            ], {
              layerId: 'osm.0'
            }
          );
        },
        otm: function otm() {
          // OpenTopoMap standard tile layer
          return new OpenLayers.Layer.OSM('OpenTopoMap',
            [
              'https://a.tile.opentopomap.org/${z}/${x}/${y}.png',
              'https://b.tile.opentopomap.org/${z}/${x}/${y}.png',
              'https://c.tile.opentopomap.org/${z}/${x}/${y}.png'
            ],
            {
              tileOptions: { crossOriginKeyword: null },
              layerId: 'otm.0'
            }
          );
        },
        os_outdoor: function osOutdoor() {
          return new OpenLayers.Layer.WMTS($.extend({
            name: 'Ordnance Survey Outdoor',
            layer: 'Outdoor 3857',
            layerId: 'os_outdoor.0'
          }, osOptions));
        },
        os_road: function osRoad() {
          return new OpenLayers.Layer.WMTS($.extend({
            name: 'Ordnance Survey Road',
            layer: 'Road 3857',
            layerId: 'os_road.0'
          }, osOptions));
        },
        os_light: function osLight() {
          return new OpenLayers.Layer.WMTS($.extend({
            name: 'Ordnance Survey Light',
            layer: 'Light 3857',
            layerId: 'os_light.0'
          }, osOptions));
        },
        os_leisure: function osLeisure() {
          return new OpenLayers.Layer.WMTS(osLeisureOptions);
        }
      };
      // Only enable Google layers if the API key are available.
      if (typeof indiciaData.googleApiKey !== 'undefined') {
        r.google_physical = function googlePhysical() {
          // A dummy layer with a lazy-load function to load the layer (and API)
          // on demand.
          return new OpenLayers.Layer('Google Physical', {
            isBaseLayer: true,
            layerId: 'google_physical.0',
            lazyLoadGoogleApiLayerFn: function() {
              return new OpenLayers.Layer.Google('Google Physical', {
                type: google.maps.MapTypeId.TERRAIN,
                sphericalMercator: true,
                layerId: 'google_physical.0'
              });
            }
          });
        };
        r.google_streets = function googleStreets() {
          // A dummy layer with a lazy-load function to load the layer (and API)
          // on demand.
          return new OpenLayers.Layer('Google Streets', {
            isBaseLayer: true,
            layerId: 'google_streets.0',
            lazyLoadGoogleApiLayerFn: function() {
              return new OpenLayers.Layer.Google('Google Streets', {
                numZoomLevels: 20,
                sphericalMercator: true,
                layerId: 'google_streets.0'
              });
            }
          });
        };
        r.google_hybrid = function googleHybrid() {
          // A dummy layer with a lazy-load function to load the layer (and API)
          // on demand.
          return new OpenLayers.Layer('Google Hybrid', {
            isBaseLayer: true,
            layerId: 'google_hybrid.0',
            lazyLoadGoogleApiLayerFn: function() {
              return new OpenLayers.Layer.Google('Google Hybrid', {
                type: google.maps.MapTypeId.HYBRID,
                numZoomLevels: 20,
                sphericalMercator: true,
                layerId: 'google_hybrid.0'
              });
            }
          });
        };
        r.google_satellite = function googleSatellite() {
          // A dummy layer with a lazy-load function to load the layer (and API)
          // on demand.
          return new OpenLayers.Layer('Google Satellite', {
            isBaseLayer: true,
            layerId: 'google_satellite.0',
            lazyLoadGoogleApiLayerFn: function() {
              return new OpenLayers.Layer.Google('Google Satellite', {
                type: google.maps.MapTypeId.SATELLITE,
                numZoomLevels: 20,
                sphericalMercator: true,
                layerId: 'google_satellite.0'
              });
            }
          });
        };
        r.dynamicOSGoogleSat = [
          function dynamicOSGoogleSat0() {
            // OpenStreetMap standard tile layer
            return new OpenLayers.Layer.OSM('Dynamic (*OpenStreetMap* > Ordnance Survey Leisure > Google Satellite)',
              [
                'https://a.tile.openstreetmap.org/${z}/${x}/${y}.png',
                'https://b.tile.openstreetmap.org/${z}/${x}/${y}.png',
                'https://c.tile.openstreetmap.org/${z}/${x}/${y}.png'
              ], {
                layerId: 'dynamicOSGoogleSat.0',
                maxZoom: 5,
                dynamicLayerIndex: 0
              }
            );
          },
          function dynamicOSGoogleSat1() {
            return new OpenLayers.Layer.WMTS($.extend({}, osLeisureOptions, {
              name: 'Dynamic (OpenStreetMap > *Ordnance Survey Leisure* > Google Satellite)',
              maxWidth: 500000,
              minZoom: 1,
              maxZoom: 11,
              layerId: 'dynamicOSGoogleSat.1',
              dynamicLayerIndex: 1,
              explicitlyDisallowed: [
                // This MBR covers the island of Ireland where OS Leisure
                // only has the most basic of OS mapping - country outline -
                // at smaller scales and nothing all all as you zoom in.
                new OpenLayers.Bounds([-210000, 190000, 180000, 630000])
              ],
              explicitlyAllowed: [
                // This MBR covers the southern end of the Kintyre peninsula
                // in Scotland which falls within the large NBR for all of the
                // island of Ireland.
                new OpenLayers.Bounds([145000, 600000, 193000, 640000])
              ]
            }));
          },
          function dynamicOSGoogleSat2() {
            // A dummy layer with a lazy-load function to load the layer (and API)
            // on demand.
            return new OpenLayers.Layer('Dynamic (OpenStreetMap > Ordnance Survey Leisure > *Google Satellite*)', {
              layerId: 'dynamicOSGoogleSat.2',
              isBaseLayer: true,
              maxWidth: 500,
              lazyLoadGoogleApiLayerFn: function() {
                return new OpenLayers.Layer.Google('Dynamic (OpenStreetMap > Ordnance Survey Leisure > *Google Satellite*)', {
                  type: google.maps.MapTypeId.SATELLITE,
                  numZoomLevels: 20,
                  sphericalMercator: true,
                  maxWidth: 500,
                  minZoom: 18,
                  layerId: 'dynamicOSGoogleSat.2',
                  dynamicLayerIndex: 2
                });
              }
            });
          }
        ];
        r.dynamicOSMGoogleSat = [
          function dynamicOSMGoogleSat0() {
            // OpenStreetMap standard tile layer
            return new OpenLayers.Layer.OSM('Dynamic (*OpenStreetMap* > Google Satellite)',
              [
                'https://a.tile.openstreetmap.org/${z}/${x}/${y}.png',
                'https://b.tile.openstreetmap.org/${z}/${x}/${y}.png',
                'https://c.tile.openstreetmap.org/${z}/${x}/${y}.png'
              ], {
                layerId: 'dynamicOSMGoogleSat.0',
                maxZoom: 18,
                dynamicLayerIndex: 0
              }
            );
          },
          function dynamicOSMGoogleSat1() {
            // A dummy layer with a lazy-load function to load the layer (and API)
            // on demand.
            return new OpenLayers.Layer('Dynamic (OpenStreetMap > *Google Satellite*)', {
              layerId: 'dynamicOSMGoogleSat.1',
              isBaseLayer: true,
              maxWidth: 500,
              lazyLoadGoogleApiLayerFn: function() {
                return new OpenLayers.Layer.Google('Dynamic (OpenStreetMap > *Google Satellite*)', {
                  type: google.maps.MapTypeId.SATELLITE,
                  numZoomLevels: 20,
                  sphericalMercator: true,
                  maxWidth: 500,
                  minZoom: 18,
                  layerId: 'dynamicOSMGoogleSat.1',
                  dynamicLayerIndex: 1
                });
              }
            });
          }
        ];
      }
      return r;
    }

    /**
     * Converts a bounds to a point or polygon geom.
     */
    function boundsToGeom(position, div) {
      var geom, bounds, xy, minXY, maxXY;
      if (position.left === position.right && position.top === position.bottom) {
        // point clicked
        xy = div.map.getLonLatFromPixel(
            new OpenLayers.Pixel(position.left, position.bottom)
        );
        geom = new OpenLayers.Geometry.Point(xy.lon, xy.lat);
      } else {
        // bounding box dragged
        minXY = div.map.getLonLatFromPixel(
            new OpenLayers.Pixel(position.left, position.bottom)
        );
        maxXY = div.map.getLonLatFromPixel(
            new OpenLayers.Pixel(position.right, position.top)
        );
        bounds = new OpenLayers.Bounds(
            minXY.lon, minXY.lat, maxXY.lon, maxXY.lat
        );
        geom = bounds.toGeometry();
      }
      return geom;
    }

    /**
     * Finds the minimum tolerance to apply when checking for features that intersect a click point.
     */
    function getMinTolerance(testGeom, div) {
      var parser;
      var buffer = $('#click-buffer').length === 0 ? 0 : $('#click-buffer input').val(); // from settings
      var geom;
      var feature;
      // If the buffer specified needs transforming for use on the map then do it.
      if (div.settings.selectFeatureBufferProjection && buffer > 0
          && div.map.projection.getCode() !== 'EPSG:' + div.settings.selectFeatureBufferProjection) {
        geom = testGeom.clone();
        geom.transform(div.map.projection, 'EPSG:' + div.settings.selectFeatureBufferProjection);
        parser = new OpenLayers.Format.WKT();
        feature = parser.read('LINESTRING(' +
          geom.getCentroid().x + ' ' + geom.getCentroid().y + ',' +
          (geom.getCentroid().x + parseInt(buffer, 10)) + ' ' + geom.getCentroid().y
          + ')');
        feature.geometry.transform('EPSG:' + div.settings.selectFeatureBufferProjection, div.map.projection);
        return feature.geometry.getLength();
      } else {
        return buffer;
      }
    }

    /*
     * Selects the features in the contents of a geom, appying user specified buffer.
     */
    function selectFeaturesInBufferedGeom(geom, layers, div) {
      var tolerantGeom, layer, tolerance, testGeoms={},
          getRadius, getStrokeWidth, radius, strokeWidth, match;
      var minTolerance;
      if (geom instanceof OpenLayers.Geometry) {
        minTolerance = getMinTolerance(geom, div);
        for (var l = 0; l < layers.length; ++l) {
          // set defaults
          getRadius = null;
          getStrokeWidth = null;
          radius = 6;
          strokeWidth = 1;
          layer = layers[l];
          // when testing a click point, use a circle drawn around the click point so the
          // click does not have to be exact. At this stage, we just look for the layer default
          // pointRadius and strokeWidth, so we can calculate the geom size to test.
          if (geom.CLASS_NAME === 'OpenLayers.Geometry.Point') {
            if (typeof layer.styleMap.styles.default.defaultStyle.pointRadius !== 'undefined') {
              radius = layer.styleMap.styles.default.defaultStyle.pointRadius;
              if (typeof radius === 'string') {
                // A setting {n} means we use n to get the pointRadius per feature (either a field or a context func)
                match = radius.match(/^\${(.+)}/);
                if (match !== null && match.length > 1) {
                  getRadius = layer.styleMap.styles.default.context[match[1]];
                  if (getRadius === undefined) {
                    // the context function is missing, so must be a field name
                    getRadius = match[1];
                  }
                }
              }
            }
            if (typeof layer.styleMap.styles.default.defaultStyle.strokeWidth !== 'undefined') {
              strokeWidth = layer.styleMap.styles.default.defaultStyle.strokeWidth;
              if (typeof strokeWidth === 'string') {
                // A setting {n} means we use n to get the strokeWidth per feature (either a field or a context func)
                match = strokeWidth.match(/^\${(.+)}/);
                if (match !== null && match.length > 1) {
                  getStrokeWidth = layer.styleMap.styles.default.context[match[1]];
                  if (getStrokeWidth === undefined) {
                    // the context function is missing, so must be a field name
                    getStrokeWidth = match[1];
                  }
                }
              }
            }
          }
          var featuresToSelect = [];
          for (var i = 0, len = layer.features.length; i < len; ++i) {
            var feature = layer.features[i];
            if (getRadius !== null) {
              // getRadius might be a string (fieldname) or a context function, so overwrite the layer default
              if (typeof getRadius === 'string') {
                radius = feature.attributes[getRadius];
              } else {
                radius = getRadius(feature);
              }
            }
            if (getStrokeWidth !== null) {
              // getStrokeWidth might be a string (fieldname) or a context function, so overwrite the layer default
              if (typeof getStrokeWidth === 'string') {
                strokeWidth = feature.attributes[getStrokeWidth];
              } else {
                strokeWidth = getStrokeWidth(feature);
              }
            }
            if (geom.CLASS_NAME === 'OpenLayers.Geometry.Point') {
              tolerance = div.map.getResolution() * (radius + (strokeWidth / 2));
              tolerance = Math.max(minTolerance, Math.round(tolerance));
              // keep geoms we create so we don't keep rebuilding them
              if (typeof testGeoms['geom-' + Math.round(tolerance / 100)] !== 'undefined') {
                tolerantGeom = testGeoms['geom-' + Math.round(tolerance / 100)];
              } else {
                tolerantGeom = OpenLayers.Geometry.Polygon.createRegularPolygon(geom, tolerance, 8, 0);
                testGeoms['geom-' + Math.round(tolerance / 100)] = tolerantGeom;
              }
            } else {
              tolerantGeom = geom;
            }
            if (tolerantGeom.intersects(feature.geometry)) {
              featuresToSelect.push(feature);
            }
          }
          layer.map.setSelection(layer, featuresToSelect);
        }
      }
    }

    function selectFeaturesAndRowsInBufferedGeom(geom, clickableLayers, div) {
      var features = [];
      var origfeatures = [];
      var ids = [];
      var len = 0;
      var clickableVectorLayers = [];
      // Store the geom in case we reload the layer after a zoom.
      div.settings.rememberSelectionGeom = geom;
      // build an array of all previously selected features in one
      $.each(clickableLayers, function eachLayer() {
        if (this.CLASS_NAME === 'OpenLayers.Layer.Vector') {
          clickableVectorLayers.push(this);
        }
        origfeatures = origfeatures.concat(this.selectedFeatures);
      });
      // select all the features that were clicked or boxed.
      selectFeaturesInBufferedGeom(geom, clickableVectorLayers, div);
      // build an array of all newly selected features in one
      $.each(clickableVectorLayers, function eachLayer() {
        features = features.concat(this.selectedFeatures);
      });
      // now filter the report, highlight rows, or display output in a popup or div depending on settings.
      if (div.settings.clickableLayersOutputMode === 'report' && div.settings.reportGroup !== null &&
          typeof indiciaData.reports !== 'undefined') {
        // grab the feature ids
        $.each(features, function eachFeature() {
          if (len > 1500) { // approaching 2K IE limit
            alert('Too many records have been selected to show them all in the grid. Trying zooming in and selecting fewer records.');
            return false;
          }
          if (typeof this.attributes[div.settings.featureIdField] !== 'undefined') {
            ids.push(this.attributes[div.settings.featureIdField]);
            len += this.attributes[div.settings.featureIdField].length;
          } else if (typeof this.attributes[div.settings.featureIdField + 's'] !== 'undefined') {
            // allow for plural, list fields
            ids.push(this.attributes[div.settings.featureIdField + 's']);
            len += this.attributes[div.settings.featureIdField + 's'].length;
          }
          return true;
        });
        $('.' + div.settings.reportGroup + '-idlist-param').val(ids.join(','));
        // find the associated reports, charts etc and reload them to show the selected data. No need to if we started with no selection
        // and still have no selection.
        if (origfeatures.length !== 0 || features.length !== 0) {
          $.each(indiciaData.reports[div.settings.reportGroup], function () {
            this[0].settings.offset = 0;
            // force the param in, in case there is no params form.
            this[0].settings.extraParams.idlist = ids.join(',');
            this.reload(true);
          });
        }
      } else if (div.settings.clickableLayersOutputMode === 'reportHighlight' && typeof indiciaData.reports !== 'undefined') {
        // deselect existing selection in grid as well as on feature layer
        $('table.report-grid tr').removeClass('selected');
        // grab the features which should have an id corresponding to the rows to select
        $.each(features, function () {
          $('table.report-grid tr#row' + this.id).addClass('selected');
        });
      } else if (div.settings.clickableLayersOutputMode === 'div') {
        $('#'+div.settings.clickableLayersOutputDiv).html(div.settings.clickableLayersOutputFn(features, div));
        //allows a custom function to be run when a user clicks on a map
      } else if (div.settings.clickableLayersOutputMode === 'customFunction') {
        // features is already the list of clicked on objects, div.setting's.customClickFn must be a function passed to the map as a param.
        div.settings.customClickFn(features, geom);
      } else {
        if (typeof OpenLayers.Popup === 'undefined') {
          $.fancyDialog({
            title:'Feature information',
            message: div.settings.clickableLayersOutputFn(features, div),
            cancelButton: null
          });
        } else {
          for (var i = 0; i<div.map.popups.length; i++) {
            div.map.removePopup(div.map.popups[i]);
          }
          div.map.addPopup(new OpenLayers.Popup.FramedCloud(
              "popup",
              div.map.getLonLatFromPixel(this.lastclick),
              null,
              div.settings.clickableLayersOutputFn(features, div),
              null,
              true
          ));
        }
      }
    }

    /**
     * Filters to show records within a buffer of the selected record in the grid.
     */
    function bufferRoundSelectedRecord(div, buffer) {
      var row = $('.report-grid tr.selected');
      var id;
      if (row.length > 0) {
        id = row[0].id.replace(/^row/, '');
        // Call warehouse to obtain best precision available for this record, as map feature could be low res.
        $.ajax({
          dataType: 'jsonp',
          url: div.settings.indiciaSvc + 'index.php/services/report/requestReport?' +
            'report=library/occurrences/filterable_explore_list_mapping.xml' +
            '&reportSource=local&occurrence_id=' + id + div.settings.readAuth +
            '&quality=all&confidential=all&release_status=A' +
            '&mode=json&callback=?',
          success: function(data) {
            parser = new OpenLayers.Format.WKT();
            feature = parser.read(data[0].geom);
            selectFeaturesAndRowsInBufferedGeom(feature.geometry, div.settings.clickableLayers, div);
          }
        });

      }
    }

    function addClickBufferCtrl(div) {
      $(div).append(
        '<label id="click-buffer" class="olButton" style="display: none">Tolerance:<input type="text" value="1000"/>m</label>');
      $('#click-buffer').css('right', $('.olControlEditingToolbar').outerWidth() + 10);
      $('#click-buffer input').keypress(function (evt) {
        // Only accept numeric input.
        if (evt.which < 48 || evt.which > 57) {
          evt.preventDefault();
        }
      });
      $('#click-buffer input').change(function () {
        bufferRoundSelectedRecord(div, $('#click-buffer input').val());
      });
    }

    /**
     * Create tools required to click on features to drill into the data etc.
     */
    function getClickableLayersControl(div, align) {
      if (div.settings.clickableLayers.length!==0) {
        var clickableWMSLayerNames = [], clickableVectorLayers = [], wmsUrl = '';
        // find out which of the clickable layers are WMS or Vector, since we handle them differently.
        $.each(div.settings.clickableLayers, function () {
          if (this.CLASS_NAME === 'OpenLayers.Layer.WMS') {
            if (wmsUrl === '') {
              // store just the first wms layer's URL since all clickable layers must be from the same url.
              wmsUrl = this.url;
            }
            clickableWMSLayerNames.push(this.params.LAYERS);
          } else if (this.CLASS_NAME === 'OpenLayers.Layer.Vector' && $.inArray(this, clickableVectorLayers) === -1) {
            clickableVectorLayers.push(this);
          }
        });

        clickableWMSLayerNames = clickableWMSLayerNames.join(',');
        // Create a control that can handle both WMS and vector layer clicks.
        var toolTitle = div.settings.reportGroup === null ? '' : div.settings.hintQueryDataPointsTool;
        if (toolTitle && div.settings.selectFeatureBufferProjection) {
          toolTitle += '. ' + div.settings.hintQueryBufferTool;
        }
        var infoCtrl = new OpenLayers.Control({
          hoverControl: null,
          displayClass: align + 'olControlSelectFeature',
          title: toolTitle,
          lastclick: {},
          allowBox: clickableVectorLayers.length > 0 && div.settings.allowBox === true,
          deactivate: function () {
            if(this.hoverControl !== null) {
              this.hoverControl.deactivate();
            }
            if ($('#click-buffer:visible')) {
              $('#click-buffer').hide();
            }
            //If the map is setup to use popups, then we need to switch off popups when moving to use a different tool icon
            //on the map (such as drawing boundaries) otheriwise they will continue to show.
            if (clickableVectorLayers.length > 0 && this.allowBox) {
              if (this.handlers) {
                this.handlers.box.deactivate();
              }
              //Remove any popups still being displayed
              $('.olPopup').remove();
            }
            //Continue with the deactivation.
            OpenLayers.Control.prototype.deactivate.call(this);
          },
          activate: function activate() {
            if (div.settings.selectFeatureBufferProjection && $(div).closest('#map-container').length) {
              $('#click-buffer').css('right', $('.olControlEditingToolbar').outerWidth() + 10);
              $('#click-buffer').show();
            }
            var handlerOptions = {
              single: true,
              double: false,
              stopSingle: false,
              stopDouble: true
            };
            if (clickableVectorLayers.length > 0 && this.allowBox) {
              this.handlers = {
                box: new OpenLayers.Handler.Box(
                  this, { done: this.onGetInfo },
                  { boxDivClassName: 'olHandlerBoxSelectFeature' }
                )
              };
             this.handlers.box.activate();
            } else {
              // allow click or bounding box actions
              this.handlers = {
                click: new OpenLayers.Handler.Click(this, {
                  click: this.onGetInfo
                }, handlerOptions)
              };
              this.handlers.click.activate();
            }
            // create a protocol for the WMS getFeatureInfo requests if we need to
            if (wmsUrl !== '') {
              this.protocol = new OpenLayers.Protocol.Script({
                url: wmsUrl,
                callback: this.onResponse,
                scope: this
              });
            }
            if (clickableVectorLayers.length > 0 && this.hoverControl !== null) {
              this.hoverControl.activate();
            }
            OpenLayers.Control.prototype.activate.call(this);
          },
          // handler for the click or bounding box action
          onGetInfo: function (position) {
            var bounds;
            var geom;
            // we could have a point or a bounds
            if (position instanceof OpenLayers.Bounds) {
              bounds = position;
              // use box centre as click point
              this.lastclick.x = (position.left + position.right) / 2;
              this.lastclick.y = (position.bottom + position.top) / 2;
            } else {
              // create a bounds from the click point. It may have xy if from WMS click, or not from Vector click
              if (typeof position.xy!=='undefined') {
                this.lastclick = position.xy;
              } else {
                this.lastclick = position;
              }
              bounds = new OpenLayers.Bounds(this.lastclick.x, this.lastclick.y, this.lastclick.x, this.lastclick.y);
            }
            geom = boundsToGeom(bounds, div);
            if (clickableWMSLayerNames !== '') {
              // Do a WMS request
              var params = {
                REQUEST: 'GetFeatureInfo',
                EXCEPTIONS: 'text/javascript',
                VERSION: '1.1.0',
                STYLES: '',
                BBOX: div.map.getExtent().toBBOX(),
                X: Math.round(this.lastclick.x),
                Y: Math.round(this.lastclick.y),
                INFO_FORMAT: 'text/javascript',
                LAYERS: clickableWMSLayerNames,
                QUERY_LAYERS: clickableWMSLayerNames,
                WIDTH: div.map.size.w,
                HEIGHT: div.map.size.h,
                SRS: div.map.projection,
                BUFFER: div.settings.clickPixelTolerance
              };
              if (div.settings.clickableLayers[0].params.CQL_FILTER !== undefined) {
                if (div.settings.clickableLayers.length > 1) {
                  alert('Multiple layers are clickable with filters defined. This is not supported at present');
                  return;
                }
                params.CQL_FILTER = div.settings.clickableLayers[0].params.CQL_FILTER;
              }
              // hack: Because WMS layers don't support the proxyHost setting in OL, but we need to, WMS layers will have
              // the proxy URL built into their URL. But OL will use proxyHost for a protocol request. Therefore temporarily
              // disable proxyHost during this request.
              var oldPh = OpenLayers.ProxyHost;
              if (wmsUrl.substr(0, OpenLayers.ProxyHost.length) === OpenLayers.ProxyHost) {
                OpenLayers.ProxyHost = '';
              }
              try {
                // GeoServer specific settings for the JSONP request.
                // GeoServer must have JSONP enabled in webapps/geoserver/WEB_INF/web.xml
                // for this to work.
                this.protocol.callbackKey = 'format_options';
                this.protocol.callbackPrefix = 'callback:';
                this.protocol.read({
                  params: params
                });
              } finally {
                OpenLayers.ProxyHost = oldPh;
              }
            }
            // now handle any vector clickable layers
            if (clickableVectorLayers.length > 0) {
              selectFeaturesAndRowsInBufferedGeom(geom, clickableVectorLayers, div);
            }
          },
          // handler for response from a WMS call.
          // todo: support div or report filters.
          onResponse: function (response) {
            if (div.settings.clickableLayersOutputMode === 'popup') {
              for (var i = 0; i < div.map.popups.length; i++) {
                div.map.removePopup(div.map.popups[i]);
              }
              div.map.addPopup(new OpenLayers.Popup.FramedCloud(
                'popup',
                div.map.getLonLatFromPixel(this.lastclick),
                null,
                div.settings.clickableLayersOutputFn(response.features, div),
                null,
                true
              ));
            } else {
              $('#' + div.settings.clickableLayersOutputDiv).html(div.settings.clickableLayersOutputFn(response.features, div));
            }
          }

        });

        if (clickableVectorLayers.length > 0 && div.settings.hoverShowsDetails === true) {
          // If there are clickable layers and hover is enabled, we add a hidden control to handle the hover events
          // It is not possible to have a single select control that does both. The select control itself
          // interferes with select status of feature, even if in hover mode, so use our own custom control.
          infoCtrl.hoverControl = new OpenLayers.Control.HoverFeature({ layers: clickableVectorLayers });
        }

        return infoCtrl;
      }
      return null;
    }

    /**
     * Gets the precision required for a grid square dependent on the map zoom.
     * Precision parameter is the optional default, overridden by the clickedSrefPrecisionMin and
     * clickedSrefPrecisionMax settings. Set accountForModifierKey to false to disable adjustments
     * made for the plus and minus key.
     * @return Number of letters required in OSGB style notation to describe a ref to this precision.
     * Therefore 0 = 100km precision, 2 = 10km precision, 4=1km precision etc.
     */
    function getPrecisionInfo(div, precision, accountForModifierKey) {
      if (typeof accountForModifierKey === 'undefined') {
        accountForModifierKey = true;
      }
      // get approx metres accuracy we can expect from the mouse click - about 5mm accuracy.
      var metres = div.map.getScale() / 200;
      if (typeof precision === 'undefined' || precision === null) {
        // now round to find appropriate square size
        if (metres < 3) {
          precision = 10;
        } else if (metres < 30) {
          precision = 8;
        } else if (metres < 300) {
          precision = 6;
        } else if (metres < 3000) {
          precision = 4;
        } else {
          precision = 2;
        }
      }
      if (accountForModifierKey) {
        // + and - keys can change the grid square precision
        precision = plusKeyDown ? precision + 2 : precision;
        precision = minusKeyDown ? precision - 2 : precision;
      }
      // enforce precision limits if specified in the settings
      if (div.settings.clickedSrefPrecisionMin !== '') {
        precision = Math.max(div.settings.clickedSrefPrecisionMin, precision);
      }
      if (div.settings.clickedSrefPrecisionMax !== '') {
        precision = Math.min(div.settings.clickedSrefPrecisionMax, precision);
      }
      return { precision: precision, metres: metres };
    }

    /**
     * Converts a point to a spatial reference, and also generates the
     * indiciaProjection and mapProjection wkts. The point should be a point
     * geometry object in the map projection or projection defined by pointSystem,
     * system should hold the system we wish to display the Sref. pointSystem
     * is optional and defines the projection of the point if not the map
     * projection.
     * Precision can be set to the number of digits in the grid ref to return
     * or left for default which depends on the map zoom.
     * We have consistency problems between the proj4 on the client and in the
     * database, so go to the services whereever possible to convert.
     * Callback gets called with the sref in system, and the wkt in
     * indiciaProjection. These may be different.
     */
    function pointToSref(div, point, system, callback, pointSystem, precision) {
      if (typeof pointSystem === 'undefined') {
        pointSystem = indiciaFns.projectionToSystem(div.map.projection, false);
      }
      // get precision required dependent on map zoom
      var precisionInfo = getPrecisionInfo(div, precision);
      if (typeof indiciaData.srefHandlers === 'undefined' ||
          typeof indiciaData.srefHandlers[system.toLowerCase()] === 'undefined' ||
          $.inArray('wkt', indiciaData.srefHandlers[system.toLowerCase()].returns) === -1 ||
          $.inArray('gridNotation', indiciaData.srefHandlers[system.toLowerCase()].returns) === -1) {
        // next call also generates the wkt in map projection
        $.getJSON(opts.indiciaSvc + 'index.php/services/spatial/wkt_to_sref' +
          '?wkt=' + point.toString() +
          '&system=' + system +
          '&wktsystem=' + pointSystem +
          '&mapsystem=' + indiciaFns.projectionToSystem(div.map.projection, false) +
          '&precision=' + precisionInfo.precision +
          '&metresAccuracy=' + precisionInfo.metres +
          '&output=' + div.settings.latLongFormat +
          '&callback=?', callback
        );
      } else {
        // passing a point in the mapSystem.
        var wkt;
        var r;
        var pt;
        var parser;
        var ll = new OpenLayers.LonLat(point.x, point.y);
        var proj = new OpenLayers.Projection('EPSG:' + indiciaData.srefHandlers[system.toLowerCase()].srid);
        var pointProj = pointSystem ? new OpenLayers.Projection('EPSG:' + pointSystem) : div.map.projection;
        ll.transform(pointProj, proj);
        pt = { x: ll.lon, y: ll.lat };
        wkt = indiciaData.srefHandlers[system.toLowerCase()].pointToWkt(pt, precisionInfo);
        if (wkt === 'Out of bounds') {
          r = {error: wkt};
        } else {
          parser = new OpenLayers.Format.WKT();
          r = {
            sref: indiciaData.srefHandlers[system.toLowerCase()].pointToGridNotation(pt, precisionInfo.precision),
            wkt: parser.read(wkt).geometry.transform(proj, div.indiciaProjection).toString(),
            mapwkt: parser.read(wkt).geometry.transform(proj, div.map.projection).toString(),
          };
        }
        callback(r);
      }
    }

    /**
     * Event handler for feature add/modify on the edit layer when polygon recording is enabled. Puts the geom in the hidden
     * input for the sample geom, plus sets the visible spatial ref control to the centroid in the currently selected system.
     */
    function recordPolygon(evt) {
      // track old features to replace
      var oldFeatures = [];
      var map = this.map;
      var div = map.div;
      var separateBoundary = $('#' + map.div.settings.boundaryGeomId).length > 0;
      var geom;
      evt.feature.attributes.type = div.settings.drawObjectType;
      // When drawing new features onto the map, we only ask the user
      // if they want to replace the previous feature when they have the same type.
      // This allows us to have multiple layers of different types that don't interfere with each other.
      $.each(evt.feature.layer.features, function () {
        // replace features of the same type, or allow a boundary to be replaced by a queryPolygon
        if (this !== evt.feature && (this.attributes.type === evt.feature.attributes.type || this.attributes.type === 'boundary')) {
          oldFeatures.push(this);
        }
      });
      if ($('#click-buffer:visible').length && $('#click-buffer input').val().trim() !== '' && $('#click-buffer input').val() !== '0') {
        indiciaFns.bufferFeature(evt.feature, $('#click-buffer input').val(), 8, div.settings.selectFeatureBufferProjection,
          function(buffered) {
            var layer = evt.feature.layer;
            var bufferedFeature = new OpenLayers.Feature.Vector(OpenLayers.Geometry.fromWKT(buffered.response));
            layer.removeFeatures([evt.feature], {});
            layer.addFeatures([bufferedFeature]);
            bufferedFeature.attributes.type = div.settings.drawObjectType;
          }
        );
      }
      if (oldFeatures.length > 0) {
        if (confirm(div.settings.msgReplaceBoundary)) {
          evt.feature.layer.removeFeatures(oldFeatures, {});
        } else {
          evt.feature.layer.removeFeatures([evt.feature], {});
          return;
        }
      }
      if (div.settings.drawObjectType === 'boundary' || div.settings.drawObjectType === 'annotation') {
        var geom = evt.feature.geometry.clone();
        if (map.projection.getCode() !== div.indiciaProjection.getCode()) {
          geom.transform(map.projection, div.indiciaProjection);
        }
        if (separateBoundary) {
          $('#' + div.settings.boundaryGeomId).val(geom.toString());
          evt.feature.style = new Style('boundary', div.settings);
          if(this.map.div.settings.autoFillInCentroid) {
            var centroid = evt.feature.geometry.getCentroid();
            pointToSref(this.map.div, centroid, _getSystem(), function (data) {
              if (typeof data.sref !== 'undefined') {
                $('#' + map.div.settings.srefId).val(data.sref);
                $('#' + div.settings.geomId).val(centroid.toString());
              }
            });
          }
          map.editLayer.redraw();
        } else {
          map.div.removeAllFeatures(evt.feature.layer, 'clickPoint');
          if (div.settings.helpDiv) {
            $('#' + div.settings.helpDiv).html(map.div.settings.hlpCustomPolygon);
          }
          // As we are not separating the boundary geom, the geom's sref goes in the
          // centroid, unless on filter popup.
          if (!$(div).closest('#controls-filter_where').length) {
            pointToSref(div, geom.getCentroid(), _getSystem(), function (data) {
              if (typeof data.sref !== 'undefined') {
                $('#' + div.settings.srefId).val(data.sref);
                $('#' + div.settings.geomId).val(geom.toString());
              }
            });
          }
        }
      }
    }

    /**
     * Event handler for feature modify on the edit layer when clickForPlot is enabled.
     * Puts the geom in the hidden input for the sample geom, plus sets the visible spatial
     * ref control to the SW corner in the currently selected system.
     */
    function modifyPlot(evt) {
      var modifier = this;
      var feature = evt.feature;
      var map = modifier.map;
      var precision = map.div.settings.plotPrecision;

      var vertices = feature.geometry.getVertices();
      // Initialise swVertex to somewhere very northwest.
      // This might need modifying for southern hemisphere.
      var swVertex = new OpenLayers.Geometry.Point(1e10, 1e10);
      $.each(vertices, function () {
        if ( (this.y < swVertex.y) || (this.y === swVertex.y && this.x < swVertex.x) ) {
          // Find the most southerly vertex and, of two equally southerly, take the
          // most westerly as our reference point.
          swVertex = this;
        }
      });

      // Put the geometry in the input control
      $('#imp-boundary-geom').val(feature.geometry.toString());
      // Get the sref of the swVertex and show in control
      pointToSref(map.div, swVertex, _getSystem(), function(data) {
        if (typeof data.sref !== 'undefined') {
          $('#' + map.div.settings.srefId).val(data.sref);
          $('#' + map.div.settings.geomId).val(feature.geometry.toString());
        }
      }, undefined, precision);
    }

    /**
     * Function called by the map click handler.
     */
    function clickOnMap(xy, div) {
      var lonlat = div.map.getLonLatFromPixel(xy);
      // Save the click position so that the spatial reference can be converted when the user just changes
      // the spatial reference system.
      indiciaData.no_conversion_on_sp_system_changed = false;
      lastClickedLatLonZoom.lon = lonlat.lon;
      lastClickedLatLonZoom.lat = lonlat.lat;
      lastClickedLatLonZoom.zoom = div.map.zoom;
      processLonLatPositionOnMap(lonlat, div);
    }

    /**
     * Converts lat/long then call a function to process it.
     * Function accepts a data structure as returned by the warehouse
     * conversion from Wkt to Sref. Should contain properties for sref & wkt, or error if failed.
     */

    function processLonLatPositionOnMap(lonlat, div) {
      // This is in the SRS of the current base layer, which should but may
      // not be the same projection as the map! Definitely not
      // indiciaProjection! Need to convert this map based Point to a
      // _getSystem based Sref (done by pointToSref) and a
      // indiciaProjection based geometry (done by the callback)
      var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
      var polygon;
      var plotShape;
      var system;
      if (div.settings.clickForPlot) {
        // Get plot shape using jQuery or fall back on form structure option
        if ($('#' + div.settings.plotShapeId).val()) {
          plotShape = $('#' + div.settings.plotShapeId).val();
        } else {
          plotShape = div.settings.plotShape;
        }
        // Clicking to locate a plot
        if (plotShape === 'rectangle') {
          var mapLayers = indiciaData.mapdiv.map.layers;
          //When map is clicked on, then remove previous plots.
          for(var a = 0; a < mapLayers.length; a++ ) {
            if (mapLayers[a].CLASS_NAME === 'OpenLayers.Layer.Vector') {
              destroyAllFeatures(mapLayers[a], 'zoomToBoundary', true);
            }
          }
          $('#'+ div.settings.boundaryGeomId).val('');
          var width, length;
          //We might have code that wants to supply its own width and length, else get from onscreen fields
          if (indiciaData.plotWidthLength) {
            var widthLengthSplit = indiciaData.plotWidthLength.split(',');
            width = widthLengthSplit[0];
            length = widthLengthSplit[1];
          } else {
            //G et the width and length from fields, need to escape any colons for jQuery selector to work
            width = parseFloat($('#' + div.settings.plotWidthId.replace(':', '\\:')).val());
            length = parseFloat($('#' + div.settings.plotLengthId.replace(':', '\\:')).val());
          }
          if (!width || !length) {
            if (indiciaData.noSizeWarning) {
              alert(indiciaData.noSizeWarning);
            } else {
              alert('Both a plot width and length must be supplied');
            }
            $('#'+ div.settings.boundaryGeomId).val('');
            return false;
          }
          //create a rectangular polygon
          polygon = plot_rectangle_calculator(lonlat, width, length);
          $('#'+ div.settings.boundaryGeomId).val(polygon);
        } else if (plotShape === 'circle') {
          // create a circular polygon
          var radius = parseFloat($('#' + div.settings.plotRadiusId).val());
          polygon = new OpenLayers.Geometry.Polygon.createRegularPolygon(point, radius, 20, 0);
        }
        var feature = new OpenLayers.Feature.Vector(polygon);
        var formatter = new OpenLayers.Format.WKT();
        // Store plot as WKT in map projection
        var plot = {};
        plot.mapwkt = formatter.write(feature);
        // Convert mapwkt to indicia wkt
        if (div.indiciaProjection.getCode() === div.map.projection.getCode()) {
          plot.wkt = plot.mapwkt;
        } else {
          plot.wkt = feature.geometry.transform(div.map.projection, div.indiciaProjection).toString();
        }
        var precision = div.settings.plotPrecision;
        system = chooseBestSystem(div, point, _getSystem());
        $('select#' + opts.srefSystemId).val(system);
        // Request sref of point that was clicked
        pointToSref(div, point, system, function (data) {
          plot.sref = data.sref;
          handleSelectedPositionOnMap(lonlat, div, plot);
        }, undefined, precision);
      } else {
        // Clicking to locate an sref (eg an OSGB grid square)
        system = chooseBestSystem(div, point, _getSystem());
        $('select#' + opts.srefSystemId).val(system);
        pointToSref(div, point, system, function(data) {
          handleSelectedPositionOnMap(lonlat, div, data);
          chooseBestLayer(div, point);
        });
      }
    }

    /**
     * Given an sref system, check whether this is appropriate for the supplied point. If not, then works out the best
     * available alternative.
     * @param div The map div
     * @param point A point object with x, y coordinates, in the map projection
     * @param system The system code which is currently selected
     */
    function chooseBestSystem(div, point, system) {
      var proj, wmProj, wmPoint, testpoint, sys;
      // If no sref selector available, then just return the original system
      if ($('select#' + opts.srefSystemId).length === 0) {
        return system;
      }
      // don't switch if system does not support autoswitching
      if (system.toUpperCase() !== 'OSGB' && system.toUpperCase() !== 'OSIE' && system.toUpperCase() !== 'LUGR') {
        return system;
      }

      sys = false;
      wmProj = new OpenLayers.Projection('EPSG:3857');
      wmPoint = point.clone();
      // Use the web mercator projection to do a rough test for each possible system.
      // With the advent of the Ordnance Survey Leisure Layer the point is not necessarily in web mercator though.
      if (div.map.projection.projCode !== 'EPSG:3857') {
        // Convert to web mercator for rough tests.
        wmPoint.transform(div.map.projection, wmProj);
      }

      // First, OSIE
      if ($('#' + opts.srefSystemId + ' option[value="OSIE"]').length
          && wmPoint.x >= -1196000 && wmPoint.x <= -599200 && wmPoint.y >= 6687800 && wmPoint.y <= 7442470) {
        // Got a rough match, now transform to the correct system so we can do exact match. Note that we are not testing against
        // a pure rectangle now.
        proj = new OpenLayers.Projection('EPSG:29903');
        testpoint = wmPoint.clone().transform(wmProj, proj);
        if (testpoint.x >= 10000 && testpoint.x <= 367300 && testpoint.y >= 10000 && testpoint.y <= 468100
            && (testpoint.x < 332000 || testpoint.y < 445900)) {
          sys = 'OSIE';
        }
      }
      // Next, OSGB
      if (!sys && $('#' + opts.srefSystemId + ' option[value="OSGB"]').length
         && wmPoint.x >= -1081873 && wmPoint.x <= 422934 && wmPoint.y >= 6405988 && wmPoint.y <= 8944480) {
        // Got a rough match, now transform to the correct system so we can do exact match. This time we can do a pure
        // rectangle, as the IE grid refs have already been taken out
        proj = new OpenLayers.Projection('EPSG:27700');
        testpoint = wmPoint.clone().transform(wmProj, proj);
        if (testpoint.x >= 0 && testpoint.x <= 700000 && testpoint.y >= 0 && testpoint.y <= 1400000) {
          sys = 'OSGB';
        }
      }
      if (!sys && $('#' + opts.srefSystemId + ' option[value="LUGR"]').length
          && wmPoint.x >= 634030 && wmPoint.x <= 729730 && wmPoint.y >= 6348260 && wmPoint.y <= 6484930) {
        proj = new OpenLayers.Projection('EPSG:2169');
        testpoint = wmPoint.clone().transform(wmProj, proj);
        if (testpoint.x >= 46000 && testpoint.x <= 108000 && testpoint.y >= 55000 && testpoint.y <= 141000) {
          sys = 'LUGR';
        }
      }
      if (!sys) {
        var has4326 = $('#' + opts.srefSystemId + ' option[value="4326"]');
        // If we still haven't found a system, then fall back on the original system
        // unless we can find 4326 in which case switch to that instead
        sys = system;
        if (has4326.length !== 0) {
          sys = '4326';
        }
      }
      return sys;
    }

    /**
     * Given a point, checks whether the current baselayer is appropriate to show it.
     * For example, Ordnance Survey layers are not appropriate for points outside Great Britain.
     * If unsuitable, switches to the first suitable layer.
     * NOTE This may result in a change in projection meaning that point is no longer valid.
     * @param div The map div
     * @param point A point object with x, y coordinates, in the current map projection
     */
    function chooseBestLayer(div, point) {
      var proj;
      var wmProj;
      var wmPoint;
      var testpoint;
      var sys;
      var currentLayer = div.map.baseLayer;
      var name;
      if (currentLayer.projection.getCode() === 'EPSG:27700') {
        // Check that the point is within Britain
        sys = false;
        wmProj = new OpenLayers.Projection('EPSG:3857');
        wmPoint = point.clone();
        // Use the web mercator projection to do a rough test for each possible system.
        // With the advent of the Ordnance Survey Leisure Layer the point is not necessarily in web mercator though.
        if (div.map.projection.projCode !== 'EPSG:3857') {
          // Convert to web mercator for rough tests.
          wmPoint.transform(div.map.projection, wmProj);
        }
        // First check out OSIE which overlaps OSGB
        if (wmPoint.x >= -1196000 && wmPoint.x <= -599200 && wmPoint.y >= 6687800 && wmPoint.y <= 7442470) {
          // Got a rough match, now transform to the correct system so we can do exact match. Note that we are not testing against
          // a pure rectangle now.
          proj = new OpenLayers.Projection('EPSG:29903');
          testpoint = wmPoint.clone().transform(wmProj, proj);
          if (testpoint.x >= 10000 && testpoint.x <= 367300 && testpoint.y >= 10000 && testpoint.y <= 468100
              && (testpoint.x < 332000 || testpoint.y < 445900)) {
            sys = 'OSIE';
          }
        }
        // Next, OSGB
        if (!sys
           && wmPoint.x >= -1081873 && wmPoint.x <= 422934 && wmPoint.y >= 6405988 && wmPoint.y <= 8944480) {
         // Got a rough match, now transform to the correct system so we can do exact match. This time we can do a pure
         // rectangle, as the IE grid refs have already been taken out
          proj = new OpenLayers.Projection('EPSG:27700');
          testpoint = wmPoint.clone().transform(wmProj, proj);
          if (testpoint.x >= 0 && testpoint.x <= 700000 && testpoint.y >= 0 && testpoint.y <= 1400000) {
            sys = 'OSGB';
          }
        }

        if (sys !== 'OSGB') {
          // Try to switch to a layer with coverage of the point that was clicked.
          name = '';
          $.each(div.map.layers, function () {
            if (this.isBaseLayer) {
              name = this.name;
              if (name.match(/^Google/) || name.match(/^Bing/) || name.match(/^OpenStreetMap/)) {
                div.map.setBaseLayer(this);
                return false;
              }
            }
            return true;
          });
        }
      }
    }

    /**
     * Check if data entry bing attempted outside a boundary loaded on the map.
     *
     * Warns or blocks data entry depending on settings.
     *
     * @param DOM div
     *   Map div.
     * @param OpenLayers.Geometry geometry
     *   Geometry to check.
     */
    function checkIfOutsideBounds(div, geometry) {
      var intersectFound = false;
      if (indiciaData.outsideBoundsBehaviour && div.map.boundaryLayer) {
        $.each(div.map.boundaryLayer.features, function() {
          if (geometry.intersects(this.geometry)) {
            intersectFound = true;
          }
        });
        if (intersectFound) {
          $('#boundary-warning').remove();
          $('#save-button').removeAttr('disabled');
        } else if ($('#boundary-warning').length === 0) {
          $('#' + div.settings.srefId).closest('.ctrl-wrap').after(
            '<div id="boundary-warning">' + indiciaData.templates.warningBox.replace('{message}', indiciaData.lang.sref_textbox.outsideBoundsWarning) + '</div>'
          );
          if (indiciaData.outsideBoundsBehaviour === 'block') {
            $('#save-button').attr('disabled', true);
          }
        }
      }
    }

    function showGridRefHints(div) {
      if (overMap && div.settings.gridRefHint && typeof indiciaData.srefHandlers !== 'undefined' &&
          typeof indiciaData.srefHandlers[_getSystem().toLowerCase()]!=='undefined') {
        var ll = div.map.getLonLatFromPixel(currentMousePixel), precisionInfo,
              handler = indiciaData.srefHandlers[_getSystem().toLowerCase()], largestSrefLen, pt,
              proj, recalcGhost = ghost===null || !ghost.atPoint(ll, 0, 0);
        if ($.inArray('precisions', handler.returns)!==-1 && $.inArray('gridNotation', handler.returns) !== -1) {
          precisionInfo = getPrecisionInfo(div, null, false);
          proj = new OpenLayers.Projection('EPSG:'+indiciaData.srefHandlers[_getSystem().toLowerCase()].srid);
          ll.transform(div.map.projection, proj);
          pt = { x: ll.lon, y: ll.lat };
          largestSrefLen = precisionInfo.precision;
          $('.grid-ref-hint').removeClass('active');
          // If there are multiple precisions available using the +/- keys, activate the current one
          if (div.settings.clickForSpatialRef && handler.getPrecisionInfo(largestSrefLen + 2).metres !== handler.getPrecisionInfo(largestSrefLen).metres) {
            if (minusKeyDown) {
              $('.hint-minus').addClass('active');
            } else if (plusKeyDown) {
              $('.hint-plus').addClass('active');
            } else {
              $('.hint-normal').addClass('active');
            }
          }
          // almost every mouse move causes the smallest + key square to change
          if (div.settings.clickedSrefPrecisionMax > precisionInfo.precision &&
              handler.getPrecisionInfo(largestSrefLen + 2) !== false &&
              handler.getPrecisionInfo(largestSrefLen + 2).metres !== handler.getPrecisionInfo(largestSrefLen).metres) {
            $('.hint-plus .label').html(handler.getPrecisionInfo(largestSrefLen + 2).display + ':');
            $('.hint-plus .data').html(handler.pointToGridNotation(pt, largestSrefLen + 2));
            $('.hint-plus').css('opacity', 1);
          } else {
            $('.hint-plus').css('opacity', 0);
          }
          // don't recalculate if mouse is still over the existing ghost
          if (recalcGhost || $('.hint-normal').css('opacity') === 0) {
            // since we've moved a square, redo the grid ref hints
            if (div.settings.clickedSrefPrecisionMin < precisionInfo.precision &&
                handler.getPrecisionInfo(largestSrefLen - 2) !== false &&
                handler.getPrecisionInfo(largestSrefLen - 2).metres !== handler.getPrecisionInfo(largestSrefLen).metres) {
              $('.hint-minus .label').html(handler.getPrecisionInfo(largestSrefLen - 2).display + ':');
              $('.hint-minus .data').html(handler.pointToGridNotation(pt, largestSrefLen - 2));
              $('.hint-minus').css('opacity', 1);
            } else {
              $('.hint-minus').css('opacity', 0);
            }
            $('.hint-normal .label').html(handler.getPrecisionInfo(largestSrefLen).display + ':');
            $('.hint-normal .data').html(handler.pointToGridNotation(pt, largestSrefLen));
            $('.hint-normal').css('opacity', 1);
          }
        }
      }
    }

    /*
     * Handle click on map, but also if user changes the spatial reference when a plot needs to be drawn.
     */
    var handleSelectedPositionOnMap = function(lonlat, div, data) {
      if (typeof data.error !== 'undefined') {
        if (data.error === 'The spatial reference system is not set.') {
          alert(div.settings.msgSrefSystemNotSet);
        } else {
          // We can switch to lat long if the system is available for selection
          var system=$('#'+opts.srefSystemId+' option[value=4326]');
          if (system.length===1) {
            $('#'+opts.srefSystemId).val('4326');
            pointToSref(div, new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat), '4326', function (data) {
              setClickPoint(data, div); // data sref in 4326, wkt in indiciaProjection, mapwkt in mapProjection
            });
          } else {
            alert(div.settings.msgSrefOutsideGrid);
          }
        }
      } else {
        setClickPoint(data, div); // data sref in _getSystem, wkt in indiciaProjection, mapwkt in mapProjection
        _hideOtherGraticules(div);
      }
      if (typeof indiciaFns.showHideRememberSiteButton !== 'undefined') {
        indiciaFns.showHideRememberSiteButton();
      }
    };

    function clearGridRefHints() {
      $('.grid-ref-hint').css('opacity', 0);
    }

    function mapLayerChanged(event) {
      if (event.property === 'visibility' &&
          typeof indiciaData.reportlayer !== 'undefined' &&
          event.layer === indiciaData.reportlayer &&
          typeof indiciaData.reportlayer.needsRedraw !== 'undefined') {
        indiciaData.mapdiv.map.events.triggerEvent('moveend');
      }

      // Save the hidden layer so we know what it was when changebaselayer triggers matchMapProjectionToLayer.
      if (event.property === 'visibility' && event.layer.visibility === false) {
        event.layer.map.lastLayer = event.layer;
      }
    }

    /**
     * Swaps a dummy layer with a Google layer.
     *
     * Allows Google layers and API to be lazy-loaded, so charges aren't
     * incurred if not used.
     *
     * @param OpenLayers.Layer layerToReplace
     *   Layer that's being swapped out.
     */
    function replaceGoogleBaseLayer(layerToReplace) {
      var map = layerToReplace.map;
      var layerIndex = map.getLayerIndex(layerToReplace);
      // Calls the fn to build the new layer.
      var newLayer = layerToReplace.lazyLoadGoogleApiLayerFn();
      indiciaData.settingBaseLayer = true;
      try {
        map.addLayer(newLayer);
        map.setLayerIndex(newLayer, layerIndex);
        map.setBaseLayer(newLayer);
        map.removeLayer(layerToReplace);
        if (newLayer.mapObject) {
          // Cancel Google layer tilt when zoomed in.
          newLayer.mapObject.setTilt(0);
        }
        // On initial page load, we may have to re-apply the initial zoom level
        // if the zoom level is not supported by the default sub-layer (OSM),
        // but is supported by Google.
        if (indiciaData['zoomToAfterFetchingGoogleApiScript-' + map.id]) {
          if (typeof indiciaData['zoomToAfterFetchingGoogleApiScript-' + map.id] === 'object') {
            // Zooming to the bounds of a data layer.
            map.zoomToExtent(indiciaData['zoomToAfterFetchingGoogleApiScript-' + map.id]);
          } else {
            // Zooming to intial zoom level.
            map.zoomTo(indiciaData['zoomToAfterFetchingGoogleApiScript-' + map.id]);
          }
          delete indiciaData['zoomToAfterFetchingGoogleApiScript-' + map.id];
        }
      } finally {
        indiciaData.settingBaseLayer = false;
      }
    }

    /**
     * When switching base layer, check if we need to lazy load a Google layer.
     *
     * @param OpenLayers.Layer baseLayer
     *   Layer that we are switching to.
     */
    function lazyLoadBaseLayer(baseLayer) {
      var key = indiciaData.googleApiKey ? '&key=' + indiciaData.googleApiKey : '';
      var layerToReplace = baseLayer.map.needToLazyLoadGoogleApiLayer ? baseLayer.map.needToLazyLoadGoogleApiLayer : baseLayer;
      delete baseLayer.map.needToLazyLoadGoogleApiLayer;
      if (layerToReplace.lazyLoadGoogleApiLayerFn) {
        if (typeof google === 'undefined') {
          // If Google API not loaded, load then replace layer.
          if (!indiciaData.fetchingGoogleApiScript) {
            // Flag to ensure we don't request twice.
            indiciaData.fetchingGoogleApiScript = true;
            indiciaData.layersToReplaceAfterGoogleApiLoaded = [layerToReplace];
            $.getScript('https://maps.google.com/maps/api/js?v=3' + key, function() {
              $.unique(indiciaData.layersToReplaceAfterGoogleApiLoaded);
              indiciaData.layersToReplaceAfterGoogleApiLoaded.forEach(function(layer) {
                replaceGoogleBaseLayer(layer);
              });
              indiciaData.layersToReplaceAfterGoogleApiLoaded = [];
              delete indiciaData.fetchingGoogleApiScript;
            });
          }
          else {
            // 2 maps on page, both loading Google layer, only 1 needs to get
            // the script.
            indiciaData.layersToReplaceAfterGoogleApiLoaded.push(layerToReplace);
          }
        } else {
          // Google API already loaded so just replace the layer.
          replaceGoogleBaseLayer(layerToReplace);
        }
      }
    }

    /**
     * Manage projections after a base layer switch.
     *
     * OpenLayers 2 is not designed to handle switching between base layers
     * with different projections. However, Ordnance Survey Leisure Maps are
     * only available in EPSG:27700 so to be able to have them as an option
     * longside maps in the usual Web Mercator projection we trigger this
     * function on changebaselayer.
     *
     * Ref:
     * https://gis.stackexchange.com/questions/24572/how-do-i-use-base-layer-of-two-different-projection-spherical-mercator-and-wgs84
     */
    function matchMapProjectionToLayer(map) {
      var baseLayer = map.baseLayer;
      var newProjection = baseLayer.projection;
      var currentProjection = map.projection;
      var centre;
      var zoom = map.getZoom();
      if (map.div.settings.lastMapCentre) {
        // Clone the stored lastMapCentre so the transform only affects the copy.
        centre = new OpenLayers.LonLat(map.div.settings.lastMapCentre.lon, map.div.settings.lastMapCentre.lat);
        centre.transform(map.displayProjection, newProjection);
      } else {
        centre = map.getCenter();
      }
      if (!(currentProjection instanceof OpenLayers.Projection)) {
        // If a projection code, convert to object.
        currentProjection = new OpenLayers.Projection(map.projection);
      }

      if (!newProjection.equals(currentProjection)) {
        // Update map properties to match properties of baseLayer.
        map.maxExtent = baseLayer.maxExtent;
        map.resolutions = baseLayer.resolutions;
        map.projection = newProjection;
        // Switching to and from OS Leisure requires a correction in zoom amount.
        if (!currentProjection.equals(newProjection)) {
          if (newProjection.getCode() === 'EPSG:27700') {
            zoom++;
          } else if (currentProjection.getCode() === 'EPSG:27700' && zoom !== 0) {
            zoom--;
          }
        }
        // Recentre due to base layer projection change. Don't allow this to
        // fire the code which looks for base layer changes again.
        indiciaData.recenteringAfterBaseLayerSwitch = true;
        map.setCenter(centre, zoom, false, true);
        indiciaData.recenteringAfterBaseLayerSwitch = false;

        // Update vector layer properties to match properties of baseLayer.
        $.each(map.layers, function eachLayer() {
          var thisLayer = this;
          if (thisLayer.CLASS_NAME === 'OpenLayers.Layer.Vector') {
            thisLayer.maxExtent = baseLayer.maxExtent;
            thisLayer.resolutions = baseLayer.resolutions;
            if (!newProjection.equals(currentProjection)) {
              thisLayer.projection = newProjection;
              // Reproject vector layer features.
              $.each(thisLayer.features, function (idx, feature) {
                feature.geometry.transform(currentProjection, newProjection);
              });
              thisLayer.redraw();
            }
          }
        });
      }
    }

    /**
     * Callback on inital load of a Google layer. If it is not the current
     * base layer then ensure it is hidden.
     */
    function hideGMapCallback() {
      var map = indiciaData.mapdiv.map;
      var gLayer = this;
      var olLayer;
      // Find the OpenLayers layer containing the mapObject which is the Google layer.
      $.each(map.layers, function (idx, layer) {
        if (layer.mapObject === gLayer) {
          olLayer = layer;
          return false;
        }
      });
      // Hide the Google layer if it is not the current base layer.
      if (typeof olLayer !== 'undefined' && map.baseLayer !== olLayer) {
        olLayer.display(false);
      }
    }

    /**
     * Switches to a base layer with a given ID.
     */
    function switchToBaseLayer(div, id, dynamicLayerIndex) {
      var availableLayers;
      var layerId = id + '.' + (dynamicLayerIndex || 0);
      var lSwitch = div.map.getLayersBy('layerId', layerId)[0];
      var newMapExtent;
      if (!lSwitch) {
        availableLayers = _getPresetLayers(div.settings);
        if (availableLayers[id]) {
          if (Array.isArray(availableLayers[id])) {
            // Dynamic layers defined as an array of sub-layers. If index to
            // load not specified, load the first.
            lSwitch = availableLayers[id][dynamicLayerIndex || 0]();
          } else {
            lSwitch = availableLayers[id]();
          }
          div.map.addLayer(lSwitch);
          // Ensure layer inserts at correct position.
          if (Array.isArray(availableLayers[id])) {
            //For dynamic layers, search for the default layer - index 0 - and use that
            //for the insertion position
            div.map.setLayerIndex(lSwitch, div.map.getLayerIndex(div.map.getLayersBy('layerId', availableLayers[id][0]().layerId)[0]));
          } else {
            div.map.setLayerIndex(lSwitch, div.map.getLayerIndex(div.map.baseLayer));
          }
        }
      }
      if (lSwitch && div.map.getExtent()) {
        newMapExtent = div.map.getExtent().transform(div.map.projection, lSwitch.projection);
        // Don't switch layer if the new layer can't display the whole
        // viewport.
        if (!lSwitch.maxExtent.containsBounds(newMapExtent)) {
          if (dynamicLayerIndex > 0) {
            return switchToBaseLayer(div, id, dynamicLayerIndex - 1);
          }
        }
        //Don't switch layer if the viewport is contained by any 'explicitlyDisallowed' MBRs
        //specified for the layer, *unless* it is also contained by any 'explicitlyAllowed' MBRs
        var inAllowed, inDisallowed;
        if (lSwitch.explicitlyDisallowed) {
          inDisallowed = lSwitch.explicitlyDisallowed.some(function(mbr){
            return mbr.containsBounds(newMapExtent);
          });
        }
        if (lSwitch.explicitlyAllowed){
          inAllowed = lSwitch.explicitlyAllowed.some(function(mbr){
            return mbr.containsBounds(newMapExtent);
          });
        }
        if (inDisallowed && !inAllowed) {
          if (dynamicLayerIndex > 0) {
            return switchToBaseLayer(div, id, dynamicLayerIndex - 1);
          }
        }
      }
      if (lSwitch) {
        if (!lSwitch.getVisibility()) {
          if (!lSwitch.lazyLoadGoogleApiLayerFn) {
            div.map.setBaseLayer(lSwitch);
          } else {
            // Don't actually switch, because the selected layer is just a
            // dummy empty layer with a function to build a Google layer.
            // The actual layer will get loaded later.
            div.map.needToLazyLoadGoogleApiLayer = lSwitch;
          }
        }
      }
      return lSwitch;
    }

    /**
     * Handle the automatic switching between layers for the dynamic layer.
     */
    function handleDynamicLayerSwitching(div) {
      var onLayer;
      var switcherChange = false;
      var baseLayer = div.map.baseLayer;
      // A dynamic layer's sub-layer has a layerId set to layerName.index, e.g.
      // dynamicOSLeisureGoogleSat.0.
      var baseLayerIdParts = baseLayer.layerId ? baseLayer.layerId.split('.') : [];
      var onLayerIdx;
      var dynamicLayers;
      var bb;
      var mapWidth;
      // Careful about recursion. Also don't bother if not on a dynamic layer.
      if (indiciaData.settingBaseLayer || typeof baseLayer.dynamicLayerIndex === 'undefined') {
        // Non-dynamic Google layers still need to be loaded.
        if (!indiciaData.settingBaseLayer && typeof baseLayer.lazyLoadGoogleApiLayerFn !== 'undefined') {
          lazyLoadBaseLayer(baseLayer);
        }
        return;
      }
      // If we need to switch dynamic layer because of the zoom, find the new
      // sub-layer's index.
      dynamicLayers = _getPresetLayers(div.settings)[baseLayerIdParts[0]];
      bb = div.map.getExtent().transform(div.map.projection, new OpenLayers.Projection('EPSG:27700'));
      mapWidth = bb.right - bb.left;
      onLayerIdx = dynamicLayers.reduce(function findLayer(index, lyr, i) {
        var mapLayer = lyr();
        if (!mapLayer.maxWidth || mapWidth < mapLayer.maxWidth) {
          return i;
        }
        return index;
      }, 0);
      indiciaData.settingBaseLayer = true;
      try {
        // Ensure switch is immediate.
        baseLayer.removeBackBufferDelay = 0;
        // Swap the index number of the base layer's ID to the new layer's
        // index to find the correct layer ID. Then swap to that layer.
        onLayer = switchToBaseLayer(div, baseLayerIdParts[0], onLayerIdx);
        lazyLoadBaseLayer(div.map.baseLayer);
      } finally {
        indiciaData.settingBaseLayer = false;
      }
      $.each(div.map.layers, function () {
        if (this.layerId && this.layerId.indexOf(baseLayerIdParts[0]) === 0) {
          switcherChange = switcherChange || this !== onLayer;
          this.displayInLayerSwitcher = this === onLayer;
        }
      });
      if (switcherChange) {
        // Force the layerSwitcher to update. Unfortunately the OL code to detect
        // whether it needs a redraw doesn't check displayInLayerSwitcher, so we
        // need to force it through.
        $.each(div.map.controls, function eachControl() {
          if (this.CLASS_NAME === 'OpenLayers.Control.LayerSwitcher') {
            this.layerStates = [];
            this.redraw();
          }
        });
      }
    }

    function activateDrawControl(div, ctrl) {
      if (div.settings.selectFeatureBufferProjection && $(div).closest('#controls-filter_where').length) {
        $('#click-buffer').css('right', $('.olControlEditingToolbar').outerWidth() + 10);
        $('#click-buffer').show();
      }
      // Continue with the activation.
      OpenLayers.Control.prototype.activate.call(ctrl);
    }

    function deactivateDrawControl(div, ctrl) {
      if ($('#click-buffer:visible')) {
        $('#click-buffer').hide();
      }
      // Continue with the deactivation.
      OpenLayers.Control.prototype.deactivate.call(ctrl);
    }

    /**
     * Adds custom base layers in the settings to the map.
     *
     * @param DOM div
     *   Container element.
     */
    function addCustomBaseLayers(div) {
      // Add any custom layers.
      $.each(div.settings.otherBaseLayerConfig, function(i, item) {
        var params = item.params;
        var layer;
        // Pad to max 4 params, just so the function call can be the same whatever.
        while (params.length < 4) {
          params.push(null);
        }
        layer = new OpenLayers.Layer[item.class](params[0], params[1], params[2], params[3]);
        if (!layer.layerId) {
          layer.layerId = 'custom-' + i;
        }
        div.map.addLayer(layer);
      });
    }

    /**
     * Adds preset base layers in the settings to the map.
     *
     * @param DOM div
     *   Container element.
     */
    function addPresetBaseLayers(div) {
      // Iterate over the preset layers, adding them to the map
      var presetLayers = _getPresetLayers(div.settings);
      $.each(div.settings.presetLayers, function(i, item) {
        var layer;
        // Check whether this is a defined layer
        if (presetLayers.hasOwnProperty(item)) {
          // Load each predefined layer. If a layer group (i.e. a dynamic
          // layer) only initially load the first.
          layer = Array.isArray(presetLayers[item]) ? presetLayers[item][0]() : presetLayers[item]();
          div.map.addLayer(layer);
          if (typeof layer.mapObject !== 'undefined') {
            layer.mapObject.setTilt(0);
            // Workaround.
            // If there is a Google layer loaded but the initial layer is smaller (e.g. OS Leisure)
            // then both may appear. This occurs because the Google layer cannot be
            // hidden until it has been loaded. Therefore, set up a callback to handle this.
            google.maps.event.addListenerOnce(layer.mapObject, 'tilesloaded', hideGMapCallback);
          }
        } else {
          alert('Requested preset layer ' + item + ' is not recognised.');
        }
      });
    }

    /**
     * Creates additional layers for any WMS or WFS in the settings.
     *
     * @param DOM div
     *   Container element.
     */
    function addMappingServiceLayers(div) {
      // Convert indicia WMS/WFS layers into js objects
      $.each(div.settings.indiciaWMSLayers, function (key, value) {
        // If key is int, title wasn't provided so work it out from the layer name.
        var layerTitle = (key === parseInt(key, 10)) ? value.replace(/^.*:/, '').replace(/_/g, ' ') : key;
        div.settings.layers.push(new OpenLayers.Layer.WMS(
          layerTitle,
          div.settings.indiciaGeoSvc + 'wms',
          { layers: value, transparent: true },
          { singleTile: true, isBaseLayer: false, sphericalMercator: true, isIndiciaWMSLayer: true }
        ));
      });
      $.each(div.settings.indiciaWFSLayers, function (key, value) {
        div.settings.layers.push(new OpenLayers.Layer.WFS(
          key,
          div.settings.indiciaGeoSvc + 'wms',
          { typename: value, request: 'GetFeature' },
          { sphericalMercator: true }
        ));
      });
    }

    /**
     * Find the setup for the initial map view.
     *
     * @param DOM div
     *   Container element.
     *
     * @return object
     *   Object containing centre, zoom and layer visibility data.
     */
    function getInitialMapViewSetup(div) {
      var setup = {
        zoom: div.settings.initial_zoom,
        centre: {
          lon: div.settings.initial_long,
          lat: div.settings.initial_lat
        },
        rememberedBaseLayer: null,
        rememberedSublayerIndex: 0,
        wmsvisibility: null,
      };
      var baseLayerIdParts;

      if (typeof $.cookie !== 'undefined' && div.settings.rememberPos !== false) {
        // Missing cookies result in null or undefined variables.
        if ($.cookie('mapzoom')) {
          setup.zoom = $.cookie('mapzoom');
        }
        if ($.cookie('maplongitude')) {
          setup.centre.lon = $.cookie('maplongitude');
        }
        if ($.cookie('maplatitude')) {
          setup.centre.lat = $.cookie('maplatitude');
        }
        if ($.cookie('mapbaselayerid')) {
          // Note the stored mapbaselayerid should include both the stem of the
          // base layer name, then a dot, then the sub-layer index (zero unless
          // a dynamic layer). But, if the cookie saved via older version of
          // the code the layer index will be missing.
          baseLayerIdParts = $.cookie('mapbaselayerid').split('.');
          setup.rememberedBaseLayer = baseLayerIdParts[0];
          if (baseLayerIdParts.length > 1) {
            setup.rememberedSublayerIndex = baseLayerIdParts[1];
          }
        }
        if ($.cookie('mapwmsvisibility')) {
          setup.wmsvisibility = $.cookie('mapwmsvisibility');
        }
      }
      // Add a useful object version of the data.
      setup.centre.lonLat = new OpenLayers.LonLat(setup.centre.lon, setup.centre.lat);
      return setup;
    }

    /**
     * Applies any remembers settings for WMS layer visibility on map load.
     *
     * @param DOM div
     *   Container element.
     * @param object setup
     *   Initial view setup object.
     */
    function applyWMSVisibilitySettings(div, setup) {
      // Loop through layers and if it is an Indicia WMS layer, then set its
      // visibility according to next value in array derived from cookie.
      var visiblityInfo;
      if (setup.wmsvisibility) {
        visiblityInfo = JSON.parse(setup.wmsvisibility);
        div.map.layers.forEach(function (l) {
          if (l.isIndiciaWMSLayer) {
            l.setVisibility(visiblityInfo[l.name]);
          }
        });
      }
    }

    // Extend our default options with those provided, basing this on an empty object
    // so the defaults don't get changed.
    var opts = $.extend({}, $.fn.indiciaMapPanel.defaults, options);
    // call any hooks that update the settings
    $.each(mapSettingsHooks, function (i, fn) {
      fn(opts);
    });
    if (opts.useOlDefaults) {
      olOptions = $.extend({}, $.fn.indiciaMapPanel.openLayersDefaults, olOptions);
    }

    olOptions.projection = new OpenLayers.Projection("EPSG:"+olOptions.projection);
    olOptions.displayProjection = new OpenLayers.Projection("EPSG:"+olOptions.displayProjection);
    if ((typeof olOptions.maxExtent !== 'undefined') && (olOptions.maxExtent instanceof Array)) {
      // if the maxExtent is passed as an array, it could be from JSON on a Drupal settings form. We need an Ol bounds object.
      olOptions.maxExtent = new OpenLayers.Bounds(olOptions.maxExtent[0], olOptions.maxExtent[1],
            olOptions.maxExtent[2], olOptions.maxExtent[3]);
    }
    // set the image path otherwise Drupal js optimisation can move the script relative to the images.
    if (!OpenLayers.ImgPath && opts.jsPath) {
      OpenLayers.ImgPath = opts.jsPath + 'img/';
    }
    return this.each(function () {
      // expose public stuff
      this.settings = opts;
      this.pointToSref = pointToSref;
      this.addPt = addPt;
      this.addWkt = addWkt;
      this.getDataExtent = getDataExtent;
      this.reapplyQuery = reapplyQuery;
      this.getFeaturesByVal = getFeaturesByVal;
      this.removeAllFeatures = removeAllFeatures;
      this.locationSelectedInInput = locationSelectedInInput;
      this.processLonLatPositionOnMap = processLonLatPositionOnMap;

      // if the validator exists, stop map clicks bubbling up to its event handler as IE can't
      // get the attributes of some map items and errors arise.
      if (typeof $.validator !== 'undefined') {
        $(this).parent().click(function () {
          return false;
        });
      }

      if (this.settings.toolbarDiv !== 'map' && (opts.toolbarPrefix !== '' || opts.toolbarSuffix !== '')) {
        var tb = '<div id="map-toolbar-outer" class="ui-helper-clearfix">' + opts.toolbarPrefix + '<div class="olControlEditingToolbar" id="map-toolbar"></div>' + opts.toolbarSuffix + '</div>';
        if (this.settings.toolbarDiv === 'top') {
          $(this).before(tb);
        } else if (this.settings.toolbarDiv === 'bottom') {
          $(this).after(tb);
        } else {
          $('#' + this.settings.toolbarDiv).html(tb);
        }
        this.settings.toolbarDiv = 'map-toolbar';
      }
      if (this.settings.helpDiv === 'bottom') {
        var helpbar, helptext = [];
        if ($.inArray('panZoom', this.settings.standardControls) ||
            $.inArray('panZoomBar', this.settings.standardControls)) {
          helptext.push(this.settings.hlpPanZoomButtons);
        } else if ($.inArray('zoom', this.settings.standardControls)) {
          helptext.push(this.settings.hlpZoomButtons);
        } else {
          helptext.push(this.settings.hlpPanZoom);
        }
        if (this.settings.editLayer && this.settings.clickForSpatialRef) {
          helptext.push(this.settings.hlpClickOnceSetSref);
        }
        helpbar = '<div id="map-help" class="ui-widget ui-widget-content">' + helptext.join(' ') + '</div>';
        $(this).after(helpbar);
        this.settings.helpDiv = 'map-help';
      }

      // Sizes the div. Width sized by outer div.
      $(this).css('height', this.settings.height);
      $(this).css('width', '100%');

      // If we're using a proxy
      if (this.settings.proxy)
      {
        OpenLayers.ProxyHost = this.settings.proxy;
      }

      // Keep a reference to this, to simplify scoping issues.
      var div = this;

      // Create a projection to represent data in the Indicia db
      div.indiciaProjection = new OpenLayers.Projection('EPSG:3857');
      olOptions.controls = [
        new OpenLayers.Control.Navigation({ title: 'navigation' }),
        new OpenLayers.Control.ArgParser(),
        new OpenLayers.Control.Attribution()
      ];
      $.extend(olOptions, {
        eventListeners: {
          changelayer: mapLayerChanged
        }
      });

      // Mouse scroll to zoom only when Ctrl pressed.
      OpenLayers.Handler.MouseWheel.prototype.keyMask = OpenLayers.Handler.MOD_CTRL;

      // Constructs the map
      div.map = new OpenLayers.Map($(this)[0], olOptions);

      // track plus and minus key presses, which influence selected grid square size
      $(document).keydown(function (evt) {
        var change = false;
        if (!overMap) {
          return;
        }
        switch (evt.which) {
          case 61: case 107: case 187:
            // prevent + affecting other controls
            evt.preventDefault();
            // prevent some browsers autorepeating
            if (!plusKeyDown) {
              plusKeyDown = true;
              change = true;
            }
            break;
          case 173: case 109: case 189:
            // prevent + affecting other controls
            evt.preventDefault();
            if (!minusKeyDown) {
              minusKeyDown = true;
              change = true;
            }
            break;
        }
        if (change) {
          // force a square redraw when mouse moves
          removeAllFeatures(div.map.editLayer, 'ghost');
          ghost = null;
          showGridRefHints(div);
        }
      });

      $(document).keyup(function(evt) {
        var change = false;
        switch (evt.which) {
          case 61: case 107: case 187:
            // prevent some browsers autorepeating
            if (plusKeyDown) {
              plusKeyDown = false;
              change = true;
            }
            break;
          case 173: case 109: case 189:
            if (minusKeyDown) {
              minusKeyDown = false;
              change = true;
            }
            break;
        }
        if (change) {
          // force a square redraw when mouse moves
          removeAllFeatures(div.map.editLayer, 'ghost');
          ghost = null;
          evt.preventDefault();
          showGridRefHints(div);
        }
      });
      div.map.events.register('mousemove', null, function () {
        overMap = true;
      });
      div.map.events.register('mouseout', null, function (evt) {
        var testDiv = div.map.viewPortDiv;
        var target = (evt.relatedTarget) ? evt.relatedTarget : evt.toElement;
        if (typeof target!=='undefined') {
          // walk up the DOM tree.
          while (target!=testDiv && target!==null) {
            target = target.parentNode;
          }
          // if the target we stop at isn't the div, then we've left the div.
          if (target != testDiv) {
            clearGridRefHints();
            overMap = false;
          }
        }
      });

      // and prepare a georeferencer
      div.georefOpts = $.extend({}, $.fn.indiciaMapPanel.georeferenceDriverSettings, $.fn.indiciaMapPanel.georeferenceLookupSettings);
      if (typeof Georeferencer !== 'undefined') {
        div.georeferencer = new Georeferencer(div, _displayGeorefOutput);
      }

      addCustomBaseLayers(div);
      addPresetBaseLayers(div);
      addMappingServiceLayers(div);
      // Plus any other types of layers in the settings.
      div.map.addLayers(div.settings.layers);
      var initialMapViewSetup = getInitialMapViewSetup(div);
      applyWMSVisibilitySettings(div, initialMapViewSetup);

      // Set the base layer using cookie if remembering.
      // Do this before centring to ensure lat/long are in correct projection.
      if (initialMapViewSetup.rememberedBaseLayer) {
        switchToBaseLayer(div, initialMapViewSetup.rememberedBaseLayer, initialMapViewSetup.rememberedSublayerIndex);
      }

      // Find the projection for the initial base layer.
      matchMapProjectionToLayer(div.map);
      div.map.events.register('changebaselayer', null, function (e) {
        if (!indiciaData.settingBaseLayer) {
          lazyLoadBaseLayer(e.layer);
        }
        // New layer may have different projection.
        matchMapProjectionToLayer(div.map);
      });
      // Clone so lastMapCentre not affected by transform.
      div.settings.lastMapCentre = new OpenLayers.LonLat(initialMapViewSetup.centre.lonLat.lon, initialMapViewSetup.centre.lonLat.lat);
      initialMapViewSetup.centre.lonLat.transform(div.map.displayProjection, div.map.projection);
      div.map.setCenter(initialMapViewSetup.centre.lonLat, initialMapViewSetup.zoom);
      handleDynamicLayerSwitching(div);
      if (indiciaData.fetchingGoogleApiScript) {
        indiciaData['zoomToAfterFetchingGoogleApiScript-' + div.map.id] = initialMapViewSetup.zoom;
      }

      // Register moveend must come after panning and zooming the initial map
      // so the dynamic layer switcher does not mess up the centering code.
      div.map.events.register('moveend', null, function () {
        if (indiciaData.recenteringAfterBaseLayerSwitch) {
          return;
        }
        if (!indiciaData.settingBaseLayer) {
          div.settings.lastMapCentre = div.map.getCenter();
          div.settings.lastMapCentre.transform(div.map.projection, div.map.displayProjection);
        }
        handleDynamicLayerSwitching(div);
        // setup the map to save the last position
        if (div.settings.rememberPos) {
          indiciaFns.cookie('mapzoom', div.map.zoom, { expires: 7 });
          if (!indiciaData.settingBaseLayer) {
            indiciaFns.cookie('maplongitude', div.settings.lastMapCentre.lon, { expires: 7 });
            indiciaFns.cookie('maplatitude', div.settings.lastMapCentre.lat, { expires: 7 });
          }
          // Store the name of the layer or dynamic layer group (the part
          // before the . in layerId).
          indiciaFns.cookie('mapbaselayerid', div.map.baseLayer.layerId, { expires: 7 });
        }
      });


      // Register function on changelayer event to record the display status
      // of Indicia WMS layers. Note this code cannot go in mapLayerChanged
      // function because that is called multiple times during page intialisation
      // resulting in incorrect setting.
      div.map.events.register('changelayer', null, function () {
        var init;
        var json;
        if (typeof $.cookie !== 'undefined') {
          // Need to init cookie here to currrent value in case different layers are used on different
          // pages - doing from scratch would loose settings for other layers not set for this one.
          init = $.cookie('mapwmsvisibility') ? JSON.parse($.cookie('mapwmsvisibility')) : {};
          json = div.map.layers.reduce(function(j, l) {
            if (l.isIndiciaWMSLayer) {
              j[l.name] = l.visibility ? 1 : 0;
            }
            return j;
          }, init);
          indiciaFns.cookie('mapwmsvisibility', JSON.stringify(json), { expires: 7 });
        }
      });

      /**
       * Public function to change selection of features on a layer.
       */
      div.map.setSelection = function (layer, features) {
        if (!indiciaData.shiftPressed) {
          $.each(layer.selectedFeatures, function () {
            this.renderIntent = 'default';
          });
          layer.selectedFeatures = [];
        }
        layer.selectedFeatures = layer.selectedFeatures.concat(features);
        $.each(layer.selectedFeatures, function () {
          this.renderIntent = 'select';
        });
        layer.redraw();
      };

      if (this.settings.editLayer) {
        var editLayer;
        // If using click for plot, there can be a zoom ghost on the page, but we don't want
        // the ghost's style to carry over when the user clicks to create the plot as the vertex
        // rotate handles will be the same colour as the main plot. To get round this, use the boundary
        // colours as this will allow the vertex handles to be red.
        if (indiciaData.zoomid && !div.settings.clickForPlot) {
          // Change the feature colour to make it a ghost when we are in add mode and zoomed into a location (as the location boundary isn't
          // used, it is only visual)
          editLayer = new OpenLayers.Layer.Vector(
            this.settings.editLayerName,
            { style: new Style('ghost', this.settings), sphericalMercator: true, displayInLayerSwitcher: this.settings.editLayerInSwitcher }
          );
        } else {
          // Add an editable layer to the map
          var styleMap = new OpenLayers.StyleMap({
            default: new Style('boundary', this.settings),
            vertex: {
              strokeColor: "#004488",
              fillColor: "#004488",
              fillOpacity: 0.2,
              strokeOpacity: 1,
              strokeWidth: 1,
              pointRadius: 6,
              graphicName: "square"
            }
          }, {extendDefault: false});
          editLayer = new OpenLayers.Layer.Vector(
            this.settings.editLayerName,
            { styleMap: styleMap, sphericalMercator: true, displayInLayerSwitcher: this.settings.editLayerInSwitcher }
          );
        }
        div.map.editLayer = editLayer;
        div.map.addLayer(div.map.editLayer);

        if (this.settings.initialFeatureWkt === null && $('#' + this.settings.geomId).length > 0) {
          // if no initial feature specified, but there is a populated imp-geom hidden input,
          // use the value from the hidden geom
          this.settings.initialFeatureWkt = $('#' + div.settings.geomId).val();
        }
        if (this.settings.initialBoundaryWkt === null && $('#' + this.settings.boundaryGeomId).length > 0) {
          // same again for the boundary
          added = this.settings.initialBoundaryWkt = $('#' + this.settings.boundaryGeomId).val();
          added.style = new Style('boundary', this.settings);
        }

        // Draw the feature to be loaded on startup, if present
        var zoomToCentroid = (this.settings.initialBoundaryWkt) ? false : true;
        if (this.settings.initialFeatureWkt) {
          _showWktFeature(this, this.settings.initialFeatureWkt, div.map.editLayer, null, false, 'clickPoint', zoomToCentroid, true);
        }
        if (this.settings.initialBoundaryWkt) {
          var featureType;
          // If the map is zoomed in add mode, then the featuretype is nothing
          // as the boundary should act as a "ghost" that isn't used for
          // anything other than zooming.
          if (indiciaData.zoomid) {
            featureType = '';
          } else if ($('#annotations-mode-on').val() === 'yes') {
            featureType = 'annotation';
          } else {
            featureType = 'boundary';
          }
          _showWktFeature(this, this.settings.initialBoundaryWkt, div.map.editLayer, null, false, featureType, true, true);
        }

        if (div.settings.clickForSpatialRef || div.settings.gridRefHint) {
          div.map.events.register('mousemove', null, function (evt) {
            currentMousePixel = evt.xy;
            showGridRefHints(div);
            if (typeof div.map.editLayer.clickControl!=='undefined' && div.map.editLayer.clickControl.active) {
              if (div.map.dragging) {
                removeAllFeatures(div.map.editLayer, 'ghost');
              } else {
                if (typeof indiciaData.srefHandlers!=='undefined' &&
                    typeof indiciaData.srefHandlers[_getSystem().toLowerCase()]!=='undefined' &&
                    $.inArray('wkt', indiciaData.srefHandlers[_getSystem().toLowerCase()].returns)!==-1) {
                  var ll=div.map.getLonLatFromPixel(evt.xy), handler=indiciaData.srefHandlers[_getSystem().toLowerCase()],
                      pt, proj, recalcGhost = ghost===null || !ghost.atPoint(ll, 0, 0), precisionInfo;
                  if (recalcGhost && ll) {
                    precisionInfo=getPrecisionInfo(div);
                    proj=new OpenLayers.Projection('EPSG:'+indiciaData.srefHandlers[_getSystem().toLowerCase()].srid);
                    ll.transform(div.map.projection, proj);
                    pt = {x:ll.lon, y:ll.lat};
                    // If we have a client-side handler for this system which can return the wkt then we can
                    // draw a ghost of the proposed sref if they click
                    var wkt, feature, parser;
                    wkt = handler.pointToWkt(pt, precisionInfo);
                    if (wkt === 'Out of bounds') {
                      removeAllFeatures(div.map.editLayer, 'ghost');
                    } else {
                      parser = new OpenLayers.Format.WKT();
                      feature = parser.read(wkt);
                      wkt = feature.geometry.transform(proj, div.map.projection).toString();
                      //If this line is used, it breaks the rotation handles on the plots without
                      //actually having any other effect as far as I can tell.
                      if (!div.settings.clickForPlot) {
                        ghost=_showWktFeature(div, wkt, div.map.editLayer, null, true, 'ghost', false);
                      }
                    }
                  }
                }
              }
            }
          });
          $('#map').mouseleave(function () {
            // clear ghost hover markers when mouse leaves the map
            removeAllFeatures(div.map.editLayer, 'ghost');
          });
        }
        // Optional switch to satellite layer
        if (indiciaData.srefHandlers && $('#' + div.settings.srefId).length > 0) {
          var handler = indiciaData.srefHandlers[_getSystem().toLowerCase()];
          if (handler) {
            info = handler.getPrecisionInfo(handler.valueToAccuracy($('#' + div.settings.srefId).val()));
            if (div.settings.helpToPickPrecisionSwitchAt && info.metres <= div.settings.helpToPickPrecisionSwitchAt
                && !div.map.baseLayer.dynamicLayerIndex) {
              switchToSatelliteBaseLayer(div.map);
            }
          }
        }
      }
      if (this.settings.searchLayer) {
        // Add an editable layer to the map
        div.map.searchLayer = new OpenLayers.Layer.Vector(this.settings.searchLayerName, {style: this.settings.searchStyle, 'sphericalMercator': true, displayInLayerSwitcher: this.settings.searchLayerInSwitcher});
        div.map.addLayer(div.map.searchLayer);
      } else {
        div.map.searchLayer = div.map.editLayer;
      }
      // Add any map controls
      $.each(this.settings.controls, function (i, item) {
        div.map.addControl(item);
      });
      // specify a class to align edit buttons left if they are on a toolbar somewhere other than the map.
      var align = (div.settings.toolbarDiv === 'map') ? '' : 'left ';
      var toolbarControls = [];
      var clickInfoCtrl = getClickableLayersControl(div, align);

      if (div.settings.locationLayerName) {
        var layer, locLayerSettings = {
            layers: div.settings.locationLayerName,
            transparent: true
        };
        if (div.settings.locationLayerFilter !== '') {
          locLayerSettings.cql_filter = div.settings.locationLayerFilter;
        }
        layer = new OpenLayers.Layer.WMS('Locations', div.settings.indiciaGeoSvc + 'wms', locLayerSettings, {
          singleTile: true,
          isBaseLayer: false,
          sphericalMercator: true,
          opacity: div.settings.fillOpacity / 2
        });
        div.settings.layers.push(layer);
        div.map.addLayers([layer]);

        var infoCtrl = new OpenLayers.Control({
          activate: function () {
            var handlerOptions = {
              single: true,
              double: false,
              pixelTolerance: 0,
              stopSingle: false,
              stopDouble: false
            };
            this.handler = new OpenLayers.Handler.Click(this, {
              click: this.onClick
            }, handlerOptions);
            this.protocol = new OpenLayers.Protocol.HTTP({
              url: div.settings.indiciaGeoSvc + 'wms',
              format: new OpenLayers.Format.WMSGetFeatureInfo()
            });
            OpenLayers.Control.prototype.activate.call(this);
          },

          onClick: function(e) {
            var params={
                REQUEST: "GetFeatureInfo",
                EXCEPTIONS: "application/vnd.ogc.se_xml",
                VERSION: "1.1.0",
                STYLES: '',
                BBOX: div.map.getExtent().toBBOX(),
                X: Math.round(e.xy.x),
                Y: Math.round(e.xy.y),
                INFO_FORMAT: 'application/vnd.ogc.gml',
                LAYERS: div.settings.locationLayerName,
                QUERY_LAYERS: div.settings.locationLayerName,
                CQL_FILTER: div.settings.locationLayerFilter,
                WIDTH: div.map.size.w,
                HEIGHT: div.map.size.h,
                SRS: div.map.projection
            };
            this.protocol.read({
              params: params,
              callback: this.onResponse,
              scope: this
            });
          },

          onResponse: function(response) {
            if (response.features.length>0) {
              $('#imp-location').val(response.features[0].data.id).change();
              $('#imp-location\\:name').val(response.features[0].data.name);
            }
          }
        });

        div.map.addControl(infoCtrl);
        infoCtrl.activate();
      }

      if (div.settings.editLayer && (div.settings.clickForSpatialRef || div.settings.clickForPlot)) {
        // Setup a click event handler for the map
        OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
          defaultHandlerOptions: {'single': true, 'double': false, 'pixelTolerance': 0, 'stopSingle': false, 'stopDouble': false},
          title: div.settings.hintClickSpatialRefTool,
          trigger: function(e) {
            clickOnMap(e.xy, div);
          },
          initialize: function(options)
          {
            this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.handler = new OpenLayers.Handler.Click( this, {'click': this.trigger}, this.handlerOptions );
          }
        });
      }
      if (div.settings.editLayer && div.settings.allowPolygonRecording) {
        div.map.editLayer.events.on({'featuremodified': function(evt) {
          if ($('#' + div.settings.boundaryGeomId).length>0) {
            $('#' + div.settings.boundaryGeomId).val(evt.feature.geometry.toString());
            if(div.settings.autoFillInCentroid) {
              var centroid = evt.feature.geometry.getCentroid();
              pointToSref(div, centroid, _getSystem(), function(data) {
                if (typeof data.sref !== 'undefined') {
                  $('#'+div.settings.srefId).val(data.sref);
                  $('#' + div.settings.geomId).val(centroid.toString());
                }
              });
            }
          }
        }});
      }
      var hint;
      var pushDrawCtrl = function(c) {
        toolbarControls.push(c);
        if (div.settings.editLayer && div.settings.allowPolygonRecording) {
          c.events.register('featureadded', c, recordPolygon);
        }
      };
      var drawStyle=new Style('boundary', div.settings);
      var ctrlObj;
      $.each(div.settings.standardControls, function(i, ctrl) {
        ctrlObj=null;
        // Add a layer switcher if there are multiple layers
        if (ctrl=='layerSwitcher') {
          div.map.addControl(new OpenLayers.Control.LayerSwitcher());
        } else if (ctrl=='zoomBox') {
          div.map.addControl(new OpenLayers.Control.ZoomBox());
        } else if (ctrl=='panZoom') {
          div.map.addControl(new OpenLayers.Control.PanZoom());
        } else if (ctrl=='panZoomBar') {
          div.map.addControl(new OpenLayers.Control.PanZoomBar());
        } else if (ctrl=='zoom') {
          div.map.addControl(new OpenLayers.Control.Zoom());
        } else if (ctrl=='drawPolygon' && div.settings.editLayer) {
          hint = div.settings.hintDrawPolygonHint;
          if (div.settings.reportGroup!==null) {
            hint += ' ' + div.settings.hintDrawForReportingHint;
          }
          ctrlObj = new OpenLayers.Control.DrawFeature(
            div.map.editLayer,
            OpenLayers.Handler.Polygon,
            {
              displayClass: align + 'olControlDrawFeaturePolygon',
              title: hint,
              handlerOptions: { style:drawStyle },
              activate: function() { activateDrawControl(div, this); },
              deactivate: function() { deactivateDrawControl(div, this); }
            }
          );
          pushDrawCtrl(ctrlObj);
        } else if (ctrl=='drawLine' && div.settings.editLayer) {
          hint = div.settings.hintDrawLineHint;
          if (div.settings.reportGroup!==null) {
            hint += ' ' + div.settings.hintDrawForReportingHint;
          }
          ctrlObj = new OpenLayers.Control.DrawFeature(div.map.editLayer,
            OpenLayers.Handler.Path,
            {
              displayClass: align + 'olControlDrawFeaturePath',
              title: hint,
              handlerOptions: { style:drawStyle },
              activate: function() { activateDrawControl(div, this); },
              deactivate: function() { deactivateDrawControl(div, this); }
            }
          );
          pushDrawCtrl(ctrlObj);
        } else if (ctrl=='drawPoint' && div.settings.editLayer) {
          hint = div.settings.hintDrawPointHint;
          if (div.settings.reportGroup!==null) {
            hint += ' ' + div.settings.hintDrawForReportingHint;
          }
          ctrlObj = new OpenLayers.Control.DrawFeature(div.map.editLayer,
            OpenLayers.Handler.Point,
            {
              displayClass: align + 'olControlDrawFeaturePoint',
              title: hint,
              handlerOptions: { style:drawStyle },
              activate: function() { activateDrawControl(div, this); },
              deactivate: function() { deactivateDrawControl(div, this); }
            }
          );
          pushDrawCtrl(ctrlObj);
        } else if (ctrl=='selectFeature' && div.settings.editLayer) {
          ctrlObj = new OpenLayers.Control.SelectFeature(div.map.editLayer);
          toolbarControls.push(ctrlObj);
        } else if (ctrl=='hoverFeatureHighlight' && (div.settings.editLayer || indiciaData.reportlayer)) {
          // attach control to report layer, or the editLayer if no report loaded.
          ctrlObj = new OpenLayers.Control.SelectFeature(
            typeof indiciaData.reportlayer ==='undefined' ? div.map.editLayer : indiciaData.reportlayer,
            {hover: true, highlightOnly: true});
          div.map.addControl(ctrlObj);
        } else if (ctrl=='clearEditLayer' && div.settings.editLayer) {
          toolbarControls.push(new OpenLayers.Control.ClearLayer([div.map.editLayer],
              {'displayClass': align + ' olControlClearLayer', 'title':div.settings.hintClearSelection, 'clearReport':true}));
        } else if (ctrl=='modifyFeature' && div.settings.editLayer) {
          ctrlObj = new OpenLayers.Control.ModifyFeature(
            div.map.editLayer,
            {
              displayClass: align + 'olControlModifyFeature',
              title: div.settings.hintModifyFeature,
              vertexRenderIntent: 'vertex',
              virtualStyle: {
                strokeColor: "#007744",
                strokeOpacity: 1,
                strokeWidth: 1,
                pointRadius: 4,
                fillOpacity: 0.1,
                graphicName: "square",
                rotation: 45
              },
              activate: function() {
                let featuresToSelect = [];
                // Find the features which could be edited.
                $.each(div.map.editLayer.features, function() {
                  if (this.attributes.type && this.attributes.type.match(/^(clickPoint|boundary)$/)) {
                    featuresToSelect.push(this);
                  }
                });
                // If only 1 then auto-select it.
                if (featuresToSelect.length === 1) {
                  this.selectFeature(featuresToSelect[0]);
                }
                this.moveLayerToTop();
                this.handlers.drag.activate();
                this.handlers.keyboard.activate();

                OpenLayers.Control.prototype.activate.call(this);
              }
            }
          );
          toolbarControls.push(ctrlObj);
          if (typeof div.map.editLayer !== 'undefined') {
            div.map.editLayer.events.register('beforefeaturemodified', null, function(e) {
              // Sub-sample polygons shouldn't be edited this way.
              return e.feature.attributes.type !== 'subsample';
            });
          }
        } else if (ctrl === 'graticule') {
          $.each($('select#' + div.settings.srefSystemId + ' option,input#' + div.settings.srefSystemId), function() {
            var graticuleDef;
            if (typeof div.settings.graticules[$(this).val()] !== 'undefined') {
              graticuleDef = div.settings.graticules[$(this).val()];
              ctrlObj = new OpenLayers.Control.IndiciaGraticule({
                projection: 'EPSG:' + graticuleDef.projection,
                bounds: graticuleDef.bounds,
                intervals: graticuleDef.intervals,
                intervalColours: div.settings.graticuleIntervalColours,
                intervalLineWidth: graticuleDef.intervalLineWidth,
                intervalLineOpacity: graticuleDef.lineOpacity,
                layerName: 'Map grid for ' + ($(this).html() !== '' ? $(this).html() : $(this).val())
              });
              div.map.addControl(ctrlObj);
              if ($.inArray(ctrl, div.settings.activatedStandardControls) === -1) {
                // if this control is not active, also need to reflect this in the layer.
                ctrlObj.gratLayer.setVisibility(false);
              }
            }
          });
        } else if (ctrl==="fullscreen") {
          var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled,
          fullscreenchange=function () {
            var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            if (fullscreenElement) {
              if (typeof indiciaData.origMapStyle === 'undefined') {
                indiciaData.origMapStyle = $(div).attr('style');
              }
              $(div).css('width', '100%');
              $(div).css('height', '100%');
            } else {
              $(div).attr('style', indiciaData.origMapStyle);
            }
            div.map.updateSize();
          };
          if (fullscreenEnabled) {
            document.addEventListener("fullscreenchange", fullscreenchange);
            document.addEventListener("mozfullscreenchange", fullscreenchange);
            document.addEventListener("webkitfullscreenchange", fullscreenchange);
            document.addEventListener("msfullscreenchange", fullscreenchange);
            ctrlObj = new OpenLayers.Control.Button({
                displayClass: "olControlFullscreen", title: div.settings.hintFullscreen, trigger: function() {
                  if ((document.fullscreenElement && document.fullscreenElement !== null) ||    // alternative standard methods
                      document.mozFullScreen || document.webkitIsFullScreen) {
                    var cancel = document.exitFullscreen || document.mozCancelFullScreen || webkitExitFullScreen || msExitFullScreen;
                    cancel.call(document);
                  } else {
                    var fs = div.requestFullscreen || div.mozRequestFullScreen || div.webkitRequestFullScreen || div.msRequestFullscreen;
                    fs.call(div);
                  }

                }
            });
            toolbarControls.push(ctrlObj);
          }
        }
        // activate the control if available and in the config settings. A null control cannot be activated.
        if (ctrlObj!==null && $.inArray(ctrl, div.settings.activatedStandardControls)>-1) {
          ctrlObj.activate();
        }
      });
      var click=false;
      if (div.settings.editLayer && (div.settings.clickForSpatialRef || div.settings.clickForPlot)) {
        click=new OpenLayers.Control.Click({'displayClass':align + 'olControlClickSref'});
        div.map.editLayer.clickControl = click;
      }
      if (clickInfoCtrl !== null) {
        // When using a click for info control, if it allows boxes then it needs to go on the toolbar so it can be disabled.
        // This is because the bounding boxes break the navigation (you can't pan the map).
        if (clickInfoCtrl.allowBox || toolbarControls.length>0) {
          toolbarControls.push(clickInfoCtrl);
        }
      }
      if (toolbarControls.length>0) {
        // Add the click control to the toolbar alongside the other controls.
        if (click) {
          toolbarControls.push(click);
        }
        var toolbarOpts = {
           displayClass: 'olControlEditingToolbar'
        };
        if (div.settings.toolbarDiv!='map') {
          toolbarOpts.div = document.getElementById(div.settings.toolbarDiv);
        }
        var toolbar = new OpenLayers.Control.Panel(toolbarOpts);
        // add a nav control to the toolbar
        var nav=new OpenLayers.Control.Navigation({displayClass: align + "olControlNavigation", "title":div.settings.hintNavigation+((!this.settings.scroll_wheel_zoom || this.settings.scroll_wheel_zoom==="false")?'':div.settings.hintScrollWheel)});
        toolbar.addControls([nav]);
        toolbar.addControls(toolbarControls);
        div.map.addControl(toolbar);
        // Must be done after toolbar for alignment.
        if (div.settings.selectFeatureBufferProjection) {
          addClickBufferCtrl(div);
        }
        if (clickInfoCtrl !== null && clickInfoCtrl.hoverControl !== null) {
          div.map.addControl(clickInfoCtrl.hoverControl);
        }
        if (click) {
          click.activate();
        }
        else {
          nav.activate();
        }
        // as these all appear on the toolbar, don't need to worry about activating individual controls, as user will pick which one they want.
      } else {
        // no other selectable controls, so no need for a click button on toolbar
        if (click) {
          div.map.addControl(click);
          click.activate();
        }
        if (clickInfoCtrl !== null) {
          div.map.addControl(clickInfoCtrl);
          if (clickInfoCtrl.hoverControl !== null) {
            div.map.addControl(clickInfoCtrl.hoverControl);
          }
          clickInfoCtrl.activate();
        }
      }

      // Disable the scroll wheel from zooming if required
      if (!this.settings.scroll_wheel_zoom || this.settings.scroll_wheel_zoom==="false") {
        $.each(div.map.controls, function(i, control) {
          if (control instanceof OpenLayers.Control.Navigation) {
            control.disableZoomWheel();
          }
        });
      }

      // What extra stuff do we need to do after clicking to set the spatial reference?
      if (div.settings.clickForPlot) {
        mapClickForSpatialRefHooks.push(updatePlotAfterMapClick);
      }
      if (div.settings.helpDiv) {
        mapClickForSpatialRefHooks.push(updateHelpAfterMapClick);
      } else if (div.settings.click_zoom) {
        mapClickForSpatialRefHooks.push(updateZoomAfterMapClick);
      }

      _bindControls(this);
      // keep a handy reference
      indiciaData.mapdiv=div;
      // call any post initialisation hooks
      $.each(mapInitialisationHooks, function() {
        this(div);
      });
    });

  };
})(jQuery);

/**
 * Main default options for the map
 */
jQuery.fn.indiciaMapPanel.defaults = {
  indiciaSvc : '',
  indiciaGeoSvc : '',
  readAuth : '',
  height: "600",
  width: "470",
  initial_lat: 55.1,
  initial_long: -2,
  initial_zoom: 5,
  scroll_wheel_zoom: true,
  click_zoom: false, // zoom in and recentre on grid square after clicking map
  bing_api_key: '',
  os_api_key: '',
  proxy: '',
  presetLayers: [],
  otherBaseLayerConfig: [],
  indiciaWMSLayers: {},
  indiciaWFSLayers : {},
  layers: [],
  hoverShowsDetails: false,
  clickableLayers: [],
  clickableLayersOutputMode: 'popup', // options are popup, div or customFunction
  clickableLayersOutputFn: format_selected_features,
  clickableLayersOutputDiv: '',
  clickableLayersOutputColumns: [],
  selectFeatureBufferProjection: false,
  allowBox: true, // can disable drag boxes for querying info, so navigation works
  featureIdField: '',
  clickPixelTolerance: 5,
  reportGroup: null, // name of the collection of report outputs that this map is linked to when doing dashboard reporting
  locationLayerName: '', // define a feature type that can be used to auto-populate the location control when clicking on a location
  locationLayerFilter: '', // a cql filter that can be used to limit locations shown on the location layer
  controls: [],
  standardControls: ['layerSwitcher','panZoom'],
  activatedStandardControls: ['hoverFeatureHighlight', 'graticule'],
  toolbarDiv: 'map', // map, top, bottom, or div ID
  toolbarPrefix: '', // content to prepend to the toolbarDiv content if not on the map
  toolbarSuffix: '', // content to append to the toolbarDiv content if not on the map
  helpDiv: false,
  editLayer: true,
  // If clickForSpatialRef=true, then enables the click to get spatial
  // references control.
  clickForSpatialRef: true,
  // If disallowManualSrefUpdate set, then functionality for setting spatial
  // ref is available, but disabled, so must be invoked by code.
  disallowManualSrefUpdate: false,
  clickForPlot: false, // if true, overrides clickForSpatialRef to locate a plot instead of a grid square.
  allowPolygonRecording: false,
  autoFillInCentroid: false, // if true will automatically complete the centroid and Sref when polygon recording.
  editLayerName: 'Selection layer',
  editLayerInSwitcher: false,
  searchLayer: false, // determines whether we have a separate layer for the display of location searches, eg georeferencing. Defaults to editLayer.
  searchUpdatesSref: false,
  searchDisplaysPoint: true,
  searchLayerName: 'Search layer',
  searchLayerInSwitcher: false,
  initialFeatureWkt: null,
  initialBoundaryWkt: null,
  defaultSystem: 'OSGB',
  latLongFormat: 'D',
  srefId: 'imp-sref',
  srefLatId: 'imp-sref-lat',
  srefLongId: 'imp-sref-long',
  srefSystemId: 'imp-sref-system',
  geomId: 'imp-geom',
  plotShapeId: 'attr-shape', // html id of plot shape control. Can be 'rectangle' or 'circle'.
  plotWidthId: 'attr-width', // html id of plot width control for plotShape = 'rectangle'
  plotLengthId: 'attr-length', // html id of plot length control for plotShape = 'rectangle'
  plotRadiusId: 'attr-radius', // html id of plot radius control for plotShape = 'circle'
  boundaryGeomId: 'imp-boundary-geom',
  clickedSrefPrecisionMin: 2, // depends on sref system, but for OSGB this would be 2,4,6,8,10 etc = length of grid reference
  clickedSrefPrecisionMax: 10,
  plotPrecision: '10', // when clickForPlot is true, the precision of grid ref associated with plot.
  msgGeorefSelectPlace: 'Select from the following places that were found matching your search, then click on the map to specify the exact location:',
  msgGeorefNothingFound: 'No locations found with that name. Try a nearby town name.',
  msgGetInfoNothingFound: 'No occurrences were found at the location you clicked.',
  msgSrefOutsideGrid: 'The position is outside the range of the selected map reference system.',
  msgSrefNotRecognised: 'The map reference is not recognised.',
  msgSrefSystemNotSet: 'The spatial reference system is not set.',
  msgReplaceBoundary: 'Would you like to replace the existing boundary with the new one?',
  maxZoom: 19, //maximum zoom when relocating to gridref, postcode etc.
  maxZoomBuffer: 0.33, //margin around feature when relocating to gridref or initialFeatureWkt
  drawObjectType: 'boundary',

  //options for OpenLayers. Feature. Vector. style
  fillColor: '#773333',
  fillOpacity: 0.3,
  strokeColor: '#660000',
  strokeOpacity: 1,
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeDashstyle: 'solid',
  hoverFillColor: 'white',
  hoverFillOpacity: 0.8,
  hoverStrokeColor: 'red',
  hoverStrokeOpacity: 1,
  hoverStrokeWidth: 0.2,
  pointRadius: 6,
  hoverPointRadius: 1,
  hoverPointUnit: '%',
  pointerEvents: 'visiblePainted',
  cursor: '',
  graticules: {
    'OSGB': {
      projection: 27700,
      bounds: [0, 0, 700000, 1300000],
      intervals: [100000, 10000, 1000, 100]
    },
    'OSIE': {
      projection: 29903,
      bounds: [0, 0, 400000, 500000],
      intervals: [100000, 10000, 1000, 100]
    },
    'utm30ed50': {
      projection: 23030,
      bounds: [500000, 5400000, 600000, 5550000],
      intervals: [100000, 10000, 1000, 100]
    },
    'mtbqqq': {
      projection: 4314,
      bounds: [35/6, 46, 134/6, 55.9],
      intervals: [[ 10/60, 5/60, 150/3600, 75/3600 ],[ 6/60, 3/60, 90/3600, 45/3600 ]]
    }
  },
  /* Intention is to also implement hoveredSrefPrecisionMin and Max for a square size shown when you hover, and also a
    * displayedSrefPrecisionMin and Mx for a square size output into a list box as you hover. Both of these could either be
    * absolute numbers, or a number preceded by - or + to be relative to the default square size for this zoom level. */
  // Additional options for OpenLayers.Feature.Vector.style on the search layer.
  fillColorSearch: '#ee0000',
  fillOpacitySearch: 0.5,
  strokeColorSearch: '#ee0000',
  // Additional options for OpenLayers.Feature.Vector.style for the ghost
  fillColorGhost: '#777777',
  fillOpacityGhost: 0.3,
  strokeColorGhost: '#ee9900',
  strokeOpacityGhost: 1,
  strokeDashstyleGhost: 'dash',
  // Additional options for OpenLayers.Feature.Vector.style for a boundary
  fillColorBoundary: '#0000FF',
  fillOpacityBoundary: 0.1,
  strokeColorBoundary: '#FF0000',
  strokeWidthBoundary: 2,
  strokeDashstyleBoundary: 'dash',
  pointRadiusBoundary: 10,
  // hint for the grid ref you are over
  gridRefHint: false,

  // Are we using the OpenLayers defaults, or are they all provided?
  useOlDefaults: true,
  rememberPos: false, // set to true to enable restoring the map position when the page is reloaded. Requires jquery.cookie plugin.
  hintNavigation: 'Select this tool to navigate around the map by dragging, or double clicking to zoom the map.',
  hintScrollWheel: ' Holding Ctrl and using the mouse scroll wheel whilst over the map will zoom in and out.',
  hintClickSpatialRefTool: 'Select this tool to enable clicking on the map to set your location',
  hintQueryDataPointsTool: 'Select this tool then click on or drag a box over data points on the map to view the underlying records.',
  hintQueryBufferTool: 'The search area covered by a clicked point or dragged box will be enlarged by the amount specified in the Tolerance box shown when this control is active.',
  hintDrawPolygonHint: 'Select this tool to draw a polygon, clicking on the map to draw the shape and double clicking to finish.',
  hintDrawLineHint: 'Select this tool to draw a line, clicking on the map to draw the shape and double clicking to finish.',
  hintDrawPointHint: 'Select this tool to draw points by clicking on the map.',
  hintDrawForReportingHint: 'You can then filter the report for intersecting records.',
  hintClearSelection: 'Clear the edit layer',
  hintModifyFeature: 'Modify the selected feature. Click on the feature to select it then grab and drag the circular handles to change the boundary.',
  hintFullscreen: 'Display the map in full screen mode',
  hlpClickOnceSetSref: 'Click once on the map to set your location.',
  hlpClickAgainToCorrect: 'Click on the map again to correct your position if necessary.',
  hlpPanZoom: 'Pan and zoom the map to the required place by dragging the map and double clicking or Shift-dragging to zoom.',
  hlpPanZoomButtons: 'Pan and zoom the map to the required place using the navigation buttons or '+
      'by dragging the map and double clicking or Shift-dragging to zoom.',
  hlpZoomButtons: 'Zoom the map to the required place using the +/- buttons or by double clicking or Shift-dragging to zoom. ' +
      'Drag the map with the mouse to pan.',
  hlpZoomChangesPrecision: 'By zooming the map in or out before clicking you can alter the precision of the '+
      'selected grid square.',
  helpToPickPrecisionMin: false,
  helpToPickPrecisionMax: 10,
  helpToPickPrecisionSwitchAt: false,
  hlpImproveResolution1: "{size} {type} selected. Please click on the map again to provide a more accurate location.",
  hlpImproveResolution2: "Good. {size} {type} selected.",
  hlpImproveResolution3: "Excellent! {size} {type} selected. If your position is wrong, either click your actual position again or zoom out until your position comes to view, then retry.",
  hlpImproveResolutionSwitch: "We've switched to a satellite view to allow you to locate your position even better.",
  hlpCustomPolygon: "Excellent! A custom polygon has been drawn for this record."
};

/**
 * Default options to pass to the openlayers map constructor
 */
jQuery.fn.indiciaMapPanel.openLayersDefaults = {
  projection: 3857,
  displayProjection: 4326,
  units: "m",
  numZoomLevels: 18,
  maxResolution: 156543.0339,
  maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34)
};


/**
 * Settings for the georeference lookup.
 */
jQuery.fn.indiciaMapPanel.georeferenceLookupSettings = {
  georefSearchId: 'imp-georef-search',
  georefSearchBtnId: 'imp-georef-search-btn',
  georefCloseBtnId: 'imp-georef-close-btn',
  georefOutputDivId: 'imp-georef-output-div',
  georefDivId: 'imp-georef-div'
};


/**
 * Function that formats the response from a SelectFeature action.
 * Can be replaced through the setting clickableLayersOutputFn.
 */
function format_selected_features(features, div) {
  if (features.length===0) {
    return div.settings.msgGetInfoNothingFound;
  } else {
    var html='<table><thead><tr>', keepVagueDates = typeof features[0].attributes.date === 'undefined';
    // use normal for (in) to get object properties
    for(var attr in features[0].attributes) {
      // skip vague date component columns if we have a standard date
      if (keepVagueDates || attr.substr(0, 5)!=='date_') {
        if (div.settings.clickableLayersOutputColumns.length===0) {
          html += '<th>' + attr + '</th>';
        } else if (div.settings.clickableLayersOutputColumns[attr]!==undefined) {
          html += '<th>' + div.settings.clickableLayersOutputColumns[attr] + '</th>';
        }
      }
    }
    html += '</tr></thead><tbody>';
    jQuery.each(features, function(i, item) {
      html += '<tr>';
      for(var attr in item.attributes) {
        if ((keepVagueDates || attr.substr(0, 5)!=='date_') && (div.settings.clickableLayersOutputColumns.length===0 || div.settings.clickableLayersOutputColumns[attr]!==undefined)) {
          html += '<td>' + item.attributes[attr] + '</td>';
        }
      }
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }
}

//This is the code that creates the plot square/rectangle. It is called by the trigger when the user clicks on the map.
//Firstly get the initial south-west point in the various grid reference formats (4326=lat long, 27700 = British National Grid)
function plot_rectangle_calculator(latLongPoint, width, length) {
  var xy3857 = latLongPoint, northTestPointLatLon, northTestPoint27700, northRightAnglePoint27700,
      eastTestPointLatLon, eastTestPoint27700, eastRightAnglePoint27700,
      actualSquareNorthEastPoint4326, mercOriginal, mercNorth, mercEast, mercNorthEast,
      pt3857 = new OpenLayers.Geometry.Point(xy3857.lon, xy3857.lat),
      InitialClickPoint4326 = pt3857.clone().transform(indiciaData.mapdiv.map.projection, new OpenLayers.Projection('epsg:4326')),
      InitialClickPoint27700 = pt3857.clone().transform(indiciaData.mapdiv.map.projection, new OpenLayers.Projection('epsg:27700'));

  //Get an arbitrary point north of the original long, lat position. In our case this is 1 degree north but the amount doesn't really matter. Then convert to British National Grid
  northTestPointLatLon = InitialClickPoint4326.clone();
  northTestPointLatLon.y = northTestPointLatLon.y+1;
  northTestPoint27700 = northTestPointLatLon.clone().transform('epsg:4326', new OpenLayers.Projection('epsg:27700'));

  //Get a point the is at right angles to the original point and the arbitrary point north.
  //We can do this by taking the british national grid x value of the south point and combining it with the
  //the y value of the north point. This will then create a right-angle triangle as the British National Grid is at an angle
  //compared to long lat.
  northRightAnglePoint27700 = northTestPoint27700.clone();
  northRightAnglePoint27700.x = InitialClickPoint27700.x;

  //We then work out the side lengths and angle of the right-angled triangle
  var opposite = northTestPoint27700.x - northRightAnglePoint27700.x;
  var adj = northRightAnglePoint27700.y - InitialClickPoint27700.y;
  var gridAngle = Math.atan(opposite/adj);
  //The hypotenuse is the distance north along the longitude line to our test point but in British National Grid 27700 metres.
  var hyp = adj/Math.cos(gridAngle);

  //As we now know the length in metres between the south point and our arbitrary north point (the hypotenuse),
  //we can now use the percent value to work out the Y distance in Lat Long 4326 format for the corner of the square above the original click point.
  //This is because we know the distance in 4326 degrees, but now we also know the percentage the square length is along the line.
  var hypmetrePercent = length/hyp;
  var actualSquareNorthWestPoint4326= InitialClickPoint4326.clone();
  actualSquareNorthWestPoint4326.y = InitialClickPoint4326.y+((northTestPointLatLon.y-InitialClickPoint4326.y)*hypmetrePercent);

  //Next we need to use the same technique along the side of the square. We just need to use X values rather than Y values.
  eastTestPointLatLon = InitialClickPoint4326.clone();
  eastTestPointLatLon.x = eastTestPointLatLon.x+1;
  eastTestPoint27700 = eastTestPointLatLon.clone().transform('epsg:4326', new OpenLayers.Projection('epsg:27700'));

  eastRightAnglePoint27700 = eastTestPoint27700.clone();
  eastRightAnglePoint27700.y = InitialClickPoint27700.y;

  opposite =  eastRightAnglePoint27700.y-eastTestPoint27700.y;
  adj = eastRightAnglePoint27700.x - InitialClickPoint27700.x;
  gridAngle = Math.atan(opposite/adj);
  //The hypotenuse is the distance north along the latitude line to our east test point but in British National Grid 27700 metres.
  hyp = adj/Math.cos(gridAngle);

  hypmetrePercent = width/hyp;

  var actualSquareSouthEastPoint4326= InitialClickPoint4326.clone();
  actualSquareSouthEastPoint4326.x = InitialClickPoint4326.x+((eastTestPointLatLon.x-InitialClickPoint4326.x)*hypmetrePercent);

  //As we know 3 of the plot corners, we can work out the 4th and then convert the plot square back into a form the map can understand
  actualSquareNorthEastPoint4326 = actualSquareSouthEastPoint4326.clone();
  actualSquareNorthEastPoint4326.y = actualSquareNorthWestPoint4326.y;
  //On the PSS site, the grid reference of the sqaure/rectangle needs to be in the middle.
  //Just shift the corners of the square/rectangle west and south by half a side of the rectangle/square.
  if (indiciaData.clickMiddleOfPlot) {
    var westShift = (actualSquareSouthEastPoint4326.x - InitialClickPoint4326.x)/2;
    var southShift = (actualSquareNorthWestPoint4326.y - InitialClickPoint4326.y)/2;

    InitialClickPoint4326.x = InitialClickPoint4326.x - westShift;
    InitialClickPoint4326.y = InitialClickPoint4326.y - southShift;

    actualSquareNorthWestPoint4326.x = actualSquareNorthWestPoint4326.x - westShift;
    actualSquareNorthWestPoint4326.y = actualSquareNorthWestPoint4326.y - southShift;

    actualSquareSouthEastPoint4326.x = actualSquareSouthEastPoint4326.x - westShift;
    actualSquareSouthEastPoint4326.y = actualSquareSouthEastPoint4326.y - southShift;

    actualSquareNorthEastPoint4326.x = actualSquareNorthEastPoint4326.x - westShift;
    actualSquareNorthEastPoint4326.y = actualSquareNorthEastPoint4326.y - southShift;
  }

  mercOriginal = OpenLayers.Layer.SphericalMercator.forwardMercator(InitialClickPoint4326.x,InitialClickPoint4326.y);
  mercNorth = OpenLayers.Layer.SphericalMercator.forwardMercator(actualSquareNorthWestPoint4326.x,actualSquareNorthWestPoint4326.y);
  mercEast = OpenLayers.Layer.SphericalMercator.forwardMercator(actualSquareSouthEastPoint4326.x,actualSquareSouthEastPoint4326.y);
  mercNorthEast = OpenLayers.Layer.SphericalMercator.forwardMercator(actualSquareNorthEastPoint4326.x,actualSquareNorthEastPoint4326.y);

  var polygonMetadata = 'POLYGON(('+mercOriginal.lon+' '+mercOriginal.lat+','+mercNorth.lon+' '+mercNorth.lat+','+mercNorthEast.lon+' '+mercNorthEast.lat+','+mercEast.lon+' '+mercEast.lat+'))';
  return OpenLayers.Geometry.fromWKT(polygonMetadata);
}