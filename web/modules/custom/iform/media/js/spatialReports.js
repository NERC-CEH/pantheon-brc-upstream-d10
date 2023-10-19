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

(function enclose($) {
  /**
   * Method which copies the features on a layer into a WKT in a form input.
   */
  function storeGeomsInHiddenInput(layer, inputId) {
    'use strict';
    var geoms = [];
    var geom;
    $.each(layer.features, function eachFeature(i, feature) {
      // ignore features with a special purpose, e.g. the selected record when verifying
      if (typeof feature.tag === 'undefined') {
        if (feature.geometry.CLASS_NAME.indexOf('Multi') !== -1) {
          geoms = geoms.concat(feature.geometry.components);
        } else {
          geoms.push(feature.geometry);
        }
      }
    });
    if (geoms.length === 0) {
      $('#' + inputId).val('');
    } else {
      if (geoms[0].CLASS_NAME === 'OpenLayers.Geometry.Polygon') {
        geom = new OpenLayers.Geometry.MultiPolygon(geoms);
      } else if (geoms[0].CLASS_NAME === 'OpenLayers.Geometry.LineString') {
        geom = new OpenLayers.Geometry.MultiLineString(geoms);
      } else if (geoms[0].CLASS_NAME === 'OpenLayers.Geometry.Point') {
        geom = new OpenLayers.Geometry.MultiPoint(geoms);
      }
      if (layer.map.projection.getCode() !== 'EPSG:3857') {
        geom.transform(layer.map.projection, new OpenLayers.Projection('EPSG:3857'));
      }
      $('#' + inputId).val(geom.toString());
    }
  }

  function storeGeomsInForm() {
    if (typeof indiciaData.bufferLayer === 'undefined') {
      storeGeomsInHiddenInput(indiciaData.mapdiv.map.editLayer, 'hidden-wkt');
    } else {
      storeGeomsInHiddenInput(indiciaData.mapdiv.map.editLayer, 'orig-wkt');
      storeGeomsInHiddenInput(indiciaData.bufferLayer, 'hidden-wkt');
    }
  }

  function rebuildBuffer() {
    if (!$('#geom_buffer').val().match(/^\d+$/)) {
      $('#geom_buffer').val(0);
    }
    indiciaData.bufferLayer.removeAllFeatures();
    // re-add each object from the edit layer using the spatial buffering service
    $.each(indiciaData.mapdiv.map.editLayer.features, function eachFeature(idx, feature) {
      indiciaFns.bufferQueryParamFeature(indiciaData.mapdiv, feature, $('#geom_buffer').val(0));
    });
  }

  indiciaFns.bufferQueryParamFeature = function bufferQueryParamFeature(feature, bufferSize, segmentsInQuarterCircle, projection) {
    function storeBuffer(buffer) {
      feature.buffer = buffer;
      indiciaData.bufferLayer.addFeatures([buffer]);
      indiciaData.buffering = false;
      if (typeof indiciaData.submitting !== 'undefined' && indiciaData.submitting) {
        storeGeomsInForm();
        $('#run-report').parents('form')[0].submit();
      }
    }

    if (typeof feature.geometry !== 'undefined' && feature.geometry !== null) {
      if (bufferSize === '0') {
        storeBuffer(new OpenLayers.Feature.Vector(feature.geometry));
      } else {
        indiciaData.buffering = true;
        indiciaFns.bufferFeature(feature, bufferSize, segmentsInQuarterCircle, projection,
          function success(buffered) {
            var buffer = new OpenLayers.Feature.Vector(OpenLayers.Geometry.fromWKT(buffered.response));
            storeBuffer(buffer);
          }
        );
      }
    }
  };

  indiciaFns.enableBuffering = function enableBuffering() {
    if (!mapInitialisationHooks || indiciaData.bufferingEnabled) {
      return;
    }
    indiciaData.bufferingEnabled = true;
    // add a mapinitialisation hook to add a layer for buffered versions of polygons
    mapInitialisationHooks.push(function hookInitMap(div) {
      var style = $.extend({}, div.settings.boundaryStyle);
      var buffers;
      style.strokeDashstyle = 'dash';
      style.strokeColor = '#ff7777';
      style.fillOpacity = 0.2;
      style.fillColor = '#777777';
      style.pointRadius = 6;
      indiciaData.bufferLayer = new OpenLayers.Layer.Vector(
        'buffer outlines',
        {
          style: style,
          sphericalMercator: true,
          displayInLayerSwitcher: false
        }
      );
      div.map.addLayer(indiciaData.bufferLayer);
      div.map.editLayer.events.register('featureadded', div.map.editLayer, function featureadded(evt) {
        // don't buffer special polygons
        if (typeof evt.feature.tag === 'undefined') {
          indiciaFns.bufferQueryParamFeature(div, evt.feature);
        }
      });
      div.map.editLayer.events.register('featuresremoved', div.map.editLayer, function featuresremoved(evt) {
        buffers = [];
        $.each(evt.features, function eachFeature(idx, feature) {
          if (typeof feature.buffer !== 'undefined') {
            buffers.push(feature.buffer);
          }
        });
        indiciaData.bufferLayer.removeFeatures(buffers);
      });
      // When exiting the buffer input, recreate all the buffer polygons.
      $('#geom_buffer').blur(function blurBuffer() {
        rebuildBuffer();
      });
    });
  };

  indiciaFns.storeGeomsInFormOnSubmit = function storeGeomsInFormOnSubmit() {
    $('#run-report').click(function runClick(evt) {
      // rebuild the buffer if the user is changing it.
      if (document.activeElement.id === 'geom_buffer') {
        rebuildBuffer();
      }
      if (typeof indiciaData.buffering !== 'undefined' && indiciaData.buffering) {
        // when the buffering response comes back, submit the form
        indiciaData.submitting = true;
        evt.preventDefault();
      } else {
        storeGeomsInForm();
      }
    });
  };
}(jQuery));
