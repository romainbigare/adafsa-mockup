(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // F4 — Ranked "attention list". A per-module farm table sorted by that
  // module's severity (most-stressed first) instead of dumping every farm.
  // Built on the shared dataTable.js factory, so it inherits sorting, column
  // reorder/visibility and CSV export for free.
  //
  // The default sort is a hidden `sev` column (module.severity, descending) so
  // the worst farms surface first; clicking any visible header re-sorts as
  // usual. A row click zooms the map to that farm (plotsLayer.selectFarm).
  //
  // create(moduleKey, ids) returns a dataTable instance; a page (A/A2 module
  // page, or B's "Farms ranked" tab) wires it to its own DOM ids.
  // ============================================================================

  function metricLabelFor(key) {
    return {
      crop: 'Cultivated', palms: 'Canopy', structures: 'Tier',
      ier: 'IER', yield: 'Yield Δ', water: 'Water Use'
    }[key] || 'Value';
  }

  // Rows = farm features carrying a value for this module (skip farms the module
  // can't score, e.g. tree-less farms under Palms), so the ranking is meaningful.
  function rowsFor(moduleKey, state) {
    var m = W.dashboard.moduleRegistry.byKey(moduleKey);
    if (!m) return [];
    var farms = state.filteredFarms || state.farmFeatures || [];
    var out = [];
    for (var i = 0; i < farms.length; i++) {
      if (m.valueOf(farms[i]) != null) out.push(farms[i]);
    }
    return out;
  }

  function columns(moduleKey) {
    var m = W.dashboard.moduleRegistry.byKey(moduleKey);
    return [
      // Hidden default-sort column: severity, worst-first.
      { key: 'sev', label: 'Severity', align: 'right', visible: false,
        val: function (f) { return m.severity(f); }, text: function (f) { return String(Math.round(m.severity(f))); } },
      { key: 'fid', label: 'Farm ID', align: 'left', visible: true,
        val: function (f) { return f.fid; }, text: function (f) { return '#' + f.fid; } },
      { key: 'owner', label: 'Owner', align: 'left', visible: true,
        val: function (f) { return String(f.owner).toLowerCase(); }, text: function (f) { return f.owner; } },
      { key: 'area', label: 'Area (dun)', align: 'right', visible: true,
        val: function (f) { return f.area; }, text: function (f) { return (f.area || 0).toFixed(1); } },
      { key: 'value', label: metricLabelFor(moduleKey), align: 'right', visible: true,
        val: function (f) { var v = m.valueOf(f); return v == null ? -Infinity : v; },
        text: function (f) { var v = m.valueOf(f); return v == null ? '—' : m.format(v); } },
      { key: 'band', label: 'Status', align: 'left', visible: true,
        val: function (f) { var b = W.dashboard.moduleRegistry.bandOf(m, f); return b ? b.label : 'zzz'; },
        text: function (f) { var b = W.dashboard.moduleRegistry.bandOf(m, f); return b ? b.label : '—'; },
        title: function (f) { var b = W.dashboard.moduleRegistry.bandOf(m, f); return b ? b.range : ''; } }
    ];
  }

  // ids: { theadId, tbodyId, countId, columnsBtnId, columnsMenuId, exportBtnId }
  function create(moduleKey, ids) {
    return W.dashboard.dataTable.create({
      columns: columns(moduleKey),
      initialSortKey: 'sev', initialSortDir: 'desc',
      theadId: ids.theadId,
      tbodyId: ids.tbodyId,
      countId: ids.countId,
      columnsBtnId: ids.columnsBtnId,
      columnsMenuId: ids.columnsMenuId,
      exportBtnId: ids.exportBtnId,
      csvPrefix: moduleKey + '-attention',
      emptyText: 'No farms to review.',
      getRows: function (state) { return rowsFor(moduleKey, state); },
      onSelectRow: function (state, feature) { W.dashboard.plotsLayer.selectFarm(state, feature); }
    });
  }

  W.dashboard.attentionList = {
    create: create,
    rowsFor: rowsFor,          // exposed for tests
    metricLabelFor: metricLabelFor
  };

})(window.Wafra);
