(function (W) {
  "use strict";

  // Data files (data/plots.js, data/crops.js, data/landuse.js, data/farms.js)
  // are plain classic scripts that assign onto window.WafraData directly —
  // no fetch, no JSON.parse needed here since they're already parsed objects.

  function get(name) {
    var store = window.WafraData;
    if (!store || !(name in store)) {
      throw new Error('Wafra.data.get: "' + name + '" is not available on window.WafraData. ' +
        'Make sure data/' + name + '.js is loaded before this call.');
    }
    return store[name];
  }

  function features(name) {
    var fc = get(name);
    if (!fc || fc.type !== 'FeatureCollection' || !Array.isArray(fc.features)) {
      throw new Error('Wafra.data.features: "' + name + '" is not a GeoJSON FeatureCollection.');
    }
    return fc.features;
  }

  W.data = {
    get: get,
    features: features
  };

})(window.Wafra);
