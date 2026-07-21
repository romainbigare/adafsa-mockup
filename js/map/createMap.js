(function (W) {
  "use strict";

  // Creates a Leaflet map wired to the two basemaps declared in W.config.map.tiles.
  // opts: { center, zoom } — both optional, fall back to W.config.map.defaults.
  // Returns { map, satellite, street, toggleBasemap, getBasemap }.
  function create(elementId, opts) {
    opts = opts || {};
    var cfg = W.config.map;
    var defaults = cfg.defaults;

    var map = L.map(elementId, {
      center: opts.center || defaults.center,
      zoom: opts.zoom || defaults.zoom,
      zoomControl: false,
      attributionControl: true
    });

    var satellite = L.tileLayer(cfg.tiles.satellite.url, cfg.tiles.satellite.options).addTo(map);
    var street = L.tileLayer(cfg.tiles.street.url, cfg.tiles.street.options);

    var current = 'satellite';

    function toggleBasemap() {
      if (current === 'satellite') {
        map.removeLayer(satellite);
        street.addTo(map);
        current = 'street';
      } else {
        map.removeLayer(street);
        satellite.addTo(map);
        current = 'satellite';
      }
      return current;
    }

    function getBasemap() {
      return current;
    }

    return {
      map: map,
      satellite: satellite,
      street: street,
      toggleBasemap: toggleBasemap,
      getBasemap: getBasemap
    };
  }

  W.map = {
    create: create
  };

})(window.Wafra);
