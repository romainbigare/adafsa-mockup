(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // Wires the "COLOR BY" metric dropdown + its gradient/categorical legend.
  function init(state) {
    var sel = document.getElementById('metric-select');
    var metricLegend = document.getElementById('metric-legend');
    var gradientBar = document.getElementById('gradient-bar');
    var legendMin = document.getElementById('legend-min');
    var legendMax = document.getElementById('legend-max');

    if (!sel) return;

    var metrics = W.mock.metrics;

    // Create a container for categorical legends (irrigation) dynamically
    var categoricalLegend = document.getElementById('categorical-legend');
    if (!categoricalLegend) {
      categoricalLegend = document.createElement('div');
      categoricalLegend.id = 'categorical-legend';
      categoricalLegend.className = 'mt-2 space-y-0.5';
      metricLegend.parentNode.insertBefore(categoricalLegend, metricLegend.nextSibling);
    }

    function updateLegend(metric) {
      if (metric === 'irrigation') {
        metricLegend.classList.add('hidden');
        categoricalLegend.classList.remove('hidden');
        categoricalLegend.innerHTML = metrics.IRRIGATION_LABELS.map(function (label, i) {
          return '<div class="flex items-center gap-1.5">' +
            '<span class="w-2.5 h-2.5 rounded-sm" style="background:' + metrics.IRRIGATION_COLORS[i] + '"></span>' +
            '<span class="text-[11px] text-gray-600">' + label + '</span>' +
          '</div>';
        }).join('');
      } else {
        metricLegend.classList.remove('hidden');
        categoricalLegend.classList.add('hidden');
        var r = metrics.METRIC_RANGES[metric];
        legendMin.textContent = r.min + r.unit;
        legendMax.textContent = r.max + r.unit;
        var stops = metrics.GRADIENT_STOPS.map(function (c, i) {
          return c + ' ' + (i / (metrics.GRADIENT_STOPS.length - 1)) * 100 + '%';
        }).join(', ');
        gradientBar.style.background = 'linear-gradient(to right, ' + stops + ')';
      }
    }

    sel.addEventListener('change', function () {
      state.currentMetric = sel.value;
      updateLegend(state.currentMetric);
      W.dashboard.plotsLayer.applyMetricColoring(state);
    });

    // Initialize legend for default selection
    updateLegend(state.currentMetric);
    W.dashboard.plotsLayer.applyMetricColoring(state);
  }

  W.dashboard.metricSelector = { init: init };

})(window.Wafra);
