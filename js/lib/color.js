(function (W) {
  "use strict";

  // ---- Color palette by Type (from plots.json / landuse.json properties) ----
  var TYPE_COLORS = {
    'Barren Land': '#f0e68c',
    'Cultivated Fields': '#78c679',
    'Fallow Land': '#c7e9c0',
    'Palm Trees': '#00ff00',
    'Fruit Trees': '#31a354',
    'Other Trees': '#a1d99b',
    'Greenhouse': '#41ab5d',
    'PolyHouse': '#74c476',
    'Glass House': '#66c2a4',
    'Shade House': '#a1d99b',
    'Open Shed': '#bdbdbd',
    'Warehouse': '#7f7f7f',
    'Residential': '#fc8d59',
    'Labour Housing': '#fed976',
    'Commercial': '#e84a3b',
    'Vehicle': '#756bb1',
    'Animal Pens': '#c49a6c',
    'Machine Storage': '#969696',
    'Water Storage': '#4fc3f7',
    'Irrigation & Utilities': '#2171b5',
    'Other Structures': '#d9d9d9'
  };

  // Interpolate between two hex colors (dashboard version) -> "rgb(r,g,b)"
  function lerpColor(c1, c2, t) {
    var r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
    var r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
    var r = Math.round(r1 + (r2 - r1) * t);
    var g = Math.round(g1 + (g2 - g1) * t);
    var b = Math.round(b1 + (b2 - b1) * t);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // Generic multi-stop interpolation (farm-analysis version).
  // stops: array of [pos, [r,g,b]], pos ascending in [0,1]. val is clamped to [0,1].
  // Returns "rgb(r,g,b)".
  function interpolateStops(stops, val) {
    val = Math.max(0, Math.min(1, val));
    for (var i = 0; i < stops.length - 1; i++) {
      if (val >= stops[i][0] && val <= stops[i + 1][0]) {
        var t = (val - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
        var c0 = stops[i][1], c1 = stops[i + 1][1];
        return 'rgb(' + Math.round(c0[0] + (c1[0] - c0[0]) * t) + ',' +
                          Math.round(c0[1] + (c1[1] - c0[1]) * t) + ',' +
                          Math.round(c0[2] + (c1[2] - c0[2]) * t) + ')';
      }
    }
    var c = stops[stops.length - 1][1];
    return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
  }

  W.color = {
    TYPE_COLORS: TYPE_COLORS,
    lerpColor: lerpColor,
    interpolateStops: interpolateStops
  };

})(window.Wafra);
