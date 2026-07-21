(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // Tabs backed by a Wafra.dashboard.dataTable instance (each with its own
  // Columns/Export header controls, toggled via .lb-ctx-<name>). 'news' is
  // the only tab without one.
  var DATA_TABS = ['farms', 'landuse', 'crops', 'trees', 'ier', 'yield', 'water'];
  var TABLE_FOR_TAB = {
    farms: 'farmTable', landuse: 'landUseTable', crops: 'cropsTable', trees: 'treesTable',
    ier: 'ierTable', yield: 'yieldTable', water: 'waterTable'
  };
  var CATEGORY_TABS = ['landuse', 'crops', 'trees'];
  var MODULE_TABS = ['ier', 'yield', 'water'];

  var activeTab = 'farms';
  var boundState = null; // set in init(); used to reset ghosting on tab change

  function addNewsItem() {
    var feed = document.getElementById('news-feed');
    if (!feed) return;
    var item = W.mock.news.generateNewsItem();
    var div = document.createElement('div');
    div.className = 'news-item flex items-center gap-2 py-0.5';
    div.innerHTML =
      '<span class="material-symbols-outlined flex-shrink-0" style="font-size:14px;color:' + item.color + '">' + item.icon + '</span>' +
      '<span class="text-xs text-gray-700 flex-1 truncate">' + item.text + '</span>' +
      '<span class="font-data-sm text-gray-400 flex-shrink-0">' + item.time + '</span>';
    feed.insertBefore(div, feed.firstChild);
    // Keep max 20 items
    while (feed.children.length > 20) feed.removeChild(feed.lastChild);
  }

  // Reconcile the stacked left-hand panel column with the bottom sheet so the
  // panels are never hidden behind it. Three cases, in order of preference:
  //   1. The panels fit in the height above the sheet → leave the sheet full
  //      width; keep the column's overflow visible so the drop-shadows aren't
  //      clipped.
  //   2. They don't fit above the sheet → step the sheet aside (inset its left
  //      edge to the right of the column) so the column can use the full
  //      viewport height. Overflow stays visible (shadows intact).
  //   3. Even the full height isn't enough → keep the sheet inset and let the
  //      column scroll internally (shadows clip while scrolling — acceptable).
  function syncLeftColumn() {
    var col = document.getElementById('left-panels');
    var bar = document.getElementById('live-bar');
    if (!col || !bar) return;

    var colRect = col.getBoundingClientRect();
    var barRect = bar.getBoundingClientRect();
    var mainLeft = (bar.offsetParent || document.body).getBoundingClientRect().left;

    var roomAboveBar = barRect.top - colRect.top - 8;       // if the sheet stays full width
    var roomFullHeight = window.innerHeight - colRect.top - 16; // if the sheet steps aside
    var needed = col.scrollHeight;

    if (needed <= roomAboveBar) {
      bar.style.left = '';
      col.style.overflowY = 'visible';
      col.style.maxHeight = '';
    } else {
      // Inset the sheet just past the column (+ a little room for its shadow).
      bar.style.left = (colRect.right - mainLeft + 16) + 'px';
      if (needed <= roomFullHeight) {
        col.style.overflowY = 'visible';
        col.style.maxHeight = '';
      } else {
        col.style.overflowY = 'auto';
        col.style.maxHeight = roomFullHeight + 'px';
      }
    }
  }

  function getActiveTab() { return activeTab; }

  // Switch the bottom panel between its tabs (Farms / Land Use / Crops /
  // Trees / News), swapping the active tab, the visible body panel, each
  // data table's contextual header controls, and which table is "active"
  // (so it renders/re-renders only while actually visible).
  function setTab(name) {
    // Leaving a tab resets any row-selection ghosting on the map.
    if (name !== activeTab && boundState) W.dashboard.plotsLayer.clearGhost(boundState);
    activeTab = name;
    document.querySelectorAll('.lb-tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.lbTab === name);
    });
    document.querySelectorAll('.lb-panel').forEach(function (p) {
      p.classList.toggle('hidden', p.dataset.lbPanel !== name);
    });
    DATA_TABS.forEach(function (t) {
      document.querySelectorAll('.lb-ctx-' + t).forEach(function (e) { e.classList.toggle('hidden', name !== t); });
      var table = W.dashboard[TABLE_FOR_TAB[t]];
      if (table) table.setActive(name === t);
    });

    // Clicking a tab always reveals the panel if it was collapsed.
    var bar = document.getElementById('live-bar');
    if (bar && bar.classList.contains('collapsed')) {
      bar.classList.remove('collapsed');
      var chev = document.getElementById('live-bar-chevron');
      if (chev) chev.textContent = 'expand_more';
    }

    syncLeftColumn();
  }

  // ---- Resize handle: drag the strip above the tabs to grow/shrink the
  // shared body height (--lb-body-height), used by both the Farms table and
  // News feed panels.
  var MIN_BODY_HEIGHT = 140;

  function wireResize() {
    var handle = document.getElementById('live-bar-resize');
    var bar = document.getElementById('live-bar');
    if (!handle || !bar) return;

    var startY = 0;
    var startHeight = 0;

    function currentHeight() {
      var v = parseInt(getComputedStyle(bar).getPropertyValue('--lb-body-height'), 10);
      return isNaN(v) ? handle.nextElementSibling.getBoundingClientRect().height : v;
    }
    function maxHeight() { return Math.round(window.innerHeight * 0.7); }

    function onMove(e) {
      var delta = startY - e.clientY; // dragging up shrinks Y (negative) -> grows the panel
      var next = Math.max(MIN_BODY_HEIGHT, Math.min(maxHeight(), startHeight + delta));
      bar.style.setProperty('--lb-body-height', next + 'px');
      syncLeftColumn();
    }
    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.body.classList.remove('lb-resizing');
    }

    handle.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      startY = e.clientY;
      startHeight = currentHeight();
      document.body.classList.add('lb-resizing');
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
  }

  // Called once, after the first dataset finishes loading.
  function init(state) {
    boundState = state;
    // Seed news feed
    for (var i = 0; i < 8; i++) addNewsItem();
    // Add new items periodically
    setInterval(addNewsItem, 6000);

    // Tabs — Land Use / Crops / Trees also drive the map dataset + left
    // panel accordion (same as clicking that left panel header would).
    document.querySelectorAll('.lb-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var name = tab.dataset.lbTab;
        if (CATEGORY_TABS.indexOf(name) !== -1) W.dashboard.viewportStats.selectCategoryTab(state, name);
        else if (MODULE_TABS.indexOf(name) !== -1) W.dashboard.modulesPanel.selectModuleTab(state, name);
        else setTab(name);
      });
    });

    wireResize();

    // Collapse / expand (chevron only — tabs must stay clickable)
    var bar = document.getElementById('live-bar');
    var collapseBtn = document.getElementById('live-bar-collapse');
    var chevron = document.getElementById('live-bar-chevron');
    if (collapseBtn && bar) {
      collapseBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        bar.classList.toggle('collapsed');
        if (chevron) chevron.textContent = bar.classList.contains('collapsed') ? 'expand_less' : 'expand_more';
      });
      // The panel slides on a transform transition; re-sync once it settles.
      bar.addEventListener('transitionend', syncLeftColumn);
    }

    window.addEventListener('resize', syncLeftColumn);

    // Expanding/collapsing a left panel changes the column's height (a max-height
    // transition that bubbles up here), so re-reconcile once it settles.
    var leftCol = document.getElementById('left-panels');
    if (leftCol) leftCol.addEventListener('transitionend', syncLeftColumn);

    // Default to the Farms tab.
    setTab('farms');
    syncLeftColumn();
  }

  W.dashboard.liveBar = { init: init, addNewsItem: addNewsItem, setTab: setTab, getActiveTab: getActiveTab, syncLeftColumn: syncLeftColumn };

})(window.Wafra);
