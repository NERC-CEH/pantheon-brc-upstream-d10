
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
 * @requires OpenLayers/Control.js
 */

(function ($) {
  'use strict';

  /**
   * Class: OpenLayers.Control.IndiciaGraticule
   * The Graticule displays a grid of latitude/longitude lines reprojected on
   * the map.
   *
   * Inherits from:
   *  - <OpenLayers.Control>
   *
   */
  OpenLayers.Control.IndiciaGraticule = OpenLayers.Class(OpenLayers.Control, {

    /**
     * APIProperty: autoActivate
     * {Boolean} Activate the control when it is added to a map. Default is
     *     true.
     */
    autoActivate: true,

    /**
     * APIProperty: intervals
     * {Array(Float)} A list of possible graticule widths in degrees. Can also be configured to
     * contain an object with x and y properties, each holding the array of possible graticule widths
     * for that dimension, e.g. {"x":[ 50000,5000,500,50 ],"y":[ 100000,10000,1000,100 ]}
     */
    intervals: [100000, 10000, 1000, 100],

    /**
     * APIProperty: intervalColours
     * {Array(string)} A list of possible CSS colours corresponding to the lines drawn for each graticule width.
     */
    intervalColours: ['#777777', '#777777', '#777777', '#999999', '#BBBBBB'],

    /**
     * APIProperty: intervalLineWidth
     * {Array(string)} A list of possible CSS widths corresponding to the lines drawn for each graticule width.
     */
    intervalLineWidth: [3, 2, 1, 1, 1],

    /**
     * APIProperty: intervalLineOpacity
     * {Array(string)} A list of possible CSS stroke opacities corresponding to the lines drawn for each graticule
     * width.
     */
    intervalLineOpacity: [1.0, 1.0, 1.0, 0.5, 0.3],

    /**
     * APIProperty: displayInLayerSwitcher
     * {Boolean} Allows the Graticule control to be switched on and off by
     *     LayerSwitcher control. Defaults is true.
     */
    displayInLayerSwitcher: true,

    /**
     * APIProperty: visible
     * {Boolean} should the graticule be initially visible (default=true)
     */
    visible: true,

    /**
     * APIProperty: projection
     * {Boolean} name of the projection to use for the output grid
     */
    projection: 'EPSG:27700',

    /**
     * APIProperty: bounds
     * {Boolean} Bounding box (W,S,E,N) of the graticule overlay grid
     */
    bounds: [0, 0, 700000, 1300000],

    /**
     * APIProperty: numPoints
     * {Integer} The number of points to use in each graticule line.  Higher
     * numbers result in a smoother curve for projected maps
     */
    numPoints: 50,

    /**
     * APIProperty: targetSize
     * {Integer} The maximum size of the grid in pixels on the map
     */
    targetSize: 200,

    /**
     * APIProperty: layerName
     * {String} The name to be displayed in the layer switcher, default is set
     *     by {<OpenLayers.Lang>}.
     */
    layerName: null,

    /**
     * APIProperty: lineStyle
     * {style} the style used to render lines
     */
    lineStyle: {
      strokeColor: '#222',
      strokeWidth: 1,
      strokeOpacity: 0.4
    },

    /**
     * Property: gratLayer
     * {OpenLayers.Layer.Vector} vector layer used to draw the graticule on
     */
    gratLayer: null,

    /**
     * Constructor: OpenLayers.Control.Graticule
     * Create a new graticule control to display a grid of latitude longitude
     * lines.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function(options) {
      options = options || {};
      options.layerName = options.layerName || OpenLayers.i18n('Map grid');
      OpenLayers.Control.prototype.initialize.apply(this, [options]);
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
      this.deactivate();
      OpenLayers.Control.prototype.destroy.apply(this, arguments);
      if (this.gratLayer) {
          this.gratLayer.destroy();
          this.gratLayer = null;
      }
    },

    /**
     * Method: draw
     *
     * initializes the graticule layer and does the initial update
     *
     * Returns:
     * {DOMElement}
     */
    draw: function() {
      OpenLayers.Control.prototype.draw.apply(this, arguments);
      if (!this.gratLayer) {
        this.gratLayer = new OpenLayers.Layer.Vector(this.layerName, {
          visibility: this.visible,
          displayInLayerSwitcher: this.displayInLayerSwitcher
        });
      }
      return this.div;
    },

     /**
     * APIMethod: activate
     */
    activate: function() {
      if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
        this.map.addLayer(this.gratLayer);
        this.map.events.register('moveend', this, this.update);
        this.update();
        return true;
      } else {
        return false;
      }
    },

    /**
     * APIMethod: deactivate
     */
    deactivate: function() {
      if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
        this.map.events.unregister('moveend', this, this.update);
        this.map.removeLayer(this.gratLayer);
        return true;
      }
      return false;
    },

    buildGrid: function(xInterval, yInterval, mapCenterLL, llProj, mapProj, gridStyle) {
      var style = $.extend({}, this.lineStyle, gridStyle);
      var mapBounds = this.map.getExtent();
      var iter = 0;
      var mapXY;
      var centerLonPoints;
      var centerLatPoints;
      var newPoint;
      var lat;
      var lon;
      var pointList;
      var latStart;
      var lonStart;
      var latEnd;
      var lonEnd;
      var latDelta;
      var lonDelta;
      // Round the LL center to an even number based on the interval.
      mapCenterLL.x = Math.floor(mapCenterLL.x / xInterval) * xInterval;
      mapCenterLL.y = Math.floor(mapCenterLL.y / yInterval) * yInterval;
      // TODO adjust for minutes/seconds?

      /* The following 2 blocks calculate the nodes of the grid along a
       * line of constant longitude (then latitiude) running through the
       * center of the map until it reaches the map edge.  The calculation
       * goes from the center in both directions to the edge.
       */
      //get the central longitude line, increment the latitude

      centerLonPoints = [mapCenterLL.clone()];
      newPoint = mapCenterLL.clone();

      do {
        newPoint = newPoint.offset(new OpenLayers.Pixel(0, yInterval));
        mapXY = OpenLayers.Projection.transform(newPoint.clone(), llProj, mapProj);
        centerLonPoints.unshift(newPoint);
      } while (mapBounds.top >= mapXY.y && ++iter < 1000);
      newPoint = mapCenterLL.clone();
      do {
        newPoint = newPoint.offset(new OpenLayers.Pixel(0,-yInterval));
        mapXY = OpenLayers.Projection.transform(newPoint.clone(), llProj, mapProj);
        centerLonPoints.push(newPoint);
      } while (mapBounds.bottom <= mapXY.y && ++iter < 1000);

      // get the central latitude line, increment the longitude.
      iter = 0;
      centerLatPoints = [mapCenterLL.clone()];
      newPoint = mapCenterLL.clone();
      do {
        newPoint = newPoint.offset(new OpenLayers.Pixel(-xInterval, 0));
        mapXY = OpenLayers.Projection.transform(newPoint.clone(), llProj, mapProj);
        centerLatPoints.unshift(newPoint);
      } while (mapBounds.left <= mapXY.x && ++iter < 1000);
      newPoint = mapCenterLL.clone();
      do {
        newPoint = newPoint.offset(new OpenLayers.Pixel(xInterval, 0));
        mapXY = OpenLayers.Projection.transform(newPoint.clone(), llProj, mapProj);
        centerLatPoints.push(newPoint);
      } while (mapBounds.right >= mapXY.x && ++iter < 1000);

      // Now generate a line for each node in the central lat and lon lines.
      // First loop over constant longitude.
      var lines = [];
      for (var i = 0; i < centerLatPoints.length; ++i) {
        lon = centerLatPoints[i].x;
        if (lon<this.bounds[0] || lon > this.bounds[2]) {  //latitudes only valid between -90 and 90
            continue;
        }
        pointList = [];
        latEnd = Math.min(centerLonPoints[0].y, this.bounds[3]);
        latStart = Math.max(centerLonPoints[centerLonPoints.length - 1].y, this.bounds[1]);
        latDelta = (latEnd - latStart) / this.numPoints;
        lat = latStart;
        for (var j = 0; j <= this.numPoints; ++j) {
          var gridPoint = new OpenLayers.Geometry.Point(lon, lat);
          gridPoint.transform(llProj, mapProj);
          pointList.push(gridPoint);
          lat += latDelta;
        }
        var geom = new OpenLayers.Geometry.LineString(pointList);
        lines.push(new OpenLayers.Feature.Vector(geom, null, style));
      }

      // Now draw the lines of constant latitude.
      for (var j = 0; j < centerLonPoints.length; ++j) {
        lat = centerLonPoints[j].y;
        if (lat<this.bounds[1] || lat>this.bounds[3]) {
            continue;
        }
        pointList = [];
        lonStart = Math.max(centerLatPoints[0].x, this.bounds[0]);
        lonEnd = Math.min(centerLatPoints[centerLatPoints.length - 1].x, this.bounds[2]);
        lonDelta = (lonEnd - lonStart)/this.numPoints;
        lon = lonStart;
        for (var i = 0; i <= this.numPoints; ++i) {
          var gridPoint = new OpenLayers.Geometry.Point(lon, lat);
          gridPoint.transform(llProj, mapProj);
          pointList.push(gridPoint);
          lon += lonDelta;
        }
        var geom = new OpenLayers.Geometry.LineString(pointList);
        lines.push(new OpenLayers.Feature.Vector(geom, null, style));
      }
      this.gratLayer.addFeatures(lines);
    },

    /**
     * Method: update
     *
     * calculates the grid to be displayed and actually draws it
     *
     * Returns:
     * {DOMElement}
     */
    update: function update() {
      // Wait for the map to be initialized before proceeding.
      var mapBounds = this.map.getExtent();
      var width;
      // Get the projection objects required.
      var llProj = new OpenLayers.Projection(this.projection);
      var mapProj = this.map.getProjectionObject();
      var mapRes = this.map.getResolution();
      // Get the map center in chosen projection.
      // Lon and lat here are really map x and y.
      var mapCenter = this.map.getCenter();
      var mapCenterLL = new OpenLayers.Pixel(mapCenter.lon, mapCenter.lat);
      // Find lat/lon interval that results in a grid of less than the target size.
      var testSq = this.targetSize * mapRes;
      var xIntervals;
      var yIntervals;
      var xDelta;
      var yDelta;
      var p1;
      var p2;
      var distSq;
      var i;
      var smallestLayerIdx;

      if (!mapBounds) {
        return;
      }

      // Clear out the old grid.
      this.gratLayer.destroyFeatures();
      OpenLayers.Projection.transform(mapCenterLL, mapProj, llProj);

      /* This block of code determines the lon/lat interval to use for the
       * grid by calculating the diagonal size of one grid cell at the map
       * center.  Iterates through the intervals array until the diagonal
       * length is less than the targetSize option.
       */
      testSq *= testSq;   //compare squares rather than doing a square root to save time
      // can either be a single array for both dims, or 2 arrays in the intervals
      if ($.isArray(this.intervals[0])) {
        xIntervals = this.intervals[0];
        yIntervals = this.intervals[1];
      } else {
        xIntervals = this.intervals;
        yIntervals = this.intervals;
      }
      for (i = 0; i < xIntervals.length; ++i) {
        xDelta = xIntervals[i] / 2;
        yDelta = yIntervals[i] / 2;
        p1 = mapCenterLL.offset(new OpenLayers.Pixel(-xDelta, -yDelta));  //test coords in EPSG:4326 space
        p2 = mapCenterLL.offset(new OpenLayers.Pixel(xDelta, yDelta));
        OpenLayers.Projection.transform(p1, llProj, mapProj); // convert them back to map projection
        OpenLayers.Projection.transform(p2, llProj, mapProj);
        distSq = ((p1.x - p2.x) * (p1.x - p2.x)) + ((p1.y - p2.y) * (p1.y - p2.y));
        smallestLayerIdx = i;
        if (distSq <= testSq) {
          break;
        }
      }
      for (i = smallestLayerIdx; i >= 0; i--) {
        // Ensure lines don't thicken too much.
        width = this.intervalLineWidth[i] * (this.map.zoom / 18);
        this.buildGrid(xIntervals[i], yIntervals[i], mapCenterLL.clone(), llProj, mapProj, {
          strokeColor: this.intervalColours[i],
          strokeOpacity: this.intervalLineOpacity,
          strokeWidth: width
        });
      }
    },

    CLASS_NAME: 'OpenLayers.Control.Graticule'
  });
})(jQuery);
