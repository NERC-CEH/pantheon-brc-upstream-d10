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

(function ($) {
  'use strict';

  // Private method
  function usePointFromPostcode(postcode, callbackFunction) {
    $.ajax({
      dataType: 'json',
      url: $.fn.indiciaMapPanel.georeferenceLookupSettings.proxy,
      data: {
        url: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
        key: indiciaData.google_api_key,
        query: postcode,
        sensor: 'false'
      },
      success: function (data) {
        var done = false;
        $.each(data.results, function () {
          if ($.inArray('postal_code', this.types) !== -1) {
            callbackFunction(this);
            done = true;
            return false;
          }
          return true;
        });
        if (!done) {
          alert('Postcode not found!');
        }
      }
    });
  }

  /**
  * Function to decode an entered postcode using the Google Places API
  * to get locality information and lat/long info.
  * postcodeField - The id of the control which contains the postcode
  * srefField - Optional, the id of the control which receives the lat/long
  * systemField - Optional, the id of the control identifying the system of the spatial reference
  * geomField - Optional, the id of the control which receives the geometry (WKT).
  * addressField - Optional, the id of the control which receives the address locality information.
  */
   indiciaFns.decodePostcode = function (addressField) {
    var postcode = $('#imp-postcode').val();
    var $srefCtrl = $('#imp-sref');
    var $srefSystemCtrl = $('#imp-sref-system');
    if (postcode !== '') {
      usePointFromPostcode(
          postcode,
          function (place) {
            var point = new OpenLayers.Geometry.Point(place.geometry.location.lng, place.geometry.location.lat);
            // Force sref to update map.
            indiciaData.spatialRefWhenSrefInputFocused = '';
            if (addressField !== '') {
              document.getElementById(addressField).value = place.formatted_address;
            }

            if (indiciaData.mapdiv !== 'undefined') {
              // Use map to convert to preferred projection.
              indiciaData.mapdiv.pointToSref(
                indiciaData.mapdiv,
                point,
                $('#imp-sref-system').val(),
                function (data) {
                  $srefCtrl.val(data.sref); // SRID for WGS84 lat long
                  $srefCtrl.change();
                },
                '4326',
                8
              );
            } else {
              // map not available for conversions, so have to use LatLong as returned projection.
              $srefCtrl.val(place.lat + ', ' + place.lng);
              $srefSystemCtrl.val('4326'); // SRID for WGS84 lat long
              $srefCtrl.change();
            }
          }
      );
    } else {
      // Postcode was cleared, so remove the spatial reference info
      $srefCtrl.attr('value', '');
    }
  };
}(jQuery));