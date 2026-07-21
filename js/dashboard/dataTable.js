(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // Generic sortable / reorderable / column-customizable / CSV-exportable data
  // grid factory. Powers the Farms tab and the Land Use / Crops / Trees parcel
  // tabs in the bottom sheet — each is a separate instance bound to its own DOM
  // ids, column set, and row source (see js/dashboard/farmTable.js and
  // js/dashboard/categoryTables.js for the concrete instances).
  // ============================================================================

  var instances = [];

  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function csvCell(s) {
    s = String(s == null ? '' : s);
    if (/[",\r\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  // cfg: {
  //   columns: [{ key, label, align, visible, val(f), text(f), csv(f)?, title(f)? }, ...],
  //   theadId, tbodyId, countId, columnsBtnId, columnsMenuId, exportBtnId,
  //   csvPrefix, emptyText,
  //   getRows(state) -> array of feature records (each needs .fid; .rings for zoom-to-select),
  //   onSelectRow(state, record) -> void   (optional — e.g. zoom the map to the row's feature)
  // }
  function createTable(cfg) {
    var COLUMNS = cfg.columns;
    var rows = [];
    var sortKey = COLUMNS[0].key;
    var sortDir = 'asc';    // 'asc' | 'desc'
    var active = false;     // is this tab currently visible?
    var dragKey = null;
    var currentState = null;
    var selectedId = null;

    function visibleCols() { return COLUMNS.filter(function (c) { return c.visible; }); }
    function colByKey(k) { return COLUMNS.filter(function (c) { return c.key === k; })[0]; }
    function idxOf(k) { for (var i = 0; i < COLUMNS.length; i++) if (COLUMNS[i].key === k) return i; return -1; }

    function sortedRows() {
      var col = colByKey(sortKey);
      var arr = rows.slice();
      if (!col) return arr;
      var dir = sortDir === 'asc' ? 1 : -1;
      arr.sort(function (a, b) {
        var va = col.val(a), vb = col.val(b);
        if (typeof va === 'string' || typeof vb === 'string') {
          return String(va).localeCompare(String(vb)) * dir;
        }
        return (va < vb ? -1 : va > vb ? 1 : 0) * dir;
      });
      return arr;
    }

    function renderHead() {
      var row = document.getElementById(cfg.theadId);
      if (!row) return;
      row.innerHTML = visibleCols().map(function (col) {
        var sorted = col.key === sortKey;
        var ind = sorted ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more';
        return '<th class="farm-th font-label-caps text-gray-500' + (sorted ? ' sorted' : '') +
          '" data-key="' + col.key + '" draggable="true" style="text-align:' + col.align + '" title="Click to sort · drag to reorder">' +
          '<span>' + escHtml(col.label) + '</span> ' +
          '<span class="material-symbols-outlined sort-ind">' + ind + '</span>' +
          '</th>';
      }).join('');

      row.querySelectorAll('th.farm-th').forEach(function (th) {
        var key = th.dataset.key;
        th.addEventListener('click', function () { onSort(key); });
        th.addEventListener('dragstart', function (e) {
          dragKey = key; th.classList.add('dragging');
          if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', key); } catch (_) {} }
        });
        th.addEventListener('dragend', function () {
          th.classList.remove('dragging');
          row.querySelectorAll('th.farm-th').forEach(function (t) { t.classList.remove('drag-over'); });
        });
        th.addEventListener('dragover', function (e) { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'; th.classList.add('drag-over'); });
        th.addEventListener('dragleave', function () { th.classList.remove('drag-over'); });
        th.addEventListener('drop', function (e) { e.preventDefault(); th.classList.remove('drag-over'); moveColumn(dragKey, key); });
      });
    }

    function renderBody() {
      var tbody = document.getElementById(cfg.tbodyId);
      if (!tbody) return;
      var cols = visibleCols();
      var arr = sortedRows();
      var html = '';
      for (var i = 0; i < arr.length; i++) {
        var f = arr[i];
        var sel = (selectedId != null && String(f.fid) === String(selectedId)) ? ' selected' : '';
        html += '<tr class="farm-row' + sel + '" data-fid="' + escHtml(f.fid) + '">';
        for (var c = 0; c < cols.length; c++) {
          var col = cols[c];
          var title = col.title ? ' title="' + escHtml(col.title(f)) + '"' : '';
          html += '<td class="text-sm text-gray-700"' + title + ' style="text-align:' + col.align + '">' + escHtml(col.text(f)) + '</td>';
        }
        html += '</tr>';
      }
      tbody.innerHTML = html || '<tr><td class="p-3 text-sm text-gray-400">' + (cfg.emptyText || 'No data.') + '</td></tr>';
    }

    function render() { renderHead(); renderBody(); }

    function onSort(key) {
      if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortKey = key; sortDir = 'asc'; }
      render();
    }

    function moveColumn(fromKey, toKey) {
      if (!fromKey || fromKey === toKey) return;
      var col = COLUMNS.splice(idxOf(fromKey), 1)[0];
      COLUMNS.splice(idxOf(toKey), 0, col);
      render();
    }

    // ---- Column visibility picker ---------------------------------------------
    function buildColumnMenu() {
      var menu = document.getElementById(cfg.columnsMenuId);
      if (!menu) return;
      menu.innerHTML = COLUMNS.map(function (col) {
        return '<label class="farm-col-toggle">' +
          '<input type="checkbox" class="accent-brand-600" data-key="' + col.key + '" ' + (col.visible ? 'checked' : '') + '>' +
          '<span>' + escHtml(col.label) + '</span>' +
          '</label>';
      }).join('');
      menu.querySelectorAll('input[type=checkbox]').forEach(function (cb) {
        cb.addEventListener('change', function () {
          var col = colByKey(cb.dataset.key);
          if (!col) return;
          // Keep at least one column visible.
          if (!cb.checked && visibleCols().length === 1) { cb.checked = true; return; }
          col.visible = cb.checked;
          render();
        });
      });
    }

    // ---- CSV export ------------------------------------------------------------
    function exportCsv() {
      var cols = visibleCols();
      var arr = sortedRows();
      var lines = [cols.map(function (c) { return csvCell(c.label); }).join(',')];
      for (var i = 0; i < arr.length; i++) {
        var f = arr[i];
        lines.push(cols.map(function (c) { return csvCell(c.csv ? c.csv(f) : c.text(f)); }).join(','));
      }
      var blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = (cfg.csvPrefix || 'export') + '-' + new Date().toISOString().slice(0, 10) + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function setCount() {
      var el = document.getElementById(cfg.countId);
      if (el) el.textContent = rows.length.toLocaleString();
    }

    // Zoom the map to a row's feature and highlight it when the user clicks it.
    function selectRow(fid) {
      var feature = null;
      for (var i = 0; i < rows.length; i++) {
        if (String(rows[i].fid) === String(fid)) { feature = rows[i]; break; }
      }
      if (!feature) return;
      selectedId = fid;
      var tbody = document.getElementById(cfg.tbodyId);
      if (tbody) {
        tbody.querySelectorAll('tr.farm-row.selected').forEach(function (tr) { tr.classList.remove('selected'); });
        var row = tbody.querySelector('tr.farm-row[data-fid="' + (window.CSS && CSS.escape ? CSS.escape(String(fid)) : fid) + '"]');
        if (row) row.classList.add('selected');
      }
      if (currentState && cfg.onSelectRow) cfg.onSelectRow(currentState, feature);
    }

    // Wire the static controls once (row selection + Export CSV + Columns dropdown).
    function init() {
      buildColumnMenu();

      var tbody = document.getElementById(cfg.tbodyId);
      if (tbody) {
        tbody.addEventListener('click', function (e) {
          var tr = e.target.closest ? e.target.closest('tr.farm-row') : null;
          if (tr && tr.dataset.fid != null) selectRow(tr.dataset.fid);
        });
      }

      var exportBtn = document.getElementById(cfg.exportBtnId);
      if (exportBtn) exportBtn.addEventListener('click', exportCsv);

      var colBtn = document.getElementById(cfg.columnsBtnId);
      var menu = document.getElementById(cfg.columnsMenuId);
      if (colBtn && menu) {
        colBtn.addEventListener('click', function (e) { e.stopPropagation(); menu.classList.toggle('hidden'); });
        document.addEventListener('click', function (e) {
          if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== colBtn && !colBtn.contains(e.target)) {
            menu.classList.add('hidden');
          }
        });
      }
    }

    // Called by the bottom-panel tab controller when this tab is shown/hidden.
    function setActive(isActive) {
      active = isActive;
      if (active) render();
      else {
        var menu = document.getElementById(cfg.columnsMenuId);
        if (menu) menu.classList.add('hidden');
      }
    }

    // Refresh the row set from the current dataset (called after each map load).
    function rebuild(state) {
      currentState = state;
      rows = cfg.getRows(state) || [];
      // Drop the selection only if it no longer exists in the new row set —
      // e.g. the Farms table's rows are stable across category switches, so
      // its selection should survive them.
      if (selectedId != null && !rows.some(function (f) { return String(f.fid) === String(selectedId); })) {
        selectedId = null;
      }
      setCount();
      if (active) render();
    }

    var instance = { init: init, rebuild: rebuild, setActive: setActive };
    instances.push(instance);
    return instance;
  }

  // Refreshes every table instance created so far. Called once after each
  // map dataset load so all tabs (Farms + whichever category is loaded) stay
  // in sync without each call site needing to know the full instance list.
  function rebuildAll(state) {
    instances.forEach(function (t) { t.rebuild(state); });
  }

  W.dashboard.dataTable = { create: createTable, rebuildAll: rebuildAll };

})(window.Wafra);
