(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // TEST — one soft heat surface, two modes.
  //
  // SCALAR (analysis): a CRITICALITY field, density-independent. A normal density
  //   heatmap blends "how critical" with "how many farms are here", so a few
  //   critical farms among healthy ones wash out. Here every farm stamps a blob
  //   and overlaps combine with a distance-weighted power mean (p≈2, between
  //   average and max); the field value is then contrast-stretched to this lens's
  //   distribution and mapped green → amber → red. So a handful of critical farms
  //   still colour their area by criticality itself, not by crowd size.
  //   Criticality per farm = a faint baseline (healthy = faintly green) + the
  //   farm's normalised severity under the active lens (composite / band).
  //
  // COLOUR (layer views): the SAME soft-blob machinery, but each visible parcel
  //   stamps its taxonomy layer colour and overlaps blend by a distance-weighted
  //   RGB average — so land use / crops / trees read as coloured blobs at every
  //   zoom, at mid opacity, matching the analysis heat's look.
  // ============================================================================

  var BASELINE = 0.12;            // faint green floor for a healthy farm

  function severityFor(state, farm) {
    var reg = W.dashboard.moduleRegistry;
    var key = state.activeModule;
    if (!key || !reg) return 0;
    if (key === 'composite') {
      var s = reg.compositeScore(farm);
      return (s == null) ? 0 : Math.min(1, s / 55);   // score 55+ reads full-hot
    }
    var m = reg.byKey(key);
    if (!m || !m.worstSev) return 0;                    // categorical / unknown → no boost
    var b = reg.bandOf(m, farm);
    return b ? (b.sev || 0) / m.worstSev : 0;
  }
  function intensityOf(state, farm) { return BASELINE + (1 - BASELINE) * severityFor(state, farm); }

  // Parse a taxonomy swatch ("#16a34a" / "#999") to [r,g,b] for the colour field.
  function hexToRgb(hex) {
    if (!hex) return null;
    hex = String(hex).trim();
    if (hex.charAt(0) === '#') hex = hex.slice(1);
    if (hex.length === 3) hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
    if (hex.length < 6) return null;
    var n = parseInt(hex.slice(0, 6), 16);
    if (isNaN(n)) return null;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  // Retained for tests: [lat, lng, intensity] per on-map farm.
  function points(state) {
    var farms = state.farmFeatures || [], pts = [];
    for (var i = 0; i < farms.length; i++) {
      var f = farms[i];
      if (!f.centroid || f._offMap) continue;
      pts.push([f.centroid[0], f.centroid[1], intensityOf(state, f)]);
    }
    return pts;
  }

  // ---- Colour lookup table: value [0..1] → rgba (green→amber→red) ------------
  var STOPS = [
    [0.00, [26, 152, 80]],
    [0.25, [120, 198, 121]],
    [0.45, [254, 224, 139]],
    [0.62, [253, 141, 60]],
    [0.80, [240, 59, 32]],
    [1.00, [176, 0, 38]]
  ];
  var LUT = (function () {
    var lut = new Uint8ClampedArray(256 * 4);
    for (var i = 0; i < 256; i++) {
      var v = i / 255, rgb = [26, 152, 80];
      for (var s = 1; s < STOPS.length; s++) {
        if (v <= STOPS[s][0]) {
          var a = STOPS[s - 1], b = STOPS[s];
          var t = (v - a[0]) / (b[0] - a[0] || 1);
          rgb = [Math.round(a[1][0] + (b[1][0] - a[1][0]) * t),
                 Math.round(a[1][1] + (b[1][1] - a[1][1]) * t),
                 Math.round(a[1][2] + (b[1][2] - a[1][2]) * t)];
          break;
        }
      }
      // Alpha: transparent at zero, mid-opacity that rises with criticality so
      // the satellite always shows through but critical spots read clearly.
      var alpha = v <= 0.02 ? 0 : Math.min(200, 45 + 165 * v);
      lut[i * 4] = rgb[0]; lut[i * 4 + 1] = rgb[1]; lut[i * 4 + 2] = rgb[2]; lut[i * 4 + 3] = alpha;
    }
    return lut;
  })();

  // ---- The Leaflet layer -----------------------------------------------------
  // Guarded so the pure helpers (severityFor / points) still load under Node in
  // tests, where Leaflet (L) is absent.
  var CriticalityHeat = (typeof L !== 'undefined' && L.Layer) ? L.Layer.extend({
    // power: blend between average (1) and max (∞); ~2 emphasises criticality.
    // lo/hiAnchor: the meaningful criticality range, stretched across the full
    //   green→red gradient (the data lives here, so this is where contrast lives).
    // coverageRef: total weight at which the field is fully opaque (edge fade).
    options: { radius: 62, pane: 'heatPane', downsample: 2, power: 2, loAnchor: 0.2, hiAnchor: 0.88, loFloor: 0.18, coverageRef: 1.0, maxAlpha: 205, colorMaxAlpha: 150 },
    initialize: function (opts) { L.setOptions(this, opts); this._farms = []; this._intensity = null; this._colorFn = null; this._mode = 'scalar'; this._lo = 0.2; this._hi = 0.88; },

    // SCALAR mode (analysis): a criticality field, contrast-stretched to a
    // green→red gradient. Used by every band/composite lens.
    setData: function (farms, intensityFn) {
      this._mode = 'scalar';
      this._farms = farms || [];
      this._intensity = intensityFn;
      this._computeAnchors();
      if (this._map) this._redraw();
      return this;
    },

    // COLOUR mode (layer views): the SAME soft heat surface, but each parcel
    // stamps its taxonomy layer colour and overlaps blend by distance-weighted
    // average. colorFn(farm) → [r,g,b] or null to skip (e.g. a hidden type).
    setColorData: function (farms, colorFn) {
      this._mode = 'color';
      this._farms = farms || [];
      this._colorFn = colorFn;
      if (this._map) this._redraw();
      return this;
    },

    // Anchor the colour gradient to THIS lens's criticality distribution, so the
    // least-critical farmland reads green and the worst reads red even when the
    // whole region is broadly critical — that's how "where is it worse?" shows.
    // A green floor keeps genuinely-healthy areas green (absolute meaning kept
    // at the low end). Stable across pan/zoom (computed once per lens, not per view).
    _computeAnchors: function () {
      var crits = [], i;
      if (this._intensity) {
        for (i = 0; i < this._farms.length; i++) {
          var f = this._farms[i];
          if (f.centroid && !f._offMap) crits.push(this._intensity(f));
        }
      }
      if (crits.length < 20) { this._lo = this.options.loAnchor; this._hi = this.options.hiAnchor; return; }
      crits.sort(function (a, b) { return a - b; });
      var pc = function (q) { return crits[Math.min(crits.length - 1, Math.floor(crits.length * q))]; };
      var lo = Math.max(this.options.loFloor, pc(0.15));
      this._lo = lo;
      this._hi = Math.max(lo + 0.15, pc(0.90));
    },

    onAdd: function (map) {
      this._map = map;
      if (!this._canvas) this._initCanvas();
      this.getPane().appendChild(this._canvas);
      map.on('moveend', this._reset, this);
      if (map.options.zoomAnimation && L.Browser.any3d) map.on('zoomanim', this._animateZoom, this);
      this._reset();
    },
    onRemove: function (map) {
      L.DomUtil.remove(this._canvas);
      map.off('moveend', this._reset, this);
      if (map.options.zoomAnimation) map.off('zoomanim', this._animateZoom, this);
    },

    _initCanvas: function () {
      var canvas = this._canvas = L.DomUtil.create('canvas', 'leaflet-layer');
      canvas.style.pointerEvents = 'none';
      var origin = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
      canvas.style[origin] = '50% 50%';
      var size = this._map.getSize();
      canvas.width = size.x; canvas.height = size.y;
    },

    _reset: function () {
      var topLeft = this._map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(this._canvas, topLeft);
      var size = this._map.getSize();
      if (this._canvas.width !== size.x) this._canvas.width = size.x;
      if (this._canvas.height !== size.y) this._canvas.height = size.y;
      this._redraw();
    },

    _animateZoom: function (e) {
      var scale = this._map.getZoomScale(e.zoom),
          offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());
      if (L.DomUtil.setTransform) L.DomUtil.setTransform(this._canvas, offset, scale);
      else this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
    },

    _redraw: function () {
      if (!this._map || !this._canvas) return;
      if (this._mode === 'color') { this._redrawColor(); return; }
      var map = this._map, size = map.getSize(), w = size.x, h = size.y;
      var ctx = this._canvas.getContext('2d');
      ctx.clearRect(0, 0, w, h);
      if (!this._farms.length || !this._intensity) return;

      // Build a smooth CRITICALITY FIELD via a distance-weighted power mean:
      //   value(px) = ( Σ w·crit^p / Σ w )^(1/p)
      // p=1 is a plain average (washes out lone critical farms); p→∞ is max
      // (red dots). p≈3 sits between: critical farms pull the local colour toward
      // red, but the colour is the AREA'S criticality level, not a blob's peak —
      // so it stops reading as density. `denom` doubles as coverage (edge fade).
      var ds = this.options.downsample, bw = Math.ceil(w / ds), bh = Math.ceil(h / ds);
      var numer = new Float32Array(bw * bh), denom = new Float32Array(bw * bh);
      var R = this.options.radius / ds, R2 = R * R;
      var P = this.options.power, invP = 1 / P;
      var farms = this._farms, fn = this._intensity;
      for (var i = 0; i < farms.length; i++) {
        var f = farms[i];
        if (!f.centroid || f._offMap) continue;
        var pt = map.latLngToContainerPoint(f.centroid);
        var cx = pt.x / ds, cy = pt.y / ds;
        if (cx < -R || cx > bw + R || cy < -R || cy > bh + R) continue;
        var crit = fn(f);
        var critP = Math.pow(crit, P);
        var x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(bw - 1, Math.ceil(cx + R));
        var y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(bh - 1, Math.ceil(cy + R));
        for (var y = y0; y <= y1; y++) {
          for (var x = x0; x <= x1; x++) {
            var dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
            if (d2 > R2) continue;
            var t = d2 / R2;                       // 0 at centre, 1 at edge
            var wgt = (1 - t) * (1 - t);           // smooth weight, 0 at edge
            var idx = y * bw + x;
            numer[idx] += wgt * critP;
            denom[idx] += wgt;
          }
        }
      }

      // Colourise: colour from the field VALUE (contrast-stretched to this lens's
      // criticality distribution), alpha from coverage × value.
      var WREF = this.options.coverageRef, LO = this._lo, HI = this._hi, span = (HI - LO) || 1;
      var img = ctx.createImageData(bw, bh), data = img.data;
      for (var j = 0; j < denom.length; j++) {
        var o = j * 4, d = denom[j];
        if (d <= 1e-6) { data[o + 3] = 0; continue; }
        var value = Math.pow(numer[j] / d, invP);                 // 0..1 criticality level
        var vn = (value - LO) / span; vn = vn < 0 ? 0 : vn > 1 ? 1 : vn;  // stretch to gradient
        var li = (vn * 255 | 0) * 4;
        var coverage = d < WREF ? d / WREF : 1;                   // fade where farms are sparse
        var alpha = coverage * (0.42 + 0.58 * vn) * this.options.maxAlpha;
        data[o] = LUT[li]; data[o + 1] = LUT[li + 1]; data[o + 2] = LUT[li + 2];
        data[o + 3] = alpha;
      }
      var off = this._buffer || (this._buffer = document.createElement('canvas'));
      off.width = bw; off.height = bh;
      off.getContext('2d').putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(off, 0, 0, bw, bh, 0, 0, w, h);
    },

    // Layer-colour field: identical soft-blob machinery, but instead of a scalar
    // value → LUT we blend the parcels' own RGB colours (distance-weighted mean).
    // Overlapping types mix; sparse edges fade via coverage. Mid opacity so the
    // satellite and the polygons underneath still read at close zoom.
    _redrawColor: function () {
      var map = this._map, size = map.getSize(), w = size.x, h = size.y;
      var ctx = this._canvas.getContext('2d');
      ctx.clearRect(0, 0, w, h);
      if (!this._farms.length || !this._colorFn) return;

      var ds = this.options.downsample, bw = Math.ceil(w / ds), bh = Math.ceil(h / ds);
      var nr = new Float32Array(bw * bh), ng = new Float32Array(bw * bh),
          nb = new Float32Array(bw * bh), denom = new Float32Array(bw * bh);
      var R = this.options.radius / ds, R2 = R * R;
      var farms = this._farms, fn = this._colorFn;
      for (var i = 0; i < farms.length; i++) {
        var f = farms[i];
        if (!f.centroid || f._offMap) continue;
        var rgb = fn(f);
        if (!rgb) continue;
        var pt = map.latLngToContainerPoint(f.centroid);
        var cx = pt.x / ds, cy = pt.y / ds;
        if (cx < -R || cx > bw + R || cy < -R || cy > bh + R) continue;
        var x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(bw - 1, Math.ceil(cx + R));
        var y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(bh - 1, Math.ceil(cy + R));
        for (var y = y0; y <= y1; y++) {
          for (var x = x0; x <= x1; x++) {
            var dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
            if (d2 > R2) continue;
            var t = d2 / R2, wgt = (1 - t) * (1 - t);
            var idx = y * bw + x;
            nr[idx] += wgt * rgb[0]; ng[idx] += wgt * rgb[1]; nb[idx] += wgt * rgb[2];
            denom[idx] += wgt;
          }
        }
      }

      var WREF = this.options.coverageRef, MAXA = this.options.colorMaxAlpha;
      var img = ctx.createImageData(bw, bh), data = img.data;
      for (var j = 0; j < denom.length; j++) {
        var o = j * 4, d = denom[j];
        if (d <= 1e-6) { data[o + 3] = 0; continue; }
        var coverage = d < WREF ? d / WREF : 1;
        data[o] = nr[j] / d; data[o + 1] = ng[j] / d; data[o + 2] = nb[j] / d;
        data[o + 3] = coverage * MAXA;
      }
      var off = this._buffer || (this._buffer = document.createElement('canvas'));
      off.width = bw; off.height = bh;
      off.getContext('2d').putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(off, 0, 0, bw, bh, 0, 0, w, h);
    }
  }) : null;

  // ---- Public API ------------------------------------------------------------
  var layer = null;

  function init(state) {
    if (!CriticalityHeat) return;
    state.map.createPane('heatPane');
    var pane = state.map.getPane('heatPane');
    pane.style.zIndex = 250;
    pane.style.pointerEvents = 'none';
    layer = new CriticalityHeat();
    layer.addTo(state.map);
    state.heatLayer = layer;
    update(state);
  }

  function update(state) {
    if (!layer) return;
    if (state.taxonomyView) {
      // Layer view: same soft surface, coloured by each visible parcel's
      // taxonomy layer colour (hidden types drop out).
      var plots = W.dashboard.plotsLayer;
      layer.setColorData(state.allFeatures || [], function (f) {
        if (state.layerVisibility[f.type] === false) return null;
        return hexToRgb(plots.colorFor(state, f.type));
      });
      return;
    }
    layer.setData(state.farmFeatures || [], function (f) { return intensityOf(state, f); });
  }

  W.dashboard.heatLayer = { init: init, update: update, points: points, severityFor: severityFor, hexToRgb: hexToRgb };

})(window.Wafra);
