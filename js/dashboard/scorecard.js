(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // F3 — Scorecard card. Renders one module card from a registry cardModel
  // (see moduleRegistry.cardModel): fee badge, name, headline number, a status
  // chip (ok / warn) and a band-share micro-chart. One component, two sizes:
  //   size 'big'  — the Proposal A Home scorecard grid
  //   size 'mini' — the Proposal A2 launch strip under the region map
  //
  // Pure string builders (no DOM reads) so they unit-test without a browser —
  // see test/scorecard.test.js. render() is the only DOM-touching entry point.
  // ============================================================================

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Horizontal band-share strip (inline styles → no CSS dependency).
  function bandStrip(bands, height) {
    var segs = (bands || []).map(function (b) {
      if (!b.share || b.share <= 0) return '';
      return '<span title="' + esc(b.label) + ' — ' + Math.round(b.share) + '%" ' +
        'style="display:block;height:100%;width:' + b.share + '%;background:' + esc(b.color) + '"></span>';
    }).join('');
    return '<span style="display:flex;height:' + (height || 8) + 'px;border-radius:4px;overflow:hidden;' +
      'background:rgba(0,0,0,.06)">' + segs + '</span>';
  }

  // Tri-state status chip (COLOUR CONTRACT): green ok · amber warn · red critical.
  function chip(vm) {
    var cls = vm.statusKind === 'critical' ? 'scorecard-chip--critical'
      : vm.statusKind === 'warn' ? 'scorecard-chip--warn'
      : 'scorecard-chip--ok';
    return '<span class="scorecard-chip ' + cls + ' inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide">' +
      esc(vm.statusLabel) + '</span>';
  }

  // Full "big" card for the Home scorecard grid.
  function bigCard(vm) {
    return '' +
      '<a href="#/m/' + esc(vm.key) + '" data-module="' + esc(vm.key) + '" ' +
        'class="scorecard-card group block rounded-xl border bg-white p-4 shadow-sm transition ' +
        'hover:shadow-md hover:-translate-y-0.5 ' + (vm.hero ? 'border-brand-500 border-2' : 'border-gray-200') + '">' +
        '<div class="flex items-start justify-between gap-2">' +
          '<span class="font-label-caps text-gray-900 leading-tight">' + esc(vm.label) + '</span>' +
          '<span class="text-[10px] font-mono text-gray-400 flex-shrink-0" title="Share of contract fee">' + vm.feePct + '%</span>' +
        '</div>' +
        '<div class="mt-2 text-2xl font-bold text-gray-900 tabular-nums leading-none">' + esc(vm.headline) + '</div>' +
        '<div class="mt-2">' + chip(vm) + '</div>' +
        '<div class="mt-3">' + bandStrip(vm.bands, 8) + '</div>' +
      '</a>';
  }

  // Compact "mini" tile for the A2 launch strip.
  function miniCard(vm) {
    return '' +
      '<a href="#/m/' + esc(vm.key) + '" data-module="' + esc(vm.key) + '" ' +
        'class="scorecard-card scorecard-mini group block rounded-lg border bg-white p-2.5 shadow-sm transition ' +
        'hover:shadow-md ' + (vm.hero ? 'border-brand-500 border-2' : 'border-gray-200') + '">' +
        '<div class="flex items-center justify-between gap-1">' +
          '<span class="text-[10px] font-semibold uppercase tracking-wide text-gray-700 truncate">' + esc(vm.shortLabel || vm.label) + '</span>' +
          '<span class="text-[9px] font-mono text-gray-400 flex-shrink-0">' + vm.feePct + '%</span>' +
        '</div>' +
        '<div class="mt-1 text-base font-bold text-gray-900 tabular-nums leading-none truncate">' + esc(vm.headline) + '</div>' +
        '<div class="mt-1.5">' + chip(vm) + '</div>' +
      '</a>';
  }

  function cardHtml(vm, opts) {
    return (opts && opts.size === 'mini') ? miniCard(vm) : bigCard(vm);
  }

  // Render a set of module cardModels into a container element.
  //   models: array of registry.cardModel results
  //   opts.size: 'big' | 'mini'
  function render(container, models, opts) {
    if (!container) return;
    container.innerHTML = (models || []).map(function (vm) { return cardHtml(vm, opts); }).join('');
  }

  W.dashboard.scorecard = {
    cardHtml: cardHtml,
    bandStrip: bandStrip,
    render: render
  };

})(window.Wafra);
