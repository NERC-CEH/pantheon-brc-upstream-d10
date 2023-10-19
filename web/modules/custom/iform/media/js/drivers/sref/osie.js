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
 * A driver to provide OSGB specific functions.
 */

if (typeof indiciaData.srefHandlers==="undefined") {
  indiciaData.srefHandlers={};
}

indiciaData.srefHandlers['osie'] = {

  srid: 29901,

  returns: ['wkt', 'precisions', 'gridNotation'],

  /**
   * Receives a point after a click on the map and converts to a WKT grid square.
   */
  pointToWkt: function(point, precisionInfo) {
    var sqrSize = Math.pow(10, (10-precisionInfo.precision)/2);
    var x=Math.floor(point.x/sqrSize)*sqrSize,
        y=Math.floor(point.y/sqrSize)*sqrSize;
    if (x>=0 && x<=500000-sqrSize && y>=0 && y<=500000-sqrSize) {
      return 'POLYGON(('+
        x+' '+y+','+
        (x+sqrSize)+' '+y+','+
        (x+sqrSize)+' '+(y+sqrSize)+','+
        x+' '+(y+sqrSize)+','+
        x+' '+y+
        '))';
    } else {
      return 'Out of bounds';
    }
  },

  getPrecisionInfo: function(accuracy) {
    switch (accuracy) {
      case 2: return {
        display: '10km',
        metres: 10000,
        type: 'square'
      };
      case 3: return {
        display:'2km',
        metres:2000,
        type: 'square'
      };
      case 4: return {
        display:'1km',
        metres:1000,
        type: 'square'
      };
      case 6: return {
        display:'100m',
        metres:100, type: 'square'};
      case 8: return {
        display:'10m',
        metres:10,
        type: 'square'
      };
      case 10: return {
        display:'1m',
        metres:1,
        type: 'square'
      };
    }
    return false;
  },

  valueToAccuracy: function(value) {
    // OSIE grid ref length correspond exactly to the scale of accuracy used on the warehouse, excluding the 100km square letter
    return value.length-1;
  },

  /**
   * Converts an easting northing point to a grid ref.
   * Thanks to Chris Veness, http://www.movable-type.co.uk/scripts/latlong-gridref.html, for the original script.
   */
  pointToGridNotation: function(point, digits) {
    var e=point.x, n=point.y, l, letter, e100k, n100k;
    if (e==NaN || n==NaN) return '??';

    // get the 100km-grid indices
    e100k = Math.floor(e/100000), n100k = Math.floor(n/100000);

    if (e100k<0 || e100k>5 || n100k<0 || n100k>5) return '';

    // translate this into numeric equivalents of the grid letter
    l = ((4 - (n100k % 5)) * 5) + (e100k % 5);

    // compensate for skipped 'I'
    if (l > 7) {
      l++;
    }
    letter = String.fromCharCode(l+'A'.charCodeAt(0));

    // strip 100km-grid indices from easting & northing, and reduce precision
    e = Math.floor((e%100000)/Math.pow(10, 5-digits/2));
    n = Math.floor((n%100000)/Math.pow(10, 5-digits/2));

    var gridRef = letter + e.padLz(digits/2) + n.padLz(digits/2);

    return gridRef;
  }
};

/** Pads a number with sufficient leading zeros to make it w chars wide */
if (typeof Number.prototype.padLz === 'undefined') {
  Number.prototype.padLz = function(w) {
    var n = this.toString();
    var l = n.length;
    for (var i=0; i<w-l; i++) n = '0' + n;
    return n;
  }
}