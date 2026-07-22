(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // TEST — a CRITICALITY heat surface (density-independent).
  //
  // The problem with a normal density heatmap is that it blends "how critical"
  // with "how many farms are here", so a few critical farms among healthy ones
  // wash out. This layer instead blends by MAX: every farm stamps a criticality
  // blob and, where blobs overlap, the WORST one wins. So a handful of critical
  // farms glow red even in a healthy neighbourhood, and the colour ramps
  // green → amber → red by criticality itself, not by crowd size.
  //
  // Criticality per farm = a faint baseline (healthy farms stay faintly green)
  // plus the farm's normalised severity under the active lens (composite score,
  // or a single module's band severity).
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
    options: { radius: 55, pane: 'heatPane', downsample: 2 },
    initialize: function (opts) { L.setOptions(this, opts); this._farms = []; this._intensity = null; },

    setData: function (farms, intensityFn) {
      this._farms = farms || [];
      this._intensity = intensityFn;
      if (this._map) this._redraw();
      return this;
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
      var map = this._map, size = map.getSize(), w = size.x, h = size.y;
      var ctx = this._canvas.getContext('2d');
      ctx.clearRect(0, 0, w, h);
      if (!this._farms.length || !this._intensity) return;

      // MAX-blend into a downsampled float buffer.
      var ds = this.options.downsample, bw = Math.ceil(w / ds), bh = Math.ceil(h / ds);
      var buf = new Float32Array(bw * bh);
      var R = this.options.radius / ds, R2 = R * R;
      var farms = this._farms, fn = this._intensity;
      for (var i = 0; i < farms.length; i++) {
        var f = farms[i];
        if (!f.centroid || f._offMap) continue;
        var p = map.latLngToContainerPoint(f.centroid);
        var cx = p.x / ds, cy = p.y / ds;
        if (cx < -R || cx > bw + R || cy < -R || cy > bh + R) continue;
        var crit = fn(f);
        if (crit <= 0) continue;
        var x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(bw - 1, Math.ceil(cx + R));
        var y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(bh - 1, Math.ceil(cy + R));
        for (var y = y0; y <= y1; y++) {
          for (var x = x0; x <= x1; x++) {
            var dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
            if (d2 > R2) continue;
            var fall = 1 - Math.sqrt(d2) / R; fall *= fall;   // smooth quadratic falloff
            var v = crit * fall, idx = y * bw + x;
            if (v > buf[idx]) buf[idx] = v;                   // MAX blend — worst wins
          }
        }
      }

      // Colourise the buffer, then scale it up smoothly for a soft look.
      var img = ctx.createImageData(bw, bh), data = img.data;
      for (var j = 0; j < buf.length; j++) {
        var li = Math.min(255, Math.round(buf[j] * 255)) * 4, o = j * 4;
        data[o] = LUT[li]; data[o + 1] = LUT[li + 1]; data[o + 2] = LUT[li + 2]; data[o + 3] = LUT[li + 3];
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
    if (state.taxonomyView) { layer.setData([], null); return; }   // no farm heat over a taxonomy map
    layer.setData(state.farmFeatures || [], function (f) { return intensityOf(state, f); });
  }

  W.dashboard.heatLayer = { init: init, update: update, points: points, severityFor: severityFor };

})(window.Wafra);
