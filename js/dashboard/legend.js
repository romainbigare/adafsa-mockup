(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // One legend, used everywhere a module's bands are explained: the module page
  // (scope 'view' — shares of farms currently on screen) and the Situation map
  // (scope 'all' — the whole region). The scope chip is printed in the header so
  // the two never silently disagree (the "17% here vs 16% there" ambiguity).
  //
  // Count share, not area share, to match the module page's existing legend.
  //
  // opts.stats — optional [{ value, label }] rolled up by the CALLER (the legend
  // knows bands, not the region), rendered as a small grid above the bands. The
  // Situation screen uses it for "how much are we watching?" headline numbers.
  // ============================================================================

  var mods = W.dashboard.modules;
  function T(key, fallback, vars) { return W.str ? W.str(key, vars) : fallback; }

  function scopeLabel(scope) {
    return scope === 'all' ? T('scopeAll', 'All farms') : T('scopeInView', 'In view');
  }

  function render(el, module, features, opts) {
    if (!el || !module) return;
    opts = opts || {};
    var scope = opts.scope === 'all' ? 'all' : 'view';

    var counts = mods.bandCounts(module, features || []);
    var scored = 0;
    module.bands.forEach(function (b) { scored += counts[b.label] || 0; });

    var segs = module.bands.map(function (b) {
      var p = scored ? (counts[b.label] || 0) / scored * 100 : 0;
      return p > 0
        ? '<span class="cat-chart-seg" style="width:' + p + '%;background:' + b.color + '" title="' + b.label + ' — ' + Math.round(p) + '%"></span>'
        : '';
    }).join('');

    var rows = module.bands.map(function (b) {
      var p = scored ? Math.round((counts[b.label] || 0) / scored * 100) : 0;
      return '<div class="flex items-center justify-between py-0.5">' +
          '<div class="flex items-center gap-1.5 min-w-0">' +
            '<span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" style="background:' + b.color + '"></span>' +
            '<span class="text-xs text-gray-700 truncate">' + b.label + '</span>' +
          '</div>' +
          '<div class="flex items-center gap-2 flex-shrink-0 pl-2">' +
            '<span class="text-[10px] text-gray-400 font-mono whitespace-nowrap">' + b.range + '</span>' +
            '<span class="text-xs text-gray-500 tabular-nums w-8 text-right">' + p + '%</span>' +
          '</div></div>';
    }).join('');

    var header =
      '<div class="px-3 py-2 border-b border-gray-200 bg-gray-50/80 rounded-t-lg flex items-center gap-2">' +
        (opts.showIcon && module.icon
          ? '<span class="material-symbols-outlined text-brand-600" style="font-size:16px;">' + module.icon + '</span>' : '') +
        '<span class="font-label-caps text-gray-900 truncate">' + (opts.title || 'LEGEND') + '</span>' +
        '<span class="legend-scope ml-auto">' + scopeLabel(scope) + '</span>' +
      '</div>';

    var stats = (opts.stats || []).map(function (s) {
      return '<div class="legend-stat">' +
          '<div class="legend-stat-value">' + s.value + '</div>' +
          '<div class="legend-stat-label">' + s.label + '</div>' +
        '</div>';
    }).join('');

    el.innerHTML = header +
      (stats ? '<div class="legend-stats">' + stats + '</div>' : '') +
      '<div class="p-3">' +
        '<div class="cat-chart mb-2"><div class="cat-chart-bar">' + segs + '</div></div>' +
        '<div class="space-y-0.5">' + rows + '</div>' +
        '<p class="text-[10px] text-gray-400 mt-2">' +
          (scope === 'all' ? T('legendFootAll', 'Shares are of farms across the whole region.')
                           : T('legendFootView', 'Shares are of farms currently in view.')) + '</p>' +
      '</div>';
  }

  W.dashboard.legend = { render: render, scopeLabel: scopeLabel };

})(window.Wafra);
