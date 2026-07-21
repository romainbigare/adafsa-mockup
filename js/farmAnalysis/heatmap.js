(function (W) {
  "use strict";

  W.farmAnalysis = W.farmAnalysis || {};

  var interp = W.color.interpolateStops;
  var TYPE_COLORS = W.color.TYPE_COLORS;
  var HEATMAP_GRID = W.mock.farmAnalysis.HEATMAP_GRID;

  function colorFor(t) { return TYPE_COLORS[t] || '#999'; }

  // ---- Heatmap color scales ----
  function growthColor(v) {
    var s = [[0, [110, 60, 30]], [0.15, [180, 130, 40]], [0.35, [210, 190, 60]], [0.5, [170, 210, 70]], [0.65, [90, 200, 80]], [0.85, [30, 150, 50]], [1, [10, 90, 30]]];
    return interp(s, v);
  }
  function irrigationColor(v) {
    var s = [[0, [210, 170, 100]], [0.2, [220, 200, 140]], [0.4, [150, 200, 180]], [0.6, [60, 170, 210]], [0.8, [20, 110, 200]], [1, [5, 40, 120]]];
    return interp(s, v);
  }
  function phenologyColor(v) {
    var s = [[0, [90, 60, 140]], [0.2, [180, 80, 160]], [0.4, [230, 140, 80]], [0.6, [200, 200, 60]], [0.8, [90, 200, 90]], [1, [20, 130, 50]]];
    return interp(s, v);
  }
  function densityColor(v) {
    var s = [[0, [240, 240, 230]], [0.25, [200, 220, 160]], [0.5, [120, 200, 100]], [0.75, [40, 160, 60]], [1, [10, 80, 30]]];
    return interp(s, v);
  }

  // Color for a heatmap value (0..1) given the current metric
  function heatmapValueColor(metric, v) {
    if (metric === 'irrigation') return irrigationColor(v);
    if (metric === 'phenology') return phenologyColor(v);
    if (metric === 'density') return densityColor(v);
    // growth-week / growth-month share the growth scale
    return growthColor(v);
  }

  // Solid outline/fallback color for a feature under the current heatmap mode
  function featureColor(f, currentHeatmap) {
    switch (currentHeatmap) {
      case 'growth-week': return growthColor(f._growthWeek);
      case 'growth-month': return growthColor(f._growthMonth);
      case 'irrigation': return irrigationColor(f._irrigation);
      case 'phenology': return phenologyColor(f._phenology);
      case 'density': return densityColor(f._density);
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
    growthColor: growthColor,
    irrigationColor: irrigationColor,
    phenologyColor: phenologyColor,
    densityColor: densityColor,
    heatmapValueColor: heatmapValueColor,
    featureColor: featureColor,

    ensureHeatmapCanvas: ensureHeatmapCanvas,
    sizeHeatmapCanvas: sizeHeatmapCanvas,
    drawHeatmapOverlay: drawHeatmapOverlay
  };

})(window.Wafra);
