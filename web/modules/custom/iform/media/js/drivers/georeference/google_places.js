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
 * A driver class to allow the georeference_lookup control to interface with
 * the Google Places API text search.
 */

var Georeferencer;

(function ($) {
  Georeferencer = function georefObj(mapdiv, callback) {
    var settings = mapdiv.georefOpts;
    var tokens = [];
    var near;
    if (settings.google_api_key.length === 0) {
      alert('Incorrect configuration - Google API Key not specified.');
      throw new Error('Incorrect configuration - Google API Key not specified.');
    }
    this.mapdiv = mapdiv;
    // make the place search near the chosen location
    if (this.mapdiv.georefOpts.georefPreferredArea !== '') {
      tokens.push(this.mapdiv.georefOpts.georefPreferredArea);
    }
    if (this.mapdiv.georefOpts.georefCountry !== '') {
      tokens.push(this.mapdiv.georefOpts.georefCountry);
    }
    near = tokens.join(', ');

    this.georeference = function doGeoref(searchtext) {
      $.ajax({
        dataType: 'json',
        url: indiciaData.proxyUrl,
        data: {
          url: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
          key: settings.google_api_key,
          query: searchtext + ', ' + near,
          sensor: 'false'
        },
        success: function handleResponse(data) {
          // an array to store the responses in the required country, because Google search will not limit to a country
          var places = [];
          var converted = {};
          jQuery.each(data.results, function handlePlaceInResponse() {
            converted = {
              name: this.name,
              display: this.name + ', ' + this.formatted_address,
              centroid: {
                x: this.geometry.location.lng,
                y: this.geometry.location.lat
              },
              obj: this
            };
            // create a nominal bounding box
            if (typeof this.geometry.viewport !== 'undefined') {
              converted.boundingBox = {
                southWest: {
                  x: this.geometry.viewport.southwest.lng,
                  y: this.geometry.viewport.southwest.lat
                },
                northEast: {
                  x: this.geometry.viewport.northeast.lng,
                  y: this.geometry.viewport.northeast.lat
                }
              };
            } else {
              converted.boundingBox = {
                southWest: {
                  x: this.geometry.location.lng - 0.01,
                  y: this.geometry.location.lat - 0.01
                },
                northEast: {
                  x: this.geometry.location.lng + 0.01,
                  y: this.geometry.location.lat + 0.01
                }
              };
            }
            places.push(converted);
          });
          callback(mapdiv, places);
        }
      });
    };
  };
}) (jQuery);

/**
 * Default this.mapdiv.georefOpts for this driver
 */
jQuery.fn.indiciaMapPanel.georeferenceDriverSettings = {
  georefPreferredArea: '',
  georefCountry: 'UK',
  google_api_key: ''
};
