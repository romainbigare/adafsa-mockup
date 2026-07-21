(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // Farms tab — a Wafra.dashboard.dataTable instance (see dataTable.js) bound
  // to the persistent farm snapshot (state.farmFeatures), NOT whatever dataset
  // is currently loaded on the map — so it only ever shows farms, even while
  // a Land Use / Crops / Trees category is loaded for the map/its own tab.
  // ============================================================================

  var metrics = W.mock.metrics;

  function metricVal(f, m) { return metrics.getMetricValue(f, m); }
  function irrigationLabel(f) {
    var i = Math.round(metricVal(f, 'irrigation'));
    return metrics.IRRIGATION_LABELS[Math.max(0, Math.min(3, i))];
  }

  var COLUMNS = [
    { key: 'fid', label: 'Farm ID', align: 'left', visible: true,
      val: function (f) { return f.fid; }, text: function (f) { return '#' + f.fid; } },
    { key: 'owner', label: 'Owner', align: 'left', visible: true,
      val: function (f) { return String(f.owner).toLowerCase(); }, text: function (f) { return f.owner; } },
    { key: 'category', label: 'Category', align: 'left', visible: false,
      val: function (f) { return String(f.category).toLowerCase(); }, text: function (f) { return f.category; } },
    { key: 'type', label: 'Main Cultivar', align: 'left', visible: true,
      val: function (f) { return String(f.type).toLowerCase(); }, text: function (f) { return f.type; } },
    { key: 'area', label: 'Area (dun)', align: 'right', visible: true,
      val: function (f) { return f.area; }, text: function (f) { return f.area.toFixed(1); } },
    { key: 'grade', label: 'Grade', align: 'right', visible: true,
      val: function (f) { return metricVal(f, 'grade'); }, text: function (f) { return metricVal(f, 'grade').toFixed(1) + '/5'; } },
    { key: 'growth', label: 'Growth', align: 'right', visible: true,
      val: function (f) { return metricVal(f, 'growth'); }, text: function (f) { return Math.round(metricVal(f, 'growth')) + '%'; } },
    { key: 'utilisation', label: 'Utilisation', align: 'right', visible: false,
      val: function (f) { return metricVal(f, 'utilisation'); }, text: function (f) { return Math.round(metricVal(f, 'utilisation')) + '%'; } },
    { key: 'irrigation', label: 'Irrigation', align: 'left', visible: false,
      val: function (f) { return Math.round(metricVal(f, 'irrigation')); }, text: irrigationLabel }
  ];

  W.dashboard.farmTable = W.dashboard.dataTable.create({
    columns: COLUMNS,
    theadId: 'farm-thead-row',
    tbodyId: 'farm-tbody',
    countId: 'farm-table-count',
    columnsBtnId: 'farm-columns-btn',
    columnsMenuId: 'farm-columns-menu',
    exportBtnId: 'farm-export-btn',
    csvPrefix: 'farms',
    emptyText: 'No farms loaded.',
    getRows: function (state) { return state.farmFeatures; },
    onSelectRow: function (state, feature) { W.dashboard.plotsLayer.selectFarm(state, feature); }
  });

})(window.Wafra);
