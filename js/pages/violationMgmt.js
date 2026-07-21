(function (W) {
  "use strict";

  var mock = W.mock.violationsData;
  var VIOLATION_TYPES = mock.VIOLATION_TYPES;
  var VIOLATIONS = mock.VIOLATIONS;
  var DETECTION_METHODS = mock.DETECTION_METHODS;

  // ---- Module state ----
  var state = {
    VIOLATIONS: VIOLATIONS,
    map: null,
    mapCtx: null,
    violationLayer: null,
    violationMarkers: []
  };

  // ---- Helpers ----
  var severityColor = function (s) { return s === 'Critical' ? '#dc2626' : s === 'Warning' ? '#d97706' : '#6b7280'; };
  var severityBg = function (s) { return s === 'Critical' ? 'bg-red-100 text-red-800' : s === 'Warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'; };
  var statusBg = function (s) { return s === 'Open' ? 'bg-red-100 text-red-800' : s === 'In Review' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'; };
  var confColor = function (c) { return c >= 0.9 ? '#16a34a' : c >= 0.75 ? '#d97706' : '#dc2626'; };
  var vtFor = function (type) { return VIOLATION_TYPES.find(function (v) { return v.type === type; }); };

  // ---- Build violation markers ----
  function buildMarkers() {
    state.VIOLATIONS.forEach(function (v) {
      var vt = vtFor(v.type);
      var html = '<div class="violation-marker">' +
        '<div class="vm-ping" style="background:' + vt.color + '"></div>' +
        '<div class="vm-pulse" style="background:' + vt.color + '"></div>' +
        '<div class="vm-core" style="background:' + vt.color + '">' +
        '<span class="material-symbols-outlined">' + vt.icon + '</span>' +
        '</div>' +
        '</div>';
      var marker = L.marker([v.lat, v.lng], {
        icon: L.divIcon({ html: html, className: '', iconSize: [28, 28], iconAnchor: [14, 14] })
      });
      marker.bindPopup('<div style="font-family:Inter,sans-serif;min-width:200px">' +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
        '<span style="width:8px;height:8px;border-radius:50%;background:' + vt.color + '"></span>' +
        '<b style="color:#111827">' + v.type + '</b>' +
        '</div>' +
        '<span style="color:#6b7280;font-size:11px">ID: ' + v.id + '</span><br>' +
        '<span style="color:#6b7280;font-size:11px">Farm: #' + v.farmId + '</span><br>' +
        '<span style="color:#6b7280;font-size:11px">Severity: <b style="color:' + severityColor(v.severity) + '">' + v.severity + '</b></span><br>' +
        '<span style="color:#6b7280;font-size:11px">Confidence: <b style="color:' + confColor(v.confidence) + '">' + Math.round(v.confidence * 100) + '%</b></span><br>' +
        '<span style="color:#6b7280;font-size:11px">Detected: ' + v.detected + '</span>' +
        '<div style="margin-top:6px"><button onclick="openDrawer(\'' + v.id + '\')" style="background:#16a34a;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:11px;cursor:pointer;font-family:Inter">Review details</button></div>' +
        '</div>');
      marker.violationId = v.id;
      state.violationLayer.addLayer(marker);
      state.violationMarkers.push(marker);
    });
  }

  // ---- Build table ----
  function buildTable() {
    var tbody = document.getElementById('violations-tbody');
    tbody.innerHTML = '';
    var filterType = document.getElementById('filter-type').value;
    var filterSev = document.getElementById('filter-severity').value;
    var filterStatus = document.getElementById('filter-status').value;
    var rows = state.VIOLATIONS.filter(function (v) {
      return (filterType === 'All Types' || v.type === filterType) &&
        (filterSev === 'All Severities' || v.severity === filterSev) &&
        (filterStatus === 'All Status' || v.status === filterStatus);
    });
    rows.forEach(function (v) {
      var vt = vtFor(v.type);
      var tr = document.createElement('tr');
      tr.className = 'vrow border-b border-gray-200 hover:bg-gray-50 cursor-pointer';
      tr.dataset.vid = v.id;
      tr.innerHTML =
        '<td class="p-3 font-data-sm text-gray-900">' + v.id + '</td>' +
        '<td class="p-3 text-sm text-gray-700">' +
        '<div class="flex items-center gap-2">' +
        '<span class="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style="background:' + vt.color + '20">' +
        '<span class="material-symbols-outlined" style="font-size:13px;color:' + vt.color + '">' + vt.icon + '</span>' +
        '</span>' +
        v.type +
        '</div>' +
        '</td>' +
        '<td class="p-3 font-data-sm text-gray-500">#' + v.farmId + '</td>' +
        '<td class="p-3"><span class="inline-flex px-2 py-0.5 rounded text-xs font-medium ' + severityBg(v.severity) + '">' + v.severity + '</span></td>' +
        '<td class="p-3">' +
        '<div class="flex items-center gap-2">' +
        '<div class="conf-bar" style="width:60px"><span style="width:' + Math.round(v.confidence * 100) + '%;background:' + confColor(v.confidence) + '"></span></div>' +
        '<span class="font-data-sm" style="color:' + confColor(v.confidence) + '">' + Math.round(v.confidence * 100) + '%</span>' +
        '</div>' +
        '</td>' +
        '<td class="p-3 font-data-sm text-gray-500">' + v.detected + '</td>' +
        '<td class="p-3"><span class="inline-flex px-2 py-0.5 rounded text-xs font-medium ' + statusBg(v.status) + '">' + v.status + '</span></td>' +
        '<td class="p-3"><button class="text-xs bg-brand-600 text-white px-2.5 py-1 rounded font-medium hover:bg-brand-700" onclick="openDrawer(\'' + v.id + '\')">' + (v.status === 'Resolved' ? 'View' : 'Review') + '</button></td>';
      tr.addEventListener('click', function (e) {
        if (e.target.tagName === 'BUTTON') return;
        openDrawer(v.id);
      });
      tbody.appendChild(tr);
    });
  }

  // ---- Populate filter dropdowns ----
  function populateFilters() {
    var typeSelect = document.getElementById('filter-type');
    VIOLATION_TYPES.forEach(function (vt) {
      var opt = document.createElement('option');
      opt.value = vt.type; opt.textContent = vt.type;
      typeSelect.appendChild(opt);
    });
  }

  // ---- Update summary cards ----
  function updateSummary() {
    document.getElementById('sum-critical').textContent = state.VIOLATIONS.filter(function (v) { return v.severity === 'Critical'; }).length;
    document.getElementById('sum-warning').textContent = state.VIOLATIONS.filter(function (v) { return v.severity === 'Warning'; }).length;
    document.getElementById('sum-notice').textContent = state.VIOLATIONS.filter(function (v) { return v.severity === 'Notice'; }).length;
  }

  // ---- Detail drawer ----
  function openDrawer(id) {
    var v = state.VIOLATIONS.find(function (x) { return x.id === id; });
    if (!v) return;
    var vt = vtFor(v.type);
    var dm = DETECTION_METHODS[v.type];
    var drawer = document.getElementById('detail-drawer');
    var content = document.getElementById('dd-content');
    document.getElementById('dd-icon').style.color = vt.color;
    document.getElementById('dd-icon').textContent = vt.icon;

    // Highlight table row
    document.querySelectorAll('tr.vrow').forEach(function (r) { r.classList.toggle('selected', r.dataset.vid === id); });

    // Pan map to violation
    state.map.setView([v.lat, v.lng], 15, { animate: true });
    var marker = state.violationMarkers.find(function (m) { return m.violationId === id; });
    if (marker) marker.openPopup();

    content.innerHTML =
      '<div>' +
      '<div class="flex items-center gap-2 mb-1">' +
      '<span class="px-2 py-0.5 rounded text-xs font-medium ' + severityBg(v.severity) + '">' + v.severity + '</span>' +
      '<span class="px-2 py-0.5 rounded text-xs font-medium ' + statusBg(v.status) + '">' + v.status + '</span>' +
      '<span class="font-data-sm text-gray-500">' + v.id + '</span>' +
      '</div>' +
      '<h2 class="text-lg font-semibold text-gray-900">' + v.type + '</h2>' +
      '<p class="text-sm text-gray-500 mt-0.5">Farm #' + v.farmId + ' · ' + v.area + ' dunums</p>' +
      '</div>' +

      '<!-- Confidence Score -->' +
      '<div class="glass-panel p-3">' +
      '<div class="flex items-center justify-between mb-2">' +
      '<span class="font-label-caps text-gray-500">AI CONFIDENCE</span>' +
      '<span class="font-data-lg" style="color:' + confColor(v.confidence) + '">' + Math.round(v.confidence * 100) + '%</span>' +
      '</div>' +
      '<div class="conf-bar mb-2"><span style="width:' + Math.round(v.confidence * 100) + '%;background:' + confColor(v.confidence) + '"></span></div>' +
      '<p class="text-xs text-gray-500">' + (v.confidence >= 0.9 ? 'High confidence — detection verified across multiple satellite passes.' : v.confidence >= 0.75 ? 'Medium confidence — field verification recommended.' : 'Lower confidence — manual inspection required.') + '</p>' +
      '</div>' +

      '<!-- Detection Method -->' +
      '<div>' +
      '<div class="flex items-center gap-2 mb-2">' +
      '<span class="material-symbols-outlined text-gray-500" style="font-size:16px;">satellite_alt</span>' +
      '<span class="font-label-caps text-gray-500">DETECTION METHOD</span>' +
      '</div>' +
      '<div class="glass-panel p-3 space-y-2 text-sm">' +
      '<div class="flex justify-between"><span class="text-gray-500">Satellite</span><span class="text-gray-900 text-right">' + dm.satellite + '</span></div>' +
      '<div class="flex justify-between"><span class="text-gray-500">Bands</span><span class="text-gray-900 text-right">' + dm.bands + '</span></div>' +
      '<div class="flex justify-between"><span class="text-gray-500">Indices</span><span class="text-gray-900 text-right">' + dm.indices + '</span></div>' +
      '<div class="flex justify-between"><span class="text-gray-500">AI Model</span><span class="text-gray-900 text-right">' + dm.model + '</span></div>' +
      '<div class="flex justify-between"><span class="text-gray-500">Pass date</span><span class="font-data-sm text-gray-900">' + v.passDate + '</span></div>' +
      '</div>' +
      '</div>' +

      '<!-- How it was detected -->' +
      '<div>' +
      '<div class="flex items-center gap-2 mb-2">' +
      '<span class="material-symbols-outlined text-gray-500" style="font-size:16px;">psychology</span>' +
      '<span class="font-label-caps text-gray-500">HOW IT WAS DETECTED</span>' +
      '</div>' +
      '<div class="glass-panel p-3">' +
      '<p class="text-sm text-gray-700 leading-relaxed">' + dm.explanation + '</p>' +
      '</div>' +
      '</div>' +

      '<!-- Location -->' +
      '<div>' +
      '<div class="flex items-center gap-2 mb-2">' +
      '<span class="material-symbols-outlined text-gray-500" style="font-size:16px;">location_on</span>' +
      '<span class="font-label-caps text-gray-500">LOCATION</span>' +
      '</div>' +
      '<div class="glass-panel p-3 font-data-sm text-gray-700">' +
      v.lat.toFixed(4) + '° N, ' + v.lng.toFixed(4) + '° E' +
      '</div>' +
      '</div>' +

      '<!-- Actions -->' +
      '<div class="flex gap-2 pt-2">' +
      (v.status !== 'Resolved' ?
        '<button class="flex-1 bg-brand-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-brand-700 transition-colors" onclick="resolveViolation(\'' + v.id + '\')">Mark Resolved</button>' +
        '<button class="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors" onclick="dismissViolation(\'' + v.id + '\')">Dismiss</button>'
        : '<p class="text-sm text-gray-500 italic w-full text-center py-2">This violation has been resolved.</p>') +
      '</div>';
    drawer.classList.remove('closed');
  }

  function closeDrawer() {
    document.getElementById('detail-drawer').classList.add('closed');
    document.querySelectorAll('tr.vrow').forEach(function (r) { r.classList.remove('selected'); });
  }

  function resolveViolation(id) {
    var v = state.VIOLATIONS.find(function (x) { return x.id === id; });
    if (v) { v.status = 'Resolved'; buildTable(); updateSummary(); openDrawer(id); }
  }

  function dismissViolation(id) {
    closeDrawer();
  }

  // ---- Init ----
  function init() {
    W.ui.renderSidebar({ active: 'violations' });
    W.ui.renderTicker();

    var mapCtx = W.map.create('map', { center: [23.85, 53.79], zoom: 11 });
    state.map = mapCtx.map;
    state.mapCtx = mapCtx;
    state.violationLayer = L.layerGroup().addTo(state.map);

    // ---- Map controls ----
    W.ui.wireZoom(state.map, { inId: 'zoom-in', outId: 'zoom-out' });

    document.getElementById('fit-all').onclick = function () {
      var group = L.featureGroup(state.violationMarkers);
      state.map.fitBounds(group.getBounds(), { padding: [60, 60] });
    };

    W.ui.wireBasemap(mapCtx, { btnId: 'toggle-basemap' });

    // ---- Table collapse ----
    var tableCollapsed = false;
    document.getElementById('table-header').addEventListener('click', function (e) {
      if (e.target.closest('select')) return;
      tableCollapsed = !tableCollapsed;
      var body = document.getElementById('table-body-wrap');
      var chev = document.getElementById('table-chevron');
      body.style.display = tableCollapsed ? 'none' : '';
      chev.textContent = tableCollapsed ? 'expand_less' : 'expand_more';
    });

    // ---- Toggle table visibility (mobile) ----
    document.getElementById('toggle-table').onclick = function () {
      var panel = document.getElementById('table-panel');
      panel.style.display = panel.style.display === 'none' ? '' : 'none';
    };

    // ---- Filters ----
    ['filter-type', 'filter-severity', 'filter-status'].forEach(function (id) {
      document.getElementById(id).addEventListener('change', buildTable);
    });

    // ---- Drawer close ----
    document.getElementById('close-drawer').onclick = closeDrawer;

    // ---- Build & populate ----
    buildMarkers();
    buildTable();
    populateFilters();
    updateSummary();

    // Fit to all violations
    var group = L.featureGroup(state.violationMarkers);
    state.map.fitBounds(group.getBounds(), { padding: [80, 80] });

    // Hide loader
    document.getElementById('map-loader').style.display = 'none';
  }

  // Expose the onclick handlers used by generated popup/table/drawer HTML — the
  // ONLY allowed non-Wafra globals on this page.
  window.openDrawer = openDrawer;
  window.resolveViolation = resolveViolation;
  window.dismissViolation = dismissViolation;

  document.addEventListener('DOMContentLoaded', init);

})(window.Wafra);
