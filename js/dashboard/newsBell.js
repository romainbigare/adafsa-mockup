(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // ============================================================================
  // Activity feed bell — the "AI is watching" heartbeat (satellite scans, grade
  // upgrades, harvests). Ported from Proposal B, but placed top-right so it is
  // never trapped under the bottom sheet or in the dead pointer-events rail, and
  // it opens/closes on click, outside-click and Escape.
  //
  // The mock generator (js/mock/news.js) no longer repeats a template or stamps
  // identical timestamps, so a seeded backlog reads as a real, varied feed.
  // ============================================================================

  var seeded = false;

  function makeRow(item) {
    var div = document.createElement('div');
    div.className = 'news-item flex items-center gap-2 py-1';
    div.innerHTML =
      '<span class="material-symbols-outlined flex-shrink-0" style="font-size:14px;color:' + item.color + '">' + item.icon + '</span>' +
      '<span class="text-xs text-gray-700 flex-1">' + item.text + '</span>' +
      '<span class="font-data-sm text-gray-400 flex-shrink-0">' + item.time + '</span>';
    return div;
  }

  function init() {
    var bell = document.getElementById('news-bell');
    var pop = document.getElementById('news-popover');
    var feed = document.getElementById('news-feed');
    if (!bell || !pop || !feed || !W.mock || !W.mock.news) return;

    function addItem() {
      feed.insertBefore(makeRow(W.mock.news.generateNewsItem()), feed.firstChild);
      while (feed.children.length > 20) feed.removeChild(feed.lastChild);
    }

    if (!seeded) {
      for (var i = 0; i < 8; i++) addItem();     // stepped timestamps → newest on top
      setInterval(addItem, 6000);
      seeded = true;
    }

    bell.addEventListener('click', function (e) { e.stopPropagation(); pop.classList.toggle('hidden'); });
    document.addEventListener('click', function (e) {
      if (!pop.classList.contains('hidden') && !pop.contains(e.target) && e.target !== bell && !bell.contains(e.target)) {
        pop.classList.add('hidden');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !pop.classList.contains('hidden')) pop.classList.add('hidden');
    });
  }

  W.dashboard.newsBell = { init: init };

})(window.Wafra);
