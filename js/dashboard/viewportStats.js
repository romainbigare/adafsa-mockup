(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // Sum of the viewport area across a taxonomy tree's own categories. Used as
  // the denominator so each panel's percentages are relative to that panel's
  // taxonomy (Land Use / Crops / Trees), not the whole shared dataset —
  // percentages are of AREA (dunums), not shape/item count.
  function treeTotal(state, tree) {
    var total = 0;
    tree.forEach(function (cat) { if (state.vpCats[cat.name]) total += state.vpCats[cat.name].area; });
    return total;
  }

  // Which categories are currently expanded (showing their subcategory list),
  // keyed by "elId|category name" so Land Use / Crops / Trees track this
  // independently. Collapsed by default; persists across re-renders (map
  // pans, layer toggles) since renderTree() re-reads it every call.
  var expandedCats = {};

  // Renders one taxonomy tree (LAND_USE_TREE / CROPS_TREE / TREES_TREE) with
  // checkboxes and per-category / per-type share (%) into the given element.
  // Subcategories are collapsed into an expandable div per category, opened
  // only by clicking that category's row.
  function renderTree(state, elId, tree, emptyMsg) {
    var el = document.getElementById(elId);
    if (!el) return;

    var total = treeTotal(state, tree);
    function pct(n) { return (total ? Math.round(n / total * 100) : 0) + '%'; }

    el.innerHTML = tree.map(function (cat) {
      var catData = state.vpCats[cat.name] || { count: 0, area: 0 };
      var childTypes = cat.types.map(function (t) { return t.name; });
      if (state.layerGroups[cat.name]) childTypes.push(cat.name);
      var layerChildTypes = childTypes.filter(function (t) { return state.layerGroups[t]; });
      var allChecked = layerChildTypes.every(function (t) { return state.layerVisibility[t]; });
      var hasAnyLayer = childTypes.some(function (t) { return state.layerGroups[t]; });
      var expandKey = elId + '|' + cat.name;
      var isOpen = !!expandedCats[expandKey];

      var typeRows = cat.types.map(function (t) {
        var td = state.vpTypes[t.name] || { count: 0, area: 0 };
        var hasLayer = !!state.layerGroups[t.name];
        var checked = state.layerVisibility[t.name];
        return '<div class="flex items-center justify-between py-0.5 pl-3">' +
          '<div class="flex items-center gap-1.5 min-w-0">' +
            '<span class="w-2 h-2 rounded-sm flex-shrink-0" style="background:' + t.color + '"></span>' +
            '<span class="text-xs text-gray-500 truncate">' + t.name + '</span>' +
          '</div>' +
          '<div class="flex items-center gap-1.5 flex-shrink-0">' +
            '<span class="text-[10px] text-gray-400">' + pct(td.area) + '</span>' +
            '<input type="checkbox" ' + (checked ? 'checked' : '') + ' class="cursor-pointer accent-brand-600 vp-layer-toggle" data-type="' + t.name + '" style="width:11px;height:11px" ' + (!hasLayer ? 'disabled' : '') + '>' +
          '</div>' +
        '</div>';
      }).join('');

      return '<div class="mb-1 subcat-item' + (isOpen ? ' open' : '') + '">' +
        '<div class="flex items-center justify-between py-0.5 subcat-toggle cursor-pointer" data-expand-key="' + expandKey + '">' +
          '<div class="flex items-center gap-1.5 min-w-0">' +
            '<span class="material-symbols-outlined subcat-chevron text-gray-400 flex-shrink-0" style="font-size:15px;">chevron_right</span>' +
            '<span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" style="background:' + cat.color + '"></span>' +
            '<span class="text-xs text-gray-700 font-medium truncate">' + cat.name + '</span>' +
          '</div>' +
          '<div class="flex items-center gap-1.5 flex-shrink-0">' +
            '<span class="text-xs text-gray-500">' + pct(catData.area) + '</span>' +
            '<input type="checkbox" ' + (allChecked ? 'checked' : '') + ' class="cursor-pointer accent-brand-600 vp-layer-toggle vp-cat-toggle" data-cat="' + cat.name + '" style="width:11px;height:11px" ' + (!hasAnyLayer ? 'disabled' : '') + '>' +
          '</div>' +
        '</div>' +
        '<div class="subcat-body border-l-2 border-gray-100 ml-1.5">' + typeRows + '</div>' +
      '</div>';
    }).join('') || '<p class="text-xs text-gray-400">' + emptyMsg + '</p>';

    el.querySelectorAll('.subcat-toggle').forEach(function (row) {
      row.addEventListener('click', function () {
        var key = row.dataset.expandKey;
        expandedCats[key] = !expandedCats[key];
        row.parentElement.classList.toggle('open', expandedCats[key]);
      });
    });

    el.querySelectorAll('.vp-layer-toggle').forEach(function (cb) {
      cb.addEventListener('click', function (e) { e.stopPropagation(); });
      cb.addEventListener('change', function () {
        if (cb.classList.contains('vp-cat-toggle')) {
          var cat = tree.filter(function (c) { return c.name === cb.dataset.cat; })[0];
          if (cat) {
            var types = cat.types.map(function (t) { return t.name; });
            if (state.layerGroups[cat.name]) types.push(cat.name);
            types.forEach(function (t) { if (state.layerGroups[t]) state.layerVisibility[t] = cb.checked; });
          }
        } else {
          if (state.layerGroups[cb.dataset.type]) state.layerVisibility[cb.dataset.type] = cb.checked;
        }
        W.dashboard.plotsLayer.updateLayerMode(state);
        update(state);
      });
    });
  }

  // Counts features visible in current map bounds and refreshes the overview
  // stats + the Land Use / Crops & Trees tree panels.
  function update(state) {
    var bounds = state.map.getBounds();
    state.vpFarms = 0;
    state.vpArea = 0;
    state.vpTypes = {};
    state.vpCats = {};

    for (var i = 0; i < state.allFeatures.length; i++) {
      var f = state.allFeatures[i];
      if (!f.centroid) continue;
      if (bounds.contains(f.centroid)) {
        state.vpFarms++;
        state.vpArea += f.area;
        if (!state.vpTypes[f.type]) state.vpTypes[f.type] = { count: 0, area: 0 };
        state.vpTypes[f.type].count++;
        state.vpTypes[f.type].area += f.area;
        if (!state.vpCats[f.category]) state.vpCats[f.category] = { count: 0, area: 0 };
        state.vpCats[f.category].count++;
        state.vpCats[f.category].area += f.area;
      }
    }

    // Overview panel — always farm-based, computed from the persistent farm
    // (plots) snapshot rather than whatever category dataset is on the map.
    var farmArea = 0;
    var farms = state.farmFeatures || [];
    for (var fi = 0; fi < farms.length; fi++) {
      if (farms[fi].centroid && bounds.contains(farms[fi].centroid)) farmArea += farms[fi].area;
    }
    var farmsEl = document.getElementById('vp-farms');
    var areaEl = document.getElementById('vp-area');
    if (farmsEl) farmsEl.textContent = (state.totalFarmCount || 0).toLocaleString();
    if (areaEl) areaEl.innerHTML = Math.round(farmArea).toLocaleString() + ' <span class="text-xs font-normal text-gray-500">dun</span>';

    // Category browser panels — a top summary chart + the taxonomy tree. The
    // header-badge subcategory totals are static (see initCategoryBadges()).
    var tax = W.dashboard.taxonomy;
    renderCatChart(state, 'landuse', tax.LAND_USE_TREE);
    renderCatChart(state, 'crops', tax.CROPS_TREE);
    renderCatChart(state, 'trees', tax.TREES_TREE);
    renderTree(state, 'vp-landuse', tax.LAND_USE_TREE, 'No land use in view');
    renderTree(state, 'vp-crops', tax.CROPS_TREE, 'No crops in view');
    renderTree(state, 'vp-trees', tax.TREES_TREE, 'No trees in view');

    // Farm-boundary band modules (Irrigation Efficiency / Yield / Water).
    if (W.dashboard.modulesPanel) W.dashboard.modulesPanel.update(state);
  }

  // Small stacked-bar chart of the major-category shares (top of each panel).
  function renderCatChart(state, key, tree) {
    var el = document.querySelector('.cat-panel[data-cat-panel="' + key + '"] [data-cat-chart]');
    if (!el) return;
    var total = treeTotal(state, tree);
    if (!total) { el.innerHTML = ''; return; }
    var segs = tree.map(function (cat) {
      var c = state.vpCats[cat.name];
      var p = c ? (c.area / total * 100) : 0;
      if (p <= 0) return '';
      return '<span class="cat-chart-seg" style="width:' + p + '%;background:' + cat.color + '" title="' + cat.name + ' — ' + Math.round(p) + '%"></span>';
    }).join('');
    el.innerHTML = '<div class="cat-chart-bar">' + segs + '</div>';
  }

  // ---- Category panel helpers ------------------------------------------------
  function treeFor(key) {
    var tax = W.dashboard.taxonomy;
    return key === 'landuse' ? tax.LAND_USE_TREE : key === 'crops' ? tax.CROPS_TREE : tax.TREES_TREE;
  }
  function datasetFor(key) { return key === 'landuse' ? 'landuse' : 'crops'; }

  function typesOf(tree) {
    var out = [];
    tree.forEach(function (cat) {
      out.push(cat.name);
      cat.types.forEach(function (t) { out.push(t.name); });
    });
    return out;
  }

  // Header badge = number of subcategories (leaf types) in each taxonomy.
  // Purely taxonomy-derived, so it's correct at page load with no streaming.
  function initCategoryBadges() {
    var tax = W.dashboard.taxonomy;
    function countTypes(tree) {
      var n = 0;
      tree.forEach(function (cat) { n += cat.types.length; });
      return n;
    }
    function setBadge(key, tree) {
      var badge = document.querySelector('.cat-panel[data-cat-panel="' + key + '"] [data-cat-count]');
      if (badge) badge.textContent = countTypes(tree);
    }
    setBadge('landuse', tax.LAND_USE_TREE);
    setBadge('crops', tax.CROPS_TREE);
    setBadge('trees', tax.TREES_TREE);
  }

  // Opens a category (loads its dataset, marks its left panel open) and
  // switches the bottom sheet to the matching tab. Shared by both triggers:
  // clicking a left panel header (openCategory, toggles) and clicking a
  // bottom-sheet category tab (selectCategoryTab, plain selection).
  function activateCategory(state, key) {
    document.querySelectorAll('.cat-panel').forEach(function (p) { p.classList.remove('open'); });
    var target = document.querySelector('.cat-panel[data-cat-panel="' + key + '"]');
    if (target) target.classList.add('open');
    state.activeCategory = key;
    // A category browser and a farm-boundary band module can't both own the map.
    if (W.dashboard.modulesPanel) W.dashboard.modulesPanel.deactivate(state);
    W.dashboard.plotsLayer.loadDataset(state, datasetFor(key));
    W.dashboard.liveBar.setTab(key);
    update(state);
  }

  // Accordion for the detached left category panels. Expanding a panel loads
  // its dataset (Land Use → landuse, Crops/Trees → crops) and collapses the
  // others; collapsing the active one returns to the plots overview. Either
  // way, the bottom sheet's active tab is kept in sync.
  function openCategory(state, key) {
    var target = document.querySelector('.cat-panel[data-cat-panel="' + key + '"]');
    var wasOpen = target && target.classList.contains('open');

    if (wasOpen) {
      document.querySelectorAll('.cat-panel').forEach(function (p) { p.classList.remove('open'); });
      state.activeCategory = null;
      W.dashboard.plotsLayer.loadDataset(state, 'plots');
      if (W.dashboard.liveBar.getActiveTab() === key) W.dashboard.liveBar.setTab('farms');
      update(state);
    } else {
      activateCategory(state, key);
    }
  }

  // Clicking a category tab in the bottom sheet (LAND USE / CROPS / TREES):
  // plain tab-selection semantics — re-clicking the already-active tab is a
  // no-op, it never toggles the category closed (only the left panel does).
  function selectCategoryTab(state, key) {
    if (state.activeCategory !== key) activateCategory(state, key);
    else W.dashboard.liveBar.setTab(key);
  }

  function wirePanels(state) {
    document.querySelectorAll('.cat-panel').forEach(function (panel) {
      var head = panel.querySelector('.cat-head');
      if (head) head.addEventListener('click', function () { openCategory(state, panel.dataset.catPanel); });
    });
  }

  // Select-all / unselect-all, scoped to each panel's own taxonomy.
  function wireSelectAll(state) {
    document.querySelectorAll('.cat-panel').forEach(function (panel) {
      var types = typesOf(treeFor(panel.dataset.catPanel));
      function apply(vis) {
        types.forEach(function (t) { if (state.layerGroups[t]) state.layerVisibility[t] = vis; });
        if (!state.clusterActive) W.dashboard.plotsLayer.updateLayerMode(state);
        update(state);
      }
      panel.querySelectorAll('.vp-select-all').forEach(function (btn) {
        btn.addEventListener('click', function (e) { e.stopPropagation(); apply(true); });
      });
      panel.querySelectorAll('.vp-unselect-all').forEach(function (btn) {
        btn.addEventListener('click', function (e) { e.stopPropagation(); apply(false); });
      });
    });
  }

  // One-time system status badges at the bottom of the Overview tab (last
  // satellite pass / last AI assessment for the whole region). Called once,
  // after the first dataset finishes loading.
  function initStatusBadges() {
    var scanTime = new Date(Date.now() - Math.floor(Math.random() * 3600000));
    var scanEl = document.getElementById('last-scan');
    if (scanEl) scanEl.textContent = scanTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    var aiTime = new Date(Date.now() - Math.floor(Math.random() * 6 * 3600000));
    var aiEl = document.getElementById('last-ai-update');
    if (aiEl) aiEl.textContent = aiTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  W.dashboard.viewportStats = {
    update: update,
    wirePanels: wirePanels,
    wireSelectAll: wireSelectAll,
    initStatusBadges: initStatusBadges,
    initCategoryBadges: initCategoryBadges,
    selectCategoryTab: selectCategoryTab
  };

})(window.Wafra);
