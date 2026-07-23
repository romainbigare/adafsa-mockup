(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // ALTITUDE 1 — The Situation screen (#/overview).
  //
  // The glancer's screen. Answers "is anything red?" before the mouse moves: the
  // region map coloured by ONE fixed lens (overall criticality — no lens picker
  // to choose from), a legend panel carrying the region's headline statistics,
  // and six verdict tiles below.
  //
  // Everything reads from moduleRegistry, so no number here can disagree with a
  // module page. The pure model (verdict) is split out so it is unit-tested
  // without a browser — see test/situation.test.js.
  // ============================================================================

  var reg = W.dashboard.moduleRegistry;

  // The Overview map has exactly one lens: fee-weighted criticality across all
  // six modules. Picking a single module here would be arbitrary, and a picker
  // asks the glancer a question before they have seen an answer.
  var LENS = 'composite';

  // ---- Pure model ------------------------------------------------------------

  // Which modules are flagged, and how badly, from an array of registry
  // cardModels (one per module, in nav order).
  function verdict(models) {
    var flagged = models.filter(function (m) { return m.statusKind !== 'ok'; });
    var anyCritical = flagged.some(function (m) { return m.statusKind === 'critical'; });
    return {
      kind: anyCritical ? 'critical' : (flagged.length ? 'warn' : 'ok'),
      keys: flagged.map(function (m) { return m.key; }),
      total: models.length
    };
  }

  // ---- Render ----------------------------------------------------------------

  // Stable "last scan" clock — computed once so re-renders don't reshuffle it.
  var SCAN_TIME = new Date(Date.now() - Math.floor(Math.random() * 3600000))
    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // The FILTERED working set — the tiles must count the same farms the map
  // draws (see farmFilter.js).
  function farms(state) { return W.dashboard.farmFilter.farms(state); }

  function models(state) {
    var fs = farms(state);
    return reg.MODULES.map(function (m) { return reg.cardModel(m, fs); });
  }

  function applyColour(state, vm) {
    state.activeModule = LENS;
    W.dashboard.plotsLayer.applyColoring(state);
    renderHomeLegend(state, vm);
  }

  // High-level "what am I looking at?" numbers for the legend panel — the ones
  // that used to sit in the removed top bar, plus how many modules are flagged.
  // They count the WORKING set, so they never contradict a filtered map.
  function legendStats(state, vm) {
    var fs = farms(state);
    var filtered = !!state.filteredFarms;
    var area = 0;
    for (var i = 0; i < fs.length; i++) area += fs[i].area || 0;
    return [
      { value: fs.length.toLocaleString(), label: filtered ? 'Farms filtered' : 'Farms tracked' },
      { value: Math.round(area).toLocaleString(), label: 'Dunums mapped' },
      { value: vm.keys.length + ' of ' + vm.total, label: 'Modules flagged' },
      { value: SCAN_TIME, label: 'Last scan' }
    ];
  }

  function renderHomeLegend(state, vm) {
    var el = document.getElementById('situation-legend');
    if (!el) return;
    var m = reg.byKey(LENS);
    // Scope 'all' — the Home map shows every farm in the working set, so the
    // legend is region-wide (not viewport-scoped).
    W.dashboard.legend.render(el, m, farms(state), {
      scope: 'all', title: m.label, showIcon: true, stats: legendStats(state, vm)
    });
  }

  function render(state) {
    // The Overview filters by the whole crop + tree taxonomy.
    W.dashboard.filterPanel.show(state, W.dashboard.farmFilter.OVERVIEW_SCOPE);

    var ms = models(state);
    var vm = verdict(ms);

    // Verdict tiles.
    var el = document.getElementById('overview-cards');
    if (el) W.dashboard.scorecard.render(el, ms, { size: 'status' });

    applyColour(state, vm);
  }

  W.dashboard.situation = {
    render: render,
    // pure — exported for tests
    verdict: verdict
  };

})(window.Wafra);
