(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // Farm-level analysis modules (banded, boundary-coloured).
  //
  // These modules classify each FARM (the plots dataset — one shape per farm
  // boundary) into a small set of qualitative bands and colour its boundary by
  // band. Unlike the Land Use / Crops / Trees category panels (which each load
  // their own taxonomy dataset), every module here operates on the farm
  // boundaries and is mutually exclusive with the category browsers.
  //
  // This file is pure logic (band definitions + deterministic mock values +
  // classification). It has no DOM dependencies so it can be unit-tested in
  // isolation — see test/modules.test.js. The panel/UI lives in
  // modulesPanel.js; the map recolouring lives in plotsLayer.js.
  // ============================================================================

  var rnd = W.random.seededRandom;

  // Colour applied to a farm whose module value could not be computed.
  var UNKNOWN_COLOR = '#9ca3af';

  // ---- Band tables ----------------------------------------------------------
  // Each band carries an explicit `contains(v)` predicate so the exact spec
  // inequalities are honoured (e.g. Over-Allocated is strictly > 125%). `range`
  // is the human label for the legend; `min` is only used for stable ordering.
  // Bands within a module are disjoint and complete, so classification returns
  // the first band whose predicate matches.

  // Module 4 — Irrigation Efficiency (IER score 0..100).
  var IER_BANDS = [
    { label: 'Excellent',  range: '90–100', color: '#1a9850', min: 90,  contains: function (v) { return v >= 90; } },
    { label: 'Good',       range: '80–89',  color: '#91cf60', min: 80,  contains: function (v) { return v >= 80 && v < 90; } },
    { label: 'Acceptable', range: '65–79',  color: '#fee08b', min: 65,  contains: function (v) { return v >= 65 && v < 80; } },
    { label: 'Poor',       range: '50–64',  color: '#fc8d59', min: 50,  contains: function (v) { return v >= 50 && v < 65; } },
    { label: 'Critical',   range: '<50',    color: '#d73027', min: -Infinity, contains: function (v) { return v < 50; } }
  ];

  // Module 5 — Yield Forecast (deviation %, vs the farm's sub-zone average).
  var YIELD_BANDS = [
    { label: 'Above Expected',                range: '≥ +10%',        color: '#1a9850', min: 10,  contains: function (v) { return v >= 10; } },
    { label: 'On Track',                      range: '–10% to +10%',  color: '#a6d96a', min: -10, contains: function (v) { return v >= -10 && v < 10; } },
    { label: 'Below Expected',                range: '–25% to –10%',  color: '#fdae61', min: -25, contains: function (v) { return v >= -25 && v < -10; } },
    { label: 'Significantly Underperforming', range: '< –25%',        color: '#d73027', min: -Infinity, contains: function (v) { return v < -25; } }
  ];

  // Module 6 — Crop Water Allocation (water use %, vs modelled demand).
  // Anchored on the over-allocation threshold: Over-Allocated is > 125%.
  var WATER_BANDS = [
    { label: 'Water-Stressed', range: '< 80%',    color: '#e08214', min: -Infinity, contains: function (v) { return v < 80; } },
    { label: 'Efficient',      range: '80–105%',  color: '#1a9850', min: 80,  contains: function (v) { return v >= 80 && v < 105; } },
    { label: 'Mild Excess',    range: '105–125%', color: '#fee08b', min: 105, contains: function (v) { return v >= 105 && v <= 125; } },
    { label: 'Over-Allocated', range: '> 125%',   color: '#b30000', min: 125, contains: function (v) { return v > 125; } }
  ];

  // ---- Module registry ------------------------------------------------------
  // `valueOf(feature)` reads the precomputed value stashed by prepare().
  var MODULES = [
    {
      key: 'ier', label: 'Irrigation Efficiency', icon: 'water_drop',
      bands: IER_BANDS,
      valueOf: function (f) { return f._mod ? f._mod.ier : null; },
      format: function (v) { return String(Math.round(v)); }
    },
    {
      key: 'yield', label: 'Yield Forecast', icon: 'agriculture',
      bands: YIELD_BANDS,
      valueOf: function (f) { return f._mod ? f._mod.yieldDev : null; },
      format: function (v) { return (v >= 0 ? '+' : '') + Math.round(v) + '%'; }
    },
    {
      key: 'water', label: 'Crop Water Allocation', icon: 'opacity',
      bands: WATER_BANDS,
      valueOf: function (f) { return f._mod ? f._mod.water : null; },
      format: function (v) { return Math.round(v) + '%'; }
    }
  ];

  var MODULE_BY_KEY = {};
  MODULES.forEach(function (m) { MODULE_BY_KEY[m.key] = m; });

  function byKey(key) { return MODULE_BY_KEY[key] || null; }

  // Classify a feature under a module → its band (or null when no value yet).
  function bandOf(module, feature) {
    var v = module.valueOf(feature);
    if (v == null || isNaN(v)) return null;
    for (var i = 0; i < module.bands.length; i++) {
      if (module.bands[i].contains(v)) return module.bands[i];
    }
    return null;
  }

  // Fill colour for a feature under a module.
  function colorOf(module, feature) {
    var b = bandOf(module, feature);
    return b ? b.color : UNKNOWN_COLOR;
  }

  // ---- Sub-zone bucketing (for the Yield module) ----------------------------
  // A farm's yield is scored relative to its neighbours: farms are grouped into
  // a coarse geographic grid ("sub-zone"), and each farm's deviation is measured
  // against its sub-zone's mean raw yield. GRID_DEG ≈ a few km per cell.
  var GRID_DEG = 0.04;

  function subzoneKey(centroid) {
    if (!centroid) return 'na';
    return Math.round(centroid[0] / GRID_DEG) + ':' + Math.round(centroid[1] / GRID_DEG);
  }

  // Precompute every module's per-farm value onto each feature (as `_mod`).
  // Deterministic: seeded from the farm's fid, so values are stable across
  // re-renders / pans. Two passes because the Yield deviation needs each
  // sub-zone's mean before it can be computed.
  function prepare(features) {
    var buckets = {}; // subzoneKey -> { sum, n }

    for (var i = 0; i < features.length; i++) {
      var f = features[i];
      var raw = 20 + rnd(f.fid * 7 + 47) * 80; // raw yield proxy, 20..100
      f._yieldRaw = raw;
      var key = subzoneKey(f.centroid);
      f._subzone = key;
      if (!buckets[key]) buckets[key] = { sum: 0, n: 0 };
      buckets[key].sum += raw;
      buckets[key].n += 1;
    }

    for (var j = 0; j < features.length; j++) {
      var fd = features[j];
      var b = buckets[fd._subzone];
      var avg = (b && b.n) ? b.sum / b.n : fd._yieldRaw;
      var dev = avg ? (fd._yieldRaw - avg) / avg * 100 : 0;
      fd._mod = {
        ier: 35 + rnd(fd.fid * 7 + 61) * 65,   // 35..100
        yieldDev: dev,                          // % vs sub-zone mean
        water: 60 + rnd(fd.fid * 7 + 83) * 90   // 60..150 (% of demand)
      };
    }
  }

  // Tally features (already filtered to those the caller cares about, e.g. in
  // the current viewport) into per-band counts for the given module.
  function bandCounts(module, features) {
    var counts = {};
    module.bands.forEach(function (band) { counts[band.label] = 0; });
    for (var i = 0; i < features.length; i++) {
      var b = bandOf(module, features[i]);
      if (b) counts[b.label]++;
    }
    return counts;
  }

  W.dashboard.modules = {
    MODULES: MODULES,
    UNKNOWN_COLOR: UNKNOWN_COLOR,
    byKey: byKey,
    bandOf: bandOf,
    colorOf: colorOf,
    prepare: prepare,
    bandCounts: bandCounts,
    subzoneKey: subzoneKey
  };

})(window.Wafra);
