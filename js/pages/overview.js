(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // Proposal A2 — Home leads with the region map (all farm boundaries, framed
  // by the router via .map-framed) and the six modules become a mini launch
  // strip below it. A "Colour by" control recolours the shared map through the
  // registry; clicking a tile routes to that module's full page (identical to A).

  var reg = W.dashboard.moduleRegistry;

  var colourBy = 'structures'; // default: the land-use-tier module (region "land use" view)
  var wired = false;

  function applyColour(state) {
    state.activeModule = colourBy || null;   // '' → None (plain boundaries)
    W.dashboard.plotsLayer.applyColoring(state);
  }

  function wireColourBy(state) {
    var sel = document.getElementById('colour-by');
    if (!sel) return;
    if (!sel.options.length) {
      var opts = [{ v: '', l: 'None' }].concat(reg.MODULES.map(function (m) { return { v: m.key, l: m.label }; }));
      sel.innerHTML = opts.map(function (o) { return '<option value="' + o.v + '">' + o.l + '</option>'; }).join('');
      sel.value = colourBy;
    }
    if (!wired) {
      sel.addEventListener('change', function () { colourBy = sel.value; applyColour(state); });
      wired = true;
    }
  }

  function render(state) {
    var el = document.getElementById('overview-cards');
    if (el) {
      var farms = state.farmFeatures || [];
      var models = reg.MODULES.map(function (m) { return reg.cardModel(m, farms); });
      W.dashboard.scorecard.render(el, models, { size: 'mini' });
    }
    var meta = document.getElementById('overview-meta');
    if (meta) {
      meta.textContent = (state.totalFarmCount || 0).toLocaleString() + ' farms · ' +
        Math.round(state.totalArea || 0).toLocaleString() + ' dun';
    }
    wireColourBy(state);
    applyColour(state);
  }

  W.dashboard.overview = { render: render };

})(window.Wafra);
