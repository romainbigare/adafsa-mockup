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
  var analysisTab = 'attention';   // last analysis tab the user chose (restored on leaving layers mode)
  var BOUND_STATE = null;   // set on show(); used by the mode-switch buttons

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

  // ---- Full-dataset table (all records, both modes) --------------------------
  // A third tab that exposes the RAW dataset behind the map, past the ranked
  // Attention list and the aggregated Band summary. In analysis mode it lists
  // every farm — identity, area, overall criticality, and (optional) each
  // module's value. In layers mode it lists every taxonomy parcel with its
  // classification. Columns swap with the mode; the grid machinery is identical.
  function fmtArea(f) { return (f.area || 0).toFixed(1); }

  // Farm columns: the essentials are shown; each module's value is available via
  // the Columns menu (friendly-first, funnel the full metric set to power users).
  var farmDatasetColumns = [
    { key: 'fid', label: 'Farm ID', align: 'left', visible: true,
      val: function (f) { return f.fid; }, text: function (f) { return '#' + f.fid; } },
    { key: 'owner', label: 'Owner', align: 'left', visible: true,
      val: function (f) { return String(f.owner).toLowerCase(); }, text: function (f) { return f.owner; } },
    { key: 'crop', label: 'Crop', align: 'left', visible: true,
      val: function (f) { return String(f.type || ''); }, text: function (f) { return f.type || '—'; } },
    { key: 'area', label: 'Area (dun)', align: 'right', visible: true,
      val: function (f) { return f.area || 0; }, text: fmtArea },
    { key: 'composite', label: 'Overall', align: 'right', visible: true,
      val: function (f) { var s = reg.compositeScore(f); return s == null ? -1 : s; },
      text: function (f) { var s = reg.compositeScore(f); return s == null ? '—' : String(Math.round(s)); },
      title: function (f) { var b = reg.bandOf(reg.byKey('composite'), f); return b ? b.label : ''; } }
  ].concat(reg.MODULES.map(function (m) {
    // Namespace the module keys ('m_' + key) so a module such as Crop Monitoring
    // never collides with a base column key (the 'crop' type column).
    return { key: 'm_' + m.key, label: m.shortLabel || m.label, align: 'right', visible: false,
      val: function (f) { var v = m.valueOf(f); return v == null ? -Infinity : v; },
      text: function (f) { var v = m.valueOf(f); return v == null ? '—' : m.format(v); },
      title: function (f) { var b = reg.bandOf(m, f); return b ? b.label : ''; } };
  }));

  // Parcel columns: the taxonomy classification for every plot on the layer map.
  var parcelDatasetColumns = [
    { key: 'fid', label: 'ID', align: 'left', visible: true,
      val: function (f) { return f.fid; }, text: function (f) { return '#' + f.fid; } },
    { key: 'owner', label: 'Owner', align: 'left', visible: true,
      val: function (f) { return String(f.owner).toLowerCase(); }, text: function (f) { return f.owner; } },
    { key: 'category', label: 'Category', align: 'left', visible: true,
      val: function (f) { return String(f.category || ''); }, text: function (f) { return f.category || '—'; } },
    { key: 'type', label: 'Type', align: 'left', visible: true,
      val: function (f) { return String(f.type || ''); }, text: function (f) { return f.type || '—'; } },
    { key: 'area', label: 'Area (dun)', align: 'right', visible: true,
      val: function (f) { return f.area || 0; }, text: fmtArea }
  ];

  function datasetColumnsFor(state) { return (state && state.taxonomyView) ? parcelDatasetColumns : farmDatasetColumns; }
  function datasetRows(state) { if (!state) return []; return (state.taxonomyView ? state.allFeatures : state.farmFeatures) || []; }
  function datasetColumnKeys(state) { return datasetColumnsFor(state).map(function (c) { return c.key; }); }

  var datasetTable = W.dashboard.dataTable.create({
    columns: datasetColumnsFor,
    initialSortKey: 'composite', initialSortDir: 'desc',
    theadId: 'mp-data-thead', tbodyId: 'mp-data-tbody', countId: 'mp-data-count',
    columnsBtnId: 'mp-data-columns-btn', columnsMenuId: 'mp-data-columns-menu', exportBtnId: 'mp-data-export-btn',
    csvPrefix: 'dataset', emptyText: 'No records.',
    getRows: datasetRows,
    // A parcel row zooms/ghosts to that plot; a farm row descends to its dossier.
    onSelectRow: function (state, f) { if (state.taxonomyView) selectGroup(state, [f]); else selectFarm(state, f); }
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

  // ---- The mode switch (Analysis ↔ full taxonomy) -----------------------------
  // No persistent toggle: a single button on whichever panel is showing flips
  // modes. "Switch to full taxonomy" lives at the foot of the legend (analysis
  // mode); "Switch to analysis" at the foot of the Map Layers panel (layers
  // mode). Only the modules that own a taxonomy AND have their own analysis get
  // them (Crop Monitoring, Palms). Layers-only (Land Use & Structures) and the
  // analysis-only modules (Irrigation / Yield / Water) show neither.
  function renderModeSwitch() {
    var tax = W.dashboard.taxonomyLayers;
    var isBoth = !!tax.viewForModule(CUR.key) && !tax.isLayersOnly(CUR.key);
    var ls = document.getElementById('module-legend-switch');
    var ts = document.getElementById('tax-switch');
    if (ls) ls.classList.toggle('hidden', !isBoth);   // shown in the legend (analysis mode)
    if (ts) ts.classList.toggle('hidden', !isBoth);   // shown in the panel (layers mode)
  }

  // Called by taxonomyLayers when it enters/leaves layers mode: re-assert the
  // switch buttons AND swap the bottom-sheet tab (only the full dataset applies
  // over a taxonomy map; analysis tabs return when we leave).
  function syncModeSwitch() { renderModeSwitch(); applyTabForMode(); }

  // ---- Legend (in-view band shares) -----------------------------------------
  function farmsInView(state) {
    var b = state.map.getBounds();
    var farms = state.farmFeatures || [];
    var out = [];
    for (var i = 0; i < farms.length; i++) if (farms[i].centroid && b.contains(farms[i].centroid)) out.push(farms[i]);
    return out;
  }

  function renderLegend(state) {
    // Render into the legend BODY so the persistent switch button (a sibling)
    // survives the innerHTML replace.
    var el = document.getElementById('module-legend-body');
    if (!el || !CUR.module) return;
    // Shared legend component, scoped to the farms currently on screen.
    W.dashboard.legend.render(el, CUR.module, farmsInView(state), { scope: 'view' });
  }

  // ---- Tabs / collapse -------------------------------------------------------
  function inLayersMode() { return typeof document !== 'undefined' && document.body.classList.contains('layers-mode'); }

  // Pick the tab that fits the current mode: the full dataset over a taxonomy map
  // (the only meaningful one there), otherwise the last analysis tab the user chose.
  function applyTabForMode() { setTab(inLayersMode() ? 'dataset' : analysisTab); }

  function setTab(name, fromUser) {
    if (inLayersMode()) name = 'dataset';       // band tabs don't apply over a taxonomy map
    else if (fromUser) analysisTab = name;      // remember the analysis choice to restore on exit
    activeTab = name;
    document.querySelectorAll('.mp-tab').forEach(function (t) { t.classList.toggle('active', t.dataset.mpTab === name); });
    document.querySelectorAll('.mp-panel').forEach(function (p) { p.classList.toggle('hidden', p.dataset.mpPanel !== name); });
    ['attention', 'summary', 'dataset'].forEach(function (t) {
      document.querySelectorAll('.mp-ctx-' + t).forEach(function (e) { e.classList.toggle('hidden', name !== t); });
    });
    attentionTable.setActive(name === 'attention');
    summaryTable.setActive(name === 'summary');
    datasetTable.setActive(name === 'dataset');
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
    datasetTable.init();
    document.querySelectorAll('.mp-tab').forEach(function (tab) {
      tab.addEventListener('click', function () { setTab(tab.dataset.mpTab, true); });
    });
    var bar = document.getElementById('module-bar');
    var btn = document.getElementById('module-bar-collapse');
    var chev = document.getElementById('module-bar-chevron');
    if (btn && bar) btn.addEventListener('click', function () {
      bar.classList.toggle('collapsed');
      if (chev) chev.textContent = bar.classList.contains('collapsed') ? 'expand_less' : 'expand_more';
    });

    // Mode switch — one button per panel; the state is read at click time.
    var legendSwitch = document.getElementById('module-legend-switch');
    if (legendSwitch) legendSwitch.addEventListener('click', function () {
      var view = W.dashboard.taxonomyLayers.viewForModule(CUR.key);
      if (view && BOUND_STATE && !BOUND_STATE.taxonomyView) W.dashboard.taxonomyLayers.openFor(BOUND_STATE, view);
    });
    var taxSwitch = document.getElementById('tax-switch');
    if (taxSwitch) taxSwitch.addEventListener('click', function () {
      if (BOUND_STATE && BOUND_STATE.taxonomyView) W.dashboard.taxonomyLayers.close(BOUND_STATE);
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

    renderModeSwitch();
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
    datasetTable.rebuild(state);
    applyTabForMode();
  }

  // On pan/zoom, only the in-view legend needs refreshing.
  function refresh(state) { if (CUR.module) renderLegend(state); }

  W.dashboard.modulePage = { wire: wire, show: show, refresh: refresh, syncModeSwitch: syncModeSwitch,
    // Pure selectors exposed for tests (see test/datasetTab.test.js).
    datasetRows: datasetRows, datasetColumnKeys: datasetColumnKeys };

})(window.Wafra);
