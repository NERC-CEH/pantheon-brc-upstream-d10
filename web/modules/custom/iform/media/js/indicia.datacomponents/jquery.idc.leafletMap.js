/**
 * @file
 * A plugin for Leaflet maps.
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

/* eslint no-underscore-dangle: ["error", { "allow": ["_source"] }] */

/**
 * Output plugin for maps.
 */
(function leafletMapPlugin() {
  'use strict';
  var $ = jQuery;

  /**
   * Place to store public methods.
   */
  var methods;

  /**
   * Declare default settings.
   */
  var defaults = {
    initialBoundsSet: false,
    initialLat: 54.093409,
    initialLng: -2.89479,
    initialZoom: 5,
    baseLayer: 'OpenStreetMap',
    baseLayerConfig: {
      OpenStreetMap: {
        title: 'Open Street Map',
        type: 'OpenStreetMap'
      },
      OpenTopoMap: {
        title: 'Open Topo Map',
        type: 'OpenTopoMap'
      }
    },
    cookies: true,
    selectedFeatureStyle: {
      color: '#FF0000',
      fillColor: '#FF0000',
    }
  };

  /**
   * Registered callbacks for different events.
   */
  var callbacks = {
    moveend: []
  };

  /**
   * Variable to hold the marker used to highlight the currently selected row
   * in a linked idcDataGrid.
   */
  var selectedRowMarker = null;

   /**
   * Variable to hold the polygon used to highlight the currently selected
   * location boundary when relevant.
   */
  var selectedFeature = null;

  /**
   * If filtering applied due to selected feature, remember which sources need
   * to be cleared when map clicked.
   */
  var sourcesToReloadOnMapClick = [];

  /**
   * Track if a feature has just been pre-clicked, so the map event click
   * doesn't clear the associated filter.
   */
  var justClickedOnFeature = false;

  /**
   * Finds the list of layer IDs that use a given source id for population.
   */
  function getLayerIdsForSource(el, sourceId) {
    var layerIds = [];
    $.each(el.settings.layerConfig, function eachLayer(layerId, cfg) {
      if (cfg.source === sourceId) {
        layerIds.push(layerId);
      }
    });
    return layerIds;
  }

  /**
   * Finds the list of layers that use a given source id for population.
   */
  function getLayersForSource(el, sourceId) {
    var layers = [];
    $.each(el.settings.layerConfig, function eachLayer(layerId, cfg) {
      if (cfg.source === sourceId) {
        layers.push(el.outputLayers[layerId]);
      }
    });
    return layers;
  }

  /**
   * Convert an ES geohash to a WKT polygon.
   */
  function geohashToWkt(geohash) {
    var minLat =  -90;
    var maxLat =  90;
    var minLon = -180;
    var maxLon = 180;
    var shift;
    var isForMin;
    var isForLon = true;
    var centreLon;
    var centreLat;
    var mask;
    // The geohash alphabet.
    const ghs32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    for (var i = 0; i < geohash.length; i++) {
      const chr = geohash.charAt(i);
      const idx = ghs32.indexOf(chr);
      if (idx === -1) {
        throw new Error('Invalid character in geohash');
      }
      for (shift = 4; shift >= 0; shift--) {
        // Test bit at position shift. If 1, then for min, else for max.
        mask = 1 << shift;
        isForMin = idx & mask;
        // Bits extracted from characters toggle between x & y.
        if (isForLon) {
          centreLon = (minLon + maxLon) / 2;
          if (isForMin) {
            minLon = centreLon;
          } else {
            maxLon = centreLon;
          }
        } else {
          centreLat = (minLat + maxLat) / 2;
          if (isForMin) {
            minLat = centreLat;
          } else {
            maxLat = centreLat;
          }
        }
        isForLon = !isForLon;
      }
    }
    return 'POLYGON((' + minLon + ' ' + minLat + ',' + maxLon + ' ' + minLat + ', ' + maxLon + ' ' + maxLat + ', ' + minLon + ' ' + maxLat + ', ' + minLon + ' ' + minLat + '))';
  }

  /**
   * Add a feature to the map (marker, circle etc).
   *
   * @param string geom
   *   Well Known Text for the geometry.
   * @param int metric
   *   Metric to display for the feature (e.g. records count for a grid square)
   *   - maxes out at 20,000.
   * @param float fillOpacity
   *   Default fillOpacity, unless overridden by fillOpacity=metric in config
   *   options. Defaults to 0.5
   * @param string filterField
   *   Optional field for filter to apply if this feature selected.
   * @param string filterValue
   *   Optional value for filter to apply if this feature selected.
   * @param string label
   *   Optional label for a tooltip to be added to the feature.
   */
  function addFeature(el, sourceId, location, geom, metric, fillOpacity, filterField, filterValue, label, geohash) {
    var layerIds = getLayerIdsForSource(el, sourceId);
    var circle;
    var config;
    var wkt;
    var sourceSettings = indiciaData.esSourceObjects[sourceId].settings;
    var size = {};
    fillOpacity = fillOpacity === null || typeof fillOpacity === "undefined" ? 0.5 : fillOpacity;
    $.each(layerIds, function eachLayer() {
      var layerConfig = el.settings.layerConfig[this];
      var mapObject;
      config = {
        type: typeof layerConfig.type === 'undefined' ? 'marker' : layerConfig.type,
        options: {}
      };
      if (geom && sourceSettings.showGeomsAsTooClose) {
        config.type = 'geom';
      }
      if (typeof layerConfig.style !== 'undefined') {
        $.extend(config.options, layerConfig.style);
      }
      if (config.type === 'circle' || config.type === 'square' || config.type === 'geom') {
        config.options = $.extend({ radius: 'metric', fillOpacity: fillOpacity }, config.options);
        if (!config.options.size && sourceSettings.mapGridSquareSize) {
          config.options.size = sourceSettings.mapGridSquareSize;
          if (config.options.size === 'autoGridSquareSize') {
            // Calculate according to map zoom.
            config.options.size = $(el).idcLeafletMap('getAutoSquareSize');
          }
        }
        // If outputting a geohash as geometry (not heat), calculate the geohash rectangle.
        if (sourceSettings.mode === 'mapGeoHash' && (config.type === 'geom' || config.type === 'square') && geohash) {
          geom = geohashToWkt(geohash.toLowerCase());
          config.type = 'geom';
        }
         // If size is auto, override it.
        indiciaFns.findAndSetValue(config.options, 'size', $(el).idcLeafletMap('getAutoSquareSize'), 'autoGridSquareSize');
        // Apply metric to any options that are supposed to use it.
        $.each(config.options, function eachOption(key, value) {
          if (value === 'metric') {
            if (key === 'fillOpacity') {
              // Set a fill opacity - 20000 is max metric.
              config.options.fillOpacity = metric / 20000;
            } else {
              config.options[key] = metric;
            }
          }
        });
        if (config.options.size) {
          config.options.radius = config.options.size / 2;
          delete config.options.size;
        }
      }
      // Store type so available in feature details.
      config.options.type = config.type;
      config.options.className = 'data-' + config.type;
      // Store filter data to apply if feature clicked on.
      if (filterField && filterValue) {
        config.options.filterField = filterField;
        config.options.filterValue = filterValue;
      }
      if (config.type === 'geom') {
        if (geom.indexOf('POINT') === 0) {
          config.type = 'circle';
          config.options.radius = 5;
          size.relativeVisual = config.options.radius * Math.pow(10, el.map.getZoom());
          config.options.weight = Math.max(2, 19 - Math.floor(Math.log10(size.relativeVisual)));
        }
      }

      switch (config.type) {
        // Circle markers on layer.
        case 'circle':
          mapObject = L.circle(location, config.options);
          break;
        // Leaflet.heat powered heat maps. Note these can't be labelled.
        case 'heat':
          el.outputLayers[this].addLatLng([location.lat, location.lon, metric]);
          break;
        case 'square':
          // @todo - properly projected squares. These are just the bounding box of circles.
          // Use a temporary circle to get correct size.
          circle = L.circle(location, config.options).addTo(el.map);
          mapObject = L.rectangle(circle.getBounds(), config.options);
          circle.removeFrom(el.map);
          break;
        case 'geom':
          wkt = new Wkt.Wkt();
          wkt.read(geom);
          mapObject = wkt.toObject(config.options);
          if (!config.options.weight) {
            // Default weight used to "thicken" small objects when zoomed out.
            size.x = mapObject.getBounds().getEast() - mapObject.getBounds().getWest();
            size.y = mapObject.getBounds().getNorth() - mapObject.getBounds().getSouth();
            size.viewportX = el.map.getBounds().getEast() - el.map.getBounds().getWest();
            size.viewportY = el.map.getBounds().getNorth() - el.map.getBounds().getSouth();
            // Weight at least 1, calculated based on ratio of map viewport area to object area.
            mapObject.options.weight = Math.max(1, Math.round(Math.log10((size.viewportX * size.viewportY) / (size.x * size.y * 100))));
          }
          break;
        // Default layer type is markers.
        default:
          mapObject = L.marker(location, config.options);
      }
      if (typeof mapObject !== 'undefined') {
        el.outputLayers[this].addLayer(mapObject);
        if (layerConfig.labels && label) {
          layerConfig.labels === 'permanent' ? mapObject.bindTooltip(label, {permanent: true}) : mapObject.bindTooltip(label);
        }
      }
    });
  }

  /**
   * Thicken the borders of selected features when zoomed out to aid visibility.
   */
  function ensureFeatureClear(el, feature) {
    var style;
    if (typeof feature.setStyle !== 'undefined') {
      style = $.extend({}, el.settings.selectedFeatureStyle);
      if (!style.weight) {
        style.weight = Math.min(20, Math.max(1, 20 - (el.map.getZoom())));
      }
      if (!style.opacity) {
        style.opacity = Math.min(1, Math.max(0.6, el.map.getZoom() / 18));
      }
      feature.setStyle(style);
    }
  }

  /**
   * Converts a geom to a feature object with the supplied style.
   *
   * Returns an obj with 2 properties, obj - the feature, and type - the
   * geometry type.
   */
  function getFeatureFromGeom(geom, style) {
    var wkt = new Wkt.Wkt();
    var objStyle = {
      color: '#0000FF',
      opacity: 1.0,
      fillColor: '#0000FF',
      fillOpacity: 0.2
    };
    wkt.read(geom);
    if (style) {
      $.extend(objStyle, style);
    }
    return {
      obj: wkt.toObject(objStyle),
      type: wkt.type
    };
  }

  /**
   * Adds a Wkt geometry to the map.
   */
  function showFeatureWkt(el, geom, zoom, maxZoom, style) {
    var centre;
    var feature = getFeatureFromGeom(geom, style);
    feature.obj.addTo(el.map);
    centre = typeof feature.obj.getCenter === 'undefined' ? feature.obj.getLatLng() : feature.obj.getCenter();
    // Pan and zoom the map. Method differs for points vs polygons.
    if (!zoom) {
      el.map.panTo(centre);
    } else if (feature.type === 'polygon' || feature.type === 'multipolygon') {
      el.map.fitBounds(feature.obj.getBounds(), { maxZoom: maxZoom });
    } else {
      // Incompatible geometry type so we guess the zoom.
      el.map.setView(centre, 11);
    }
    return feature.obj;
  }

  /**
   * Select a grid row pans, optionally zooms and adds a marker.
   */
  function rowSelected(el, tr, zoom) {
    var doc;
    var obj;
    if (selectedRowMarker) {
      selectedRowMarker.removeFrom(el.map);
    }
    selectedRowMarker = null;
    if (tr) {
      doc = JSON.parse($(tr).attr('data-doc-source'));
      if (doc.location) {
        obj = showFeatureWkt(el, doc.location.geom, zoom, 11);
        ensureFeatureClear(el, obj);
        selectedRowMarker = obj;
      }
    }
  }

  /**
   * Allows map settings to be loaded from the browser cookies.
   *
   * Zoom, lat, long and selected base layer can all be remembered in cookies.
   */
  function loadSettingsFromCookies(el, cookieNames) {
    var val;
    var settings = {};
    $.each(cookieNames, function eachCookie() {
      val = $.cookie(this + '-' + el.id);
      if (val !== null && val !== 'undefined') {
        settings[this] = val;
      }
    });
    return settings;
  }

  /**
   * Adds features to the map where using a geo_hash aggregation.
   */
  function mapGeoHashAggregation(el, response, sourceSettings) {
    var buckets = indiciaFns.findValue(response.aggregations, 'buckets');
    var maxMetric = 10;
    if (typeof buckets !== 'undefined') {
      $.each(buckets, function eachBucket() {
        var count = indiciaFns.findValue(this, 'count');
        maxMetric = Math.max(Math.sqrt(count), maxMetric);
      });
      $.each(buckets, function eachBucket() {
        var location = indiciaFns.findValue(this, 'location');
        var count = indiciaFns.findValue(this, 'count');
        var metric = Math.round((Math.sqrt(count) / maxMetric) * 20000);
        if (typeof location !== 'undefined') {
          addFeature(el, sourceSettings.id, location, null, metric, null, null, null, null, this.key);
        }
      });
    }
  }

  /**
   * Adds features to the map where using a grid square aggregation.
   *
   * Grid square aggregations must aggregate on srid then one of the grid
   * square centre field values.
   */
  function mapGridSquareAggregation(el, response, sourceSettings) {
    var buckets = indiciaFns.findValue(response.aggregations, 'buckets');
    var subBuckets;
    var maxMetric = 10;
    var filterField = $(el).idcLeafletMap('getAutoSquareField');
    if (typeof buckets !== 'undefined') {
      $.each(buckets, function eachBucket() {
        subBuckets = indiciaFns.findValue(this, 'buckets');
        if (typeof subBuckets !== 'undefined') {
          $.each(subBuckets, function eachSubBucket() {
            maxMetric = Math.max(Math.sqrt(this.doc_count), maxMetric);
          });
        }
      });
      $.each(buckets, function eachBucket() {
        subBuckets = indiciaFns.findValue(this, 'buckets');
        if (typeof subBuckets !== 'undefined') {
          $.each(subBuckets, function eachSubBucket() {
            var coords;
            var metric;
            if (this.key && this.key.match(/\-?\d+\.\d+ \-?\d+\.\d+/)) {
              coords = this.key.split(' ');
              metric = Math.round((Math.sqrt(this.doc_count) / maxMetric) * 20000);
              if (typeof location !== 'undefined') {
                addFeature(el, sourceSettings.id, { lat: coords[1], lon: coords[0] }, null, metric, null, filterField, this.key);
              }
            }
          });
        }
      });
    }
  }

  /**
   * If using auto-sized grids, size of the grid recommended for current map zoom.
   *
   * Value in km.
   */
  function autoGridSquareKms(el) {
    var zoom = el.map.getZoom();
    if (zoom > 10) {
      return 1;
    } else if (zoom > 8) {
      return 2;
    }
    return 10;
  }

  /**
   * Returns true if a layer should be enabled when the page loads.
   */
  function layerEnabled(el, id, layerConfig) {
    var layerState;
    if (el.settings.layerState && !layerConfig.forceEnabled) {
      layerState = JSON.parse(el.settings.layerState);
      if (layerState[id]) {
        return layerState[id].enabled;
      }
    }
    // Revert to default in layer config.
    if (layerConfig.forceEnabled) {
      return true;
    } else if (layerConfig.enabled === 'undefined') {
      return true;
    } else {
      return layerConfig.enabled;
    }
  }

  /**
   * Event handler for layer enabling.
   *
   * * Populates the associated datasource.
   * * Ensures new state reflected in cookie.
   */
  function onAddLayer(el, layer, id) {
    var layerState;
    // Enabling a layer - need to repopulate the source so it gets data.
    if (indiciaData.esSourceObjects[el.settings.layerConfig[id].source]) {
      indiciaData.esSourceObjects[el.settings.layerConfig[id].source].populate();
    }
    if (el.settings.cookies) {
      layerState = $.cookie('layerState-' + el.id);
      if (layerState) {
        layerState = JSON.parse(layerState);
      } else {
        layerState = {};
      }
      layerState[id] = { enabled: true };
      indiciaFns.cookie('layerState-' + el.id, JSON.stringify(layerState), { expires: 3650 });
    }
  }

  /**
   * Event handler for layer disabling.
   *
   * Ensures new state reflected in cookie.
   */
  function onRemoveLayer(el, id) {
    var layerState;
    if (el.settings.cookies) {
      layerState = $.cookie('layerState-' + el.id);
      if (layerState) {
        layerState = JSON.parse(layerState);
      } else {
        layerState = {};
      }
      layerState[id] = { enabled: false };
      indiciaFns.cookie('layerState-' + el.id, JSON.stringify(layerState), { expires: 3650 });
    }
  }

  /**
   * Build the list of base map layers.
   */
  function getBaseMaps(el) {
    var baseLayers = {};
    var subType;
    var wmsOptions;
    $.each(el.settings.baseLayerConfig, function eachLayer(title) {
      if (this.type === 'OpenStreetMap') {
        baseLayers[title] = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
      } else if (this.type === 'OpenTopoMap') {
        baseLayers[title] = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          maxZoom: 17,
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
            '<a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> ' +
            '(<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA</a>)'
        });
      } else if (this.type === 'Google') {
        subType = this.config && this.config.subType;
        if ($.inArray(subType, ['roadmap', 'satellite', 'terrain', 'hybrid']) === -1) {
          indiciaFns.controlFail(el, 'Unknown Google layer subtype ' + subType);
        }
        baseLayers[title] = L.gridLayer.googleMutant({
          type: subType
        });
      } else if (this.type === 'WMS') {
        wmsOptions = {
          format: 'image/png'
        };
        if (typeof this.config.wmsOptions !== 'undefined') {
          $.extend(wmsOptions, this.config.wmsOptions);
        }
        baseLayers[title] = L.tileLayer.wms(this.config.sourceUrl, wmsOptions);
      } else {
        indiciaFns.controlFail(el, 'Unknown baseLayerConfig type ' + this.type);
      }
    });
    return baseLayers;
  }

  /**
   * Declare public methods.
   */
  methods = {
    /**
     * Initialise the idcLeafletMap plugin.
     *
     * @param array options
     */
    init: function init(options) {
      var el = this;
      var baseMaps;
      var overlays = {};
      var layersControl;
      el.outputLayers = {};

      indiciaFns.registerOutputPluginClass('idcLeafletMap');
      el.settings = $.extend({}, defaults);
      el.callbacks = callbacks;
      // Apply settings passed in the HTML data-* attribute.
      if (typeof $(el).attr('data-idc-config') !== 'undefined') {
        $.extend(el.settings, JSON.parse($(el).attr('data-idc-config')));
      }
      // Map embeds linked sources in layerConfig. Need to add them to settings
      // in their own right so that maps can be treated same as other data
      // consumers.
      el.settings.source = {};
      $.each(el.settings.layerConfig, function eachLayer() {
        if (this.type !== 'WMS') {
          el.settings.source[this.source] = typeof this.title === 'undefined' ? this.source : this.title;
        }
      });
      // Apply settings passed to the constructor.
      if (typeof options !== 'undefined') {
        $.extend(el.settings, options);
      }
      // Store initial viewport as configured, before being affected by cookies.
      el.settings.configuredLat = el.settings.initialLat;
      el.settings.configuredLng = el.settings.initialLng;
      el.settings.configuredZoom = el.settings.initialZoom;
      // Disable cookies unless id specified.
      if (!el.id || !$.cookie) {
        el.settings.cookies = false;
      }
      // Apply settings stored in cookies.
      if (el.settings.cookies) {
        $.extend(el.settings, loadSettingsFromCookies(el, [
          'initialLat',
          'initialLng',
          'initialZoom',
          'baseLayer',
          'layerState'
        ]));
        if (Math.abs(el.settings.initialLat) > 90) {
          el.settings.initialLat = el.settings.configuredLat;
        }
        if (Math.abs(el.settings.initialLng) > 180) {
          el.settings.initialLng = el.settings.configuredLng;
        }
      }
      el.map = L.map(el.id).setView([el.settings.initialLat, el.settings.initialLng], el.settings.initialZoom)
        .on('click', function() {
          // Clear filters on any sources that resulted from the click on a
          // feature, unless it only just happened.
          if (!justClickedOnFeature) {
            sourcesToReloadOnMapClick.forEach(function eachSrc(src) {
              src.populate(false);
            });
            sourcesToReloadOnMapClick = [];
          }
          justClickedOnFeature = false;
        });
      baseMaps = getBaseMaps(el);
      if (baseMaps.length === 0) {
        indiciaFns.controlFail(el, 'No base maps configured for map');
      }
      // Add the active base layer to the map.
      if (baseMaps[el.settings.baseLayer]) {
        baseMaps[el.settings.baseLayer].addTo(el.map);
      } else {
        // Fallback if layer missing, e.g. due to out of date cookie.
        baseMaps[Object.keys(baseMaps)[0]].addTo(el.map);
      }
      $.each(el.settings.layerConfig, function eachLayer(id, layer) {
        var group;
        var wmsOptions;
        if (layer.type === 'WMS') {
          wmsOptions = {
            layers: layer.layer,
            format: 'image/png',
            transparent: true
          };
          if (typeof layer.wmsOptions !== 'undefined') {
            $.extend(wmsOptions, layer.wmsOptions);
          }
          group = L.tileLayer.wms(layer.sourceUrl, wmsOptions);
        } else {
          if (layer.type && layer.type === 'heat') {
            group = L.heatLayer([], $.extend({ radius: 10 }, layer.style ? layer.style : {}));
          } else {
            group = L.featureGroup();
            // If linked to rows in a dataGrid or cardGallery, then clicking on
            // a feature can temporarily filter the grid.
            if (typeof el.settings.showSelectedRow !== 'undefined') {
              // Use preclick event as this must come before the map click for
              // the filter reset to work at correct time.
              group.on('preclick', function clickFeature(e) {
                if (e.layer.options.filterField && e.layer.options.filterValue) {
                  // Since we are applying a new set of filters, we can clear the
                  // list of sources that needed to be reloaded next time the map
                  // was clicked.
                  sourcesToReloadOnMapClick = [];
                  $.each($('#' + el.settings.showSelectedRow)[0].settings.source, function eachSrc(src) {
                    var source = indiciaData.esSourceObjects[src];
                    var origFilter;
                    if (!source.settings.filterBoolClauses) {
                      source.settings.filterBoolClauses = { };
                    }
                    if (!source.settings.filterBoolClauses.must) {
                      source.settings.filterBoolClauses.must = [];
                    }
                    // Keep the old filter.
                    origFilter = $.extend(true, {}, source.settings.filterBoolClauses);
                    source.settings.filterBoolClauses.must.push({
                      query_type: 'term',
                      field: e.layer.options.filterField,
                      value: e.layer.options.filterValue
                    });
                    // Temporarily populate just the linked grid with the
                    // filter to show the selected row.
                    source.populate(false, $('#' + el.settings.showSelectedRow)[0]);
                    // Map click will later clear this filter.
                    sourcesToReloadOnMapClick.push(source);
                    // Tell the map click not to clear this filter just yet.
                    justClickedOnFeature = true;
                    // Reset the old filter.
                    source.settings.filterBoolClauses = origFilter;
                  });
                }
              });
            }
          }
          group.on('add', function addEvent() {
            onAddLayer(el, this, id);
          });
          group.on('remove', function removeEvent() {
            onRemoveLayer(el, id);
          });
        }
        // Leaflet wants layers keyed by title.
        overlays[typeof layer.title === 'undefined' ? id : layer.title] = group;
        // Plugin wants them keyed by source ID.
        el.outputLayers[id] = group;
        // Add the group to the map
        if (layerEnabled(el, id, this)) {
          group.addTo(el.map);
        }
      });
      layersControl = L.control.layers(baseMaps, overlays);
      layersControl.addTo(el.map);
      el.map.on('zoomend', function zoomEnd() {
        if (selectedRowMarker !== null) {
          ensureFeatureClear(el, selectedRowMarker);
        }
      });
      el.map.on('moveend', function moveEnd() {
        $.each(callbacks.moveend, function eachCallback() {
          this(el);
        });
        if (el.settings.cookies) {
          indiciaFns.cookie('initialLat-' + el.id, el.map.getCenter().lat, { expires: 3650 });
          indiciaFns.cookie('initialLng-' + el.id, el.map.getCenter().lng, { expires: 3650 });
          indiciaFns.cookie('initialZoom-' + el.id, el.map.getZoom(), { expires: 3650 });
        }
      });
      if (el.settings.cookies) {
        el.map.on('baselayerchange', function baselayerchange(layer) {
          indiciaFns.cookie('baseLayer-' + el.id, layer.name, { expires: 3650 });
        });
      }
    },

    /*
     * Populate the map with Elasticsearch response data.
     *
     * @param obj sourceSettings
     *   Settings for the data source used to generate the response.
     * @param obj response
     *   Elasticsearch response data.
     * @param obj data
     *   Data sent in request.
     */
    populate: function populate(sourceSettings, response) {
      var el = this;
      var layers = getLayersForSource(el, sourceSettings.id);
      var bounds;
      var fillOpacity = 0.2;
      var geomCounts = {};
      $.each(layers, function eachLayer() {
        if (this.clearLayers) {
          this.clearLayers();
        } else {
          this.setLatLngs([]);
        }
      });
      // Are there document hits to map?
      $.each(response.hits.hits, function eachHit(i) {
        var latlon = this._source.location.point.split(',');
        var label = typeof this._source.taxon === 'undefined' || typeof this._source.event === 'undefined'
          ? null
          : indiciaFns.fieldConvertors.taxon_label(this._source) + '<br/>' +
          this._source.event.recorded_by + '<br/>' +
          indiciaFns.fieldConvertors.event_date(this._source);
        // Repeat records on same grid square should be progressively more
        // transparent so they don't block the background out.
        if (typeof geomCounts[this._source.location.point] === 'undefined') {
          geomCounts[this._source.location.point] = 0;
        }
        geomCounts[this._source.location.point]++;
        fillOpacity = 0.3 / Math.pow(geomCounts[this._source.location.point], 2.5);
        addFeature(el, sourceSettings.id, latlon, this._source.location.geom, this._source.location.coordinate_uncertainty_in_meters, fillOpacity, '_id', this._id, label);
      });
      // Are there aggregations to map?
      if (typeof response.aggregations !== 'undefined') {
        if (sourceSettings.mode === 'mapGeoHash') {
          mapGeoHashAggregation(el, response, sourceSettings);
        } else if (sourceSettings.mode === 'mapGridSquare') {
          mapGridSquareAggregation(el, response, sourceSettings);
        }
      }
      if (sourceSettings.initialMapBounds && !el.settings.initialBoundsSet && layers.length > 0 && layers[0].getBounds) {
        bounds = layers[0].getBounds();
        if (bounds.isValid()) {
          el.map.fitBounds(layers[0].getBounds().pad(0.25));
          el.settings.initialBoundsSet = true;
        }
      }
    },

    /**
     * Binds to dataGrid and cardGallery callbacks.
     *
     * Binds to event handlers for row click (to select feature) and row double
     * click (to also zoom in).
     */
    bindControls: function bindControls() {
      var el = this;
      var settings = $(el)[0].settings;
      var controlClass;
      if (typeof settings.showSelectedRow !== 'undefined') {
        if ($('#' + settings.showSelectedRow).length === 0) {
          indiciaFns.controlFail(el, 'Invalid grid ID in @showSelectedRow parameter');
        }
        controlClass = $('#' + settings.showSelectedRow).data('idc-class');
        $('#' + settings.showSelectedRow)[controlClass]('on', 'itemSelect', function onItemSelect(tr) {
          rowSelected(el, tr, false);
        });
        $('#' + settings.showSelectedRow)[controlClass]('on', 'itemDblClick', function onItemDblClick(tr) {
          rowSelected(el, tr, true);
        });
      }
    },

    /**
     * Adds a list of geoms to the map to display the boundary for report data.
     */
    addBoundaryGroup: function addBoundaryGroup(geoms, style) {
      var featureList = [];
      var group;
      geoms.forEach(function(geom) {
        featureList.push(getFeatureFromGeom(geom, style).obj);
      });
      group = L.featureGroup(featureList)
        .addTo(this.map);
      this.map.fitBounds(group.getBounds(), { maxZoom: 14 });
    },

    /**
     * Clears the selected feature boundary (e.g. a selected location).
     */
    clearFeature: function clearFeature() {
      if (selectedFeature) {
        selectedFeature.removeFrom(this.map);
        selectedFeature = null;
      }
    },

    /**
     * Shows a selected feature boundary (e.g. a selected location).
     */
    showFeature: function showFeature(geom, zoom) {
      if (selectedFeature) {
        selectedFeature.removeFrom(this.map);
        selectedFeature = null;
      }
      selectedFeature = showFeatureWkt(this, geom, zoom, 14, {
        color: '#3333DD',
        fillColor: '#4444CC',
        fillOpacity: 0.05
      });
    },

    /**
     * Reset to the initial viewport (pan/zoom).
     */
    resetViewport: function resetViewport() {
      this.map.setView([this.settings.configuredLat, this.settings.configuredLng], this.settings.configuredZoom);
    },

    /**
     * Hook up event handlers.
     */
    on: function on(event, handler) {
      if (typeof callbacks[event] === 'undefined') {
        indiciaFns.controlFail(this, 'Invalid event handler requested for ' + event);
      }
      callbacks[event].push(handler);
    },

    /**
     * If using auto-sized grids, size of the grid recommended for current map zoom.
     *
     * Value in m.
     */
    getAutoSquareSize: function getAutoSquareSize() {
      var kms = autoGridSquareKms(this);
      return kms * 1000;
    },

    /**
     * If using auto-sized grids, name of the field holding the grid coordinates appropriate to current map zoom.
     *
     * Value in km.
     */
    getAutoSquareField: function getAutoSquareField() {
      var kms = autoGridSquareKms(this);
      return 'location.grid_square.' + kms + 'km.centre';
    },

    /**
     * Maps repopulate from a source only if layer enabled.
     */
    getNeedsPopulation: function getNeedsPopulation(source) {
      var needsPopulation = false;
      var el = this;
      $.each(getLayersForSource(el, source.settings.id), function eachLayer() {
        needsPopulation = el.map.hasLayer(this);
        // can abort loop once we have a hit.
        return !needsPopulation;
      });
      return needsPopulation;
      // @todo Disable layer if source linked to grid and no row selected.
    },

    /**
     * Exposes the leaflet invalidateSize method which can be used to force
     * a map repaint - especially valuable if the map is initialised when
     * not visible. In that case, call the method once the map is made visible.
     */
    invalidateSize: function invalidateSize() {
      this.map.invalidateSize();
    }
  };

  /**
   * Extend jQuery to declare leafletMap method.
   */
  $.fn.idcLeafletMap = function buildLeafletMap(methodOrOptions) {
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
      $.error('Method ' + methodOrOptions + ' does not exist on jQuery.idcLeafletMap');
      return true;
    });
    // If the method has no explicit response, return this to allow chaining.
    return typeof result === 'undefined' ? this : result;
  };

  /**
   * Loads the boundary defined by a report filter.
   *
   * Can be either from a location ID, or a search area polygon. Must be run
   * after the map has initialised.
   */
  indiciaFns.loadReportBoundaries = function() {
    if (indiciaData.reportBoundaries) {
      $.each($('.idc-leafletMap'), function eachMap() {
        var map = this;
        if (!map.settings.initialBoundsSet) {
          $(map).idcLeafletMap('addBoundaryGroup', indiciaData.reportBoundaries, {
            color: '#3333DD',
            fillColor: '#4444CC',
            fillOpacity: 0.05
          });
          map.settings.initialBoundsSet = true;
        }
      });
    }
  }
}());
