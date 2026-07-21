(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // Land Use / Crops / Trees tabs — Wafra.dashboard.dataTable instances (see
  // dataTable.js). These are SUMMARY tables: one row per type (not per parcel),
  // aggregating shape count + total area + area share across all loaded parcels
  // of that category. Only populated while their matching dataset is loaded on
  // the map (landuse for Land Use; crops for Crops & Trees, split by taxonomy).
  // Clicking a row fits the map to every parcel of that type.
  // ============================================================================

  // Roll the given parcels up into one record per `type`.
  function summarize(features) {
    var total = 0;
    var byType = {};
    for (var i = 0; i < features.length; i++) {
      var f = features[i];
      var area = f.area || 0;
      total += area;
      var key = f.type;
      if (!byType[key]) byType[key] = { fid: key, type: f.type, category: f.category, count: 0, area: 0, members: [] };
      var g = byType[key];
      g.count++;
      g.area += area;
      g.members.push(f);
    }
    return Object.keys(byType).map(function (k) {
      var g = byType[k];
      g.share = total ? g.area / total * 100 : 0;
      return g;
    });
  }

  // Summary column set. `nameLabel` renames the first column per taxonomy
  // (Land Use / Crop / Tree). Each table gets its own array (columns reorder
  // in place).
  function summaryColumns(nameLabel) {
    return [
      { key: 'type', label: nameLabel, align: 'left', visible: true,
        val: function (g) { return String(g.type).toLowerCase(); }, text: function (g) { return g.type; } },
      { key: 'category', label: 'Category', align: 'left', visible: true,
        val: function (g) { return String(g.category).toLowerCase(); }, text: function (g) { return g.category; } },
      { key: 'count', label: 'Shapes', align: 'right', visible: true,
        val: function (g) { return g.count; }, text: function (g) { return g.count.toLocaleString(); } },
      { key: 'area', label: 'Area (dun)', align: 'right', visible: true,
        val: function (g) { return g.area; }, text: function (g) { return g.area.toFixed(1); } },
      { key: 'share', label: 'Share', align: 'right', visible: true,
        val: function (g) { return g.share; }, text: function (g) { return Math.round(g.share) + '%'; } }
    ];
  }

  function categoryNameSet(tree) {
    var names = {};
    tree.forEach(function (cat) { names[cat.name] = true; });
    return names;
  }

  function selectRow(state, group) { W.dashboard.plotsLayer.selectGroup(state, group.members); }

  W.dashboard.landUseTable = W.dashboard.dataTable.create({
    columns: summaryColumns('Land Use'),
    initialSortKey: 'area', initialSortDir: 'desc',
    theadId: 'landuse-thead-row',
    tbodyId: 'landuse-tbody',
    countId: 'landuse-table-count',
    columnsBtnId: 'landuse-columns-btn',
    columnsMenuId: 'landuse-columns-menu',
    exportBtnId: 'landuse-export-btn',
    csvPrefix: 'land-use-summary',
    emptyText: 'Expand the Land Use panel to load parcels.',
    getRows: function (state) { return state.currentDataset === 'landuse' ? summarize(state.allFeatures) : []; },
    onSelectRow: selectRow
  });

  var cropNames = categoryNameSet(W.dashboard.taxonomy.CROPS_TREE);
  W.dashboard.cropsTable = W.dashboard.dataTable.create({
    columns: summaryColumns('Crop'),
    initialSortKey: 'area', initialSortDir: 'desc',
    theadId: 'crops-thead-row',
    tbodyId: 'crops-tbody',
    countId: 'crops-table-count',
    columnsBtnId: 'crops-columns-btn',
    columnsMenuId: 'crops-columns-menu',
    exportBtnId: 'crops-export-btn',
    csvPrefix: 'crops-summary',
    emptyText: 'Expand the Crops panel to load parcels.',
    getRows: function (state) {
      if (state.currentDataset !== 'crops') return [];
      return summarize(state.allFeatures.filter(function (f) { return cropNames[f.category]; }));
    },
    onSelectRow: selectRow
  });

  var treeNames = categoryNameSet(W.dashboard.taxonomy.TREES_TREE);
  W.dashboard.treesTable = W.dashboard.dataTable.create({
    columns: summaryColumns('Tree'),
    initialSortKey: 'area', initialSortDir: 'desc',
    theadId: 'trees-thead-row',
    tbodyId: 'trees-tbody',
    countId: 'trees-table-count',
    columnsBtnId: 'trees-columns-btn',
    columnsMenuId: 'trees-columns-menu',
    exportBtnId: 'trees-export-btn',
    csvPrefix: 'trees-summary',
    emptyText: 'Expand the Trees panel to load parcels.',
    getRows: function (state) {
      if (state.currentDataset !== 'crops') return [];
      return summarize(state.allFeatures.filter(function (f) { return treeNames[f.category]; }));
    },
    onSelectRow: selectRow
  });

})(window.Wafra);
