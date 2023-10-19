/**
 * @file
 * Place search for Luxembourg using ACT web services.
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
 */

/**
 * A driver class to allow the georeference_lookup control to interface with the
 * service at geoportal.lu.
 */

var Georeferencer;

(function ($) {
  Georeferencer = function georef(mapdiv, callback) {
    this.georeference = function(searchtext) {
      var request = indiciaData.proxyUrl +
          '?url=https://apiv3.geoportail.lu/fulltextsearch&query=' + searchtext;
      $.getJSON(request, function onResponse(data) {
        // an array to store the responses in the required country
        var places = [];
        var converted = {};
        jQuery.each(data.features, function eachFeature() {
          converted = {
            name: this.properties.label,
            display: this.properties.label + ' (' + this.properties.layer_name + ')',
            epsg: 4326,
            obj: this
          };
          if (Array.isArray(this.bbox) && this.bbox.length === 4) {
            converted.centroid = {
              x: (this.bbox[0] + this.bbox[2]) / 2,
              y: (this.bbox[1] + this.bbox[3]) / 2
            };
            converted.boundingBox = {
              southWest: {
                x: this.bbox[0],
                y: this.bbox[1]
              },
              northEast: {
                x: this.bbox[2],
                y: this.bbox[3]
              }
            };
          } else if (this.geometry.coordinates && mapdiv.settings.searchDisplaysPoint) {
            converted.centroid = {
              x: this.geometry.coordinates[0],
              y: this.geometry.coordinates[1]
            };
            // Just take a guess at the bbox.
            converted.boundingBox = {
              southWest: {
                x: this.geometry.coordinates[0] - 0.01,
                y: this.geometry.coordinates[1] - 0.01
              },
              northEast: {
                x: this.geometry.coordinates[0] + 0.01,
                y: this.geometry.coordinates[1] + 0.01
              }
            };
          } else {
            // No centroid available so have to skip.
            return true;
          }
          places.push(converted);
        });
        callback(mapdiv, places);
      });
    };
  };
}) (jQuery);

/**
 * Default settings for this driver.
 */
jQuery.fn.indiciaMapPanel.georeferenceDriverSettings = {
};
