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
  var BOUND_STATE = null;   // set on show(); used by syncModeToggle()

  // An attention-row click descends to ALTITUDE 3 — the farm dossier — instead
  // of only zooming: the row becomes a place with a verdict and an exit action.
  function selectFarm(state, f) { if (f && f.fid != null) location.hash = '#/farm/' + f.fid; }
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

  // ---- The dial (module switcher) — HIDDEN for now -----------------------------
  // Kept for possible reuse; the left nav already switches modules, so showing a
  // second in-map switcher was redundant. Not rendered.
  function renderDial(key) {
    var el = document.getElementById('module-dial');
    if (!el) return;
    el.innerHTML = reg.MODULES.map(function (m) {
      var active = m.key === key ? ' active' : '';
      return '<a class="module-pill' + active + '" href="#/m/' + m.key + '"' +
        (active ? ' aria-current="page"' : '') + ' title="' + m.label + '">' +
        '<span class="material-symbols-outlined">' + m.icon + '</span>' +
        '<span>' + m.shortLabel + '</span></a>';
    }).join('');
  }

  // ---- The mode toggle (Analysis ↔ Map layers) --------------------------------
  // Only the three modules that own a taxonomy get it (Structures=land use,
  // Crop Monitoring=crops, Palms=trees). Clicking flips the whole map between the
  // module's band analysis and its taxonomy browser.
  function renderModeToggle(state) {
    var el = document.getElementById('module-modetoggle');
    if (!el) return;
    var tax = W.dashboard.taxonomyLayers;
    var view = tax.viewForModule(CUR.key);
    var layersOnly = tax.isLayersOnly(CUR.key);
    // Legend sits below the toggle for "both" modules; otherwise takes its place.
    var legend = document.getElementById('module-legend');
    if (legend) legend.style.top = (view && !layersOnly) ? '120px' : '74px';
    // Layers-only modules (Land Use & Structures) have no analysis mode → no toggle.
    if (!view || layersOnly) { el.innerHTML = ''; el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    var inLayers = !!state.taxonomyView;
    el.innerHTML =
      '<button class="mode-btn' + (!inLayers ? ' active' : '') + '" data-mode="analysis">' +
        '<span class="material-symbols-outlined">insights</span>Analysis</button>' +
      '<button class="mode-btn' + (inLayers ? ' active' : '') + '" data-mode="layers">' +
        '<span class="material-symbols-outlined">layers</span>Map layers</button>';
    el.querySelector('[data-mode="analysis"]').addEventListener('click', function () {
      if (state.taxonomyView) W.dashboard.taxonomyLayers.close(state);   // → restore re-drives Analysis
    });
    el.querySelector('[data-mode="layers"]').addEventListener('click', function () {
      if (!state.taxonomyView) { W.dashboard.taxonomyLayers.openFor(state, view); syncModeToggle(); }
    });
  }

  // Re-render the toggle to reflect the current mode (called by taxonomyLayers
  // when it enters/leaves layers mode).
  function syncModeToggle() {
    if (BOUND_STATE) renderModeToggle(BOUND_STATE);
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
    // Shared legend component, scoped to the farms currently on screen.
    W.dashboard.legend.render(el, CUR.module, farmsInView(state), { scope: 'view' });
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
    BOUND_STATE = state;
    var tax = W.dashboard.taxonomyLayers;
    var layersOnly = tax.isLayersOnly(key);

    renderModeToggle(state);
    renderKpis(state.farmFeatures || []);
    // Layers-only modules have no close-to-analysis; the panel is permanent.
    var taxClose = document.getElementById('tax-close');
    if (taxClose) taxClose.style.display = layersOnly ? 'none' : '';

    if (layersOnly) {
      // No band analysis — enter the module's taxonomy browser directly.
      if (!state.taxonomyView) tax.openFor(state, tax.viewForModule(key));
      return;
    }

    state.activeModule = key;
    W.dashboard.plotsLayer.applyColoring(state);
    renderLegend(state);
    attentionTable.rebuild(state);
    summaryTable.rebuild(state);
    setTab(activeTab);
  }

  // On pan/zoom, only the in-view legend needs refreshing.
  function refresh(state) { if (CUR.module) renderLegend(state); }

  W.dashboard.modulePage = { wire: wire, show: show, refresh: refresh, syncModeToggle: syncModeToggle };

})(window.Wafra);
