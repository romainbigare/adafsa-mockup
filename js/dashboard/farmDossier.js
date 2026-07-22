(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // ALTITUDE 3 — The farm dossier (#/farm/<fid>).
  //
  // A right-side drawer over the (zoomed, highlighted) map: the AI's verdict in
  // one sentence, the six-module status, and an exit that ENDS in an action
  // (export / open Farm Analysis) — the peak-and-end of every journey, never a
  // trailing table. Every number reads from moduleRegistry, so the dossier can
  // never disagree with a module page.
  //
  // model() is pure (no DOM) and unit-tested — see test/farmDossier.test.js.
  // ============================================================================

  var reg = W.dashboard.moduleRegistry;
  var UNKNOWN = (W.dashboard.modules && W.dashboard.modules.UNKNOWN_COLOR) || '#9ca3af';
  var DRAWER_W = 380;

  // ---- Pure model ------------------------------------------------------------

  // One status row per module, worst-first, with the band severity used for
  // ordering and for the verdict lead.
  function rowsFor(feature) {
    return reg.MODULES.map(function (m) {
      var v = m.valueOf(feature);
      var band = (v == null) ? null : reg.bandOf(m, feature);
      return {
        key: m.key, label: m.label, icon: m.icon,
        scored: v != null,
        band: band ? band.label : '—',
        sev: band ? (band.sev || 0) : -1,
        value: v == null ? '—' : m.format(v),
        color: band ? band.color : UNKNOWN
      };
    });
  }

  // The AI verdict: lead with the worst finding, name a second if present.
  function verdictSentence(rows) {
    var bad = rows.filter(function (r) { return r.scored && r.sev > 0; })
      .sort(function (a, b) { return b.sev - a.sev; });
    if (!bad.length) return 'All monitored indicators look healthy on this farm.';
    var s = bad[0].label + ' is ' + bad[0].band.toLowerCase() + ' (' + bad[0].value + ')';
    if (bad[1]) s += ', and ' + bad[1].label.toLowerCase() + ' is ' + bad[1].band.toLowerCase();
    return s + '.';
  }

  function model(feature) {
    // Rows ordered worst-first for display; the raw per-module order is kept for
    // the verdict which re-sorts by severity anyway.
    var rows = rowsFor(feature).slice().sort(function (a, b) { return b.sev - a.sev; });
    return {
      fid: feature.fid,
      owner: feature.owner,
      area: feature.area,
      verdictSentence: verdictSentence(rows),
      rows: rows
    };
  }

  // The module a cold deep-link should colour the map by (the farm's worst).
  function worstModuleKey(feature) {
    var rows = rowsFor(feature).filter(function (r) { return r.scored; })
      .sort(function (a, b) { return b.sev - a.sev; });
    return (rows[0] && rows[0].sev > 0) ? rows[0].key : (reg.MODULES[0] && reg.MODULES[0].key);
  }

  // ---- Render ----------------------------------------------------------------

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function rowHtml(r) {
    var badge = r.scored
      ? '<span class="dossier-band" style="background:' + r.color + '1f;color:' + r.color + '">' + esc(r.band) + '</span>'
      : '<span class="dossier-band dossier-band--none">no data</span>';
    // Categorical modules (Structures) put the label in the band chip already —
    // don't repeat it in the value column.
    var valueText = (r.value === r.band) ? '' : r.value;
    return '<a href="#/m/' + esc(r.key) + '" class="dossier-row" title="Open ' + esc(r.label) + '">' +
        '<span class="material-symbols-outlined dossier-row-icon">' + esc(r.icon) + '</span>' +
        '<span class="dossier-row-label">' + esc(r.label) + '</span>' +
        badge +
        '<span class="dossier-row-value">' + esc(valueText) + '</span>' +
      '</a>';
  }

  function render(state, feature) {
    var el = document.getElementById('farm-dossier');
    if (!el) return;
    var m = model(feature);
    el.innerHTML =
      '<div class="dossier-head">' +
        '<div class="dossier-head-main">' +
          '<div class="dossier-title">Farm #' + esc(m.fid) + '</div>' +
          '<div class="dossier-sub">' + esc(m.owner) + ' · ' + (m.area || 0).toFixed(1) + ' dunums</div>' +
        '</div>' +
        '<button id="dossier-close" class="dossier-close" title="Close" aria-label="Close">' +
          '<span class="material-symbols-outlined">close</span></button>' +
      '</div>' +
      '<div class="dossier-verdict">' +
        '<span class="material-symbols-outlined dossier-verdict-icon">neurology</span>' +
        '<span>' + esc(m.verdictSentence) + '</span>' +
      '</div>' +
      '<div class="dossier-section-label">Module status</div>' +
      '<div class="dossier-rows">' + m.rows.map(rowHtml).join('') + '</div>' +
      '<div class="dossier-actions">' +
        '<a href="farm-analysis.html" class="dossier-btn dossier-btn--primary">' +
          '<span class="material-symbols-outlined" style="font-size:18px;">analytics</span>Open Farm Analysis</a>' +
        '<button id="dossier-export" class="dossier-btn">' +
          '<span class="material-symbols-outlined" style="font-size:18px;">download</span>Export farm (CSV)</button>' +
        '<button id="dossier-back" class="dossier-btn dossier-btn--ghost">Back to list</button>' +
      '</div>';

    var closeBtn = document.getElementById('dossier-close');
    if (closeBtn) closeBtn.addEventListener('click', function () { history.back(); });
    var backBtn = document.getElementById('dossier-back');
    if (backBtn) backBtn.addEventListener('click', function () { history.back(); });
    var exportBtn = document.getElementById('dossier-export');
    if (exportBtn) exportBtn.addEventListener('click', function () { exportCsv(m); });
  }

  // One-row CSV across every module's value + band.
  function exportCsv(m) {
    var head = ['Farm ID', 'Owner', 'Area (dun)'];
    var vals = ['#' + m.fid, '"' + String(m.owner).replace(/"/g, '""') + '"', (m.area || 0).toFixed(1)];
    m.rows.slice().sort(function (a, b) { return 0; });
    reg.MODULES.forEach(function (mod) {
      var r = m.rows.filter(function (x) { return x.key === mod.key; })[0];
      head.push(mod.label + ' (value)', mod.label + ' (band)');
      vals.push(r ? r.value : '—', r ? r.band : '—');
    });
    var csv = head.join(',') + '\n' + vals.join(',') + '\n';
    var blob = new Blob([csv], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'farm-' + m.fid + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  // ---- Open / close ----------------------------------------------------------

  function open(state, feature) {
    var el = document.getElementById('farm-dossier');
    if (!el || !feature) return;
    render(state, feature);
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    // Zoom + highlight, keeping the farm clear of the drawer on the right.
    W.dashboard.plotsLayer.selectFarm(state, feature, { padRight: DRAWER_W });
  }

  function close(state) {
    var el = document.getElementById('farm-dossier');
    if (!el) return;
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    if (W.dashboard.plotsLayer.clearSelection) W.dashboard.plotsLayer.clearSelection(state);
  }

  function isOpen() {
    var el = document.getElementById('farm-dossier');
    return !!(el && el.classList.contains('open'));
  }

  W.dashboard.farmDossier = {
    open: open, close: close, isOpen: isOpen, render: render,
    // pure — exported for tests
    model: model, verdictSentence: verdictSentence, worstModuleKey: worstModuleKey
  };

})(window.Wafra);
