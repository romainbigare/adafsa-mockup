(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // Map Layers — the taxonomy browser, restored from the classic Overview.
  //
  // A slide-in panel that lists the FULL Land Use / Crops / Trees taxonomy
  // (category -> granular type) with a checkbox on every node. Ticking a type
  // shows those parcels on the map; unticking hides them. This is the "see the
  // whole taxonomy, tick what to draw" capability the three layout proposals
  // dropped when they specialised the map around the six contract modules.
  //
  // Opening the panel puts the shared map into "layers mode": it loads the
  // matching dataset (landuse / crops — the datasets that actually carry the
  // granular types) and colours every parcel by its taxonomy value instead of
  // by a module band. Closing it (or navigating to a module / dial view) hands
  // the map back to the host layout, which reloads the farm boundaries and
  // re-applies its own colouring via the `restore` hook.
  //
  // Shared verbatim by all three proposals (A / A2 / B). Each page supplies
  // only a `restore(state)` that re-activates its own current view, and mounts
  // the panel markup + a Layers toggle button somewhere on its map chrome.
  // ============================================================================

  var VIEWS = [
    { key: 'landuse', label: 'Land Use', icon: 'terrain' },
    { key: 'crops',   label: 'Crops',    icon: 'grass' },
    { key: 'trees',   label: 'Trees',    icon: 'park' }
  ];

  function treeFor(view) {
    var tax = W.dashboard.taxonomy;
    return view === 'landuse' ? tax.LAND_USE_TREE
      : view === 'crops' ? tax.CROPS_TREE
      : tax.TREES_TREE;
  }
  // Land Use lives in its own dataset; Crops and Trees are two views of the
  // shared crops dataset (Trees = the woody-perennial categories of it).
  function datasetFor(view) { return view === 'landuse' ? 'landuse' : 'crops'; }

  var els = {};
  var restore = null;            // host hook: re-activate the page's current view
  var lastView = 'landuse';      // remembered across open/close
  var expanded = {};             // "view|category" -> bool (categories open by default)
  var counts = { types: {}, cats: {} };
  var pendingRestore = null;     // one-shot: run after a plots reload finishes

  function $(id) { return document.getElementById(id); }

  // ---- open / close ----------------------------------------------------------
  function panelOpen() { return els.panel && !els.panel.classList.contains('tax-hidden'); }

  // Entering layers mode pauses the host module's chrome (see .layers-mode CSS)
  // so it never asserts module facts over a taxonomy map. The bottom sheet is
  // auto-collapsed; a badge names the module to return to.
  function enterLayersMode() {
    if (typeof document === 'undefined') return;
    document.body.classList.add('layers-mode');
    var bar = document.getElementById('module-bar');
    if (bar) bar.classList.add('collapsed');
    var txt = document.getElementById('layers-badge-text');
    if (txt && W.dashboard.router && W.dashboard.moduleRegistry) {
      var r = W.dashboard.router.current();
      var m = r && r.key && W.dashboard.moduleRegistry.byKey(r.key);
      txt.textContent = m
        ? (W.str ? W.str('layersPaused', { module: m.label }) : m.label + ' paused — showing Map Layers')
        : (W.str ? W.str('layersPausedGeneric') : 'Map Layers — module data paused');
    }
  }
  function exitLayersMode() {
    if (typeof document === 'undefined') return;
    document.body.classList.remove('layers-mode');
    var bar = document.getElementById('module-bar');
    if (bar) bar.classList.remove('collapsed');
  }

  function showPanel() { if (els.panel) els.panel.classList.remove('tax-hidden'); if (els.toggle) els.toggle.classList.add('active'); enterLayersMode(); }
  function hidePanel() { if (els.panel) els.panel.classList.add('tax-hidden'); if (els.toggle) els.toggle.classList.remove('active'); exitLayersMode(); }

  function open(state) { showPanel(); enter(state, lastView); }
  function close(state) { hidePanel(); leaveTaxonomy(state, restore); }
  function toggle(state) { panelOpen() ? close(state) : open(state); }

  // ---- enter a taxonomy view -------------------------------------------------
  function enter(state, view) {
    lastView = view;
    state.taxonomyView = view;
    state.activeModule = null;                 // colour by taxonomy value, not a band
    markSwitcher();
    var ds = datasetFor(view);
    if (state.currentDataset !== ds) {
      // Stream the dataset in; onDataset() runs on completion via the wrapped
      // onRefresh hook (plotsLayer.finishLoading calls state.onRefresh).
      W.dashboard.plotsLayer.loadDataset(state, ds);
    } else {
      onDataset(state);                        // dataset already present — apply now
    }
  }

  // Applied once the active view's dataset is on the map.
  function onDataset(state) {
    applyVisibility(state);
    W.dashboard.plotsLayer.applyColoring(state);
    W.dashboard.plotsLayer.updateLayerMode(state);
    computeCounts(state);
    buildTree(state);
  }

  // The leaf type names that belong to a view's taxonomy.
  function ownTypes(view) {
    var out = [];
    treeFor(view).forEach(function (cat) {
      cat.types.forEach(function (t) { out.push(t.name); });
    });
    return out;
  }

  // Pure decision: which of `allTypes` should be drawn for a given view. Land
  // Use covers its whole dataset; Crops / Trees each show only their own half of
  // the shared crops dataset (so switching between them re-filters, not reloads).
  function visibilityFor(view, allTypes) {
    var own = ownTypes(view);
    var out = {};
    allTypes.forEach(function (t) {
      out[t] = (view === 'landuse') ? true : (own.indexOf(t) !== -1);
    });
    return out;
  }

  // Show only the parcels belonging to the active view's taxonomy.
  function applyVisibility(state) {
    var vis = visibilityFor(state.taxonomyView, Object.keys(state.layerGroups));
    for (var t in vis) state.layerVisibility[t] = vis[t];
  }

  // Common exit: drop the taxonomy flag, make sure the farm boundaries are back,
  // then run `after` (the host's restore). Deferred until the reload finishes so
  // the host colours plots, not a half-cleared taxonomy dataset.
  function leaveTaxonomy(state, after) {
    state.taxonomyView = null;
    if (state.currentDataset !== 'plots') {
      pendingRestore = after || null;
      W.dashboard.plotsLayer.loadDataset(state, 'plots');
    } else if (after) {
      after(state);
    }
  }

  // Called by the host's route / dial guards BEFORE they colour the map, so a
  // navigation out of layers mode reloads plots first. Returns true if it took
  // over (caller should return and let `after` re-drive once plots is back).
  function ensurePlots(state, after) {
    if (!state.taxonomyView && state.currentDataset === 'plots') return false;
    hidePanel();
    leaveTaxonomy(state, after);
    return true;
  }

  // ---- in-view counts (item count + area, per type & category) ---------------
  function computeCounts(state) {
    var b = state.map.getBounds();
    var types = {}, cats = {};
    var fs = state.allFeatures;
    for (var i = 0; i < fs.length; i++) {
      var f = fs[i];
      if (!f.centroid || !b.contains(f.centroid)) continue;
      if (!types[f.type]) types[f.type] = { count: 0, area: 0 };
      types[f.type].count++; types[f.type].area += f.area;
      if (!cats[f.category]) cats[f.category] = { count: 0, area: 0 };
      cats[f.category].count++; cats[f.category].area += f.area;
    }
    counts.types = types; counts.cats = cats;
  }

  function refreshCounts(state) {
    if (!state.taxonomyView) return;
    computeCounts(state);
    buildTree(state);
  }

  // ---- the taxonomy tree -----------------------------------------------------
  function buildTree(state) {
    if (!els.content) return;
    var view = state.taxonomyView;
    if (!view) return;
    var tree = treeFor(view);
    var plots = W.dashboard.plotsLayer;

    // Denominator = total in-view area across this taxonomy's own categories, so
    // shares read as "% of the land in view that is this type" (area, not count).
    var total = 0;
    tree.forEach(function (cat) { if (counts.cats[cat.name]) total += counts.cats[cat.name].area; });
    function pct(n) { return (total ? Math.round(n / total * 100) : 0) + '%'; }

    var chartSegs = tree.map(function (cat) {
      var c = counts.cats[cat.name];
      var p = (c && total) ? (c.area / total * 100) : 0;
      return p > 0 ? '<span class="cat-chart-seg" style="width:' + p + '%;background:' + cat.color + '" title="' + cat.name + ' — ' + Math.round(p) + '%"></span>' : '';
    }).join('');

    var body = tree.map(function (cat) {
      var catData = counts.cats[cat.name] || { count: 0, area: 0 };
      var childTypes = cat.types.map(function (t) { return t.name; });
      var layerChildTypes = childTypes.filter(function (t) { return state.layerGroups[t]; });
      var allChecked = layerChildTypes.length > 0 && layerChildTypes.every(function (t) { return state.layerVisibility[t]; });
      var hasAnyLayer = layerChildTypes.length > 0;
      var key = view + '|' + cat.name;
      var isOpen = expanded[key] !== false;    // categories expanded by default

      var typeRows = cat.types.map(function (t) {
        var td = counts.types[t.name] || { count: 0, area: 0 };
        var hasLayer = !!state.layerGroups[t.name];
        var checked = state.layerVisibility[t.name];
        var swatch = plots.colorFor(state, t.name);   // match the on-map colour
        return '<label class="flex items-center justify-between py-0.5 pl-3 cursor-pointer hover:bg-gray-50 rounded">' +
          '<span class="flex items-center gap-1.5 min-w-0">' +
            '<span class="w-2 h-2 rounded-sm flex-shrink-0" style="background:' + swatch + '"></span>' +
            '<span class="text-xs text-gray-500 truncate">' + t.name + '</span>' +
          '</span>' +
          '<span class="flex items-center gap-1.5 flex-shrink-0 pl-1">' +
            '<span class="font-data-sm text-gray-400">' + (td.count || 0).toLocaleString() + '</span>' +
            '<span class="text-[10px] text-gray-400 w-7 text-right">' + pct(td.area) + '</span>' +
            '<input type="checkbox" ' + (checked ? 'checked' : '') + ' class="cursor-pointer accent-brand-600 tax-type" data-type="' + esc(t.name) + '" style="width:12px;height:12px" ' + (!hasLayer ? 'disabled' : '') + '>' +
          '</span>' +
        '</label>';
      }).join('');

      return '<div class="mb-1 subcat-item' + (isOpen ? ' open' : '') + '">' +
        '<div class="flex items-center justify-between py-1 subcat-toggle cursor-pointer px-1 rounded" data-expand="' + esc(key) + '">' +
          '<span class="flex items-center gap-1.5 min-w-0">' +
            '<span class="material-symbols-outlined subcat-chevron text-gray-400 flex-shrink-0" style="font-size:15px;">chevron_right</span>' +
            '<span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" style="background:' + cat.color + '"></span>' +
            '<span class="text-xs text-gray-700 font-semibold truncate">' + cat.name + '</span>' +
          '</span>' +
          '<span class="flex items-center gap-1.5 flex-shrink-0 pl-1">' +
            '<span class="font-data-sm text-gray-400">' + (catData.count || 0).toLocaleString() + '</span>' +
            '<span class="text-xs text-gray-500 w-8 text-right">' + pct(catData.area) + '</span>' +
            '<input type="checkbox" ' + (allChecked ? 'checked' : '') + ' class="cursor-pointer accent-brand-600 tax-cat" data-cat="' + esc(cat.name) + '" style="width:12px;height:12px" ' + (!hasAnyLayer ? 'disabled' : '') + '>' +
          '</span>' +
        '</div>' +
        '<div class="subcat-body border-l-2 border-gray-100 ml-1.5">' + typeRows + '</div>' +
      '</div>';
    }).join('');

    els.content.innerHTML =
      (chartSegs ? '<div class="cat-chart px-1 mb-2"><div class="cat-chart-bar">' + chartSegs + '</div></div>' : '') +
      (body || '<p class="text-xs text-gray-400 px-1 py-2">Nothing to show for this layer.</p>');

    wireTree(state, tree);
  }

  function wireTree(state, tree) {
    els.content.querySelectorAll('.subcat-toggle').forEach(function (row) {
      row.addEventListener('click', function () {
        var k = row.dataset.expand;
        var isOpen = expanded[k] !== false;
        expanded[k] = !isOpen;
        row.parentElement.classList.toggle('open', expanded[k]);
      });
    });

    els.content.querySelectorAll('.tax-cat').forEach(function (cb) {
      cb.addEventListener('click', function (e) { e.stopPropagation(); });   // don't toggle the row
      cb.addEventListener('change', function () {
        var cat = tree.filter(function (c) { return c.name === cb.dataset.cat; })[0];
        if (cat) cat.types.forEach(function (t) {
          if (state.layerGroups[t.name]) state.layerVisibility[t.name] = cb.checked;
        });
        W.dashboard.plotsLayer.updateLayerMode(state);
        buildTree(state);
      });
    });

    els.content.querySelectorAll('.tax-type').forEach(function (cb) {
      cb.addEventListener('change', function () {
        if (state.layerGroups[cb.dataset.type]) state.layerVisibility[cb.dataset.type] = cb.checked;
        W.dashboard.plotsLayer.updateLayerMode(state);
        buildTree(state);
      });
    });
  }

  // ---- switcher (Land Use / Crops / Trees) -----------------------------------
  function buildSwitcher(state) {
    if (!els.switcher) return;
    els.switcher.innerHTML = VIEWS.map(function (v) {
      return '<button class="tax-view-btn" data-view="' + v.key + '">' +
        '<span class="material-symbols-outlined" style="font-size:15px;">' + v.icon + '</span>' +
        '<span>' + v.label + '</span></button>';
    }).join('');
    els.switcher.querySelectorAll('.tax-view-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { selectView(state, btn.dataset.view); });
    });
  }
  function markSwitcher() {
    if (!els.switcher) return;
    els.switcher.querySelectorAll('.tax-view-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === lastView);
    });
  }
  function selectView(state, view) { if (view !== state.taxonomyView) enter(state, view); }

  function setAll(state, vis) {
    var view = state.taxonomyView;
    if (!view) return;
    var scope = (view === 'landuse') ? Object.keys(state.layerGroups) : ownTypes(view);
    scope.forEach(function (t) { if (state.layerGroups[t]) state.layerVisibility[t] = vis; });
    W.dashboard.plotsLayer.updateLayerMode(state);
    buildTree(state);
  }

  // Minimal attribute escaping for data-* values (type/category names).
  function esc(s) { return String(s).replace(/"/g, '&quot;'); }

  // ---- init ------------------------------------------------------------------
  function init(state, opts) {
    opts = opts || {};
    restore = opts.restore || null;
    els.panel = $('taxonomy-panel');
    els.toggle = $('toggle-taxonomy');
    els.close = $('tax-close');
    els.switcher = $('tax-switcher');
    els.content = $('tax-content');
    els.selectAll = $('tax-select-all');
    els.clear = $('tax-clear');
    if (!els.panel || !els.toggle) return;   // this page has no layers chrome

    buildSwitcher(state);
    els.toggle.addEventListener('click', function () { toggle(state); });
    if (els.close) els.close.addEventListener('click', function () { close(state); });
    els.return = $('layers-return');
    if (els.return) els.return.addEventListener('click', function () { close(state); });
    if (els.selectAll) els.selectAll.addEventListener('click', function () { setAll(state, true); });
    if (els.clear) els.clear.addEventListener('click', function () { setAll(state, false); });

    // Wrap the host's onRefresh: while layers mode is active, plotsLayer's
    // finishLoading feeds us instead of the module/dial refresh; and a deferred
    // restore (post plots-reload) fires exactly once.
    var pageRefresh = state.onRefresh;
    state.onRefresh = function (s) {
      if (s.taxonomyView) { onDataset(s); return; }
      if (pendingRestore) { var f = pendingRestore; pendingRestore = null; f(s); return; }
      if (pageRefresh) pageRefresh(s);
    };

    // Keep in-view counts live as the user pans / zooms the map.
    state.map.on('moveend', function () { refreshCounts(state); });
  }

  W.dashboard.taxonomyLayers = {
    init: init,
    ensurePlots: ensurePlots,
    open: open,
    close: close,
    toggle: toggle,
    isOpen: panelOpen,
    // Pure helpers — exposed for tests / reuse (see test/taxonomyLayers.test.js).
    datasetFor: datasetFor,
    ownTypes: ownTypes,
    visibilityFor: visibilityFor
  };

})(window.Wafra);
