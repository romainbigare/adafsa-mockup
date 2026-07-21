(function (W) {
  "use strict";

  // ---- Web Mercator (EPSG:3857) -> lat/lng (EPSG:4326) ----
  var R = 6378137.0;
  var DEG = 180 / Math.PI;

  function mercatorToLatLng(x, y) {
    return [(2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) * DEG, (x / R) * DEG];
  }

  // Convert a GeoJSON MultiPolygon from Web Mercator to lat/lng Leaflet rings
  function featureToPolygons(feature) {
    var polys = [];
    var coords = feature.geometry && feature.geometry.coordinates;
    if (!coords) return polys;
    for (var i = 0; i < coords.length; i++) {
      var polygon = coords[i];
      var ring = polygon[0].map(function (pt) {
        return mercatorToLatLng(pt[0], pt[1]);
      });
      polys.push(ring);
    }
    return polys;
  }

  // Rough area estimate in dunums (1 dunum = 1000 m^2) using bbox in mercator
  function estimateArea(feature) {
    var coords = feature.geometry && feature.geometry.coordinates;
    if (!coords) return 0;
    var xs = [], ys = [];
    for (var i = 0; i < coords.length; i++) {
      var ring0 = coords[i][0];
      for (var j = 0; j < ring0.length; j++) {
        xs.push(ring0[j][0]);
        ys.push(ring0[j][1]);
      }
    }
    if (!xs.length) return 0;
    var w = Math.max.apply(null, xs) - Math.min.apply(null, xs);
    var h = Math.max.apply(null, ys) - Math.min.apply(null, ys);
    return (w * h) / 1000; // dunums
  }

  // Compute centroid of a feature's first ring
  function featureCentroid(feature) {
    var rings = featureToPolygons(feature);
    if (!rings.length) return null;
    var ring = rings[0];
    var lat = 0, lng = 0;
    for (var i = 0; i < ring.length; i++) {
      lat += ring[i][0];
      lng += ring[i][1];
    }
    return [lat / ring.length, lng / ring.length];
  }

  W.geo = {
    mercatorToLatLng: mercatorToLatLng,
    featureToPolygons: featureToPolygons,
    estimateArea: estimateArea,
    featureCentroid: featureCentroid
  };

})(window.Wafra);
