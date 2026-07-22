(function (W) {
  "use strict";

  // Proposal A — Module hub. Creates the map + state once, wires the module-page
  // chrome and map controls, then hands routing to the hash router. The map's
  // 4.4 MB of geometry loads a single time; routes only show/hide + recolour it.

  W.ui.renderSidebar({ active: 'overview' });

  var mapCtx = W.map.create('map');
  var state = W.dashboard.state.create(mapCtx.map, mapCtx);
  window.__debugState = state;

  W.dashboard.plotsLayer.init(state);
  W.dashboard.modulePage.wire();
  W.dashboard.newsBell.init();

  function initStatusBadges() {
    var scan = document.getElementById('last-scan');
    if (scan) scan.textContent = new Date(Date.now() - Math.floor(Math.random() * 3600000))
      .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    var ai = document.getElementById('last-ai-update');
    if (ai) ai.textContent = new Date(Date.now() - Math.floor(Math.random() * 6 * 3600000))
      .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  // Readiness: once the farm boundaries have streamed in, start the router.
  state.onFirstLoad = function (s) {
    initStatusBadges();
    W.dashboard.router.init(s);
  };
  // A route re-render keeps the active module's legend + overview cards fresh.
  state.onRefresh = function (s) {
    var r = W.dashboard.router.current();
    if (r.name === 'module') W.dashboard.modulePage.refresh(s);
    else W.dashboard.overview.render(s);
  };

  // Map Layers (taxonomy browser). Restoring = re-drive the current route, which
  // reloads the farm boundaries and re-applies the module colouring.
  W.dashboard.taxonomyLayers.init(state, {
    restore: function (s) { W.dashboard.router.apply(s); }
  });

  // ---- Controls ----
  W.ui.wireZoom(state.map, { inId: 'zoom-in', outId: 'zoom-out' });
  var locateBtn = document.getElementById('locate-me');
  if (locateBtn) locateBtn.addEventListener('click', function () { state.map.setView([23.85, 53.78], 10); });
  W.ui.wireBasemap(mapCtx, {
    btnId: 'toggle-basemap',
    onToggle: function () {
      for (var type in state.layerGroups) if (state.layerVisibility[type]) state.map.addLayer(state.layerGroups[type]);
    }
  });

  state.map.on('moveend', function () { W.dashboard.modulePage.refresh(state); });
  state.map.on('zoomend', function () {
    W.dashboard.plotsLayer.updateLayerMode(state);
    W.dashboard.modulePage.refresh(state);
  });

  // ---- Load the farm boundaries once ----
  W.dashboard.plotsLayer.loadDataset(state, 'plots');

})(window.Wafra);
