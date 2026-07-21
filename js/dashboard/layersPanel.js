(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // Build the Layers Panel from actual data (per-category checkbox groups).
  function build(state) {
    var layersContent = document.getElementById('layers-content');
    if (!layersContent) return;
    layersContent.innerHTML = '';

    var tax = W.dashboard.taxonomy;
    var categories;
    if (state.currentDataset === 'plots') {
      categories = { 'Plots': ['Palm', 'No Palm', 'No palm'] };
    } else if (state.currentDataset === 'crops') {
      categories = {};
      tax.CROP_TREE.forEach(function (c) {
        categories[c.name] = c.types.map(function (t) { return t.name; });
      });
    } else {
      categories = tax.CATEGORY_OF_TYPE;
    }

    Object.keys(categories).forEach(function (category) {
      var types = categories[category];
      var sec = document.createElement('div');
      sec.className = 'layer-section open border-b border-gray-100 last:border-0';

      var childCount = types.reduce(function (sum, t) { return sum + (state.typeCounts[t] || 0); }, 0);

      var header = document.createElement('div');
      header.className = 'flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors';
      header.innerHTML =
        '<div class="flex items-center gap-2">' +
          '<span class="text-sm font-semibold text-gray-800">' + category + '</span>' +
          '<span class="font-data-sm text-gray-400">' + childCount + '</span>' +
        '</div>' +
        '<span class="material-symbols-outlined chevron text-gray-400" style="font-size:18px;">expand_more</span>';
      header.onclick = function () { sec.classList.toggle('open'); };
      sec.appendChild(header);

      var content = document.createElement('div');
      content.className = 'layer-section-content px-3 pb-2';

      types.forEach(function (type) {
        var count = state.typeCounts[type] || 0;
        var hasLayer = !!state.layerGroups[type];
        var row = document.createElement('label');
        row.className = 'flex items-center justify-between py-1.5 cursor-pointer hover:bg-gray-50 rounded px-1 transition-colors';
        row.innerHTML =
          '<div class="flex items-center gap-2">' +
            '<span class="w-3 h-3 rounded-sm border border-black/10" style="background:' + W.dashboard.plotsLayer.colorFor(state, type) + '"></span>' +
            '<span class="text-xs text-gray-600">' + type + '</span>' +
            '<span class="font-data-sm text-gray-400">' + count + '</span>' +
          '</div>' +
          '<input type="checkbox" ' + (state.layerVisibility[type] ? 'checked' : '') + ' class="cursor-pointer accent-brand-600" data-type="' + type + '" ' + (!hasLayer ? 'disabled' : '') + '>';
        content.appendChild(row);
      });
      sec.appendChild(content);
      layersContent.appendChild(sec);
    });

    // Wire checkbox toggles
    layersContent.querySelectorAll('input[type=checkbox]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var type = cb.dataset.type;
        state.layerVisibility[type] = cb.checked;
        if (!state.clusterActive) W.dashboard.plotsLayer.updateLayerMode(state);
        W.dashboard.viewportStats.update(state);
      });
    });
  }

  // Wires the layers-panel slide toggle + Clear All / Fit to Selection buttons.
  function wireControls(state) {
    var layersPanelEl = document.getElementById('layers-panel');
    var toggleBtn = document.getElementById('toggle-layers');
    var closeBtn = document.getElementById('close-layers');
    if (toggleBtn && layersPanelEl) {
      toggleBtn.addEventListener('click', function () {
        layersPanelEl.classList.toggle('-translate-x-[110%]');
      });
    }
    if (closeBtn && layersPanelEl) {
      closeBtn.addEventListener('click', function () {
        layersPanelEl.classList.add('-translate-x-[110%]');
      });
    }

    var clearAllBtn = document.getElementById('clear-all');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', function () {
        for (var type in state.layerVisibility) state.layerVisibility[type] = false;
        if (!state.clusterActive) W.dashboard.plotsLayer.updateLayerMode(state);
        W.dashboard.viewportStats.update(state);
      });
    }

    var fitBtn = document.getElementById('fit-selection');
    if (fitBtn) {
      fitBtn.addEventListener('click', function () {
        var visible = [];
        Object.keys(state.layerGroups).forEach(function (type) {
          var g = state.layerGroups[type];
          if (state.map.hasLayer(g)) visible = visible.concat(g.getLayers());
        });
        if (visible.length) state.map.fitBounds(L.featureGroup(visible).getBounds(), { padding: [40, 40] });
      });
    }
  }

  W.dashboard.layersPanel = { build: build, wireControls: wireControls };

})(window.Wafra);
