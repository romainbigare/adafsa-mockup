(function (W) {
  "use strict";

  W.farmAnalysis = W.farmAnalysis || {};

  var interp = W.color.interpolateStops;
  var TYPE_COLORS = W.color.TYPE_COLORS;
  var HEATMAP_GRID = W.mock.farmAnalysis.HEATMAP_GRID;

  function colorFor(t) { return TYPE_COLORS[t] || '#999'; }

  // ---- Heatmap colour scales — one per tracked module, built from the module's
  // band palette (low → high) so the map obeys the same COLOUR CONTRACT as the
  // overview (red = needs action, amber = watch, green = fine).

  // Crop Monitoring — Fallow → Partially Fallow → Cultivated.
  function cropColor(v) {
    var s = [[0, [217, 164, 65]], [0.4, [254, 224, 139]], [0.7, [145, 207, 96]], [1, [26, 152, 80]]];
    return interp(s, v);
  }
  // Palms & Fruit Trees — Severe Stress → Stressed → Fair → Healthy.
  function palmsColor(v) {
    var s = [[0, [215, 48, 39]], [0.4, [254, 224, 139]], [0.7, [145, 207, 96]], [1, [26, 152, 80]]];
    return interp(s, v);
  }
  // Irrigation Efficiency — Critical → Poor → Acceptable → Good → Excellent.
  function ierColor(v) {
    var s = [[0, [215, 48, 39]], [0.3, [252, 141, 89]], [0.55, [254, 224, 139]], [0.8, [145, 207, 96]], [1, [26, 152, 80]]];
    return interp(s, v);
  }
  // Yield Forecast — Significantly Underperforming → Below Expected → On Track → Above Expected.
  function yieldColor(v) {
    var s = [[0, [215, 48, 39]], [0.4, [253, 174, 97]], [0.7, [166, 217, 106]], [1, [26, 152, 80]]];
    return interp(s, v);
  }
  // Crop Water Allocation — diverging: Water-Stressed → Efficient → Mild Excess → Over-Allocated.
  function waterColor(v) {
    var s = [[0, [224, 130, 20]], [0.4, [26, 152, 80]], [0.7, [254, 224, 139]], [1, [179, 0, 0]]];
    return interp(s, v);
  }

  // Colour for a heatmap value (0..1) under the current module.
  function heatmapValueColor(metric, v) {
    if (metric === 'palms') return palmsColor(v);
    if (metric === 'ier') return ierColor(v);
    if (metric === 'yield') return yieldColor(v);
    if (metric === 'water') return waterColor(v);
    return cropColor(v); // crop
  }

  // Solid outline/fallback colour for a feature under the current module.
  function featureColor(f, currentHeatmap) {
    switch (currentHeatmap) {
      case 'crop': return cropColor(f._cropMon);
      case 'palms': return palmsColor(f._palms);
      case 'ier': return ierColor(f._ier);
      case 'yield': return yieldColor(f._yield);
      case 'water': return waterColor(f._water);
      default: return colorFor(f.type);
    }
  }

  // ---- Canvas overlay ----
  // All functions below take an explicit `state` object owned by the page
  // controller — { map, allFeatures, currentHeatmap, heatmapOpacity,
  // heatmapCanvas, heatmapCtx } — instead of relying on hidden globals.
  // heatmapCanvas/heatmapCtx are written back onto `state` by ensureHeatmapCanvas.

  function ensureHeatmapCanvas(state) {
    if (state.heatmapCanvas) return;
    var container = state.map.getContainer();
    var canvas = document.createElement('canvas');
    canvas.className = 'leaflet-heatmap-canvas';
    container.appendChild(canvas);
    state.heatmapCanvas = canvas;
    state.heatmapCtx = canvas.getContext('2d');
    // Reposition on map move/zoom
    state.map.on('move zoom viewreset moveend zoomend', function () { drawHeatmapOverlay(state); });
    state.map.on('resize', function () { sizeHeatmapCanvas(state); drawHeatmapOverlay(state); });
    sizeHeatmapCanvas(state);
  }

  function sizeHeatmapCanvas(state) {
    if (!state.heatmapCanvas) return;
    var size = state.map.getSize();
    state.heatmapCanvas.width = size.x;
    state.heatmapCanvas.height = size.y;
    state.heatmapCanvas.style.width = size.x + 'px';
    state.heatmapCanvas.style.height = size.y + 'px';
  }

  // Draw the detailed per-shape heatmap onto the canvas overlay
  function drawHeatmapOverlay(state) {
    if (!state.heatmapCtx) return;
    sizeHeatmapCanvas(state);
    var ctx = state.heatmapCtx;
    ctx.clearRect(0, 0, state.heatmapCanvas.width, state.heatmapCanvas.height);
    if (!state.allFeatures.length) return;

    // All metrics now use per-shape heatmap fields
    state.allFeatures.forEach(function (item) {
      var ring = item.rings[0];
      if (!ring || ring.length < 3) return;

      // Project ring to pixel space (ring items are [lat, lng] arrays)
      var px = ring.map(function (p) { return state.map.latLngToContainerPoint(p); });
      var xs = px.map(function (p) { return p.x; }), ys = px.map(function (p) { return p.y; });
      var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
      var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
      var w = maxX - minX, h = maxY - minY;
      if (w < 2 || h < 2) return;

      ctx.save();
      // Clip to polygon shape
      ctx.beginPath();
      ctx.moveTo(px[0].x, px[0].y);
      for (var i = 1; i < px.length; i++) ctx.lineTo(px[i].x, px[i].y);
      ctx.closePath();
      ctx.clip();

      // Detailed per-shape heatmap from precomputed field
      var field = item.feature._fields[state.currentHeatmap];
      var grid = HEATMAP_GRID;
      var cellW = w / grid, cellH = h / grid;
      for (var j = 0; j < grid; j++) {
        for (var k = 0; k < grid; k++) {
          var v = field[j * grid + k];
          ctx.fillStyle = heatmapValueColor(state.currentHeatmap, v);
          ctx.globalAlpha = state.heatmapOpacity;
          ctx.fillRect(minX + k * cellW, minY + j * cellH, cellW + 1, cellH + 1);
        }
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    });
  }

  W.farmAnalysis.heatmap = {
    cropColor: cropColor,
    palmsColor: palmsColor,
    ierColor: ierColor,
    yieldColor: yieldColor,
    waterColor: waterColor,
    heatmapValueColor: heatmapValueColor,
    featureColor: featureColor,

    ensureHeatmapCanvas: ensureHeatmapCanvas,
    sizeHeatmapCanvas: sizeHeatmapCanvas,
    drawHeatmapOverlay: drawHeatmapOverlay
  };

})(window.Wafra);
