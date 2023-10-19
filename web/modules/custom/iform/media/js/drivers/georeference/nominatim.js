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
 * A driver class to allow the georeference_lookup control to interface with the
 * service at nominatim.openstreetmap.org.
 */

(function enclose($) {
  window.Georeferencer = function georeferencer(mapdiv, callback) {
    var tokens = [];
    var near;
    this.mapdiv = mapdiv;
    // Make the place search near the chosen location.
    if (this.mapdiv.georefOpts.georefPreferredArea !== '') {
      tokens.push(this.mapdiv.georefOpts.georefPreferredArea.toLowerCase());
    }
    if (this.mapdiv.georefOpts.georefCountry !== '') {
      tokens.push(this.mapdiv.georefOpts.georefCountry.toLowerCase());
    }
    if (tokens.indexOf('gb') > -1 && tokens.indexOf('united kingdom') > -1) {
      // Nominatim has a quirk whereby if both GB and United Kingdom appear in the
      // search term, everything is filtered out. If either is used on it's own,
      // that's fine. If both are present we retain the more specific GB.
      tokens.splice(tokens.indexOf('united kingdom'), 1);
    }
    near = tokens.join(', ');

    this.georeference = function georeference(searchtext) {
      var fullsearchtext = near ? searchtext + ', ' + near : searchtext;
      var request = indiciaData.proxyUrl +
          '?url=https://nominatim.openstreetmap.org?format=json&q=' + fullsearchtext;
      $.getJSON(request, function handleResponse(data) {
        // an array to store the responses in the required country
        var places = [];
        var converted = {};
        jQuery.each(data, function eachRow(i, place) {
          converted = {
            name: place.display_name,
            display: place.display_name,
            centroid: {
              x: place.lon,
              y: place.lat
            },
            boundingBox: {
              southWest: {
                x: place.boundingbox[2],
                y: place.boundingbox[1]
              },
              northEast: {
                x: place.boundingbox[3],
                y: place.boundingbox[0]
              }
            },
            obj: place
          };
          places.push(converted);
        });
        callback(mapdiv, places);
      });
    };
  };
}(jQuery));

/**
 * Default this.mapdiv.georefOpts for this driver
 */
jQuery.fn.indiciaMapPanel.georeferenceDriverSettings = {
  georefPreferredArea: '',
  georefCountry: 'UK'
};
