(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // Farm-boundary band module panels (Irrigation Efficiency / Yield Forecast /
  // Crop Water Allocation). Each is a collapsible floating panel that, when
  // opened, colours the farm boundaries on the map by its band and lists the
  // bands with live in-view counts. Opening a module is mutually exclusive with
  // the Land Use / Crops / Trees category browsers — both want to own the map's
  // shapes, so activating one deactivates the other.
  //
  // Band definitions + classification live in modules.js; map recolouring lives
  // in plotsLayer.js. This file is only the panel DOM + wiring.
  // ============================================================================

  function panelEl(key) {
    return document.querySelector('.mod-panel[data-mod-panel="' + key + '"]');
  }

  // ---- Legend rendering (static; counts are filled in by update) ------------
  function bandRow(band) {
    return '<div class="flex items-center justify-between py-0.5" data-band="' + band.label + '">' +
        '<div class="flex items-center gap-1.5 min-w-0">' +
          '<span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" style="background:' + band.color + '"></span>' +
          '<span class="text-xs text-gray-700 truncate" title="' + band.label + '">' + band.label + '</span>' +
        '</div>' +
        '<div class="flex items-center gap-2 flex-shrink-0 pl-2">' +
          '<span class="text-[10px] text-gray-400 font-mono whitespace-nowrap">' + band.range + '</span>' +
          '<span class="text-xs text-gray-500 tabular-nums w-8 text-right" data-band-pct>0%</span>' +
        '</div>' +
      '</div>';
  }

  function build() {
    W.dashboard.modules.MODULES.forEach(function (m) {
      var el = document.querySelector('.mod-panel[data-mod-panel="' + m.key + '"] [data-mod-legend]');
      if (el) el.innerHTML = m.bands.map(bandRow).join('');
    });
  }

  // ---- Live counts ----------------------------------------------------------
  // Farms whose centroid falls in the current viewport (module values live on
  // the persistent farm snapshot, so this is valid regardless of which dataset
  // is currently on the map).
  function visibleFarms(state) {
    var bounds = state.map.getBounds();
    var farms = state.farmFeatures || [];
    var out = [];
    for (var i = 0; i < farms.length; i++) {
      var f = farms[i];
      if (f.centroid && bounds.contains(f.centroid)) out.push(f);
    }
    return out;
  }

  // Stacked-bar summary of the band shares (mirrors the category panels' chart).
  function renderChart(panel, module, counts, total) {
    var el = panel.querySelector('[data-mod-chart]');
    if (!el) return;
    if (!total) { el.innerHTML = ''; return; }
    var segs = module.bands.map(function (band) {
      var p = (counts[band.label] || 0) / total * 100;
      if (p <= 0) return '';
      return '<span class="cat-chart-seg" style="width:' + p + '%;background:' + band.color +
        '" title="' + band.label + ' — ' + Math.round(p) + '%"></span>';
    }).join('');
    el.innerHTML = '<div class="cat-chart-bar">' + segs + '</div>';
  }

  function update(state) {
    var mods = W.dashboard.modules;
    var farms = visibleFarms(state);
    var total = farms.length;
    mods.MODULES.forEach(function (m) {
      var panel = panelEl(m.key);
      if (!panel) return;
      var counts = mods.bandCounts(m, farms);
      // Each band's share of the farms in view, as a %.
      m.bands.forEach(function (band) {
        var cell = panel.querySelector('[data-band="' + band.label + '"] [data-band-pct]');
        if (cell) cell.textContent = (total ? Math.round((counts[band.label] || 0) / total * 100) : 0) + '%';
      });
      renderChart(panel, m, counts, total);
    });
  }

  // ---- Activation -----------------------------------------------------------
  function activate(state, key) {
    // Modules and the category browsers can't both own the map's shapes.
    document.querySelectorAll('.cat-panel').forEach(function (p) { p.classList.remove('open'); });
    var wasCategory = !!state.activeCategory;
    state.activeCategory = null;

    document.querySelectorAll('.mod-panel').forEach(function (p) { p.classList.remove('open'); });
    var target = panelEl(key);
    if (target) target.classList.add('open');
    state.activeModule = key;

    if (wasCategory) {
      // Coming back from a landuse/crops dataset: reload the farm boundaries.
      // The stream + finishLoading path recolours by band and refreshes counts.
      W.dashboard.plotsLayer.loadDataset(state, 'plots');
    } else {
      W.dashboard.plotsLayer.applyColoring(state);
      W.dashboard.viewportStats.update(state);
    }
    // Keep the bottom sheet in sync — show this module's summary tab.
    W.dashboard.liveBar.setTab(key);
  }

  // Clicking a module tab in the bottom sheet: activate the module (which also
  // colours the map + opens its left panel) if it isn't already; otherwise just
  // re-reveal the tab. Mirrors viewportStats.selectCategoryTab.
  function selectModuleTab(state, key) {
    if (state.activeModule !== key) activate(state, key);
    else W.dashboard.liveBar.setTab(key);
  }

  // Clears module selection + panel UI only. The caller is responsible for the
  // follow-up recolour (either the category-open flow or the toggle-off below).
  function deactivate(state) {
    document.querySelectorAll('.mod-panel').forEach(function (p) { p.classList.remove('open'); });
    state.activeModule = null;
  }

  function wire(state) {
    document.querySelectorAll('.mod-panel').forEach(function (panel) {
      var head = panel.querySelector('.cat-head');
      var key = panel.dataset.modPanel;
      if (!head) return;
      head.addEventListener('click', function () {
        if (state.activeModule === key) {
          // Toggle the active module off → back to taxonomy colouring.
          deactivate(state);
          W.dashboard.plotsLayer.applyColoring(state);
          W.dashboard.viewportStats.update(state);
          if (W.dashboard.liveBar.getActiveTab() === key) W.dashboard.liveBar.setTab('farms');
        } else {
          activate(state, key);
        }
      });
    });
  }

  W.dashboard.modulesPanel = {
    build: build,
    wire: wire,
    update: update,
    activate: activate,
    deactivate: deactivate,
    selectModuleTab: selectModuleTab
  };

})(window.Wafra);
