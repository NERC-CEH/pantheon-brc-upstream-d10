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
 */

/**
 * A driver to provide EPSG:2169 (LUREF) specific functions.
 */

if (typeof indiciaData.srefHandlers==="undefined") {
  indiciaData.srefHandlers={};
}

indiciaData.srefHandlers['2169'] = {

  srid: 2169,

  returns: ['wkt', 'precisions', 'gridNotation'],

  /**
   * Receives a point after a click on the map and converts to a WKT point.
   */
  pointToWkt: function(point) {
    return 'POINT(' + point.x + ' ' + point.y + ')';
  },

  getPrecisionInfo: function() {
    return {
      display: 'Easting/Northing',
      metres: 1,
      type: 'coordinate'
    };
  },

  valueToAccuracy: function() {
    // accuracy value 10 corresponds to 1m.
    return 10;
  },

  /**
   * Format an x, y into a LUREF
   */
  pointToGridNotation: function(point, digits) {
    var precision = 5 - (digits/2),
        x = Math.floor(point.x / Math.pow(10,precision)),
        y = Math.floor(point.y / Math.pow(10,precision));
    if(precision) {
    	x = (x + 0.5) * Math.pow(10,precision);
    	y = (y + 0.5) * Math.pow(10,precision);
    }
    return x + ', ' + y;
  }
};