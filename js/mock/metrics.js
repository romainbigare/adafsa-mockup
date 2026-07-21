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

  W.mock.metrics = {
    METRIC_RANGES: METRIC_RANGES,
    IRRIGATION_COLORS: IRRIGATION_COLORS,
    IRRIGATION_LABELS: IRRIGATION_LABELS,
    GRADIENT_STOPS: GRADIENT_STOPS,
    getMetricValue: getMetricValue,
    getMetricColor: getMetricColor
  };

})(window.Wafra);
