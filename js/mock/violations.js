(function (W) {
  "use strict";

  W.mock = W.mock || {};

  var VIOLATION_TYPES = [
    { type: 'Agricultural Waste', icon: 'delete', color: '#e84a3b' },
    { type: 'Illegal Burning', icon: 'local_fire_department', color: '#ff6f00' },
    { type: 'Flood Irrigation', icon: 'water_drop', color: '#2196f3' },
    { type: 'Abandoned Farms', icon: 'bedroom_parent', color: '#795548' },
    { type: 'Illegal Usage of Land', icon: 'gavel', color: '#9c27b0' },
    { type: 'Tree Canopy Exceeds Boundaries', icon: 'park', color: '#4caf50' },
    { type: 'Fodder Cultivation Exceeds Limit', icon: 'grass', color: '#8bc34a' },
    { type: 'Uncovered Water Body', icon: 'pool', color: '#00bcd4' },
    { type: 'Cultivated Area < 25%', icon: 'percent', color: '#ff9800' },
    { type: 'Mixed Cropping', icon: 'category', color: '#607d8b' }
  ];

  // Generates the random violation records (data only — marker creation and
  // panel rendering live in js/dashboard/violationsPanel.js).
  function generateRecords(allFeatures) {
    var numViolations = 18;
    var used = new Set();
    var records = [];

    for (var i = 0; i < numViolations; i++) {
      var idx;
      do {
        idx = Math.floor(Math.random() * allFeatures.length);
      } while (used.has(idx) && used.size < allFeatures.length);
      used.add(idx);
      var f = allFeatures[idx];
      if (!f || !f.centroid) continue;

      var vt = VIOLATION_TYPES[i % VIOLATION_TYPES.length];
      var severity = ['Critical', 'Warning', 'Notice'][Math.floor(Math.random() * 3)];
      var daysAgo = Math.floor(Math.random() * 7);

      records.push({
        id: 'V-' + (9000 + i),
        type: vt.type,
        icon: vt.icon,
        color: vt.color,
        severity: severity,
        daysAgo: daysAgo,
        farmId: f.fid,
        centroid: f.centroid,
        farmType: f.type
      });
    }

    return records;
  }

  W.mock.violations = {
    VIOLATION_TYPES: VIOLATION_TYPES,
    generateRecords: generateRecords
  };

})(window.Wafra);
