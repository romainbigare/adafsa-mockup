(function (W) {
  "use strict";

  var mock = W.mock.farmAnalysis;
  var heatmap = W.farmAnalysis.heatmap;
  var mercToLatLng = W.geo.mercatorToLatLng;

  // ---- Real farm data (data/farms.js -> window.WafraData.farms) ----
  var FARMS = W.data.get('farms');

  // ---- Module state (owned here; passed explicitly to heatmap.js) ----
  var state = {
    map: null,
    allFeatures: [],
    polygons: [],
    selectedFarm: null,
    currentHeatmap: 'crop',
    heatmapOpacity: 0.65,
    totalFarms: 0,
    totalArea: 0,
    polygonLayer: null,
    heatmapCanvas: null,
    heatmapCtx: null
  };

  // ---- Farm picker ----
  function buildFarmPicker() {
    var sel = document.getElementById('farm-select');
    FARMS.forEach(function (f) {
      var opt = document.createElement('option');
      opt.value = f.id; opt.textContent = f.id + ' — ' + f.name;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', function () { selectFarm(sel.value); });
  }

  function selectFarm(farmId) {
    var farm = FARMS.find(function (f) { return f.id === farmId; });
    if (!farm) return;
    state.selectedFarm = farm;
    state.allFeatures.length = 0;
    state.polygons.length = 0;
    state.totalFarms = 0; state.totalArea = 0;

    farm.plots.forEach(function (plot) {
      var ring = plot.coords.map(function (c) { return mercToLatLng(c[0], c[1]); });
      // Close ring if needed
      if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) ring.push(ring[0]);
      var feature = { properties: { fid: plot.fid, Type: plot.type }, _cropMon: 0, _palms: 0, _ier: 0, _yield: 0, _water: 0, _crop: null, _cropCat: null, type: plot.type };
      mock.assignMetrics(feature, plot.fid);
      // Precompute detailed per-shape heatmap fields for each module
      feature._fields = {
        'crop': mock.generateHeatField(plot.fid, 'crop'),
        'palms': mock.generateHeatField(plot.fid, 'palms'),
        'ier': mock.generateHeatField(plot.fid, 'ier'),
        'yield': mock.generateHeatField(plot.fid, 'yield'),
        'water': mock.generateHeatField(plot.fid, 'water'),
      };
      // Estimate area from mercator bbox
      var xs = plot.coords.map(function (c) { return c[0]; }), ys = plot.coords.map(function (c) { return c[1]; });
      var area = ((Math.max.apply(null, xs) - Math.min.apply(null, xs)) * (Math.max.apply(null, ys) - Math.min.apply(null, ys))) / 1000;
      state.totalFarms++; state.totalArea += area;
      state.allFeatures.push({ type: plot.type, owner: farm.owner, fid: plot.fid, area: area, rings: [ring], feature: feature });
    });

    document.getElementById('farm-summary').classList.remove('hidden');
    document.getElementById('farm-owner').textContent = farm.owner;
    document.getElementById('farm-plots').textContent = farm.plots.length;
    document.getElementById('farm-total-area').textContent = state.totalArea.toFixed(1) + ' dun';

    // Fit map
    var allRings = [];
    state.allFeatures.forEach(function (f) { allRings = allRings.concat(f.rings); });
    if (allRings.length) {
      var group = L.featureGroup(allRings.map(function (r) { return L.polygon(r); }));
      state.map.fitBounds(group.getBounds(), { padding: [60, 60] });
    }

    renderPolygons();
    updateStats();
    updateLegend();
    updateFarmInfo();
    updateWeather();
    updateSoil();
    updateGrowth();
    updateWater();
    updateAdvisory();
    applyLowConfidenceFlags();
  }

  // ---- Render polygons (outlines only; heatmap drawn on canvas overlay) ----
  function renderPolygons() {
    if (state.polygonLayer) state.map.removeLayer(state.polygonLayer);
    state.polygonLayer = L.layerGroup();
    state.polygons.length = 0;

    state.allFeatures.forEach(function (item) {
      item.rings.forEach(function (ring) {
        var poly = L.polygon(ring, {
          color: '#ffffff', weight: 1, opacity: 0.9,
          fillColor: '#000', fillOpacity: 0
        });
        poly.bindPopup(buildPopup(item));
        state.polygonLayer.addLayer(poly);
        state.polygons.push({ poly: poly, item: item });
      });
    });
    state.polygonLayer.addTo(state.map);
    heatmap.ensureHeatmapCanvas(state);
    heatmap.drawHeatmapOverlay(state);
  }

  // Module display names + the bands each 0..1 score falls into (high → low, so
  // the first threshold a value clears wins). Mirrors the overview's module bands.
  var METRIC_LABEL = {
    crop: 'Crop Monitoring', palms: 'Palms & Fruit Trees', ier: 'Irrigation Efficiency',
    yield: 'Yield Forecast', water: 'Crop Water Allocation'
  };
  var METRIC_BANDS = {
    crop:  [[0.66, 'Cultivated'], [0.33, 'Partially Fallow'], [0, 'Fallow']],
    palms: [[0.75, 'Healthy'], [0.5, 'Fair'], [0.25, 'Stressed'], [0, 'Severe Stress']],
    ier:   [[0.8, 'Excellent'], [0.6, 'Good'], [0.4, 'Acceptable'], [0.2, 'Poor'], [0, 'Critical']],
    yield: [[0.75, 'Above Expected'], [0.5, 'On Track'], [0.25, 'Below Expected'], [0, 'Significantly Underperforming']],
    water: [[0.8, 'Over-Allocated'], [0.6, 'Mild Excess'], [0.3, 'Efficient'], [0, 'Water-Stressed']]
  };
  function classify(metric, v) {
    var bands = METRIC_BANDS[metric] || METRIC_BANDS.crop;
    for (var i = 0; i < bands.length; i++) if (v >= bands[i][0]) return bands[i][1];
    return bands[bands.length - 1][1];
  }

  function buildPopup(item) {
    var f = item.feature;
    var ch = state.currentHeatmap;
    var v = f[metricKey(ch)];
    var col = metricColorFn(ch)(v);
    var extra = '<span style="color:#6b7280;font-size:11px">' + METRIC_LABEL[ch] +
      ': <b style="color:' + col + '">' + classify(ch, v) + ' (' + Math.round(v * 100) + '%)</b></span><br>';
    return '<div style="font-family:Inter,sans-serif;min-width:140px"><b style="color:#111827">' + item.type + '</b><br><span style="color:#6b7280;font-size:11px">ID: ' + item.fid + '</span><br><span style="color:#6b7280;font-size:11px">Area: ~' + item.area.toFixed(1) + ' dun</span><br>' + extra + '</div>';
  }

  // ---- Stats (6-month average trend chart) ----
  function metricKey(metric) {
    return metric === 'palms' ? '_palms' : metric === 'ier' ? '_ier' : metric === 'yield' ? '_yield' : metric === 'water' ? '_water' : '_cropMon';
  }
  function metricColorFn(metric) {
    return metric === 'palms' ? heatmap.palmsColor : metric === 'ier' ? heatmap.ierColor : metric === 'yield' ? heatmap.yieldColor : metric === 'water' ? heatmap.waterColor : heatmap.cropColor;
  }

  function updateStats() {
    var titles = { 'crop': 'CROP MONITORING', 'palms': 'PALMS & FRUIT TREES', 'ier': 'IRRIGATION EFFICIENCY', 'yield': 'YIELD FORECAST', 'water': 'CROP WATER ALLOCATION' };
    document.getElementById('stats-title').textContent = titles[state.currentHeatmap];
    document.getElementById('stat-farms').textContent = state.totalFarms;
    document.getElementById('stat-area').innerHTML = Math.round(state.totalArea).toLocaleString() + ' <span class="font-data-sm text-gray-500">dun</span>';
    drawTrendChart();
  }

  function drawTrendChart() {
    var bd = document.getElementById('stats-breakdown');
    var key = metricKey(state.currentHeatmap);
    var colFn = metricColorFn(state.currentHeatmap);
    var curAvg = state.allFeatures.length ? state.allFeatures.reduce(function (s, i) { return s + i.feature[key]; }, 0) / state.allFeatures.length : 0;
    // Generate 6-month synthetic history trending toward current average
    var months = mock.buildTrendMonths(curAvg);
    var trendMonths = mock.TREND_MONTHS;
    // Render minimal inline SVG line chart
    var boxW = 230, boxH = 70, pad = 6;
    var xs = months.map(function (_, i) { return pad + i * (boxW - 2 * pad) / (trendMonths - 1); });
    var ys = months.map(function (m) { return boxH - pad - m.val * (boxH - 2 * pad); });
    var path = xs.map(function (x, i) { return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + ys[i].toFixed(1); }).join(' ');
    var area = path + ' L' + xs[xs.length - 1].toFixed(1) + ',' + (boxH - pad) + ' L' + xs[0].toFixed(1) + ',' + (boxH - pad) + ' Z';
    var lineColor = colFn(curAvg);
    var pts = xs.map(function (x, i) { return '<circle cx="' + x.toFixed(1) + '" cy="' + ys[i].toFixed(1) + '" r="2" fill="' + lineColor + '"/>'; }).join('');
    bd.innerHTML =
      '<div class="flex items-center justify-between mb-1"><span class="text-xs text-gray-500">6-month average</span><span class="font-data-sm font-bold text-gray-900">' + Math.round(curAvg * 100) + '%</span></div>' +
      '<svg width="' + boxW + '" height="' + boxH + '" viewBox="0 0 ' + boxW + ' ' + boxH + '" style="display:block">' +
      '<path d="' + area + '" fill="' + lineColor + '" opacity="0.12"/>' +
      '<path d="' + path + '" fill="none" stroke="' + lineColor + '" stroke-width="1.5" stroke-linejoin="round"/>' +
      pts +
      '</svg>' +
      '<div class="flex justify-between text-9px text-gray-400 mt-0.5" style="font-size:9px">' + months.map(function (m) { return m.label; }).join('<span></span>') + '</div>';
  }

  // ---- Legend ----
  // One legend per module: a gradient built from the module's band palette, the
  // band names as ticks, and a plain-language description of the metric.
  var LEGENDS = {
    crop: {
      grad: 'rgb(217,164,65),rgb(254,224,139),rgb(145,207,96),rgb(26,152,80)',
      ticks: ['Fallow', 'Partially Fallow', 'Cultivated'],
      desc: 'Cultivated fraction of each plot'
    },
    palms: {
      grad: 'rgb(215,48,39),rgb(254,224,139),rgb(145,207,96),rgb(26,152,80)',
      ticks: ['Severe Stress', 'Stressed', 'Fair', 'Healthy'],
      desc: 'Canopy-health index (NDVI-like)'
    },
    ier: {
      grad: 'rgb(215,48,39),rgb(252,141,89),rgb(254,224,139),rgb(145,207,96),rgb(26,152,80)',
      ticks: ['Critical', 'Acceptable', 'Excellent'],
      desc: 'Irrigation efficiency score'
    },
    yield: {
      grad: 'rgb(215,48,39),rgb(253,174,97),rgb(166,217,106),rgb(26,152,80)',
      ticks: ['Underperforming', 'On Track', 'Above Expected'],
      desc: 'Yield vs. sub-zone expectation'
    },
    water: {
      grad: 'rgb(224,130,20),rgb(26,152,80),rgb(254,224,139),rgb(179,0,0)',
      ticks: ['Water-Stressed', 'Efficient', 'Over-Allocated'],
      desc: 'Water use vs. modelled demand'
    }
  };
  function updateLegend() {
    var el = document.getElementById('legend-content');
    var cfg = LEGENDS[state.currentHeatmap] || LEGENDS.crop;
    var ticks = cfg.ticks.map(function (t) { return '<span>' + t + '</span>'; }).join('');
    el.innerHTML = '<div class="space-y-2">' +
      '<div class="legend-bar" style="background:linear-gradient(to right,' + cfg.grad + ')"></div>' +
      '<div class="flex justify-between text-xs text-gray-500">' + ticks + '</div>' +
      '<p class="text-xs text-gray-400">' + cfg.desc + '</p></div>';
  }

  // ---- Farm Information Panel ----
  function updateFarmInfo() {
    var f = state.selectedFarm; if (!f) return;
    var items = mock.buildFarmInfoItems(f, state.allFeatures, state.totalArea);
    document.getElementById('farm-info-content').innerHTML = items.map(function (i) {
      return '<div class="flex items-center gap-2 bg-gray-50 rounded-lg p-2"><span class="material-symbols-outlined text-brand-600 flex-shrink-0" style="font-size:20px;">' + i.icon + '</span><div class="min-w-0"><p class="text-xs text-gray-500 truncate">' + i.label + '</p><p class="text-sm font-semibold text-gray-900 truncate">' + i.value + '</p>' + (i.sub ? '<p class="text-xs text-gray-400">' + i.sub + '</p>' : '') + '</div></div>';
    }).join('');
  }

  // ---- Weather Panel ----
  function updateWeather() {
    var f = state.selectedFarm; if (!f) return;
    var data = mock.buildWeatherData(f.plots[0].fid);
    document.getElementById('weather-content').innerHTML =
      '<div class="flex items-center gap-3 mb-3"><div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"><span class="material-symbols-outlined text-white" style="font-size:28px;">wb_sunny</span></div><div><p class="text-2xl font-bold text-gray-900">' + data.temp + ' °C</p><p class="text-xs text-gray-500">Clear · ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + '</p></div></div>' +
      '<div class="grid grid-cols-3 gap-1.5">' + data.items.map(function (i) { return '<div class="bg-gray-50 rounded-lg p-2 text-center"><span class="material-symbols-outlined text-gray-500" style="font-size:18px;">' + i.icon + '</span><p class="text-xs text-gray-500 mt-0.5">' + i.label + '</p><p class="text-sm font-bold text-gray-900">' + i.value + '</p></div>'; }).join('') + '</div>';
  }

  // ---- Soil Moisture & Temperature ----
  function updateSoil() {
    var f = state.selectedFarm; if (!f) return;
    var data = mock.buildSoilData(f.plots[0].fid);
    document.getElementById('soil-content').innerHTML =
      '<p class="text-xs text-gray-500 mb-2">Moisture Deficit: <span class="font-bold text-amber-600">' + data.deficit + 'mm</span></p>' +
      '<div class="space-y-1.5">' + data.layers.map(function (l) {
        return '<div class="flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1.5"><div class="flex items-center gap-2"><span class="text-xs text-red-700 font-medium">' + l.depth + '</span></div><div class="flex gap-2"><span class="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">' + l.moist + ' %</span><span class="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">' + l.temp + ' °C</span></div></div>';
      }).join('') + '</div>';
  }

  // ---- Crop Growth Phase ----
  function updateGrowth() {
    var f = state.selectedFarm; if (!f) return;
    var data = mock.buildGrowthData(f.plots[0].fid);
    var stages = data.stages, currentStage = data.currentStage;
    var html = '<div class="flex items-center justify-between mb-2 overflow-x-auto scroll-thin pb-1">';
    stages.forEach(function (s, i) {
      var active = i <= currentStage;
      html += '<div class="flex flex-col items-center flex-shrink-0 px-1"><div class="w-3 h-3 rounded-full ' + (active ? 'bg-green-700' : 'bg-gray-300') + '"></div><span class="text-9px text-gray-500 mt-1 whitespace-nowrap" style="font-size:9px">' + s.split(' ')[0] + '</span></div>';
      if (i < stages.length - 1) html += '<div class="h-0.5 w-4 ' + (i < currentStage ? 'bg-green-700' : 'bg-gray-300') + ' mt-1.5"></div>';
    });
    html += '</div>';
    html += '<p class="text-center text-sm font-semibold text-gray-900 mt-2">' + stages[currentStage] + '</p>';
    html += '<p class="text-center text-xs text-gray-500">Day ' + data.day + '</p>';
    document.getElementById('growth-content').innerHTML = html;
  }

  // ---- Water Scheduler ----
  function updateWater() {
    var f = state.selectedFarm; if (!f) return;
    var data = mock.buildWaterData(f.plots[0].fid);
    document.getElementById('water-content').innerHTML =
      '<div class="flex items-center justify-between mb-2"><span class="text-sm font-semibold text-gray-900">Status</span><span class="text-xs font-bold px-2 py-1 rounded-full" style="background:' + data.statusColor + '20;color:' + data.statusColor + '">' + data.status + '</span></div>' +
      '<div class="mb-2"><div class="flex justify-between text-xs text-gray-500 mb-1"><span>Soil Water Tank</span><span class="font-bold text-gray-900">' + data.fillPct + '% full</span></div><div class="h-3 bg-gray-200 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all" style="width:' + data.fillPct + '%;background:' + (data.fillPct > data.target ? '#22c55e' : '#d49b28') + '"></div></div><div class="flex justify-between text-xs text-gray-400 mt-0.5"><span>0%</span><span>' + data.target + '% target</span><span>100%</span></div></div>' +
      '<div class="grid grid-cols-3 gap-1.5"><div class="bg-gray-50 rounded-lg p-2 text-center"><p class="text-xs text-gray-500">Stress</p><p class="text-sm font-bold text-gray-900">' + data.stress + '%</p></div><div class="bg-gray-50 rounded-lg p-2 text-center"><p class="text-xs text-gray-500">Deficit</p><p class="text-sm font-bold text-gray-900">' + data.deficit + 'mm</p></div><div class="bg-gray-50 rounded-lg p-2 text-center"><p class="text-xs text-gray-500">Needed</p><p class="text-sm font-bold text-gray-900">' + data.needed + ' L</p></div></div>' +
      '<div class="mt-2 flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"><span class="text-sm font-medium text-gray-700">Proceed with irrigation</span><span class="text-xs font-bold px-3 py-1 rounded-full ' + (data.needed > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500') + '">' + (data.needed > 0 ? 'YES' : 'NO') + '</span></div>';
  }

  // ---- Advisory ----
  function updateAdvisory() {
    var f = state.selectedFarm; if (!f) return;
    var advisories = mock.buildAdvisoryItems();
    document.getElementById('advisory-content').innerHTML =
      '<div class="space-y-2">' + advisories.map(function (a) {
        return '<div class="flex items-start gap-2 bg-gray-50 rounded-lg p-2"><span class="material-symbols-outlined flex-shrink-0" style="font-size:18px;color:' + a.color + '">' + a.icon + '</span><p class="text-xs text-gray-700">' + a.text + '</p></div>';
      }).join('') + '</div>';
  }

  // ---- Heatmap switching ----
  function switchHeatmap(name) {
    state.currentHeatmap = name;
    document.querySelectorAll('.heatmap-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.heatmap === name); });
    heatmap.drawHeatmapOverlay(state);
    updateStats();
    updateLegend();
  }

  // ---- Edit buttons (My Farm: correct low-confidence data) ----
  // Mark panels with low-confidence data and wire edit buttons
  function applyLowConfidenceFlags() {
    var flags = mock.buildLowConfidenceFlags(state.selectedFarm);
    Object.keys(flags).forEach(function (p) {
      var editEl = document.querySelector('[data-edit="' + p + '"]');
      var panel = editEl ? editEl.closest('.glass-panel') : null;
      if (panel) panel.classList.toggle('low-confidence', flags[p]);
    });
  }

  // ---- Init ----
  function init() {
    W.ui.renderSidebar({ active: 'farm-analysis' });
    W.ui.renderTicker();

    var mapCtx = W.map.create('map');
    state.map = mapCtx.map;

    // ---- Heatmap toggle bar ----
    document.querySelectorAll('.heatmap-btn').forEach(function (b) {
      b.addEventListener('click', function () { switchHeatmap(b.dataset.heatmap); });
    });

    // ---- Opacity slider ----
    document.getElementById('opacity-slider').addEventListener('input', function (e) {
      state.heatmapOpacity = e.target.value / 100;
      document.getElementById('opacity-val').textContent = e.target.value + '%';
      heatmap.drawHeatmapOverlay(state);
    });

    // ---- Panel collapse ----
    document.querySelectorAll('.panel-header').forEach(function (h) {
      h.addEventListener('click', function () { h.parentElement.classList.toggle('panel-collapsed'); });
    });

    // ---- Edit buttons ----
    document.querySelectorAll('.edit-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var panel = btn.closest('.glass-panel');
        var wasLow = panel.classList.contains('low-confidence');
        var label = btn.dataset.edit;
        // Inline edit: prompt for corrected value (demo)
        var ok = confirm('Edit and verify the data in this panel?\n\nPanel: ' + label.toUpperCase() + (wasLow ? '\nStatus: Low confidence — correction recommended.' : '\nStatus: Verified.'));
        if (ok) {
          panel.classList.remove('low-confidence');
          btn.style.color = '#16a34a';
          btn.querySelector('.material-symbols-outlined').textContent = 'check';
          setTimeout(function () { btn.style.color = ''; btn.querySelector('.material-symbols-outlined').textContent = 'edit'; }, 1500);
        }
      });
    });

    // ---- Controls ----
    buildFarmPicker();
    selectFarm(FARMS[0].id);
    document.getElementById('farm-select').value = FARMS[0].id;
    document.getElementById('map-loader').style.display = 'none';
  }

  document.addEventListener('DOMContentLoaded', init);

})(window.Wafra);
