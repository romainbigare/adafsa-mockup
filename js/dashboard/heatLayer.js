(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // TEST — a criticality heat surface that replaces the bold coloured cluster
  // bubbles. Always visible, mid-opacity, coloured green→red the same way the
  // clusters were (by the active lens: the composite score, or a single module's
  // band severity). Farm points still show at close range; a subtle count still
  // shows when zoomed far out (see plotsLayer's cluster restyle).
  //
  // Intensity per farm = a faint baseline (so every farm is faintly visible) +
  // the farm's normalised severity under the active lens, so hot spots are the
  // farms that need attention.
  // ============================================================================

  var heat = null;
  var BASELINE = 0.18;            // faint presence for a healthy farm

  // Green (cool) → red (hot). The 0 stop is transparent so empty space stays clear.
  var GRADIENT = {
    0.00: 'rgba(26,152,80,0)',
    0.20: '#1a9850',
    0.45: '#a6d96a',
    0.62: '#fee08b',
    0.80: '#fdae61',
    1.00: '#d73027'
  };

  function severityFor(state, farm) {
    var reg = W.dashboard.moduleRegistry;
    var key = state.activeModule;
    if (!key || !reg) return 0;
    if (key === 'composite') {
      var s = reg.compositeScore(farm);
      return (s == null) ? 0 : Math.min(1, s / 55);   // score 55+ reads full-hot
    }
    var m = reg.byKey(key);
    if (!m || !m.worstSev) return 0;                    // categorical / unknown → no heat boost
    var b = reg.bandOf(m, farm);
    return b ? (b.sev || 0) / m.worstSev : 0;
  }

  function points(state) {
    var farms = state.farmFeatures || [];
    var pts = [];
    for (var i = 0; i < farms.length; i++) {
      var f = farms[i];
      if (!f.centroid || f._offMap) continue;
      pts.push([f.centroid[0], f.centroid[1], BASELINE + (1 - BASELINE) * severityFor(state, f)]);
    }
    return pts;
  }

  function init(state) {
    if (typeof L.heatLayer !== 'function') return;      // plugin missing → no heat
    // Own pane, below the polygons/markers so farm points stay readable on top,
    // and semi-transparent so the satellite shows through (mid-range opacity).
    state.map.createPane('heatPane');
    var pane = state.map.getPane('heatPane');
    pane.style.zIndex = 250;
    pane.style.pointerEvents = 'none';
    pane.style.opacity = '0.72';

    heat = L.heatLayer([], {
      radius: 34, blur: 26, maxZoom: 18, minOpacity: 0.3, max: 1.0, gradient: GRADIENT
    });
    heat.addTo(state.map);
    // leaflet.heat 0.2 appends to overlayPane; move it into our lower pane.
    if (heat._canvas && heat._canvas.parentNode !== pane) pane.appendChild(heat._canvas);
    state.heatLayer = heat;
  }

  // Rebuild the heat surface for the current lens (called from applyColoring).
  // Hidden while the Map Layers browser drives the map (it's a farm-criticality
  // surface, not a taxonomy one).
  function update(state) {
    if (!heat) return;
    heat.setLatLngs(state.taxonomyView ? [] : points(state));
    // Re-home the canvas if a resize re-created/re-parented it.
    var pane = state.map.getPane('heatPane');
    if (pane && heat._canvas && heat._canvas.parentNode !== pane) pane.appendChild(heat._canvas);
  }

  W.dashboard.heatLayer = { init: init, update: update, points: points, severityFor: severityFor };

})(window.Wafra);
