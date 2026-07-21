(function (W) {
  "use strict";

  W.ui.renderSidebar({ active: 'dashboard' });
  W.ui.renderTicker();

  var mapCtx = W.map.create('map');
  var state = W.dashboard.state.create(mapCtx.map, mapCtx);

  W.dashboard.plotsLayer.init(state);
  W.dashboard.violationsPanel.init(state);

  // ---- Controls ----
  W.ui.wireZoom(state.map, { inId: 'zoom-in', outId: 'zoom-out' });

  var locateBtn = document.getElementById('locate-me');
  if (locateBtn) {
    locateBtn.addEventListener('click', function () {
      state.map.setView([23.85, 53.78], 10);
    });
  }

  W.ui.wireBasemap(mapCtx, {
    btnId: 'toggle-basemap',
    onToggle: function () {
      for (var type in state.layerGroups) {
        if (state.layerVisibility[type]) state.map.addLayer(state.layerGroups[type]);
      }
    }
  });

  W.dashboard.layersPanel.wireControls(state);
  W.dashboard.viewportStats.wireTabs(state);
  W.dashboard.viewportStats.wireSelectAll(state);
  W.dashboard.metricSelector.init(state);

  // Update on map move/zoom
  state.map.on('moveend', function () { W.dashboard.viewportStats.update(state); });
  state.map.on('zoomend', function () {
    W.dashboard.plotsLayer.updateLayerMode(state);
    W.dashboard.viewportStats.update(state);
  });

  // ---- Load inline GeoJSON (serverless, no fetch needed) ----
  W.dashboard.plotsLayer.loadDataset(state, 'plots');

})(window.Wafra);
