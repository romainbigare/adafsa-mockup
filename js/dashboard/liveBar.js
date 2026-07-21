(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

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

  // Called once, after the first dataset finishes loading.
  function init(state) {
    // Last scan time
    var scanTime = new Date(Date.now() - Math.floor(Math.random() * 3600000));
    var scanEl = document.getElementById('last-scan');
    if (scanEl) scanEl.textContent = scanTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    // Farm count
    var fcEl = document.getElementById('live-farm-count');
    if (fcEl) fcEl.textContent = state.totalFarms;
    // Seed news feed
    for (var i = 0; i < 8; i++) addNewsItem();
    // Add new items periodically
    setInterval(addNewsItem, 6000);
    // Collapse/expand
    var bar = document.getElementById('live-bar');
    var header = document.getElementById('live-bar-header');
    var chevron = document.getElementById('live-bar-chevron');
    if (header) {
      header.addEventListener('click', function () {
        bar.classList.toggle('collapsed');
        chevron.textContent = bar.classList.contains('collapsed') ? 'expand_less' : 'expand_more';
      });
    }
  }

  W.dashboard.liveBar = { init: init, addNewsItem: addNewsItem };

})(window.Wafra);
