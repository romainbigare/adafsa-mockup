(function (W) {
  "use strict";

  W.mock = W.mock || {};

  // ---- Metric-based color coding (demo data) ----
  // Assigns random but stable metrics to each feature for demo purposes.
  var METRIC_RANGES = {
    grade: { min: 1, max: 5, label: 'Avg Grade', unit: '/5' },
    growth: { min: 10, max: 95, label: 'Avg Weekly Growth', unit: '%' },
    irrigation: { min: 0, max: 3, label: 'Irrigation', unit: '' },
    utilisation: { min: 20, max: 100, label: 'Utilisation', unit: '%' },
    area: { min: 5, max: 200, label: 'Area', unit: ' dun' }
  };

  // Irrigation state labels & colors
  var IRRIGATION_COLORS = ['#d73027', '#fc8d59', '#91cf60', '#1a9850'];
  var IRRIGATION_LABELS = ['None', 'Drip', 'Sprinkler', 'Flood'];

  // Gradient stops for continuous metrics
  var GRADIENT_STOPS = ['#b71c1c', '#e65100', '#f9a825', '#558b2f', '#1b5e20'];

  // Get metric value for a feature
  function getMetricValue(feature, metric) {
    if (metric === 'area') return feature.area;
    var r = METRIC_RANGES[metric];
    var rand = W.random.seededRandom(feature.fid * 7 + metric.length * 13);
    return r.min + rand * (r.max - r.min);
  }

  function getMetricColor(value, metric) {
    if (metric === 'irrigation') {
      var idx = Math.round(value);
      return IRRIGATION_COLORS[Math.max(0, Math.min(3, idx))];
    }
    var r = METRIC_RANGES[metric];
    var t = Math.max(0, Math.min(1, (value - r.min) / (r.max - r.min)));
    var seg = t * (GRADIENT_STOPS.length - 1);
    var segIdx = Math.floor(seg);
    var frac = seg - segIdx;
    if (segIdx >= GRADIENT_STOPS.length - 1) return GRADIENT_STOPS[GRADIENT_STOPS.length - 1];
    return W.color.lerpColor(GRADIENT_STOPS[segIdx], GRADIENT_STOPS[segIdx + 1], frac);
  }

  // ==========================================================================
  // Per-farm module metrics (mock boundary) — the raw numbers the six contract
  // modules read. Swap prepareFarmMetrics for a real API and every module page
  // keeps working. Values are deterministic (seeded from the farm's fid) so the
  // map, scorecards and attention lists stay stable across pans / re-renders.
  //
  // Product logic (band thresholds, colours, KPIs) does NOT live here — it lives
  // in js/dashboard/moduleRegistry.js. This file only fabricates the inputs.
  // ==========================================================================

  // Date-palm cultivars, most-common first (drives the "top cultivar" weighting).
  var CULTIVARS = [
    'Khalas', 'Fard', 'Khenaizi', 'Lulu', 'Barhi', 'Dabbas', 'Shishi', 'Sultana',
    'Naghal', 'Jabri', 'Sukkari', 'Ajwa', 'Mabroom', 'Safawi', 'Razaiz', 'Hilali',
    'Maktoumi', 'Sagai', 'Rothana', 'Booman'
  ];

  // Land-use tier per farm (Structures module). Weights roughly match the
  // production land-use split (open agriculture dominant, structures rare).
  var STRUCTURE_TIERS = [
    { label: 'Open Agriculture', weight: 0.62 },
    { label: 'Barren Land',      weight: 0.20 },
    { label: 'Protected',        weight: 0.10 },
    { label: 'Structures',       weight: 0.08 }
  ];

  function isPalmFarm(f) { return /palm/i.test(f.type || '') && !/no\s*palm/i.test(f.type || ''); }

  // Pick a weighted index from a [0,1) random draw and a weights array.
  function weightedIndex(r, weights) {
    var acc = 0;
    for (var i = 0; i < weights.length; i++) { acc += weights[i]; if (r < acc) return i; }
    return weights.length - 1;
  }

  // A front-loaded cultivar pick: squaring the draw biases toward the first
  // (most common) entries, so Khalas/Fard dominate — like a real region.
  function pickCultivar(r) {
    var idx = Math.floor(r * r * CULTIVARS.length);
    return CULTIVARS[Math.min(CULTIVARS.length - 1, idx)];
  }

  // Stash `_farm` onto every farm feature: tree counts, canopy-health index,
  // top cultivar, cultivated fraction and land-use tier. Mirrors the two-arg
  // shape of Wafra.dashboard.modules.prepare (which stashes `_mod`).
  function prepareFarmMetrics(features) {
    var rnd = W.random.seededRandom;
    var tierWeights = STRUCTURE_TIERS.map(function (t) { return t.weight; });
    for (var i = 0; i < features.length; i++) {
      var f = features[i];
      var fid = f.fid;
      var area = f.area || 0;
      var palm = isPalmFarm(f);

      var datePalms = palm ? Math.round(area * (11 + rnd(fid * 7 + 101) * 8)) : 0; // ~11–19 palms/dunum
      var fruitTrees = Math.round(area * rnd(fid * 7 + 113) * 3);                   // scattered fruit trees
      var trees = datePalms + fruitTrees;

      // Canopy-health index (NDVI-like, 0..1). Only meaningful where trees exist.
      var canopy = trees > 0 ? 0.5 + rnd(fid * 7 + 127) * 0.45 : null;

      var tierIdx = weightedIndex(rnd(fid * 7 + 149), tierWeights);

      f._farm = {
        datePalms: datePalms,
        fruitTrees: fruitTrees,
        trees: trees,
        canopy: canopy,                                   // 0..1 or null
        cultivar: palm ? pickCultivar(rnd(fid * 7 + 137)) : null,
        cultivatedFrac: 0.15 + rnd(fid * 7 + 151) * 0.85, // 0.15..1.0
        tier: STRUCTURE_TIERS[tierIdx].label,
        tierIdx: tierIdx
      };
    }
    return features;
  }

  W.mock.metrics = {
    METRIC_RANGES: METRIC_RANGES,
    IRRIGATION_COLORS: IRRIGATION_COLORS,
    IRRIGATION_LABELS: IRRIGATION_LABELS,
    GRADIENT_STOPS: GRADIENT_STOPS,
    CULTIVARS: CULTIVARS,
    STRUCTURE_TIERS: STRUCTURE_TIERS,
    getMetricValue: getMetricValue,
    getMetricColor: getMetricColor,
    prepareFarmMetrics: prepareFarmMetrics
  };

})(window.Wafra);
