(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // Proposal A — a tiny hash router (buildless, no deps). Routes:
  //   #/overview     the Home scorecard (no map)
  //   #/m/<key>      a module page (map coloured by that module)
  //   #/farm/<id>    a farm drill-down (falls back to overview here; the
  //                  in-page drill is the attention-row → zoom-to-farm)
  // The single Leaflet map is created once and shown/hidden per route (hidden
  // on Overview so its geometry never reloads); invalidateSize() re-flows it
  // when a module route brings it back.
  // ============================================================================

  var reg = W.dashboard.moduleRegistry;

  function parse() {
    var h = (location.hash || '').replace(/^#/, '');
    if (h.indexOf('/m/') === 0) return { name: 'module', key: h.slice(3) };
    if (h.indexOf('/farm/') === 0) return { name: 'farm', id: h.slice(6) };
    return { name: 'overview' };
  }

  function el(id) { return document.getElementById(id); }
  function show(id, on) { var e = el(id); if (e) e.classList.toggle('route-hidden', !on); }

  // Fit the (framed) region map to every farm boundary.
  function fitFarms(state) {
    var farms = state.farmFeatures || [], pts = [];
    for (var i = 0; i < farms.length; i++) if (farms[i].centroid) pts.push(farms[i].centroid);
    if (pts.length) state.map.fitBounds(L.latLngBounds(pts), { padding: [30, 30] });
  }

  function showOverview(state) {
    show('route-overview', true);
    show('module-chrome', false);
    // A2 — the map LEADS the Home page, framed at the top (not hidden).
    show('map', true);
    var map = el('map');
    if (map) map.classList.add('map-framed');
    W.dashboard.overview.render(state);
    W.ui.renderSidebar({ active: 'overview' });
    // The map box shrank to the frame — re-flow and re-fit to the region.
    setTimeout(function () { state.map.invalidateSize(); fitFarms(state); }, 0);
  }

  function showModule(state, key) {
    if (!reg.byKey(key)) { location.hash = '#/overview'; return; }
    show('route-overview', false);
    show('module-chrome', true);
    show('map', true);
    var map = el('map');
    if (map) map.classList.remove('map-framed'); // full-height on a module page
    W.dashboard.modulePage.show(state, key);
    W.ui.renderSidebar({ active: key });
    setTimeout(function () { state.map.invalidateSize(); }, 0);
  }

  function apply(state) {
    var r = parse();
    if (r.name === 'module') showModule(state, r.key);
    else showOverview(state);
    window.scrollTo(0, 0);
  }

  function init(state) {
    window.addEventListener('hashchange', function () { apply(state); });
    if (!location.hash) location.hash = '#/overview';
    else apply(state);
  }

  W.dashboard.router = { init: init, apply: apply, current: parse };

})(window.Wafra);
