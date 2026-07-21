(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // Creates the single shared mutable state/context object used by every
  // dashboard module (plotsLayer, viewportStats, layersPanel, violationsPanel,
  // liveBar, metricSelector). Nothing else on the page holds its own copy of
  // this data — everything reads/writes through this object.
  function createState(map, mapCtx) {
    return {
      map: map,
      mapCtx: mapCtx,

      // dataset / view mode
      currentDataset: 'plots',
      currentMetric: 'growth',
      activeTab: 'overview',
      isFirstLoad: true,

      // feature/layer bookkeeping
      layerGroups: {},      // type -> L.layerGroup (individual polygons, shown when zoomed in)
      markersByType: {},    // type -> [markers] for cluster filtering
      typeCounts: {},        // type -> count
      layerVisibility: {},   // type -> bool (checkbox state)
      allFeatures: [],        // processed features for viewport stats
      totalFarms: 0,
      totalArea: 0,

      // clustering (clusterGroup is created by Wafra.dashboard.plotsLayer.init)
      clusterGroup: null,
      clusterActive: false,

      // viewport stats (recomputed by Wafra.dashboard.viewportStats.update)
      vpTypes: {},
      vpCats: {},
      vpFarms: 0,
      vpArea: 0,

      // violations (violationLayer is created by Wafra.dashboard.violationsPanel.init)
      violationLayer: null,
      violationMarkers: [],
      violationVisibility: {}
    };
  }

  W.dashboard.state = { create: createState };

})(window.Wafra);
