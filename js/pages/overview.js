(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // Proposal A — Home. Answers "how are we doing?" in one glance: six F3
  // scorecards (one per contract module) built from the region rollups. No map.
  // Each card links to its module route (#/m/<key>). The hero card (Palms,
  // 31.6% of fee) is emphasised by the scorecard component itself.

  var reg = W.dashboard.moduleRegistry;

  function render(state) {
    var el = document.getElementById('overview-cards');
    if (!el) return;
    var farms = state.farmFeatures || [];
    var models = reg.MODULES.map(function (m) { return reg.cardModel(m, farms); });
    W.dashboard.scorecard.render(el, models, { size: 'big' });

    var meta = document.getElementById('overview-meta');
    if (meta) {
      var scan = document.getElementById('last-scan');
      var t = scan ? scan.textContent : '—';
      meta.textContent = (state.totalFarmCount || 0).toLocaleString() + ' farms · ' +
        Math.round(state.totalArea || 0).toLocaleString() + ' dun monitored · last scan ' + t;
    }
  }

  W.dashboard.overview = { render: render };

})(window.Wafra);
