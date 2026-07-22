(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // ALTITUDE 1 — The Situation screen (#/overview).
  //
  // The glancer's screen. Answers "is anything red?" before the mouse moves: a
  // plain-language verdict sentence on top, the region map (coloured by today's
  // problem, clusters badged so problems glow), six CALM status tiles below.
  //
  // Everything reads from moduleRegistry, so no number here can disagree with a
  // module page. Pure model (verdict / pickDefaultModule) is split out so it is
  // unit-tested without a browser — see test/situation.test.js.
  // ============================================================================

  var reg = W.dashboard.moduleRegistry;

  // ---- Pure model ------------------------------------------------------------

  // The verdict sentence + which modules are flagged. `models` is an array of
  // registry cardModels (one per module, in nav order).
  function verdict(models) {
    var flagged = models.filter(function (m) { return m.statusKind !== 'ok'; });
    var anyCritical = flagged.some(function (m) { return m.statusKind === 'critical'; });
    var kind = anyCritical ? 'critical' : (flagged.length ? 'warn' : 'ok');
    var total = models.length;

    var sentence;
    if (!flagged.length) {
      sentence = 'All ' + numberWord(total) + ' areas are normal.';
    } else {
      var names = flagged.map(function (m) { return m.label; });
      sentence = flagged.length + ' of ' + total + ' areas need attention — ' + joinNames(names) + '.';
    }
    return { sentence: sentence, kind: kind, keys: flagged.map(function (m) { return m.key; }) };
  }

  // The map's default "Colour by": lead with today's worst problem so first
  // paint already shows differentiated colour (never a uniform-green landing).
  // Worst = a flagged module, critical before warn, then heaviest fee share;
  // if nothing is flagged, the hero module (Palms).
  function pickDefaultModule(models) {
    var rank = { critical: 2, warn: 1, ok: 0 };
    var flagged = models.filter(function (m) { return m.statusKind !== 'ok'; });
    if (flagged.length) {
      var sorted = flagged.slice().sort(function (a, b) {
        if (rank[b.statusKind] !== rank[a.statusKind]) return rank[b.statusKind] - rank[a.statusKind];
        return b.feePct - a.feePct;
      });
      return sorted[0].key;
    }
    var hero = models.filter(function (m) { return m.hero; })[0];
    return hero ? hero.key : (models[0] && models[0].key);
  }

  function joinNames(a) {
    if (a.length === 1) return a[0];
    if (a.length === 2) return a[0] + ' and ' + a[1];
    return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  }
  function numberWord(n) {
    return ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'][n] || String(n);
  }

  // ---- Render ----------------------------------------------------------------

  var colourBy = null;     // current "Colour by" key (chosen on first render)
  var wired = false;

  function models(state) {
    var farms = state.farmFeatures || [];
    return reg.MODULES.map(function (m) { return reg.cardModel(m, farms); });
  }

  function applyColour(state) {
    state.activeModule = colourBy || null;
    W.dashboard.plotsLayer.applyColoring(state);
    renderHomeLegend(state);
  }

  function renderHomeLegend(state) {
    var el = document.getElementById('situation-legend');
    if (!el) return;
    var m = colourBy && reg.byKey(colourBy);
    if (!m) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    // Scope 'all' — the Home map shows every farm, so the legend is region-wide.
    W.dashboard.legend.render(el, m, state.farmFeatures || [], {
      scope: 'all', title: m.label, showIcon: true
    });
  }

  function renderVerdict(state, vm) {
    var el = document.getElementById('situation-verdict');
    if (!el) return;

    // Module names inside the sentence become links to their module page.
    var sentenceHtml = vm.sentence;
    var byLabel = {};
    reg.MODULES.forEach(function (m) { byLabel[m.label] = m.key; });
    Object.keys(byLabel).forEach(function (label) {
      sentenceHtml = sentenceHtml.replace(label,
        '<a href="#/m/' + byLabel[label] + '" class="situation-verdict-link">' + label + '</a>');
    });

    var icon = vm.kind === 'critical' ? 'error' : vm.kind === 'warn' ? 'warning' : 'check_circle';
    var farms = (state.totalFarmCount || 0).toLocaleString();
    var area = Math.round(state.totalArea || 0).toLocaleString();

    el.className = 'situation-verdict situation-verdict--' + vm.kind + ' pointer-events-auto';
    el.innerHTML =
      '<span class="material-symbols-outlined situation-verdict-icon">' + icon + '</span>' +
      '<span class="situation-verdict-text">' + sentenceHtml + '</span>' +
      '<span class="situation-verdict-meta">' + farms + ' farms · ' + area + ' dunums · last scan ' +
        '<span id="last-scan">' + scanTime() + '</span></span>';
  }

  // Stable "last scan" clock — computed once so re-renders don't reshuffle it.
  var _scan = null;
  function scanTime() {
    if (_scan == null) {
      var badge = document.getElementById('last-scan');
      _scan = (badge && badge.textContent && badge.textContent !== '—') ? badge.textContent : '08:35 AM';
    }
    return _scan;
  }

  function wireColourBy(state) {
    var sel = document.getElementById('colour-by');
    if (!sel) return;
    if (!sel.options.length) {
      // Overall criticality (composite) leads — the map answers "which farms
      // need attention, across everything?" — then the six single-module lenses.
      var opts = '<option value="composite">' + reg.COMPOSITE.label + '</option>';
      opts += '<option disabled>──────────</option>';
      opts += reg.MODULES.map(function (m) {
        return '<option value="' + m.key + '">' + m.label + '</option>';
      }).join('');
      sel.innerHTML = opts;
    }
    sel.value = colourBy;
    if (!wired) {
      sel.addEventListener('change', function () { colourBy = sel.value; applyColour(state); });
      wired = true;
    }
  }

  function render(state) {
    var ms = models(state);

    // Tiles (calm status size).
    var el = document.getElementById('overview-cards');
    if (el) W.dashboard.scorecard.render(el, ms, { size: 'status' });

    // Verdict.
    renderVerdict(state, verdict(ms));

    // Default "Colour by" = the composite criticality lens (no arbitrary module).
    if (colourBy == null) colourBy = 'composite';
    wireColourBy(state);
    applyColour(state);
  }

  W.dashboard.situation = {
    render: render,
    // pure — exported for tests
    verdict: verdict,
    pickDefaultModule: pickDefaultModule
  };

})(window.Wafra);
