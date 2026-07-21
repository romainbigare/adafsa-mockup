(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // Land Use / Crops / Trees tabs — Wafra.dashboard.dataTable instances (see
  // dataTable.js), one row per parcel of that category. Unlike the Farms tab,
  // these are only populated while their matching dataset is loaded on the
  // map (landuse for Land Use; crops for Crops & Trees, split by taxonomy).
  // ============================================================================

  // Shared column set: parcels don't have the farm-only fabricated metrics
  // (Grade/Growth/Utilisation/Irrigation), just identity + area. Each table
  // gets its own array instance since columns are reordered in place.
  function parcelColumns() {
    return [
      { key: 'fid', label: 'ID', align: 'left', visible: true,
        val: function (f) { return f.fid; }, text: function (f) { return '#' + f.fid; } },
      { key: 'owner', label: 'Owner', align: 'left', visible: true,
        val: function (f) { return String(f.owner).toLowerCase(); }, text: function (f) { return f.owner; } },
      { key: 'category', label: 'Category', align: 'left', visible: true,
        val: function (f) { return String(f.category).toLowerCase(); }, text: function (f) { return f.category; } },
      { key: 'type', label: 'Type', align: 'left', visible: true,
        val: function (f) { return String(f.type).toLowerCase(); }, text: function (f) { return f.type; } },
      { key: 'area', label: 'Area (dun)', align: 'right', visible: true,
        val: function (f) { return f.area; }, text: function (f) { return f.area.toFixed(1); } }
    ];
  }

  function categoryNameSet(tree) {
    var names = {};
    tree.forEach(function (cat) { names[cat.name] = true; });
    return names;
  }

  function selectRow(state, feature) { W.dashboard.plotsLayer.selectFarm(state, feature); }

  W.dashboard.landUseTable = W.dashboard.dataTable.create({
    columns: parcelColumns(),
    theadId: 'landuse-thead-row',
    tbodyId: 'landuse-tbody',
    countId: 'landuse-table-count',
    columnsBtnId: 'landuse-columns-btn',
    columnsMenuId: 'landuse-columns-menu',
    exportBtnId: 'landuse-export-btn',
    csvPrefix: 'land-use',
    emptyText: 'Expand the Land Use panel to load parcels.',
    getRows: function (state) { return state.currentDataset === 'landuse' ? state.allFeatures : []; },
    onSelectRow: selectRow
  });

  var cropNames = categoryNameSet(W.dashboard.taxonomy.CROPS_TREE);
  W.dashboard.cropsTable = W.dashboard.dataTable.create({
    columns: parcelColumns(),
    theadId: 'crops-thead-row',
    tbodyId: 'crops-tbody',
    countId: 'crops-table-count',
    columnsBtnId: 'crops-columns-btn',
    columnsMenuId: 'crops-columns-menu',
    exportBtnId: 'crops-export-btn',
    csvPrefix: 'crops',
    emptyText: 'Expand the Crops panel to load parcels.',
    getRows: function (state) {
      if (state.currentDataset !== 'crops') return [];
      return state.allFeatures.filter(function (f) { return cropNames[f.category]; });
    },
    onSelectRow: selectRow
  });

  var treeNames = categoryNameSet(W.dashboard.taxonomy.TREES_TREE);
  W.dashboard.treesTable = W.dashboard.dataTable.create({
    columns: parcelColumns(),
    theadId: 'trees-thead-row',
    tbodyId: 'trees-tbody',
    countId: 'trees-table-count',
    columnsBtnId: 'trees-columns-btn',
    columnsMenuId: 'trees-columns-menu',
    exportBtnId: 'trees-export-btn',
    csvPrefix: 'trees',
    emptyText: 'Expand the Trees panel to load parcels.',
    getRows: function (state) {
      if (state.currentDataset !== 'crops') return [];
      return state.allFeatures.filter(function (f) { return treeNames[f.category]; });
    },
    onSelectRow: selectRow
  });

})(window.Wafra);
