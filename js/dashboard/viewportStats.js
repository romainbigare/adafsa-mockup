(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // Renders one taxonomy tree (LAND_USE_TREE or CROP_TREE) with checkboxes
  // and per-type/category counts + area into the given mount element.
  // catBadgeMode: 'pct' (Overview/Land Use uses count-of-viewport-farms %)
  //            or 'area' (Trees tab uses rounded dunums).
  function renderTree(state, elId, tree, emptyMsg, catBadgeMode) {
    var el = document.getElementById(elId);
    if (!el) return;

    el.innerHTML = tree.map(function (cat) {
      var catData = state.vpCats[cat.name] || { count: 0, area: 0 };
      var childTypes = cat.types.map(function (t) { return t.name; });
      if (state.layerGroups[cat.name]) childTypes.push(cat.name);
      var layerChildTypes = childTypes.filter(function (t) { return state.layerGroups[t]; });
      var allChecked = layerChildTypes.every(function (t) { return state.layerVisibility[t]; });
      var hasAnyLayer = childTypes.some(function (t) { return state.layerGroups[t]; });

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
            '<span class="font-data-sm text-gray-400" style="font-size:10px">' + td.count + '</span>' +
            '<span class="font-data-sm text-gray-400" style="font-size:9px">' + Math.round(td.area) + 'd</span>' +
            '<input type="checkbox" ' + (checked ? 'checked' : '') + ' class="cursor-pointer accent-brand-600 vp-layer-toggle" data-type="' + t.name + '" style="width:11px;height:11px" ' + (!hasLayer ? 'disabled' : '') + '>' +
          '</div>' +
        '</div>';
      }).join('');

      var catBadge = catBadgeMode === 'area'
        ? Math.round(catData.area) + 'd'
        : (state.vpFarms ? Math.round(catData.count / state.vpFarms * 100) : 0) + '%';

      return '<div class="mb-1">' +
        '<div class="flex items-center justify-between py-0.5">' +
          '<div class="flex items-center gap-1.5 min-w-0">' +
            '<span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" style="background:' + cat.color + '"></span>' +
            '<span class="text-xs text-gray-700 font-medium truncate">' + cat.name + '</span>' +
          '</div>' +
          '<div class="flex items-center gap-1.5 flex-shrink-0">' +
            '<span class="font-data-sm text-gray-500">' + catData.count + '</span>' +
            '<span class="font-data-sm text-gray-400" style="font-size:9px">' + catBadge + '</span>' +
            '<input type="checkbox" ' + (allChecked ? 'checked' : '') + ' class="cursor-pointer accent-brand-600 vp-layer-toggle vp-cat-toggle" data-cat="' + cat.name + '" style="width:11px;height:11px" ' + (!hasAnyLayer ? 'disabled' : '') + '>' +
          '</div>' +
        '</div>' +
        '<div class="border-l-2 border-gray-100 ml-1.5">' + typeRows + '</div>' +
      '</div>';
    }).join('') || '<p class="text-xs text-gray-400">' + emptyMsg + '</p>';

    el.querySelectorAll('.vp-layer-toggle').forEach(function (cb) {
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

    // Overview tab
    var farmsEl = document.getElementById('vp-farms');
    var areaEl = document.getElementById('vp-area');
    if (farmsEl) farmsEl.textContent = state.totalFarms;
    if (areaEl) areaEl.innerHTML = Math.round(state.vpArea).toLocaleString() + ' <span class="font-data-sm text-gray-500">dun</span>';

    // Land Use tab — full tree with checkboxes + area
    renderTree(state, 'vp-landuse', W.dashboard.taxonomy.LAND_USE_TREE, 'No features in view', 'pct');

    // Trees tab — full tree with checkboxes + area
    renderTree(state, 'vp-trees', W.dashboard.taxonomy.CROP_TREE, 'No trees in view', 'area');
  }

  // Tab switching for viewport stats
  function wireTabs(state) {
    var tabs = document.querySelectorAll('.vp-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        document.querySelectorAll('.vp-panel').forEach(function (p) { p.classList.add('hidden'); });
        var panel = document.querySelector('.vp-panel[data-panel="' + tab.dataset.tab + '"]');
        if (panel) panel.classList.remove('hidden');
        state.activeTab = tab.dataset.tab;
        if (tab.dataset.tab === 'overview') W.dashboard.plotsLayer.loadDataset(state, 'plots');
        else if (tab.dataset.tab === 'landuse') W.dashboard.plotsLayer.loadDataset(state, 'landuse');
        else if (tab.dataset.tab === 'trees') W.dashboard.plotsLayer.loadDataset(state, 'crops');
      });
    });
    // Default to overview tab
    var overviewTab = document.querySelector('.vp-tab[data-tab="overview"]');
    if (overviewTab) overviewTab.classList.add('active');
  }

  function wireSelectAll(state) {
    document.querySelectorAll('.vp-select-all').forEach(function (btn) {
      btn.addEventListener('click', function () {
        for (var type in state.layerGroups) state.layerVisibility[type] = true;
        if (!state.clusterActive) W.dashboard.plotsLayer.updateLayerMode(state);
        update(state);
      });
    });
    document.querySelectorAll('.vp-unselect-all').forEach(function (btn) {
      btn.addEventListener('click', function () {
        for (var type in state.layerGroups) state.layerVisibility[type] = false;
        if (!state.clusterActive) W.dashboard.plotsLayer.updateLayerMode(state);
        update(state);
      });
    });
  }

  W.dashboard.viewportStats = {
    update: update,
    wireTabs: wireTabs,
    wireSelectAll: wireSelectAll
  };

})(window.Wafra);
