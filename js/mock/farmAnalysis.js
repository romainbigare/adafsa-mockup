(function (W) {
  "use strict";

  W.mock = W.mock || {};

  // ---- This page's OWN deterministic RNG. ----
  // NOTE: Farm Analysis intentionally does NOT use Wafra.random.seededRandom
  // (the dashboard's string-hash RNG). This is a different sin()-based
  // generator; every metric/weather/soil value on this page is seeded from
  // it, so it must stay byte-for-byte identical to the original page.
  function seededRandom(seed) {
    var x = Math.sin(seed * 9999.123) * 10000;
    return x - Math.floor(x);
  }

  // ---- Assign metrics per plot (deterministic) ----
  function assignMetrics(f, fid) {
    // Per-plot module scores (0..1). Seeds are unchanged from the original
    // growth/irrigation/phenology/density metrics so the mock visuals stay
    // byte-identical — only what each field REPRESENTS was renamed.
    f._cropMon = 0.2 + seededRandom(fid) * 0.7;         // Crop Monitoring
    f._palms = 0.15 + seededRandom(fid + 1000) * 0.8;   // Palms & Fruit Trees
    f._ier = 0.1 + seededRandom(fid + 2000) * 0.85;     // Irrigation Efficiency
    f._yield = 0.1 + seededRandom(fid + 3000) * 0.85;   // Yield Forecast
    f._water = 0.15 + seededRandom(fid + 4000) * 0.8;   // Crop Water Allocation
    f._crop = f.type === 'Palm Trees' ? 'Date Palm' : f.type === 'Other Trees' ? 'Olive' : f.type === 'Fruit Trees' ? 'Citrus' : f.type === 'Cultivated Fields' ? 'Alfalfa' : null;
    f._cropCat = f._crop ? (f.type.includes('Trees') ? 'Trees' : 'Fodder') : null;
  }

  // ---- Per-shape detailed heatmap field generation ----
  // Generates a smooth value-noise field over each plot's bounding box,
  // sampled at a grid resolution. Values are normalized 0..1 per metric.
  var HEATMAP_GRID = 28; // samples per axis within each plot bbox

  function hash2(ix, iy, seed) {
    var h = ix * 374761393 + iy * 668265263 + seed * 1442695040;
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) >>> 0) / 4294967295;
  }

  function smoothstep(t) { return t * t * (3 - 2 * t); }

  function valueNoise(ix, iy, seed) {
    var x0 = Math.floor(ix), y0 = Math.floor(iy);
    var fx = ix - x0, fy = iy - y0;
    var v00 = hash2(x0, y0, seed), v10 = hash2(x0 + 1, y0, seed);
    var v01 = hash2(x0, y0 + 1, seed), v11 = hash2(x0 + 1, y0 + 1, seed);
    var sx = smoothstep(fx), sy = smoothstep(fy);
    return (v00 * (1 - sx) + v10 * sx) * (1 - sy) + (v01 * (1 - sx) + v11 * sx) * sy;
  }

  // Multi-octave fractal noise for richer detail
  function fractalNoise(ix, iy, seed, octaves) {
    var v = 0, amp = 0.5, freq = 1, max = 0;
    for (var o = 0; o < octaves; o++) {
      v += valueNoise(ix * freq, iy * freq, seed + o * 97) * amp;
      max += amp; amp *= 0.5; freq *= 2;
    }
    return v / max;
  }

  // Generate a normalized field for a given plot + metric
  function generateHeatField(fid, metric) {
    var seed = fid + (metric === 'crop' ? 100 : metric === 'palms' ? 200 : metric === 'ier' ? 300 : 400);
    var field = new Float32Array(HEATMAP_GRID * HEATMAP_GRID);
    // Collect raw noise then normalize to full 0..1 range per plot for max contrast
    var raw = new Float32Array(HEATMAP_GRID * HEATMAP_GRID);
    var min = Infinity, max = -Infinity;
    for (var j = 0; j < HEATMAP_GRID; j++) {
      for (var i = 0; i < HEATMAP_GRID; i++) {
        var nx = i / HEATMAP_GRID * 5, ny = j / HEATMAP_GRID * 5;
        var n = fractalNoise(nx, ny, seed, 4);
        raw[j * HEATMAP_GRID + i] = n;
        if (n < min) min = n;
        if (n > max) max = n;
      }
    }
    // Normalize to 0..1, then apply a contrast curve (gamma < 1 pushes mids toward extremes)
    var span = (max - min) || 1;
    var gamma = 0.6; // accentuate contrast
    for (var k = 0; k < raw.length; k++) {
      var v = (raw[k] - min) / span; // 0..1
      v = Math.pow(v, gamma); // contrast curve
      field[k] = Math.max(0, Math.min(1, v));
    }
    return field;
  }

  // ==== Panel demo-content generators (fake/mock data only — no DOM, no HTML) ====

  // ---- Farm Information panel ----
  function buildFarmInfoItems(selectedFarm, allFeatures, totalArea) {
    var crop = (allFeatures[0] && allFeatures[0].feature && allFeatures[0].feature._crop) || 'Date Palm';
    var cropScore = (allFeatures.reduce(function (s, i) { return s + i.feature._cropMon; }, 0) / allFeatures.length * 100).toFixed(1);
    var irrScore = (allFeatures.reduce(function (s, i) { return s + i.feature._ier; }, 0) / allFeatures.length * 100).toFixed(1);
    var irrRating = irrScore > 80 ? 'Excellent' : irrScore > 60 ? 'Good' : 'Moderate';
    var seedFid = selectedFarm.plots[0].fid;
    return [
      { icon: 'grass', label: 'Crop Monitoring', value: cropScore + '% cultivated' },
      { icon: 'water_drop', label: 'Irrigation Efficiency', value: irrScore, sub: 'Rating: ' + irrRating },
      { icon: 'crop_square', label: 'Total Area', value: totalArea.toFixed(1) + ' dun' },
      { icon: 'spa', label: 'Crop Name', value: crop },
      { icon: 'schedule', label: 'Crop Age', value: (Math.floor(seededRandom(seedFid) * 200) + 60) + ' days' },
      { icon: 'agriculture', label: 'Yield Forecast', value: (Math.floor(seededRandom(seedFid + 500) * 80) + 20) + ' kg/tree' },
      { icon: 'construction', label: 'Tillage Type', value: 'No Till' },
      { icon: 'water', label: 'Watering Method', value: 'Center Pivot' },
    ];
  }

  // ---- Weather panel ----
  function buildWeatherData(seed) {
    var temp = (25 + seededRandom(seed) * 10).toFixed(1);
    var humidity = (60 + seededRandom(seed + 100) * 30).toFixed(1);
    var wind = (0.5 + seededRandom(seed + 200) * 5).toFixed(1);
    var windDeg = Math.floor(seededRandom(seed + 300) * 360);
    var pressure = (995 + seededRandom(seed + 400) * 15).toFixed(0);
    var rain = (seededRandom(seed + 500) * 2).toFixed(1);
    var uv = (seededRandom(seed + 600) * 11).toFixed(1);
    var clouds = (seededRandom(seed + 700) * 100).toFixed(0);
    var dewPt = (parseFloat(temp) - 5 - seededRandom(seed + 800) * 3).toFixed(1);
    var vapor = (parseFloat(temp) - parseFloat(dewPt)).toFixed(2);
    var items = [
      { icon: 'water_drop', label: 'Rain', value: rain + ' mm' },
      { icon: 'opacity', label: 'Humidity', value: humidity + ' %' },
      { icon: 'air', label: 'Wind Speed', value: wind + ' m/sec' },
      { icon: 'explore', label: 'Wind Degree', value: windDeg + ' °' },
      { icon: 'compress', label: 'Pressure', value: pressure + ' hPa' },
      { icon: 'wb_sunny', label: 'UV Index', value: uv },
      { icon: 'cloud', label: 'Clouds', value: clouds + ' %' },
      { icon: 'water', label: 'Dew Point', value: dewPt + ' °C' },
      { icon: 'science', label: 'Vapor Deficit', value: vapor + ' kPa' },
    ];
    return { temp: temp, items: items };
  }

  // ---- Soil Moisture & Temperature panel ----
  function buildSoilData(seed) {
    var layers = [
      { depth: '0-7 cm', moist: Math.floor(seededRandom(seed) * 8) + 1, temp: (28 + seededRandom(seed + 10) * 8).toFixed(1) },
      { depth: '7-28 cm', moist: Math.floor(seededRandom(seed + 20) * 20) + 5, temp: (32 + seededRandom(seed + 30) * 8).toFixed(1) },
      { depth: '28-100 cm', moist: Math.floor(seededRandom(seed + 40) * 15) + 3, temp: (30 + seededRandom(seed + 50) * 6).toFixed(1) },
      { depth: '100-289 cm', moist: Math.floor(seededRandom(seed + 60) * 8) + 2, temp: (26 + seededRandom(seed + 70) * 6).toFixed(1) },
    ];
    var deficit = Math.floor(seededRandom(seed + 80) * 200) + 50;
    return { layers: layers, deficit: deficit };
  }

  // ---- Crop Growth Phase panel ----
  var GROWTH_STAGES = ['Pre-Planting', 'Planting', 'Establishment', 'Vegetative Growth', 'Pre-Bearing', 'Fruit Development', 'Ripening & Harvest'];
  function buildGrowthData(seed) {
    var currentStage = Math.floor(seededRandom(seed) * GROWTH_STAGES.length);
    var day = Math.floor(seededRandom(seed + 900) * 200) + 30;
    return { stages: GROWTH_STAGES, currentStage: currentStage, day: day };
  }

  // ---- Water Scheduler panel ----
  function buildWaterData(seed) {
    var fillPct = Math.floor(seededRandom(seed) * 60) + 30;
    var target = 75;
    var stress = Math.floor(seededRandom(seed + 100) * 40);
    var deficit = Math.floor(seededRandom(seed + 200) * 50);
    var needed = fillPct < target ? Math.floor((target - fillPct) * 10) : 0;
    var status = fillPct > 80 ? 'TOO WET' : fillPct < 50 ? 'IRRIGATE' : 'MONITOR';
    var statusColor = fillPct > 80 ? '#0a84ff' : fillPct < 50 ? '#ef4444' : '#d49b28';
    return { fillPct: fillPct, target: target, stress: stress, deficit: deficit, needed: needed, status: status, statusColor: statusColor };
  }

  // ---- Advisory panel (static demo content) ----
  function buildAdvisoryItems() {
    return [
      { icon: 'water_drop', color: '#2196f3', text: 'Irrigation recommended for plots with low moisture levels within 48 hours.' },
      { icon: 'pest_control', color: '#f44336', text: 'Pest pressure increasing in Date Palm plots. Consider preventive treatment.' },
      { icon: 'agriculture', color: '#4caf50', text: 'Optimal harvest window approaching for mature plots in 2-3 weeks.' },
      { icon: 'warning', color: '#ff9800', text: 'Soil salinity trending upward in eastern plots. Monitor closely.' },
    ];
  }

  // ---- Low-confidence flags (My Farm: correct low-confidence data) ----
  var LOW_CONFIDENCE_PANELS = ['farm-info', 'weather', 'soil', 'growth', 'water', 'advisory'];
  function buildLowConfidenceFlags(selectedFarm) {
    var seed = selectedFarm ? selectedFarm.plots[0].fid : 1;
    var flags = {};
    LOW_CONFIDENCE_PANELS.forEach(function (p, i) {
      flags[p] = seededRandom(seed + i * 50) < 0.4; // ~40% chance low confidence
    });
    return flags;
  }

  // ---- Stats panel: 6-month synthetic trend history ----
  var TREND_MONTHS = 6;
  function buildTrendMonths(curAvg) {
    var months = [];
    for (var m = 0; m < TREND_MONTHS; m++) {
      var t = m / (TREND_MONTHS - 1); // 0..1
      var target = curAvg;
      var start = curAvg * (0.55 + seededRandom(m * 13 + 1) * 0.2);
      var v = start + (target - start) * t + (seededRandom(m * 7 + 3) - 0.5) * 0.08;
      months.push({ label: 'M' + (TREND_MONTHS - 5 + m), val: Math.max(0, Math.min(1, v)) });
    }
    months[TREND_MONTHS - 1].val = curAvg;
    return months;
  }

  W.mock.farmAnalysis = {
    seededRandom: seededRandom,
    assignMetrics: assignMetrics,

    HEATMAP_GRID: HEATMAP_GRID,
    hash2: hash2,
    smoothstep: smoothstep,
    valueNoise: valueNoise,
    fractalNoise: fractalNoise,
    generateHeatField: generateHeatField,

    buildFarmInfoItems: buildFarmInfoItems,
    buildWeatherData: buildWeatherData,
    buildSoilData: buildSoilData,
    buildGrowthData: buildGrowthData,
    buildWaterData: buildWaterData,
    buildAdvisoryItems: buildAdvisoryItems,
    buildLowConfidenceFlags: buildLowConfidenceFlags,

    TREND_MONTHS: TREND_MONTHS,
    buildTrendMonths: buildTrendMonths
  };

})(window.Wafra);
