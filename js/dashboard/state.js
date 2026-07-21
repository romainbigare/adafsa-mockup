(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // Creates the single shared mutable state/context object used by every
  // dashboard module (plotsLayer, viewportStats, layersPanel,
  // liveBar, farmTable). Nothing else on the page holds its own copy of
  // this data — everything reads/writes through this object.
  function createState(map, mapCtx) {
    return {
      map: map,
      mapCtx: mapCtx,

      // dataset / view mode
      currentDataset: 'plots',
      activeCategory: null,    // null (Overview) | 'landuse' | 'crops' | 'trees' — expanded category panel
      activeModule: null,      // null | 'ier' | 'yield' | 'water' — farm-boundary band module (mutually exclusive with a category)
      isFirstLoad: true,

      // feature/layer bookkeeping
      layerGroups: {},      // type -> L.layerGroup (individual polygons, shown when zoomed in)
      markersByType: {},    // type -> [markers] for cluster filtering
      typeCounts: {},        // type -> count
      layerVisibility: {},   // type -> bool (checkbox state)
      allFeatures: [],        // processed features for the currently loaded dataset
      totalFarms: 0,
      totalArea: 0,

      // Persistent farm (plots) snapshot — the Overview panel always reports
      // these, regardless of which category dataset (landuse/crops) is loaded.
      farmFeatures: [],
      totalFarmCount: 0,

      // clustering (clusterGroup is created by Wafra.dashboard.plotsLayer.init)
      clusterGroup: null,
      clusterActive: false,

      // selected-farm highlight layer (created by Wafra.dashboard.plotsLayer.init)
      highlightLayer: null,

      // Ghosting: when a summary-table row is selected, this holds the Set of
      // selected featureData; every other shape/cluster is dimmed. null = off.
      ghostSet: null,

      // viewport stats (recomputed by Wafra.dashboard.viewportStats.update)
      vpTypes: {},
      vpCats: {},
      vpFarms: 0,
      vpArea: 0
    };
  }

  W.dashboard.state = { create: createState };

})(window.Wafra);
