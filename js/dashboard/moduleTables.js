(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // Irrigation Efficiency / Yield Forecast / Crop Water Allocation tabs —
  // Wafra.dashboard.dataTable instances (see dataTable.js). SUMMARY tables: one
  // row per band, aggregating farm count + total area + area share + the mean
  // metric across the whole farm snapshot (so they're valid regardless of which
  // dataset is on the map). Clicking a row fits the map to every farm in that
  // band. Band ordering (best→worst) is preserved via a hidden order value.
  // ============================================================================

  function selectRow(state, group) { W.dashboard.plotsLayer.selectGroup(state, group.members); }

  // Rows come from modules.bandSummary(); each row is tagged with fid (band
  // label, for selection) + order (band index, for the natural default sort).
  function rowsFor(moduleKey, state) {
    var m = W.dashboard.modules.byKey(moduleKey);
    var rows = W.dashboard.modules.bandSummary(m, state.farmFeatures || []);
    rows.forEach(function (r, i) { r.fid = r.label; r.order = i; });
    return rows;
  }

  function summaryColumns(moduleKey) {
    var m = W.dashboard.modules.byKey(moduleKey);
    return [
      { key: 'band', label: 'Band', align: 'left', visible: true,
        val: function (g) { return g.order; }, text: function (g) { return g.label; } },
      { key: 'range', label: 'Range', align: 'left', visible: true,
        val: function (g) { return g.order; }, text: function (g) { return g.range; } },
      { key: 'count', label: 'Farms', align: 'right', visible: true,
        val: function (g) { return g.count; }, text: function (g) { return g.count.toLocaleString(); } },
      { key: 'area', label: 'Area (dun)', align: 'right', visible: true,
        val: function (g) { return g.area; }, text: function (g) { return g.area.toFixed(1); } },
      { key: 'share', label: 'Share', align: 'right', visible: true,
        val: function (g) { return g.share; }, text: function (g) { return Math.round(g.share) + '%'; } },
      { key: 'avg', label: 'Avg', align: 'right', visible: true,
        val: function (g) { return g.avg; }, text: function (g) { return g.count ? m.format(g.avg) : '—'; } }
    ];
  }

  function makeTable(moduleKey) {
    return W.dashboard.dataTable.create({
      columns: summaryColumns(moduleKey),
      initialSortKey: 'band', initialSortDir: 'asc',
      theadId: moduleKey + '-thead-row',
      tbodyId: moduleKey + '-tbody',
      countId: moduleKey + '-table-count',
      columnsBtnId: moduleKey + '-columns-btn',
      columnsMenuId: moduleKey + '-columns-menu',
      exportBtnId: moduleKey + '-export-btn',
      csvPrefix: moduleKey + '-summary',
      emptyText: 'No farm data loaded.',
      getRows: function (state) { return rowsFor(moduleKey, state); },
      onSelectRow: selectRow
    });
  }

  W.dashboard.ierTable = makeTable('ier');
  W.dashboard.yieldTable = makeTable('yield');
  W.dashboard.waterTable = makeTable('water');

})(window.Wafra);
