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

  function findFarm(state, fid) {
    var want = String(fid);
    var fs = state.farmFeatures || [];
    for (var i = 0; i < fs.length; i++) if (String(fs[i].fid) === want) return fs[i];
    return null;
  }

  function showOverview(state) {
    W.dashboard.farmDossier.close(state);
    // If the map is in layers (taxonomy) mode, reload the farm boundaries first,
    // then re-drive this route once they're back.
    if (W.dashboard.taxonomyLayers.ensurePlots(state, function (s) { showOverview(s); })) return;
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
    W.dashboard.farmDossier.close(state);
    // Leaving layers mode: reload plots, then re-enter this module route.
    if (W.dashboard.taxonomyLayers.ensurePlots(state, function (s) { showModule(s, key); })) return;
    show('route-overview', false);
    show('module-chrome', true);
    show('map', true);
    var map = el('map');
    if (map) map.classList.remove('map-framed'); // full-height on a module page
    W.dashboard.modulePage.show(state, key);
    W.ui.renderSidebar({ active: key });
    setTimeout(function () { state.map.invalidateSize(); }, 0);
  }

  // #/farm/<fid> — the dossier drawer over the module map. Keeps the current
  // module's colouring; a cold deep-link colours by the farm's worst module.
  function showFarm(state, fid) {
    if (W.dashboard.taxonomyLayers.ensurePlots(state, function (s) { showFarm(s, fid); })) return;
    var feature = findFarm(state, fid);
    if (!feature) { location.hash = '#/overview'; return; }
    var key = state.activeModule || W.dashboard.farmDossier.worstModuleKey(feature);
    show('route-overview', false);
    show('module-chrome', true);
    show('map', true);
    var map = el('map');
    if (map) map.classList.remove('map-framed');
    W.dashboard.modulePage.show(state, key);
    W.ui.renderSidebar({ active: key });
    setTimeout(function () {
      state.map.invalidateSize();
      W.dashboard.farmDossier.open(state, feature);
    }, 0);
  }

  function apply(state) {
    var r = parse();
    if (r.name === 'module') showModule(state, r.key);
    else if (r.name === 'farm') showFarm(state, r.id);
    else showOverview(state);
    window.scrollTo(0, 0);
  }

  // Re-render the current route's numbers WITHOUT touching the map viewport —
  // what the FILTERING panel needs when the working set changes (a full apply()
  // would re-fit the map and yank the view out from under the user).
  function refreshAnalysis(state) {
    var r = parse();
    if (r.name === 'overview') W.dashboard.overview.render(state);
    else W.dashboard.modulePage.refreshAnalysis(state);
  }

  function init(state) {
    window.addEventListener('hashchange', function () { apply(state); });
    if (!location.hash) location.hash = '#/overview';
    else apply(state);
  }

  W.dashboard.router = { init: init, apply: apply, refreshAnalysis: refreshAnalysis, current: parse };

})(window.Wafra);
