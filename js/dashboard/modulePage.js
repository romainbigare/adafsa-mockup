(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // Proposal A — the reusable module-page template. Every one of the six
  // contract modules renders through THIS one component (build once, six
  // routes): a KPI strip (registry.kpis), the map coloured by that module only,
  // one legend (band shares in view), and a bottom sheet with two tabs —
  // Attention (F4 ranked farms, worst first) and Band Summary. The router calls
  // show(state, key) on entering a module route.
  // ============================================================================

  var reg = W.dashboard.moduleRegistry;
  var mods = W.dashboard.modules;

  var CUR = { key: null, module: null };
  var activeTab = 'attention';

  function selectFarm(state, f) { W.dashboard.plotsLayer.selectFarm(state, f); }
  function selectGroup(state, g) { W.dashboard.plotsLayer.selectGroup(state, g.members); }

  // ---- Attention table (ranked, worst-first) --------------------------------
  var valueCol = { key: 'value', label: 'Value', align: 'right', visible: true,
    val: function (f) { var v = CUR.module ? CUR.module.valueOf(f) : null; return v == null ? -Infinity : v; },
    text: function (f) { var v = CUR.module ? CUR.module.valueOf(f) : null; return v == null ? '—' : CUR.module.format(v); } };
  var bandCol = { key: 'band', label: 'Status', align: 'left', visible: true,
    val: function (f) { var b = CUR.module ? reg.bandOf(CUR.module, f) : null; return b ? b.label : 'zzz'; },
    text: function (f) { var b = CUR.module ? reg.bandOf(CUR.module, f) : null; return b ? b.label : '—'; },
    title: function (f) { var b = CUR.module ? reg.bandOf(CUR.module, f) : null; return b ? b.range : ''; } };

  var attentionColumns = [
    { key: 'sev', label: 'Severity', align: 'right', visible: false,
      val: function (f) { return CUR.module ? CUR.module.severity(f) : 0; },
      text: function (f) { return String(Math.round(CUR.module ? CUR.module.severity(f) : 0)); } },
    { key: 'fid', label: 'Farm ID', align: 'left', visible: true,
      val: function (f) { return f.fid; }, text: function (f) { return '#' + f.fid; } },
    { key: 'owner', label: 'Owner', align: 'left', visible: true,
      val: function (f) { return String(f.owner).toLowerCase(); }, text: function (f) { return f.owner; } },
    { key: 'area', label: 'Area (dun)', align: 'right', visible: true,
      val: function (f) { return f.area; }, text: function (f) { return (f.area || 0).toFixed(1); } },
    valueCol, bandCol
  ];

  var attentionTable = W.dashboard.dataTable.create({
    columns: attentionColumns,
    initialSortKey: 'sev', initialSortDir: 'desc',
    theadId: 'mp-att-thead', tbodyId: 'mp-att-tbody', countId: 'mp-att-count',
    columnsBtnId: 'mp-att-columns-btn', columnsMenuId: 'mp-att-columns-menu', exportBtnId: 'mp-att-export-btn',
    csvPrefix: 'attention', emptyText: 'No farms to review.',
    getRows: function (state) {
      var farms = state.farmFeatures || [];
      if (!CUR.module) return [];
      var out = [];
      for (var i = 0; i < farms.length; i++) if (CUR.module.valueOf(farms[i]) != null) out.push(farms[i]);
      return out;
    },
    onSelectRow: selectFarm
  });

  // ---- Band summary table ----------------------------------------------------
  var summaryColumns = [
    { key: 'band', label: 'Band', align: 'left', visible: true,
      val: function (g) { return g.order; }, text: function (g) { return g.label; } },
    { key: 'range', label: 'Range', align: 'left', visible: true,
      val: function (g) { return g.order; }, text: function (g) { return g.range; } },
    { key: 'count', label: 'Farms', align: 'right', visible: true,
      val: function (g) { return g.count; }, text: function (g) { return g.count.toLocaleString(); } },
    { key: 'area', label: 'Area (dun)', align: 'right', visible: true,
      val: function (g) { return g.area; }, text: function (g) { return g.area.toFixed(1); } },
    { key: 'share', label: 'Share', align: 'right', visible: true,
      val: function (g) { return g.share; }, text: function (g) { return Math.round(g.share) + '%'; } },
    { key: 'avg', label: 'Avg', align: 'right', visible: true,
      val: function (g) { return g.avg; },
      text: function (g) { return (CUR.module && g.count) ? CUR.module.format(g.avg) : '—'; } }
  ];

  var summaryTable = W.dashboard.dataTable.create({
    columns: summaryColumns,
    initialSortKey: 'band', initialSortDir: 'asc',
    theadId: 'mp-sum-thead', tbodyId: 'mp-sum-tbody', countId: 'mp-sum-count',
    columnsBtnId: 'mp-sum-columns-btn', columnsMenuId: 'mp-sum-columns-menu', exportBtnId: 'mp-sum-export-btn',
    csvPrefix: 'band-summary', emptyText: 'No farm data.',
    getRows: function (state) {
      if (!CUR.module) return [];
      var rows = mods.bandSummary(CUR.module, state.farmFeatures || []);
      rows.forEach(function (r, i) { r.fid = r.label; r.order = i; });
      return rows;
    },
    onSelectRow: selectGroup
  });

  // ---- KPI strip -------------------------------------------------------------
  function renderKpis(features) {
    var el = document.getElementById('kpi-strip');
    if (!el || !CUR.module) return;
    var tiles = CUR.module.kpis(features).map(function (k) {
      return '<div class="kpi-tile' + (k.warn ? ' warn' : '') + '">' +
        '<span class="kpi-label">' + k.label + '</span>' +
        '<span class="kpi-value">' + k.value + '</span>' +
        '</div>';
    }).join('');
    el.innerHTML = '<div class="kpi-name"><span class="material-symbols-outlined text-brand-600" style="font-size:18px;">' +
        CUR.module.icon + '</span><span>' + CUR.module.label + '</span>' +
        '<span class="kpi-fee">' + CUR.module.feePct + '% of contract</span></div>' + tiles;
  }

  // ---- Legend (in-view band shares) -----------------------------------------
  function farmsInView(state) {
    var b = state.map.getBounds();
    var farms = state.farmFeatures || [];
    var out = [];
    for (var i = 0; i < farms.length; i++) if (farms[i].centroid && b.contains(farms[i].centroid)) out.push(farms[i]);
    return out;
  }

  function renderLegend(state) {
    var el = document.getElementById('module-legend');
    if (!el || !CUR.module) return;
    var m = CUR.module;
    var counts = mods.bandCounts(m, farmsInView(state));
    var scored = 0; m.bands.forEach(function (b) { scored += counts[b.label] || 0; });
    var segs = m.bands.map(function (b) {
      var p = scored ? (counts[b.label] || 0) / scored * 100 : 0;
      return p > 0 ? '<span class="cat-chart-seg" style="width:' + p + '%;background:' + b.color + '"></span>' : '';
    }).join('');
    var rows = m.bands.map(function (b) {
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
    el.innerHTML =
      '<div class="px-3 py-2 border-b border-gray-200 bg-gray-50/80 rounded-t-lg font-label-caps text-gray-900">LEGEND</div>' +
      '<div class="p-3"><div class="cat-chart mb-2"><div class="cat-chart-bar">' + segs + '</div></div>' +
        '<div class="space-y-0.5">' + rows + '</div>' +
        '<p class="text-[10px] text-gray-400 mt-2">Shares are of farms currently in view.</p></div>';
  }

  // ---- Tabs / collapse -------------------------------------------------------
  function setTab(name) {
    activeTab = name;
    document.querySelectorAll('.mp-tab').forEach(function (t) { t.classList.toggle('active', t.dataset.mpTab === name); });
    document.querySelectorAll('.mp-panel').forEach(function (p) { p.classList.toggle('hidden', p.dataset.mpPanel !== name); });
    ['attention', 'summary'].forEach(function (t) {
      document.querySelectorAll('.mp-ctx-' + t).forEach(function (e) { e.classList.toggle('hidden', name !== t); });
    });
    attentionTable.setActive(name === 'attention');
    summaryTable.setActive(name === 'summary');
    var bar = document.getElementById('module-bar');
    if (bar && bar.classList.contains('collapsed')) {
      bar.classList.remove('collapsed');
      var chev = document.getElementById('module-bar-chevron');
      if (chev) chev.textContent = 'expand_more';
    }
  }

  function wire() {
    attentionTable.init();
    summaryTable.init();
    document.querySelectorAll('.mp-tab').forEach(function (tab) {
      tab.addEventListener('click', function () { setTab(tab.dataset.mpTab); });
    });
    var bar = document.getElementById('module-bar');
    var btn = document.getElementById('module-bar-collapse');
    var chev = document.getElementById('module-bar-chevron');
    if (btn && bar) btn.addEventListener('click', function () {
      bar.classList.toggle('collapsed');
      if (chev) chev.textContent = bar.classList.contains('collapsed') ? 'expand_less' : 'expand_more';
    });
  }

  // ---- Route entry -----------------------------------------------------------
  function setModule(key) {
    CUR.key = key;
    CUR.module = reg.byKey(key);
    if (CUR.module) valueCol.label = W.dashboard.attentionList.metricLabelFor(key);
  }

  function show(state, key) {
    setModule(key);
    if (!CUR.module) return;
    state.activeModule = key;
    W.dashboard.plotsLayer.applyColoring(state);
    renderKpis(state.farmFeatures || []);
    renderLegend(state);
    attentionTable.rebuild(state);
    summaryTable.rebuild(state);
    setTab(activeTab);
  }

  // On pan/zoom, only the in-view legend needs refreshing.
  function refresh(state) { if (CUR.module) renderLegend(state); }

  W.dashboard.modulePage = { wire: wire, show: show, refresh: refresh };

})(window.Wafra);
