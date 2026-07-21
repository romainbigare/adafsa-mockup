(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // Creates the violations overlay layer group (call once, after the map
  // exists).
  function init(state) {
    state.violationLayer = L.layerGroup().addTo(state.map);
    state.violationMarkers = [];
    state.violationVisibility = {};
  }

  function clear(state) {
    if (state.violationLayer) state.violationLayer.clearLayers();
    state.violationMarkers.length = 0;
    for (var k in state.violationVisibility) delete state.violationVisibility[k];
  }

  // Picks random features from state.allFeatures (via Wafra.mock.violations)
  // and renders pulsing markers + popups for each violation record.
  function generate(state) {
    var records = W.mock.violations.generateRecords(state.allFeatures);

    records.forEach(function (violation) {
      state.violationVisibility[violation.type] = true;

      var html =
        '<div class="violation-marker">' +
          '<div class="vm-ping" style="background:' + violation.color + '"></div>' +
          '<div class="vm-pulse" style="background:' + violation.color + '"></div>' +
          '<div class="vm-core" style="background:' + violation.color + '">' +
            '<span class="material-symbols-outlined">' + violation.icon + '</span>' +
          '</div>' +
        '</div>';
      var marker = L.marker(violation.centroid, {
        icon: L.divIcon({ html: html, className: '', iconSize: [28, 28], iconAnchor: [14, 14] })
      });
      var severityColor = violation.severity === 'Critical' ? '#dc2626' : violation.severity === 'Warning' ? '#d97706' : '#6b7280';
      marker.bindPopup(
        '<div style="font-family:Inter,sans-serif;min-width:180px">' +
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
            '<span style="width:8px;height:8px;border-radius:50%;background:' + violation.color + '"></span>' +
            '<b style="color:#111827">' + violation.type + '</b>' +
          '</div>' +
          '<span style="color:#6b7280;font-size:11px">ID: ' + violation.id + '</span><br>' +
          '<span style="color:#6b7280;font-size:11px">Farm: #' + violation.farmId + ' (' + violation.farmType + ')</span><br>' +
          '<span style="color:#6b7280;font-size:11px">Severity: <b style="color:' + severityColor + '">' + violation.severity + '</b></span><br>' +
          '<span style="color:#6b7280;font-size:11px">Detected: ' + violation.daysAgo + 'd ago</span>' +
        '</div>'
      );
      marker.violationType = violation.type;
      marker.violationData = violation;
      state.violationLayer.addLayer(marker);
      state.violationMarkers.push(marker);
    });

    buildPanel(state);
    updateCount(state);
  }

  function buildPanel(state) {
    var list = document.getElementById('violations-list');
    if (!list) return;
    list.innerHTML = '';
    W.mock.violations.VIOLATION_TYPES.forEach(function (vt) {
      var count = state.violationMarkers.filter(function (m) { return m.violationType === vt.type; }).length;
      if (count === 0) return;
      var row = document.createElement('div');
      row.className = 'flex items-center justify-between py-1 px-1 rounded hover:bg-gray-50 transition-colors';
      row.innerHTML =
        '<div class="flex items-center gap-2 min-w-0">' +
          '<span class="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style="background:' + vt.color + '20">' +
            '<span class="material-symbols-outlined" style="font-size:13px;color:' + vt.color + '">' + vt.icon + '</span>' +
          '</span>' +
          '<span class="text-xs text-gray-600 truncate">' + vt.type + '</span>' +
        '</div>' +
        '<div class="flex items-center gap-1.5 flex-shrink-0">' +
          '<span class="font-data-sm text-gray-500">' + count + '</span>' +
          '<input type="checkbox" checked class="cursor-pointer accent-red-500" data-vtype="' + vt.type + '">' +
        '</div>';
      list.appendChild(row);
    });

    // Wire toggles
    list.querySelectorAll('input[type=checkbox]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var vtype = cb.dataset.vtype;
        state.violationMarkers.forEach(function (m) {
          if (m.violationType === vtype) {
            if (cb.checked) state.violationLayer.addLayer(m);
            else state.violationLayer.removeLayer(m);
          }
        });
        updateCount(state);
      });
    });
  }

  function updateCount(state) {
    var count = state.violationLayer.getLayers().length;
    var el1 = document.getElementById('violation-count');
    var el2 = document.getElementById('live-violation-count');
    if (el1) el1.textContent = count;
    if (el2) el2.textContent = count;
  }

  W.dashboard.violationsPanel = {
    init: init,
    clear: clear,
    generate: generate,
    buildPanel: buildPanel,
    updateCount: updateCount
  };

})(window.Wafra);
